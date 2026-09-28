# Isi folder data

JSON dan GeoJSON yang dipakai halaman merupakan data runtime dan disertakan dalam repository agar situs dapat dibangun serta diterbitkan.

CSV sumber tesis (`data_tesis_2015-2025.csv`), tabel antara (`tabel.csv`), dan shapefile di `sumber-spasial/` tetap berada pada komputer pemilik dan diabaikan oleh Git. File sumber itu dibutuhkan untuk menjalankan ulang seluruh pipeline `build.ps1`; file tersebut tidak dibutuhkan untuk `python build_site.py` atau workflow GitHub Pages.
