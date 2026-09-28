"""Sensitivitas Moran kemiskinan untuk tiga skema bobot spasial."""
import csv
import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
PERMUTATIONS = 999
SEED = 42
THRESHOLD_KM = 110.0
K_NEIGHBORS = 5
Y_KEY = "Miskin_(persen)"


def read_inputs():
    with (DATA / "sumatera.geojson").open(encoding="utf-8") as f:
        features = json.load(f)["features"]
    with (DATA / "tabel.csv").open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    names = [feature["properties"]["ADM2_EN"] for feature in features]
    if len(names) != len(set(names)):
        raise ValueError("Nama wilayah pada GeoJSON tidak unik.")
    by_year = {}
    for row in rows:
        by_year.setdefault(int(row["Tahun"]), {})[row["Kabupaten"]] = float(row[Y_KEY])
    for year, values in by_year.items():
        missing = sorted(set(names) - set(values))
        if missing:
            raise ValueError(f"Nilai kemiskinan {year} tidak lengkap: {missing[:5]}")
    return features, names, by_year


def polygon_points(geometry):
    coords = geometry["coordinates"]
    if geometry["type"] == "Polygon":
        return [p for ring in coords for p in ring]
    if geometry["type"] == "MultiPolygon":
        return [p for polygon in coords for ring in polygon for p in ring]
    raise ValueError(f"Geometri tidak didukung: {geometry['type']}")


def queen_neighbors(features):
    lookup = {}
    for i, feature in enumerate(features):
        for point in set((float(p[0]), float(p[1])) for p in polygon_points(feature["geometry"])):
            lookup.setdefault(point, []).append(i)
    neighbors = [set() for _ in features]
    for units in lookup.values():
        for i in units:
            neighbors[i].update(j for j in units if j != i)
    return neighbors


def haversine_km(a, b):
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * 6371.0088 * math.asin(min(1.0, math.sqrt(h)))


def coordinate_neighbors(features):
    coords = [(float(f["properties"]["latitude"]), float(f["properties"]["longitude"])) for f in features]
    distances = [[haversine_km(a, b) if i != j else 0.0 for j, b in enumerate(coords)] for i, a in enumerate(coords)]
    within = [set(j for j, distance in enumerate(row) if i != j and distance <= THRESHOLD_KM)
              for i, row in enumerate(distances)]
    knn = [set(sorted((j for j in range(len(row)) if j != i), key=lambda j: distances[i][j])[:K_NEIGHBORS])
           for i, row in enumerate(distances)]
    return within, knn


def moran_stat(z, neighbors):
    n = len(z)
    connected = sum(bool(row) for row in neighbors)
    if connected == 0 or sum(value * value for value in z) == 0:
        return None, [0.0] * n, 0
    lag = [sum(z[j] for j in row) / len(row) if row else 0.0 for row in neighbors]
    numerator = sum(z[i] * lag[i] for i in range(n))
    return (n / connected) * numerator / sum(value * value for value in z), lag, connected


def permutation_p(z, neighbors, observed, year):
    expected = -1.0 / (len(z) - 1)
    rng = random.Random(SEED)
    shuffled = list(z)
    extremes = 0
    for _ in range(PERMUTATIONS):
        rng.shuffle(shuffled)
        simulated, _, _ = moran_stat(shuffled, neighbors)
        if (simulated >= observed) if observed >= expected else (simulated <= observed):
            extremes += 1
    return (extremes + 1) / (PERMUTATIONS + 1)


def bh_qvalues(items):
    indexed = sorted(enumerate(items), key=lambda item: item[1])
    q = [1.0] * len(items)
    running = 1.0
    m = len(items)
    for rank in range(m, 0, -1):
        index, p = indexed[rank - 1]
        running = min(running, p * m / rank)
        q[index] = min(1.0, running)
    return q


