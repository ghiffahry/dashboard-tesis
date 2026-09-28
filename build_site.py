"""Stage the GitHub Pages artifact; site URLs are repository-relative."""
from pathlib import Path
import argparse, shutil, hashlib, json, re
from datetime import datetime, timezone
ROOT = Path(__file__).resolve().parent
PAGES = ("index.html", "peta.html", "analisis.html", "metode.html", "sw.js")
DATA = ("build-info.json", "indikator.json", "moran.json", "nilai-wilayah-tahunan.json",
        "peringkat.json", "sebaran.json", "seri-tahunan.json", "sumatera.geojson", "sumatera.geojson.gz", "scatter-moran.json")
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="_site")
    out = (ROOT / parser.parse_args().output).resolve()
    if out == ROOT or ROOT not in out.parents:
        raise SystemExit("Output harus berupa subfolder proyek.")
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True)
    for name in PAGES:
        source = ROOT / name
        if not source.is_file(): raise SystemExit(f"Halaman wajib tidak ada: {name}")
        shutil.copy2(source, out / name)
    shutil.copytree(ROOT / "aset", out / "aset")
    (out / "data").mkdir()
    for name in DATA:
        source = ROOT / "data" / name
        if not source.is_file(): raise SystemExit(f"Data runtime wajib tidak ada: data/{name}")
        shutil.copy2(source, out / "data" / name)
    (out / ".nojekyll").write_text("", encoding="utf-8")
    for html in out.glob("*.html"):
        body = html.read_text(encoding="utf-8")
        for ref in ("aset/tokens.css", "aset/gaya.css", "aset/desain.css", "aset/polesan.css"):
            if ref not in body: raise SystemExit(f"Referensi aset hilang: {html.name}: {ref}")
    digest = hashlib.sha256()
    runtime = [p for p in out.rglob("*") if p.is_file() and p.name not in (".nojekyll", "build-info.json")]
    for path in sorted(runtime):
        digest.update(path.relative_to(out).as_posix().encode("utf-8"))
        runtime_bytes = path.read_bytes()
        if path.name == "sw.js":
            runtime_bytes = re.sub(rb'const VERSI_BAWAAN = "[^"]+";', b'const VERSI_BAWAAN = "dev";', runtime_bytes)
        digest.update(runtime_bytes)
    info_path = out / "data" / "build-info.json"
    info = json.loads(info_path.read_text(encoding="utf-8"))
    info["versi"] = "site-" + digest.hexdigest()[:12]
    info["tanggal_build"] = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    info_path.write_text(json.dumps(info, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    versi_sw = info["versi"]
    deklarasi = f'const VERSI_BAWAAN = "{versi_sw}";'
    for sw_path in (ROOT / "sw.js", out / "sw.js"):
        sw_text = sw_path.read_text(encoding="utf-8")
        sw_text = re.sub(r'const VERSI_BAWAAN = "[^"]+";', deklarasi, sw_text)
        sw_path.write_text(sw_text, encoding="utf-8")
    print(f"Artifact siap: {out} ({sum(1 for x in out.rglob('*') if x.is_file())} files, {info['versi']})")
if __name__ == "__main__": main()

