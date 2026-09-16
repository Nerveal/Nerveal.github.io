/* ==========================================================================
 * Career Quest - app.js  (v2 - tampilan mengikuti mockup referensi)
 *
 * Lapisan antarmuka: label Scene, layar judul, kustomisasi karakter, HUD,
 * dialog gaya visual novel, panel misi bergaya perangkat (diegetik),
 * panel Mission Complete, Slip Gaji, Shop Kostumisasi, LEVEL UP, Ensiklopedia
 * Karier, Panduan, Tes Kompetensi, dan Finale.
 * ==========================================================================
 */

import { Game, iconCanvas, formatRupiah, formatGold, starString, SHOP_ITEMS, PROFESSIONS, PROF_MAP, LEVELS, LEVEL_MAP, PAYSLIPS, SCENES, MASTERY, HELP_PAGES, STAR_MIN_FOR_UNLOCK } from './game.js';
import { drawChar, drawLogoMark, drawStar, PAL } from './art.js';
import { GENDERS, SKIN_TONES, SHIRT_COLORS, PANTS_COLORS, profileToChar, DEFAULT_PROFILE, DEFAULT_OWNED, defaultProfileFor } from './data.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ============================== EFEK SUARA ============================== */
const Sound = {
  ctx: null, ready: false, muted: false, musicOn: false, musicTimer: null, step: 0,

  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.ready = true;
    if (this.musicOn) this.startMusic();
  },

  tone(freq, dur = 0.09, type = 'square', vol = 0.05, when = 0) {
    if (!this.ready || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 1.6);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur * 1.8);
  },

  sfx(name) {
    if (this.muted) return;
    switch (name) {
      case 'click': this.tone(520, 0.05, 'square', 0.035); break;
      case 'ok': this.tone(660, 0.07); this.tone(880, 0.09, 'square', 0.04, 0.06); break;
      case 'good': this.tone(700, 0.08); this.tone(1046, 0.12, 'triangle', 0.05, 0.07); break;
      case 'bad': this.tone(180, 0.14, 'sawtooth', 0.045); this.tone(120, 0.16, 'sawtooth', 0.04, 0.06); break;
      case 'star': [660, 784, 988, 1318].forEach((f, i) => this.tone(f, 0.1, 'triangle', 0.045, i * 0.07)); break;
      case 'level': [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.15, 'square', 0.05, i * 0.11)); break;
      case 'coin': this.tone(988, 0.06, 'square', 0.04); this.tone(1318, 0.1, 'square', 0.035, 0.06); break;
      case 'buy': this.tone(784, 0.07, 'triangle', 0.05); this.tone(1046, 0.1, 'triangle', 0.045, 0.07); this.tone(1318, 0.12, 'triangle', 0.04, 0.15); break;
      case 'dialog': this.tone(400, 0.03, 'square', 0.02); break;
      default: break;
    }
  },

  startMusic() {
    this.musicOn = true;
    if (!this.ready || this.musicTimer) return;
    const melody = [523, 0, 587, 0, 659, 0, 523, 0, 440, 0, 523, 0, 659, 0, 587, 0];
    const bass = [131, 131, 165, 165, 175, 175, 147, 147];
    this.musicTimer = setInterval(() => {
      if (!this.musicOn || this.muted) return;
      const m = melody[this.step % melody.length];
      if (m) this.tone(m, 0.16, 'triangle', 0.026);
      if (this.step % 2 === 0) this.tone(bass[(this.step / 2) % bass.length], 0.22, 'square', 0.018);
      this.step++;
    }, 240);
  },

  stopMusic() {
    this.musicOn = false;
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
};

/* ================================ TOASTS ================================ */
function toast(msg, kind = 'info', ms = 2600) {
  const host = $('#toasts');
  const node = document.createElement('div');
  node.className = 'toast ' + kind;
  node.textContent = msg;
  host.appendChild(node);
  setTimeout(() => { node.style.opacity = '0'; node.style.transition = 'opacity .3s'; }, ms - 300);
  setTimeout(() => node.remove(), ms);
}

/* ============================ KELOLA LAYAR ============================= */
const SCREENS = ['#screen-title', '#screen-char', '#screen-shop', '#screen-guide', '#screen-ency', '#screen-pause', '#quest', '#modal'];

function openScreen(sel) {
  const node = $(sel);
  node.hidden = false;
  node.scrollTop = 0;
  refreshSceneLabel();
  refreshPauseState();
}
function closeScreen(sel) {
  $(sel).hidden = true;
  refreshSceneLabel();
  refreshPauseState();
}
function anyScreenOpen() { return SCREENS.some((s) => !$(s).hidden); }

/* ============================== SCENE LABEL ============================ */
function setSceneLabel(text) {
  const el2 = $('#scene-label');
  if (!text) { el2.hidden = true; return; }
  el2.hidden = false;
  el2.textContent = text;
}

function refreshSceneLabel() {
  if (!game.state.presentation) { setSceneLabel(''); return; }
  /* lapisan teratas dulu: modal & layar misi menutupi layar lain di bawahnya */
  if (!$('#modal').hidden) { setSceneLabel($('#modal').dataset.scene || game.activeSceneLabel || SCENES.hub); return; }
  if (!$('#quest').hidden) { setSceneLabel(SCENES.mission); return; }
  if (!$('#screen-shop').hidden) { setSceneLabel(SCENES.salary); return; }
  if (!$('#screen-ency').hidden) { setSceneLabel(SCENES.encyclopedia); return; }
  if (!$('#screen-guide').hidden) { setSceneLabel(SCENES.guide); return; }
  if (!$('#screen-pause').hidden) { setSceneLabel('Menu Jeda'); return; }
  if (!$('#screen-char').hidden) { setSceneLabel('Scene 01b: Kustomisasi Karakter'); return; }
  if (!$('#screen-title').hidden) { setSceneLabel(SCENES.title); return; }
  setSceneLabel(game.sceneLabel());
}

/* ============================== MODAL ================================== */
function openModal(cfg) {
  $('#modal-title').textContent = cfg.title || '';
  $('#modal-title').hidden = !cfg.title;
  const sub = $('#modal-sub');
  sub.textContent = cfg.sub || '';
  sub.hidden = !cfg.sub;
  $('#modal').dataset.scene = cfg.scene || '';
  if (cfg.tone) $('#modal .panel').dataset.tone = cfg.tone; else delete $('#modal .panel').dataset.tone;
  const body = $('#modal-body');
  body.innerHTML = '';
  if (cfg.body) body.appendChild(cfg.body);
  const actions = $('#modal-actions');
  actions.innerHTML = '';
  (cfg.actions || [{ label: 'TUTUP', onClick: () => closeModal() }]).forEach((a) => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.className || '');
    b.textContent = a.label;
    b.disabled = !!a.disabled;
    b.onclick = () => { Sound.sfx('click'); if (a.onClick) a.onClick(); };
    actions.appendChild(b);
  });
  openScreen('#modal');
  return { close: closeModal };
}
function closeModal() { closeScreen('#modal'); $('#modal').dataset.scene = ''; }

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) node.setAttribute(k, '');
    else if (v !== false && v != null) node.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function statBox(k, v, extraClass = '') {
  return el('div', { class: 'stat ' + extraClass }, [
    el('div', { class: 'k', text: k }), el('div', { class: 'v', text: v })
  ]);
}

/* ============================== GAME INIT ============================== */
const canvas = $('#stage');
const game = new Game(canvas, {
  onMeta: () => { syncDialogue(); syncHud(); refreshSceneLabel(); },
  onToast: (m) => toast(m, 'info')
});
window.CareerQuest = { game, Sound, toast, SCENES };

function refreshPauseState() { game.paused = anyScreenOpen(); }

/* -------------------------- UKURAN PANGGUNG ---------------------------- */
const stagebox = $('#stagebox');
function layout() {
  const app = $('#app');
  const availW = app.clientWidth - 12;
  const availH = app.clientHeight - 12;
  const scale = Math.min(availW / 640, availH / 384);
  stagebox.style.width = Math.max(320, Math.floor(640 * scale)) + 'px';
  stagebox.style.height = Math.max(192, Math.floor(384 * scale)) + 'px';
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 250));

function setupTouch() {
  const touchish = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(hover: none)').matches);
  $('#touch').hidden = !touchish;
}

/* Kontrol sentuh (D-pad bulat + tombol A) menggantikan penanganan dokumen
   pada versi sebelumnya agar tidak dobel dengan event DOM.                  */
function bindTouchControls() {
  const press = (elm, dir) => {
    const on = (e) => { e.preventDefault(); game.touch[dir] = true; Sound.unlock(); };
    const off = (e) => { e.preventDefault(); game.touch[dir] = false; };
    elm.addEventListener('pointerdown', on);
    elm.addEventListener('pointerup', off);
    elm.addEventListener('pointercancel', off);
    elm.addEventListener('pointerleave', off);
  };
  $$('#touch .tbtn[data-dir]').forEach((b) => press(b, b.dataset.dir));
  $$('#touch .tbtn[data-act], #touch .abtn').forEach((b) => {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.unlock(); game.action(); });
  });
}

