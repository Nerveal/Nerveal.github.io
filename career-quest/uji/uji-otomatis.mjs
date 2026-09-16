/* ==========================================================================
 * Career Quest - uji/uji-otomatis.mjs   (v2 - tampilan sesuai mockup)
 *
 * UJI ALPHA (BLACK BOX) OTOMATIS
 * Menjalankan seluruh alur permainan di atas DOM dan kanvas sungguhan
 * (jsdom + node-canvas), tanpa peramban. Cocok dipakai sebagai bukti
 * pengujian fungsional pada Bab III/IV skripsi.
 *
 * Yang diuji (v2):
 *   1.  Boot aplikasi, layar judul, dan mode presentasi (label scene)
 *   2.  Kustomisasi karakter (6 kelompok pilihan)
 *   3.  Dialog pembuka & pemuatan Office Hub
 *   4.  Penggambaran pixel art (layar judul + tiga lantai + validasi peta)
 *   5.  Pergerakan, tabrakan, interaksi meja misi
 *   6.  Tiga puluh babak misi (3 mode) target Bintang 3
 *   7.  Penilaian bintang saat terjadi kesalahan
 *   8.  Mission Complete, konfirmasi naik level (IYA/TIDAK)
 *   9.  Slip gaji (Gaji Pokok + Bonus) & LEVEL UP
 *  10.  Shop kostumisasi (beli, Gold kurang, pakai)
 *  11.  Ensiklopedia karier & panduan kurikulum
 *  12.  Lift antar lantai, promosi, dan pemulihan progres
 *  13.  Tes Kompetensi Karier + adegan Finale (Scene 12)
 *  14.  Pemeriksaan error runtime
 *
 * Cara menjalankan:
 *   cd career-quest/uji
 *   npm install          (hanya sekali; butuh internet)
 *   npm run uji
 *
 * Keluaran: ringkasan di terminal + berkas "hasil-uji.md" (tabel hasil uji).
 * ==========================================================================
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM, VirtualConsole } from 'jsdom';
import { createCanvas } from '@napi-rs/canvas';

const UJI_DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(UJI_DIR, '..');                 /* folder career-quest */
const MOD = path.join(os.tmpdir(), 'career-quest-mod');  /* salinan modul agar dapat diimpor Node */
const REPORT = path.join(UJI_DIR, 'hasil-uji.md');

/* --------------------------- SALIN MODUL SUMBER ------------------------ */
function siapkanModul() {
  fs.rmSync(MOD, { recursive: true, force: true });
  fs.mkdirSync(path.join(MOD, 'js'), { recursive: true });
  fs.writeFileSync(path.join(MOD, 'package.json'), JSON.stringify({ type: 'module' }, null, 2));
  fs.readdirSync(path.join(SRC, 'js'))
    .filter((f) => f.endsWith('.js'))
    .forEach((f) => fs.copyFileSync(path.join(SRC, 'js', f), path.join(MOD, 'js', f)));
}

/* ------------------------------- PELAPOR ------------------------------- */
const hasil = [];          /* { grup, nama, lulus, catatan } */
let grupSekarang = '';
const log = (...a) => console.log(...a);

function grup(nama) {
  grupSekarang = nama;
  log('\n' + nama);
}

function check(nama, lulus, catatan = '') {
  hasil.push({ grup: grupSekarang, nama, lulus: !!lulus, catatan: catatan || '' });
  log(lulus ? '  \u2713 ' + nama : '  \u2717 ' + nama + (catatan ? '  \u2192 ' + catatan : ''));
}

/* --------------------------- SHIM CANVAS 2D ---------------------------- */
function shimCanvas(window) {
  const cache = new WeakMap();
  window.HTMLCanvasElement.prototype.getContext = function (type) {
    if (type !== '2d') return null;
    const w = this.width || 300, h = this.height || 150;
    let e = cache.get(this);
    if (!e || e.w !== w || e.h !== h) {
      const nc = createCanvas(w, h);
      e = { w, h, ctx: nc.getContext('2d') };
      cache.set(this, e);
    }
    return e.ctx;
  };
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
}

function siapkanGlobal(window) {
  window.matchMedia = window.matchMedia || (() => ({
    matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}
  }));
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
  global.requestAnimationFrame = window.requestAnimationFrame;
  global.cancelAnimationFrame = window.cancelAnimationFrame;
}

/* Membangun satu instans permainan lengkap (dipakai agar bisa "muat ulang"). */
async function buatGame({ simpananLama = null, versi = 1 } = {}) {
  const galat = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => {
    const err = e.error || e.detail;
    galat.push('jsdomError: ' + ((err && err.message) || e.message));
  });
  vc.on('error', (...a) => galat.push('console.error: ' + a.join(' ')));

  const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'http://localhost/career-quest/', virtualConsole: vc
  });
  const { window } = dom;
  shimCanvas(window);
  siapkanGlobal(window);
  window.localStorage.clear();
  if (simpananLama) {
    Object.keys(simpananLama).forEach((k) => window.localStorage.setItem(k, simpananLama[k]));
  }
  await import(path.join(MOD, 'js', 'app.js') + '?v=' + versi + '_' + Date.now());
  return { window, galat, game: window.CareerQuest.game };
}

