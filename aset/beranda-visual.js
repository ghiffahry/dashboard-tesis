import { ambilJson } from "./cache-data.js";
import { formatProporsiSebagaiPersen, formatDesimalId } from "./format.js";

const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";
const tahunSelect = $("pilih-tahun"), peubahSelect = $("eksplorasi-peubah");
if (!tahunSelect || !peubahSelect) throw new Error("Kontrol beranda tidak tersedia.");
document.body.classList.add("beranda-lengkap");
const area = document.createElement("div");
area.id = "beranda-visual";
area.innerHTML = `
  <section class="interpretasi insight-banner"><span class="mark">i</span><div><strong id="home-insight-title">Ringkasan wilayah</strong><p id="home-insight">Nilai setiap kabupaten/kota diberi bobot sama. Ringkasan ini bukan estimasi berbobot penduduk.</p></div><a class="pil" id="home-map-link" href="peta.html">Buka peta</a></section>
  <section class="home-kpis" aria-label="KPI wilayah">
    <article><span>Rerata wilayah</span><strong id="home-mean">-</strong><small id="home-mean-note">Bobot sama per wilayah</small></article>
    <article><span>Median</span><strong id="home-median">-</strong><small>Nilai tengah wilayah</small></article>
    <article><span>Minimum–maksimum</span><strong id="home-range">-</strong><small>Rentang antarwilayah</small></article>
    <article><span>Rentang antarkuartil</span><strong id="home-iqr">-</strong><small>Q3 dikurangi Q1</small></article>
    <article><span>Data lengkap</span><strong id="home-n">-</strong><small id="home-missing">dari 154 wilayah</small></article>
  </section>
  <section class="home-viz-grid">
    <article class="insight-card home-chart-card home-span-8"><div class="card-heading"><div><p class="eyebrow">Perubahan tahunan</p><h2>Rerata dan median</h2><p class="catatan-kartu">Arahkan ke titik atau pilih tahun untuk memperbarui ringkasan.</p></div><div class="chart-legend"><span><i class="legend-mean"></i>Rerata</span><span><i class="legend-median"></i>Median</span></div></div><svg id="home-trend" class="data-chart" viewBox="0 0 820 310" role="img" aria-label="Rerata dan median indikator per tahun"><title>Rerata dan median tahunan</title></svg></article>
    <article class="insight-card home-chart-card home-span-4"><p class="eyebrow">Sebaran tahun aktif</p><h2>Histogram wilayah</h2><p class="catatan-kartu" id="home-hist-caption">Pilih batang untuk membaca rentang nilai.</p><svg id="home-histogram" class="data-chart" viewBox="0 0 430 270" role="img" aria-label="Histogram nilai indikator wilayah"></svg></article>
    <article class="insight-card home-chart-card home-span-12"><div class="card-heading"><div><p class="eyebrow">Sebaran tahunan</p><h2>Rentang nilai per tahun</h2><p class="catatan-kartu">Kotak menunjukkan Q1 sampai Q3; garis di tengah menunjukkan median; whisker menunjukkan minimum dan maksimum.</p></div><span class="stat-chip" id="home-box-unit">2015–2025</span></div><svg id="home-boxplot" class="data-chart boxplot-chart" viewBox="0 0 1000 270" role="img" aria-label="Boxplot nilai wilayah menurut tahun"></svg></article>
    <article class="insight-card home-chart-card home-span-6"><div class="card-heading"><div><p class="eyebrow">Tahun aktif · <span id="home-rank-year">2025</span></p><h2>Wilayah tertinggi dan terendah</h2><p class="catatan-kartu">Peringkat berdasarkan nilai indikator, bukan perubahan atau signifikansi.</p></div><label class="home-filter">Provinsi<select id="home-provinsi"><option value="">Semua provinsi</option></select></label></div><div class="home-ranks"><section><h3>Lima tertinggi</h3><ol id="home-high"></ol></section><section><h3>Lima terendah</h3><ol id="home-low"></ol></section></div></article>
    <article class="insight-card home-chart-card home-span-6"><div class="card-heading"><div><p class="eyebrow">Perbandingan periode</p><h2>Perpindahan kuartil</h2><p class="catatan-kartu">Kuartil dihitung ulang pada tiap tahun. Ini perubahan posisi relatif, bukan otomatis perbaikan.</p></div><span class="stat-chip">2015 → <span id="home-transition-year">2025</span></span></div><div id="home-transition" class="transition-grid" role="img" aria-label="Matriks perpindahan kuartil"></div><div class="transition-legend"><span>Baris: kuartil 2015</span><span>Kolom: kuartil tahun aktif</span></div></article>
  </section>`;
