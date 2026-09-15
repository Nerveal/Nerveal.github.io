/* ==========================================================================
 * Career Quest - art.js
 * Seluruh aset visual (pixel art) digambar secara prosedural dengan Canvas 2D.
 * Tidak ada file gambar eksternal, sehingga game tetap ringan & bisa offline.
 * Tidak ada akses DOM di file ini (hanya objek canvas context), agar bisa
 * diuji langsung memakai node-canvas.
 * ==========================================================================
 */

export const TILE = 24;

/* ------------------------------- PALET ---------------------------------- */
export const PAL = {
  ink: '#1a1c28',
  ink2: '#2a2e42',
  ink3: '#3a4059',
  shadow: 'rgba(12,14,24,0.35)',

  white: '#ffffff',
  off: '#eef2f9',
  paper: '#f5f7fc',

  skin: '#f7d0ab',
  skin2: '#e6b183',
  skin3: '#c78e63',
  skin4: '#9c6742',
  skin5: '#6f462b',

  hairD: '#24242c',
  hairB: '#7a4a28',
  hairY: '#eccb6c',
  hairR: '#bb5530',
  hairG: '#c6ccd8',
  hairP: '#8e5ac1',

  blue: '#3f7fd6',
  blue2: '#2d61ac',
  cyan: '#48c7d8',
  cyan2: '#2f9aab',
  teal: '#2fa98a',
  teal2: '#227f68',
  green: '#5cc46b',
  green2: '#3f9950',
  lime: '#a8d94f',
  yellow: '#f2c94c',
  yellow2: '#d9a92c',
  orange: '#ef8b3c',
  orange2: '#c96a25',
  red: '#e05252',
  red2: '#b03a3a',
  pink: '#ef7fa8',
  purple: '#9a6ee0',
  purple2: '#6f4bb0',
  brown: '#8a5a34',
  brown2: '#63401f',
  gray: '#8d94a8',
  gray2: '#5f6678',
  gray3: '#c3c9d6',
  dark: '#20242f',
  dark2: '#12141c',

  floorLight: '#dcdfe8',
  floorMid: '#c9cdd9',
  floorLine: '#b3b8c7',
  carpet: '#39527e',
  carpet2: '#2f4468',
  wallTop: '#4c5570',
  wallTop2: '#3b4259',
  wallFace: '#6b7492',
  wallFace2: '#565e79',
  server: '#2f3646',
  server2: '#232836',
  lab: '#31465e'
};

/* --------------------------- HELPER MENGGAMBAR -------------------------- */
export function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/* ------------------------------- TILES ---------------------------------- */
/* Setiap tile berukuran 24x24 px. */
export function drawTile(ctx, kind, x, y) {
  switch (kind) {
    case '#': /* dinding (blok penuh) */
      px(ctx, x, y, TILE, TILE, PAL.wallFace);
      px(ctx, x, y, TILE, 8, PAL.wallTop);
      px(ctx, x, y + 8, TILE, 2, PAL.wallTop2);
      px(ctx, x, y + TILE - 2, TILE, 2, PAL.ink3);
      break;
    case 'w': /* dinding + jendela */
      drawTile(ctx, '#', x, y);
      px(ctx, x + 3, y + 9, TILE - 6, 11, PAL.ink2);
      px(ctx, x + 4, y + 10, TILE - 8, 9, '#8fd3f4');
      px(ctx, x + 4, y + 10, TILE - 8, 3, '#bfe6fa');
      px(ctx, x + 11, y + 10, 2, 9, PAL.ink2);
      break;
    case 'D': /* pintu */
      px(ctx, x, y, TILE, TILE, PAL.floorMid);
      px(ctx, x + 2, y + 1, TILE - 4, TILE - 1, PAL.brown);
      px(ctx, x + 3, y + 3, TILE - 6, 8, PAL.brown2);
      px(ctx, x + 3, y + 13, TILE - 6, 8, PAL.brown2);
      px(ctx, x + TILE - 7, y + 12, 2, 2, PAL.yellow);
      break;
    case 'e': /* pintu lift */
      px(ctx, x, y, TILE, TILE, PAL.wallFace2);
      px(ctx, x + 2, y + 2, TILE - 4, TILE - 2, PAL.gray3);
      px(ctx, x + 11, y + 2, 2, TILE - 2, PAL.gray);
      px(ctx, x + 2, y, TILE - 4, 4, PAL.green2);
      break;
    case 'c': /* karpet */
      px(ctx, x, y, TILE, TILE, PAL.carpet);
      px(ctx, x, y, TILE, 1, PAL.carpet2);
      px(ctx, x + 1, y + 3, 3, 1, PAL.carpet2);
      px(ctx, x + 12, y + 9, 4, 1, PAL.carpet2);
      px(ctx, x + 5, y + 16, 3, 1, PAL.carpet2);
      break;
    case 'l': /* lantai lab / lantai mesin */
      px(ctx, x, y, TILE, TILE, '#3d566f');
      px(ctx, x, y, TILE, 1, '#4a6684');
      px(ctx, x + 2, y + 2, TILE - 4, TILE - 4, '#45607c');
      px(ctx, x + 4, y + 6, 4, 2, '#3a5169');
      break;
    default: /* lantai kantor standar */
      px(ctx, x, y, TILE, TILE, PAL.floorLight);
      px(ctx, x, y + TILE - 1, TILE, 1, PAL.floorLine);
      px(ctx, x + TILE - 1, y, 1, TILE, PAL.floorLine);
      px(ctx, x + 3, y + 5, 2, 2, PAL.floorMid);
      px(ctx, x + 15, y + 13, 2, 2, PAL.floorMid);
      break;
  }
}

