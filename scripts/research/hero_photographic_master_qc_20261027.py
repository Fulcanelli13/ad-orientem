#!/usr/bin/env python3
"""Source-byte and non-destructive image-edge inspection for three approved hero originals.

Research branch only. Does NOT approve photographs, select crops, alter originals, or publish art.
Run from the repository root with Pillow 11+ and Git available.
"""
from __future__ import annotations
import hashlib
import io
import json
import os
import subprocess
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image, ImageCms, ImageDraw, ImageFont, ImageOps

OUT = Path("assets/staged/module-hero-photo-evidence-20261027")
SOURCES = [
    {
        "module_id": "angelus",
        "artist": "Philippe de Champaigne",
        "painting": "The Annunciation",
        "branch": "research/module-hero-wave2-20261026",
        "path": "assets/staged/module-hero-wave2/angelus-met.jpg",
        "sha256": "ae59a42e39896646d3d18d4761e04b8ce6fa1d84bfaa9f79bd23f8d72aa95be6",
        "expected_size": (3741, 3658),
        "original_photo_url": "https://images.metmuseum.org/CRDImages/ep/original/DT5656.jpg",
        "object_url": "https://www.metmuseum.org/art/collection/search/438724",
        "rights": "Met Open Access CC0, exact public-domain object; version-specific download still compared separately",
    },
    {
        "module_id": "adoration",
        "artist": "Jean Auguste Dominique Ingres",
        "painting": "The Virgin Adoring the Host",
        "branch": "research/module-hero-museum-photos-20261026",
        "path": "assets/staged/module-hero-masters/adoration.jpg",
        "sha256": "973f73b66952bf34619cc75c6f6bfb38109a8877e95b48655605576c552ad934",
        "expected_size": (3122, 3813),
        "original_photo_url": "https://images.metmuseum.org/CRDImages/ep/original/DP136074.jpg",
        "object_url": "https://www.metmuseum.org/art/collection/search/438434",
        "rights": "Met Open Access CC0, exact public-domain object; external grey border identity remains under review",
    },
    {
        "module_id": "confession",
        "artist": "Bartolomé Esteban Murillo",
        "painting": "The Return of the Prodigal Son",
        "branch": "research/module-hero-museum-photos-20261026",
        "path": "assets/staged/module-hero-masters/confession.jpg",
        "sha256": "b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7",
        "expected_size": (4096, 3712),
        "original_photo_url": "https://api.nga.gov/iiif/676fa96e-ad4e-4209-b985-ae0c15f5d902/full/full/0/default.jpg",
        "object_url": "https://www.nga.gov/artworks/34956-return-prodigal-son",
        "rights": "NGA publicly downloadable public-domain reproduction, accession 1948.12.1",
    },
]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def get_exact_branch_bytes(branch: str, path: str, cache: dict[str, str]) -> bytes:
    if branch not in cache:
        subprocess.run(
            ["git", "fetch", "--no-tags", "--depth=1", "origin", "refs/heads/" + branch],
            check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        cache[branch] = subprocess.check_output(
            ["git", "rev-parse", "FETCH_HEAD"], text=True
        ).strip()
    return subprocess.check_output(["git", "show", cache[branch] + ":" + path])


def compare_current_url(url: str, previous_sha: str) -> dict:
    """Observe—not adopt—public source version. Network failures are factual holds."""
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0 (Ad Orientem free archival source audit)"})
        with urlopen(req, timeout=25) as resp:
            content_type = (resp.headers.get("Content-Type") or "").lower()
            if "image" not in content_type:
                return {"status": "NONIMAGE_RESPONSE", "content_type": content_type}
            raw = resp.read(25000001)
            if len(raw) > 25000000:
                return {"status": "REMOTE_IMAGE_OVER_25MB_NOT_HASHED"}
            observed = sha256(raw)
            return {
                "status": "MATCHING_SOURCE_BYTES" if observed == previous_sha else "REMOTE_SOURCE_BYTES_DIFFER_FROM_ARCHIVE",
                "sha256_current_observed": observed,
                "bytes_current_observed": len(raw),
                "content_type": content_type,
                "never_auto_replace_source": True,
            }
    except Exception as exc:
        return {"status": "REMOTE_COMPARE_UNAVAILABLE", "error_type": type(exc).__name__, "note": str(exc)[:160]}


def srgb_preview(image: Image.Image, icc: bytes | None) -> tuple[Image.Image, str]:
    rgb = ImageOps.exif_transpose(image).convert("RGB")
    if icc:
        try:
            old = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            srgb = ImageCms.createProfile("sRGB")
            rgb = ImageCms.profileToProfile(rgb, old, srgb, outputMode="RGB")
            return rgb, "ICC_CONVERTED_TO_SRGB_FOR_DERIVATIVE_PREVIEW_ONLY"
        except Exception as exc:
            return rgb, "ICC_PRESENT_PREVIEW_CONVERSION_FAILED_" + type(exc).__name__
    return rgb, "UNTAGGED_SOURCE_ASSUMED_SRGB_FOR_PREVIEW_NOT_COLOUR_FIDELITY_PROOF"


def image_evidence(source: dict, data: bytes) -> dict:
    id = source["module_id"]
    with Image.open(io.BytesIO(data)) as original:
        original.load()
        w, h = original.size
        if (w, h) != tuple(source["expected_size"]):
            raise RuntimeError(f"{id}: size mismatch, got {w}x{h}")
        icc = original.info.get("icc_profile")
        exif = original.getexif()
        iso = exif.get(34855)
        preview, transform_note = srgb_preview(original, icc)

    # No frame removal is performed. Inspect corners and edge strips before any crop.
    spots = {
        "top_left": (0, 0, min(512, w), min(512, h)),
        "top_right": (w - min(512, w), 0, w, min(512, h)),
        "bottom_left": (0, h - min(512, h), min(512, w), h),
        "bottom_right": (w - min(512, w), h - min(512, h), w, h),
        "centre": (max(0, (w - 512) // 2), max(0, (h - 512) // 2),
                   min(w, (w + 512) // 2), min(h, (h + 512) // 2)),
    }
    saved = []
    for name, bbox in spots.items():
        tile = preview.crop(bbox)
        output = OUT / (id + "-" + name + "-native-pixels.png")
        tile.save(output, "PNG", optimize=True)
        saved.append({"kind": name, "pixel_bbox": bbox, "path": str(output),
                      "sha256": sha256(output.read_bytes()), "rescaled": False})

    small = preview.copy()
    small.thumbnail((1150, 940), Image.Resampling.LANCZOS)
    poster = Image.new("RGB", (1200, 1060), (235, 232, 225))
    px = (1200 - small.width) // 2
    py = (975 - small.height) // 2
    poster.paste(small, (px, py))
    draw = ImageDraw.Draw(poster)
    draw.text((20, 985), f"{id}: original {w} x {h}; whole painted area not certified", fill=(30, 30, 30))
    draw.text((20, 1008), "RESEARCH PHOTO PREVIEW ONLY — NO FRAME CROPPED, NO APPROVAL", fill=(95, 20, 20))
    poster_path = OUT / (id + "-whole-uncropped-reference.jpg")
    poster.save(poster_path, "JPEG", quality=91, subsampling=0)
    # Only Murillo's currently frameless whole painting may have a non-cropped
    # UI-size derivative at this stage. This is a REVIEW CANDIDATE, not a live asset.
    complete_unframed_candidate = None
    if id == "confession":
        derivative = preview.copy()
        derivative.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        p = OUT / "confession-whole-contain-review-candidate.webp"
        derivative.save(p, "WEBP", quality=94, method=6)
        complete_unframed_candidate = {
            "path": str(p), "sha256": sha256(p.read_bytes()),
            "dimensions": list(derivative.size),
            "painted_area_crop_performed": False,
            "entire_source_painting_retained": True,
            "colour_handling": transform_note,
            "human_approved": False, "app_released": False,
            "use_rule": "object-fit contain; no automatic centre crop",
        }

    # Lightness fractions diagnose crushed/blown possibilities; do not grade painting aesthetics.
    gray = preview.convert("L")
    hist = gray.histogram()
    n = sum(hist)
    fractions = {
        "approx_fraction_luma_0_to_9": round(sum(hist[:10]) / n, 6),
        "approx_fraction_luma_246_to_255": round(sum(hist[246:]) / n, 6),
    }
    return {
        "module_id": id, "artist": source["artist"], "painting": source["painting"],
        "original_branch": source["branch"], "original_repo_path": source["path"],
        "verified_archived_original_sha256": sha256(data),
        "byte_size": len(data), "dimensions": [w, h],
        "icc_embedded": bool(icc), "iso_exif": iso,
        "previews_colour_handling": transform_note, "non_authoritative_luma_diagnostics": fractions,
        "whole_uncropped_reference_path": str(poster_path),
        "whole_uncropped_reference_sha256": sha256(poster_path.read_bytes()),
        "complete_unframed_review_derivative": complete_unframed_candidate,
        "native_pixel_samples": saved,
        "source_file_version_observation": compare_current_url(source["original_photo_url"], sha256(data)),
        "museum_object_record": source["object_url"], "published_rights_witness": source["rights"],
        "authorised_crop_bbox": None, "external_frame_confirmed": False,
        "whole_painting_surface_verified": False,
        "human_master_visual_QA_approved": False,
        "worldwide_distribution_legality_signed_off": False,
        "production_release_authorized": False,
        "status": "SOURCE_BYTES_VERIFIED_NATIVE_PIXEL_QA_EVIDENCE_GENERATED_NOT_HUMAN_APPROVED",
    }


def main() -> None:
    if os.environ.get("GITHUB_ACTIONS") == "true":
        expected_ref = "refs/heads/research/module-hero-pd-masters-20261026"
        if os.environ.get("GITHUB_REF") != expected_ref:
            raise RuntimeError("Unsafe GitHub ref; refusing to write")
    OUT.mkdir(parents=True, exist_ok=True)
    branch_cache = {}
    rows = []
    for s in SOURCES:
        data = get_exact_branch_bytes(s["branch"], s["path"], branch_cache)
        digest = sha256(data)
        if digest != s["sha256"]:
            raise RuntimeError(f"{s['module_id']}: source SHA mismatch, preserve original and fail closed")
        rows.append(image_evidence(s, data))
    assert len(rows) == 3
    report = {
        "schema": "AO_MODULE_HERO_MASTER_3_EXACT_SOURCE_PIXEL_QA_V1",
        "programme": "No-cost, no-contact, research-only photographic investigation",
        "approved_paintings_modified": False, "original_binary_files_modified": False,
        "no_crop_produced": True, "no_rights_hold_overridden": True,
        "method": "Git exact archived bytes verified SHA256; native 512px corner/centre crops plus whole-view proxy; optional source-version request.",
        "number_of_originals_verified": 3,
        "technical_QA_evidence_records": rows,
        "visual_final_acceptances": 0, "licensed_photo_publications": 0,
        "artistic_gate": "Human comparison of actual 100% image and real painted edges remains mandatory",
    }
    (OUT / "three-photo-source-qc.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("Verified exact original source bytes, prepared native-pixel photo QA evidence", len(rows))


if __name__ == "__main__":
    main()
