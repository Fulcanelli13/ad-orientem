#!/usr/bin/env python3
"""Stage phone-sized, uncropped candidates for approved feast heroes.

Input is the immutable original-byte artifact from successful Actions run
39565626625 and SHA evidence committed in the repository. The staging output
is NOT a release manifest: no user photo approval or multi-jurisdiction rights
decision can be inferred from successful image conversion.
"""
from __future__ import annotations

import hashlib
import html
import json
import re
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "artifacts/sacred-art-approved-feast-hero-photographs"
EVIDENCE_FILE = ROOT / "data/calendar/approved-feast-hero-photo-sha-evidence-20261021.v1.json"
EDITORIAL_FILE = ROOT / "data/calendar/approved-feast-hero-photo-acquisition-20261021.v1.json"
STAGE_DIR = ROOT / "assets/sacred-art/candidates"
OUT_FILE = ROOT / "data/calendar/approved-feast-hero-packaged-candidates-20261021.v1.json"
GALLERY_FILE = ROOT / "docs/research/APPROVED-FEAST-HERO-PHOTO-REVIEW-20261021.html"
Image.MAX_IMAGE_PIXELS = 110_000_000


def sha256(blob: bytes) -> str:
    return hashlib.sha256(blob).hexdigest()


def assert_safe_row(proof, editorial):
    assert proof["date"] == editorial["date"]
    assert proof["artist"] == editorial["artist"]
    assert proof["title"] == editorial["title"]
    assert proof["sourcePage"] == editorial["objectUrl"]
    assert proof["photoPage"] == editorial["filePage"]
    assert proof["retrievedVariant"] == "EXACT_ORIGINAL_BYTES"
    assert re.fullmatch(r"[a-f0-9]{64}", proof["sourceSHA256"])
    assert proof["sourceDimensions"][0] >= 400 and proof["sourceDimensions"][1] >= 400
    assert proof["releaseApproved"] is False


