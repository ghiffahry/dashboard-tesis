# Dashboard Tesis

Dashboard statis untuk mengeksplorasi indikator 154 kabupaten/kota di Sumatera, 2015-2025. Rilis proyek: **1.1.0**.

## Pratinjau lokal

Jalankan `python alat/serve.py`, lalu buka `http://localhost:8000`. Untuk membangun artefak situs, jalankan `python build_site.py`; hasilnya berada di `_site/`.

## Halaman

- **Beranda:** KPI, rerata dan median tahunan, histogram, boxplot, peringkat, dan perpindahan kuartil.
- **Peta:** choropleth indikator dan tahun, ringkasan sebaran, tooltip wilayah, serta filter kuartil dan LISA.
- **Analisis:** Moran global kemiskinan, scatterplot Moran, LISA, tren tahunan, sensitivitas bobot, dan perubahan wilayah.
- **Metode:** alur kerja, rumus, kamus data, dan penjelajah tetangga.
- **Draft:** PDF contoh tesis dengan kontrol halaman, zoom, buka, dan unduh. PDF ini dummy, bukan dokumen hasil penelitian.

Halaman dirancang responsif untuk desktop dan ponsel. Pilihan indikator/tahun dibawa dalam URL jika relevan.

## GitHub Pages

Repository: [ghiffahry/dashboard-tesis](https://github.com/ghiffahry/dashboard-tesis). Situs: [ghiffahry.github.io/dashboard-tesis](https://ghiffahry.github.io/dashboard-tesis/). Push ke `main` menjalankan pemeriksaan modul, membangun `_site/`, lalu menerbitkan dengan GitHub Actions.

## Data dan batas interpretasi

Rerata kabupaten/kota memberi bobot yang sama untuk setiap wilayah, bukan bobot penduduk. Moran dan LISA mengukur asosiasi spasial, bukan sebab-akibat. Perpindahan kuadran LISA bersifat deskriptif dan tidak membuktikan persistensi klaster. Moran global memakai nilai p mentah; koreksi FDR diterapkan pada pengujian LISA per indikator dan tahun. Definisi operasional indikator hanya ditampilkan jika tersedia dalam metadata.

Data runtime berada di repository dan dipakai untuk situs statis. Berkas sumber tesis pribadi tidak disertakan.
