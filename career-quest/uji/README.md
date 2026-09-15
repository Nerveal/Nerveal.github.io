# Uji Alpha Otomatis - Career Quest

Perkakas ini menjalankan **58 butir uji black box** atas seluruh alur permainan
(kustomisasi karakter, 30 babak misi, penilaian bintang, promosi & gaji, lift,
ensiklopedia, tes kompetensi, sampai pemulihan progres) di atas DOM dan kanvas
sungguhan memakai `jsdom` + `@napi-rs/canvas` — **tanpa peramban**.

## Menjalankan

```bash
cd career-quest/uji
npm install      # sekali saja, butuh koneksi internet
npm run uji
```

Keluaran:

* ringkasan di terminal, misalnya `RINGKASAN: 58/58 uji lulus (100%)`;
* berkas `hasil-uji.md` berisi tabel hasil uji (siap ditempel ke lampiran skripsi);
* kode keluar `0` bila semua uji lulus, `1` bila ada yang gagal (cocok untuk CI).

## Catatan

* Salinan modul dibuat otomatis di folder sementara sistem saat pengujian berjalan,
  sehingga berkas sumber di `../js/` tidak diubah.
* `node_modules`, `package-lock.json`, dan `hasil-uji.md` tidak disertakan ke Git
  (lihat `.gitignore`). Bila laporan hasil uji ingin dilampirkan pada repositori:
  `git add -f career-quest/uji/hasil-uji.md`.
