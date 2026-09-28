/**
 * format.js - fungsi murni pemformatan dan klasifikasi angka dashboard EDA.
 * Tanpa DOM, tanpa I/O. Aman diuji di Node maupun browser.
 */

/**
 * Format proporsi desimal menjadi persen lokal id-ID, 1 desimal.
 * @param {number|null|undefined} nilai proporsi desimal (0.2238 = 22,38%)
 * @returns {string} contoh "22,4%"; "-" bila null/undefined/NaN/tak-hingga
 */
export function formatProporsiSebagaiPersen(nilai) {
  if (nilai === null || nilai === undefined || Number.isNaN(Number(nilai))) return "-";
  const persen = Number(nilai) * 100;
  if (!Number.isFinite(persen)) return "-";
  return (
    new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(persen) + "%"
  );
}

/**
 * Format angka besar ke notasi ringkas id-ID (contoh PDRB juta rupiah).
 * @param {number|null|undefined} nilai angka mentah
 * @returns {string} contoh "1,2 jt"; "-" bila null/undefined/NaN/tak-hingga
 */
export function formatAngkaKompak(nilai) {
  if (nilai === null || nilai === undefined) return "-";
  const angka = Number(nilai);
  if (Number.isNaN(angka) || !Number.isFinite(angka)) return "-";
  return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(angka);
}

/**
 * Format angka desimal lokal id-ID dengan jumlah desimal tetap.
 * @param {number|null|undefined} nilai angka mentah
 * @param {number} desimal jumlah desimal tampil
 * @returns {string} contoh "0,6009"; "-" bila null/undefined/NaN/tak-hingga
 */
export function formatDesimalId(nilai, desimal = 2) {
  if (nilai === null || nilai === undefined) return "-";
  const angka = Number(nilai);
  if (Number.isNaN(angka) || !Number.isFinite(angka)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(angka);
}

/**
 * Menghitung Compound Annual Growth Rate antar dua titik waktu.
 * @param {number} nilaiAwal nilai peubah tahun awal, wajib > 0
 * @param {number} nilaiAkhir nilai peubah tahun akhir
 * @param {number} jumlahTahun selisih tahun akhir-awal, wajib > 0
 * @returns {number|"TIDAK_TERDEFINISI"} CAGR desimal, atau "TIDAK_TERDEFINISI"
 * bila nilaiAwal <= 0 / nilaiAkhir < 0 / jumlahTahun <= 0 / masukan bukan angka
 * hingga (rasio negatif berpangkat pecahan tak terdefinisi real)
 */
export function hitungCAGR(nilaiAwal, nilaiAkhir, jumlahTahun) {
  const awal = Number(nilaiAwal);
  const akhir = Number(nilaiAkhir);
  const tahun = Number(jumlahTahun);
  if (!Number.isFinite(awal) || !Number.isFinite(akhir) || !Number.isFinite(tahun)) return "TIDAK_TERDEFINISI";
  if (awal <= 0 || tahun <= 0 || akhir < 0) return "TIDAK_TERDEFINISI";
  return Math.pow(akhir / awal, 1 / tahun) - 1;
}

/**
 * Menghitung batas kuantil untuk klasifikasi choropleth (interpolasi linear).
 * @param {number[]} daftarNilai nilai numeric satu peubah satu tahun
 * @param {number} jumlahKelas jumlah kelas (>= 2, bawaan 4)
 * @returns {number[]} jumlahKelas-1 batas menaik; [] bila data kosong / n = 1;
 * bila seluruh nilai identik, batas berisi nilai itu berulang (kelas degenerat);
 * bila n < jumlahKelas, batas dibatasi n-1 buah
 */
export function hitungBatasKuantil(daftarNilai, jumlahKelas = 4) {
  const terurut = (Array.isArray(daftarNilai) ? daftarNilai : [])
    .filter((v) => typeof v === "number" && Number.isFinite(v))
    .sort((a, b) => a - b);
  const n = terurut.length;
  if (n <= 1) return [];
  const kelas = Math.max(2, Math.floor(Number(jumlahKelas)) || 4);
  const jumlahBatas = Math.min(kelas - 1, n - 1);
  const batas = [];
  for (let k = 1; k <= jumlahBatas; k++) {
    const posisi = ((n - 1) * k) / kelas;
    const bawah = Math.floor(posisi);
    const atas = Math.ceil(posisi);
    batas.push(terurut[bawah] + (terurut[atas] - terurut[bawah]) * (posisi - bawah));
  }
  return batas;
}

/**
 * Memetakan nilai ke token warna CSS berdasarkan batas kuantil.
 * @param {number|null|undefined} nilai nilai satu wilayah
 * @param {number[]} batasKuantil batas dari hitungBatasKuantil
 * @param {string[]} [token] daftar token warna; bawaan 4 token spec.
 * Panjang wajib batasKuantil.length + 1 (mismatch = salah panggil, throw).
 * @returns {string} token warna sesuai kelas, "--garis" bila data hilang
 */
export function warnaDariKuantil(nilai, batasKuantil, token = ["--navy-100", "--navy-600", "--oker", "--terakota"]) {
  if (nilai === null || nilai === undefined || Number.isNaN(Number(nilai))) return "--garis";
  const batas = Array.isArray(batasKuantil) ? batasKuantil : [];
  if (batas.length !== token.length - 1) {
    throw new RangeError(`warnaDariKuantil: batas.length=${batas.length} wajib sama dengan token.length - 1=${token.length - 1}`);
  }
  for (let i = 0; i < batas.length; i++) {
    if (Number(nilai) <= batas[i]) return token[i];
  }
  return token[token.length - 1];
}

/**
 * Animasi hitung naik 0 menuju nilaiAkhir pada elemen teks (requestAnimationFrame).
 * prefers-reduced-motion: reduce -> nilai akhir langsung, tanpa animasi.
 * @param {Element|null} elemen elemen target (textContent)
 * @param {number} nilaiAkhir nilai akhir
 * @param {number} [durasiMs=500] durasi animasi
 * @param {function} [format=formatProporsiSebagaiPersen] pemformat tiap frame
 * @returns {void}
 */
export function hitungNaik(elemen, nilaiAkhir, durasiMs = 500, format = formatProporsiSebagaiPersen) {
  if (!elemen) return;
  const nilai = Number(nilaiAkhir);
  if (!Number.isFinite(nilai)) {
    elemen.textContent = "-";
    return;
  }
  const reduksi = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  if (reduksi) {
    elemen.textContent = format(nilai);
    return;
  }
  const mulai = performance.now();
  const durasi = Math.max(1, Number(durasiMs) || 500);
  function bingkai(now) {
    const progres = Math.max(0, Math.min(1, (now - mulai) / durasi));
    elemen.textContent = format(nilai * progres);
    if (progres < 1) requestAnimationFrame(bingkai);
  }
  requestAnimationFrame(bingkai);
}
