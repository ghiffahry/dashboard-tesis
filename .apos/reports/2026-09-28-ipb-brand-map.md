# Audit biru IPB dan interaksi peta

Tanggal: 2026-09-28
Task: `2026-09-ipb-brand-map`
Klasifikasi: Significant, perubahan identitas dan perilaku tampilan peta lintas ukuran layar.

## Perubahan
- Aksen antarmuka utama diselaraskan dengan biru logo IPB (`#263c92`).
- Header bersama memakai lambang IPB resmi yang dapat diklik menuju situs IPB dan wordmark Ruang Data yang kembali ke beranda.
- Header peta diberi lebar penuh. Basemap terang menyatu dengan tema biru-putih; gaya netral dan tema gelap tetap tersedia.
- Detail wilayah menyebut kuadran dan status LISA FDR 5% secara eksplisit.
- Panel filter mendapat toggle sorotan LISA yang meredupkan wilayah tidak signifikan tanpa mengganti kelas kuartil.
- Ringkasan sebaran peta menampilkan n, median, IQR (Q3-Q1), dan rentang sesuai indikator-tahun yang aktif. Filter LISA dinonaktifkan jika hasil belum tersedia.
- `TODO.md` memuat daftar gagasan sebelumnya dan prioritas pengembangan berikutnya.
- Versi proyek dinaikkan dari v1.0.0 menjadi patch v1.0.1.

## Validasi
- `node tests/uji-node.mjs`: 12/12 lulus.
- `node --check` untuk seluruh modul JavaScript di `aset/`: lulus.
- `python build_site.py`: sukses, 34 file artifact, versi `site-224481bd0398`, proyek v1.0.1.
- `git diff --check`: lulus.
- Empat halaman dicek pada browser lokal di lebar ponsel 436 px dan desktop 1440 px. Tidak ada overflow horizontal, lambang termuat, dan header tetap utuh. Peta juga dicek pada 320 px.
- Pada Peta Miskin 2025, 13 dari 154 wilayah ditandai signifikan; 141 lainnya diredupkan saat toggle aktif. Pilihan kuartil tetap berfungsi independen.
- Pada Pendapatan Industri 2025, ringkasan sebaran mengikuti nilai indikator dan penyaring LISA dinonaktifkan karena anotasi Moran tidak tersedia.
- Tidak ditemukan error atau warning di konsol browser.

## Batas
Viewport browser menguji breakpoint, bukan gestur dan keterbacaan pada perangkat fisik. Pemeriksaan langsung di perangkat Android/iPhone tetap masuk backlog `TODO.md`. Nilai dan hasil statistik tidak dihitung ulang atau diubah.

## State
- Diperbarui: task, keputusan ADR 0007, changelog, README, versi rilis, dan TODO.
- Tidak diubah: data tesis, geometri, metode perhitungan Moran/LISA, dan algoritme klasifikasi kuartil.
