#!/usr/bin/env python3
"""Fetch 28 exact pinned Commons originals. Stage ONLY, never release to public app."""
import argparse, hashlib, html, io, json, pathlib, re, sys, time
from urllib.parse import urlencode, unquote, urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=pathlib.Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/directory/research/tlm-28-commons-source-import-20261112.v1.json"
OUTPUT=ROOT/"data/directory/research/tlm-28-commons-source-stage-result-20261112.v1.json"
MAX=28*1024*1024
AGENT="AdOrientemChurchPhotoReview/1.0 (https://github.com/Fulcanelli13/ad-orientem)"

def read_url(url, host, limit=MAX):
    if urlsplit(url).scheme!="https" or urlsplit(url).hostname!=host: raise ValueError("Untrusted source host")
    error=None
    for attempt in range(3):
        try:
            with urlopen(Request(url,headers={"User-Agent":AGENT,"Accept-Encoding":"identity"}),timeout=35) as h:
                if urlsplit(h.geturl()).hostname!=host: raise ValueError("Source redirect off host")
                if int(h.headers.get("Content-Length","0"))>limit: raise ValueError("Oversized source")
                data=h.read(limit+1)
            if not 0<len(data)<=limit: raise ValueError("Invalid content length")
            return data
        except Exception as exc:
            error=exc
            if attempt<2: time.sleep(3*(attempt+1))
    raise RuntimeError("Source fetch failed: "+str(error))

def clean(x):
    return html.unescape(re.sub(r"<[^>]+>","",str(x or ""))).strip()
def norm(x):
    return re.sub(r"[^a-z0-9]","",str(x or "").lower())

def inputs():
    m=json.loads(INPUT.read_text(encoding="utf8"))
    rows=m["entries"]
    if m["schema"]!="AO_TLM_28_COMMONS_SOURCE_IMPORT_INPUT_V1" or len(rows)!=28: raise ValueError("Bad manifest")
    idx=json.loads((ROOT/"data/directory/generated/cl2-physical-site-index.v1.json").read_text())
    ids={r[0]:r[1] for r in idx["records"]}
    appr=json.loads((ROOT/"data/directory/approved-venue-media.v1.json").read_text())
    links=json.loads((ROOT/"data/geography/seed-registry.v1.json").read_text())
    used={i["venue_id"] for i in appr["items"]}|{i["venue_id"] for i in links["directoryPlaceLinks"]}
    seen=set()
    for r in rows:
        id=r["cl2_anchor"]
        if id in seen or r["venue_id"] not in ids.get(id,[]) or r["venue_id"] in used:
            raise ValueError("Exact CL2 mapping/collision: "+id)
        seen.add(id)
        if not re.fullmatch(r"RG-[A-Z0-9-]+",id): raise ValueError("Bad CL2 name")
        if r["stage_path"]!="assets/staged/directory-commons-rebuilt-20261112/"+id+".webp":
            raise ValueError("Unsafe stage path")
        if not re.fullmatch(r"[a-f0-9]{40}",r["original_sha1"]) or not re.fullmatch(r"[a-f0-9]{64}",r["archived_preview_sha256"]):
            raise ValueError("Source hash missing")
        if urlsplit(r["source_url"]).hostname!="commons.wikimedia.org" or not urlsplit(r["source_url"]).path.startswith("/wiki/File:"):
            raise ValueError("Source must be exact Commons file page")
        if r["publication_approved"] or any(r[k] for k in ("rights_verified","subject_verified","crop_reviewed")):
            raise ValueError("Unreviewed candidate cannot be approved")
    return rows

