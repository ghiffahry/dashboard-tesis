# Sensitivitas bobot spasial dan Moran scatterplot

- Status: Completed
- Prioritas: High
- Pemilik: Codex

## Kriteria
- Bandingkan Moran global kemiskinan menggunakan Queen, jarak 110 km, dan KNN 5.
- Tampilkan Moran scatterplot yang mengikuti pilihan bobot dan tahun, dengan nilai per kabupaten/kota saat hover atau tap.
- Sertakan p permutasi, koreksi BH lintas 33 kombinasi, definisi bobot dan keterbatasannya.
- Pertahankan konsistensi angka Queen dengan hasil analisis dan audit deployment pada path GitHub Pages bertingkat.
- Uji desktop dan ponsel; validasi sumber data, build, runtime, dan tautan relatif.

## Hasil
- Generator sensitivitas, kartu scatterplot, metode, cache offline, dan build Pages selesai.
- build.ps1 berhasil mencari Python 3.12 dan menyelesaikan seluruh pipeline serta artifact tanpa variabel interpreter manual.
- Audit rincian: .apos/reports/2026-09-28-moran-sensitivity-audit.md.
