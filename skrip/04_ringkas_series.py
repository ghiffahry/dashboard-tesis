"""04_ringkas_series.py: ringkasan deskriptif deret waktu EDA.

KONTEKS: kebutuhan halaman analisis (slope chart, boxplot, tabel peringkat,
transisi kuartil). Baca ../data/tabel.csv + ../data/indikator.json (relatif ke
lokasi skrip), tulis seri-tahunan.json, sebaran.json, peringkat.json ke
../data/ dengan indent 2. Lihat docs/arsip/prompting.md 6.4, 11.5-11.6, 21.1 dan
docs/spesifikasi-dashboard-eda.md bagian 7.
Idempotent: dump JSON deterministik; seri-tahunan.json pertahankan urutan
sisipan (Sumatera kunci pertama per peubah), lainnya sort_keys.
"""

import json
import logging
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("04_ringkas_series")

PEUBAH_KEMISKINAN = "Miskin_(persen)"
TAHUN_AWAL = 2015
TAHUN_AKHIR = 2025
JUMLAH_PERIODE = TAHUN_AKHIR - TAHUN_AWAL  # 10
TIDAK_TERDEFINISI = "TIDAK_TERDEFINISI"


def hitung_cagr(nilai_awal: float, nilai_akhir: float, jumlah_periode: int):
    """CAGR = (akhir/awal)^(1/periode) - 1; basis nol/negatif tak terdefinisi.

    Kenapa string bukan NaN/null: agar analisis.js tampilkan eksplisit di tabel,
    bukan sel kosong tanpa konteks (docs/arsip/prompting.md 11.5, 21.1, 29.4).
    """
    if nilai_awal <= 0 or jumlah_periode <= 0:
        if nilai_awal < 0:
            # Peubah kemiskinan tak seharusnya negatif: indikasi masalah data.
            log.warning("CAGR: nilai awal negatif %.6f, kembalikan %s.",
                        nilai_awal, TIDAK_TERDEFINISI)
        return TIDAK_TERDEFINISI
    if nilai_awal > 0 and nilai_akhir < 0:
        # Basis positif ke akhir negatif: akar bilangan negatif tak terdefinisi.
        log.warning("CAGR: akhir negatif %.6f dengan awal positif %.6f, kembalikan %s.",
                    nilai_akhir, nilai_awal, TIDAK_TERDEFINISI)
        return TIDAK_TERDEFINISI
    if nilai_akhir == 0:
        # Nol eksak: hasil -100% valid matematis tapi curiga data; tinjau manual.
        log.warning("CAGR: nilai akhir nol (awal %.6f), tinjau manual.", nilai_awal)
    return (nilai_akhir / nilai_awal) ** (1 / jumlah_periode) - 1


def hitung_perubahan_persen(nilai_awal: float, nilai_akhir: float):
    """Perubahan persen = (akhir-awal)/awal*100; pembagi nol tak terdefinisi."""
    if nilai_awal <= 0:
        return TIDAK_TERDEFINISI
    return (nilai_akhir - nilai_awal) / nilai_awal * 100


def hitung_volatilitas(deret_waktu):
    """Std sampel (ddof=1) dari selisih tahun-ke-tahun; 0.0 bila varians nol.

    Kenapa ddof=1: deret 11 titik dipandang sampel proses wilayah, konsisten
    dengan standar deviasi sampel pandas default.
    """
    import pandas as pd

    selisih = pd.Series(deret_waktu, dtype=float).diff().dropna()
    selisih = selisih.dropna()
    if len(selisih) < 2:
        return 0.0
    simpangan = float(selisih.std(ddof=1))
    if simpangan != simpangan:  # NaN hanya bila data tak cukup
        return 0.0
    return simpangan


def tentukan_kuartil(nilai_per_wilayah, tahun: int):
    """Kuartil 1-4 via qcut pada sebaran SATU tahun (batas 2015, 2025 terpisah).

    Kenapa terpisah: yang diukur perpindahan posisi relatif wilayah antar dua
    distribusi tahun, bukan pergeseran nilai absolut.
    """
    import pandas as pd

    try:
        hasil = pd.qcut(nilai_per_wilayah, q=4, labels=[1, 2, 3, 4])
    except ValueError:
        # Tepi: batas kuantil tak unik (banyak nilai identik). Paksa drop
        # duplikat agar tetap jalan; matriks 4x4 menampung sel kosong.
        log.warning("qcut tahun %d: batas tak unik, pakai duplicates='drop'.", tahun)
        hasil = pd.qcut(nilai_per_wilayah, q=4, labels=False, duplicates="drop") + 1
    return hasil


def tentukan_arah(kuartil_awal: int, kuartil_akhir: int) -> str:
    """Arah transisi kuartil: tetap bila sama, naik bila nomor naik."""
    if kuartil_akhir == kuartil_awal:
        return "tetap"
    return "naik" if kuartil_akhir > kuartil_awal else "turun"


