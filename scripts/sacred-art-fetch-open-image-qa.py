#!/usr/bin/env python3
"""Fetch four museum-identified CC0 image candidates for *research-only* QA.

No files are copied into public app assets; this script neither changes the
editorial assignment registry nor grants rights or publication authority.
It is deliberately fail-closed on network, malformed JPEG and source mismatch.
"""
import argparse
import hashlib
import io
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageStat

MAX_BYTES = 32 * 1024 * 1024
MIN_RESEARCH_WIDTH = 1170
HOST = "images.metmuseum.org"


def fetch_jpeg(url):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != HOST:
        raise ValueError("non-allowlisted source URL")
    if not parsed.path.startswith("/CRDImages/") or not parsed.path.endswith(".jpg"):
        raise ValueError("unexpected museum image path")
    last_error = None
    for attempt in range(2):
        try:
            request = urllib.request.Request(
                url, headers={
                    "User-Agent": "AdOrientemResearch/1.0 (museum provenance QA)",
                    "Accept": "image/jpeg",
                }
            )
            with urllib.request.urlopen(request, timeout=25) as res:
                resolved = urllib.parse.urlparse(res.geturl())
                if resolved.scheme != "https" or resolved.hostname != HOST:
                    raise ValueError("source redirected outside museum host")
                content_type = res.headers.get("Content-Type", "").lower()
                if "jpeg" not in content_type and "octet-stream" not in content_type:
                    raise ValueError("unexpected Content-Type: " + content_type)
                data = res.read(MAX_BYTES + 1)
                if len(data) > MAX_BYTES:
                    raise ValueError("JPEG exceeds bounded research size")
                if len(data) < 1024 or not data.startswith(b"\xff\xd8\xff"):
                    raise ValueError("response is not a valid JPEG candidate")
                return data, res.geturl()
        except Exception as exc:
            last_error = exc
            if attempt == 0:
                time.sleep(2)
    raise RuntimeError(f"two failed retrieval attempts: {type(last_error).__name__}: {last_error}")


