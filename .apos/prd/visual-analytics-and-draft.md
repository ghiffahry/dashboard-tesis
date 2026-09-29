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
- Laman Draft memuat dokumen contoh yang jelas bertanda dummy, sehingga tidak dianggap sebagai isi tesis.

## Batas
Situs tetap statis dan dapat dipublikasikan pada GitHub Pages. Tidak ada backend, API key, atau unggahan dokumen pribadi. PDF contoh tidak memuat data tesis.

## Aksesibilitas dan responsif
Kontrol berlabel, dapat digunakan dengan keyboard/sentuh, grafis SVG memiliki judul/deskripsi atau rincian teks, dan layout mengecil ke satu kolom pada ponsel.
