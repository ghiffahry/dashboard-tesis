# Pratinjau PDF Draft di ponsel

- ID: 2026-10-mobile-pdf-preview
- Status: Complete
- Prioritas: Tinggi
- Tujuan: membaca naskah Seminar Hasil pada ponsel tanpa harus mengunduh PDF terlebih dahulu.

## Perubahan
- Browser dengan lebar layar sampai 760 px memakai PDF.js 5.4.624 untuk merender satu halaman PDF pada canvas.
- Kontrol halaman dan zoom yang ada tetap dipakai.
- Desktop tetap memakai PDF viewer bawaan browser.
- Tombol buka tab baru dan unduh tetap tersedia. Jika PDF.js atau jaringan CDN gagal, iframe dan jalur cadangan ditampilkan.
- PDF.js dimuat dari CDN jsDelivr; tidak memerlukan server, backend, atau API key. Pratinjau perlu koneksi internet.

## Validasi
- Build artifact `_site` berhasil, 43 berkas.
- Uji otomatis: 13/13 lulus.
- PDF.js dan worker termuat HTTP 200; canvas merender halaman 1 dari 11 dengan isi dokumen.
- Tombol halaman menampilkan halaman 2; zoom kembali ke Pas halaman.
- Viewport 390 × 844 dan 320 × 700 tidak menyebabkan scroll horizontal.
- Pada desktop, iframe PDF bawaan browser tetap digunakan.
- PDF.js mencatat satu peringatan parser nonfatal dari dokumen; halaman tetap berhasil dirender.
