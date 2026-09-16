/* ==========================================================================
 * Career Quest - game.js  (v2 - tampilan sesuai mockup referensi)
 *
 * Mesin permainan: eksplorasi Office Hub satu layar (tanpa gulir), dialog,
 * interaksi meja misi/NPC, tiga mode babak misi, sistem bintang, Gold,
 * slip gaji, shop kostumisasi, ensiklopedia, dan Tes Kompetensi Karier.
 *
 * Model pengembangan: MDLC Luther-Sutopo.
 * ==========================================================================
 */

import {
  TILE, VIEW_W, VIEW_H, PAL, CHAR_W, CHAR_H,
  drawTile, drawProp, drawChar, drawMarker, drawSparkle, drawStar, drawText, px, PROP_SOLID
} from './art.js';
import {
  PROFESSIONS, PROF_MAP, LEVELS, LEVEL_MAP, ECONOMY, PAYSLIPS, SHOP_ITEMS,
  DEFAULT_OWNED, DEFAULT_PROFILE, profileToChar, STAR_MIN_FOR_UNLOCK, SCENES, HELP_PAGES, MASTERY
} from './data.js';
import { MAPS, buildSolidGrid } from './maps.js';

/* --------------------------- KONSTANTA MESIN ---------------------------- */
const SPEED = 3.1;                  /* tile per detik */
const SAVE_KEY = 'career-quest-save-v1';

/* Tindakan pengecoh untuk mode simulasi langkah.                          */
const DECOYS = [
  'Abaikan keluhan pengguna dan lanjut bekerja',
  'Ganti seluruh perangkat dengan yang baru',
  'Tunda pekerjaan sampai minggu depan',
  'Kerjakan tanpa mencatat hasilnya',
  'Minta pengguna menyelesaikan masalahnya sendiri',
  'Lompati tahap pengujian agar cepat selesai'
];

/* ------------------------------ UTILITAS -------------------------------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function shuffle(arr, seed) {
  const a = arr.slice();
  let s = seed || Math.floor(Math.random() * 1e9);
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function starString(n) {
  return '★★★☆☆☆'.slice(3 - n, 6 - n);
}

export function formatRupiah(v) {
  return 'Rp ' + (v || 0).toLocaleString('id-ID');
}

export function formatGold(v) {
  return (v || 0).toLocaleString('id-ID');
}

/* ------------------------------- SIMPANAN ------------------------------- */
function freshState() {
  return {
    version: 2,
    profile: Object.assign({}, DEFAULT_PROFILE),
    coins: 0,                 /* Gold (nama tampilan) */
    salary: 0,
    stars: {},
    maxLevel: 1,
    promoted: {},
    paid: {},                 /* { level: true } slip gaji sudah diterima */
    owned: DEFAULT_OWNED.slice(),
    seenIntro: {},
    seenEnding: false,
    masteryScore: null,
    presentation: true,       /* Mode Presentasi: label "Scene 0X" tampil */
    seenSpecialization: false /* adegan Scene 10 sudah ditampilkan */
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const state = Object.assign(freshState(), data);
    state.owned = Array.from(new Set(DEFAULT_OWNED.concat(data.owned || [])));
    state.profile = Object.assign({}, DEFAULT_PROFILE, data.profile || {});
    return state;
  } catch (e) {
    return null;
  }
}

/* ================================ GAME ================================== */
export class Game {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;

    this.state = opts.state || loadState() || freshState();
    this.onMeta = opts.onMeta || (() => {});

    this.scene = 'title';
    this.time = 0;
    this.keys = Object.create(null);
    this.touch = Object.create(null);
    this.particles = [];
    this.cam = { x: 0, y: 0 };
    this.dialogue = null;
    this.questSession = null;
    this.paused = false;
    this.wantCapture = false;
    this.talkingTo = null;
    this.activeSceneLabel = SCENES.title;

    this.solidGrid = null;
    this.bindInput();

