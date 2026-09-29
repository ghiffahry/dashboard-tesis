/**
 * peta.js - halaman peta choropleth kuantil responsif (Leaflet via CDN).
 * Moran's I / LISA dibaca statis dari moran.json, TIDAK dihitung ulang.
 * Nilai choropleth dibaca dari nilai-wilayah-tahunan.json (precompute),
 * BUKAN dari tabel.csv mentah.
 */
import { hitungBatasKuantil, warnaDariKuantil, formatProporsiSebagaiPersen, formatAngkaKompak, formatDesimalId, hitungCAGR } from "./format.js";
import { ambilJson } from "./cache-data.js";
import { bacaState, tulisState, STATE_BAWAAN, tautanKe } from "./state.js";

const KUNCI_NAMA_WILAYAH = "ADM2_EN";
const KUNCI_PROVINSI = "ADM1_EN";

/** Token eksplisit entri hilang pada JSON precompute (selain null). */
export const NILAI_HILANG = "DATA_HILANG";

const LABEL_LISA = { HH: "Tinggi-Tinggi", LL: "Rendah-Rendah", HL: "Tinggi-Rendah", LH: "Rendah-Tinggi", "Tidak Terhubung": "Tidak Terhubung" };
const TOKEN_KUANTIL = ["--peta-q1", "--peta-q2", "--peta-q3", "--peta-q4"];
const MAKNA_PEUBAH = {
  "Miskin_(persen)": "risiko", "Gini.indeks_(indeks)": "risiko", "TPT_(persen)": "risiko",
  "Akses.Air.Bersih_(persen)": "capaian", "IDG_(indeks)": "capaian", "IPM.Indeks_(indeks)": "capaian",
  "Laju.PE.ADHK_(persen)": "capaian", "RLS.Tahun_(tahun)": "capaian",
  "Sanitasi.Layak_(persen)": "capaian",
};
const WARNA_GARIS = "#ffffff";
const WARNA_HOVER = "#ff7c2d";
const WARNA_PIN = "#ff7c2d";

/** Kelompok kategori peubah untuk sidebar (klik kategori memilih anggota pertama). */
export const KATEGORI_PEubah = [
  { nama: "Kemiskinan", anggota: ["Miskin_(persen)", "Prevalensi_(persen)"] },
  { nama: "Pembangunan", anggota: ["IPM.Indeks_(indeks)", "IDG_(indeks)"] },
  { nama: "Ketenagakerjaan", anggota: ["TPT_(persen)", "TPAK_(persen)"] },
  { nama: "Ekonomi", anggota: ["Laju.PE.ADHK_(persen)", "PDRB.Kapita_(juta.rupiah)", "PAD.JtTh_(juta.rupiah)"] },
  { nama: "Sosial", anggota: ["RLS.Tahun_(tahun)", "Kepadatan.Pendududuk_(jiwa.per.km2)", "Sanitasi.Layak_(persen)", "Akses.Air.Bersih_(persen)", "Rasio.Puskesmas.per.10rb.Penduduk"] },
  { nama: "Pendapatan", anggota: ["Pendapatan.Pertanian_(Juta)", "Pendapatan.Industri_(Juta)", "Pendapatan.Jasa_(Juta)"] },
  { nama: "Ketimpangan", anggota: ["Gini.indeks_(indeks)"] },
];

/**
 * Muat GeoJSON dengan fallback eksplisit bila URL primer gagal
 * (proxy korporat kadang menolak .br/.gz).
 * @param {string} tautanPrimer URL GeoJSON utama
 * @param {string} tautanCadangan URL GeoJSON tak-terkompresi
 * @returns {Promise<object>} GeoJSON terurai
 */
export async function muatGeojson(tautanPrimer, tautanCadangan) {
  try {
    return await ambilJson(tautanPrimer);
  } catch {
    return ambilJson(tautanCadangan);
  }
}

/**
 * Baca anotasi Moran/LISA statis dari moran.json hasil precompute.
 * Skema nyata: { moran_dan_lisa: { [peubah]: { [tahun]: { moran_i, p_value,
 * jumlah_permutasi, signifikan, lisa_per_wilayah: { [wilayah]: { nilai, kuadran, signifikan } } } } }.
 * @param {object} dokumenMoran isi moran.json
 * @param {string} kunciPeubah kunci peubah (contoh "Miskin_(persen)")
 * @param {number|string} tahun tahun (2015-2025)
 * @returns {{moran_i:number,p_value:number,signifikan:boolean,jumlah_permutasi:number,lisa_per_wilayah:object}|null}
 */
