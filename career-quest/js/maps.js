/* ==========================================================================
 * Career Quest - maps.js
 * Peta kantor bergaya top-down (Tabel 3.3: Office Hub per lantai).
 *
 * Legenda karakter peta:
 *   #  dinding            w  dinding berjendela      D pintu
 *   .  lantai kantor      c  karpet                  l  lantai ruang mesin/lab
 *   T  meja kiri          t  meja kanan              h kursi
 *   P  tanaman            S  rak server              C  lemari berkas
 *   W  dispenser air      K  mesin kopi              B  papan tulis
 *   F  sofa               R  meja resepsionis        L  meja lab
 *   b  robot kecil        g  papan penunjuk          e  pintu lift
 * ==========================================================================
 */

export const SOLID = new Set(['#', 'w', 'T', 't', 'h', 'P', 'S', 'C', 'W', 'K', 'B', 'F', 'R', 'L', 'b', 'g', 'e']);
export const PROP_TILE = {
  T: 'deskL', t: 'deskR', h: 'chair', P: 'plant', S: 'server', C: 'cabinet',
  W: 'cooler', K: 'coffee', B: 'board', F: 'sofa', R: 'reception', L: 'labdesk',
  b: 'robot', g: 'sign'
};

/* ------------------------------- LANTAI 1 ------------------------------- */
const FLOOR1 = [
  '##################################',
  '#wwww#####wwww#####wwww#####wwwww#',
  '#.......P.............P..........#',
  '#.RR.............................#',
  '#..........Tt....Tt.....Tt.......#',
  '#W.........hh....hh.....hh.......#',
  '#.............................KCC#',
  '#...cccccc.......................#',
  '#...cccccc.......................#',
  '#....FF..P.......................#',
  '#...................B.P..........#',
  '#..........Tt....Tt..............#',
  '#..........hh....hh..............#',
  '#CC.............................P#',
  '#...........................lllll#',
  '#..W........................lllll#',
  '#...........................lllll#',
  '#...........................gee..#',
  '#....P.......C........P..........#'
];
/* ------------------------------- LANTAI 2 ------------------------------- */
const FLOOR2 = [
  '##################################',
  '#wwww#####wwww#####wwww#####wwwww#',
  '#.SS..SS..SS.....................#',
  '#.SS..SS..SS.....................#',
  '#................................#',
  '#CC..............................#',
  '#.....Tt........Tt........Tt.....#',
  '#.....hh........hh........hh.....#',
  '#...P...........................P#',
  '#................................#',
  '#.........llllllllll.............#',
  '#........SllllllllllS............#',
  '#........SllllllllllS............#',
  '#.........llllllllll.............#',
  '#................................#',
  '#W............................K..#',
  '#................................#',
  '#...........................gee..#',
  '#.....FF......P..........P.......#'
];
/* ------------------------------- LANTAI 3 ------------------------------- */
const FLOOR3 = [
  '##################################',
  '#wwww#####wwww#####wwww#####wwwww#',
  '#.B.............B................#',
  '#................................#',
  '#..P.....................P.......#',
  '#....Tt.........Tt...............#',
  '#....hh.........hh...............#',
  '#................................#',
  '#....Tt.........Tt...............#',
  '#....hh.........hh.......b.......#',
  '#..........llllllllll............#',
  '#..........llllllllll............#',
  '#..........llllllllll............#',
  '#CC.............................P#',
  '#................................#',
  '#..W.............................#',
  '#..........C.....................#',
  '#...........................gee..#',
  '#.......FF.......P.......P.......#'
];

