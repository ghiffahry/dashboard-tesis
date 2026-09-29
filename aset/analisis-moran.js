import { renderShell } from "./shell.js";
import { renderFooter, SUMBER_DATA } from "./umum.js";
import { bacaState } from "./state.js";
import { ambilJson } from "./cache-data.js";

const state = bacaState(location.search);
const $ = (id) => document.getElementById(id);
const fmt = (value, digits = 2) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const years = Array.from({ length: 11 }, (_, i) => 2015 + i);
const NS = "http://www.w3.org/2000/svg";
renderShell("analisis");
renderFooter($("info-build"), { sumber: SUMBER_DATA });

document.querySelectorAll(".dimension-switch button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".dimension-switch button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  document.querySelectorAll(".dimension-pane").forEach((pane) => pane.classList.toggle("active", pane.dataset.pane === button.dataset.tab));
}));

function svg(name, attrs = {}, text = "") {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function drawLineChart(element, values, label, benchmark) {
  if (!values.length || !values.every((v) => Number.isFinite(v[1]))) {
    element.replaceChildren();
    return;
  }
  const w = 720, h = 290, left = 56, right = 18, top = 24, bottom = 44;
  const numbers = values.map((v) => v[1]).filter(Number.isFinite);
  const lo = Math.min(...numbers, benchmark ?? Infinity), hi = Math.max(...numbers, benchmark ?? -Infinity);
  const pad = (hi - lo || 1) * .18;
  const y = (v) => top + (hi + pad - v) / (hi - lo + 2 * pad) * (h - top - bottom);
  const x = (i) => left + i * (w - left - right) / Math.max(values.length - 1, 1);
  element.replaceChildren();
  for (let j = 0; j < 4; j += 1) {
    const yy = top + j * (h - top - bottom) / 3;
    const value = hi + pad - j * (hi - lo + 2 * pad) / 3;
    element.append(svg("line", { class: "gridline", x1: left, y1: yy, x2: w - right, y2: yy }));
    element.append(svg("text", { x: 2, y: yy + 4 }, fmt(value, 1)));
  }
  if (benchmark !== undefined) element.append(svg("line", { class: "benchmark", x1: left, y1: y(benchmark), x2: w - right, y2: y(benchmark) }));
  element.append(svg("polyline", { class: "series", points: values.map((v, i) => x(i) + "," + y(v[1])).join(" ") }));
  values.forEach((v, i) => {
    const point = svg("circle", { class: "point", cx: x(i), cy: y(v[1]), r: 4 });
    point.setAttribute("class", "point" + (v[2] ? " point-significant" : ""));
    if (element.id === "a-moran-tren") {
      point.setAttribute("tabindex", "0"); point.setAttribute("role", "button");
      point.append(svg("title", {}, v[0] + ": I = " + fmt(v[1], 4) + " · p mentah = " + fmt(v[3], 3) + " · q BH = " + fmt(v[4], 3)));
      const pilihTahun = () => { const year = $("a-tahun"); year.value = v[0]; year.dispatchEvent(new Event("change", {bubbles:true})); $("st-summary").textContent = `Kemiskinan ${v[0]} · Moran’s I ${fmt(v[1],4)} · p mentah ${fmt(v[3],3)} · q BH ${fmt(v[4],3)}. Buka peta untuk melihat pola wilayah.`; $("st-map-link").href = "peta.html?" + new URLSearchParams({tahun:v[0],peubah:"Miskin_(persen)"}); };
      point.addEventListener("click", pilihTahun); point.addEventListener("keydown", (event) => {if(event.key === "Enter" || event.key === " "){event.preventDefault();pilihTahun();}});
    } else point.append(svg("title", {}, v[0] + ": " + fmt(v[1]) + " " + label + (v[2] ? " · p mentah < 0,05" : " · p mentah ≥ 0,05")));
    element.append(point);
    if (i % 2 === 0 || i === values.length - 1) element.append(svg("text", { "text-anchor": "middle", x: x(i), y: h - 10 }, v[0]));
  });
}

function initializeScatter(data, preferredYear) {
  const yearSelect = $("scatter-tahun"), weightSelect = $("scatter-bobot");
  years.forEach((year) => yearSelect.add(new Option(year, year)));
  yearSelect.value = years.includes(Number(preferredYear)) ? String(preferredYear) : "2025";
  const labels = { queen: "Queen", jarak_110_km: "Jarak 110 km", knn_5: "KNN 5 tetangga" };

  function showRegion(point) {
    const panel = $("scatter-detail"), link = document.createElement("a");
    link.className = "pil scatter-map-link";
    link.href = "peta.html?" + new URLSearchParams({tahun: yearSelect.value, peubah: "Miskin_(persen)", provinsi: point.wilayah});
    link.textContent = "Lihat lokasi di peta →";
    panel.replaceChildren(document.createTextNode(point.wilayah + ", " + point.provinsi + " · Kuadran " + point.kuadran +
      " · Nilai wilayah " + fmt(point.x, 2) + " SD · Lag tetangga " + fmt(point.lag, 2) + " SD · "), link);
  }

  function render() {
    const year = yearSelect.value, scheme = weightSelect.value, result = data.skema[scheme]?.[year];
    if (!result || !result.points.length) {
      $("scatter-summary").textContent = "Hasil Moran tidak tersedia untuk pilihan ini.";
      return;
    }
    const pText = result.p_value <= .001 ? "p = 0,001, batas resolusi 999 permutasi" : "p = " + fmt(result.p_value, 3);
    $("scatter-summary").innerHTML =
      '<span><strong>I = ' + fmt(result.moran_i, 4) + '</strong><small>Moran global</small></span>' +
      '<span><strong>' + pText + '</strong><small>uji permutasi satu arah</small></span>' +
      '<span><strong>q = ' + fmt(result.q_bh, 3) + '</strong><small>BH, 33 kombinasi</small></span>' +
      '<span><strong>' + result.jumlah_tanpa_tetangga + '</strong><small>wilayah tanpa tetangga</small></span>';
    $("scatter-definition").textContent = labels[scheme] + ": " + data.metadata.definisi[scheme] +
      " Bobot rata-rata: " + fmt(result.rata_rata_tetangga, 1) + " tetangga per wilayah. Jika ada unit tanpa tetangga, kemiringan garis OLS dapat berbeda dari I Moran global.";

    const plot = $("moran-scatter");
    const isMobile = window.matchMedia("(max-width: 600px)").matches;
    const w = isMobile ? 460 : 860, h = isMobile ? 500 : 470;
    plot.classList.toggle("scatter-plot-mobile", isMobile);
    plot.setAttribute("viewBox", "0 0 " + w + " " + h);
    const box = isMobile ? { l: 68, r: 18, t: 34, b: 76 } : { l: 78, r: 24, t: 30, b: 68 };
    const pw = w - box.l - box.r, ph = h - box.t - box.b;
    const points = result.points;
    const maxX = Math.max(1, ...points.map((p) => Math.abs(p.x))), maxY = Math.max(1, ...points.map((p) => Math.abs(p.lag)));
    const bx = Math.ceil(maxX * 1.08 * 2) / 2, by = Math.ceil(maxY * 1.08 * 2) / 2;
    const x = (v) => box.l + (v + bx) / (2 * bx) * pw, y = (v) => box.t + (by - v) / (2 * by) * ph;
    plot.replaceChildren();
    plot.append(svg("title", {}, "Scatterplot Moran kemiskinan " + year + ", " + labels[scheme]));
    plot.append(svg("desc", {}, points.length + " wilayah. I " + fmt(result.moran_i, 4) +
      "; p permutasi " + fmt(result.p_value, 3) + "; q Benjamini-Hochberg " + fmt(result.q_bh, 3) + "."));
    for (let step = -2; step <= 2; step += 1) {
      const xv = bx * step / 2, yv = by * step / 2, cls = step === 0 ? "scatter-zero" : "scatter-grid";
      plot.append(svg("line", { class: cls, x1: x(xv), y1: box.t, x2: x(xv), y2: h - box.b }));
      plot.append(svg("line", { class: cls, x1: box.l, y1: y(yv), x2: w - box.r, y2: y(yv) }));
      plot.append(svg("text", { class: "scatter-tick", "text-anchor": "middle", x: x(xv), y: h - box.b + 22 }, fmt(xv, 1)));
      plot.append(svg("text", { class: "scatter-tick", "text-anchor": "end", x: box.l - 11, y: y(yv) + 4 }, fmt(yv, 1)));
    }
    [
      ["HH · tinggi-tinggi", box.l + 12, box.t + 22, "start"],
      ["LL · rendah-rendah", box.l + 12, h - box.b - 12, "start"],
      ["LH · rendah-tinggi", w - box.r - 12, box.t + 22, "end"],
      ["HL · tinggi-rendah", w - box.r - 12, h - box.b - 12, "end"],
    ].forEach((q) => plot.append(svg("text", { class: "scatter-quadrant", "text-anchor": q[3], x: q[1], y: q[2] }, q[0])));

    let xy = 0, xx = 0;
    points.forEach((p) => { xy += p.x * p.lag; xx += p.x * p.x; });
    const slope = xx ? xy / xx : 0;
    plot.append(svg("line", { class: "scatter-fit", x1: x(-bx), y1: y(-slope * bx), x2: x(bx), y2: y(slope * bx) }));
    $("scatter-definition").textContent += " Garis putus-putus menunjukkan OLS; kemiringannya " + fmt(slope, 3) + ".";

    function showNearestPoint(event) {
      const rect = plot.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width * w;
      const py = (event.clientY - rect.top) / rect.height * h;
      let nearest = points[0], distance = Infinity;
      points.forEach((point) => {
        const dx = x(point.x) - px, dy = y(point.lag) - py;
        const next = dx * dx + dy * dy;
        if (next < distance) { distance = next; nearest = point; }
      });
      if (nearest) showRegion(nearest);
    }

    points.forEach((point) => {
      const group = svg("g", {
        class: "scatter-point", tabindex: "0", role: "button",
        "aria-label": point.wilayah + ", " + point.provinsi + ", kuadran " + point.kuadran +
          ", kemiskinan baku " + fmt(point.x, 2) + ", lag spasial " + fmt(point.lag, 2),
      });
      group.append(svg("circle", { class: "scatter-hit", cx: x(point.x), cy: y(point.lag), r: 11 }));
      group.append(svg("circle", { class: "scatter-dot", cx: x(point.x), cy: y(point.lag), r: 4 }));
      group.append(svg("title", {}, point.wilayah + ", " + point.provinsi + " · " + point.kuadran));
      group.addEventListener("pointerenter", () => showRegion(point));
      group.addEventListener("focus", () => showRegion(point));
      group.addEventListener("click", () => showRegion(point));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showRegion(point); }
      });
      plot.append(group);
    });
    plot.addEventListener("pointermove", showNearestPoint);
    plot.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") showNearestPoint(event);
    });
    plot.addEventListener("click", (event) => {
      if (!event.target.closest(".scatter-point")) showNearestPoint(event);
    });
    plot.append(svg("text", { class: "scatter-axis-title", "text-anchor": "middle", x: box.l + pw / 2, y: h - 10 }, "Kemiskinan wilayah (skor baku)"));
    plot.append(svg("text", { class: "scatter-axis-title", "text-anchor": "middle", transform: "translate(18 " + (box.t + ph / 2) + ") rotate(-90)" }, "Lag spasial kemiskinan (Wz)"));
    $("scatter-detail").textContent = "Arahkan kursor ke titik atau sentuh dekat titik untuk melihat nama wilayah.";
  }
  yearSelect.addEventListener("change", render);
  $("st-bobot")?.addEventListener("change", render);
  weightSelect.addEventListener("change", render);
  window.addEventListener("resize", render);
  render();
}

