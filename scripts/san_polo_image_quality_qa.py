#!/usr/bin/env python3
"""Read-only, batch image diagnostics for the 14 archived San Polo oil photographs.

These are *mechanical* checks, not artistic approval. No file is modified and
no user-approved image, release flag, licence or runtime mapping is changed.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps, ImageStat

ROOT = Path("data/prayer/stations/san-polo-tiepolo-oils-1747")
LEDGER = ROOT / "acquisition-results.v1.json"


def mean_std(image: Image.Image):
    stat = ImageStat.Stat(image)
    return round(stat.mean[0], 1), round(stat.stddev[0], 1)


def describe(path: Path, record: dict) -> dict:
    payload = path.read_bytes()
    assert hashlib.sha256(payload).hexdigest() == record["derivativeSHA256"]
    with Image.open(path) as original:
        assert original.format == "WEBP"
        assert list(original.size) == record["derivativeDimensions"]
        rgb = ImageOps.exif_transpose(original).convert("RGB")
        # A bounded preview avoids memory blowups and is representative of the
        # phone-size image. All metrics are diagnostics, not aesthetic verdicts.
        sample = rgb.copy()
        sample.thumbnail((700, 700), Image.Resampling.LANCZOS)
        grey = ImageOps.grayscale(sample)
        mean, std = mean_std(grey)
        entropy = round(grey.entropy(), 2)
        edge_energy = round(ImageStat.Stat(grey.filter(ImageFilter.FIND_EDGES)).mean[0], 2)
        colors = ImageStat.Stat(sample).mean
        w, h = grey.size
        dx = max(2, w // 35)
        dy = max(2, h // 35)
        strips = {
            "left": grey.crop((0, 0, dx, h)),
            "right": grey.crop((w - dx, 0, w, h)),
            "top": grey.crop((0, 0, w, dy)),
            "bottom": grey.crop((0, h - dy, w, h)),
        }
        strip_metrics = {side: mean_std(region) for side, region in strips.items()}
        # A uniform, near-black outside strip may be a photo margin or frame.
        # Review flags do NOT automatically imply a frame or invalid crop.
        possible_dark_strips = [
            side for side, (m, sd) in strip_metrics.items()
            if m < 22 and sd < 14
        ]
        monochrome = max(colors) - min(colors) < 3
        return {
            "station": record["station"],
            "dimensions": list(rgb.size),
            "bytes": len(payload),
            "meanLuma": mean,
            "lumaStdDev": std,
            "lumaEntropy": entropy,
            "thumbnailEdgeEnergy": edge_energy,
            "meanRGB": [round(x, 1) for x in colors],
            "outerStripLumaMeanStd": strip_metrics,
            "potentialDarkOuterStrips": possible_dark_strips,
            "nearMonochrome": monochrome,
            "sourcePage": record["sourcePage"],
            "hashVerified": True,
            "mechanicalMinWidthPass": rgb.width >= 1800,
            "mechanicalMinHeightPass": rgb.height >= 2000,
            "artisticVisualApproval": False,
            "exactWebPManuallyReviewed": False,
            "productionRightsCleared": False,
        }


def main():
    data = json.loads(LEDGER.read_text(encoding="utf-8"))
    assert data["photographsAcquired"] == 14 and data["productionImagesEnabled"] == 0
    results = []
    for record in data["files"]:
        path = Path(record["file"])
        results.append(describe(path, record))
    assert [r["station"] for r in results] == list(range(1, 15))
    assert all(r["hashVerified"] and r["mechanicalMinWidthPass"]
               and r["mechanicalMinHeightPass"] for r in results)
    flags = [r["station"] for r in results
             if r["potentialDarkOuterStrips"] or r["nearMonochrome"]]
    print(json.dumps({
        "scope": "read-only mechanical batch QA, not human visual sign-off",
        "archivedUniqueImages": 14,
        "exactByteChecksumValidated": 14,
        "minSizeValidated": 14,
        "potentialBorderOrMonochromeReviewStations": flags,
        "manualVisualApproval": 0,
        "publicationEnabled": 0,
        "entries": results,
    }, indent=2))


if __name__ == "__main__":
    main()