/* ============================== DIALOG ================================= */
let dlgView = { text: '', page: -1, startAt: 0, shown: 0, done: false };

function portraitNode(portrait) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const scale = 3;
  if (portrait && portrait.kind === 'logo') {
    c.width = 32; c.height = 32;
    g.imageSmoothingEnabled = false;
    drawLogoMark(g, 0, 0, 1);
  } else if (portrait && typeof portrait === 'object' && portrait.skin) {
    c.width = 24; c.height = 36;
    g.imageSmoothingEnabled = false;
    drawChar(g, portrait, 0, 0, { dir: 'down' });
  } else {
    c.width = 24; c.height = 36;
    g.imageSmoothingEnabled = false;
    drawChar(g, profileToChar(game.state.profile), 0, 0, { dir: 'down' });
  }
  c.style.width = (c.width * scale) + 'px';
  c.style.height = (c.height * scale) + 'px';
  c.style.imageRendering = 'pixelated';
  return c;
}

function syncDialogue() {
  const dlg = game.dialogue;
  const box = $('#dialogue');
  if (!dlg) {
    if (!box.hidden) box.hidden = true;
    dlgView.page = -1;
    return;
  }
  if (dlgView.page !== dlg.i) {
    dlgView.page = dlg.i;
    const page = dlg.pages[dlg.i];
    dlgView.text = page.text;
    dlgView.shown = 0;
    dlgView.done = false;
    dlgView.startAt = performance.now();
    $('#dlg-who').textContent = page.who || 'Narator';
    const pc = $('.portrait', box);
    pc.innerHTML = '';
    const portrait = page.portrait || (dlg.opts && dlg.opts.portrait) || null;
    if (portrait) pc.appendChild(portraitNode(portrait));
    pc.hidden = !portrait;
  }
  box.hidden = false;
  $('#dlg-text').textContent = dlgView.text.slice(0, dlgView.shown);
}

function advanceDialogue() {
  const dlg = game.dialogue;
  if (!dlg) return;
  if (!dlgView.done) {
    dlgView.shown = dlgView.text.length;
    dlgView.done = true;
    $('#dlg-text').textContent = dlgView.text;
    return;
  }
  Sound.sfx('dialog');
  game.advanceDialogue();
  syncDialogue();
}

$('#dialogue').addEventListener('click', advanceDialogue);
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (!game.dialogue) return;
  if ([' ', 'enter', 'z', 'e', 'j'].includes(k)) { e.preventDefault(); advanceDialogue(); }
});

/* ================================ HUD ================================== */
function syncHud() {
  const hud = $('#hud');
  hud.hidden = game.scene !== 'world';
  if (hud.hidden) { $('#prompt').hidden = true; return; }
  const cur = game.state.currentLevel;
  const stats = game.levelStats(cur);
  $('#hud-level').textContent = 'Lantai ' + cur + ' · ' + LEVEL_MAP[cur].theme;
  $('#hud-rank').textContent = game.rank();
  $('#hud-objective').textContent = stats.mastered + '/' + stats.profs.length + ' divisi tuntas';
  $('#hud-gold').textContent = formatGold(game.state.coins) + ' G';
  $('#hud-salary').textContent = formatRupiah(game.state.salary);
}

let lastPrompt = '';
function syncPrompt() {
  const box = $('#prompt');
  if (game.scene !== 'world' || game.paused) { box.hidden = true; lastPrompt = ''; return; }
  const t = game.nearestInteractable();
  let text = '';
  if (t && t.kind === 'npc') text = 'Bicara dengan ' + t.npc.name;
  else if (t && t.kind === 'quest') {
    const prof = PROF_MAP[t.quest.prof];
    const st = game.starsOf(prof.id);
    const next = st.findIndex((s) => s === 0);
    text = 'Misi ' + prof.name + (next >= 0 ? ' · babak ' + (next + 1) : ' · latihan ulang') +
      (game.isProfMastered(prof.id) ? ' (tuntas)' : '');
  } else if (game.isAtElevator()) {
    const cur = game.state.currentLevel;
    text = cur < game.state.maxLevel ? 'Naik ke Lantai ' + (cur + 1) : (cur > 1 ? 'Turun ke Lantai ' + (cur - 1) : 'Lift terkunci - tuntaskan divisi lantai ini');
  }
  if (!text) { box.hidden = true; lastPrompt = ''; return; }
  if (text !== lastPrompt) { $('#prompt-text').textContent = text; lastPrompt = text; }
  box.hidden = false;
}

canvas.addEventListener('pointerup', () => {
  Sound.unlock();
  if (game.dialogue) { advanceDialogue(); return; }
  if (game.scene === 'world' && !game.paused) game.action();
});

/* ======================= PERANGKAT MISI (DIEGETIK) ===================== */
/* Mengikuti Scene 04-06 mockup: soal tampil sebagai antarmuka perangkat.  */
const DEVICE = {
  itsupport: { kind: 'ticket', label: 'SISTEM TIKET - HELPDESK' },
  webdev: { kind: 'browser', label: 'BROWSER - LOCALHOST:3000' },
  graphic: { kind: 'design', label: 'APLIKASI DESAIN - LAYOUT' },
  network: { kind: 'rack', label: 'PANEL JARINGAN - SWITCH' },
  dba: { kind: 'console', label: 'SQL CONSOLE - DATABASE' },
  data: { kind: 'sheet', label: 'SPREADSHEET - DATA PENJUALAN' },
  se: { kind: 'terminal', label: 'TERMINAL - BUILD & TEST' },
  uiux: { kind: 'tablet', label: 'PROTOTIPE APLIKASI' },
  cyber: { kind: 'security', label: 'DASHBOARD KEAMANAN' },
  ai: { kind: 'notebook', label: 'MODEL TRAINING - AI' }
};
const MODE_LABEL = { check: 'Simulasi Langkah', quiz: 'Kuis Pemahaman', order: 'Susun Alur Kerja' };

/* ============================ BABAK MISI =============================== */
function startChapter(profId, idx) {
  Sound.unlock();
  const session = game.beginChapter(profId, idx);
  renderQuest(session);
  openScreen('#quest');
}

function renderQuest(session, opts = {}) {
  const prof = session.profId ? PROF_MAP[session.profId] : null;
  const chapter = session.chapter;
  const dev = opts.mastery
    ? { kind: 'assessment', label: 'TES KOMPETENSI KARIER - HRD' }
    : (DEVICE[session.profId] || { kind: 'sheet', label: 'PERANGKAT KERJA' });

  const iconHost = $('#quest-icon');
  iconHost.innerHTML = '';
  if (prof) iconHost.appendChild(iconCanvas(prof.icon, 2));
  $('#quest-title').textContent = chapter.title;
  $('#quest-prof').textContent = opts.mastery
    ? 'Gabungan 10 profesi · ' + session.items.length + ' soal acak'
    : prof.name + ' · babak ' + (session.idx + 1) + ' · ' + MODE_LABEL[chapter.mode];
  $('#quest-brief').textContent = chapter.brief;

  const device = $('#device');
  device.className = 'device device-' + dev.kind;
  $('#device-label').textContent = dev.label;

  const errorsEl = $('#quest-errors');
  const showErrors = () => { errorsEl.textContent = 'Kesalahan: ' + session.errors; };
  showErrors();

  const body = $('#quest-body');
  body.innerHTML = '';
  const actions = $('#quest-actions');
  actions.innerHTML = '';

  if (session.mode === 'quiz') renderQuizBody(body, actions, session, showErrors, opts);
  else if (session.mode === 'order') renderOrderBody(body, actions, session, showErrors);
  else renderCheckBody(body, actions, session, showErrors);

  actions.appendChild(el('button', {
    class: 'btn ghost',
    text: 'KELUAR',
    onclick: () => {
      Sound.sfx('click');
      game.questSession = null;
      game.scene = 'world';
      closeScreen('#quest');
      toast('Misi dibatalkan. Progres babak tidak tersimpan.', 'bad');
    }
  }));
}

