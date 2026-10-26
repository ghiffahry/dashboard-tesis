# Audit penyelarasan dashboard, draft, dan presentasi

Tanggal: 2026-10-26
Rilis: 1.4.0

## Sumber dan pemeriksaan

- Draft Seminar Hasil: 11 halaman. Berkas dalam repo diperbarui dari sumber final yang diberikan pengguna. SHA-256 sumber dan salinan: `67885EBCD4C20CDCCA9D5A10C0E097D18551B59B21AA0E0553617E5C395EBD29`. Metadata PDF tidak diedit.
- Paparan Seminar Hasil: 26 halaman. Tabel koefisien slide 17 dan kesimpulan slide 23 dibandingkan dengan angka dashboard.
- Data runtime berisi 154 wilayah × 11 tahun. Median kemiskinan terhitung dari data dashboard adalah 0,1134 pada 2015 dan 0,08345 pada 2025.

## Hasil audit dan implementasi

1. **Istilah model.** Nama M1–M4 mengikuti naskah/presentasi. Label M5 hanya dijelaskan sebagai alias kode stmmlib untuk M4. Struktur delapan fit, bobot, ragam area/waktu, logLik, AIC, BIC, cAIC, R² marginal, dan koefisien direpresentasikan di laman Metode.
2. **Hasil koefisien.** Tabel dashboard memuat intersep dan 16 prediktor. Susunan prediktor di dashboard dipetakan kembali ke X1–X16; nilai dan tanda signifikansi mengikuti tabel presentasi dan tabel draft. Pilihan model mengubah tabel koefisien dan menyorot model pada grafik. Pilihan prediktor mengubah grafik perbandingan koefisien.
3. **Grafik pembanding.** Pengguna dapat memilih selisih cAIC, ragam area, ragam waktu, atau ρ SAR. Nilai ρ hanya ditampilkan pada enam fit SAR. Selisih cAIC dihitung terhadap nilai terendah; M4 KNN-5 bernilai nol.
4. **Cakupan halaman.** Moran/LISA di halaman Analisis diberi keterangan sebagai eksplorasi nilai kemiskinan, bukan hasil model atau Moran residu. IPM ditandai sebagai indikator eksplorasi di luar Y dan 16 prediktor. Judul dokumen menyebut Spatial EBLUP Rao-Yu, tetapi tabel hasil draft dan presentasi yang diperiksa tidak memuat estimasi model itu; hasil tidak direka.
5. **Konflik sumber.** Tabel koefisien draft/presentasi selaras, tetapi narasi halaman 8 draft menyebut arah/peubah yang berbeda. Dashboard mengikuti tabel dan menampilkan catatan agar narasi diperiksa. Median pada slide 13 (11,5% ke 8,5%) tidak sama dengan median hasil hitung ulang data runtime (11,34% ke 8,345%). Dashboard mempertahankan hasil data dan menampilkan catatan perbedaan.
6. **Halaman Draft.** Tetap hanya memuat header ringkas, kontrol PDF, dan penampil penuh, tanpa tiga kartu di bawahnya. PDF diganti dengan sumber yang hash-nya telah diverifikasi identik.
7. **Responsif dan aksesibilitas.** Audit browser mencakup lebar ponsel 390 px dan desktop 1440 px. Grafik Metode dapat digeser mendatar di ponsel; tabel mempunyai pembungkus gulir; tombol mempunyai label; tombol model dan pemilih ukuran memperbarui grafik/tabel; tema gelap dapat dipilih. Tidak ditemukan luapan halaman mendatar pada lima halaman di ponsel dan Metode di desktop.

## Validasi

- `python build_site.py`: berhasil, 43 berkas.
- `node tests/uji-node.mjs`: lulus 13/13.
- `node --check` untuk `aset/model-beta.js`, `aset/metode-visual.js`, dan `aset/beranda-visual.js`: lulus.
- `git diff --check`: lulus.
- Browser: 8 baris fit; 17 baris koefisien termasuk intersep; 16 pilihan prediktor; 8 batang grafik; PDF 11 halaman dengan HTTP 200; 154 poligon peta.
- Beranda memuat KPI, tren, histogram/boxplot; indikator kemiskinan tahun 2025 menunjukkan rerata 8,9%, median 8,3%, dan 154 data lengkap. Boxplot menggunakan aturan Tukey 1,5 × IQR dan memberi label titik pencilan.

## Batas dan tindak lanjut

Belum ada refit dari data sumber model pada pekerjaan dashboard ini. Nilai model disalin dari tabel dokumen. Selisih median dan konflik narasi perlu diselesaikan pada sumber tesis sebelum dapat disebut konsisten sepenuhnya. Hasil Spatial EBLUP Rao-Yu, metadata definisi operasional rinci, dan hasil uji fisik perangkat iOS/Android masih memerlukan sumber/pemeriksaan lanjutan.
