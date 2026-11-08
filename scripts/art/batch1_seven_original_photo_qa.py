#!/usr/bin/env python3
"""PRIVATE Sacred Art original file review: six exact *already nominated* Commons
file titles, with a seventh source-less hold. NEVER publishes or changes art
assignments, and NEVER treats a Commons public-domain tag as editorial approval.
"""
import argparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import hashlib
import io
import json
from pathlib import Path
import time
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageOps, ImageFile

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/artwork/batch1-seven-photos-acquisition.v1.json"
USER_AGENT="AdOrientemSacredArtResearch/1.2 (https://github.com/Fulcanelli13/ad-orientem; private source QA)"
Image.MAX_IMAGE_PIXELS=150_000_000
ImageFile.LOAD_TRUNCATED_IMAGES=False
last_request=None

def commons_file_url(title):
    name=unicodedata.normalize("NFC",title.replace(" ","_"))
    digest=hashlib.md5(name.encode("utf-8")).hexdigest()
    return "https://upload.wikimedia.org/wikipedia/commons/"+digest[:1]+"/"+digest[:2]+"/"+quote(name,safe="._-()")

def pace(seconds=25):
    global last_request
    if last_request is not None:
        elapsed=time.monotonic()-last_request
        if elapsed<seconds:time.sleep(seconds-elapsed)
    last_request=time.monotonic()

def retry_delay(headers):
    val=headers.get("Retry-After") if headers else None
    if not val:return 65
    try:return max(0,int(float(val)))
    except (TypeError,ValueError):
        try:return max(0,int((parsedate_to_datetime(val)-datetime.now(timezone.utc)).total_seconds()))
        except (TypeError,ValueError,OverflowError):return 65

def get_original(title,limit=34_000_000):
    url=commons_file_url(title)
    last=None
    for attempt in range(3):
        pace()
        req=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"image/jpeg,image/png,image/*;q=0.7"})
        try:
            with urlopen(req,timeout=55) as response:
                mime=response.headers.get("Content-Type","")
                if not mime.startswith("image/"):
                    raise ValueError("Unexpected image MIME: "+mime)
                data=response.read(limit+1)
                if len(data)>limit:raise ValueError("Image size exceeds byte cap")
            return url,data,mime
        except HTTPError as exc:
            last=exc
            if exc.code not in (429,503) or attempt==2:break
            delay=retry_delay(exc.headers)
            if delay>150:raise ValueError("Deferred: server Retry-After="+str(delay))
            print("Server "+str(exc.code)+"; honoring Retry-After "+str(delay)+"s",flush=True)
            time.sleep(delay)
        except (URLError,TimeoutError) as exc:
            last=exc
            if attempt==2:break
            time.sleep(15*(attempt+1))
    raise ValueError("Acquisition failed: "+str(last))

