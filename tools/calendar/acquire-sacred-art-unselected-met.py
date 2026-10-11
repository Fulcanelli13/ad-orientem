#!/usr/bin/env python3
"""Fetch newly sourced unselected Calendar original from Met Open Access.

Review-only batch; independently validates original museum API, medium, title,
image dimensions and SHA. Never edits app data or declares curator acceptance.
"""
from __future__ import annotations
import hashlib,io,json,re,time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request,urlopen
from PIL import Image,ImageOps

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/calendar/sacred-art-unselected-acquisition-leads.v1.json"
REGISTRY=ROOT/"data/calendar/sacred-art-candidates.v1.json"
OUT=ROOT/"artifacts/sacred-art-unselected-museum"
DEST=OUT/"originals"
AGENT="AdOrientemSacredArt/2.4 (Metropolitan Museum official CC0 source verification)"
IDS=("met-436578",)
def get(url,limit=35_000_000):
 if not url.startswith("https://"):raise ValueError("HTTPS required")
 last=None
 for attempt in range(3):
  try:
   with urlopen(Request(url,headers={"User-Agent":AGENT,"Accept":"application/json,image/jpeg,*/*"}),timeout=45) as resp:
    if int(resp.headers.get("Content-Length") or "0")>limit:raise ValueError("Too many bytes")
    blob=resp.read(limit+1)
    if len(blob)>limit:raise ValueError("Too many bytes")
    return blob
  except (HTTPError,URLError,OSError,TimeoutError) as err:
   last=err
   if isinstance(err,HTTPError) and err.code not in (403,429,500,502,503,504):break
   time.sleep(2*(attempt+1))
 raise RuntimeError(str(last))
def main():
 DEST.mkdir(parents=True,exist_ok=True)
 data=json.loads(SOURCE.read_text(encoding="utf8"))
 leads={a["id"]:a for a in data["items"]}
 previous={a["id"] for a in json.loads(REGISTRY.read_text(encoding="utf8"))["artworks"]}
 results=[]
 for k in IDS:
  assert k in leads,"Expected sourced museum replacement is absent"
  lead=leads[k]
  row={"id":k,"targetId":lead["targetId"],"source":lead["sourceUrl"],
       "artCuratorApproved":False,"publicationApproved":False,"status":"NOT_ACQUIRED"}
  try:
   if k in previous:
    row["status"]="ALREADY_ACQUIRED_IN_MASTER_REGISTRY"
    results.append(row);continue
   meta=json.loads(get(lead["officialObjectApi"],2_000_000))
   if str(meta.get("objectID"))!=k[4:]:raise ValueError("Wrong official museum ID")
   if meta.get("classification")!="Paintings" or meta.get("isPublicDomain") is not True:
    raise ValueError("Must be museum-qualified public-domain painting")
   if str(meta.get("title") or "").casefold()!=lead["title"].casefold():
    raise ValueError("Object title differs from authenticated source "+str(meta.get("title")))
   if not ("tempera" in str(meta.get("medium","")).lower()):
    raise ValueError("Not a museum-authenticated tempera painting")
   url=meta.get("primaryImage") or ""
   if not re.fullmatch(r"https://images\.metmuseum\.org/CRDImages/[^/]+/original/[^?#]+\.(?:jpg|jpeg)",url,re.I):
    raise ValueError("Official original JPEG unavailable")
   url=quote(url,safe=":/-_.~%")
   raw=get(url)
   with Image.open(io.BytesIO(raw)) as im:
    if im.format!="JPEG":raise ValueError("Original not JPEG")
    im.load();im=ImageOps.exif_transpose(im)
    width,height=im.size
    if max(im.size)<2500:raise ValueError("Original below 2500px source threshold")
    thumb=im.convert("RGB");thumb.thumbnail((250,250))
    import numpy as np
    rgb=np.asarray(thumb,dtype=np.int16)
    chroma=float(np.mean((rgb.max(axis=2)-rgb.min(axis=2))>18))
    if chroma<.07:raise ValueError("Near monochrome")
   dest=DEST/(k+".jpg");dest.write_bytes(raw)
   row.update(status="ORIGINAL_ACQUIRED_REVIEW_ONLY",officialOriginalUrl=url,
       originalSha256=hashlib.sha256(raw).hexdigest(),
       filename=str(dest.relative_to(OUT)),width=width,height=height,
       colourFraction=round(chroma,4),bytes=len(raw),rights="CC0_MUSEUM_API_VERIFIED")
  except Exception as e:
   row.update(status="SOURCE_ORIGINAL_HELD",holdReason=str(e))
  results.append(row)
  print("UNSELECTED_ACQUISITION",json.dumps(row),flush=True)
 report={"schema":"AO_SACRED_ART_UNSELECTED_ACQUISITION_V1",
   "source":"data/calendar/sacred-art-unselected-acquisition-leads.v1.json",
   "rule":"Museum-original byte acquisition is not user approval or production permission.",
   "results":results}
 (OUT/"acquisition.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf8")
 print("ACQUIRED",sum(r["status"]=="ORIGINAL_ACQUIRED_REVIEW_ONLY" for r in results),"OF",len(IDS),flush=True)
if __name__=="__main__":main()