def main():
    features, names, by_year = read_inputs()
    years = sorted(by_year)
    queen = queen_neighbors(features)
    within, knn = coordinate_neighbors(features)
    schemes = {"queen": queen, "jarak_110_km": within, "knn_5": knn}
    if len(names) != 154:
        raise ValueError(f"Jumlah wilayah berubah: {len(names)}, diharapkan 154.")
    existing = json.loads((DATA / "moran.json").read_text(encoding="utf-8"))
    queen_source = existing["moran_dan_lisa"][Y_KEY]
    output = {"metadata": {
        "variabel": Y_KEY, "jumlah_wilayah": len(names), "tahun": years,
        "jumlah_permutasi": PERMUTATIONS, "benih": SEED,
        "koreksi_p": "Benjamini-Hochberg atas 33 kombinasi skema dan tahun",
        "definisi": {
            "queen": "Poligon bertetangga jika berbagi setidaknya satu titik batas; bobot distandarkan per baris. Unit tanpa tetangga tetap bernilai nol pada lag.",
            "jarak_110_km": "Titik koordinat wilayah pada GeoJSON bertetangga jika jarak haversine <= 110 km; bobot distandarkan per baris.",
            "knn_5": "Setiap titik memilih 5 titik wilayah terdekat berdasarkan jarak haversine; relasi dapat berarah; bobot distandarkan per baris.",
        },
        "catatan": "p permutasi satu arah untuk autokorelasi positif dengan 999 permutasi dan koreksi tambah satu. q_BH dikoreksi lintas semua 33 kombinasi. Hubungan spasial peka terhadap definisi bobot.",
    }, "skema": {}}
    tests = []
    for scheme, neighbors in schemes.items():
        degrees = [len(row) for row in neighbors]
        scheme_data = {}
        for year in years:
            values = [by_year[year][name] for name in names]
            mean = sum(values) / len(values)
            sd = math.sqrt(sum((value - mean) ** 2 for value in values) / len(values))
            if sd == 0:
                raise ValueError(f"Varians nol untuk {year}.")
            z = [(value - mean) / sd for value in values]
            observed, lag, connected = moran_stat(z, neighbors)
            if observed is None:
                raise ValueError(f"Moran tidak terdefinisi untuk {scheme}, {year}.")
            if scheme == "queen":
                reference = queen_source[str(year)]
                if abs(observed - reference["moran_i"]) > 0.00011:
                    raise ValueError(f"Moran Queen tidak cocok {year}: {observed:.6f} vs {reference['moran_i']}.")
                p = reference["p_value"]
            else:
                p = permutation_p(z, neighbors, observed, year)
            tests.append({"key": (scheme, str(year)), "p": p})
            points = []
            for i, name in enumerate(names):
                x, y = z[i], lag[i]
                quadrant = ("H" if x >= 0 else "L") + ("H" if y >= 0 else "L") if neighbors[i] else "Tidak Terhubung"
                points.append({"wilayah": name, "provinsi": features[i]["properties"]["ADM1_EN"],
                               "x": round(x, 5), "lag": round(y, 5), "kuadran": quadrant})
            scheme_data[str(year)] = {
                "moran_i": round(observed, 6), "p_value": round(p, 4),
                "jumlah_permutasi": PERMUTATIONS, "jumlah_terhubung": connected,
                "jumlah_tanpa_tetangga": len(names) - connected,
                "rata_rata_tetangga": round(sum(degrees) / len(degrees), 2),
                "points": points,
            }
        output["skema"][scheme] = scheme_data
    qvalues = bh_qvalues([item["p"] for item in tests])
    for item, q in zip(tests, qvalues):
        scheme, year = item["key"]
        output["skema"][scheme][year]["q_bh"] = round(q, 4)
    target = DATA / "scatter-moran.json"
    target.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    for scheme in schemes:
        result = output["skema"][scheme]["2025"]
        print(f"{scheme}: I={result['moran_i']:.4f}, p={result['p_value']:.4f}, q_BH={result['q_bh']:.4f}, terhubung={result['jumlah_terhubung']}, titik={len(result['points'])}")
    print(f"Tersimpan {target} ({target.stat().st_size:,} byte).")


if __name__ == "__main__":
    main()



