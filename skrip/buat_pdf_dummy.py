from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from pathlib import Path
p=Path(__file__).resolve().parents[1]/"dokumen"/"draft-contoh.pdf"
c=canvas.Canvas(str(p),pagesize=A4)
w,h=A4
navy=colors.HexColor("#123b67"); pale=colors.HexColor("#e8f2fb"); muted=colors.HexColor("#5a6c80")
pages=[("DRAFT TESIS","PDF CONTOH - BUKAN NASKAH TESIS","Dokumen contoh untuk memeriksa tampilan pembaca PDF Dashboard Tesis."),("RINGKASAN","HALAMAN DUMMY","Bagian ini akan diganti dengan abstrak atau ringkasan tesis yang telah disetujui untuk publikasi."),("CATATAN PENGGANTIAN","GANTI SEBELUM DIPUBLIKASIKAN","Jangan unggah data pribadi atau dokumen yang belum boleh dibagikan ke GitHub Pages publik.")]
for title,badge,body in pages:
 c.setFillColor(pale);c.rect(0,h-170,w,170,fill=1,stroke=0)
 c.setFillColor(navy);c.setFont("Helvetica-Bold",11);c.drawString(54,h-48,"RUANG DATA - DASHBOARD TESIS")
 c.setFont("Helvetica-Bold",26);c.drawString(54,h-100,title)
 c.setFillColor(colors.white);c.roundRect(54,h-150,260,26,8,fill=1,stroke=0)
 c.setFillColor(navy);c.setFont("Helvetica-Bold",11);c.drawString(66,h-141,badge)
 c.setFillColor(muted);c.setFont("Helvetica",12);y=h-220
 for line in body.split(" "): pass
 words=body.split();lines=[];line=""
 for word in words:
  if c.stringWidth(line+" "+word,"Helvetica",12)>w-108: lines.append(line);line=word
  else: line=(line+" "+word).strip()
 if line: lines.append(line)
 for text in lines:c.drawString(54,y,text);y-=20
 c.setStrokeColor(pale);c.line(54,58,w-54,58);c.setFont("Helvetica",9);c.drawString(54,40,"DOKUMEN DUMMY - GANTI DENGAN PDF TESIS YANG SUDAH LAYAK PUBLIKASI")
 c.drawRightString(w-54,40,f"Halaman {len(c.getPageNumber().__str__()) if False else pages.index((title,badge,body))+1} dari 3")
 c.showPage()
c.save()
print(p, p.stat().st_size)

