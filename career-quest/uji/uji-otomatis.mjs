/* ==========================================================================
 * Career Quest - uji/uji-otomatis.mjs
 *
 * UJI ALPHA (BLACK BOX) OTOMATIS
 * Menjalankan seluruh alur permainan di atas DOM dan kanvas sungguhan
 * (jsdom + node-canvas), tanpa peramban. Cocok dipakai sebagai bukti
 * pengujian fungsional pada Bab III/IV skripsi.
 *
 * Yang diuji:
 *   1. Boot aplikasi & layar judul
 *   2. Kustomisasi karakter (Concept / role design)
 *   3. Dialog pembuka & pemuatan peta
 *   4. Penggambaran pixel art (layar judul + tiga lantai)
 *   5. Pergerakan, tabrakan, interaksi meja misi
 *   6. Tiga puluh babak misi (target Bintang 3)
 *   7. Penilaian bintang saat terjadi kesalahan
 *   8. Promosi, akumulasi gaji, dan lift antar lantai
 *   9. Ensiklopedia karier
 *  10. Tes Kompetensi Karier & adegan penutup
 *  11. Panduan, pemetaan kurikulum, dan rubrik capaian
 *  12. Penyimpanan progres (localStorage)
 *  13. Pemulihan progres setelah halaman dimuat ulang
 *  14. Pemeriksaan error runtime
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

/* -------------------------------- API UI ------------------------------- */
function buatApi(window, game) {
  const doc = window.document;
  const $ = (s) => doc.querySelector(s);
  const visible = (s) => !!$(s) && !$(s).hidden;
  const click = (elm) => {
    if (!elm) throw new Error('elemen yang akan diklik tidak ada');
    elm.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function majukanDialog(max = 60) {
    let n = 0;
    while (game.dialogue && n < max) { click($('#dialogue')); click($('#dialogue')); n++; }
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
      if (visible('#modal')) { klikAksi(/Nanti|Tetap|Tutup|Kembali|Lanjut/i, 0); continue; }
      if (visible('#screen-pause')) { click($('#pause-resume')); continue; }
      break;
    }
  }

  return { $, click, visible, wait, majukanDialog, klikAksi, tuntaskan };
}

/* --------------------------- MEMAINKAN BABAK --------------------------- */
function bukaPemilihBabak(api, game, profId, idx) {
  const $ = api.$;
  game.openQuest({ prof: profId });
  const opsi = Array.from($('#modal-body').querySelectorAll('.quiz-opt'));
  if (!opsi[idx]) throw new Error('pemilih babak gagal untuk ' + profId + ' #' + idx);
  api.click(opsi[idx]);
}

function mainkanBabak(api, game, PROF_MAP, profId, idx, { salahSekali = false } = {}) {
  const $ = api.$;
  const babak = PROF_MAP[profId].chapters[idx];
  game.setLevel(PROF_MAP[profId].level, true);
  game.scene = 'world';
  bukaPemilihBabak(api, game, profId, idx);
  const sesi = game.questSession;
  if (!sesi) throw new Error('sesi misi tidak dibuat untuk ' + profId + ' #' + idx);

  if (babak.mode === 'quiz') {
    for (let i = 0; i < sesi.items.length; i++) {
      const item = sesi.items[i];
      const opsi = Array.from($('#quest-body').querySelectorAll('.quiz-opt'));
      if (!opsi.length) throw new Error('opsi kuis tidak dirender');
      const pilih = (i === 0 && salahSekali)
        ? item.options.findIndex((o) => !o.correct)
        : item.options.findIndex((o) => o.correct);
      api.click(opsi[pilih]);
      const lanjut = Array.from($('#quest-actions').children)
        .find((b) => /Berikutnya|Selesaikan|Lihat Hasil/i.test(b.textContent));
      if (!lanjut) throw new Error('tombol lanjut kuis tidak ada');
      api.click(lanjut);
    }
  } else if (babak.mode === 'order') {
    for (let k = 0; k < babak.order.length; k++) {
      const tombol = Array.from($('#quest-body').querySelectorAll('.q-item')).filter((b) => !b.disabled);
      const target = sesi.items.find((it) => it.order === k);
      if (k === 0 && salahSekali) {
        const salah = tombol.find((b) => b.textContent !== target.text);
        if (salah) api.click(salah);
      }
      const btn = tombol.find((b) => b.textContent === target.text);
      if (!btn) throw new Error('langkah order tidak ditemukan: ' + target.text);
      api.click(btn);
    }
  } else {
    for (let k = 0; k < babak.steps.length; k++) {
      const tombol = Array.from($('#quest-body').querySelectorAll('.q-item'))
        .filter((b) => !b.disabled && !b.classList.contains('done') && !b.classList.contains('wrong'));
      const target = sesi.items.find((it) => it.order === k);
      if (k === 0 && salahSekali) {
        const pengecoh = tombol.find((b) => b.textContent !== target.text);
        if (pengecoh) api.click(pengecoh);
      }
      const btn = tombol.find((b) => b.textContent === target.text);
      if (!btn) throw new Error('langkah tidak ditemukan: ' + target.text);
      api.click(btn);
    }
  }
  return sesi;
}

