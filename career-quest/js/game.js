/* ==========================================================================
 * Career Quest - game.js
 * Mesin permainan: eksplorasi kantor (top-down), sistem dialog, interaksi
 * NPC/meja misi, mesin babak misi (simulasi langkah, kuis, urutan alur),
 * sistem bintang, gaji & promosi, ensiklopedia karier, dan Tes Kompetensi.
 *
 * Model pengembangan : MDLC Luther-Sutopo (Concept - Design - Material
 *                      Collecting - Assembly - Testing - Distribution).
 * ==========================================================================
 */

import {
  TILE, PAL, drawTile, drawProp, drawChar, drawIcon, drawMarker,
  drawSparkle, drawLogoMark
} from './art.js';
import {
  PROFESSIONS, PROF_MAP, LEVELS, LEVEL_MAP, ECONOMY, MASTERY,
  profileToChar, DEFAULT_PROFILE, HELP_PAGES, STAR_MIN_FOR_UNLOCK,
  GENDERS, SKIN_TONES, SHIRT_COLORS, PANTS_COLORS, HRD_CHAR
} from './data.js';
import { MAPS, SOLID, PROP_TILE } from './maps.js';

/* --------------------------- KONSTANTA MESIN ---------------------------- */
const VIEW_W = 576;                 /* 24 tile x 24 px */
const VIEW_H = 336;                 /* 14 tile x 24 px */
const SPEED = 3.3;                  /* tile per detik */
const SAVE_KEY = 'career-quest-save-v1';

/* Langkah pengecoh generik untuk mode simulasi langkah (mode "check").      */
const DECOYS = [
  'Abaikan keluhan pengguna dan lanjut bekerja',
  'Ganti seluruh perangkat dengan yang baru',
  'Tunda pekerjaan sampai minggu depan',
  'Kerjakan tanpa mencatat hasilnya',
  'Minta pengguna menyelesaikan masalahnya sendiri',
  'Lompati tahap pengujian agar cepat selesai'
];

