const $ = (id) => document.getElementById(id);

const models = {
  M1: {
    label: "IID area + IID waktu",
    equation: "yᵢₜ ~ Beta(μᵢₜκ, (1 − μᵢₜ)κ)\nlogit(μᵢₜ) = xᵢₜ′β + uᵢ + ηᵢₜ",
    description: "Model dasar. Perbedaan tetap antarwilayah dan sisa variasi wilayah-tahun dimodelkan saling bebas.",
    area: "IID · uᵢ ~ N(0, σᵥ²)", areaMeaning: "Variasi acak antarwilayah",
    time: "IID · ηᵢₜ ~ N(0, σ²)", timeMeaning: "Variasi acak wilayah-tahun",
    visualArea: "Efek area saling bebas", visualTime: "Efek waktu saling bebas",
    metrics: { logLik: "5.746,689", aic: "−11.453,377", bic: "−11.344,680", caic: "−12.861,183", k: "20" },
    status: "Sertifikat valid, estimasi berada di dalam batas parameter.", statusClass: "fit-ok",
  },
  M2: {
    label: "IID area + AR(1) per area",
    equation: "yᵢₜ ~ Beta(μᵢₜκ, (1 − μᵢₜ)κ)\nlogit(μᵢₜ) = xᵢₜ′β + uᵢ + ηᵢₜ\nηᵢₜ = φₜηᵢ,ₜ₋₁ + εᵢₜ",
    description: "Efek area tetap IID. Efek waktu mengikuti AR(1) di dalam setiap area, dengan inovasi yang saling bebas antararea.",
    area: "IID · uᵢ ~ N(0, σᵥ²)", areaMeaning: "Variasi acak antarwilayah",
    time: "AR(1) · ηᵢₜ = φₜηᵢ,ₜ₋₁ + εᵢₜ", timeMeaning: "Korelasi waktu dalam area; inovasi εᵢₜ",
    visualArea: "Efek area saling bebas", visualTime: "Nilai tahun berurutan berkorelasi",
    metrics: { logLik: "6.136,938", aic: "−12.231,877", bic: "−12.117,745", caic: "−14.821,450", k: "21" },
    status: "Angka pada rekap adalah fallback dari HTML karena fit tersimpan lain tidak valid. φₜ menyentuh batas 0,95; jangan anggap estimasi ini final.", statusClass: "fit-bound",
  },
  M3: {
    label: "SAR area + IID waktu",
    equation: "yᵢₜ ~ Beta(μᵢₜκ, (1 − μᵢₜ)κ)\nlogit(μᵢₜ) = xᵢₜ′β + uᵢ + ηᵢₜ\nu ~ N(0, σᵥ² (I − ρW)⁻¹(I − ρW)⁻ᵀ)",
    description: "Efek area SAR menghubungkan wilayah melalui matriks bobot W. Efek wilayah-tahun tetap IID. Fit yang direkap memakai W jarak 110 km.",
    area: "SAR · Σᵤ = σᵥ²(I − ρW)⁻¹(I − ρW)⁻ᵀ", areaMeaning: "Dependensi area mengikuti W dan parameter ρ",
    time: "IID · ηᵢₜ ~ N(0, σ²)", timeMeaning: "Variasi acak wilayah-tahun",
    visualArea: "Efek area terhubung oleh bobot W", visualTime: "Efek waktu saling bebas",
    metrics: { logLik: "5.774,982", aic: "−11.507,963", bic: "−11.393,831", caic: "Tidak tersedia", k: "21" },
    status: "Sertifikat valid dan interior. Rekap memakai bobot jarak 110 km.", statusClass: "fit-ok",
  },
  M5: {
    label: "SAR area + AR(1) per area · SEBLUP Rao–Yu",
    equation: "yᵢₜ ~ Beta(μᵢₜκ, (1 − μᵢₜ)κ)\nlogit(μᵢₜ) = xᵢₜ′β + uᵢ + ηᵢₜ\nu ~ N(0, σᵥ² (I − ρW)⁻¹(I − ρW)⁻ᵀ)\nηᵢₜ = φₜηᵢ,ₜ₋₁ + εᵢₜ",
    description: "Menggabungkan dependensi area SAR dan AR(1) waktu khusus per area. Inilah struktur gabungan yang dituju, tetapi fit yang tersimpan belum lolos sertifikat validitas.",
    area: "SAR · Σᵤ = σᵥ²(I − ρW)⁻¹(I − ρW)⁻ᵀ", areaMeaning: "Dependensi area mengikuti W dan parameter ρ",
    time: "AR(1) · ηᵢₜ = φₜηᵢ,ₜ₋₁ + εᵢₜ", timeMeaning: "Korelasi waktu di dalam setiap area",
    visualArea: "Efek area terhubung oleh bobot W", visualTime: "Nilai tahun berurutan berkorelasi",
    metrics: { logLik: "6.162,900", aic: "−12.281,800", bic: "−12.162,233", caic: "−14.962,949", k: "22" },
    status: "Sertifikat fit tidak valid. log κ dan parameter dependensi menyentuh batas; gradien 28,3. Estimasi ini belum layak menjadi hasil final.", statusClass: "fit-warn",
  },
};

