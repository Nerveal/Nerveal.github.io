# Panduan Pengujian Career Quest

Dokumen ini dipakai untuk **menguji produk** dan sekaligus menjadi bahan mentah Bab III/IV skripsi
(pengujian alpha/black box, uji kompatibilitas, dan pengisian instrumen validasi).

---

## A. Uji cepat 5 menit (smoke test)

1. Buka `career-quest/index.html` (lihat [Cara menjalankan](#g-cara-menjalankan) di bawah).
2. Klik **Mulai Baru** → pilih penampilan karakter → **Mulai Bertugas**.
3. Baca dialog pembuka (tekan `A`/`Spasi`/klik atau ketuk tombol **A**) sampai selesai.
4. Jalan mendekati meja kerja yang ada penanda **"!"** (tombol `W A S D` / panah / joystick) →
   tekan **A** → pilih **babak 1** → selesaikan misi.
5. Cek muncul modal **Misi Selesai** berisi bintang, koin, dan wawasan karier.
6. Buka ikon **Buku** di kanan atas HUD → kartu profesi sudah terbuka.
7. Tekan **Esc** → **Jeda** → coba tombol **Suara / Musik / Ensiklopedia Karier**.

Kalau ketujuh langkah ini berjalan, aplikasi sudah memenuhi jalur utama permainan.

---

## B. Skenario uji manual (black box)

Isi kolom **Hasil** dengan `Sesuai` / `Tidak sesuai` beserta catatan saat menguji.

| ID | Skenario | Langkah uji | Hasil yang diharapkan | Hasil |
| :-- | :-- | :-- | :-- | :-- |
| B-01 | Menu utama | Buka aplikasi | Layar judul tampil: tombol Mulai Baru, Lanjutkan, Panduan, Kurikulum & Rubrik | |
| B-02 | Lanjutkan tanpa simpanan | Buka aplikasi pada peramban baru (progres kosong) | Tombol **Lanjutkan** nonaktif dan ada keterangan belum ada progres | |
| B-03 | Kustomisasi karakter | Mulai Baru → ubah gender, kulit, rambut, baju, celana | Pratinjau karakter berubah langsung setiap pilihan diubah | |
| B-04 | Mulai permainan baru saat sudah ada simpanan | Klik Mulai Baru ketika sudah ada progres | Muncul konfirmasi bahwa progres akan digantikan | |
| B-05 | Dialog pembuka | Selesaikan dialog pembuka | Scene berpindah ke Lantai 1 dan penyambutan HRD dimainkan sekali saja | |
| B-06 | Pergerakan | Tekan `W A S D`/panah dan joystick sentuh | Karakter bergerak 8 arah dengan animasi langkah | |
| B-07 | Tabrakan | Jalan menembus dinding, meja, rak server, atau karakter lain | Karakter terhalang, tidak dapat menembus objek | |
| B-08 | Kamera | Jalan dari sudut kiri atas ke kanan bawah peta | Kamera mengikuti dan berhenti rapi di tepi peta | |
| B-09 | Interaksi meja misi | Dekati meja berpenanda "!" | Muncul petunjuk "Misi &lt;profesi&gt; · babak n", tekan A → pemilih babak terbuka | |
| B-10 | Interaksi NPC mentor | Dekati NPC lalu tekan A | Dialog mentor muncul, lalu otomatis membuka pemilih babak profesinya | |
| B-11 | Misi mode simulasi langkah | Pilih babak bertipe Simulasi Langkah, tekan tindakan pengecoh | Tindakan ditandai salah, jumlah kesalahan bertambah, tidak masuk daftar prosedur | |
| B-12 | Misi mode kuis | Pilih babak Kuis Pemahaman | Tiap jawaban langsung diberi umpan balik dan pembahasan | |
| B-13 | Misi mode susun alur | Pilih babak Susun Alur Kerja | Langkah mengisi slot 1..n secara berurutan; tombol petunjuk menampilkan hint | |
| B-14 | Penilaian bintang | Selesaikan babak tanpa salah (★3), salah 1× (★2), salah 2× (★1), salah 3× (gagal) | Jumlah bintang pada modal hasil sesuai aturan Tabel 3.2 | |
| B-15 | Penguncian babak | Buka pemilih babak profesi baru | Hanya babak 1 terbuka; babak 2 dan 3 bertanda terkunci | |
| B-16 | Koin dan gaji | Selesaikan beberapa misi | Koin pada HUD bertambah; modal hasil menampilkan koin yang diperoleh | |
| B-17 | Promosi jabatan | Tuntaskan semua divisi satu lantai dengan minimal ★2 | Muncul dialog promosi → pop-up kenaikan jabatan dan gaji | |
| B-18 | Pembukaan lantai | Setelah promosi lantai 1 | Lantai 2 dapat dicapai melalui lift, lantai 3 masih terkunci sampai lantai 2 tuntas | |
| B-19 | Lift | Berdiri di kotak penanda lift (di depan pintu lift) lalu tekan A | Muncul pemilih lantai; memilih lantai memindahkan pemain dan memuat peta lantai tersebut | |
| B-20 | Ensiklopedia karier | Buka ikon **Buku** | 10 kartu profesi; kartu terbuka sesuai misi yang telah diselesaikan; kartu terkunci tidak dapat dibuka | |
| B-21 | Detail kartu profesi | Klik salah satu kartu | Tampil deskripsi pekerjaan, tugas harian, jurusan kuliah, sertifikasi, jalur karier, dan daftar misi | |
| B-22 | Tombol Main di kartu profesi | Klik **Main** pada salah satu babak | Aplikasi berpindah ke lantai profesi tersebut lalu membuka babak yang dipilih | |
| B-23 | Tes Kompetensi | Setelah tiga lantai tuntas → tombol Tes Kompetensi Karier | 10 soal acak muncul; nilai akhir ditampilkan; lulus bila ≥ 80 | |
| B-24 | Adegan penutup | Lulus tes → tombol Lihat Penutup Cerita | Muncul epilog berisi rekap bintang, koin, gaji, dan nilai tes | |
| B-25 | Panduan | Klik tombol Panduan lalu lanjutkan halaman | Berisi cara bermain, cara penilaian bintang, dan keterangan ensiklopedia | |
| B-26 | Pemetaan kurikulum | Menu judul → Kurikulum & Rubrik → halaman pemetaan | Tabel pemetaan CP/TP Fase E ke fitur permainan tampil | |
| B-27 | Rubrik capaian | Lanjut ke halaman rubrik | Menampilkan capaian bintang, persentase, dan tingkat kualifikasi (Tabel 3.8) | |
| B-28 | Tombol suara & musik | Menu Jeda → Suara / Musik | Suara dapat dimatikan; musik latar dapat dinyalakan/dimatikan | |
| B-29 | Ulang progres | Menu Jeda → Ulang Progres → Ya | Seluruh bintang, koin, dan gaji kembali ke nol; permainan mulai dari Lantai 1 | |
| B-30 | Penyimpanan otomatis | Mainkan beberapa misi → muat ulang halaman (F5) | Tombol Lanjutkan aktif dan progres (bintang, koin, gaji, jabatan) tersimpan | |
| B-31 | Kembali ke menu utama | Menu Jeda → Kembali ke Menu Utama | Layar judul tampil; progres tidak hilang dan Lanjutkan berfungsi | |

---

## C. Uji kompatibilitas perangkat

Uji pada minimal tiga ukuran layar; catat perangkat dan hasilnya.

| Perangkat / peramban | Orientasi | Yang diperiksa | Hasil |
| :-- | :-- | :-- | :-- |
| Desktop (Chrome/Edge/Firefox) | Lanskap | Kanvas tajam, papan tombol berfungsi, HUD terbaca | |
| Ponsel Android (Chrome) | Lanskap | Joystick + tombol A muncul, area permainan memenuhi layar | |
| Ponsel Android (Chrome) | Potret | Muncul saran memutar perangkat, UI tidak terpotong | |
| Tablet | Lanskap | Tata letak panel misi/ensiklopedia rapi dua kolom | |

Catatan teknis yang perlu diperiksa pada perangkat Android:

1. **Resolusi & ketajaman** — kanvas memakai penskalaan *nearest neighbor* (`image-rendering: pixelated`),
   pixel art harus tetap tajam, tidak buram.
2. **Ramah sentuh** — tombol arah & tombol A minimal 44 px agar mudah ditekan; uji juga tekan-lama.
3. **Konsumsi sumber daya** — mainkan 5 menit lalu cek suhu perangkat dan penggunaan baterai
   (target: pemakaian baterai rendah karena aset dibangkitkan prosedural).
4. **Perilaku pemutaran audio** — BGM baru aktif setelah sentuhan pertama pengguna
   (kebijakan autoplay peramban seluler).

---

## D. Cara memasang ke perangkat Android

**D-1. Lewat jaringan lokal (uji cepat tanpa internet)**

```bash
# di komputer/laptop, dari akar repositori
python3 -m http.server 8080 --bind 0.0.0.0
# cari alamat IP komputer, misalnya 192.168.1.10
```
Buka di peramban Android (satu jaringan Wi-Fi): `http://192.168.1.10:8080/career-quest/`

**D-2. Lewat GitHub Pages (paling praktis untuk responden)**

Setelah perubahan digabungkan ke `main` dan Pages diaktifkan
(*Settings → Pages → Deploy from a branch → main → / (root)*), bagikan tautan:

`https://<nama-pengguna>.github.io/career-quest/`

Responden cukup membuka tautan tersebut. Agar terasa seperti aplikasi:
menu peramban → **Tambahkan ke layar utama** (Add to Home screen).

**D-3. Dikemas menjadi `.apk` (sesuai spesifikasi produk skripsi)**

Tiga pilihan yang tidak memerlukan perubahan kode:

| Cara | Keterangan |
| :-- | :-- |
| **Capacitor** (disarankan, gratis, offline penuh) | `npm i -D @capacitor/cli @capacitor/core @capacitor/android` → `npx cap init` → arahkan `webDir` ke folder `career-quest` → `npx cap add android` → `npx cap sync` → buka Android Studio → *Build APK* |
| **Android Studio (WebView)** | Buat proyek Empty Activity, letakkan berkas game di `src/main/assets/`, muat dengan `WebViewAssetLoader` (`https://appassets.androidplatform.net/...`) lalu aktifkan JavaScript. |
| **Median.co / WebIntoApp** | Ubah tautan GitHub Pages menjadi APK lewat layanan daring (catatan: versi gratis umumnya menampilkan iklan). |

Saat menguji versi `.apk`, periksa juga: aplikasi berjalan tanpa koneksi internet (mode pesawat),
ikon & nama aplikasi terpasang benar, serta tidak ada bilah alamat.

---

## E. Uji instrumen skripsi (validasi & respons)

Setelah uji fungsional selesai, gunakan lembar instrumen pada skripsi:

| Instrumen | Sumber | Jumlah butir | Responden |
| :-- | :-- | :-- | :-- |
| Angket Ahli Materi | Tabel 3.4 (modifikasi Mushthofa dkk., 2019) | 9 butir | Dosen/guru Informatika |
| Angket Ahli Media | Tabel 3.5 (modifikasi Anwar & Sukirman, 2024) | 9 butir | Dosen/praktisi IT |
| Angket Respon Siswa | Tabel 3.6 (modifikasi Akbar, 2013) | 9 butir | 15 siswa + 15 siswi Kelas X |

Skala Likert 1–5 (Tabel 3.7), lalu hitung persentase kelayakan:

```
V = (Tse / Tsh) x 100%
V   = persentase kelayakan
Tse = total skor empiris (skor yang diperoleh dari validator/responden)
Tsh = total skor harapan (skor maksimal x jumlah butir)
```

Konversi hasil (Tabel 3.8):

| Tingkat pencapaian | Kualifikasi | Keterangan | Tindakan |
| :-- | :-- | :-- | :-- |
| 90% – 100% | Sangat tinggi | Sangat layak | Tidak perlu direvisi |
| 75% – 89% | Tinggi | Layak | Tidak perlu direvisi |
| 65% – 74% | Cukup tinggi | Kurang layak | Perlu direvisi |
| 55% – 64% | Kurang tinggi | Tidak layak | Perlu direvisi |
| 0% – 54% | Sangat kurang tinggi | Sangat tidak layak | Perlu direvisi |

> Tips saat pendampingan responden: cukupkan 10–15 menit per siswa untuk tiga divisi lantai 1,
> lalu bagikan angket respon siswa. Persentase capaian bintang pemain dapat dilihat pada menu
> **Kurikulum & Rubrik → Rubrik Penilaian Produk** sebagai data pendukung observasi.

---

## F. Uji otomatis (tanpa peramban)

Tersedia 58 butir uji alpha otomatis yang menjalankan seluruh alur permainan
(dari kustomisasi karakter sampai adegan penutup) di atas DOM dan kanvas sungguhan.

```bash
cd career-quest/uji
npm install        # sekali saja, butuh koneksi internet
npm run uji
```

Keluaran: ringkasan `58/58 uji lulus` di terminal + berkas `uji/hasil-uji.md`
(tabel hasil uji siap ditempel ke lampiran skripsi). Kelompok pengujian:

| Kelompok | Cakupan |
| :-- | :-- |
| 1–3 | Boot, layar judul, kustomisasi karakter, dialog pembuka, pemuatan peta |
| 4 | Penggambaran pixel art layar judul dan tiga lantai |
| 5 | Pergerakan, tabrakan, deteksi meja misi, pemilih babak |
| 6–7 | 30 babak misi (Bintang 3) dan penilaian bintang saat ada kesalahan |
| 8 | Promosi, akumulasi gaji, dan lift antar lantai |
| 9–10 | Ensiklopedia karier, Tes Kompetensi, adegan penutup |
| 11 | Panduan, pemetaan kurikulum, rubrik capaian |
| 12–13 | Penyimpanan progres dan pemulihannya setelah halaman dimuat ulang |
| 14 | Pemeriksaan error runtime |

---

## G. Cara menjalankan

| Cara | Perintah / langkah |
| :-- | :-- |
| Server lokal | `python3 -m http.server 8080` dari akar repositori → buka `http://localhost:8080/career-quest/` |
| Node | `npx serve career-quest` |
| VS Code | Ekstensi **Live Server** → klik kanan `career-quest/index.html` → *Open with Live Server* |
| GitHub Pages | Aktifkan Pages pada branch `main`, lalu buka `https://<nama-pengguna>.github.io/career-quest/` |

> Aplikasi memakai ES Modules, sehingga **tidak dapat dibuka langsung dengan klik dua kali**
> pada berkas `index.html` (`file://`). Harus dilayani lewat http, baik lokal maupun hosting.

---

## H. Melaporkan temuan

Catat setiap temuan dengan format berikut agar mudah ditindaklanjuti:

```
ID Butir  : B-xx
Ringkasan : (mis. tombol A tidak merespons di depan lift)
Perangkat : (mis. Redmi Note 12, Chrome 126, Android 13, lanskap)
Langkah   : 1) ... 2) ... 3) ...
Dugaan    : (mis. jarak deteksi lift kurang dari posisi berdiri)
Bukti     : tangkapan layar / rekaman layar
```