/* ------------------------------- PETA ---------------------------------- */
export const MAPS = {
  floor1: {
    key: 'floor1',
    level: 1,
    name: 'Lantai 1 - Pondasi Digital',
    subtitle: 'Resepsionis & Kantor Terbuka TechCorp',
    tiles: FLOOR1,
    spawn: { x: 5, y: 16, dir: 'up' },
    elevator: { x: 30, y: 17 },
    elevatorStand: { x: 30, y: 16 },
    quests: [
      { prof: 'itsupport', x: 11, y: 4 },
      { prof: 'webdev', x: 17, y: 4 },
      { prof: 'graphic', x: 24, y: 4 }
    ],
    npcs: [
      { id: 'sekar', name: 'Bu Sekar (HRD)', x: 3, y: 2, dir: 'down', prof: null, role: 'reception' },
      { id: 'itsupport', name: 'Mas Bayu', x: 14, y: 4, dir: 'left', prof: 'itsupport' },
      { id: 'webdev', name: 'Kak Rani', x: 16, y: 4, dir: 'right', prof: 'webdev' },
      { id: 'graphic', name: 'Kak Vio', x: 23, y: 4, dir: 'right', prof: 'graphic' }
    ],
    intro: [
      { who: 'Anda', text: 'Selamat pagi! Hari pertama magang di TechCorp. Kantornya keren sekali...' },
      { who: 'Bu Sekar (HRD)', text: 'Selamat datang, Anak Magang! Saya Sekar dari HRD. Selama magang, kamu akan berkeliling semua divisi.' },
      { who: 'Bu Sekar (HRD)', text: 'Di setiap meja kerja ada penanda "!". Dekati lalu tekan tombol A untuk mulai bertugas.' },
      { who: 'Bu Sekar (HRD)', text: 'Tuntaskan semua divisi di lantai ini untuk naik jabatan dan membuka lantai berikutnya. Selamat bertugas!' }
    ]
  },

  floor2: {
    key: 'floor2',
    level: 2,
    name: 'Lantai 2 - Infrastruktur & Data',
    subtitle: 'Ruang Server & Ruang Data',
    tiles: FLOOR2,
    spawn: { x: 5, y: 16, dir: 'up' },
    elevator: { x: 30, y: 17 },
    elevatorStand: { x: 30, y: 16 },
    quests: [
      { prof: 'network', x: 6, y: 6 },
      { prof: 'dba', x: 16, y: 6 },
      { prof: 'data', x: 26, y: 6 }
    ],
    npcs: [
      { id: 'network', name: 'Bu Nadia', x: 5, y: 6, dir: 'right', prof: 'network' },
      { id: 'dba', name: 'Pak Herman', x: 15, y: 6, dir: 'right', prof: 'dba' },
      { id: 'data', name: 'Kak Dinda', x: 25, y: 6, dir: 'right', prof: 'data' }
    ],
    intro: [
      { who: 'Anda', text: 'Lantai 2! Di sini suara pendingin server terdengar sepanjang hari.' },
      { who: 'Bu Nadia', text: 'Selamat datang di lantai infrastruktur. Mulai hari ini kamu berstatus Junior Staff - dan sudah ada gaji pertama untukmu!' },
      { who: 'Pak Herman', text: 'Di lantai ini, data dan jaringan perusahaan dipertaruhkan. Bekerjalah dengan teliti.' }
    ]
  },

  floor3: {
    key: 'floor3',
    level: 3,
    name: 'Lantai 3 - Spesialisasi & Intelegensia',
    subtitle: 'Laboratorium Inovasi TechCorp',
    tiles: FLOOR3,
    spawn: { x: 5, y: 16, dir: 'up' },
    elevator: { x: 30, y: 17 },
    elevatorStand: { x: 30, y: 16 },
    quests: [
      { prof: 'se', x: 5, y: 5 },
      { prof: 'uiux', x: 16, y: 5 },
      { prof: 'cyber', x: 5, y: 8 },
      { prof: 'ai', x: 16, y: 8 }
    ],
    npcs: [
      { id: 'se', name: 'Mas Aldi', x: 4, y: 5, dir: 'right', prof: 'se' },
      { id: 'uiux', name: 'Kak Sasha', x: 15, y: 5, dir: 'right', prof: 'uiux' },
      { id: 'cyber', name: 'Pak Reza', x: 4, y: 8, dir: 'right', prof: 'cyber' },
      { id: 'ai', name: 'Bu Kartika', x: 15, y: 8, dir: 'right', prof: 'ai' }
    ],
    intro: [
      { who: 'Anda', text: 'Lantai 3. Di sinilah produk dan sistem cerdas perusahaan dirancang.' },
      { who: 'Mas Aldi', text: 'Selamat datang, Senior Specialist! Jabatanmu naik lagi - begitu pula tanggung jawabmu.' },
      { who: 'Bu Kartika', text: 'Lantai ini untuk mereka yang suka berpikir mendalam. Selesaikan semua divisi, lalu ikuti Tes Kompetensi Karier dari HRD.' }
    ]
  }
};

/* ----------------------- VALIDASI PETA (saat dikembangkan) -------------- */
export function validateMaps() {
  const problems = [];
  const width = FLOOR1[0].length;
  const height = FLOOR1.length;
  Object.values(MAPS).forEach((m) => {
    if (m.tiles.length !== height) problems.push(m.key + ': jumlah baris ' + m.tiles.length + ' != ' + height);
    m.tiles.forEach((row, i) => {
      if (row.length !== width) problems.push(m.key + ' baris ' + i + ': lebar ' + row.length + ' != ' + width);
    });
    m.quests.forEach((q) => {
      /* anchor quest adalah tile kiri meja kerja; minimal satu sisi harus bisa dilewati */
      const near = [[q.x - 1, q.y], [q.x + 2, q.y], [q.x, q.y + 1], [q.x, q.y - 1], [q.x + 1, q.y + 1], [q.x + 1, q.y - 1]];
      const ok = near.some(([nx, ny]) => nx > 0 && ny > 0 && nx < width && ny < height && !SOLID.has(m.tiles[ny][nx]));
      if (!ok) problems.push(m.key + ' quest ' + q.prof + ' tidak bisa dijangkau pemain');
    });
    m.npcs.forEach((n) => {
      if (SOLID.has(m.tiles[n.y][n.x])) problems.push(m.key + ' npc ' + n.id + ' berada di tile solid');
    });
    if (SOLID.has(m.tiles[m.spawn.y][m.spawn.x])) problems.push(m.key + ' spawn solid');
    if (SOLID.has(m.tiles[m.elevatorStand.y][m.elevatorStand.x])) problems.push(m.key + ' elevatorStand solid');
  });
  return problems;
}
