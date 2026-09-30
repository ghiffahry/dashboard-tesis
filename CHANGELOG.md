# Catatan perubahan

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

