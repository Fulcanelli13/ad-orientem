#!/usr/bin/env python3
"""Research-only original-image byte verification. Never approves art, rights, frames, or deployment."""
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data/calendar/sacred-art-a8-44-photographic-preflight-20261028.v1.json"
OUTPUT = ROOT / "artifacts/sacred-art-a8-44-native-check"
OUTPUT.mkdir(parents=True, exist_ok=True)
USER_AGENT = "AdOrientemResearchPixelAudit/1.0 (https://github.com/Fulcanelli13/ad-orientem; scholarly image provenance only)"
try:
    from PIL import Image, ImageOps, ImageDraw
    Image.MAX_IMAGE_PIXELS = 150_000_000
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

def fetch(url, max_bytes, retries=2):
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json,image/jpeg,image/png,image/webp,*/*"})
            with urllib.request.urlopen(req, timeout=35) as resp:
                actual = urllib.parse.urlsplit(resp.geturl())
                if actual.scheme != "https" or actual.hostname not in ("commons.wikimedia.org", "upload.wikimedia.org"):
                    raise RuntimeError("blocked_unsafe_redirect")
                buf = bytearray()
                while True:
                    block = resp.read(512 * 1024)
                    if not block:
                        return bytes(buf)
                    buf.extend(block)
                    if len(buf) > max_bytes:
                        raise RuntimeError("file_exceeds_30MiB_limit")
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            if attempt >= retries:
                raise
            time.sleep(2 + 3 * attempt)
    raise RuntimeError("fetch_failure")

def metadata(records):
    out = {}
    for start in range(0, len(records), 8):
        part = records[start:start+8]
        titles = "|".join("File:" + r["source_file"] for r in part)
        query = urllib.parse.urlencode({
            "action": "query", "format": "json", "formatversion": "2",
            "prop": "imageinfo", "iiprop": "url|size|sha1|mime|extmetadata",
            "titles": titles,
        })
        raw = fetch("https://commons.wikimedia.org/w/api.php?" + query, 3 * 1024 * 1024)
        obj = json.loads(raw)
        for page in obj["query"]["pages"]:
            if page.get("imageinfo"):
                out[page["title"][5:].replace("_", " ")] = page["imageinfo"][0]
        time.sleep(0.5)
    return out

def save_contact_sheet(path, original, label):
    if not PIL_AVAILABLE:
        return False
    try:
        with Image.open(io.BytesIO(original)) as im:
            im.load()
            im = ImageOps.exif_transpose(im).convert("RGB")
            w, h = im.size
            edge = max(96, min(512, w // 5, h // 5))
            segments = [
                im.crop((0,0,edge,edge)), im.crop((w-edge,0,w,edge)),
                im.crop((0,h-edge,edge,h)), im.crop((w-edge,h-edge,w,h)),
            ]
            sheet = Image.new("RGB", (1120, 900), (30,32,28))
            pic = ImageOps.contain(im, (580,780))
            sheet.paste(pic, ((590-pic.width)//2 + 8, (900-pic.height)//2))
            for idx, seg in enumerate(segments):
                seg = ImageOps.fit(seg,(250,250))
                sheet.paste(seg,(600+(idx%2)*254,100+(idx//2)*290))
            d = ImageDraw.Draw(sheet)
            d.text((16,12),label[:90], fill=(245,245,233))
            d.text((600,54),f"Unscaled corner samples: {edge} x {edge} original px", fill=(245,245,233))
            d.text((16,860),"RESEARCH VISUAL EVIDENCE ONLY — edge/frame status NOT AUTOMATICALLY CERTIFIED", fill=(235,208,174))
            sheet.save(path,quality=77,optimize=True)
            return True
    except Exception as exc:
        return "ERROR:" + str(exc)[:180]

def main():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = source["records"]
    assert len(records) == 44 and len({x["id"] for x in records}) == 44
    results = []
    try:
        md = metadata(records)
        meta_error = ""
    except Exception as exc:
        md = {}
        meta_error = type(exc).__name__ + ":" + str(exc)[:200]
    if meta_error:
        print("MEDIAWIKI_API_ERROR", meta_error, flush=True)
    for index, item in enumerate(records,1):
        expected = item["source_archive_sha256"].lower().strip()
        name = item["source_file"]
        m = md.get(name.replace("_"," "))
        row = {
            "index":index, "artwork_id":item["id"],"title":item["title"],
            "source_file":name,"source_page":item["source_page"],
            "expected_archived_sha256":expected,"photo_license_claim_from_old_register":item["source_prior_licence_claim"],
            "source_composition_confirmed":False,"native_frame_free_verified":False,
            "institutional_colour_verified":False,"reproduction_license_final_certified":False,
            "app_publication_allowed":False, "source_byte_state":"PENDING"
        }
        if not m:
            row["source_byte_state"] = "API_METADATA_UNAVAILABLE"
            row["note"] = meta_error or "Commons API returned no exact image file"
        else:
            url = m.get("url","")
            meta = m.get("extmetadata",{})
            row.update({
                "commons_image_url":url,
                "commons_sha1":m.get("sha1"),"commons_width":m.get("width"),
                "commons_height":m.get("height"),"commons_bytes":m.get("size"),
                "commons_license_short_name":meta.get("LicenseShortName",{}).get("value"),
                "commons_license_url":meta.get("LicenseUrl",{}).get("value"),
            })
            if not url.startswith("https://upload.wikimedia.org/wikipedia/commons/"):
                row["source_byte_state"] = "UNTRUSTED_OR_NON_UPLOAD_URL"
            else:
                try:
                    original=fetch(url,30*1024*1024)
                    row["downloaded_bytes"]=len(original)
                    row["downloaded_sha256"]=hashlib.sha256(original).hexdigest()
                    row["source_sha256_exact_match"]=(row["downloaded_sha256"]==expected)
                    row["source_byte_state"]="SHA256_MATCH" if row["source_sha256_exact_match"] else "SHA256_VERSION_MISMATCH"
                    row["dimensions_match"]=False
                    if PIL_AVAILABLE:
                        with Image.open(io.BytesIO(original)) as im:
                            row["downloaded_dimensions"]=list(im.size)
                            row["dimensions_match"]=(list(im.size)==[item["width"],item["height"]])
                            row["image_format"]=im.format
                            row["icc_profile_present"]=bool(im.info.get("icc_profile"))
                        path=OUTPUT/f"{index:02d}-edge-review.jpg"
                        row["contact_sheet"]=path.name if save_contact_sheet(path,original,item["title"]) is True else None
                    else:
                        row["note"]="Pillow not installed: image edge sheets unavailable; SHA-256 still checked"
                except Exception as exc:
                    row["source_byte_state"]="DOWNLOAD_FAILED"
                    row["error"]=type(exc).__name__+":"+str(exc)[:250]
        results.append(row)
        if index % 5 == 0 or index == len(records):
            print("AO_A8_PROGRESS",index,"/",len(records),
                  "SHA_MATCH",sum(x["source_byte_state"]=="SHA256_MATCH" for x in results),
                  "MISMATCH",sum(x["source_byte_state"]=="SHA256_VERSION_MISMATCH" for x in results),
                  "FAILURE",sum(x["source_byte_state"] in ("DOWNLOAD_FAILED","API_METADATA_UNAVAILABLE") for x in results),flush=True)
        (OUTPUT/"results.json").write_text(json.dumps({"schema":"AO_A8_NATIVE_BYTE_AUDIT_RESEARCH_ONLY","records":results},indent=2)+"\n",encoding="utf-8")
        time.sleep(0.25)
    summary = {
        "source_records":len(records),
        "metadata_available":sum(x["source_byte_state"]!="API_METADATA_UNAVAILABLE" for x in results),
        "original_bytes_downloaded":sum("downloaded_sha256" in x for x in results),
        "archived_exact_sha256_match":sum(x["source_byte_state"]=="SHA256_MATCH" for x in results),
        "original_sha256_version_changed":sum(x["source_byte_state"]=="SHA256_VERSION_MISMATCH" for x in results),
        "dimensions_match":sum(x.get("dimensions_match",False) for x in results),
        "contact_sheets_created":sum(bool(x.get("contact_sheet")) for x in results),
        "native_frame_free_certified":0,
        "app_published":0, "editorial_decisions_changed":0,
        "cost_eur":0,
        "notes":"Research-only unaltered original bytes downloaded transiently to runner memory. No full originals uploaded. Contact sheets are temporary image QA derivatives, not permanent masters.",
        "mediawiki_api_error":meta_error
    }
    (OUTPUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print("AO_A8_SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
    if summary["original_bytes_downloaded"] == 0:
        print("NO ORIGINAL BYTES ACCESSIBLE; DO NOT CLAIM NATIVE IMAGE INSPECTION",flush=True)
        sys.exit(2)

if __name__=="__main__":
    main()
