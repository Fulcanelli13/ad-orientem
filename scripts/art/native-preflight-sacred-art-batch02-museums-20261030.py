#!/usr/bin/env python3
"""Read the 40 official museum originals in Sacred Art Batch 02, no Commons calls.

All new hashes are source evidence only. The 35+ records without historical
native SHA cannot be retroactively described as archived-original matches.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from hashlib import sha1,sha256
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request,urlopen
import csv,json,re,runpy

ROOT=Path("data/calendar/sacred-art-master-v2")
INPUT=ROOT/"first-look-photo-review-batch-02.csv"
REPORT=ROOT/"native-photo-preflight-batch02-official-museums-20261030.v1.json"
diagnostics=runpy.run_path("scripts/art/native-preflight-sacred-art-batch04-20261030.py")["native_diagnostics"]
HOSTS={"images.metmuseum.org","openaccess-cdn.clevelandart.org",
       "collectionapi.metmuseum.org","openaccess-api.clevelandart.org"}
AGENT="AdOrientemSacredArtMuseumNativeQA/2026-10-30 (+https://github.com/Fulcanelli13/ad-orientem)"
def fetch(url,cap=29_000_000):
    p=urlsplit(url)
    if p.scheme!="https" or p.hostname not in HOSTS:raise ValueError("NONOFFICIAL_IMAGE_HOST")
    req=Request(url,headers={"User-Agent":AGENT,
                             "Accept":"image/jpeg,image/png,application/json,*/*;q=.1"})
    with urlopen(req,timeout=25) as f:
        final=f.geturl()
        end=urlsplit(final)
        if end.scheme!="https" or end.hostname not in HOSTS:raise ValueError("UNTRUSTED_REDIRECT")
        raw=f.read(cap+1)
        if not raw or len(raw)>cap:raise ValueError("EMPTY_OR_EXCESSIVE_SOURCE")
        return raw,final
def official(row):
    page=row["source_url"]
    met=re.fullmatch(r"https://www\.metmuseum\.org/art/collection/search/(\d+)",page)
    if met:
        oid=met.group(1)
        obj=json.loads(fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+oid,3_000_000)[0])
        if str(obj.get("objectID"))!=oid or obj.get("isPublicDomain") is not True:
            raise ValueError("MET_ID_OR_RIGHTS_MISMATCH")
        return obj.get("primaryImage") or "","MET_OBJECT_ID_AND_PD_VERIFIED"
    cma=re.fullmatch(r"https://(?:www\.)?clevelandart\.org/art/([0-9]{4}\.[0-9A-Za-z.]+)",page)
    if cma:
        num=cma.group(1)
        obj=json.loads(fetch("https://openaccess-api.clevelandart.org/api/artworks/"+num,3_000_000)[0]).get("data",{})
        if str(obj.get("accession_number"))!=num or obj.get("share_license_status")!="CC0":
            raise ValueError("CMA_ACCESSION_OR_CC0_MISMATCH")
        return ((obj.get("images") or {}).get("print") or {}).get("url") or "","CMA_ACCESSION_AND_CC0_VERIFIED"
    raise ValueError("UNEXPECTED_INSTITUTION")
def one(row):
    id=row["physical_work_group"]
    report={"physicalWorkGroup":id,"sourcePage":row["source_url"],"title":row["title"],
       "artist":row["artist"],"historicOriginalSha256":row["original_sha256"],
       "expectedOfficialImageUrl":row["official_image_original"],
       "status":"HOLD_UNCHECKED","fileRightsFinallyCertified":False,
       "humanPhotoApproved":False,"queue1Promotion":False}
    try:
        actual_url,proof=official(row)
        if not actual_url or (urlsplit(actual_url).scheme,urlsplit(actual_url).netloc,
                             urlsplit(actual_url).path)!=(urlsplit(row["official_image_original"]).scheme,
                                urlsplit(row["official_image_original"]).netloc,
                                urlsplit(row["official_image_original"]).path):
            raise ValueError("OFFICIAL_IMAGE_URL_CHANGED_FROM_REVIEW_RECORD")
        report["officialIdentityVerification"]=proof
        raw,final=fetch(actual_url)
        current=sha256(raw).hexdigest()
        report["currentSha256"]=current
        report["fileBytes"]=len(raw)
        report["finalImageUrl"]=final
        historical=row["original_sha256"]
        if historical and current!=historical:
            report["status"]="HOLD_HISTORICAL_ORIGINAL_SHA_CHANGED"
            return report
        past_sha1=row["photo_file_sha1"]
        if past_sha1 and re.fullmatch("[0-9a-f]{40}",past_sha1) and sha1(raw).hexdigest()!=past_sha1:
            report["status"]="HOLD_ORIGINAL_SHA1_CHANGED"
            return report
        report.update(diagnostics(raw))
        report["status"]="NATIVE_CURRENT_OFFICIAL_IMAGE_SCREENED"
        report["historicalNativeSha256Matched"]=bool(historical)
        report["newSha256CapturedWithoutHistoricalComparison"]=not bool(historical)
    except Exception as e:
        report["status"]="HOLD_SOURCE_ORIGINAL_UNVERIFIED"
        report["error"]=type(e).__name__+":"+str(e)[:175]
    return report
def main():
    with INPUT.open(encoding="utf-8-sig",newline="") as f:
        allrows=list(csv.DictReader(f))
    assert len(allrows)==200 and len({x["physical_work_group"] for x in allrows})==200
    rows=[x for x in allrows if x["rights_category"]=="OFFICIAL_OPEN_ACCESS_CURRENT_PRIMARY_IMAGE_METADATA"]
    assert len(rows)==40 and len({x["physical_work_group"] for x in rows})==40
    assert all(x["official_image_original"] for x in rows)
    with ThreadPoolExecutor(max_workers=4) as pool:
        results=list(pool.map(one,rows))
    stats={}
    flags={}
    for x in results:
        stats[x["status"]]=stats.get(x["status"],0)+1
        for a in x.get("advisoryFlags",[]):flags[a]=flags.get(a,0)+1
    output={"schema":"AO_SACRED_ART_BATCH02_OFFICIAL_NATIVE_SCREENING_V1",
      "createdUtc":datetime.now(timezone.utc).isoformat(),
      "reviewCsv":str(INPUT),"cases":40,"resultsByStatus":stats,
      "historicalSha256Matches":sum(x.get("historicalNativeSha256Matched",False) for x in results),
      "newCurrentSourceSha256WithoutHistoricalComparison":sum(x.get("newSha256CapturedWithoutHistoricalComparison",False) for x in results),
      "advisoryFlags":flags,"unvalidatedOrHeld":sum(x["status"].startswith("HOLD_") for x in results),
      "autoApprovedPhotoCount":0,"originalSourceRecordsMutated":0,"editorialDecisionsMutated":0,
      "humanPhotoApprovals":0,"fileRightsFinalCertifications":0,"queue1Promotions":0,
      "productionChanges":0,"feesEur":0,
      "notes":["Institutional object/rights metadata does not clear a specific photo in every jurisdiction.",
               "No title-based source substitutions. If the museum points to a different image file, hold.",
               "No archived original hash means the new SHA is a current source fingerprint, not historical validation."],
      "records":results}
    REPORT.write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n")
    assert len(results)==40 and all(not x["humanPhotoApproved"] and not x["queue1Promotion"] for x in results)
    print("BATCH02_MUSEUM_NATIVE",json.dumps({"statuses":stats,"hashMatched":output["historicalSha256Matches"],
        "newSourceHash":output["newCurrentSourceSha256WithoutHistoricalComparison"],
        "held":output["unvalidatedOrHeld"],"flags":flags,"released":0}),flush=True)
if __name__=="__main__":main()
