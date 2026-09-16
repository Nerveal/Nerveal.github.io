# Career Quest

**Game edukasi RPG sebagai media visualisasi profesi bidang Informatika untuk siswa kelas X (Fase E).**

Career Quest adalah realisasi produk dari skripsi *"Pengembangan Game Edukasi RPG sebagai Media
Visualisasi Profesi Informatika untuk Kelas X Berbasis Android"* (Sakirul Anam, 220631100118,
Program Studi Pendidikan Informatika, Universitas Trunojoyo Madura). Produk dikembangkan mengikuti
model **Multimedia Development Life Cycle (MDLC) Luther–Sutopo**.

Pemain berperan sebagai **staf magang (Junior Intern)** di perusahaan teknologi fiktif *TechCorp*,
lalu berkeliling **10 divisi profesi informatika** di **3 lantai** untuk menyelesaikan misi,
mengumpulkan bintang & **Gold**, menerima **slip gaji**, berbelanja di **Shop Kostumisasi**,
dan membuka Ensiklopedia Karier.

> **Desain visual (v2).** Tata visual, alur adegan, dan penamaan tombol mengikuti **12 mockup
> referensi**: judul *CAREER QUEST (Simulasi Karir IT)*, Office Hub satu layar dengan karpet zona
> divisi, panel misi bergaya perangkat kerja, *Mission Complete* berbintang, konfirmasi naik level
> IYA/TIDAK, pop-up **LEVEL UP**, **Slip Gaji** (Gaji Pokok + Bonus), Shop Kostumisasi, dan adegan
> **Game Completion**. Kanvas **640 × 384 px (16:9)** tanpa gulir/kamera; **label Scene 01–12**
> ditampilkan di sudut kiri atas (dapat dimatikan lewat *Mode Presentasi*).

---

## 1. Cara Menjalankan

Aplikasi adalah situs statis tanpa proses *build* — cukup dibuka di peramban.

**A. Di GitHub Pages (paling mudah)**

Buka `https://<nama-pengguna>.github.io/career-quest/` setelah repositori diterbitkan
(Settings → Pages → Deploy from branch → `main` → `/ (root)`).

**B. Menjalankan lokal**

```bash
# dari akar repositori
python3 -m http.server 8080
# lalu buka http://localhost:8080/career-quest/
```

> Game memakai ES Modules, jadi harus dilayani lewat http (bukan `file://`).

**C. Sebagai aplikasi Android**

Karena seluruh permainan berjalan di dalam satu berkas HTML, aplikasi dapat dikemas menjadi `.apk`
tanpa perubahan kode, misalnya dengan **Median/WebIntoApp**, **Capacitor**, atau **Android Studio
(WebView + WebViewAssetLoader)**. Semua aset sudah tertanam di dalam kode (tidak ada berkas gambar
atau audio eksternal), sehingga aplikasi tetap berjalan **offline**.

---

## 2. Kontrol

| Aksi | Papan tombol | Perangkat sentuh |
| --- | --- | --- |
| Berjalan | `W A S D` atau tombol panah | **D-pad** di kiri bawah |
| Interaksi / maju dialog | `A`, `Z`, `E`, `Spasi`, `Enter` | tombol **A** bulat di kanan bawah / ketuk kotak dialog |
| Jeda & menu | `Esc` | tombol `II` pada HUD |
| Ensiklopedia | ikon **BUKU** pada HUD | tombol **BUKU** pada HUD |

Seluruh ruangan dirancang **satu layar** (640 × 384 px) sehingga pemain tidak perlu menggulir dan
seluruh isi ruangan langsung terlihat — sesuai mockup desain.

---

## 3. Isi Permainan (pemetaan ke dokumen skripsi)

### 3.1 Sepuluh profesi dan distribusi level — Tabel 2.2 & Tabel 3.2

| Lantai | Tema | Profesi |
| --- | --- | --- |
| 1 | Pondasi Digital | IT Support, Web Developer, Digital Graphic Designer |
| 2 | Infrastruktur & Data | Network Engineer, Database Administrator, Data Analyst |
| 3 | Spesialisasi & Intelegensia | Software Engineer, UI/UX Designer, Cyber Security, AI Specialist |

Setiap profesi memiliki **3 babak misi** dengan tiga mode permainan:

| Mode | Bentuk aktivitas | Contoh |
| --- | --- | --- |
| **Simulasi Langkah** | memilih dan mengurutkan tindakan sesuai prosedur, dengan tindakan pengecoh | urutan troubleshooting tiket IT Support |
| **Kuis Pemahaman** | pilihan ganda konsep, disertai pembahasan setiap jawaban | istilah topologi jaringan, SQL, UI vs UX |
| **Susun Alur Kerja** | menyusun tahapan proyek/prosedur berurutan | siklus pengembangan perangkat lunak |

### 3.2 Sistem penilaian bintang — Tabel 3.2

