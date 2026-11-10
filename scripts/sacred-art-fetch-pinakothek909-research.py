#!/usr/bin/env python3
"""Bounded source-image check for Bavarian State Collections Ribera candidate."""
import argparse, hashlib, io, json, urllib.parse, urllib.request
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image, ImageStat

MAX=32*1024*1024
HOST="cdn.thenetexperts.info"
SALT="/artworks/JUSEPE-DE-RIBERA-1591_HL-PETRUS-VON-ALCANTARA-IN-MEDITATION-909_542157_CC-BY-SA_BSTGS.jpg"

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--ledger",required=True);p.add_argument("--output",required=True)
    args=p.parse_args()
    candidate=json.loads(Path(args.ledger).read_text('utf-8'))["candidate"]
    if candidate["key"]!="Pinakothek:909" or candidate["productionEligible"] is not False or candidate["ownerApprovedPlacement"] is not False:
        raise ValueError("protected painting/placement hold changed")
    url=candidate["officialImageDownloadCandidate"]
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or parsed.hostname!=HOST or parsed.query or SALT not in parsed.path:
        raise ValueError("not exact museum-catalogue download address")
    out=Path(args.output)
    out.mkdir(parents=True,exist_ok=True)
    report={"schema":"AO_RIBERA_PINAKOTHEK909_SOURCE_FETCH_V1",
       "asOfUtc":datetime.now(timezone.utc).isoformat(),"key":"Pinakothek:909",
       "sourceCatalogue":candidate["permanentObjectUrl"],"sourceUrl":url,
       "licence":"CC BY-SA 4.0, source item-specific museum download",
       "sourceAcquired":False,"photoSha256":None,"publicationEligible":False,
       "ownerDateApproval":False,"state":"HOLD_SOURCE_NOT_FETCHED"}
    try:
        request=urllib.request.Request(url,headers={"User-Agent":"AdOrientemMuseumResearch/1.0","Accept":"image/jpeg"})
        with urllib.request.urlopen(request,timeout=25) as response:
            real=urllib.parse.urlparse(response.geturl())
            if real.scheme!="https" or real.hostname!=HOST:
                raise ValueError("disallowed download redirect")
            ctype=response.headers.get("Content-Type","").lower()
            if "jpeg" not in ctype and "octet-stream" not in ctype:
                raise ValueError("invalid content-type "+ctype)
            raw=response.read(MAX+1)
        if not 1024<=len(raw)<=MAX or not raw.startswith(b"\xff\xd8\xff"):
            raise ValueError("invalid bounded JPEG")
        with Image.open(io.BytesIO(raw)) as img:img.verify()
        with Image.open(io.BytesIO(raw)) as im:
            im.load()
            w,h=im.size
            if w*h>100_000_000:raise ValueError("unbounded dimensions")
            rgb=im.convert("RGB")
            preview=rgb.copy();preview.thumbnail((400,400),Image.Resampling.LANCZOS)
            sat=round(ImageStat.Stat(preview.convert("HSV").getchannel("S")).mean[0],2)
            report.update(photoSha256=hashlib.sha256(raw).hexdigest(),
                          pixelWidth=w,pixelHeight=h,photoBytes=len(raw),
                          imageMode=im.mode,iccPresent=bool(im.info.get("icc_profile")),
                          saturation=sat,verifiedHost=HOST,
                          wide390x240RetainedPct=round(100*min((w/h)/(390/240),(390/240)/(w/h)),1),
                          portrait390x520RetainedPct=round(100*min((w/h)/(390/520),(390/520)/(w/h)),1))
            report["sourceAcquired"]=True
            report["state"]="SOURCE_BYTES_ACQUIRED_NEEDS_HUMAN_REVIEW"
            if w<1170 or sat<5:report["state"]="SOURCE_BYTES_ACQUIRED_TECHNICAL_HOLD"
            (out/"original").mkdir(exist_ok=True);(out/"review").mkdir(exist_ok=True)
            (out/"original"/"Pinakothek_909.jpg").write_bytes(raw)
            rgb.thumbnail((700,900),Image.Resampling.LANCZOS)
            rgb.save(out/"review"/"Pinakothek_909.jpg",format="JPEG",quality=85)
    except Exception as e:
        report["error"]=type(e).__name__+": "+str(e)[:300]
    (out/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(report,indent=2,ensure_ascii=False),flush=True)
    # A completed test does not claim successful image acquisition.
    return 0
if __name__=="__main__":
    raise SystemExit(main())
