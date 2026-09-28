# ADR 0001: Situs multipage dan arah visual

- Status: Diterima, diperbarui 2026-09-28

Pertahankan HTML/CSS/ES modules dan data precompute. Situs terdiri dari halaman Beranda, Peta, Analisis, dan Metode. Pakai pola biru-putih untuk dashboard, tema gelap sebagai pilihan pengguna, dan peta dengan gaya tile warna atau netral, lihat ADR 0005. Desktop menggunakan navigasi atas, ponsel memakai navigasi bawah. Publikasikan artifact `_site` lewat GitHub Actions dengan URL relatif agar dapat dipasang di `/<repo>/`. Atribusi OpenStreetMap harus tetap tampil pada peta.