| Bintang | Syarat |
| --- | --- |
| ★★★ | tidak ada kesalahan |
| ★★☆ | maksimal 1 kesalahan |
| ★☆☆ | maksimal 2 kesalahan |

Divisi dianggap **tuntas** bila ketiga babaknya minimal ★★☆. Seluruh divisi pada satu lantai harus
tuntas agar pemain **naik jabatan, menerima kenaikan gaji, dan membuka lantai berikutnya**
(implementasi mekanisme *level unlock* pada Tabel 3.2).

### 3.3 Pemetaan kurikulum — Tabel 3.1

| Komponen kurikulum | Implementasi di dalam game |
| --- | --- |
| Deskripsi Fase E — wawasan profesi informatika | konsep RPG: pemain berperan sebagai staf magang (role-play) pada 10 divisi |
| Elemen Dampak Sosial Informatika (DSI) — aspek ekonomi | sistem ekonomi: **Gold** per misi, **Slip Gaji** bulanan (Gaji Pokok + Bonus Proyek), dan **Shop Kostumisasi**, catatan belajar pada setiap promosi |
| Tujuan Pembelajaran Bab 8 — rencana studi lanjut & karier | **Ensiklopedia Karier**: deskripsi tugas, jurusan kuliah, sertifikasi, dan jalur karier setiap profesi |
| Elemen Praktik Lintas Bidang (PLB) | tiga mode misi: urutan prosedur kerja, pengujian konsep, dan dokumentasi solusi |

### 3.4 Fitur lain

* **Kustomisasi karakter** (gender, warna kulit, baju, celana, warna rambut) beserta ringkasan slot
  kostumisasi — Tabel 3.3, *Player Avatar*.
* **Shop Kostumisasi**: 8 gaya rambut, 5 jaket, 3 sepatu, dan 3 aksesori (18 item) yang dibeli
  memakai Gold lalu otomatis dipakai pada karakter.
* **10 NPC mentor** dengan atribut visual sesuai profesi + **HRD** di meja resepsionis —
  Tabel 3.3, *NPC Mentor/Senior/Expert*.
* **Slip Gaji & LEVEL UP**: Lantai 1 Rp 5.000.000 + Rp 1.500.000, Lantai 2 Rp 7.500.000 +
  Rp 2.000.000, Lantai 3 Rp 10.000.000 + Rp 3.000.000 (total Rp 29.000.000), masing-masing
  menambah Gold dan menaikkan jabatan.
* **Label Scene 01–12 (Mode Presentasi)** untuk memudahkan demo/sidang dibandingkan dengan mockup.
* **Adegan Scene 10** — pemain memilih satu dari empat divisi spesialisasi saat pertama kali masuk
  Lantai 3, lalu diantar langsung ke meja divisi tersebut.
* **Tes Kompetensi Karier**: 10 soal acak dari seluruh materi, nilai kelulusan 80, hadiah 500 Gold,
  dilanjutkan adegan penutup **Game Completion** berisi Total Skor, Total Gold, Total Bintang,
  Level Akhir, Nilai Tes, dan Total Gaji.
* **Ensiklopedia Karier** yang terbuka bertahap sesuai misi yang telah diselesaikan.
* **Penyimpanan otomatis** (localStorage) sehingga progres dapat dilanjutkan.
* **Menu Panduan**, **pemetaan kurikulum**, dan **rubrik capaian otomatis** (mengacu Tabel 3.8 untuk konversi tingkat pencapaian).

---

## 4. Struktur Berkas

```
career-quest/
├─ index.html            kerangka UI: HUD, dialog, layar judul, shop, ensiklopedia, panel misi
├─ css/style.css         tema mockup: latar gedung kaca, tombol bevel, dialog putih, panel emas
├─ js/
│  ├─ art.js             mesin pixel art (tile 32 px, karakter 24x36, ~30 prop, gaya rambut/jaket/aksesori)
│  ├─ maps.js            peta 3 lantai (tilemap ASCII 20x12, satu layar) + validasi peta
│  ├─ data.js            KONTEN: 10 profesi, 30 babak misi, level, slip gaji, shop, label Scene, panduan
│  ├─ game.js            mesin: dunia satu layar, tabrakan, dialog, bintang, Gold, gaji, shop, simpanan
│  └─ app.js             lapisan UI: layar & modal, HUD, panel perangkat misi, slip gaji, LEVEL UP, finale
├─ uji/                  uji alpha otomatis (82 butir) + perender tangkapan layar
└─ asets/                tangkapan layar untuk dokumentasi dan laman portal
```

### Menambah atau mengubah materi

Seluruh materi pelajaran terpisah di `js/data.js`. Satu babak misi cukup ditulis seperti ini:

```js
{
  title: 'Tiket #1042 - PC Staf Keuangan Tidak Menyala',
  brief: 'Ikuti prosedur pemeriksaan dasar.',
  mode: 'check',                                  // check | quiz | order
  steps: [ { t: 'Periksa kabel daya', k: 'plug' }, /* … */ ],
  followUp: 'Kabel daya hanya longgar…'
}
```

