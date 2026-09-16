/* ==========================================================================
 * Career Quest - maps.js  (v2 - satu ruangan Office Hub per lantai)
 *
 * Peta mengikuti mockup referensi: SATU RUANGAN = SATU LAYAR (20 x 12 tile,
 * 640 x 384 px), tanpa gulir layar. Zona kerja ditandai karpet warna + label
 * nama divisi, persis seperti Scene 03 "Office Hub" pada referensi.
 *
 * Cara menyusun peta:
 *   tiles  : deretan karakter (lantai, dinding, jendela, pintu, karpet)
 *   props  : daftar furnitur { k: jenis, x: kolom, y: baris } (satuan tile)
 *   labels : tulisan di dalam peta (nama zona / papan nama divisi)
 *   quests : titik berdiri pemain untuk memulai misi + titik penanda "!"
 *   npcs   : posisi NPC mentor (harus di tile yang bisa dilewati)
 *
 * Legenda tile:
 *   #  dinding interior          w  dinding berjendela (pemandangan gedung)
 *   .  lantai kantor berpetak    ,  lantai kayu hangat
 *   g  karpet hijau              b  karpet biru
 *   r  karpet merah              p  karpet ungu
 *   y  karpet kuning             d  lantai ruang server
 *   D  pintu biasa               e  pintu lift
 * ==========================================================================
 */

import { PROP_SOLID } from './art.js';

export const SOLID_TILES = new Set(['#', 'w', 'D', 'e']);

/* ------------------------------- LANTAI 1 ------------------------------- */
const T1 = [
  '####################',
  '#wwwwwwwwwwwwwwwwww#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#.gggg...bbbb..ppp.#',
  '#.gggg...bbbb..ppp.#',
  '#..................#',
  '#..................#',
  '#..................#',
  '#..................#',
  '##############DDee##'
];

/* ------------------------------- LANTAI 2 ------------------------------- */
const T2 = [
  '####################',
  '#wwwwwwwwwwwwwwwwww#',
  '#.SS.SS............#',
  '#.SS.SS......SS....#',
  '#..................#',
  '#rrrr....dddddd....#',
  '#rrrr....dddddd....#',
  '#........dddddd....#',
  '#...yyy............#',
  '#...yyy............#',
  '#..................#',
  '##############DDee##'
];

/* ------------------------------- LANTAI 3 ------------------------------- */
const T3 = [
  '####################',
  '#wwwwwwwwwwwwwwwwww#',
  '#,,,,,,,,,,,,,,,,,,#',
  '#,,,,,,,,,,,,,,,,,,#',
  '#,,,,,,,,,,,,,,,,,,#',
  '#,gggg,,,,pppp,,,,,#',
  '#,gggg,,,,pppp,,,,,#',
  '#,,,,,,,,,,,,,,,,,,#',
  '#,,,,bbbb,,,yyyy,,,#',
  '#,,,,bbbb,,,yyyy,,,#',
  '#,,,,,,,,,,,,,,,,,,#',
  '##############DDee##'
];

