# Rilis Dashboard Tesis v1.0.0

Tanggal: 2026-09-28

## Cakupan

Paket proyek disiapkan sebagai repository mandiri untuk GitHub Pages. Perubahan organisasi mempertahankan HTML, aset, data runtime, data sumber lokal, skrip analisis, dan audit yang sudah ada.

- Dokumen aktif berada di `docs/`; prompt lama berada di `docs/arsip/`.
- Uji Node dan halaman uji manual berada di `tests/`.
- README menjelaskan preview, uji, pipeline olah data, dan penerbitan pada URL `USERNAME.github.io/NAMA-REPO/`.
- `.gitignore` mengecualikan cache Python, lingkungan virtual, log, keluaran `_site/`, GeoJSON Brotli, CSV sumber, tabel antara, shapefile, dan prompt lama. Input tesis tetap ada secara lokal, tetapi tidak masuk rilis.
- GitHub Actions menjalankan uji modul sebelum membangun dan menerbitkan Pages.
- `VERSION` dan `CHANGELOG.md` mencatat rilis 1.0.0.

## Pemeriksaan

- `node tests/uji-node.mjs`: 12/12 lulus.
- `python build_site.py`: berhasil, 33 berkas; versi artifact `site-46a2df7cae11`.
- `git check-ignore _site/index.html`: terabaikan oleh aturan `_site/`.
- Isi artifact berisi halaman, aset, dan data runtime; input kerja tidak ikut terbit.

## Batas rilis

Data Moran dan statistik tidak dihitung ulang dalam paket ini. Workflow Pages memakai data runtime yang sudah tersedia. Jalankan `build.ps1` hanya saat memang ingin mengolah ulang data dan semua input lokal siap. Push belum dilakukan; repository remote perlu ditautkan oleh pemilik sebelum publikasi.
