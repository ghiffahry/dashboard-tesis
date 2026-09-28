"""03_hitung_spasial.py: Moran global, LISA, dan AR1 per wilayah (precompute).

KONTEKS: statistik spasial dihitung SEKALI di build time, tulis moran.json
statis. Bobot Queen via libpysal (bukan manual), row-standardized, karena
formula Moran standar asumsi tiap baris bobot berjumlah 1. p-value Moran via
permutasi 999 (n=154 terlalu kecil andalkan normalitas asimtotik).
LISA per wilayah (154 uji) dikoreksi Benjamini-Hochberg FDR alpha 0.05.
Lihat docs/arsip/prompting.md 6.3, 11.1-11.4, 21.2, 29.5 dan spesifikasi 7.3, 12.

Dependensi: pip install libpysal esda bila belum ada, pakai
  py -3 -m pip install libpysal esda
Idempotent: seed tetap (42) dan kunci JSON terurut, run ulang hasil identik.
"""

import json
import logging
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("03_hitung_spasial")

# Relatif ke lokasi skrip: skrip/../data (tanpa hardcode absolut).
LOKASI_SKRIP = Path(__file__).resolve().parent
DATA_DIR = LOKASI_SKRIP.parent / "data"
JALUR_TABEL = DATA_DIR / "tabel.csv"
JALUR_GEOJSON = DATA_DIR / "sumatera.geojson"
JALUR_KELUARAN = DATA_DIR / "moran.json"

PEUBAH_DIANALISIS = [
    "Miskin_(persen)",
    "IPM.Indeks_(indeks)",
    "Gini.indeks_(indeks)",
    "TPT_(persen)",
]
JUMLAH_PERMUTASI = 999
BENIH_ACAK = 42
ALPHA_FDR = 0.05
STATUS_VARIANS_NOL = "TIDAK_TERDEFINISI_VARIANS_NOL"


def bangun_bobot_queen(gdf):
    """Bangun bobot Queen contiguity dari GeoDataFrame, row-standardized.

    Kenapa libpysal: deteksi persentuhan poligon sudah teruji, hindari bug
    subtil implementasi manual. Standarisasi baris wajib sebelum Moran.
    """
    from libpysal.weights import Queen

    bobot = Queen.from_dataframe(gdf, use_index=False)
    bobot.transform = "r"  # standarisasi baris: tiap baris berjumlah 1
    return bobot


def koreksi_benjamini_hochberg(daftar_p, alpha=ALPHA_FDR):
    """Koreksi FDR manual atas n p-value; kembalikan list boolean signifikan.

    Kenapa manual: tanpa numpy/statsmodels tambahan, logika BH hanya sortir
    dan bandingkan p_(k) <= (k/n)*alpha (lihat spesifikasi 12.3).
    """
    n = len(daftar_p)
    urutan = sorted(range(n), key=lambda i: daftar_p[i])
    ambang_lolos = None
    for peringkat, idx in enumerate(urutan, start=1):
        if daftar_p[idx] <= (peringkat / n) * alpha:
            ambang_lolos = daftar_p[idx]
    hasil = [False] * n
    if ambang_lolos is not None:
        for i, p in enumerate(daftar_p):
            if p <= ambang_lolos:
                hasil[i] = True
    return hasil


def klasifikasi_kuadran(deviasi, lag_spasial, terhubung):
    """Klasifikasi kuadran LISA dari tanda deviasi dan lag spasial.

    Unit tanpa tetangga (pulau) tidak punya lag bermakna: kembalikan
    "Tidak Terhubung", jangan 0 yang bisa dibaca sebagai Low-Low lemah.
    """
    if not terhubung:
        return "Tidak Terhubung"
    sisi_diri = "H" if deviasi >= 0 else "L"
    sisi_tetangga = "H" if lag_spasial >= 0 else "L"
    return sisi_diri + sisi_tetangga


