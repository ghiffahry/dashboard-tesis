/**
 * state.js - sumber tunggal state tampilan lintas halaman (query URL).
 * Fungsi murni tanpa DOM agar bisa diuji di Node.
 * umum.js dan peta.js mengimpor dari sini; tidak ada duplikasi parsing URL.
 */

export const TAHUN_MIN = 2015;
export const TAHUN_MAX = 2025;

/** State bawaan sesuai kasus uji baca_state_dari_url_kosong. */
export const STATE_BAWAAN = Object.freeze({ tahun: 2025, peubah: "Miskin_(persen)", provinsi: "" });

/**
 * Baca state tampilan dari query URL lewat URLSearchParams.
 * @param {string} untaiQuery location.search ("", "?tahun=2020&...") atau query mentah
 * @param {{tahun:number,peubah:string,provinsi:string}} [bawaan] nilai default
 * @returns {{tahun:number,peubah:string,provinsi:string}} state tervalidasi;
 * tahun di luar 2015-2025 jatuh kembali ke bawaan
 */
export function bacaState(untiQuery = "", bawaan = STATE_BAWAAN) {
  const params = new URLSearchParams(untiQuery);
  const tahunMentah = Number.parseInt(params.get("tahun") ?? "", 10);
  const tahun = Number.isInteger(tahunMentah) && tahunMentah >= TAHUN_MIN && tahunMentah <= TAHUN_MAX
    ? tahunMentah
    : bawaan.tahun;
  return {
    tahun,
    peubah: params.get("peubah") || bawaan.peubah,
    provinsi: params.get("provinsi") || "",
  };
}

/**
 * Serialkan state menjadi query URL untuk tautan bagikan.
 * @param {{tahun:number,peubah:string,provinsi:string}} state state tampilan
 * @returns {string} contoh "?tahun=2024&peubah=Miskin_%28persen%29"
 */
export function tulisState(state) {
  const params = new URLSearchParams();
  params.set("tahun", String(state.tahun));
  params.set("peubah", state.peubah);
  if (state.provinsi) params.set("provinsi", state.provinsi);
  return `?${params.toString()}`;
}

/**
 * Tautan lintas halaman membawa state tampilan.
 * @param {string} namaHalaman nama file halaman tujuan (contoh "analisis")
 * @param {{tahun:number,peubah:string,provinsi:string}} state state tampilan
 * @returns {string} contoh "analisis.html?tahun=2024&peubah=Miskin_%28persen%29&provinsi=Aceh"
 */
export function tautanKe(namaHalaman, state) {
  return `${namaHalaman}.html${tulisState(state)}`;
}
