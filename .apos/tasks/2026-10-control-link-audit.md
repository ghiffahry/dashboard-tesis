# Audit tombol, tautan, dan teks lintas halaman

- ID: 2026-10-control-link-audit
- Status: Complete
- Prioritas: Tinggi
- Tujuan: memastikan setiap kontrol memiliki aksi nyata, tautan menuju tujuan yang tersedia, dan label konsisten.

## Kriteria selesai
- Tombol tanpa aksi diubah menjadi elemen visual non-interaktif atau diberi aksi yang tepat.
- Tautan lokal dan fragmen menuju target yang tersedia.
- Tombol dapat dipakai dengan keyboard dan memiliki status aksesibel.
- Label peta, analisis, metode, dan Draft memakai istilah yang konsisten.
- Build, uji interaksi lintas halaman, dan pemeriksaan desktop/mobile lulus.

## Hasil audit
- Matriks perpindahan kuartil memakai elemen `<button>` tanpa handler; diubah menjadi sel visual non-interaktif.
- Label “Local Moran” berbeda dari istilah Bahasa Indonesia pada komponen lain; distandarkan menjadi “Moran lokal (LISA)”.
- Tab Metode memakai pola ARIA tab, tetapi belum mendukung tombol panah; dukungan panah, Home, dan End ditambahkan.
- Zoom peta dari Leaflet memakai tautan `#` internal pustaka; bukan tautan navigasi mati karena dikendalikan Leaflet.
- Tautan halaman dan PDF merespons HTTP 200 pada build lokal.


## Validasi akhir
- Build produksi lokal berhasil; artifact _site berisi 43 berkas.
- Uji otomatis: 13/13 lulus.
- Pemeriksaan git diff --check lulus.
- Peta pada viewport 390 × 844: filter membuka/menutup, pilihan TPT mengubah judul dan URL, legenda bekerja, dan tidak ada scroll horizontal.
- Tab Metode: ArrowRight, Home, dan End berpindah tab serta panel dengan status ARIA yang sesuai.
- Tautan internal halaman/PDF dan fragmen diperiksa; semua target lokal tersedia. Tautan zoom +/− adalah kontrol Leaflet yang valid.
- Tema, PDF, peta, kontrol kuartil dan navigasi lintas halaman telah diperiksa pada desktop dan ponsel.
