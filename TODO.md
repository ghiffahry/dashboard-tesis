# Rencana pengembangan Dashboard Tesis

Backlog ini mengumpulkan gagasan pengembangan sebelumnya. Fitur yang sudah berjalan ditandai selesai. Prioritas tinggi berfokus pada audit statistika, keterbacaan grafik, dan konsistensi desktop dengan ponsel.

## Peta

- [x] Gunakan biru tua IPB sebagai aksen antarmuka dan tambahkan lambang IPB pada header.
- [x] Perbaiki lebar header peta agar tidak terpotong pada desktop maupun ponsel.
- [x] Tampilkan status signifikansi LISA pada detail wilayah dan sediakan sorotan klaster FDR 5% tanpa mengganti warna kuartil.
- [x] Tambahkan ringkasan jumlah data, median, IQR, dan rentang yang mengikuti indikator serta tahun aktif.
- [x] Jelaskan bahwa kuartil menggambarkan posisi nilai, sedangkan LISA menggambarkan asosiasi wilayah bertetangga.
- [ ] Tambahkan skala nilai kontinu sebagai pilihan; pertahankan kuartil sebagai tampilan baku dan cocokkan arah warna dengan risiko, capaian, atau indikator konteks.
- [ ] Tambahkan pencarian nama kabupaten/kota yang menyorot wilayah pada peta serta tombol kembali ke seluruh Sumatera.
- [ ] Tambahkan unduh ringkasan wilayah yang sedang tampil ke CSV, tanpa memasukkan data mentah tesis.

## Beranda

- [x] Pilihan indikator dan tahun mengubah ringkasan, grafik, peringkat, distribusi, perpindahan kuartil, dan Moran jika tersedia.
- [ ] Tambahkan boxplot atau rentang antarkuartil per tahun untuk membaca sebaran, bukan hanya rerata wilayah.
- [ ] Tambahkan pilihan provinsi yang menautkan peta, peringkat, dan ringkasan.
- [ ] Tambahkan indikator kelengkapan data dan penanda tahun dengan observasi yang berkurang.

## Analisis

- [x] Pisahkan pembacaan spasial, temporal, dan spasial-temporal; Moran utama tetap memakai kemiskinan sebagai respons Y.
- [x] Scatterplot Moran dapat dipilih menurut tahun dan bobot spasial, dengan detail wilayah saat titik dipilih.
- [ ] Tambahkan tabel hasil uji yang menampilkan statistik, p-value, jumlah permutasi, bobot, dan status FDR dalam satu format konsisten.
- [ ] Tambahkan sensitivitas Moran terhadap bobot Queen dan jarak sebagai perbandingan deskriptif yang jelas.
- [ ] Tambahkan transisi kuadran LISA antarperiode hanya jika data dan definisi inferensinya mendukung.

## Metode dan data

- [x] Terangkan unit analisis, periode, Moran global, LISA, FDR, dan batas interpretasi.
- [ ] Tambahkan diagram alur dari sumber data, pemeriksaan, pengolahan, bobot spasial, sampai keluaran.
- [ ] Lengkapi kamus indikator dengan definisi operasional, satuan, arah makna, sumber, dan ketersediaan tahun.
- [ ] Tambahkan panel interaktif untuk membandingkan definisi Queen, jarak, serta konsekuensi wilayah tidak terhubung.

## Ponsel, aksesibilitas, dan rilis

- [x] Terapkan komponen baru peta pada layout responsif, dengan panel filter dan legenda yang dapat dibuka atau ditutup.
- [ ] Audit sentuh dan orientasi layar pada perangkat Android dan iPhone fisik.
- [ ] Audit kontras warna, keyboard, pembaca layar, teks grafik, dan preferensi gerak minimum.
- [ ] Periksa ukuran unduhan dan waktu tampil peta pada jaringan seluler.

## Aturan prioritas

1. Selesaikan validitas angka, definisi, dan status uji sebelum menambah grafik.
2. Setiap kontrol harus mengubah keluaran yang terlihat dan mempertahankan indikator serta tahun pada URL.
3. Jangan menambah dekorasi yang mengurangi ruang peta atau menyulitkan pembacaan.
4. Semua komponen desktop yang bermakna harus memiliki padanan ponsel yang bisa digunakan.
