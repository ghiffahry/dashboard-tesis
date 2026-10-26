# Audit notasi model dan ruang kosong analisis

- ID: 2026-10-notation-summary-layout
- Status: Complete
- Prioritas: Tinggi

## Cakupan

- Hapus banner peringatan dan catatan cakupan sejenis dari semua laman yang terdampak.
- Isi kolom kosong di sisi panduan Moran dengan ringkasan M4 dari presentasi.
- Audit formula distribusi Beta dan pemakaian simbol presisi Beta serta AR(1).
- Verifikasi ponsel dan desktop.

## Kriteria penerimaan

- Tidak ada lagi banner `.beta-data-caveat` atau `.analysis-scope-note` di HTML/CSS.
- Rumus Beta memakai `(Yᵢₜ | μᵢₜ, ϕ) ~ Beta(μᵢₜϕ, (1 − μᵢₜ)ϕ)`; φ hanya untuk parameter AR(1).
- Kartu ringkasan M4 menampilkan 9/16 koefisien nyata, pembagian arah, cAIC, ρ, dan ragam yang cocok dengan slide.
- Grid tidak menyisakan ruang besar di desktop dan menumpuk tanpa luapan di ponsel.

## Validasi

Lihat `.apos/reports/2026-10-notation-summary-layout.md`.
