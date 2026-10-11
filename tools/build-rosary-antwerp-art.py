#!/usr/bin/env python3
"""Acquire precisely 15 PD-Art Commons reproductions, preserve current Rosary art.

One-shot, fail-closed build: verifies MediaWiki per-file licence metadata,
identity and dimensions before writing any production package or manifest.
A failed/partial download never creates the accepted pack.
"""
import hashlib
import io
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

SOURCE=Path("data/pray/rosary-antwerp-commons-sources.v1.json")
DEST=Path("assets/pray/rosary/antwerp")
JS=Path("src/pray/rosary-antwerp-licences.v1.js")
LEDGER=Path("data/pray/rosary-antwerp-production-pack.v1.json")
MAX_DOWNLOAD=23_000_000
MAX_WEBP=750_000
LICENSE_OK=("public domain","cc0","creative commons zero")
USER_AGENT="AdOrientemRosaryResearch/1.0 (credited PD-art prototype; non-scraping single acquisition)"

def fetched(url):
    if urlparse(url).scheme!="https":
        raise RuntimeError("Non-HTTPS source URL")
    req=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json,image/*;q=0.9,*/*;q=0.2"})
    for attempt in range(4):
        try:
            with urlopen(req,timeout=75) as res:
                if urlparse(res.geturl()).hostname not in (
                    "commons.wikimedia.org","upload.wikimedia.org"):
                    raise RuntimeError("Source escaped Wikimedia")
                data=res.read(MAX_DOWNLOAD+1)
                if len(data)>MAX_DOWNLOAD: raise RuntimeError("Source too large")
                return data
        except Exception:
            if attempt==3:raise
            time.sleep(1.5*(attempt+1))
    raise RuntimeError("Download retry exhausted")

def image_info(name):
    q=urlencode({"action":"query","format":"json","formatversion":2,
        "prop":"imageinfo","iiprop":"url|size|extmetadata","titles":"File:"+name})
    data=json.loads(fetched("https://commons.wikimedia.org/w/api.php?"+q))
    pages=data.get("query",{}).get("pages",[])
    if len(pages)!=1 or not pages[0].get("imageinfo"):
        raise RuntimeError("Missing Commons imageinfo for "+name)
    return pages[0]["imageinfo"][0]

def webp_derivative(raw,expected):
    img=Image.open(io.BytesIO(raw));img.load()
    if img.format not in ("JPEG","PNG") or img.size!=tuple(expected):
        raise RuntimeError("Unexpected file identity or pixel dimensions: "
                           +str((img.format,img.size,expected)))
    img=ImageOps.exif_transpose(img).convert("RGB")
    img.thumbnail((1920,1920),Image.Resampling.LANCZOS)
    if min(img.size)<600:
        raise RuntimeError("Artwork too small for visible sacred-art composition")
    for quality in (86,81,77,72,67,60):
        result=io.BytesIO()
        img.save(result,format="WEBP",quality=quality,method=6)
        if result.tell()<=MAX_WEBP:
            return result.getvalue(),img.size,quality
    raise RuntimeError("A source cannot be encoded within offline art budget")

def main():
    manifest=json.loads(SOURCE.read_text("utf-8"))
    originals=manifest["entries"]
    if len(originals)!=15 or len({x["id"] for x in originals})!=15:
        raise RuntimeError("Antwerp art build requires fifteen unique mystery IDs")
    expected=[*(f"joy{i}" for i in range(1,6)),
              *(f"sor{i}" for i in range(1,6)),
              *(f"glo{i}" for i in range(1,6))]
    if [x["id"] for x in originals]!=expected:
        raise RuntimeError("Antwerp image ordering drift")
    compiled=[];outputs=[]
    for item in originals:
        id,name=item["id"],item["fileName"]
        info=image_info(name)
        right=(info.get("extmetadata",{}).get("LicenseShortName",{}).get("value","")).strip()
        if not any(x in right.lower() for x in LICENSE_OK):
            raise RuntimeError(f"{id} has non-cleared Commons source licence: {right!r}")
        original_url=info.get("url","")
        if urlparse(original_url).hostname!="upload.wikimedia.org":
            raise RuntimeError(f"{id} is not downloaded from original Wikimedia file host")
        if (int(info.get("width",0)),int(info.get("height",0)))!=tuple(item["expectedDimensions"]):
            raise RuntimeError(f"{id} imageinfo dimensions diverge from researched original")
        raw=fetched(original_url)
        result,size,q=webp_derivative(raw,item["expectedDimensions"])
        local=f"assets/pray/rosary/antwerp/{id}.webp"
        record={
          "id":id,"src":local,"rightsStatus":"cleared",
          "licenceEvidenceUrl":item["filePage"],"rightsDescription":right,
          "photographerCredit":"Wikimedia Commons · credited original-file reproduction",
          "sourceUrl":original_url,"sourceFilePage":item["filePage"],
          "sourceFileName":name,"sourceDimensions":item["expectedDimensions"],
          "sourceSha256":hashlib.sha256(raw).hexdigest(),
          "width":size[0],"height":size[1],"quality":q,"bytes":len(result),
          "sha256":hashlib.sha256(result).hexdigest()
        }
        compiled.append(record)
        outputs.append((DEST/(id+".webp"),result))
        print(id,":",right,",",size,",",len(result),"bytes",flush=True)
    pack={"version":"antwerp-15-cleared-v1","sourceEdition":"Commons-PD-Art approved candidate set · Oct 2026",
          "artworkCatalogueUrl":manifest["workCatalogueUrl"],
          "licensePolicy":"Commons per-file licence and local SHA-256 verified; do not use museum press photographs",
          "entries":compiled}
    assert len(outputs)==15 and len({r["sha256"] for r in compiled})==15
    # Write only after all 15 are fetched and validated.
    DEST.mkdir(parents=True,exist_ok=True)
    for path,payload in outputs:path.write_bytes(payload)
    LEDGER.write_text(json.dumps(pack,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    js="// Generated from a reviewed complete Wikimedia Commons Antwerp pack; do not edit manually.\n"
    js+="export const ANTWERP_IMAGE_PACK_V1=Object.freeze("+json.dumps(pack,ensure_ascii=False,separators=(",",":"))+");\n"
    JS.write_text(js,encoding="utf-8")
    print("PASS: full 15/15 licensed local collection built, existing art unchanged",flush=True)
if __name__=="__main__":
    try:main()
    except Exception as err:
        print("FAIL: no full collection accepted:",str(err),file=sys.stderr)
        sys.exit(2)
