#!/usr/bin/env python3
"""Noncertifying native-image preflight for 104 locked Sacred Art Batch 04 sources.

Read precise source URLs and image SHA256 from the recovery ledger; do not use
review thumbnails, inferred artist/title matches, or substitute photographs.
Any discrepancy is held, never overwritten. €0 research-only workflow.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request,urlopen
import csv,json,math,sys
from PIL import Image,ImageFilter,ImageOps,ImageStat

ROOT=Path("data/calendar/sacred-art-master-v2")
RECOVERY=ROOT/"fast-grid-batch04-recovery-results-20261030.v1.json"
INPUT=ROOT/"fast-grid-batch04-unmatched-104-recovery-20261030.v1.json"
OUTPUT=ROOT/"native-photo-preflight-batch04-20261030.v1.json"
REVIEW=ROOT/"native-photo-preflight-batch04-priority-20261030.csv"
AGENT="AdOrientemSacredArtNativeQA/2026-10-30 (+https://github.com/Fulcanelli13/ad-orientem)"
HOSTS={"images.metmuseum.org","openaccess-cdn.clevelandart.org"}

def retrieve(url, cap=29_000_000):
    parsed=urlsplit(url)
    if parsed.scheme!="https" or parsed.hostname not in HOSTS: raise ValueError("NONPINNED_IMAGE_HOST")
    req=Request(url,headers={"User-Agent":AGENT,"Accept":"image/jpeg,image/png,image/*;q=0.9"})
    with urlopen(req,timeout=22) as resp:
        final=resp.geturl()
        target=urlsplit(final)
        if target.scheme!="https" or target.hostname not in HOSTS:raise ValueError("UNTRUSTED_IMAGE_REDIRECT")
        blob=resp.read(cap+1)
        if not blob or len(blob)>cap:raise ValueError("EMPTY_OR_EXCESSIVE_ORIGINAL")
        return blob,final

def summarize_band(image):
    rgb=image.convert("RGB")
    values=ImageStat.Stat(rgb)
    gray=ImageStat.Stat(ImageOps.grayscale(rgb))
    reduced=rgb.resize((min(100,rgb.width),min(100,rgb.height)))
    pix=list(reduced.getdata())
    n=max(1,len(pix))
    white=sum(min(p)>243 and max(p)-min(p)<27 for p in pix)/n
    dark=sum(max(p)<17 for p in pix)/n
    return {"rgbMean":[round(x,1) for x in values.mean],
        "luminanceMean":round(gray.mean[0],1),
        "luminanceStddev":round(gray.stddev[0],1),
        "nearWhiteFraction":round(white,3),"nearBlackFraction":round(dark,3)}

def native_diagnostics(raw):
    with Image.open(BytesIO(raw)) as im:
        exif_orientation=im.getexif().get(274)
        icc=bool(im.info.get("icc_profile"))
        mode=im.mode
        format_name=im.format
        image=ImageOps.exif_transpose(im)
        image.load()
        width,height=image.size
        rgb=image.convert("RGB")
        rgb.thumbnail((768,768),Image.Resampling.LANCZOS)
        width_sm,height_sm=rgb.size
        edge_px=max(4,round(min(width_sm,height_sm)*0.045))
        bands={
            "top":rgb.crop((0,0,width_sm,edge_px)),
            "bottom":rgb.crop((0,height_sm-edge_px,width_sm,height_sm)),
            "left":rgb.crop((0,0,edge_px,height_sm)),
            "right":rgb.crop((width_sm-edge_px,0,width_sm,height_sm)),
        }
        band_stats={k:summarize_band(v) for k,v in bands.items()}
        center=rgb.crop((round(width_sm*.2),round(height_sm*.2),
                         round(width_sm*.8),round(height_sm*.8)))
        central=summarize_band(center)
        low_coverage={"white":[k for k,v in band_stats.items()
                      if v["nearWhiteFraction"]>.73],
                      "black":[k for k,v in band_stats.items()
                      if v["nearBlackFraction"]>.78]}
        # Pixel statistics are only anomaly screening, not painting/frame detection.
        flags=[]
        if len(low_coverage["white"])>=2 and central["nearWhiteFraction"]<.42:
            flags.append("SUSPECT_LIGHT_EXTERIOR_MARGIN")
        if len(low_coverage["black"])>=2 and central["nearBlackFraction"]<.45:
            flags.append("SUSPECT_DARK_EXTERIOR_MARGIN")
        flat=[v for v in band_stats.values() if v["luminanceStddev"]<15]
        if len(flat)>=3 and abs(sum(v["luminanceMean"] for v in flat)/len(flat)
                                -central["luminanceMean"])>28:
            flags.append("POSSIBLE_UNIFORM_FRAME_OR_MATTE")
        if min(width,height)<1200 or max(width,height)<2200:
            flags.append("MOBILE_HERO_PIXEL_DENSITY_CHECK")
        if max(width,height)/max(1,min(width,height))>3:
            flags.append("VERY_NARROW_IMAGE_CHECK_RESPONSIVE_CROP")
        if not icc:
            flags.append("MISSING_EMBEDDED_ICC_COMPARE_MUSEUM_REFERENCE")
        # Soft brushwork is legitimate: this edge statistic is not a blur verdict.
        ed=ImageStat.Stat(ImageOps.grayscale(rgb).filter(ImageFilter.FIND_EDGES))
        edge_std=round(ed.stddev[0],2)
        if edge_std<13:
            flags.append("LOW_EDGE_CONTRAST_MANUAL_DETAIL_INSPECTION")
        return {
            "nativeDimensions":[width,height],"rawMode":mode,"rawFormat":format_name,
            "exifOrientationTag":exif_orientation,"iccProfilePresent":icc,
            "estimatedAspectRatio":round(width/height,4),
            "screeningSampleDimensions":[width_sm,height_sm],
            "outerBandWidthSamplePx":edge_px,
            "outerBands":band_stats,"centralReference":central,
            "edgeContrastStddevHeuristic":edge_std,
            "advisoryFlags":flags,
            "manualChecks":["Visible frame, mount, hardware or reflection",
              "Faithful artwork boundaries; no subject/halo or painted-field loss",
              "Colour and contrast against trusted museum original",
              "Native detail, noise, compression, softness and relevant mobile crop",
              "Correct physical work and original-photo rights in applicable jurisdictions"],
            "computerVisionCertification":False,"photoPristineCertified":False}

def preflight(row,source):
    id=row["physicalWorkGroup"]
    rec={"physicalWorkGroup":id,"sourceRecordId":row["sourceRecordId"],
         "museum":row["museum"],"sourcePage":row["sourcePage"],
         "pinnedOriginalUrl":row["sourceImageUrl"],
         "expectedSha256":row["downloadedSha256"],
         "status":"HOLD_UNCHECKED", "visualGate":"MANUAL_NATIVE_IMAGE_REVIEW_REQUIRED",
         "originalShaMatched":False,"rightsFinallyCertified":False,
         "pristineApproved":False,"queue1Promoted":False}
    try:
        if not row["downloaded"] or not row["reviewImageEmbedded"]:
            raise ValueError("PREVIOUS_IMAGE_NOT_RECOVERED")
        raw,final=retrieve(row["sourceImageUrl"])
        actual=sha256(raw).hexdigest()
        rec["actualOriginalSha256"]=actual
        rec["originalBytes"]=len(raw)
        rec["resolvedUrl"]=final
        if actual!=row["downloadedSha256"]:
            rec["status"]="HOLD_EXACT_SOURCE_BYTES_CHANGED"
            rec["error"]="PINNED_ORIGINAL_SHA256_MISMATCH"
            return rec
        rec["originalShaMatched"]=True
        diagnostics=native_diagnostics(raw)
        rec.update(diagnostics)
        if diagnostics["nativeDimensions"]!=row["downloadedDimensions"]:
            rec["status"]="HOLD_SOURCE_DIMENSIONS_CHANGED"
        else:
            rec["status"]="NATIVE_SOURCE_MATCHED_SCREENING_ONLY"
    except Exception as e:
        rec["status"]="HOLD_ORIGINAL_NOT_RETRIEVABLE"
        rec["error"]=type(e).__name__+":"+str(e)[:180]
    return rec

def run():
    recovery=json.loads(RECOVERY.read_text())
    locked=json.loads(INPUT.read_text())
    assert recovery["downloadedAndEmbedded"]==104 and recovery["notRecovered"]==0
    assert len(recovery["records"])==104 and len(locked["candidates"])==104
    recovery_ids=[r["physicalWorkGroup"] for r in recovery["records"]]
    assert len(set(recovery_ids))==104
    by_id={r["physicalWorkGroup"]:r for r in locked["candidates"]}
    assert set(by_id)==set(recovery_ids)
    with ThreadPoolExecutor(max_workers=4) as executor:
        outcomes=list(executor.map(lambda r:preflight(r,by_id[r["physicalWorkGroup"]]),recovery["records"]))
    assert len(outcomes)==104 and len({r["physicalWorkGroup"] for r in outcomes})==104
    totals={}
    for r in outcomes:totals[r["status"]]=totals.get(r["status"],0)+1
    flagged=sum(bool(x.get("advisoryFlags")) for x in outcomes)
    all_flags={}
    for x in outcomes:
        for flag in x.get("advisoryFlags",[]):all_flags[flag]=all_flags.get(flag,0)+1
    out={
      "schema":"AO_SACRED_ART_NATIVE_ORIGINAL_SCREENING_BATCH04_V1",
      "createdUtc":datetime.now(timezone.utc).isoformat(),
      "sourceRecoveryLedger":str(RECOVERY),"lockedInputLedger":str(INPUT),
      "registrySnapshot":locked["reviewRegistrySnapshot"],
      "assessedOriginals":104,
      "exactSourceSha256Matched":sum(x["originalShaMatched"] for x in outcomes),
      "exactSourceDimensionsMatched":totals.get("NATIVE_SOURCE_MATCHED_SCREENING_ONLY",0),
      "heldSourceVersions":sum(v for k,v in totals.items() if k.startswith("HOLD_")),
      "casesWithAdvisoryFlags":flagged,"statusCounts":totals,
      "flagCounts":all_flags,
      "identitySource":"Exact accession/object ID verified in preceding recovery stage",
      "allManualImageQualityApprovalStillRequired":True,
      "borderAndReflectionMetricsNotProofOfFraming":True,
      "copyrightMetadataNotFinalFileRightsClearance":True,
      "downloadedNativeFilesPersistentlyArchived":False,
      "priorEditorialApprovalsModified":0,"historicalSourcesDeleted":0,
      "queue1Promotions":0,"finalPristineApprovals":0,"finalRightsCertifications":0,
      "productionChanges":0,"feeEur":0,"records":outcomes}
    OUTPUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
    # Triage is stable and human-directed; heuristic flags never constitute rejection.
    rank=lambda x:(0 if x["status"].startswith("HOLD_") else
                   1 if "SUSPECT_LIGHT_EXTERIOR_MARGIN" in x.get("advisoryFlags",[]) or
                        "SUSPECT_DARK_EXTERIOR_MARGIN" in x.get("advisoryFlags",[]) or
                        "POSSIBLE_UNIFORM_FRAME_OR_MATTE" in x.get("advisoryFlags",[]) else
                   2 if x.get("advisoryFlags") else 3)
    rows=sorted(outcomes,key=lambda x:(rank(x),x["physicalWorkGroup"]))
    with REVIEW.open("w",newline="",encoding="utf-8") as f:
        writer=csv.writer(f)
        writer.writerow(["stable_group_id","triage_priority","museum","original_sha256","source_url",
                         "status","advisory_flags","native_dimensions","manual_quality_approved","release_authorized"])
        for r in rows:
            writer.writerow([r["physicalWorkGroup"],rank(r),r["museum"],
                r.get("actualOriginalSha256",""),r["pinnedOriginalUrl"],r["status"],
                "|".join(r.get("advisoryFlags",[])),
                "x".join(map(str,r.get("nativeDimensions",[]))),
                "NO","NO"])
    assert out["finalPristineApprovals"]==out["queue1Promotions"]==out["productionChanges"]==0
    print("NATIVE_QA_PREFLIGHT",json.dumps({"matched":out["exactSourceSha256Matched"],
        "held":out["heldSourceVersions"],"flagged":flagged,
        "flagCounts":all_flags,"queue1":0,"feeEur":0}),flush=True)

def self_test():
    # Deterministic heuristic tests: a synthetic margin must be flagged, never certified.
    from PIL import ImageDraw
    a=Image.new("RGB",(1200,1500),(85,60,50))
    d=ImageDraw.Draw(a);d.rectangle((0,0,1199,48),fill=(253,253,253))
    d.rectangle((0,1450,1199,1499),fill=(253,253,253))
    f=BytesIO();a.save(f,"PNG")
    x=native_diagnostics(f.getvalue())
    assert "SUSPECT_LIGHT_EXTERIOR_MARGIN" in x["advisoryFlags"],x["advisoryFlags"]
    assert x["computerVisionCertification"] is False and x["photoPristineCertified"] is False
    a=Image.new("RGB",(1400,1400),(65,52,47));f=BytesIO();a.save(f,"PNG")
    y=native_diagnostics(f.getvalue())
    assert not y["photoPristineCertified"]
    print("PREFLIGHT_SELF_TEST_PASS")
if __name__=="__main__":
    self_test() if "--self-test" in sys.argv else run()
