#!/usr/bin/env python3
"""Source-first Prayer artwork batch: stage real Wikimedia originals, never publish.

Reads the 12-source pinned editorial candidate ledger and uses only Commons
imageinfo for exact file URL, size, MIME, current SHA-1 and licence metadata.
Original downloaded bytes are verified before being staged. This is a
RESEARCH acquisition; it NEVER grants visual, attribution or final crop approval.
"""
import argparse
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
LEDGER=ROOT/"data/prayer/artwork-editorial-20261101/commons-originals-batch01-20261101.v1.json"
REPORT=ROOT/"data/prayer/artwork-editorial-20261101/commons-originals-batch01-acquisition-results.v1.json"
STAGE=ROOT/"assets/staged/prayer-artwork-originals-20261101"
COMMONS="https://commons.wikimedia.org/w/api.php"
UA="AdOrientem-PrayerArtSourceAudit/1.0 (https://github.com/Fulcanelli13/ad-orientem; source verification only)"
MAX_FILE=7*1024*1024
MAX_BATCH=42*1024*1024
LICENSE_RE=re.compile(r"^(?:public domain|pd[- ]art|cc0(?: 1\.0)?|cc by (?:2\.0|3\.0|4\.0)|cc by-sa (?:2\.0|2\.5|3\.0|4\.0))$",re.I)

def fetch_json(url):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=35) as r:
        if urllib.parse.urlsplit(r.geturl()).hostname!="commons.wikimedia.org":
            raise ValueError("Unexpected metadata host")
        return json.load(r)

def exact_info(page):
    u=urllib.parse.urlsplit(page)
    if u.scheme!="https" or u.hostname!="commons.wikimedia.org" or not u.path.startswith("/wiki/File:"):
        raise ValueError("Not an exact Commons File: page")
    title=urllib.parse.unquote(u.path.split("/wiki/",1)[1])
    params=urllib.parse.urlencode({
        "action":"query","format":"json","redirects":"1",
        "prop":"imageinfo","iiprop":"url|size|sha1|mime|extmetadata",
        "titles":title
    })
    raw=fetch_json(COMMONS+"?"+params)
    pages=list(raw.get("query",{}).get("pages",{}).values())
    if len(pages)!=1 or not pages[0].get("imageinfo"):
        raise ValueError("Commons file not resolved: "+title)
    info=pages[0]["imageinfo"][0]
    md=info.get("extmetadata") or {}
    value=lambda key:re.sub(r"<[^>]*>","",str((md.get(key) or {}).get("value",""))).strip()
    return info,{"license":value("LicenseShortName"),"licenseUrl":value("LicenseUrl"),
        "artistText":value("Artist")[:700],"creditText":value("Credit")[:700]}

def rights_gate(license_name,expected):
    name=re.sub(r"\s+"," ",license_name).strip()
    if not LICENSE_RE.fullmatch(name):return False,"unsupported_file_specific_license"
    if expected and name.casefold()!=expected.casefold():return False,"licence_mismatch_with_pinned_source"
    return True,"candidate_license_verified_at_acquisition_not_final_rights_clearance"

