#!/usr/bin/env python3
"""Research-only frame-boundary and responsive-composition review.

Retains authentic image bytes untouched; validates SHA-256 and source geometry.
The proposed boundaries are VISUAL ESTIMATES from the museum-photo review,
NOT verified painted-surface coordinates and NOT final master approvals.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageCms

CASES = {
    "confession": {
        "root": "museum", "source": "assets/staged/module-hero-masters/confession.jpg",
        "sha256": "b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7",
        "size": (4096, 3712), "accession": "NGA 1948.12.1",
        "proposed_box": (0, 0, 4096, 3712),
        "basis": "All four observed perimeter regions appear to be painting. No artificial frame detected; no crop proposed.",
        "frame_class": "apparently_frame_free_verify_full_perimeter",
        "focal": (0.43, 0.46),
    },
    "angelus": {
        "root": "wave2", "source": "assets/staged/module-hero-wave2/angelus-met.jpg",
        "sha256": "ae59a42e39896646d3d18d4761e04b8ce6fa1d84bfaa9f79bd23f8d72aa95be6",
        "size": (3741, 3658), "accession": "Met 2004.31",
        "proposed_box": (82, 77, 3660, 3590),
        "basis": "Manual estimate from archived whole-image and native corner: omit exposed oak support, retain painted Annunciation. Met painted surface 69.2 x 70.5 cm is only a ratio cross-check.",
        "frame_class": "unpainted_oak_perimeter_visible",
        "museum_painted_ratio_width_over_height": 70.5 / 69.2,
        "focal": (0.53, 0.44),
    },
    "adoration": {
        "root": "museum", "source": "assets/staged/module-hero-masters/adoration.jpg",
        "sha256": "973f73b66952bf34619cc75c6f6bfb38109a8877e95b48655605576c552ad934",
        "size": (3122, 3813), "accession": "Met 2005.186",
        "proposed_box": (82, 73, 3050, 3755),
        "basis": "Conservative estimate removes outer beige support and black photo backdrop but retains painted grey border and bottom inscriptions. Requires detailed inspection on every edge.",
        "frame_class": "outer_support_plus_painted_inner_border",
        "museum_overall_ratio_width_over_height": 32.7 / 40.3,
        "focal": (0.5, 0.43),
    },
}

def display_rgb(original):
    oriented = ImageOps.exif_transpose(original)
    icc = oriented.info.get("icc_profile")
    if icc:
        profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        return ImageCms.profileToProfile(
            oriented.convert("RGB"), profile, ImageCms.createProfile("sRGB"),
            outputMode="RGB"), "source_ICC_to_sRGB_review_only"
    return oriented.convert("RGB"), "UNPROFILED_RGB_NO_CALIBRATION_CLAIM"

def preview(im, maxsize=(1400, 1400)):
    copy = im.copy()
    copy.thumbnail(maxsize, Image.Resampling.LANCZOS)
    return copy

def framed_fit(im, size, mode, center):
    if mode == "contain":
        inner = ImageOps.contain(im, size, Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", size, (27, 27, 27))
        canvas.paste(inner, ((size[0]-inner.width)//2, (size[1]-inner.height)//2))
        return canvas
    return ImageOps.fit(im, size, Image.Resampling.LANCZOS, centering=center)

def contact_sheet(im, cut, box, focus, module):
    previews = [
        ("WHOLE / CONTAIN", framed_fit(im, (320, 360), "contain", focus)),
        ("CANDIDATE / CONTAIN", framed_fit(cut, (320, 360), "contain", focus)),
        ("SQUARE MOSAIC / COVER", framed_fit(cut, (320, 360), "cover", focus)),
        ("PHONE 3:4 / COVER", framed_fit(cut, (320, 360), "cover", focus)),
    ]
    # Third and fourth viewports have different content proportions;
    # keep the output tiles consistently sized in the comparison sheet.
    previews[2] = ("SQUARE MOSAIC / COVER",
                   framed_fit(cut, (320, 320), "cover", focus))
    previews[3] = ("PHONE 3:4 / COVER",
                   framed_fit(cut, (270, 360), "cover", focus))
    canvas = Image.new("RGB", (1400, 450), (25, 25, 25))
    draw = ImageDraw.Draw(canvas)
    draw.text((24, 14), module.upper() + "  |  TENTATIVE RESEARCH CROPS — NOT A PRODUCTION MASTER", fill="white")
    for i, (title, tile) in enumerate(previews):
        x = 20 + i*345
        y = 60
        canvas.paste(tile, (x+(320-tile.width)//2, y))
        draw.text((x+5, 427), title, fill="white")
    return canvas

def run(roots, out):
    out.mkdir(parents=True, exist_ok=True)
    manifest = {
        "scope": "NON_PRODUCTION_REVIEW_ONLY",
        "painted_boundaries_certified": 0,
        "pristine_masters_approved": 0,
        "app_released": 0,
        "note": "Pixel boxes are estimates from photographed source views. Only human inspection may certify exact edges, colour and crop.",
        "paintings": [],
    }
    for name, spec in CASES.items():
        raw_path = roots[spec["root"]] / spec["source"]
        raw = raw_path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest != spec["sha256"]:
            raise ValueError("Immutable museum-photo SHA256 mismatch: " + name)
        with Image.open(io.BytesIO(raw)) as original:
            original.verify()
        with Image.open(io.BytesIO(raw)) as original:
            if original.format not in ("JPEG", "MPO") or original.size != spec["size"]:
                raise ValueError("Wrong authentic source type/dimensions: " + name)
            im, colour = display_rgb(original)
        x0, y0, x1, y1 = spec["proposed_box"]
        if not (0 <= x0 < x1 <= im.width and 0 <= y0 < y1 <= im.height):
            raise ValueError("Candidate box outside source: " + name)
        cut = im.crop((x0, y0, x1, y1))
        painted_ratio = spec.get("museum_painted_ratio_width_over_height")
        if painted_ratio and abs(cut.width / cut.height - painted_ratio) > 0.025:
            raise ValueError("Angelus estimate violates museum physical ratio sanity check")
        basename = name + "-frame-boundary-candidate"
        preview(cut).save(out / (basename + ".jpg"), "JPEG", quality=92)
        overview = preview(im)
        draw = ImageDraw.Draw(overview)
        scale_x, scale_y = overview.width / im.width, overview.height / im.height
        draw.rectangle((round(x0*scale_x),round(y0*scale_y),round((x1-1)*scale_x),round((y1-1)*scale_y)),
                       outline=(250, 218, 88), width=3)
        overview.save(out / (name + "-boundary-overlay.jpg"), "JPEG", quality=92)
        contact_sheet(im, cut, spec["proposed_box"], spec["focal"], name).save(
            out / (name + "-responsive-comparison.jpg"), "JPEG", quality=92)
        record = {
            "module_id": name, "accession": spec["accession"],
            "original_branch_role": spec["root"], "original_path": spec["source"],
            "sha256_verified": digest, "source_dimensions": list(spec["size"]),
            "source_bytes_unchanged": True,
            "proposed_pixel_box_xyxy": list(spec["proposed_box"]),
            "proposed_fraction_box_xyxy": [round(x0/im.width, 6), round(y0/im.height, 6),
                                          round(x1/im.width, 6), round(y1/im.height, 6)],
            "candidate_ratio": round(cut.width/cut.height, 6),
            "painting_boundary_assessment": spec["frame_class"],
            "evidence_and_limitations": spec["basis"],
            "review_colour_note": colour,
            "focal_for_test_only": list(spec["focal"]),
            "boundary_overlay": name + "-boundary-overlay.jpg",
            "candidate_preview": basename + ".jpg",
            "responsive_comparison": name + "-responsive-comparison.jpg",
            "human_edge_signoff": False,
            "colour_signoff": False,
            "responsive_signoff": False,
            "pristine_master_approved": False,
            "app_released": False,
        }
        manifest["paintings"].append(record)
    (out / "frame-review-manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--museum-root", type=Path, required=True)
    ap.add_argument("--wave2-root", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    result = run({"museum": args.museum_root.resolve(),
                  "wave2": args.wave2_root.resolve()}, args.out.resolve())
    print(json.dumps({"research_only": True, "proposals": len(result["paintings"]),
                      "approved": result["pristine_masters_approved"]}))

if __name__ == "__main__":
    main()
