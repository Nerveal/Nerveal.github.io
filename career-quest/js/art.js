/* ==========================================================================
 * Career Quest - art.js  (v2 - desain mengikuti mockup referensi)
 *
 * Seluruh aset visual (pixel art) digambar secara prosedural dengan Canvas 2D.
 * Gaya: pixel art tegas, tampak depan, palet biru-kaca + kayu hangat + aksen
 * oranye/biru/merah/emas. Tile 32x32 px, karakter 24x36 px (chibi).
 *
 * Tidak ada akses DOM di berkas ini (hanya objek canvas context), sehingga
 * dapat diuji langsung memakai node-canvas.
 * ==========================================================================
 */

export const TILE = 32;
export const VIEW_W = 640;        /* 20 tile */
export const VIEW_H = 384;        /* 12 tile */

/* ------------------------------- PALET ---------------------------------- */
export const PAL = {
  /* garis & bayangan */
  ink: '#1c2130',
  ink2: '#2a3244',
  ink3: '#3b465e',
  shadow: 'rgba(20,26,40,0.28)',

  white: '#ffffff',
  off: '#f2f6fb',
  paper: '#fbfcfe',
  panel: '#e6ecf5',
  panel2: '#cdd7e6',
  gray: '#93a0b5',
  gray2: '#6b788e',
  gray3: '#b9c4d4',

  /* langit & gedung kaca (jendela kantor) */
  sky: '#8fc4e8',
  sky2: '#6ba7d3',
  sky3: '#a9d8f2',
  glass: '#bfe0f2',
  glass2: '#9ccbe6',
  glass3: '#dcf0fa',
  city: '#7fa8c9',
  city2: '#a8c6dd',

  /* UI chrome */
  navy: '#243b5e',
  navy2: '#182b47',
  navy3: '#31517d',
  iron: '#4a6a9a',
  iron2: '#3a5580',
  iron3: '#6f92c2',
  orange: '#e07b3c',
  orange2: '#b85f26',
  orange3: '#f2a066',
  red: '#b8493f',
  red2: '#8f342c',
  red3: '#d06a5e',
  gold: '#f2c14e',
  gold2: '#c99a26',
  gold3: '#ffe6a8',
  teal: '#4fb3a5',
  teal2: '#38897e',
  green: '#6fae5a',
  green2: '#528b40',

  /* lantai & dinding kantor */
  floor: '#d9d3c7',
  floor2: '#c7c0b3',
  floorLine: '#b5ad9e',
  floorDark: '#8e98aa',
  wallTop: '#9aa4b6',
  wallTop2: '#69768d',
  wallFace: '#b8c0cd',
  wallFace2: '#a3abb8',
  baseboard: '#5f6b80',

  /* karpet zona */
  carpetG: '#6fae5a',
  carpetG2: '#58923f',
  carpetB: '#5b86c4',
  carpetB2: '#4569a4',
  carpetR: '#b85a52',
  carpetR2: '#96433c',
  carpetP: '#8a6fc0',
  carpetP2: '#6d55a1',
  carpetY: '#d9b04c',
  carpetY2: '#b08c30',

  /* lantai kayu & lantai server */
  wood: '#d3a068',
  wood2: '#b9814a',
  wood3: '#95633a',
  dark: '#4c5a72',
  dark2: '#3a465c',
  darkFloor: '#5d6c86',
  darkFloor2: '#4b5a72',

  /* perangkat */
  screen: '#2f6bb0',
  screen2: '#4a90d9',
  screenDark: '#1e3350',
  screenLight: '#a8dcff',
  beige: '#dcd6c4',
  beige2: '#b8b0a0',

  /* karakter: warna kulit */
  skin: '#f6cfae',
  skin2: '#e3b189',
  skin3: '#c08a5e',
  skin4: '#966744',
  skin5: '#6d472c',
  skinHi: '#ffe3c9',

  /* karakter: warna rambut */
  hairD: '#2b2620',
  hairB: '#6b4526',
  hairY: '#e8c964',
  hairR: '#b5562f',
  hairG: '#c8ccd6',
  hairP: '#8a5cba',
  hairA: '#a8845c',

  /* karakter: pakaian */
  shirtWhite: '#f4f7fb',
  denim: '#3f5f8f',
  denim2: '#2f4a72',
  bomber: '#2f3a52',
  bomber2: '#222b3e',
  hoodie: '#454f6b',
  hoodie2: '#333c54',
  blazer: '#3a4a6b',
  blazer2: '#2b3852',
  vest: '#8a6a3a',
  vest2: '#6d5129',
  sneaker: '#eef2f8',
  sneaker2: '#c3cbd8',
  formal: '#2b2f3a',
  boot: '#5a4530'
};

