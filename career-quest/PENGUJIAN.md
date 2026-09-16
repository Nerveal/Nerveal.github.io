# Panduan Pengujian Career Quest (v2 — desain visual sesuai mockup)

Dokumen ini dipakai untuk **menguji produk** dan sekaligus menjadi bahan mentah Bab III/IV skripsi
(pengujian alpha/black box, uji kompatibilitas, dan pengisian instrumen validasi).

Versi v2 memakai tata visual hasil mockup referensi:

* kanvas **640 × 384 piksel** (16:9) — satu ruangan per lantai, **tanpa gulir/kamera**;
* **label Scene 01–12** di kiri atas kanvas (Mode Presentasi) supaya tiap adegan dapat
  disandingkan langsung dengan mockup saat sidang/demo;
* **HUD**: Lantai, Jabatan, target divisi, **Gold**, dan **Gaji**;
* **Slip Gaji** (Gaji Pokok + Bonus Proyek) dan **pop-up LEVEL UP** setiap lantai tuntas;
* **Shop Kostumisasi** (rambut, jaket, sepatu, aksesori) dengan Gold dari misi & gaji;
* kontrol **D-pad + tombol A** pada perangkat sentuh.

---

## A. Uji cepat 5 menit (smoke test)

1. Buka `career-quest/index.html` (lihat [Cara menjalankan](#g-cara-menjalankan) di bawah).
2. Klik **MULAI** → pilih penampilan karakter → **MULAI BERTUGAS**.
3. Baca dialog pembuka (tekan `A`/`Spasi`/`Enter`/klik, atau ketuk tombol **A** di kanan bawah)
   sampai selesai — label berubah dari *Scene 01* → *Scene 02* → *Scene 03: Office Hub*.
4. Jalan mendekati meja kerja berpenanda **"!"** (`W A S D` / tombol panah / D-pad) → tekan **A**
   → pilih **babak 1** → selesaikan misi pada panel perangkat di tengah layar.
5. Cek modal **Mission Complete** berisi baris bintang, jumlah kesalahan, dan **Gold** yang diperoleh.
6. Berdiri di kotak lift (kanan bawah ruangan) → tekan **A** → pindah lantai.
7. Tekan **Esc** → **Menu Jeda** → coba tombol **SHOP KOSTUMISASI**, **Mode Presentasi**,
   dan **Suara**.

Kalau ketujuh langkah ini berjalan, aplikasi sudah memenuhi jalur utama permainan.

### Label Scene (Mode Presentasi, aktif secara bawaan)

| Label | Kapan tampil |
| :-- | :-- |
| Scene 01: Judul & Menu Utama | layar judul (plus *Scene 01b: Kustomisasi Karakter*) |
| Scene 02: Intro Story | dialog pembuka setelah menekan MULAI |
| Scene 03: Office Hub | eksplorasi ruangan satu layar |
| Scene 04: Misi Divisi | pemilih babak dan panel perangkat misi |
| Scene 07: Mission Complete | modal hasil misi (bintang & Gold) |
| Scene 08: Konfirmasi Naik Level | modal *Level n Selesai* dengan tombol IYA/TIDAK |
| Scene 09: Level Up! | pop-up emas kenaikan jabatan |
| Scene 10: Pilihan Spesialisasi Baru | modal pilihan divisi spesialisasi saat pertama kali masuk Lantai 3 |
| Scene 11: Sistem Gaji & Shop | slip gaji dan layar Shop Kostumisasi |
| Scene 12: Game Completion | adegan penutup berisi Total Skor, Gold, Level Akhir |

Label dapat dimatikan lewat **Menu Jeda → Mode Presentasi** (untuk pemakaian biasa).

---

## B. Skenario uji manual (black box)

Isi kolom **Hasil** dengan `Sesuai` / `Tidak sesuai` beserta catatan saat menguji.

| ID | Skenario | Langkah uji | Hasil yang diharapkan | Hasil |
| :-- | :-- | :-- | :-- | :-- |
| B-01 | Menu utama | Buka aplikasi | Layar judul tampil: judul CAREER QUEST, subjudul "(Simulasi Karir IT)", tombol MULAI, LANJUTKAN, PETUNJUK, KELUAR | |
| B-02 | Lanjutkan tanpa simpanan | Buka aplikasi pada peramban baru (progres kosong) | Tombol **LANJUTKAN** nonaktif dan ada keterangan belum ada progres | |
| B-03 | Judul & Petunjuk | Klik **PETUNJUK** | Layar panduan terbuka pada halaman "Cara Bermain" | |
| B-04 | Kurikulum & rubrik | Layar judul → **Kurikulum & Rubrik Penilaian** | Tabel pemetaan CP/TP Fase E dan rubrik capaian (Tabel 3.8) tampil | |
| B-05 | Kustomisasi karakter | MULAI → ubah gender, kulit, warna baju, warna celana, warna rambut | Pratinjau karakter berubah langsung; ringkasan slot kostumisasi tampil | |
| B-06 | Mulai permainan baru saat sudah ada simpanan | Klik MULAI ketika sudah ada progres | Muncul konfirmasi bahwa progres akan digantikan | |
| B-07 | Dialog pembuka | Selesaikan dialog pembuka | Potret pembicara tampil, label *Scene 02*, lalu masuk Office Hub Lantai 1 | |
| B-08 | Pergerakan | Tekan `W A S D`/panah dan D-pad sentuh | Karakter bergerak 4 arah dengan animasi langkah, tetap di dalam satu layar | |
| B-09 | Tabrakan | Jalan menembus dinding, meja, rak server, atau NPC | Karakter terhalang, tidak dapat menembus objek | |
| B-10 | Batas satu layar | Jalan ke tepi ruangan | Ruangan tidak bergulir; tidak ada kamera yang mengikuti (sesuai mockup) | |
| B-11 | Interaksi meja misi | Dekati meja berpenanda "!" | Muncul petunjuk *A · Misi &lt;profesi&gt;*; tekan A → pemilih babak terbuka (*Scene 04*) | |
| B-12 | Interaksi NPC mentor | Dekati NPC lalu tekan A | Dialog mentor muncul, lalu menawarkan pemilih babak profesinya | |
| B-13 | Interaksi NPC HRD | Dekati HRD di meja resepsionis | Dialog HRD tampil (informasi sistem gaji dan tes kompetensi) | |
| B-14 | Misi mode simulasi langkah | Pilih babak bertipe Simulasi Langkah, tekan tindakan pengecoh | Tindakan ditandai salah, penghitung kesalahan bertambah | |
| B-15 | Misi mode kuis | Pilih babak Kuis Pemahaman | Tiap jawaban langsung diberi umpan balik dan pembahasan | |
| B-16 | Misi mode susun alur | Pilih babak Susun Alur Kerja | Langkah mengisi slot 1..n berurutan; tombol PETUNJUK menampilkan petunjuk | |
| B-17 | Panel perangkat | Perhatikan bagian tengah layar misi | Panel memakai gaya perangkat sesuai divisi (layar analis, terminal gelap, tablet warna, rak jaringan) | |
| B-18 | Penilaian bintang | Selesaikan babak tanpa salah (★3), salah 1× (★2), salah 2× (★1) | Jumlah bintang pada modal hasil sesuai aturan Tabel 3.2 | |
| B-19 | Penguncian babak | Buka pemilih babak profesi baru | Hanya babak 1 terbuka; babak 2 dan 3 bertanda TERKUNCI | |
| B-20 | Gold misi | Selesaikan beberapa misi | Gold pada HUD bertambah; modal hasil menampilkan Gold yang diperoleh | |
| B-21 | Konfirmasi naik level | Tuntaskan seluruh divisi satu lantai (minimal ★2) → klik LANJUT | Muncul modal *Level n Selesai* dengan tombol **IYA** dan **TIDAK** (*Scene 08*) | |
| B-22 | Menolak naik level | Klik **TIDAK** pada konfirmasi | Modal tertutup, pemain tetap di lantai sekarang, progres tidak hilang | |
| B-23 | Slip gaji | Klik **IYA** | Slip gaji tampil: Level, Gaji Pokok, Bonus Proyek, Total Diterima (mis. Rp 5.000.000 + Rp 1.500.000 = Rp 6.500.000), plus Gold (*Scene 11*) | |
| B-24 | Tombol BUKA SHOP pada slip gaji | Klik **BUKA SHOP** | Layar Shop Kostumisasi terbuka; slip gaji dapat dibuka kembali dengan menggulang babak | |
| B-25 | LEVEL UP | Slip gaji → **TERIMA GAJI** | Pop-up emas LEVEL UP tampil dengan gaji, Gold masuk, total gaji, dan jabatan baru (*Scene 09*) | |
| B-26 | HUD gaji | Setelah menerima gaji | Chip **Rp …** pada HUD bertambah sesuai slip gaji | |
| B-27 | Pembukaan lantai | Lanjut dari pop-up LEVEL UP | Pemain berpindah ke lantai berikutnya; lantai yang belum layak tetap terkunci | |
| B-28 | Lift | Berdiri di kotak penanda lift lalu tekan A | Pemilih lantai muncul; memilih lantai memuat peta lantai tersebut | |
| B-29 | Shop kostumisasi | Menu Jeda → **SHOP KOSTUMISASI** | 4 tab (RAMBUT, JAKET, SEPATU, AKSESORI) berisi item beserta harga Gold dan pratinjau | |
| B-30 | Gold tidak cukup | Coba beli item dengan Gold kurang | Muncul pesan Gold belum cukup dan jumlah kekurangannya; item tidak terbeli | |
| B-31 | Beli & pakai item | Beli item dengan Gold cukup | Item terbeli, otomatis dipakai, penampilan karakter langsung berubah | |
| B-32 | Mode presentasi | Menu Jeda → **Mode Presentasi** | Label Scene hilang saat dimatikan dan muncul kembali saat dinyalakan | |
| B-33 | Ensiklopedia karier | Buka ikon **BUKU** pada HUD | 10 kartu profesi tampil dikelompokkan per lantai; kartu terbuka sesuai misi yang diselesaikan | |
| B-34 | Detail kartu profesi | Klik salah satu kartu | Tampil deskripsi tugas, tugas harian, jurusan kuliah, sertifikasi, dan jalur karier | |
| B-35 | Tes Kompetensi | Setelah tiga lantai tuntas → Ensiklopedia → TES KOMPETENSI KARIER | 10 soal acak muncul; nilai akhir ditampilkan; lulus bila ≥ 80 dan diberi 500 Gold | |
| B-36 | Adegan penutup | Lulus tes → **PENUTUP** | Modal *Game Completion* tampil dengan Total Skor, Total Gold, Total Bintang, Level Akhir, Nilai Tes, Total Gaji (*Scene 12*) | |
| B-37 | ULANGI GAME | Klik **ULANGI GAME** | Progres direset dan layar kustomisasi karakter terbuka kembali | |
| B-38 | Panduan | Menu Jeda → **PANDUAN** lalu lanjutkan halaman | Berisi cara bermain, cara penilaian bintang, Gold/Gaji/Shop, ensiklopedia, pemetaan kurikulum, rubrik, dan catatan penelitian | |
| B-39 | Tombol suara & musik | Menu Jeda → **Suara** / **Musik** | Suara dapat dimatikan; musik latar dapat dinyalakan/dimatikan | |
| B-40 | Ulang progres | Menu Jeda → **ULANG PROGRES** → YA, HAPUS | Seluruh bintang, Gold, gaji, dan item kembali ke nol; permainan mulai dari Lantai 1 | |
| B-41 | Penyimpanan otomatis | Mainkan beberapa misi → muat ulang halaman (F5) | Tombol LANJUTKAN aktif dan progres (bintang, Gold, gaji, jabatan, item) tersimpan | |
| B-42 | Kembali ke menu utama | Menu Jeda → **KEMBALI KE MENU UTAMA** | Layar judul tampil; progres tidak hilang dan LANJUTKAN berfungsi | |
| B-43 | Kembali ke menu utama dari hasil misi | Modal Mission Complete → LANJUT → Menu Jeda → Kembali ke Menu Utama | Tidak ada error; progres babak tetap tersimpan | |
| B-44 | Ulang misi untuk bintang | Modal hasil misi → **ULANGI** | Babak yang sama terbuka lagi dari awal tanpa kehilangan bintang terbaik | |

---

## C. Uji kompatibilitas perangkat

| Perangkat | Ukuran layar | Orientasi | Hasil (sesuai / tidak) | Catatan |
| :-- | :-- | :-- | :-- | :-- |
| Ponsel Android | 360 × 640 | Lanskap | | |
| Ponsel Android | 412 × 915 | Lanskap | | |
| Tablet Android | 800 × 1280 | Lanskap | | |
| Laptop | 1366 × 768 | — | | |
| Desktop | 1920 × 1080 | — | | |

Yang diperiksa: kanvas tetap 16:9 dan tidak terpotong, HUD & label Scene terbaca, D-pad +
tombol A responsif pada layar sentuh, dialog tidak menutupi kontrol, dan panel misi dapat digulir
di dalam perangkat.

---

## D. Cara memasang ke perangkat Android

1. Jalankan server lokal di komputer:

   ```bash
   # di komputer/laptop, dari akar repositori
   python3 -m http.server 8080 --bind 0.0.0.0
   ```

2. Cari alamat IP komputer, misalnya `192.168.1.10`, lalu buka
   `http://192.168.1.10:8080/career-quest/` pada peramban ponsel (satu jaringan Wi-Fi).
3. Untuk dijadikan aplikasi, bungkus berkas `career-quest/` dengan **Median/WebIntoApp**,
   **Capacitor**, atau **Android Studio (WebView + WebViewAssetLoader)**. Semua aset tertanam di
   dalam kode, jadi aplikasi berjalan **offline**.

---

## E. Uji instrumen skripsi (validasi & respons)

1. **Validasi ahli media & materi** — gunakan lembar validasi (Tabel 3.4–3.6). Tunjukkan urutan:
   Scene 01 → 02 → 03 → 04 → 07 → 08 → 09 → 11 → 12 dengan bantuan **Mode Presentasi**
   (label Scene) agar penilai mudah mencocokkan produk dengan mockup desain.
2. **Uji coba kelompok kecil** — 5–10 siswa kelas X memainkan minimal satu divisi penuh
   (3 babak) dan satu promosi lantai, lalu mengisi angket respons (Tabel 3.7).
3. **Uji coba lapangan** — satu kelas menyelesaikan tiga lantai + Tes Kompetensi Karier,
   kemudian mengisi angket respons dan wawancara singkat.
4. Lampirkan: tabel hasil uji otomatis (`uji/hasil-uji.md`), tangkapan layar
   (`asets/tangkapan-layar-*.png`), dan rekaman layar bila ada.

---

## F. Uji otomatis (tanpa peramban)

Tersedia **85 butir uji alpha otomatis** (U-01 s.d. U-85) yang menjalankan seluruh alur permainan
(dari kustomisasi karakter sampai adegan penutup dan pemuatan ulang progres) di atas DOM dan
kanvas sungguhan memakai `jsdom` + `@napi-rs/canvas`.

```bash
cd career-quest/uji
npm install        # sekali saja, butuh koneksi internet
npm run uji        # keluaran: ringkasan terminal + uji/hasil-uji.md
```

Keluaran: ringkasan `85/85 uji lulus` di terminal + berkas `uji/hasil-uji.md`
(tabel hasil uji siap ditempel ke lampiran skripsi). Kelompok pengujian:

| Kelompok | Cakupan | Butir |
| :-- | :-- | :-- |
| 1 | Boot, layar judul, tombol, mode presentasi, panduan | U-01 – U-09 |
| 2 | Kustomisasi karakter (6 kelompok pilihan + slot kostumisasi) | U-10 – U-15 |
| 3 | Kotak dialog, HUD, pemuatan Office Hub | U-16 – U-22 |
| 4 | Penggambaran pixel art tiga lantai & validasi struktur peta | U-23 – U-27 |
| 5 | Pergerakan, tabrakan, deteksi meja misi, pemilih babak | U-28 – U-32 |
| 6 | 30 babak misi tiga mode (target Bintang 3) | U-33 – U-38 |
| 7 | Penilaian bintang & Gold saat terjadi kesalahan | U-39 – U-42 |
| 8 | Konfirmasi naik level, slip gaji, LEVEL UP, pindah lantai | U-43 – U-50 |
| 9 | Lift antar lantai, mode presentasi, pengaman slip gaji, shop kostumisasi | U-51 – U-64 |
| 10 | Ensiklopedia karier & penyimpanan progres | U-65 – U-68 |
| 11 | Pemulihan progres setelah halaman dimuat ulang | U-69 – U-72 |
| 12 | Tes Kompetensi Karier & adegan Finale (Scene 12) | U-73 – U-80 |
| 13 | Adegan **Scene 10** – pilihan spesialisasi di Lantai 3 | U-81 – U-83 |
| 14 | Pemeriksaan error runtime (dua sesi) | U-84 – U-85 |

### Tangkapan layar otomatis (lampiran skripsi)

```bash
npm run tangkapan   # memperbarui asets/tangkapan-layar-*.png (1280x768)
                    # + uji/tangkapan/kartu-karakter.png (lembar gaya rambut)
```

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