const criteria = {
  likelihood: {
    formula: "ℓc = Σᵢ₌₁ⁿ [(μκ−1) log(y) + ((1−μ)κ−1) log(1−y) − log B(μκ,(1−μ)κ)]",
    text: "Likelihood Beta bersyarat memakai respons y, rerata μ, dan presisi κ. logLik pada rekap adalah likelihood model yang dioptimalkan dengan pendekatan Laplace. Nilai lebih besar menunjukkan fit relatif lebih baik pada data dan likelihood yang sama.",
  },
  aic: {
    formula: "AIC = −2 logLik + 2k",
    text: "k adalah jumlah parameter yang diestimasi. Dari rekap, k = 20 untuk M1, 21 untuk M2/M3, dan 22 untuk M5. AIC yang lebih kecil lebih baik hanya saat likelihood, respons, dan observasi yang dibandingkan sama.",
  },
  bic: {
    formula: "BIC = −2 logLik + k log(n),   n = 1.694 observasi",
    text: "BIC memberi penalti kompleksitas sebesar log(n) untuk setiap parameter. Angka n adalah jumlah observasi wilayah-tahun, bukan jumlah wilayah. BIC lebih kecil lebih baik pada himpunan fit yang sebanding.",
  },
  caic: {
    formula: "cAIC = −2ℓcond + 2 df̂,   df̂ = tr(Hpen⁻¹ Hunpen)",
    text: "cAIC menilai prediksi bersyarat setelah efek acak ikut dimasukkan. Implementasi stmmlib memakai likelihood Beta bersyarat dan derajat bebas efektif dari matriks informasi terpenalti. Nilai M3 tidak tersedia. Jangan mencampur cAIC dengan AIC marginal sebagai satu peringkat.",
  },
};

function renderModel(key) {
  const model = models[key];
  $("beta-model-label").textContent = `${key} · ${model.label}`;
  $("beta-equation").textContent = model.equation;
  $("beta-model-description").textContent = model.description;
  $("beta-area-visual").textContent = model.visualArea;
  $("beta-time-visual").textContent = model.visualTime;
  const body = $("beta-components");
  body.replaceChildren();
  [["Area", model.area, model.areaMeaning], ["Waktu", model.time, model.timeMeaning], ["Presisi Beta", "κ = φ > 0", "Mengatur ketelitian/sebaran respons Beta"]].forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => { const td = document.createElement("td"); td.textContent = value; tr.append(td); });
    body.append(tr);
  });
  const metrics = $("beta-fit-metrics");
  metrics.replaceChildren();
  [["logLik", model.metrics.logLik], ["AIC", model.metrics.aic], ["BIC", model.metrics.bic], ["cAIC", model.metrics.caic]].forEach(([label, value]) => {
    const item = document.createElement("div"); item.className = "beta-metric";
    const name = document.createElement("span"); name.textContent = label;
    const result = document.createElement("strong"); result.textContent = value;
    item.append(name, result); metrics.append(item);
  });
  const status = $("beta-fit-status"); status.className = `beta-fit-status ${model.statusClass}`; status.textContent = model.status;
  document.querySelectorAll("[data-beta-model]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.betaModel === key)));
}

function renderCriterion(key) {
  const item = criteria[key];
  $("beta-criterion-formula").textContent = item.formula;
  $("beta-criterion-description").textContent = item.text;
  document.querySelectorAll("[data-beta-criterion]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.betaCriterion === key)));
}

document.querySelectorAll("[data-beta-model]").forEach((button) => button.addEventListener("click", () => renderModel(button.dataset.betaModel)));
document.querySelectorAll("[data-beta-criterion]").forEach((button) => button.addEventListener("click", () => renderCriterion(button.dataset.betaCriterion)));
renderModel("M5");
renderCriterion("likelihood");