/* ----------------- mode simulasi langkah (check) ---------------------- */
function renderCheckBody(body, actions, session, showErrors) {
  const chapter = session.chapter;
  const total = chapter.steps.length;
  const pool = el('ul', { class: 'q-list' });
  const done = el('ul', { class: 'q-list' });

  body.appendChild(el('div', { class: 'task-banner', text: 'Pilih tindakan yang tepat, urut dari langkah pertama!' }));
  body.appendChild(el('div', { class: 'q-cols' }, [
    el('div', { class: 'device-panel' }, [el('div', { class: 'q-block-title', text: 'DAFTAR TINDAKAN' }), pool]),
    el('div', { class: 'device-panel' }, [el('div', { class: 'q-block-title', text: 'PROSEDUR DIJALANKAN' }), done])
  ]));
  body.appendChild(el('p', { class: 'hintline', text: 'Ada tindakan pengecoh yang bukan bagian dari prosedur kerja.' }));

  session.items.forEach((item) => {
    const b = el('button', { class: 'q-item', text: item.text });
    b.onclick = () => {
      if (b.classList.contains('wrong') || b.classList.contains('done')) return;
      if (item.decoy) {
        session.errors++;
        b.classList.add('wrong');
        b.disabled = true;
        Sound.sfx('bad');
        toast('Tindakan itu tidak sesuai prosedur kerja.', 'bad', 2200);
        showErrors();
        return;
      }
      if (item.order === session.step) {
        session.step++;
        b.classList.add('done');
        b.disabled = true;
        done.appendChild(el('li', { class: 'q-item done' }, [
          el('span', { class: 'num', text: session.step + '.' }), item.text
        ]));
        Sound.sfx('ok');
        if (session.step >= total) setTimeout(() => finishChapter(session), 420);
      } else {
        session.errors++;
        b.classList.add('shake');
        setTimeout(() => b.classList.remove('shake'), 320);
        Sound.sfx('bad');
        showErrors();
      }
    };
    pool.appendChild(el('li', {}, [b]));
  });
}

/* --------------------- mode susun alur (order) ------------------------ */
function renderOrderBody(body, actions, session, showErrors) {
  const chapter = session.chapter;
  const total = chapter.order.length;
  const slots = [];
  const slotList = el('ul', { class: 'q-list' });

  body.appendChild(el('div', { class: 'task-banner', text: 'Susun urutan langkah kerja ke dalam slot!' }));
  body.appendChild(el('div', { class: 'q-cols' }, [
    el('div', { class: 'device-panel' }, [el('div', { class: 'q-block-title', text: 'ALUR KERJA' }), slotList]),
    el('div', { class: 'device-panel' }, [el('div', { class: 'q-block-title', text: 'PILIHAN LANGKAH' }), el('ul', { class: 'q-list', id: 'order-pool' })])
  ]));
  const pool = $('#order-pool');

  for (let i = 0; i < total; i++) {
    const li = el('li', { class: 'q-slot' }, [
      el('span', { class: 'num', text: (i + 1) + '.' }), el('span', { text: '(belum diisi)' })
    ]);
    slots.push(li);
    slotList.appendChild(li);
  }

  const hint = el('p', { class: 'hintline' });
  body.appendChild(hint);
  actions.appendChild(el('button', {
    class: 'btn small',
    text: 'PETUNJUK',
    onclick: () => { Sound.sfx('click'); hint.textContent = 'Petunjuk: ' + chapter.orderHint; }
  }));

  session.items.forEach((item) => {
    const b = el('button', { class: 'q-item', text: item.text });
    b.onclick = () => {
      if (b.disabled) return;
      if (item.order === session.step) {
        session.step++;
        const slot = slots[item.order];
        slot.classList.add('filled');
        slot.lastChild.textContent = item.text;
        b.disabled = true;
        b.classList.add('done');
        Sound.sfx('ok');
        if (session.step >= total) setTimeout(() => finishChapter(session), 420);
      } else {
        session.errors++;
        b.classList.add('shake');
        setTimeout(() => b.classList.remove('shake'), 320);
        Sound.sfx('bad');
        showErrors();
      }
    };
    pool.appendChild(el('li', {}, [b]));
  });
}

/* ------------------------- mode kuis (quiz) --------------------------- */
function renderQuizBody(body, actions, session, showErrors, opts = {}) {
  const items = session.items;
  const isMastery = !!opts.mastery;
  session.correctCount = 0;
  let idx = 0;

  function renderOne() {
    body.innerHTML = '';
    actions.innerHTML = '';
    const item = items[idx];
    body.appendChild(el('div', { class: 'task-banner', text: 'Soal ' + (idx + 1) + ' dari ' + items.length + (item.prof ? ' · ' + item.prof : '') }));
    body.appendChild(el('div', { class: 'device-panel wide' }, [
      el('div', { class: 'quiz-q', text: item.q }),
      el('div', { class: 'quiz-opts', id: 'quiz-opts' }),
      el('div', { class: 'feedback', id: 'quiz-feedback', hidden: true })
    ]));
    const optsHost = $('#quiz-opts');
    const feedback = $('#quiz-feedback');
    let answered = false;

    item.options.forEach((opt) => {
      const b = el('button', { class: 'quiz-opt', text: opt.label });
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const right = opt.correct;
        if (!right) session.errors++; else session.correctCount++;
        Array.from(optsHost.children).forEach((child, i) => {
          child.disabled = true;
          if (item.options[i].correct) child.classList.add('correct');
        });
        if (!right) b.classList.add('wrong');
        feedback.className = 'feedback ' + (right ? 'good' : 'bad');
        feedback.hidden = false;
        feedback.textContent = (right ? 'TEPAT! ' : 'BELUM TEPAT. ') + item.why;
        Sound.sfx(right ? 'good' : 'bad');
        showErrors();
        actions.innerHTML = '';
        actions.appendChild(el('button', {
          class: 'btn primary',
          text: idx + 1 >= items.length ? (isMastery ? 'LIHAT HASIL' : 'SELESAI') : 'SOAL BERIKUTNYA',
          onclick: () => {
            Sound.sfx('click');
            idx++;
            if (idx >= items.length) {
              if (isMastery) finishMastery(session); else finishChapter(session);
            } else renderOne();
          }
        }));
      };
      optsHost.appendChild(b);
    });
  }
  renderOne();
}

/* --------------------------- SELESAI BABAK ----------------------------- */
function finishChapter(session) {
  const result = game.finishChapter(session.errors);
  closeScreen('#quest');
  if (!result) return;
  const { prof, chapter, idx, stars, bestStars, reward, profDone, mastered, levelAdvanced } = result;
  if (stars > 0) Sound.sfx('star'); else Sound.sfx('bad');

  const body = el('div');
  body.appendChild(el('div', { class: 'star-row', text: starString(stars) }));
  body.appendChild(el('div', { class: 'mission-line', text:
    stars > 0
      ? 'MISI ' + prof.name.toUpperCase() + ' BABAK ' + (idx + 1) + ' SELESAI!'
      : 'MISI BELUM LULUS - ULANGI BABAK INI' }));
  body.appendChild(el('div', { class: 'result-grid' }, [
    statBox('Kesalahan', String(session.errors)),
    statBox('Gold diperoleh', reward ? '+' + reward + ' G' : '0 G'),
    statBox('Bintang terbaik', bestStars + '/3'),
    statBox('Total Gold', formatGold(game.state.coins) + ' G')
  ]));
  if (chapter.followUp) body.appendChild(el('div', { class: 'callout note', text: chapter.followUp }));
  if (stars > 0) {
    body.appendChild(el('div', { class: 'callout', text: 'Kamu cocok di jurusan ' + prof.study.join(' atau ') + '. Sertifikasi relevan: ' + prof.certs.join(', ') + '.' }));
    body.appendChild(el('div', { class: 'callout good', text: 'Jalur karier: ' + prof.careers.join(' > ') + '. Buka detailnya di Ensiklopedia Karier (ikon Buku).' }));
  }
  if (mastered && stars > 0) body.appendChild(el('div', { class: 'callout good', text: 'Divisi ' + prof.name + ' tuntas. Kartu profesi lengkap tersedia di Ensiklopedia Karier.' }));
  else if (profDone) body.appendChild(el('div', { class: 'callout', text: 'Semua babak ' + prof.name + ' sudah dimainkan. Ulangi babak dengan bintang kurang dari 2 agar divisi ini dihitung tuntas.' }));

  const actions = [
    { label: 'ULANGI', onClick: () => { closeModal(); startChapter(prof.id, idx); } },
    {
      label: 'LANJUT', className: 'primary',
      onClick: () => {
        closeModal();
        if (levelAdvanced) setTimeout(() => levelCompleteScene(game.state.currentLevel), 240);
        else setTimeout(() => checkMasteryInvite(), 200);
      }
    }
  ];
  openModal({
    title: stars > 0 ? 'Mission Complete' : 'Mission Failed',
    sub: prof.name + ' · ' + chapter.title,
    tone: stars > 0 ? 'reward' : 'fail',
    scene: SCENES.missionDone,
    body, actions
  });
}

/* ----------------------- NAIK LEVEL (Scene 08-09) ---------------------- */
function levelCompleteScene(levelId) {
  const lvl = LEVEL_MAP[levelId];
  const stats = game.levelStats(levelId);
  game.activeSceneLabel = SCENES.levelConfirm;
  openModal({
    title: 'Level ' + levelId + ' Selesai',
    sub: lvl.name + ' · ' + stats.mastered + '/' + stats.profs.length + ' divisi tuntas',
    scene: SCENES.levelConfirm,
    body: el('div', {}, [
      el('div', { class: 'callout', text: 'Selamat, kamu telah menyelesaikan semua divisi di lantai ini. Apakah kamu mau lanjut ke level ' + (levelId + 1) + '?' }),
      el('div', { class: 'result-grid' }, [
        statBox('Total bintang', game.totalStars() + '/' + (PROFESSIONS.length * 3)),
        statBox('Total Gold', formatGold(game.state.coins) + ' G'),
        statBox('Jabatan', game.rank())
      ])
    ]),
    actions: [
      { label: 'TIDAK', className: 'danger', onClick: () => { closeModal(); game.activeSceneLabel = SCENES.hub; refreshSceneLabel(); } },
      {
        label: 'IYA', className: 'primary',
        onClick: () => {
          closeModal();
          game.promote(levelId);
          setTimeout(() => payslipScene(levelId), 200);
        }
      }
    ]
  });
}

