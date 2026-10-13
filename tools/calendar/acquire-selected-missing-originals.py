#!/usr/bin/env python3
"""Recover only exact selected Commons files recorded in the canonical recovery queue.

Produces immutable SHA256 evidence and review-only previews. No production asset,
published registry, or editorial decision is changed by this script.
"""
import hashlib
import io
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
QUEUE = ROOT / "data/calendar/sacred-art-selected-originals-acquisition-queue-20261013.v1.json"
OUT = ROOT / "artifacts/sacred-art-selected-originals-recovery"
HEADERS = {
    "User-Agent": "AdOrientem-SelectedOriginalResearch/1.0 (repository QA, Commons provenance)",
    "Accept": "application/json,image/jpeg,*/*",
}
MAX_BYTES = 32 * 1024 * 1024
SHA256 = re.compile(r"^[0-9a-f]{64}$")


def read(url, limit):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=90) as res:
        final = urllib.parse.urlsplit(res.url)
        if final.scheme != "https" or final.netloc not in {
            "commons.wikimedia.org", "upload.wikimedia.org"
        }:
            raise ValueError("Unexpected download host: " + final.netloc)
        data = res.read(limit + 1)
    if len(data) > limit:
        raise ValueError("Image/metadata exceeds byte budget")
    return data


def check_licence(meta, code):
    props = meta.get("extmetadata", {})
    name = str(props.get("LicenseShortName", {}).get("value", "")).lower()
    link = str(props.get("LicenseUrl", {}).get("value", "")).lower()
    if code == "CC_BY_3_0":
        return ("cc by 3.0" in name and "/licenses/by/3.0" in link)
    if code == "CC0":
        return ("cc0" in name or "/publicdomain/zero/1.0" in link)
    if code == "PUBLIC_DOMAIN_MARK_PD_ART":
        return ("public domain" in name or "pd-old" in name or
                "/publicdomain/mark/1.0" in link)
    return False


def recover(record):
    original = record["researchOnlyOriginalCandidate"]
    title = original["commonsFileTitle"]
    assert not record["acquiredRegistryOriginal"]
    assert record["sourceClassification"] == "EXACT_INSTITUTIONAL_OBJECT_VERIFIED_MASTER_MISSING"
    assert not record["rightsCleared"], "Research lane may not mark publication legal gate cleared"
    query = urllib.parse.urlencode({
        "action": "query", "prop": "imageinfo",
        "iiprop": "url|size|sha1|extmetadata", "format": "json",
        "formatversion": "2", "titles": "File:" + title
    })
    obj = json.loads(read("https://commons.wikimedia.org/w/api.php?" + query, 3_000_000))
    pages = obj.get("query", {}).get("pages", [])
    if len(pages) != 1 or "imageinfo" not in pages[0]:
        raise ValueError("Exact Commons file not found")
    info = pages[0]["imageinfo"][0]
    rights = original["rightsLabel"]
    if not check_licence(info, rights):
        raise ValueError("Commons licence metadata did not confirm recorded rights class")
    w, h = int(info["width"]), int(info["height"])
    expected = (int(original["expectedPixelWidth"]), int(original["expectedPixelHeight"]))
    if (w, h) != expected:
        raise ValueError("Commons original pixel dimensions changed")
    ratio = w / h
    physical = (float(original["artworkPhysicalWidthCm"]),
                float(original["artworkPhysicalHeightCm"]))
    discrepancy = abs(ratio / (physical[0] / physical[1]) - 1.0)
    if discrepancy > 0.08:
        raise ValueError("Source ratio differs by >8% from museum painting")
    image_url = info.get("url", "")
    parsed = urllib.parse.urlsplit(image_url)
    if parsed.scheme != "https" or parsed.netloc != "upload.wikimedia.org":
        raise ValueError("Untrusted original source URL")
    raw = read(image_url, MAX_BYTES)
    with Image.open(io.BytesIO(raw)) as im:
        im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        im.load()
        if im.format != "JPEG" or im.size != expected:
            raise ValueError("Downloaded bytes are not expected full JPEG")
        thumb = ImageOps.exif_transpose(im)
        if thumb.size != expected:
            raise ValueError("Unexpected EXIF orientation")
        thumb.thumbnail((850, 700), Image.Resampling.LANCZOS)
        preview = thumb.convert("RGB")
    sha = hashlib.sha256(raw).hexdigest()
    assert SHA256.fullmatch(sha)
    work_id = record["editorialArtworkId"]
    src = OUT / "originals" / (work_id + ".jpg")
    prev = OUT / "previews" / (work_id + ".webp")
    src.parent.mkdir(parents=True, exist_ok=True)
    prev.parent.mkdir(parents=True, exist_ok=True)
    src.write_bytes(raw)
    preview.save(prev, "WEBP", quality=84, method=5)
    return {
        "editorialArtworkId": work_id, "artist": record["artist"], "title": record["title"],
        "subjectIds": record["subjectIds"], "museumObjectUrl": record["exactInstitutionalSourceUrl"],
        "museumInventory": record["institutionalObjectId"], "commonsFilePage": original["commonsPageUrl"],
        "commonsExactFileTitle": title, "commonsOriginalUrl": image_url,
        "commonsRevisionSha1": info.get("sha1"),
        "licenceEvidence": info.get("extmetadata", {}).get("LicenseShortName", {}).get("value"),
        "licenceUrl": info.get("extmetadata", {}).get("LicenseUrl", {}).get("value"),
        "rightsResearchClass": rights, "credit": original.get("creditRequired"),
        "status": "SHA256_VERIFIED_REVIEW_ORIGINAL_NOT_PRODUCTION", "sourceBytes": len(raw),
        "originalSha256": sha, "pixels": [w, h],
        "objectAspectRatioDifference": round(discrepancy, 5),
        "sourceFile": str(src.relative_to(OUT)), "previewFile": str(prev.relative_to(OUT)),
        "publicationApproved": False, "phoneCropApproved": False,
        "artisticReviewCompleted": False, "legalJurisdictionCheckPending": True,
    }


