import { renderShell } from "./shell.js";
import { renderFooter, SUMBER_DATA } from "./umum.js";
renderShell("draft");renderFooter(document.getElementById("info-build"),{sumber:SUMBER_DATA});
const src="dokumen/draft-seminar-hasil.pdf",frame=document.getElementById("draft-pdf-viewer"),page=document.getElementById("pdf-page"),zoom=document.getElementById("pdf-zoom"),total=11;
for(let i=1;i<=total;i++){const o=document.createElement("option");o.value=String(i);o.textContent=String(i);page.append(o)}
function navigate(){frame.src=`${src}#page=${page.value}&zoom=${zoom.value}`;document.getElementById("pdf-prev").disabled=Number(page.value)<=1;document.getElementById("pdf-next").disabled=Number(page.value)>=total;}
page.addEventListener("change",navigate);zoom.addEventListener("change",navigate);document.getElementById("pdf-prev").addEventListener("click",()=>{page.value=String(Math.max(1,Number(page.value)-1));navigate()});document.getElementById("pdf-next").addEventListener("click",()=>{page.value=String(Math.min(total,Number(page.value)+1));navigate()});navigate();
document.getElementById("pdf-fullscreen").addEventListener("click",async()=>{const target=document.querySelector(".draft-viewer-full"),note=document.querySelector(".draft-viewer-note");try{if(document.fullscreenElement)await document.exitFullscreen();else await target.requestFullscreen()}catch{note.textContent="Mode layar penuh tidak tersedia di browser ini. Gunakan tombol Buka tab baru atau Unduh PDF."}});
