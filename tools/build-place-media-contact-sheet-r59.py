#!/usr/bin/env python3
"""Build read-only review contact sheets of the remaining 10 site candidates."""
import json, runpy
from pathlib import Path
root=Path(__file__).resolve().parents[1]
report=json.loads((root/"data/geography/research/place-media-stage-report-r59.v1.json").read_text(encoding="utf-8"))
records=[x for x in report["media"] if x["status"]=="STAGED_NOT_APPROVED"]
helpers=runpy.run_path(str(root/"tools/build-place-media-contact-sheet.py"),run_name="r59_helpers")
if not records:raise SystemExit("No staged images for review")
helpers["render"](records,"R59 unreleased ten-site review","place-media-review-r59.webp")
helpers["render"](records[:6],"R59 alternative photos 1–6","place-media-review-r59-a.webp")
helpers["render"](records[6:],"R59 alternative photos 7–10","place-media-review-r59-b.webp")

# A layout filled only with empty navy cells is not a valid visual review.
from PIL import Image, ImageStat
overview=root/"assets/staged/place-media-review-r59.webp"
with Image.open(overview) as board:
    region=board.crop((80,140,330,290)).convert("RGB")
    contrast=max(ImageStat.Stat(region).stddev)
    assert contrast>18, "The staged source photographs did not render in the review sheet"
print("PASS R59 real imagery visible in contact sheets")
