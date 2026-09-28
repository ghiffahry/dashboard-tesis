# Dashboard Tesis

Dashboard statis untuk mengeksplorasi indikator 154 kabupaten/kota di Sumatera, 2015-2025. Rilis proyek: **1.0.2**.

## Pratinjau lokal

Jalankan `python alat/serve.py`, lalu buka `http://localhost:8000`. Untuk menyiapkan artefak situs, jalankan `python build_site.py`; hasilnya berada di `_site/`.

## Terbitkan ke GitHub Pages

Repository publik proyek: [ghiffahry/dashboard-tesis](https://github.com/ghiffahry/dashboard-tesis). GitHub Pages menggunakan GitHub Actions dan situs tersedia di [https://ghiffahry.github.io/dashboard-tesis/](https://ghiffahry.github.io/dashboard-tesis/).

Setiap push ke branch `main` menjalankan uji modul, membangun `_site/`, lalu menerbitkannya. Jika pengaturan Pages perlu diperiksa, buka **Settings > Pages > Build and deployment** dan pilih **GitHub Actions**. Semua tautan aset relatif terhadap root repository.

Rilis dilakukan melalui branch `main` dan tag versi. Input tesis tetap lokal dan tidak dilacak Git; data runtime yang dipakai situs berada dalam repository.

## Halaman dan navigasi

Dashboard menyediakan halaman beranda, peta, analisis, dan metode. Filter tahun dan peubah dibawa dalam URL agar pemilihan dapat dibagikan.

## Data dan batas

Situs menampilkan data runtime tesis untuk 154 kabupaten/kota di Sumatera periode 2015-2025. Analisis bersifat deskriptif dan asosiasional; hasil Moran dan LISA bukan bukti sebab-akibat. Gambar logo pada header dimuat dari server resmi IPB sehingga tampil jika browser terhubung ke alamat gambar tersebut.
