#!/usr/bin/env python3
"""Try freely viewable Art UK reference thumbnails, NOT licensed production masters.
Exact-object link copied from historical Commons file source metadata, no pay/contact.
"""
from __future__ import annotations
import hashlib, io, json, os
from pathlib import Path
from urllib.request import Request,urlopen
from PIL import Image

ROOT=Path("assets/staged/module-hero-missing-three-20261027")
SOURCES=[
  {"id":"joseph","url":"https://d3d00swyhr67nd.cloudfront.net/w800h800/collection/NG/NG/NG_NG_NG6276-001.jpg",
   "object":"National Gallery NG6276, Philippe de Champaigne Dream of Saint Joseph",
   "status":"REFERENCE_ONLY_ART_UK_NATIONAL_GALLERY_CC_BY_NC_ND_NO_APP_REUSE",
   "source_record":"https://commons.wikimedia.org/wiki/File:Philippe_de_Champaigne_(1602-1674)_-_The_Dream_of_Saint_Joseph_-_NG6276_-_National_Gallery.jpg"},
  {"id":"evening","url":"https://d3d00swyhr67nd.cloudfront.net/w1200h1200/collection/STF/WAG/STF_WAG_OP6-001.jpg",
   "object":"Wolverhampton Art Gallery OP6 Pierre Edouard Frere The Prayer 1857",
   "status":"REFERENCE_ONLY_ART_UK_WOLVERHAMPTON_NONCOMMERCIAL_IMAGE_NO_APP_REUSE",
   "source_record":"https://commons.wikimedia.org/wiki/File:Pierre_Edouard_Frère_(1819-1886)_-_The_Prayer_-_OP6_-_Wolverhampton_Art_Gallery.jpg"}
]
def sha(b):return hashlib.sha256(b).hexdigest()
def get(url):
    with urlopen(Request(url,headers={"User-Agent":"Mozilla/5.0 (Ad Orientem noncommercial research only)","Accept":"image/jpeg"}),timeout=25) as r:
        b=r.read(3500001)
    if len(b)>3500000 or not b.startswith(b"\xff\xd8"):raise RuntimeError("Not recognized JPEG reference image")
    return b
def main():
    if os.environ.get("GITHUB_ACTIONS")=="true" and os.environ.get("GITHUB_REF")!="refs/heads/research/module-hero-pd-masters-20261026":
        raise RuntimeError("Wrong branch")
    ROOT.mkdir(parents=True,exist_ok=True)
    results=[]
    for t in SOURCES:
        try:
            b=get(t["url"])
            with Image.open(io.BytesIO(b)) as im:
                im.load()
                w,h=im.size
                im.thumbnail((800,800))
                preview=ROOT/(t["id"]+"-artuk-reference-preview.jpg")
                im.convert("RGB").save(preview,"JPEG",quality=90)
            p=ROOT/(t["id"]+"-artuk-reference.jpg")
            if p.exists() and sha(p.read_bytes())!=sha(b):
                raise RuntimeError("Already-archived reference changed; do not overwrite")
            p.write_bytes(b)
            x={**t,"archive_status":"STAGED_NONCOMMERCIAL_RESEARCH_REFERENCE_ONLY","path":str(p),
                "sha256":sha(b),"bytes":len(b),"dimensions":[w,h],
                "photo_quality_master_approved":False,"reuse_license_publication_cleared":False,"app_released":False}
        except Exception as e:
            x={**t,"archive_status":"SOURCE_UNAVAILABLE","error":type(e).__name__+": "+str(e)[:200],
                "reuse_license_publication_cleared":False,"app_released":False}
        results.append(x)
        print(x["id"],x["archive_status"])
    (ROOT/"artuk-independent-reference-fallback.json").write_text(
        json.dumps({"scope":"No-contact photo-source investigation for two approved modules; paid/contractual photos not for publication.",
                    "results":results,"approved_artwork_changes":0,"commercial_photo_clearances":0},ensure_ascii=False,indent=2)+"\n",
        encoding="utf-8")
if __name__=="__main__":main()
