# Catatan perubahan

## 1.1.0 - 2026-09-29

- Menambah halaman Draft dengan PDF dummy, pratinjau, unduh, navigasi halaman, zoom, dan mode layar penuh.
- Memperluas beranda dengan KPI deskriptif, tren rerata dan median, histogram, boxplot, peringkat provinsi, dan transisi kuartil.
- Memperluas analisis dengan sensitivitas bobot Moran, grafik perubahan wilayah, serta ringkasan dan transisi LISA yang dapat ditautkan ke peta.
- Memperluas metode dengan alur kerja, rumus interaktif, kamus data, dan penjelajah tetangga Queen, jarak, dan KNN.
- Menambahkan peta tetangga yang dibangkitkan dari geometri dan memperluas navigasi menjadi lima halaman.
- Menjaga interpretasi Moran/LISA sebagai asosiasi; transisi LISA tidak disebut bukti klaster menetap.
- Menggunakan tata letak responsif pada komponen tambahan.

## 1.0.2 - 2026-09-28

- Menggunakan gambar logo vertikal dari URL resmi IPB pada header. CSS menampilkan bagian lambang sebagai ikon ringkas.

## 1.0.1 - 2026-09-28

- Menggunakan biru tua IPB sebagai aksen antarmuka dan menambahkan lambang resmi IPB ke header semua halaman.
- Memperbaiki lebar header peta dan jarak filter untuk ponsel, termasuk layar sempit.
- Menampilkan status signifikansi LISA terpisah dari kuartil, serta menyediakan sorotan klaster signifikan FDR 5%.
- Menambahkan ringkasan jumlah wilayah, median, IQR, dan rentang nilai yang mengikuti indikator dan tahun aktif.
- Menambahkan `TODO.md` untuk rencana fitur statistik, peta, metode, dan aksesibilitas.

## 1.0.0 - 2026-09-28

Rilis pertama Dashboard Tesis sebagai situs statis GitHub Pages.

### Catatan metodologis

Hasil dashboard bersifat deskriptif dan asosiatif. Moran global dan LISA tidak mengukur pengaruh kausal. Ringkasan wilayah tidak sama dengan estimasi penduduk berbobot.
