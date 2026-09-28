/**
 * umum.js - utilitas lintas halaman: versi build, footer, data sumber.
 * State URL dipindah ke state.js (sumber tunggal) dan di-re-export di sini.
 */

export {
  TAHUN_MIN,
  TAHUN_MAX,
  STATE_BAWAAN,
  bacaState,
  tulisState,
  tautanKe,
} from "./state.js";

/** Sumber data untuk footer (lihat header index.html). */
export const SUMBER_DATA = "Sumber internal tesis 2015-2025 + geometri Sumatera (154 kab/kota)";

/**
 * Ambil versi build dari build-info.json; tak pernah throw.
 * @param {string} [tautan] path build-info.json relatif terhadap halaman pemanggil
 * @returns {Promise<string>} versi build atau "versi tidak diketahui" bila fetch gagal
 */
export async function bacaVersiBuild(tautan = "data/build-info.json") {
  try {
    const res = await fetch(tautan, { cache: "no-store" });
    if (!res.ok) return "versi tidak diketahui";
    const info = await res.json();
    return typeof info.versi === "string" && info.versi ? info.versi : "versi tidak diketahui";
  } catch {
    return "versi tidak diketahui";
  }
}

/**
 * Render footer sumber + versi ke elemen (textContent, tanpa innerHTML).
 * Versi diambil sendiri via bacaVersiBuild (tak pernah throw), jadi fungsi
 * async dan harus di-await oleh pemanggil.
 * @param {Element|null} elemen elemen footer target
 * @param {{sumber:string,tautanBuild?:string}} info sumber data + path build-info.json opsional
 * @returns {Promise<void>}
 */
export async function renderFooter(elemen, info = {}) {
  if (!elemen) return;
  const versi = await bacaVersiBuild(info.tautanBuild);
  elemen.textContent = `Sumber: ${info.sumber} | Versi: ${versi}`;
}
