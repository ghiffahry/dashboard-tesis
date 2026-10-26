# Catatan perubahan

## 1.4.1 - 2026-10-26

- Menghapus banner peringatan/cakupan sejenis dari antarmuka; konflik sumber tetap tercatat dalam TODO dan laporan audit.
- Mengisi ruang di halaman Analisis dengan ringkasan temuan M4 dari presentasi dan grafik arah 16 prediktor.
- Menegaskan notasi presisi Beta ϕ dan koefisien AR(1) φ serta menulis ulang formula Beta dalam parameterisasi rerata-presisi.
- Menyusun ulang pasangan kartu agar mengisi lebar desktop dan bertumpuk pada ponsel.

## 1.4.0 - 2026-10-26

- Menyelaraskan istilah, struktur model, delapan hasil fit, ragam area/waktu, dan koefisien 16 prediktor dengan tabel draft serta presentasi Seminar Hasil.
- Menjelaskan bahwa M4 pada naskah adalah M5 pada kode stmmlib, dan menjaga label M4 sebagai nama model yang ditampilkan.
- Memisahkan Moran/LISA eksploratif dari keluaran Model Campuran Beta Spatio-Temporal. Menandai IPM sebagai indikator di luar 16 prediktor tesis.
- Menambah grafik interaktif untuk membandingkan cAIC, ragam, ρ SAR, dan koefisien menurut struktur model; tabel koefisien berubah saat model dipilih.
- Menandai perbedaan narasi koefisien di halaman 8 draft dengan Tabel 4–5 dan presentasi.
- Menandai selisih median kemiskinan hasil hitung ulang data dashboard dengan angka pada presentasi tanpa mengubah data sumber.
- Menjelaskan bahwa hasil Spatial EBLUP Rao-Yu belum tersedia pada dua dokumen acuan dan tidak diisi dengan angka perkiraan.
- Menjaga laman Draft sebagai pembaca PDF saja tanpa kartu tambahan.
- Memvalidasi build, modul, data indikator, grafik desktop dan ponsel, serta kontrol interaktif.

## 1.3.2 - 2026-10-14

- Menghapus tiga kartu di bawah pembaca PDF Draft. Halaman kini berfokus pada header, navigasi PDF, unduh, zoom, dan layar penuh.
- Mengganti whisker boxplot menjadi nilai terjauh di dalam batas Tukey 1,5 × IQR; pencilan kini tampil sebagai titik bernama, dapat difokuskan, dan dapat diklik.
- Memperbaiki ekstraksi indikator peta tanpa notasi satuan dan salah eja kunci kepadatan. Semua 18 indikator kini memiliki seri peta untuk 154 wilayah sepanjang 2015–2025.
- Memperbaiki label tampil menjadi “Kepadatan Penduduk”.
- Menyelaraskan README dan catatan audit dengan tampilan Draft terbaru.
- Memeriksa tampilan desktop dan ponsel, jumlah pencilan terhadap perhitungan kuartil linear, panel peta, tabel model, build, dan uji modul.

## 1.3.1 - 2026-10-14

- Merapikan laman Draft menjadi header ringkas, pembaca PDF selebar konten, dan tiga kartu informasi di bawahnya.
- Memperbaiki aturan grid warisan yang membuat konten menyempit dan kartu hilang pada desktop.
- Menyesuaikan ukuran pembaca PDF, toolbar, dan susunan kartu untuk ponsel.


## 1.3.0 - 2026-10-14

- Mengganti PDF dummy dengan naskah Seminar Hasil yang diberikan. Salinan diverifikasi memiliki SHA-256 sama dengan sumber; metadata tidak diubah.
- Menyelaraskan laman Draft dengan ringkasan penelitian, delapan fit, grafik cAIC, komponen varians interaktif, dan pembaca PDF 11 halaman.
- Menyelaraskan laman Metode dengan angka hasil dalam PDF dan menampilkan delapan kombinasi struktur serta bobot.
- Menjelaskan pemetaan M4 pada naskah sebagai M5 pada kode stmmlib. M4 SAR KNN-5 + AR(1) ditandai sebagai model dengan cAIC terendah menurut PDF.
- Memperbarui README, panduan dokumen, versi, cache service worker, dan catatan keputusan proyek.


