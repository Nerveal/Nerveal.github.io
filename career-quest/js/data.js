/* ==========================================================================
 * Career Quest - data.js
 * Seluruh konten materi, kurikulum, dan data permainan dipisahkan dari mesin
 * permainan agar mudah diperbarui oleh guru.
 *
 * Sumber materi:
 *  - Mushthofa, Wahyono, & Asfarian, A. (2019). Informatika (Buku Siswa/Guru
 *    Kelas X SMA). Kemendikbudristek. (Tabel 2.1 & 2.2 skripsi)
 *  - SK Kepala BSKAP No. 032/H/KR/2024 tentang Capaian Pembelajaran Fase E.
 *  - Hamidli, N. (2023) untuk deskripsi UI/UX Designer.
 * ==========================================================================
 */

import { PAL } from './art.js';

/* --------------------- BINTANG & ATURAN PROGRESI ------------------------ */
/* Bintang 3 = tanpa kesalahan, Bintang 2 = maksimal 1 kesalahan,
   Bintang 1 = maksimal 2 kesalahan.                                          */
export const STAR_MIN_FOR_UNLOCK = 2;

/* --------------------------- PROFESI (10) ------------------------------- */
/* char = konfigurasi pixel art NPC mentor (lihat art.js drawChar).           */
export const PROFESSIONS = [
  /* ================================ LEVEL 1 ============================== */
  {
    id: 'itsupport',
    name: 'IT Support',
    alias: 'Teknisi Komputer / Helpdesk Support',
    icon: 'itsupport',
    level: 1,
    color: PAL.orange,
    npcName: 'Mas Bayu',
    greet: [
      'Selamat pagi, Anak Magang! Aku Bayu, IT Support di TechCorp.',
      'Tugasku memberi dukungan teknis langsung ke pengguna: mulai dari PC yang mati sampai aplikasi yang error.',
      'Kalau ada karyawan yang panik karena komputernya bermasalah, aku orang pertama yang mereka cari. Siap ikut bertugas?'
    ],
    char: { skin: PAL.skin2, hair: PAL.hairB, hairStyle: 'short', top: PAL.orange, topDark: PAL.orange2, pants: PAL.ink3, shoes: PAL.dark, acc: 'wrench' },
    duty: 'Memberikan dukungan teknis langsung kepada pengguna terkait masalah perangkat keras dan perangkat lunak sehari-hari.',
    duties: [
      'Menangani keluhan perangkat pengguna lewat sistem tiket',
      'Memasang dan mengatur perangkat keras/jaringan kantor',
      'Merawat perangkat secara berkala dan mencatat solusi'
    ],
    study: ['D3/S1 Teknik Komputer', 'D3 Teknik Informatika', 'S1 Sistem Informasi'],
    certs: ['CompTIA A+', 'Google IT Support Professional', 'MTCNA (dasar jaringan)'],
    careers: ['Teknisi Komputer (IT Technician)', 'Helpdesk Support', 'Field Service Engineer'],
    chapters: [
      {
        title: 'Tiket #1042 - PC Staf Keuangan Tidak Menyala',
        brief: 'Salah satu staf mengeluh PC-nya tidak mau menyala sejak pagi. Ikuti prosedur pemeriksaan dasar. Lakukan setiap langkah secara berurutan!',
        mode: 'check',
        steps: [
          { t: 'Periksa kabel daya sudah terpasang ke stopkontak', k: 'plug' },
          { t: 'Tekan tombol power di bagian belakang CPU', k: 'power' },
          { t: 'Pastikan lampu indikator power supply menyala', k: 'light' },
          { t: 'Nyalakan ulang perangkat dan uji dengan aplikasi kantor', k: 'restart' }
        ],
        followUp: 'Ternyata kabel daya hanya longgar. Setelah dipasang ulang, PC menyala normal. Selalu cek hal paling sederhana lebih dulu!'
      },
      {
        title: 'Tiket #1045 - Printer Tidak Terdeteksi',
        brief: 'Pengguna melaporkan printer tidak terbaca komputer. Pilih tindakan yang paling tepat sebagai IT Support profesional.',
        mode: 'quiz',
        quiz: [
          {
            q: 'Seorang pengguna melaporkan printer tidak terdeteksi. Langkah pertama yang paling tepat adalah?',
            a: ['Memeriksa koneksi kabel USB/internet printer', 'Mengganti motherboard komputer', 'Menginstal ulang sistem operasi', 'Menyarankan membeli printer baru'],
            c: 0,
            why: 'Troubleshooting dimulai dari penyebab paling sederhana dan paling mungkin, bukan tindakan besar.'
          },
          {
            q: 'Kolom "solusi" pada sistem tiket sebaiknya selalu diisi agar?',
            a: ['Riwayat masalah dan solusinya dapat dipakai ulang', 'Pengguna merasa diabaikan', 'Perangkat cepat rusak', 'Gaji teknisi otomatis naik'],
            c: 0,
            why: 'Dokumentasi tiket membuat penanganan masalah berikutnya jauh lebih cepat.'
          },
          {
            q: 'Arti istilah "troubleshooting" adalah?',
            a: ['Proses mencari sumber masalah lalu memperbaikinya', 'Proses menghapus seluruh data', 'Proses menyalin file', 'Proses mengganti perangkat baru'],
            c: 0,
            why: 'Troubleshooting = diagnosa sistematis penyebab masalah sampai perbaikan.'
          }
        ]
      },
      {
        title: 'Tiket #1049 - Pemeliharaan Rutin Lab Komputer',
        brief: 'Tugas paling menantang: susun urutan prosedur pemeliharaan rutin lab komputer agar efisien.',
        mode: 'order',
        order: [
          'Terima dan catat tiket keluhan pengguna',
          'Tanyakan kronologi masalah kepada pengguna',
          'Periksa perangkat dari penyebab paling sederhana',
          'Lakukan perbaikan lalu uji fungsinya',
          'Catat solusi dan tutup tiket'
        ],
        orderHint: 'Ingat alur pelayanan: catat, tanyakan, periksa, perbaiki, dokumentasikan.'
      }
    ]
  },
  {
    id: 'webdev',
    name: 'Web Developer',
    alias: 'Pengembang Situs Web',
    icon: 'webdev',
    level: 1,
    color: PAL.teal,
    npcName: 'Kak Rani',
    greet: [
      'Hai! Aku Rani, Web Developer di TechCorp.',
      'Aku membangun dan merawat situs perusahaan, mulai dari tampilan di layar sampai logika di baliknya.',
      'Coba bayangkan: halaman yang kamu buka di HP dan di laptop bisa terlihat rapi karena kerja Web Developer. Yuk bantu aku membereskan halaman profil perusahaan!'
    ],
    char: { skin: PAL.skin, hair: PAL.hairY, hairStyle: 'long', top: PAL.teal, topDark: PAL.teal2, pants: PAL.ink3, shoes: PAL.dark, acc: 'glasses' },
    duty: 'Bertanggung jawab atas pembuatan dan pemeliharaan situs web, mulai dari tampilan (front-end) hingga logika server dan basis data (back-end).',
    duties: [
      'Menyusun struktur halaman dengan HTML dan tampilan dengan CSS',
      'Menulis logika interaksi memakai JavaScript',
      'Menguji halaman di berbagai perangkat lalu menerbitkannya'
    ],
    study: ['S1 Informatika', 'S1 Sistem Informasi', 'D3 Teknik Informatika'],
    certs: ['Meta Front-End Developer', 'Responsive Web Design (freeCodeCamp)', 'Junior Web Developer (LSP/BNSP)'],
    careers: ['Front-end Developer', 'Back-end Developer', 'Web Administrator'],
    chapters: [
      {
        title: 'Tiket #1043 - Halaman Profil Perusahaan Belum Rapi',
        brief: 'Halaman tim perusahaan perlu dibuat rapi dan mudah dibaca di HP maupun laptop. Kerjakan langkahnya berurutan.',
        mode: 'check',
        steps: [
          { t: 'Susun struktur konten memakai elemen HTML (judul, paragraf, gambar)', k: 'code' },
          { t: 'Atur tampilan memakai CSS (warna, jarak, ukuran huruf)', k: 'layout' },
          { t: 'Uji tampilan pada ukuran layar HP dan laptop', k: 'responsive' },
          { t: 'Periksa semua tautan dan tombol agar tidak error', k: 'check' }
        ],
        followUp: 'Struktur dulu, baru tampilan. Halaman yang rapi itulah yang menyenangkan pengunjung!'
      },
      {
        title: 'Tiket #1046 - Tombol Kontak Tidak Berfungsi',
        brief: 'Tombol kontak di halaman web tidak merespon saat ditekan. Uji pengetahuanmu!',
        mode: 'quiz',
        quiz: [
          {
            q: 'Bahasa yang mengatur warna, ukuran huruf, dan tata letak halaman web adalah?',
            a: ['CSS', 'HTML', 'MySQL', 'Python'],
            c: 0,
            why: 'HTML menyusun struktur, CSS mengatur tampilan (style).'
          },
          {
            q: 'Halaman web yang otomatis menyesuaikan tampilan di HP dan laptop disebut?',
            a: ['Responsive', 'Compressed', 'Encrypted', 'Offline'],
            c: 0,
            why: 'Desain responsive membuat satu halaman nyaman dibaca di semua ukuran layar.'
          },
          {
            q: 'Bagian situs yang mengurus logika server dan basis data disebut?',
            a: ['Back-end', 'Front-end', 'Header', 'Footer'],
            c: 0,
            why: 'Front-end = yang dilihat pengguna, back-end = dapur tempat data diolah.'
          }
        ]
      },
      {
        title: 'Tiket #1050 - Rilis Fitur Baru Website',
        brief: 'Fitur baru harus dirilis dengan aman dan tidak merusak halaman lain. Susun urutan kerja yang benar!',
        mode: 'order',
        order: [
          'Kumpulkan kebutuhan fitur dari klien',
          'Susun struktur dan konten (HTML)',
          'Atur tampilan (CSS) dan interaksi (JavaScript)',
          'Uji di beberapa browser dan perangkat',
          'Terbitkan ke hosting lalu pantau'
        ],
        orderHint: 'Kebutuhan - struktur - tampilan - uji - terbitkan.'
      }
    ]
  },
  {
    id: 'graphic',
    name: 'Digital Graphic Designer',
    alias: 'Desainer Grafis Digital',
    icon: 'graphic',
    level: 1,
    color: PAL.pink,
    npcName: 'Kak Vio',
    greet: [
      'Halo, aku Vio, Digital Graphic Designer.',
      'Aku membuat konten visual: poster, banner, sampai ikon di dalam aplikasi.',
      'Desain yang baik bukan hanya cantik, tapi menyampaikan pesan dengan jelas. Ayo bantu aku membuat poster kampanye perusahaan hari ini!'
    ],
    char: { skin: PAL.skin3, hair: PAL.hairP, hairStyle: 'spiky', top: PAL.pink, topDark: '#c95f88', pants: PAL.purple2, shoes: PAL.dark, acc: 'palette' },
    duty: 'Menciptakan konten visual digital menggunakan perangkat lunak desain untuk mendukung kebutuhan komunikasi visual dalam produk teknologi.',
    duties: [
      'Menerjemahkan pesan menjadi desain yang komunikatif',
      'Menjaga konsistensi warna, tipografi, dan logo perusahaan',
      'Menyiapkan berkas sesuai format setiap platform'
    ],
    study: ['D3/S1 Desain Komunikasi Visual (DKV)', 'S1 Desain Produk', 'S1 Informatika (multimedia)'],
    certs: ['Adobe Certified Professional', 'Google UX Design (dasar visual)', 'Sertifikasi Desain Grafis (LSP/BNSP)'],
    careers: ['Graphic Designer', 'Social Media Designer', 'Illustrator Digital'],
    chapters: [
      {
        title: 'Tiket #1044 - Poster Media Sosial Perusahaan',
        brief: 'Perusahaan akan mengumumkan program magang. Buat poster yang menarik dan mudah dibaca. Ikuti tahapannya!',
        mode: 'check',
        steps: [
          { t: 'Tentukan pesan utama dan target audiens poster', k: 'target' },
          { t: 'Pilih palet warna dan jenis huruf yang sesuai', k: 'palette' },
          { t: 'Susun elemen: judul, gambar, dan logo perusahaan', k: 'layout' },
          { t: 'Ekspor berkas sesuai ukuran platform media sosial', k: 'export' }
        ],
        followUp: 'Poster yang efektif selalu punya satu pesan utama. Jangan biarkan dekorasi mengalahkan informasi!'
      },
      {
        title: 'Tiket #1047 - Revisi Banner dari Klien',
        brief: 'Klien meminta revisi karena banner dianggap kurang mudah dibaca. Pilih jawaban yang paling tepat.',
        mode: 'quiz',
        quiz: [
          {
            q: 'Kombinasi warna yang serasi dan dipakai konsisten dalam sebuah desain disebut?',
            a: ['Palet warna', 'Palet bentuk', 'Resolusi', 'Kompresi'],
            c: 0,
            why: 'Palet warna menjaga identitas dan kesan visual produk tetap seragam.'
          },
          {
            q: 'Format gambar yang mendukung latar transparan adalah?',
            a: ['PNG', 'JPG', 'TXT', 'MP3'],
            c: 0,
            why: 'PNG mendukung transparansi, JPG tidak.'
          },
          {
            q: 'Prinsip kontras pada desain berguna untuk?',
            a: ['Membuat informasi penting mudah terbaca', 'Memperbesar ukuran berkas', 'Menghilangkan teks', 'Mempercepat koneksi internet'],
            c: 0,
            why: 'Kontras mengarahkan mata pembaca ke bagian yang paling penting.'
          }
        ]
      },
      {
        title: 'Tiket #1051 - Proyek Identitas Visual Produk Baru',
        brief: 'Kamu dipercaya menangani identitas visual produk baru dari awal. Susun urutan proses desain profesional!',
        mode: 'order',
        order: [
          'Terima brief dan tentukan tujuan desain',
          'Riset referensi lalu tentukan palet warna',
          'Buat sketsa dan kerangka layout',
          'Kerjakan desain digital lalu minta masukan',
          'Kirim berkas final sesuai format yang diminta'
        ],
        orderHint: 'Alur desainer: brief - riset - sketsa - eksekusi - kirim.'
      }
    ]
  },

  /* ================================ LEVEL 2 ============================== */
  {
    id: 'network',
    name: 'Network Engineer',
    alias: 'Teknisi / Insinyur Jaringan',
    icon: 'network',
    level: 2,
    color: PAL.green,
    npcName: 'Bu Nadia',
    greet: [
      'Selamat datang di lantai infrastruktur. Aku Nadia, Network Engineer.',
      'Aku merancang dan menjaga jaringan kantor supaya semua komputer bisa saling terhubung dengan aman.',
      'Kalau jaringan putus, satu gedung bisa berhenti bekerja. Itulah kenapa pekerjaan ini harus teliti. Siap ikut pengecekan?'
    ],
    char: { skin: PAL.skin2, hair: PAL.hairB, hairStyle: 'cap', top: PAL.green, topDark: PAL.green2, pants: PAL.ink3, shoes: PAL.dark, acc: 'cable' },
    duty: 'Merancang, mengimplementasikan, dan mengelola infrastruktur jaringan komputer (LAN/WAN) untuk menjamin konektivitas dan keamanan data.',
    duties: [
      'Merancang topologi dan skema alamat IP jaringan',
      'Memasang switch, router, serta titik akses nirkabel',
      'Memantau dan menangani gangguan koneksi jaringan'
    ],
    study: ['S1 Teknik Informatika (peminatan jaringan)', 'S1 Teknik Elektro', 'D3 Teknik Telekomunikasi'],
    certs: ['Cisco CCNA', 'MikroTik MTCNA / MTCRE', 'CompTIA Network+'],
    careers: ['Network Engineer', 'Teknisi Jaringan', 'Network Administrator'],
    chapters: [
      {
        title: 'Tiket #2041 - Satu Ruangan Tidak Dapat Internet',
        brief: 'Tim desain di ruang 2.3 melaporkan tidak ada koneksi internet. Lakukan pengecekan bertahap dari sisi fisik.',
        mode: 'check',
        steps: [
          { t: 'Cek lampu indikator pada switch dan router', k: 'switch' },
          { t: 'Periksa kabel LAN dan konektornya (RJ-45)', k: 'cable' },
          { t: 'Uji koneksi memakai perintah ping ke server', k: 'ping' },
          { t: 'Catat hasil pengecekan pada dokumentasi jaringan', k: 'doc' }
        ],
        followUp: 'Ternyata kabel LAN di patch panel terlepas. Jaringan kembali normal setelah dipasang ulang.'
      },
      {
        title: 'Tiket #2044 - Rancangan Jaringan Ruang Baru',
        brief: 'Perusahaan menambah satu ruangan kerja. Uji pemahamanmu tentang dasar jaringan komputer.',
        mode: 'quiz',
        quiz: [
          {
            q: 'Susunan atau pola hubungan antarperangkat dalam jaringan disebut?',
            a: ['Topologi jaringan', 'Tipografi', 'Bandwidth', 'Protokol email'],
            c: 0,
            why: 'Topologi menggambarkan bagaimana perangkat saling terhubung (star, bus, mesh, dan lainnya).'
          },
          {
            q: 'Fungsi perintah "ping" adalah?',
            a: ['Menguji apakah perangkat lain dapat dihubungi', 'Menghapus berkas di server', 'Menambah kecepatan internet', 'Mengganti kabel jaringan'],
            c: 0,
            why: 'Ping mengirim paket uji untuk melihat apakah jalur komunikasi masih hidup.'
          },
          {
            q: 'Perangkat yang menghubungkan banyak komputer dalam satu jaringan lokal adalah?',
            a: ['Switch', 'Monitor', 'Keyboard', 'Printer'],
            c: 0,
            why: 'Switch meneruskan data ke perangkat tujuan di dalam jaringan lokal.'
          }
        ]
      },
      {
        title: 'Tiket #2052 - Membangun Jaringan Kantor Cabang',
        brief: 'Kantor cabang baru perlu jaringan lengkap dari nol. Susun urutan pekerjaan Network Engineer!',
        mode: 'order',
        order: [
          'Identifikasi kebutuhan dan jumlah pengguna',
          'Rancang topologi serta skema alamat IP',
          'Pasang perangkat jaringan dan kabel',
          'Konfigurasi lalu uji koneksi (ping & speed test)',
          'Susun dokumentasi jaringan'
        ],
        orderHint: 'Kebutuhannya dulu, rancang, pasang, konfigurasi, dokumentasikan.'
      }
    ]
  },
  {
    id: 'dba',
    name: 'Database Administrator',
    alias: 'Administrator Basis Data',
    icon: 'dba',
    level: 2,
    color: PAL.blue,
    npcName: 'Pak Herman',
    greet: [
      'Selamat datang. Saya Herman, Database Administrator.',
      'Semua data penting perusahaan - pelanggan, transaksi, laporan - saya jaga di dalam basis data.',
      'Tugas saya memastikan data aman, rapi, dan tetap cepat diakses. Hari ini pencarian data pelanggan terasa melambat, ayo kita selidiki!'
    ],
    char: { skin: PAL.skin3, hair: PAL.hairD, hairStyle: 'short', top: PAL.blue2, topDark: '#1f4a85', pants: PAL.ink2, shoes: PAL.dark2, acc: 'folder' },
    duty: 'Merancang kapasitas penyimpanan data, mengamankan basis data, serta memastikan data dapat diakses dengan cepat dan efisien oleh pengguna yang berwenang.',
    duties: [
      'Merancang struktur tabel dan hubungan antar data',
      'Mengatur hak akses pengguna dan keamanan data',
      'Membuat pencadangan (backup) dan memantau performa'
    ],
    study: ['S1 Informatika', 'S1 Sistem Informasi', 'S1 Ilmu Komputer'],
    certs: ['Oracle Database SQL', 'Microsoft Azure Data Fundamentals', 'MTCNA (dasar jaringan)'],
    careers: ['Database Administrator', 'Data Engineer', 'Back-end Developer'],
    chapters: [
      {
        title: 'Tiket #2042 - Pencarian Data Pelanggan Melambat',
        brief: 'Aplikasi CRM terasa lambat saat mencari nama pelanggan. Ikuti prosedur pemeriksaan basis data.',
        mode: 'check',
        steps: [
          { t: 'Periksa jumlah baris dan ukuran tabel pelanggan', k: 'inspect' },
          { t: 'Cek indeks pada kolom yang sering dicari', k: 'index' },
          { t: 'Optimalkan query memakai perintah EXPLAIN', k: 'optimize' },
          { t: 'Buat cadangan (backup) sebelum perubahan besar', k: 'backup' }
        ],
        followUp: 'Setelah indeks ditambahkan, pencarian yang tadinya 6 detik menjadi 0,3 detik. Perubahan kecil bisa berdampak besar!'
      },
      {
        title: 'Tiket #2045 - Merancang Tabel Presensi Karyawan',
        brief: 'Perusahaan akan membuat sistem presensi baru. Uji pemahamanmu tentang basis data.',
        mode: 'quiz',
        quiz: [
          {
            q: 'Kumpulan data yang terorganisir dan dapat diakses secara terstruktur disebut?',
            a: ['Basis data', 'Bandwidth', 'Bootstrap', 'Biner'],
            c: 0,
            why: 'Basis data menyimpan data dalam tabel yang saling berhubungan.'
          },
          {
            q: 'Struktur yang mempercepat proses pencarian data adalah?',
            a: ['Indeks', 'Folder', 'Shortcut', 'Screenshot'],
            c: 0,
            why: 'Indeks bekerja seperti daftar isi buku, mempercepat pencarian baris data.'
          },
          {
            q: 'Tujuan utama membuat cadangan (backup) basis data adalah?',
            a: ['Data tetap aman saat terjadi kegagalan sistem', 'Menghemat daya listrik', 'Menambah kapasitas RAM', 'Membuat laptop lebih dingin'],
            c: 0,
            why: 'Backup adalah jaring pengaman utama seorang DBA.'
          }
        ]
      },
      {
        title: 'Tiket #2053 - Migrasi Basis Data Keuangan',
        brief: 'Basis data lama akan dipindahkan ke server baru tanpa kehilangan data. Susun urutan kerjanya!',
        mode: 'order',
        order: [
          'Rancang struktur tabel dan hubungngan antar data',
          'Tentukan tipe data dan kunci utama (primary key)',
          'Isi data lalu atur aturan keamanan (constraint)',
          'Atur hak akses pengguna berdasarkan peran',
          'Buat jadwal pencadangan dan pemantauan'
        ],
        orderHint: 'Susun dulu strukturnya, baru isi data dan atur hak aksesnya.'
      }
    ]
  },
  {
    id: 'data',
    name: 'Data Analyst',
    alias: 'Analis Data',
    icon: 'data',
    level: 2,
    color: PAL.lime,
    npcName: 'Kak Dinda',
    greet: [
      'Hai, aku Dinda, Data Analyst di TechCorp.',
      'Aku mengubah tumpukan angka menjadi cerita yang bisa dipakai pimpinan untuk mengambil keputusan.',
      'Setiap bulan aku menyiapkan laporan penjualan. Datanya banyak dan berantakan, tapi di situlah tantangannya. Yuk kita kerjakan bersama!'
    ],
    char: { skin: PAL.skin, hair: PAL.hairB, hairStyle: 'short', top: PAL.lime, topDark: '#87b336', pants: PAL.gray2, shoes: PAL.dark, acc: 'tablet' },
    duty: 'Mengumpulkan, mengolah, dan menganalisis data untuk menghasilkan wawasan (insight) yang berguna bagi pengambilan keputusan bisnis perusahaan.',
    duties: [
      'Membersihkan data agar siap dianalisis',
      'Membuat ringkasan, grafik, dan visualisasi data',
      'Menyampaikan temuan sebagai rekomendasi keputusan'
    ],
    study: ['S1 Statistika', 'S1 Informatika (peminatan data)', 'S1 Sistem Informasi'],
    certs: ['Google Data Analytics', 'Microsoft Power BI Data Analyst', 'SQL for Data Science (Coursera)'],
    careers: ['Data Analyst', 'Business Intelligence Analyst', 'Data Scientist'],
    chapters: [
      {
        title: 'Tiket #2043 - Laporan Penjualan Bulanan',
        brief: 'Laporan penjualan bulan ini harus selesai sebelum rapat pimpinan. Ikuti langkah pengolahan data.',
        mode: 'check',
        steps: [
          { t: 'Kumpulkan data dari sumber resmi (sistem kasir)', k: 'docs' },
          { t: 'Bersihkan data kosong dan data ganda', k: 'clean' },
          { t: 'Buat ringkasan angka dan grafik tren', k: 'chart' },
          { t: 'Tulis kesimpulan (insight) untuk pimpinan', k: 'insight' }
        ],
        followUp: 'Ternyata penjualan tertinggi ada di akhir pekan. Insight ini dipakai tim marketing untuk menyusun jadwal promo.'
      },
      {
        title: 'Tiket #2046 - Membaca Grafik dengan Tepat',
        brief: 'Klien meminta penjelasan atas grafik yang kamu buat. Pastikan interpretasimu benar.',
        mode: 'quiz',
        quiz: [
          {
            q: 'Mengurutkan data dari nilai terkecil ke terbesar disebut?',
            a: ['Sorting ascending', 'Filtering', 'Merging', 'Casting'],
            c: 0,
            why: 'Ascending = naik (kecil ke besar); descending = turun.'
          },
          {
            q: 'Grafik yang paling tepat untuk menunjukkan tren penjualan tiap bulan adalah?',
            a: ['Line chart (grafik garis)', 'Pie chart', 'Barcode', 'Word cloud'],
            c: 0,
            why: 'Garis paling jelas menunjukkan naik-turun nilai sepanjang waktu.'
          },
          {
            q: 'Baris data yang kosong atau ganda pada laporan sebaiknya?',
            a: ['Dibersihkan sebelum dianalisis', 'Dibiarkan karena tidak berpengaruh', 'Ditambah jumlahnya', 'Dihapus seluruh tabelnya'],
            c: 0,
            why: 'Data kotor menghasilkan kesimpulan yang salah - atau disebut garbage in, garbage out.'
          }
        ]
      },
      {
        title: 'Tiket #2054 - Menyelamatkan Laporan yang Salah',
        brief: 'Pimpinan menemukan angka laporan berbeda jauh dari catatan keuangan. Susun ulang proses analisis yang benar!',
        mode: 'order',
        order: [
          'Pahami pertanyaan bisnis yang harus dijawab',
          'Kumpulkan data dari sumber resmi',
          'Bersihkan dan validasi data',
          'Analisis lalu buat visualisasinya',
          'Sampaikan insight sebagai rekomendasi'
        ],
        orderHint: 'Mulai dari pertanyaan, bukan dari data.'
      }
    ]
  },

  /* ================================ LEVEL 3 ============================== */
  {
    id: 'se',
    name: 'Software Engineer',
    alias: 'Insinyur Perangkat Lunak',
    icon: 'se',
    level: 3,
    color: PAL.cyan,
    npcName: 'Mas Aldi',
    greet: [
      'Halo, aku Aldi, Software Engineer.',
      'Aku menulis kode untuk membangun aplikasi yang dipakai ribuan orang setiap hari.',
      'Menulis kode itu hanya separuh pekerjaan - separuh lainnya menguji dan memperbaiki. Ayo bantu aku membereskan fitur login yang masih bermasalah!'
    ],
    char: { skin: PAL.skin2, hair: PAL.hairD, hairStyle: 'spiky', top: PAL.ink3, topDark: PAL.ink2, pants: PAL.ink2, shoes: PAL.dark2, acc: 'hoodie' },
    duty: 'Mengembangkan, menguji, dan memelihara perangkat lunak berdasarkan spesifikasi kebutuhan pengguna serta memastikan kualitas kode program.',
    duties: [
      'Menerjemahkan kebutuhan pengguna menjadi rancangan program',
      'Menulis kode bersih dan mudah dipahami tim',
      'Menguji, memperbaiki bug, lalu merilis versi baru'
    ],
    study: ['S1 Informatika', 'S1 Teknik Informatika', 'S1 Rekayasa Perangkat Lunak'],
    certs: ['Junior Web Developer (LSP/BNSP)', 'Dicoding: Belajar Dasar Pemrograman', 'AWS Certified Developer (lanjutan)'],
    careers: ['Software Engineer', 'Mobile Developer', 'Backend Engineer'],
    chapters: [
      {
        title: 'Tiket #3041 - Fitur Login Belum Berjalan',
        brief: 'Fitur login aplikasi internal belum bisa dipakai. Ikuti alur kerja Software Engineer dari kebutuhan sampai perbaikan.',
        mode: 'check',
        steps: [
          { t: 'Pahami kebutuhan fitur dari pengguna', k: 'requirement' },
          { t: 'Tulis kode program untuk fitur tersebut', k: 'code' },
          { t: 'Uji coba dengan berbagai kasus (benar & salah)', k: 'test' },
          { t: 'Perbaiki bug yang ditemukan saat pengujian', k: 'debug' }
        ],
        followUp: 'Bug ternyata terjadi ketika sandi mengandung simbol. Setelah diperbaiki, fitur login lolos semua pengujian.'
      },
      {
        title: 'Tiket #3047 - Kode yang Sulit Dibaca Tim',
        brief: 'Rekan timmu kesulitan melanjutkan kode yang kamu tulis. Pilih kebiasaan kerja yang benar.',
        mode: 'quiz',
        quiz: [
          {
            q: 'Proses mencari dan memperbaiki kesalahan pada kode program disebut?',
            a: ['Debugging', 'Rebranding', 'Reformatting', 'Recycling'],
            c: 0,
            why: 'Debugging = memburu bug, istilahnya dari kata "bug" (serangga) yang mengganggu program.'
          },
          {
            q: 'Agar riwayat perubahan kode tercatat rapi, tim developer memakai?',
            a: ['Git / version control', 'Buku catatan kertas', 'Chat pribadi', 'Ganti monitor baru'],
            c: 0,
            why: 'Version control merekam siapa mengubah apa dan kapan, sehingga mudah dikembalikan.'
          },
          {
            q: 'Kode yang baik untuk kerja tim sebaiknya?',
            a: ['Diberi nama variabel jelas dan komentar seperlunya', 'Ditulis satu baris panjang tanpa spasi', 'Tanpa nama yang dapat dimengerti', 'Disimpan tanpa dokumentasi'],
            c: 0,
            why: 'Kode dibaca jauh lebih sering daripada ditulis - jelas berarti hemat waktu tim.'
          }
        ]
      },
      {
        title: 'Tiket #3055 - Merilis Versi 2.0 Aplikasi',
        brief: 'Aplikasi akan naik ke versi 2.0. Susun urutan siklus pengembangan perangkat lunak yang benar!',
        mode: 'order',
        order: [
          'Kumpulkan kebutuhan pengguna',
          'Rancang alur dan struktur program',
          'Tulis kode program',
          'Uji (testing) lalu perbaiki bug',
          'Rilis dan pantau kinerjanya'
        ],
        orderHint: 'Siklus klasik: kebutuhan - rancangan - kode - uji - rilis.'
      }
    ]
  },
  {
    id: 'uiux',
    name: 'UI/UX Designer',
    alias: 'Perancang Antarmuka & Pengalaman Pengguna',
    icon: 'uiux',
    level: 3,
    color: PAL.purple,
    npcName: 'Kak Sasha',
    greet: [
      'Hi! Aku Sasha, UI/UX Designer.',
      'Aku memastikan aplikasi tidak hanya enak dilihat, tapi juga mudah dipakai siapa saja.',
      'Pekerjaan ini berhubungan erat dengan perasaan pengguna: kalau mereka bingung, berarti desainnya belum selesai. Ayo perbaiki aplikasi yang sering dikeluhkan siswa!'
    ],
    char: { skin: PAL.skin, hair: PAL.hairD, hairStyle: 'bob', top: PAL.purple, topDark: PAL.purple2, pants: PAL.ink2, shoes: PAL.dark, acc: 'stylus' },
    duty: 'Menggabungkan estetika visual (User Interface) dan kemudahan penggunaan (User Experience) untuk menciptakan antarmuka aplikasi yang intuitif dan menarik bagi pengguna.',
    duties: [
      'Meneliti kebutuhan dan kebiasaan pengguna',
      'Membuat wireframe dan prototipe yang bisa diuji',
      'Menjaga konsistensi tampilan bersama tim developer'
    ],
    study: ['S1 Desain Komunikasi Visual', 'S1 Informatika (interaksi manusia-komputer)', 'S1 Desain Produk'],
    certs: ['Google UX Design Certificate', 'Interaction Design Foundation (IxDF)', 'Sertifikasi UI/UX (LSP/BNSP)'],
    careers: ['UI/UX Designer', 'Product Designer', 'Interaction Designer'],
    chapters: [
      {
        title: 'Tiket #3042 - Aplikasi Sekolah Sulit Dipakai Siswa',
        brief: 'Banyak siswa mengeluh aplikasi absensi membingungkan. Mulai dari mendengarkan pengguna.',
        mode: 'check',
        steps: [
          { t: 'Wawancarai pengguna dan catat keluhannya', k: 'interview' },
          { t: 'Buat sketsa alur penggunaan aplikasi', k: 'flow' },
          { t: 'Susun tampilan, tombol, dan ukuran huruf', k: 'wireframe' },
          { t: 'Uji ke pengguna lalu perbaiki desainnya', k: 'usability' }
        ],
        followUp: 'Tombol "Absen" ternyata terlalu kecil di HP berlayar kecil. Setelah diperbesar, keluhan turun drastis.'
      },
      {
        title: 'Tiket #3048 - Membedakan UI dan UX',
        brief: 'Klien bertanya apa bedanya UI dan UX. Jelaskan dengan tepat!',
        mode: 'quiz',
        quiz: [
          {
            q: 'UI (User Interface) berfokus pada?',
            a: ['Tampilan visual produk yang dilihat pengguna', 'Kecepatan koneksi internet', 'Harga jual produk', 'Jumlah server perusahaan'],
            c: 0,
            why: 'UI mengurus tampilan: warna, huruf, tombol, dan tata letak.'
          },
          {
            q: 'UX (User Experience) berfokus pada?',
            a: ['Kemudahan dan kenyamanan pengguna saat memakai produk', 'Warna tombol saja', 'Ukuran berkas aplikasi', 'Jumlah pengikut media sosial'],
            c: 0,
            why: 'UX mengurus keseluruhan pengalaman: apakah pengguna mudah mencapai tujuannya.'
          },
          {
            q: 'Sketsa sederhana rancangan tampilan sebelum dibuat final disebut?',
            a: ['Wireframe', 'Watermark', 'Firewall', 'Webcam'],
            c: 0,
            why: 'Wireframe membuat ide cepat diuji tanpa biaya desain penuh.'
          }
        ]
      },
      {
        title: 'Tiket #3056 - Redesain Aplikasi dari Nol',
        brief: 'Aplikasi warisan lama akan didesain ulang agar sesuai kebiasaan pengguna saat ini. Susun urutan kerja designer!',
        mode: 'order',
        order: [
          'Riset kebutuhan dan masalah pengguna',
          'Buat flow dan wireframe',
          'Buat prototipe yang bisa dicoba',
          'Uji ke pengguna (usability testing)',
          'Serahkan desain ke developer (handoff)'
        ],
        orderHint: 'Riset dulu, baru menggambar; uji dulu, baru serahkan.'
      }
    ]
  },
  {
    id: 'cyber',
    name: 'Cyber Security',
    alias: 'Analis Keamanan Siber',
    icon: 'cyber',
    level: 3,
    color: PAL.cyan2,
    npcName: 'Pak Reza',
    greet: [
      'Selamat datang di lantai tiga. Saya Reza, Cyber Security Analyst.',
      'Tugas saya melindungi data dan sistem perusahaan dari serangan digital.',
      'Ancaman datang tanpa suara - sering lewat email yang tampak biasa. Hari ini ada email mencurigakan masuk ke kotak staf. Ayo kita periksa dengan hati-hati.'
    ],
    char: { skin: PAL.skin3, hair: PAL.hairD, hairStyle: 'long', top: '#252b3d', topDark: PAL.dark2, pants: PAL.dark2, shoes: PAL.dark2, acc: 'hacker' },
    duty: 'Melindungi sistem komputer, jaringan, dan data perusahaan dari serangan siber serta memantau ancaman keamanan digital.',
    duties: [
      'Memantau lalu lintas jaringan dan log keamanan',
      'Mencari celah keamanan lalu menutupnya',
      'Menyusun prosedur tanggap darurat dan edukasi karyawan'
    ],
    study: ['S1 Informatika (peminatan keamanan)', 'S1 Teknik Komputer', 'S1 Ilmu Komputer'],
    certs: ['CompTIA Security+', 'EC-Council CEH', 'Cisco CyberOps Associate'],
    careers: ['Cyber Security Analyst', 'Penetration Tester', 'Security Engineer'],
    chapters: [
      {
        title: 'Tiket #3043 - Email Mencurigakan di Kotak Staf',
        brief: 'Ada email "Tagihan Mendesak" dari alamat asing. Ikuti prosedur penanganan insiden keamanan.',
        mode: 'check',
        steps: [
          { t: 'Periksa alamat pengirim dan tautan di dalam email', k: 'sender' },
          { t: 'Laporkan temuan phising ke tim keamanan', k: 'report' },
          { t: 'Buka tautan hanya di lingkungan aman (sandbox)', k: 'sandbox' },
          { t: 'Edukasi staf agar tidak mengklik tautan asing', k: 'educate' }
        ],
        followUp: 'Email tersebut ternyata phising yang meniru logo bank. Karena dilaporkan cepat, tidak ada data yang jatuh ke tangan penyerang.'
      },
      {
        title: 'Tiket #3049 - Sandi dan Lapisan Pengaman',
        brief: 'Audit keamanan menemukan sandi karyawan terlalu lemah. Uji pemahamanmu!',
        mode: 'quiz',
        quiz: [
          {
            q: 'Email palsu yang menjebak korban menyerahkan data disebut?',
            a: ['Phising', 'Ping', 'Posting', 'Patch'],
            c: 0,
            why: 'Phising memancing korban dengan pesan yang tampak resmi.'
          },
          {
            q: 'Kata sandi yang kuat adalah?',
            a: ['Panjang, unik, memakai huruf besar-kecil, angka, dan simbol', 'Tanggal lahir sendiri', 'Nama hewan peliharaan', '123456'],
            c: 0,
            why: 'Semakin panjang dan tidak mudah ditebak, semakin lama waktu yang dibutuhkan penyerang untuk membobolnya.'
          },
          {
            q: 'Autentikasi dua faktor (2FA) berfungsi untuk?',
            a: ['Menambah lapisan pengaman saat login', 'Mempercepat koneksi internet', 'Menghapus virus otomatis', 'Menyalin berkas lebih cepat'],
            c: 0,
            why: 'Dengan 2FA, sandi yang bocor saja belum cukup untuk masuk ke akun.'
          }
        ]
      },
      {
        title: 'Tiket #3057 - Audit Keamanan Tahunan',
        brief: 'Perusahaan akan menghadapi audit keamanan. Susun urutan prosedur kerja tim keamanan!',
        mode: 'order',
        order: [
          'Petakan aset data dan sistem yang harus dilindungi',
          'Cari celah keamanan (vulnerability assessment)',
          'Tutup celah dengan patch dan perkuat sandi',
          'Pantau lalu lintas yang mencurigakan',
          'Susun prosedur tanggap darurat dan pelatihan'
        ],
        orderHint: 'Kenali yang dilindungi, cari celahnya, tutup, pantau, siapkan rencana.'
      }
    ]
  },
  {
    id: 'ai',
    name: 'AI Specialist',
    alias: 'Spesialis Kecerdasan Buatan',
    icon: 'ai',
    level: 3,
    color: PAL.purple2,
    npcName: 'Bu Kartika',
    greet: [
      'Halo, saya Kartika, AI Specialist.',
      'Saya mengembangkan sistem cerdas yang dapat belajar dari data - salah satunya chatbot layanan sekolah.',
      'AI bukan sulap: hasilnya sangat bergantung pada kualitas data dan etika penggunaannya. Ayo bantu saya melatih chatbot sekolah!'
    ],
    char: { skin: PAL.skin2, hair: PAL.hairP, hairStyle: 'pony', top: PAL.off, topDark: PAL.gray3, pants: PAL.blue2, shoes: PAL.dark, acc: 'labcoat' },
    duty: 'Mengembangkan sistem cerdas yang mampu belajar dan beradaptasi (Kecerdasan Buatan) untuk menyelesaikan masalah kompleks secara otomatis.',
    duties: [
      'Mengumpulkan dan menyiapkan data pelatihan',
      'Melatih serta menguji akurasi model kecerdasan buatan',
      'Menjaga privasi data dan keadilan sistem'
    ],
    study: ['S1 Informatika', 'S1 Ilmu Komputer', 'S1 Matematika / Sains Data'],
    certs: ['TensorFlow Developer Certificate', 'IBM AI Engineering', 'Microsoft Azure AI Fundamentals'],
    careers: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist'],
    chapters: [
      {
        title: 'Tiket #3044 - Chatbot Sekolah Belum Paham Pertanyaan',
        brief: 'Chatbot layanan sekolah sering salah menjawab. Ikuti tahapan melatih sistem kecerdasan buatan.',
        mode: 'check',
        steps: [
          { t: 'Kumpulkan contoh pertanyaan dan jawaban siswa', k: 'corpus' },
          { t: 'Beri label pada contoh data agar terbaca sistem', k: 'label' },
          { t: 'Latih model memakai data yang sudah berlabel', k: 'train' },
          { t: 'Uji jawaban model lalu perbaiki datanya', k: 'evaluate' }
        ],
        followUp: 'Setelah 500 contoh pertanyaan dilabeli, akurasi chatbot naik dari 62% menjadi 89%. Kualitas data menentukan kualitas AI!'
      },
      {
        title: 'Tiket #3050 - Data dan Etika AI',
        brief: 'Tim ingin memakai data pribadi siswa untuk melatih model. Pastikan keputusanmu benar.',
        mode: 'quiz',
        quiz: [
          {
            q: 'Kemampuan sistem komputer meniru cara manusia belajar disebut?',
            a: ['Kecerdasan Buatan (AI)', 'Kompiler', 'Kapasitas', 'Clipboard'],
            c: 0,
            why: 'AI memakai data dan algoritma untuk mengenali pola lalu mengambil keputusan.'
          },
          {
            q: 'Data yang sudah diberi keterangan benar/salah untuk melatih model disebut?',
            a: ['Data latih berlabel', 'Data kosong', 'Data cadangan', 'Data rahasia'],
            c: 0,
            why: 'Label adalah "kunci jawaban" yang dipakai model untuk belajar.'
          },
          {
            q: 'Etika penting dalam pengembangan AI adalah?',
            a: ['Menjaga privasi dan keadilan penggunaan data', 'Mengambil data orang tanpa izin', 'Menyembunyikan kesalahan model', 'Membagikan data pribadi pengguna'],
            c: 0,
            why: 'AI yang baik harus adil, transparan, dan menghormati privasi pengguna.'
          }
        ]
      },
      {
        title: 'Tiket #3058 - Menghadirkan AI di Layanan Publik',
        brief: 'Sekolah akan memakai AI untuk menjawab pertanyaan orang tua. Susun urutan proyeknya!',
        mode: 'order',
        order: [
          'Tentukan masalah yang ingin diselesaikan',
          'Kumpulkan dan bersihkan data',
          'Pilih model lalu latih dengan data',
          'Evaluasi akurasi lalu perbaiki (ulangi bila perlu)',
          'Terapkan (deploy) dan pantau etika privasinya'
        ],
        orderHint: 'Masalah dulu, bukan teknologi.'
      }
    ]
  }
];

