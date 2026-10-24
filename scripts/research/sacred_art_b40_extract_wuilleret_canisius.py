#!/usr/bin/env python3
"""B40: losslessly extract the *full-object* Pierre Wuilleret Saint Canisius
illustration from p.6 (PDF page index 5) of Musée gruérien's PUBLIC 2023
educational dossier, preserving photo source/rights holds. Research ONLY.
Do not infer permission to redistribute image in commercial/public app.
"""
from pathlib import Path
import csv,hashlib,json
from urllib.request import Request,urlopen
import fitz
from PIL import Image

URL="https://musee-gruerien.ch/wp-content/uploads/2023/04/Dossier-pedagogique-REFORMES_v2-ID-2671943.pdf"
OUT=Path("artifacts/b40-wuilleret-pierre-canisius-p6-research")
SCHEMA="AO_B40_WUILLERET_CANISIUS_INSTITUTION_PDF_FULL_OBJECT_V1"
FIELDNAMES=["artwork_id","artist","work","date","source_pdf","pdf_page_index",
            "source_printed_page","pdf_sha256","pdf_bytes",
            "embedded_pdf_image_xref","pdf_image_bbox","image_width","image_height",
            "original_image_mime","original_image_bytes","original_image_sha256",
            "full_artwork_illustrated","rights_cleared_for_app","editorial_selected",
            "research_status","hold_reason"]
def sha(b): return hashlib.sha256(b).hexdigest()
def get_pdf():
  req=Request(URL,headers={"User-Agent":"AdOrientemSacredArtResearch/2026 (+https://github.com/Fulcanelli13/ad-orientem)","Accept":"application/pdf"})
  with urlopen(req,timeout=85) as res:
    assert res.status==200
    from urllib.parse import urlsplit
    assert urlsplit(res.geturl()).hostname=="musee-gruerien.ch"
    typ=res.headers.get("Content-Type","").split(";")[0].lower().strip()
    assert typ in {"application/pdf","application/octet-stream"}
    b=res.read(24_000_001)
  assert 1_000<b.__len__()<24_000_001 and b.startswith(b"%PDF")
  return b
def main():
  OUT.mkdir(parents=True,exist_ok=True);(OUT/"originals").mkdir(exist_ok=True)
  results=[]
  try:
    b=get_pdf()
    d=fitz.open(stream=b,filetype="pdf")
    assert len(d)==12,f"Unexpected page count {len(d)}"
    page=d[5]
    words=page.get_text()
    assert "Wuilleret" in words and "Canisius" in words and "1635" in words
    source_images=page.get_image_info(xrefs=True)
    found=[]
    for im in source_images:
      box=fitz.Rect(im["bbox"])
      if (im.get("xref",0)>0 and box.y0<160 and box.height>300 and box.width>200 and im["height"]>700 and im["width"]>450 and im["height"]>im["width"]):
        found.append(im)
    if len(found)!=1: raise ValueError(f"Expected exact one full painting image p.6, found {len(found)}; placements="+str([{"xref":i.get("xref"),"bbox":tuple(i["bbox"]),"wh":(i["width"],i["height"])} for i in source_images])[:1500])
    im=found[0]
    source=d.extract_image(im["xref"])
    ext=source["ext"].lower()
    if ext not in {"jpg","jpeg","png","webp"}: raise ValueError("Unexpected embedded image codec: "+ext)
    photo=source["image"]
    with Image.open(__import__("io").BytesIO(photo)) as p:
      p.verify()
    with Image.open(__import__("io").BytesIO(photo)) as p:
      w,h=p.size
    if w<450 or h<700 or h<=w: raise ValueError(f"Image size/orientation failed {w}x{h}")
    if (w,h)!=(source["width"],source["height"]):raise ValueError("Extracted bytes dimensions inconsistent")
    target=OUT/"originals"/("wuilleret_1635_canisius_musee_gruerien_pdf_page_6."+ext)
    target.write_bytes(photo)
    entry=dict(artwork_id="G30-012",artist="Pierre Wuilleret",work="La Prédication de Saint-Pierre Canisius",date="1635",
      source_pdf=URL,pdf_page_index=5,source_printed_page=6,pdf_sha256=sha(b),pdf_bytes=len(b),
      embedded_pdf_image_xref=im["xref"],pdf_image_bbox=str(list(im["bbox"])),
      image_width=w,image_height=h,original_image_mime=ext,original_image_bytes=len(photo),
      original_image_sha256=sha(photo),full_artwork_illustrated="YES_RESEARCH_ONLY",
      rights_cleared_for_app="NO",editorial_selected="NO",
      research_status="EXACT_FULL_OBJECT_RESEARCH_ILLUSTRATION_FROM_MUSEUM_PUBLIC_EDUCATIONAL_PDF_PENDING_PHOTOGRAPH_RIGHTS",
      hold_reason="Separate reproduction permission for image owned/used in Musée gruérien 2023 educational dossier, not a photo reuse grant")
    results.append(entry)
  except Exception as e:
    raise RuntimeError("NO IMAGE PROMOTION: "+str(e)) from e
  with (OUT/"source-results.csv").open("w",newline="",encoding="utf-8") as f:
    writer=csv.DictWriter(f,fieldnames=FIELDNAMES);writer.writeheader();writer.writerows(results)
  summary={"schema":SCHEMA,"source_candidates":1,"extracted_original_image_bytes":results[0]["original_image_bytes"],
    "exact_object_photo_sources_archived":1,"image_sha256":results[0]["original_image_sha256"],
    "pdf_sha256":results[0]["pdf_sha256"],"page_index":5,"printed_page":6,
    "research_only":True,"photographic_app_rights_approved":False,
    "publication_approvals":0,"editorial_selections":0,"canonical_master_unchanged":True,
    "remote_draft_release_verification_required":True}
  (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
  print("B40_WUILLERET_EXTRACTED",json.dumps(summary),flush=True)
if __name__=="__main__":main()