## 1.2.0 - 2026-09-30

- Menambahkan beta mixed model sebagai metode utama, dengan pemilih struktur M1, M2, M3, dan M5.
- Menampilkan persamaan respons Beta, efek area IID/SAR, efek waktu IID/AR(1), dan tabel komponen model yang berubah sesuai pilihan.
- Menambahkan rumus log-likelihood Beta, AIC, BIC, dan cAIC beserta penjelasan parameter.
- Menambahkan rekap angka fit dari stmmlib dengan status konvergensi, versi bobot, dan batas keterbandingan. M5 ditandai belum valid; M2 memakai keluaran fallback; cAIC M3 tidak tersedia.
- Mengisi ruang kosong kartu metode dengan panduan kuadran Moran yang membedakan pola klaster dan pencilan lokal.
- Memeriksa interaksi M5/cAIC, error JavaScript, dan luapan horizontal pada viewport desktop dan ponsel.

## 1.1.1 - 2026-09-29

- Memperbaiki urutan pemuatan beranda agar indikator menunggu opsi dan metadata siap; KPI kembali memuat seluruh 154 wilayah dan filter provinsi terisi.
- Memperlebar peta hingga seluruh area tampilan, menambah kendali layar penuh, dan menghapus celah tepi serta luapan horizontal pada ponsel.
- Mengisi panel spasial-temporal dengan lintasan Moran kemiskinan yang tersedia, tiga pilihan bobot, status q BH, dan tautan tahun ke peta.
- Mengganti diagram tetangga dengan batas geografis 154 wilayah dan garis konektivitas yang dapat dipilih.
- Menyederhanakan laman Draft ke pratinjau PDF dan kontrol dokumen; menghapus kartu petunjuk tambahan.
- Mengganti teks footer dengan identitas dan judul penelitian sesuai permintaan.
- Memeriksa lima halaman pada desktop dan viewport ponsel; tidak ditemukan luapan horizontal. Uji modul lulus 13/13 dan build situs berhasil.
## 1.1.0 - 2026-09-29

- Menambah halaman Draft dengan PDF dummy, pratinjau, unduh, navigasi halaman, zoom, dan mode layar penuh.
- Memperluas beranda dengan KPI deskriptif, tren rerata dan median, histogram, boxplot, peringkat provinsi, dan transisi kuartil.
- Memperluas analisis dengan sensitivitas bobot Moran, grafik perubahan wilayah, serta ringkasan dan transisi LISA yang dapat ditautkan ke peta.
- Memperluas metode dengan alur kerja, rumus interaktif, kamus data, dan penjelajah tetangga Queen, jarak, dan KNN.
- Menambahkan peta tetangga yang dibangkitkan dari geometri dan memperluas navigasi menjadi lima halaman.
- Menjaga interpretasi Moran/LISA sebagai asosiasi; transisi LISA tidak disebut bukti klaster menetap.
- Menggunakan tata letak responsif pada komponen tambahan.

## 1.0.2 - 2026-09-28

- Menggunakan gambar logo vertikal dari URL resmi IPB pada header. CSS menampilkan bagian lambang sebagai ikon ringkas.

## 1.0.1 - 2026-09-28

- Menggunakan biru tua IPB sebagai aksen antarmuka dan menambahkan lambang resmi IPB ke header semua halaman.
- Memperbaiki lebar header peta dan jarak filter untuk ponsel, termasuk layar sempit.
- Menampilkan status signifikansi LISA terpisah dari kuartil, serta menyediakan sorotan klaster signifikan FDR 5%.
- Menambahkan ringkasan jumlah wilayah, median, IQR, dan rentang nilai yang mengikuti indikator dan tahun aktif.
- Menambahkan `TODO.md` untuk rencana fitur statistik, peta, metode, dan aksesibilitas.

## 1.0.0 - 2026-09-28

Rilis pertama Dashboard Tesis sebagai situs statis GitHub Pages.

### Catatan metodologis

Hasil dashboard bersifat deskriptif dan asosiatif. Moran global dan LISA tidak mengukur pengaruh kausal. Ringkasan wilayah tidak sama dengan estimasi penduduk berbobot.

