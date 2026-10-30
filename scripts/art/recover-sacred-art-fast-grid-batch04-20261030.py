#!/usr/bin/env python3
"""Source-bound recovery for missing Sacred Art Photo QA Batch 04.

Never auto-approve, clear rights, replace archived originals or publish.
Only source-backed, actually downloaded previews appear in the review page.
"""
from __future__ import annotations
import base64
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html import unescape
from io import BytesIO
import json, re, time
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path("data/calendar/sacred-art-master-v2")
SOURCE=ROOT/"fast-grid-batch04-unmatched-104-recovery-20261030.v1.json"
REPORT=ROOT/"fast-grid-batch04-recovery-results-20261030.v1.json"
PAGE=Path("docs/SACRED_ART_FAST_GRID_REVIEW_BATCH04_20261030.html")
TEMPLATE=Path("scripts/art/build-sacred-art-fast-grid-first73-20261030.py")
AGENT="AdOrientemSacredArtBatch04/2026-10-30 (+https://github.com/Fulcanelli13/ad-orientem)"
ALLOWED={"www.metmuseum.org","collectionapi.metmuseum.org","images.metmuseum.org",
 "www.clevelandart.org","clevelandart.org","openaccess-api.clevelandart.org",
 "openaccess-cdn.clevelandart.org"}
def fetch(url, limit=27_000_000, timeout=14):
    parts=urlsplit(url)
    if parts.scheme!="https" or parts.hostname not in ALLOWED:
        raise ValueError("UNTRUSTED_IMAGE_OR_SOURCE_HOST")
    req=Request(url,headers={"User-Agent":AGENT,"Accept":"application/json,image/jpeg,image/png,image/webp,text/html,*/*;q=.1"})
    with urlopen(req,timeout=timeout) as res:
        final=res.geturl()
        end=urlsplit(final)
        if end.scheme!="https" or end.hostname not in ALLOWED:
            raise ValueError("UNTRUSTED_REDIRECT_HOST")
        data=res.read(limit+1)
        if len(data)>limit: raise ValueError("MAX_BYTES_EXCEEDED")
        if not data: raise ValueError("EMPTY_RESPONSE")
        return data,final
def maybe_json(url):
    try:
        raw,final=fetch(url,3_000_000,10)
        return json.loads(raw),final,""
    except Exception as err:
        return None,None,str(err)[:140]
def image_preview(raw):
    with Image.open(BytesIO(raw)) as photo:
        photo=ImageOps.exif_transpose(photo)
        width,height=photo.size
        if min(width,height)<300 or max(width,height)/min(width,height)>7:
            raise ValueError("IMAGE_TOO_SMALL_OR_WRONG_ASPECT")
        photo.thumbnail((700,700),Image.Resampling.LANCZOS)
        if photo.mode!="RGB": photo=photo.convert("RGB")
        b=BytesIO()
        photo.save(b,"JPEG",quality=80,optimize=True,progressive=True)
        thumb=b.getvalue()
        if len(thumb)<4000 or len(thumb)>350000:
            raise ValueError("UNUSABLE_THUMBNAIL")
        return "data:image/jpeg;base64,"+base64.b64encode(thumb).decode(),{
            "downloadedDimensions":[width,height],
            "downloadedSha256":sha256(raw).hexdigest(),
            "downloadedBytes":len(raw),
            "reviewDimensions":list(photo.size),
            "reviewJpegSha256":sha256(thumb).hexdigest(),
            "reviewJpegBytes":len(thumb)}
