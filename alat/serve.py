"""alat/serve.py: server dev stdlib peniru header GitHub Pages.

Kenapa stdlib saja: cukup uji cache lokal, tanpa dependensi baru.
Kenapa header dibedakan: html/json no-cache (sering berubah antar build),
css/js/font/geojson/gz max-age=600 (tirukan Pages yang tak bisa dikustom penuh, lihat spesifikasi 9.3).
Kenapa root = folder pin: sajikan index.html + data/ + aset/ apa adanya; source alat/ tak disalin ke data/aset.
"""
import argparse
import mimetypes
from datetime import datetime, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

# Root pin = induk dari alat/ (file ini di alat/serve.py).
PIN_DIR = Path(__file__).resolve().parent.parent

# Ekstensi yang aman di-cache 600 detik (Pages observasi max-age=600).
CACHE_LAMA = {".css", ".js", ".woff", ".woff2", ".ttf", ".otf", ".geojson", ".gz", ".br"}
# Ekstensi yang selalu segar (data hasil build + markup).
NO_CACHE = {".html", ".htm", ".json", ".js"}

# Kenapa daftarkan manual: mimetypes Windows kadang tak kenal geojson/br.
mimetypes.add_type("application/geo+json", ".geojson")
mimetypes.add_type("application/gzip", ".gz")
mimetypes.add_type("application/brotli", ".br")
mimetypes.add_type("font/woff2", ".woff2")


class HandlerHalaman(SimpleHTTPRequestHandler):
    """Handler file statis + Cache-Control ala Pages + log tiap request."""

    def end_headers(self):
        # Tentukan Cache-Control dari ekstensi path (abaikan query string).
        nama = self.path.split("?", 1)[0].lower()
        # .geojson.gz punya dua sufiks: prioritaskan gz bila di ujung.
        if nama.endswith(".geojson.gz") or nama.endswith(".geojson.br"):
            self.send_header("Cache-Control", "public, max-age=600")
        else:
            titik = nama.rfind(".")
            ekst = nama[titik:] if titik != -1 else ""
            if ekst in NO_CACHE or ekst == "" or nama.endswith("/"):
                # Kenapa no-cache bukan no-store: izinkan revalidasi cepat, cegah basi (spesifikasi 10.7).
                self.send_header("Cache-Control", "no-cache")
            elif ekst in CACHE_LAMA:
                self.send_header("Cache-Control", "public, max-age=600")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Log tiap request ke stdout dengan stempel UTC (ganti log bawaan ke stderr).
        stempel = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        print(f"[{stempel}] {self.address_string()} {fmt % args}", flush=True)


def jalankan_server(port: int):
    handler = partial(HandlerHalaman, directory=str(PIN_DIR))
    alamat = ("127.0.0.1", port)
    with ThreadingHTTPServer(alamat, handler) as httpd:
        print(f"sajikan {PIN_DIR} di http://localhost:{port}/ (Ctrl+C hentikan)", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass  # kenapa diam: hentian normal via Ctrl+C bukan error


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Server dev dashboard EDA (stdlib saja).")
    parser.add_argument("--port", type=int, default=8000, help="port localhost (bawaan 8000)")
    args = parser.parse_args()
    jalankan_server(args.port)
