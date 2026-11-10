#!/usr/bin/env python3
"""Research-only Wellcome full-front V0017627 first-party source discovery.

Never imports Commons images, never approves image placements, never writes to
Pages. A successful discovery run is not the same as a successful image fetch.
"""
import argparse
import hashlib
import io
import json
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageStat

MAX_BYTES = 32 * 1024 * 1024
SOURCES = [
    ("HISTORICAL_DOCUMENTED_WELLCOME_FIRST_PARTY",
     "https://wellcomeimages.org/indexplus/obf_images/14/ab/5e0345a8bab3b99d9bcf96f70005.jpg"),
    ("WELLCOME_IIIF_V0017627_PATH_HYPOTHESIS_NOT_OFFICIALLY_LINKED",
     "https://iiif.wellcomecollection.org/image/V0017627/full/max/0/default.jpg"),
]
HOSTS = {"wellcomeimages.org", "www.wellcomeimages.org", "iiif.wellcomecollection.org"}
EXPECTED_WORK_KEY = "Wellcome:45078i"
EXPECTED_IMAGE = "V0017627"

def get_image(url):
    p = urllib.parse.urlparse(url)
    if p.scheme != "https" or p.hostname not in HOSTS or p.username or p.password:
        raise ValueError("Unallowlisted official host")
    req = urllib.request.Request(url, headers={
        "User-Agent":"AdOrientemResearch/1.0 (image provenance analysis)",
        "Accept":"image/jpeg"
    })
    with urllib.request.urlopen(req, timeout=20) as resp:
        real = urllib.parse.urlparse(resp.geturl())
        if real.scheme != "https" or real.hostname not in HOSTS:
            raise ValueError("Redirect outside explicit Wellcome host allowlist")
        ctype = resp.headers.get("Content-Type","").lower()
        if "jpeg" not in ctype and "octet-stream" not in ctype:
            raise ValueError("Not JPEG content type: "+ctype)
        data = resp.read(MAX_BYTES+1)
    if len(data) > MAX_BYTES or len(data) < 1024 or not data.startswith(b"\xff\xd8\xff"):
        raise ValueError("Not bounded JPEG source bytes")
    return data, resp.geturl()

def image_diagnostics(data):
    with Image.open(io.BytesIO(data)) as im:
        im.verify()
    with Image.open(io.BytesIO(data)) as im:
        im.load()
        w,h=im.size
        if w*h>100_000_000:
            raise ValueError("Unbounded decoded image dimensions")
        rgb=im.convert("RGB")
        thumb=rgb.copy()
        thumb.thumbnail((400,400),Image.Resampling.LANCZOS)
        sat=round(ImageStat.Stat(thumb.convert("HSV").getchannel("S")).mean[0],2)
        return rgb, {"width":w,"height":h,"sourceMode":im.mode,
            "iccPresent":bool(im.info.get("icc_profile")),
            "meanThumbnailSaturation":sat,
            "sourceColorDiagnostic":"HAS_MEASURABLE_COLOUR" if sat>=5 else "HOLD_NEAR_MONOCHROME",
            "wide390x240RetainedAreaPercent":round(100*min((w/h)/(390/240),(390/240)/(w/h)),1),
            "portrait390x520RetainedAreaPercent":round(100*min((w/h)/(390/520),(390/520)/(w/h)),1)}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--ledger",required=True)
    p.add_argument("--output",required=True)
    opts=p.parse_args()
    ledger=json.loads(Path(opts.ledger).read_text("utf-8"))
    row=next((x for x in ledger["records"] if x["workKey"]==EXPECTED_WORK_KEY),None)
    if not row or row.get("fullFrontImageId")!=EXPECTED_IMAGE:
        raise ValueError("full-front ID guard failed")
    if row.get("productionEligible") is not False or row.get("ownerPlacementApproved") is not False:
        raise ValueError("publication hold guard failed")
    dest=Path(opts.output)
    dest.mkdir(parents=True,exist_ok=True)
    report={"schema":"AO_WELLCOME_V0017627_FIRST_PARTY_FETCH_ATTEMPT_V1",
        "asOfUtc":datetime.now(timezone.utc).isoformat(),
        "workKey":EXPECTED_WORK_KEY,"imageId":EXPECTED_IMAGE,"sourceWork":"jgxd7rrf",
        "historicalPhotoLicence":"CC_BY_4_0_FROM_WELLCOME_ORIGIN_ARCHIVE",
        "researchOnly":True,"appPublication":False,
        "ownerDateApproval":False,"currentFirstPartyFileLicenceIndependentlyReconciled":False,
        "sourcePhotoConfirmed":False,"acquisitionStatus":"HOLD_NO_FIRST_PARTY_BYTES",
        "probes":[]}
    for kind,url in SOURCES:
        probe={"kind":kind,"url":url,"status":"FAILED"}
        try:
            data,final_url=get_image(url)
            rgb,details=image_diagnostics(data)
            if details["width"] < 1170 or details["sourceColorDiagnostic"]!="HAS_MEASURABLE_COLOUR":
                probe.update(details)
                probe["status"]="TECHNICAL_HOLD"
                continue
            (dest/"original").mkdir(exist_ok=True)
            (dest/"review").mkdir(exist_ok=True)
            (dest/"original"/"Wellcome_V0017627.jpg").write_bytes(data)
            preview=rgb.copy()
            preview.thumbnail((900,900),Image.Resampling.LANCZOS)
            preview.save(dest/"review"/"Wellcome_V0017627.jpg","JPEG",quality=85)
            probe.update(details)
            probe.update(status="DOWNLOADED_UNPUBLISHED",sha256=hashlib.sha256(data).hexdigest(),
                         bytes=len(data),verifiedUrl=final_url,
                         sha1MatchesHistoricWellcomeFile=hashlib.sha1(data).hexdigest()==row["historicalCommonsFileSha1"])
            report["acquisitionStatus"]="ORIGINAL_FIRST_PARTY_BYTES_ACQUIRED_AWAITING_LICENCE_AND_EDITORIAL_QA"
            report["sourcePhotoConfirmed"]=True
            report["sourceSha256"]=probe["sha256"]
            report["sourcePixels"]=[details["width"],details["height"]]
            report["sourceBytes"]=len(data)
            report["sourceKind"]=kind
            report["probes"].append(probe)
            break
        except Exception as e:
            probe["error"]=type(e).__name__+": "+str(e)[:300]
        report["probes"].append(probe)
    (dest/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":report["acquisitionStatus"],"probes":report["probes"]},ensure_ascii=False,indent=2),flush=True)
    # An executed research probe is a completed investigation even when access fails.
    # The report, not job success, is the sole authority for acquisition status.
    return 0

if __name__=="__main__":
    raise SystemExit(main())
