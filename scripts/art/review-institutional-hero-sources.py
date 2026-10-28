#!/usr/bin/env python3
"""Non-destructive QA for three museum-open-access Ad Orientem module heroes.

Uses checked-out, immutable research originals from TWO existing branches.
Actual source checksum and geometry must match the register; source failures
fail closed. Outputs *review* images only: no master/signoff or app publication.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageCms

CASES = {
  "confession": {
    "branch_key": "museum",
    "source": "assets/staged/module-hero-masters/confession.jpg",
    "sha256": "b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7",
    "dimensions": (4096, 3712),
    "accession": "NGA 1948.12.1",
    "photo_rights_evidence": "NGA public domain open-access photograph",
    "subjects": {
      "father-face": (.445, .325), "son-face": (.380, .465),
      "embrace-hands": (.380, .525), "foreground-dog": (.512, .824),
      "servants-fabric": (.760, .495), "top-edge": (.550, .020),
    },
  },
  "angelus": {
    "branch_key": "wave2",
    "source": "assets/staged/module-hero-wave2/angelus-met.jpg",
    "sha256": "ae59a42e39896646d3d18d4761e04b8ce6fa1d84bfaa9f79bd23f8d72aa95be6",
    "dimensions": (3741, 3658),
    "accession": "Met 2004.31",
    "photo_rights_evidence": "Met Open Access CC0 photograph",
    "subjects": {
      "mary-face": (.282, .400), "mary-hands": (.334, .495),
      "gabriel-face": (.662, .245), "gabriel-wing": (.860, .190),
      "white-lilies": (.957, .205), "genuine-panel-edge": (.960, .967),
    },
  },
  "adoration": {
    "branch_key": "museum",
    "source": "assets/staged/module-hero-masters/adoration.jpg",
    "sha256": "973f73b66952bf34619cc75c6f6bfb38109a8877e95b48655605576c552ad934",
    "dimensions": (3122, 3813),
    "accession": "Met 2005.186",
    "photo_rights_evidence": "Met Open Access CC0 photograph",
    "subjects": {
      "mary-face": (.507, .334), "communion-host": (.490, .750),
      "left-saint-face": (.200, .332), "right-saint-face": (.791, .323),
      "blue-fabric": (.548, .645), "panel-edge": (.012, .060),
    },
  },
}

def srgb_for_review(image):
    oriented = ImageOps.exif_transpose(image)
    icc = oriented.info.get("icc_profile")
    if icc:
        # Only review derivatives may be colour-managed. Originals are unchanged.
        source_profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        return ImageCms.profileToProfile(
            oriented.convert("RGB"), source_profile,
            ImageCms.createProfile("sRGB"), outputMode="RGB"), "embedded_ICC_to_sRGB"
    return oriented.convert("RGB"), "UNPROFILED_RGB_ASSUMED_NOT_CALIBRATED"

def quality_tiles(roots, output_root, crop_size):
    output_root.mkdir(parents=True, exist_ok=True)
    result = []
    for name, case in CASES.items():
        root = roots[case["branch_key"]]
        source = root / case["source"]
        if not source.is_file():
            raise FileNotFoundError("Preserved museum original missing: " + str(source))
        raw = source.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != case["sha256"]:
            raise ValueError("Source hash differs for " + name)
        with Image.open(io.BytesIO(raw)) as im:
            im.verify()
        with Image.open(io.BytesIO(raw)) as im:
            if im.format not in ("JPEG", "MPO") or im.size != case["dimensions"]:
                raise ValueError("Source image geometry/type mismatch for " + name)
            img, colour_note = srgb_for_review(im)
        width, height = img.size
        overview = img.copy()
        overview.thumbnail((950, 950), Image.Resampling.LANCZOS)
        preview_name = name + "-whole-review.jpg"
        overview.save(output_root / preview_name, "JPEG", quality=92)
        crops = []
        for label, (nx, ny) in case["subjects"].items():
            side = min(crop_size, width, height)
            x = max(0, min(width - side, round(nx * width - side / 2)))
            y = max(0, min(height - side, round(ny * height - side / 2)))
            crop_name = name + "-" + label + "-native.png"
            img.crop((x, y, x + side, y + side)).save(output_root / crop_name, "PNG")
            crops.append({
                "label": label, "normalized_point": [nx, ny],
                "source_rectangle_px": [x, y, side, side], "file": crop_name,
                "native_pixels_not_rescaled": True, "target_validated_by_human": False,
            })
        result.append({
            "module_id": name, "object": case["accession"],
            "original_path": case["source"], "original_branch_role": case["branch_key"],
            "sha256_verified": digest, "dimensions_verified": list(case["dimensions"]),
            "source_bytes": len(raw), "source_format": "JPEG_family",
            "photo_rights_evidence": case["photo_rights_evidence"],
            "review_colour_processing": colour_note,
            "overview": preview_name, "crops": crops,
            "source_original_unmodified": True,
            "identity_provenance_gate": "source_record_verified",
            "frame_and_painted_boundary_gate": "human_review_required",
            "photographic_fidelity_gate": "human_review_required",
            "responsive_crop_gate": "human_review_required",
            "rights_publication_gate": "review_pending",
            "pristine_master_approved": False,
            "app_released": False,
        })
    manifest = {
        "register": "Ad Orientem museum-issued photo original pixel QA",
        "scope": "research review only, not production",
        "source_checks_passed": len(result),
        "pristine_approved": 0, "app_released": 0,
        "method": "unchanged source SHA256; 1:1 target PNG crops; sRGB review derivatives",
        "paintings": result,
    }
    (output_root / "institutional-review-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--museum-root", type=Path, required=True)
    ap.add_argument("--wave2-root", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--crop-pixels", type=int, default=540)
    args = ap.parse_args()
    if not (300 <= args.crop_pixels <= 750):
        raise ValueError("Crop side must be 300–750 original pixels")
    m = quality_tiles(
        {"museum": args.museum_root.resolve(), "wave2": args.wave2_root.resolve()},
        args.out.resolve(), args.crop_pixels,
    )
    print(json.dumps({"originals_verified": m["source_checks_passed"],
                      "human_photo_passes": m["pristine_approved"],
                      "output": str(args.out)}))

if __name__ == "__main__":
    main()
