/**
 * uji-node.mjs — runner Node untuk seluruh kasus uji.html (12 kasus spec 32).
 * Stub minimal: document (innerHTML saja), matchMedia, requestAnimationFrame.
 * Jalankan: node tests/uji-node.mjs  (exit 0 bila semua PASS)
 */
import { formatProporsiSebagaiPersen, formatDesimalId, hitungCAGR, hitungBatasKuantil, warnaDariKuantil, hitungNaik } from "../aset/format.js";
import { bacaState, tautanKe } from "../aset/state.js";
import { markupShell, renderShell } from "../aset/shell.js";
import { urutkanBarisPeringkat, balikArah, saringBarisPeringkat, teksStatusKosong, ARAH_MENURUN, ARAH_MENAIK } from "../aset/analisis.js";

const hasil = [];
function uji(nama, lulus, detail = "") {
  hasil.push({ nama, lulus: Boolean(lulus), detail });
}

const contohBaris = [
  { wilayah: "Bengkulu Tengah", provinsi: "Bengkulu", perubahan_persen: 16.9268, cagr: 0.0158 },
  { wilayah: "Kota X", provinsi: "Aceh", perubahan_persen: -17.6, cagr: "TIDAK_TERDEFINISI" },
  { wilayah: "Kabupaten Y", provinsi: "Aceh", perubahan_persen: 2.1, cagr: 0.002 },
];

