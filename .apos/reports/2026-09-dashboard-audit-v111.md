# Laporan audit Dashboard Tesis v1.1.1

Tanggal: 2026-09-29

## Cakupan
- Audit halaman Beranda, Peta, Analisis, Metode, dan Draft pada viewport desktop 1440 px serta ponsel 390 px.
- Memeriksa state statistik, grafik tahunan, filter provinsi, jalur peta konektivitas, tombol layar penuh, footer, dan visibilitas kartu Draft.

## Temuan dan perbaikan
- Beranda berhenti saat membaca objek non-daftar dalam `peringkat.json`; pembacaan kini hanya mengambil array peringkat. Beranda menampilkan 154/154 untuk kemiskinan 2025 dan 11 opsi provinsi.
- CSS lama membatasi lebar peta pada 1280 px untuk viewport 1440 px. Kanvas kini membentang ke tepi tampilan, memiliki kontrol layar penuh, dan tidak menyebabkan horizontal overflow pada viewport ponsel.
- Lintasan Moran kosong untuk indikator yang belum punya hasil Moran. Panel spasial-temporal kini memakai respons Y kemiskinan yang memang dihitung untuk 2015-2025, menyediakan Queen/jarak/KNN dan penanda q BH.
- Diagram tetangga skematis diganti peta GeoJSON 154 wilayah. Wilayah dapat dipilih langsung dan koneksinya mengikuti skema bobot.
- Kartu informasi tambahan di halaman Draft dihapus. Halaman hanya berisi berkas PDF, pratinjau, unduh, buka tab, navigasi halaman, zoom, dan layar penuh.
- Footer memakai identitas dan judul penelitian yang diminta.

## Hasil validasi
- Uji modul: 13/13 lulus.
- Sintaks JavaScript: semua modul lulus `node --check`.
- Build statis: 42 berkas.
- Browser desktop/ponsel: tidak ada page error pada Beranda, Peta, Analisis, Metode, atau Draft; lebar dokumen tidak melampaui viewport ponsel.
- Tombol layar penuh berhasil meminta fullscreen pada browser uji.

Peta dasar Leaflet dan logo IPB memerlukan akses internet ke layanan eksternal. Uji lokal dalam lingkungan terbatas tidak memuat tile basemap, sehingga penilaian di sini mencakup ukuran kanvas, kontrol, dan interaksi data lokal.
