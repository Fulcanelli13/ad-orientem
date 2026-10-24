#!/usr/bin/env python3
"""B29 zero-euro, research-only original-file retrieval of seven exact selected photos.

Never uses a new image as an approved replacement. File rights are screened
against the current Commons file metadata; byte hashes must match the old,
source-specific historical record or the file is rejected. The release archiver
is a separate mandatory final workflow gate.
"""
import csv
import hashlib
import json
import os
from pathlib import Path
import re
import time
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode, urlsplit, unquote
from urllib.request import Request, urlopen
from PIL import Image

ROOT=Path("data/research")
MANIFEST=ROOT/"sacred-art-b29-seven-exact-selected-source-records.json"
OUT=Path("artifacts/b29-seven-exact-selected")
USER_AGENT="AdOrientemSacredArtResearch/2026 (+https://github.com/Fulcanelli13/ad-orientem)"
ALLOW_IMAGE_HOSTS={"upload.wikimedia.org","thumb.wikimedia.org"}
APPROVED_RESEARCH_LABELS={
    "Public domain":{"Public domain","PD-old","PD-Art","PD-old-100","CC0"},
    "CC BY-SA 3.0":{"CC BY-SA 3.0"},
}
MAX_ONE_IMAGE=400_000_000
MAX_TOTAL_IMAGE=1_400_000_000
HEX64=re.compile(r"^[a-f0-9]{64}$")
FIELDNAMES=["artwork_id","title","selected_preview_sha256","expected_source_file_sha256",
"source_page","source_file_url","license_claim","metadata_license_short_name",
"metadata_license_url","metadata_file_page","identity_basis","status","failure",
"downloaded_sha256","acquired_bytes","width","height","resolution_gate",
"publication_allowed","verified_at_utc"]


def get(url,limit=6_000_000):
    req=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json"})
    with urlopen(req,timeout=30) as response:
        if response.status!=200:raise ValueError(f"HTTP {response.status}")
        b=response.read(limit+1)
        if len(b)>limit:raise ValueError("Metadata response too large")
        return b


def metadata_for(page_url):
    parsed=urlsplit(page_url)
    if parsed.hostname!="commons.wikimedia.org" or not parsed.path.startswith("/wiki/File:"):
        raise ValueError("Expected exact Commons File page URL")
    filename=unquote(parsed.path[len("/wiki/File:"):]).replace("_"," ")
    api="https://commons.wikimedia.org/w/api.php?"+urlencode({
        "action":"query","format":"json","prop":"imageinfo","iiprop":"extmetadata|url|size",
        "titles":"File:"+filename,"formatversion":2})
    payload=json.loads(get(api))
    pages=payload.get("query",{}).get("pages",[])
    if len(pages)!=1 or "missing" in pages[0]:
        raise ValueError("Commons exact file page missing")
    infos=pages[0].get("imageinfo",[])
    if len(infos)!=1:raise ValueError("Commons file metadata absent")
    meta=infos[0].get("extmetadata",{})
    value=lambda k:meta.get(k,{}).get("value","")
    return {"license_short_name":value("LicenseShortName").strip(),
            "license_url":value("LicenseUrl"),"canonical_title":pages[0].get("title",""),
            "mime":infos[0].get("mime",""),"original_url":infos[0].get("url",""),
            "metadata_width":infos[0].get("width"),"metadata_height":infos[0].get("height")}


def retrieve(url,path,max_bytes):
    u=urlsplit(url)
    if u.scheme!="https" or u.hostname not in ALLOW_IMAGE_HOSTS:
        raise ValueError("Disallowed recorded source-file URL host")
    if not u.path.startswith("/wikipedia/commons/"):
        raise ValueError("Unexpected Commons CDN path")
    request=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"image/*"})
    digest=hashlib.sha256()
    size=0
    with urlopen(request,timeout=90) as response:
        final=urlsplit(response.geturl())
        if final.scheme!="https" or final.hostname not in ALLOW_IMAGE_HOSTS:
            raise ValueError("Image redirect moved outside Wikimedia CDN")
        if response.status!=200:
            raise ValueError(f"Image HTTP {response.status}")
        content_type=response.headers.get("Content-Type","").split(";")[0].strip().lower()
        if not content_type.startswith("image/"):
            raise ValueError("Not an image response")
        with path.open("wb") as output:
            while True:
                buf=response.read(1024*1024)
                if not buf:break
                size+=len(buf)
                if size>min(MAX_ONE_IMAGE,max_bytes):
                    raise ValueError("Per-file or batch byte cap exceeded")
                digest.update(buf)
                output.write(buf)
    return digest.hexdigest(),size