/* -------------------------------- PROPS --------------------------------- */
/* Semua props digambar dengan anchor kiri-atas pada koordinat tile. */

function deskHalf(ctx, x, y, left, wood, woodDark) {
  const base = 6; /* tinggi meja dari dasar tile */
  if (left) {
    px(ctx, x + 1, y + base, TILE - 1, 4, wood);          /* permukaan */
    px(ctx, x + 1, y + base, TILE - 1, 1, '#ffffff22');
    px(ctx, x + 1, y + base + 4, TILE - 1, 1, woodDark);
    px(ctx, x + 2, y + base + 5, TILE - 4, 14, woodDark); /* badan depan */
    px(ctx, x + 5, y + base + 9, 6, 2, PAL.ink3);         /* gagang laci */
    px(ctx, x + 5, y + base + 14, 6, 2, PAL.ink3);
  } else {
    px(ctx, x, y + base, TILE, 4, wood);
    px(ctx, x, y + base + 4, TILE, 1, woodDark);
    px(ctx, x + 2, y + base + 5, TILE - 4, 14, woodDark);
    px(ctx, x + 5, y + base + 9, 6, 2, PAL.ink3);
    px(ctx, x + 5, y + base + 14, 6, 2, PAL.ink3);
  }
}

export function drawProp(ctx, kind, x, y, t = 0) {
  switch (kind) {
    /* ------- meja kerja (2 tile: deskL + deskR) ------- */
    case 'deskL':
      deskHalf(ctx, x, y, true, '#b98a56', '#8a6136');
      /* monitor */
      px(ctx, x + 4, y - 10, 16, 12, PAL.dark);
      px(ctx, x + 5, y - 9, 14, 10, '#2f7fd0');
      px(ctx, x + 6, y - 8, 12, 8, '#54b3e8');
      px(ctx, x + 7, y - 7, 5, 2, '#a8e2ff');
      px(ctx, x + 7, y - 4, 8, 1, '#2a6bad');
      px(ctx, x + 7, y - 2, 5, 1, '#2a6bad');
      px(ctx, x + 10, y + 2, 4, 2, PAL.dark2);
      px(ctx, x + 7, y + 4, 10, 2, PAL.gray2);
      break;
    case 'deskR':
      deskHalf(ctx, x, y, false, '#b98a56', '#8a6136');
      /* keyboard + dokumen */
      px(ctx, x + 2, y + 9, 14, 4, PAL.gray3);
      px(ctx, x + 3, y + 10, 12, 2, PAL.white);
      px(ctx, x + 17, y + 13, 5, 7, PAL.white);
      px(ctx, x + 18, y + 15, 3, 1, PAL.gray);
      break;

    /* ---------------- kursi kerja ---------------- */
    case 'chair':
      px(ctx, x + 5, y - 4, 14, 12, PAL.red2);            /* sandaran */
      px(ctx, x + 6, y - 3, 12, 10, PAL.red);
      px(ctx, x + 6, y - 2, 12, 1, '#ff8a8a');
      px(ctx, x + 4, y + 8, 16, 6, PAL.dark);             /* alas */
      px(ctx, x + 5, y + 9, 14, 4, PAL.ink3);
      px(ctx, x + 11, y + 14, 2, 5, PAL.dark2);           /* kaki */
      px(ctx, x + 5, y + 19, 14, 2, PAL.dark2);
      px(ctx, x + 4, y + 21, 3, 2, PAL.dark2);
      px(ctx, x + 17, y + 21, 3, 2, PAL.dark2);
      break;

    /* ---------------- tanaman ---------------- */
    case 'plant':
      px(ctx, x + 7, y + 12, 10, 9, '#a4593a');           /* pot */
      px(ctx, x + 8, y + 12, 8, 2, '#c47a4c');
      px(ctx, x + 8, y + 13, 8, 8, '#8f4a30');
      px(ctx, x + 6, y + 4, 6, 5, PAL.green2);            /* daun */
      px(ctx, x + 12, y + 6, 7, 5, PAL.green2);
      px(ctx, x + 7, y + 1, 5, 5, PAL.green);
      px(ctx, x + 13, y + 2, 5, 5, PAL.green);
      px(ctx, x + 10, y + 8, 4, 6, PAL.teal2);
      px(ctx, x + 8, y + 3, 2, 2, PAL.lime);
      px(ctx, x + 14, y + 4, 2, 2, PAL.lime);
      break;

    /* ---------------- rak server ---------------- */
    case 'server':
      px(ctx, x + 1, y - 8, 22, 32, PAL.server2);
      px(ctx, x + 2, y - 7, 20, 30, PAL.server);
      for (let i = 0; i < 5; i++) {
        const oy = y - 5 + i * 6;
        px(ctx, x + 3, oy, 18, 5, '#3a4254');
        px(ctx, x + 4, oy + 1, 10, 2, '#2b3244');
        const blink = (Math.floor(t * 2) + i) % 3;
        px(ctx, x + 16, oy + 1, 2, 2, blink === 0 ? PAL.green : PAL.green2);
        px(ctx, x + 19, oy + 1, 2, 2, i % 2 ? PAL.yellow : PAL.orange);
      }
      break;

    /* ---------------- lemari berkas ---------------- */
    case 'cabinet':
      px(ctx, x + 2, y - 2, 20, 26, PAL.gray2);
      px(ctx, x + 3, y - 1, 18, 24, PAL.gray3);
      for (let i = 0; i < 3; i++) {
        const oy = y + 1 + i * 8;
        px(ctx, x + 4, oy, 16, 6, '#b0b7c6');
        px(ctx, x + 10, oy + 2, 4, 2, PAL.gray2);
      }
      break;

    /* ---------------- dispenser air ---------------- */
    case 'cooler':
      px(ctx, x + 6, y - 4, 12, 12, '#a8e2ff');
      px(ctx, x + 7, y - 3, 10, 10, '#7fcbf0');
      px(ctx, x + 6, y + 8, 12, 16, PAL.off);
      px(ctx, x + 8, y + 12, 3, 3, PAL.blue);
      px(ctx, x + 14, y + 12, 3, 3, PAL.red);
      px(ctx, x + 9, y + 19, 7, 2, PAL.gray);
      break;

    /* ---------------- mesin kopi ---------------- */
    case 'coffee':
      px(ctx, x + 3, y, 18, 24, PAL.ink3);
      px(ctx, x + 4, y + 1, 16, 12, PAL.ink2);
      px(ctx, x + 6, y + 3, 8, 8, '#6b4a2a');
      px(ctx, x + 15, y + 3, 3, 3, PAL.green);
      px(ctx, x + 5, y + 15, 14, 8, PAL.gray2);
      px(ctx, x + 8, y + 17, 8, 3, PAL.white);
      px(ctx, x + 9, y + 20, 4, 2, PAL.brown);
      break;

    /* ---------------- papan tulis ---------------- */
    case 'board':
      px(ctx, x + 2, y - 6, 20, 20, PAL.gray2);
      px(ctx, x + 3, y - 5, 18, 18, PAL.paper);
      px(ctx, x + 5, y - 3, 8, 1, PAL.blue);
      px(ctx, x + 5, y, 12, 1, PAL.gray);
      px(ctx, x + 5, y + 3, 10, 1, PAL.gray);
      px(ctx, x + 15, y + 1, 4, 4, PAL.yellow);
      px(ctx, x + 5, y + 6, 6, 1, PAL.red);
      break;

    /* ---------------- sofa ruang tunggu ---------------- */
    case 'sofa':
      px(ctx, x, y - 2, 24, 8, PAL.teal2);
      px(ctx, x, y + 4, 24, 8, PAL.teal);
      px(ctx, x + 1, y + 12, 22, 8, PAL.teal2);
      px(ctx, x + 2, y + 5, 9, 6, '#3fc0a0');
      px(ctx, x + 13, y + 5, 9, 6, '#3fc0a0');
      px(ctx, x + 1, y + 20, 3, 3, PAL.dark2);
      px(ctx, x + 20, y + 20, 3, 3, PAL.dark2);
      break;

    /* ---------------- meja resepsionis ---------------- */
    case 'reception':
      px(ctx, x + 2, y + 2, 20, 20, '#e6ebf5');
      px(ctx, x + 2, y + 2, 20, 2, '#ffffff');
      px(ctx, x + 3, y + 5, 18, 15, PAL.blue2);
      px(ctx, x + 3, y + 5, 18, 1, PAL.blue);
      px(ctx, x + 6, y + 8, 12, 6, '#ffffff');
      px(ctx, x + 7, y + 9, 10, 4, PAL.cyan);
      break;

    /* ---------------- meja lab / komputer server ---------------- */
    case 'labdesk':
      px(ctx, x - 2, y + 4, 28, 4, PAL.gray3);
      px(ctx, x - 2, y + 8, 28, 15, PAL.gray2);
      px(ctx, x + 2, y - 6, 20, 10, PAL.dark2);
      for (let i = 0; i < 4; i++) px(ctx, x + 4 + i * 5, y - 4, 4, 6, '#1f2f4a');
      px(ctx, x + 4, y - 4, 4, 2, PAL.cyan);
      px(ctx, x + 9, y - 4, 4, 2, PAL.green);
      px(ctx, x + 14, y - 4, 4, 2, PAL.orange);
      px(ctx, x + 6, y + 2, 14, 2, PAL.dark2);
      break;

    /* ---------------- robot kecil (AI companion) ---------------- */
    case 'robot':
      px(ctx, x + 3, y + 2, 10, 8, PAL.gray3);
      px(ctx, x + 4, y + 3, 8, 6, PAL.off);
      px(ctx, x + 5, y + 5, 2, 2, PAL.cyan);
      px(ctx, x + 9, y + 5, 2, 2, PAL.cyan);
      px(ctx, x + 6, y + 10, 4, 3, PAL.gray);
      px(ctx, x + 2, y, 12, 2, PAL.gray2);
      px(ctx, x + 7, y - 3, 2, 3, PAL.gray2);
      px(ctx, x + 6, y - 4, 4, 2, PAL.red);
      px(ctx, x + 3, y + 13, 3, 2, PAL.gray2);
      px(ctx, x + 10, y + 13, 3, 2, PAL.gray2);
      break;

    /* ---------------- penanda level / lift ---------------- */
    case 'sign':
      px(ctx, x + 1, y + 6, 22, 12, PAL.ink2);
      px(ctx, x + 2, y + 7, 20, 10, PAL.yellow);
      px(ctx, x + 5, y + 9, 14, 2, PAL.ink2);
      px(ctx, x + 5, y + 13, 9, 2, PAL.ink2);
      px(ctx, x + 11, y, 2, 6, PAL.gray2);
      break;

    /* ---------------- blob bayangan ---------------- */
    case 'shadow':
      ctx.fillStyle = 'rgba(20,22,34,0.25)';
      ctx.beginPath();
      ctx.ellipse(x + TILE / 2, y + TILE - 3, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      break;
  }
}

/* ------------------------------ KARAKTER -------------------------------- */
/* Karakter 16x22 px. Konfigurasi warna & atribut profesi.              */

const CHAR_W = 16;
const CHAR_H = 22;

function hairSprite(ctx, style, color, dir) {
  const d = (x, y, w, h, c) => px(ctx, x, y, w, h, c || color);
  switch (style) {
    case 'spiky':
      d(4, 1, 8, 2);
      d(3, 0, 2, 3);
      d(6, 0, 3, 2);
      d(10, 0, 2, 3);
      d(3, 3, 10, 1);
      d(3, 2, 1, 3);
      d(12, 2, 1, 3);
      d(5, 1, 2, 1, '#ffffff33');
      break;
    case 'bob':
      d(3, 1, 10, 3);
      d(2, 2, 2, 5);
      d(12, 2, 2, 5);
      d(3, 3, 10, 1, '#ffffff22');
      break;
    case 'pony':
      d(3, 1, 10, 3);
      d(3, 3, 10, 1);
      d(2, 3, 2, 4);
      d(12, 3, 2, 4);
      d(13, 5, 2, 5);
      d(14, 7, 2, 4);
      break;
    case 'long':
      d(3, 1, 10, 3);
      d(2, 2, 12, 5);
      d(2, 7, 2, 3);
      d(12, 7, 2, 3);
      break;
    case 'cap':
      d(3, 0, 10, 3);
      d(2, 2, 12, 2);
      d(2, 4, 12, 1, '#00000044');
      d(3, 0, 10, 1, '#ffffff33');
      break;
    default: /* short */
      d(3, 1, 10, 3);
      d(3, 3, 10, 1);
      d(3, 4, 1, 3);
      d(12, 4, 1, 3);
      d(4, 1, 4, 1, '#ffffff33');
      break;
  }
  if (dir === 'up') {
    /* rambut menutupi wajah saat membelakangi kamera */
    px(ctx, 4, 4, 8, 3, color);
  }
}

function accessory(ctx, acc, dir) {
  switch (acc) {
    case 'glasses':
      px(ctx, 4, 5, 3, 2, '#2b3346');
      px(ctx, 9, 5, 3, 2, '#2b3346');
      px(ctx, 7, 5, 2, 1, '#2b3346');
      px(ctx, 5, 5, 1, 1, '#bfe6fa');
      px(ctx, 10, 5, 1, 1, '#bfe6fa');
      break;
    case 'headset':
      px(ctx, 3, 1, 10, 2, '#2b3346');
      px(ctx, 2, 3, 2, 4, '#3a4258');
      px(ctx, 12, 3, 2, 4, '#3a4258');
      px(ctx, 3, 7, 2, 2, '#3a4258');
      px(ctx, 2, 4, 1, 2, PAL.cyan);
      break;
    case 'tie':
      px(ctx, 7, 9, 2, 2, '#c9333f');
      px(ctx, 7, 11, 2, 5, '#e04b57');
      px(ctx, 7, 15, 2, 1, '#a8262f');
      break;
    case 'badge':
      px(ctx, 5, 10, 3, 4, PAL.off);
      px(ctx, 6, 11, 1, 2, PAL.blue);
      break;
    case 'hood':
      px(ctx, 3, 8, 10, 3, '#2f4a6b');
      px(ctx, 3, 8, 10, 1, '#3d5f86');
      break;
    case 'bandana':
      px(ctx, 3, 2, 10, 3, '#c9333f');
      px(ctx, 3, 2, 10, 1, '#e0576a');
      px(ctx, 12, 3, 3, 1, '#c9333f');
      break;
    case 'labcoat':
      px(ctx, 4, 10, 8, 5, PAL.off);
      px(ctx, 7, 10, 2, 5, PAL.gray3);
      px(ctx, 5, 11, 1, 3, PAL.gray3);
      break;
    case 'hoodie':
      px(ctx, 4, 10, 8, 6, '#39415c');
      px(ctx, 7, 12, 2, 4, '#4a5473');
      px(ctx, 5, 13, 1, 3, '#2b3244');
      px(ctx, 10, 13, 1, 3, '#2b3244');
      break;
    case 'hacker':
      px(ctx, 3, 9, 10, 4, '#232838');
      px(ctx, 4, 10, 8, 5, '#2c3247');
      px(ctx, 4, 12, 3, 1, PAL.green);
      px(ctx, 9, 14, 3, 1, PAL.green2);
      break;
    case 'stylus':
      px(ctx, 13, 12, 2, 6, PAL.purple2);
      px(ctx, 13, 11, 2, 2, PAL.purple);
      break;
    case 'wrench':
      px(ctx, 13, 11, 2, 7, '#b8becd');
      px(ctx, 12, 10, 4, 2, '#d6dbe6');
      px(ctx, 13, 18, 2, 1, '#8b92a3');
      break;
    case 'tablet':
      px(ctx, 1, 12, 5, 6, PAL.dark);
      px(ctx, 2, 13, 3, 4, PAL.cyan);
      break;
    case 'folder':
      px(ctx, 1, 12, 6, 5, PAL.yellow2);
      px(ctx, 1, 11, 6, 1, PAL.yellow);
      break;
    case 'palette':
      px(ctx, 12, 12, 6, 6, '#c98a52');
      px(ctx, 13, 12, 5, 5, '#e0a870');
      px(ctx, 13, 13, 1, 1, PAL.red);
      px(ctx, 15, 13, 1, 1, PAL.blue);
      px(ctx, 13, 15, 1, 1, PAL.yellow);
      break;
    case 'flask':
      px(ctx, 13, 12, 4, 5, '#cfe9ff');
      px(ctx, 13, 15, 4, 2, PAL.teal);
      px(ctx, 14, 10, 2, 2, '#cfe9ff');
      break;
    case 'cable': /* gulungan kabel LAN di tangan */
      px(ctx, 12, 11, 4, 6, PAL.yellow2);
      px(ctx, 12, 12, 4, 4, PAL.yellow);
      px(ctx, 13, 13, 2, 2, '#8a6a10');
      px(ctx, 12, 16, 4, 1, PAL.ink2);
      px(ctx, 15, 9, 1, 3, PAL.yellow);
      break;
    case 'shield':
      px(ctx, 12, 11, 5, 6, PAL.cyan2);
      px(ctx, 13, 12, 3, 4, PAL.cyan);
      px(ctx, 13, 13, 3, 1, PAL.white);
      break;
    default:
      break;
  }
}

/**
 * Menggambar karakter.
 * cfg: {skin, hair, hairStyle, top, topDark, pants, shoes, acc}
 */
export function drawChar(ctx, cfg, x, y, opts = {}) {
  const dir = opts.dir || 'down';
  const step = opts.step || 0;      /* frame jalan 0..3 */
  const bob = step % 2 ? 0 : (opts.moving ? -1 : 0);
  const c = Object.assign({
    skin: PAL.skin, hair: PAL.hairD, hairStyle: 'short',
    top: PAL.blue, topDark: PAL.blue2, pants: PAL.ink3, shoes: PAL.dark,
    acc: null, outline: PAL.ink
  }, cfg || {});

  const X = x, Y = y + bob;
  const legShift = opts.moving ? (step % 4 < 2 ? 1 : -1) : 0;

  /* bayangan */
  ctx.fillStyle = 'rgba(20,22,34,0.22)';
  ctx.beginPath();
  ctx.ellipse(X + 8, y + CHAR_H - 1, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  /* outline tubuh */
  px(ctx, X + 3, Y + 9, 10, 7, c.outline);
  px(ctx, X + 4, Y + 16, 8, 6, c.outline);

  /* celana + kaki */
  px(ctx, X + 4, Y + 16, 3, 5 + legShift, c.pants);
  px(ctx, X + 9, Y + 16, 3, 5 - legShift, c.pants);
  px(ctx, X + 4, Y + 20 + legShift, 3, 2, c.shoes);
  px(ctx, X + 9, Y + 20 - legShift, 3, 2, c.shoes);

  /* lengan */
  px(ctx, X + 2, Y + 10, 2, 5, c.topDark);
  px(ctx, X + 12, Y + 10, 2, 5, c.topDark);
  px(ctx, X + 2, Y + 14, 2, 2, c.skin2);
  px(ctx, X + 12, Y + 14, 2, 2, c.skin2);

  /* badan / kemeja */
  px(ctx, X + 4, Y + 10, 8, 5, c.top);
  px(ctx, X + 4, Y + 10, 8, 1, '#ffffff26');
  px(ctx, X + 4, Y + 15, 8, 1, c.topDark);

  /* kepala */
  px(ctx, X + 4, Y + 1, 8, 9, c.outline);
  px(ctx, X + 5, Y + 2, 6, 7, c.skin);
  px(ctx, X + 4, Y + 2, 1, 6, c.skin2);
  px(ctx, X + 11, Y + 2, 1, 6, c.skin2);
  px(ctx, X + 5, Y + 9, 6, 1, c.skin2);

  /* leher */
  px(ctx, X + 6, Y + 9, 4, 1, c.skin3);

  if (dir !== 'up') {
    const eyeY = Y + 5;
    if (dir === 'left') {
      px(ctx, X + 5, eyeY, 2, 2, PAL.ink);
      px(ctx, X + 8, eyeY, 1, 1, c.skin3);
    } else if (dir === 'right') {
      px(ctx, X + 9, eyeY, 2, 2, PAL.ink);
      px(ctx, X + 7, eyeY, 1, 1, c.skin3);
    } else {
      px(ctx, X + 5, eyeY, 2, 2, PAL.ink);
      px(ctx, X + 9, eyeY, 2, 2, PAL.ink);
      px(ctx, X + 6, eyeY, 1, 1, PAL.white);
    }
    px(ctx, X + 7, Y + 8, 2, 1, c.skin3);
  }

  ctx.save();
  ctx.translate(X, Y);
  hairSprite(ctx, c.hairStyle, c.hair, dir);
  accessory(ctx, c.acc, dir);
  ctx.restore();
}

/* --------------------------- IKON PROFESI (16x16) ------------------------ */
export function drawIcon(ctx, kind, x, y) {
  const c = (col, rx, ry, rw, rh) => px(ctx, x + rx, y + ry, rw, rh, col);
  c(PAL.ink, 0, 0, 16, 16);
  switch (kind) {
    case 'itsupport':
      c('#4a5473', 1, 1, 14, 14);
      c('#c9d0dd', 4, 3, 8, 3);
      c('#c9d0dd', 5, 3, 2, 6);
      c('#8d94a8', 6, 8, 5, 3);
      c('#e05252', 9, 10, 4, 3);
      c('#f2c94c', 3, 11, 4, 3);
      break;
    case 'webdev':
      c('#3f7fd6', 1, 1, 14, 14);
      c(PAL.off, 2, 3, 12, 10);
      c(PAL.blue2, 2, 3, 12, 2);
      c(PAL.gray3, 3, 8, 5, 1);
      c(PAL.gray3, 3, 10, 8, 1);
      c(PAL.orange, 9, 6, 4, 4);
      break;
    case 'graphic':
      c('#7a5ac1', 1, 1, 14, 14);
      c('#e0a870', 3, 3, 10, 10);
      c(PAL.red, 4, 4, 2, 2);
      c(PAL.blue, 8, 4, 2, 2);
      c(PAL.yellow, 4, 8, 2, 2);
      c(PAL.green, 8, 8, 2, 2);
      c(PAL.off, 6, 6, 3, 3);
      break;
    case 'network':
      c('#2fa98a', 1, 1, 14, 14);
      c('#cfe9ff', 7, 2, 2, 12);
      c('#cfe9ff', 2, 7, 12, 2);
      c(PAL.ink, 5, 5, 6, 6);
      c(PAL.yellow, 6, 6, 4, 4);
      c(PAL.off, 3, 3, 2, 2);
      c(PAL.off, 11, 11, 2, 2);
      break;
    case 'dba':
      c('#2d61ac', 1, 1, 14, 14);
      c('#dfe6f5', 3, 3, 10, 3);
      c('#b9c6e6', 3, 6, 10, 3);
      c('#8f9fc9', 3, 9, 10, 4);
      c(PAL.ink, 3, 12, 10, 1);
      c(PAL.green, 5, 4, 2, 1);
      break;
    case 'data':
      c('#3f9950', 1, 1, 14, 14);
      c(PAL.off, 3, 9, 3, 4);
      c(PAL.yellow, 6, 6, 3, 7);
      c(PAL.orange, 9, 3, 3, 10);
      c(PAL.ink, 3, 13, 10, 1);
      break;
    case 'se':
      c('#4a5473', 1, 1, 14, 14);
      c(PAL.cyan, 4, 4, 2, 8);
      c(PAL.cyan, 4, 4, 5, 2);
      c(PAL.cyan, 4, 10, 5, 2);
      c(PAL.green, 10, 5, 2, 6);
      break;
    case 'uiux':
      c('#9a6ee0', 1, 1, 14, 14);
      c(PAL.off, 3, 3, 10, 7);
      c(PAL.purple2, 3, 3, 10, 2);
      c(PAL.gray3, 4, 6, 4, 1);
      c(PAL.gray3, 4, 8, 6, 1);
      c(PAL.yellow, 10, 11, 3, 3);
      c(PAL.ink, 9, 10, 5, 1);
      break;
    case 'cyber':
      c('#20242f', 1, 1, 14, 14);
      c('#48c7d8', 8, 2, 4, 12);
      c('#2f9aab', 4, 2, 4, 12);
      c(PAL.off, 5, 5, 2, 2);
      c(PAL.off, 9, 5, 2, 2);
      c(PAL.green, 6, 9, 4, 1);
      break;
    case 'ai':
      c('#b05ce0', 1, 1, 14, 14);
      c(PAL.off, 4, 4, 8, 8);
      c('#9a6ee0', 5, 5, 6, 6);
      c(PAL.off, 3, 7, 1, 2);
      c(PAL.off, 12, 7, 1, 2);
      c(PAL.yellow, 6, 7, 1, 1);
      c(PAL.yellow, 9, 7, 1, 1);
      c(PAL.ink, 3, 2, 10, 1);
      break;
    default:
      c(PAL.gray, 2, 2, 12, 12);
      break;
  }
  c(PAL.ink, 0, 0, 16, 1);
  c(PAL.ink, 0, 15, 16, 1);
  c(PAL.ink, 0, 0, 1, 16);
  c(PAL.ink, 15, 0, 1, 16);
}

/* ---------------------------- OBJEK DEKORASI ---------------------------- */
export function drawMarker(ctx, x, y, t) {
  const bob = Math.sin(t * 4) * 3;
  const baseY = y + bob;
  /* balon tanda seru */
  px(ctx, x - 7, baseY - 22, 14, 16, PAL.ink);
  px(ctx, x - 6, baseY - 21, 12, 14, PAL.yellow);
  px(ctx, x - 6, baseY - 21, 12, 2, '#fff2b8');
  px(ctx, x - 2, baseY - 19, 4, 8, PAL.ink);
  px(ctx, x - 2, baseY - 10, 4, 3, PAL.ink);
  px(ctx, x - 2, baseY - 6, 4, 2, PAL.ink);
  px(ctx, x - 6, baseY - 7, 12, 1, PAL.yellow2);
}

export function drawSparkle(ctx, x, y, t, color = PAL.yellow) {
  const s = Math.sin(t * 3) * 0.5 + 0.5;
  const a = 1 + s * 2;
  px(ctx, x - a, y, a * 2, 1, color);
  px(ctx, x, y - a, 1, a * 2, color);
}

/** Logo kecil "CQ" untuk keperluan kanvas. */
export function drawLogoMark(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  px(ctx, 0, 0, 32, 32, PAL.ink);
  px(ctx, 2, 2, 28, 28, PAL.blue2);
  px(ctx, 4, 4, 24, 24, PAL.blue);
  /* bentuk joystick/scroll */
  px(ctx, 8, 12, 16, 10, PAL.off);
  px(ctx, 10, 9, 12, 4, PAL.gray3);
  px(ctx, 11, 15, 4, 4, PAL.red);
  px(ctx, 17, 15, 4, 4, PAL.yellow);
  px(ctx, 5, 5, 6, 2, PAL.cyan);
  ctx.restore();
}

export const CHAR_SIZE = { w: CHAR_W, h: CHAR_H };