    this.player = { x: 0, y: 0, dir: 'up', moving: false, stepT: 0, step: 0 };
    this.setLevel(this.state.maxLevel, false);
  }

  /* ----------------------------- PEMAINAN ------------------------------ */
  get map() { return MAPS[this.currentMapKey]; }
  get level() { return LEVEL_MAP[this.state.currentLevel || this.state.maxLevel]; }

  setLevel(levelId, teleport = true) {
    const lvl = LEVEL_MAP[levelId] || LEVEL_MAP[1];
    this.state.currentLevel = lvl.id;
    this.currentMapKey = lvl.mapKey;
    this.map.tiles = this.map.tiles.slice();
    this.solidGrid = buildSolidGrid(this.map);
    if (teleport) {
      const sp = this.map.spawn;
      this.player.x = sp.x * TILE + TILE / 2;
      this.player.y = sp.y * TILE + TILE / 2 - 4;
      this.player.dir = sp.dir || 'up';
    }
    this.activeSceneLabel = this.map.scene || SCENES.hub;
  }

  /* ------------------------------ INPUT -------------------------------- */
  bindInput() {
    const setKey = (e, down) => {
      const k = e.key.toLowerCase();
      const map = {
        arrowup: 'up', w: 'up', arrowdown: 'down', s: 'down',
        arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right'
      };
      if (map[k]) {
        this.keys[map[k]] = down;
        if (down && this.scene === 'world') e.preventDefault();
        return;
      }
      if ([' ', 'enter', 'z', 'e'].includes(k)) {
        if (down) this.action();
        if (k === ' ') e.preventDefault();
      }
    };
    window.addEventListener('keydown', (e) => { if (this.wantCapture) setKey(e, true); });
    window.addEventListener('keyup', (e) => { if (this.wantCapture) setKey(e, false); });
    window.addEventListener('blur', () => { this.keys = Object.create(null); });
  }

  isDown(dir) { return !!(this.keys[dir] || this.touch[dir]); }

  /* ---------------------------- INTERAKSI ------------------------------ */
  action() {
    if (this.scene !== 'world' || this.paused) return;
    const target = this.nearestInteractable();
    if (target && target.kind === 'npc') { this.talkTo(target.npc); return; }
    if (target && target.kind === 'quest') { this.openQuest(target.quest); return; }
    if (this.isAtElevator()) { this.useElevator(); return; }
    /* berdiri di depan pintu keluar */
    const d = this.map.doorAt || { x: 14, y: 11 };
    if (Math.hypot(this.player.x - (d.x * TILE + TILE), this.player.y - (d.y * TILE - 8)) < 40) {
      this.toast('Pintu keluar TechCorp. Gunakan lift untuk berpindah lantai.');
    }
  }

  nearestInteractable() {
    const hx = this.player.x, hy = this.player.y + 6;
    let best = null, bestD = 1e9;
    (this.map.quests || []).forEach((q) => {
      const cx = q.x * TILE + TILE / 2, cy = q.y * TILE + TILE / 2;
      const d = Math.hypot(hx - cx, hy - cy);
      if (d < 40 && d < bestD) { bestD = d; best = { kind: 'quest', quest: q }; }
    });
    (this.map.npcs || []).forEach((n) => {
      const cx = n.x * TILE + TILE / 2, cy = n.y * TILE + TILE / 2;
      const d = Math.hypot(hx - cx, hy - cy);
      if (d < 38 && d < bestD) { bestD = d; best = { kind: 'npc', npc: n }; }
    });
    return best;
  }

  isAtElevator() {
    const e = this.map.elevatorStand;
    if (!e) return false;
    const cx = e.x * TILE + TILE / 2, cy = e.y * TILE + TILE;
    return Math.hypot(this.player.x - cx, this.player.y - cy) < 40;
  }

  useElevator() {
    if (this.onElevator) { this.onElevator(this.availableFloors()); return; }
    const cur = this.state.currentLevel;
    if (cur < this.state.maxLevel) { this.travelTo(cur + 1); return; }
    if (cur > 1) { this.travelTo(cur - 1); return; }
    this.toast('Lantai berikutnya belum terbuka. Selesaikan misi di lantai ini dulu ya!');
  }

  availableFloors() {
    const list = [];
    for (let i = 1; i <= this.state.maxLevel && i <= LEVELS.length; i++) list.push(LEVEL_MAP[i]);
    return list;
  }

  travelTo(levelId) {
    const lvl = LEVEL_MAP[levelId];
    if (!lvl) return;
    const from = this.state.currentLevel;
    this.setLevel(levelId, true);
    this.toast('Berpindah ke ' + lvl.name);
    if (levelId > from) this.afterEnterMap();
    else { this.onMeta(this); }
  }

  /* -------------------------- PROGRESI MISI ---------------------------- */
  starsOf(profId) { return this.state.stars[profId] || [0, 0, 0]; }

  isProfComplete(profId) { return this.starsOf(profId).every((s) => s > 0); }

  chapterStars(profId, idx) { return this.starsOf(profId)[idx] || 0; }

  isChapterUnlocked(profId, idx) {
    if (idx === 0) return true;
    return this.chapterStars(profId, idx - 1) > 0;
  }

  isProfMastered(profId) { return this.starsOf(profId).every((s) => s >= STAR_MIN_FOR_UNLOCK); }

  levelStats(levelId) {
    const lvl = LEVEL_MAP[levelId];
    const profs = lvl.professions.map((id) => PROF_MAP[id]);
    const total = profs.length * 3;
    let stars = 0, done = 0, mastered = 0;
    profs.forEach((p) => {
      const st = this.starsOf(p.id);
      stars += st.reduce((a, b) => a + b, 0);
      if (st.every((s) => s > 0)) done++;
      if (st.every((s) => s >= STAR_MIN_FOR_UNLOCK)) mastered++;
    });
    return { total, stars, done, mastered, profs, canAdvance: mastered === profs.length };
  }

  totalStars() {
    return PROFESSIONS.reduce((acc, p) => acc + this.starsOf(p.id).reduce((a, b) => a + b, 0), 0);
  }

  /* Skor akhir (ditampilkan pada Scene 12 / Finale). */
  totalScore() {
    return this.totalStars() * ECONOMY.scorePerStar + (this.state.masteryScore || 0) * ECONOMY.scorePerMastery;
  }

  /* Progresi jabatan: Junior Intern -> Junior Staff -> Senior Specialist. */
  rank() {
    if (this.state.masteryScore != null) return 'Career Explorer';
    if (this.state.promoted[2]) return 'Senior Specialist';
    if (this.state.promoted[1]) return 'Junior Staff';
    return 'Junior Intern';
  }

  rankOf(levelId) {
    return (PAYSLIPS[levelId] || PAYSLIPS[1]).jabatan;
  }

  /* --------------------------- EKONOMI & SHOP -------------------------- */
  payslip(levelId) {
    const p = PAYSLIPS[levelId] || PAYSLIPS[1];
    const total = p.gajiPokok + p.bonus;
    return {
      level: levelId, jabatan: p.jabatan, gajiPokok: p.gajiPokok, bonus: p.bonus,
      total, gold: Math.round(total / 1000)
    };
  }

  hasItem(id) { return this.state.owned.indexOf(id) >= 0; }

  buyItem(id) {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item || this.hasItem(id)) return { ok: false, reason: 'sudah' };
    if (this.state.coins < item.price) return { ok: false, reason: 'gold', kurang: item.price - this.state.coins };
    this.state.coins -= item.price;
    this.state.owned.push(id);
    this.save();
    return { ok: true, item };
  }

  equipItem(id) {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item || !this.hasItem(id)) return false;
    this.state.profile = Object.assign({}, this.state.profile, { [item.slot]: item.value });
    this.save();
    return true;
  }

  equippedId(slot) {
    const cur = this.state.profile[slot];
    const found = SHOP_ITEMS.find((i) => i.slot === slot && i.value === cur);
    return found ? found.id : null;
  }

  /* ----------------------------- SIMPANAN ------------------------------ */
  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch (e) { /* diabaikan */ }
    this.onMeta(this);
  }

  resetAll() {
    const presentation = this.state.presentation;
    this.state = freshState();
    this.state.presentation = presentation;
    this.setLevel(1, true);
    this.save();
    this.toast('Progres baru dimulai. Selamat bermain!');
  }

  /* ----------------------------- LOOP ---------------------------------- */
  start() {
    this.wantCapture = true;
    this.last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  afterEnterMap() {
    const key = this.mapKey();
    if (!this.state.seenIntro[key] && this.map.intro) {
      this.state.seenIntro[key] = true;
      this.save();
      this.openDialogue(this.map.intro, () => this.offerSpecialization(), { portrait: this.map.npcs[0] ? { kind: 'hrd' } : null });
      return;
    }
    this.offerSpecialization();
  }

  /* Scene 10: adegan pilihan spesialisasi saat pertama kali masuk Lantai 3. */
  offerSpecialization() {
    if (this.state.currentLevel !== 3 || this.state.seenSpecialization) return;
    if (typeof this.onSpecialization !== 'function') return;
    this.activeSceneLabel = SCENES.specialization;
    this.onSpecialization(PROFESSIONS.filter((p) => p.level === 3));
  }

  markSpecializationSeen() {
    this.state.seenSpecialization = true;
    this.activeSceneLabel = SCENES.hub;
    this.save();
  }

  mapKey() { return this.currentMapKey; }

  update(dt) {
    this.time += dt;
    this.updateParticles(dt);
    if (this.scene !== 'world' || this.paused) return;

    let dx = 0, dy = 0;
    if (this.isDown('left')) dx -= 1;
    if (this.isDown('right')) dx += 1;
    if (this.isDown('up')) dy -= 1;
    if (this.isDown('down')) dy += 1;
    if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }

    const moving = !!(dx || dy);
    this.player.moving = moving;
    if (moving) {
      if (Math.abs(dx) > Math.abs(dy)) this.player.dir = dx < 0 ? 'left' : 'right';
      else if (Math.abs(dy) > Math.abs(dx)) this.player.dir = dy < 0 ? 'up' : 'down';
      else if (dx && dy) this.player.dir = dy < 0 ? 'up' : 'down';
      const dist = SPEED * TILE * dt;
      this.tryMove(dx * dist, 0);
      this.tryMove(0, dy * dist);
      this.player.stepT += dt * 7;
      this.player.step = Math.floor(this.player.stepT) % 4;
    } else {
      this.player.stepT = 0;
      this.player.step = 0;
    }
  }

  tileSolidAt(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    const grid = this.solidGrid;
    if (!grid || ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return true;
    if (grid[ty][tx]) return true;
    if ((this.map.npcs || []).some((n) => n.x === tx && n.y === ty)) return true;
    return false;
  }

  blocked(x, y) {
    const hw = 7, hh = 6;          /* kotak tabrakan di kaki karakter */
    return this.tileSolidAt(x - hw, y - hh) || this.tileSolidAt(x + hw, y - hh) ||
           this.tileSolidAt(x - hw, y + hh) || this.tileSolidAt(x + hw, y + hh);
  }

  tryMove(dx, dy) {
    const nx = this.player.x + dx, ny = this.player.y + dy;
    if (dx !== 0) { if (!this.blocked(nx, this.player.y)) this.player.x = nx; }
    if (dy !== 0) { if (!this.blocked(this.player.x, ny)) this.player.y = ny; }
    this.player.x = clamp(this.player.x, TILE * 0.5, VIEW_W - TILE * 0.5);
    this.player.y = clamp(this.player.y, TILE * 0.6, VIEW_H - TILE * 0.4);
  }

  /* ---------------------------- PARTIKEL ------------------------------- */
  burst(x, y, color, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 70;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
        life: 0.7 + Math.random() * 0.5, max: 1, color
      });
    }
  }

  updateParticles(dt) {
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 150 * dt;
      return p.life > 0;
    });
  }

  /* ------------------------------ RENDER ------------------------------- */
  render() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    if (this.scene === 'title') { this.renderTitle(); return; }
    this.renderWorld();
  }

  renderWorld() {
    const ctx = this.ctx;
    const map = this.map;
    const rows = map.tiles;
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    /* lantai & dinding */
    for (let ty = 0; ty < rows.length; ty++) {
      for (let tx = 0; tx < rows[0].length; tx++) {
        drawTile(ctx, rows[ty][tx], tx * TILE, ty * TILE);
      }
    }

    /* daftar objek, diurutkan berdasarkan sumbu Y (semakin bawah semakin akhir) */
    const list = [];
    (map.props || []).forEach((p, idx) => {
      /* ukuran footprint sebenarnya dipakai untuk mengurutkan tinggi gambar */
      const size = PROP_SOLID[p.k] || { w: 1, h: 1 };
      list.push({
        y: (p.y + (size.h || 1)) * TILE, order: p.y * 1000 + p.x + idx * 0.001,
        fn: () => drawProp(ctx, p.k, p.x * TILE, p.y * TILE, this.time)
      });
    });

    (map.npcs || []).forEach((n) => {
      const prof = n.prof ? PROF_MAP[n.prof] : null;
      const cfg = prof ? prof.char : HRD_CHAR_LOCAL;
      list.push({
        y: n.y * TILE + TILE,
        order: n.y * 1000 + n.x,
        fn: () => drawChar(ctx, cfg, n.x * TILE + (TILE - CHAR_W) / 2, n.y * TILE + TILE - CHAR_H - 4, {
          dir: n.dir, moving: this.talkingTo === n.id, step: Math.floor(this.time * 6) % 4
        })
      });
    });

    const pcfg = profileToChar(this.state.profile);
    list.push({
      y: this.player.y + 10,
      order: this.player.y,
      fn: () => drawChar(ctx, pcfg, Math.round(this.player.x) - CHAR_W / 2, Math.round(this.player.y) - CHAR_H + 6, {
        dir: this.player.dir, moving: this.player.moving, step: this.player.step
      })
    });

    list.sort((a, b) => (a.y - b.y) || (a.order - b.order)).forEach((o) => o.fn());

    /* penanda misi "!" di atas meja kerja */
    (map.quests || []).forEach((q) => {
      const mastered = this.isProfMastered(q.prof);
      if (!mastered) drawMarker(ctx, q.mx * TILE + TILE / 2, q.my * TILE + 4, this.time + q.x);
      else {
        drawSparkle(ctx, q.mx * TILE + TILE / 2, q.my * TILE - 4, this.time + q.x, PAL.gold);
        drawStar(ctx, q.mx * TILE + TILE / 2 - 8, q.my * TILE - 22, 16, true, this.time);
      }
    });

    /* label zona / papan nama divisi */
    (map.labels || []).forEach((l) => {
      drawText(ctx, l.t, l.x * TILE + TILE / 2, l.y * TILE, {
        size: l.size || 9, color: l.color || PAL.white, align: 'center',
        outlineColor: PAL.navy2, outlineWidth: 3
      });
    });

    /* partikel */
    this.particles.forEach((p) => {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
      ctx.globalAlpha = 1;
    });

    /* sorot lift bila lantai berikutnya sudah terbuka */
    const e = map.elevatorStand;
    if (e && this.state.maxLevel > this.state.currentLevel) {
      ctx.strokeStyle = 'rgba(242,193,78,0.9)';
      ctx.lineWidth = 2;
      ctx.strokeRect(e.x * TILE + 4, e.y * TILE + 8, TILE - 8, TILE - 8);
    }
  }

  /* Layar judul: gedung kaca + logo + karakter berjalan. */
  renderTitle() {
    const ctx = this.ctx;
    const t = this.time;
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, PAL.sky3);
    g.addColorStop(0.55, PAL.sky);
    g.addColorStop(1, PAL.sky2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    /* awan */
    for (let i = 0; i < 4; i++) {
      const cx = ((t * 8 + i * 190) % (VIEW_W + 160)) - 80;
      const cy = 30 + i * 26;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 34, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 26, cy + 4, 22, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 24, cy + 5, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* gedung kaca tinggi (fasad TechCorp) */
    const groundY = VIEW_H - 54;
    ctx.fillStyle = PAL.gray2;
    ctx.fillRect(70, groundY - 220, 500, 220);
    ctx.fillStyle = PAL.glass2;
    ctx.fillRect(78, groundY - 212, 484, 212);
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 12; c++) {
        const wx = 88 + c * 40, wy = groundY - 204 + r * 21;
        const lit = (r * 5 + c * 3) % 7;
        ctx.fillStyle = lit === 0 ? PAL.gold : (lit < 3 ? PAL.glass3 : PAL.glass);
        ctx.fillRect(wx, wy, 32, 16);
      }
    }
    /* pintu masuk gedung */
    ctx.fillStyle = PAL.navy3;
    ctx.fillRect(280, groundY - 74, 90, 74);
    ctx.fillStyle = PAL.glass3;
    ctx.fillRect(288, groundY - 66, 34, 66);
    ctx.fillRect(328, groundY - 66, 34, 66);
    ctx.fillStyle = PAL.off;
    ctx.fillRect(270, groundY - 80, 110, 10);

    /* papan nama perusahaan di atas pintu masuk */
    ctx.fillStyle = PAL.navy3;
    ctx.fillRect(268, groundY - 108, 114, 22);
    drawText(ctx, 'TECHCORP', VIEW_W / 2, groundY - 96, {
      size: 11, color: PAL.gold3, align: 'center', outlineColor: PAL.navy3, outlineWidth: 3
    });

    /* jalan, marka, dan trotoar */
    ctx.fillStyle = PAL.gray2;
    ctx.fillRect(0, groundY + 26, VIEW_W, 28);
    ctx.fillStyle = PAL.white;
    for (let i = 0; i < 10; i++) ctx.fillRect(14 + i * 66, groundY + 38, 34, 4);
    ctx.fillStyle = PAL.floor2;
    ctx.fillRect(0, groundY, VIEW_W, 26);
    ctx.fillStyle = PAL.floorLine;
    ctx.fillRect(0, groundY, VIEW_W, 4);
    ctx.fillStyle = PAL.green2;
    ctx.fillRect(0, groundY + 58, VIEW_W, 8);
    /* tiang lampu */
    for (let i = 0; i < 3; i++) {
      const lx = 96 + i * 220;
      px(ctx, lx, groundY - 34, 4, 34, PAL.iron2);
      px(ctx, lx - 6, groundY - 40, 16, 6, PAL.gold3);
    }
    for (let i = 0; i < 6; i++) {
      const bx = 30 + i * 110;
      px(ctx, bx, groundY - 30, 6, 30, PAL.wood3);
      px(ctx, bx - 12, groundY - 44, 30, 16, PAL.green);
      px(ctx, bx - 6, groundY - 52, 18, 12, '#7dc064');
    }

    /* karakter pemain berjalan di depan gedung */
    const pcfg = profileToChar(this.state.profile);
    const walkX = 40 + ((t * 26) % (VIEW_W - 60));
    drawChar(ctx, pcfg, Math.round(walkX), groundY - 4, { dir: 'right', moving: true, step: Math.floor(t * 7) % 4 });
  }

  /* ------------------------ DIALOG & PESAN ----------------------------- */
  openDialogue(pages, onEnd, opts = {}) {
    this.dialogue = { pages: pages.slice(), i: 0, onEnd, opts };
    this.scene = 'dialogue';
    this.wantCapture = true;
    this.onMeta(this);
  }

  advanceDialogue() {
    if (!this.dialogue) return;
    this.dialogue.i++;
    if (this.dialogue.i >= this.dialogue.pages.length) {
      const cb = this.dialogue.onEnd;
      this.dialogue = null;
      this.scene = 'world';
      if (cb) cb();
    }
    this.onMeta(this);
  }

  /* Membuka daftar babak misi dari sebuah meja kerja (dipilih di UI). */
  openQuest(quest) {
    const prof = PROF_MAP[quest.prof];
    const options = prof.chapters.map((c, i) => ({
      idx: i,
      title: c.title,
      mode: c.mode,
      stars: this.starsOf(prof.id)[i] || 0,
      unlocked: this.isChapterUnlocked(prof.id, i)
    }));
    if (this.onQuestOpen) this.onQuestOpen(prof, options);
  }

  /* Berbicara dengan NPC: mentor profesi atau resepsionis/HRD. */
  talkTo(npc) {
    this.talkingTo = npc.id;
    const done = () => { this.talkingTo = null; };
    if (!npc.prof) {
      const lines = [
        { who: npc.name, text: 'Selamat bekerja! Pilih meja kerja yang ada penanda "!" lalu tekan tombol A.', portrait: HRD_CHAR_LOCAL },
        { who: npc.name, text: 'Setiap divisi punya tiga babak misi. Kumpulkan minimal Bintang 2 di semua divisi satu lantai untuk naik jabatan.', portrait: HRD_CHAR_LOCAL },
        { who: npc.name, text: 'Setelah naik jabatan, kamu menerima Slip Gaji dan bisa berbelanja di Shop Kostumisasi (menu Jeda).', portrait: HRD_CHAR_LOCAL }
      ];
      this.openDialogue(lines, done, { portrait: HRD_CHAR_LOCAL });
      return;
    }
    const prof = PROF_MAP[npc.prof];
    const mastered = this.isProfMastered(prof.id);
    const lines = prof.greet.map((t) => ({ who: prof.npcName, text: t, portrait: prof.char }));
    if (mastered) {
      lines.push({
        who: prof.npcName,
        text: 'Divisi ini sudah kamu tuntaskan. Kamu boleh mengulang misi untuk mengejar bintang tiga.',
        portrait: prof.char
      });
    }
    this.openDialogue(lines, () => { done(); this.openQuest({ prof: prof.id }); }, { portrait: prof.char });
  }

  /* Dipanggil lapisan UI saat babak misi dimulai. */
  beginChapter(profId, idx) {
    const prof = PROF_MAP[profId];
    const chapter = prof.chapters[idx];
    const items = this.buildChapterItems(chapter);
    this.questSession = {
      profId, idx, chapter, items,
      step: 0, errors: 0, done: false, mode: chapter.mode
    };
    this.scene = 'quest';
    this.activeSceneLabel = SCENES.mission;
    return this.questSession;
  }

  buildChapterItems(chapter) {
    if (chapter.mode === 'quiz') {
      return chapter.quiz.map((q) => ({
        type: 'quiz', q: q.q,
        options: shuffle(q.a.map((label, i) => ({ label, correct: i === q.c }))),
        why: q.why
      }));
    }
    const seeds = shuffle(DECOYS, 7).slice(0, 2);
    const base = chapter.mode === 'order' ? chapter.order : chapter.steps.map((s) => s.t);
    const items = base.map((text, i) => ({ text, order: i, decoy: false }))
      .concat(chapter.mode === 'check' ? seeds.map((text) => ({ text, order: -1, decoy: true })) : []);
    return shuffle(items, profSeed(chapter.title));
  }

  /* Menyelesaikan babak misi. */
  finishChapter(errors) {
    const s = this.questSession;
    if (!s) return null;
    const stars = errors === 0 ? 3 : errors === 1 ? 2 : errors === 2 ? 1 : 0;
    const prof = PROF_MAP[s.profId];
    const best = Math.max(stars, this.starsOf(prof.id)[s.idx] || 0);
    if (stars > 0) {
      const arr = this.starsOf(prof.id).slice();
      arr[s.idx] = best;
      this.state.stars[prof.id] = arr;
    }
    let reward = 0;
    if (stars > 0) {
      reward = ECONOMY.baseGold[s.idx] + stars * ECONOMY.goldPerStar;
      this.state.coins += reward;
    }
    this.save();

    const profDone = this.isProfComplete(prof.id);
    const mastered = this.isProfMastered(prof.id);
    const lvlStats = this.levelStats(this.state.currentLevel);
    const levelAdvanced = lvlStats.canAdvance && !this.state.promoted[this.state.currentLevel] && this.state.currentLevel < LEVELS.length;

    if (stars > 0) {
      this.burst(this.player.x, this.player.y - 20, stars === 3 ? PAL.gold : PAL.sky2, stars === 3 ? 26 : 12);
    }

    const result = {
      prof, chapter: s.chapter, idx: s.idx, stars, bestStars: best, errors, reward,
      profDone, mastered, levelAdvanced
    };
    this.questSession = null;
    this.scene = 'world';
    this.activeSceneLabel = SCENES.missionDone;
    return result;
  }

  /* Promosi: menandai lantai sudah dipromosikan dan menambah gaji. */
  promote(levelId) {
    const lvl = LEVEL_MAP[levelId];
    if (!lvl || this.state.promoted[levelId]) return null;
    this.state.promoted[levelId] = true;
    if (levelId + 1 <= LEVELS.length) this.state.maxLevel = Math.max(this.state.maxLevel, levelId + 1);
    this.save();
    return lvl;
  }

  /* Lantai yang sudah dipromosikan tetapi slip gajinya belum diterima. */
  unpaidPromotedLevels() {
    return LEVELS.map((l) => l.id).filter((id) => this.state.promoted[id] && !this.state.paid[id]);
  }

  /* Menerima slip gaji: menambah gaji kumulatif + Gold. */
  acceptSalary(levelId) {
    if (this.state.paid[levelId]) return null;
    const slip = this.payslip(levelId);
    this.state.paid[levelId] = true;
    this.state.salary += slip.total;
    this.state.coins += slip.gold;
    this.save();
    return slip;
  }

  /* ------------------------- TES KOMPETENSI ---------------------------- */
  buildMasteryQuiz() {
    const pool = [];
    PROFESSIONS.forEach((p) => {
      p.chapters.filter((c) => c.mode === 'quiz').forEach((c) => {
        c.quiz.forEach((q) => pool.push({ prof: p.name, q }));
      });
    });
    const picked = shuffle(pool, 2025).slice(0, 10);
    return picked.map((item) => ({
      type: 'quiz', prof: item.prof, q: item.q.q,
      options: shuffle(item.q.a.map((label, i) => ({ label, correct: i === item.q.c }))),
      why: item.q.why
    }));
  }

  finishMastery(correct, total) {
    const score = Math.round((correct / total) * 100);
    this.state.masteryScore = Math.max(this.state.masteryScore || 0, score);
    if (score >= 80) this.state.coins += ECONOMY.masteryGold;
    this.save();
    return score;
  }

  /* ------------------------- TOAST & UI HOOKS -------------------------- */
  toast(msg) { if (this.onToast) this.onToast(msg); }

  togglePause(force) {
    if (this.scene === 'title') return;
    this.paused = typeof force === 'boolean' ? force : !this.paused;
    this.onMeta(this);
  }

  setPresentation(on) {
    this.state.presentation = !!on;
    this.save();
  }

  sceneLabel() {
    if (!this.state.presentation) return '';
    if (this.scene === 'title') return SCENES.title;
    return this.activeSceneLabel || SCENES.hub;
  }

  /* ------------------------------ START -------------------------------- */
  startNewGame(profile) {
    this.state = freshState();
    this.state.profile = Object.assign({}, DEFAULT_PROFILE, profile || {});
    this.state.presentation = true;
    this.setLevel(1, true);
    this.save();
    this.scene = 'world';
    this.paused = false;
    this.openDialogue([
      { who: 'Narator', text: 'TechCorp - perusahaan teknologi tempat kamu menjalani program magang. Namamu tercatat sebagai Junior Intern.' },
      { who: 'Narator', text: 'Selama magang, kamu akan mencoba pekerjaan di sepuluh divisi untuk menemukan karier yang paling cocok denganmu.' },
      { who: 'Anda', text: 'Aku siap! Hari pertama kerja, ayo mulai dari lantai satu.' }
    ], () => { this.afterEnterMap(); }, { portrait: { kind: 'logo' } });
  }

  continueGame() {
    this.scene = 'world';
    this.paused = false;
    this.setLevel(this.state.maxLevel, true);
    if (this.map.intro && !this.state.seenIntro[this.mapKey()]) {
      this.state.seenIntro[this.mapKey()] = true;
      this.save();
      this.openDialogue(this.map.intro, null, { portrait: { kind: 'hrd' } });
    }
  }
}

