"""01_siapkan_data.py: validasi dan kanonisasi data tabular EDA.

KONTEKS: sumber tunggal Data/data_tesis_2015-2025.csv, 1694 baris, 21 kolom,
154 kabupaten/kota, 2015-2025, skala proporsi desimal. File legacy persen
(data_raw_baru_format.csv) TIDAK BOLEH dimuat. Lihat docs/arsip/prompting.md 6.1.
Idempotent: dua run berurutan hasilkan byte identik.
"""
import json
import logging
import re
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("01_siapkan_data")

KOLOM_WAJIB = [
    "Provinsi", "Kabupaten", "Tahun",
    "Miskin_(persen)", "IPM.Indeks_(indeks)", "Laju.PE.ADHK_(persen)",
    "TPT_(persen)", "Gini.indeks_(indeks)", "RLS.Tahun_(tahun)",
    "PAD.JtTh_(juta.rupiah)", "PDRB.Kapita_(juta.rupiah)",
    "Kepadatan.Pendudukan_(jiwa.per.km2)", "Sanitasi.Layak_(persen)",
    "Akses.Air.Bersih_(persen)", "Pendapatan.Pertanian_(Juta)",
    "Pendapatan.Industri_(Juta)", "Pendapatan.Jasa_(Juta)",
    "IDG_(indeks)", "TPAK_(persen)", "Prevalensi_(persen)",
    "Rasio.Puskesmas.per.10rb.Penduduk",
]
KOLOM_CEK_SKALA = ["Miskin_(persen)", "TPT_(persen)", "Sanitasi.Layak_(persen)"]
POLA_SATUAN = re.compile(r"^(?P<label>.+?)_\((?P<satuan>[^)]+)\)$")


def cari_repo_root(mulai: Path) -> Path:
    """Naik dari lokasi skrip sampai temukan penanda repo (Data/data_tesis_2015-2025.csv)."""
    for p in [mulai.resolve(), *mulai.resolve().parents]:
        if (p / "Data" / "data_tesis_2015-2025.csv").exists():
            return p
    raise FileNotFoundError("Repo root tidak ketemu (cari Data/data_tesis_2015-2025.csv).")


def ekstrak_label_dari_nama_kolom(nama: str) -> str:
    """Ambil label tampil dari format Nama_(satuan); tanpa kurung jadi nama utuh."""
    m = POLA_SATUAN.match(nama)
    inti = m.group("label") if m else nama
    return inti.replace(".", " ").replace("_", " ").strip()


def ekstrak_satuan_dari_nama_kolom(nama: str) -> str:
    """Ambil satuan dari format Nama_(satuan); tanpa kurung jadi string kosong."""
    m = POLA_SATUAN.match(nama)
    return m.group("satuan").strip() if m else ""


def siapkan_data() -> int:
    import pandas as pd

    pin_dir = Path(__file__).resolve().parent.parent
    sumber_lokal = pin_dir / "data" / "data_tesis_2015-2025.csv"
    if sumber_lokal.exists():
        sumber = sumber_lokal
    else:
        try:
            repo = cari_repo_root(Path(__file__).resolve().parent)
        except FileNotFoundError as e:
            log.error("Sumber data tidak ketemu: %s", e)
            return 1
        sumber = repo / "Data" / "data_tesis_2015-2025.csv"
    data_dir = pin_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(sumber)
    if df.empty:
        log.error("File sumber kosong: %s", sumber)
        return 1

    hilang = [k for k in KOLOM_WAJIB if k not in df.columns]
    if hilang:
        log.error("Kolom wajib hilang: %s", ", ".join(hilang))
        return 1
    tambahan = [c for c in df.columns if c not in KOLOM_WAJIB]
    if tambahan:
        log.warning("Kolom tambahan diabaikan: %s", ", ".join(tambahan))
    df = df[KOLOM_WAJIB]

    if len(df) != 1694:
        log.warning("Baseline baris berubah: dapat %d, acuan 1694.", len(df))
    if df["Kabupaten"].nunique() != 154:
        log.warning("Baseline wilayah berubah: dapat %d, acuan 154.", df["Kabupaten"].nunique())
    if (df["Tahun"].min(), df["Tahun"].max()) != (2015, 2025):
        log.warning("Baseline tahun berubah: dapat %s-%s, acuan 2015-2025.",
                    df["Tahun"].min(), df["Tahun"].max())

    for kolom in KOLOM_CEK_SKALA:
        maks = float(df[kolom].max())
        if maks > 1.5:
            log.error("Skala %s maks %.4f > 1.5: kemungkinan file salah "
                      "(data_raw_baru_format.csv berskala persen).", kolom, maks)
            return 1

    if df.duplicated(subset=["Kabupaten", "Tahun"]).any():
        log.error("Duplikat pada kombinasi (Kabupaten, Tahun) ditemukan.")
        return 1

    nulls = df.isna().sum()
    for kolom, n in nulls.items():
        if n:
            log.warning("Nilai hilang %s: %d baris.", kolom, int(n))

    kanonis = df.sort_values(["Provinsi", "Kabupaten", "Tahun"],
                             kind="mergesort").reset_index(drop=True)
    kanonis.to_csv(data_dir / "tabel.csv", index=False, encoding="utf-8", lineterminator="\n")

    indikator = []
    for kolom in KOLOM_WAJIB:
        seri = kanonis[kolom]
        if kolom in ("Provinsi", "Kabupaten", "Tahun"):
            continue
        v = seri.dropna().astype(float)
        indikator.append({
            "kunci": kolom,
            "label": ekstrak_label_dari_nama_kolom(kolom),
            "satuan": ekstrak_satuan_dari_nama_kolom(kolom),
            "min": float(v.min()) if len(v) else None,
            "maks": float(v.max()) if len(v) else None,
            "mean": float(v.mean()) if len(v) else None,
        })
    indikator.sort(key=lambda d: d["kunci"])
    (data_dir / "indikator.json").write_text(
        json.dumps(indikator, ensure_ascii=False, indent=2, sort_keys=False) + "\n",
        encoding="utf-8")
    log.info("Tulis tabel.csv (%d baris) dan indikator.json (%d peubah).",
             len(kanonis), len(indikator))
    return 0


if __name__ == "__main__":
    sys.exit(siapkan_data())