### Mengubah peta kantor

Peta ditulis sebagai *tilemap* ASCII di `js/maps.js`. Legenda lengkap ada di bagian atas berkas;
fungsi `validateMaps()` memeriksa ukuran baris, posisi NPC, dan keterjangkauan meja misi (dipakai
pada pengujian).

---

## 5. Pengujian (alpha / black box)

Panduan lengkap — termasuk 31 skenario uji manual siap diisi, uji kompatibilitas perangkat,
cara memasang ke Android, dan panduan pengisian angket validasi — ada di
**[PENGUJIAN.md](PENGUJIAN.md)**.

Ringkasan cakupan pengujian:

1. **Fungsional** — navigasi menu, pembuatan karakter, pergerakan dan tabrakan pemain, interaksi
   NPC dan meja misi, ketiga mode babak misi, penilaian bintang, penghitungan Gold, slip gaji, dan shop kostumisasi,
   penguncian serta pembukaan level, slip gaji, shop kostumisasi, tes kompetensi, dan
   penyimpanan progres.
2. **Kompatibilitas** — diuji pada ukuran layar ponsel, tablet, dan desktop; kontrol sentuh muncul
   otomatis pada perangkat sentuh.
3. **Visual & audio** — konsistensi aset pixel art, keterbacaan teks, efek suara, dan musik latar
   (dapat dimatikan).

### Uji otomatis

Folder [`uji/`](uji/README.md) memuat **85 butir uji alpha otomatis** (U-01 s.d. U-85) yang
menjalankan alur permainan lengkap (kustomisasi karakter → 30 babak misi tiga mode → bintang &
Gold → konfirmasi naik level → slip gaji & LEVEL UP → shop kostumisasi → lift → ensiklopedia →
tes kompetensi → adegan finale → pemulihan progres) di atas DOM dan kanvas sungguhan memakai
`jsdom` + `@napi-rs/canvas`, tanpa peramban:

```bash
cd career-quest/uji
npm install && npm run uji     # keluaran: ringkasan terminal + laporan uji/hasil-uji.md
```

Hasil terakhir: **85/85 butir uji berhasil (100%) tanpa error runtime**.

Tangkapan layar lampiran juga dapat dibuat tanpa peramban:

```bash
npm run tangkapan   # memperbarui asets/tangkapan-layar-*.png + uji/tangkapan/kartu-karakter.png
```

---

## 6. Catatan Teknis

* Seluruh aset visual dibangkitkan secara prosedural dengan **Canvas 2D** (gaya *pixel art* 2D) dan
  seluruh efek suara serta musik latar dibangkitkan dengan **Web Audio API**.
  Konsekuensinya: **tanpa berkas aset eksternal**, ukuran aplikasi sangat kecil, ringan dijalankan
  di perangkat Android kelas bawah, dan dapat berjalan **offline** (sesuai Batasan Penelitian:
  *game offline pemain tunggal*).
* Tidak memakai kerangka kerja pihak ketiga maupun layanan daring.
* Resolusi internal **640 × 384 piksel** (16:9) dengan penskalaan *nearest neighbor* agar tetap
  tajam; satu ruangan = satu layar (tanpa gulir) sesuai mockup desain.
* Label **Scene 01–12** mengikuti penomoran adegan pada mockup, sehingga saat presentasi tiap layar
  permainan dapat langsung disandingkan dengan rancangan desainnya.

---

## 7. Sumber Materi

* Mushthofa, Wahyono, & Asfarian, A. (2019). *Informatika* (Buku Siswa/Guru Kelas X SMA).
  Kemendikbudristek — Tabel 2.1 & 2.2.
* SK Kepala BSKAP No. 032/H/KR/2024 tentang Capaian Pembelajaran Fase E.
* Hamidli, N. (2023). *Introduction to UI/UX Design: Key Concepts*.
* Anwar, T. G. D., & Sukirman. (2024). *Pengembangan Game Edukasi dengan Genre Role Playing Game
  untuk Mendukung Pembelajaran Sistem Komputer*. Decode: Jurnal Pendidikan Teknologi Informasi.
* Dermawan, I., Rosyidah, U. A., & Faruq, H. A. Al. (2024). *MDLC*.
  Jurnal Computer Science and Information Technology (CoSciTech).
* Sari, A. R. dkk. (2024). Konversi tingkat pencapaian dan kualifikasi produk — Tabel 3.8.

---

## 8. Lisensi & Kredit

Dikembangkan untuk keperluan penelitian akademik oleh **Sakirul Anam (220631100118)**,
Program Studi Pendidikan Informatika, Fakultas Keguruan dan Ilmu Pendidikan,
Universitas Trunojoyo Madura, 2025. Bebas dipakai dan dimodifikasi untuk keperluan pembelajaran
dengan mencantumkan sumber.
