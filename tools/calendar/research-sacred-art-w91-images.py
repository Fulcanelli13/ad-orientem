#!/usr/bin/env python3
"""Verify pixel dimensions and SHA of exact originals in Carmel Lisieux archives.
These files require archive permission and are strictly research only."""
import requests,json,io,hashlib,time
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
S=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w91-lisieux-source-images.v1.json"
OUT=ROOT/"artifacts/sacred-art-w91-private-source-evidence"
Image.MAX_IMAGE_PIXELS=130_000_000
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 rows=[]
 for e in json.loads(S.read_text())["items"]:
  result={k:e[k] for k in ("workId","categories","artist","work","year","sourcePage","rights","framing")}
  try:
   q=requests.get(e["candidate"],timeout=(14,55),headers={"User-Agent":"Mozilla/5.0 (AdOrientemSourceResearch/1.0)"})
   q.raise_for_status();raw=q.content
   with Image.open(io.BytesIO(raw)) as i:i.verify()
   with Image.open(io.BytesIO(raw)) as i:
    i=ImageOps.exif_transpose(i)
    w,h=i.size
    if min(w,h)<e["minimumWidth"]:raise ValueError("File is not sufficient resolution")
    im=i.convert("RGB");im.thumbnail((2200,2200),Image.Resampling.LANCZOS)
    buf=io.BytesIO();im.save(buf,"WEBP",quality=87,method=4);preview=buf.getvalue()
   digest=hashlib.sha256(raw).hexdigest()
   f=e["workId"]+"-"+digest[:14]+".webp"
   (OUT/f).write_bytes(preview)
   result.update(status="EXACT_WORK_DOWNLOADED_RIGHTS_PENDING",photoSourceUrl=q.url,sourceDimensions=[w,h],sourceSha256=digest,sourceBytes=len(raw),previewFile=f,previewSha256=hashlib.sha256(preview).hexdigest(),previewDimensions=[im.width,im.height],approvalForPublicGallery=False)
   print("W91_ACQUIRED",e["workId"],w,h,flush=True)
  except Exception as ex:
   result.update(status="SOURCE_NOT_QUALIFIED",error=str(ex)[:190])
   print("W91_HOLD",e["workId"],result["error"],flush=True)
  rows.append(result)
 report={"schema":"AO_SACRED_ART_W91_ARCHIVAL_PHOTO_QA","rightsNeverGrantedAutomatically":True,"rows":rows,"counts":{"attempted":len(rows),"acquired":sum(x["status"]=="EXACT_WORK_DOWNLOADED_RIGHTS_PENDING" for x in rows),"held":sum(x["status"]!="EXACT_WORK_DOWNLOADED_RIGHTS_PENDING" for x in rows),"potentiallyCoveredCategoriesWithPermission":sum(len(x["categories"]) for x in rows if x["status"]=="EXACT_WORK_DOWNLOADED_RIGHTS_PENDING")}}
 (OUT/"provenance.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
 print("W91_COMPLETE",json.dumps(report["counts"]),flush=True)
if __name__=="__main__":main()
