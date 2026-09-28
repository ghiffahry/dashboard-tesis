# ADR 0005: Gaya peta dan kontrol yang dapat dilipat

- Status: Diterima, 2026-09-28
- Mengubah bagian tampilan peta dari ADR 0001 dan ADR 0003.

## Keputusan
Peta memakai OpenStreetMap sebagai tile dasar dengan dua gaya tampilan: warna dan netral (grayscale). Gaya warna menjadi pilihan awal. Tile mengikuti tema biru-putih dashboard, bukan latar gelap. Gaya netral menggunakan filter grayscale CSS pada tile yang sama. Filter dan legenda memiliki tombol buka/tutup tersendiri; keduanya dimulai tertutup pada viewport ponsel dan terbuka pada desktop. Warna wilayah memakai urutan luminansi kuartil yang disesuaikan dengan makna indikator sesuai ADR 0006.

## Alasan
Tile terbalik dan diredupkan oleh CSS menghasilkan kanvas hitam yang berbeda dari tema biru-putih dashboard. Peta juga perlu memberi pengguna kendali atas ruang kerja tanpa menutupi area peta, khususnya pada ponsel.

## Dampak
Tile tetap memerlukan koneksi internet dan atribusi OpenStreetMap. Gaya netral menggunakan filter CSS pada tile yang sama, bukan sumber data peta kedua. Kontrol mengikuti breakpoint layar, tidak mendeteksi jenis perangkat atau user-agent.
