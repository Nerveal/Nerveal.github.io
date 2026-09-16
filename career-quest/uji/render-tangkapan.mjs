/* ==========================================================================
 * Career Quest - uji/render-tangkapan.mjs
 *
 * Menghasilkan berkas PNG tangkapan layar kanvas permainan tanpa peramban
 * (jsdom + @napi-rs/canvas). Dipakai untuk lampiran skripsi dan untuk
 * memperbarui gambar pada portal (career-quest/asets/).
 *
 * Cara menjalankan:
 *   cd career-quest/uji
 *   npm install        (hanya sekali)
 *   npm run tangkapan  (atau: node render-tangkapan.mjs)
 *
 * Keluaran:
 *   career-quest/asets/tangkapan-layar-judul.png   (1280x768)
 *   career-quest/asets/tangkapan-layar-lantai1.png
 *   career-quest/asets/tangkapan-layar-lantai2.png
 *   career-quest/asets/tangkapan-layar-lantai3.png
 *   career-quest/uji/tangkapan/kartu-karakter.png  (lembar 9 gaya rambut)
 * ==========================================================================
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM, VirtualConsole } from 'jsdom';
import { createCanvas } from '@napi-rs/canvas';

const UJI_DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(UJI_DIR, '..');
const MOD = path.join(os.tmpdir(), 'career-quest-mod');
const ASSETS = path.join(SRC, 'asets');
const EXTRA = path.join(UJI_DIR, 'tangkapan');

fs.mkdirSync(ASSETS, { recursive: true });
fs.mkdirSync(EXTRA, { recursive: true });

/* salin modul agar dapat diimpor Node */
fs.rmSync(MOD, { recursive: true, force: true });
fs.mkdirSync(path.join(MOD, 'js'), { recursive: true });
fs.writeFileSync(path.join(MOD, 'package.json'), '{"type":"module"}');
for (const f of fs.readdirSync(path.join(SRC, 'js'))) {
  if (f.endsWith('.js')) fs.copyFileSync(path.join(SRC, 'js', f), path.join(MOD, 'js', f));
}

const errs = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => { const x = e.error || e.detail; errs.push('jsdomError: ' + ((x && x.stack) || e.message)); });
vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ')));

const html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const dom = new JSDOM(html, {
  runScripts: 'outside-only', pretendToBeVisual: true,
  url: 'http://localhost/career-quest/', virtualConsole: vc
});
const { window } = dom;

const backing = new WeakMap();
window.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type !== '2d') return null;
  const w = this.width || 300, h = this.height || 150;
  let e = backing.get(this);
  if (!e || e.w !== w || e.h !== h) { const nc = createCanvas(w, h); e = { w, h, nc }; backing.set(this, e); }
  return e.nc.getContext('2d');
};
window.HTMLCanvasElement.prototype.toDataURL = function () {
  const e = backing.get(this);
  return e ? e.nc.toDataURL('image/png') : 'data:image/png;base64,';
};
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

await import(path.join(MOD, 'js', 'app.js') + '?v=' + Date.now());
const art = await import(path.join(MOD, 'js', 'art.js'));
const data = await import(path.join(MOD, 'js', 'data.js'));
const { game } = window.CareerQuest;
const doc = window.document;
const $ = (s) => doc.querySelector(s);
const click = (e) => { if (!e) throw new Error('elemen tidak ada'); e.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function simpanKe(host, nama, skala = 2) {
  const e = backing.get(host);
  if (!e) throw new Error('kanvas belum digambar: ' + nama);
  const big = createCanvas(Math.round(e.w * skala), Math.round(e.h * skala));
  const c = big.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(e.nc, 0, 0, big.width, big.height);
  fs.writeFileSync(nama, await big.encode('png'));
  console.log('  ' + path.relative(SRC, nama) + ' (' + big.width + 'x' + big.height + ')');
}

const simpan = (nama, skala = 2) => simpanKe($('#stage'), path.join(ASSETS, nama), skala);

/* ------------------------- 1. layar judul (kanvas) ---------------------- */
await wait(320);
game.render();
await simpan('tangkapan-layar-judul.png');

/* ------------------- 2. masuk permainan: kustomisasi -------------------- */
click($('#btn-new'));
await wait(80);
click($('#char-save'));
await wait(100);

/* majukan dialog pembuka */
let guard = 0;
while (game.dialogue && guard++ < 40) { click($('#dialogue')); await wait(16); }
await wait(160);

/* ----------------------- 3. hub tiga lantai ----------------------------- */
game.setLevel(1, true); game.render();
await simpan('tangkapan-layar-lantai1.png');
for (const lv of [2, 3]) {
  game.setLevel(lv, true); game.render();
  await simpan('tangkapan-layar-lantai' + lv + '.png');
}

/* ---------------- 4. lembar contoh karakter (lampiran) ------------------- */
{
  const cfg = { hairStyle: 'short', jacket: null, shoes: 'formal', accessory: null };
  const gaya = ['short', 'spiky', 'bob', 'pony', 'long', 'curly', 'undercut', 'buzz', 'cap'];
  const baris = [
    gaya.map((hairStyle) => Object.assign({}, cfg, { hairStyle })),
    ['bomber', 'hoodie', 'blazer', 'vest'].map((jacket) => Object.assign({}, cfg, { jacket })),
    ['formal', 'sneaker', 'boot'].map((shoes) => Object.assign({}, cfg, { shoes })),
    ['glasses', 'headset'].map((accessory) => Object.assign({}, cfg, { accessory }))
  ];
  const kolom = Math.max.apply(null, baris.map((b) => b.length));
  const cw = 48, ch = 68;
  const sheet = createCanvas(kolom * cw + 16, baris.length * ch + 16);
  const g = sheet.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#eaf1f9';
  g.fillRect(0, 0, sheet.width, sheet.height);
  g.strokeStyle = '#b7c8dc';
  for (let i = 1; i < kolom; i++) { g.beginPath(); g.moveTo(i * cw + 8, 0); g.lineTo(i * cw + 8, sheet.height); g.stroke(); }
  baris.forEach((b, r) => {
    b.forEach((profil, c) => {
      const karakter = data.profileToChar(Object.assign({}, data.DEFAULT_PROFILE, profil));
      art.drawChar(g, karakter, c * cw + 12, r * ch + 8, { dir: 'down' });
    });
  });
  fs.writeFileSync(path.join(EXTRA, 'kartu-karakter.png'), await sheet.encode('png'));
  console.log('  uji/tangkapan/kartu-karakter.png (' + sheet.width + 'x' + sheet.height + ')');
}

console.log('\nGalat runtime: ' + (errs.length === 0 ? 'tidak ada' : '\n' + errs.slice(0, 6).join('\n')));
process.exit(errs.length === 0 ? 0 : 1);