/* ================================= UJIAN ================================ */
(async () => {
  log('==============================================');
  log(' UJI ALPHA OTOMATIS - CAREER QUEST');
  log('==============================================');

  siapkanModul();

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

  await import(path.join(MOD, 'js', 'app.js') + '?v=' + Date.now());
  const data = await import(path.join(MOD, 'js', 'data.js'));
  const { game } = window.CareerQuest;
  const api = buatApi(window, game);
  const { PROFESSIONS, PROF_MAP, LEVELS } = data;
  const $ = api.$;

  /* ------------------------------- [1] ------------------------------- */
  grup('[1] Boot aplikasi & layar judul');
  check('U-01 Aplikasi memuat tanpa error', !!game);
  check('U-02 Layar judul tampil', api.visible('#screen-title'));
  check('U-03 Tombol "Lanjutkan" nonaktif saat belum ada progres', $('#btn-continue').disabled === true);

  /* ------------------------------- [2] ------------------------------- */
  grup('[2] Kustomisasi karakter');
  api.click($('#btn-new'));
  check('U-04 Layar kustomisasi karakter terbuka', api.visible('#screen-char'));
  const fields = $('#char-form').querySelectorAll('.field');
  check('U-05 Tersedia 5 pilihan kustomisasi', fields.length === 5, 'jumlah=' + fields.length);
  api.click(fields[0].querySelectorAll('.opt')[1]);   /* perempuan */
  api.click(fields[1].querySelectorAll('.opt')[1]);   /* sawo matang */
  api.click(fields[3].querySelectorAll('.opt')[2]);   /* baju merah */
  api.click($('#char-save'));
  check('U-06 Layar kustomisasi tertutup setelah disimpan', !api.visible('#screen-char'));
  check('U-07 Profil pemain tersimpan pada state',
    game.state.profile.gender === 'wanita' && game.state.profile.skin === 'sawo' && game.state.profile.shirt === 'merah',
    JSON.stringify(game.state.profile));

  /* ------------------------------- [3] ------------------------------- */
  grup('[3] Dialog pembuka & pemuatan peta');
  const nDlg = api.majukanDialog();
  check('U-08 Dialog pembuka dapat dilanjutkan (' + nDlg + ' halaman)', !game.dialogue);
  check('U-09 Setelah dialog, permainan kembali ke dunia', game.scene === 'world');
  check('U-10 Peta Lantai 1 dimuat', game.currentMapKey === 'floor1');
  check('U-11 Penyambutan lantai ditandai sudah dilihat', game.state.seenIntro.floor1 === true);
  check('U-12 Jabatan awal pemain = Junior Intern', game.rank() === 'Junior Intern', game.rank());

  /* ------------------------------- [4] ------------------------------- */
  grup('[4] Penggambaran pixel art');
  let galatRender = null;
  try { game.render(); } catch (e) { galatRender = e.message; }
  check('U-13 Dunia dapat digambar tanpa error', !galatRender, galatRender);
  galatRender = null;
  try { const asal = game.scene; game.scene = 'title'; game.render(); game.scene = asal; } catch (e) { galatRender = e.message; }
  check('U-14 Layar judul dapat digambar tanpa error', !galatRender, galatRender);
  galatRender = null;
  try { for (const l of LEVELS) { game.setLevel(l.id, true); game.render(); } } catch (e) { galatRender = e.message; }
  check('U-15 Ketiga lantai dapat digambar tanpa error', !galatRender, galatRender);

  /* ------------------------------- [5] ------------------------------- */
  grup('[5] Pergerakan, tabrakan, dan interaksi');
  game.setLevel(1, true);
  const sebelum = { x: game.player.x, y: game.player.y };
  game.keys.up = true;
  for (let i = 0; i < 40; i++) game.update(1 / 60);
  game.keys.up = false;
  check('U-16 Karakter bergerak saat tombol arah ditekan', game.player.y < sebelum.y,
    sebelum.y.toFixed(1) + ' -> ' + game.player.y.toFixed(1));
  game.player.x = 2 * 24 + 12; game.player.y = 2 * 24 + 12;
  game.keys.left = true;
  for (let i = 0; i < 30; i++) game.update(1 / 60);
  game.keys.left = false;
  check('U-17 Tabrakan dinding menghalangi karakter', game.player.x > 24, 'x=' + game.player.x.toFixed(1));
  game.player.x = 11 * 24 + 12; game.player.y = 5 * 24 + 12;
  const dekat = game.nearestInteractable();
  check('U-18 Meja misi terdeteksi saat didekati', !!dekat && dekat.kind === 'quest', dekat && dekat.kind);
  game.action();
  check('U-19 Pemilih babak misi terbuka', api.visible('#modal'));
  api.tuntaskan();

  /* ------------------------------- [6] ------------------------------- */
  grup('[6] Tiga puluh babak misi (target Bintang 3)');
  const daftar = [];
  LEVELS.forEach((l) => l.professions.forEach((p) => daftar.push(p)));
  const masalah = [];
  for (const profId of daftar) {
    const prof = PROF_MAP[profId];
    for (let idx = 0; idx < prof.chapters.length; idx++) {
      mainkanBabak(api, game, PROF_MAP, profId, idx);
      await api.wait(520);                 /* tunggu transisi penyelesaian babak */
      api.tuntaskan();
      const bintang = game.starsOf(profId)[idx];
      if (bintang !== 3) masalah.push(profId + ' babak ' + (idx + 1) + ' = ' + bintang + ' bintang');
      if (game.scene !== 'world' && !game.dialogue) game.scene = 'world';
      if (api.visible('#quest')) api.click($('#quest').querySelector('.btn.ghost'));
      await api.wait(40);
    }
    if (!game.isProfMastered(profId)) masalah.push(profId + ' belum tuntas');
  }
  check('U-20 Seluruh 30 babak lulus Bintang 3', masalah.length === 0, masalah.slice(0, 4).join('; '));
  check('U-21 Total bintang maksimal 90', game.totalStars() === 90, 'total=' + game.totalStars());
  check('U-22 Koin bertambah setiap misi selesai', game.state.coins > 0, 'koin=' + game.state.coins);

  /* ------------------------------- [7] ------------------------------- */
  grup('[7] Penilaian bintang saat terjadi kesalahan');
  mainkanBabak(api, game, PROF_MAP, 'itsupport', 0, { salahSekali: true });
  await api.wait(520);
  const teksHasil = $('#modal-body').textContent;
  const bintangDilihat = ($('#modal-body').querySelector('.star-row') || {}).textContent || '';
  const statistik = Array.from($('#modal-body').querySelectorAll('.stat'))
    .map((s) => [s.querySelector('.k').textContent, s.querySelector('.v').textContent]);
  const kolomKesalahan = (statistik.find((x) => /Kesalahan/i.test(x[0])) || [])[1];
  check('U-23 Modal hasil misi menampilkan jumlah kesalahan', /Kesalahan/.test(teksHasil));
  check('U-24 Satu kesalahan tercatat', kolomKesalahan === '1', 'kesalahan=' + kolomKesalahan);
  check('U-25 Satu kesalahan menghasilkan Bintang 2', bintangDilihat === '\u2605\u2605\u2606', 'bintang="' + bintangDilihat + '"');
  check('U-26 Bintang terbaik sebelumnya tetap tersimpan',
    statistik.some((x) => /Bintang terbaik/i.test(x[0]) && x[1] === '3/3'), JSON.stringify(statistik));
  api.tuntaskan();

  /* ------------------------------- [8] ------------------------------- */
  grup('[8] Promosi, gaji, dan lift');
  ['#screen-title', '#screen-pause', '#modal', '#screen-ency', '#screen-guide', '#screen-char', '#quest']
    .forEach((sel) => { $(sel).hidden = true; });
  game.scene = 'world'; game.paused = false;
  LEVELS.forEach((l) => { if (!game.state.promoted[l.id]) game.promote(l.id); });
  check('U-27 Seluruh lantai terbuka setelah promosi', game.state.maxLevel === 3, 'maxLevel=' + game.state.maxLevel);
  check('U-28 Total gaji terakumulasi benar', game.state.salary === 14000000, 'gaji=' + game.state.salary);
  check('U-29 Jabatan akhir = Senior Specialist', game.rank() === 'Senior Specialist', game.rank());
  game.setLevel(1, true);
  game.player.x = 30 * 24 + 12; game.player.y = 16 * 24 + 12;
  check('U-30 Karakter terdeteksi berdiri di depan lift', game.isAtElevator());
  game.action();
  const tombolLantai = Array.from($('#modal-body').querySelectorAll('.quiz-opt'));
  check('U-31 Lift menawarkan seluruh lantai terbuka', tombolLantai.length === 3, 'jumlah=' + tombolLantai.length);
  api.click(tombolLantai[2]);
  check('U-32 Lift memindahkan pemain ke lantai tujuan', game.state.currentLevel === 3, 'lantai=' + game.state.currentLevel);
  game.player.x = 30 * 24 + 12; game.player.y = 16 * 24 + 12;
  game.action();
  api.click(Array.from($('#modal-body').querySelectorAll('.quiz-opt'))[0]);
  check('U-33 Pemain dapat kembali ke lantai sebelumnya', game.state.currentLevel === 1, 'lantai=' + game.state.currentLevel);

  /* ------------------------------- [9] ------------------------------- */
  grup('[9] Ensiklopedia karier');
  api.click($('#btn-book'));
  check('U-34 Layar ensiklopedia terbuka', api.visible('#screen-ency'));
  const kartu = $('#ency-grid').querySelectorAll('.ency-card');
  check('U-35 Sepuluh kartu profesi tampil', kartu.length === 10, 'jumlah=' + kartu.length);
  api.click(Array.from(kartu).find((c) => !c.classList.contains('locked')));
  const detail = $('#ency-detail').textContent;
  check('U-36 Kartu memuat deskripsi pekerjaan', /Deskripsi pekerjaan/.test(detail));
  check('U-37 Kartu memuat jurusan kuliah', /Jurusan kuliah/.test(detail));
  check('U-38 Kartu memuat sertifikasi', /Sertifikasi/.test(detail));
  check('U-39 Kartu memuat jalur karier', /Jalur karier/.test(detail));
  check('U-40 Tombol Tes Kompetensi aktif setelah tiga lantai tuntas', $('#ency-mastery').disabled === false);
  api.click($('#ency-close'));

  /* ------------------------------- [10] ------------------------------ */
  grup('[10] Tes Kompetensi Karier & adegan penutup');
  api.click($('#btn-book'));
  api.click($('#ency-mastery'));
  check('U-41 Layar tes kompetensi terbuka', api.visible('#quest'));
  let pengaman = 0;
  while (api.visible('#quest') && pengaman++ < 30) {
    const opsi = Array.from($('#quest-body').querySelectorAll('.quiz-opt'));
    if (!opsi.length) break;
    const sesi = game.questSession;
    const q = $('#quest-body').querySelector('.quiz-q').textContent;
    const item = sesi.items.find((it) => it.q === q);
    api.click(opsi[item.options.findIndex((o) => o.correct)]);
    const lanjut = Array.from($('#quest-actions').children)
      .find((b) => /Berikutnya|Lihat Hasil|Selesaikan/i.test(b.textContent));
    if (lanjut) api.click(lanjut);
  }
  check('U-42 Nilai tes kompetensi tercatat', game.state.masteryScore != null, 'nilai=' + game.state.masteryScore);
  check('U-43 Nilai tes lulus (>= 80)', game.state.masteryScore >= 80, 'nilai=' + game.state.masteryScore);
  api.klikAksi(/Penutup/i, 0);
  check('U-44 Adegan penutup tampil', api.visible('#modal'));
  check('U-45 Permainan kembali dapat dimainkan setelah tes', game.scene === 'world', 'scene=' + game.scene);
  api.tuntaskan();
  check('U-46 Tidak ada lapisan UI yang menahan masukan setelah penutup', !game.paused, 'paused=' + game.paused);

  /* ------------------------------- [11] ------------------------------ */
  grup('[11] Panduan, pemetaan kurikulum, dan rubrik');
  game.scene = 'title';
  $('#screen-title').hidden = false;
  api.click($('#btn-guide'));
  check('U-47 Layar panduan terbuka', api.visible('#screen-guide'));
  let halaman = 1;
  while (!$('#guide-next').disabled && halaman < 12) { api.click($('#guide-next')); halaman++; }
  check('U-48 Panduan berisi beberapa halaman', halaman >= 5, 'halaman=' + halaman);
  api.click($('#guide-close'));
  api.click($('#btn-rubric'));
  const rubrik = $('#guide-title').textContent + ' ' + $('#guide-body').textContent;
  check('U-49 Pemetaan kurikulum memuat komponen CP/DSI', /Komponen Kurikulum/.test(rubrik) && /DSI/.test(rubrik));
  api.click($('#guide-next'));
  const isiRubrik = $('#guide-body').textContent;
  check('U-50 Rubrik menampilkan capaian otomatis', /Persentase capaian|Divisi tuntas/i.test(isiRubrik));
  check('U-51 Rubrik memuat konversi tingkat pencapaian', /Tingkat kualifikasi|Sangat Layak|tingkat pencapaian/i.test(isiRubrik));
  api.click($('#guide-close'));

  /* ------------------------------- [12] ------------------------------ */
  grup('[12] Penyimpanan progres');
  const mentah = window.localStorage.getItem('career-quest-save-v1');
  check('U-52 Progres tersimpan di localStorage', !!mentah);
  const tersimpan = JSON.parse(mentah || '{}');
  check('U-53 Menyimpan data 10 profesi', Object.keys(tersimpan.stars || {}).length === 10,
    'profesi=' + Object.keys(tersimpan.stars || {}).length);
  check('U-54 Menyimpan profil, koin, dan gaji',
    tersimpan.profile && tersimpan.profile.skin === 'sawo' && tersimpan.salary === 14000000 && tersimpan.coins > 0);
  check('U-55 Menyimpan nilai tes kompetensi', tersimpan.masteryScore >= 80);

  /* ------------------------------- [13] ------------------------------ */
  grup('[13] Pemulihan progres setelah halaman dimuat ulang');
  const dom2 = new JSDOM(html, {
    runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'http://localhost/career-quest/', virtualConsole: vc
  });
  shimCanvas(dom2.window);
  siapkanGlobal(dom2.window);
  dom2.window.localStorage.setItem('career-quest-save-v1', mentah);
  await import(path.join(MOD, 'js', 'app.js') + '?muatulang=' + Date.now());
  const game2 = dom2.window.CareerQuest.game;
  check('U-56 Progres dipulihkan setelah muat ulang',
    game2.state.salary === 14000000 && Object.keys(game2.state.stars).length === 10);
  check('U-57 Tombol "Lanjutkan" aktif saat tersedia simpanan',
    !dom2.window.document.querySelector('#btn-continue').disabled);

  /* ------------------------------- [14] ------------------------------ */
  grup('[14] Pemeriksaan error runtime');
  const fatal = galat.filter((e) => !/Not implemented|Could not parse CSS/i.test(e));
  check('U-58 Tidak ada error runtime selama pengujian', fatal.length === 0, fatal.slice(0, 3).join(' | '));

  /* ------------------------------ RINGKASAN --------------------------- */
  const total = hasil.length;
  const lulus = hasil.filter((h) => h.lulus).length;
  const gagal = total - lulus;
  const persen = Math.round((lulus / total) * 100);

  log('\n==============================================');
  log(' RINGKASAN: ' + lulus + '/' + total + ' uji lulus (' + persen + '%)');
  log('==============================================');
  if (gagal) {
    log('\nUji yang gagal:');
    hasil.filter((h) => !h.lulus).forEach((h) => log('  - ' + h.nama + (h.catatan ? ' → ' + h.catatan : '')));
  }

  /* -------------------------- LAPORAN MARKDOWN ------------------------ */
  const baris = hasil.map((h) => '| ' + h.nama.replace(/\|/g, '\\|') + ' | ' +
    (h.lulus ? 'Berhasil' : 'Gagal') + ' | ' + (h.catatan || '-').replace(/\|/g, '\\|') + ' |');
  const laporan = [
    '# Laporan Uji Alpha (Black Box) - Career Quest',
    '',
    'Dihasilkan otomatis oleh `uji/uji-otomatis.mjs` pada ' + new Date().toLocaleString('id-ID') + '.',
    '',
    '- Lingkungan: jsdom + node-canvas (tanpa peramban), resolusi internal 576x336 px.',
    '- Hasil: **' + lulus + ' dari ' + total + ' uji berhasil (' + persen + '%)**.',
    '',
    '| Butir uji | Hasil | Catatan |',
    '| :--- | :--- | :--- |',
    ...baris,
    '',
    '## Kelompok pengujian',
    ''
  ].join('\n');
  fs.writeFileSync(REPORT, laporan + Array.from(new Set(hasil.map((h) => h.grup))).map((g) => '- ' + g).join('\n') + '\n');
  log('\nLaporan tersimpan di: ' + path.relative(process.cwd(), REPORT));

  process.exit(gagal === 0 ? 0 : 1);
})().catch((e) => {
  console.error('\nUji berhenti karena error: ', e);
  process.exit(2);
});
