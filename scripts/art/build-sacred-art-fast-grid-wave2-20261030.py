#!/usr/bin/env python3
"""Convert all 371 second-wave reviewed photo sources into self-contained 1-click grids."""
from __future__ import annotations
import base64, concurrent.futures, csv, hashlib, io, json, re, time, urllib.request
from pathlib import Path
from PIL import Image, ImageOps
DIR=Path("data/calendar/sacred-art-master-v2")
PROOF=DIR/"fast-grid-371-embedded-photo-proof-20261030.v1.json"
SOURCE=Path("scripts/art/build-sacred-art-fast-grid-first73-20261030.py").read_text()
m=re.search(r"HTML=r'''(.*?)'''",SOURCE,re.S)
if not m:raise RuntimeError("Canonical first-wave grid template absent")
TPL=m.group(1)
USERAGENT="AdOrientemSacredArtAudit/2026 (+https://github.com/Fulcanelli13/ad-orientem)"
def get(url, max_bytes=22_000_000):
 req=urllib.request.Request(url,headers={"User-Agent":USERAGENT,"Accept":"image/jpeg,image/webp,image/png,image/avif,image/*;q=0.8,*/*;q=0.5"})
 with urllib.request.urlopen(req,timeout=22) as resp:
  body=resp.read(max_bytes+1)
  if len(body)>max_bytes:raise ValueError("DOWNLOAD_TOO_LARGE")
  return body
def preview(blob):
 with Image.open(io.BytesIO(blob)) as img:
  img=ImageOps.exif_transpose(img)
  if min(img.size)<120:raise ValueError("THUMBNAIL_TOO_SMALL")
  original=list(img.size)
  img.thumbnail((690,690),Image.Resampling.LANCZOS)
  if img.mode not in ("RGB","L"):img=img.convert("RGB")
  f=io.BytesIO();img.save(f,"JPEG",quality=78,optimize=True,progressive=True)
  content=f.getvalue()
  return ("data:image/jpeg;base64,"+base64.b64encode(content).decode(),
     {"actualDownloadedImageDimensions":original,"reviewPreviewDimensions":list(img.size),
      "previewJpegSha256":hashlib.sha256(content).hexdigest(),
      "downloadedResourceSha256":hashlib.sha256(blob).hexdigest(),
      "previewBytes":len(content)})
def work(row):
 origin=row.get("official_image_original") or row["source_url"]
 thumbnail=row.get("official_image_preview") or ""
 sources=[x for x in (thumbnail,origin) if x and x.startswith("https://")]
 sources=list(dict.fromkeys(sources))
 if not sources:return {"ok":False,"error":"NO_AVAILABLE_IMAGE_URL"}
 err=""
 for src in sources:
  for attempt in range(2):
   try:
    image=get(src)
    uri,metadata=preview(image)
    return {"ok":True,"preview":uri,"from":src,"meta":metadata}
   except Exception as e:
    err=str(e)[:140]
    time.sleep(0.3*(attempt+1))
 return {"ok":False,"error":err,"attemptedUrls":sources}
manifest={"schema":"AO_SACRED_ART_WAVE2_FAST_GRID_EMBEDDED_PREVIEWS_V1",
 "sourceInputs":[],"batchedReviewCount":0,"previewsEmbedded":0,
 "previewsMissing":0,"productionReleases":0,"humanPhotoApprovals":0,
 "reusedFirst73":False,"userEditorialDecisionsChanged":0,"feeEur":0,
 "images":[]}
for batch,num in [(2,"02"),(3,"03")]:
 src=DIR/("first-look-photo-review-batch-"+num+".csv")
 with src.open(encoding="utf-8-sig",newline="") as f:rows=list(csv.DictReader(f))
 expected=200 if batch==2 else 171
 if len(rows)!=expected:raise ValueError("Invalid batch "+num+" count "+str(len(rows)))
 with concurrent.futures.ThreadPoolExecutor(max_workers=12) as exe:
  results=list(exe.map(work,rows))
 cards=[]
 for index,(row,r) in enumerate(zip(rows,results),1):
  img=r.get("preview")
  card={"id":row["physical_work_group"],"title":row.get("title") or "Untitled",
   "artist":row.get("artist") or "Unattributed",
   "sourceUrl":row.get("source_url") or "",
   "module":row.get("module_targets") or "",
   "priorRightsEvidence":row.get("rights_evidence") or "",
   "rightsLabel":row.get("rights_label") or "",
   "sourcePhotoFingerprint":row.get("selected_photo_file_fingerprint") or "",
   "sourceOriginalSha256":row.get("original_sha256") or "",
   "preview":img,"available":bool(img),"error":r.get("error","")}
  cards.append(card)
  manifest["images"].append({"batch":num,"group":card["id"],"imageAvailable":card["available"],
   "sourceUrl":card["sourceUrl"],"imageDownloadedFrom":r.get("from"),
   "error":r.get("error"),**r.get("meta",{})})
 good=sum(x["available"] for x in cards)
 manifest["batchedReviewCount"]+=len(cards)
 manifest["previewsEmbedded"]+=good
 manifest["previewsMissing"]+=len(cards)-good
 manifest["sourceInputs"].append(str(src))
 payload=json.dumps(cards,ensure_ascii=False).replace("<","\\u003c").replace(">","\\u003e")
 html=TPL.replace("__DATA__",payload)
 html=html.replace("Batch 01","Batch "+num).replace("BATCH 01","BATCH "+num)
 html=html.replace('const KEY="ao-sacred-art-fast-grid-b01-v1"','const KEY="ao-sacred-art-fast-grid-b'+num+'-v1"')
 html=html.replace(',"01"].map(esc)',',"'+num+'"].map(esc)')
 html=html.replace("sacred-art-queue1-reviewed-approvals-batch01.csv",
   "sacred-art-queue1-reviewed-approvals-batch"+num+".csv")
 out=Path("docs/SACRED_ART_FAST_GRID_REVIEW_BATCH"+num+"_20261030.html")
 out.write_text(html,encoding="utf-8")
 print("BATCH",num,"embedded",good,"missing",len(cards)-good,"outputMB",round(out.stat().st_size/1e6,2),flush=True)
if manifest["batchedReviewCount"]!=371 or len({x["group"] for x in manifest["images"]})!=371:
 raise RuntimeError("New 371 cannot merge with another batch")
PROOF.write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
print("SUMMARY",manifest["batchedReviewCount"],"embedded",manifest["previewsEmbedded"],"missing",manifest["previewsMissing"],flush=True)
