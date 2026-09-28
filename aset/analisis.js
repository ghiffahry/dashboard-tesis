/**
 * analisis.js - halaman analisis: slope chart SVG, boxplot, tabel peringkat.
 * Kuantil dibaca dari sebaran.json (precompute), bukan dihitung ulang.
 * SVG dibangun via createElementNS + textContent - tanpa innerHTML untuk
 * data nama wilayah.
 */
import { formatProporsiSebagaiPersen } from "./format.js";
import { ambilJson } from "./cache-data.js";
import { tautanKe } from "./state.js";

const NS_SVG = "http://www.w3.org/2000/svg";
export const ARAH_MENAIK = "menaik";
export const ARAH_MENURUN = "menurun";

/**
 * Balik arah pengurutan (klik kedua header yang sama).
 * @param {string} arah ARAH_MENAIK atau ARAH_MENURUN
 * @returns {string} arah berlawanan
 */
export function balikArah(arah) {
  return arah === ARAH_MENAIK ? ARAH_MENURUN : ARAH_MENAIK;
}

/**
 * Urutkan baris peringkat per kolom; "TIDAK_TERDEFINISI" selalu paling bawah.
 * @param {object[]} baris entri peringkat.json (wilayah, provinsi, cagr, ...)
 * @param {string} kunciKolom kolom pengurut
 * @param {string} [arah] ARAH_MENURUN bawaan
 * @returns {object[]} salinan terurut (masukan tidak dimutasi)
 */
export function urutkanBarisPeringkat(baris, kunciKolom, arah = ARAH_MENURUN) {
  const pengali = arah === ARAH_MENAIK ? 1 : -1;
  return [...baris].sort((a, b) => {
    const va = a[kunciKolom];
    const vb = b[kunciKolom];
    const ta = typeof va === "string";
    const tb = typeof vb === "string";
    if (ta || tb) {
      if (ta && tb) return pengali * String(va).localeCompare(String(vb), "id");
      return ta ? 1 : -1;
    }
    return pengali * (Number(va) - Number(vb));
  });
}

/**
 * Saring baris peringkat berdasar kata kunci (wilayah + provinsi).
 * @param {object[]} baris entri peringkat.json
 * @param {string} kataKunci kata kunci pencarian
 * @returns {object[]} baris cocok; seluruh baris bila kata kunci kosong
 */
export function saringBarisPeringkat(baris, kataKunci) {
  const kunci = (kataKunci ?? "").trim().toLowerCase();
  if (!kunci) return [...baris];
  return baris.filter((r) =>
    `${r.wilayah ?? ""} ${r.provinsi ?? ""}`.toLowerCase().includes(kunci),
  );
}

/**
 * Teks status bila pencarian tanpa hasil (bukan tabel kosong tanpa konteks).
 * @param {string} kataKunci kata kunci yang dipakai
 * @returns {string} pesan status kosong
 */
export function teksStatusKosong(kataKunci) {
  return `Tidak ada wilayah yang cocok dengan "${kataKunci}".`;
}

/**
 * Format sel CAGR: eksplisit "TIDAK_TERDEFINISI", bukan sel kosong.
 * @param {number|string} cagr angka atau "TIDAK_TERDEFINISI" dari peringkat.json
 * @returns {string} persen terformat atau "TIDAK_TERDEFINISI"
 */
export function formatNilaiCagr(cagr) {
  if (cagr === "TIDAK_TERDEFINISI") return "TIDAK_TERDEFINISI";
  return formatProporsiSebagaiPersen(cagr);
}

/**
 * Ambil ringkasan sebaran satu peubah satu tahun dari sebaran.json.
 * Skema nyata: { [peubah]: { [tahun]: { q1, median, q3, min, maks, n } } }.
 * @param {object} dokumenSebaran isi sebaran.json
 * @param {string} kunciPeubah kunci peubah
 * @param {number|string} tahun tahun
 * @returns {{q1:number,median:number,q3:number,min:number,maks:number,n:number}|null}
 */
export function ambilSebaranTahun(dokumenSebaran, kunciPeubah, tahun) {
  const entri = dokumenSebaran?.[kunciPeubah]?.[String(tahun)];
  if (!entri) return null;
  const { q1, median, q3, min, maks, n } = entri;
  return { q1, median, q3, min, maks, n };
}

/**
 * Buat elemen SVG aman (nama wilayah via textContent, bukan innerHTML).
 * @param {string} tag nama tag SVG
 * @param {object} [atribut] atribut SVG
 * @param {string|null} [teks] isi teks (di-escape otomatis via textContent)
 * @returns {SVGElement} elemen SVG
 */
export function buatElemenSvg(tag, atribut = {}, teks = null) {
  const el = document.createElementNS(NS_SVG, tag);
  for (const [k, v] of Object.entries(atribut)) el.setAttribute(k, String(v));
  if (teks !== null && teks !== undefined) el.textContent = teks;
  return el;
}

