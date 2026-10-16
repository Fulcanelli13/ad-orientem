#!/usr/bin/env python3
"""W87: recover exact earlier museum originals by known SHA256; stage other original paintings separately."""
import hashlib,io,json,importlib.util,traceback
from pathlib import Path
from urllib.parse import urlparse
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location("ao_w87_common",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
a.OUT=ROOT/"docs/research/review-galleries/acquired"
a.ARCHIVE=ROOT/"artifacts/sacred-art-w87"
MANIFEST=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w87-source-specific-acquisition.v1.json"
Image.MAX_IMAGE_PIXELS=250_000_000
def decode(raw):
 with Image.open(io.BytesIO(raw)) as im:im.verify()
 with Image.open(io.BytesIO(raw)) as im:
  im=ImageOps.exif_transpose(im)
  w,h=im.size
  if min(w,h)<900:raise ValueError("Insufficient useful image resolution")
  # Full uncropped painting source, even if the source photo shows an external frame.
  rgb=im.convert("RGB");rgb.thumbnail((2200,2200),Image.Resampling.LANCZOS)
  b=io.BytesIO();rgb.save(b,"WEBP",quality=87,method=4)
  return (w,h),b.getvalue(),rgb.size
def add(row,raw,actual_url,basis,identity,licence,expect=None):
 source_sha=hashlib.sha256(raw).hexdigest()
 if expect and source_sha!=expect:raise ValueError("SHA256 changed from verified prior official source: "+source_sha)
 dimensions,preview,psize=decode(raw)
 if row.get("dimensions") and tuple(row["dimensions"])!=dimensions:raise ValueError("physical source pixel dimensions changed")
 stem=a.fname(row["id"]);name=stem+"-"+source_sha[:16]+".webp"
 preview_path=a.OUT/name
 if not preview_path.exists():preview_path.write_bytes(preview)
 if expect: (a.ARCHIVE/(stem+"-"+source_sha[:16]+".source")).write_bytes(raw)
 return {"categoryIndex":row["index"],"paintingId":row["id"],"artwork":row.get("work"),"sourceUrl":actual_url,
 "sourcePage":row.get("objectUrl") or row.get("sourcePage"),"originalSha256":source_sha,
 "previewSha256":hashlib.sha256(preview).hexdigest(),"originalWidth":dimensions[0],"originalHeight":dimensions[1],
 "previewWidth":psize[0],"previewHeight":psize[1],"originalBytes":len(raw),"previewBytes":len(preview),
 "previewFile":"acquired/"+name,"originalFileSavedInGitHubArtifact":bool(expect),"rightsClass":licence,
 "identityClass":identity,"basis":basis,"publicationApproved":False,"previousHumanRatingInherited":False,
 "hold":row.get("hold")}
def main():
 a.OUT.mkdir(parents=True,exist_ok=True);a.ARCHIVE.mkdir(parents=True,exist_ok=True)
 m=json.loads(MANIFEST.read_text())
 rows=[];failures=[]
 for rec in m["official"]:
  try:
   raw,url=a.fetch(rec["url"])
   rows.append(add(rec,raw,url,"OFFICIAL_IDENTICAL_SHA256_MASTER","MUSEUM_EXACT_OBJECT",rec["rights"],rec["sha256"]))
   print("EXACT_HASHED",rec["index"],rec["id"],len(raw),flush=True)
  except Exception as e:
   failures.append({"index":rec["index"],"id":rec["id"],"reason":str(e)[:250]})
   print("OFFICIAL_HOLD",rec["index"],str(e)[:90],flush=True)
 for rec in m["commons"]:
  try:
   f=a.commons_info(rec["file"])
   if not f["licenseSupported"]:raise ValueError("Commons file-specific reusable terms not verified")
   try:raw,url=a.fetch(f["url"])
   except Exception as e:
    if f.get("display") and f["display"]!=f["url"]:
     raw,url=a.fetch(f["display"])
    else:raise
   rows.append(add(rec,raw,url,"COMMONS_SOURCE_FILE_METADATA_AND_IMAGE_BYTES",rec["kind"],f["license"]))
   print("PROVISIONAL_PHYSICAL_ORIGINAL",rec["index"],rec["id"],len(raw),flush=True)
  except Exception as e:
   failures.append({"index":rec["index"],"id":rec["id"],"reason":str(e)[:250]})
   print("CONDITIONAL_HOLD",rec["index"],str(e)[:90],flush=True)
 report={"schema":"AO_SACRED_ART_W87_VERIFIED_DOWNLOAD_REPORT_V1","historicalRatingFilesUntouched":True,
 "policy":"Conditional photo source has genuine original identity but does not inherit previous physical artwork choice",
 "counts":{"officialExactHashes":sum(x["basis"]=="OFFICIAL_IDENTICAL_SHA256_MASTER" for x in rows),
 "conditionalImageFiles":sum(x["basis"]!="OFFICIAL_IDENTICAL_SHA256_MASTER" for x in rows),
 "filesVerified":len(rows),"failures":len(failures)},
 "rows":rows,"failures":failures}
 (a.OUT/"w87-acquisition-report.v1.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 (a.ARCHIVE/"w87-acquisition-report.v1.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("W87_COMPLETE",json.dumps(report["counts"]),flush=True)
 if report["counts"]["officialExactHashes"]!=len(m["official"]):raise SystemExit("Official exact-master restoration incomplete")
if __name__=="__main__":main()
