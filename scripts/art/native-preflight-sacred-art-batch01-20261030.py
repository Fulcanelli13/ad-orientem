#!/usr/bin/env python3
"""Exact-file native QA for the frozen first 73 Sacred Art review records.

Do not mutate the prior 73-card gallery, source register or editorial approvals.
The original prior SHA-256 is mandatory; a new photo is never substituted.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from hashlib import sha256
from pathlib import Path
from urllib.parse import urlsplit,unquote,quote
from urllib.request import Request,urlopen
import csv,json,re,runpy,sys

ROOT=Path("data/calendar/sacred-art-master-v1")
INPUT=ROOT/"first-pristine-photo-review.csv"
REPORT=Path("data/calendar/sacred-art-master-v2/native-photo-preflight-batch01-20261030.v1.json")
PREVIEW_PROOF=ROOT/"fast-grid-first73-previews-20261030.v1.json"
SHARED=runpy.run_path("scripts/art/native-preflight-sacred-art-batch04-20261030.py")
diagnostics=SHARED["native_diagnostics"]
AGENT="AdOrientemSacredArtNativeQA-First73/2026-10-30 (+https://github.com/Fulcanelli13/ad-orientem)"
ALLOWED={"commons.wikimedia.org","upload.wikimedia.org","images.metmuseum.org",
         "collectionapi.metmuseum.org","openaccess-api.clevelandart.org",
         "openaccess-cdn.clevelandart.org","www.clevelandart.org","clevelandart.org"}
MAX=30_000_000
def load(url,cap=MAX):
    parts=urlsplit(url)
    if parts.scheme!="https" or parts.hostname not in ALLOWED:raise ValueError("UNTRUSTED_SOURCE_HOST")
    req=Request(url,headers={"User-Agent":AGENT,"Accept":"image/jpeg,image/png,application/json,image/*;q=.8,*/*;q=.1"})
    with urlopen(req,timeout=24) as resp:
        final=resp.geturl()
        parts=urlsplit(final)
        if parts.scheme!="https" or parts.hostname not in ALLOWED:raise ValueError("UNTRUSTED_REDIRECT")
        raw=resp.read(cap+1)
        if not raw or len(raw)>cap:raise ValueError("EMPTY_OR_TOO_LARGE")
        return raw,final
def find_original(row):
    url=row["source_url"]
    if url.startswith("https://commons.wikimedia.org/wiki/File:"):
        name=unquote(url.split("/wiki/File:",1)[1].split("?",1)[0])
        # The Commons redirect resolves the specific pinned File: title, not
        # a free-form art search. The SHA256 below is still mandatory.
        return "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quote(name,safe="()-_.!~"),"COMMONS_FILE_TITLE"
    mt=re.fullmatch(r"https://www\.metmuseum\.org/art/collection/search/(\d+)",url)
    if mt:
        number=mt.group(1)
        api="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+number
        raw,_=load(api,3_000_000)
        obj=json.loads(raw)
        if str(obj.get("objectID"))!=number or obj.get("isPublicDomain") is not True:
            raise ValueError("MET_OBJECT_ID_OR_OPEN_ACCESS_NOT_VERIFIED")
        image=obj.get("primaryImage")
        if not image:raise ValueError("MET_OBJECT_HAS_NO_CURRENT_ORIGINAL")
        return image,"MET_OFFICIAL_CURRENT_PRIMARY"
    cm=re.fullmatch(r"https://(?:www\.)?clevelandart\.org/art/([0-9]{4}\.[0-9A-Za-z.]+)",url)
    if cm:
        number=cm.group(1)
        api="https://openaccess-api.clevelandart.org/api/artworks/"+number
        raw,_=load(api,3_000_000)
        obj=json.loads(raw).get("data") or {}
        if str(obj.get("accession_number"))!=number or obj.get("share_license_status")!="CC0":
            raise ValueError("CMA_ACCESSION_OR_CC0_NOT_VERIFIED")
        image=((obj.get("images") or {}).get("print") or {}).get("url")
        if not image:raise ValueError("CMA_NO_OFFICIAL_PRINT_IMAGE")
        return image,"CMA_OFFICIAL_CURRENT_PRINT"
    raise ValueError("SOURCE_PROVIDER_NOT_SUPPORTED_NO_SUBSTITUTE")
def one(row):
    record={"physicalWorkGroup":row["physical_work_group"],
      "title":row["title"],"artist":row["artist"],"sourceUrl":row["source_url"],
      "historicalNativeSha256":row["original_sha256"],
      "status":"HOLD_SOURCE_UNVERIFIED","expectedRightsEvidence":row["rights_evidence"],
      "rightsFinallyCertified":False,"humanPristineApproved":False,
      "queue1Promoted":False,"manualVisualReviewStillRequired":True}
    try:
        if not re.fullmatch("[a-f0-9]{64}",row["original_sha256"] or ""):
            raise ValueError("NO_PINNED_ORIGINAL_SHA")
        url,kind=find_original(row)
        record["resolvedSourceMethod"]=kind
        record["officialImageUrl"]=url
        binary,final=load(url)
        h=sha256(binary).hexdigest()
        record["currentImageSha256"]=h
        record["fileBytes"]=len(binary)
        record["originalShaMatched"]=h==row["original_sha256"]
        if not record["originalShaMatched"]:
            record["status"]="HOLD_PRIOR_ORIGINAL_SHA_DIFFERS"
            return record
        record.update(diagnostics(binary))
        record["status"]="NATIVE_SOURCE_MATCHED_SCREENING_ONLY"
    except Exception as e:
        record["status"]="HOLD_NATIVE_IMAGE_RETRIEVAL_OR_SOURCE"
        record["error"]=type(e).__name__+":"+str(e)[:160]
    return record
def main():
    with INPUT.open(encoding="utf-8-sig",newline="") as f:
        rows=list(csv.DictReader(f))
    proof=json.loads(PREVIEW_PROOF.read_text())
    assert len(rows)==73 and len(set(x["physical_work_group"] for x in rows))==73
    assert proof["total"]==73 and proof["previewsEmbedded"]==73
    assert {x["physical_work_group"] for x in rows}=={x["id"] for x in proof["previewEvidence"]}
    with ThreadPoolExecutor(max_workers=3) as pool:
        results=list(pool.map(one,rows))
    statuses={}
    for r in results:statuses[r["status"]]=statuses.get(r["status"],0)+1
    matching=sum(x.get("originalShaMatched",False) and x["status"]=="NATIVE_SOURCE_MATCHED_SCREENING_ONLY" for x in results)
    flags={}
    for x in results:
        for flag in x.get("advisoryFlags",[]):flags[flag]=flags.get(flag,0)+1
    report={
      "schema":"AO_SACRED_ART_FIRST73_NATIVE_SHA_SCREEN_V1",
      "createdUtc":datetime.now(timezone.utc).isoformat(),
      "inputCsv":str(INPUT),"previousReviewProof":str(PREVIEW_PROOF),
      "protectedRecords":73,"checked":73,"exactHistoricalShaMatches":matching,
      "held":73-matching,"statusCounts":statuses,"advisoryFlagCounts":flags,
      "notUserPhotoRejections":True,"automatedQualityPassCount":0,
      "sourceRecordDeletions":0,"existing73GalleryMutations":0,
      "editorialDecisionsChanged":0,"finalRightsCertifications":0,
      "humanPristineApprovals":0,"queue1Promotions":0,
      "productionMutations":0,"feeEur":0,"records":results}
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    assert len(results)==73 and all(not x["rightsFinallyCertified"] and
         not x["humanPristineApproved"] and not x["queue1Promoted"] for x in results)
    print("FIRST73_ORIGINAL_SCREEN",json.dumps({
        "verified":matching,"held":73-matching,"flags":flags,"queue1":0,"fees":0}),flush=True)
if __name__=="__main__":main()
