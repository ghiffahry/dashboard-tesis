# Laporan audit informasi lintas halaman

Tanggal: 2026-10-14
Versi: 1.3.2

## Temuan dan perubahan
- Draft memiliki tiga kartu yang tidak diinginkan dan skrip fullscreen masih mengubah elemen kartu yang akan dihapus. Kartu dan referensi skrip yang tidak terpakai dihapus; pembaca PDF dan kontrol tetap ada.
- Boxplot sebelumnya menggambar whisker dari minimum sampai maksimum, sehingga pencilan tidak pernah terlihat. Implementasi sekarang menggunakan batas Tukey 1,5 × IQR dan whisker berakhir pada nilai terjauh di dalam batas. Titik pencilan menampilkan nama wilayah, tahun, dan nilai; target sentuh diperbesar dan klik memperbarui tahun aktif.
- Ekstraksi seri peta hanya mengenali kunci yang memiliki satuan di dalam tanda kurung. Akibatnya Rasio Puskesmas tidak masuk ke data peta meski memiliki data. Regex diperluas untuk kunci tanpa satuan dan typo pada kunci Kepadatan di daftar peta dibetulkan. Setelah pipeline dijalankan ulang, seluruh 18 peubah memiliki nilai untuk 154 kabupaten/kota pada 2015–2025.
- Label yang ditampilkan untuk indikator kepadatan dibakukan menjadi “Kepadatan Penduduk”; kunci sumber dipertahankan untuk kompatibilitas data.
- Ringkasan README diselaraskan dengan Draft yang sekarang hanya memuat pembaca PDF.

## Pemeriksaan statistik
- Kuartil dihitung dengan interpolasi linear yang sama dengan fungsi kuantil dashboard dan pandas. Pada Miskin 2025 terdapat 3 pencilan; pada PAD JtTh 2025 terdapat 14.
- Seluruh 18 indikator memiliki 154 nilai pada setiap tahun di data peta. Nilai rasio puskesmas juga terverifikasi pada CSV sumber dan seluruhnya masuk ke data peta.
- PDF final tidak diubah. Isi model dan angka fit pada Metode tetap merujuk ke PDF acuan.

## Validasi antarmuka
- Beranda desktop 1440 px dan ponsel 390 px: KPI terisi, outlier SVG tidak NaN, titik pencilan tampil, tidak ada luapan horizontal.
- Peta desktop 1440 px dan ponsel 390 px: 154 wilayah ter-render, indikator kepadatan/Rasio Puskesmas dapat dipilih, dan tidak ada luapan horizontal.
- Metode desktop dan ponsel: delapan fit dan enam metrik model termuat, tanpa luapan horizontal.
- Analisis desktop dan ponsel: grafik sensitivitas dan perubahan tampil, tanpa luapan horizontal. Draft desktop dan ponsel: nol kartu tambahan, sebelas pilihan halaman, kontrol PDF tersedia, tidak ada luapan horizontal.

## Hasil uji
- `node tests/uji-node.mjs`: 13/13 lulus.
- `python -m py_compile skrip/01_siapkan_data.py skrip/04_ringkas_series.py`: lulus.
- `python build_site.py`: berhasil, 43 berkas situs.
- `git diff --check`: lulus.

## Batas pemeriksaan
Pada browser lokal, favicon tidak tersedia dan dapat menghasilkan satu 404; ini tidak memengaruhi halaman. Peta memerlukan koneksi untuk tile OpenStreetMap.