/* ------------------------------- LEVEL --------------------------------- */
export const LEVELS = [
  {
    id: 1,
    name: 'Lantai 1 - Pondasi Digital',
    theme: 'Pondasi Digital',
    mapKey: 'floor1',
    professions: ['itsupport', 'webdev', 'graphic'],
    desc: 'Profesi yang hasil kerjanya paling nyata dan mudah kamu lihat sehari-hari.',
    salary: 2500000,
    salaryLabel: 'Rp 2.500.000 (ilustrasi gaji awal staf magang tetap)'
  },
  {
    id: 2,
    name: 'Lantai 2 - Infrastruktur & Data',
    theme: 'Infrastruktur & Data',
    mapKey: 'floor2',
    professions: ['network', 'dba', 'data'],
    desc: 'Profesi yang menjaga "urat nadi" perusahaan: jaringan dan data.',
    salary: 4500000,
    salaryLabel: 'Rp 4.500.000 (ilustrasi gaji junior staff)'
  },
  {
    id: 3,
    name: 'Lantai 3 - Spesialisasi & Intelegensia',
    theme: 'Spesialisasi & Intelegensia',
    mapKey: 'floor3',
    professions: ['se', 'uiux', 'cyber', 'ai'],
    desc: 'Profesi spesialis yang menuntut keahlian mendalam dan pemikiran tingkat tinggi.',
    salary: 7000000,
    salaryLabel: 'Rp 7.000.000 (ilustrasi gaji senior specialist)'
  }
];

