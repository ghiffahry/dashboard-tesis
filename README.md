# Dashboard Tesis

Dashboard statis untuk mengeksplorasi indikator 154 kabupaten/kota di Sumatera, 2015-2025. Rilis proyek: **1.0.0**.

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

Folder ini merupakan proyek Git tersendiri. Buat repository GitHub untuk dashboard ini, hubungkan remote repository tersebut, lalu push branch `main`. Workflow `.github/workflows/deploy.yml` menjalankan uji modul, membangun `_site/`, lalu menerbitkannya.

Di repository GitHub, buka **Settings > Pages > Build and deployment** dan pilih **GitHub Actions**. URL akan berbentuk `https://USERNAME.github.io/NAMA-REPO/`. Semua tautan aset bersifat relatif terhadap root repository.

Commit dan tag `v1.0.0` dibuat lokal. Push dilakukan terpisah setelah repository tujuan dikonfirmasi.

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
- Keputusan dan audit proyek: `.apos/`.
- Catatan rilis: `CHANGELOG.md`.
