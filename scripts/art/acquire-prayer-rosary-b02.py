#!/usr/bin/env python3
"""B02: stage exact CMA, Met and Commons selected Rosary originals without release.

B02 only uses pre-pinned exact object IDs or Wikimedia File: pages.
It never generates a public image manifest, changes art selections, or infers
rights from a public-domain painting where the *photograph* is restricted.
"""
from __future__ import annotations
import argparse
import hashlib
import importlib.util
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/"data/prayer/artwork-editorial-20261101"
LEDGER=BASE/"prayer-rosary-b02-exact-source-acquisition-20261101.v1.json"
REPORT=BASE/"prayer-rosary-b02-acquisition-results.v1.json"
MASTER=BASE/"curatorial-master-267-20261101.v1.json"
STAGE=ROOT/"assets/staged/prayer-artwork-originals-20261101"
UA="AdOrientem-PrayerArtSourceAudit/2.0 (https://github.com/Fulcanelli13/ad-orientem; original verification only)"
MAX_FILE=16*1024*1024
MAX_BATCH=45*1024*1024

# Reuse the already-tested Wikimedia checksum, file URL and metadata guards.
spec=importlib.util.spec_from_file_location("prayer_batch01",ROOT/"scripts/art/acquire-prayer-originals-batch01.py")
commons=importlib.util.module_from_spec(spec)
spec.loader.exec_module(commons)

def fetch_json(url, expected_host):
    request=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
    with urllib.request.urlopen(request,timeout=35) as response:
        if urllib.parse.urlsplit(response.geturl()).hostname!=expected_host:
            raise ValueError("API response redirected outside the allowed provider")
        if response.status!=200:
            raise ValueError("Provider API did not return HTTP 200")
        return json.load(response)

def normalized(s):
    return re.sub(r"[^a-z0-9]+","",str(s or "").lower())

def source_for(item):
    provider=item["provider"]
    if provider=="COMMONS":
        info,rights=commons.exact_info(item["sourcePage"])
        name=rights["license"]
        expected=item["expectedPhotoLicense"]
        if normalized(name) not in [normalized(e) for e in expected]:
            raise ValueError("Photo-specific Commons licence unexpected: "+name)
        if info.get("mime")!="image/jpeg":
            raise ValueError("Expected JPEG source file")
        w=int(info.get("width") or 0);h=int(info.get("height") or 0)
        if min(w,h)<item.get("expectedMinDimension",800):
            raise ValueError("Exact source photograph below native pixel floor")
        return {
            "url":info["url"],"declaredSha1":info["sha1"],"declaredBytes":info["size"],
            "declaredWidth":w,"declaredHeight":h,"photoLicence":name,
            "photoLicenceUrl":rights["licenseUrl"],"photographer":rights["artistText"],
            "sourceProvider":"Wikimedia Commons","host":"upload.wikimedia.org",
            "expectedIdentity":item["originalArtworkTitle"]
        }
    if provider=="CMA_CC0":
        accession=item["expectedAccession"]
        if accession!=item["providerID"]:
            raise ValueError("CMA accession mismatch in pinned source")
        url="https://openaccess-api.clevelandart.org/api/artworks/"+urllib.parse.quote(accession,safe=".")
        data=fetch_json(url,"openaccess-api.clevelandart.org").get("data") or {}
        if str(data.get("accession_number"))!=accession or data.get("share_license_status")!="CC0":
            raise ValueError("Exact Cleveland object not CC0 or accession changed")
        if normalized(data.get("title"))!=normalized(item["originalArtworkTitle"]):
            raise ValueError("Cleveland original painting title differs from selected original")
        creds=json.dumps(data.get("creators") or [],ensure_ascii=False).lower()
        if "bouts" not in creds or "albert" not in creds:
            raise ValueError("Cleveland original artist not independently confirmed")
        img=((data.get("images") or {}).get("print") or {})
        image_url=img.get("url")
        if not image_url:
            raise ValueError("Cleveland CC0 original has no print-resolution photo")
        return {
            "url":image_url,"declaredSha1":None,"declaredBytes":img.get("filesize"),
            "declaredWidth":None,"declaredHeight":None,
            "photoLicence":"CC0","photoLicenceUrl":"https://creativecommons.org/publicdomain/zero/1.0/",
            "photographer":"Cleveland Museum of Art Open Access",
            "sourceProvider":"Cleveland Museum of Art","host":"openaccess-cdn.clevelandart.org",
            "expectedIdentity":data.get("title")
        }
    if provider=="MET_OPEN_ACCESS":
        obj_id=item["providerID"]
        if not isinstance(obj_id,int):
            raise ValueError("Met object ID must be a pinned integer")
        url="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+str(obj_id)
        data=fetch_json(url,"collectionapi.metmuseum.org")
        if data.get("objectID")!=obj_id or not data.get("isPublicDomain"):
            raise ValueError("Met original ID or public-domain status changed")
        if str(data.get("accessionNumber"))!=item["expectedAccession"]:
            raise ValueError("Met original accession number differs")
        if normalized(data.get("title"))!=normalized(item["originalArtworkTitle"]):
            raise ValueError("Met title differs from pinned original")
        if "hondius" not in str(data.get("artistDisplayName") or "").lower():
            raise ValueError("Met artist differs from selected Abraham Hondius")
        image_url=data.get("primaryImage")
        if not image_url:
            raise ValueError("Met original has no Open Access image")
        return {
            "url":image_url,"declaredSha1":None,"declaredBytes":None,
            "declaredWidth":None,"declaredHeight":None,
            "photoLicence":"Public domain","photoLicenceUrl":"https://creativecommons.org/publicdomain/mark/1.0/",
            "photographer":"The Metropolitan Museum of Art Open Access",
            "sourceProvider":"Metropolitan Museum of Art","host":"images.metmuseum.org",
            "expectedIdentity":data.get("title")
        }
    raise ValueError("Unsupported provider")