/**
 * Render boxplot ringkas dari ringkasan precompute ke induk SVG.
 * @param {Element} indukSvg elemen <svg> wadah
 * @param {{q1:number,median:number,q3:number,min:number,maks:number}} ringkasan dari ambilSebaranTahun
 * @param {{lebar:number,skala:function}} [opsi] lebar px + fungsi skala nilai->x
 * @returns {void}
 */
export function renderBoxplot(indukSvg, ringkasan, opsi = {}) {
  const lebar = opsi.lebar ?? 320;
  const skala = opsi.skala ?? ((v) => ((v - ringkasan.min) / ((ringkasan.maks - ringkasan.min) || 1)) * lebar);
  const y = 30;
  const garis = (x1, x2, yy) => buatElemenSvg("line", { x1: skala(x1), x2: skala(x2), y1: yy, y2: yy, stroke: "currentColor" });
  indukSvg.append(garis(ringkasan.min, ringkasan.maks, y));
  indukSvg.append(buatElemenSvg("rect", {
    x: skala(ringkasan.q1), y: y - 12, width: Math.max(1, skala(ringkasan.q3) - skala(ringkasan.q1)), height: 24, fill: "none", stroke: "currentColor",
  }));
  indukSvg.append(buatElemenSvg("line", { x1: skala(ringkasan.median), x2: skala(ringkasan.median), y1: y - 12, y2: y + 12, stroke: "currentColor" }));
}

/**
 * Render slope chart tren per provinsi sebagai SVG native.
 * Tanpa label statis (anti overlap): garis tipis per provinsi, nama dan
 * nilai hanya muncul on-demand saat hover/fokus via readout hidup.
 * @param {Element} indukSvg elemen <svg> wadah
 * @param {object} seriPeubah potongan seri-tahunan.json: { [provinsi]: { [tahun]: nilai } }
 * @param {string[]} daftarTahun tahun sebagai string menaik
 * @param {{format:function,readout:Element|null}} [opsi] format nilai + elemen readout
 * @returns {void}
 */
export function renderSlopeChart(indukSvg, seriPeubah, daftarTahun, opsi = {}) {
  if (!indukSvg || !seriPeubah || typeof seriPeubah !== "object") return;
  if (!Array.isArray(daftarTahun) || daftarTahun.length === 0) return;
  if (Object.keys(seriPeubah).length === 0) return;
  const [t0, t1] = [daftarTahun[0], daftarTahun[daftarTahun.length - 1]];
  if (t0 === undefined || t1 === undefined) return;
  const semua = Object.values(seriPeubah ?? {}).flatMap((w) => [w?.[t0], w?.[t1]]).filter((v) => typeof v === "number");
  if (semua.length === 0) return;
  const format = opsi.format ?? formatProporsiSebagaiPersen;
  indukSvg.innerHTML = "";
  indukSvg.setAttribute("viewBox", "0 0 520 340");
  indukSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const [min, maks] = [Math.min(...semua), Math.max(...semua)];
  const rentang = (maks - min) || 1;
  const [x0, x1] = [40, 480];
  const y = (v) => 300 - ((v - min) / rentang) * 260;
  indukSvg.append(buatElemenSvg("text", { x: x0, y: 326, "text-anchor": "middle", "font-size": "12" }, String(t0)));
  indukSvg.append(buatElemenSvg("text", { x: x1, y: 326, "text-anchor": "middle", "font-size": "12" }, String(t1)));
  let readout = opsi.readout ?? null;
  if (!readout && typeof document !== "undefined") {
    readout = document.createElement("p");
    readout.className = "readout-slope";
    readout.setAttribute("role", "status");
    readout.setAttribute("aria-live", "polite");
    indukSvg.after(readout);
  }
  if (readout) readout.textContent = "Arahkan kursor ke garis untuk membaca nilai per provinsi.";
  function sorot(garis, provinsi, v0, v1, aktif) {
    garis.setAttribute("stroke-width", aktif ? "3" : "1.5");
    garis.setAttribute("opacity", aktif ? "1" : "0.55");
    if (aktif && readout) {
      const selisih = v1 - v0;
      const arah = selisih > 0 ? "naik" : selisih < 0 ? "turun" : "tetap";
      readout.textContent = provinsi + ": " + format(v0) + " (" + t0 + ") ke " + format(v1) + " (" + t1 + "), " + arah + ".";
    }
  }
  for (const [provinsi, deret] of Object.entries(seriPeubah ?? {})) {
    const [v0, v1] = [deret?.[t0], deret?.[t1]];
    if (typeof v0 !== "number" || typeof v1 !== "number") continue;
    const garis = buatElemenSvg("line", { x1: x0, x2: x1, y1: y(v0), y2: y(v1), stroke: v1 > v0 ? "#e25570" : v1 < v0 ? "#49bdc5" : "#8a79d7", "stroke-width": 1.8, opacity: 0.72, tabindex: "0" });
    const judul = buatElemenSvg("title", {}, provinsi + ": " + format(v0) + " ke " + format(v1));
    garis.append(judul);
    garis.style.cursor = "pointer";
    garis.addEventListener("mouseenter", () => sorot(garis, provinsi, v0, v1, true));
    garis.addEventListener("mouseleave", () => sorot(garis, provinsi, v0, v1, false));
    garis.addEventListener("focus", () => sorot(garis, provinsi, v0, v1, true));
    garis.addEventListener("blur", () => sorot(garis, provinsi, v0, v1, false));
    indukSvg.append(garis);
  }
}

