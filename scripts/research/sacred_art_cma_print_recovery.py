#!/usr/bin/env python3
"""Research-only Cleveland CC0 source print derivative recovery; no publishing."""
import argparse, csv, hashlib, json, pathlib, re, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from PIL import Image, UnidentifiedImageError

PARSER=argparse.ArgumentParser()
PARSER.add_argument("--manifest",default="data/research/sacred-art-b21r2-cleveland9.manifest.json")
PARSER.add_argument("--output",default="artifacts/b21r2")
ARGS=PARSER.parse_args()
ROOT = pathlib.Path(ARGS.output)
ROOT.mkdir(parents=True, exist_ok=True)
IMAGES = ROOT / "images"
IMAGES.mkdir(exist_ok=True)
MANIFEST = pathlib.Path(ARGS.manifest)
MANIFEST_DATA = json.loads(MANIFEST.read_text(encoding="utf-8"))
RECORDS = MANIFEST_DATA["records"]
HEADERS = ["asset_source_id", "record_id", "artwork_title", "artist", "source_url", "exact_accession_requested",
           "api_accession_returned", "share_license_status", "rights_gate", "acquisition_status", "image_tier",
           "image_url", "bytes_acquired", "sha256", "decoded_width", "decoded_height", "decoded_format",
           "quality_gate", "publication_gate", "error", "checked_utc"]
USER_AGENT = "AdOrientemResearch/2.0 (+https://github.com/Fulcanelli13/ad-orientem)"
Image.MAX_IMAGE_PIXELS = 165000000
def now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")
def fetch(url, method="GET"):
    if urllib.parse.urlsplit(url).scheme != "https":
        raise ValueError("Not HTTPS")
    req = urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json,image/*","Accept-Encoding":"identity"}, method=method)
    return urllib.request.urlopen(req, timeout=50)
def validated_image_url(u):
    parts=urllib.parse.urlsplit(u or "")
    hostname=parts.hostname or ""
    if parts.scheme!="https" or not (hostname=="clevelandart.org" or hostname.endswith(".clevelandart.org")):
        raise ValueError("Unapproved Cleveland image domain: "+hostname)
    return u
def acquire(entry,url,tier):
    path=IMAGES / (entry["asset_source_id"]+".part")
    sha=hashlib.sha256()
    size=0
    try:
        with fetch(validated_image_url(url)) as resp, path.open("wb") as out:
            ct=resp.headers.get("Content-Type","").lower()
            if ct and not (ct.startswith("image/") or "octet-stream" in ct):
                raise ValueError("Non-image content-type: "+ct)
            while True:
                chunk=resp.read(1024*1024)
                if not chunk:break
                size+=len(chunk)
                if size>105*1024*1024:raise ValueError("Image exceeds 105 MB cap")
                sha.update(chunk);out.write(chunk)
        if size<10000:raise ValueError("Image response below minimum")
        with Image.open(path) as img:
            img.load()
            w,h=img.size; fmt=(img.format or "").upper()
        ext={"JPEG":".jpg","TIFF":".tiff","PNG":".png","WEBP":".webp"}.get(fmt)
        if not ext:raise ValueError("Unsupported image encoding")
        final=IMAGES/(entry["asset_source_id"]+("-original" if tier=="original" else "-print")+ext)
        path.replace(final)
        entry.update(acquisition_status=("ACQUIRED_ORIGINAL_SHA256" if tier=="original" else "ACQUIRED_PRINT_DERIVATIVE_SHA256"),image_tier=tier,image_url=url,bytes_acquired=size,sha256=sha.hexdigest(),decoded_width=w,decoded_height=h,decoded_format=fmt,quality_gate="LONG_EDGE_2400_PASS" if max(w,h)>=2400 else "RESOLUTION_REVIEW")
    finally:
        path.unlink(missing_ok=True)
rows=[]
for record in RECORDS:
    sid=record["asset_source_id"]
    match=re.search(r"/art/([0-9]+(?:\.[0-9A-Za-z]+)+)",record["source_url"])
    requested=match.group(1) if match else ""
    ent={key:"" for key in HEADERS}
    ent.update(asset_source_id=sid,record_id=record["record_id"],artwork_title=record["title"],artist=record["artist"],source_url=record["source_url"],exact_accession_requested=requested,rights_gate="UNVERIFIED",acquisition_status="NOT_ATTEMPTED",quality_gate="NOT_INSPECTED",publication_gate="NOT_APPROVED",checked_utc=now())
    try:
        if not requested:raise ValueError("Could not parse exact accession")
        time.sleep(0.3)
        url="https://openaccess-api.clevelandart.org/api/artworks/"+urllib.parse.quote(requested,safe=".")+"?cc0"
        with fetch(url) as resp: obj=json.load(resp)
        art=obj.get("data") or {}
        actual=str(art.get("accession_number") or "")
        ent["api_accession_returned"]=actual
        if actual.lower()!=requested.lower():raise ValueError("Accession identity mismatch "+requested+" vs "+actual)
        lic=str(art.get("share_license_status") or "")
        ent["share_license_status"]=lic
        if lic.upper()!="CC0":
            ent.update(rights_gate="RIGHTS_NOT_CC0",acquisition_status="SKIPPED_RIGHTS_GATE")
        else:
            ent["rights_gate"]="CC0_EXACT_OBJECT"
            ims=art.get("images") or {}
            full=ims.get("full") or {}
            pr=ims.get("print") or {}
            if not isinstance(full,dict):full={}
            if not isinstance(pr,dict):pr={}
            # Original TIFF attempted only for the exact-subpart 404 repair; high-res museum
            # print JPEG is explicitly a derivative, never a substitute original master.
            if record["planned_retrieval"] in ("EXACT_ACCESSION_RECHECK","CMA_BUDGET_RETRY_ORIGINAL"):
                u=full.get("url") or ""
                if u:
                    try:
                        validated_image_url(u)
                        with fetch(u,"HEAD") as head: size=int(head.headers.get("Content-Length","0") or "0")
                        if size and size<=95*1024*1024:
                            acquire(ent,u,"original")
                    except (ValueError,HTTPError,URLError):
                        pass
            if ent["acquisition_status"]=="NOT_ATTEMPTED":
                u=pr.get("url") or ""
                if not u:raise ValueError("No museum print image URL")
                acquire(ent,u,"print")
    except (ValueError,KeyError,HTTPError,URLError,UnidentifiedImageError,OSError) as error:
        ent.update(acquisition_status="REQUIRES_OBJECT_OR_IMAGE_REVIEW",error=str(error)[:280])
    rows.append(ent)
    with (ROOT/"Acquisition_results.csv").open("w",newline="",encoding="utf-8") as out:
        w=csv.DictWriter(out,fieldnames=HEADERS);w.writeheader();w.writerows(rows)
    print(sid,ent["acquisition_status"],ent["error"],flush=True)
summary={"wave":MANIFEST_DATA.get("wave","UNKNOWN"),"records":len(RECORDS),"acquired_originals":sum(x["acquisition_status"]=="ACQUIRED_ORIGINAL_SHA256" for x in rows),"acquired_museum_print_derivatives":sum(x["acquisition_status"]=="ACQUIRED_PRINT_DERIVATIVE_SHA256" for x in rows),"rights_or_identity_exceptions":sum(x["acquisition_status"] not in ("ACQUIRED_ORIGINAL_SHA256","ACQUIRED_PRINT_DERIVATIVE_SHA256") for x in rows),"visual_qa_completed":0,"publication_approvals_created":0,"timestamp_utc":now()}
(ROOT/"Acquisition_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
print("SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