function payslipScene(levelId) {
  const slip = game.payslip(levelId);
  game.activeSceneLabel = SCENES.salary;
  const body = el('div', { class: 'payslip' });
  body.appendChild(el('div', { class: 'payslip-head' }, [
    el('div', { class: 'payslip-title', text: 'SLIP GAJI BULAN INI' }),
    el('div', { class: 'payslip-sub', text: 'TechCorp - Divisi Teknologi Informasi' })
  ]));
  const rows = [
    ['Level', levelId + ' (' + slip.jabatan + ')'],
    ['Gaji Pokok', formatRupiah(slip.gajiPokok)],
    ['Bonus Proyek', formatRupiah(slip.bonus)],
    ['Total Diterima', formatRupiah(slip.total)]
  ];
  const table = el('div', { class: 'payslip-rows' });
  rows.forEach((r, i) => {
    table.appendChild(el('div', { class: 'payslip-row' + (i === rows.length - 1 ? ' total' : '') }, [
      el('span', { text: r[0] }), el('span', { text: r[1] })
    ]));
  });
  body.appendChild(table);
  body.appendChild(el('div', { class: 'payslip-gold', text: 'Gold diterima: +' + formatGold(slip.gold) + ' G' }));
  body.appendChild(el('p', { class: 'muted', text: 'Catatan belajar (aspek ekonomi / DSI): ' + LEVEL_MAP[levelId].salaryLabel + '. Semakin tinggi tanggung jawab, semakin besar penghasilan.' }));

  openModal({
    title: 'Sistem Gaji',
    sub: 'Terima gaji untuk melanjutkan',
    scene: SCENES.salary,
    body,
    actions: [
      { label: 'BUKA SHOP', onClick: () => { closeModal(); openShop(); } },
      {
        label: 'TERIMA GAJI', className: 'primary',
        onClick: () => {
          closeModal();
          const got = game.acceptSalary(levelId);
          Sound.sfx('level');
          setTimeout(() => levelUpScene(levelId, got), 180);
        }
      }
    ]
  });
}

function levelUpScene(levelId, slip) {
  game.activeSceneLabel = SCENES.levelUp;
  const nextLevel = levelId + 1;
  const body = el('div', { class: 'levelup-body' });
  body.appendChild(el('div', { class: 'levelup-burst', html:
    Array.from({ length: 26 }).map((_, i) => '<i style="--i:' + i + '"></i>').join('') }));
  body.appendChild(el('div', { class: 'callout good', text: 'Selamat! Kamu naik ke Level ' + (nextLevel <= LEVELS.length ? nextLevel : LEVELS.length) + ' sebagai ' + game.rank() + '.' }));
  if (slip) {
    body.appendChild(el('div', { class: 'result-grid' }, [
      statBox('Gaji diterima', formatRupiah(slip.total)),
      statBox('Gold masuk', '+' + formatGold(slip.gold) + ' G'),
      statBox('Total gaji', formatRupiah(game.state.salary)),
      statBox('Jabatan', game.rank())
    ]));
  }
  body.appendChild(el('div', { class: 'callout', text: 'Akses misi baru terbuka: ' + (LEVEL_MAP[nextLevel] ? LEVEL_MAP[nextLevel].name : 'Finale') + '.' }));
  openModal({
    title: 'LEVEL UP!',
    sub: 'TechCorp - Kenaikan Jabatan',
    tone: 'levelup',
    scene: SCENES.levelUp,
    body,
    actions: [
      {
        label: nextLevel <= LEVELS.length ? 'NAIK KE LANTAI ' + nextLevel : 'LANJUT', className: 'primary',
        onClick: () => {
          closeModal();
          game.activeSceneLabel = SCENES.hub;
          if (nextLevel <= LEVELS.length) {
            game.setLevel(nextLevel, true);
            game.afterEnterMap();
          }
          setTimeout(() => checkMasteryInvite(), 400);
        }
      }
    ]
  });
}

function allLevelsPromoted() { return LEVELS.every((l) => game.state.promoted[l.id]); }

function checkMasteryInvite(force) {
  if (!allLevelsPromoted()) return;
  if (game.state.masteryScore != null) return;
  if (!force && !$('#modal').hidden) return;
  openModal({
    title: 'Tes Kompetensi Karier',
    sub: 'Dari tim HRD TechCorp',
    body: el('div', {}, [
      el('p', { class: 'muted', text: 'Semua divisi di tiga lantai sudah kamu selesaikan. Uji pemahamanmu tentang profesi informatika dengan 10 pertanyaan acak. Nilai minimal kelulusan: ' + MASTERY.passScore + '.' }),
      el('div', { class: 'callout note', text: 'Tes ini juga bisa dibuka kapan saja dari Ensiklopedia Karier.' })
    ]),
    actions: [
      { label: 'KERJAKAN', className: 'primary', onClick: () => { closeModal(); startMastery(); } },
      { label: 'NANTI', onClick: () => closeModal() }
    ]
  });
}

/* ------------------------- TES KOMPETENSI ------------------------------ */
function startMastery() {
  const items = game.buildMasteryQuiz();
  const session = {
    profId: null, idx: 0, mode: 'quiz', items, errors: 0, step: 0, mastery: true,
    chapter: { title: MASTERY.title, brief: MASTERY.brief, mode: 'quiz' }
  };
  game.questSession = session;
  game.scene = 'quest';
  renderQuest(session, { mastery: true });
  openScreen('#quest');
}

function finishMastery(session) {
  const total = session.items.length;
  const score = game.finishMastery(session.correctCount, total);
  game.questSession = null;
  game.scene = 'world';
  refreshPauseState();
  closeScreen('#quest');
  const passed = score >= MASTERY.passScore;
  if (passed) Sound.sfx('level'); else Sound.sfx('bad');

  const body = el('div');
  body.appendChild(el('div', { class: 'star-row', text: score + '/100' }));
  body.appendChild(el('div', { class: 'mission-line', text: passed ? 'TES KOMPETENSI LULUS!' : 'NILAI BELUM MENCAPAI ' + MASTERY.passScore }));
  body.appendChild(el('div', { class: 'result-grid' }, [
    statBox('Jawaban benar', session.correctCount + '/' + total),
    statBox('Kesalahan', String(session.errors)),
    statBox('Status', passed ? 'LULUS' : 'BELUM LULUS'),
    statBox('Nilai terbaik', String(game.state.masteryScore))
  ]));
  if (passed) body.appendChild(el('div', { class: 'callout good', text: 'Pemahamanmu tentang profesi bidang informatika sudah baik. Lanjutkan ke adegan penutup.' }));
  else body.appendChild(el('div', { class: 'callout', text: 'Pelajari kembali kartu profesi di Ensiklopedia Karier, lalu coba lagi.' }));

  const actions = [{ label: 'ULANGI TES', onClick: () => { closeModal(); startMastery(); } }];
  if (passed) actions.push({ label: 'PENUTUP', className: 'primary', onClick: () => { closeModal(); finaleScene(score); } });
  else actions.push({ label: 'TUTUP', className: 'primary', onClick: () => closeModal() });
  openModal({ title: 'Hasil Tes Kompetensi', sub: 'Nilai akhir', body, actions });
}

/* ------------------------- FINALE (Scene 12) -------------------------- */
function finaleScene(score) {
  const body = el('div');
  body.appendChild(el('div', { class: 'mission-line', text: 'SELAMAT! SEMUA MISI SELESAI!' }));
  body.appendChild(el('div', { class: 'callout', text: 'Kamu telah menyelesaikan magang di semua divisi. Sekarang kamu siap berkarier di dunia IT.' }));
  body.appendChild(el('div', { class: 'result-grid big' }, [
    statBox('Total Skor', formatGold(game.totalScore())),
    statBox('Total Gold', formatGold(game.state.coins) + ' G'),
    statBox('Total Bintang', game.totalStars() + '/' + (PROFESSIONS.length * 3)),
    statBox('Level Akhir', game.state.currentLevel + ' (' + game.rank() + ')'),
    statBox('Nilai Tes', score + '/100'),
    statBox('Total Gaji', formatRupiah(game.state.salary))
  ]));
  body.appendChild(el('div', { class: 'callout note', text: 'Langkah berikutnya ada di tanganmu: pilih jurusan kuliah atau sertifikasi yang sesuai dengan profesi favoritmu, lalu asah keterampilannya sejak sekarang.' }));
  game.state.seenEnding = true;
  game.save();
  openModal({
    title: 'Game Completion',
    sub: 'Epilog Career Quest',
    tone: 'reward',
    scene: SCENES.finale,
    body,
    actions: [
      {
        label: 'ULANGI GAME', className: 'primary',
        onClick: () => {
          closeModal();
          game.resetAll();
          syncHud();
          closeScreen('#screen-pause');
          openCharCreator('new');
        }
      },
      { label: 'KELUAR', className: 'danger', onClick: () => { closeModal(); backToTitle(); } }
    ]
  });
}