/**
 * Render tabel peringkat sortable + pencarian + status kosong.
 * Klik header: kolom baru -> menurun; kolom sama -> arah berbalik.
 * @param {Element} elemenInduk wadah tabel
 * @param {object[]} barisAwal entri peringkat.json (hanya array per peubah;
 * kunci non-array seperti matriks_transisi_4x4/transisi_kuartil_2015_2025 diabaikan pemanggil)
 * @param {{kolom:string[],kolomAwal:string,arahAwal:string,konteks?:{tahun:number,peubah:string}}} [opsi] daftar kolom + status awal + konteks tautan peta
 * @returns {{bacaStatus:function,pasangKonteks:function}} pegangan baca status {kolom, arah, jumlah} + pasangKonteks(konteks) untuk menyegarkan tautan peta
 */
export function renderTabelPeringkat(elemenInduk, barisAwal, opsi = {}) {
  const kolom = opsi.kolom ?? ["wilayah", "provinsi", "nilai_2015", "nilai_2025", "perubahan_absolut", "perubahan_persen", "cagr", "volatilitas"];
  const status = { kolom: opsi.kolomAwal ?? "perubahan_persen", arah: opsi.arahAwal ?? ARAH_MENURUN, kunci: "" };
  elemenInduk.innerHTML = "";
  const input = document.createElement("input");
  input.type = "search";
  const info = document.createElement("p");
  info.setAttribute("role", "status");
  const tabel = document.createElement("table");
  elemenInduk.append(input, info, tabel);

  function gambar() {
    const tampil = urutkanBarisPeringkat(saringBarisPeringkat(barisAwal, status.kunci), status.kolom, status.arah);
    tabel.innerHTML = "";
    const barisKepala = document.createElement("tr");
    for (const k of kolom) {
      const th = document.createElement("th");
      const tombol = document.createElement("button");
      tombol.textContent = k === status.kolom ? `${k} ${status.arah === ARAH_MENAIK ? "▲" : "▼"}` : k;
      tombol.addEventListener("click", () => {
        status.arah = k === status.kolom ? balikArah(status.arah) : ARAH_MENURUN;
        status.kolom = k;
        gambar();
      });
      th.append(tombol);
      barisKepala.append(th);
    }
    tabel.append(barisKepala);
    for (const r of tampil) {
      const tr = document.createElement("tr");
      for (const k of kolom) {
        const td = document.createElement("td");
        const nilai = r[k];
        td.textContent = k === "cagr" ? formatNilaiCagr(nilai) : String(nilai ?? "-");
        if (typeof nilai === "number") td.setAttribute("data-angka", "");
        if (opsi.konteks && k === kolom[0] && r.provinsi) {
          const tautan = document.createElement("a");
          tautan.className = "tautan-peta";
          tautan.href = tautanKe("peta", {
            tahun: opsi.konteks.tahun,
            peubah: opsi.konteks.peubah,
            provinsi: r.provinsi,
          });
          tautan.textContent = "Lihat di peta";
          td.append(" ", tautan);
        }
        tr.append(td);
      }
      tabel.append(tr);
    }
    info.textContent = tampil.length === 0 ? teksStatusKosong(status.kunci) : `${tampil.length} wilayah`;
  }

  input.addEventListener("input", () => {
    status.kunci = input.value;
    gambar();
  });
  gambar();
  return {
    bacaStatus: () => ({ ...status, jumlah: saringBarisPeringkat(barisAwal, status.kunci).length }),
    pasangKonteks: (konteks) => {
      opsi.konteks = konteks;
      gambar();
    },
  };
}

/**
 * Muat berkas analisis untuk satu peubah (seri + sebaran + peringkat array).
 * @param {string} kunciPeubah kunci peubah
 * @param {{seri:string,sebaran:string,peringkat:string}} tautan URL tiga JSON
 * @returns {Promise<{seriPeubah:object,sebaranPeubah:object,baris:object[]}>}
 */
export async function muatDataAnalisis(kunciPeubah, tautan) {
  const hasil = await Promise.allSettled([
    ambilJson(tautan.seri), ambilJson(tautan.sebaran), ambilJson(tautan.peringkat),
  ]);
  const seri = hasil[0].status === "fulfilled" ? hasil[0].value : null;
  const sebaran = hasil[1].status === "fulfilled" ? hasil[1].value : null;
  const peringkat = hasil[2].status === "fulfilled" ? hasil[2].value : null;
  if (hasil.every((h) => h.status === "rejected")) throw new Error("muatDataAnalisis: seluruh berkas gagal dimuat");
  const mentah = peringkat?.[kunciPeubah];
  return { seriPeubah: seri?.[kunciPeubah] ?? {}, sebaranPeubah: sebaran?.[kunciPeubah] ?? {}, baris: Array.isArray(mentah) ? mentah : [] };
}