def discover(record):
    museum=record["museum"]
    url=record["sourcePage"]
    api_url=""
    errors=[]
    images=[]
    status="MUSEUM_METADATA_UNAVAILABLE"
    rights=""
    identity=""
    if museum=="MET":
        obj_id=re.fullmatch(r"https://www\.metmuseum\.org/art/collection/search/(\d+)",url)
        if not obj_id: raise ValueError("INVALID_MET_OBJECT_SOURCE")
        oid=obj_id.group(1)
        api_url=f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}"
        d,final,error=maybe_json(api_url)
        if error: errors.append("MET_API:"+error)
        if isinstance(d,dict) and str(d.get("objectID"))==oid:
            identity="MET_OFFICIAL_API_OBJECT_ID"
            rights="MET_API_PUBLIC_DOMAIN" if d.get("isPublicDomain") is True else "MET_API_NO_OPEN_ACCESS_PROOF"
            for image,reason in [(d.get("primaryImage"),"MET_PRIMARY_ORIGINAL"),
                                (d.get("primaryImageSmall"),"MET_PRIMARY_WEB")]:
                if image: images.append((image,reason))
            status="MET_API_OBJECT_MATCH"
        elif isinstance(d,dict): errors.append("MET_API_OBJECT_ID_MISMATCH")
        # Alternative: the public museum object page embeds an IIIF main-image URL
        # whose path carries this exact object ID. Do NOT select related-artwork images.
        if not images:
            try:
                page,_=fetch(url,8_000_000,12)
                body=unescape(page.decode("utf-8","replace")).replace(r"\/","/")
                matched=re.search(r"https://collectionapi\.metmuseum\.org/api/collection/v1/iiif/"+oid+r"/\d+/main-image",body)
                if matched:
                    images.append((matched.group(0),"MET_OBJECT_PAGE_IIIF_MAIN"))
                    identity="MET_OFFICIAL_OBJECT_PAGE_MAIN_IMAGE"
                    status="MET_PAGE_ID_MATCH_API_UNAVAILABLE"
            except Exception as e: errors.append("MET_PAGE:"+str(e)[:100])
    elif museum=="CMA":
        accession=url.split("/art/")[-1]
        if not re.fullmatch(r"[0-9]{4}\.[0-9A-Za-z.]+",accession):
            raise ValueError("INVALID_CLEVELAND_ACCESSION")
        api_url=f"https://openaccess-api.clevelandart.org/api/artworks/{accession}"
        response,_,error=maybe_json(api_url)
        if error: errors.append("CMA_API:"+error)
        d=response.get("data",{}) if isinstance(response,dict) else {}
        if isinstance(d,dict) and d and str(d.get("accession_number",""))==accession:
            identity="CMA_OFFICIAL_API_ACCESSION"
            rights="CMA_API_CC0" if d.get("share_license_status")=="CC0" else "CMA_API_NO_CC0_PROOF"
            for image,reason in [((d.get("images") or {}).get("print") or {},"CMA_PRINT"),
                                 ((d.get("images") or {}).get("web") or {},"CMA_WEB")]:
                if isinstance(image,dict) and image.get("url"):
                    images.append((image["url"],reason))
            status="CMA_API_ACCESSION_MATCH"
        elif isinstance(d,dict) and d: errors.append("CMA_API_ACCESSION_MISMATCH")
        # CMA's documented, accession-specific official public CDN is an alternative
        # *review-photo* source only; it is not an exact-file rights certification.
        if not images:
            base=f"https://openaccess-cdn.clevelandart.org/{accession}/{accession}"
            images.extend([(base+"_print.jpg","CMA_ACCESSION_CDN_PRINT"),
                           (base+"_web.jpg","CMA_ACCESSION_CDN_WEB")])
            identity="CMA_ACCESSION_OFFICIAL_CDN_PATTERN_NOT_NATIVE_VERIFIED"
            status="CMA_OFFICIAL_API_UNAVAILABLE_CDN_FALLBACK"
    else: raise ValueError("UNKNOWN_MUSEUM")
    return api_url,images,status,identity,rights,errors

def recover(record):
    result={"physicalWorkGroup":record["physicalWorkGroup"],
        "sourceRecordId":record["sourceRecordId"],"sourcePage":record["sourcePage"],
        "museum":record["museum"],"historicalArchivedSha256":record["preExistingOriginalSha256"],
        "historicalSourceFingerprint":record["preExistingSelectedPhotoFingerprint"],
        "sourceImageUrl":None,"downloaded":False,"reviewImageEmbedded":False,
        "nativeArchiveHashMatched":False,"nativeArchiveHashComparisonAvailable":False,
        "pristineApproved":False,"rightsReleaseCertified":False,"queue1Promoted":False,
        "failureReasons":[]}
    try:
        api,imgs,status,identity,rights,errors=discover(record)
        result.update({"officialApi":api,"sourceStatus":status,
                       "sourceIdentityBasis":identity,"rightsMetadata":rights})
        result["failureReasons"].extend(errors)
        seen=set()
        for photo_url,role in imgs:
            if photo_url in seen: continue
            seen.add(photo_url)
            try:
                raw,final=fetch(photo_url)
                preview,photo=image_preview(raw)
                result.update(photo)
                result["sourceImageUrl"]=photo_url
                result["finalImageUrl"]=final
                result["imageRetrievalRole"]=role
                result["downloaded"]=True
                result["reviewImageEmbedded"]=True
                result["nativeArchiveHashComparisonAvailable"]=bool(record["preExistingOriginalSha256"])
                result["nativeArchiveHashMatched"]=bool(
                    record["preExistingOriginalSha256"] and
                    record["preExistingOriginalSha256"]==photo["downloadedSha256"])
                result["nativeMasterProvenanceCertified"]=False
                result["exactFileRightsCertified"]=False
                result["imageUnframedCertified"]=False
                result["imageColorFaithfulnessCertified"]=False
                # The existing frozen first-73 template accepts one-click local
                # *visual* decisions; none is written into queue master.
                card={"id":record["physicalWorkGroup"],"title":record["title"],
                      "artist":record["artist"],"sourceUrl":record["sourcePage"],
                      "module":"","priorRightsEvidence":record["sourceRightsEvidence"],
                      "rightsLabel":record["sourceRightsTerms"],
                      "sourcePhotoFingerprint":record["preExistingSelectedPhotoFingerprint"] or "",
                      "sourceOriginalSha256":record["preExistingOriginalSha256"] or "",
                      "preview":preview,"available":True,"error":""}
                return result,card
            except Exception as e:
                result["failureReasons"].append(role+":"+str(e)[:100])
    except Exception as e:
        result["failureReasons"].append("SOURCE:"+str(e)[:120])
    result["heldInQueue2"]=True
    return result,None