/* =========================== SHOP KOSTUMISASI ========================== */
let shopSlot = 'hairStyle';

const SLOT_LABEL = { hairStyle: 'RAMBUT', jacket: 'JAKET', shoes: 'SEPATU', accessory: 'AKSESORI' };

function openShop() {
  renderShop();
  openScreen('#screen-shop');
}

function renderShop() {
  $('#shop-gold').textContent = formatGold(game.state.coins) + ' G';
  const tabs = $('#shop-tabs');
  tabs.innerHTML = '';
  Object.keys(SLOT_LABEL).forEach((slot) => {
    const b = el('button', { class: 'tab' + (slot === shopSlot ? ' active' : ''), text: SLOT_LABEL[slot] });
    b.onclick = () => { Sound.sfx('click'); shopSlot = slot; renderShop(); };
    tabs.appendChild(b);
  });

  const list = $('#shop-list');
  list.innerHTML = '';
  SHOP_ITEMS.filter((i) => i.slot === shopSlot).forEach((item) => {
    const owned = game.hasItem(item.id);
    const equipped = game.state.profile[item.slot] === item.value;
    const card = el('div', { class: 'shop-card' + (equipped ? ' equipped' : '') + (owned ? ' owned' : '') });
    const preview = document.createElement('canvas');
    preview.width = 24; preview.height = 36;
    const g = preview.getContext('2d');
    g.imageSmoothingEnabled = false;
    const previewProfile = Object.assign({}, game.state.profile, { [item.slot]: item.value });
    drawChar(g, profileToChar(previewProfile), 0, 0, { dir: 'down' });
    preview.style.width = '48px'; preview.style.height = '72px';
    preview.style.imageRendering = 'pixelated';
    card.appendChild(preview);
    card.appendChild(el('div', { class: 'shop-name', text: item.label }));
    card.appendChild(el('div', { class: 'shop-price', text: item.price > 0 ? formatGold(item.price) + ' G' : 'GRATIS' }));

    const btn = el('button', { class: 'btn small ' + (owned ? (equipped ? '' : 'primary') : (game.state.coins >= item.price ? 'primary' : 'disabled')) });
    if (equipped) btn.textContent = 'DIPAKAI';
    else if (owned) btn.textContent = 'PAKAI';
    else btn.textContent = 'BELI';
    btn.disabled = equipped;
    btn.onclick = () => {
      if (owned) {
        game.equipItem(item.id);
        Sound.sfx('buy');
        toast(item.label + ' dipakai.', 'good');
      } else {
        const res = game.buyItem(item.id);
        if (!res.ok) {
          if (res.reason === 'gold') { Sound.sfx('bad'); toast('Gold belum cukup. Kurang ' + formatGold(res.kurang) + ' G - selesaikan misi dulu.', 'bad'); }
          return;
        }
        game.equipItem(item.id);
        Sound.sfx('buy');
        toast(item.label + ' dibeli dan dipakai.', 'good');
      }
      syncHud();
      renderShop();
    };
    card.appendChild(btn);
    list.appendChild(card);
  });

  const hero = $('#shop-hero');
  hero.innerHTML = '';
  const hc = document.createElement('canvas');
  hc.width = 24; hc.height = 36;
  const hg = hc.getContext('2d');
  hg.imageSmoothingEnabled = false;
  drawChar(hg, profileToChar(game.state.profile), 0, 0, { dir: 'down' });
  hc.style.width = '96px'; hc.style.height = '144px';
  hc.style.imageRendering = 'pixelated';
  hero.appendChild(hc);
  hero.appendChild(el('div', { class: 'muted', style: 'margin:6px 0 0', text: game.rank() + ' · Lantai ' + game.state.currentLevel }));
}

$('#shop-close').onclick = () => {
  Sound.sfx('click');
  closeScreen('#screen-shop');
  const tertunda = game.unpaidPromotedLevels();
  if (tertunda.length && $('#modal').hidden) payslipScene(tertunda[0]);
};
$('#shop-char').onclick = () => { Sound.sfx('click'); closeScreen('#screen-shop'); openCharCreator('edit'); };

/* =========================== ENSIKLOPEDIA ============================== */
let encySelected = null;

function starText(profId) {
  const st = game.starsOf(profId);
  return st.map((s) => (s > 0 ? '<span class="on">★</span>'.repeat(s) : '<span>☆</span>')).join(' ');
}

function openEncyclopedia(sel) {
  encySelected = sel || encySelected || PROFESSIONS[0].id;
  const grid = $('#ency-grid');
  grid.innerHTML = '';
  LEVELS.forEach((lvl) => {
    grid.appendChild(el('div', { class: 'q-block-title', text: 'LANTAI ' + lvl.id + ' · ' + lvl.theme, style: 'grid-column:1/-1' }));
    lvl.professions.forEach((pid) => {
      const p = PROF_MAP[pid];
      const st = game.starsOf(p.id);
      const locked = st.every((s) => s === 0);
      const card = el('button', { class: 'ency-card' + (locked ? ' locked' : '') + (pid === encySelected ? ' active' : '') }, [
        el('div', { class: 'nm', text: p.name }),
        el('div', { class: 'lv', text: 'Lantai ' + p.level + ' · ' + p.alias }),
        el('div', { class: 'st', html: locked ? 'belum dimainkan' : starText(p.id) })
      ]);
      card.onclick = () => {
        if (locked) { toast('Selesaikan minimal satu babak misi ' + p.name + ' untuk membuka kartunya.', 'bad'); return; }
        Sound.sfx('click');
        openEncyclopedia(pid);
      };
      grid.appendChild(card);
    });
  });

  const detail = $('#ency-detail');
  const p = PROF_MAP[encySelected];
  detail.innerHTML = '';
  detail.appendChild(el('div', { class: 'ency-head' }, [
    iconCanvas(p.icon, 3),
    el('div', {}, [
      el('h3', { text: p.name }),
      el('div', { class: 'muted', style: 'margin:0', text: p.alias + ' · Mentor: ' + p.npcName + ' · Lantai ' + p.level })
    ])
  ]));
  detail.appendChild(el('div', { class: 'sec' }, [el('b', { text: 'Deskripsi pekerjaan' }), el('p', { style: 'margin:4px 0 0', text: p.duty })]));
  detail.appendChild(el('div', { class: 'sec' }, [el('b', { text: 'Rincian tugas harian' }),
    el('ul', {}, p.duties.map((d) => el('li', { text: d })))]));
  detail.appendChild(el('div', { class: 'sec' }, [el('b', { text: 'Jurusan kuliah terkait' }),
    el('div', {}, p.study.map((s) => el('span', { class: 'tag', text: s })))]));
  detail.appendChild(el('div', { class: 'sec' }, [el('b', { text: 'Sertifikasi yang relevan' }),
    el('div', {}, p.certs.map((s) => el('span', { class: 'tag', text: s })))]));
  detail.appendChild(el('div', { class: 'sec' }, [el('b', { text: 'Jalur karier' }),
    el('div', {}, p.careers.map((s) => el('span', { class: 'tag', text: s })))]));

  const chapBox = el('div', { class: 'sec' }, [el('b', { text: 'Daftar misi' })]);
  p.chapters.forEach((c, i) => {
    const unlocked = game.isChapterUnlocked(p.id, i);
    const st = game.starsOf(p.id)[i] || 0;
    const row = el('div', { class: 'chapter-line' }, [
      el('span', { text: (i + 1) + '. ' + c.title }),
      el('span', { html: unlocked ? (st ? '<span class="on">' + '★'.repeat(st) + '</span>' : 'belum selesai') : 'terkunci' })
    ]);
    if (unlocked && game.state.maxLevel >= p.level) {
      const go = el('button', { class: 'btn small', text: 'MAIN' });
      go.onclick = () => {
        closeScreen('#screen-ency');
        closeScreen('#screen-pause');
        game.setLevel(p.level, true);
        game.scene = 'world';
        refreshPauseState();
        startChapter(p.id, i);
      };
      row.appendChild(go);
    }
    chapBox.appendChild(row);
  });
  detail.appendChild(chapBox);

  const masteryBtn = $('#ency-mastery');
  const ready = allLevelsPromoted();
  masteryBtn.disabled = !ready;
  masteryBtn.textContent = ready
    ? (game.state.masteryScore != null ? 'ULANGI TES KOMPETENSI (' + game.state.masteryScore + '/100)' : 'TES KOMPETENSI KARIER')
    : 'TES KOMPETENSI (TUNTASKAN 3 LANTAI)';
}

