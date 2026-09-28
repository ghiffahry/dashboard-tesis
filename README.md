# Dashboard Tesis

Dashboard statis untuk mengeksplorasi indikator 154 kabupaten/kota di Sumatera, 2015-2025. Rilis proyek: **1.0.1**.

## Pratinjau lokal

Dari folder proyek, jalankan:

```powershell
python build_site.py
node alat/serve.mjs
```

Lalu buka `http://localhost:8000`. Alternatif server: `python alat/serve.py`. Jangan membuka HTML melalui `file://`; halaman memakai modul JavaScript dan `fetch`.

## Pemeriksaan dan build

Pemeriksaan modul:

```powershell
node tests/uji-node.mjs
```

Build artifact dari data runtime yang sudah tersedia:

```powershell
python build_site.py
```

Pipeline lengkap untuk mengolah ulang data:

```powershell
python -m pip install -r requirements-build.txt
.\build.ps1
```

Pipeline lengkap membutuhkan CSV tesis dan komponen shapefile di `data/` dan `data/sumber-spasial/`. Input lokal itu sengaja diabaikan Git karena sumber tesis tidak boleh ikut repo publik. Data runtime yang sudah diolah tetap dilacak agar preview dan deploy dapat berjalan. `python build_site.py` serta workflow Pages tidak membutuhkan input lokal tersebut.

## Terbitkan ke GitHub Pages

Repository publik proyek: [ghiffahry/dashboard-tesis](https://github.com/ghiffahry/dashboard-tesis). GitHub Pages sudah diatur memakai GitHub Actions dan situs v1.0.1 telah terbit di [https://ghiffahry.github.io/dashboard-tesis/](https://ghiffahry.github.io/dashboard-tesis/).

Setiap push ke branch `main` menjalankan uji modul, membangun `_site/`, lalu menerbitkannya. Jika pengaturan Pages perlu diperiksa, buka **Settings > Pages > Build and deployment** dan pilih **GitHub Actions**. Semua tautan aset relatif terhadap root repository.

Branch `main` dan tag `v1.0.1` sudah dikirim ke GitHub. Input tesis tetap lokal dan tidak dilacak Git; data runtime yang dipakai situs berada dalam repository.

## Halaman dan navigasi

- `index.html`: ringkasan, tren, peringkat, dan distribusi.
- `peta.html`: peta kuartil indikator dan informasi pola lokal.
- `analisis.html`: Moran global, scatterplot Moran, tren, dan perbandingan indikator.
- `metode.html`: definisi data dan metode.

Tema terang atau gelap dan pilihan indikator/tahun disimpan di peramban atau URL. Tampilan menyesuaikan layar desktop dan ponsel.

## Batas interpretasi

Rata-rata wilayah bukan estimasi berbobot jumlah penduduk. Moran dan LISA menunjukkan asosiasi spasial, bukan sebab-akibat. Moran pembanding hanya tersedia untuk kemiskinan, IPM, Gini, dan TPT. Halaman metode menjelaskan bobot Queen, LISA/FDR, dan keterbatasan pengujian.

## Dokumentasi

- Spesifikasi data dan metode: `docs/spesifikasi-dashboard-eda.md`.
- Arah desain yang berlaku: `docs/rencana-desain.md`.
- Prompt lama disimpan sebagai arsip lokal dan tidak masuk rilis.
- Backlog pengembangan: `TODO.md`.
- Keputusan dan audit proyek: `.apos/`.
- Catatan rilis: `CHANGELOG.md`.