def hitung_moran_dan_lisa(vektor_nilai, bobot, pulau):
    """Hitung Moran global + LISA lokal satu tahun-peubah via esda.

    Moran global pakai np.random.seed karena esda.Moran versi ini tidak
    terima argumen seed (permutasi lewat RNG global numpy).
    """
    import numpy as np
    from esda import Moran, Moran_Local

    np.random.seed(BENIH_ACAK)  # deterministik untuk esda.Moran
    moran = Moran(
        vektor_nilai, bobot, transformation="r", permutations=JUMLAH_PERMUTASI
    )
    lisa = Moran_Local(
        vektor_nilai,
        bobot,
        transformation="r",
        permutations=JUMLAH_PERMUTASI,
        seed=BENIH_ACAK,
        keep_simulations=False,  # p_sim tetap dihitung; matriks simulasi dan z_sim tidak dipakai.
    )
    rerata = float(np.mean(vektor_nilai))
    deviasi = vektor_nilai - rerata
    lag_spasial = np.asarray(bobot.sparse @ np.asarray(deviasi)).ravel()
    signifikan_bh = koreksi_benjamini_hochberg(list(lisa.p_sim))
    return moran, lisa, deviasi, lag_spasial, signifikan_bh


def hitung_koefisien_ar1(deret_waktu):
    """Koefisien AR1 OLS tanpa intercept pada deret terpusat.

    Model x_t = phi * x_{t-1} dengan deret sudah dikurangi rerata, jadi
    phi = sum(a*b)/sum(a^2) atas 10 pasang. Varians nol -> status eksplisit,
    bukan angka meledak diam-diam (lihat docs/arsip/prompting.md 11.4).
    """
    import numpy as np

    deret = np.asarray(deret_waktu, dtype=float)
    deret = deret[~np.isnan(deret)]
    n_pasang = len(deret) - 1
    if n_pasang < 2:
        return None, n_pasang, STATUS_VARIANS_NOL
    terpusat = deret - float(np.mean(deret))
    lampau = terpusat[:-1]
    kini = terpusat[1:]
    penyebut = float(np.sum(lampau ** 2))
    if penyebut == 0:
        return None, n_pasang, STATUS_VARIANS_NOL
    koefisien = float(np.sum(lampau * kini) / penyebut)
    return round(koefisien, 4), n_pasang, "OK"


