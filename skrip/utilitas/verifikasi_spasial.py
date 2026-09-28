"""verifikasi_spasial.py: uji S3, S5, S6 docs/spesifikasi-dashboard-eda.md bagian 14.2.

S3: simetri matriks bobot Queen sebelum standarisasi baris (w_ij == w_ji),
    jumlah komponen terhubung, jumlah island.
S5: rentang Moran's I teoritis -1..1 (toleransi 0.001), cetak min dan max.
S6: hash moran.json tercatat di build-info.json cocok dengan hash file sekarang.

Exit 0 bila semua lolos, exit 1 bila ada gagal.
"""

import hashlib
import json
import sys
from pathlib import Path

LOKASI_SKRIP = Path(__file__).resolve().parent
DATA_DIR = LOKASI_SKRIP.parent.parent / "data"
JALUR_GEOJSON = DATA_DIR / "sumatera.geojson"
JALUR_MORAN = DATA_DIR / "moran.json"
JALUR_BUILD_INFO = DATA_DIR / "build-info.json"

gagal = []


def catat_gagal(kode, pesan):
    print(f"GAGAL [{kode}] {pesan}")
    gagal.append(f"{kode}: {pesan}")


def uji_s3():
    import geopandas as gpd
    from libpysal.weights import Queen

    gdf = gpd.read_file(JALUR_GEOJSON)
    queen = Queen.from_dataframe(gdf, use_index=False)

    from scipy import sparse

    w = queen.sparse
    selisih = (w - w.T)
    maks = abs(selisih).max() if selisih.nnz else 0.0
    simetris = maks < 1e-12
    print(f"S3 simetri bobot Queen sebelum standarisasi:")
    print(f"  |w_ij - w_ji|_max = {maks:.3e}")
    print(f"  simetris: {'YA' if simetris else 'TIDAK'}")
    if not simetris:
        catat_gagal("S3", f"bobot Queen tidak simetris: |w_ij - w_ji|_max = {maks}")

    n_comp, labels = sparse.csgraph.connected_components(w, directed=False)
    jumlah_island = len(queen.islands or [])
    print(f"  jumlah komponen terhubung: {n_comp}")
    print(f"  jumlah island: {jumlah_island}")
    if n_comp != 1:
        print(f"  CATATAN: {n_comp} komponen (island = {jumlah_island})")
    return True


def uji_s5():
    dokumen = json.loads(JALUR_MORAN.read_text(encoding="utf-8"))
    md = dokumen["moran_dan_lisa"]

    nilai = []
    for peubah in md:
        for tahun in md[peubah]:
            mi = md[peubah][tahun]["moran_i"]
            if mi is not None:
                nilai.append(mi)

    if not nilai:
        catat_gagal("S5", "tidak ada entri moran_i non-null")
        return

    toleransi = 0.001
    bawah, atas = -1 - toleransi, 1 + toleransi
    di_rentang = all(bawah <= v <= atas for v in nilai)

    print("S5 rentang Moran's I:")
    print(f"  jumlah entri: {len(nilai)}")
    print(f"  min: {min(nilai)}")
    print(f"  max: {max(nilai)}")
    print(f"  rentang teoritis -1..1 (tol {toleransi}): "
          f"{'OK' if di_rentang else 'DILUAR RENTANG'}")
    if not di_rentang:
        diluar = [v for v in nilai if not (bawah <= v <= atas)]
        catat_gagal("S5", f"{len(diluar)} nilai di luar rentang: {diluar[:5]}")


def uji_s6():
    build_info = json.loads(JALUR_BUILD_INFO.read_text(encoding="utf-8"))
    hash_tercatat = build_info["hash_aset"]["data/moran.json"]
    if hash_tercatat.startswith("sha256:"):
        hash_tercatat = hash_tercatat[len("sha256:"):]
    hash_sekarang = hashlib.sha256(JALUR_MORAN.read_bytes()).hexdigest()

    cocok = hash_tercatat == hash_sekarang
    print("S6 integritas hash moran.json:")
    print(f"  tercatat : {hash_tercatat}")
    print(f"  sekarang  : {hash_sekarang}")
    print(f"  cocok: {'YA' if cocok else 'TIDAK'}")
    if not cocok:
        catat_gagal("S6", "hash moran.json tidak cocok dengan build-info.json")


if __name__ == "__main__":
    uji_s3()
    uji_s5()
    uji_s6()
    print()
    if gagal:
        print(f"RESULT: GAGAL ({len(gagal)}): " + "; ".join(gagal))
        sys.exit(1)
    print("RESULT: SEMUA LOLOS (S3, S5, S6)")
    sys.exit(0)