def main():
    source=json.loads(SOURCE.read_text(encoding="utf-8"))
    records=source["candidates"]
    assert len(records)==104 and len(set(x["physicalWorkGroup"] for x in records))==104
    assert sum(x["museum"]=="MET" for x in records)==74
    assert sum(x["museum"]=="CMA" for x in records)==30
    assert all(not x["originalImageUrl"] and not x["reviewImageUrl"] for x in records)
    priority=sorted(records,key=lambda x:(
        x["preExistingOriginalSha256"] is None,-x["priorityScore"],
        x["positionInBatch04"]))
    # Work independently by accession/object ID, gently throttled to protect APIs.
    with ThreadPoolExecutor(max_workers=3) as pool:
        output=list(pool.map(recover,priority))
    report_rows=[x[0] for x in output]
    successes={x[0]["physicalWorkGroup"]:x[1] for x in output if x[1]}
    cards=[successes[r["physicalWorkGroup"]] for r in records
           if r["physicalWorkGroup"] in successes]
    assert len(cards)==len(successes)
    assert not any(x["pristineApproved"] or x["rightsReleaseCertified"] or x["queue1Promoted"]
                   for x in report_rows)
    report={"schema":"AO_SACRED_ART_BATCH04_SOURCE_BOUND_RECOVERY_V1",
      "asOfUtc":datetime.now(timezone.utc).isoformat(),
      "frozenInput":str(SOURCE),"inputRegistrySnapshot":source["reviewRegistrySnapshot"],
      "expected":104,"sourceRecordsChecked":len(report_rows),
      "downloadedAndEmbedded":len(cards),"notRecovered":104-len(cards),
      "byMuseum":{"MET":74,"CMA":30},
      "historicalNativeShaMatched":sum(x["nativeArchiveHashMatched"] for x in report_rows),
      "withheldWithoutPhoto":104-len(cards),"sourceRecordDeletions":0,
      "previousReviewBatchesChanged":0,"historicalApprovalsChanged":0,
      "newPristinePhotoApprovals":0,"newRightsFinalCertifications":0,
      "queue1Promotions":0,"productionMutations":0,"costEur":0,
      "warning":"Embedded thumbnails are NOT the archived native original or publication file. All framing, colour, provenance and exact-file rights remain separate gates.",
      "records":report_rows}
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    # The review page is intentionally a gallery of recovered photographs only.
    # No placeholders, no hidden proxy sources, no separate modal.
    script=TEMPLATE.read_text(encoding="utf-8")
    match=re.search(r"HTML=r'''(.*?)'''",script,re.S)
    if not match: raise RuntimeError("CANONICAL_GRID_TEMPLATE_MISSING")
    template=match.group(1)
    payload=json.dumps(cards,ensure_ascii=False,separators=(",",":")).replace("<",r"\u003c").replace(">",r"\u003e")
    html=template.replace("__DATA__",payload)
    html=html.replace("BATCH 01","BATCH 04").replace("Batch 01","Batch 04")
    html=html.replace("ao-sacred-art-fast-grid-b01-v1","ao-sacred-art-fast-grid-b04-v1")
    html=html.replace(',"01"].map(esc)',',"04"].map(esc)')
    html=html.replace("sacred-art-queue1-reviewed-approvals-batch01.csv",
                      "sacred-art-queue1-reviewed-approvals-batch04.csv")
    html=html.replace("Everything else stays in Queue 2.", "Everything else stays in Queue 2; unrecovered photos are excluded.")
    html=html.replace("The original-file checksum, image rights and final crop still undergo automatic release checks.",
                      "This is a visual-only preference. The original-file checksum, image rights, identity, framing and final crop require independent certification.")
    PAGE.write_text(html,encoding="utf-8")
    assert len(cards)==html.count('"id":"') or len(cards)==0
    print("BATCH04_RECOVERY",json.dumps({
        "checked":104,"reviewablePhotos":len(cards),"held":104-len(cards),
        "historicalArchiveHashMatches":report["historicalNativeShaMatched"],
        "queue1":0,"rightsCertified":0,"feeEur":0}),flush=True)
if __name__=="__main__": main()
