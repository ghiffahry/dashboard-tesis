# Audit indikator, semantik peta, dan identitas dashboard

Tanggal: 2026-09-28  
Task: `2026-09-indicator-map-brand`  
Klasifikasi: Significant, perubahan perilaku lintas halaman dan tampilan responsif

## Perubahan
- Identitas header di seluruh halaman memakai simbol vektor khusus proyek dan nama "Ruang Data", dengan keterangan "Dashboard Tesis · Sumatera".
- Pemilih indikator dan tahun diletakkan di bagian atas beranda agar terlihat sebelum pengguna mulai menggulir. Bagian bawah hanya menyisakan tautan ke peta dan analisis.
- Pemilih indikator beranda sekarang mengubah tren tahunan, peringkat perubahan, perubahan rerata, perpindahan kuartil, statistik sebaran minimum sampai maksimum, serta hasil Moran jika tersedia. Nilai wilayah diambil dari berkas 154 kabupaten/kota, sedangkan tren Sumatera menggunakan seri agregat tahunan.
- URL beranda dan tautan ke peta/analisis mengikuti indikator dan tahun aktif.
- Pada Analisis, kemiskinan tetap menjadi respons Y untuk Moran dan scatterplot. Indikator pembanding mengubah grafik temporal dan rangkaian Moran jika tersedia. Ketika Moran belum dihitung, panel memberi penjelasan dan tidak menampilkan seri kemiskinan sebagai pengganti.
- Peta menggunakan palet monoton lebih terang dari kuartil rendah ke tinggi. Warna membedakan indikator risiko, capaian, dan konteks. Legenda menjelaskan bahwa kuartil memakai sebaran indikator-tahun aktif, sedangkan LISA terpisah.
- Tooltip peta kini menampilkan nama wilayah, label indikator, dan nilai pada panel putih opak.
- Legenda terbuka otomatis pada desktop dan tertutup pada layar ponsel. Tombol tetap dapat mengubah keadaan, dan panel memiliki batas tinggi serta gulir pada ponsel.

## Validasi
- `python build_site.py`: berhasil, artifact `_site` berisi 33 file, versi `site-46a2df7cae11`.
- `node uji-node.mjs`: 12/12 lulus.
- `node --check` untuk `aset/analisis-moran.js`, `aset/peta.js`, dan `aset/shell.js`: lulus.
- Browser: memilih Pendapatan Industri di Analisis mengubah tren 11 titik dan menyatakan Moran belum dihitung. Memilih Gini menampilkan Moran 0,1605 dan seri Moran 11 titik.
- Browser: memilih Pendapatan Industri di Beranda mengubah ringkasan rerata dan peringkat wilayah, menghasilkan 11 titik tren, dan mempertahankan 154 observasi distribusi. Memilih Gini 2020 memperbarui statistik distribusi dan Moran, dan URL berubah mengikuti pilihan.
- Browser: tooltip Miskin menampilkan `Aceh Barat` dan `15,5%` dengan latar putih dan opacity 1. Tooltip IPM menampilkan nama peubah dan nilai.
- Peta IPM memakai klasifikasi capaian; Miskin memakai klasifikasi risiko. Nilai wilayah menunjukkan empat warna kuartil yang makin terang.
- Empat halaman diperiksa pada viewport desktop dan ponsel. Tidak ditemukan gulir horizontal. Ponsel memakai viewport browser, bukan perangkat iOS atau Android fisik.
- Versi URL CSS dan modul peta/analisis dinaikkan supaya browser mengambil aset yang baru, bukan salinan lama dari Service Worker.
- Lapisan legenda pada ponsel ditempatkan di atas kontrol atribusi OpenStreetMap. Semua baris kelas tetap terlihat saat panel dibuka.
- Konsol browser saat pemeriksaan: tidak ada error atau warning.

## Batas
- Moran belum tersedia untuk seluruh 18 indikator; dashboard menyebutkan indikator yang belum dihitung.
- Peta memakai empat warna kuartil diskret. Nilai warna meningkat menurut urutan kelas, bukan interpolasi kontinu.
- Warna peta menyampaikan urutan nilai; peta tetap memerlukan label dan legenda untuk menjelaskan maknanya.
- Perubahan bersifat lokal. Tidak ada commit, publikasi GitHub Pages, atau perubahan remote.

## Artefak
- Beranda audit ponsel: `C:/Users/LENOVO/.codex/visualizations/2026/09/27/01a0e3a3-1e60-72d2-b675-9d5be3fd8ade/dashboard-home-mobile.png`
- Peta audit ponsel: `C:/Users/LENOVO/.codex/visualizations/2026/09/27/01a0e3a3-1e60-72d2-b675-9d5be3fd8ade/dashboard-mobile-map.png`
