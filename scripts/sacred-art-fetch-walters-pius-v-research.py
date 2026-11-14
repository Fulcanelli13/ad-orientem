#!/usr/bin/env python3
"""Fetch one Walters Museum CC0 front-image candidate for research, not publication."""
import argparse, hashlib, io, json, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image, ImageOps, ImageStat

HOST = "art.thewalters.org"
PHOTO_PATH = "/images/art/PS1_37.453_FntAftTrt_DD_T09.jpg"
MAX_BYTES = 32 * 1024 * 1024

def acquire(url):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != HOST or parsed.path != PHOTO_PATH or parsed.query:
        raise ValueError("source image outside exact Walters allowlist")
    req = urllib.request.Request(url, headers={"User-Agent": "AdOrientemMuseumImageResearch/1.0", "Accept": "image/jpeg"})
    with urllib.request.urlopen(req, timeout=30) as res:
        resolved = urllib.parse.urlparse(res.geturl())
        if resolved.scheme != "https" or resolved.hostname != HOST or resolved.path != PHOTO_PATH:
            raise ValueError("museum source redirected outside allowlisted path")
        content_type = res.headers.get("Content-Type", "").lower()
        if not any(v in content_type for v in ("jpeg","jpg","octet-stream")):
            raise ValueError("non-JPEG content type: "+content_type)
        data = res.read(MAX_BYTES + 1)
        if not 1024 <= len(data) <= MAX_BYTES or not data.startswith(b"\xff\xd8\xff"):
            raise ValueError("bad, empty or oversized JPEG")
    return data, res.geturl()

def analyse(data):
    with Image.open(io.BytesIO(data)) as im:
        im.verify()
    with Image.open(io.BytesIO(data)) as im:
        im.load()
        width, height = im.size
        if width * height > 100_000_000:
            raise ValueError("oversized decoded image")
        icc = bool(im.info.get("icc_profile"))
        rgb = im.convert("RGB")
        sample = rgb.copy()
        sample.thumbnail((300,300),Image.Resampling.LANCZOS)
        saturation = round(ImageStat.Stat(sample.convert("HSV").getchannel("S")).mean[0],2)
        result = {
            "pixelWidth": width, "pixelHeight": height, "decodedMode": im.mode,
            "iccProfilePresent": icc, "thumbnailMeanSaturation": saturation,
            "colourDiagnostic": "HAS_MEASURABLE_COLOUR" if saturation >= 5 else "HOLD_NEAR_MONOCHROME",
            "sourceWidthDiagnostic": "PASS_WIDTH_MIN_1170" if width >= 1170 else "HOLD_WIDTH_BELOW_1170"
        }
        for label, ratio in (("wide390x240",390/240),("portrait390x520",390/520)):
            result[label+"CoverAreaRetainedPct"] = round(100 * min((width/height)/ratio,ratio/(width/height)),1)
        return rgb, result

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--queue",required=True)
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    manifest=json.loads(Path(args.queue).read_text(encoding="utf-8"))
    candidate=manifest["candidate"]
    expected_url="https://"+HOST+PHOTO_PATH
    if (candidate["workKey"]!="Walters:37.453" or candidate["photoUrl"]!=expected_url
        or candidate.get("ownerPlacementApproved") is not False or candidate.get("releaseReady") is not False):
        raise ValueError("source selection or fail-closed publication guard mismatch")
    dest=Path(args.output)
    dest.mkdir(parents=True,exist_ok=True)
    report={
        "schema":"AO_WALTERS_SOURCE_PHOTO_QA_V1",
        "asOfUtc":datetime.now(timezone.utc).isoformat(),
        "workKey":"Walters:37.453",
        "museumObjectUrl":candidate["museumObjectUrl"],
        "sourceUrl":candidate["photoUrl"],
        "licenceEvidence":candidate["licencePage"],
        "imageRole":"OFFICIAL_WHOLE_FRONT_COLOUR_CANDIDATE",
        "researchOnly":True, "publicAppAssetsUpdated":False,
        "ownerDateSpecificApproval":False, "productionEligible":False,
        "formalMobileCropCertified":False, "status":"RETRIEVAL_FAILED"
    }
    try:
        raw, resolved=acquire(candidate["photoUrl"])
        rgb, qa=analyse(raw)
        (dest/"original").mkdir(exist_ok=True)
        (dest/"review").mkdir(exist_ok=True)
        (dest/"original"/"Walters_37.453.jpg").write_bytes(raw)
        thumb=ImageOps.contain(rgb,(800,800),Image.Resampling.LANCZOS)
        thumb.save(dest/"review"/"Walters_37.453.jpg",format="JPEG",quality=85)
        report.update(qa)
        report.update(sourceBytes=len(raw),sourceSha256=hashlib.sha256(raw).hexdigest(),
                      resolvedMuseumUrl=resolved,status="RETRIEVED_RESEARCH_ONLY_PENDING_ART_CROP_REVIEW")
        if qa["colourDiagnostic"]!="HAS_MEASURABLE_COLOUR" or qa["sourceWidthDiagnostic"]!="PASS_WIDTH_MIN_1170":
            report["status"]="RETRIEVED_BUT_TECHNICAL_HOLD"
    except Exception as exc:
        report["error"]=type(exc).__name__+": "+str(exc)
    finally:
        (dest/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(report,indent=2,ensure_ascii=False))
    return 1 if report["status"]=="RETRIEVAL_FAILED" else 0

if __name__=="__main__":
    raise SystemExit(main())
