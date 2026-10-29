#!/usr/bin/env python3
"""P72: bounded original-byte Commons verification, never asset approval.

Nine exact candidates, pinned from the P71 research-only inventory. Does not
modify the published gallery or archive originals. After verifying full SHA-1,
produces a temporary 3x3 reduced contact sheet for later editorial inspection.
The recorded result stays unapproved regardless of the outcome.
"""
import argparse
import hashlib
import io
import json
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / "data/geography/research/p72-priority-commons-originals-plan.v1.json"
REPORT = ROOT / "data/geography/research/p72-priority-original-byte-results.jsonl"
CONTACT = ROOT / "data/geography/research/p72-priority-originals-contact-sheet.jpg"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AdOrientemSacredPlaces/1.0 (https://github.com/Fulcanelli13/ad-orientem; source provenance audit)"
CAP = 15 * 1024 * 1024

def load_plan():
    plan = json.loads(PLAN.read_text(encoding="utf-8"))
    rows = plan["candidates"]
    if plan["schema"] != "AO_P72_PRIORITY_COMMONS_BYTES_PLAN_V1" or len(rows) != 9:
        raise ValueError("Invalid frozen, nine-row research-only manifest")
    if any(r["publication"] != "RESEARCH_ONLY_NOT_APPROVED" for r in rows):
        raise ValueError("No approved assets allowed in audit")
    if len({r["commons_file_title"] for r in rows}) != 9:
        raise ValueError("Duplicate Commons original title")
    if any(len(r["expected_sha1"]) != 40 for r in rows):
        raise ValueError("Missing pinned SHA-1")
    if any(r["entity_id"].split(":")[1] not in ("MU","IE") for r in rows):
        raise ValueError("Priority geography must stay Mauritius/Ireland")
    return rows

def get_url_json(url):
    last_error = None
    for n in range(2):
        try:
            with urlopen(Request(url, headers={"User-Agent":USER_AGENT,"Accept":"application/json"}), timeout=45) as response:
                if urlparse(response.geturl()).netloc != "commons.wikimedia.org":
                    raise ValueError("API redirect to an unapproved host")
                return json.loads(response.read(2_000_000).decode("utf-8"))
        except (HTTPError,URLError,TimeoutError,ValueError) as exc:
            last_error = exc
            if n == 0:
                time.sleep(8)
    raise last_error

def download_original(url):
    addr=urlparse(url)
    if addr.scheme!="https" or addr.netloc!="upload.wikimedia.org" or not addr.path.startswith("/wikipedia/commons/"):
        raise ValueError("Rejected non-Commons original binary URL")
    digest=hashlib.sha1()
    result=bytearray()
    with urlopen(Request(url,headers={"User-Agent":USER_AGENT,"Accept":"image/*"}),timeout=60) as response:
        if urlparse(response.geturl()).netloc!="upload.wikimedia.org":
            raise ValueError("Original binary redirected off upload.wikimedia.org")
        while True:
            block=response.read(131072)
            if not block:break
            result.extend(block)
            digest.update(block)
            if len(result)>CAP: raise ValueError("Original exceeds 15 MiB cap")
    if not result:raise ValueError("Empty downloaded binary")
    return bytes(result),digest.hexdigest()

def verify_image(binary, width, height):
    from PIL import Image, ImageOps
    with Image.open(io.BytesIO(binary)) as raw:
        if raw.format not in ("JPEG","PNG"):
            raise ValueError("Non-photographic original binary encoding")
        if raw.size!=(width,height):
            raise ValueError("Actual decoded dimensions differ from original metadata")
        image=ImageOps.exif_transpose(raw)
        image.thumbnail((500,360))
        image=image.convert("RGB")
        image.load()
        return image.copy()

def draw_contact_sheet(previews):
    from PIL import Image, ImageDraw
    w,h=540,405
    board=Image.new("RGB",(3*w,3*h), "white")
    dr=ImageDraw.Draw(board)
    for i,(row,image) in enumerate(previews):
        col=i%3;row_i=i//3
        x=col*w;y=row_i*h
        board.paste(image,(x+(w-image.width)//2,y+(360-image.height)//2))
        dr.text((x+9,y+365),row["commons_file_title"][:77],fill="black")
    board.save(CONTACT,format="JPEG",quality=86)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--dry-run",action="store_true")
    ap.add_argument("--delay",type=float,default=4.0)
    args=ap.parse_args()
    rows=load_plan()
    if args.dry_run:
        print("P72_OFFLINE_PLAN="+json.dumps({"candidates":len(rows),"entities":len({x["entity_id"] for x in rows}),"requested":0,"rights_cleared":0,"approved":0}))
        return
    if not 3<=args.delay<=15:
        ap.error("Delay must be 3–15 seconds")
    q=urlencode({"action":"query","format":"json","prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata","titles":"|".join(r["commons_file_title"] for r in rows)})
    try:
        result=get_url_json(API+"?"+q)
        pages={p["title"]:p for p in result["query"]["pages"] if "missing" not in p}
        api_error=None
    except Exception as exc:
        pages={}
        api_error=type(exc).__name__ + ": " + str(exc)[:250]
    output=[];previews=[]
    for i,row in enumerate(rows):
        record={"schema":"AO_P72_COMMONS_ORIGINAL_BYTES_EVIDENCE_V1","entity_id":row["entity_id"],
                "commons_file_title":row["commons_file_title"],"commons_file_page":row["commons_file_page"],
                "commons_page_id":row["commons_page_id"],"expected_sha1":row["expected_sha1"],
                "status":"UNVERIFIED","observed_sha1":None,"original_bytes_verified":False,
                "source_page_license_claim":row["license_claim"],"latest_license_metadata":None,
                "license_fully_cleared":False,"visual_identity_reviewed":False,
                "contact_sheet_preview":False,"editorial_approved":False,"published":False,
                "candidate_role_hint":row["subject_slot_hint"]}
        try:
            if api_error:raise RuntimeError("Metadata endpoint unavailable: "+api_error)
            p=pages.get(row["commons_file_title"])
            if not p or int(p["pageid"])!=int(row["commons_page_id"]):
                raise ValueError("Commons page identity missing or changed")
            ii=p["imageinfo"][0]
            record["metadata_sha1"]=ii.get("sha1")
            record["latest_license_metadata"]=ii.get("extmetadata",{}).get("LicenseShortName",{}).get("value")
            record["metadata_dimensions"]=[ii.get("width"),ii.get("height")]
            if ii.get("sha1","").lower()!=row["expected_sha1"].lower():
                raise ValueError("Remote Commons original sha1 changed since P70; manual review required")
            if (ii.get("width"),ii.get("height"))!=(row["expected_width"],row["expected_height"]):
                raise ValueError("Source dimensions changed")
            data,actual_sha=download_original(ii["url"])
            record["observed_sha1"]=actual_sha
            record["original_byte_count"]=len(data)
            if actual_sha.lower()!=row["expected_sha1"].lower():
                raise ValueError("Downloaded binary SHA1 does not match frozen original")
            thumbnail=verify_image(data,ii["width"],ii["height"])
            record["original_bytes_verified"]=True
            record["contact_sheet_preview"]=True
            record["status"]="HASH_AND_ENCODING_VERIFIED_NOT_EDITORIAL_APPROVED"
            previews.append((row,thumbnail))
        except Exception as exc:
            record["status"]="BLOCKED_NO_APPROVAL"
            record["error"]=type(exc).__name__+": "+str(exc)[:250]
        output.append(record)
        print("AO_P72_ORIGINAL_RESULT="+json.dumps(record,ensure_ascii=False),flush=True)
        if i+1<len(rows):time.sleep(args.delay)
    REPORT.write_text("".join(json.dumps(x,ensure_ascii=False)+"\n" for x in output),encoding="utf-8")
    if previews:
        draw_contact_sheet(previews)
    tally={"attempted":len(rows),"bytes_verified":sum(x["original_bytes_verified"] for x in output),
           "blocked":sum(not x["original_bytes_verified"] for x in output),
           "contact_sheet_images":len(previews),"editorial_approved":0,"published":0,
           "metadata_error":api_error,"report":str(REPORT.relative_to(ROOT))}
    print("AO_P72_ORIGINAL_SUMMARY="+json.dumps(tally),flush=True)
    if tally["bytes_verified"]==0:
        raise RuntimeError("All original downloads blocked: fail closed, no assets approved")

if __name__=="__main__":
    main()
