import { renderShell } from "./shell.js";
import { renderFooter, SUMBER_DATA } from "./umum.js";

renderShell("draft");
renderFooter(document.getElementById("info-build"), { sumber: SUMBER_DATA });

const src = "dokumen/draft-seminar-hasil.pdf";
const frame = document.getElementById("draft-pdf-viewer");
const pageSelect = document.getElementById("pdf-page");
const zoomSelect = document.getElementById("pdf-zoom");
const preview = document.getElementById("pdf-canvas-preview");
const previewStatus = document.getElementById("pdf-preview-status");
const canvas = document.getElementById("pdf-page-canvas");
const totalFallback = 11;
const isNarrow = window.matchMedia("(max-width: 760px)");
const pdfJsVersion = "5.4.624";
const pdfJsBase = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfJsVersion}/build/`;
let pdfDocument = null;
let renderTask = null;
let resizeObserver = null;

for (let i = 1; i <= totalFallback; i++) {
  const option = document.createElement("option");
  option.value = String(i);
  option.textContent = String(i);
  pageSelect.append(option);
}

function setPageButtons(total = pdfDocument?.numPages || totalFallback) {
  document.getElementById("pdf-prev").disabled = Number(pageSelect.value) <= 1;
  document.getElementById("pdf-next").disabled = Number(pageSelect.value) >= total;
  const count = document.querySelector(".draft-page-controls label[for='pdf-page'] span");
  if (count) count.textContent = ` dari ${total}`;
}

function fitScale(page, width) {
  const base = page.getViewport({ scale: 1 });
  const selected = zoomSelect.value;
  if (selected !== "page-fit") return Number(selected) / 100;
  return Math.max(0.45, Math.min(1.5, (width - 24) / base.width));
}

async function renderPreviewPage() {
  if (!pdfDocument || !isNarrow.matches) return;
  const pdfPage = await pdfDocument.getPage(Number(pageSelect.value));
  const surface = canvas.parentElement;
  const availableWidth = surface.clientWidth || preview.clientWidth || window.innerWidth;
  const scale = fitScale(pdfPage, availableWidth);
  const viewport = pdfPage.getViewport({ scale });
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);
  if (renderTask) {
    renderTask.cancel();
    renderTask = null;
  }
  canvas.width = Math.ceil(viewport.width * outputScale);
  canvas.height = Math.ceil(viewport.height * outputScale);
  canvas.style.width = `${Math.ceil(viewport.width)}px`;
  canvas.style.height = `${Math.ceil(viewport.height)}px`;
  canvas.setAttribute("aria-label", `Halaman ${pageSelect.value} dari ${pdfDocument.numPages} naskah Seminar Hasil`);
  const context = canvas.getContext("2d", { alpha: false });
  context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
  renderTask = pdfPage.render({ canvasContext: context, viewport });
  try {
    await renderTask.promise;
    previewStatus.textContent = `Halaman ${pageSelect.value} dari ${pdfDocument.numPages}`;
  } catch (error) {
    if (error?.name !== "RenderingCancelledException") throw error;
  } finally {
    renderTask = null;
  }
  setPageButtons(pdfDocument.numPages);
}

function navigate() {
  const page = Number(pageSelect.value || 1);
  if (pdfDocument && isNarrow.matches) {
    renderPreviewPage().catch(showPreviewFallback);
  } else {
    frame.src = `${src}#page=${page}&zoom=${zoomSelect.value}`;
  }
  setPageButtons();
}

function showPreviewFallback(error) {
  console.error("Pratinjau PDF tidak dapat dimuat:", error);
  preview.hidden = true;
  frame.hidden = false;
  previewStatus.textContent = "Pratinjau tidak dapat dimuat. Buka PDF di tab baru atau unduh berkas.";
  document.querySelector(".draft-viewer-note").textContent = "Pratinjau PDF tidak tersedia di perangkat ini. Unduh PDF untuk membukanya di aplikasi pembaca.";
}

async function startMobilePreview() {
  if (!isNarrow.matches) return;
  preview.hidden = false;
  frame.hidden = true;
  previewStatus.textContent = "Memuat pratinjau naskah…";
  try {
    const pdfjs = await import(`${pdfJsBase}pdf.min.mjs`);
    pdfjs.GlobalWorkerOptions.workerSrc = `${pdfJsBase}pdf.worker.min.mjs`;
    const url = new URL(src, document.baseURI).href;
    pdfDocument = await pdfjs.getDocument({ url }).promise;
    pageSelect.replaceChildren();
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = String(i);
      pageSelect.append(option);
    }
    pageSelect.value = "1";
    previewStatus.textContent = `Naskah siap dibaca · ${pdfDocument.numPages} halaman`;
    await renderPreviewPage();
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => renderPreviewPage().catch(showPreviewFallback));
      resizeObserver.observe(preview);
    }
  } catch (error) {
    showPreviewFallback(error);
  }
}

pageSelect.addEventListener("change", navigate);
zoomSelect.addEventListener("change", navigate);
document.getElementById("pdf-prev").addEventListener("click", () => {
  pageSelect.value = String(Math.max(1, Number(pageSelect.value) - 1));
  navigate();
});
document.getElementById("pdf-next").addEventListener("click", () => {
  const total = pdfDocument?.numPages || totalFallback;
  pageSelect.value = String(Math.min(total, Number(pageSelect.value) + 1));
  navigate();
});
setPageButtons();
startMobilePreview();
isNarrow.addEventListener("change", () => {
  if (isNarrow.matches) startMobilePreview();
  else {
    preview.hidden = true;
    frame.hidden = false;
    resizeObserver?.disconnect();
    navigate();
  }
});

document.getElementById("pdf-fullscreen").addEventListener("click", async () => {
  const target = document.querySelector(".draft-viewer-full");
  const note = document.querySelector(".draft-viewer-note");
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await target.requestFullscreen();
  } catch {
    note.textContent = "Mode layar penuh tidak tersedia di browser ini. Gunakan Unduh PDF untuk membuka berkas di aplikasi pembaca.";
  }
});