/* --------------------------- URUTAN PROFESI ----------------------------- */
export const PROF_MAP = {};
PROFESSIONS.forEach((p) => { PROF_MAP[p.id] = p; });
export const LEVEL_MAP = {};
LEVELS.forEach((l) => { LEVEL_MAP[l.id] = l; });

/* --------------------- MISI PENUTUP (TES KOMPETENSI) -------------------- */
export const MASTERY = {
  title: 'Tes Kompetensi Karier',
  brief: 'Semua divisi sudah kamu selesaikan. Tim HRD ingin memastikan pemahamanmu sebelum kamu diangkat menjadi Senior Specialist.',
  passScore: 80
};

/* ------------------- ATURAN EKONOMI & PENGHARGAAN ---------------------- */
export const ECONOMY = {
  coinPerStar: 25,          /* koin tambahan untuk setiap bintang */
  baseCoin: [40, 70, 110],  /* koin dasar babak 1, 2, 3 */
  masteryCoin: 300,
  salaryByLevel: [2500000, 4500000, 7000000]
};

/* ------------------------- KUSTOMISASI PEMAIN --------------------------- */
/* Tabel 3.4: pemain memilih gender & warna pakaian (sense of ownership).   */
export const SKIN_TONES = [
  { id: 'terang', label: 'Kuning Langsat', skin: PAL.skin, skin2: PAL.skin2, skin3: PAL.skin3 },
  { id: 'sawo', label: 'Sawo Matang', skin: PAL.skin2, skin2: PAL.skin3, skin3: PAL.skin4 },
  { id: 'gelap', label: 'Gelap Manis', skin: PAL.skin4, skin2: PAL.skin4, skin3: PAL.skin5 }
];