/* --------------------------- HELPER MENGGAMBAR -------------------------- */
export function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Menulis teks pixel dengan garis tepi (dipakai untuk label zona & papan nama). */
export function drawText(ctx, text, x, y, opts = {}) {
  const size = opts.size || 8;
  const weight = opts.weight || 'bold';
  ctx.save();
  ctx.font = weight + ' ' + size + 'px monospace';
  ctx.textAlign = opts.align || 'left';
  ctx.textBaseline = opts.baseline || 'top';
  if (opts.outline !== false) {
    ctx.lineWidth = opts.outlineWidth || 3;
    ctx.strokeStyle = opts.outlineColor || PAL.navy2;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = opts.color || PAL.white;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/* ------------------------------- TILES ---------------------------------- */
/* Setiap tile 32x32 px.                                                     */
export function drawTile(ctx, kind, x, y) {
  switch (kind) {
    /* dinding dalam ruangan */
    case '#':
      px(ctx, x, y, TILE, TILE, PAL.wallFace);
      px(ctx, x, y, TILE, 10, PAL.wallTop);
      px(ctx, x, y + 10, TILE, 3, PAL.baseboard);
      px(ctx, x, y + TILE - 3, TILE, 3, PAL.wallFace2);
      px(ctx, x + 2, y + 15, 6, 2, PAL.wallFace2);
      px(ctx, x + 20, y + 22, 8, 2, PAL.wallFace2);
      break;

    /* dinding berjendela: pemandangan gedung kaca (seperti mockup) */
    case 'w':
      px(ctx, x, y - 8, TILE, TILE + 8, PAL.wallTop2);
      px(ctx, x + 1, y - 6, TILE - 2, 30, PAL.glass);
      px(ctx, x + 1, y - 6, TILE - 2, 8, PAL.sky3);
      /* gedung-gedung kecil di kejauhan */
      px(ctx, x + 3, y - 1, 6, 24, PAL.city);
      px(ctx, x + 11, y + 3, 7, 20, PAL.city2);
      px(ctx, x + 21, y - 2, 6, 25, PAL.city);
      px(ctx, x + 4, y + 2, 2, 2, PAL.glass3);
      px(ctx, x + 12, y + 6, 2, 2, PAL.glass3);
      px(ctx, x + 22, y + 2, 2, 2, PAL.glass3);
      px(ctx, x + 4, y + 8, 2, 2, PAL.glass3);
      px(ctx, x + 13, y + 12, 2, 2, PAL.glass3);
      /* rangka jendela */
      px(ctx, x + 1, y + 8, TILE - 2, 2, PAL.gray2);
      px(ctx, x + 15, y - 6, 2, 30, PAL.gray2);
      px(ctx, x + 1, y + 23, TILE - 2, 3, PAL.wallFace);
      px(ctx, x, y + 26, TILE, 6, PAL.wallFace2);
      break;

    /* lantai kantor berpetak */
    case '.':
      px(ctx, x, y, TILE, TILE, PAL.floor);
      px(ctx, x, y + TILE - 2, TILE, 2, PAL.floorLine);
      px(ctx, x + TILE - 2, y, 2, TILE, PAL.floorLine);
      px(ctx, x + 4, y + 6, 3, 3, PAL.floor2);
      px(ctx, x + 20, y + 18, 3, 3, PAL.floor2);
      px(ctx, x + 12, y + 24, 2, 2, PAL.floor2);
      break;

    /* lantai kayu hangat (ruang kerja level atas) */
    case ',':
      px(ctx, x, y, TILE, TILE, PAL.wood);
      px(ctx, x, y + 8, TILE, 2, PAL.wood2);
      px(ctx, x, y + 20, TILE, 2, PAL.wood2);
      px(ctx, x + 10, y + 12, 2, 8, PAL.wood2);
      px(ctx, x + 24, y, 2, 8, PAL.wood2);
      break;

    /* karpet zona (hijau, biru, merah, ungu, kuning) */
    case 'g': carpet(ctx, x, y, PAL.carpetG, PAL.carpetG2); break;
    case 'b': carpet(ctx, x, y, PAL.carpetB, PAL.carpetB2); break;
    case 'r': carpet(ctx, x, y, PAL.carpetR, PAL.carpetR2); break;
    case 'p': carpet(ctx, x, y, PAL.carpetP, PAL.carpetP2); break;
    case 'y': carpet(ctx, x, y, PAL.carpetY, PAL.carpetY2); break;

    /* lantai ruang server */
    case 'd':
      px(ctx, x, y, TILE, TILE, PAL.darkFloor);
      px(ctx, x, y, TILE, 2, PAL.darkFloor2);
      px(ctx, x + 2, y + 2, TILE - 4, TILE - 4, '#57657f');
      px(ctx, x + 6, y + 8, 4, 2, PAL.darkFloor2);
      px(ctx, x + 18, y + 20, 6, 2, PAL.darkFloor2);
      break;

    /* pintu biasa */
    case 'D':
      px(ctx, x, y, TILE, TILE, PAL.wallFace);
      px(ctx, x + 3, y + 2, TILE - 6, TILE - 2, PAL.wood2);
      px(ctx, x + 5, y + 5, TILE - 10, 12, PAL.wood3);
      px(ctx, x + 5, y + 19, TILE - 10, 10, PAL.wood3);
      px(ctx, x + TILE - 9, y + 16, 3, 3, PAL.gold);
      break;

    /* pintu lift logam */
    case 'e':
      px(ctx, x, y - 6, TILE, TILE + 6, PAL.gray2);
      px(ctx, x + 2, y - 4, TILE - 4, TILE + 4, PAL.gray3);
      px(ctx, x + 2, y - 4, TILE - 4, 3, PAL.off);
      px(ctx, x + TILE / 2 - 1, y - 4, 3, TILE + 3, PAL.gray);
      px(ctx, x + 5, y - 2, 4, 4, PAL.teal);
      px(ctx, x + 12, y - 2, 4, 4, PAL.gold);
      break;

    default:
      px(ctx, x, y, TILE, TILE, PAL.floor);
      px(ctx, x, y + TILE - 2, TILE, 2, PAL.floorLine);
      break;
  }
}

function carpet(ctx, x, y, c1, c2) {
  px(ctx, x, y, TILE, TILE, c1);
  px(ctx, x, y, TILE, 1, c2);
  px(ctx, x + 2, y + 3, 4, 1, c2);
  px(ctx, x + 14, y + 9, 5, 1, c2);
  px(ctx, x + 6, y + 18, 4, 1, c2);
  px(ctx, x + 20, y + 24, 5, 1, c2);
  px(ctx, x + 8, y + 12, 3, 1, c2);
}

/* -------------------------------- PROPS --------------------------------- */
/* Semua props digambar dengan anchor kiri-atas pada koordinat tile.
   Banyak props menggambar ke ATAS (y negatif) karena tampak depan.        */

export const PROP_SOLID = {
  desk: { w: 2, h: 1 }, deskSmall: { w: 1, h: 1 },
  monitor: { w: 1, h: 1 }, monitorBank: { w: 1, h: 1 }, dualMonitor: { w: 1, h: 1 },
  designMonitor: { w: 1, h: 1 }, laptop: { w: 1, h: 1 }, terminal: { w: 1, h: 1 },
  chair: { w: 1, h: 1 }, cabinet: { w: 1, h: 1 }, cooler: { w: 1, h: 1 },
  printer: { w: 1, h: 1 }, sofa: { w: 2, h: 1 }, reception: { w: 2, h: 1 },
  serverRack: { w: 1, h: 1 }, networkRack: { w: 2, h: 1 }, switchBox: { w: 1, h: 1 },
  plantTall: { w: 1, h: 1 }, plantSmall: { w: 1, h: 1 }, whiteboard: { w: 2, h: 1 },
  robot: { w: 1, h: 1 }, toolbox: { w: 0, h: 0 }, cableTray: { w: 1, h: 1 },
  partitionGlass: { w: 1, h: 1 }, sign: { w: 1, h: 1 }, tableSmall: { w: 1, h: 1 },
  coffeeTable: { w: 1, h: 1 }, copyTray: { w: 0, h: 0 }, stickers: { w: 0, h: 0 }
};

export function drawProp(ctx, kind, x, y, t = 0) {
  switch (kind) {
    /* ---------------- meja kerja kayu (2 tile) ---------------- */
    case 'desk':
      /* bagian atas meja */
      px(ctx, x - 1, y + 8, TILE * 2 + 2, 6, PAL.wood);
      px(ctx, x - 1, y + 8, TILE * 2 + 2, 2, '#e0b483');
      px(ctx, x - 1, y + 14, TILE * 2 + 2, 2, PAL.wood2);
      /* panel depan + laci */
      px(ctx, x + 1, y + 16, TILE * 2 - 2, 14, PAL.wood2);
      px(ctx, x + 3, y + 18, 20, 10, PAL.wood3);
      px(ctx, x + 26, y + 18, 20, 10, PAL.wood3);
      px(ctx, x + 10, y + 22, 6, 2, PAL.gold2);
      px(ctx, x + 33, y + 22, 6, 2, PAL.gold2);
      /* kaki meja */
      px(ctx, x + 3, y + 30, 4, 2, PAL.wood3);
      px(ctx, x + TILE * 2 - 7, y + 30, 4, 2, PAL.wood3);
      break;

    case 'deskSmall':
      px(ctx, x + 2, y + 10, TILE - 4, 5, PAL.wood);
      px(ctx, x + 2, y + 10, TILE - 4, 2, '#e0b483');
      px(ctx, x + 4, y + 15, TILE - 8, 14, PAL.wood2);
      px(ctx, x + 6, y + 17, 8, 10, PAL.wood3);
      px(ctx, x + 18, y + 17, 8, 10, PAL.wood3);
      break;

    /* meja tamu kecil */
    case 'tableSmall':
      px(ctx, x + 2, y + 12, TILE - 4, 5, PAL.wood);
      px(ctx, x + 4, y + 17, TILE - 8, 13, PAL.wood2);
      px(ctx, x + 9, y + 8, 12, 5, PAL.paper);
      px(ctx, x + 10, y + 9, 10, 3, PAL.gray3);
      break;

    case 'coffeeTable':
      px(ctx, x + 2, y + 14, TILE - 4, 5, PAL.wood2);
      px(ctx, x + 4, y + 19, 4, 11, PAL.wood3);
      px(ctx, x + TILE - 8, y + 19, 4, 11, PAL.wood3);
      px(ctx, x + 11, y + 10, 8, 4, PAL.paper);
      break;

    /* ---------------- perangkat di atas meja ---------------- */
    case 'monitor': /* monitor tunggal */
      px(ctx, x + 6, y - 18, 20, 16, PAL.ink2);
      px(ctx, x + 7, y - 17, 18, 14, PAL.screen);
      px(ctx, x + 8, y - 16, 16, 12, PAL.screen2);
      px(ctx, x + 9, y - 15, 6, 2, PAL.screenLight);
      px(ctx, x + 9, y - 11, 12, 2, '#2b5c96');
      px(ctx, x + 9, y - 7, 8, 2, '#2b5c96');
      px(ctx, x + 14, y - 2, 5, 3, PAL.ink2);
      px(ctx, x + 10, y + 1, 13, 3, PAL.gray2);
      break;

    case 'monitorBank': /* tiga monitor berdampingan (analis data) */
      for (let i = 0; i < 3; i++) {
        const mx = x + 4 + (i - 1) * 20;
        const my = y - 20 + (i === 1 ? -3 : 0);
        px(ctx, mx, my, 20, 17, PAL.ink2);
        px(ctx, mx + 1, my + 1, 18, 15, PAL.screen);
        px(ctx, mx + 2, my + 2, 16, 13, PAL.screen2);
        /* grafik batang */
        for (let b = 0; b < 4; b++) {
          const bh = 3 + ((b * 3 + i) % 5);
          px(ctx, mx + 4 + b * 4, my + 13 - bh, 3, bh, b % 2 ? PAL.gold : PAL.teal);
        }
        px(ctx, mx + 2, my + 2, 7, 1, PAL.screenLight);
      }
      px(ctx, x + 12, y - 2, 8, 3, PAL.ink2);
      break;

    case 'dualMonitor':
      for (let i = 0; i < 2; i++) {
        const mx = x + 3 + i * 16;
        px(ctx, mx, y - 18, 15, 15, PAL.ink2);
        px(ctx, mx + 1, y - 17, 13, 13, PAL.screen2);
        px(ctx, mx + 2, y - 16, 11, 11, PAL.screen);
        px(ctx, mx + 3, y - 15, 4, 1, PAL.screenLight);
        px(ctx, mx + 3, y - 12, 8, 1, '#2b5c96');
        px(ctx, mx + 3, y - 10, 6, 1, '#2b5c96');
      }
      px(ctx, x + 12, y - 3, 6, 4, PAL.ink2);
      break;

    case 'designMonitor': /* monitor desainer: penuh warna */
      px(ctx, x + 4, y - 20, 24, 19, PAL.ink2);
      px(ctx, x + 5, y - 19, 22, 17, PAL.screenDark);
      px(ctx, x + 6, y - 18, 20, 15, PAL.off);
      px(ctx, x + 8, y - 16, 7, 5, PAL.red);
      px(ctx, x + 17, y - 16, 7, 5, PAL.carpetB);
      px(ctx, x + 8, y - 9, 7, 5, PAL.gold);
      px(ctx, x + 17, y - 9, 7, 5, PAL.green);
      px(ctx, x + 16, y - 2, 4, 3, PAL.ink2);
      px(ctx, x + 12, y + 1, 12, 3, PAL.gray2);
      /* stylus pen di meja */
      px(ctx, x + 26, y + 3, 3, 6, PAL.purple2 || PAL.carpetP);
      break;

    case 'laptop':
      px(ctx, x + 8, y - 12, 17, 11, PAL.ink2);
      px(ctx, x + 9, y - 11, 15, 9, PAL.screenDark);
      px(ctx, x + 10, y - 10, 6, 1, PAL.green);
      px(ctx, x + 10, y - 8, 10, 1, PAL.teal);
      px(ctx, x + 10, y - 6, 8, 1, PAL.green);
      px(ctx, x + 6, y - 1, 21, 3, PAL.gray3);
      px(ctx, x + 6, y - 1, 21, 1, PAL.off);
      break;

    case 'terminal': /* terminal/PC untuk pemrogram */
      px(ctx, x + 5, y - 19, 22, 18, PAL.ink2);
      px(ctx, x + 6, y - 18, 20, 16, '#101823');
      for (let i = 0; i < 5; i++) {
        const lw = 4 + ((i * 5) % 12);
        px(ctx, x + 8, y - 16 + i * 3, lw, 1, i % 2 ? PAL.green : PAL.teal);
      }
      px(ctx, x + 20, y - 5, 2, 2, PAL.green);
      px(ctx, x + 15, y - 1, 4, 3, PAL.ink2);
      px(ctx, x + 11, y + 2, 12, 2, PAL.gray2);
      break;

    /* ---------------- kursi kerja ---------------- */
    case 'chair':
      px(ctx, x + 8, y - 10, 16, 14, PAL.ink3);       /* sandaran */
      px(ctx, x + 9, y - 9, 14, 12, PAL.ink2);
      px(ctx, x + 9, y - 9, 14, 2, '#4a5776');
      px(ctx, x + 6, y + 4, 20, 7, PAL.ink3);          /* dudukan */
      px(ctx, x + 7, y + 5, 18, 5, PAL.ink2);
      px(ctx, x + 14, y + 11, 4, 7, PAL.gray2);        /* tiang */
      px(ctx, x + 7, y + 18, 18, 3, PAL.gray2);        /* kaki */
      px(ctx, x + 5, y + 21, 5, 3, PAL.ink2);
      px(ctx, x + 22, y + 21, 5, 3, PAL.ink2);
      px(ctx, x + 13, y + 21, 6, 3, PAL.ink2);
      break;

    /* ---------------- rak server (2 tile tinggi) ---------------- */
    case 'serverRack':
      px(ctx, x + 3, y - 40, 26, 72, PAL.ink);
      px(ctx, x + 4, y - 39, 24, 70, PAL.ink3);
      px(ctx, x + 5, y - 38, 22, 68, '#39445c');
      for (let i = 0; i < 7; i++) {
        const oy = y - 36 + i * 10;
        px(ctx, x + 6, oy, 20, 8, '#2c3648');
        px(ctx, x + 7, oy + 1, 12, 6, '#1f2734');
        const on = (Math.floor(t * 3) + i) % 3;
        px(ctx, x + 20, oy + 2, 2, 2, on === 0 ? PAL.teal : PAL.teal2);
        px(ctx, x + 23, oy + 2, 2, 2, i % 2 ? PAL.gold : PAL.orange);
        px(ctx, x + 8, oy + 4, 3, 1, i % 3 ? PAL.green : PAL.gray2);
      }
      px(ctx, x + 3, y + 26, 26, 4, PAL.ink);
      px(ctx, x + 6, y + 30, 5, 3, PAL.ink2);
      px(ctx, x + 21, y + 30, 5, 3, PAL.ink2);
      break;

    /* rak jaringan: switch, kabel, patch panel (2 tile lebar) */
    case 'networkRack': {
      const W = TILE * 2;
      px(ctx, x + 2, y - 34, W - 4, 62, PAL.ink);
      px(ctx, x + 3, y - 33, W - 6, 60, PAL.ink3);
      /* switch & port */
      for (let r = 0; r < 3; r++) {
        const oy = y - 30 + r * 18;
        px(ctx, x + 5, oy, W - 10, 14, '#39445c');
        for (let p = 0; p < 10; p++) {
          px(ctx, x + 7 + p * 5, oy + 3, 4, 4, p % 3 === 0 ? PAL.gold : PAL.gray);
        }
        for (let l = 0; l < 4; l++) {
          px(ctx, x + 8 + l * 10, oy + 9, 2, 2, (r + l) % 2 ? PAL.teal : PAL.green);
        }
      }
      /* kabel menggantung */
      const cables = [PAL.carpetB, PAL.gold, PAL.red, PAL.teal];
      cables.forEach((c, i) => {
        const cx = x + 10 + i * 14;
        px(ctx, cx, y + 22, 2, 8, c);
        px(ctx, cx - 4, y + 30, 10, 2, c);
        px(ctx, cx - 5, y + 32, 3, 6, c);
        px(ctx, cx + 2, y + 32, 3, 6, c);
      });
      px(ctx, x + 2, y + 28, W - 4, 4, PAL.ink);
      break;
    }

    case 'switchBox':
      px(ctx, x + 4, y + 2, 24, 12, PAL.ink2);
      px(ctx, x + 5, y + 3, 22, 10, PAL.gray2);
      for (let p = 0; p < 6; p++) px(ctx, x + 7 + p * 3, y + 7, 2, 4, PAL.gold);
      px(ctx, x + 22, y + 4, 2, 2, PAL.green);
      break;

    case 'cableTray': /* tumpukan kabel di lantai */
      px(ctx, x + 3, y + 20, 26, 8, PAL.carpetB);
      px(ctx, x + 5, y + 24, 22, 6, PAL.gold2);
      px(ctx, x + 7, y + 28, 18, 4, PAL.red2);
      px(ctx, x + 9, y + 22, 6, 2, PAL.teal2);
      px(ctx, x + 16, y + 26, 8, 2, PAL.ink2);
      break;

    /* ---------------- furnitur lain ---------------- */
    case 'cabinet':
      px(ctx, x + 4, y + 2, 24, 30, PAL.gray2);
      px(ctx, x + 5, y + 3, 22, 28, PAL.gray3);
      for (let i = 0; i < 3; i++) {
        const oy = y + 5 + i * 9;
        px(ctx, x + 7, oy, 18, 7, '#a7b2c3');
        px(ctx, x + 13, oy + 2, 6, 2, PAL.gray2);
      }
      break;

    case 'cooler':
      px(ctx, x + 9, y - 4, 14, 14, PAL.sky3);
      px(ctx, x + 10, y - 3, 12, 12, PAL.sky2);
      px(ctx, x + 10, y - 3, 5, 4, PAL.glass3);
      px(ctx, x + 8, y + 10, 16, 22, PAL.off);
      px(ctx, x + 8, y + 10, 16, 3, PAL.gray3);
      px(ctx, x + 11, y + 15, 4, 4, PAL.carpetB);
      px(ctx, x + 18, y + 15, 4, 4, PAL.red);
      px(ctx, x + 12, y + 26, 8, 2, PAL.gray);
      break;

    case 'printer':
      px(ctx, x + 4, y + 6, 24, 14, PAL.off);
      px(ctx, x + 4, y + 6, 24, 3, PAL.gray3);
      px(ctx, x + 8, y - 2, 16, 8, PAL.paper);
      px(ctx, x + 10, y + 12, 12, 8, PAL.gray3);
      px(ctx, x + 12, y + 14, 8, 3, PAL.teal);
      px(ctx, x + 10, y + 20, 12, 8, PAL.paper);
      break;

    case 'sofa':
      px(ctx, x, y - 6, TILE * 2, 10, PAL.teal2);
      px(ctx, x + 2, y - 4, TILE * 2 - 4, 8, PAL.teal);
      px(ctx, x, y + 4, TILE * 2, 16, PAL.teal);
      px(ctx, x + 3, y + 6, 26, 12, '#63c4b5');
      px(ctx, x + 35, y + 6, 26, 12, '#63c4b5');
      px(ctx, x + 3, y + 20, 4, 8, PAL.ink2);
      px(ctx, x + TILE * 2 - 7, y + 20, 4, 8, PAL.ink2);
      break;

    case 'reception':
      px(ctx, x, y + 4, TILE * 2, 26, PAL.off);
      px(ctx, x, y + 4, TILE * 2, 3, PAL.white);
      px(ctx, x + 3, y + 9, TILE * 2 - 6, 17, PAL.navy3);
      px(ctx, x + 3, y + 9, TILE * 2 - 6, 2, PAL.iron3);
      px(ctx, x + 10, y + 14, 44, 8, PAL.white);
      px(ctx, x + 13, y + 16, 38, 4, PAL.sky2);
      px(ctx, x + 46, y - 12, 18, 14, PAL.navy2);
      px(ctx, x + 47, y - 11, 16, 12, PAL.navy3);
      break;

    case 'whiteboard':
      px(ctx, x + 2, y - 16, TILE * 2 - 4, 34, PAL.gray2);
      px(ctx, x + 3, y - 15, TILE * 2 - 6, 32, PAL.paper);
      px(ctx, x + 7, y - 11, 22, 2, PAL.carpetB);
      px(ctx, x + 7, y - 6, 16, 2, PAL.gray);
      px(ctx, x + 7, y - 1, 26, 2, PAL.gray);
      px(ctx, x + 40, y - 12, 12, 12, PAL.carpetG);
      px(ctx, x + 42, y - 10, 8, 8, PAL.green2);
      px(ctx, x + 7, y + 5, 20, 2, PAL.red3);
      px(ctx, x + 7, y + 10, 30, 2, PAL.gray);
      break;

    case 'plantTall':
      px(ctx, x + 8, y + 14, 16, 16, PAL.wood2);        /* pot */
      px(ctx, x + 8, y + 14, 16, 3, '#c98a54');
      px(ctx, x + 10, y + 17, 12, 11, PAL.wood3);
      px(ctx, x + 6, y + 2, 8, 12, PAL.green2);         /* daun */
      px(ctx, x + 18, y + 4, 8, 10, PAL.green2);
      px(ctx, x + 8, y - 6, 8, 10, PAL.green);
      px(ctx, x + 16, y - 4, 7, 9, PAL.green);
      px(ctx, x + 12, y - 8, 6, 8, '#7dc064');
      px(ctx, x + 10, y - 3, 2, 2, '#a4d98c');
      px(ctx, x + 19, y + 1, 2, 2, '#a4d98c');
      px(ctx, x + 14, y - 6, 2, 2, '#a4d98c');
      break;

    case 'plantSmall':
      px(ctx, x + 11, y + 20, 12, 11, PAL.wood2);
      px(ctx, x + 11, y + 20, 12, 3, '#c98a54');
      px(ctx, x + 9, y + 12, 7, 9, PAL.green2);
      px(ctx, x + 17, y + 13, 7, 8, PAL.green);
      px(ctx, x + 12, y + 9, 6, 7, '#7dc064');
      px(ctx, x + 12, y + 12, 2, 2, '#a4d98c');
      break;

    case 'robot':
      px(ctx, x + 9, y + 12, 14, 12, PAL.gray3);
      px(ctx, x + 10, y + 13, 12, 10, PAL.off);
      px(ctx, x + 12, y + 16, 3, 3, PAL.sky2);
      px(ctx, x + 18, y + 16, 3, 3, PAL.sky2);
      px(ctx, x + 13, y + 22, 7, 3, PAL.gray);
      px(ctx, x + 8, y + 9, 16, 3, PAL.gray2);
      px(ctx, x + 15, y + 4, 3, 5, PAL.gray2);
      px(ctx, x + 13, y + 2, 7, 3, PAL.red);
      px(ctx, x + 9, y + 24, 4, 3, PAL.gray2);
      px(ctx, x + 19, y + 24, 4, 3, PAL.gray2);
      break;

    case 'toolbox':
      px(ctx, x + 8, y + 15, 16, 8, PAL.red2);
      px(ctx, x + 8, y + 15, 16, 2, PAL.red3);
      px(ctx, x + 13, y + 12, 6, 3, PAL.gray2);
      px(ctx, x + 11, y + 18, 10, 2, PAL.ink2);
      break;

    case 'partitionGlass': /* sekat kaca */
      px(ctx, x, y - 6, 4, TILE + 6, PAL.gray2);
      px(ctx, x + 4, y - 4, TILE - 8, TILE + 4, 'rgba(191,224,242,0.55)');
      px(ctx, x + 6, y - 2, 3, TILE, 'rgba(255,255,255,0.35)');
      px(ctx, x + TILE - 4, y - 6, 4, TILE + 6, PAL.gray2);
      break;

    case 'sign':
      px(ctx, x + 4, y + 6, 24, 16, PAL.navy2);
      px(ctx, x + 5, y + 7, 22, 14, PAL.iron);
      px(ctx, x + 7, y + 10, 18, 3, PAL.gold);
      px(ctx, x + 7, y + 15, 12, 3, PAL.off);
      px(ctx, x + 15, y + 2, 3, 5, PAL.gray2);
      break;

    case 'copyTray':
      px(ctx, x + 6, y + 12, 20, 6, PAL.gray3);
      px(ctx, x + 8, y + 8, 16, 5, PAL.paper);
      px(ctx, x + 9, y + 9, 14, 3, PAL.gray);
      break;

    case 'stickers': /* poster kecil di dinding */
      px(ctx, x + 6, y + 8, 20, 14, PAL.paper);
      px(ctx, x + 8, y + 10, 16, 10, PAL.carpetB);
      px(ctx, x + 10, y + 12, 6, 6, PAL.gold);
      px(ctx, x + 18, y + 12, 4, 6, PAL.red3);
      break;

    case 'shadow':
      ctx.fillStyle = 'rgba(20,26,40,0.22)';
      ctx.beginPath();
      ctx.ellipse(x + TILE / 2, y + TILE - 4, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      break;
  }
}

/* ------------------------------ KARAKTER -------------------------------- */
/* Karakter 24x36 px, gaya chibi tampak depan (mengikuti mockup).           */
export const CHAR_W = 24;
export const CHAR_H = 36;

function rect(ctx, X, Y, x, y, w, h, c) { px(ctx, X + x, Y + y, w, h, c); }

/* Bentuk rambut: ditempel pada kepala (koordinat relatif karakter). */
function drawHair(ctx, X, Y, style, color, dir) {
  const r = (x, y, w, h, c) => rect(ctx, X, Y, x, y, w, h, c || color);
  const hi = (c) => c || '#ffffff30';
  switch (style) {
    case 'spiky':
      r(5, 1, 14, 4);
      r(5, 0, 3, 4); r(9, -1, 3, 4); r(14, 0, 3, 4);
      r(6, 3, 12, 2);
      r(4, 3, 2, 4); r(18, 3, 2, 4);
      r(7, 1, 4, 1, hi());
      break;
    case 'bob':
      r(4, 2, 16, 6);
      r(4, 8, 3, 5); r(17, 8, 3, 5);
      r(5, 5, 14, 2);
      r(6, 3, 5, 1, hi());
      break;
    case 'pony':
      r(4, 2, 16, 5);
      r(4, 7, 3, 4); r(17, 7, 3, 4);
      r(19, 9, 4, 12);      /* ekor kuda */
      r(20, 12, 3, 7);
      r(6, 3, 5, 1, hi());
      break;
    case 'long':
      r(4, 1, 16, 7);
      r(3, 8, 3, 10); r(18, 8, 3, 10);
      r(4, 16, 3, 5); r(17, 16, 3, 5);
      r(6, 2, 6, 1, hi());
      break;
    case 'curly':
      r(4, 1, 16, 6);
      r(3, 3, 4, 4); r(17, 3, 4, 4);
      r(6, -1, 4, 3); r(11, -2, 4, 3); r(15, 0, 3, 3);
      r(5, 3, 3, 2, hi());
      r(13, 3, 3, 2, hi());
      break;
    case 'buzz':
      r(6, 2, 12, 3);
      r(5, 4, 14, 2);
      r(7, 3, 4, 1, hi());
      break;
    case 'cap':
      r(4, 1, 16, 4);
      r(3, 4, 18, 3);
      r(4, 6, 16, 2, '#00000040');
      r(6, 2, 6, 1, hi('#ffffff45'));
      break;
    case 'undercut':
      r(5, 1, 14, 3);
      r(13, 4, 7, 4);
      r(5, 4, 3, 3);
      r(7, 2, 5, 1, hi());
      break;
    default: /* short */
      r(5, 1, 14, 4);
      r(4, 5, 2, 4); r(18, 5, 2, 4);
      r(7, 2, 5, 1, hi());
      break;
  }
  if (dir === 'up') { rect(ctx, X, Y, 6, 4, 12, 5, color); }
}

/* Aksesori wajah (kacamata, headset). */
function drawAccessory(ctx, X, Y, acc) {
  switch (acc) {
    case 'glasses':
      px(ctx, X + 6, Y + 8, 5, 4, PAL.navy2);
      px(ctx, X + 13, Y + 8, 5, 4, PAL.navy2);
      px(ctx, X + 11, Y + 9, 2, 1, PAL.navy2);
      px(ctx, X + 7, Y + 9, 3, 2, PAL.screenLight);
      px(ctx, X + 14, Y + 9, 3, 2, PAL.screenLight);
      break;
    case 'headset':
      px(ctx, X + 5, Y + 2, 14, 3, PAL.ink2);
      px(ctx, X + 3, Y + 5, 3, 6, PAL.ink3);
      px(ctx, X + 18, Y + 5, 3, 6, PAL.ink3);
      px(ctx, X + 5, Y + 11, 3, 3, PAL.ink3);
      px(ctx, X + 3, Y + 6, 1, 3, PAL.teal);
      break;
    default: break;
  }
}

/* Jaket/bawahan atas yang menimpa kemeja. */
function drawJacket(ctx, X, Y, kind) {
  const r = (x, y, w, h, c) => rect(ctx, X, Y, x, y, w, h, c);
  switch (kind) {
    case 'bomber':
      r(5, 17, 14, 11, PAL.bomber);
      r(4, 18, 2, 9, PAL.bomber2);
      r(18, 18, 2, 9, PAL.bomber2);
      r(10, 17, 4, 11, PAL.shirtWhite);       /* kemeja terlihat di tengah */
      r(6, 19, 4, 6, PAL.bomber2);            /* saku */
      r(14, 19, 4, 6, PAL.bomber2);
      r(6, 17, 12, 2, PAL.ink3);
      r(11, 22, 2, 2, PAL.gold);              /* resleting */
      break;
    case 'hoodie':
      r(5, 17, 14, 12, PAL.hoodie);
      r(4, 18, 2, 9, PAL.hoodie2);
      r(18, 18, 2, 9, PAL.hoodie2);
      r(6, 14, 12, 4, PAL.hoodie2);           /* tudung */
      r(10, 18, 4, 6, PAL.hoodie2);
      r(11, 20, 1, 5, PAL.off);
      r(12, 20, 1, 5, PAL.off);
      r(13, 24, 4, 3, PAL.hoodie2);           /* kantong */
      break;
    case 'blazer':
      r(4, 17, 16, 12, PAL.blazer);
      r(4, 17, 16, 2, PAL.blazer2);
      r(10, 17, 4, 11, PAL.shirtWhite);
      r(11, 19, 2, 5, PAL.red);               /* dasi */
      r(11, 24, 2, 3, PAL.red2);
      r(6, 20, 4, 6, PAL.blazer2);
      r(14, 20, 4, 6, PAL.blazer2);
      break;
    case 'vest':
      r(5, 17, 14, 12, PAL.shirtWhite);
      r(5, 17, 5, 12, PAL.vest);
      r(14, 17, 5, 12, PAL.vest);
      r(6, 20, 3, 4, PAL.vest2);
      r(15, 20, 3, 4, PAL.vest2);
      r(6, 17, 3, 2, '#c99a5c');
      break;
    default: break;
  }
}

/* Sepatu. */
function drawShoes(ctx, X, Y, kind, legShift) {
  const c1 = kind === 'sneaker' ? PAL.sneaker : kind === 'boot' ? PAL.boot : PAL.formal;
  const c2 = kind === 'sneaker' ? PAL.sneaker2 : kind === 'boot' ? '#402f1f' : '#171a22';
  rect(ctx, X, Y, 6, 33 + legShift, 4, 3, c1);
  rect(ctx, X, Y, 14, 33 - legShift, 4, 3, c1);
  rect(ctx, X, Y, 6, 35 + legShift, 4, 1, c2);
  rect(ctx, X, Y, 14, 35 - legShift, 4, 1, c2);
  if (kind === 'sneaker') { rect(ctx, X, Y, 6, 34 + legShift, 4, 1, PAL.white); }
}

/**
 * Menggambar karakter 24x36.
 * cfg: { skin, skin2, skin3, hair, hairStyle, shirt, shirtDark, jacket,
 *        pants, shoes, accessory }
 */
export function drawChar(ctx, cfg, x, y, opts = {}) {
  const dir = opts.dir || 'down';
  const step = opts.step || 0;
  const moving = !!opts.moving;
  const legShift = moving ? (step % 4 < 2 ? 1 : -1) : 0;
  const bob = moving && step % 2 ? -1 : 0;
  const c = Object.assign({
    skin: PAL.skin, skin2: PAL.skin2, skin3: PAL.skin3,
    hair: PAL.hairD, hairStyle: 'short',
    shirt: PAL.shirtWhite, shirtDark: PAL.panel2,
    jacket: null, pants: PAL.denim, pants2: PAL.denim2,
    shoes: 'formal', accessory: null
  }, cfg || {});

  const X = x, Y = y + bob;
  const r = (rx, ry, w, h, col) => rect(ctx, X, Y, rx, ry, w, h, col);

  /* bayangan */
  ctx.fillStyle = 'rgba(20,26,40,0.22)';
  ctx.beginPath();
  ctx.ellipse(X + 12, y + CHAR_H - 1, 9, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  /* kaki & celana */
  r(6, 26, 4, 8 + legShift, c.pants);
  r(14, 26, 4, 8 - legShift, c.pants);
  r(6, 26, 1, 8 + legShift, c.pants2);
  r(14, 26, 1, 8 - legShift, c.pants2);
  r(6, 27, 4, 1, c.pants2);
  drawShoes(ctx, X, Y, c.shoes, legShift);

  /* lengan */
  r(3, 18, 3, 8, c.shirt);
  r(18, 18, 3, 8, c.shirt);
  r(3, 25, 3, 3, c.skin);
  r(18, 25, 3, 3, c.skin);
  r(3, 18, 1, 7, c.shirtDark);
  r(20, 18, 1, 7, c.shirtDark);

  /* badan: kemeja dasar, lalu jaket menimpa */
  r(5, 17, 14, 11, c.shirt);
  r(5, 17, 14, 1, '#ffffff40');
  r(5, 27, 14, 1, c.shirtDark);
  drawJacket(ctx, X, Y, c.jacket);

  /* kepala (chibi besar) */
  r(5, 1, 14, 15, PAL.ink);           /* garis luar */
  r(6, 2, 12, 13, c.skin);
  r(6, 2, 12, 2, PAL.skinHi);
  r(6, 13, 12, 2, c.skin2);
  r(6, 2, 1, 11, c.skin2);
  r(17, 2, 1, 11, c.skin2);
  r(10, 15, 4, 2, c.skin3);           /* leher */

  if (dir !== 'up') {
    /* mata */
    if (dir === 'left') {
      r(8, 8, 3, 3, PAL.ink2); r(9, 9, 1, 1, c.skin);
      r(14, 8, 2, 3, PAL.ink2);
    } else if (dir === 'right') {
      r(8, 8, 2, 3, PAL.ink2);
      r(13, 8, 3, 3, PAL.ink2); r(14, 9, 1, 1, c.skin);
    } else {
      r(8, 8, 3, 4, PAL.ink2);
      r(13, 8, 3, 4, PAL.ink2);
      r(9, 9, 1, 2, PAL.white);
      r(14, 9, 1, 2, PAL.white);
    }
    r(11, 12, 2, 1, c.skin3);         /* hidung/mulut */
    r(7, 11, 2, 1, '#e8a68a');        /* pipi */
    r(15, 11, 2, 1, '#e8a68a');
  }

  drawHair(ctx, X, Y, c.hairStyle, c.hair, dir);
  drawAccessory(ctx, X, Y, c.accessory);
}

/* --------------------------- IKON PROFESI (24x24) ----------------------- */
export function drawIcon(ctx, kind, x, y) {
  const c = (col, rx, ry, rw, rh) => px(ctx, x + rx, y + ry, rw, rh, col);
  c(PAL.navy2, 0, 0, 24, 24);
  c(PAL.iron, 1, 1, 22, 22);
  switch (kind) {
    case 'itsupport':
      c(PAL.off, 5, 4, 14, 10);
      c(PAL.screen2, 6, 5, 12, 8);
      c(PAL.gray3, 8, 15, 8, 3);
      c(PAL.red3, 5, 17, 14, 4);
      c(PAL.gold, 12, 18, 2, 2);
      break;
    case 'webdev':
      c(PAL.off, 3, 4, 18, 15);
      c(PAL.navy3, 3, 4, 18, 3);
      c(PAL.sky2, 5, 9, 5, 2);
      c(PAL.gray2, 5, 12, 9, 2);
      c(PAL.orange, 15, 10, 4, 6);
      c(PAL.teal, 12, 16, 9, 4);
      break;
    case 'graphic':
      c(PAL.off, 3, 4, 18, 15);
      c(PAL.carpetB, 4, 5, 7, 6);
      c(PAL.red3, 13, 5, 7, 6);
      c(PAL.gold, 4, 12, 7, 6);
      c(PAL.green, 13, 12, 7, 6);
      c(PAL.white, 10, 10, 4, 4);
      break;
    case 'network':
      c(PAL.gray2, 4, 6, 16, 5);
      for (let p = 0; p < 5; p++) c(PAL.gold, 6 + p * 3, 8, 2, 2);
      c(PAL.gray2, 4, 14, 16, 5);
      for (let p = 0; p < 5; p++) c(PAL.gold, 6 + p * 3, 16, 2, 2);
      c(PAL.carpetB, 8, 11, 2, 3);
      c(PAL.teal, 14, 11, 2, 3);
      break;
    case 'dba':
      c(PAL.carpetB, 5, 4, 14, 4);
      c(PAL.carpetB2, 5, 9, 14, 4);
      c(PAL.carpetB, 5, 14, 14, 6);
      c(PAL.gold, 8, 5, 3, 2);
      c(PAL.off, 8, 10, 6, 2);
      c(PAL.off, 8, 16, 8, 2);
      break;
    case 'data':
      c(PAL.off, 4, 4, 16, 16);
      c(PAL.carpetB, 6, 12, 3, 6);
      c(PAL.gold, 10, 9, 3, 9);
      c(PAL.orange, 14, 5, 3, 13);
      c(PAL.gray2, 6, 18, 12, 1);
      break;
    case 'se':
      c(PAL.navy2, 4, 4, 16, 16);
      c(PAL.teal, 7, 7, 3, 4);
      c(PAL.teal, 7, 7, 6, 1);
      c(PAL.teal, 7, 13, 6, 1);
      c(PAL.green, 14, 9, 3, 6);
      break;
    case 'uiux':
      c(PAL.off, 4, 4, 16, 12);
      c(PAL.carpetP, 4, 4, 16, 3);
      c(PAL.gray3, 6, 9, 7, 2);
      c(PAL.gray2, 6, 12, 11, 2);
      c(PAL.gold, 15, 17, 5, 4);
      c(PAL.navy3, 13, 16, 6, 1);
      break;
    case 'cyber':
      c(PAL.navy2, 4, 4, 16, 16);
      c(PAL.sky2, 12, 5, 6, 14);
      c(PAL.carpetB, 6, 5, 6, 14);
      c(PAL.off, 8, 8, 3, 3);
      c(PAL.off, 14, 8, 3, 3);
      c(PAL.teal, 9, 13, 6, 2);
      break;
    case 'ai':
      c(PAL.off, 6, 7, 12, 11);
      c(PAL.carpetP, 7, 8, 10, 9);
      c(PAL.sky2, 8, 11, 2, 3);
      c(PAL.sky2, 14, 11, 2, 3);
      c(PAL.gold, 5, 6, 14, 2);
      c(PAL.gray3, 4, 10, 2, 4);
      c(PAL.gray3, 18, 10, 2, 4);
      c(PAL.navy2, 10, 18, 4, 2);
      break;
    default:
      c(PAL.gray, 5, 5, 14, 14);
      break;
  }
  c(PAL.off, 0, 0, 24, 1);
  c(PAL.ink, 0, 23, 24, 1);
  c(PAL.ink, 0, 0, 1, 24);
  c(PAL.ink, 23, 0, 1, 24);
}

/* --------------------------- OBJEK DEKORASI ----------------------------- */
/** Balon penanda misi "!" di atas meja kerja. */
export function drawMarker(ctx, x, y, t) {
  const bob = Math.sin(t * 4) * 3;
  const by = y + bob;
  px(ctx, x - 10, by - 30, 20, 20, PAL.navy2);
  px(ctx, x - 9, by - 29, 18, 18, PAL.gold);
  px(ctx, x - 9, by - 29, 18, 3, PAL.gold3);
  px(ctx, x - 9, by - 12, 18, 2, PAL.gold2);
  px(ctx, x - 3, by - 26, 6, 9, PAL.navy2);
  px(ctx, x - 3, by - 15, 6, 3, PAL.navy2);
  /* ekor balon */
  px(ctx, x - 4, by - 10, 8, 3, PAL.navy2);
  px(ctx, x - 2, by - 7, 4, 3, PAL.navy2);
}

export function drawSparkle(ctx, x, y, t, color = PAL.gold) {
  const s = Math.sin(t * 3) * 0.5 + 0.5;
  const a = 2 + s * 3;
  px(ctx, x - a, y, a * 2, 2, color);
  px(ctx, x, y - a, 2, a * 2, color);
}

/** Bintang emas bergaya 3D untuk panel hasil misi. */
export function drawStar(ctx, x, y, size = 24, filled = true, t = 0) {
  const s = size / 8;                       /* berbasis grid 8x8 */
  const g = (rx, ry, rw, rh, c) => px(ctx, Math.round(x + rx * s), Math.round(y + ry * s), Math.ceil(rw * s), Math.ceil(rh * s), c);
  const body = filled ? PAL.gold : PAL.gray3;
  const dark = filled ? PAL.gold2 : PAL.gray2;
  const light = filled ? PAL.gold3 : PAL.off;
  g(3, 0, 2, 2, body);
  g(2, 2, 4, 2, body);
  g(0, 3, 8, 2, body);
  g(1, 5, 6, 1, body);
  g(2, 6, 4, 1, dark);
  g(1, 3, 6, 1, light);
  g(3, 0, 1, 1, light);
  g(3, 1, 2, 1, light);
  g(0, 3, 2, 1, light);
  if (filled && Math.sin(t * 4) > 0.3) g(6, 1, 1, 1, PAL.white);
}

/** Kepingan konfeti (untuk pop-up LEVEL UP). */
export function drawConfetti(ctx, x, y, i) {
  const colors = [PAL.gold, PAL.red3, PAL.teal, PAL.carpetB, PAL.orange, PAL.green];
  const c = colors[i % colors.length];
  px(ctx, x, y, 3 + (i % 2), 4 + (i % 3), c);
}

/** Logo kotak untuk layar judul / potret dialog. */
export function drawLogoMark(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  px(ctx, 0, 0, 32, 32, PAL.navy2);
  px(ctx, 2, 2, 28, 28, PAL.iron);
  px(ctx, 4, 4, 24, 24, PAL.glass);
  px(ctx, 7, 10, 18, 14, PAL.off);
  px(ctx, 10, 7, 12, 5, PAL.gray3);
  px(ctx, 9, 14, 5, 5, PAL.red3);
  px(ctx, 18, 14, 5, 5, PAL.gold);
  px(ctx, 6, 6, 5, 2, PAL.white);
  ctx.restore();
}

export const CHAR_SIZE = { w: CHAR_W, h: CHAR_H };
