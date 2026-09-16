# Uji Alpha Otomatis - Career Quest

Perkakas ini menjalankan **85 butir uji black box** (U-01 s.d. U-85) atas seluruh alur permainan
(kustomisasi karakter, 30 babak misi tiga mode, penilaian bintang, konfirmasi naik level,
slip gaji & LEVEL UP, shop kostumisasi, lift, ensiklopedia, tes kompetensi, adegan finale,
sampai pemulihan progres setelah halaman dimuat ulang) di atas DOM dan kanvas
sungguhan memakai `jsdom` + `@napi-rs/canvas` — **tanpa peramban**.

## Menjalankan

```bash
cd career-quest/uji
npm install      # sekali saja, butuh koneksi internet
npm run uji
```

Keluaran:

* ringkasan di terminal, misalnya `RINGKASAN: 85/85 uji lulus (100%)`;
* berkas `hasil-uji.md` berisi tabel hasil uji (siap ditempel ke lampiran skripsi);
* kode keluar `0` bila semua uji lulus, `1` bila ada yang gagal (cocok untuk CI).

## Tangkapan layar otomatis

```bash
npm run tangkapan
```

Menghasilkan (memperbarui) berkas gambar tanpa peramban:

* `../asets/tangkapan-layar-judul.png`, `…-lantai1.png`, `…-lantai2.png`, `…-lantai3.png` (1280x768) —
  dipakai portal `index.html` sebagai pratinjau;
* `tangkapan/kartu-karakter.png` — lembar contoh seluruh gaya rambut, jaket, sepatu, dan
  aksesori (lampiran skripsi).

## Catatan

* Salinan modul dibuat otomatis di folder sementara sistem saat pengujian berjalan,
  sehingga berkas sumber di `../js/` tidak diubah.
* `node_modules`, `package-lock.json`, `hasil-uji.md`, dan folder `tangkapan/` tidak disertakan ke Git
  (lihat `.gitignore`). Bila laporan hasil uji ingin dilampirkan pada repositori:
  `git add -f career-quest/uji/hasil-uji.md`.
