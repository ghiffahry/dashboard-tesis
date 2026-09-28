# Identitas IPB dan perbaikan interaksi peta

- ID: 2026-09-ipb-brand-map
- Status: Completed
- Prioritas: High
- Pemilik: Codex
- Klasifikasi: Significant, perubahan lintas halaman dan interpretasi interaksi statistik.

## Tujuan
Gunakan biru tua IPB untuk aksen, tampilkan lambang IPB pada header, perbaiki header peta yang menyusut, dan bantu pengguna membedakan kuartil nilai dari klaster LISA signifikan.

## Dampak dan batas
Mengubah `aset/shell.js`, token CSS, `aset/polesan.css`, `peta.html`, `aset/peta.js`, dan backlog proyek. Geometri, data tesis, algoritme Moran, dan klasifikasi kuartil tidak diubah. Sorotan LISA memakai kolom `signifikan` yang telah tersedia dalam `moran.json`; filter hanya mengubah opasitas, bukan hasil uji.

## Penerimaan
- Lambang IPB dan nama produk tampil utuh pada semua halaman di desktop dan lebar ponsel.
- Warna aksen utama menggunakan biru tua yang diambil dari identitas visual IPB.
- Header peta tidak menyusut atau terpotong.
- Kuadran dan status signifikansi LISA terbaca terpisah dari kuartil nilai.
- Ringkasan jumlah, median, IQR, dan rentang berubah saat indikator atau tahun berubah.
- Pemeriksaan modul, build, dan audit browser desktop/ponsel berhasil.

## Validasi
- `node tests/uji-node.mjs`: 12/12 lulus.
- `node --check` seluruh `aset/*.js`: lulus.
- `python build_site.py`: berhasil, 34 berkas, versi artifact `site-224481bd0398`, proyek v1.0.1.
- `git diff --check`: lulus.
- Browser lokal, halaman sumber dan artifact: header dan lambang tampil, tidak ada overflow horizontal pada lebar ponsel 320 px dan 436 px maupun desktop 1440 px.
- Empat halaman diperiksa pada ukuran ponsel dan desktop. Header peta memenuhi lebar layar, peta menggunakan latar terang, serta panel filter dan legenda tidak menutupi toolbar.
- Peta Miskin 2025: toggle LISA menampilkan 13 wilayah signifikan dan meredupkan 141 wilayah lainnya; kuartil tidak berubah.
- Pendapatan Industri 2025: ringkasan berubah sesuai data; toggle LISA nonaktif karena hasil Moran belum tersedia.
- Konsol browser: tanpa error atau warning.

## Risiko dan tindak lanjut
- Uji responsif memakai viewport browser, belum menggantikan uji sentuh di perangkat fisik.
- Fitur tambahan yang belum dikerjakan ada di `TODO.md` dan di luar patch ini.
