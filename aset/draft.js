import { renderShell } from "./shell.js";
import { renderFooter, SUMBER_DATA } from "./umum.js";
renderShell("draft");renderFooter(document.getElementById("info-build"),{sumber:SUMBER_DATA});
const src="dokumen/draft-contoh.pdf",frame=document.getElementById("draft-pdf-viewer"),page=document.getElementById("pdf-page"),zoom=document.getElementById("pdf-zoom");
function navigate(){frame.src=`${src}#page=${page.value}&zoom=${zoom.value}`;}
page.addEventListener("change",navigate);zoom.addEventListener("change",navigate);
document.getElementById("pdf-prev").addEventListener("click",()=>{page.value=String(Math.max(1,Number(page.value)-1));navigate();});document.getElementById("pdf-next").addEventListener("click",()=>{page.value=String(Math.min(3,Number(page.value)+1));navigate();});document.getElementById("pdf-fullscreen").addEventListener("click",async()=>{const target=document.querySelector(".draft-viewer-card");try{if(document.fullscreenElement)await document.exitFullscreen();else await target.requestFullscreen();}catch{document.getElementById("pdf-file-info").textContent="Mode layar penuh tidak tersedia di browser ini.";}});
fetch(src,{method:"HEAD"}).then(r=>{const size=Number(r.headers.get("content-length"));document.getElementById("pdf-file-size").textContent=Number.isFinite(size)?`Ukuran ${new Intl.NumberFormat("id-ID").format(size)} byte`:`PDF contoh · status HTTP ${r.status}`;}).catch(()=>{document.getElementById("pdf-file-size").textContent="Ukuran berkas tidak dapat diperiksa.";});
