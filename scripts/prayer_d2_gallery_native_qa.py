#!/usr/bin/env python3
"""Read-only D2 native CMA photograph QA, strictly not a gallery publication.

One authenticated-origin HTTPS download. Source bytes live only in runner temp
for a separate current-reader Playwright preview; never in public dist or artifacts.
"""
from __future__ import annotations
import hashlib, json, os
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageOps, ImageStat

SOURCE="https://openaccess-cdn.clevelandart.org/1996.26/1996.26_print.jpg"
SHA256="1880866ce9b1cfc27c59a177fbe16689d6d2a595aa69b3cf2fbf9a62c59f49a7"
SHA1="9186ead62fe3e34ef1761e72591595ffffd7d6f4"
SIZE=4353315
DIMENSIONS=(2720,3400)
OUT=Path(os.getenv("RUNNER_TEMP","/tmp"))/"prayer-d2-gallery-phone-review"
PRIVATE=Path(os.getenv("RUNNER_TEMP","/tmp"))/"prayer-d2-native-private"
OUT.mkdir(parents=True,exist_ok=True)
PRIVATE.mkdir(parents=True,exist_ok=True)
path=PRIVATE/"d2-museum-original.jpg"
report={"schema":"AO_D2_CMA_REAL_MOSAIC_NATIVE_QA_V1","slot":"DOOR-D2",
        "source":SOURCE,"museumAccessNumber":"1996.26",
        "sourceLicense":"CC0 (museum original previously authenticated)",
        "expectedSha256":SHA256,"sourceFilePublished":False,
        "releaseStatus":"REVIEW_ONLY_HOLD","status":"PENDING"}
try:
    parsed=urlsplit(SOURCE)
    assert parsed.scheme=="https" and parsed.hostname=="openaccess-cdn.clevelandart.org"
    req=Request(SOURCE,headers={
        "User-Agent":"AdOrientem/2026.11 (read-only permitted CC0 museum image QA; no contact or fee)",
        "Accept":"image/jpeg"})
    with urlopen(req,timeout=90) as response:
        final=urlsplit(response.geturl())
        if final.scheme!="https" or final.hostname!="openaccess-cdn.clevelandart.org":
            raise ValueError("Unexpected museum image redirect")
        blocks=[];total=0
        while True:
            block=response.read(1048576)
            if not block:break
            total+=len(block)
            if total>SIZE:raise ValueError("Museum source exceeds exact previous verified bytes")
            blocks.append(block)
    payload=b"".join(blocks)
    if len(payload)!=SIZE:raise ValueError("Original museum source length drift")
    if hashlib.sha256(payload).hexdigest()!=SHA256:raise ValueError("Original museum SHA-256 drift")
    if hashlib.sha1(payload).hexdigest()!=SHA1:raise ValueError("Original museum SHA-1 drift")
    path.write_bytes(payload)
    with Image.open(path) as im:
        if im.format!="JPEG" or im.size!=DIMENSIONS:raise ValueError("Museum JPEG native pixel geometry drift")
        im.verify()
    with Image.open(path) as im:
        image=ImageOps.exif_transpose(im).convert("RGB")
        if image.size!=DIMENSIONS:raise ValueError("Unexpected JPEG EXIF orientation")
        # Native margin diagnostics; no retouching/cropping of source
        gray=ImageOps.grayscale(image)
        w,h=gray.size;n=40
        strips={"left":(0,0,n,h),"right":(w-n,0,w,h),"top":(0,0,w,n),"bottom":(0,h-n,w,h)}
        edge={}
        for name,box in strips.items():
            st=ImageStat.Stat(gray.crop(box))
            edge[name]={"luminanceMean":round(st.mean[0],2),"luminanceSD":round(st.stddev[0],2)}
        preview=image.copy();preview.thumbnail((840,1050),Image.Resampling.LANCZOS)
        preview.save(OUT/"d2-complete-source-review.jpg",quality=90,subsampling=0,optimize=True)
        report.update({"status":"NATIVE_MUSEUM_SOURCE_VERIFIED_NO_ART_APPROVAL",
          "actualBytes":len(payload),"actualSha1":SHA1,"actualSha256":SHA256,
          "nativePixels":list(DIMENSIONS),"aspectRatio":round(w/h,5),
          "nativePixelOuterStripStats":edge,
          "potentialUniformBlackOuterStrips":[name for name,v in edge.items()
              if v["luminanceMean"]<22 and v["luminanceSD"]<14],
          "sourceVisualApproval":"PENDING",
          "mobileVisualApproval":"PENDING",
          "croppingDecision":"UNDECIDED_KEEP_CURRENT_CONTAIN_UNTIL_APPROVED"})
    print("D2_NATIVE_CMA_BYTES_VERIFIED",len(payload),DIMENSIONS,SHA256,flush=True)
except Exception as error:
    report["status"]="SOURCE_DRIFT_OR_DOWNLOAD_FAILURE_HOLD"
    report["error"]=type(error).__name__+": "+str(error)
    raise
finally:
    (OUT/"d2-native-source-evidence.json").write_text(json.dumps(report,indent=2)+"\n")