def create_preview(image,destination,caption):
    source=ImageOps.exif_transpose(image).convert("RGB")
    thumb=ImageOps.contain(source,(980,960))
    out=Image.new("RGB",(1040,1110),"#121820")
    out.paste(thumb,((1040-thumb.width)//2,(990-thumb.height)//2+25))
    d=ImageDraw.Draw(out)
    d.text((26,15),caption[:110],fill="#eeeeee")
    d.text((26,1030),"Unapproved Commons source image — technical research only",fill="#e2b68a")
    d.text((26,1060),f"{source.width} x {source.height} pixels",fill="#eeeeee")
    out.save(destination,format="JPEG",quality=86,optimize=True)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--out",default="artifacts/sacred-art-batch1-seven")
    parser.add_argument("--only",action="append",default=[])
    parser.add_argument("--dry-run",action="store_true")
    args=parser.parse_args()
    manifest=json.loads(SOURCE.read_text(encoding="utf-8"))
    assert manifest["counts"]["remaining_works"]==7
    assert manifest["counts"]["existing_prayer_positions"]==26
    assert manifest["counts"]["public_gallery_changes"]==0
    assert all(not row["release_allowed"] and not row["app_publication_allowed"] for row in manifest["items"])
    byid={r["id"]:r for r in manifest["items"]}
    if args.only and any(i not in byid for i in args.only):parser.error("Unknown --only ID")
    records=[r for r in manifest["items"] if not args.only or r["id"] in args.only]
    destination=Path(args.out)
    destination.mkdir(parents=True,exist_ok=True)
    results=[]
    for row in records:
        key=row["id"].replace(":","_")
        evidence={"id":row["id"],"title":row["title"],"painting_identity_status":row["exact_object_status"],
                  "original_selected_source_page":row["source_url"],"source_file_title":row["source_file_title"],
                  "museum":row["museum_name"],"museum_accession":row["museum_accession"],
                  "known_prayer_position_count":row["placement_count"],"hold_reasons":row["hold"],
                  "photo_license_claim_as_staged":row["photo_rights"],
                  "gallery_released":False,"photo_approved":False,"crop_approved":False,
                  "file_original_preserved":True,"copyright_eligibility_verified_in_this_run":False}
        if not row["source_file_title"]:
            evidence["state"]="HOLD_NO_EXACT_SOURCE_FILE_SELECTED"
            results.append(evidence)
            continue
        if args.dry_run:
            evidence["download_url"]=commons_file_url(row["source_file_title"])
            evidence["state"]="DRY_RUN_NOT_DOWNLOADED"
            results.append(evidence)
            continue
        try:
            url,data,mime=get_original(row["source_file_title"])
            with Image.open(io.BytesIO(data)) as img:img.verify()
            with Image.open(io.BytesIO(data)) as img:
                width,height=img.size
                create_preview(img,destination/(key+"-review.jpg"),row["title"])
            path=destination/(key+"-original"+(".png" if mime.startswith("image/png") else ".jpg"))
            path.write_bytes(data)
            evidence.update({"download_url":url,"mime":mime,"bytes":len(data),
                             "sha1":hashlib.sha1(data).hexdigest(),"sha256":hashlib.sha256(data).hexdigest(),
                             "width":width,"height":height,"short_side_target_met":min(width,height)>=1200,
                             "state":"SOURCE_BYTES_QA_PASS_REVIEW_ONLY" if min(width,height)>=1200 else "ACQUIRED_BELOW_1200_PX_TARGET_REVIEW_ONLY"})
        except Exception as exc:
            evidence["state"]="SOURCE_DOWNLOAD_OR_QA_FAILED"
            evidence["error"]=str(exc)
        results.append(evidence)
        print(json.dumps(evidence,ensure_ascii=False),flush=True)
    report={"schema":"AO_BATCH1_SEVEN_SOURCE_PHOTO_QA_V1","research_only":True,
            "publication_changes":0,"editorial_approvals":0,
            "downloads_verified":sum(z["state"] in ("SOURCE_BYTES_QA_PASS_REVIEW_ONLY","ACQUIRED_BELOW_1200_PX_TARGET_REVIEW_ONLY") for z in results),
            "quality_qualified_only":sum(z["state"]=="SOURCE_BYTES_QA_PASS_REVIEW_ONLY" for z in results),
            "failed":sum(z["state"]=="SOURCE_DOWNLOAD_OR_QA_FAILED" for z in results),
            "held_without_source":sum(z["state"]=="HOLD_NO_EXACT_SOURCE_FILE_SELECTED" for z in results),
            "results":results}
    (destination/"run-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (destination/"READ_ME_PRIVATE.txt").write_text(
        "Source photos collected for private comparison only. DO NOT use as app assets.\n"
        "All 7 need image-rights/source checks and editorial release decisions.\n"
        "Research Commons licence tags do not constitute owner handpicking.\n",
        encoding="utf-8")
    print("FINAL_COUNTS "+json.dumps({k:report[k] for k in ("downloads_verified","quality_qualified_only","failed","held_without_source")}),flush=True)
    # Recover partial successful originals even if some Commons titles or rights are held.
    # Zero successful bytes is a broken acquisition job; held records do not claim success.
    if not args.dry_run and report["downloads_verified"]==0:raise SystemExit(1)

if __name__=="__main__":main()
