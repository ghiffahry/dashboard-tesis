# ADR 0007: Identitas IPB dan interaksi signifikansi LISA

- Status: Diterima, 2026-09-28.
- Melengkapi ADR 0003, 0005, dan 0006.

## Keputusan
- Warna aksen antarmuka menggunakan biru tua `#263c92`, diambil dari lambang IPB resmi.
- Lambang resmi tampil terpisah dari tautan nama produk. Lambang menaut ke situs IPB; nama produk kembali ke beranda.
- Header peta memakai lebar penuh karena diposisikan absolut. Basemap terang tetap sama dengan tema biru-putih; pilihan tema gelap tetap didukung.
- Kuartil indikator tetap mewarnai nilai wilayah. Toggle LISA hanya meredupkan wilayah yang tidak signifikan setelah FDR 5%, tanpa mengubah kelas kuartil.
- Kartu ringkasan menampilkan jumlah, median, IQR, dan rentang untuk indikator-tahun aktif.

## Alasan
Aksen IPB memperkuat konteks akademik. Status signifikan harus tampak tanpa memberi kesan bahwa kuadran deskriptif otomatis menjadi klaster bermakna. Statistik median dan IQR memberi konteks sebaran yang tidak diberikan rerata saja.

## Dampak dan batas
Header memakai gambar logo vertikal dari URL yang direkomendasikan halaman logo resmi IPB University. CSS memotong tampilan menjadi lambang untuk menjaga header ringkas; sumber gambar tetap URL resmi IPB. Kolom `signifikan` dibaca dari hasil precompute, bukan dihitung ulang di browser. Kuartil adalah klasifikasi relatif terhadap indikator-tahun aktif. Sorotan LISA bersifat opsional dan dapat digabung dengan sorotan kuartil.
