# ADR 0008: Visual statistik yang bersumber dari data pra-hitung

- Status: Diterima, 2026-09-29.
- Tugas: `2026-09-dashboard-visual-suite`.

## Keputusan
- Statistik deskriptif dihitung di browser dari nilai wilayah runtime yang sudah diterbitkan; rata-rata kabupaten/kota tidak dibobot penduduk.
- Sensitivitas Moran menampilkan hasil tiga bobot pra-hitung beserta p mentah dan q BH sesuai metadata.
- Pemilihan kategori LISA pada analisis diteruskan melalui URL ke peta; peta meredupkan unit yang tidak cocok dan menyorot unit signifikan pada kategori itu.
- Graf jaringan tetangga dibangun ulang dari GeoJSON dan rumus bobot yang sama dengan pipeline; jumlah tetangga harus sesuai dengan hasil sensitivitas yang ada.
- Definisi indikator yang belum tersedia tidak direka. Laman Draft hanya memakai PDF dummy eksplisit.

## Alasan
Grafik yang tampak menarik tetap harus merujuk pada definisi, denominator, dan hasil uji yang dapat diperiksa. Visualisasi yang dibangun ulang perlu menghasilkan jaringan identik dengan bobot yang dipakai pada analisis.

## Dampak dan batas
Ringkasan berbasis data wilayah memberi bobot sama untuk setiap kabupaten/kota. Nilai p Moran global tidak dikoreksi lintas tahun atau peubah; q BH sensitivitas mengikuti koreksi lintas 33 kombinasi. Transisi LISA adalah deskripsi label, bukan uji persistensi klaster.