def main():
    queue = json.loads(QUEUE.read_text(encoding="utf8"))
    assert queue["schema"] == "AO_SACRED_ART_UNJOINED_SELECTED_WORKS_ACQUISITION_QUEUE_V1"
    records = [w for w in queue["works"] if
               (w.get("researchOnlyOriginalCandidate") or {}).get("acquisitionState") ==
               "REVIEW_ONLY_GITHUB_ACTION_PENDING"]
    if len(records) != 4:
        raise ValueError("Expected exactly four exact-research originals, found " + str(len(records)))
    OUT.mkdir(parents=True, exist_ok=True)
    output = []
    for a in records:
        try:
            result = recover(a)
            output.append(result)
            print("SOURCE_IMAGE_VERIFIED", a["editorialArtworkId"], result["pixels"], result["originalSha256"], flush=True)
        except Exception as e:
            output.append({"editorialArtworkId": a["editorialArtworkId"], "status": "RECOVERY_FAILED",
                           "reason": type(e).__name__ + ": " + str(e)[:240],
                           "publicationApproved": False})
            print("SOURCE_IMAGE_FAILED", a["editorialArtworkId"], type(e).__name__, str(e)[:160], file=sys.stderr, flush=True)
    successes = [x for x in output if x["status"].startswith("SHA256_VERIFIED")]
    manifest = {
        "schema": "AO_SACRED_ART_SELECTED_ORIGINAL_RECOVERY_QA_V1",
        "sourceQueue": str(QUEUE.relative_to(ROOT)), "status": "REVIEW_ONLY_NEVER_PUBLISH",
        "requested": len(records), "recovered": len(successes),
        "failed": len(records) - len(successes), "results": output,
        "productionApproved": False, "newUserArtworkChoices": 0,
        "legalAndAestheticReleaseGates": "NOT_CLEARED"
    }
    (OUT / "acquisition-report.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf8")
    cards = []
    for x in output:
        if x["status"].startswith("SHA256_VERIFIED"):
            credit = x.get("credit") or x["rightsResearchClass"]
            cards.append('<article><img src="' + x["previewFile"] + '" alt="Artwork">'
                         '<h2>' + x["artist"] + " — " + x["title"] + '</h2>'
                         '<p>' + str(x["pixels"]) + ' · SHA256 ' + x["originalSha256"] +
                         '</p><p>' + credit + '</p><p>Source: ' + x["museumObjectUrl"] + '</p></article>')
        else:
            cards.append('<article><h2>' + x["editorialArtworkId"] +
                         '</h2><p>Not recovered; see JSON report.</p></article>')
    html = ('<!doctype html><meta charset="utf-8"><title>Selected originals — QA only</title>'
            '<style>body{background:#080c12;color:#eae5dd;font:14px system-ui;margin:2em}'
            'article{border:1px solid #45505f;padding:1.5em;margin:1em 0}img{display:block;max-width:100%;max-height:690px;object-fit:contain}</style>'
            '<h1>Selected sacred-art original recovery — research QA</h1>'
            '<p>Not approved for release, rights, art direction or cropping. Preserve existing user selections.</p>'
            + ''.join(cards))
    (OUT / "index.html").write_text(html, encoding="utf8")
    print("REVIEW_ONLY_SOURCE_RECOVERY", len(successes), "/", len(records), flush=True)
    return 0 if len(successes) == len(records) else 2


if __name__ == "__main__":
    raise SystemExit(main())
