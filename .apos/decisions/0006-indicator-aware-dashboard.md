# ADR 0006: Indikator aktif, makna warna, dan identitas dashboard

- Status: Diterima, 2026-09-28
- Mengubah bagian tampilan beranda, analisis, dan peta dari ADR 0002, 0003, dan 0005.

## Keputusan
- Beranda memakai identitas visual "Ruang Data" dengan keterangan "Dashboard Tesis · Sumatera" dan simbol vektor buatan proyek. Tidak memakai logo IPB resmi tanpa aset resmi yang disediakan.
- Pemilih indikator di beranda mengubah tren, perubahan rerata, peringkat wilayah, perpindahan kuartil, distribusi, dan Moran bila hasilnya tersedia. Perubahan tetap disimpan dalam URL dan diteruskan ke peta serta analisis.
- Halaman Analisis mempertahankan kemiskinan sebagai respons Y pada Moran utama dan scatterplot. Indikator pilihan mengubah seri temporal dan panel Moran pembanding. Indikator tanpa hasil Moran diberi keterangan belum dihitung.
- Peta mengelompokkan nilai indikator tahun aktif ke empat kuartil. Kuartil adalah distribusi nilai, bukan kelompok LISA. Luminansi naik dari kuartil rendah ke tinggi. Rona disesuaikan untuk indikator risiko, capaian, atau konteks.
- Tooltip wilayah menggunakan permukaan opak, teks nama indikator, dan nilai aktif.
- Legenda peta terbuka di desktop dan tertutup saat ponsel memuat halaman pertama kali. Pengguna tetap dapat membuka atau menutupnya.

## Alasan
Kontrol harus mengubah informasi yang terlihat dan tidak boleh memberi kesan hasil Moran tersedia untuk semua indikator. Kuartil nilai dan LISA mengukur hal berbeda sehingga perlu dijelaskan terpisah. Rona kontekstual menghindari anggapan bahwa satu warna selalu berarti baik atau buruk.

## Dampak dan batas
Moran tersedia untuk kemiskinan, IPM, Gini, dan TPT. Seri temporal dan nilai wilayah tersedia untuk 18 indikator. Palet kuartil memakai urutan warna diskret, bukan skala kontinu. Audit ponsel dilakukan dengan viewport browser, bukan perangkat fisik.