def tulis_json_deterministik(obj, jalur: Path, sort_keys=True):
    """Tulis JSON indent 2, newline akhir (byte identik antar-run).

    sort_keys=False pertahankan urutan sisipan (Sumatera harus kunci pertama).
    """
    jalur.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=sort_keys) + "\n",
        encoding="utf-8",
    )


def baca_daftar_peubah_peta(jalur_peta_js: Path, daftar_valid: list) -> list:
    """Ambil daftar peubah peta dari aset/peta.js; fallback ke daftar_valid.

    Kenapa baca peta.js dulu: peta satu-satunya konsumen nilai per wilayah,
    jangan emit peubah tak dipakai. Ekstrak kunci pola Nama_(satuan) via regex,
    saring ke kolom tabel; bila kosong pakai semua peubah valid.
    """
    import re

    try:
        teks = jalur_peta_js.read_text(encoding="utf-8")
    except FileNotFoundError:
        log.warning("aset/peta.js tak ada: pakai semua %d peubah.", len(daftar_valid))
        return list(daftar_valid)
    # Kupas komentar agar contoh di JSDoc tak terbaca sebagai daftar pakai.
    teks_bersih = re.sub(r"/\*.*?\*/", " ", teks, flags=re.DOTALL)
    teks_bersih = re.sub(r"//.*", " ", teks_bersih)
    kandidat = sorted(set(re.findall(r"[A-Za-z0-9_.]+\([^)]+\)", teks_bersih)))
    cocok = sorted(k for k in kandidat if k in daftar_valid)
    if not cocok:
        log.warning("Tak ada kunci peubah eksplisit di aset/peta.js: pakai semua %d peubah.",
                    len(daftar_valid))
        return list(daftar_valid)
    log.info("Peubah peta dari aset/peta.js: %d (%s).", len(cocok), ", ".join(cocok))
    return cocok


