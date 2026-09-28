# Arah desain Dashboard Tesis

## Tujuan

Dashboard menyajikan indikator sosial ekonomi 154 kabupaten/kota di Sumatera pada 2015-2025. Pengguna dapat berpindah dari ringkasan ke peta, analisis, dan penjelasan metode dengan pilihan tahun dan indikator yang konsisten.

## Sistem tampilan

- Palet biru dan putih dengan kontras teks yang cukup; tema terang dan gelap tersedia.
- Header navigasi berada di atas pada desktop. Navigasi ponsel berada di bawah layar.
- Beranda menampilkan pemilih indikator dan tahun, ringkasan angka, tren, peringkat, distribusi, dan tautan ke analisis terkait.
- Peta menyediakan tema dasar warna atau netral. Poligon dibagi menjadi empat kuartil berdasarkan nilai indikator aktif. Arah warna mengikuti makna indikator, sedangkan hasil LISA ditampilkan sebagai informasi yang berbeda.
- Filter dan legenda peta dapat dibuka atau ditutup. Tooltip memakai latar opak agar nama wilayah dan angka tetap terbaca.
- Halaman analisis membedakan pola spasial, perubahan temporal, dan rangkaian Moran tahunan. Moran kemiskinan menjadi analisis utama; indikator pembanding hanya menampilkan Moran bila hasilnya tersedia.
- Halaman metode menerangkan definisi, bobot spasial, pengujian, dan batas interpretasi dengan bahasa statistik yang ringkas.

## Interaksi dan aksesibilitas

Pilihan indikator dan tahun disimpan di URL agar dapat dibagikan dan diteruskan antarhalaman. Kontrol memberi umpan balik saat dipilih; tata letak berubah mengikuti lebar layar tanpa deteksi jenis perangkat. Grafik dan peta harus tetap terbaca dengan keyboard, pembesaran, dan layar kecil.

## Struktur teknis

Situs memakai HTML multipage dan JavaScript native tanpa bundler. `aset/` berisi modul dan gaya, `data/` berisi masukan olah serta data runtime, `skrip/` berisi pipeline statistik, `alat/` berisi server pratinjau, `tests/` berisi pemeriksaan modul, dan `docs/` berisi spesifikasi. `build_site.py` menyalin hanya halaman, aset, dan data runtime yang dibutuhkan ke `_site/`. Workflow GitHub Actions membangun lalu menerbitkan folder itu ke GitHub Pages.
