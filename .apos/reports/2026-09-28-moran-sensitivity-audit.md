# Audit sensitivitas Moran dan kesiapan GitHub Pages

Tanggal: 2026-09-28
Task: sensitivitas bobot spasial dan scatterplot Moran

## Perubahan

- Menambah skrip/03b_hitung_scatter_moran.py, generator tanpa dependensi tambahan untuk bobot Queen, jarak haversine 110 km dari koordinat wilayah, dan KNN 5. KNN bersifat berarah. Semua baris bobot distandarkan.
- Menghasilkan data/scatter-moran.json: 3 skema × 11 tahun × 154 wilayah, dengan p permutasi dan q Benjamini-Hochberg untuk 33 perbandingan.
- Menambah kartu Scatterplot Moran kemiskinan pada analisis.html, dengan filter tahun dan bobot, kuadran, OLS, nilai Moran, p mentah, q_BH, jumlah unit tanpa tetangga, dan detail titik lewat kursor, fokus papan ketik, atau sentuhan dekat titik.
- Memperbesar label grafik pada lebar ponsel dan menyesuaikan SVG ketika ukuran atau orientasi layar berubah.
- Memperbarui halaman metode, metadata inferensi, Service Worker, README, dan build_site.py.
- build.ps1 mencari Python yang tersedia, menerima DASHBOARD_PYTHON_EXE bila perlu, menghitung ulang data, lalu menyiapkan _site.
- Menambah alat/serve.mjs sebagai server preview tanpa paket eksternal.

## Pemeriksaan statistik

- Pipeline Queen asli selesai untuk 4 peubah × 11 tahun. Nilai Moran Queen hasil pipeline cocok dengan data scatter untuk seluruh tahun; Moran kemiskinan 2025 tetap I = 0,6002 dan p_sim = 0,001.
- Tahun 2025: Queen I = 0,6002; jarak 110 km I = 0,5405; KNN 5 I = 0,5162. Ketiganya positif, tetapi besarnya berubah menurut definisi tetangga.
- Semua p tambahan memakai 999 permutasi, seed 42, p satu arah untuk autokorelasi positif, dan koreksi tambah satu. Resolusi minimum p adalah 0,001. q_BH dikoreksi bersama atas 33 kombinasi.
- Queen punya 8 unit tanpa tetangga; jarak 110 km punya 5; KNN 5 tidak punya unit tanpa tetangga.
- Nilai utama esda.Moran.p_sim adalah p satu arah. P global utama tetap mentah, tanpa koreksi lintas tahun dan peubah. LISA memakai BH-FDR per peubah dan tahun. Batas ini ditulis pada metadata dan metode.
- Semua 6.776 nilai LISA yang disimpan finite. keep_simulations=False mempertahankan p_sim yang dipakai dan menghentikan perhitungan z_sim yang tidak dipakai aplikasi.
- Kemiringan OLS pada scatterplot dapat berbeda dari Moran I global saat bobot memiliki unit tanpa tetangga. Antarmuka menjelaskan hal ini.
- Moran mengukur asosiasi, bukan sebab-akibat. Hubungan yang tampak bergantung pada definisi bobot.

## Audit aplikasi dan build

- build.ps1 penuh berhasil tanpa pengaturan interpreter manual: join 154 wilayah bersih, statistik dihitung, GeoJSON akhir 154 fitur dan valid, lalu _site terbit dengan 32 file.
- Artifact tersedia pada URL dengan prefiks subfolder simulasi /_site/analisis.html. Tidak ada tautan aset yang dimulai dari root; jalur relatif cocok untuk username.github.io/nama-repo/.
- node uji-node.mjs: 12/12 lulus. Semua modul aset dan server Node lolos pemeriksaan sintaks.
- Empat halaman diperiksa pada desktop sekitar 1500 px dan ponsel 390 px. Tidak ada overflow horizontal pada tampilan yang dilaporkan browser; navigasi atas/bawah, tema, tabel metode, peta Leaflet, grafik, dan pilihan Moran termuat.
- Tahun dan bobot mengganti hasil Moran; detail titik terpilih tampil. Tema gelap dan terang berfungsi. Error dan peringatan browser: 0.
- Server Node mengirim halaman dan JSON dengan HTTP 200. Preview tersisa di http://localhost:8791/analisis.html.

## Batas yang masih ada

- Dashboard berada di dalam folder repo tesis, bukan root repo GitHub tersendiri. Workflow Pages baru berjalan setelah folder ini dijadikan root repo dan dipush ke GitHub. Tidak ada repo atau domain yang diterbitkan dalam tugas ini.
- Ukuran ponsel diuji melalui browser, bukan perangkat Android/iPhone fisik. Sentuhan diuji sebagai interaksi plot pada viewport ponsel.
- Peta dasar OpenStreetMap memerlukan internet.

## Status akhir

- Build terakhir setelah metadata p satu arah LISA diperjelas menghasilkan versi `site-d26aeb718307`.
- Pratinjau lokal dimuat ulang pada `http://localhost:8791/analisis.html` setelah build tersebut. Jalankan `node alat/serve.mjs` dari folder proyek untuk membuka pratinjau di `http://localhost:8000/`.
- `grillme` dan `ponytaill` tidak tersedia di lingkungan ini. Audit dilakukan memakai pemeriksaan build, statistik, browser, dan ukuran desktop/ponsel.
