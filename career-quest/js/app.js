/* ==========================================================================
 * Career Quest - app.js
 * Lapisan antarmuka: layar judul, pembuatan karakter, HUD, kotak dialog,
 * mesin babak misi (simulasi langkah / kuis / susun alur), hasil misi,
 * promosi & gaji, ensiklopedia karier, panduan, dan Tes Kompetensi.
 * ==========================================================================
 */

import { Game, iconCanvas, formatRupiah, starString } from './game.js';
import { drawChar, drawLogoMark } from './art.js';
import {
  PROFESSIONS, PROF_MAP, LEVELS, LEVEL_MAP, HELP_PAGES, MASTERY,
  GENDERS, SKIN_TONES, SHIRT_COLORS, PANTS_COLORS,
  profileToChar, DEFAULT_PROFILE, HRD_CHAR
} from './data.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ============================== EFEK SUARA ============================== */
/* Dibangkitkan langsung dengan Web Audio API (tanpa berkas audio), agar
   aplikasi tetap ringan dan dapat dijalankan tanpa koneksi internet.        */
const Sound = {
  ctx: null,
  ready: false,
  muted: false,
  musicOn: false,
  musicTimer: null,
  step: 0,

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
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
      case 'level': [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone(f, 0.14, 'square', 0.05, i * 0.11)); break;
      case 'dialog': this.tone(400, 0.03, 'square', 0.02); break;
      default: break;
    }
  },

  /* BGM chiptune sederhana: melodi pentatonik + bas, berulang tiap 8 detik */
  startMusic() {
    this.musicOn = true;
    if (!this.ready || this.musicTimer) return;
    const melody = [523, 0, 587, 0, 659, 0, 523, 0, 440, 0, 523, 0, 659, 0, 587, 0];
    const bass = [131, 131, 165, 165, 175, 175, 147, 147];
    this.musicTimer = setInterval(() => {
      if (!this.musicOn || this.muted) return;
      const m = melody[this.step % melody.length];
      if (m) this.tone(m, 0.16, 'triangle', 0.028);
      if (this.step % 2 === 0) this.tone(bass[(this.step / 2) % bass.length], 0.22, 'square', 0.02);
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
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, ms - 300);
  setTimeout(() => el.remove(), ms);
}

/* ============================ KELOLA LAYAR ============================= */
const SCREENS = ['#screen-title', '#screen-char', '#screen-guide', '#screen-ency', '#screen-pause', '#quest', '#modal'];

function openScreen(sel) {
  const el = $(sel);
  el.hidden = false;
  el.scrollTop = 0;
  refreshPauseState();
}
function closeScreen(sel) {
  $(sel).hidden = true;
  refreshPauseState();
}
function anyScreenOpen() {
  return SCREENS.some((s) => !$(s).hidden);
}

/* ============================== MODAL ================================== */
function openModal(cfg) {
  $('#modal-title').textContent = cfg.title || '';
  const sub = $('#modal-sub');
  sub.textContent = cfg.sub || '';
  sub.hidden = !cfg.sub;
  const body = $('#modal-body');
  body.innerHTML = '';
  if (cfg.body) body.appendChild(cfg.body);
  const actions = $('#modal-actions');
  actions.innerHTML = '';
  (cfg.actions || [{ label: 'Tutup', onClick: () => closeModal() }]).forEach((a) => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.className || '');
    b.textContent = a.label;
    b.disabled = !!a.disabled;
    b.onclick = () => { Sound.sfx('click'); a.onClick && a.onClick(); };
    actions.appendChild(b);
  });
  openScreen('#modal');
  return { close: closeModal };
}
function closeModal() { closeScreen('#modal'); }

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

function statBox(k, v) {
  return el('div', { class: 'stat' }, [el('div', { class: 'k', text: k }), el('div', { class: 'v', text: v })]);
}

/* ============================== GAME INIT ============================== */
const canvas = $('#stage');
const game = new Game(canvas, {
  onMeta: () => { syncDialogue(); syncHud(); },
  onToast: (m) => toast(m, 'info')
});
window.CareerQuest = { game, Sound, toast };

function refreshPauseState() {
  game.paused = anyScreenOpen();
}

/* -------------------------- UKURAN PANGGUNG ---------------------------- */
const stagebox = $('#stagebox');
function layout() {
  const app = $('#app');
  const availW = app.clientWidth - 16;
  const availH = app.clientHeight - 16;
  const scale = Math.min(availW / 576, availH / 336);
  const w = Math.max(280, Math.floor(576 * scale));
  const h = Math.max(164, Math.floor(336 * scale));
  stagebox.style.width = w + 'px';
  stagebox.style.height = h + 'px';
}
window.addEventListener('resize', layout);
window.addEventListener('orientationchange', () => setTimeout(layout, 250));

/* --------------------------- TAMPILKAN SENTUH -------------------------- */
function setupTouch() {
  const touchish = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 ||
    window.matchMedia('(hover: none)').matches;
  $('#touch').hidden = !touchish;
}
setupTouch();

/* ============================== DIALOG ================================= */
let dlgView = { text: '', page: -1, startAt: 0, shown: 0, done: false, portrait: null };

function portraitCanvas(portrait, scale = 3) {
  const c = document.createElement('canvas');
  const w = 16 * scale, h = 22 * scale;
  c.width = 16; c.height = 22;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  if (portrait === 'logo') {
    c.width = 16; c.height = 16;
    drawLogoMark(g, 0, 0, 0.5);
  } else {
    const cfg = portrait === 'hrd' ? HRD_CHAR : (portrait && portrait.skin ? portrait : null);
    if (cfg) drawChar(g, cfg, 0, 0, { dir: 'down' });
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
    const portrait = page.portrait || dlg.opts.portrait ||
      (dlg.pages.find((p) => p.portrait) || {}).portrait;
    if (portrait) pc.appendChild(portraitCanvas(portrait, 3));
  }
  box.hidden = false;
  $('#dlg-text').textContent = dlgView.text.slice(0, dlgView.shown);
}