def make_gallery(rows):
    cards = []
    for item in rows:
        photo = item["candidateFile"]
        artist, title, occasion = (html.escape(item[k],quote=True)
                                   for k in ("artist","title","occasion"))
        src = html.escape("../../" + photo["path"],quote=True)
        url = html.escape(item["sourcePhotoPage"],quote=True)
        licence = html.escape(item["rightsReview"]["status"],quote=True)
        desc = html.escape(item["iconographyRelationship"],quote=True)
        cards.append(f"""<article class="painting">
          <figure><img src="{src}" width="{photo['width']}" height="{photo['height']}"
            loading="lazy" decoding="async" alt="{artist} — {title}"></figure>
          <div class="caption"><p class="date">{item['date']} · {occasion}</p>
           <h2>{title}</h2><p>{artist}</p><small>{desc}</small>
           <p class="status">PHOTO REVIEW: PENDING · {licence}</p>
           <p><a href="{url}" target="_blank" rel="noopener noreferrer">Source and reproduction →</a></p>
          </div>
         </article>""")
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ad Orientem · Ten approved feast hero photographs · internal review</title>
    <style>
    :root{{color-scheme:dark}}
    *{{box-sizing:border-box}}
    body{{margin:0;background:#080c12;color:#ece2d1;font-family:Georgia,serif}}
    header{{padding:36px 22px 22px;border-bottom:1px solid #343c44}}
    header h1{{font-weight:400;letter-spacing:.03em;margin:4px 0}}
    header p{{max-width:80ch;color:#b4aca3;line-height:1.5}}
    .kicker,.date,.status,small{{font:600 11px/1.5 system-ui,sans-serif;letter-spacing:.07em}}
    .kicker{{color:#bfa97e}}
    main{{max-width:1140px;margin:0 auto;padding:24px 14px 80px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:32px}}
    .painting{{background:#101720;border:1px solid #323842;min-width:0;overflow:hidden}}
    figure{{height:min(65vh,440px);padding:12px;margin:0;display:grid;place-items:center;background:#070b10}}
    figure img{{display:block;width:100%;height:100%;min-width:0;min-height:0;object-fit:contain}}
    .caption{{padding:18px 19px 24px}}
    .caption h2{{font-weight:400;font-size:23px;margin:6px 0}}
    .caption p{{line-height:1.4;color:#c8c1b4;margin:7px 0}}
    .caption .date{{color:#bda779}}.caption .status{{color:#cba884}}
    a{{color:#e0cfaf;text-underline-offset:4px}}
    @media(max-width:660px){{main{{display:block;padding:8px 0 60px}}
      .painting{{margin:12px 10px 22px}}figure{{height:min(58vh,360px)}}
      header{{padding:20px 16px}}}}
    </style></head>
    <body><header><div class="kicker">AD ORIENTEM · ARTWORK RECONCILIATION · 2026</div>
    <h1>Approved feast heroes</h1><p>These are the ten paintings the curator has already selected.
    This page reviews each <em>specific photographic reproduction</em> at mobile widths.
    The entire painted surface is shown with <code>object-fit:contain</code>; no replacement,
    ratings or new painting selection. Rights and photo acceptance are still pending:
    this is <strong>not</strong> a publication or production release.</p></header>
    <main>{''.join(cards)}</main></body></html>"""


def main():
    proof = json.loads(EVIDENCE_FILE.read_text(encoding="utf-8"))
    editorial = json.loads(EDITORIAL_FILE.read_text(encoding="utf-8"))["works"]
    report = json.loads((SOURCE_DIR / "ten-approved-feast-heroes-source-evidence.json")
                        .read_text(encoding="utf-8"))
    assert proof["counts"]["downloaded"] == 10
    assert proof["counts"]["exactOriginalImageBytes"] == 10
    assert len(editorial) == len(proof["photographs"]) == len(report["rows"]) == 10
    assert report["counts"]["photographsAcquired"] == 10
    STAGE_DIR.mkdir(parents=True, exist_ok=True)
    by_date = {item["date"]: item for item in report["rows"]}
    rows = []
    for user_item, item in zip(editorial, proof["photographs"]):
        assert_safe_row(item, user_item)
        record = by_date[item["date"]]
        assert record["status"] == "DOWNLOADED_RESEARCH_PHOTO_NOT_RELEASED"
        source_file = SOURCE_DIR / record["files"]["original"]
        raw = source_file.read_bytes()
        assert len(raw) == item["sourceBytes"], f"source length mismatch: {item['date']}"
        assert sha256(raw) == item["sourceSHA256"], f"source hash mismatch: {item['date']}"
        image = Image.open(source_file)
        image = ImageOps.exif_transpose(image).convert("RGB")
        assert [image.width, image.height] == item["sourceDimensions"]
        w, h = image.size
        # Downsample only. Never crop, cover, stretch, AI enhance or remove a
        # painted edge; the exact photo is the sole source of pixel content.
        target = image.copy()
        target.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        staged_name = f"hero-{item['date']}-{item['sourceSHA256'][:12]}.webp"
        dest = STAGE_DIR / staged_name
        target.save(dest, "WEBP", quality=88, method=6)
        derivative = dest.read_bytes()
        with Image.open(dest) as readback:
            assert readback.format == "WEBP"
            assert readback.width >= 400 and readback.height >= 400
            assert abs(readback.width / readback.height - w / h) < 0.005
            final_dims = [readback.width, readback.height]
        is_met = item["metadataAccess"] == "MET_API_VERIFIED_PD_FLAG"
        row = {
            "date": item["date"], "artist": item["artist"], "title": item["title"],
            "occasion": {
                "2026-03-29":"Palm Sunday","2026-04-02":"Holy Thursday",
                "2026-05-23":"Pentecost Vigil","2026-05-24":"Pentecost",
                "2026-05-27":"Pentecost Ember Wednesday","2026-06-12":"Sacred Heart",
                "2026-10-25":"Christ the King","2026-11-01":"All Saints",
                "2026-11-02":"All Souls","2026-11-29":"First Sunday of Advent"
            }[item["date"]],
            "iconographyRelationship": user_item["notes"],
            "editorialSelectionPreserved": True,
            "sourcePhotoPage": item["photoPage"],
            "sourceObjectPage": item["sourcePage"],
            "sourceImageSHA256": item["sourceSHA256"],
            "sourceOriginalDimensions": item["sourceDimensions"],
            "candidateFile": {
                "path": "assets/sacred-art/candidates/" + staged_name,
                "sha256": sha256(derivative),
                "byteCount": len(derivative),
                "width": final_dims[0], "height": final_dims[1],
                "derivation": "EXIF_ORIENT_AND_WHOLE_IMAGE_RESIZE_ONLY",
                "originalPaintingSurfaceUncroppedByThisScript": True,
                "photoHumanVisualAccepted": False,
                "mobile320VisualAccepted": False,
                "mobile390VisualAccepted": False,
                "anyAdditionalCrop": False,
            },
            "rightsReview": {
                "status": ("MET_CC0_POLICY_CONFIRMED_PER_OBJECT" if is_met
                           else "COMMONS_PUBLIC_DOMAIN_REPRODUCTION_JURISDICTION_REVIEW"),
                "sourceLicenseLabel": item["licenseCandidate"],
                "sourcePolicyUrl": ("https://www.metmuseum.org/policies/image-resources"
                                    if is_met else "https://commons.wikimedia.org/wiki/Commons:PD-Art"),
                "appDistributionIndependentlyApproved": False,
                "photographRightsHumanSignedOff": False,
            },
            "productionRelease": False,
        }
        rows.append(row)
        print(f"HERO_PACKAGED_CANDIDATE {item['date']} {final_dims}"
              f" {len(derivative)} bytes sha256={row['candidateFile']['sha256']}", flush=True)
    summary = {
        "schema": "AO_APPROVED_FEAST_HERO_PACKAGING_CANDIDATES_20261021_V1",
        "status": "STAGED_LOCAL_PHONE_CANDIDATE_IMAGES_NOT_PRODUCTION_RELEASE",
        "userSelectedPaintingsPreserved": 10,
        "verifiedOriginalImageSHA": 10,
        "candidateWebpFilesWritten": 10,
        "humanAcceptedImagePhotos": 0,
        "explicitAppRightsReleaseApprovals": 0,
        "liveReleaseManifest": None,
        "source": "data/calendar/approved-feast-hero-photo-sha-evidence-20261021.v1.json",
        "sourceWorkflowRun": 39565626625,
        "packaging": "Exact-source SHA verified, image resized to fit <=1600x1600 preserving painting content, no crop, source copy remains in 30-day Action archive.",
        "rightsPolicy": "Met's OA is explicit CC0 for its particular public-domain images; Commons PD-Art can leave foreign reproduction/jurisdiction rights uncertainty. Do not publish based on Commons label alone.",
        "photographs": rows,
    }
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUT_FILE.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    GALLERY_FILE.parent.mkdir(parents=True, exist_ok=True)
    GALLERY_FILE.write_text(make_gallery(rows),encoding="utf-8")
    print("HERO_PACKAGING_COMPLETE "
          + json.dumps({"candidateFiles":len(rows),"released":0,
                        "totalBytes":sum(x["candidateFile"]["byteCount"] for x in rows)}),
          flush=True)


if __name__ == "__main__":
    main()
