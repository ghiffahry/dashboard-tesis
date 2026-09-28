# Audit UI dashboard: peta, beranda, dan tampilan adaptif

Tanggal: 2026-09-28  
Task: `2026-09-dashboard-corporate-ui`  
Klasifikasi: Significant, perubahan lintas halaman dan interaksi pengguna

## Perubahan
- Menambah `aset/polesan.css` untuk memperbaiki gaya tautan navigasi yang sebelumnya tampak seperti tombol putih, merapatkan ruang kartu, dan memberi desain yang konsisten pada peta.
- Basemap peta tidak lagi dibalik/invert sehingga kanvas tidak hitam. Pengguna dapat memilih gaya warna atau netral. Gaya netral membuat tile abu-abu, sedangkan choropleth tetap mempertahankan warna kuartil. Atribusi OpenStreetMap tetap terlihat.
- Filter dan legenda peta dapat dibuka/tutup. Filter dimulai tertutup pada ponsel dan terbuka pada desktop. Tombol Cari header membuka filter sebelum memfokuskan pencarian.
- Area “Jelajahi” beranda yang hanya mengulang tautan halaman diganti pemilih indikator dan tahun. Dua tautannya membawa pilihan itu ke peta dan analisis.
- Menghapus 16 pemanggilan fitBounds duplikat sehingga pemusatan peta tinggal satu kali.
- Menambahkan stylesheet ke precache Service Worker dan pemeriksaan daftar asset build.
- Memperbarui README serta ADR yang menyebut basemap gelap.

## Validasi
- `py -3 build_site.py`: berhasil, artifact 33 file, versi `site-140f493577c0`.
- `node uji-node.mjs`: 12/12 lulus.
- `node --check` pada modul peta, shell, analisis, Moran, dan server: lulus.
- Browser memeriksa beranda, peta, analisis, dan metode pada desktop dan breakpoint ponsel. Tidak ada overflow horizontal.
- Beranda: daftar indikator termuat; pilihan Gini 2020 menghasilkan tautan `peta.html?tahun=2020&peubah=Gini.indeks_%28indeks%29`.
- Peta: tile terang tidak lagi difilter menjadi gelap; gaya netral menerapkan grayscale ke tile; filter dapat dibuka, tombol Cari membuka filter, legenda dapat disembunyikan. Status ARIA mengikuti keadaan kontrol.
- Console browser: tidak ada error atau warning.
- Preview terbaru tetap dapat diakses di `http://localhost:8791/`.

## Dampak dan batas
- Pengujian ponsel menggunakan viewport browser, bukan Android atau iPhone fisik.
- “Warna” dan “Netral” memakai tile OpenStreetMap yang sama. Netral adalah filter CSS, bukan basemap dari provider kedua.
- Data peta memerlukan internet. Tidak ada file mentah atau kredensial yang ditambahkan ke artifact.
- Tidak ada perubahan pada repo GitHub, remote, atau publikasi Pages.

## Status
Task dan keputusan tampilan telah diselaraskan dengan perilaku kode yang tervalidasi.