/* Seed deterministik agar urutan item tetap konsisten per babak. */
function profSeed(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) & 0xfffffff;
  return h || 1;
}

/* Karakter HRD (resepsionis) - didefinisikan lokal agar mesin tidak
   bergantung pada data.js untuk satu sprite saja. */
const HRD_CHAR_LOCAL = {
  skin: PAL.skin, hair: PAL.hairR, hairStyle: 'long', shirt: PAL.carpetR,
  shirtDark: PAL.carpetR2, jacket: 'blazer', pants: PAL.ink2, pants2: PAL.ink,
  shoes: 'formal', accessory: null
};

/* Ikon profesi sebagai elemen canvas kecil (dipakai UI). */
export function iconCanvas(kind, scale = 2) {
  const c = document.createElement('canvas');
  c.width = 24; c.height = 24;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  drawIconLocal(g, kind);
  c.style.width = 24 * scale + 'px';
  c.style.height = 24 * scale + 'px';
  c.style.imageRendering = 'pixelated';
  return c;
}

import { drawIcon as drawIconLocal } from './art.js';

export { PROFESSIONS, PROF_MAP, LEVELS, LEVEL_MAP, ECONOMY, PAYSLIPS, SHOP_ITEMS, SCENES, STAR_MIN_FOR_UNLOCK, HELP_PAGES, DEFAULT_OWNED, MASTERY };