export function bacaAnotasiMoran(dokumenMoran, kunciPeubah, tahun) {
  const entri = dokumenMoran?.moran_dan_lisa?.[kunciPeubah]?.[String(tahun)];
  if (!entri) return null;
  return {
    moran_i: entri.moran_i,
    p_value: entri.p_value,
    signifikan: entri.signifikan,
    jumlah_permutasi: entri.jumlah_permutasi,
    lisa_per_wilayah: entri.lisa_per_wilayah ?? {},
  };
}

/**
 * Baca kuadran LISA satu wilayah (kode nyata: "HH","LL","HL","LH").
 * @param {object} dokumenMoran isi moran.json
 * @param {string} kunciPeubah kunci peubah
 * @param {number|string} tahun tahun
 * @param {string} namaWilayah nama wilayah
 * @returns {{nilai:number,kuadran:string,signifikan:boolean}|null}
 */
export function bacaLisaWilayah(dokumenMoran, kunciPeubah, tahun, namaWilayah) {
  const anotasi = bacaAnotasiMoran(dokumenMoran, kunciPeubah, tahun);
  return anotasi?.lisa_per_wilayah?.[namaWilayah] ?? null;
}

/**
 * Escape teks murni ke HTML (nama wilayah tak pernah jadi markup).
 * @param {string} teks teks mentah
 * @returns {string} teks aman untuk tooltip Leaflet (string HTML)
 */