def main():
    manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
    records=manifest["records"]
    assert len(records)==7 and len({r["artwork_id"] for r in records})==7
    assert manifest["publication_allowed"] is False and manifest["editorial_approvals_created"]==0
    assert {r["source_identity_basis"] for r in records}<={"EXISTING_OBJECT_LINKED_FILE",
                     "VERIFIED_ANTWERP_ROSARY_ORIGINAL_SOURCE_PHOTO"}
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"originals").mkdir(exist_ok=True)
    decisions=[]
    acquired_bytes=0
    for rec in records:
        id=rec["artwork_id"]
        assert HEX64.fullmatch(rec["expected_source_file_sha256"])
        assert HEX64.fullmatch(rec["selected_preview_sha256"])
        item={key:"" for key in FIELDNAMES}
        item.update({
            "artwork_id":id,"title":rec["title"],
            "selected_preview_sha256":rec["selected_preview_sha256"],
            "expected_source_file_sha256":rec["expected_source_file_sha256"],
            "source_page":rec["source_page"],
            "source_file_url":rec["source_file_url"],
            "license_claim":rec["license_claim"],
            "identity_basis":rec["source_identity_basis"],
            "publication_allowed":"NO",
            "verified_at_utc":__import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        })
        try:
            checked=metadata_for(rec["source_page"])
            item["metadata_license_short_name"]=checked["license_short_name"]
            item["metadata_license_url"]=checked["license_url"]
            item["metadata_file_page"]=checked["canonical_title"]
            if checked["license_short_name"] not in APPROVED_RESEARCH_LABELS.get(rec["license_claim"],set()):
                raise ValueError("Original license claim not confirmed by current Commons file-level metadata")
            if not checked["mime"].startswith("image/"):
                raise ValueError("Commons source MIME is not image")
            if max(int(rec["expected_width"]),int(rec["expected_height"]))<500:
                raise ValueError("Only low-resolution proxy available")
            # Use a unique, non-approving filename. Never overwrite existing binaries.
            destination=OUT/"originals"/(id+"-"+rec["expected_source_file_sha256"][:12]+".image")
            try:
                digest,size=retrieve(rec["source_file_url"],destination,MAX_TOTAL_IMAGE-acquired_bytes)
                if digest!=rec["expected_source_file_sha256"]:
                    raise ValueError("Downloaded image differs from recorded selected source SHA256")
                Image.MAX_IMAGE_PIXELS=250_000_000
                with Image.open(destination) as im:
                    im.verify()
                with Image.open(destination) as im:
                    width,height=im.size
                    if (width,height)!=(int(rec["expected_width"]),int(rec["expected_height"])):
                        raise ValueError("Downloaded image dimensions differ from recorded selected source")
                acquired_bytes+=size
                item.update(status="SOURCE_BYTES_HASH_VERIFIED",downloaded_sha256=digest,
                    acquired_bytes=size,width=width,height=height,
                    resolution_gate=("LONG_EDGE_2400_PASS" if max(width,height)>=2400 else "RESOLUTION_REVIEW"))
            finally:
                if item["status"]!="SOURCE_BYTES_HASH_VERIFIED":
                    destination.unlink(missing_ok=True)
        except Exception as ex:
            item["status"]="SOURCE_HOLD"
            item["failure"]=type(ex).__name__+": "+str(ex)[:250]
        decisions.append(item)
        print("SOURCE",id,item["status"],item["failure"],flush=True)
        time.sleep(2)
    with (OUT/"Acquisition_results.csv").open("w",encoding="utf-8",newline="") as h:
        wr=csv.DictWriter(h,fieldnames=FIELDNAMES)
        wr.writeheader()
        wr.writerows(decisions)
    summary={"schema":"AO_B29_P0_EXACT_SELECTED_ACQUISITION_V1",
        "target_artworks":len(records),
        "source_file_bytes_verified":sum(x["status"]=="SOURCE_BYTES_HASH_VERIFIED" for x in decisions),
        "source_hold":sum(x["status"]=="SOURCE_HOLD" for x in decisions),
        "verified_original_bytes":acquired_bytes,
        "image_publication_approvals_created":0,"editorial_approvals_created":0,
        "identity_promotion_created":0,"source_archive_required":True,
        "rights_publication_cleared":False,"research_only":True}
    (OUT/"Acquisition_summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print("B29_RESEARCH_ONLY",json.dumps(summary),flush=True)


if __name__=="__main__":
    main()