/* ------------------------------- PETA ---------------------------------- */
export const MAPS = {
  /* ============================== LANTAI 1 ============================== */
  floor1: {
    key: 'floor1',
    level: 1,
    name: 'Lantai 1 - Pondasi Digital',
    subtitle: 'Office Hub - Resepsionis & Zona Produksi',
    scene: 'Scene 03: Office Hub (Lantai 1)',
    tiles: T1,
    spawn: { x: 14, y: 10, dir: 'up' },
    elevator: { x: 17, y: 11 },
    elevatorStand: { x: 17, y: 10 },
    props: [
      /* zona IT Support (karpet hijau) */
      { k: 'desk', x: 2, y: 4 }, { k: 'monitor', x: 2, y: 4 }, { k: 'toolbox', x: 3, y: 5 },
      { k: 'chair', x: 2, y: 5 },
      /* zona Web Developer (karpet biru) */
      { k: 'desk', x: 9, y: 4 }, { k: 'dualMonitor', x: 9, y: 4 }, { k: 'laptop', x: 10, y: 4 },
      { k: 'chair', x: 9, y: 5 },
      /* zona Desainer Grafis (karpet ungu) */
      { k: 'desk', x: 15, y: 4 }, { k: 'designMonitor', x: 15, y: 4 },
      { k: 'chair', x: 15, y: 5 },
      /* area resepsionis & tunggu */
      { k: 'reception', x: 2, y: 9 }, { k: 'sofa', x: 8, y: 9 }, { k: 'coffeeTable', x: 10, y: 9 },
      { k: 'plantTall', x: 1, y: 2 }, { k: 'plantTall', x: 18, y: 2 },
      { k: 'plantTall', x: 1, y: 8 }, { k: 'plantTall', x: 18, y: 8 },
      { k: 'cooler', x: 18, y: 6 }, { k: 'cabinet', x: 5, y: 2 }, { k: 'printer', x: 7, y: 2 },
      { k: 'stickers', x: 16, y: 2 }, { k: 'sign', x: 12, y: 9 },
      { k: 'whiteboard', x: 6, y: 11 }
    ],
    labels: [
      { t: 'IT SUPPORT', x: 3.6, y: 6.5, size: 9 },
      { t: 'WEB DEVELOPER', x: 10.6, y: 6.5, size: 9 },
      { t: 'DESAIN GRAFIS', x: 16.4, y: 6.5, size: 9 },
      { t: 'HRD', x: 3.2, y: 8.1, size: 10, color: '#f2c14e' }
    ],
    quests: [
      { prof: 'itsupport', x: 2, y: 6, mx: 2, my: 4 },
      { prof: 'webdev', x: 9, y: 6, mx: 9, my: 4 },
      { prof: 'graphic', x: 15, y: 6, mx: 15, my: 4 }
    ],
    npcs: [
      { id: 'hrd', name: 'Bu Sekar (HRD)', x: 3, y: 8, dir: 'down', prof: null },
      { id: 'itsupport', name: 'Mas Bayu', x: 4, y: 4, dir: 'left', prof: 'itsupport' },
      { id: 'webdev', name: 'Kak Rani', x: 11, y: 4, dir: 'left', prof: 'webdev' },
      { id: 'graphic', name: 'Kak Vio', x: 17, y: 4, dir: 'left', prof: 'graphic' }
    ],
    intro: [
      { who: 'Narator', text: 'TechCorp. Hari pertama kamu menjalani program magang sebagai Junior Intern.' },
      { who: 'Bu Sekar (HRD)', text: 'Selamat datang di Lantai 1! Di sini ada tiga divisi: IT Support, Web Developer, dan Desain Grafis.' },
      { who: 'Bu Sekar (HRD)', text: 'Pilih meja kerjamu: dekati meja yang ada penanda "!" lalu tekan tombol A.' },
      { who: 'Bu Sekar (HRD)', text: 'Tuntaskan semua divisi di lantai ini (minimal Bintang 2) supaya kamu naik jabatan, menerima gaji, dan membuka lantai berikutnya.' }
    ]
  },

  /* ============================== LANTAI 2 ============================== */
  floor2: {
    key: 'floor2',
    level: 2,
    name: 'Lantai 2 - Infrastruktur & Data',
    subtitle: 'Ruang Server, Basis Data & Analitik',
    scene: 'Scene 03: Office Hub (Lantai 2)',
    tiles: T2,
    spawn: { x: 14, y: 10, dir: 'up' },
    elevator: { x: 17, y: 11 },
    elevatorStand: { x: 17, y: 10 },
    props: [
      /* zona Network Engineer (karpet merah) */
      { k: 'networkRack', x: 1, y: 3 }, { k: 'switchBox', x: 4, y: 3 },
      { k: 'desk', x: 2, y: 5 }, { k: 'terminal', x: 2, y: 5 }, { k: 'chair', x: 2, y: 6 },
      { k: 'cableTray', x: 4, y: 6 },
      /* zona Database Administrator (lantai server) */
      { k: 'serverRack', x: 9, y: 4 }, { k: 'serverRack', x: 11, y: 4 }, { k: 'serverRack', x: 13, y: 4 },
      { k: 'deskSmall', x: 10, y: 5 }, { k: 'terminal', x: 10, y: 5 }, { k: 'chair', x: 10, y: 6 },
      { k: 'cabinet', x: 14, y: 8 },
      /* zona Data Analyst (karpet kuning) */
      { k: 'desk', x: 5, y: 7 }, { k: 'monitorBank', x: 5, y: 7 }, { k: 'chair', x: 5, y: 8 },
      { k: 'copyTray', x: 6, y: 8 },
      /* ruang server di dinding atas */
      { k: 'switchBox', x: 9, y: 2 }, { k: 'switchBox', x: 11, y: 2 },
      { k: 'plantTall', x: 1, y: 8 }, { k: 'plantTall', x: 18, y: 2 },
      { k: 'plantSmall', x: 18, y: 6 }, { k: 'cooler', x: 16, y: 9 },
      { k: 'whiteboard', x: 5, y: 11 }, { k: 'sign', x: 12, y: 9 }, { k: 'robot', x: 16, y: 6 }
    ],
    labels: [
      { t: 'NETWORK ENGINEER', x: 3.4, y: 7.5, size: 9 },
      { t: 'DATABASE ADMIN', x: 12.2, y: 7.9, size: 9 },
      { t: 'DATA ANALYST', x: 6.6, y: 9.9, size: 9 }
    ],
    quests: [
      { prof: 'network', x: 2, y: 7, mx: 2, my: 5 },
      { prof: 'dba', x: 10, y: 7, mx: 10, my: 5 },
      { prof: 'data', x: 5, y: 9, mx: 5, my: 7 }
    ],
    npcs: [
      { id: 'network', name: 'Bu Nadia', x: 4, y: 5, dir: 'left', prof: 'network' },
      { id: 'dba', name: 'Pak Herman', x: 12, y: 5, dir: 'left', prof: 'dba' },
      { id: 'data', name: 'Kak Dinda', x: 7, y: 7, dir: 'left', prof: 'data' }
    ],
    intro: [
      { who: 'Bu Nadia', text: 'Selamat datang di Lantai 2. Mulai hari ini statusmu Junior Staff, dan ada gaji pertamamu!' },
      { who: 'Pak Herman', text: 'Di lantai ini jaringan dan data perusahaan dipertaruhkan. Bekerjalah dengan teliti.' }
    ]
  },

  /* ============================== LANTAI 3 ============================== */
  floor3: {
    key: 'floor3',
    level: 3,
    name: 'Lantai 3 - Spesialisasi & Intelegensia',
    subtitle: 'Laboratorium Inovasi TechCorp',
    scene: 'Scene 10: Pilihan Spesialisasi Baru (Lantai 3)',
    tiles: T3,
    spawn: { x: 14, y: 10, dir: 'up' },
    elevator: { x: 17, y: 11 },
    elevatorStand: { x: 17, y: 10 },
    props: [
      /* zona Software Engineer (karpet hijau) */
      { k: 'desk', x: 1, y: 4 }, { k: 'terminal', x: 1, y: 4 }, { k: 'laptop', x: 2, y: 4 },
      { k: 'chair', x: 1, y: 5 },
      /* zona UI/UX Designer (karpet ungu) */
      { k: 'desk', x: 10, y: 4 }, { k: 'designMonitor', x: 10, y: 4 }, { k: 'tableSmall', x: 12, y: 5 },
      { k: 'chair', x: 10, y: 5 },
      /* zona Cyber Security (karpet biru) */
      { k: 'desk', x: 5, y: 7 }, { k: 'terminal', x: 5, y: 7 }, { k: 'laptop', x: 6, y: 7 },
      { k: 'chair', x: 5, y: 8 }, { k: 'switchBox', x: 8, y: 7 },
      /* zona AI Specialist (karpet kuning) */
      { k: 'desk', x: 12, y: 7 }, { k: 'monitorBank', x: 12, y: 7 }, { k: 'robot', x: 14, y: 7 },
      { k: 'chair', x: 12, y: 8 },
      /* sekat kaca & dekorasi */
      { k: 'partitionGlass', x: 9, y: 3 }, { k: 'partitionGlass', x: 9, y: 7 },
      { k: 'whiteboard', x: 6, y: 11 }, { k: 'sign', x: 12, y: 9 },
      { k: 'plantTall', x: 18, y: 2 }, { k: 'plantTall', x: 18, y: 8 },
      { k: 'plantTall', x: 1, y: 8 }, { k: 'cooler', x: 17, y: 10 },
      { k: 'cabinet', x: 5, y: 2 }, { k: 'printer', x: 7, y: 2 }, { k: 'stickers', x: 16, y: 2 }
    ],
    labels: [
      { t: 'SOFTWARE ENGINEER', x: 3.4, y: 6.5, size: 9 },
      { t: 'UI/UX DESIGNER', x: 12.2, y: 6.5, size: 9 },
      { t: 'CYBER SECURITY', x: 7.4, y: 9.9, size: 9 },
      { t: 'AI SPECIALIST', x: 14.2, y: 9.9, size: 9 }
    ],
    quests: [
      { prof: 'se', x: 1, y: 6, mx: 1, my: 4 },
      { prof: 'uiux', x: 10, y: 6, mx: 10, my: 4 },
      { prof: 'cyber', x: 5, y: 9, mx: 5, my: 7 },
      { prof: 'ai', x: 12, y: 9, mx: 12, my: 7 }
    ],
    npcs: [
      { id: 'se', name: 'Mas Aldi', x: 3, y: 4, dir: 'left', prof: 'se' },
      { id: 'uiux', name: 'Kak Sasha', x: 13, y: 4, dir: 'left', prof: 'uiux' },
      { id: 'cyber', name: 'Pak Reza', x: 8, y: 8, dir: 'left', prof: 'cyber' },
      { id: 'ai', name: 'Bu Kartika', x: 15, y: 8, dir: 'left', prof: 'ai' }
    ],
    intro: [
      { who: 'Mas Aldi', text: 'Selamat datang di Lantai 3. Di sini kamu memilih spesialisasi: Software Engineer, UI/UX Designer, Cyber Security, atau AI Specialist.' },
      { who: 'Bu Kartika', text: 'Semua divisi di lantai ini menuntut keahlian mendalam. Tuntaskan semuanya, lalu ikuti Tes Kompetensi Karier dari tim HRD.' }
    ]
  }
};