def jpeg_size(data):
    if not data.startswith(b"\\xff\\xd8"):
        raise ValueError("Source bytes are not a JPEG")
    n=len(data);i=2
    while i+4<n:
        if data[i]!=255:
            i+=1
            continue
        while i<n and data[i]==255:i+=1
        if i>=n:break
        marker=data[i];i+=1
        if marker in (0xD8,0xD9,0x01) or 0xD0<=marker<=0xD7:continue
        if i+2>n:break
        size=int.from_bytes(data[i:i+2],"big")
        if size<2 or i+size>n:break
        if marker in (0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF):
            if size<7:break
            h=int.from_bytes(data[i+3:i+5],"big")
            w=int.from_bytes(data[i+5:i+7],"big")
            return w,h
        i+=size
    raise ValueError("Cannot verify native JPEG dimensions")

def archive(info,dest,batch_bytes):
    src=urllib.parse.urlsplit(info["url"])
    if src.scheme!="https" or src.hostname!=info["host"]:
        raise ValueError("Provider image host does not match exact provider")
    if not src.path or ".." in src.path:
        raise ValueError("Invalid image path")
    STAGE.mkdir(parents=True,exist_ok=True)
    # Do not overwrite any previous source file. Reuse only an existing file
    # whose supplied vendor sha1 matches, else report duplicate for inspection.
    part=dest.with_suffix(".jpg.part")
    sha1=hashlib.sha1();sha256=hashlib.sha256();data=bytearray()
    try:
        req=urllib.request.Request(info["url"],headers={"User-Agent":UA,"Accept":"image/jpeg"})
        with urllib.request.urlopen(req,timeout=80) as response:
            host=urllib.parse.urlsplit(response.geturl()).hostname
            if host!=info["host"]:raise ValueError("Photograph redirected to untrusted host")
            mime=response.headers.get_content_type()
            if mime!="image/jpeg":raise ValueError("Photo is not JPEG; received "+mime)
            stated=response.headers.get("Content-Length")
            if stated and int(stated)>MAX_FILE:raise ValueError("Photo exceeds size limit")
            with part.open("wb") as out:
                while True:
                    chunk=response.read(131072)
                    if not chunk:break
                    if len(data)+len(chunk)>MAX_FILE or batch_bytes+len(data)+len(chunk)>MAX_BATCH:
                        raise ValueError("Source exceeded per-photo or batch size cap")
                    data.extend(chunk);sha1.update(chunk);sha256.update(chunk);out.write(chunk)
        if info["declaredSha1"] and sha1.hexdigest().lower()!=str(info["declaredSha1"]).lower():
            raise ValueError("Source changed since original Commons metadata")
        if info["declaredBytes"] and int(info["declaredBytes"])!=len(data) and info["declaredSha1"]:
            raise ValueError("Commons original byte count differs")
        w,h=jpeg_size(data)
        if w<800 or h<800:
            raise ValueError("Native photo below minimum 800px in one dimension")
        if info["declaredWidth"] and (w!=info["declaredWidth"] or h!=info["declaredHeight"]):
            raise ValueError("JPEG dimensions differ from vendor's original-file dimensions")
        if dest.exists():
            prior=dest.read_bytes()
            if hashlib.sha256(prior).digest()!=sha256.digest():
                raise ValueError("Previously staged file differs; refusing overwrite")
            reused=True
        else:
            part.replace(dest);reused=False
        return {"sourceSha1":sha1.hexdigest(),"sourceSha256":sha256.hexdigest(),
                "sourceBytes":len(data),"nativeWidth":w,"nativeHeight":h,
                "stagedPath":str(dest.relative_to(ROOT)),"existingOriginalReused":reused}
    finally:
        part.unlink(missing_ok=True)

