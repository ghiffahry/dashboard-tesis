# Laporan perubahan metode Beta STMM

Tanggal: 2026-09-30

## Sumber yang diperiksa
- `stmmlib/registry.py` dan `stmmlib/beta/structure.py` untuk pemetaan model dan persamaan.
- `stmmlib/beta/criteria.py` untuk cAIC dan derajat bebas efektif.
- `script/tesis/TABEL_M1_M2_M3_M5_struktur.md` dan JSON pasangannya untuk struktur serta angka fit.
- `script/tesis/fit_results/full_m1_m5_summary.json` untuk sertifikat fit tersimpan.

## Perubahan
- Menambah panel beta mixed model pada Metode. Pemilih M1/M2/M3/M5 memperbarui persamaan, struktur efek acak, kartu metrik, dan status fit.
- Menjelaskan log-likelihood Beta, AIC, BIC, dan cAIC. Parameter presisi Beta ditulis κ; parameter temporal AR(1) ditulis φₜ.
- Menambah tabel hasil fit tersimpan, label bobot, status konvergensi, dan peringatan keterbandingan.
- M5 dibuka sebagai struktur utama yang direncanakan. Sertifikat tersimpan tidak valid, parameter mencapai batas, dan gradien 28,3. UI menyatakan hasilnya belum final.
- M2 menggunakan angka fallback dari HTML karena fit tersimpan lain invalid; φₜ menyentuh batas 0,95.
- M3 memakai jarak 110 km; M5 memakai Queen; cAIC M3 tidak tersedia. Karena itu tabel dinyatakan sebagai audit, bukan ranking model.
- Mengisi ruang kartu rumus dengan diagram kuadran Moran serta keterangan klaster dan pencilan lokal.

## Validasi
- `node --check` pada semua modul JavaScript: lulus.
- `tests/uji-node.mjs`: 13/13 lulus.
- `build_site.py --output _site-review`: 43 berkas berhasil dibuat.
- Browser desktop: M1, M2, M3, M5 serta logLik, AIC, BIC, cAIC berfungsi; tidak ada page error.
- Browser ponsel 390 px: lebar dokumen 390 px; tidak ada luapan horizontal.
- Screenshot diperiksa untuk desktop dan ponsel.

## Batas hasil
Angka rekap merupakan artefak fit yang tersimpan, bukan refit baru. Perbedaan vintage bobot dan sertifikat fit M2/M5 membuat nilai tersebut belum layak untuk menyatakan model pemenang. Sebelum kesimpulan tesis, fit perlu diperbarui pada data dan bobot yang sama lalu diperiksa ulang.
