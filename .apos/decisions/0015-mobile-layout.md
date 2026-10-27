# ADR 0015: Tata letak mobile lintas halaman

- Status: Diterima, 2026-10-27.

## Keputusan

Halaman konten menyisakan ruang bawah untuk navigasi tetap dan safe area perangkat. Grid Metode Beta memakai satu kolom dengan lebar minimum nol pada ponsel. Tabel lebar tetap berada dalam wadah geser. Pembaca PDF dibatasi tinggi dinamis layar, dan kontrol zoom peta berada di belakang panel filter yang terbuka.

## Dampak

Desktop tidak berubah. Pengujian responsif mencakup lebar 320, 360, 375, 390, dan 430 piksel. Metadata viewport memakai `viewport-fit=cover` agar safe area iPhone dapat dihitung.