$('#ency-close').onclick = () => { Sound.sfx('click'); closeScreen('#screen-ency'); };
$('#ency-mastery').onclick = () => {
  if (!allLevelsPromoted()) { toast('Tuntaskan seluruh divisi di tiga lantai terlebih dahulu.', 'bad'); return; }
  closeScreen('#screen-ency');
  startMastery();
};

/* ============================== PANDUAN ================================ */
let guidePage = 0;

function guidancePages() {
  const pages = HELP_PAGES.map((p) => ({ title: p.title, items: p.items }));
  pages.push({
    title: 'Pemetaan Kurikulum (Fase E)',
    html: () => {
      const wrap = el('div');
      wrap.appendChild(el('p', { class: 'muted', text: 'Isi permainan dipetakan dari Capaian Pembelajaran Fase E (SK Kepala BSKAP No. 032/H/KR/2024) dan Tujuan Pembelajaran Bab 8 Buku Informatika Kelas X (Mushthofa dkk., 2019) - lihat Tabel 3.1 dan 3.2 skripsi.' }));
      const table = el('table', { class: 'data' });
      table.innerHTML = '<tr><th>Komponen Kurikulum</th><th>Implementasi dalam Game</th><th>Status</th></tr>';
      [
        ['Deskripsi Fase E: wawasan profesi informatika', 'Konsep RPG: pemain berperan sebagai staf magang (role-play) di 10 divisi', 'Terimplementasi'],
        ['Elemen Dampak Sosial Informatika (DSI) - aspek ekonomi', 'Sistem ekonomi: Gold dari misi, Slip Gaji bulanan, dan Shop Kostumisasi', 'Terimplementasi'],
        ['Tujuan Pembelajaran Bab 8: rencana studi lanjut & karier', 'Fitur Ensiklopedia Karier: jurusan kuliah, sertifikasi, dan jalur karier tiap profesi', 'Terimplementasi'],
        ['Elemen Praktik Lintas Bidang (PLB)', 'Tiga mode misi: urutan prosedur kerja, kuis konsep, dan dokumentasi solusi', 'Terimplementasi']
      ].forEach((r) => {
        const tr = el('tr');
        r.forEach((c, i) => tr.appendChild(el('td', { text: c, style: i === 2 ? 'white-space:nowrap; color:#8ee29a' : '' })));
        table.appendChild(tr);
      });
      wrap.appendChild(table);
      return wrap;
    }
  });
  pages.push({
    title: 'Rubrik Penilaian Produk',
    html: () => {
      const wrap = el('div');
      wrap.appendChild(el('p', { class: 'muted', text: 'Ringkasan capaian pemain yang dihitung otomatis dari bintang, Gold, dan nilai tes. Untuk skor kelayakan resmi, gunakan kuesioner Tabel 3.4-3.6 pada skripsi.' }));
      const table = el('table', { class: 'data' });
      table.innerHTML = '<tr><th>Aspek</th><th>Indikator</th><th>Capaian bintang</th><th>Komponen</th></tr>';
      LEVELS.forEach((l) => {
        const s = game.levelStats(l.id);
        const tr = el('tr');
        tr.appendChild(el('td', { text: 'Lantai ' + l.id + ' - ' + l.theme }));
        tr.appendChild(el('td', { text: 'Cakupan profesi ' + l.professions.length + ' divisi · ' + (s.total / 3) + ' babak misi' }));
        tr.appendChild(el('td', { text: Math.round((s.stars / (s.total * 3)) * 100) + '%' }));
        tr.appendChild(el('td', { text: s.profs.map((p) => p.name).join(', ') }));
        table.appendChild(tr);
      });
      wrap.appendChild(table);

      const passed = PROFESSIONS.filter((p) => game.isProfMastered(p.id)).length;
      const totalStars = game.totalStars();
      const persen = Math.round((totalStars / (PROFESSIONS.length * 3)) * 100);
      const tingkat = persen >= 90 ? 'Sangat Tinggi (Sangat Layak)' : persen >= 75 ? 'Tinggi (Layak)' : persen >= 65 ? 'Cukup Tinggi (Kurang Layak)' : persen >= 55 ? 'Kurang Tinggi (Tidak Layak)' : 'Sangat Kurang Tinggi (Sangat Tidak Layak)';
      wrap.appendChild(el('div', { class: 'result-grid' }, [
        statBox('Divisi tuntas', passed + '/' + PROFESSIONS.length),
        statBox('Total bintang', totalStars + '/' + (PROFESSIONS.length * 3)),
        statBox('Persentase capaian', persen + '%'),
        statBox('Tingkat kualifikasi', tingkat),
        statBox('Total Skor', formatGold(game.totalScore())),
        statBox('Total Gold', formatGold(game.state.coins) + ' G')
      ]));
      wrap.appendChild(el('p', { class: 'muted', text: 'Konversi tingkat pencapaian mengikuti Tabel 3.8 (Sari dkk., 2024): 90-100% sangat tinggi, 75-89% tinggi, 65-74% cukup tinggi, 55-64% kurang tinggi, 0-54% sangat kurang tinggi.' }));
      return wrap;
    }
  });
  pages.push({
    title: 'Catatan Penelitian & Teknis',
    items: [
      'Produk dikembangkan mengikuti model MDLC Luther-Sutopo: Concept, Design, Material Collecting, Assembly, Testing, Distribution.',
      'Seluruh aset visual (pixel art 32 px) dan efek suara dibangkitkan secara prosedural (Canvas 2D + Web Audio API), sehingga aplikasi ringan, tanpa aset eksternal, dan dapat dijalankan offline.',
      'Materi 10 profesi diadaptasi dari Tabel 2.2 skripsi (Mushthofa dkk., 2019; Hamidli, 2023) dan dibagi ke dalam tiga tingkat level sesuai Tabel 3.2.',
      'Label "Scene 0X" pada Mode Presentasi mengikuti penomoran adegan pada mockup desain sehingga mudah dibandingkan saat sidang atau demo.',
      'Pengujian alpha (black box) otomatis tersedia pada folder uji/: 85 butir pengujian fungsional (U-01 s.d. U-85).',
      'Progres pemain tersimpan otomatis pada peramban (localStorage) sehingga dapat dilanjutkan kembali tanpa akun.'
    ]
  });
  return pages;
}

function renderGuide() {
  const pages = guidancePages();
  const page = pages[guidePage];
  $('#guide-title').textContent = page.title;
  const body = $('#guide-body');
  body.innerHTML = '';
  if (page.html) body.appendChild(page.html());
  if (page.items) {
    const ul = el('ul');
    page.items.forEach((t) => ul.appendChild(el('li', { text: t, style: 'margin-bottom:6px; line-height:1.55' })));
    body.appendChild(ul);
  }
  $('#guide-prev').disabled = guidePage === 0;
  $('#guide-next').disabled = guidePage >= pages.length - 1;
  $('#guide-next').textContent = guidePage >= pages.length - 1 ? 'SELESAI' : 'BERIKUTNYA';
}

function openGuide(page) { guidePage = page || 0; renderGuide(); openScreen('#screen-guide'); }
$('#guide-prev').onclick = () => { Sound.sfx('click'); if (guidePage > 0) { guidePage--; renderGuide(); } };
$('#guide-next').onclick = () => { Sound.sfx('click'); if (guidePage < guidancePages().length - 1) { guidePage++; renderGuide(); } else closeScreen('#screen-guide'); };
$('#guide-close').onclick = () => { Sound.sfx('click'); closeScreen('#screen-guide'); };

/* ======================= PEMBUATAN KARAKTER =========================== */
let draftProfile = Object.assign({}, DEFAULT_PROFILE);
let charMode = 'new';

function drawCharPreview() {
  const c = $('#char-canvas');
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = PAL.navy2;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = PAL.gray2;
  g.fillRect(0, c.height - 12, c.width, 12);
  const cfg = profileToChar(draftProfile);
  drawChar(g, cfg, 14, 6, { dir: 'down' });
  drawChar(g, cfg, 52, 6, { dir: 'right', moving: true, step: 1 });
  drawChar(g, cfg, 90, 6, { dir: 'left', moving: true, step: 3 });
  drawChar(g, cfg, 128, 6, { dir: 'up' });
  drawChar(g, cfg, 14, 58, { dir: 'down', moving: true, step: 2 });
}

