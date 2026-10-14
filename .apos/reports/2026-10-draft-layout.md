# Laporan perapian laman Draft PDF

Tanggal: 2026-10-14

## Perubahan
- Mengganti halaman panjang dengan header biasa, pembaca PDF penuh selebar konten, toolbar halaman/zoom/layar penuh, serta tiga kartu informasi di bawah.
- Menata tiga kartu dalam tiga kolom pada desktop dan satu kolom pada ponsel.
- Mengatasi aturan grid warisan yang memaksa `.insight-card` melebar enam kolom dan aturan yang menyembunyikan grid kartu.

## Validasi
- Build situs berhasil.
- Desktop 1440 px: pembaca 1.255 px, tiga kartu sejajar, tidak ada luapan.
- Ponsel 390 px: kartu tersusun vertikal, pembaca 68dvh, tidak ada luapan.
- Navigasi halaman dimulai pada 1, tombol sebelumnya nonaktif di awal, PDF tetap dimuat lokal.
