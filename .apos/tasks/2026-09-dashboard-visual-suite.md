# Dashboard visual analitik dan laman draft

- ID: 2026-09-dashboard-visual-suite
- Status: In Progress
- Pemilik: Codex
- Prioritas: Tinggi
- Klasifikasi: Significant, perubahan beberapa halaman dan navigasi.
- Dependensi: data runtime pra-hitung pada `data/`.

## Tujuan
Memperluas dashboard menjadi ruang eksplorasi statistik yang lebih lengkap dan menambah laman pembaca PDF untuk draft tesis.

## Kriteria penerimaan
- Beranda menampilkan KPI distribusi, rerata dan median tahunan, distribusi interaktif, peringkat dengan filter provinsi, serta perpindahan kuartil.
- Analisis menyediakan ringkasan Moran, tautan scatterplot ke peta, filter LISA, lintasan I bertanda signifikansi, sensitivitas bobot, perubahan terhadap nilai awal, dan transisi label LISA.
- Metode menyediakan alur kerja, kamus peubah yang dapat dicari, rumus Moran/LISA interaktif, serta visual dan daftar tetangga menurut bobot.
- Laman Draft memuat PDF dummy, unduh, buka, cetak, navigasi halaman, dan tampilan responsif.
- Tidak menyebut asosiasi sebagai sebab-akibat atau transisi kuadran sebagai bukti klaster menetap.
- Fitur berfungsi pada desktop dan ponsel; seluruh visualisasi memakai data runtime yang sudah ada atau jaringan tetangga yang dapat dibangun ulang.
- Uji modul, build statis, dan audit browser selesai; perubahan dicatat lalu dipush ke `main`.

## Validasi
Dalam pengerjaan.
