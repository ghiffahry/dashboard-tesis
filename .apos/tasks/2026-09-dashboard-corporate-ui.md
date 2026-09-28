# Dashboard UI: peta, ringkasan, dan navigasi

- Status: Completed
- Prioritas: High
- Pemilik: Codex
- Klasifikasi: Significant, perubahan lintas halaman dan interaksi pengguna

## Sasaran
Rapikan konsistensi header, hilangkan kanvas peta hitam, tambah dua gaya dasar peta dan kontrol buka-tutup panel, isi area akhir beranda dengan eksplorasi interaktif yang berguna, serta kurangi ruang kosong berlebih. Semua perubahan harus berfungsi pada desktop dan ponsel.

## Kriteria penerimaan
- Peta mengikuti tema situs, memiliki gaya warna dan netral, panel filter dan legenda dapat dibuka/tutup dengan tombol yang aksesibel.
- Header desktop tidak memakai gaya tombol browser bawaan; navigasi ponsel tetap jelas dan tidak menutupi kontrol peta.
- Bagian akhir beranda menyediakan pilihan interaktif yang mengarah ke peta/analisis dengan state indikator dan tahun yang dipilih.
- Kartu dan grafik memakai ruang lebih efektif tanpa menambah statistik yang tidak didukung data.
- Build, uji Node, dan pemeriksaan browser desktop/ponsel lulus.

## Hasil dan validasi
- CSS tambahan memperbaiki navigasi, tinggi kartu, header peta, panel, dan kontrol lintas viewport.
- Basemap tidak lagi dibalik menjadi hitam; pilihan warna/netral, panel filter, dan legenda berjalan. Tombol Cari membuka filter saat tertutup.
- Beranda meneruskan indikator dan tahun pilihan ke URL peta dan analisis.
- Build akhir berhasil: `_site` berisi 33 file, versi `site-140f493577c0`.
- `node uji-node.mjs`: 12/12 lulus. Modul JS dan server melewati `node --check`.
- Empat halaman diperiksa lewat browser desktop dan ponsel; tidak ada overflow horizontal atau error konsol. Pengujian ponsel memakai viewport browser, bukan perangkat fisik.
- Lihat `.apos/reports/2026-09-dashboard-corporate-ui.md` untuk catatan audit.

## Batas
Gaya netral memfilter tile OpenStreetMap yang sama, bukan provider basemap kedua. Tile memerlukan internet. Domain publikasi dan repo GitHub tidak diubah.