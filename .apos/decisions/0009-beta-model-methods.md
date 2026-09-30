# ADR 0009: Transparansi model beta pada halaman Metode

- Status: Diterima, 2026-09-30.
- Tugas: `2026-09-beta-mixed-methods`.

## Keputusan
- Persamaan M1/M2/M3/M5 diambil dari struktur dan registri `stmmlib`, bukan ditebak dari label.
- M5 menjadi pilihan awal karena struktur utama tesis, tetapi status fit tidak valid harus ditampilkan bersama metrik.
- M2 memakai hasil fallback yang dicatat; estimasi temporal berada di batas dan hasil tersimpan lain tidak valid.
- M3 menggunakan W jarak 110 km, sedangkan M5 menggunakan Queen. Hasil kriteria tidak dipakai untuk mengurutkan semua model menjadi pemenang.
- cAIC dijelaskan sebagai kriteria kondisional dari `stmmlib.beta.criteria`; nilai M3 tidak tersedia. cAIC tidak dibandingkan langsung dengan AIC marginal.
- Persamaan beta memakai κ untuk presisi respons dan φ untuk koefisien AR(1), agar notasi tidak rancu.

## Alasan
Nilai informasi yang tercatat tidak otomatis dapat dibandingkan jika fit, bobot, atau likelihood berbeda. Menampilkan status dan sumber mencegah dashboard menyatakan pemenang model dari angka yang belum sebanding.

## Dampak
Pengguna dapat menelusuri struktur, formula, dan ringkasan fit di satu halaman. M5 tetap terlihat sebagai rancangan utama, tetapi evaluasi fit memerlukan refit dan sertifikasi sebelum klaim akhir.
