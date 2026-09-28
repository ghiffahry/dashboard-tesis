/**
 * cache-data.js - cache JSON precompute di memori sesi saja.
 * Sengaja TANPA localStorage: data precompute statis per build, cache hidup
 * selama halaman terbuka agar navigasi antar-bagian tidak fetch ulang.
 */

const cacheMemori = new Map();
const sedangDiambil = new Map();

/**
 * Ambil JSON lewat fetch dengan cache memori (deduplikasi request sejajar).
 * @param {string} tautan URL JSON relatif/absolut
 * @param {RequestInit} [opsiFetch] opsi fetch lanjutan
 * @returns {Promise<any>} JSON terurai
 */
export async function ambilJson(tautan, opsiFetch) {
  if (cacheMemori.has(tautan)) return cacheMemori.get(tautan);
  if (sedangDiambil.has(tautan)) return sedangDiambil.get(tautan);
  const janji = fetch(tautan, opsiFetch).then((res) => {
    if (!res.ok) throw new Error(`gagal ambil ${tautan}: HTTP ${res.status}`);
    return res.json();
  }).then((data) => {
    cacheMemori.set(tautan, data);
    sedangDiambil.delete(tautan);
    return data;
  }).catch((err) => {
    sedangDiambil.delete(tautan);
    throw err;
  });
  sedangDiambil.set(tautan, janji);
  return janji;
}

/**
 * Cek apakah URL sudah ada di cache memori.
 * @param {string} tautan URL JSON
 * @returns {boolean} true bila tersedia tanpa fetch
 */
export function adaDiCache(tautan) {
  return cacheMemori.has(tautan);
}

/**
 * Hapus satu entri atau seluruh cache memori.
 * @param {string} [tautan] bila kosong, seluruh cache dibersihkan
 * @returns {void}
 */
export function bersihkanCache(tautan) {
  if (tautan === undefined) {
    cacheMemori.clear();
    sedangDiambil.clear();
    return;
  }
  cacheMemori.delete(tautan);
  sedangDiambil.delete(tautan);
}