def verified_download(info,dest,used):
    src=urllib.parse.urlsplit(str(info.get("url") or ""))
    if src.scheme!="https" or src.hostname!="upload.wikimedia.org" or not src.path.startswith("/wikipedia/commons/"):
        raise ValueError("Original URL is not Wikimedia Commons media")
    size=int(info.get("size") or 0)
    if size<=0 or size>MAX_FILE or size+used>MAX_BATCH:
        raise ValueError("Original exceeds capped per-file/batch size")
    mime=info.get("mime")
    if mime not in ("image/jpeg","image/png"):
        raise ValueError("Only original JPEG/PNG supported, got "+str(mime))
    dest.parent.mkdir(parents=True,exist_ok=True)
    part=dest.with_suffix(dest.suffix+".part")
    sha1=hashlib.sha1();sha256=hashlib.sha256();total=0
    try:
        req=urllib.request.Request(info["url"],headers={"User-Agent":UA})
        with urllib.request.urlopen(req,timeout=75) as remote,part.open("wb") as f:
            resolved=urllib.parse.urlsplit(remote.geturl())
            if resolved.hostname!="upload.wikimedia.org":raise ValueError("Unexpected media redirect")
            while True:
                data=remote.read(262144)
                if not data:break
                total+=len(data)
                if total>size+4096 or total>MAX_FILE or used+total>MAX_BATCH:
                    raise ValueError("Original bytes exceeded size cap")
                sha1.update(data);sha256.update(data);f.write(data)
        if not total or sha1.hexdigest().lower()!=str(info.get("sha1") or "").lower():
            raise ValueError("Original SHA1 differs from current Wikimedia original")
        part.replace(dest)
    finally:
        part.unlink(missing_ok=True)
    return {"bytes":total,"sha1":sha1.hexdigest(),"sha256":sha256.hexdigest(),"file":str(dest.relative_to(ROOT))}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--download",action="store_true",help="Archive originals; without it only metadata is read")
    p.add_argument("--limit",type=int,default=12,help="At most 12 exact research records")
    args=p.parse_args()
    if not 1<=args.limit<=12:p.error("--limit must be 1..12")
    raw=json.loads(LEDGER.read_text(encoding="utf-8"))
    records=raw["records"][:args.limit]
    assert raw["stageOnly"] is True and raw["releaseManifestChangeAllowed"] is False
    report={"schema":"ad-orientem.prayer-original-acquisition-results.v1",
        "scope":"ACTUAL_SOURCE_BYTES_ONLY_NOT_RELEASE_APPROVAL",
        "inputLedger":str(LEDGER.relative_to(ROOT)),
        "mode":"stage" if args.download else "inspect",
        "publicationAllowed":False,"appManifestChanges":0,
        "sourceFilesStaged":0,"photosVisuallyApproved":0,"responsiveCropsApproved":0,
        "results":[]}
    used=0
    for item in records:
        record={"id":item["id"],"slot":item["slot"],"artwork":item["originalArtworkTitle"],
            "sourcePage":item["sourcePage"],"status":"unchecked",
            "publicationAllowed":False,"photoRightsForAppCleared":False,
            "cropHumanApproved":False,"releaseManifestEnabled":False}
        try:
            if not re.fullmatch(r"[a-z0-9][a-z0-9-]{2,70}",item["id"]):raise ValueError("Unsafe source ID")
            info,rights=exact_info(item["sourcePage"])
            license=rights["license"]
            allowed,reason=rights_gate(license,item["expectedLicenseShortName"])
            record.update({"sourceSha1":info.get("sha1"),"sourceBytes":info.get("size"),
                "sourceWidth":info.get("width"),"sourceHeight":info.get("height"),
                "mime":info.get("mime"),"fileLicense":license,"licenseUrl":rights["licenseUrl"],
                "sourceCredit":rights["creditText"],"sourcePhotographer":rights["artistText"],
                "licensePolicy":reason})
            if not allowed:
                record["status"]="BLOCKED_LICENSE";report["results"].append(record);continue
            if min(int(info.get("width") or 0),int(info.get("height") or 0))<800:
                record["status"]="BLOCKED_RESOLUTION";report["results"].append(record);continue
            if args.download:
                ext=".jpg" if info.get("mime")=="image/jpeg" else ".png"
                saved=verified_download(info,STAGE/(item["id"]+ext),used)
                record.update(saved);used+=saved["bytes"];report["sourceFilesStaged"]+=1
                record["status"]="STAGED_SOURCE_UNREVIEWED"
            else:record["status"]="METADATA_CHECKED_NOT_DOWNLOADED"
        except (ValueError,KeyError,UnicodeError,urllib.error.HTTPError,urllib.error.URLError,TimeoutError,OSError) as error:
            record["status"]="ERROR";record["error"]=str(error)[:400]
        report["results"].append(record)
        time.sleep(0.3)
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"mode":report["mode"],"checked":len(records),
        "staged":report["sourceFilesStaged"],"totalSourceBytes":used,
        "statuses":[[x["id"],x["status"]] for x in report["results"]],
        "manifestChanges":0},indent=2))
    # Source unavailability is an explicit report result; it must not be
    # misrepresented as an artwork clearance or silently replaced.
    return 0 if any(x["status"] in ("STAGED_SOURCE_UNREVIEWED",
             "METADATA_CHECKED_NOT_DOWNLOADED") for x in report["results"]) else 2

if __name__=="__main__":sys.exit(main())