function advanceDialogue() {
  const dlg = game.dialogue;
  if (!dlg) return;
  if (!dlgView.done) {           /* selesaikan dulu animasi ketik */
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
function levelChipText(levelId) {
  const l = LEVEL_MAP[levelId];
  return 'Lantai ' + l.id + ' · ' + l.theme;
}

function syncHud() {
  const hud = $('#hud');
  hud.hidden = !(game.scene === 'world');
  if (hud.hidden) { $('#prompt').hidden = true; return; }
  const cur = game.state.currentLevel;
  const stats = game.levelStats(cur);
  $('#hud-level').textContent = levelChipText(cur);
  $('#hud-objective').textContent = game.rank() + ' · ' + stats.mastered + '/' + stats.profs.length + ' divisi tuntas';
  $('#hud-coins').textContent = game.state.coins.toLocaleString('id-ID') + ' koin';
  $('#hud-salary').textContent = 'Gaji ' + formatRupiah(game.state.salary);
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
    text = 'Misi ' + prof.name + (next >= 0 ? ' · babak ' + (next + 1) : ' · latihan ulang') + (game.isProfMastered(prof.id) ? ' (tuntas ✓)' : '');
  } else if (game.isAtElevator()) {
    const cur = game.state.currentLevel;
    text = cur < game.state.maxLevel ? 'Naik ke Lantai ' + (cur + 1) : (cur > 1 ? 'Turun ke Lantai ' + (cur - 1) : 'Lift terkunci - selesaikan misi lantai ini');
  }
  if (!text) { box.hidden = true; lastPrompt = ''; return; }
  if (text !== lastPrompt) { $('#prompt-text').textContent = text; lastPrompt = text; }
  box.hidden = false;
}

/* Ketuk area permainan = tombol aksi (untuk perangkat sentuh). */
canvas.addEventListener('pointerup', (e) => {
  Sound.unlock();
  if (game.scene === 'world' && !game.paused) game.action();
  else if (game.dialogue) advanceDialogue();
});

/* ============================ BABAK MISI =============================== */
const MODE_LABEL = { check: 'Simulasi Langkah', quiz: 'Kuis Pemahaman', order: 'Susun Alur Kerja' };

function startChapter(profId, idx) {
  Sound.unlock();
  const session = game.beginChapter(profId, idx);
  renderQuest(session);
  openScreen('#quest');
}

function renderQuest(session) {
  const prof = PROF_MAP[session.profId];
  const chapter = session.chapter;
  const iconHost = $('#quest-icon');
  iconHost.innerHTML = '';
  iconHost.appendChild(iconCanvas(prof.icon, 3));
  $('#quest-title').textContent = chapter.title;
  $('#quest-prof').textContent = prof.name + ' · babak ' + (session.idx + 1) + ' · ' + MODE_LABEL[chapter.mode];
  $('#quest-brief').textContent = chapter.brief;
  const actions = $('#quest-actions');
  actions.innerHTML = '';

  const errorsEl = $('#quest-errors');
  const showErrors = () => { errorsEl.textContent = 'Kesalahan: ' + session.errors; };

  const body = $('#quest-body');
  body.innerHTML = '';
  showErrors();

  if (session.mode === 'quiz') renderQuizBody(body, actions, session, showErrors);
  else if (session.mode === 'order') renderOrderBody(body, actions, session, showErrors);
  else renderCheckBody(body, actions, session, showErrors);

  actions.appendChild(el('button', {
    class: 'btn ghost',
    text: 'Keluar dari misi',
    onclick: () => {
      Sound.sfx('click');
      game.questSession = null;
      game.scene = 'world';
      closeScreen('#quest');
      toast('Misi dibatalkan. Progres babak tidak tersimpan.', 'bad');
    }
  }));
}

/* ----------------- Misi mode simulasi langkah (check) ------------------ */
function renderCheckBody(body, actions, session, showErrors) {
  const chapter = session.chapter;
  const total = chapter.steps.length;
  const pool = el('ul', { class: 'q-list' });
  const done = el('ul', { class: 'q-list' });

  body.appendChild(el('div', { class: 'q-cols' }, [
    el('div', {}, [el('div', { class: 'q-block-title', text: 'Pilih tindakan yang tepat, urut dari langkah pertama' }), pool]),
    el('div', {}, [el('div', { class: 'q-block-title', text: 'Prosedur yang sudah dijalankan' }), done])
  ]));
  const note = el('p', { class: 'hintline', text: 'Perhatian: ada tindakan pengecoh yang bukan bagian dari prosedur kerja.' });
  body.appendChild(note);

  session.items.forEach((item) => {
    const b = el('button', { class: 'q-item', text: item.text });
    b.onclick = () => {
      if (b.classList.contains('wrong') || b.classList.contains('done')) return;
      if (item.decoy) {
        session.errors++;
        b.classList.add('wrong');
        b.setAttribute('disabled', '');
        Sound.sfx('bad');
        toast('Tindakan itu tidak sesuai prosedur kerja.', 'bad', 2200);
        showErrors();
        return;
      }
      if (item.order === session.step) {
        session.step++;
        b.classList.add('done');
        b.disabled = true;
        const li = el('li', { class: 'q-item done' }, [el('span', { class: 'num', text: session.step + '.' }), item.text]);
        done.appendChild(li);
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

/* --------------------- Misi mode susun alur (order) -------------------- */
function renderOrderBody(body, actions, session, showErrors) {
  const chapter = session.chapter;
  const total = chapter.order.length;
  const slots = [];
  const slotList = el('ul', { class: 'q-list' });

  body.appendChild(el('div', { class: 'q-block-title', text: 'Susun urutan langkah ke dalam slot' }));
  body.appendChild(slotList);
  body.appendChild(el('div', { class: 'q-block-title', text: 'Pilihan langkah (klik untuk memasukkan)' , style: 'margin-top:12px' }));
  const pool = el('ul', { class: 'q-list' });
  body.appendChild(pool);

  for (let i = 0; i < total; i++) {
    const li = el('li', { class: 'q-slot' }, [el('span', { class: 'num', text: (i + 1) + '.' }), el('span', { text: '(belum diisi)' })]);
    slots.push(li);
    slotList.appendChild(li);
  }

  const hint = el('p', { class: 'hintline' });
  actions.appendChild(el('button', {
    class: 'btn',
    text: 'Petunjuk alur kerja',
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
  body.appendChild(hint);
}

/* ------------------------- Misi mode kuis (quiz) ----------------------- */
function renderQuizBody(body, actions, session, showErrors, opts = {}) {
  const items = session.items;
  const isMastery = !!opts.mastery;
  session.correctCount = 0;
  let idx = 0;

  function renderOne() {
    body.innerHTML = '';
    actions.innerHTML = '';
    const item = items[idx];
    const prog = el('div', { class: 'q-block-title', text: 'Soal ' + (idx + 1) + ' dari ' + items.length + (item.prof ? ' · ' + item.prof : '') });
    body.appendChild(prog);
    body.appendChild(el('div', { class: 'quiz-q', text: item.q }));
    const optsHost = el('div', { class: 'quiz-opts' });
    body.appendChild(optsHost);
    const feedback = el('div', { class: 'feedback', hidden: true });
    body.appendChild(feedback);

    let answered = false;
    item.options.forEach((opt) => {
      const b = el('button', { class: 'quiz-opt', text: opt.label });
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const right = opt.correct;
        if (!right) session.errors++;
        else session.correctCount++;
        Array.from(optsHost.children).forEach((child, i) => {
          child.disabled = true;
          if (item.options[i].correct) child.classList.add('correct');
        });
        if (!right) b.classList.add('wrong');
        feedback.className = 'feedback ' + (right ? 'good' : 'bad');
        feedback.hidden = false;
        feedback.textContent = (right ? 'Tepat! ' : 'Belum tepat. ') + item.why;
        Sound.sfx(right ? 'good' : 'bad');
        showErrors();
        actions.innerHTML = '';
        actions.appendChild(el('button', {
          class: 'btn primary',
          text: idx + 1 >= items.length ? (isMastery ? 'Lihat Hasil' : 'Selesaikan Misi') : 'Soal Berikutnya',
          onclick: () => {
            Sound.sfx('click');
            idx++;
            if (idx >= items.length) {
              if (isMastery) finishMastery(session);
              else finishChapter(session);
            } else renderOne();
          }
        }));
      };
      optsHost.appendChild(b);
    });
  }
  renderOne();
}

/* --------------------- PEMILIH BABAK MISI (UI) ------------------------- */
function showChapterPicker(prof, options) {
  const body = el('div');
  const mastered = game.isProfMastered(prof.id);
  body.appendChild(el('div', { style: 'display:flex; gap:10px; align-items:center; margin-bottom:8px' }, [
    iconCanvas(prof.icon, 3),
    el('div', {}, [
      el('div', { style: 'font-weight:700', text: prof.name + ' · ' + prof.alias }),
      el('div', { class: 'muted', style: 'margin:0', text: 'Mentor: ' + prof.npcName + ' · Lantai ' + prof.level + ' · ' + starText(prof.id) })
    ])
  ]));
  body.appendChild(el('p', { class: 'quest-brief', text: prof.duty }));
  const list = el('div', { class: 'quiz-opts' });
  options.forEach((o) => {
    const label = (o.idx + 1) + '. ' + o.title;
    const meta = MODE_LABEL[o.mode] + ' · ' + (o.stars ? '★'.repeat(o.stars) : 'belum selesai');
    const b = el('button', { class: 'quiz-opt', disabled: !o.unlocked });
    b.appendChild(el('div', { text: label }));
    b.appendChild(el('div', { class: 'muted', style: 'margin:4px 0 0; font-size:.72rem', text: o.unlocked ? meta : '🔒 Terkunci - selesaikan babak sebelumnya dulu' }));
    b.onclick = () => {
      Sound.sfx('click');
      closeModal();
      startChapter(prof.id, o.idx);
    };
    list.appendChild(b);
  });
  body.appendChild(list);
  if (mastered) body.appendChild(el('div', { class: 'callout good', text: 'Semua babak divisi ini sudah lulus. Kamu boleh mengulang untuk mengejar bintang tiga.' }));
  else body.appendChild(el('div', { class: 'callout note', text: 'Target minimal Bintang 2 di setiap babak agar divisi ini dihitung tuntas dan lantai berikutnya terbuka.' }));

  const actions = [];
  actions.push({ label: 'Lihat Kartu Profesi', onClick: () => { closeModal(); openEncyclopedia(prof.id); openScreen('#screen-ency'); } });
  actions.push({ label: 'Nanti saja', className: 'primary', onClick: () => closeModal() });
  openModal({ title: 'Pilih Babak Misi', sub: 'Setiap babak memiliki tingkat kesulitan berbeda', body, actions });
}

/* Mesin memanggil ini saat pemain berinteraksi dengan meja kerja / mentor. */
game.onQuestOpen = (prof, options) => showChapterPicker(prof, options);

/* --------------------------- LIFT / PINDAH LANTAI ----------------------- */
game.onElevator = (floors) => {
  const body = el('div');
  body.appendChild(el('p', { class: 'muted', text: 'Pilih lantai tujuan. Lantai terbuka setelah seluruh divisi di lantai sebelumnya tuntas dengan minimal Bintang 2.' }));
  const list = el('div', { class: 'quiz-opts' });
  floors.forEach((lvl) => {
    const stats = game.levelStats(lvl.id);
    const b = el('button', { class: 'quiz-opt', disabled: lvl.id === game.state.currentLevel });
    b.appendChild(el('div', { text: 'Lantai ' + lvl.id + ' - ' + lvl.theme + (lvl.id === game.state.currentLevel ? ' (sekarang)' : '') }));
    b.appendChild(el('div', { class: 'muted', style: 'margin:4px 0 0; font-size:.72rem', text: stats.mastered + '/' + stats.profs.length + ' divisi tuntas · ' + lvl.professions.map((pid) => PROF_MAP[pid].name).join(', ') }));
    b.onclick = () => {
      Sound.sfx('click');
      closeModal();
      game.travelTo(lvl.id);
    };
    list.appendChild(b);
  });
  body.appendChild(list);
  openModal({
    title: 'Lift TechCorp', sub: 'Pindah lantai', body,
    actions: [{ label: 'Batal', className: 'primary', onClick: () => closeModal() }]
  });
};

/* --------------------------- SELESAI BABAK ----------------------------- */
function finishChapter(session) {
  const result = game.finishChapter(session.errors);
  closeScreen('#quest');
  if (!result) return;
  const { prof, chapter, idx, stars, bestStars, reward, profDone, mastered, levelAdvanced } = result;
  if (stars > 0) Sound.sfx('star'); else Sound.sfx('bad');

  const body = el('div');
  body.appendChild(el('div', { class: 'star-row', text: starString(stars) }));
  body.appendChild(el('div', { class: 'muted', text: stars === 0
    ? 'Kamu belum lulus babak ini. Bintang minimal 2 dibutuhkan untuk membuka lantai berikutnya.'
    : 'Misi ' + prof.name + ' babak ' + (idx + 1) + ' selesai.' }));
  body.appendChild(el('div', { class: 'result-grid' }, [
    statBox('Kesalahan', String(session.errors)),
    statBox('Koin diperoleh', reward ? '+' + reward : '0'),
    statBox('Bintang terbaik', bestStars + '/3'),
    statBox('Total koin', String(game.state.coins))
  ]));
  if (chapter.followUp) body.appendChild(el('div', { class: 'callout note', text: chapter.followUp }));
  if (mastered && stars > 0) body.appendChild(el('div', { class: 'callout good', text: 'Divisi ' + prof.name + ' tuntas. Kartu profesi lengkap tersedia di Ensiklopedia Karier.' }));
  else if (profDone) body.appendChild(el('div', { class: 'callout good', text: 'Semua babak ' + prof.name + ' sudah dimainkan. Ulangi babak dengan bintang kurang dari 2 agar divisi ini dianggap tuntas.' }));
  if (stars > 0) {
    body.appendChild(el('div', { class: 'callout', text: 'Wawasan karier — ' + prof.name + ' (' + prof.alias + '). ' + prof.duty }));
    body.appendChild(el('div', { class: 'callout note', text: 'Jurusan kuliah terkait: ' + prof.study.join(', ') + '. Sertifikasi yang relevan: ' + prof.certs.join(', ') + '.' }));
    body.appendChild(el('div', { class: 'callout good', text: 'Jalur karier: ' + prof.careers.join(' › ') + '. Lihat kartu lengkapnya di Ensiklopedia Karier.' }));
  }

  const actions = [];
  actions.push({
    label: 'Ulangi Misi', className: '',
    onClick: () => { closeModal(); startChapter(prof.id, idx); }
  });
  actions.push({
    label: 'Lanjut', className: 'primary',
    onClick: () => {
      closeModal();
      if (levelAdvanced) { setTimeout(() => promotionScene(game.state.currentLevel), 260); }
      else { checkMasteryInvite(); }
    }
  });
  openModal({ title: stars > 0 ? 'Misi Selesai' : 'Misi Belum Lulus', sub: prof.name + ' · ' + chapter.title, body, actions });
}

/* ------------------------- PROMOSI & GAJI ------------------------------ */
const PROMO_STORY = {
  1: [
    { who: 'Bu Sekar (HRD)', text: 'Semua divisi di lantai satu sudah kamu jalani. Kerjamu rapi dan teliti.' },
    { who: 'Bu Sekar (HRD)', text: 'Kami menaikkan statusmu menjadi Junior Staff, lengkap dengan gaji bulanan pertamamu.' },
    { who: 'Anda', text: 'Terima kasih! Aku siap belajar di lantai berikutnya.' }
  ],
  2: [
    { who: 'Bu Nadia', text: 'Jaringan dan data perusahaan aman berkat kerjamu. Laporanmu sangat membantu.' },
    { who: 'Pak Herman', text: 'Junior Staff seperti kamu layak naik ke tingkat spesialis. Selamat atas promosinya!' },
    { who: 'Anda', text: 'Aku akan memilih spesialisasi yang paling sesuai minatku.' }
  ],
  3: [
    { who: 'Mas Aldi', text: 'Selamat! Kamu kini Senior Specialist di TechCorp.' },
    { who: 'Bu Kartika', text: 'Masih ada satu tahap terakhir: Tes Kompetensi Karier dari tim HRD. Ikuti untuk menguji pemahamanmu.' }
  ]
};

function promotionScene(levelId) {
  const lvl = LEVEL_MAP[levelId];
  game.openDialogue(PROMO_STORY[levelId] || PROMO_STORY[1], () => {
    syncDialogue();
    const promoted = game.promote(levelId);
    if (!promoted) { checkMasteryInvite(); return; }
    Sound.sfx('level');
    const body = el('div');
    body.appendChild(el('div', { class: 'star-row', text: 'NAIK JABATAN' }));
    body.appendChild(el('div', { class: 'result-grid' }, [
      statBox('Jabatan baru', levelId === 1 ? 'Junior Staff' : levelId === 2 ? 'Senior Specialist' : 'Career Explorer'),
      statBox('Lantai terbuka', levelId + 1 <= LEVELS.length ? 'Lantai ' + (levelId + 1) : 'Semua lantai'),
      statBox('Gaji bulanan', formatRupiah(lvl.salary)),
      statBox('Total gaji', formatRupiah(game.state.salary))
    ]));
    body.appendChild(el('div', { class: 'callout', text: 'Catatan belajar (aspek ekonomi / DSI): ' + lvl.salaryLabel + '. Tingkat tanggung jawab yang lebih tinggi berbanding lurus dengan penghasilan.' }));
    if (levelId === 1) body.appendChild(el('div', { class: 'callout good', text: 'Fitur kustomisasi penampilan kini terbuka di menu Jeda. Di lantai dua, kamu juga akan bertemu sistem gaji dan pilihan gaya karakter yang lebih lengkap.' }));
    const actions = [];
    if (levelId < LEVELS.length) {
      actions.push({
        label: 'Naik ke Lantai ' + (levelId + 1), className: 'primary',
        onClick: () => { closeModal(); game.travelTo(levelId + 1); }
      });
    } else {
      actions.push({
        label: 'Lanjut', className: 'primary',
        onClick: () => { closeModal(); checkMasteryInvite(true); }
      });
    }
    actions.push({ label: 'Tetap di lantai ini', onClick: () => { closeModal(); checkMasteryInvite(); } });
    openModal({ title: 'Promosi!', sub: lvl.name, body, actions });
  }, { portrait: 'hrd' });
  syncDialogue();
}

function allLevelsPromoted() {
  return LEVELS.every((l) => game.state.promoted[l.id]);
}

function checkMasteryInvite(force) {
  if (!allLevelsPromoted()) return;
  if (game.state.masteryScore != null) return;
  if (!force && $(`#modal`).hidden === false) return;
  openModal({
    title: 'Tes Kompetensi Karier Tersedia',
    sub: 'Dari tim HRD TechCorp',
    body: el('div', {}, [
      el('p', { class: 'muted', text: 'Semua divisi di tiga lantai sudah kamu selesaikan. Uji pemahamanmu tentang profesi informatika dengan 10 pertanyaan acak dari seluruh materi game. Nilai minimal kelulusan: ' + MASTERY.passScore + '.' }),
      el('div', { class: 'callout note', text: 'Tes ini juga bisa dibuka kapan saja dari menu Ensiklopedia Karier.' })
    ]),
    actions: [
      { label: 'Kerjakan Sekarang', className: 'primary', onClick: () => { closeModal(); startMastery(); } },
      { label: 'Nanti saja', onClick: () => closeModal() }
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
  $('#quest-icon').innerHTML = '';
  $('#quest-icon').appendChild(iconCanvas('ai', 3));
  $('#quest-title').textContent = MASTERY.title;
  $('#quest-prof').textContent = 'Gabungan 10 profesi · ' + items.length + ' soal acak';
  $('#quest-brief').textContent = MASTERY.brief;
  const actions = $('#quest-actions');
  actions.innerHTML = '';
  const errorsEl = $('#quest-errors');
  errorsEl.textContent = 'Kesalahan: 0';
  const body = $('#quest-body');
  body.innerHTML = '';
  renderQuizBody(body, actions, session, () => { errorsEl.textContent = 'Kesalahan: ' + session.errors; }, { mastery: true });
  actions.appendChild(el('button', { class: 'btn ghost', text: 'Tutup', onclick: () => { game.questSession = null; game.scene = 'world'; closeScreen('#quest'); } }));
  openScreen('#quest');
}

function finishMastery(session) {
  const total = session.items.length;
  game.questSession = null;
  const score = game.finishMastery(session.correctCount, total);
  closeScreen('#quest');
  const passed = score >= MASTERY.passScore;
  if (passed) Sound.sfx('level'); else Sound.sfx('bad');
  const body = el('div');
  body.appendChild(el('div', { class: 'star-row', text: score + ' / 100' }));
  body.appendChild(el('div', { class: 'result-grid' }, [
    statBox('Jawaban benar', session.correctCount + '/' + total),
    statBox('Kesalahan', String(session.errors)),
    statBox('Status', passed ? 'LULUS' : 'BELUM LULUS'),
    statBox('Nilai terbaik', String(game.state.masteryScore))
  ]));
  if (passed) {
    body.appendChild(el('div', { class: 'callout good', text: 'Selamat! Kamu lulus Tes Kompetensi Karier. Pemahamanmu tentang profesi bidang informatika sudah baik.' }));
  } else {
    body.appendChild(el('div', { class: 'callout', text: 'Nilai minimal ' + MASTERY.passScore + ' diperlukan untuk lulus. Pelajari kembali kartu profesi di Ensiklopedia Karier lalu coba lagi.' }));
  }
  const actions = [{ label: 'Ulangi Tes', onClick: () => { closeModal(); startMastery(); } }];
  if (passed) actions.push({ label: 'Lihat Penutup Cerita', className: 'primary', onClick: () => { closeModal(); endingScene(score); } });
  else actions.push({ label: 'Tutup', className: 'primary', onClick: () => closeModal() });
  openModal({ title: MASTERY.title, sub: 'Hasil akhir', body, actions });
}

function endingScene(score) {
  game.state.seenEnding = true;
  game.save();
  const body = el('div');
  body.appendChild(el('div', { class: 'callout', text: 'Setelah tiga bulan magang, kamu resmi menjadi ' + game.rank() + ' di TechCorp. Kamu sudah mencoba sepuluh profesi bidang informatika dan menemukan yang paling sesuai denganmu.' }));
  body.appendChild(el('div', { class: 'result-grid' }, [
    statBox('Total bintang', game.totalStars() + '/' + (PROFESSIONS.length * 3)),
    statBox('Koin dikumpulkan', game.state.coins.toLocaleString('id-ID')),
    statBox('Total gaji', formatRupiah(game.state.salary)),
    statBox('Nilai tes', score + '/100')
  ]));
  body.appendChild(el('div', { class: 'callout note', text: 'Langkah berikutnya ada di tanganmu: pilih jurusan kuliah atau sertifikasi yang sesuai dengan profesi favoritmu, lalu asah keterampilannya sejak sekarang.' }));
  body.appendChild(el('p', { class: 'muted', text: 'Terima kasih sudah memainkan Career Quest. Kamu dapat mengulang misi mana pun untuk mengejar bintang tiga sempurna.' }));
  openModal({
    title: 'Tamat - Karier Baru Dimulai',
    sub: 'Epilog Career Quest',
    body,
    actions: [{ label: 'Kembali ke Kantor', className: 'primary', onClick: () => { closeModal(); game.scene = 'world'; refreshPauseState(); } }]
  });
}

/* =========================== ENSIKLOPEDIA ============================== */
let encySelected = null;

function starText(profId) {
  const st = game.starsOf(profId);
  return st.map((s) => (s > 0 ? '★'.repeat(s) : '☆')).join(' ');
}

function openEncyclopedia(sel) {
  encySelected = sel || encySelected || PROFESSIONS[0].id;
  const grid = $('#ency-grid');
  grid.innerHTML = '';
  LEVELS.forEach((lvl) => {
    const header = el('div', { class: 'q-block-title', text: 'Lantai ' + lvl.id + ' · ' + lvl.theme, style: 'grid-column:1/-1; margin-top:6px' });
    grid.appendChild(header);
    lvl.professions.forEach((pid) => {
      const p = PROF_MAP[pid];
      const st = game.starsOf(p.id);
      const locked = st.every((s) => s === 0);
      const card = el('button', { class: 'ency-card' + (locked ? ' locked' : '') + (pid === encySelected ? ' active' : '') }, [
        el('div', { class: 'nm', text: p.name }),
        el('div', { class: 'lv', text: 'Lantai ' + p.level + ' · ' + p.alias }),
        el('div', { class: 'st', text: locked ? '🔒 belum dimainkan' : starText(p.id) })
      ]);
      card.onclick = () => {
        if (locked) { toast('Selesaikan minimal satu babak misi ' + p.name + ' untuk membuka kartunya.', 'bad'); return; }
        Sound.sfx('click');
        encySelected = pid;
        openEncyclopedia(pid);
      };
      grid.appendChild(card);
    });
  });

  const detail = $('#ency-detail');
  const p = PROF_MAP[encySelected];
  detail.innerHTML = '';
  const head = el('div', { style: 'display:flex; gap:10px; align-items:center' }, [
    iconCanvas(p.icon, 3),
    el('div', {}, [
      el('h3', { text: p.name }),
      el('div', { class: 'muted', style: 'margin:0', text: p.alias + ' · Mentor: ' + p.npcName + ' · Lantai ' + p.level })
    ])
  ]);
  detail.appendChild(head);
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
      el('span', { text: (unlocked ? (st ? '★'.repeat(st) : 'belum selesai') : '🔒 terkunci') })
    ]);
    if (unlocked && game.state.maxLevel >= p.level) {
      const go = el('button', { class: 'btn', text: 'Main', style: 'padding:3px 8px; font-size:.7rem' });
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
    ? (game.state.masteryScore != null ? 'Ulangi Tes Kompetensi (' + game.state.masteryScore + '/100)' : 'Tes Kompetensi Karier')
    : 'Tes Kompetensi (tuntaskan 3 lantai)';
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
      wrap.appendChild(el('p', { class: 'muted', text: 'Isi permainan dipetakan dari Capaian Pembelajaran Fase E (SK Kepala BSKAP No. 032/H/KR/2024) dan Tujuan Pembelajaran Bab 8 Buku Informatika Kelas X (Mushthofa dkk., 2019) — lihat Tabel 3.1 dan 3.2 skripsi.' }));
      const table = el('table', { class: 'data' });
      table.innerHTML = '<tr><th>Komponen Kurikulum</th><th>Implementasi dalam Game</th><th>Status</th></tr>';
      const rows = [
        ['Deskripsi Fase E: wawasan profesi informatika', 'Konsep RPG: pemain berperan sebagai staf magang (role-play) di 10 divisi', 'Terimplementasi'],
        ['Elemen Dampak Sosial Informatika (DSI) - aspek ekonomi', 'Sistem ekonomi: koin, gaji bulanan ilustratif, dan catatan belajar pada tiap promosi', 'Terimplementasi'],
        ['Tujuan Pembelajaran Bab 8: rencana studi lanjut & karier', 'Fitur Ensiklopedia Karier: jurusan kuliah, sertifikasi, dan jalur karier tiap profesi', 'Terimplementasi'],
        ['Elemen Praktik Lintas Bidang (PLB)', 'Misi 3 babak per profesi: urutan prosedur kerja, kuis konsep, dan dokumentasi solusi', 'Terimplementasi']
      ];
      rows.forEach((r) => {
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
      wrap.appendChild(el('p', { class: 'muted', text: 'Ringkasan kelayakan produk yang dihitung otomatis dari capaian pemain. Angka kemiripan asp/CP dihitung dari cakupan kompetensi, bukan skor validasi resmi. Untuk skor resmi, gunakan kuesioner pada Tabel 3.4-3.6 di skripsi.' }));
      const summaries = LEVELS.map((l) => {
        const s = game.levelStats(l.id);
        return {
          aspek: 'Lantai ' + l.id + ' - ' + l.theme,
          indikator: 'Cakupan profesi ' + l.professions.length + ' divisi · ' + (s.total / 3) + ' babak misi',
          capaian: Math.round((s.stars / (s.total * 3)) * 100),
          komponen: s.profs.map((p) => p.name).join(', ')
        };
      });
      const table = el('table', { class: 'data' });
      table.innerHTML = '<tr><th>Aspek</th><th>Indikator</th><th>Capaian bintang</th><th>Komponen</th></tr>';
      summaries.forEach((r) => {
        const tr = el('tr');
        tr.appendChild(el('td', { text: r.aspek }));
        tr.appendChild(el('td', { text: r.indikator }));
        tr.appendChild(el('td', { text: r.capaian + '%' }));
        tr.appendChild(el('td', { text: r.komponen }));
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
        statBox('Tingkat kualifikasi', tingkat)
      ]));
      wrap.appendChild(el('p', { class: 'muted', text: 'Konversi tingkat pencapaian mengikuti Tabel 3.8 (Sari dkk., 2024): 90-100% sangat tinggi, 75-89% tinggi, 65-74% cukup tinggi, 55-64% kurang tinggi, 0-54% sangat kurang tinggi.' }));
      return wrap;
    }
  });
  pages.push({
    title: 'Catatan Penelitian & Teknis',
    items: [
      'Produk dikembangkan mengikuti model MDLC Luther-Sutopo: Concept, Design, Material Collecting, Assembly, Testing, Distribution.',
      'Seluruh aset visual (pixel art) dan efek suara dibangkitkan secara prosedural (canvas + Web Audio API) sehingga aplikasi ringan, tanpa aset eksternal, dan dapat dijalankan offline.',
      'Materi 10 profesi diadaptasi dari Tabel 2.2 skripsi (Mushthofa dkk., 2019; Hamidli, 2023) dan dibagi ke dalam tiga tingkat level sesuai Tabel 3.2.',
      'Pengujian alpha (black box) mencakup: navigasi menu, pergerakan karakter dan tabrakan, interaksi NPC/meja misi, penilaian bintang, penghitungan koin/gaji, pembukaan level, penyimpanan progres, serta tampilan pada berbagai ukuran layar.',
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
  $('#guide-next').textContent = guidePage >= pages.length - 1 ? 'Selesai' : 'Berikutnya';
}

function openGuide(page) {
  guidePage = page || 0;
  renderGuide();
  openScreen('#screen-guide');
}
$('#guide-prev').onclick = () => { Sound.sfx('click'); if (guidePage > 0) { guidePage--; renderGuide(); } };
$('#guide-next').onclick = () => { Sound.sfx('click'); if (guidePage < guidancePages().length - 1) { guidePage++; renderGuide(); } else closeScreen('#screen-guide'); };
$('#guide-close').onclick = () => { Sound.sfx('click'); closeScreen('#screen-guide'); };

/* ======================= PEMBUATAN KARAKTER =========================== */
let draftProfile = Object.assign({}, DEFAULT_PROFILE);

function drawCharPreview() {
  const c = $('#char-canvas');
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = '#1c2030';
  g.fillRect(0, 0, c.width, c.height);
  const cfg = profileToChar(draftProfile);
  drawChar(g, cfg, 16, 14, { dir: 'down' });
  drawChar(g, cfg, 60, 14, { dir: 'right', moving: true, step: 1 });
  drawChar(g, cfg, 16, 76, { dir: 'left', moving: true, step: 3 });
  drawChar(g, cfg, 60, 76, { dir: 'up' });
}

function renderCharForm() {
  const form = $('#char-form');
  form.innerHTML = '';
  const gender = GENDERS.find((x) => x.id === draftProfile.gender) || GENDERS[0];

  function field(label, options, key, render) {
    const opts = el('div', { class: 'opts' });
    options.forEach((o, i) => {
      const b = el('button', { class: 'opt', 'aria-pressed': String(draftProfile[key] === (o.id != null ? o.id : i)) });
      if (render) b.innerHTML = render(o);
      else b.textContent = o.label;
      b.onclick = () => {
        draftProfile[key] = o.id != null ? o.id : i;
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
  form.appendChild(field('Gaya rambut', gender.hairOptions.map((h, i) => ({ id: i, label: 'Model ' + (i + 1), hair: h })), 'hair',
    (o) => '<span class="swatch" style="background:' + o.hair + '"></span>Model ' + (o.id + 1)));
  form.appendChild(field('Warna baju', SHIRT_COLORS, 'shirt',
    (o) => '<span class="swatch" style="background:' + o.top + '"></span>' + o.label));
  form.appendChild(field('Warna celana', PANTS_COLORS, 'pants',
    (o) => '<span class="swatch" style="background:' + o.pants + '"></span>' + o.label));
}

let charMode = 'new';   /* new | edit */

function openCharCreator(mode) {
  charMode = mode;
  if (mode === 'edit') draftProfile = Object.assign({}, game.state.profile);
  renderCharForm();
  drawCharPreview();
  $('#char-save').textContent = mode === 'edit' ? 'Simpan Penampilan' : 'Mulai Bertugas';
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
    game.state.profile = Object.assign({}, draftProfile);
    game.save();
    closeScreen('#screen-char');
    toast('Penampilan karakter diperbarui.', 'good');
    return;
  }
  closeScreen('#screen-char');
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
    $('#title-meta').textContent = 'Belum ada progres tersimpan. Pilih "Mulai Baru" untuk memainkan seluruh 10 profesi informatika.';
    return;
  }
  continueBtn.disabled = false;
  const stars = PROFESSIONS.reduce((acc, p) => acc + ((s.stars && s.stars[p.id]) || [0, 0, 0]).reduce((a, b) => a + b, 0), 0);
  const lvl = LEVEL_MAP[s.maxLevel] || LEVEL_MAP[1];
  $('#title-meta').textContent = 'Progres tersimpan: ' + lvl.name + ' · ' + stars + '/' + (PROFESSIONS.length * 3) + ' bintang · ' + (s.coins || 0) + ' koin';
}

function openTitle() {
  titleMeta();
  openScreen('#screen-title');
}

function pauseStats() {
  const totalStars = game.totalStars();
  const stats = game.levelStats(game.state.currentLevel);
  $('#pause-stats').innerHTML = '';
  const grid = el('div', { class: 'result-grid' });
  grid.appendChild(statBox('Jabatan', game.rank()));
  grid.appendChild(statBox('Lantai', String(game.state.currentLevel)));
  grid.appendChild(statBox('Divisi tuntas', stats.mastered + '/' + stats.profs.length));
  grid.appendChild(statBox('Total bintang', totalStars + '/' + (PROFESSIONS.length * 3)));
  grid.appendChild(statBox('Total gaji', formatRupiah(game.state.salary)));
  $('#pause-stats').appendChild(grid);
}

$('#btn-new').onclick = () => {
  Sound.sfx('click');
  let hasSave = false;
  try { hasSave = !!localStorage.getItem('career-quest-save-v1'); } catch (e) { hasSave = false; }
  if (!hasSave) { openCharCreator('new'); return; }
  openModal({
    title: 'Mulai Permainan Baru?',
    sub: 'Progres yang tersimpan akan digantikan',
    body: el('p', { class: 'muted', text: 'Kamu sudah memiliki progres tersimpan. Memulai permainan baru akan mereset bintang, koin, dan gaji. Gunakan tombol "Lanjutkan" untuk melanjutkan permainan sebelumnya.' }),
    actions: [
      { label: 'Ya, mulai baru', className: 'danger', onClick: () => { closeModal(); openCharCreator('new'); } },
      { label: 'Batal', className: 'primary', onClick: () => closeModal() }
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
$('#btn-rubric').onclick = () => { Sound.sfx('click'); openGuide(3); };   /* pemetaan kurikulum & rubrik */

$('#btn-pause').onclick = () => { Sound.sfx('click'); game.paused = true; pauseStats(); openScreen('#screen-pause'); };
$('#btn-book').onclick = () => { Sound.sfx('click'); openEncyclopedia(); openScreen('#screen-ency'); };

$('#pause-resume').onclick = () => { Sound.sfx('click'); closeScreen('#screen-pause'); };
$('#pause-guide').onclick = () => { Sound.sfx('click'); openGuide(0); };
$('#pause-ency').onclick = () => { Sound.sfx('click'); openEncyclopedia(); openScreen('#screen-ency'); };
$('#pause-char').onclick = () => {
  if (game.state.maxLevel < 2) {
    toast('Kustomisasi penampilan terbuka setelah kamu naik jabatan di Lantai 2.', 'bad');
    return;
  }
  Sound.sfx('click');
  openCharCreator('edit');
};
$('#pause-sound').onclick = () => {
  Sound.muted = !Sound.muted;
  $('#pause-sound').textContent = 'Suara: ' + (Sound.muted ? 'Mati' : 'Aktif');
  if (!Sound.muted) Sound.sfx('ok');
};
$('#pause-music').onclick = () => {
  Sound.unlock();
  if (Sound.musicOn) { Sound.stopMusic(); $('#pause-music').textContent = 'Musik: Mati'; }
  else { Sound.startMusic(); $('#pause-music').textContent = 'Musik: Aktif'; }
};
$('#pause-reset').onclick = () => {
  openModal({
    title: 'Ulang Progres?',
    sub: 'Semua bintang, koin, dan gaji akan dihapus',
    body: el('p', { class: 'muted', text: 'Tindakan ini tidak bisa dibatalkan. Game akan dimulai kembali dari lantai satu.' }),
    actions: [
      { label: 'Ya, hapus', className: 'danger', onClick: () => { closeModal(); closeScreen('#screen-pause'); game.resetAll(); syncHud(); } },
      { label: 'Batal', className: 'primary', onClick: () => closeModal() }
    ]
  });
};
$('#pause-tomap').onclick = () => {
  Sound.sfx('click');
  closeScreen('#screen-pause');
  game.scene = 'title';
  game.paused = false;
  openTitle();
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!game.dialogue && !$('#screen-pause').hidden) closeScreen('#screen-pause');
  }
});

/* ============================== LOOP UI =============================== */
function uiLoop(now) {
  /* animasi mesin tik dialog */
  const dlg = game.dialogue;
  if (dlg && !dlgView.done) {
    const target = Math.floor((now - dlgView.startAt) / 18);
    if (target > dlgView.shown) {
      dlgView.shown = target;
      const txt = dlgView.text;
      $('#dlg-text').textContent = txt.slice(0, dlgView.shown);
      if (dlgView.shown >= txt.length) dlgView.done = true;
    }
  }
  syncPrompt();
  requestAnimationFrame(uiLoop);
}

/* ================================ BOOT ================================ */
function boot() {
  const msg = $('#boot-msg');
  const bar = $('.boot-bar span');
  const steps = [
    ['Memuat palet & aset pixel art…', 25],
    ['Menyusun peta lantai kantor…', 50],
    ['Menyiapkan 10 kartu profesi…', 75],
    ['Menghubungkan sistem misi…', 92],
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
    setTimeout(tick, 220);
  };
  tick();
}

function init() {
  layout();
  game.onToast = (m) => toast(m, 'info');
  game.onMeta = () => { syncDialogue(); syncHud(); };
  game.start();
  syncHud();
  syncDialogue();
  titleMeta();
  openTitle();
  requestAnimationFrame(uiLoop);
  boot();

  /* suara dibuka pada interaksi pertama (kebijakan autoplay peramban) */
  const unlock = () => { Sound.unlock(); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  /* petunjuk orientasi untuk ponsel */
  if (window.matchMedia('(orientation: portrait) and (max-width: 820px)').matches) {
    setTimeout(() => toast('Putar perangkat ke posisi mendatar agar area permainan lebih lega.', 'info', 4200), 1400);
  }
}

init();
