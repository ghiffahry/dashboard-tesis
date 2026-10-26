# PRD: Visual analitik dan dokumen draft

## Pengguna dan tujuan
Pembaca tesis dan dosen ingin melihat ringkasan wilayah, distribusi, asosiasi spasial, ketergantungan pada definisi bobot, serta batas data tanpa membuka skrip analisis.

## Perilaku
- Filter indikator dan tahun mengubah statistik deskriptif, peringkat, distribusi, dan grafik yang sesuai.
- Peta Moran menyorot wilayah yang sama saat titik scatter atau kuadran LISA dipilih.
- Hasil sensitivitas menampilkan estimasi Moran dan p/q yang benar-benar tersedia; tidak membuat interval ketidakpastian yang tidak dihitung.
- LISA lintas tahun dibaca sebagai perubahan klasifikasi lokal, bukan identitas klaster menetap.
- Kamus indikator hanya menyajikan metadata yang tersedia. Keterangan definisi operasional yang belum tersedia diberi label belum dilengkapi.
- Jaringan tetangga dijelaskan dan dipakai untuk menelusuri tetangga Queen, jarak 110 km, dan KNN 5.
- Laman Draft menampilkan PDF tesis sebagai isi utama dan tidak memuat kartu tambahan.
- Hasil model memakai istilah dan angka dari tabel PDF serta presentasi; pemetaan M4 naskah ke M5 kode stmmlib dijelaskan.
- Model Beta dan eksplorasi Moran/LISA dipisahkan. IPM diberi label sebagai indikator tambahan di luar model.
- Metode menyediakan grafik interaktif delapan fit, sensitivitas ragam/cAIC/ρ, serta koefisien 16 prediktor.
- Konflik antara narasi hasil naskah dan tabel, perbedaan angka median slide, serta belum tersedianya hasil Rao-Yu diberi catatan transparan.

## Batas
Situs tetap statis dan dapat dipublikasikan pada GitHub Pages. Tidak ada backend, API key, atau unggahan dokumen pribadi. Dokumen yang diterbitkan adalah PDF Seminar Hasil yang diberikan pengguna.

## Aksesibilitas dan responsif
Kontrol berlabel, dapat digunakan dengan keyboard/sentuh, grafis SVG memiliki judul/deskripsi atau rincian teks, dan layout mengecil ke satu kolom pada ponsel.