document.querySelector("main").querySelector(".dash-grid").before(area);

const svg = (name, attrs = {}, text = "") => { const e = document.createElementNS(NS, name); Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, String(v))); if (text) e.textContent = text; return e; };
const quantile = (xs, p) => { const i=(xs.length-1)*p, lo=Math.floor(i), hi=Math.ceil(i); return xs.length ? xs[lo] + (xs[hi]-xs[lo])*(i-lo) : NaN; };
let data = null, histRange = null, lastFilterKey = "";
function format(v, unit) { if (!Number.isFinite(v)) return "–"; return unit === "persen" ? formatProporsiSebagaiPersen(v) : `${formatDesimalId(v, 2)} ${unit || ""}`.trim(); }
function valuesFor(variable, year) { return Object.entries(data.values[variable]?.[String(year)] || {}).map(([wilayah, raw]) => ({ wilayah, value: raw === null || raw === "DATA_HILANG" ? NaN : Number(raw), province: data.province.get(wilayah) || "" })).filter(x => Number.isFinite(x.value)); }
function stats(rows) { const xs=rows.map(x=>x.value).sort((a,b)=>a-b); return { xs, n:xs.length, mean:xs.reduce((a,b)=>a+b,0)/(xs.length||1), median:quantile(xs,.5), min:xs[0], max:xs.at(-1), q1:quantile(xs,.25), q3:quantile(xs,.75) }; }
function setYear(year) { tahunSelect.value=String(year); tahunSelect.dispatchEvent(new Event("change",{bubbles:true})); }
function drawTrend() {
  const s=$("home-trend"), variable=peubahSelect.value, indicator=data.indicators.find(x=>x.kunci===variable), unit=indicator?.satuan || "nilai";
  const annual=Array.from({length:11},(_,i)=>{const year=2015+i, st=stats(valuesFor(variable,year));return {year,...st};});
  s.replaceChildren();
  const w=820,h=310,p={l:58,r:18,t:22,b:38}, all=annual.flatMap(x=>[x.mean,x.median]).filter(Number.isFinite), lo=Math.min(...all),hi=Math.max(...all),pad=(hi-lo||1)*.15;
  const x=i=>p.l+i*(w-p.l-p.r)/10,y=v=>p.t+(hi+pad-v)/(hi-lo+2*pad)*(h-p.t-p.b);
  for(let j=0;j<4;j++){const yy=p.t+j*(h-p.t-p.b)/3,val=hi+pad-j*(hi-lo+2*pad)/3;s.append(svg("line",{class:"chart-grid",x1:p.l,y1:yy,x2:w-p.r,y2:yy}),svg("text",{class:"chart-tick","text-anchor":"end",x:p.l-8,y:yy+4},format(val,unit)));}
  annual.forEach((d,i)=>{if(i%2===0||i===10)s.append(svg("text",{class:"chart-tick","text-anchor":"middle",x:x(i),y:h-8},String(d.year)));});
  for(const key of ["mean","median"]){const cls=key==="mean"?"home-line-mean":"home-line-median",pts=annual.map((d,i)=>`${i===0?"M":"L"}${x(i)},${y(d[key])}`).join(" ");s.append(svg("path",{class:cls,d:pts}));annual.forEach((d,i)=>{const c=svg("circle",{class:`home-point ${cls}`,cx:x(i),cy:y(d[key]),r:d.year===Number(tahunSelect.value)?5:3.5,tabindex:0,role:"button"});c.append(svg("title",{},`${d.year} · ${key==="mean"?"Rerata":"Median"} ${format(d[key],unit)} · n=${d.n}. Pilih untuk memperbarui tahun.`));c.addEventListener("click",()=>setYear(d.year));c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setYear(d.year);}});s.append(c);});}
  $("home-map-link").href=`peta.html?tahun=${tahunSelect.value}&peubah=${encodeURIComponent(variable)}`;
}
function drawHistogram(rows, unit) {
 const s=$("home-histogram");s.replaceChildren();if(!rows.length)return;const xs=rows.map(x=>x.value),lo=Math.min(...xs),hi=Math.max(...xs),bins=12,w=430,h=270,p={l:52,r:12,t:15,b:42},width=(hi-lo||1)/bins,counts=Array(bins).fill(0);xs.forEach(v=>counts[Math.min(bins-1,Math.floor((v-lo)/(hi-lo||1)*bins))]++);const max=Math.max(...counts),bw=(w-p.l-p.r)/bins;
 for(let i=0;i<bins;i++){const start=lo+i*width,end=i===bins-1?hi:lo+(i+1)*width,bh=counts[i]/max*(h-p.t-p.b),rect=svg("rect",{class:"hist-bar",x:p.l+i*bw+2,y:h-p.b-bh,width:Math.max(1,bw-4),height:bh,rx:3,tabindex:0,role:"button"});rect.append(svg("title",{},`${format(start,unit)} sampai ${format(end,unit)} · ${counts[i]} wilayah. Pilih untuk memfilter peringkat.`));const choose=()=>{histRange=histRange?.index===i?null:{index:i,min:start,max:end,last:i===bins-1};drawRanks(rows,unit);$("home-hist-caption").textContent=histRange?`Peringkat difilter: ${format(histRange.min,unit)} sampai ${format(histRange.max,unit)}. Pilih batang lagi untuk menghapus filter.`:`${rows.length} wilayah · pilih batang untuk memfilter peringkat.`;};rect.addEventListener("click",choose);rect.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose();}});s.append(rect);}
 for(const [val,label] of [[lo,"min"],[hi,"maks"]])s.append(svg("text",{class:"chart-tick","text-anchor":val===lo?"start":"end",x:val===lo?p.l:w-p.r,y:h-12},`${label} ${format(val,unit)}`));
 $("home-hist-caption").textContent=`${rows.length} wilayah · ${bins} kelas · pilih batang untuk memfilter peringkat.`;
}
function drawBoxplot(variable, unit) {
 const s=$("home-boxplot"),w=1000,h=270,p={l:32,r:18,t:18,b:32},years=Array.from({length:11},(_,i)=>2015+i),sets=years.map(y=>({year:y,...stats(valuesFor(variable,y))})),vals=sets.flatMap(a=>[a.min,a.max]),lo=Math.min(...vals),hi=Math.max(...vals),pad=(hi-lo||1)*.08,x=i=>p.l+(i+.5)*(w-p.l-p.r)/11,y=v=>p.t+(hi+pad-v)/(hi-lo+2*pad)*(h-p.t-p.b);s.replaceChildren();
 sets.forEach((d,i)=>{const xx=x(i),bw=35;s.append(svg("line",{class:"box-whisker",x1:xx,y1:y(d.min),x2:xx,y2:y(d.max)}),svg("line",{class:"box-whisker",x1:xx-8,y1:y(d.min),x2:xx+8,y2:y(d.min)}),svg("line",{class:"box-whisker",x1:xx-8,y1:y(d.max),x2:xx+8,y2:y(d.max)}),svg("rect",{class:"box-range",x:xx-bw/2,y:y(d.q3),width:bw,height:Math.max(2,y(d.q1)-y(d.q3)),rx:4,tabindex:0,role:"button"}),svg("line",{class:"box-median",x1:xx-bw/2,y1:y(d.median),x2:xx+bw/2,y2:y(d.median)}),svg("text",{class:"chart-tick","text-anchor":"middle",x:xx,y:h-8},String(d.year)));const hit=svg("rect",{x:xx-bw/2,y:p.t,width:bw,height:h-p.t-p.b,fill:"transparent",tabindex:0,role:"button"});hit.append(svg("title",{},`${d.year}: min ${format(d.min,unit)} · Q1 ${format(d.q1,unit)} · median ${format(d.median,unit)} · Q3 ${format(d.q3,unit)} · maks ${format(d.max,unit)} · n=${d.n}`));hit.addEventListener("click",()=>setYear(d.year));s.append(hit);});
}
function drawRanks(rows, unit) {
 const province=$("home-provinsi").value, filtered=rows.filter(x=>(!province||x.province===province)&&(!histRange||x.value>=histRange.min&&(histRange.last?x.value<=histRange.max:x.value<histRange.max))).sort((a,b)=>a.value-b.value), render=(id,list,reverse)=>{const ol=$(id);ol.replaceChildren();const chosen=(reverse?[...list].reverse():list).slice(0,5);chosen.forEach((x,i)=>{const li=document.createElement("li"),link=document.createElement("a"),val=document.createElement("strong");link.href=`peta.html?tahun=${tahunSelect.value}&peubah=${encodeURIComponent(peubahSelect.value)}&provinsi=${encodeURIComponent(x.wilayah)}`;link.textContent=x.wilayah;val.textContent=format(x.value,unit);li.append(link,val);ol.append(li);});if(!chosen.length){const li=document.createElement("li");li.textContent="Tidak ada data untuk filter ini.";ol.append(li);}};render("home-high",filtered.slice(-5),true);render("home-low",filtered.slice(0,5),false);$("home-rank-year").textContent=tahunSelect.value;
}
function drawTransitions(variable) {
 const root=$("home-transition"),a=valuesFor(variable,2015),b=valuesFor(variable,Number(tahunSelect.value)), amap=new Map(a.map(x=>[x.wilayah,x.value])), bmap=new Map(b.map(x=>[x.wilayah,x.value])), sortedA=a.map(x=>x.value).sort((x,y)=>x-y),sortedB=b.map(x=>x.value).sort((x,y)=>x-y), cls=(v,xs)=>v<=quantile(xs,.25)?1:v<=quantile(xs,.5)?2:v<=quantile(xs,.75)?3:4,matrix=Array.from({length:4},()=>Array(4).fill(0));let complete=0;for(const [name,x] of amap){const y=bmap.get(name);if(Number.isFinite(x)&&Number.isFinite(y)){matrix[cls(x,sortedA)-1][cls(y,sortedB)-1]++;complete++;}}root.replaceChildren();for(let row=0;row<4;row++)for(let col=0;col<4;col++){const n=matrix[row][col],cell=document.createElement("button");cell.type="button";cell.className="transition-cell";cell.style.setProperty("--cell-strength",String(n/Math.max(1,...matrix.flat())));cell.setAttribute("aria-label",`Kuartil ${row+1} tahun 2015 ke kuartil ${col+1} tahun ${tahunSelect.value}: ${n} wilayah`);cell.title=cell.getAttribute("aria-label");cell.innerHTML=`<span>${row+1} → ${col+1}</span><strong>${n}</strong>`;root.append(cell);}$("home-transition-year").textContent=tahunSelect.value;root.setAttribute("aria-label",`${complete} wilayah dengan data lengkap untuk perpindahan kuartil 2015 ke ${tahunSelect.value}`);
}
function render() {
 const variable=peubahSelect.value,year=Number(tahunSelect.value),filterKey=variable+":"+year;if(filterKey!==lastFilterKey){histRange=null;lastFilterKey=filterKey;}const meta=data.indicators.find(x=>x.kunci===variable),unit=meta?.satuan||"nilai",rows=valuesFor(variable,year),st=stats(rows),complete=rows.length;
 $("home-mean").textContent=format(st.mean,unit);$("home-median").textContent=format(st.median,unit);$("home-range").textContent=`${format(st.min,unit)} – ${format(st.max,unit)}`;$("home-iqr").textContent=format(st.q3-st.q1,unit);$("home-n").textContent=`${complete} / 154`;$("home-missing").textContent=`${154-complete} belum tersedia`;$("home-insight-title").textContent=`${meta?.label||variable} · ${year}`;$("home-insight").textContent=`Rerata ${format(st.mean,unit)} dan median ${format(st.median,unit)} dihitung dari ${complete} wilayah dengan data. Setiap wilayah berbobot sama; bukan rata-rata berbobot jumlah penduduk.`;$("home-mean-note").textContent=`n = ${complete} wilayah · ${unit}`;
 drawTrend();drawHistogram(rows,unit);drawBoxplot(variable,unit);drawRanks(rows,unit);drawTransitions(variable);
}
function init() {
 const variables=Object.keys(data.values),rankRows=data.ranks;
 const provinceMap=new Map();for(const row of rankRows[variables[0]]||[])provinceMap.set(row.wilayah,row.provinsi);data.province=provinceMap;
 [...new Set([...provinceMap.values()])].sort((a,b)=>a.localeCompare(b,"id")).forEach(p=>$("home-provinsi").add(new Option(p,p)));
 peubahSelect.addEventListener("change",render);tahunSelect.addEventListener("change",render);$("home-provinsi").addEventListener("change",render);render();
}
Promise.all([ambilJson("data/indikator.json"),ambilJson("data/nilai-wilayah-tahunan.json"),ambilJson("data/peringkat.json")]).then(async ([indicators,values,ranks])=>{
 data={indicators,values,ranks,province:new Map()};
 if(!peubahSelect.options.length || !peubahSelect.value){await new Promise(resolve=>{const observer=new MutationObserver(()=>{if(peubahSelect.value){observer.disconnect();resolve();}});observer.observe(peubahSelect,{childList:true});setTimeout(()=>{observer.disconnect();resolve();},5000);});}
 init();
}).catch(()=>{$("home-insight").textContent="Data tambahan tidak termuat. Ringkasan utama tetap tersedia.";});

