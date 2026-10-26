# ADR 0013: Notasi Beta, AR(1), dan ringkasan temuan analisis

- Status: Diterima, 2026-10-26.

## Keputusan

1. Parameter presisi sebaran Beta memakai ϕ (LaTeX `\phi`); koefisien AR(1) memakai φ. Bentuk huruf ditampilkan berbeda agar tidak tertukar.
2. Distribusi respons ditulis dalam parameterisasi rerata-presisi: `(Yᵢₜ | μᵢₜ, ϕ) ~ Beta(μᵢₜϕ, (1 − μᵢₜ)ϕ)`. Efek acak area adalah vᵢ dan efek acak waktu adalah uᵢₜ.
3. Kotak peringatan/cakupan tidak digunakan sebagai banner antarmuka. Definisi dan hasil tetap ditulis dalam uraian biasa, kartu hasil, dan laporan proyek.
4. Ruang yang sebelumnya kosong di samping panduan baca Moran diisi ringkasan M4 dari presentasi: jumlah koefisien nyata, arah efek, cAIC, ρ, dan ragam. Link membuka hasil model pada Metode.
5. Susunan kartu beralih menjadi dua kolom di desktop dan satu kolom di ponsel.

## Dampak

Tidak ada angka atau data hasil yang diubah. PDF sumber juga tidak diubah. Perbedaan isi sumber tetap disimpan pada TODO dan laporan audit.