function renderCharForm() {
  const form = $('#char-form');
  form.innerHTML = '';
  const gender = GENDERS.find((x) => x.id === draftProfile.gender) || GENDERS[0];

  function field(label, options, key, render) {
    const opts = el('div', { class: 'opts' });
    options.forEach((o, i) => {
      const value = o.id != null ? o.id : i;
      const b = el('button', { class: 'opt', 'aria-pressed': String(draftProfile[key] === value) });
      if (render) b.innerHTML = render(o);
      else b.textContent = o.label;
      b.onclick = () => {
        draftProfile[key] = value;
        Sound.sfx('click');
        renderCharForm();
        drawCharPreview();
      };
      opts.appendChild(b);
    });
    return el('div', { class: 'field' }, [el('div', { class: 'label', text: label }), opts]);
  }

  form.appendChild(field('Jenis kelamin', GENDERS, 'gender'));
  form.appendChild(field('Warna kulit', SKIN_TONES, 'skin',
    (o) => '<span class="swatch" style="background:' + o.skin + '"></span>' + o.label));
  form.appendChild(field('Warna baju', SHIRT_COLORS, 'shirt',
    (o) => '<span class="swatch" style="background:' + o.top + '"></span>' + o.label));
  form.appendChild(field('Warna celana', PANTS_COLORS, 'pants',
    (o) => '<span class="swatch" style="background:' + o.pants + '"></span>' + o.label));
  form.appendChild(field('Warna rambut', gender.hairOptions.map((h, i) => ({ id: i, hair: h })), 'hair',
    (o) => '<span class="swatch" style="background:' + o.hair + '"></span>Warna ' + (o.id + 1)));

  /* ringkasan item kostumisasi yang sedang dipakai */
  const worn = el('div', { class: 'worn' });
  ['hairStyle', 'jacket', 'shoes', 'accessory'].forEach((slot) => {
    const id = game.equippedId(slot);
    const item = SHOP_ITEMS.find((i) => i.id === id);
    worn.appendChild(el('span', { class: 'tag', text: (SLOT_LABEL[slot] || slot) + ': ' + (item ? item.label : '-') }));
  });
  const note = el('div', { class: 'field' }, [
    el('div', { class: 'label', text: 'Item Kostumisasi Terpasang' }),
    worn,
    el('div', { class: 'muted', style: 'margin-top:6px', text: 'Beli item baru (rambut, jaket, sepatu, aksesori) di Shop Kostumisasi pada menu Jeda, lalu pakai dari sana.' })
  ]);
  form.appendChild(note);
}

function openCharCreator(mode) {
  charMode = mode;
  if (mode === 'edit') draftProfile = Object.assign({}, game.state.profile);
  else draftProfile = defaultProfileFor(draftProfile.gender || 'pria');
  renderCharForm();
  drawCharPreview();
  $('#char-save').textContent = mode === 'edit' ? 'SIMPAN PENAMPILAN' : 'MULAI BERTUGAS';
  openScreen('#screen-char');
}

$('#char-cancel').onclick = () => {
  Sound.sfx('click');
  closeScreen('#screen-char');
  if (charMode === 'new') openScreen('#screen-title');
};
$('#char-save').onclick = () => {
  Sound.sfx('ok');
  if (charMode === 'edit') {
    game.state.profile = Object.assign({}, game.state.profile, draftProfile);
    game.save();
    closeScreen('#screen-char');
    toast('Penampilan karakter diperbarui.', 'good');
    return;
  }
  closeScreen('#screen-char');
  closeScreen('#screen-title');
  game.startNewGame(draftProfile);
  Sound.unlock();
  syncHud();
};

/* ============================ MENU & PAUSE ============================= */
function titleMeta() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem('career-quest-save-v1') || 'null'); } catch (e) { s = null; }
  const continueBtn = $('#btn-continue');
  if (!s) {
    continueBtn.disabled = true;
    continueBtn.classList.add('disabled');
    $('#title-meta').textContent = 'Belum ada progres tersimpan. Tekan MULAI untuk memainkan 10 profesi informatika.';
    return;
  }
  continueBtn.disabled = false;
  continueBtn.classList.remove('disabled');
  const stars = PROFESSIONS.reduce((acc, p) => acc + ((s.stars && s.stars[p.id]) || [0, 0, 0]).reduce((a, b) => a + b, 0), 0);
  const lvl = LEVEL_MAP[s.maxLevel] || LEVEL_MAP[1];
  $('#title-meta').textContent = 'Lanjutkan: ' + lvl.name + ' · ' + stars + '/' + (PROFESSIONS.length * 3) + ' bintang · ' + formatGold(s.coins || 0) + ' G';
}

function renderTitleArt() {
  const host = $('#title-art');
  if (!host || host.dataset.done === '1') return;
  host.dataset.done = '1';
  const c = document.createElement('canvas');
  c.width = 32; c.height = 32;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  drawLogoMark(g, 0, 0, 1);
  host.appendChild(c);
}

function openTitle() { renderTitleArt(); titleMeta(); openScreen('#screen-title'); }

function backToTitle() {
  game.scene = 'title';
  game.paused = false;
  game.activeSceneLabel = SCENES.title;
  openTitle();
}

function pauseStats() {
  const grid = el('div', { class: 'result-grid' });
  grid.appendChild(statBox('Jabatan', game.rank()));
  grid.appendChild(statBox('Lantai', String(game.state.currentLevel)));
  grid.appendChild(statBox('Total bintang', game.totalStars() + '/' + (PROFESSIONS.length * 3)));
  grid.appendChild(statBox('Gold', formatGold(game.state.coins) + ' G'));
  grid.appendChild(statBox('Total gaji', formatRupiah(game.state.salary)));
  grid.appendChild(statBox('Total skor', formatGold(game.totalScore())));
  const host = $('#pause-stats');
  host.innerHTML = '';
  host.appendChild(grid);

  /* pengaman: slip gaji yang belum diterima selalu dapat diambil dari menu jeda */
  const tertunda = game.unpaidPromotedLevels();
  if (tertunda.length) {
    const slip = game.payslip(tertunda[0]);
    const btn = el('button', {
      class: 'btn primary', style: 'margin-top:10px',
      text: 'TERIMA SLIP GAJI (Level ' + tertunda[0] + ' · ' + formatRupiah(slip.total) + ')',
      onclick: () => { Sound.sfx('click'); closeScreen('#screen-pause'); payslipScene(tertunda[0]); }
    });
    host.appendChild(btn);
  }
}

$('#btn-new').onclick = () => {
  Sound.sfx('click');
  let hasSave = false;
  try { hasSave = !!localStorage.getItem('career-quest-save-v1'); } catch (e) { hasSave = false; }
  if (!hasSave) { openCharCreator('new'); return; }
  openModal({
    title: 'Mulai Permainan Baru?',
    sub: 'Progres yang tersimpan akan digantikan',
    body: el('p', { class: 'muted', text: 'Kamu sudah punya progres tersimpan. Memulai permainan baru akan mereset bintang, Gold, jabatan, dan item yang dibeli. Gunakan tombol LANJUTKAN untuk melanjutkan permainan sebelumnya.' }),
    actions: [
      { label: 'YA, MULAI BARU', className: 'danger', onClick: () => { closeModal(); openCharCreator('new'); } },
      { label: 'BATAL', className: 'primary', onClick: () => closeModal() }
    ]
  });
};
$('#btn-continue').onclick = () => {
  Sound.sfx('click');
  closeScreen('#screen-title');
  Sound.unlock();
  game.continueGame();
  syncHud();
};
$('#btn-guide').onclick = () => { Sound.sfx('click'); openGuide(0); };
$('#btn-rubric').onclick = () => {
  Sound.sfx('click');
  const idx = guidancePages().findIndex((p) => /Rubrik/i.test(p.title));
  openGuide(idx > 0 ? idx : 0);
};
$('#btn-exit').onclick = () => {
  Sound.sfx('click');
  openModal({
    title: 'Keluar dari Career Quest?',
    sub: 'Progres kamu sudah tersimpan otomatis',
    body: el('p', { class: 'muted', text: 'Kamu bisa menutup tab ini atau memuat ulang halaman kapan saja; progres tetap tersimpan dan bisa dilanjutkan lewat tombol LANJUTKAN.' }),
    actions: [
      { label: 'KELUAR', className: 'danger', onClick: () => { closeModal(); window.close(); backToTitle(); } },
      { label: 'BATAL', className: 'primary', onClick: () => closeModal() }
    ]
  });
};

$('#btn-pause').onclick = () => { Sound.sfx('click'); game.paused = true; pauseStats(); openScreen('#screen-pause'); };
$('#btn-book').onclick = () => { Sound.sfx('click'); openEncyclopedia(); openScreen('#screen-ency'); };

