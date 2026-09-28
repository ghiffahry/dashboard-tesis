# Catatan perubahan

## 1.0.2 - 2026-09-28

- Menggunakan gambar logo vertikal dari URL resmi IPB pada header. CSS menampilkan bagian lambang sebagai ikon ringkas.

## 1.0.1 - 2026-09-28

- Menggunakan biru tua IPB sebagai aksen antarmuka dan menambahkan lambang resmi IPB ke header semua halaman.
- Memperbaiki lebar header peta dan jarak filter untuk ponsel, termasuk layar sempit.
- Menampilkan status signifikansi LISA terpisah dari kuartil, serta menyediakan sorotan klaster signifikan FDR 5%.
- Menambahkan ringkasan jumlah wilayah, median, IQR, dan rentang nilai yang mengikuti indikator dan tahun aktif.
- Menambahkan `TODO.md` untuk rencana fitur statistik, peta, metode, dan aksesibilitas.

## 1.0.0 - 2026-09-28

Rilis pertama Dashboard Tesis yang siap dibangun dan diterbitkan sebagai situs statis.

- Menyatukan beranda, peta, analisis, dan metode dengan navigasi serta state indikator/tahun yang terhubung.
- Menyediakan layout desktop dan ponsel, tema terang/gelap, grafik interaktif, serta peta dengan kuartil yang dibedakan menurut makna indikator.
- Menambahkan Moran global kemiskinan, scatterplot Moran, ringkasan tren, dan pembanding yang hanya aktif bila hasil statistik tersedia.
- Memisahkan spesifikasi dan desain ke `docs/`, arsip prompt ke `docs/arsip/`, dan pemeriksaan modul ke `tests/`.
- Menambahkan pemeriksaan modul ke workflow sebelum build dan deploy GitHub Pages.
- Menetapkan `_site/` sebagai keluaran build yang tidak disimpan di Git.

### Catatan metodologis

Hasil dashboard bersifat deskriptif dan asosiatif. Moran global dan LISA tidak mengukur pengaruh kausal. Pembacaan tren wilayah tidak sama dengan estimasi tingkat penduduk berbobot.

- Deploy awal v1.0.0 diterbitkan di https://ghiffahry.github.io/dashboard-tesis/ dari repository publik ghiffahry/dashboard-tesis.
