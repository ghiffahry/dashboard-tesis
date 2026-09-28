/**
 * sw.js - Service Worker. BUKAN modul ES (didaftar via navigator.serviceWorker).
 * Aset statis (CSS/JS/font): cache-first. Data (data/*.json, *.geojson,
 * *.gz, *.br): stale-while-revalidate, karena data bisa berubah antar build.
 * Gagal jaringan tanpa cache -> Response 503, bukan throw.
 * Nama cache menyertakan versi build; activate menghapus cache versi lama.
 */

const VERSI_BAWAAN = "site-224481bd0398";

/**
 * Aset inti: wajib tersedia saat install. Kegagalan addAll dicatat dan
 * menggagalkan install (jangan ditelan) agar halaman tak setengah termuat.
 */
const ASET_INTIS = [
  "aset/tokens.css",
  "aset/gaya.css",
  "aset/desain.css",
  "aset/polesan.css",
  "aset/format.js",
  "aset/umum.js",
  "aset/state.js",
  "aset/shell.js",
  "aset/cache-data.js",
  "aset/analisis-moran.js",
  "aset/analisis.js",
  "aset/peta.js",
];

/**
 * Font boleh gagal diam: halaman tetap tampil dengan font cadangan sistem.
 */
const ASET_FONT = [
  "aset/font/fraunces-variable.woff2",
  "aset/font/instrument-sans.woff2",
  "aset/font/ibm-plex-mono.woff2",
];

/**
 * Data per halaman (disesuaikan aset nyata tiap halaman). Dipakai untuk
 * precache opsional saat install; kegagalan dicatat, tidak menggagalkan.
 */
const ASET_DATA_PER_HALAMAN = {
  "index.html": ["data/seri-tahunan.json", "data/peringkat.json", "data/moran.json", "data/nilai-wilayah-tahunan.json"],
  "peta.html": [
    "data/sumatera.geojson.gz",
    "data/sumatera.geojson",
    "data/nilai-wilayah-tahunan.json",
    "data/moran.json",
    "data/indikator.json",
  ],
  "analisis.html": [
    "data/seri-tahunan.json",
    "data/sebaran.json",
    "data/peringkat.json",
    "data/moran.json",
    "data/indikator.json",
    "data/scatter-moran.json",
  ],
  "metode.html": ["data/indikator.json"],
};

const namaCacheAset = (v) => `eda-aset-${v}`;
const namaCacheData = (v) => `eda-data-${v}`;
let versiAktif = VERSI_BAWAAN;

async function bacaVersiUntukCache() {
  try {
    const res = await fetch("data/build-info.json", { cache: "no-store" });
    if (!res.ok) return VERSI_BAWAAN;
    const info = await res.json();
    return typeof info.versi === "string" && info.versi ? info.versi : VERSI_BAWAAN;
  } catch {
    return VERSI_BAWAAN;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    versiAktif = await bacaVersiUntukCache();
    const cache = await caches.open(namaCacheAset(versiAktif));
    try {
      await cache.addAll(ASET_INTIS);
    } catch (err) {
      // Aset inti gagal: cetak dan gagalkan install (jangan setengah termuat).
      console.error("sw.js: aset inti gagal di-cache", err);
      throw err;
    }
    // Font + data per halaman opsional: kegagalan cukup dicatat.
    await cache.addAll(ASET_FONT).catch((err) => console.warn("sw.js: font opsional absen", err));
    const dataInti = [...new Set(Object.values(ASET_DATA_PER_HALAMAN).flat())];
    await cache.addAll(dataInti).catch((err) => console.warn("sw.js: precache data gagal", err));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const daftar = await caches.keys();
    const berlaku = new Set([namaCacheAset(versiAktif), namaCacheData(versiAktif)]);
    await Promise.all(
      daftar.filter((n) => n.startsWith("eda-") && !berlaku.has(n)).map((n) => caches.delete(n)),
    );
    await self.clients.claim();
  })());
});

async function cacheFirst(request) {
  const cache = await caches.open(namaCacheAset(versiAktif));
  const cocok = await cache.match(request);
  if (cocok) return cocok;
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return new Response("Luring dan tak ada cache.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(namaCacheData(versiAktif));
  const cocok = await cache.match(request);
  const segar = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => cocok ?? new Response("Luring dan tak ada cache.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }));
  return cocok || segar;
}

/**
 * Pola data: JSON precompute + GeoJSON (+ varian kompresi br/gz).
 * @param {string} path pathname URL permintaan
 * @returns {boolean} true bila ditangani stale-while-revalidate
 */
function adalahData(path) {
  return path.includes("/data/") && (path.endsWith(".json") || path.endsWith(".geojson") || path.endsWith(".gz") || path.endsWith(".br"));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (adalahData(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request));
  } else if (/\.(css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
  }
});

