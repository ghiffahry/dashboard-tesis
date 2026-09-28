# ADR 0004: Sensitivitas Moran dan bobot spasial alternatif

- Status: Diterima, 2026-09-28

Pertahankan hasil Queen sebagai hasil utama yang cocok dengan analisis sebelumnya. Sediakan jarak 110 km dan KNN 5 sebagai analisis sensitivitas eksplisit. Semua bobot distandarkan per baris. Jarak dan KNN memakai koordinat wilayah dan jarak haversine; KNN 5 bersifat berarah. Global p dihitung melalui 999 permutasi. Untuk perbandingan 3 bobot x 11 tahun, tampilkan q Benjamini-Hochberg atas 33 uji. Moran scatterplot kemiskinan memakai skor baku dan lag spasial baku per wilayah.
