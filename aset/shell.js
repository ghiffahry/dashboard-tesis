/**
 * shell.js - header identik untuk keempat halaman dashboard.
 * renderShell(halamanAktif, opsi) menyisipkan markup header ke #shell;
 * aria-current="page" otomatis hanya di tautan halaman aktif.
 * markupShell murni (string) agar bisa diuji di Node.
 */

const DAFTAR_HALAMAN = [
  { nama: "index", label: "Beranda", href: "index.html" },
  { nama: "peta", label: "Peta", href: "peta.html" },
  { nama: "analisis", label: "Analisis", href: "analisis.html" },
  { nama: "metode", label: "Metode", href: "metode.html" },
];

/**
 * Bangun markup header (string) tanpa menyentuh DOM.
 * @param {string} halamanAktif nama halaman aktif ("index"|"peta"|"analisis"|"metode")
 * @param {{cari?:boolean}} [opsi] cari=true menambah tombol cari (khusus peta)
 * @returns {string} markup <header class="topbar">...</header>
 */
export function markupShell(halamanAktif, opsi = {}) {
  const tautan = DAFTAR_HALAMAN.map((h) => {
    const aktif = h.nama === halamanAktif;
    return `    <a href="${h.href}" class="pil"${aktif ? ' aria-current="page"' : ""}>${h.label}</a>`;
  }).join("\n");
  const tombolCari = opsi.cari
    ? '\n  <button class="ikon-cari" id="tombol-cari" type="button" aria-label="Fokus ke pencarian peubah">Cari</button>'
    : "";
  return `<header class="topbar">
  <a class="logo" href="index.html" aria-label="Ruang Data Sumatera">
    <svg class="logo-mark" viewBox="0 0 40 40" aria-hidden="true"><path d="M8 7h24v16L20 34 8 23z"/><path d="M14 12h12M14 17h8M20 22v7"/></svg>
    <span class="logo-copy"><strong>Ruang Data</strong><small>DASHBOARD TESIS · SUMATERA</small></span>
  </a>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigasi-utama" aria-label="Buka navigasi"><span>☰</span></button>
  <nav id="navigasi-utama" aria-label="Navigasi utama">
${tautan}
  </nav>${tombolCari}<button class="theme-toggle" type="button" aria-label="Ganti tema" title="Ganti tema">☾ Gelap</button>
</header>`;
}

/**
 * Sisipkan header ke elemen #shell.
 * @param {string} halamanAktif nama halaman aktif
 * @param {{cari?:boolean}} [opsi] lihat markupShell
 * @returns {Element|null} elemen header, atau null bila #shell absen
 */
export function renderShell(halamanAktif, opsi = {}) {
  const wadah = document.getElementById("shell");
  if (!wadah) return null;
  wadah.innerHTML = markupShell(halamanAktif, opsi);
  const kepala = wadah.firstElementChild;
  const tombol = kepala?.querySelector(".menu-toggle");
  const nav = kepala?.querySelector("nav");
  const tombolTema = kepala?.querySelector(".theme-toggle");
  const akar = document.documentElement;
  const temaSimpan = globalThis.localStorage?.getItem("eda-tema") || "terang";
  akar.dataset.tema = temaSimpan;
  function perbaruiTema() {
    if (!tombolTema) return;
    const gelap = akar.dataset.tema === "gelap";
    tombolTema.textContent = gelap ? "☀ Terang" : "☾ Gelap";
    tombolTema.setAttribute("aria-label", gelap ? "Aktifkan tema terang" : "Aktifkan tema gelap");
  }
  perbaruiTema();
  tombolTema?.addEventListener("click", () => {
    akar.dataset.tema = akar.dataset.tema === "gelap" ? "terang" : "gelap";
    try { globalThis.localStorage?.setItem("eda-tema", akar.dataset.tema); } catch { /* penyimpanan tema opsional */ }
    perbaruiTema();
  });
  tombol?.addEventListener("click", () => {
    const terbuka = tombol.getAttribute("aria-expanded") !== "true";
    tombol.setAttribute("aria-expanded", String(terbuka));
    tombol.setAttribute("aria-label", terbuka ? "Tutup navigasi" : "Buka navigasi");
    nav?.classList.toggle("is-open", terbuka);
  });
  kepala?.querySelectorAll("nav a").forEach((tautan) => {
    tautan.addEventListener("click", () => {
      const query = globalThis.location?.search || "";
      if (query) tautan.href += query;
    });
  });
  return kepala;
}