export const GENDERS = [
  { id: 'pria', label: 'Laki-laki', hairStyle: 'spiky', hair: PAL.hairD, hairOptions: [PAL.hairD, PAL.hairB] },
  { id: 'wanita', label: 'Perempuan', hairStyle: 'pony', hair: PAL.hairD, hairOptions: [PAL.hairD, PAL.hairB, PAL.hairY] }
];

export const SHIRT_COLORS = [
  { id: 'biru', label: 'Biru', top: PAL.blue, topDark: PAL.blue2 },
  { id: 'hijau', label: 'Hijau', top: PAL.teal, topDark: PAL.teal2 },
  { id: 'merah', label: 'Merah', top: PAL.red, topDark: PAL.red2 },
  { id: 'ungu', label: 'Ungu', top: PAL.purple, topDark: PAL.purple2 },
  { id: 'kuning', label: 'Kuning', top: PAL.yellow, topDark: PAL.yellow2 },
  { id: 'gelap', label: 'Hitam', top: PAL.ink3, topDark: PAL.ink2 }
];

export const PANTS_COLORS = [
  { id: 'denim', label: 'Denim', pants: '#39557e' },
  { id: 'hitam', label: 'Hitam', pants: PAL.ink2 },
  { id: 'abu', label: 'Abu', pants: PAL.gray2 },
  { id: 'krem', label: 'Krem', pants: '#a08a6a' }
];

