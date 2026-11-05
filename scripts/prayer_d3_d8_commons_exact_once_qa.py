#!/usr/bin/env python3
"""One exact original-file acquisition each for D3 and D8; no retries on 429.

These two public-domain paintings remain unpublished. Wikimedia API source
metadata is independently compared against downloaded original bytes, never
mistaken for verified bytes if upload.wikimedia.org rejects the download.
Run only in an explicit read-only workflow with temporary QA artifacts.
"""
from __future__ import annotations
import hashlib,json,os
from pathlib import Path
from urllib.parse import urlencode,urlsplit
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from PIL import Image,ImageOps

OUT=Path(os.environ.get("RUNNER_TEMP","/tmp"))/"prayer-d3-d8-exact-original-qa"
OUT.mkdir(parents=True,exist_ok=True)
WORKS=[
 {"slot":"DOOR-D3","file":"Madonna_of_the_Rosary-Caravaggio_(1607).jpg",
  "sha1":"289a9980d41f280da89bed2bed12dc3c59887d36","width":9803,"height":14480,"size":20767267},
 {"slot":"DOOR-D8","file":"Franceschini,_Marcantonio_-_The_Guardian_Angel_-_Google_Art_Project.jpg",
  "sha1":"9e493cd7fbc8a01c368e7d5f1081d58a2573e16a","width":2501,"height":3304,"size":3030391}
]
AGENT="AdOrientemArtworkQA/2026.11 (one-time exact original image validation; zero fee; contact-free)"

def fetch(url,maxbytes=25_000_000):
    u=urlsplit(url)
    if u.scheme!="https" or u.hostname not in {"commons.wikimedia.org","upload.wikimedia.org"}:
        raise ValueError("Unexpected non-Wikimedia HTTPS original "+url)
    request=Request(url,headers={"User-Agent":AGENT,"Accept":"application/json,image/jpeg,*/*"})
    with urlopen(request,timeout=90) as f:
        r=urlsplit(f.geturl())
        if r.scheme!="https" or r.hostname not in {"commons.wikimedia.org","upload.wikimedia.org"}:
            raise ValueError("Unsafe redirected host")
        blocks=[];count=0
        while True:
            part=f.read(1048576)
            if not part:break
            count+=len(part)
            if count>maxbytes:raise ValueError("Unexpectedly large original")
            blocks.append(part)
        return b"".join(blocks)

report={"schema":"AO_PRAYER_D3_D8_COMMONS_EXACT_ORIGINAL_QA_V1",
 "status":"REVIEW_ONLY_NO_IMAGES_ACTIVATED","originalsAttempted":2,
 "strictOneRequestPerOriginalNoRateLimitRetries":True,"records":[]}
try:
 for art in WORKS:
    rec={"slot":art["slot"],"commonsOriginalFile":art["file"],"expectedSha1":art["sha1"],
         "expectedPixels":[art["width"],art["height"]],"expectedBytes":art["size"],
         "productionEnabled":False,"rights":"PD-Art source claim; jurisdiction review pending",
         "state":"NOT_VERIFIED"}
    report["records"].append(rec)
    try:
        api="https://commons.wikimedia.org/w/api.php?"+urlencode({
          "action":"query","format":"json","formatversion":"2","prop":"imageinfo",
          "iiprop":"url|size|sha1|mime","titles":"File:"+art["file"]})
        data=json.loads(fetch(api,1_000_000))
        pages=data.get("query",{}).get("pages",[])
        if len(pages)!=1 or not pages[0].get("imageinfo"):raise ValueError("Source metadata missing")
        info=pages[0]["imageinfo"][0]
        for k,expected in (("sha1",art["sha1"]),("size",art["size"]),
                           ("width",art["width"]),("height",art["height"]),("mime","image/jpeg")):
            if info.get(k)!=expected:raise ValueError(f"Commons {k} mismatch: {info.get(k)} != {expected}")
        rec["metadataVerified"]=True
        rec["originalURL"]=info["url"]
        # Exactly ONE CDN attempt per item. HTTP 429 is recorded and not retried.
        raw=fetch(info["url"],art["size"]+1)
        sha1=hashlib.sha1(raw).hexdigest()
        if len(raw)!=art["size"] or sha1!=art["sha1"]:raise ValueError("Original binary SHA-1/length mismatch")
        saved=OUT/(art["slot"].lower()+"-original.jpg")
        saved.write_bytes(raw)
        with Image.open(saved) as im:
            if im.format!="JPEG" or im.size!=(art["width"],art["height"]):
                raise ValueError("Decoded original image format/dimensions mismatch")
            im.verify()
        with Image.open(saved) as im:
            preview=ImageOps.exif_transpose(im).convert("RGB")
            preview.thumbnail((850,1200),Image.Resampling.LANCZOS)
            thumbnail=art["slot"].lower()+"-review.jpg"
            preview.save(OUT/thumbnail,quality=89,optimize=True)
        rec.update({"state":"EXACT_ORIGINAL_BYTES_VERIFIED_REVIEW_ONLY",
           "actualBytes":len(raw),"originalSha1Recomputed":sha1,
           "originalSha256Recomputed":hashlib.sha256(raw).hexdigest(),
           "preview":thumbnail,"photoVisualApproval":False})
        print("VERIFIED_EXACT_COMMONS_ORIGINAL",art["slot"],len(raw),sha1,flush=True)
        saved.unlink()
    except HTTPError as e:
        rec["state"]="RATE_LIMIT_HOLD" if e.code==429 else "HTTP_ERROR_HOLD"
        rec["httpStatus"]=e.code
        rec["retryAfter"]=e.headers.get("Retry-After")
        print("COMMONS_SOURCE_HELD",art["slot"],e.code,flush=True)
    except Exception as e:
        rec["state"]="SOURCE_ORIGINAL_NOT_VERIFIED_HOLD"
        rec["error"]=type(e).__name__+": "+str(e)
        print("COMMONS_SOURCE_HELD",art["slot"],rec["error"],flush=True)
finally:
 (OUT/"source-evidence.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 print("EXACT_COMMONS_RESULTS",json.dumps({x["slot"]:x["state"] for x in report["records"]}),flush=True)