def stage(r):
    title=unquote(urlsplit(r["source_url"]).path.removeprefix("/wiki/")).replace("_"," ")
    api="https://commons.wikimedia.org/w/api.php?"+urlencode({"action":"query","format":"json","formatversion":"2","prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata","titles":title})
    pages=json.loads(read_url(api,"commons.wikimedia.org",1_500_000))["query"]["pages"]
    if len(pages)!=1 or not pages[0].get("imageinfo"): raise ValueError("Exact Commons file missing")
    info=pages[0]["imageinfo"][0]
    if info.get("sha1","").lower()!=r["original_sha1"]: raise ValueError("SOURCE_SHA1_CHANGED")
    meta=info.get("extmetadata",{})
    licence=clean(meta.get("LicenseShortName",{}).get("value",""))
    if not (("cc0" in norm(licence)) if r["license"]=="CC0-1.0" else norm(r["license"]) in norm(licence)):
        raise ValueError("SOURCE_LICENSE_CHANGED: "+licence)
    if info.get("size",0)>MAX: raise ValueError("SOURCE_TOO_LARGE")
    data=read_url(info["url"],"upload.wikimedia.org")
    if hashlib.sha1(data).hexdigest()!=r["original_sha1"] or len(data)!=info["size"]:
        raise ValueError("ORIGINAL_BYTES_SHA1_MISMATCH")
    with Image.open(io.BytesIO(data)) as pic: pic.verify()
    with Image.open(io.BytesIO(data)) as pic:
        if pic.width*pic.height>80_000_000: raise ValueError("Oversized decoded image")
        frame=ImageOps.exif_transpose(pic).convert("RGB")
        frame.thumbnail((1600,1600),Image.Resampling.LANCZOS)
        buf=io.BytesIO(); frame.save(buf,"WEBP",quality=83,method=5)
        dimensions=list(frame.size)
    out=buf.getvalue()
    if out[:4]!=b"RIFF" or out[8:12]!=b"WEBP": raise ValueError("Invalid derived WebP")
    dest=ROOT/r["stage_path"]
    dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.exists() and hashlib.sha256(dest.read_bytes()).digest()!=hashlib.sha256(out).digest():
        raise ValueError("Staged binary already exists with different digest")
    dest.write_bytes(out)
    return {"cl2_anchor":r["cl2_anchor"],"venue_id":r["venue_id"],"status":"STAGED_NOT_APPROVED",
            "source_revision_sha1_verified":True,"source_sha1":r["original_sha1"],"source_url":r["source_url"],
            "source_license_reported":licence,"source_author_reported":clean(meta.get("Artist",{}).get("value",""))[:400],
            "staged_asset_path":r["stage_path"],"derived_sha256":hashlib.sha256(out).hexdigest(),
            "archived_preview_sha256":r["archived_preview_sha256"],"pixel_dimensions":dimensions,
            "byte_identical_to_owner_archive":False,"review_required":True}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--preflight",action="store_true")
    args=ap.parse_args()
    rows=inputs()
    if args.preflight:
        print("TLM28_SOURCE_PREFLIGHT_PASS 28 exact CL2 venue records; zero approved");return
    found=[]
    for i,r in enumerate(rows):
        try: result=stage(r)
        except Exception as e:
            result={"cl2_anchor":r["cl2_anchor"],"venue_id":r["venue_id"],
                    "status":"HOLD_REMOTE_SOURCE","reason":str(e)[:400],"review_required":True}
        found.append(result)
        print("TLM28_SOURCE",i+1,r["cl2_anchor"],result["status"],result.get("reason",""),flush=True)
        time.sleep(.8)
    staged=sum(x["status"]=="STAGED_NOT_APPROVED" for x in found)
    OUTPUT.write_text(json.dumps({"schema":"AO_TLM_28_REMOTE_SOURCE_STAGING_AUDIT_V1",
      "as_of":"2026-11-12","counts":{"reviewed":28,"staged":staged,"held":28-staged,"approved":0,"published":0},
      "notice":"New derivative binaries. Not identical to owner ZIP. No licence/visual approval; no public media changes.",
      "records":found},indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    if staged==0: sys.exit("No Wikimedia sources could be verified; fail closed")
    print("STAGED_REMOTE_DERIVATIVES",staged,"/28; PUBLIC_MEDIA_UNCHANGED",flush=True)
if __name__=="__main__": main()
