# Catatan perubahan

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
