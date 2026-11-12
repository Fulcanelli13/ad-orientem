#!/usr/bin/env python3
"""M51 original-print notehead proof sheets for independent human review.

Takes M49's ephemeral source crops and M50's 44-point position map.
Creates labelled review overlays and a source-bound adjudication index.
Coordinates and GABC pitches are research hypotheses, NOT evidence of
an independently certified 1961 print transcription. Nothing is deployed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
MAP = ROOT / "data/research/mass-music-m50-kyrie-xviii-print-visual-position-map.v1.json"
LEDGER = ROOT / "data/research/mass-music-m49-kyrie-xviii-note-review-ledger.v1.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def font(size: int):
    try:
        return ImageFont.truetype("DejaVuSans.ttf", size)
    except OSError:
        return ImageFont.load_default()


def render(staff: int, source: Path, notes: list[dict], out: Path):
    # All pixels in the source crop are kept; annotations sit on a 2x preview.
    image = Image.open(source).convert("RGB")
    result = image.resize((image.width * 2, image.height * 2))
    draw = ImageDraw.Draw(result)
    numbering = font(19)
    for item in notes:
        x, y = item["approximateInkCenterPx"]
        cx, cy = 2 * x, 2 * y
        draw.ellipse((cx - 16, cy - 16, cx + 16, cy + 16),
                     outline=(195, 25, 26), width=3)
        # Labels alternate above/below to avoid hiding the score itself.
        label = str(item["ordinal"])
        ly = cy + 19 if item["ordinal"] % 2 == 0 else cy - 45
        ly = min(max(ly, 0), result.height - 25)
        box = draw.textbbox((0, 0), label, font=numbering)
        tw = box[2] - box[0]
        draw.rectangle((cx - 4, ly - 1, cx + tw + 6, ly + 23), fill="white")
        draw.text((cx, ly), label, font=numbering, fill=(180, 15, 15))
    result.save(out, format="PNG", optimize=True)
    return result.size


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", required=True, type=Path,
                        help="M49's transient 1961 print evidence directory")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    mapped, ledger, manifest = load(MAP), load(LEDGER), load(args.evidence / "manifest.json")
    if manifest["pdfSha256"] != mapped["provenance"]["originalPdfSha256"]:
        raise ValueError("Historical PDF fingerprint mismatch")
    if manifest["printedFolio"] != "57*" or manifest["pdfPageOneBased"] != 59:
        raise ValueError("Unexpected original printed folio")
    if not manifest["imagesNotCommittedOrDeployed"]:
        raise ValueError("Source-image publication rule absent")
    if mapped["status"] != "PROVISIONAL_PRINT_VISUAL_ALIGNMENT_NOT_APPROVED":
        raise ValueError("Only provisional visual maps are accepted")
    if len(mapped["notePositions"]) != 44 or len(ledger["records"]) != 44:
        raise ValueError("Expected exactly 44 source noteheads")

    index = []
    sheet_manifest = []
    for staff in (1, 2):
        crop = mapped["provenance"][f"crop{staff}"]
        image_path = args.evidence / crop["filename"]
        if digest(image_path) != crop["sha256"]:
            raise ValueError(f"Original staff {staff} crop checksum mismatch")
        with Image.open(image_path) as im:
            if im.size != (crop["width"], crop["height"]):
                raise ValueError(f"Unexpected pixel geometry for staff {staff}")
        notes = [n for n in mapped["notePositions"] if n["staffSystem"] == staff]
        expected_count = 18 if staff == 1 else 26
        if len(notes) != expected_count:
            raise ValueError(f"Expected {expected_count} mapped heads on staff {staff}")

        overlay = args.output / f"kyrie-xviii-original-review-staff-{staff}.png"
        dimensions = render(staff, image_path, notes, overlay)
        sheet_manifest.append({
            "staffSystem": staff,
            "sourceCropName": crop["filename"],
            "sourceCropSha256": crop["sha256"],
            "overlayName": overlay.name,
            "overlaySha256": digest(overlay),
            "overlayDimensions": dimensions,
            "sourceNoteOrdinals": [n["ordinal"] for n in notes],
        })
        for n in notes:
            row = ledger["records"][n["ordinal"] - 1]
            if row["sourceOrdinal"] != n["ordinal"] or row["phrase"] != n["phrase"]:
                raise ValueError("Editorial ledger/source ordinal mismatch")
            if row["staffPosition"] != n["observedStaffPosition"]:
                raise ValueError("M50 visual hypothesis and GABC note differ")
            x, y = n["approximateInkCenterPx"]
            if not 0 <= x < crop["width"] or not 0 <= y < crop["height"]:
                raise ValueError("Mapped position outside original crop")
            index.append({
                "ordinal": n["ordinal"], "staffSystem": staff,
                "phrase": n["phrase"],
                "sourceCrop": crop["filename"],
                "hypothesisInkPosition": [x, y],
                "hypothesisPitchLetter": row["sourcePitchLetter"],
                "hypothesisStaffDegree": row["staffPosition"],
                "hypothesisNeume": row["renderedNeume"],
                "hypothesisMora": row["modelPunctumMora"],
                "hypothesisEpisema": row["modelHorizontalEpisema"],
                "reviewInkPresence": "PENDING_INDEPENDENT_EDITOR",
                "reviewPitch": "PENDING_INDEPENDENT_EDITOR",
                "reviewShape": "PENDING_INDEPENDENT_EDITOR",
                "reviewRhythmicSign": "PENDING_INDEPENDENT_EDITOR",
                "sourceApproved": False
            })

    if [row["ordinal"] for row in index] != list(range(1, 45)):
        raise ValueError("Visual ordinal discontinuity")

    package = {
        "schema": "ao-schola-m51-original-print-editor-review-package-v1",
        "status": "RESEARCH_EVIDENCE_ONLY_NOT_MUSICAL_CERTIFICATION",
        "sourceEdition": "Graduale Romanum (Solesmes), 1961, folio 57*",
        "sourcePdfPage": 59,
        "originalPdfSha256": mapped["provenance"]["originalPdfSha256"],
        "sourceFingerprint": ledger["sourceFingerprint"],
        "scoreApproved": False,
        "authenticRhythmicTimingCertified": False,
        "neumeMicropographyCertified": False,
        "printedSourceScansInPublicApp": False,
        "printReviewSheets": sheet_manifest,
        "noteReview": index,
        "instructions": [
            "Compare every red outline against the ORIGINAL 1961 engraving, not the Exsurge render.",
            "Verify 44 distinct printed noteheads and each staff degree independently.",
            "For compound neumes, assess attachment, descending diamonds, and any missing notehead.",
            "Check punctum mora candidates 10/18/28/44 and horizontal episema candidates 8/26.",
            "Record discrepancies in separate adjudication; do not set approved merely because code checks pass.",
            "Keep these original print images in the short-retention Actions artifact only."
        ],
    }
    (args.output / "editorial-review-index.json").write_text(
        json.dumps(package, indent=2) + "\n", encoding="utf-8")
    (args.output / "README.txt").write_text(
        "Kyrie XVIII — M51 1961 source review\n"
        "Research-only, NOT musical certification. Two original-print overlays "
        "mark all 44 hypothesised noteheads. The editorial-review-index.json "
        "identifies provisional positions and source-model pitches; all "
        "independent editor verdicts remain PENDING. Do not copy the source "
        "scan or overlays to the public GitHub Pages asset tree.\n", encoding="utf-8")
    print("M51_EDITORIAL_REVIEW_PACKAGE",
          json.dumps({"sourceNotes": len(index),
                      "sheets": [s["overlayName"] for s in sheet_manifest],
                      "approved": False}))


if __name__ == "__main__":
    main()
