# Laporan audit notasi dan layout analisis

Tanggal: 2026-10-26

## Perubahan

- Menghapus banner cakupan, ketidakselarasan, dan caveat sejenis dari laman Metode dan Analisis. Ringkasan interaktif dan uraian statistik biasa dipertahankan.
- Mengisi kolom kanan di samping panduan baca Moran dengan kartu ringkasan hasil model M4 SAR KNN-5 + AR(1): 9 dari 16 prediktor nyata, delapan negatif, satu positif, tujuh tidak nyata, cAIC −14963,73, ρ 0,6678, ragam area 0,1274, dan ragam waktu 0,0028. Angka mengikuti tabel presentasi.
- Mengoreksi formula respons menjadi `(Yᵢₜ | μᵢₜ, ϕ) ~ Beta(μᵢₜϕ, (1 − μᵢₜ)ϕ)`. Presisi Beta memakai ϕ; koefisien temporal AR(1) memakai φ. Penulisan ini membedakan dua parameter.
- Notasi lain konsisten: β₀ intersep, β koefisien tetap, vᵢ efek acak area, uᵢₜ efek acak waktu, ρ parameter SAR, dan σ² ragam. IID/SAR serta AR(1) dijelaskan sesuai model terpilih.
- Catatan tentang konflik narasi/angka yang belum terselesaikan tidak tampil sebagai banner; tindak lanjut tetap tersimpan pada TODO dan laporan penyelarasan sebelumnya.

## Audit sumber penulisan

PDF halaman metode menyebut parameter AR(1) sebagai 𝜑 dan presisi Beta sebagai 𝜙. Teks rumus hasil ekstraksi memiliki urutan karakter yang mudah salah terbaca. Bentuk parameterisasi mean-precision yang dipakai dashboard dinyatakan eksplisit, dengan dua glyph yang berbeda agar mudah dibedakan. PDF sumber tidak diubah.

## Validasi

- Sintaks `aset/model-beta.js` dan `aset/beranda-visual.js` diperiksa.
- Build situs, 13 uji modul, tampilan Metode/Analisis, dan interaksi dropdown/tombol diperiksa.
- Desktop: 1440 px. Ponsel: 390 px; kartu beralih menjadi satu kolom dan tidak menyebabkan luapan mendatar.
