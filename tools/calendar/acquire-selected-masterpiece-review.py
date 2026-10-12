#!/usr/bin/env python3
"""Source-locked REVIEW acquisition of the 12 October selected sacred paintings.

Do not write to assets/, published art manifests, or set publication approvals.
Downloaded images and contact sheets are CI artifacts for inspection only.
"""
import hashlib
import html
import io
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image, ImageOps, ImageStat, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "artifacts/sacred-art-selected-review"
OUTIM = OUTPUT / "images"
REVIEW = OUTPUT / "previews"
USER_SOURCE = ROOT / "data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json"
TRIAGE_SOURCE = ROOT / "data/calendar/sacred-art-masterpiece-selected-source-triage-20261012.v1.json"
ARCHIVE_SOURCE = ROOT / "data/calendar/sacred-art-candidates.v1.json"
USER_AGENT = "AdOrientem-Art-Curator/1.0 (personal research; low rate; source provenance)"
MAX_BYTES = 115_000_000
TARGETS = (
    dict(key="met-438724", theme="annunciation", subject="ROS-01", museum="The Metropolitan Museum of Art", object_id=438724,
         source="https://www.metmuseum.org/art/collection/search/438724", kind="MET_OPEN_ACCESS_FULL_ORIGINAL"),
    dict(key="met-437524", theme="coronation", subject="ROS-15", museum="The Metropolitan Museum of Art", object_id=437524,
         source="https://www.metmuseum.org/art/collection/search/437524", kind="MET_OPEN_ACCESS_FULL_ORIGINAL"),
    dict(key="kmska-314", theme="trinity", subject="DEV-18", museum="Royal Museum of Fine Arts Antwerp", object_id=314,
         source="https://vlaamsekunstcollectie.be/en/collection/314", kind="KMSKA_CC0_IIIF_REVIEW_DERIVATIVE"),
)
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json, image/jpeg, image/png, */*"})

def fetch(url, binary=False):
    if urlparse(url).scheme != "https":
        raise ValueError("HTTPS required")
    last = None
    for attempt in range(3):
        try:
            with SESSION.get(url, timeout=(15, 90), stream=binary, allow_redirects=True) as resp:
                resp.raise_for_status()
                if binary:
                    if resp.headers.get("Content-Length") and int(resp.headers["Content-Length"]) > MAX_BYTES:
                        raise ValueError("Image response exceeds review limit")
                    data = bytearray()
                    for chunk in resp.iter_content(1 << 20):
                        if chunk:
                            data.extend(chunk)
                            if len(data) > MAX_BYTES:
                                raise ValueError("Image exceeds review limit")
                    return bytes(data), resp.url, resp.headers.get("Content-Type", "")
                return resp.json(), resp.url, resp.headers.get("Content-Type", "")
        except (requests.RequestException, ValueError) as exc:
            last = exc
            if attempt < 2: time.sleep(2 + 3 * attempt)
    raise RuntimeError(f"Fetch failed for {urlparse(url).netloc}: {type(last).__name__}: {last}")

def pixel_report(content):
    with Image.open(io.BytesIO(content)) as opened:
        opened.verify()
    with Image.open(io.BytesIO(content)) as opened:
        opened = ImageOps.exif_transpose(opened)
        w, h = opened.size
        if w < 800 or h < 800:
            raise ValueError(f"Insufficient pixels for initial review ({w}x{h})")
        # Downsample before allocating memory for 20k-pixel museum originals.
        opened.draft("RGB", (1600, 1600))
        thumb = opened.copy()
        thumb.thumbnail((1500, 1500), Image.Resampling.LANCZOS)
        thumb = thumb.convert("RGB")
        rgba = ImageStat.Stat(thumb)
        variance = tuple(round(v, 1) for v in rgba.var)
        return w, h, variance

def selected_identity(t, decisions, triage):
    ids = [d for d in decisions["decisions"] if d["subject_id"] == t["subject"] and d["decision"] == "selected"]
    if len(ids) != 1: raise ValueError("No uniquely approved subject: " + t["subject"])
    sel = ids[0]
    if re.search(r"\b(?:el[ -]?greco|fra[ -]?angelico)\b", sel["selected_artwork"]["artist"], re.I):
        raise ValueError("Artist excluded by curator")
    rows = [r for r in triage["selectedAnchorSourceReconciliations"] if r["subjectId"] == t["subject"]]
    if t["subject"] != "ROS-15":
        if len(rows) != 1 or rows[0]["userSelectionId"] != sel["selected_artwork_id"]:
            raise ValueError("Source triage disagrees with user's selected object")
        if t["source"] != rows[0]["verifiedSourceUrl"]:
            raise ValueError("Source object URL mismatch")
    elif t["source"] != sel["selected_artwork"].get("source_url"):
        raise ValueError("Coronation source object mismatch")
    return sel

def met_art(t):
    obj, api_url, _ = fetch(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{t['object_id']}")
    if obj.get("objectID") != t["object_id"] or obj.get("isPublicDomain") is not True:
        raise ValueError("Museum object identity or public-domain status not confirmed")
    # Object variation/artist stays anchored in the user export, not text-matched by title.
    expected_artist = "Philippe de Champaigne" if t["object_id"] == 438724 else "Peter Paul Rubens"
    if expected_artist.casefold() not in str(obj.get("artistDisplayName", "")).casefold():
        raise ValueError("Artist identity differs from the selected original")
    image = obj.get("primaryImage")
    if not image or urlparse(image).hostname != "images.metmuseum.org":
        raise ValueError("Met API supplies no eligible official full original")
    raw, image_url, mime = fetch(image, binary=True)
    if urlparse(image_url).hostname != "images.metmuseum.org":
        raise ValueError("Museum image redirect to untrusted host")
    return raw, dict(apiEvidenceUrl=api_url, imageUrl=image_url, imageMime=mime,
                     rightsEvidenceUrl="https://www.metmuseum.org/hubs/open-access",
                     rightsBasis="OFFICIAL_MET_API_IS_PUBLIC_DOMAIN_TRUE_AND_CC0_POLICY",
                     originalOrDerivative="SOURCE_FULL_ORIGINAL")

def iiif_art(t):
    manifest_url = "https://iiif.kmska.be/iiif/2/28958/manifest.json"
    m, actual, _ = fetch(manifest_url)
    label = m.get("label")
    if isinstance(label, dict):
        label = json.dumps(label, ensure_ascii=False)
    if not re.search("holy trinity|heilige drievuldigheid", str(label), re.I):
        raise ValueError("IIIF manifest cannot establish the exact Rubens Trinity")
    license_ = str(m.get("license") or m.get("rights") or "")
    if not any(flag in license_.lower() for flag in ["publicdomain/mark", "publicdomain/zero"]):
        raise ValueError("Manifest lacks public domain rights marker")
    canvases = m.get("sequences", [{}])[0].get("canvases", [])
    if not canvases: raise ValueError("No IIIF canvas")
    images = canvases[0].get("images", [])
    services = images[0].get("resource", {}).get("service", {}) if images else {}
    if isinstance(services, list): services = services[0] if services else {}
    service_id = services.get("@id") or services.get("id") or ""
    if not service_id.startswith("https://iiif.kmska.be/"):
        raise ValueError("Unexpected service URL")
    width, height = int(canvases[0].get("width") or 0), int(canvases[0].get("height") or 0)
    if max(width, height) < 10000:
        raise ValueError("Unexpected source IIIF geometry")
    # A 4000px review derivative is explicit; never call it the 19k original.
    url = service_id.rstrip("/") + "/full/4000,/0/default.jpg"
    raw, actual_image_url, mime = fetch(url, binary=True)
    if urlparse(actual_image_url).hostname != "iiif.kmska.be":
        raise ValueError("Image redirected off source institution")
    return raw, dict(apiEvidenceUrl=actual, imageUrl=actual_image_url,
                     imageMime=mime, rightsEvidenceUrl="https://vlaamsekunstcollectie.be/en/collection/314",
                     rightsBasis="KMSKA_IIIF_PUBLIC_DOMAIN_MARK_AND_COLLECTION_IMAGE_CC0",
                     originalOrDerivative="4000PX_IIIF_REVIEW_DERIVATIVE",
                     sourceCanvasSize=dict(width=width,height=height),manifestLicense=license_)

def views(raw, key):
    with Image.open(io.BytesIO(raw)) as im:
        im = ImageOps.exif_transpose(im)
        im.draft("RGB", (1600, 1600))
        im = im.convert("RGB")
        im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        w, h = im.size
        samples = {}
        for label, box_ratio in (("full", None), ("phone-center", 9/16), ("phone-high", 9/16)):
            canvas = Image.new("RGB", (450, 800), "#080c12")
            if box_ratio is None:
                image = im.copy()
                image.thumbnail((440, 790), Image.Resampling.LANCZOS)
                canvas.paste(image, ((450-image.width)//2, (800-image.height)//2))
            else:
                if w/h > box_ratio:
                    cw = int(h*box_ratio)
                    left = (w-cw)//2
                    top=0
                    region = im.crop((left,top,left+cw,h))
                else:
                    ch = int(w/box_ratio)
                    top = (h-ch)//2 if label == "phone-center" else max(0, int((h-ch)*0.22))
                    region = im.crop((0,top,w,top+ch))
                image = region.resize((450,800), Image.Resampling.LANCZOS)
                canvas.paste(image, (0,0))
            fn = f"{key}-{label}.webp"
            canvas.save(REVIEW / fn, format="WEBP", quality=82, method=5)
            samples[label] = "previews/" + fn
        return samples

def html_page(rows):
    escaped=lambda v: html.escape(str(v or ""))
    cards=[]
    for row in rows:
        previews = "".join(f'<div><div class="tag">{escaped(n)}</div><img loading="lazy" src="{escaped(path)}"></div>'
                           for n,path in row.get("previews",{}).items())
        cards.append(f'<article><h2>{escaped(row["artist"])} — {escaped(row["title"])}</h2>'
            f'<p>{escaped(row["subjectId"])} · {escaped(row["status"])} · {escaped(row.get("width",""))}×{escaped(row.get("height",""))}</p>'
            f'<p>{escaped(row.get("imageRights",""))} · original/derivative: {escaped(row.get("imageClass",""))}</p>'
            f'<div class="previews">{previews}</div>'
            f'<p><a href="{escaped(row["museumObjectUrl"])}">Official object</a></p>'
            '<p><b>No crop approved. These are QA comparisons, not a published app image.</b></p></article>')
    markup="""<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>body{background:#080c12;color:#e9e3d9;font:15px/1.45 Georgia,serif;max-width:1180px;margin:auto;padding:22px}
h1,h2{font-weight:400}h2{font-size:23px}article{padding:24px 0;border-bottom:1px solid #49505c}
p{color:#b6ada1}.previews{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.previews>div{max-width:450px}.previews img{width:100%;height:auto;aspect-ratio:9/16;object-fit:contain}
.tag{text-transform:uppercase;letter-spacing:.1em;font:12px sans-serif;margin-bottom:8px}
a{color:#ceb98d}</style></head><body><h1>Selected paintings · review only</h1>
<p>Original source identities are from the user's 12 October selections. No image or crop is released.</p>"""
    (OUTPUT / "review-gallery.html").write_text(markup+"".join(cards)+"</body></html>", encoding="utf-8")

def main():
    OUTIM.mkdir(parents=True,exist_ok=True)
    REVIEW.mkdir(parents=True,exist_ok=True)
    decisions=json.loads(USER_SOURCE.read_text())
    triage=json.loads(TRIAGE_SOURCE.read_text())
    archive=json.loads(ARCHIVE_SOURCE.read_text())
    archived={w["id"]: w for w in archive["artworks"]}
    entries=[]
    for t in TARGETS:
        sel=selected_identity(t,decisions,triage)
        row=dict(key=t["key"],theme=t["theme"],subjectId=t["subject"],selectedArtworkId=sel["selected_artwork_id"],
                 title=sel["selected_artwork"]["title"],artist=sel["selected_artwork"]["artist"],
                 museumObjectUrl=t["source"],museum=t["museum"],status="FETCH_NOT_STARTED",
                 userSelectedForSubject=True,homeMasterpieceApproved=False,
                 imageApproved=False,phoneCropApproved=False,productionApproved=False,previews={})
        try:
            raw, metadata=(met_art(t) if t["kind"].startswith("MET_") else iiif_art(t))
            w,h,variation=pixel_report(raw)
            sha=hashlib.sha256(raw).hexdigest()
            ext=".jpg"
            filename=t["key"]+ext
            (OUTIM/filename).write_bytes(raw)
            if t["key"] in archived:
                record=archived[t["key"]].get("acquisition",{})
                row["earlierArchiveSha256"]=record.get("originalSha256")
                row["sameBytesAsArchivedOriginal"]=sha==record.get("originalSha256")
            row.update(metadata)
            row.update(status="SOURCE_IMAGE_ACQUIRED_REVIEW_ONLY",
                       width=w,height=h,channelVariance=variation,
                       imageFilename="images/"+filename,imageBytes=len(raw),
                       imageSha256=sha,imageClass=metadata["originalOrDerivative"],
                       imageRights=metadata["rightsBasis"],previews=views(raw,t["key"]))
        except (Exception,) as exc:
            row.update(status="REVIEW_HOLD_FETCH_OR_IDENTITY_FAILURE",holdReason=f"{type(exc).__name__}: {str(exc)[:400]}")
        entries.append(row)
    html_page(entries)
    report={
      "schema":"AO_SELECTED_MASTERPIECE_ACQUISITION_QA_V1",
      "createdUtc":datetime.now(timezone.utc).isoformat(),
      "sourceDecisionFile":str(USER_SOURCE.relative_to(ROOT)),
      "status":"REVIEW_ARCHIVE_ONLY_NO_PRODUCTION_APPROVAL",
      "summary":{"requested":len(entries),"sourceImagesAcquired":sum(x["status"]=="SOURCE_IMAGE_ACQUIRED_REVIEW_ONLY" for x in entries),
                 "blocked":sum(x["status"]!="SOURCE_IMAGE_ACQUIRED_REVIEW_ONLY" for x in entries),
                 "productionApproved":0,"phoneCropsApproved":0},
      "results":entries
    }
    (OUTPUT/"acquisition-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print("SELECTED_MASTERPIECE_ACQUISITION",json.dumps(report["summary"]))
    for e in entries: print(e["key"],e["status"],e.get("holdReason",""),e.get("imageSha256",""))
    if report["summary"]["sourceImagesAcquired"] == 0:
        raise SystemExit("None of the 3 source-gated image acquisitions succeeded; review artifact report.")

if __name__=="__main__": main()
