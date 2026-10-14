# Laporan penyelarasan PDF final

Tanggal: 2026-10-14

## Sumber
- PDF Seminar Hasil yang diberikan pengguna; 11 halaman, 919.802 byte.
- Hash sumber dan salinan: `6D4106538E0DDB22232ADCDE14E1B8C152A87FEBA8EFE4D52D0C1B0900EAFB3E`. Metadata PDF dipertahankan.

## Koreksi
- M5 pada kode stmmlib dipetakan ke M4 pada PDF.
- Seluruh 8 kombinasi fit disajikan pada Draft dan Metode. M4 SAR KNN-5 + AR(1) memiliki cAIC terendah (-14963,73) dari angka dalam naskah.
- Nilai fit lama pada laman Metode diganti. Tabel menampilkan logLik, AIC, BIC, cAIC, R² marginal, bobot, dan struktur efek area/waktu.
- Draft menampilkan identitas dokumen, ringkasan sampel, grafik cAIC yang dapat diklik, pemilih komponen varians M4, dan pratinjau dengan navigasi 11 halaman.

## Validasi
- `node --check aset/model-beta.js` dan `node --check aset/draft.js`: lulus.
- `tests/uji-node.mjs`: 13/13 lulus.
- `python build_site.py`: berhasil membangun 43 berkas.
- Browser desktop: delapan tombol model, metrik M4 awal, delapan baris hasil, tidak ada error JavaScript.
- Browser ponsel 375 px: tidak ada luapan horizontal; Draft menampilkan 8 baris fit, 8 baris grafik, dan 11 pilihan halaman. PDF merespons HTTP 200.
- `git diff --check`: lulus.

## Batas
Dashboard masih menyediakan indikator eksplorasi yang lebih luas daripada 16 prediktor dalam model naskah. Ringkasan eksplorasi tidak ditafsirkan sebagai daftar prediktor model. Nilai fit mengikuti dokumen acuan, bukan refit baru.