export function escapeTeksHtml(teks) {
  return String(teks ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/**
 * Normalisasi satu nilai wilayah: null/undefined/"DATA_HILANG"/NaN -> null.
 * @param {number|string|null} mentah nilai dari JSON precompute
 * @returns {number|null} angka hingga atau null (warna --garis)
 */
export function normalisasiNilaiWilayah(mentah) {
  if (mentah === null || mentah === undefined || mentah === NILAI_HILANG) return null;
  const angka = Number(mentah);
  return Number.isFinite(angka) ? angka : null;
}

/**
 * Baca nilai satu wilayah dari dokumen nilai-wilayah-tahunan.json.
 * Skema: { [peubah]: { [tahun]: { [wilayah]: nilai|null } } }.
 * @param {object} dokumenNilai isi nilai-wilayah-tahunan.json
 * @param {string} kunciPeubah kunci peubah
 * @param {number|string} tahun tahun
 * @param {string} namaWilayah nama wilayah
 * @returns {number|null} nilai atau null bila hilang
 */
export function bacaNilaiWilayah(dokumenNilai, kunciPeubah, tahun, namaWilayah) {
  return normalisasiNilaiWilayah(dokumenNilai?.[kunciPeubah]?.[String(tahun)]?.[namaWilayah]);
}

/**
 * Buat fungsi pemasok nilai per wilayah untuk satu peubah satu tahun.
 * @param {object} dokumenNilai isi nilai-wilayah-tahunan.json
 * @param {string} kunciPeubah kunci peubah
 * @param {number|string} tahun tahun
 * @returns {function} (namaWilayah) => number|null
 */
export function buatAmbilNilai(dokumenNilai, kunciPeubah, tahun) {
  return (namaWilayah) => bacaNilaiWilayah(dokumenNilai, kunciPeubah, tahun, namaWilayah);
}

/**
 * Format nilai peubah sesuai satuannya (persen vs angka mentah).
 * @param {number|null} nilai nilai peubah
 * @param {string} satuan "persen" atau lainnya dari indikator.json
 * @returns {string} nilai terformat id-ID
 */
export function formatNilaiPeubah(nilai, satuan) {
  if (satuan === "persen") return formatProporsiSebagaiPersen(nilai);
  return formatAngkaKompak(nilai);
}

/**
 * Teks tooltip per wilayah (nama di-escape, teks murni; nilai hilang eksplisit).
 * @param {string} namaWilayah nama wilayah
 * @param {number|string|null} nilai nilai peubah ("DATA_HILANG" boleh)
 * @param {string} satuan satuan dari indikator.json
 * @returns {string} contoh "Aceh Besar - 12,3%" atau "Pulau X - data hilang"
 */
export function teksTooltipWilayah(namaWilayah, nilai, satuan, label = "Nilai indikator") {
  const nama = escapeTeksHtml(namaWilayah);
  const judulNilai = escapeTeksHtml(label);
  const isi = normalisasiNilaiWilayah(nilai) === null ? "Data tidak tersedia" : formatNilaiPeubah(Number(nilai), satuan);
  return `<div class="peta-tooltip"><strong>${nama}</strong><span>${judulNilai}: ${isi}</span></div>`;
}

/**
 * Format perubahan 2015-2025: poin persen untuk peubah persen, selisih ringkas lainnya.
 * @param {number|null} nilai2015 nilai tahun 2015
 * @param {number|null} nilai2025 nilai tahun 2025
 * @param {string} satuan satuan dari indikator.json
 * @returns {string} contoh "+3,2 poin" atau "-1,2 jt"
 */
export function formatPerubahan(nilai2015, nilai2025, satuan) {
  if (normalisasiNilaiWilayah(nilai2015) === null || normalisasiNilaiWilayah(nilai2025) === null) return "-";
  const selisih = Number(nilai2025) - Number(nilai2015);
  if (satuan === "persen") {
    const poin = selisih * 100;
    return (poin >= 0 ? "+" : "") + formatDesimalId(poin, 1) + " poin";
  }
  return (selisih >= 0 ? "+" : "") + formatAngkaKompak(selisih);
}

/**
 * Render legenda kuantil (4 kelas + baris tanpa-data --garis).
 * Bila opsi.onPilih fungsi: tiap kelas jadi tombol filter (klik = sorot
 * kelas itu, klik ulang = lepas); aria-pressed menandai kelas aktif.
 * @param {Element|null} elLegenda wadah legenda
 * @param {number[]} batas 3 batas dari hitungBatasKuantil
 * @param {string} satuan satuan peubah aktif
 * @param {{filterAktif:number|null,onPilih:function|null}} [opsi] status filter + callback
 * @returns {void}
 */
export function renderLegendaKuantil(elLegenda, batas, satuan, opsi = {}) {
  if (!elLegenda) return;
  elLegenda.innerHTML = "";
  const label = (i) => formatNilaiPeubah(batas[i], satuan);
  const teksKelas = [
    "Kuartil 1 (rendah), sampai " + label(0),
    "Kuartil 2, " + label(0) + " sampai " + label(1),
    "Kuartil 3, " + label(1) + " sampai " + label(2),
    "Kuartil 4 (tinggi), di atas " + label(2),
  ];
  const interaktif = typeof opsi.onPilih === "function";
  for (let i = 0; i < 4; i += 1) {
    const li = document.createElement("li");
    const contoh = document.createElement("span");
    contoh.className = "swatch";
      contoh.style.background = "var(" + TOKEN_KUANTIL[i] + ")";
    if (!interaktif) {
      li.append(contoh, document.createTextNode(teksKelas[i]));
    } else {
      const tombol = document.createElement("button");
      tombol.type = "button";
      tombol.className = "swatch-filter" + (opsi.filterAktif === i ? " aktif" : "");
      tombol.setAttribute("aria-pressed", opsi.filterAktif === i ? "true" : "false");
      tombol.title = opsi.filterAktif === i ? "Lepas sorotan " + teksKelas[i] : "Sorot " + teksKelas[i];
      tombol.append(contoh, document.createTextNode(teksKelas[i]));
      tombol.addEventListener("click", () => opsi.onPilih(opsi.filterAktif === i ? null : i));
      li.append(tombol);
    }
    elLegenda.append(li);
  }
  const tanpa = document.createElement("li");
  const contohKosong = document.createElement("span");
  contohKosong.className = "swatch";
  contohKosong.style.background = "var(--garis)";
  tanpa.append(contohKosong, document.createTextNode("Tanpa data"));
  elLegenda.append(tanpa);
}

/**
 * Render anotasi Moran + hitung kelompok LISA (textContent, tanpa innerHTML).
 * @param {Element|null} elMoran <p id="anotasi-moran">
 * @param {Element|null} elLisa <ul id="daftar-lisa">
 * @param {{moran_i:number,p_value:number,signifikan:boolean,jumlah_permutasi:number,lisa_per_wilayah:object}|null} anotasi dari bacaAnotasiMoran
 * @returns {void}
 */
export function renderAnotasiMoran(elMoran, elLisa, anotasi) {
  if (elMoran) elMoran.classList.remove("status-memuat");
  if (!anotasi) {
    if (elMoran) elMoran.textContent = "Anotasi Moran tidak tersedia untuk peubah dan tahun aktif.";
    if (elLisa) elLisa.innerHTML = "";
    return;
  }
  if (elMoran) {
    const status = anotasi.signifikan ? "signifikan pada α = 0,05" : "tidak signifikan pada α = 0,05";
    elMoran.textContent = "Moran's I = " + formatDesimalId(anotasi.moran_i, 4) + ", p = " + formatDesimalId(anotasi.p_value, 4) + " (" + anotasi.jumlah_permutasi + " permutasi, " + status + ").";
  }
  if (elLisa) {
    const hitung = {};
    for (const entri of Object.values(anotasi.lisa_per_wilayah || {})) {
      const labelLisa = LABEL_LISA[entri.kuadran] || entri.kuadran;
      hitung[labelLisa] = (hitung[labelLisa] || 0) + 1;
    }
    elLisa.innerHTML = "";
    elLisa.className = "bar-moran";
    const urut = ["Tinggi-Tinggi", "Rendah-Rendah", "Tinggi-Rendah", "Rendah-Tinggi", "Tidak Terhubung"];
    const maks = Math.max(1, ...urut.map((k) => hitung[k] || 0));
    const warnaLisa = { "Tinggi-Tinggi": "var(--merah-peringatan)", "Rendah-Rendah": "var(--hijau-data)", "Tinggi-Rendah": "var(--oker)", "Rendah-Tinggi": "var(--navy-600)", "Tidak Terhubung": "var(--garis-kuat)" };
    for (const labelLisa of urut) {
      if (!hitung[labelLisa]) continue;
      const nama = document.createElement("span");
      nama.textContent = labelLisa;
      const track = document.createElement("div");
      track.className = "track";
      const isi = document.createElement("div");
      isi.className = "isi";
      isi.style.width = ((hitung[labelLisa] / maks) * 100).toFixed(1) + "%";
      isi.style.background = warnaLisa[labelLisa] || "var(--navy-600)";
      track.append(isi);
      const nilai = document.createElement("span");
      nilai.className = "nilai-moran";
      nilai.textContent = hitung[labelLisa] + " wil.";
      nilai.title = labelLisa + ": " + hitung[labelLisa] + " wilayah";
      elLisa.append(nama, track, nilai);
    }
  }
}

/**
 * Inisialisasi peta Leaflet dengan tile OpenStreetMap dan choropleth kuantil,
 * choropleth kuantil, sidebar kategori peubah, kartu detail wilayah,
 * widget ringkasan, legenda, anotasi Moran, tooltip ter-escape,
 * pin biru terang untuk wilayah terpilih (di luar palet kuantil).
 * Nilai choropleth dari nilai-wilayah-tahunan.json (opsi.dokumenNilai atau
 * opsi.tautanNilai); opsi.ambilNilai hanya override untuk uji.
 * Entri null/"DATA_HILANG" -> warna --garis + tooltip "data hilang".
 * @param {Element} elemenPeta kontainer #elemen-peta
 * @param {{geojsonPrimer:string,geojsonCadangan:string,tautanMoran:string,tautanIndikator:string,tautanNilai:string,untaiQuery:string,dokumenNilai?:object,ambilNilai?:function,elJudul?:Element|null,elDaftarKategori?:Element|null,elPencarian?:Element|null,elTombolCari?:Element|null,elTahun?:Element|null,elKartu?:Element|null,elRingkasan?:Element|null,elLegenda?:Element|null,elMoran?:Element|null,elLisa?:Element|null}} opsi URL data + query awal + target render
 * @returns {Promise<{peta:object,anotasi:object|null,batas:number[],daftarNilai:number[],meta:object,state:object}|null>} peta + anotasi Moran + batas kuantil, atau null bila Leaflet/CDN absen
 */
export async function inisialisasiPeta(elemenPeta, opsi) {
  const L = globalThis.L;
  const state = bacaState(opsi.untaiQuery ?? "", STATE_BAWAAN);
  if (!elemenPeta || !L) return null;
  const peta = L.map(elemenPeta, { zoomControl: false, minZoom: 5, maxZoom: 10, attributionControl: false });
  peta.setView([1.5, 102], 6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>",
  }).addTo(peta);
  L.control.zoom({ position: "topright" }).addTo(peta);
  L.control.attribution({ prefix: false }).addAttribution("Geometri: 154 kab/kota").addTo(peta);

  const janjiNilai = opsi.dokumenNilai ?? ambilJson(opsi.tautanNilai ?? "data/nilai-wilayah-tahunan.json");
  const [geojson, indikator, moran, dokumenNilai] = await Promise.all([
    muatGeojson(opsi.geojsonPrimer, opsi.geojsonCadangan),
    ambilJson(opsi.tautanIndikator),
    ambilJson(opsi.tautanMoran),
    janjiNilai,
  ]);

  const labelPeubah = new Map(indikator.map((d) => [d.kunci, d.label]));
  let meta = indikator.find((d) => d.kunci === state.peubah) ?? indikator[0];
  let ambilNilai = buatAmbilNilai(dokumenNilai, meta.kunci, state.tahun);
  let daftarNilai = (geojson.features ?? [])
    .map((f) => ambilNilai(f.properties?.[KUNCI_NAMA_WILAYAH] ?? f.properties?.nama ?? ""))
    .filter((v) => typeof v === "number");
  let batas = hitungBatasKuantil(daftarNilai, 4);

  const lapisanPerWilayah = new Map();
  let filterKuantil = null;
  let filterLisaSignifikan = Boolean(state.lisa);
  let filterLisaKuadran = state.lisa || "";
  function gayaWilayah(nama) {
    const token = warnaDariKuantil(ambilNilai(nama), batas, TOKEN_KUANTIL);
    const gaya = { fillColor: `var(${token})`, color: WARNA_GARIS, weight: 1, fillOpacity: 1 };
    if (filterKuantil !== null && batas.length === 3 && TOKEN_KUANTIL.indexOf(token) !== filterKuantil) {
      gaya.fillOpacity = 0.15;
    }
    if (filterLisaSignifikan) {
      const lisa = bacaLisaWilayah(moran, meta.kunci, state.tahun, nama);
      if (!lisa?.signifikan || (filterLisaKuadran && lisa.kuadran !== filterLisaKuadran)) gaya.fillOpacity = Math.min(gaya.fillOpacity, 0.12);
      else { gaya.color = "#ffffff"; gaya.weight = 1.6; }
    }
    return gaya;
  }
  function pilihKuantil(indeks) {
    filterKuantil = indeks;
    lapisan.setStyle((fitur) => gayaWilayah(fitur.properties?.[KUNCI_NAMA_WILAYAH] ?? fitur.properties?.nama ?? ""));
    if (batas.length === 3) renderLegendaKuantil(opsi.elLegenda ?? null, batas, meta.satuan, { filterAktif: filterKuantil, onPilih: pilihKuantil });
  }
  const lapisan = L.geoJSON(geojson, {
    style: (fitur) => gayaWilayah(fitur.properties?.[KUNCI_NAMA_WILAYAH] ?? fitur.properties?.nama ?? ""),
    onEachFeature: (fitur, layer) => {
      const nama = fitur.properties?.[KUNCI_NAMA_WILAYAH] ?? fitur.properties?.nama ?? "";
      layer.wilayahNama = nama;
      lapisanPerWilayah.set(nama, layer);
      layer.bindTooltip(teksTooltipWilayah(nama, ambilNilai(nama), meta.satuan, meta.label), { className: "tooltip-peta", sticky: true, direction: "top", opacity: 1, offset: [0, -8] });
      layer.on("mouseover", () => layer.setStyle({ color: WARNA_HOVER }));
      layer.on("mouseout", () => layer.setStyle({ color: WARNA_GARIS }));
      layer.on("click", () => pilihWilayah(nama));
    },
  });
  lapisan.addTo(peta);
  if (lapisan.getBounds().isValid()) peta.fitBounds(lapisan.getBounds().pad(0.035), { animate: false });

  let pin = null;

  function cariProvinsi(namaWilayah) {
    const fitur = (geojson.features ?? []).find((f) => (f.properties?.[KUNCI_NAMA_WILAYAH] ?? f.properties?.nama) === namaWilayah);
    return fitur?.properties?.[KUNCI_PROVINSI] ?? "-";
  }

  function pasangPin(namaWilayah) {
    if (pin) {
      pin.remove();
      pin = null;
    }
    const layer = lapisanPerWilayah.get(namaWilayah);
    if (!layer) return;
    pin = L.circleMarker(layer.getBounds().getCenter(), {
      radius: 7,
      color: WARNA_GARIS,
      weight: 1,
      fillColor: WARNA_PIN,
      fillOpacity: 1,
    }).addTo(peta);
  }

  function renderKartu(namaWilayah) {
    const elKartu = opsi.elKartu;
    if (!elKartu) return;
    elKartu.innerHTML = "";
    if (!namaWilayah) {
      elKartu.hidden = true;
      return;
    }
    elKartu.hidden = false;
    const nAktif = bacaNilaiWilayah(dokumenNilai, meta.kunci, state.tahun, namaWilayah);
    const n15 = bacaNilaiWilayah(dokumenNilai, meta.kunci, "2015", namaWilayah);
    const n25 = bacaNilaiWilayah(dokumenNilai, meta.kunci, "2025", namaWilayah);
    const lisa = bacaLisaWilayah(moran, meta.kunci, state.tahun, namaWilayah);
    const cagr = hitungCAGR(n15, n25, 10);
    const teksCagr = cagr === "TIDAK_TERDEFINISI" ? "TIDAK_TERDEFINISI" : formatProporsiSebagaiPersen(cagr) + " per tahun";
    const teksLisa = !lisa ? "Tidak tersedia" : `${LABEL_LISA[lisa.kuadran] || lisa.kuadran}, ${lisa.signifikan ? "signifikan" : "tidak signifikan"} (FDR 5%)`;

    const judul = document.createElement("h3");
    judul.textContent = namaWilayah;
    const sub = document.createElement("p");
    sub.className = "kartu-provinsi";
    sub.textContent = cariProvinsi(namaWilayah);
    const grid = document.createElement("div");
    grid.className = "kartu-grid";
    const selisih = formatPerubahan(n15, n25, meta.satuan);
    for (const [label, nilai] of [
      ["Nilai " + state.tahun, formatNilaiPeubah(nAktif, meta.satuan)],
      ["Perubahan 2015-2025", selisih],
      ["CAGR 2015-2025", teksCagr],
      ["Kuadran dan status LISA", teksLisa],
    ]) {
      const div = document.createElement("div");
      const l = document.createElement("span");
      l.className = "label-kecil";
      l.textContent = label;
      const v = document.createElement("span");
      v.textContent = nilai;
      div.append(l, v);
      grid.append(div);
    }
    const tautan = document.createElement("a");
    tautan.className = "tautan-kartu";
    tautan.href = tautanKe("analisis", { tahun: state.tahun, peubah: state.peubah, provinsi: namaWilayah });
    tautan.textContent = `Lihat ${namaWilayah} di halaman Analisis`;
    const tutup = document.createElement("button");
    tutup.type = "button";
    tutup.className = "tutup";
    tutup.textContent = "Tutup";
    tutup.addEventListener("click", tutupKartu);
    elKartu.append(judul, sub, grid, tautan, tutup);
  }

  function pilihWilayah(namaWilayah) {
    state.provinsi = namaWilayah;
    pasangPin(namaWilayah);
    renderKartu(namaWilayah);
    ubahURL();
  }

  function tutupKartu() {
    state.provinsi = "";
    if (pin) {
      pin.remove();
      pin = null;
    }
    renderKartu(null);
    ubahURL();
  }

  function renderSidebar(saring = "") {
    const elDaftar = opsi.elDaftarKategori;
    if (!elDaftar) return;
    elDaftar.innerHTML = "";
    for (const kategori of KATEGORI_PEubah) {
      const anggota = kategori.anggota.filter((k) => (labelPeubah.get(k) || k).toLowerCase().includes(saring));
      if (anggota.length === 0) continue;
      const blok = document.createElement("div");
      blok.className = "kategori";
      const kepala = document.createElement("button");
      kepala.type = "button";
      kepala.addEventListener("click", () => pilihPeubah(kategori.anggota[0]));
      const namaK = document.createElement("span");
      namaK.textContent = kategori.nama;
      const jumlah = document.createElement("span");
      jumlah.className = "jumlah";
      jumlah.textContent = "(" + kategori.anggota.length + ")";
      kepala.append(namaK, jumlah);
      const ul = document.createElement("ul");
      for (const kunci of anggota) {
        const li = document.createElement("li");
        const tombol = document.createElement("button");
        tombol.type = "button";
        tombol.textContent = labelPeubah.get(kunci) || kunci;
        if (kunci === state.peubah) tombol.className = "aktif";
        tombol.addEventListener("click", () => pilihPeubah(kunci));
        li.append(tombol);
        ul.append(li);
      }
      blok.append(kepala, ul);
      elDaftar.append(blok);
    }
  }

  function pilihPeubah(kunci) {
    state.peubah = kunci;
    applyState();
    renderSidebar(opsi.elPencarian ? opsi.elPencarian.value.trim().toLowerCase() : "");
    ubahURL();
  }

  function isiPilihanTahun(el, tahunAktif) {
    for (let t = 2015; t <= 2025; t += 1) {
      const opsiTahun = document.createElement("option");
      opsiTahun.value = String(t);
      opsiTahun.textContent = String(t);
      if (t === tahunAktif) opsiTahun.selected = true;
      el.append(opsiTahun);
    }
  }

  function renderRingkasanSebaran() {
    const el = document.getElementById("map-summary-stats");
    if (!el) return;
    const urut = [...daftarNilai].sort((a, b) => a - b);
    if (!urut.length) { el.textContent = "Belum ada nilai valid."; return; }
    const kuantil = (p) => {
      const posisi = (urut.length - 1) * p;
      const bawah = Math.floor(posisi);
      const fraksi = posisi - bawah;
      return urut[bawah] + ((urut[Math.min(bawah + 1, urut.length - 1)] - urut[bawah]) * fraksi);
    };
    const median = kuantil(0.5);
    const q1 = kuantil(0.25);
    const q3 = kuantil(0.75);
    const ringkas = [
      ["Wilayah terisi", String(urut.length)],
      ["Median", formatNilaiPeubah(median, meta.satuan)],
      ["IQR (Q3-Q1)", formatNilaiPeubah(q3 - q1, meta.satuan)],
      ["Rentang", `${formatNilaiPeubah(urut[0], meta.satuan)} sampai ${formatNilaiPeubah(urut.at(-1), meta.satuan)}`],
    ];
    el.replaceChildren(...ringkas.map(([label, nilai]) => {
      const item = document.createElement("div");
      const nama = document.createElement("span"); nama.textContent = label;
      const angka = document.createElement("strong"); angka.textContent = nilai;
      item.append(nama, angka); return item;
    }));
  }

  function renderWidget() {
    const elRingkasan = opsi.elRingkasan;
    if (!elRingkasan) return;
    elRingkasan.classList.remove("status-memuat");
    if (daftarNilai.length > 1) {
      const jumlah = daftarNilai.reduce((a, b) => a + b, 0);
      elRingkasan.innerHTML = "";
      const label = document.createElement("span");
      label.className = "label-kecil";
      label.textContent = "Ringkasan " + meta.label + " " + state.tahun;
      const teks = document.createElement("span");
      teks.textContent = "n=" + daftarNilai.length + " | min=" + formatNilaiPeubah(Math.min(...daftarNilai), meta.satuan) + " | mean=" + formatNilaiPeubah(jumlah / daftarNilai.length, meta.satuan) + " | maks=" + formatNilaiPeubah(Math.max(...daftarNilai), meta.satuan);
      elRingkasan.append(label, teks);
    } else {
      elRingkasan.textContent = "Tidak ada nilai valid untuk peubah dan tahun aktif.";
    }
  }

  function applyState() {
    meta = indikator.find((d) => d.kunci === state.peubah) ?? indikator[0];
    state.peubah = meta.kunci;
    const makna = MAKNA_PEUBAH[meta.kunci] || "konteks";
    document.body.dataset.petaMakna = makna;
    const petunjuk = document.getElementById("petunjuk-nilai");
    if (petunjuk) petunjuk.textContent = makna === "risiko" ? "Warna lebih terang menunjukkan nilai tinggi yang perlu dicermati." : makna === "capaian" ? "Warna lebih terang menunjukkan capaian yang lebih tinggi." : "Warna lebih terang menunjukkan nilai yang lebih tinggi; maknanya bergantung pada indikator.";
    ambilNilai = buatAmbilNilai(dokumenNilai, meta.kunci, state.tahun);
    daftarNilai = (geojson.features ?? [])
      .map((f) => ambilNilai(f.properties?.[KUNCI_NAMA_WILAYAH] ?? f.properties?.nama ?? ""))
      .filter((v) => typeof v === "number");
    batas = hitungBatasKuantil(daftarNilai, 4);
    filterKuantil = null;
    lapisan.setStyle((fitur) => gayaWilayah(fitur.properties?.[KUNCI_NAMA_WILAYAH] ?? fitur.properties?.nama ?? ""));
    lapisan.eachLayer((layer) => {
      if (layer.wilayahNama) layer.bindTooltip(teksTooltipWilayah(layer.wilayahNama, ambilNilai(layer.wilayahNama), meta.satuan, meta.label), { className: "tooltip-peta", sticky: true, direction: "top", opacity: 1, offset: [0, -8] });
    });
    if (opsi.elJudul) opsi.elJudul.textContent = meta.label + " " + state.tahun;
    if (opsi.elTahun) opsi.elTahun.value = String(state.tahun);
    if (batas.length === 3) {
      renderLegendaKuantil(opsi.elLegenda ?? null, batas, meta.satuan, { filterAktif: filterKuantil, onPilih: pilihKuantil });
    } else if (opsi.elLegenda) {
      opsi.elLegenda.innerHTML = "";
      const li = document.createElement("li");
      li.textContent = "Batas kuantil degenerat (nilai seragam), seluruh wilayah satu kelas.";
      opsi.elLegenda.append(li);
    }
    const anotasiAktif = bacaAnotasiMoran(moran, meta.kunci, state.tahun);
    renderAnotasiMoran(opsi.elMoran ?? null, opsi.elLisa ?? null, anotasiAktif);
    if (toggleLisa) {
      toggleLisa.disabled = !anotasiAktif;
      toggleLisa.checked = Boolean(anotasiAktif && filterLisaSignifikan);
      if (!anotasiAktif) filterLisaSignifikan = false;
      toggleLisa.setAttribute("aria-label", anotasiAktif ? "Sorot klaster LISA signifikan setelah koreksi FDR 5%" : "Penyaringan LISA tidak tersedia untuk indikator dan tahun ini");
      toggleLisa.checked = Boolean(anotasiAktif && (filterLisaSignifikan || filterLisaKuadran));
    }
    renderWidget();
    renderRingkasanSebaran();
    if (state.provinsi) {
      pasangPin(state.provinsi);
      renderKartu(state.provinsi);
    }
  }

  function ubahURL() {
    window.dispatchEvent(new CustomEvent("state-peta-berubah", { detail: { ...state } }));
  }

  window.addEventListener("state-peta-berubah", (event) => {
    history.replaceState(null, "", tulisState(event.detail));
  });

  const clearLisa = document.getElementById("clear-lisa-filter");
  if (clearLisa) {
    clearLisa.hidden = !filterLisaKuadran;
    clearLisa.textContent = filterLisaKuadran ? "Hapus filter " + filterLisaKuadran : "";
    clearLisa.addEventListener("click", () => { filterLisaKuadran = ""; filterLisaSignifikan = false; state.lisa = ""; clearLisa.hidden = true; if (toggleLisa) toggleLisa.checked = false; lapisan.setStyle((fitur) => gayaWilayah(fitur.properties?.[KUNCI_NAMA_WILAYAH] ?? fitur.properties?.nama ?? "")); history.replaceState(null, "", tulisState(state)); });
  }
  if (opsi.elTahun) {
    isiPilihanTahun(opsi.elTahun, state.tahun);
    opsi.elTahun.addEventListener("change", () => {
      state.tahun = Number(opsi.elTahun.value);
      applyState();
      ubahURL();
    });
  }
  const toggleLisa = document.getElementById("toggle-lisa-signifikan");
  if (toggleLisa) {
    toggleLisa.addEventListener("change", () => {
      filterLisaSignifikan = toggleLisa.checked;
      lapisan.setStyle((fitur) => gayaWilayah(fitur.properties?.[KUNCI_NAMA_WILAYAH] ?? fitur.properties?.nama ?? ""));
    });
  }
  if (opsi.elPencarian) {
    opsi.elPencarian.addEventListener("input", () => renderSidebar(opsi.elPencarian.value.trim().toLowerCase()));
  }
  if (opsi.elTombolCari) {
    opsi.elTombolCari.addEventListener("click", () => {
      if (opsi.elPencarian) opsi.elPencarian.focus();
    });
  }

  renderSidebar();
  applyState();

  return { peta, anotasi: bacaAnotasiMoran(moran, meta.kunci, state.tahun), batas, daftarNilai, meta, state };
}



