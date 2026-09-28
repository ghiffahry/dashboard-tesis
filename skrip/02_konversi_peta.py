"""02_konversi_peta.py: SHP Sumatera ke GeoJSON ringan plus validasi join.

KONTEKS: sumatera.shp 11.4MB 154 fitur EPSG:4326 kolom ADM2_EN/ADM1_EN.
Simplify 0.008 preserve_topology, validasi is_valid sebelum/sesudah,
tulis validasi-join.json (jumlah_cocok, hanya_di_tabel, hanya_di_spasial).
BERHENTI logis: mismatch dilaporkan eksplisit, orkestrator yang putuskan
lanjut ke 03 atau tidak. Lihat docs/arsip/prompting.md 6.2.
"""
import json
import logging
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("02_konversi_peta")

TOLERANSI = 0.008


def cari_repo_root(mulai: Path) -> Path:
    for p in [mulai.resolve(), *mulai.resolve().parents]:
        if ((p / "Data" / "data_tesis_2015-2025.csv").exists()
                and (p / "PetaIndo" / "Peta Sumatera" / "sumatera.shp").exists()):
            return p
    raise FileNotFoundError("Repo root tidak ketemu (cari Data + PetaIndo).")


def konversi_peta() -> int:
    import geopandas as gpd
    import pandas as pd

    pin_dir = Path(__file__).resolve().parent.parent
    shp_lokal = pin_dir / "data" / "sumber-spasial" / "sumatera.shp"
    if shp_lokal.exists():
        shp = shp_lokal
    else:
        repo = cari_repo_root(Path(__file__).resolve().parent)
        shp = repo / "PetaIndo" / "Peta Sumatera" / "sumatera.shp"
    data_dir = pin_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    gdf = gpd.read_file(shp)
    if gdf.crs is None or gdf.crs.to_epsg() != 4326:
        log.warning("CRS bukan EPSG:4326 (%s), reproject.", gdf.crs)
        gdf = gdf.to_crs(epsg=4326)
    gdf = gdf[["ADM2_EN", "ADM1_EN", "longitude", "latitude", "geometry"]].copy()

    if len(gdf) != 154:
        log.warning("Baseline fitur berubah: dapat %d, acuan 154.", len(gdf))

    tabel_path = data_dir / "tabel.csv"
    if not tabel_path.exists():
        log.error("Tabel kanonis tak ada: %s (jalankan 01_siapkan_data.py dulu, urutan pipeline wajib).",
                  tabel_path)
        return 1
    tabel = pd.read_csv(tabel_path)
    set_tabel = set(tabel["Kabupaten"].unique())
    set_spasial = set(gdf["ADM2_EN"].unique())
    hasil_join = {
        "jumlah_cocok": len(set_tabel & set_spasial),
        "hanya_di_tabel": sorted(set_tabel - set_spasial),
        "hanya_di_spasial": sorted(set_spasial - set_tabel),
    }
    (data_dir / "validasi-join.json").write_text(
        json.dumps(hasil_join, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if hasil_join["hanya_di_tabel"] or hasil_join["hanya_di_spasial"]:
        log.warning("Mismatch %d vs %d: lihat validasi-join.json. "
                    "JANGAN lanjut ke 03 sebelum ditinjau manusia.",
                    len(hasil_join["hanya_di_tabel"]), len(hasil_join["hanya_di_spasial"]))
    else:
        log.info("Join bersih: %d cocok.", hasil_join["jumlah_cocok"])

    sebelum = int((~gdf.geometry.is_valid).sum())
    if sebelum:
        log.warning("%d geometri invalid SEBELUM simplifikasi.", sebelum)
    ukuran_sebelum = sum(f.stat().st_size for f in
                         shp.parent.glob("sumatera.*") if f.is_file())
    gdf["geometry"] = gdf.geometry.simplify(TOLERANSI, preserve_topology=True)
    rusak = gdf[~gdf.geometry.is_valid]["ADM2_EN"].tolist()
    if rusak:
        log.warning("Perbaiki buffer(0): %s", ", ".join(rusak))
        gdf["geometry"] = gdf.geometry.buffer(0)
        rusak = gdf[~gdf.geometry.is_valid]["ADM2_EN"].tolist()
    if rusak:
        log.error("Invalid SETELAH perbaikan: %s", ", ".join(rusak))
        return 1

    keluar = data_dir / "sumatera.geojson"
    gdf.to_file(keluar, driver="GeoJSON")
    log.info("Tulis %s (%d fitur, %d -> %d bytes SHP dir).",
             keluar.name, len(gdf), ukuran_sebelum, keluar.stat().st_size)
    return 0


if __name__ == "__main__":
    sys.exit(konversi_peta())