Promise.all([
  ambilJson("data/moran.json"), ambilJson("data/seri-tahunan.json"),
  ambilJson("data/indikator.json"), ambilJson("data/scatter-moran.json"),
]).then(([moran, series, indicators, scatter]) => {
  const models = moran.moran_dan_lisa;
  const variableSelect = $("a-peubah"), yearSelect = $("a-tahun");
  indicators.forEach((item) => variableSelect.add(new Option(item.label, item.kunci)));
  variableSelect.value = indicators.some((item) => item.kunci === state.peubah) ? state.peubah : "Miskin_(persen)";
  years.forEach((year) => yearSelect.add(new Option(year, year)));
  yearSelect.value = years.includes(Number(state.tahun)) ? String(state.tahun) : "2025";

  function render() {
    const year = yearSelect.value, variable = variableSelect.value;
    const entry = models[variable]?.[year], poverty = models["Miskin_(persen)"]?.[year], target = poverty;
    $("a-moran").textContent = target ? fmt(target.moran_i, 4) : "-";
    $("a-moran-konteks").textContent = target
      ? "p mentah permutasi = " + fmt(target.p_value, 3) + " · " + (target.signifikan ? "p < 0,05" : "p ≥ 0,05") + " · " + year
      : "Statistik tidak tersedia";
    $("a-interpretasi").textContent = target
      ? (target.moran_i > 0 ? "Asosiasi positif: wilayah bertetangga cenderung memiliki tingkat kemiskinan yang serupa." : "Asosiasi negatif: wilayah bertetangga cenderung memiliki tingkat kemiskinan yang berbeda.")
      : "Tidak ada hasil untuk tahun ini.";
    const selectedIndicator = indicators.find((item) => item.kunci === variable);
    $("a-lisa").textContent = "Peta LISA pada panel ini menunjukkan klaster lokal kemiskinan, bukan indikator pembanding.";
    $("a-pembanding-label").textContent = selectedIndicator?.label || variable;
    $("a-pembanding-moran").textContent = entry ? fmt(entry.moran_i, 4) : "Belum dihitung";
    $("a-pembanding-konteks").textContent = entry ? "p = " + fmt(entry.p_value, 3) + " · " + year : "Tidak tersedia untuk indikator ini";
    $("a-pembanding-catatan").textContent = entry
      ? (entry.signifikan ? "Bukti asosiasi spasial terdeteksi pada α = 0,05." : "Belum ada bukti kuat asosiasi spasial pada α = 0,05.")
      : "Moran tersedia untuk kemiskinan, IPM, Gini, dan TPT. Pilih salah satunya untuk membandingkan Moran global.";
    const counts = { HH: 0, LL: 0, HL: 0, LH: 0, "Tidak Terhubung": 0 };
    Object.values(target?.lisa_per_wilayah || {}).forEach((item) => { if (item.signifikan) counts[item.kuadran] = (counts[item.kuadran] || 0) + 1; });
    $("a-klaster").replaceChildren();
    Object.entries(counts).forEach(([name, count]) => {
      if (!["HH", "LL", "HL", "LH"].includes(name)) return;
      const chip = document.createElement("a"), strong = document.createElement("strong");
      chip.className = "stat-chip lisa-filter-chip";
      chip.href = "peta.html?" + new URLSearchParams({tahun: year, peubah: "Miskin_(persen)", lisa: name});
      chip.setAttribute("aria-label", `Tampilkan ${count} wilayah signifikan kategori ${name} di peta`);
      strong.textContent = name;
      chip.append(strong, document.createTextNode(" · " + count + " wilayah signifikan · buka peta →")); $("a-klaster").append(chip);
    });
    const satuanPersen = selectedIndicator?.satuan === "persen";
    const annual = Object.entries(series[variable]?.Sumatera || {})
      .sort((a, b) => Number(a[0]) - Number(b[0])).map(([yr, value]) => [yr, Number(value) * (satuanPersen ? 100 : 1)]);
    const labelUnit = satuanPersen ? "%" : (selectedIndicator?.satuan || "nilai");
    $("a-tren-label").textContent = selectedIndicator?.label || variable;
    $("a-tren-subjudul").textContent = "Rata-rata lintas kabupaten/kota pada setiap tahun · " + labelUnit;
    drawLineChart($("a-tren"), annual, labelUnit);
    $("a-awal-akhir").textContent = annual.length ? fmt(annual[0][1], satuanPersen ? 1 : 2) + " → " + fmt(annual.at(-1)[1], satuanPersen ? 1 : 2) + (satuanPersen ? "%" : "") : "Tidak tersedia";
    if (!annual.length) $("a-perubahan").textContent = "Deret tahunan tidak tersedia untuk indikator ini.";
    else {
    const delta = annual.at(-1)[1] - annual[0][1];
      $("a-perubahan").textContent = "Perubahan " + (delta >= 0 ? "naik " : "turun ") + fmt(Math.abs(delta), satuanPersen ? 2 : 3) + (satuanPersen ? " poin persentase" : " " + labelUnit) + " dari " + annual[0][0] + " ke " + annual.at(-1)[0] + ".";
    }
    const skemaAktif = $("st-bobot")?.value || "queen";
    const annualMoran = years.map((yr) => {
      const result = scatter.skema[skemaAktif]?.[String(yr)];
      return result ? [String(yr), result.moran_i, result.q_bh <= .05, result.p_value, result.q_bh] : null;
    }).filter(Boolean);
    $("a-moran-tren-subjudul").textContent = "Moran’s I kemiskinan · " + (skemaAktif === "queen" ? "Queen" : skemaAktif === "jarak_110_km" ? "Jarak 110 km" : "KNN 5") + " · respons Y tetap";
    $("a-moran-tren-status").textContent = "Pilih titik untuk membuka peta pada tahun tersebut. Warna titik menunjukkan q BH ≤ 0,05 lintas 33 kombinasi bobot dan tahun.";
    drawLineChart($("a-moran-tren"), annualMoran, "I", -1 / 153);
    const url = new URL(location);
    url.searchParams.set("tahun", year); url.searchParams.set("peubah", variable);
    history.replaceState({}, "", url);
    document.dispatchEvent(new CustomEvent("analisis:update", {detail:{year:Number(year),variable}}));
  }
  variableSelect.addEventListener("change", render);
  yearSelect.addEventListener("change", render);
  initializeScatter(scatter, state.tahun);
  render();
}).catch((error) => {
  console.error("Gagal menyiapkan analisis Moran:", error);
  $("a-moran-konteks").textContent = "Data analisis tidak dapat dimuat.";
  $("scatter-summary").textContent = "Data sensitivitas Moran tidak dapat dimuat.";
});