/* ------------------------------ UTILITAS -------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
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
  return 'Rp ' + v.toLocaleString('id-ID');
}

/* ------------------------------- SIMPANAN ------------------------------- */
function freshState() {
  return {
    version: 1,
    profile: Object.assign({}, DEFAULT_PROFILE),
    coins: 0,
    salary: 0,
    stars: {},            /* { profId: [b1, b2, b3] } */
    maxLevel: 1,
    promoted: {},         /* { level: true } */
    seenIntro: {},        /* { mapKey: true } */
    seenEnding: false,
    masteryScore: null,
    encyclopediaSeen: {}
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Object.assign(freshState(), data);
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

    /* runtime */
    this.scene = 'title';           /* title | world | quest */
    this.time = 0;
    this.keys = Object.create(null);
    this.touch = Object.create(null);
    this.particles = [];
    this.cam = { x: 0, y: 0 };
    this.dialogue = null;
    this.questSession = null;
    this.paused = false;
    this.masteryDone = !!this.state.masteryScore;

    this.bindInput();

    /* pemain */
    this.player = {
      x: 0, y: 0, dir: 'up', moving: false, stepT: 0, step: 0
    };

    this.setLevel(this.state.maxLevel, false);
    this.wantCapture = false;
  }

  /* ----------------------------- PEMAINAN ------------------------------ */
  get map() { return MAPS[this.currentMapKey]; }
  get level() { return LEVEL_MAP[this.state.currentLevel || this.state.maxLevel]; }

  setLevel(levelId, teleport = true) {
    const lvl = LEVEL_MAP[levelId] || LEVEL_MAP[1];
    this.state.currentLevel = lvl.id;
    this.currentMapKey = lvl.mapKey;
    if (teleport) {
      const sp = this.map.spawn;
      this.player.x = sp.x * TILE + TILE / 2;
      this.player.y = sp.y * TILE + TILE / 2;
      this.player.dir = sp.dir || 'up';
    }
    this.updateCamera(true);
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

    /* kontrol sentuh (dipasang oleh lapisan UI) */
    document.addEventListener('pointerdown', (e) => {
      const dir = e.target && e.target.dataset ? e.target.dataset.dir : null;
      if (dir) { this.touch[dir] = true; e.preventDefault(); }
      if (e.target && e.target.dataset && e.target.dataset.act === 'a') this.action();
    }, { passive: false });
    const clearTouch = (e) => {
      const dir = e.target && e.target.dataset ? e.target.dataset.dir : null;
      if (dir) this.touch[dir] = false;
    };
    document.addEventListener('pointerup', clearTouch);
    document.addEventListener('pointercancel', clearTouch);
    document.addEventListener('pointerleave', clearTouch);
  }

  isDown(dir) { return !!(this.keys[dir] || this.touch[dir]); }

  /* ---------------------------- INTERAKSI ------------------------------ */
  action() {
    if (this.scene === 'dialogue') return;         /* dialog ditangani UI */
    if (this.scene !== 'world' || this.paused) return;
    const target = this.nearestInteractable();
    if (target) {
      if (target.kind === 'npc') this.talkTo(target.npc);
      else if (target.kind === 'quest') this.openQuest(target.quest);
      return;
    }
    /* berdiri di depan lift dan lantai berikutnya sudah terbuka */
    if (this.isAtElevator()) this.useElevator();
  }

  nearestInteractable() {
    const px = this.player.x, py = this.player.y + 6;
    let best = null, bestD = 1e9;
    (this.map.quests || []).forEach((q) => {
      const cx = q.x * TILE + TILE, cy = q.y * TILE + 16;
      const d = Math.hypot(px - cx, py - cy);
      if (d < 52 && d < bestD) { bestD = d; best = { kind: 'quest', quest: q }; }
    });
    (this.map.npcs || []).forEach((n) => {
      const cx = n.x * TILE + TILE / 2, cy = n.y * TILE + TILE / 2;
      const d = Math.hypot(px - cx, py - cy);
      if (d < 46 && d < bestD) { bestD = d; best = { kind: 'npc', npc: n }; }
    });
    return best;
  }

  isAtElevator() {
    const e = this.map.elevatorStand;
    if (!e) return false;
    const cx = e.x * TILE + TILE / 2, cy = e.y * TILE + TILE / 2;
    return Math.hypot(this.player.x - cx, this.player.y - cy) < 34;
  }

  useElevator() {
    if (this.onElevator) { this.onElevator(this.availableFloors()); return; }
    const cur = this.state.currentLevel;
    if (cur < this.state.maxLevel) { this.travelTo(cur + 1); return; }
    if (cur > 1) { this.travelTo(cur - 1); return; }
    this.toast('Lantai berikutnya belum terbuka. Selesaikan misi di lantai ini dulu ya!');
  }

  /* Daftar lantai yang dapat dikunjungi lewat lift. */
  availableFloors() {
    const list = [];
    for (let i = 1; i <= this.state.maxLevel && i <= LEVELS.length; i++) list.push(LEVEL_MAP[i]);
    return list;
  }

  travelTo(levelId) {
    const lvl = LEVEL_MAP[levelId];
    if (!lvl) return;
    this.setLevel(levelId, true);
    this.toast('Berpindah ke ' + lvl.name);
    this.afterEnterMap();
  }

  /* -------------------------- PROGRESI MISI ---------------------------- */
  starsOf(profId) { return this.state.stars[profId] || [0, 0, 0]; }

  /* Progresi jabatan pemain (Tabel 3.3): Intern -> Junior Staff -> Senior Specialist. */
  rank() {
    if (this.state.masteryScore != null) return 'Career Explorer';
    if (this.state.promoted[2]) return 'Senior Specialist';
    if (this.state.promoted[1]) return 'Junior Staff';
    return 'Junior Intern';
  }

  isProfComplete(profId) {
    return this.starsOf(profId).every((s) => s > 0);
  }

  chapterStars(profId, idx) { return this.starsOf(profId)[idx] || 0; }

  isChapterUnlocked(profId, idx) {
    if (idx === 0) return true;
    return this.chapterStars(profId, idx - 1) > 0;
  }

  isProfMastered(profId) {
    return this.starsOf(profId).every((s) => s >= STAR_MIN_FOR_UNLOCK);
  }

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

  save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch (e) { /* diabaikan */ }
    this.onMeta(this);
  }

  resetAll() {
    this.state = freshState();
    this.masteryDone = false;
    this.setLevel(1, true);
    this.save();
    this.toast('Progres baru dimulai. Selamat bermain!');
  }

  /* ----------------------------- PETA & LOOP --------------------------- */
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
      this.openDialogue(this.map.intro, null, { portrait: 'hrd' });
    }
  }

  mapKey() { return this.currentMapKey; }

  update(dt) {
    this.time += dt;
    this.updateParticles(dt);
    if (this.scene !== 'world' || this.paused) return;

    /* gerak pemain */
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
      else this.player.dir = dy < 0 ? 'up' : 'down';
      const dist = SPEED * TILE * dt;
      this.tryMove(dx * dist, 0);
      this.tryMove(0, dy * dist);
      this.player.stepT += dt * 7;
      this.player.step = Math.floor(this.player.stepT) % 4;
    } else {
      this.player.stepT = 0;
      this.player.step = 0;
    }
    this.updateCamera();
  }

  tileSolidAt(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    const rows = this.map.tiles;
    if (ty < 0 || ty >= rows.length || tx < 0 || tx >= rows[0].length) return true;
    const ch = rows[ty][tx];
    if (SOLID.has(ch)) return true;
    /* NPC menghalangi jalan */
    if ((this.map.npcs || []).some((n) => n.x === tx && n.y === ty)) return true;
    return false;
  }

  blocked(x, y) {
    const hw = 6, hh = 4;
    return this.tileSolidAt(x - hw, y - hh) || this.tileSolidAt(x + hw, y - hh) ||
           this.tileSolidAt(x - hw, y + hh) || this.tileSolidAt(x + hw, y + hh);
  }

  tryMove(dx, dy) {
    const nx = this.player.x + dx, ny = this.player.y + dy;
    if (dx !== 0) { if (!this.blocked(nx, this.player.y)) this.player.x = nx; }
    if (dy !== 0) { if (!this.blocked(this.player.x, ny)) this.player.y = ny; }
  }

  updateCamera(snap) {
    const mapW = this.map.tiles[0].length * TILE;
    const mapH = this.map.tiles.length * TILE;
    const tx = clamp(this.player.x - VIEW_W / 2, 0, Math.max(0, mapW - VIEW_W));
    const ty = clamp(this.player.y - VIEW_H / 2, 0, Math.max(0, mapH - VIEW_H));
    if (snap) { this.cam.x = tx; this.cam.y = ty; }
    else { this.cam.x += (tx - this.cam.x) * 0.18; this.cam.y += (ty - this.cam.y) * 0.18; }
  }

  /* ---------------------------- PARTIKEL ------------------------------- */
  burst(x, y, color, n = 14) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 60;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
        life: 0.6 + Math.random() * 0.4, max: 1, color
      });
    }
  }

  updateParticles(dt) {
    this.particles = this.particles.filter((p) => {
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt;
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
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const x0 = Math.floor(this.cam.x / TILE), x1 = Math.ceil((this.cam.x + VIEW_W) / TILE);
    const y0 = Math.floor(this.cam.y / TILE), y1 = Math.ceil((this.cam.y + VIEW_H) / TILE);
    const rows = map.tiles;

    ctx.save();
    ctx.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));

    /* lantai & dinding */
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (ty < 0 || ty >= rows.length || tx < 0 || tx >= rows[0].length) continue;
        drawTile(ctx, rows[ty][tx], tx * TILE, ty * TILE);
      }
    }

    /* daftar objek untuk pengurutan berdasarkan sumbu Y */
    const list = [];
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (ty < 0 || ty >= rows.length || tx < 0 || tx >= rows[0].length) continue;
        const prop = PROP_TILE[rows[ty][tx]];
        if (!prop) continue;
        list.push({ y: (ty + 1) * TILE, fn: () => drawProp(ctx, prop, tx * TILE, ty * TILE, this.time) });
      }
    }

    /* NPC */
    (map.npcs || []).forEach((n) => {
      const prof = n.prof ? PROF_MAP[n.prof] : null;
      const cfg = prof ? prof.char : HRD_CHAR;
      const talking = this.talkingTo === n.id;
      list.push({
        y: n.y * TILE + TILE,
        fn: () => {
          drawChar(ctx, cfg, n.x * TILE + 4, n.y * TILE - 4, { dir: n.dir, moving: talking });
        }
      });
    });

    /* pemain */
    const pcfg = profileToChar(this.state.profile);
    list.push({
      y: this.player.y + 10,
      fn: () => drawChar(ctx, pcfg, Math.round(this.player.x) - 8, Math.round(this.player.y) - 12, {
        dir: this.player.dir, moving: this.player.moving, step: this.player.step
      })
    });

    list.sort((a, b) => a.y - b.y).forEach((o) => o.fn());

    /* penanda misi */
    (map.quests || []).forEach((q) => {
      const all = this.isProfComplete(q.prof);
      const mastered = this.isProfMastered(q.prof);
      const bobY = q.y * TILE + 4;
      if (!mastered) drawMarker(ctx, q.x * TILE + TILE, bobY, this.time + q.x);
      if (all && mastered) drawSparkle(ctx, q.x * TILE + 8, bobY - 6, this.time + q.x, PAL.yellow);
    });

    /* partikel */
    this.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      ctx.globalAlpha = 1;
    });

    ctx.restore();

    /* penanda lift aktif */
    const e = map.elevatorStand;
    if (e && this.state.maxLevel > this.state.currentLevel) {
      const sx = e.x * TILE + TILE / 2 - this.cam.x;
      const sy = e.y * TILE + TILE / 2 - this.cam.y;
      ctx.strokeStyle = 'rgba(242,201,76,0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.round(sx - 12), Math.round(sy - 16), 24, 26);
    }
  }

  /* Animasi latar layar judul: gedung kantor + logo */
  renderTitle() {
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    g.addColorStop(0, '#20304d');
    g.addColorStop(0.6, '#2c4468');
    g.addColorStop(1, '#1a2134');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    /* matahari / bulan */
    ctx.fillStyle = 'rgba(242,201,76,0.85)';
    ctx.beginPath();
    ctx.arc(470, 70, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(242,201,76,0.15)';
    ctx.beginPath();
    ctx.arc(470, 70, 40, 0, Math.PI * 2);
    ctx.fill();

    /* gedung bertingkat (parallax sederhana) */
    const t = this.time;
    for (let layer = 0; layer < 3; layer++) {
      const speed = 6 + layer * 8;
      const w = 46 - layer * 6;
      const baseY = VIEW_H - 30 - layer * 12;
      const off = -((t * speed) % w);
      ctx.fillStyle = ['#1d2a44', '#243354', '#2c3e63'][layer];
      for (let i = -1; i < 14; i++) {
        const bx = off + i * w;
        const bh = 60 + ((i * 37 + layer * 13) % 5) * 16;
        ctx.fillRect(Math.round(bx), baseY - bh, w - 4, bh);
        ctx.fillStyle = 'rgba(143,211,244,0.55)';
        for (let wy = 0; wy < Math.floor(bh / 14); wy++) {
          for (let wx = 0; wx < 3; wx++) {
            if ((i + wy * 3 + wx + layer) % 4 === 0) {
              ctx.fillRect(Math.round(bx) + 6 + wx * 12, baseY - bh + 6 + wy * 14, 6, 6);
            }
          }
        }
        ctx.fillStyle = ['#1d2a44', '#243354', '#2c3e63'][layer];
      }
    }

    /* tanah */
    ctx.fillStyle = '#151b2b';
    ctx.fillRect(0, VIEW_H - 30, VIEW_W, 30);
    ctx.fillStyle = '#1d2337';
    ctx.fillRect(0, VIEW_H - 30, VIEW_W, 3);

    /* logo */
    drawLogoMark(ctx, VIEW_W / 2 - 16, 34, 1);

    /* pemain berjalan di depan gedung jadi hidup */
    const pcfg = profileToChar(this.state.profile);
    const walkX = 60 + ((t * 26) % (VIEW_W + 40));
    drawChar(ctx, pcfg, Math.round(walkX), VIEW_H - 66, { dir: 'right', moving: true, step: Math.floor(t * 7) % 4 });
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
        { who: npc.name, text: 'Selamat bekerja! Dekati meja kerja yang ada penanda "!" lalu tekan tombol A untuk mulai bertugas.', portrait: HRD_CHAR },
        { who: npc.name, text: 'Setiap divisi punya tiga babak misi. Kumpulkan minimal Bintang 2 di semua divisi satu lantai agar bisa naik jabatan.', portrait: HRD_CHAR },
        { who: npc.name, text: 'Butuh catatan karier? Buka menu Ensiklopedia Karier (ikon "Buku") kapan saja untuk membaca rincian profesi, jurusan kuliah, dan sertifikasinya.', portrait: HRD_CHAR }
      ];
      this.openDialogue(lines, done, { portrait: HRD_CHAR });
      return;
    }
    const prof = PROF_MAP[npc.prof];
    const mastered = this.isProfMastered(prof.id);
    const lines = prof.greet.map((t) => ({ who: prof.npcName, text: t, portrait: prof.char }));
    if (mastered) {
      lines.push({
        who: prof.npcName,
        text: 'Divisi ini sudah kamu tuntaskan dengan baik. Kalau mau, kamu boleh mengulang misi untuk mengejar bintang tiga.',
        portrait: prof.char
      });
    }
    this.openDialogue(lines, () => { done(); if (this.onQuestOpen) this.openQuest({ prof: prof.id }); }, { portrait: prof.char });
  }

  /* Dipanggil oleh lapisan UI saat babak misi dimulai. */
  beginChapter(profId, idx) {
    const prof = PROF_MAP[profId];
    const chapter = prof.chapters[idx];
    const items = this.buildChapterItems(chapter);
    this.questSession = {
      profId, idx, chapter, items,
      step: 0, errors: 0, done: false, mode: chapter.mode
    };
    this.scene = 'quest';
    return this.questSession;
  }

  buildChapterItems(chapter) {
    if (chapter.mode === 'quiz') {
      return chapter.quiz.map((q) => ({
        type: 'quiz', q: q.q, options: shuffle(q.a.map((label, i) => ({ label, correct: i === q.c }))), why: q.why
      }));
    }
    const seeds = shuffle(DECOYS, 7).slice(0, 2);
    const base = chapter.mode === 'order' ? chapter.order : chapter.steps.map((s) => s.t);
    const items = base.map((text, i) => ({ text, order: i, decoy: false }))
      .concat(chapter.mode === 'check' ? seeds.map((text) => ({ text, order: -1, decoy: true })) : []);
    return shuffle(items, profSeed(chapter.title));
  }

  /* Menyelesaikan babak misi dengan jumlah kesalahan tertentu. */
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
      reward = ECONOMY.baseCoin[s.idx] + stars * ECONOMY.coinPerStar;
      this.state.coins += reward;
    }
    this.save();

    const profDone = this.isProfComplete(prof.id);
    const mastered = this.isProfMastered(prof.id);
    const lvlStats = this.levelStats(this.state.currentLevel);
    const levelAdvanced = lvlStats.canAdvance && !this.state.promoted[this.state.currentLevel] && this.state.currentLevel < LEVELS.length;

    /* partikel di sekitar pemain */
    if (stars > 0) {
      this.burst(this.player.x, this.player.y - 6, stars === 3 ? PAL.yellow : PAL.cyan, stars === 3 ? 24 : 12);
    }

    const result = {
      prof, chapter: s.chapter, idx: s.idx, stars, bestStars: best, errors, reward,
      profDone, mastered, levelAdvanced, unlockedEncyclopedia: stars > 0
    };
    this.questSession = null;
    this.scene = 'world';
    return result;
  }

  promote(levelId) {
    const lvl = LEVEL_MAP[levelId];
    if (!lvl || this.state.promoted[levelId]) return null;
    this.state.promoted[levelId] = true;
    this.state.salary += lvl.salary;
    if (levelId + 1 <= LEVELS.length) this.state.maxLevel = Math.max(this.state.maxLevel, levelId + 1);
    this.save();
    return lvl;
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
    this.save();
    return score;
  }

  /* ------------------------- TOAST & UI HOOKS -------------------------- */
  toast(msg) {
    if (this.onToast) this.onToast(msg);
  }

  togglePause(force) {
    if (this.scene === 'title') return;
    const next = typeof force === 'boolean' ? force : !this.paused;
    this.paused = next;
    this.onMeta(this);
  }

  /* ------------------------------ START -------------------------------- */
  startNewGame(profile) {
    const keepSeen = this.state.seenIntro;
    this.state = freshState();
    this.state.profile = profile || Object.assign({}, DEFAULT_PROFILE);
    this.state.seenIntro = {};
    this.setLevel(1, true);
    this.save();
    this.scene = 'world';
    this.paused = false;
    /* cutscene pembuka */
    this.openDialogue([
      { who: 'Narator', text: 'TechCorp - perusahaan teknologi tempat kamu menjalani program magang. Namamu tercatat sebagai Junior Intern.' },
      { who: 'Narator', text: 'Selama magang, kamu akan mencoba pekerjaan di sepuluh divisi untuk menemukan karier yang paling cocok denganmu.' },
      { who: 'Anda', text: 'Aku siap! Hari pertama kerja, ayo mulai dari lantai satu.' }
    ], () => { this.afterEnterMap(); }, { portrait: 'logo' });
  }

  continueGame() {
    this.scene = 'world';
    this.paused = false;
    this.setLevel(this.state.maxLevel, true);
    const key = this.mapKey();
    if (this.map.intro && !this.state.seenIntro[key]) {
      this.state.seenIntro[key] = true;
      this.save();
      this.openDialogue(this.map.intro, null, { portrait: 'hrd' });
    }
  }
}

/* Seed deterministik agar urutan item tetap konsisten per babak. */
function profSeed(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) & 0xfffffff;
  return h || 1;
}

/* Helper ikon profesi sebagai elemen canvas kecil (dipakai UI). */
export function iconCanvas(kind, scale = 3) {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 16;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  drawIcon(g, kind, 0, 0);
  c.style.width = 16 * scale + 'px';
  c.style.height = 16 * scale + 'px';
  c.style.imageRendering = 'pixelated';
  return c;
}

/* Diekspor ulang agar lapisan UI cukup mengimpor dari satu modul. */
export { PROFESSIONS, PROF_MAP, LEVELS, LEVEL_MAP, HELP_PAGES, MASTERY, ECONOMY, STAR_MIN_FOR_UNLOCK };
