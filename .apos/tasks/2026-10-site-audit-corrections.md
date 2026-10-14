# Audit dan koreksi informasi lintas halaman

- ID: 2026-10-site-audit-corrections
- Status: Complete
- Prioritas: Tinggi
- Tujuan: menghapus kartu Draft dan menyelaraskan statistik serta indikator di seluruh dashboard.

## Cakupan bertahap
1. Draft: hapus tiga kartu bawah; pertahankan header dan pembaca PDF penuh dengan kontrol yang bekerja.
2. Beranda: gunakan definisi boxplot Tukey 1,5 × IQR, tampilkan pencilan sebagai titik dengan nama, nilai, dan tahun.
3. Data indikator: perbaiki kunci peta kepadatan, izinkan ekstraksi indikator tanpa tanda satuan, dan tampilkan seluruh 18 peubah pada peta.
4. Istilah: gunakan label tampil “Kepadatan Penduduk”.
5. Pemeriksaan lintas halaman: peta, analisis, metode, Draft, desktop, ponsel, dan data sumber.

## Kriteria selesai
- Tidak ada kartu informasi setelah PDF pada Draft.
- Pencilan mengikuti Q1 − 1,5 × IQR dan Q3 + 1,5 × IQR; whisker berakhir pada observasi terjauh yang masih di dalam batas.
- Kunci indikator yang ada di CSV tidak tertinggal saat pembentukan seri peta.
- Nilai dan ringkasan tidak menghasilkan SVG NaN.
- Build dan uji modul lulus; perubahan tercatat di changelog dan versi.

## Validasi
Lihat `.apos/reports/2026-10-site-audit-corrections.md`.