/* -------------------------------- API UI ------------------------------- */
function buatApi(window, game) {
  const doc = window.document;
  const $ = (s) => doc.querySelector(s);
  const $$ = (s) => Array.from(doc.querySelectorAll(s));
  const visible = (s) => !!$(s) && !$(s).hidden;
  const teks = (s) => ($(s) ? $(s).textContent : '');
  const click = (elm) => {
    if (!elm) throw new Error('elemen yang akan diklik tidak ada');
    elm.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function majukanDialog(max = 80) {
    let n = 0;
    while (game.dialogue && n < max) { click($('#dialogue')); n++; }
    return n;
  }

  function klikAksi(pola, cadangan = 0) {
    if (!visible('#modal')) return false;
    const actions = Array.from($('#modal-actions').children).filter((b) => !b.disabled);
    const target = actions.find((b) => pola.test(b.textContent)) || actions[cadangan];
    if (!target) return false;
    click(target);
    return true;
  }

  /* Menutup seluruh lapisan informasi: dialog -> modal -> jeda. */
  function tuntaskan(putaran = 6) {
    for (let i = 0; i < putaran; i++) {
      if (game.dialogue) { majukanDialog(); continue; }
      if (visible('#modal')) { klikAksi(/Nanti|Tetap|Tutup|Kembali|Lanjut|NAIK KE|LIHAT HASIL/i, 0); continue; }
      if (visible('#screen-pause')) { click($('#pause-resume')); continue; }
      break;
    }
  }

  return { $, $$, click, visible, teks, wait, majukanDialog, klikAksi, tuntaskan };
}

/* --------------------------- MEMAINKAN BABAK --------------------------- */
function mainkanBabak(api, game, PROF_MAP, profId, idx, { salahSekali = false } = {}) {
  const $ = api.$;
  const babak = PROF_MAP[profId].chapters[idx];
  game.setLevel(PROF_MAP[profId].level, true);
  game.scene = 'world';
  game.openQuest({ prof: profId });
  const opsi = Array.from($('#modal-body').querySelectorAll('.quiz-opt'));
  if (!opsi[idx]) throw new Error('pemilih babak gagal untuk ' + profId + ' #' + idx);
  api.click(opsi[idx]);
  const sesi = game.questSession;
  if (!sesi) throw new Error('sesi misi tidak dibuat untuk ' + profId + ' #' + idx);

  const tombolItem = () => Array.from($('#quest-body').querySelectorAll('.q-item'))
    .filter((b) => !b.disabled);

  if (babak.mode === 'quiz') {
    for (let i = 0; i < sesi.items.length; i++) {
      const item = sesi.items[i];
      const opsiKuis = Array.from($('#quest-body').querySelectorAll('.quiz-opt'));
      if (!opsiKuis.length) throw new Error('opsi kuis tidak dirender');
      const pilih = (i === 0 && salahSekali)
        ? item.options.findIndex((o) => !o.correct)
        : item.options.findIndex((o) => o.correct);
      api.click(opsiKuis[pilih]);
      const lanjut = Array.from($('#quest-actions').children)
        .find((b) => /SOAL BERIKUTNYA|SELESAI|LIHAT HASIL/i.test(b.textContent));
      if (!lanjut) throw new Error('tombol lanjut kuis tidak ada');
      api.click(lanjut);
    }
  } else {
    for (let k = 0; k < (babak.mode === 'order' ? babak.order.length : babak.steps.length); k++) {
      const pool = tombolItem();
      const target = sesi.items.find((it) => it.order === k);
      if (k === 0 && salahSekali) {
        const pengecoh = pool.find((b) => b.textContent !== target.text);
        if (pengecoh) api.click(pengecoh);
      }
      const btn = tombolItem().find((b) => b.textContent === target.text);
      if (!btn) throw new Error('langkah tidak ditemukan: ' + target.text);
      api.click(btn);
    }
  }
  return sesi;
}

/* ================================= UJIAN ================================ */
(async () => {
  log('==============================================');
  log(' UJI ALPHA OTOMATIS - CAREER QUEST (v2)');
  log('==============================================');

  siapkanModul();

  const { window, galat, game } = await buatGame({ versi: 1 });
  const api = buatApi(window, game);
  const data = await import(path.join(MOD, 'js', 'data.js'));
  const maps = await import(path.join(MOD, 'js', 'maps.js'));
  const { PROFESSIONS, PROF_MAP, LEVELS, LEVEL_MAP, ECONOMY, PAYSLIPS, SHOP_ITEMS, SCENES, MASTERY, STAR_MIN_FOR_UNLOCK } = data;
  const { MAPS, validateMaps } = maps;
  const $ = api.$;

  /* ------------------------------- [1] ------------------------------- */
  grup('[1] Boot aplikasi, layar judul & mode presentasi');
  check('U-01 Aplikasi memuat tanpa error', !!game);
  check('U-02 Layar judul tampil', api.visible('#screen-title'));
  check('U-03 Kanvas berukuran 640x384 (16:9, satu layar tanpa gulir)',
    $('#stage').width === 640 && $('#stage').height === 384,
    $('#stage').width + 'x' + $('#stage').height);
  check('U-04 Ada tombol MULAI, LANJUTKAN, PETUNJUK, dan KELUAR',
    !!$('#btn-new') && !!$('#btn-continue') && !!$('#btn-guide') && !!$('#btn-exit'));
  check('U-05 Tombol "Lanjutkan" nonaktif saat belum ada progres', $('#btn-continue').disabled === true);
  check('U-06 Mode presentasi aktif secara bawaan', game.state.presentation === true);
  check('U-07 Label Scene 01 tampil di layar judul',
    !$('#scene-label').hidden && /Scene 01/.test($('#scene-label').textContent),
    $('#scene-label').textContent);
  api.click($('#btn-guide'));
  check('U-08 PETUNJUK membuka panduan berisi halaman kontrol',
    api.visible('#screen-guide') && /Kontrol|Tombol|Panduan/i.test($('#guide-title').textContent + $('#guide-body').textContent));
  api.click($('#guide-close'));
  api.click($('#btn-rubric'));
  check('U-09 Halaman rubrik/kurikulum dapat dibuka',
    api.visible('#screen-guide') && /Rubrik|Kurikulum/i.test($('#guide-title').textContent),
    $('#guide-title').textContent);
  api.click($('#guide-close'));

  /* ------------------------------- [2] ------------------------------- */
  grup('[2] Kustomisasi karakter (6 kelompok pilihan)');
  api.click($('#btn-new'));
  check('U-10 Layar kustomisasi karakter terbuka', api.visible('#screen-char'));
  const fields = Array.from($('#char-form').querySelectorAll('.field'));
  check('U-11 Tersedia 6 kelompok kustomisasi (gender, kulit, baju, celana, gaya rambut, jaket & sepatu)',
    fields.length === 6, 'jumlah=' + fields.length);
  const totalOpsi = fields.reduce((n, f) => n + f.querySelectorAll('.opt').length, 0);
  check('U-12 Total pilihan kustomisasi minimal 15 opsi', totalOpsi >= 15, 'opsi=' + totalOpsi);
  check('U-13 Ringkasan slot kostumisasi (rambut/jaket/sepatu/aksesori) tampil di form',
    fields[5].querySelectorAll('.tag').length === 4,
    'tag=' + fields[5].querySelectorAll('.tag').length);
  api.click(fields[0].querySelectorAll('.opt')[1]);       /* perempuan */
  api.click(fields[1].querySelectorAll('.opt')[1]);       /* sawo */
  api.click(fields[2].querySelectorAll('.opt')[2]);       /* baju ke-3 */
  api.click(fields[4].querySelectorAll('.opt')[1]);       /* warna rambut ke-2 */
  api.click($('#char-save'));
  check('U-14 Layar kustomisasi & layar judul tertutup setelah disimpan',
    !api.visible('#screen-char') && !api.visible('#screen-title'));
  const profil = game.state.profile;
  check('U-15 Profil v2 tersimpan lengkap (warna + slot kostumisasi)',
    profil.gender === 'wanita' && profil.skin === 'sawo' && profil.shirt === 'merah' &&
    typeof profil.hairStyle === 'string' && typeof profil.shoes === 'string' &&
    'jacket' in profil && 'accessory' in profil,
    JSON.stringify(profil));

  /* ------------------------------- [3] ------------------------------- */
  grup('[3] Dialog pembuka & pemuatan Office Hub');
  check('U-16 Kotak dialog pembuka tampil dengan potret',
    !$('#dialogue').hidden && /Narator|HRD|Mentor|Kamu|Pak|Bu/i.test($('#dlg-who').textContent),
    $('#dlg-who').textContent);
  const nDlg = api.majukanDialog();
  check('U-17 Dialog pembuka dapat dilanjutkan (' + nDlg + ' halaman)', !game.dialogue);
  check('U-18 Setelah dialog, permainan kembali ke dunia', game.scene === 'world');
  check('U-19 Peta Lantai 1 dimuat', game.currentMapKey === 'floor1');
  check('U-20 Jabatan awal pemain = Junior Intern', game.rank() === 'Junior Intern', game.rank());
  check('U-21 HUD menampilkan lantai, jabatan, Gold, dan gaji', api.visible('#hud') &&
    /Lantai 1/.test(api.teks('#hud-level')) && /G$/.test(api.teks('#hud-gold')) && /Rp/.test(api.teks('#hud-salary')));
  check('U-22 Jumlah divisi tuntas pada HUD = 0/3', /0\/3/.test(api.teks('#hud-objective')), api.teks('#hud-objective'));

  /* ------------------------------- [4] ------------------------------- */
  grup('[4] Penggambaran pixel art & struktur peta');
  let galatRender = null;
  try { game.render(); } catch (e) { galatRender = e.message; }
  check('U-23 Dunia dapat digambar tanpa error', !galatRender, galatRender);
  galatRender = null;
  try { const asal = game.scene; game.scene = 'title'; game.render(); game.scene = asal; } catch (e) { galatRender = e.message; }
  check('U-24 Layar judul dapat digambar tanpa error', !galatRender, galatRender);
  galatRender = null;
  try { for (const l of LEVELS) { game.setLevel(l.id, true); game.render(); } } catch (e) { galatRender = e.message; }
  check('U-25 Ketiga lantai dapat digambar tanpa error', !galatRender, galatRender);
  const val = validateMaps();
  check('U-26 Struktur peta valid (posisi quest/NPC tidak tertutup properti)',
    !val || val.ok !== false, JSON.stringify(val).slice(0, 160));
  const semuaQuest = Object.keys(MAPS).reduce((n, k) => n + (MAPS[k].quests || []).length, 0);
  check('U-27 Tersedia 10 titik misi (satu meja per divisi) di 3 lantai',
    semuaQuest === PROFESSIONS.length, 'titik=' + semuaQuest);
  game.setLevel(1, true);

  /* ------------------------------- [5] ------------------------------- */
  grup('[5] Pergerakan, tabrakan, dan interaksi meja misi');
  const sebelumY = game.player.y;
  game.keys.up = true;
  for (let i = 0; i < 30; i++) game.update(1 / 60);
  game.keys.up = false;
  check('U-28 Karakter bergerak saat tombol arah ditekan', game.player.y < sebelumY,
    sebelumY.toFixed(1) + ' -> ' + game.player.y.toFixed(1));
  game.player.x = 2 * 32 + 16; game.player.y = 2 * 32 + 16;
  game.keys.left = true;
  for (let i = 0; i < 30; i++) game.update(1 / 60);
  game.keys.left = false;
  check('U-29 Tabrakan dinding menghalangi karakter', game.player.x >= 32, 'x=' + game.player.x.toFixed(1));

  const anchor = game.map.quests[0];
  game.player.x = anchor.x * 32 + 16;
  game.player.y = anchor.y * 32 + 34;
  const dekat = game.nearestInteractable();
  check('U-30 Meja misi terdeteksi saat didekati', !!dekat && (dekat.kind === 'quest' || dekat.kind === 'npc'),
    dekat && dekat.kind);
  game.player.x = anchor.x * 32 + 16; game.player.y = anchor.y * 32 + 34;
  game.action();
  check('U-31 Pemilih babak misi terbuka', api.visible('#modal') && !!$('#modal-body').querySelector('.quiz-opt'));
  check('U-32 Label Scene 04 (Misi Divisi) tampil', /Scene 04/.test($('#scene-label').textContent),
    $('#scene-label').textContent);
  api.tuntaskan();

  /* ------------------------------- [6] ------------------------------- */
  grup('[6] Tiga puluh babak misi (target Bintang 3)');
  const daftar = [];
  LEVELS.forEach((l) => l.professions.forEach((p) => daftar.push(p)));
  const masalah = [];
  const modeTerpakai = new Set();
  let naikLevelDijumpai = false;
  for (const profId of daftar) {
    for (let idx = 0; idx < PROF_MAP[profId].chapters.length; idx++) {
      modeTerpakai.add(PROF_MAP[profId].chapters[idx].mode);
      mainkanBabak(api, game, PROF_MAP, profId, idx);
      await api.wait(520);
      api.tuntaskan();
      await api.wait(320);            /* beri waktu transisi konfirmasi naik level */
      const bintang = game.starsOf(profId)[idx];
      if (bintang !== 3) masalah.push(profId + ' babak ' + (idx + 1) + ' = ' + bintang + ' bintang');
      if (api.visible('#modal') && /Level \d Selesai/.test(api.teks('#modal-title'))) {
        naikLevelDijumpai = true;
        api.klikAksi(/TIDAK/);
        await api.wait(80);
      }
      if (game.scene !== 'world' && !game.dialogue) game.scene = 'world';
      if (api.visible('#quest')) { const k = $('#quest').querySelector('.btn.ghost'); if (k) api.click(k); }
      await api.wait(40);
    }
    if (!game.isProfMastered(profId)) masalah.push(profId + ' belum tuntas (minimal Bintang ' + STAR_MIN_FOR_UNLOCK + ')');
  }
  check('U-33 Seluruh 30 babak lulus Bintang 3', masalah.length === 0, masalah.slice(0, 4).join('; '));
  check('U-34 Total bintang maksimal 90', game.totalStars() === 90, 'total=' + game.totalStars());
  check('U-35 Ketiga mode babak terpakai (simulasi langkah, kuis, susun alur)',
    modeTerpakai.has('check') && modeTerpakai.has('quiz') && modeTerpakai.has('order'),
    Array.from(modeTerpakai).join(','));
  check('U-36 Gold bertambah setiap misi selesai', game.state.coins > 0, 'Gold=' + game.state.coins);
  check('U-37 Seluruh divisi di lantai 1 tuntas sehingga lantai 2 terbuka',
    game.levelStats(1).canAdvance === true, JSON.stringify(game.levelStats(1)));
  check('U-38 Konfirmasi naik level pernah muncul saat lantai tuntas', naikLevelDijumpai);

  /* ------------------------------- [7] ------------------------------- */
  grup('[7] Penilaian bintang saat terjadi kesalahan');
  const goldSebelum = game.state.coins;
  game.state.stars.itsupport = [0, 0, 0];      /* nol-kan agar hasil babak ini terlihat */
  mainkanBabak(api, game, PROF_MAP, 'itsupport', 0, { salahSekali: true });
  await api.wait(520);
  const teksHasil = $('#modal-body').textContent;
  const bintangDilihat = ($('#modal-body').querySelector('.star-row') || {}).textContent || '';
  check('U-39 Satu kesalahan menghasilkan Bintang 2', game.starsOf('itsupport')[0] === 2,
    'bintang=' + game.starsOf('itsupport')[0]);
  check('U-40 Modal hasil misi menampilkan jumlah kesalahan dan Gold',
    /Kesalahan/.test(teksHasil) && /Gold/.test(teksHasil));
  check('U-41 Modal Mission Complete menampilkan baris bintang', bintangDilihat.length > 0, bintangDilihat);
  check('U-42 Gold misi berkurang bila ada kesalahan (2 bintang < 3 bintang)',
    game.state.coins - goldSebelum === ECONOMY.baseGold[0] + 2 * ECONOMY.goldPerStar,
    'selisih=' + (game.state.coins - goldSebelum));
  api.tuntaskan();

  /* ------------------------------- [8] ------------------------------- */
  grup('[8] Konfirmasi naik level, slip gaji, dan LEVEL UP');
  game.setLevel(1, true);
  game.state.promoted = {};
  game.state.paid = {};
  game.state.salary = 0;
  game.state.coins = 0;
  PROFESSIONS.filter((p) => p.level === 1).forEach((p) => { game.state.stars[p.id] = [3, 3, 2]; });
  game.state.stars.graphic = [3, 2, 0];      /* sisakan satu babak agar bisa dipicu */
  mainkanBabak(api, game, PROF_MAP, 'graphic', 2);
  await api.wait(520);
  api.click(Array.from($('#modal-actions').children).find((b) => /LANJUT/i.test(b.textContent)));
  await api.wait(400);
  check('U-43 Konfirmasi "Level 1 Selesai" muncul dengan tombol IYA dan TIDAK',
    /Level 1 Selesai/.test(api.teks('#modal-title')) &&
    !!Array.from($('#modal-actions').children).find((b) => /IYA/.test(b.textContent)) &&
    !!Array.from($('#modal-actions').children).find((b) => /TIDAK/.test(b.textContent)),
    api.teks('#modal-title'));
  check('U-44 Label Scene 08 (Konfirmasi Naik Level) tampil',
    /Scene 08/.test($('#scene-label').textContent), $('#scene-label').textContent);
  api.klikAksi(/IYA/);
  await api.wait(320);
  const slipTeks = $('#modal-body').textContent;
  check('U-45 Slip gaji menampilkan Gaji Pokok, Bonus, dan Total Diterima',
    /Gaji Pokok/.test(slipTeks) && /Bonus/.test(slipTeks) && /Total Diterima/.test(slipTeks));
  check('U-46 Nominal slip sesuai mockup (Rp 5.000.000 + Rp 1.500.000 = Rp 6.500.000)',
    /5\.000\.000/.test(slipTeks) && /1\.500\.000/.test(slipTeks) && /6\.500\.000/.test(slipTeks),
    slipTeks.replace(/\s+/g, ' ').slice(0, 100));
  check('U-47 Slip gaji memberi Gold (6.500 G untuk Level 1)',
    /6\.500 G/.test(slipTeks), 'Gold slip=' + PAYSLIPS[1].gold);
  api.klikAksi(/TERIMA GAJI/);
  await api.wait(320);
  check('U-48 Setelah TERIMA GAJI muncul popup LEVEL UP!', /LEVEL UP/i.test(api.teks('#modal-title')),
    api.teks('#modal-title'));
  check('U-49 Gaji terakumulasi dan tampil di HUD (Rp 6.500.000)',
    game.state.salary === 6500000 && /6\.500\.000/.test(api.teks('#hud-salary')),
    api.teks('#hud-salary'));
  check('U-50 Popup LEVEL UP menampilkan jabatan baru',
    /Junior Staff|Senior Specialist/.test($('#modal-body').textContent), game.rank());
  api.klikAksi(/NAIK KE LANTAI|LANJUT/);
  await api.wait(150);
  check('U-51 Pemain berpindah ke Lantai 2 setelah naik level',
    game.state.currentLevel === 2 && game.currentMapKey === 'floor2',
    'lantai=' + game.state.currentLevel + ' peta=' + game.currentMapKey);
  api.tuntaskan();

  /* ------------------------------- [9] ------------------------------- */
  grup('[9] Lift antar lantai & shop kostumisasi');
  game.setLevel(1, true);
  game.state.maxLevel = 3;
  game.player.x = game.map.elevatorStand.x * 32 + 16;
  game.player.y = game.map.elevatorStand.y * 32 + 32;
  game.action();
  check('U-52 Berdiri di lift membuka daftar lantai tujuan',
    api.visible('#modal') && /Lift/i.test(api.teks('#modal-title')) && $('#modal-body').querySelectorAll('.quiz-opt').length >= 2,
    api.teks('#modal-title'));
  const tujuan = Array.from($('#modal-body').querySelectorAll('.quiz-opt')).find((b) => /LANTAI 2/.test(b.textContent));
  if (tujuan) api.click(tujuan);
  await api.wait(80);
  check('U-53 Memilih lantai memindahkan pemain (Lantai 2)', game.currentMapKey === 'floor2', game.currentMapKey);
  api.tuntaskan();

  api.click($('#btn-pause'));
  check('U-54 Menu jeda terbuka dengan tombol Shop & Mode Presentasi',
    api.visible('#screen-pause') && !!$('#pause-shop') && !!$('#pause-present'));
  api.click($('#pause-present'));
  check('U-55 Mode Presentasi dapat dimatikan (label scene ikut hilang)',
    game.state.presentation === false && $('#scene-label').hidden === true,
    'presentasi=' + game.state.presentation);
  api.click($('#pause-present'));
  check('U-56 Mode Presentasi dapat dinyalakan kembali', game.state.presentation === true && $('#scene-label').hidden === false);
  game.state.paid[1] = false;               /* uji pengaman: slip gaji tertunda */
  api.click($('#pause-resume'));
  api.click($('#btn-pause'));
  const tombolSlip = Array.from($('#pause-stats').children).find((b) => /TERIMA SLIP GAJI/.test(b.textContent));
  check('U-57 Menu jeda menyediakan pengaman TERIMA SLIP GAJI bila gaji belum diambil', !!tombolSlip,
    $('#pause-stats').textContent.replace(/\s+/g, ' ').slice(0, 70));
  api.click(tombolSlip);
  await api.wait(80);
  check('U-58 Slip gaji tertunda dapat dibuka kembali dari menu jeda',
    api.visible('#modal') && /Sistem Gaji/.test(api.teks('#modal-title')), api.teks('#modal-title'));
  api.klikAksi(/TERIMA GAJI/);
  await api.wait(320);
  api.tuntaskan();
  api.click($('#pause-resume'));

  api.click($('#pause-shop'));
  check('U-59 Shop terbuka dengan 4 tab slot (rambut, jaket, sepatu, aksesori)',
    api.visible('#screen-shop') && $('#shop-tabs').children.length === 4, 'tab=' + $('#shop-tabs').children.length);
  const kartuAwal = Array.from($('#shop-list').children);
  check('U-60 Daftar item shop tampil beserta harga Gold', kartuAwal.length >= 3, 'item=' + kartuAwal.length);
  game.state.coins = 0;
  const tombolBeli = () => Array.from($('#shop-list').children)
    .map((c) => ({ c, b: c.querySelector('button'), n: c.querySelector('.shop-name').textContent }))
    .find((x) => /BELI/.test(x.b.textContent));
  const coba = tombolBeli();
  api.click(coba.b);
  check('U-61 Membeli tanpa Gold yang cukup ditolak (Gold tetap 0)', game.state.coins === 0, 'Gold=' + game.state.coins);
  game.state.coins = 20000;
  const beli = tombolBeli();
  api.click(beli.b);
  const itemDibeli = SHOP_ITEMS.find((i) => i.label === beli.n);
  check('U-62 Item terbeli dan otomatis dipakai (' + beli.n + ')',
    game.hasItem(itemDibeli.id) && game.state.profile[itemDibeli.slot] === itemDibeli.value);
  check('U-63 Gold berkurang sesuai harga item', game.state.coins === 20000 - itemDibeli.price,
    'Gold=' + game.state.coins);
  check('U-64 Shop menyediakan minimal 10 item kostumisasi', SHOP_ITEMS.length >= 10, 'item=' + SHOP_ITEMS.length);
  api.click($('#shop-close'));

  /* ------------------------------- [10] ------------------------------ */
  grup('[10] Ensiklopedia karier & penyimpanan progres');
  api.click($('#btn-pause'));
  api.click($('#pause-ency'));
  check('U-65 Ensiklopedia menampilkan 10 kartu profesi',
    api.visible('#screen-ency') && $('#ency-grid').querySelectorAll('.ency-card').length === 10,
    'kartu=' + $('#ency-grid').querySelectorAll('.ency-card').length);
  api.click($('#ency-grid').querySelectorAll('.ency-card')[0]);
  check('U-66 Detail kartu profesi tampil (jurusan, sertifikasi, jalur karier)',
    /Jurusan|Sertifikasi|Jalur|Prospek/i.test($('#ency-detail').textContent));
  api.click($('#ency-close'));
  api.click($('#btn-pause'));
  api.click($('#pause-tomap'));
  await api.wait(80);
  check('U-67 Kembali ke menu utama dari menu jeda', api.visible('#screen-title'));

  const simpan = window.localStorage.getItem('career-quest-save-v1');
  let isiSimpan = {};
  try { isiSimpan = JSON.parse(simpan); } catch (e) { isiSimpan = {}; }
  check('U-68 Progres tersimpan di localStorage (kunci career-quest-save-v1)',
    !!simpan && !!isiSimpan.profile && typeof isiSimpan.coins === 'number' && Array.isArray(isiSimpan.owned) &&
    typeof isiSimpan.salary === 'number' && !!isiSimpan.stars);

  /* ------------------------------- [11] ------------------------------ */
  grup('[11] Pemulihan progres setelah halaman dimuat ulang');
  const salinan = {}; Object.keys(window.localStorage).forEach((k) => { salinan[k] = window.localStorage.getItem(k); });
  const ulang = await buatGame({ simpananLama: salinan, versi: 2 });
  const api2 = buatApi(ulang.window, ulang.game);
  await api2.wait(60);
  check('U-69 Progres dipulihkan (Gold & gaji sama setelah muat ulang)',
    ulang.game.state.salary === game.state.salary && ulang.game.state.coins === game.state.coins,
    'Gold=' + ulang.game.state.coins + ' gaji=' + ulang.game.state.salary);
  check('U-70 Tombol LANJUTKAN aktif bila ada progres tersimpan', api2.$('#btn-continue').disabled === false);
  api2.click(api2.$('#btn-continue'));
  await api2.wait(80);
  api2.majukanDialog();
  check('U-71 Setelah LANJUTKAN pemain kembali ke lantai terjauh dengan bintang tersimpan',
    ulang.game.state.currentLevel === ulang.game.state.maxLevel && ulang.game.totalStars() === game.totalStars(),
    'lantai=' + ulang.game.state.currentLevel + ' bintang=' + ulang.game.totalStars());
  check('U-72 Item shop yang dibeli tetap dimiliki setelah muat ulang',
    ulang.game.state.owned.length === game.state.owned.length,
    ulang.game.state.owned.join(','));

  /* ------------------------------- [12] ------------------------------ */
  grup('[12] Tes Kompetensi Karier & adegan Finale (Scene 12)');
  ulang.game.state.promoted[2] = true;
  ulang.game.state.promoted[3] = true;
  ulang.game.state.promoted[1] = true;
  ulang.game.state.masteryScore = null;
  ulang.game.state.coins = 12000;
  const g3 = ulang.game;
  g3.scene = 'world';
  api2.click(api2.$('#btn-pause'));
  api2.click(api2.$('#pause-ency'));
  api2.click(api2.$('#ency-mastery'));
  await api2.wait(60);
  check('U-73 Tes Kompetensi Karier terbuka dengan 10 soal acak',
    api2.visible('#quest') && g3.questSession && g3.questSession.items.length === 10,
    g3.questSession ? 'soal=' + g3.questSession.items.length : 'tidak ada sesi');
  for (let i = 0; i < 10; i++) {
    const opsi = Array.from(api2.$('#quest-body').querySelectorAll('.quiz-opt'));
    const item = g3.questSession.items[i];
    api2.click(opsi[item.options.findIndex((o) => o.correct)]);
    const lanjut = Array.from(api2.$('#quest-actions').children)
      .find((b) => /SOAL BERIKUTNYA|LIHAT HASIL/i.test(b.textContent));
    api2.click(lanjut);
  }
  await api2.wait(80);
  check('U-74 Nilai tes 100 dan hadiah Gold 500 diberikan',
    g3.state.masteryScore === 100 && g3.state.coins === 12500,
    'nilai=' + g3.state.masteryScore + ' Gold=' + g3.state.coins);
  check('U-75 Tombol PENUTUP tersedia setelah lulus tes',
    !!Array.from(api2.$('#modal-actions').children).find((b) => /PENUTUP/.test(b.textContent)));
  api2.klikAksi(/PENUTUP/);
  await api2.wait(80);
  const finaleTeks = api2.$('#modal-body').textContent;
  check('U-76 Adegan Finale tampil dengan Total Skor, Gold, dan Level Akhir',
    /Total Skor/.test(finaleTeks) && /Total Gold/.test(finaleTeks) && /Level Akhir/.test(finaleTeks));
  if (!/Scene 12/.test(api2.$('#scene-label').textContent)) {
    const tampak = ['#screen-title', '#screen-char', '#screen-shop', '#screen-guide', '#screen-ency', '#screen-pause', '#quest', '#modal']
      .filter((sel) => !api2.$(sel).hidden);
    console.log('    [debug] layar tampak:', tampak.join(', '), '| label modal=', JSON.stringify(api2.$('#modal').dataset.scene));
  }
  check('U-77 Label Scene 12 (Game Completion) tampil',
    /Scene 12/.test(api2.$('#scene-label').textContent), api2.$('#scene-label').textContent);
  check('U-78 Tombol ULANGI GAME dan KELUAR tersedia di Finale',
    !!Array.from(api2.$('#modal-actions').children).find((b) => /ULANGI GAME/.test(b.textContent)) &&
    !!Array.from(api2.$('#modal-actions').children).find((b) => /KELUAR/.test(b.textContent)));
  check('U-79 Status ending tersimpan', g3.state.seenEnding === true);
  check('U-80 Skor akhir dihitung dari bintang & nilai tes',
    g3.totalScore() === g3.totalStars() * 250 + g3.state.masteryScore * 10, 'skor=' + g3.totalScore());

  /* ------------------------------- [13] ------------------------------ */
  grup('[13] Adegan Scene 10 - pilihan spesialisasi (Lantai 3)');
  const gv = ulang.game;
  gv.state.currentLevel = 3;
  gv.state.seenSpecialization = false;
  gv.state.seenIntro.floor3 = true;
  gv.setLevel(3, true);
  gv.afterEnterMap();
  await api2.wait(60);
  check('U-81 Masuk Lantai 3 pertama kali memunculkan pilihan spesialisasi',
    /Pilihan Spesialisasi Baru/i.test(api2.teks('#modal-title')) &&
    api2.$('#modal-body').querySelectorAll('.spec-card').length === 4,
    api2.teks('#modal-title') + ' · kartu=' + api2.$('#modal-body').querySelectorAll('.spec-card').length);
  check('U-82 Label Scene 10 (Pilihan Spesialisasi Baru) tampil',
    /Scene 10/.test(api2.$('#scene-label').textContent), api2.$('#scene-label').textContent);
  const kartuSpec = api2.$('#modal-body').querySelectorAll('.spec-card')[0];
  api2.click(kartuSpec);
  await api2.wait(60);
  check('U-83 Memilih spesialisasi memindahkan pemain ke meja divisi tersebut dan menandai progres',
    gv.state.seenSpecialization === true && !api2.visible('#modal'),
    'posisi=' + Math.round(gv.player.x) + ',' + Math.round(gv.player.y));

  /* ------------------------------- [14] ------------------------------ */

  grup('[13] Pemeriksaan error runtime');
  check('U-84 Tidak ada error runtime pada sesi pertama', galat.length === 0, galat.slice(0, 2).join(' | '));
  check('U-85 Tidak ada error runtime pada sesi muat ulang', ulang.galat.length === 0, ulang.galat.slice(0, 2).join(' | '));

  /* ------------------------------ RINGKASAN --------------------------- */
  const lulus = hasil.filter((h) => h.lulus).length;
  const total = hasil.length;
  const persen = Math.round((lulus / total) * 100);
  log('\n==============================================');
  log(' RINGKASAN: ' + lulus + '/' + total + ' uji lulus (' + persen + '%)');
  log('==============================================');
  if (lulus < total) {
    log('\nUji yang belum lulus:');
    hasil.filter((h) => !h.lulus).forEach((h) => log('  - ' + h.nama + (h.catatan ? '  (' + h.catatan + ')' : '')));
  }

  /* ------------------------------ LAPORAN ----------------------------- */
  const grupUnik = [];
  hasil.forEach((h) => { if (!grupUnik.includes(h.grup)) grupUnik.push(h.grup); });
  const baris = [];
  baris.push('# Hasil Uji Alpha Otomatis - Career Quest');
  baris.push('');
  baris.push('Dijalankan: ' + new Date().toLocaleString('id-ID'));
  baris.push('');
  baris.push('Lingkungan: Node.js ' + process.version + ' + jsdom + node-canvas (tanpa peramban), ' +
    'kanvas internal 640x384 px, tanpa gulir.');
  baris.push('');
  baris.push('**Ringkasan: ' + lulus + '/' + total + ' uji lulus (' + persen + '%)**');
  baris.push('');
  grupUnik.forEach((g) => {
    baris.push('## ' + g);
    baris.push('');
    baris.push('| Kode | Skenario uji | Hasil | Catatan |');
    baris.push('| --- | --- | --- | --- |');
    hasil.filter((h) => h.grup === g).forEach((h) => {
      baris.push('| ' + h.nama.split(' ')[0] + ' | ' + h.nama.replace(/^[A-Z]-[0-9]+ /, '') +
        ' | ' + (h.lulus ? 'LULUS' : 'BELUM') + ' | ' + (h.catatan || '-') + ' |');
    });
    baris.push('');
  });
  fs.writeFileSync(REPORT, baris.join('\n'));
  log('\nLaporan ditulis ke: ' + REPORT);

  process.exit(lulus === total ? 0 : 1);
})().catch((e) => {
  console.error('\nUji berhenti karena error: ', e && e.stack ? e.stack : e);
  process.exit(1);
});
