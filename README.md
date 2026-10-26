# Dashboard Tesis

Dashboard statis untuk mengeksplorasi indikator 154 kabupaten/kota di Sumatera, 2015-2025. Rilis proyek: **1.4.1**.

## Pratinjau lokal

Jalankan `python alat/serve.py`, lalu buka `http://localhost:8000`. Untuk membangun artefak situs, jalankan `python build_site.py`; hasilnya berada di `_site/`.

## Halaman

- **Beranda:** KPI, rerata dan median tahunan, histogram, boxplot, peringkat, dan perpindahan kuartil.
- **Peta:** choropleth indikator dan tahun, ringkasan sebaran, tooltip wilayah, serta filter kuartil dan LISA.
- **Analisis:** Moran global kemiskinan, scatterplot Moran, LISA, tren tahunan, sensitivitas bobot, dan perubahan wilayah.
- **Metode:** Model Campuran Beta Spatio-Temporal, dengan M1–M4 sesuai naskah dan alias M5 untuk M4 pada kode stmmlib. Delapan fit, komponen ragam, 16 koefisien, sensitivitas bobot, logLik/AIC/BIC/cAIC, rumus Moran/LISA, kamus data, dan jaringan tetangga. Moran/LISA eksploratif dipisahkan dari hasil model.
- **Draft:** Naskah Seminar Hasil PDF dengan pembaca 11 halaman, navigasi, unduh, zoom, dan layar penuh.

Halaman dirancang responsif untuk desktop dan ponsel. Pilihan indikator/tahun dibawa dalam URL jika relevan.

## GitHub Pages

Repository: [ghiffahry/dashboard-tesis](https://github.com/ghiffahry/dashboard-tesis). Situs: [ghiffahry.github.io/dashboard-tesis](https://ghiffahry.github.io/dashboard-tesis/). Push ke `main` menjalankan pemeriksaan modul, membangun `_site/`, lalu menerbitkan dengan GitHub Actions.

## Penyelarasan dokumen

Tabel angka pada draft dan presentasi dipakai untuk hasil model. Narasi hasil halaman 8 draft memiliki perbedaan arah dan signifikansi dengan tabel koefisien; dashboard menandai perbedaan tersebut dan mengikuti tabel yang konsisten dengan presentasi. Median kemiskinan hasil hitung ulang data dashboard juga sedikit berbeda dari angka pada slide. IPM tersedia sebagai indikator eksplorasi, bukan salah satu dari 16 prediktor model. Dokumen menyebut Spatial EBLUP Rao-Yu, tetapi hasil model itu belum tersedia pada draft atau presentasi sehingga belum ditampilkan sebagai hasil.

## Data dan batas interpretasi

Rerata kabupaten/kota memberi bobot yang sama untuk setiap wilayah, bukan bobot penduduk. Moran dan LISA mengukur asosiasi spasial, bukan sebab-akibat. Perpindahan kuadran LISA bersifat deskriptif dan tidak membuktikan persistensi klaster. Moran global memakai nilai p mentah; koreksi FDR diterapkan pada pengujian LISA per indikator dan tahun. Definisi operasional indikator hanya ditampilkan jika tersedia dalam metadata.

Data runtime berada di repository dan dipakai untuk situs statis. Berkas sumber tesis pribadi tidak disertakan.