$('#pause-resume').onclick = () => { Sound.sfx('click'); closeScreen('#screen-pause'); };
$('#pause-guide').onclick = () => { Sound.sfx('click'); openGuide(0); };
$('#pause-ency').onclick = () => { Sound.sfx('click'); openEncyclopedia(); openScreen('#screen-ency'); };
$('#pause-shop').onclick = () => { Sound.sfx('click'); closeScreen('#screen-pause'); openShop(); };
$('#pause-char').onclick = () => { Sound.sfx('click'); closeScreen('#screen-pause'); openCharCreator('edit'); };
$('#pause-present').onclick = () => {
  game.setPresentation(!game.state.presentation);
  $('#pause-present').textContent = 'Mode Presentasi: ' + (game.state.presentation ? 'AKTIF' : 'MATI');
  refreshSceneLabel();
  Sound.sfx('click');
};
$('#pause-sound').onclick = () => {
  Sound.muted = !Sound.muted;
  $('#pause-sound').textContent = 'Suara: ' + (Sound.muted ? 'MATI' : 'AKTIF');
  if (!Sound.muted) Sound.sfx('ok');
};
$('#pause-music').onclick = () => {
  Sound.unlock();
  if (Sound.musicOn) { Sound.stopMusic(); $('#pause-music').textContent = 'Musik: MATI'; }
  else { Sound.startMusic(); $('#pause-music').textContent = 'Musik: AKTIF'; }
};
$('#pause-reset').onclick = () => {
  openModal({
    title: 'Ulang Progres?',
    sub: 'Semua bintang, Gold, gaji, dan item akan dihapus',
    body: el('p', { class: 'muted', text: 'Tindakan ini tidak bisa dibatalkan. Permainan akan dimulai kembali dari lantai satu.' }),
    actions: [
      { label: 'YA, HAPUS', className: 'danger', onClick: () => { closeModal(); closeScreen('#screen-pause'); game.resetAll(); syncHud(); } },
      { label: 'BATAL', className: 'primary', onClick: () => closeModal() }
    ]
  });
};
$('#pause-tomap').onclick = () => { Sound.sfx('click'); closeScreen('#screen-pause'); backToTitle(); };

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !game.dialogue && !$('#screen-pause').hidden) closeScreen('#screen-pause');
});

/* ============================== LOOP UI =============================== */
function uiLoop(now) {
  const dlg = game.dialogue;
  if (dlg && !dlgView.done) {
    const target = Math.floor((now - dlgView.startAt) / 16);
    if (target > dlgView.shown) {
      dlgView.shown = target;
      $('#dlg-text').textContent = dlgView.text.slice(0, dlgView.shown);
      if (dlgView.shown >= dlgView.text.length) dlgView.done = true;
    }
  }
  if (game.dialogue && !game.paused) { /* dialog menahan permainan */ }
  syncPrompt();
  requestAnimationFrame(uiLoop);
}

/* ================================ BOOT ================================ */
function boot() {
  const msg = $('#boot-msg');
  const bar = $('.boot-bar span');
  const steps = [
    ['Memuat palet & aset pixel art...', 25],
    ['Menyusun Office Hub tiga lantai...', 50],
    ['Menyiapkan 10 kartu profesi...', 75],
    ['Menghubungkan sistem misi, gaji & shop...', 92],
    ['Siap bertugas!', 100]
  ];
  let i = 0;
  const tick = () => {
    if (i >= steps.length) {
      $('#boot').classList.add('done');
      setTimeout(() => { $('#boot').hidden = true; }, 450);
      return;
    }
    msg.textContent = steps[i][0];
    bar.style.width = steps[i][1] + '%';
    i++;
    setTimeout(tick, 200);
  };
  tick();
}

function init() {
  layout();
  setupTouch();
  bindTouchControls();
  game.onToast = (m) => toast(m, 'info');
  game.onMeta = () => { syncDialogue(); syncHud(); refreshSceneLabel(); };

  /* pemilih babak misi */
  game.onQuestOpen = (prof, options) => showChapterPicker(prof, options);

  /* Scene 10: pilihan spesialisasi saat pertama kali masuk Lantai 3 */
  game.onSpecialization = (profs) => {
    const body = el('div');
    body.appendChild(el('div', { class: 'callout note', text: 'Selamat, kamu sudah masuk jenjang spesialisasi. Pilih satu divisi untuk ditekuni lebih dulu - kamu tetap bebas mencoba keempatnya.' }));
    const list = el('div', { class: 'spec-grid' });
    profs.forEach((p) => {
      const card = el('button', { class: 'spec-card' }, [
        el('div', { class: 'sign', text: p.name.toUpperCase() }),
        el('div', { class: 'nm', text: p.alias }),
        el('div', { class: 'muted small', text: p.duty })
      ]);
      const icon = iconCanvas(p.icon, 2);
      icon.className = 'spec-icon';
      card.insertBefore(icon, card.firstChild);
      card.onclick = () => {
        Sound.sfx('click');
        game.markSpecializationSeen();
        closeModal();
        const q = (game.map.quests || []).find((x) => x.prof === p.id);
        if (q) {
          game.player.x = q.x * 32 + 16;
          game.player.y = q.y * 32 + 34;
        }
        refreshSceneLabel();
        toast('Spesialisasi dipilih: ' + p.name + '. Selesaikan ketiga babaknya!', 'good');
      };
      list.appendChild(card);
    });
    body.appendChild(list);
    openModal({
      title: 'Pilihan Spesialisasi Baru',
      sub: 'Lantai 3 - Spesialisasi & Intelegensia',
      scene: SCENES.specialization,
      body,
      actions: [
        { label: 'JELAJAHI DULU', className: 'primary', onClick: () => { game.markSpecializationSeen(); closeModal(); refreshSceneLabel(); } }
      ]
    });
  };

  /* lift: pilih lantai */
  game.onElevator = (floors) => {
    const body = el('div');
    body.appendChild(el('p', { class: 'muted', text: 'Pilih lantai tujuan. Lantai terbuka setelah seluruh divisi di lantai sebelumnya tuntas dengan minimal Bintang 2.' }));
    const list = el('div', { class: 'quiz-opts' });
    floors.forEach((lvl) => {
      const stats = game.levelStats(lvl.id);
      const b = el('button', { class: 'quiz-opt', disabled: lvl.id === game.state.currentLevel });
      b.appendChild(el('div', { text: 'LANTAI ' + lvl.id + ' - ' + lvl.theme + (lvl.id === game.state.currentLevel ? ' (sekarang)' : '') }));
      b.appendChild(el('div', { class: 'muted', style: 'margin:4px 0 0; font-size:.72rem', text: stats.mastered + '/' + stats.profs.length + ' divisi tuntas · ' + lvl.professions.map((pid) => PROF_MAP[pid].name).join(', ') }));
      b.onclick = () => { Sound.sfx('click'); closeModal(); game.travelTo(lvl.id); };
      list.appendChild(b);
    });
    body.appendChild(list);
    openModal({
      title: 'Lift TechCorp', sub: 'Pindah lantai', body,
      actions: [{ label: 'BATAL', className: 'primary', onClick: () => closeModal() }]
    });
  };

  game.start();
  syncHud();
  syncDialogue();
  openTitle();
  refreshSceneLabel();
  requestAnimationFrame(uiLoop);
  boot();

  const unlock = () => { Sound.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  if (window.matchMedia && window.matchMedia('(orientation: portrait) and (max-width: 820px)').matches) {
    setTimeout(() => toast('Putar perangkat ke posisi mendatar agar area permainan lebih lega.', 'info', 4200), 1400);
  }
}

/* --------------------- PEMILIH BABAK MISI (UI) ------------------------- */
function showChapterPicker(prof, options) {
  const body = el('div');
  const mastered = game.isProfMastered(prof.id);
  body.appendChild(el('div', { class: 'ency-head' }, [
    iconCanvas(prof.icon, 2),
    el('div', {}, [
      el('div', { style: 'font-weight:700', text: prof.name + ' · ' + prof.alias }),
      el('div', { class: 'muted', style: 'margin:0', text: 'Mentor: ' + prof.npcName + ' · Lantai ' + prof.level + ' · ' + (game.starsOf(prof.id).map((s) => s ? '★'.repeat(s) : '☆').join(' ')) })
    ])
  ]));
  body.appendChild(el('p', { class: 'quest-brief', text: prof.duty }));
  const list = el('div', { class: 'quiz-opts' });
  options.forEach((o) => {
    const b = el('button', { class: 'quiz-opt', disabled: !o.unlocked });
    b.appendChild(el('div', { text: (o.idx + 1) + '. ' + o.title }));
    b.appendChild(el('div', {
      class: 'muted', style: 'margin:4px 0 0; font-size:.72rem',
      text: o.unlocked ? (MODE_LABEL[o.mode] + ' · ' + (o.stars ? '★'.repeat(o.stars) : 'belum selesai')) : 'TERKUNCI - selesaikan babak sebelumnya'
    }));
    b.onclick = () => { Sound.sfx('click'); closeModal(); startChapter(prof.id, o.idx); };
    list.appendChild(b);
  });
  body.appendChild(list);
  if (mastered) body.appendChild(el('div', { class: 'callout good', text: 'Semua babak divisi ini sudah lulus. Kamu boleh mengulang untuk mengejar bintang tiga.' }));
  else body.appendChild(el('div', { class: 'callout note', text: 'Target minimal Bintang 2 di setiap babak agar divisi ini dihitung tuntas dan lantai berikutnya terbuka.' }));

  openModal({
    title: 'Pilih Babak Misi',
    sub: 'Tiga mode: simulasi langkah, kuis pemahaman, dan susun alur kerja',
    scene: SCENES.mission,
    body,
    actions: [
      { label: 'KARTU PROFESI', onClick: () => { closeModal(); openEncyclopedia(prof.id); openScreen('#screen-ency'); } },
      { label: 'NANTI', className: 'primary', onClick: () => closeModal() }
    ]
  });
}

init();
