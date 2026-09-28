# Pembaruan sumber logo IPB

Tanggal: 2026-09-28  
Task: `2026-09-official-ipb-logo-url`  
Klasifikasi: Routine, penggunaan aset lintas halaman.

## Perubahan
- Header menggunakan URL PNG vertikal resmi IPB University yang diberikan pengguna.
- CSS menampilkan lambang dari gambar vertikal dalam wadah ikon kecil agar wordmark tidak bertumpuk dengan nama produk.
- URL stylesheet dan modul diperbarui agar cache browser mengambil perubahan.
- Aset logo lokal duplikat dihapus dari paket situs dan direktori referensi.
- Versi proyek menjadi v1.0.2.

## Validasi
- Uji modul: 12/12 lulus.
- Build bersih berhasil di salinan verifikasi: 33 berkas, artefak `site-28aebd76e93b`.
- Audit browser pada hasil build lokal: gambar URL resmi termuat (300 × 209 px), posisi lambang berada tepat di dalam wadah header.
- Tampilan peta diperiksa pada lebar desktop dan ponsel 390 px.
- Build langsung pada folder kerja dibatasi izin filesystem, maka build dijalankan pada salinan sementara dari sumber yang sama.
- Deploy GitHub Pages diverifikasi setelah push.

Catatan: gambar bergantung pada ketersediaan URL resmi IPB dan koneksi browser.