def ringkas_series() -> int:
    import pandas as pd

    skrip_dir = Path(__file__).resolve().parent
    data_dir = skrip_dir.parent / "data"
    jalur_tabel = data_dir / "tabel.csv"
    jalur_indikator = data_dir / "indikator.json"
    if not jalur_tabel.exists():
        log.error("Tabel kanonis tak ada: %s (jalankan 01 dulu).", jalur_tabel)
        return 1
    if not jalur_indikator.exists():
        log.error("indikator.json tak ada: %s (jalankan 01 dulu).", jalur_indikator)
        return 1

    df = pd.read_csv(jalur_tabel)
    daftar_peubah = [d["kunci"] for d in json.loads(
        jalur_indikator.read_text(encoding="utf-8"))]
    daftar_peubah = sorted(p for p in daftar_peubah if p in df.columns)
    tahun_tersedia = sorted(int(t) for t in df["Tahun"].dropna().unique())
    daftar_provinsi = sorted(df["Provinsi"].dropna().unique().tolist())

    # Bagian A: mean per provinsi per tahun per peubah + mean Sumatera.
    # Sumatera = mean seluruh 154 kab/kota per tahun, bukan rata-rata 10 provinsi.
    seri_tahunan = {}
    for peubah in daftar_peubah:
        per_provinsi = {}
        for provinsi in daftar_provinsi:
            per_tahun = {}
            subset_prov = df[df["Provinsi"] == provinsi]
            for tahun in tahun_tersedia:
                nilai = subset_prov.loc[subset_prov["Tahun"] == tahun, peubah].dropna()
                per_tahun[str(tahun)] = float(nilai.mean()) if len(nilai) else None
            per_provinsi[provinsi] = per_tahun
        per_tahun_sumatera = {}
        for tahun in tahun_tersedia:
            nilai = df.loc[df["Tahun"] == tahun, peubah].dropna()
            rata = float(nilai.mean()) if len(nilai) else None
            if rata is not None and rata != rata:  # NaN bila semua kosong
                rata = None
            per_tahun_sumatera[str(tahun)] = rata
        seri_tahunan[peubah] = {"Sumatera": per_tahun_sumatera, **per_provinsi}
    tulis_json_deterministik(seri_tahunan, data_dir / "seri-tahunan.json", sort_keys=False)

    # Bagian B: sebaran lintas wilayah per tahun. Kuantil via pandas .quantile()
    # default interpolasi linear (tak diubah agar replika manual sama).
    sebaran = {}
    for peubah in daftar_peubah:
        per_tahun = {}
        for tahun in tahun_tersedia:
            nilai = df.loc[df["Tahun"] == tahun, peubah].dropna().astype(float)
            if len(nilai) == 0:
                per_tahun[str(tahun)] = {
                    "maks": None, "median": None, "min": None,
                    "n": 0, "q1": None, "q3": None,
                }
                continue
            per_tahun[str(tahun)] = {
                "min": float(nilai.min()),
                "q1": float(nilai.quantile(0.25)),
                "median": float(nilai.quantile(0.5)),
                "q3": float(nilai.quantile(0.75)),
                "maks": float(nilai.max()),
                "n": int(len(nilai)),
            }
        sebaran[peubah] = per_tahun
    tulis_json_deterministik(sebaran, data_dir / "sebaran.json")

    # Bagian C: peringkat + transisi kuartil khusus peubah kemiskinan.
    if PEUBAH_KEMISKINAN not in df.columns:
        log.error("Kolom %s tak ada di tabel.", PEUBAH_KEMISKINAN)
        return 1
    df_urut = df.sort_values(["Kabupaten", "Tahun"], kind="mergesort")
    daftar_wilayah = sorted(df["Kabupaten"].dropna().unique().tolist())
    nilai_2015 = df_urut[df_urut["Tahun"] == TAHUN_AWAL].set_index("Kabupaten")
    nilai_2025 = df_urut[df_urut["Tahun"] == TAHUN_AKHIR].set_index("Kabupaten")
    provinsi_wilayah = df.drop_duplicates("Kabupaten").set_index("Kabupaten")["Provinsi"]

    ada = [w for w in daftar_wilayah
           if w in nilai_2015.index and w in nilai_2025.index
           and pd.notna(nilai_2015.at[w, PEUBAH_KEMISKINAN])
           and pd.notna(nilai_2025.at[w, PEUBAH_KEMISKINAN])]

    baris_peringkat = []
    for wilayah in ada:
        awal = float(nilai_2015.at[wilayah, PEUBAH_KEMISKINAN])
        akhir = float(nilai_2025.at[wilayah, PEUBAH_KEMISKINAN])
        absolut = akhir - awal
        persen = hitung_perubahan_persen(awal, akhir)
        cagr = hitung_cagr(awal, akhir, JUMLAH_PERIODE)
        deret = df_urut[df_urut["Kabupaten"] == wilayah][PEUBAH_KEMISKINAN].tolist()
        baris_peringkat.append({
            "wilayah": wilayah,
            "provinsi": str(provinsi_wilayah.at[wilayah]),
            "nilai_2015": awal,
            "nilai_2025": akhir,
            "perubahan_absolut": round(absolut, 4),
            "perubahan_persen": round(persen, 4) if isinstance(persen, float) else persen,
            "cagr": round(cagr, 4) if isinstance(cagr, float) else cagr,
            "volatilitas": round(hitung_volatilitas(deret), 4),
        })
    # Urut menurun perubahan_absolut (slope chart), seri nama wilayah.
    baris_peringkat.sort(key=lambda b: (-b["perubahan_absolut"], b["wilayah"]))

    deret_2015 = pd.Series({w: float(nilai_2015.at[w, PEUBAH_KEMISKINAN]) for w in ada})
    deret_2025 = pd.Series({w: float(nilai_2025.at[w, PEUBAH_KEMISKINAN]) for w in ada})
    kuartil_2015 = tentukan_kuartil(deret_2015, TAHUN_AWAL).astype(int).to_dict()
    kuartil_2025 = tentukan_kuartil(deret_2025, TAHUN_AKHIR).astype(int).to_dict()

    transisi = {}
    matriks = [[0, 0, 0, 0] for _ in range(4)]
    for wilayah in ada:
        q_awal = int(kuartil_2015[wilayah])
        q_akhir = int(kuartil_2025[wilayah])
        transisi[wilayah] = {
            "kuartil_2015": q_awal,
            "kuartil_2025": q_akhir,
            "arah": tentukan_arah(q_awal, q_akhir),
        }
        matriks[q_awal - 1][q_akhir - 1] += 1

    peringkat = {
        PEUBAH_KEMISKINAN: baris_peringkat,
        "transisi_kuartil_2015_2025": transisi,
        "matriks_transisi_4x4": matriks,
    }
    tulis_json_deterministik(peringkat, data_dir / "peringkat.json")

    # Bagian D: nilai per wilayah per tahun khusus peubah peta.
    # Skema: {peubah: {tahun-string: {wilayah: nilai}}}.
    jalur_peta_js = skrip_dir.parent / "aset" / "peta.js"
    peubah_peta = baca_daftar_peubah_peta(jalur_peta_js, daftar_peubah)
    nilai_wilayah = {}
    for peubah in peubah_peta:
        per_tahun = {}
        for tahun in tahun_tersedia:
            potong = df.loc[df["Tahun"] == tahun, ["Kabupaten", peubah]]
            isi = {}
            for _, baris in potong.iterrows():
                wil = str(baris["Kabupaten"])
                val = baris[peubah]
                isi[wil] = None if pd.isna(val) else float(val)
            per_tahun[str(tahun)] = dict(sorted(isi.items()))
        nilai_wilayah[peubah] = per_tahun
    tulis_json_deterministik(nilai_wilayah, data_dir / "nilai-wilayah-tahunan.json")

    log.info("Selesai: %d peubah x %d provinsi x %d tahun; %d wilayah peringkat; %d peubah peta.",
             len(daftar_peubah), len(daftar_provinsi), len(tahun_tersedia),
             len(baris_peringkat), len(nilai_wilayah))
    return 0


if __name__ == "__main__":
    sys.exit(ringkas_series())

