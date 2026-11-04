#!/usr/bin/env python3
"""R5D multi-museum acquisition. Research evidence only; never changes publication registry."""
import hashlib, json, os, re, sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from io import BytesIO
from PIL import Image

ROOT=Path(__file__).resolve().parent.parent
QUEUE=json.loads((ROOT/"data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json").read_text())
BATCH=sys.argv[1] if len(sys.argv)>1 else "a"
if BATCH not in ("a","b"): raise SystemExit("Use batch a or b")
OUT=Path(os.environ.get("AO_R5D_BATCH_OUT",f"r5d-bulk-{BATCH}")); OUT.mkdir(parents=True,exist_ok=True)
ALLOWED={"openaccess-api.clevelandart.org","openaccess-cdn.clevelandart.org","piction.clevelandart.org","collectionapi.metmuseum.org","images.metmuseum.org","www.metmuseum.org"}
MAX=35*1024*1024
HEADERS={"User-Agent":"AdOrientemResearch/1.0 (museum attribution and image verification; nonpublication)","Accept":"application/json,image/*"}
def get(url):
    u=urlparse(url)
    if u.scheme!="https" or u.hostname not in ALLOWED: raise ValueError("Unapproved museum host "+str(url))
    with urlopen(Request(url,headers=HEADERS),timeout=70) as res:
        final=urlparse(res.geturl())
        if final.scheme!="https" or final.hostname not in ALLOWED: raise ValueError("Unapproved redirect "+res.geturl())
        raw=res.read(MAX+1)
        if len(raw)>MAX: raise ValueError("File exceeds acquisition limit")
        return raw
def js(url): return json.loads(get(url))
candidates=[]
for group in QUEUE["groups"]:
    src=group.get("sourcePage") or ""
    if "clevelandart.org/art/" in src or "metmuseum.org/art/collection/search/" in src:
        if src.endswith(("1916.786","437542")): continue
        candidates.append(group)
assert len(candidates)==14, f"Expected 14 museum groups, found {len(candidates)}"
candidates=candidates[:7] if BATCH=="a" else candidates[7:]
entries=[]
for g in candidates:
    src=g["sourcePage"]
    museum="cleveland" if "clevelandart.org" in src else "met"
    oid=src.rstrip("/").rsplit("/",1)[-1]
    row={"museum":museum,"object_id":oid,"master_title":g["title"],"master_artist":g["artist"],
         "source_page":src,"approved_slots":[s for s in g["slots"] if s not in g.get("rosaryDeferred",[])],
         "deferred_rosary":g.get("rosaryDeferred",[]),"publication_authorized":False,
         "human_visual_review_passed":False,"responsive_browser_qa_passed":False}
    try:
        if museum=="cleveland":
            info=js(f"https://openaccess-api.clevelandart.org/api/artworks/?q={oid}&limit=100")
            objs=[x for x in info.get("data",[]) if str(x.get("accession_number",""))==oid]
            if len(objs)!=1: raise ValueError("Cleveland accession not unique")
            obj=objs[0]
            if str(obj.get("share_license_status","")).lower()!="cc0": raise ValueError("Not CC0")
            row["curatorial_title"]=obj.get("title"); row["curatorial_artist"]=obj.get("creators")
            images=obj.get("images") or {}
            imageurl=next((images[k]["url"] for k in ("print","web","full") if isinstance(images.get(k),dict) and images[k].get("url")),None)
            row["rights"]="Cleveland Open Access CC0"
        else:
            obj=js(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}")
            if str(obj.get("objectID"))!=oid or obj.get("isPublicDomain") is not True: raise ValueError("Not matching public domain Met object")
            row["curatorial_title"]=obj.get("title"); row["curatorial_artist"]=obj.get("artistDisplayName")
            row["rights"]="Met Open Access public domain"
            imageurl=obj.get("primaryImage")
        if not imageurl: raise ValueError("Museum image URL missing")
        content=get(imageurl)
        pic=Image.open(BytesIO(content));pic.verify()
        pic=Image.open(BytesIO(content))
        w,h=pic.size
        if min(w,h)<1200: raise ValueError(f"Below 1200px minimum {w}x{h}")
        if pic.format not in ("JPEG","PNG","TIFF"): raise ValueError("Unsupported image format "+str(pic.format))
        suffix={"JPEG":".jpg","PNG":".png","TIFF":".tif"}[pic.format]
        p=OUT/f"{museum}-{oid}{suffix}"
        p.write_bytes(content)
        row.update(status="ACQUIRED_FOR_QA",image_url=imageurl,file=str(p),format=pic.format,
                   width=w,height=h,bytes=len(content),sha256=hashlib.sha256(content).hexdigest())
    except Exception as error:
        row.update(status="BLOCKED",error=str(error))
    entries.append(row)
report={"schema":"AO_PRAYER_R5D_BULK_MUSEUM_RESEARCH_V1","batch":BATCH,
        "source":"73-group canonical R5C acquisition master","candidates":len(entries),
        "acquired":sum(x["status"]=="ACQUIRED_FOR_QA" for x in entries),
        "blocked":sum(x["status"]=="BLOCKED" for x in entries),
        "publication_authorized":False,"entries":entries}
(OUT/"evidence.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps({"batch":BATCH,"acquired":report["acquired"],"blocked":report["blocked"],
    "results":[{"id":x["object_id"],"status":x["status"],"error":x.get("error")} for x in entries]},indent=2))
# Metadata or image blockers are reported per work, not masked by a green overall result.
if report["blocked"]: raise SystemExit(f"{report['blocked']} acquisition blockers require review")
