"""Ekspor jaringan tetangga untuk panel metode (Queen, jarak 110 km, KNN 5)."""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
GEO = json.loads((DATA / "sumatera.geojson").read_text(encoding="utf-8"))
features = GEO["features"]
names = [f["properties"]["ADM2_EN"] for f in features]
coords = [(float(f["properties"]["latitude"]), float(f["properties"]["longitude"])) for f in features]
if len(names) != 154 or len(set(names)) != len(names):
    raise SystemExit("Daftar wilayah harus berisi 154 nama unik.")

def rings(feature):
    geom = feature["geometry"]
    if geom["type"] == "Polygon":
        yield from geom["coordinates"]
    elif geom["type"] == "MultiPolygon":
        for polygon in geom["coordinates"]:
            yield from polygon

vertex_units = {}
for i, feature in enumerate(features):
    for ring in rings(feature):
        for lon, lat, *_ in ring:
            key = f"{lon:.7f},{lat:.7f}"
            vertex_units.setdefault(key, set()).add(i)
queen = [set() for _ in names]
for units in vertex_units.values():
    for i in units:
        queen[i].update(units - {i})

def haversine(a, b):
    lat1, lon1 = map(math.radians, a)
    lat2, lon2 = map(math.radians, b)
    dlat, dlon = lat2-lat1, lon2-lon1
    h = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    return 2 * 6371.0088 * math.asin(min(1.0, math.sqrt(h)))
dist = [[haversine(coords[i], coords[j]) if i != j else 0.0 for j in range(len(names))] for i in range(len(names))]
within = [{j for j, d in enumerate(row) if i != j and d <= 110} for i, row in enumerate(dist)]
knn = [set(sorted((j for j in range(len(names)) if j != i), key=lambda j: dist[i][j])[:5]) for i in range(len(names))]
methods = {"queen": queen, "jarak_110_km": within, "knn_5": knn}
labels = {
    "queen": "Queen: poligon berbagi setidaknya satu titik batas.",
    "jarak_110_km": "Jarak 110 km: titik koordinat berjarak haversine paling jauh 110 km.",
    "knn_5": "KNN 5: lima wilayah terdekat untuk setiap wilayah; relasi dapat berarah.",
}
out = {
    "metadata": {"jumlah_wilayah": len(names), "catatan": "Daftar ini menjelaskan jaringan, bukan hasil uji signifikansi.", "definisi": labels},
    "wilayah": names,
    "tetangga": {scheme: {names[i]: [names[j] for j in sorted(row)] for i, row in enumerate(rows)} for scheme, rows in methods.items()},
}
target = DATA / "tetangga.json"
target.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
reference = json.loads((DATA / "scatter-moran.json").read_text(encoding="utf-8"))
for scheme, rows in methods.items():
    degrees = [len(row) for row in rows]
    mean_degree = sum(degrees) / len(degrees)
    expected = reference["skema"][scheme]["2025"]["rata_rata_tetangga"]
    if abs(mean_degree - expected) >= 0.02:
        raise SystemExit(f"Rata-rata derajat {scheme} berbeda dari analisis: {mean_degree:.2f} != {expected:.2f}")
    if scheme == "queen" and sum(n == 0 for n in degrees) != reference["skema"][scheme]["2025"]["jumlah_tanpa_tetangga"]:
        raise SystemExit("Jumlah wilayah tanpa tetangga Queen tidak cocok dengan analisis.")
    print(f"{scheme}: tanpa tetangga={sum(n == 0 for n in degrees)}, rerata={mean_degree:.2f} (cocok dengan analisis)")
print(f"Tersimpan {target} ({target.stat().st_size:,} byte)")