def analyse(data, key, dest):
    with Image.open(io.BytesIO(data)) as img:
        img.verify()
    with Image.open(io.BytesIO(data)) as img:
        img.load()
        width, height = img.size
        if width * height > 100_000_000:
            raise ValueError("oversized untrusted source image")
        rgb = img.convert("RGB")
        sample = rgb.copy()
        sample.thumbnail((400, 400), Image.Resampling.LANCZOS)
        mean_saturation = round(ImageStat.Stat(sample.convert("HSV").getchannel("S")).mean[0], 2)
        color_status = "LIKELY_GRAYSCALE_PREVIEW" if mean_saturation < 5 else "HAS_MEASURABLE_COLOUR"
        if width < MIN_RESEARCH_WIDTH:
            technical_status = "HOLD_WIDTH_BELOW_1170"
        elif mean_saturation < 5:
            technical_status = "HOLD_MONOCHROME_OR_LOW_SATURATION"
        else:
            technical_status = "TECHNICAL_METADATA_PASS_PENDING_HUMAN_ART_CROP_REVIEW"
        filename = key.replace(":", "_").replace("/", "_") + ".jpg"
        image_dest = dest / "images" / filename
        image_dest.parent.mkdir(parents=True, exist_ok=True)
        image_dest.write_bytes(data)
        preview = rgb.copy()
        preview.thumbnail((560, 800), Image.Resampling.LANCZOS)
        thumb_dest = dest / "review-thumbnails" / filename
        thumb_dest.parent.mkdir(parents=True, exist_ok=True)
        preview.save(thumb_dest, format="JPEG", quality=85)
        return {
            "filename": str(image_dest),
            "reviewThumbnail": str(thumb_dest),
            "byteLength": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "pixelWidth": width, "pixelHeight": height,
            "imageMode": img.mode, "imageFormat": img.format,
            "meanThumbnailSaturation": mean_saturation,
            "colourDiagnostic": color_status,
            "technicalStatus": technical_status,
            "humanCompositionAndMobileCropQA": "NOT_CERTIFIED",
            "dateSpecificEditorialApproval": False,
            "publicationAuthority": False,
        }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--queue", required=True)
    parser.add_argument("--output", default="research-open-image-qa")
    args = parser.parse_args()
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    with open(args.queue, encoding="utf-8") as fp:
        queue = json.load(fp)
    allowed_states = {
        "READY_NETWORK_ATTEMPT",
        "ORIGINAL_MUSEUM_JPEG_DOWNLOADED_AND_CHECKSUM_VERIFIED_EPHEMERAL",
    }
    allowed_keys = {"Met:724811", "Met:435901", "Met:469892", "Met:1991.153"}
    chosen = [r for r in queue["records"] if r.get("key") in allowed_keys]
    if len(chosen) != 4 or {r["key"] for r in chosen} != allowed_keys:
        raise ValueError("expected precisely four explicitly allowlisted Met candidates")
    if any(r.get("acquisitionStatus") not in allowed_states for r in chosen):
        raise ValueError("unexpected acquisition status: must be fresh or previously verified")
    report = {
        "schema": "AO_SOURCE_PHOTO_FETCH_QA_V1",
        "asOfUtc": datetime.now(timezone.utc).isoformat(),
        "repositoryPolicy": "RESEARCH_ONLY_NOT_PUBLIC_PAGES",
        "expected": len(chosen),
        "sourceMetadataOnly": False,
        "publicationAuthority": False,
        "dateSpecificEditorialApproval": False,
        "imageRightsPolicy": "MET_OFFICIAL_CC0_OBJECT_POLICY_PER_RECORD; NO_COPYRIGHT_ASSUMPTION_FOR_OTHER_URLS",
        "results": [],
    }
    try:
        for row in chosen:
            item = {"workKey": row["key"], "catalogueUrl": row["catalogue"],
                    "sourceCandidateUrl": row["firstPartyPhotoUrl"],
                    "licenceEvidence": row["photoLicence"],
                    "status": "RETRIEVAL_FAILED"}
            try:
                data, resolved = fetch_jpeg(row["firstPartyPhotoUrl"])
                analysed = analyse(data, row["key"], out)
                if row.get("acquisitionStatus") == "ORIGINAL_MUSEUM_JPEG_DOWNLOADED_AND_CHECKSUM_VERIFIED_EPHEMERAL":
                    expected = {
                        "sha256": row.get("sha256"),
                        "byteLength": row.get("byteLength"),
                        "pixelWidth": row.get("pixelWidth"),
                        "pixelHeight": row.get("pixelHeight"),
                    }
                    for field, earlier in expected.items():
                        if earlier is None or analysed.get(field) != earlier:
                            raise ValueError(
                                f"museum source no longer matches previously verified {field} for {row['key']}"
                            )
                    item["priorSourceDigestReverified"] = True
                else:
                    item["priorSourceDigestReverified"] = False
                item.update(analysed)
                item["verifiedFinalUrl"] = resolved
                item["status"] = "RETRIEVED_NEEDS_HUMAN_EDITORIAL_QA"
            except Exception as exc:
                item["error"] = f"{type(exc).__name__}: {exc}"
            report["results"].append(item)
            print(row["key"] + ": " + item["status"], flush=True)
    finally:
        report["retrievedCount"] = sum(x["status"] == "RETRIEVED_NEEDS_HUMAN_EDITORIAL_QA" for x in report["results"])
        report["failedCount"] = len(chosen) - report["retrievedCount"]
        (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if report["failedCount"]:
        print("FAILED to retrieve " + str(report["failedCount"]) + " museum originals; see research artifact report", file=sys.stderr)
        return 1
    print("Four Met originals fetched and verified against prior hashes where available; no publication authority")
    return 0


if __name__ == "__main__":
    sys.exit(main())