export const DEFAULT_PROFILE = {
  gender: 'pria',
  skin: 'terang',
  shirt: 'biru',
  pants: 'denim',
  hair: 0
};

/** Membangun konfigurasi warna karakter pemain dari profil pilihan. */
export function profileToChar(profile) {
  const g = GENDERS.find((x) => x.id === profile.gender) || GENDERS[0];
  const s = SKIN_TONES.find((x) => x.id === profile.skin) || SKIN_TONES[0];
  const sh = SHIRT_COLORS.find((x) => x.id === profile.shirt) || SHIRT_COLORS[0];
  const pt = PANTS_COLORS.find((x) => x.id === profile.pants) || PANTS_COLORS[0];
  return {
    skin: s.skin,
    skin2: s.skin2,
    skin3: s.skin3,
    hair: g.hairOptions[profile.hair % g.hairOptions.length],
    hairStyle: g.hairStyle,
    top: sh.top,
    topDark: sh.topDark,
    pants: pt.pants,
    shoes: PAL.dark,
    acc: 'badge'
  };
}

/* --------------------------- KARAKTER NPC HRD -------------------------- */
export const HRD_CHAR = {
  skin: PAL.skin, hair: PAL.hairR, hairStyle: 'bob', top: PAL.pink,
  topDark: '#c95f88', pants: PAL.ink3, shoes: PAL.dark, acc: 'badge'
};