/* ----------------------- PENCARIAN TILE & KOLISI ---------------------- */
/** Membangun grid kolisi (true = tidak dapat dilewati) untuk sebuah peta. */
export function buildSolidGrid(map) {
  const h = map.tiles.length, w = map.tiles[0].length;
  const grid = Array.from({ length: h }, () => new Array(w).fill(false));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (SOLID_TILES.has(map.tiles[y][x])) grid[y][x] = true;
    }
  }
  (map.props || []).forEach((p) => {
    const size = PROP_SOLID[p.k] || { w: 1, h: 1 };
    for (let dy = 0; dy < size.h; dy++) {
      for (let dx = 0; dx < size.w; dx++) {
        const px2 = p.x + dx, py2 = p.y + dy;
        if (py2 >= 0 && py2 < h && px2 >= 0 && px2 < w) grid[py2][px2] = true;
      }
    }
  });
  return grid;
}

/** Uji kelengkapan peta: lebar baris, keterjangkauan, dan posisi penting. */
export function validateMaps() {
  const problems = [];
  const width = 20, height = 12;
  Object.values(MAPS).forEach((m) => {
    if (m.tiles.length !== height) problems.push(m.key + ': jumlah baris ' + m.tiles.length + ' != ' + height);
    m.tiles.forEach((row, i) => {
      if (row.length !== width) problems.push(m.key + ' baris ' + i + ': lebar ' + row.length + ' != ' + width);
    });
    const grid = buildSolidGrid(m);
    const walkable = (x, y) => y >= 0 && y < height && x >= 0 && x < width && !grid[y][x];

    /* penelusuran dari titik awal pemain */
    const seen = new Set();
    const queue = [[m.spawn.x, m.spawn.y]];
    const key = (x, y) => y * width + x;
    if (!walkable(m.spawn.x, m.spawn.y)) problems.push(m.key + ': titik awal pemain tertutup objek');
    seen.add(key(m.spawn.x, m.spawn.y));
    while (queue.length) {
      const [cx, cy] = queue.shift();
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
        const nx = cx + dx, ny = cy + dy;
        if (walkable(nx, ny) && !seen.has(key(nx, ny))) { seen.add(key(nx, ny)); queue.push([nx, ny]); }
      });
    }
    const reachable = (x, y) => seen.has(key(x, y));

    (m.quests || []).forEach((q) => {
      if (!walkable(q.x, q.y)) problems.push(m.key + ' misi ' + q.prof + ': titik berdiri tidak dapat dilewati');
      else if (!reachable(q.x, q.y)) problems.push(m.key + ' misi ' + q.prof + ': titik berdiri tidak terjangkau');
      if (!walkable(q.x, q.y + 1)) { /* jalur masuk dari bawah idealnya bebas */ }
    });
    (m.npcs || []).forEach((n) => {
      if (!walkable(n.x, n.y)) problems.push(m.key + ' NPC ' + n.id + ' berada di objek padat');
      else if (!reachable(n.x, n.y)) problems.push(m.key + ' NPC ' + n.id + ' tidak terjangkau');
    });
    if (m.elevatorStand && !walkable(m.elevatorStand.x, m.elevatorStand.y)) {
      problems.push(m.key + ': titik depan lift tertutup objek');
    } else if (m.elevatorStand && !reachable(m.elevatorStand.x, m.elevatorStand.y)) {
      problems.push(m.key + ': titik depan lift tidak terjangkau');
    }
    (m.labels || []).forEach((l) => {
      if (l.x < 0 || l.x > width || l.y < 0 || l.y > height) problems.push(m.key + ': label di luar peta (' + l.t + ')');
    });
    (m.props || []).forEach((p) => {
      const size = PROP_SOLID[p.k] || { w: 1, h: 1 };
      if (p.x + size.w > width || p.y + size.h > height) problems.push(m.key + ': prop ' + p.k + ' keluar peta');
    });
  });
  return problems;
}
