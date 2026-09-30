# Metode Beta STMM pada Dashboard Tesis

- ID: 2026-09-beta-mixed-methods
- Status: Complete
- Pemilik: Codex
- Prioritas: Tinggi
- Klasifikasi: Significant, perubahan halaman metode dan sumber statistik.
- Sumber model: `stmmlib/registry.py`, `stmmlib/beta/structure.py`, `script/tesis/TABEL_M1_M2_M3_M5_struktur.md`, dan ringkasan fit tesis.

## Tujuan
Menjelaskan struktur beta mixed model yang digunakan pada tesis, termasuk efek acak area dan waktu, persamaan, komponen varians, kriteria fit, dan status hasil yang tersimpan. Memperbaiki ruang kosong pada halaman Metode dan memastikan interaksi bisa digunakan pada desktop serta ponsel.

## Kriteria penerimaan
- M1, M2, M3, dan M5 memiliki persamaan dan struktur area/waktu yang sesuai registri stmmlib.
- Pemilihan model memperbarui persamaan, keterangan, tabel komponen, metrik, dan status fit.
- Rumus log-likelihood Beta, AIC, BIC, dan cAIC dijelaskan tanpa mencampur definisi marginal dan kondisional.
- Angka fit memiliki status, sumber, versi bobot, dan batas perbandingan yang tampak.
- M5 yang merupakan struktur utama rencana tidak diklaim sebagai fit final karena sertifikat fit tersimpan tidak valid.
- Tidak ada luapan horizontal pada viewport ponsel; kontrol model/rumus bekerja dengan klik.
- Build, uji regresi, dan commit/tag/push selesai.

## Validasi
Selesai. Detail pada `.apos/reports/2026-09-beta-mixed-methods.md`.
