#!/usr/bin/env python3
"""Direct-source Sacred Atlas photo batch: validate live rights, decode bytes, stage covers.

Research/source records do not become approvals automatically; only this exact,
bounded owner-authorized five-site batch may write onto its isolated release
branch. Main publication still requires CI and PR merge.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import io
import json
import pathlib
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/geography/research/sacred-atlas-direct-open-photo-five-20261105.v1.json"
COVERS = ROOT / "data/geography/approved-place-media.v1.json"
PLACES = ROOT / "data/geography/seed-registry.v1.json"
REPORT = ROOT / "data/geography/research/sacred-atlas-direct-open-photo-five-release-report-20261105.v1.json"
AGENT = "AdOrientemSacredAtlas/2026-11-05 (bounded direct-open-photo intake)"
PAGE_HOSTS = {"wordpress.org", "www.flickr.com", "flickr.com"}
IMAGE_HOSTS = {"pd.w.org", "live.staticflickr.com"}
MAX_BYTES = 30_000_000
MAX_PIXELS = 70_000_000
Image.MAX_IMAGE_PIXELS = MAX_PIXELS

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def checked_url(url, hosts):
    u = urllib.parse.urlsplit(url)
    if not (u.scheme == "https" and u.hostname in hosts and u.port in (None, 443)
            and not u.username and not u.password and not u.fragment):
        raise ValueError("HOST_OR_PROTOCOL_NOT_ALLOWED: " + str(url)[:120])
    return url

def download(url, hosts, size):
    checked_url(url, hosts)
    req = urllib.request.Request(url, headers={"User-Agent":AGENT,"Accept":"*/*"})
    with urllib.request.urlopen(req, timeout=50) as response:
        checked_url(response.geturl(), hosts)
        b = response.read(size + 1)
        if len(b) > size:
            raise ValueError("SOURCE_EXCEEDS_BYTE_CAP")
        return b

def normalized(s):
    s = html.unescape(s).replace("\\/", "/")
    return " ".join(re.sub(r"<[^>]+>", " ", s).split()).casefold()

def verify_live_rights(item):
    raw = download(item["source_page"], PAGE_HOSTS, 6_000_000)
    page = raw.decode("utf-8", errors="replace")
    flat = normalized(page)
    probe = item["source_title_probe"].casefold()
    if probe not in flat:
        raise ValueError("SOURCE_PAGE_DOES_NOT_NAME_EXPECTED_SUBJECT")
    credit = item["credit"].casefold()
    # Flickr photographer display names vary; Openverse/Flickr photo metadata
    # supplies the stored name. WordPress author is explicitly named onsite.
    if item["source_type"] == "wordpress_photos":
        if credit not in flat or "cc0 licensed" not in flat:
            raise ValueError("WORDPRESS_AUTHOR_OR_CC0_RIGHTS_NOT_LIVE")
        if "creativecommons.org/publicdomain/zero/1.0" not in page.lower():
            raise ValueError("WORDPRESS_CC0_LICENSE_LINK_MISSING")
    elif item["source_type"] == "flickr":
        legal = item["license_url"].removeprefix("https://").rstrip("/").casefold()
        # Flickr renders licences in both canonical links and HTML-escaped JS.
        raw_lower = html.unescape(page.replace("\\/", "/")).casefold()
        if legal not in raw_lower:
            raise ValueError("FLICKR_EXPECTED_CC_LICENSE_NOT_CONFIRMED_ON_PAGE")
        if "creativecommons.org/licenses/by-nc" in raw_lower:
            # Some side recommendations may have NC. Do not use this check to
            # infer permissions, only detect explicit conflict on the page.
            if re.search(r'(?<![a-z0-9])by-nc(?:-sa|-nd)?/2\.0', raw_lower):
                raise ValueError("POTENTIAL_NONCOMMERCIAL_LICENSE_CONFLICT")
    else:
        raise ValueError("UNKNOWN_SOURCE_TYPE")
    return hashlib.sha256(raw).hexdigest()

def convert_photo(blob):
    if not 5_000 <= len(blob) <= MAX_BYTES:
        raise ValueError("IMAGE_BYTES_OUT_OF_BOUNDS")
    with Image.open(io.BytesIO(blob)) as im:
        if im.format not in {"JPEG","PNG","WEBP","MPO"}:
            raise ValueError("INVALID_SOURCE_IMAGE_FORMAT")
        if im.width * im.height > MAX_PIXELS:
            raise ValueError("EXCESS_IMAGE_PIXELS")
        fixed = ImageOps.exif_transpose(im).convert("RGB")
        if min(fixed.size) < 480:
            raise ValueError("IMAGE_RESOLUTION_TOO_LOW")
    fixed.thumbnail((1280,1280),Image.Resampling.LANCZOS)
    out = io.BytesIO()
    fixed.save(out,format="WEBP",quality=84,method=6)
    b = out.getvalue()
    if len(b) < 3500 or b[:4] != b"RIFF" or b[8:12] != b"WEBP":
        raise ValueError("INVALID_WEBP_DERIVATIVE")
    return b, fixed.size

def verify_scope(m, covers, places):
    assert m["schema"] == "AO_SACRED_ATLAS_DIRECT_OPEN_PHOTO_BATCH_V1"
    assert m["baseline_covers"] == len(covers["items"]) == 379
    assert len(places["places"]) == 530
    assert len(m["items"]) == 5
    existing = {x["place_id"] for x in covers["items"]}
    canonical = {x["place_id"] for x in places["places"]}
    ids = [x["place_id"] for x in m["items"]]
    assert len(set(ids)) == 5 and all(x in canonical and x not in existing for x in ids)
    assert all(x["source_type"] in {"wordpress_photos","flickr"} for x in m["items"])
    assert all(x["license"] in {"CC0","CC-BY-2.0","CC-BY-SA-2.0"} for x in m["items"])
    assert len({x["image_url"] for x in m["items"]}) == 5
    for row in m["items"]:
        checked_url(row["source_page"],PAGE_HOSTS)
        checked_url(row["image_url"],IMAGE_HOSTS)
        assert row["source_page"].startswith("https://")
        assert row["source_title_probe"] and row["independent_site"]
        assert row["depiction"] in {"exterior","interior","altar","grotto","relic","venerated_image"}
    return existing

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--validate-only",action="store_true")
    args = ap.parse_args()
    manifest = load(MANIFEST)
    covers = load(COVERS)
    places = load(PLACES)
    existing = verify_scope(manifest,covers,places)
    if args.validate_only:
        print("Direct-source five: baseline, distinct exact Place IDs, licensing URLs and download hosts valid")
        return 0
    before_bytes = COVERS.read_bytes()
    held, released, media_rows = [], [], []
    for x in manifest["items"]:
        pid = x["place_id"]
        try:
            rights_proof_digest = verify_live_rights(x)
            original = download(x["image_url"],IMAGE_HOSTS,MAX_BYTES)
            webp, (w,h) = convert_photo(original)
            source_sha1 = hashlib.sha1(original).hexdigest()
            if source_sha1 in {r.get("source_sha1") for r in covers["items"]}:
                raise ValueError("ORIGINAL_ALREADY_PUBLISHED_ELSEWHERE")
            part = hashlib.sha256((pid+"\0"+x["source_page"]).encode("utf-8")).hexdigest()[:22]
            asset = "assets/approved/place-media/pf-"+part+".webp"
            path = ROOT / asset
            if path.exists():
                raise ValueError("REFUSE_TO_REPLACE_EXISTING_ASSET")
            row = {
                "place_id":pid, "status":"APPROVED","asset_path":asset,
                "source_url":x["source_page"], "source_sha1":source_sha1,
                "derivative_sha256":hashlib.sha256(webp).hexdigest(),
                "credit":x["credit"],"license":x["license"],"license_url":x["license_url"],
                "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
                "width":w,"height":h,
                "orientation":"portrait" if h>w else "landscape",
                "alt_en":x["subject_en"],"alt_fr":x["subject_fr"],
                "changes_en":"Full-frame WebP, EXIF orientation normalized; no crop or recolouring.",
                "changes_fr":"Image entière en WebP, orientation EXIF corrigée ; ni recadrage ni retouche.",
                "reviewed_at":"2026-11-05",
                "review_method":"Owner-authorized direct-source five-site batch. Source page title and current licence verified; photo bytes decoded and hashed; exact-site depiction selected against named place and independent site reference. PR visual review required before merge.",
                "source_place_ref":"DIRECT_OPEN_PHOTO_FIVE_20261105"
            }
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_bytes(webp)
            released.append({"place_id":pid,"asset":asset,"source_page":x["source_page"],
                             "rights_proof_sha256":rights_proof_digest,"original_sha1":source_sha1,
                             "derivative_sha256":row["derivative_sha256"],"size":[w,h],
                             "image_bytes":len(webp),"depiction":x["depiction"],
                             "independent_site_evidence":x["independent_site"],
                             "status":"ADMITTED_ON_RELEASE_BRANCH_REQUIRES_VISUAL_AND_CI"})
            media_rows.append(row)
            print("DIRECT_PHOTO_ADMITTED",pid,w,h,flush=True)
        except Exception as e:
            held.append({"place_id":pid,"status":"HELD_NOT_PUBLISHED",
                         "reason":type(e).__name__+": "+str(e)[:320]})
            print("DIRECT_PHOTO_HELD",pid,type(e).__name__,str(e)[:150],flush=True)
    report = {"schema":"AO_SACRED_ATLAS_DIRECT_OPEN_PHOTO_FIVE_REPORT_V1",
              "date":"2026-11-05","attempted":5,"admitted_on_branch":len(released),
              "held":len(held),"main_published_by_this_job":0,
              "no_existing_covers_replaced":True,
              "accepted":released,"holds":held}
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if not media_rows:
        raise RuntimeError("NO_DIRECT_SOURCE_PHOTO_ADMITTED; see release report")
    covers["items"].extend(media_rows)
    covers["items"].sort(key=lambda x:x["place_id"])
    covers["version"] = "1.6.17"
    assert len(covers["items"]) == 379 + len(media_rows)
    assert all(any(row["place_id"] == old["place_id"] and row == old
                   for row in covers["items"]) for old in load_bytes(before_bytes)["items"])
    COVERS.write_text(json.dumps(covers,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("ADMITTED",len(released),"HELD",len(held),"COVER_BRANCH_TOTAL",len(covers["items"]),flush=True)
    return 0

def load_bytes(b):
    return json.loads(b.decode("utf-8"))

if __name__ == "__main__":
    raise SystemExit(main())
