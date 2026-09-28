"""05_optimalkan_geojson.py: kuantisasi GeoJSON jalur cadangan Python murni (spec 20.3).

Menggantikan geojson-opt Rust bila Cargo/Go tak tersedia: bulatkan koordinat
ke 5 desimal, pangkas properti, tulis deterministik + .gz/.br. Idempotent.
Lihat docs/spesifikasi-dashboard-eda.md bagian 8 dan 20.3, docs/arsip/prompting.md bagian 7.
"""
import gzip
import json
import sys
from pathlib import Path

PRESISI = 5
BATAS_HEMAT = 0.05  # simpan hanya bila hemat > 5 persen
KOLOM_DISIMPAN = ("ADM2_EN", "ADM1_EN", "longitude", "latitude")
JUMLAH_ACUAN = 154


def pastikan_shapely() -> bool:
    """Cek shapely tersedia; gagal-jelas tanpa pasang otomatis."""
    try:
        import shapely  # noqa: F401
        return True
    except ImportError:
        print("prasyarat hilang: shapely tak tersedia; pasang manual: py -3 -m pip install shapely")
        return False


def bulatkan_koordinat(obj, presisi=PRESISI):
    """Rekursi atas struktur coordinates: angka -> round, list -> tiap elemen."""
    if isinstance(obj, bool):
        return obj  # kenapa: bool subclass int, jangan dibulatkan
    if isinstance(obj, (int, float)):
        return round(float(obj), presisi)
    if isinstance(obj, list):
        return [bulatkan_koordinat(elemen, presisi) for elemen in obj]
    if isinstance(obj, tuple):
        return [bulatkan_koordinat(elemen, presisi) for elemen in obj]
    raise TypeError(f"struktur koordinat tidak dikenal: {type(obj)}")


def perbaiki_bila_rusak(fitur):
    """Kuantisasi kadang bikin self-intersection; perbaiki via buffer(0).

    Ikut konvensi 02_konversi_peta.py. Kembalikan nama wilayah bila diperbaiki,
    None bila sejak awal valid. Raise ValueError bila tetap invalid.
    """
    from shapely.geometry import mapping, shape

    nama = fitur.get("properties", {}).get("ADM2_EN", "?")
    if shape(fitur["geometry"]).is_valid:
        return None
    geom_baik = shape(fitur["geometry"]).buffer(0)
    if not geom_baik.is_valid or geom_baik.is_empty:
        raise ValueError(f"geometri tetap invalid setelah buffer(0): {nama}")
    fitur["geometry"] = mapping(geom_baik)
    # kenapa dibulatkan lagi: mapping() hasilkan float panjang, jaga deterministik
    fitur["geometry"]["coordinates"] = bulatkan_koordinat(
        fitur["geometry"]["coordinates"]
    )
    return nama


def pangkas_properti(properti):
    """Sisakan hanya kolom yang dipakai UI peta."""
    return {kunci: properti.get(kunci) for kunci in KOLOM_DISIMPAN}


def validasi_hasil(teks_kandidat):
    """Parse ulang: fitur tetap 154 dan semua geometri valid via shapely."""
    from shapely.geometry import shape

    data = json.loads(teks_kandidat)
    fitur = data.get("features", [])
    if len(fitur) != JUMLAH_ACUAN:
        return False, f"jumlah fitur {len(fitur)}, acuan {JUMLAH_ACUAN}"
    rusak = []
    for f in fitur:
        try:
            geom = shape(f["geometry"])
        except Exception as e:  # noqa: BLE001
            rusak.append(f.get("properties", {}).get("ADM2_EN", "?") + f" (parse: {e})")
            continue
        if not geom.is_valid:
            rusak.append(f.get("properties", {}).get("ADM2_EN", "?"))
    if rusak:
        return False, f"geometri invalid: {', '.join(rusak)}"
    return True, "ok"


def optimalkan_geojson():
    pin_dir = Path(__file__).resolve().parent.parent
    jalur_geo = pin_dir / "data" / "sumatera.geojson"
    jalur_gz = pin_dir / "data" / "sumatera.geojson.gz"
    jalur_br = pin_dir / "data" / "sumatera.geojson.br"

    bytes_asal = jalur_geo.read_bytes()
    ukuran_sebelum = len(bytes_asal)
    data = json.loads(bytes_asal.decode("utf-8"))

    for fitur in data.get("features", []):
        fitur["geometry"]["coordinates"] = bulatkan_koordinat(
            fitur["geometry"]["coordinates"]
        )
        fitur["properties"] = pangkas_properti(fitur.get("properties", {}))

    # perbaiki geometri yang rusak akibat kuantisasi, catat jujur
    if not pastikan_shapely():
        print("keputusan: BUANG (prasyarat shapely hilang, file semula dipertahankan)")
        return 1
    diperbaiki = []
    for fitur in data.get("features", []):
        try:
            nama = perbaiki_bila_rusak(fitur)
        except ValueError as e:  # noqa: BLE001
            print(f"bytes sebelum: {ukuran_sebelum}")
            print(f"keputusan: BUANG ({e}, file semula dipertahankan)")
            return 1
        if nama is not None:
            diperbaiki.append(nama)
    if diperbaiki:
        print(f"diperbaiki via buffer(0): {', '.join(diperbaiki)}")

    # kenapa sort_keys + separators ringkas: output deterministik, idempotent
    teks_kandidat = json.dumps(data, ensure_ascii=False, sort_keys=True,
                              separators=(",", ":"))
    ukuran_sesudah = len(teks_kandidat.encode("utf-8"))

    # validasi sebelum tulis: jangan deploy file korup
    valid, pesan = validasi_hasil(teks_kandidat)
    persen_hemat = (ukuran_sebelum - ukuran_sesudah) / ukuran_sebelum * 100
    print(f"bytes sebelum: {ukuran_sebelum}")
    print(f"bytes sesudah: {ukuran_sesudah}")
    print(f"persen hemat: {persen_hemat:.2f}%")
    print(f"validasi: {len(data.get('features', []))} fitur, geometri valid={valid} ({pesan})")

    if not valid:
        print("keputusan: BUANG (validasi gagal, file semula dipertahankan)")
        return 1
    if (ukuran_sebelum - ukuran_sesudah) / ukuran_sebelum <= BATAS_HEMAT:
        print("keputusan: BUANG (hemat <= 5%, file semula dikembalikan)")
        return 0  # file tak pernah ditimpa, asal utuh

    jalur_geo.write_text(teks_kandidat, encoding="utf-8")
    data_gz = gzip.compress(teks_kandidat.encode("utf-8"), compresslevel=9, mtime=0)
    jalur_gz.write_bytes(data_gz)
    print(f"bytes .gz: {len(data_gz)}")

    try:
        import brotli

        data_br = brotli.compress(teks_kandidat.encode("utf-8"), quality=11)
        jalur_br.write_bytes(data_br)
        print(f"bytes .br: {len(data_br)}")
    except ImportError:
        print("bytes .br: SKIP (modul brotli tidak tersedia)")
        if jalur_br.exists():
            jalur_br.unlink()
            print(f"hapus .br basi: {jalur_br.name}")
    print("keputusan: SIMPAN (hemat > 5%)")
    return 0


if __name__ == "__main__":
    sys.exit(optimalkan_geojson())