/* ------------------------------ PANDUAN -------------------------------- */
export const HELP_PAGES = [
  {
    title: 'Cara Bermain',
    items: [
      'Gunakan tombol arah (joystick) untuk berjalan, dan tombol A untuk berbicara/interaksi.',
      'Dekati meja kerja yang ada penanda "!" lalu tekan A untuk memulai misi profesi.',
      'Setiap profesi punya 3 babak misi yang makin menantang.',
      'Tuntaskan semua misi di satu lantai untuk naik jabatan, mendapat kenaikan gaji, dan membuka lantai berikutnya.'
    ]
  },
  {
    title: 'Cara Menilai Bintang',
    items: [
      'Bintang 3: jawaban/tindakanmu benar semua.',
      'Bintang 2: maksimal 1 kesalahan.',
      'Bintang 1: maksimal 2 kesalahan.',
      'Untuk membuka lantai berikutnya, setiap misi di lantai saat ini minimal harus Bintang 2.'
    ]
  },
  {
    title: 'Ensiklopedia Karier',
    items: [
      'Setiap misi yang selesai akan membuka kartu profesi di menu Ensiklopedia.',
      'Kartu berisi rincian tugas, jurusan kuliah, sertifikasi, dan jalur karier profesi tersebut.',
      'Buka juga Tes Kompetensi setelah semua divisi selesai untuk menguji pemahamanmu.'
    ]
  }
];