// 1. hitung_batas_kuantil
{
  const data = [10, 20, 30, 40, 50, 60, 70, 80];
  const batas = hitungBatasKuantil(data, 4);
  const menaik = batas.length === 3 && batas[0] < batas[1] && batas[1] < batas[2];
  const ukuran = [0, 1, 2, 3].map((k) => {
    const lo = k === 0 ? -Infinity : batas[k - 1];
    const hi = k === 3 ? Infinity : batas[k];
    return data.filter((v) => (k === 0 ? v <= hi : v > lo && v <= hi)).length;
  });
  const seimbang = Math.max(...ukuran) - Math.min(...ukuran) <= 1;
  const tepi = hitungBatasKuantil([], 4).length === 0
    && hitungBatasKuantil([5, 5, 5, 5], 4).every((b) => b === 5)
    && hitungBatasKuantil([1, 2], 4).length === 1;
  uji("hitung_batas_kuantil", menaik && seimbang && tepi, `batas=${JSON.stringify(batas)} grup=${ukuran}`);
}
// 2. warna_dari_kuantil
{
  const batas = hitungBatasKuantil([10, 20, 30, 40, 50, 60, 70, 80], 4);
  uji("warna_dari_kuantil", warnaDariKuantil(5, batas) === "--navy-100", warnaDariKuantil(5, batas));
}
// 3. warna_dari_kuantil_data_hilang
{
  const batas = hitungBatasKuantil([10, 20, 30, 40, 50, 60, 70, 80], 4);
  uji("warna_dari_kuantil_data_hilang",
    warnaDariKuantil(null, batas) === "--garis" && warnaDariKuantil(undefined, batas) === "--garis");
}
// 4. baca_state_dari_url_kosong (aset/state.js)
{
  const s = bacaState("");
  uji("baca_state_dari_url_kosong",
    s.tahun === 2025 && s.peubah === "Miskin_(persen)" && s.provinsi === "", JSON.stringify(s));
}
// 5. baca_state_dari_url_lengkap (aset/state.js)
{
  const s = bacaState("?tahun=2020&peubah=Gini.indeks_(indeks)&provinsi=Aceh");
  uji("baca_state_dari_url_lengkap",
    s.tahun === 2020 && s.peubah === "Gini.indeks_(indeks)" && s.provinsi === "Aceh", JSON.stringify(s));
}
// 6. format_proporsi_sebagai_persen
{
  const keluar = formatProporsiSebagaiPersen(0.2238);
  uji("format_proporsi_sebagai_persen",
    keluar === "22,4%" && formatProporsiSebagaiPersen(null) === "-", keluar);
}
// 7. hitung_cagr_nilai_awal_nol
{
  const nol = hitungCAGR(0, 0.5, 10);
  const negatif = hitungCAGR(-1, 0.5, 10);
  uji("hitung_cagr_nilai_awal_nol", nol === "TIDAK_TERDEFINISI" && negatif === "TIDAK_TERDEFINISI", String(nol));
}
// 8. render_tabel_pengurutan_menaik_menurun
{
  const turun = urutkanBarisPeringkat(contohBaris, "perubahan_persen", ARAH_MENURUN);
  const arah2 = balikArah(ARAH_MENURUN);
  const naik = urutkanBarisPeringkat(contohBaris, "perubahan_persen", arah2);
  const berbalik = arah2 === ARAH_MENAIK
    && turun[0].wilayah === "Bengkulu Tengah"
    && naik[0].wilayah === "Kota X"
    && turun.map((r) => r.wilayah).join() === naik.map((r) => r.wilayah).reverse().join();
  uji("render_tabel_pengurutan_menaik_menurun", berbalik, turun.map((r) => r.wilayah).join(","));
}
// 9. render_tabel_pencarian_kosong
{
  const kosong = saringBarisPeringkat(contohBaris, "ZZZ-TIDAK-ADA");
  const status = teksStatusKosong("ZZZ-TIDAK-ADA");
  uji("render_tabel_pencarian_kosong", kosong.length === 0 && status.length > 0, status);
}
// 10. tautan_ke_lintas_halaman (aset/state.js)
{
  const tautan = tautanKe("analisis", { tahun: 2020, peubah: "Gini.indeks_(indeks)", provinsi: "Aceh" });
  const bulat = bacaState(tautan.slice("analisis.html".length));
  const lengkap = bulat.tahun === 2020 && bulat.peubah === "Gini.indeks_(indeks)" && bulat.provinsi === "Aceh";
  const tanpaProvinsi = tautanKe("peta", { tahun: 2024, peubah: "Miskin_(persen)", provinsi: "" });
  const bulat2 = bacaState(tanpaProvinsi.slice("peta.html".length));
  const provinsiDihilangi = !tanpaProvinsi.includes("provinsi=")
    && bulat2.tahun === 2024 && bulat2.peubah === "Miskin_(persen)" && bulat2.provinsi === "";
  uji("tautan_ke_lintas_halaman", lengkap && provinsiDihilangi, tautan);
}
// 11. render_shell_aria_current (aset/shell.js)
{
  const pola = (m) => m.replace(/ aria-current="page"/g, "");
  const halaman = ["index", "peta", "analisis", "metode"];
  const markup = halaman.map((n) => markupShell(n, { cari: n === "peta" }));
  const satuAria = markup.every((m) => (m.match(/aria-current="page"/g) || []).length === 1);
  const hrefBenar = markup[0].includes('href="index.html" class="pil" aria-current="page"')
    && markup[1].includes('href="peta.html" class="pil" aria-current="page"')
    && markup[2].includes('href="analisis.html" class="pil" aria-current="page"')
    && markup[3].includes('href="metode.html" class="pil" aria-current="page"');
  const identik = pola(markup[0]) === pola(markup[2]) && pola(markup[2]) === pola(markup[3]);
  const cariKhususPeta = markup[1].includes("tombol-cari")
    && !markup[0].includes("tombol-cari") && !markup[2].includes("tombol-cari") && !markup[3].includes("tombol-cari");
  const logo = markup.every((m) => m.includes('class="logo"') && m.includes("Ruang Data") && m.includes("logo-mark"));
  const wadah = { _html: "", set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; } };
  globalThis.document = { getElementById: () => wadah, documentElement: { dataset: {} } };
  renderShell("peta", { cari: true });
  const html = wadah.innerHTML;
  const domOk = (html.match(/aria-current="page"/g) || []).length === 1
    && html.includes('href="peta.html" class="pil" aria-current="page"')
    && html.includes("tombol-cari");
  uji("render_shell_aria_current", satuAria && hrefBenar && identik && cariKhususPeta && logo && domOk);
}
// 12. hitung_naik_reduced_motion (aset/format.js)
{
  const format = (n) => formatDesimalId(n, 4);
  const el = { textContent: "" };
  globalThis.matchMedia = () => ({ matches: true });
  hitungNaik(el, 0.45, 500, format);
  const langsung = el.textContent === format(0.45);
  let waktu = performance.now();
  globalThis.requestAnimationFrame = (cb) => { const bingkai = waktu; waktu += 16; cb(bingkai); return 1; };
  globalThis.matchMedia = () => ({ matches: false });
  hitungNaik(el, 0.45, 100, format);
  const normal = el.textContent === format(0.45);
  uji("hitung_naik_reduced_motion", langsung && normal, el.textContent);
}

let gagal = 0;
for (const h of hasil) {
  if (!h.lulus) gagal += 1;
  console.log(`${h.lulus ? "PASS" : "FAIL"} ${h.nama}${h.detail ? ` - ${h.detail}` : ""}`);
}
console.log(`${hasil.length - gagal}/${hasil.length} lulus`);
process.exit(gagal === 0 ? 0 : 1);

