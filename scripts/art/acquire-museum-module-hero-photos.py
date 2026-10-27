#!/usr/bin/env python3
"""Museum-photo research acquisition only: no retouch, no app promotion."""
import hashlib, io, json, urllib.request
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/module-hero-masters"
LOG=ROOT/"data/research/module-hero-museum-acquisition-20261026.json"
MAX=12*1024*1024
UA="AdOrientem/1.0 (https://github.com/Fulcanelli13/ad-orientem)"

def grab(url):
    req=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(req,timeout=60) as r:
        host=__import__("urllib.parse",fromlist=["urlsplit"]).urlsplit(r.geturl()).hostname
        if host not in {"api.nga.gov","collectionapi.metmuseum.org","images.metmuseum.org",
                        "www.museunacional.cat","museunacional.cat"}:
            raise ValueError("Unexpected download host "+str(host))
        blob=r.read(MAX+1)
        if not blob or len(blob)>MAX: raise ValueError("empty/over-12MiB source")
        return blob,r.geturl()

def photo(module,url,rights):
    blob,source=grab(url)
    with Image.open(io.BytesIO(blob)) as i: i.verify()
    with Image.open(io.BytesIO(blob)) as i:
        if i.format not in ("JPEG","PNG"): raise ValueError("not original image")
        w,h=i.size; fmt=i.format
        if min(w,h)<700: raise ValueError("insufficient basic source dimensions")
        icc=bool(i.info.get("icc_profile")); iso=i.getexif().get(34855)
    dest=OUT/(module+(".png" if fmt=="PNG" else ".jpg"))
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_bytes(blob)
    return {"module":module,"source_url":source,"path":str(dest.relative_to(ROOT)),
            "sha256":hashlib.sha256(blob).hexdigest(),"width":w,"height":h,
            "bytes":len(blob),"icc_present":icc,"camera_iso":iso,
            "rights_note":rights,"status":"RESEARCH SOURCE ONLY; VISUAL/LICENCE QA PENDING"}

def main():
    entries=[];errors=[]
    met="https://collectionapi.metmuseum.org/public/collection/v1/objects/438434"
    try:
        d=json.loads(grab(met)[0])
        if d.get("objectID")!=438434 or d.get("accessionNumber")!="2005.186" or not d.get("isPublicDomain"):
            raise ValueError("Met identity/open-access did not match")
        entries.append(photo("adoration",d["primaryImage"],"Met open access; QA of exact image outstanding"))
    except Exception as e:errors.append({"module":"adoration","reason":str(e)[:300]})
    targets=[
        ("confession","https://api.nga.gov/iiif/676fa96e-ad4e-4209-b985-ae0c15f5d902/full/full/0/default.jpg","NGA public-domain; QA pending"),
        ("sorrows","https://www.museunacional.cat/sites/default/files/images/art_piece/first_gallery/34950/008327-000.JPG","MNAC painting public-domain; exact photo terms unverified")
    ]
    for module,url,rights in targets:
        try: entries.append(photo(module,url,rights))
        except Exception as e: errors.append({"module":module,"reason":str(e)[:300]})
    LOG.parent.mkdir(parents=True,exist_ok=True)
    LOG.write_text(json.dumps({"scope":"3 institutional reference photos ONLY",
        "originals_downloaded":len(entries),"failures":errors,"sources":entries,
        "quality_approved":0,"app_released":0},indent=2)+"\n")
    print("Museum files staged:",len(entries),"failures:",errors)

if __name__=="__main__":main()
