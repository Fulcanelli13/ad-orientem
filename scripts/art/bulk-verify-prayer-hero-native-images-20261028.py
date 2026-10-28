#!/usr/bin/env python3
"""One-volume technical inspection of all archived approved Prayer artwork masters.

NO human-quality/pristine certification is inferred from this scan.
Produces native-pixel corner evidence and complete painting miniatures for
bulk editorial review. Exact source bytes are NEVER modified or upscaled.
No paid external service; reads pinned GitHub research originals only.
"""
from pathlib import Path
from io import BytesIO
import json, hashlib, urllib.request, time
from PIL import Image,ImageCms,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
REG=ROOT/"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json"
OUT=ROOT/"assets/staged/prayer-pristine-bulk-native-audit-20261028"
OUT.mkdir(parents=True,exist_ok=True)
MAX_SOURCE_BYTES=45000000
reg=json.loads(REG.read_text())
assert len(reg["primary_artworks"])==22
queue=[r for r in reg["primary_artworks"] if r["original"]["archived"]]
assert len(queue)==20
def fetch(row):
  a=row["original"]
  src=a.get("recovered_location") or a
  ref=src.get("ref") or src.get("git_ref")
  path=src.get("path")
  if not ref or not path:raise ValueError("missing pinned Git source ref/path")
  url="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"+ref+"/"+path
  req=urllib.request.Request(url,headers={"User-Agent":"AdOrientem-Research-Image-Integrity/1.0"})
  with urllib.request.urlopen(req,timeout=45) as response: buf=response.read(MAX_SOURCE_BYTES+1)
  if not buf or len(buf)>MAX_SOURCE_BYTES:raise ValueError("empty or oversized source")
  dig=hashlib.sha256(buf).hexdigest()
  if dig!=a["sha256"]:raise ValueError("HASH_MISMATCH expected "+a["sha256"]+" got "+dig)
  with Image.open(BytesIO(buf)) as pic:
    pic.load()
    w,h=pic.size
    if [w,h]!=a["dimensions_px"]:
      raise ValueError("DIMENSION_MISMATCH expected "+str(a["dimensions_px"])+" got "+str((w,h)))
    try:
      img=ImageOps.exif_transpose(pic)
      icc=img.info.get("icc_profile")
      if icc:
        img=ImageCms.profileToProfile(img.convert("RGB"),ImageCms.ImageCmsProfile(BytesIO(icc)),
          ImageCms.createProfile("sRGB"),outputMode="RGB")
        color="embedded ICC transformed to sRGB in PREVIEW ONLY"
      else:
        img=img.convert("RGB")
        color="untagged RGB retained, reference colour not certified"
    except Exception as e:
      img=pic.convert("RGB")
      color="preview ICC fallback, source unchanged; "+str(e)[:90]
  return img,{"sha256_recomputed":dig,"pixels_verified":[w,h],"bytes":len(buf),"source_ref":ref,
              "source_path":path,"icc_preview_handling":color,
              "source_original_never_changed":True}
def sheet(chunk,page):
  # Each item: source whole miniature + 4 genuine native-size 210x210 corner samples.
  W=1170;H=290;T=25
  canv=Image.new("RGB",(W,H*len(chunk)+T),(17,21,26))
  d=ImageDraw.Draw(canv)
  d.text((16,8),"PRAYER ART BULK NATIVE QA / exact-original corners / NOT FINAL PHOTO APPROVAL",fill=(240,225,205))
  for i,(row,img,meta) in enumerate(chunk):
    y=i*H+T
    d.text((14,y+6),row["module_id"]+"  |  "+row["title"][:60],fill=(242,229,210))
    d.text((14,y+27),str(meta["pixels_verified"])+" | SHA256 OK | "+row["batch"],fill=(161,193,191))
    thumb=img.copy();thumb.thumbnail((210,234),Image.Resampling.LANCZOS)
    canv.paste(thumb,(20+(220-thumb.width)//2,y+46+(234-thumb.height)//2))
    w,h=img.size;pix=min(210,w,h)
    boxes=[(0,0),(w-pix,0),(0,h-pix),(w-pix,h-pix)]
    for ix,(xx,yy) in enumerate(boxes):
      tile=img.crop((xx,yy,xx+pix,yy+pix))
      canv.paste(tile,(256+ix*225,y+53))
      d.text((256+ix*225,y+270),["NATIVE TL","NATIVE TR","NATIVE BL","NATIVE BR"][ix],fill=(212,191,163))
  name="bulk-native-corners-"+str(page).zfill(2)+".jpg"
  out=OUT/name
  canv.save(out,"JPEG",quality=90,subsampling=0,optimize=True)
  return {"path":str(out.relative_to(ROOT)),"sha256":hashlib.sha256(out.read_bytes()).hexdigest(),"bytes":out.stat().st_size}
results=[]
complete=[]
for row in queue:
 key=row["module_id"]
 try:
  img,meta=fetch(row)
  complete.append((row,img,meta))
  results.append({"module_id":key,"result":"PASS_EXACT_PINNED_BYTES_AND_DIMENSIONS",**meta,
   "native_visual_quality_certified":False,"external_frame_free_certified":False,
   "photo_rights_certified":False,"pristine_certified":False})
  print("PASS",key,meta["pixels_verified"],flush=True)
 except Exception as e:
  results.append({"module_id":key,"result":"UNRESOLVED_RETRIEVAL_OR_HASH",
    "error":str(e)[:300],"pristine_certified":False,"needs_independent_recovery":True})
  print("HOLD",key,str(e)[:130],flush=True)
pages=[]
for i in range(0,len(complete),5):
 pages.append(sheet(complete[i:i+5],i//5+1))
audit={
 "schema":"AO_PRAYER_ART_BULK_20_MASTER_TECHNICAL_RECHECK_V1",
 "date":"2026-10-28",
 "selection_contract":"All 22 editorial choices unchanged, no production images released",
 "source":"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json",
 "scheduled_originals":20,
 "originals_verified_exact_bytes":sum(x["result"].startswith("PASS") for x in results),
 "originals_requiring_file_recovery":sum(x["result"].startswith("UNRESOLVED") for x in results),
 "pristine_quality_final_certified":0,
 "visual_sheets_are_review_evidence_not_certification":True,
 "no_paid_services":True,"no_upscale":True,"no_artwork_substitution":True,
 "results":results,"native_corner_sheets":pages
}
(OUT/"native-audit.json").write_text(json.dumps(audit,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
print(json.dumps({"status":"NATIVE_BYTES_AUDITED_QUALITY_STILL_PENDING",
 "scheduled":20,"verified":audit["originals_verified_exact_bytes"],
 "unresolved":audit["originals_requiring_file_recovery"],
 "contact_sheets":len(pages),"pristine_released":0},indent=2))
if audit["originals_verified_exact_bytes"]==0:raise SystemExit("No source original could be checked")