def hitung_spasial() -> int:
    import geopandas as gpd
    import numpy as np
    import pandas as pd

    df = pd.read_csv(JALUR_TABEL)
    gdf = gpd.read_file(JALUR_GEOJSON).reset_index(drop=True)

    # Urutan ADM2_EN GeoJSON jadi acuan tunggal korespondensi indeks.
    urutan_wilayah = list(gdf["ADM2_EN"])
    assert len(urutan_wilayah) == len(set(urutan_wilayah)), (
        "ADM2_EN tidak unik di GeoJSON"
    )

    bobot = bangun_bobot_queen(gdf)
    assert bobot.n == len(urutan_wilayah), "ukuran bobot != jumlah wilayah"
    pulau = set(bobot.islands or [])
    if pulau:
        log.warning(
            "Unit tanpa tetangga (%d): %s. LISA-nya 'Tidak Terhubung'.",
            len(pulau),
            ", ".join(urutan_wilayah[i] for i in sorted(pulau)),
        )

    tahun_dihitung = sorted(int(t) for t in df["Tahun"].unique())
    moran_dan_lisa = {}
    for peubah in PEUBAH_DIANALISIS:
        moran_dan_lisa[peubah] = {}
        for tahun in tahun_dihitung:
            # Reindex tabular mengikuti urutan geometri: bug senyap paling
            # umum bila vektor nilai dan baris bobot tidak sinkron (21.2).
            subset = df[df["Tahun"] == tahun].set_index("Kabupaten")
            subset = subset.reindex(urutan_wilayah)
            assert list(subset.index) == urutan_wilayah, (
                f"reindex gagal tahun {tahun}: urutan tidak cocok"
            )
            if subset[peubah].isna().any():
                hilang = subset[subset[peubah].isna()].index.tolist()
                log.warning("DATA_HILANG %s %d: %d wilayah tanpa nilai; tulis entri null.",
                            peubah, tahun, len(hilang))
                moran_dan_lisa[peubah][str(tahun)] = {
                    "moran_i": None,
                    "p_value": None,
                    "jumlah_permutasi": JUMLAH_PERMUTASI,
                    "signifikan": False,
                    "lisa_per_wilayah": {},
                    "alasan": "DATA_HILANG",
                }
                continue
            vektor_nilai = subset[peubah].to_numpy(dtype=float)

            moran, lisa, deviasi, lag, signifikan_bh = hitung_moran_dan_lisa(
                vektor_nilai, bobot, pulau
            )
            p_global = round(float(moran.p_sim), 4)
            lisa_per_wilayah = {}
            for i, wilayah in enumerate(urutan_wilayah):
                terhubung = i not in pulau
                lisa_per_wilayah[wilayah] = {
                    "nilai": round(float(lisa.Is[i]), 4),
                    "kuadran": klasifikasi_kuadran(
                        float(deviasi[i]), float(lag[i]), terhubung
                    ),
                    "signifikan": (
                        bool(signifikan_bh[i]) if terhubung else False
                    ),
                }
            moran_dan_lisa[peubah][str(tahun)] = {
                "moran_i": round(float(moran.I), 4),
                "p_value": p_global,
                "jumlah_permutasi": JUMLAH_PERMUTASI,
                "signifikan": bool(p_global < 0.05),
                "lisa_per_wilayah": lisa_per_wilayah,
            }
        log.info("Selesai %s (%d tahun).", peubah, len(tahun_dihitung))

    # AR1 kemiskinan per wilayah: 11 titik -> 10 pasang.
    ar1_per_wilayah = {}
    for wilayah in sorted(df["Kabupaten"].unique()):
        deret = (
            df[df["Kabupaten"] == wilayah]
            .sort_values("Tahun", kind="mergesort")["Miskin_(persen)"]
            .to_numpy(dtype=float)
        )
        koefisien, n_pasang, status = hitung_koefisien_ar1(deret)
        ar1_per_wilayah[wilayah] = {
            "koefisien": koefisien,
            "n_titik_waktu": int(n_pasang),
            "status": status,
        }

    keluaran = {
        "moran_dan_lisa": moran_dan_lisa,
        "ar1_per_wilayah": ar1_per_wilayah,
        "metadata": {
            "skema_bobot": "queen_contiguity_row_standardized",
            "jumlah_wilayah": len(urutan_wilayah),
            "tahun_dihitung": tahun_dihitung,
            "permutasi": JUMLAH_PERMUTASI,
            "koreksi_lisa": "Benjamini-Hochberg FDR alpha 0.05 pada p_sim satu arah",
            "signifikansi_global": "Moran global: p_sim satu arah (esda) tanpa koreksi lintas tahun atau peubah; LISA memakai BH-FDR per tahun dan peubah",
            "spesifikasi_ar1": "OLS tanpa intercept pada deret terpusat",
        },
    }
    # sort_keys + indent tetap: kunci terurut deterministik, idempotent.
    JALUR_KELUARAN.write_text(
        json.dumps(keluaran, ensure_ascii=False, indent=2, sort_keys=True)
        + "\n",
        encoding="utf-8",
    )
    log.info(
        "Tulis %s (%d peubah x %d tahun, %d AR1).",
        JALUR_KELUARAN.name,
        len(PEUBAH_DIANALISIS),
        len(tahun_dihitung),
        len(ar1_per_wilayah),
    )
    return 0


if __name__ == "__main__":
    sys.exit(hitung_spasial())