def main():
    args=argparse.ArgumentParser()
    args.add_argument("--download",action="store_true")
    opts=args.parse_args()
    manifest=json.loads(LEDGER.read_text(encoding="utf-8"))
    master=json.loads(MASTER.read_text(encoding="utf-8"))
    selected={x["slot"]:x for x in master["assignments"]}
    assert manifest["stageOnly"] and not manifest["releaseManifestChangeAllowed"]
    report={"schema":"ao-prayer-artwork-b02-acquisition-results.v1","inputLedger":str(LEDGER.relative_to(ROOT)),
       "mode":"stage" if opts.download else "inspect","stageOnly":True,
       "publicationAllowed":False,"productionImageManifestChanges":0,
       "sourceFilesStaged":0,"sourceFilesVerified":0,
       "photographsPublicationCertified":0,"results":[]}
    bytes_used=0
    for item in manifest["records"]:
        rec={"id":item["id"],"slot":item["slot"],"selectedOriginal":item["originalArtworkTitle"],
             "provider":item["provider"],"photoRightsForAppCleared":False,
             "appImageReleaseCertified":False,"originalPaintingIdentityVerifiedForSelection":False,
             "actualPhotographQualityHumanApproved":False,"status":"PENDING"}
        try:
            selection=selected[item["slot"]]["currentAssignment"]
            if selection["mode"]=="HOLD_NO_ELIGIBLE_PRIMARY" or not selection.get("painting"):
                raise ValueError("Slot is held or has no exact selected original")
            if normalized(selection["painting"]["title"])!=normalized(item["originalArtworkTitle"]):
                raise ValueError("Pinned acquisition not the selected original artwork")
            if not set(item["expectedOriginalArtworkIds"]).intersection(selection.get("originalArtworkIDs") or []):
                raise ValueError("Selected original artwork ID does not match pinned manifest")
            if not re.fullmatch(r"[a-z0-9][a-z0-9-]{3,80}",item["id"]):
                raise ValueError("Invalid local file name")
            photo=source_for(item)
            rec.update({"sourcePage":item["sourcePage"],"sourcePhotoUrl":photo["url"],
                "sourceProvider":photo["sourceProvider"],"fileLicence":photo["photoLicence"],
                "fileLicenceUrl":photo["photoLicenceUrl"],"sourcePhotographer":photo["photographer"],
                "originalPaintingIdentityVerifiedForSelection":True})
            if opts.download:
                saved=archive(photo,STAGE/(item["id"]+".jpg"),bytes_used)
                bytes_used+=saved["sourceBytes"]
                report["sourceFilesStaged"]+=1
                rec.update(saved);rec["status"]="STAGED_ORIGINAL_NOT_PUBLICATION_CERTIFIED"
            else:
                rec["status"]="IDENTITY_AND_SOURCE_METADATA_VERIFIED"
            report["sourceFilesVerified"]+=1
        except (ValueError,KeyError,TypeError,urllib.error.HTTPError,urllib.error.URLError,
                TimeoutError,OSError,UnicodeDecodeError,json.JSONDecodeError) as error:
            rec.update({"status":"BLOCKED","error":str(error)[:320]})
        report["results"].append(rec)
        time.sleep(0.35)
    REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"sourceFilesVerified":report["sourceFilesVerified"],
      "sourceFilesStaged":report["sourceFilesStaged"],
      "statuses":[[r["slot"],r["status"],r.get("error")] for r in report["results"]],
      "productionManifestChanges":0},indent=2))
    return 0 if report["sourceFilesStaged"] or (not opts.download and report["sourceFilesVerified"]) else 2

if __name__=="__main__":
    sys.exit(main())
