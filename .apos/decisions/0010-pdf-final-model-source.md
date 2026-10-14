# ADR 0010: PDF Seminar Hasil menjadi sumber final dashboard

- Status: Diterima, 2026-10-14.
- Tugas: `2026-10-pdf-final-alignment`.

## Keputusan
PDF Seminar Hasil yang diberikan pengguna menjadi sumber kebenaran untuk konten naskah, nama model, angka perbandingan, dan hasil. Metadata PDF dipertahankan sesuai konfirmasi pengguna.

Nama model pada naskah adalah M1-M4. Label kode stmmlib M5 dipertahankan sebagai alias yang jelas untuk struktur M4 (SAR area + AR(1) waktu). Nilai fit sebelumnya yang berbeda diganti di tampilan aktif dengan angka PDF.

## Dampak
Laman Draft menjadi ringkasan naskah dan pembaca PDF. Dashboard eksplorasi indikator tetap memiliki cakupan lebih luas daripada 16 prediktor model tesis, dan keduanya diberi konteks terpisah.
