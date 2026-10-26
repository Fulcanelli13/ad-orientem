#!/usr/bin/env python3
"""Visual-fidelity preflight for Ad Orientem's 22 approved artwork masters.

Runs ONLY on locally staged, unchanged image bytes. Builds inspection contact sheets
with full composition and unscaled detail crops, and a JSON technical report. These
diagnostics never constitute visual or legal approval. No AI, auto-enhancement,
auto-crop, network requests, or automatic production promotion.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path

try:
    from PIL import Image, ImageCms, ImageDraw, ImageFont, ImageOps, ImageStat
except ImportError:
    raise SystemExit("Install Pillow with: python -m pip install pillow")

ROOT = Path(__file__).resolve().parents[2]
REGISTER = ROOT / "data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json"
STAGED = ROOT / "assets/staged/module-hero-masters"
REPORTS = ROOT / "assets/staged/module-hero-quality-reviews"

def image_for_review(im, warnings):
    """Transform ONLY the displayed preview to sRGB if embedded ICC is present."""
    im = ImageOps.exif_transpose(im)
    icc = im.info.get("icc_profile")
    if icc:
        try:
            source = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            target = ImageCms.createProfile("sRGB")
            return ImageCms.profileToProfile(im.convert("RGB"), source, target, outputMode="RGB")
        except Exception as exc:
            warnings.append("ICC profile conversion failed; colour preview not verified: " + str(exc))
    else:
        warnings.append("No embedded ICC profile: colour accuracy cannot be inferred")
    return im.convert("RGB")

def render_sheet(im, target, module_id, original_sha256):
    """Unaltered-detail contact sheet; only full-frame thumbnail is downsampled."""
    pad, left_w, detail_w, tile_h = 32, 760, 470, 340
    width, height = pad * 3 + left_w + detail_w, 4 * tile_h + pad * 4
    sheet = Image.new("RGB", (width, height), "#e5e5e5")
    ink = ImageDraw.Draw(sheet)
    x0, y0 = pad, pad + 54
    small = ImageOps.contain(im, (left_w, 1190), Image.Resampling.LANCZOS)
    sheet.paste(small, (x0 + (left_w - small.width) // 2, y0))
    ink.text((pad, 12), module_id + " | ORIGINAL SHA256: " + original_sha256[:20], fill="#202020")
    ink.text((pad, 34), "INSPECTION ONLY - image not production-approved", fill="#a00000")
    w, h = im.size
    sw, sh = min(detail_w, w), min(tile_h - 40, h)
    # These are sample detail positions, NOT approved hero crop coordinates.
    sites = [("Upper-left", 0.27, 0.26), ("Upper-right", .73, .26),
             ("Lower-left", .27, .75), ("Lower-right", .73, .75)]
    for k, (name, xc, yc) in enumerate(sites):
        x = max(0, min(w - sw, round(xc*w - sw/2)))
        y = max(0, min(h - sh, round(yc*h - sh/2)))
        patch = im.crop((x, y, x + sw, y + sh))
        # IMPORTANT: no upscale and no artificial sharpening of detail crop.
        tx, ty = pad*2 + left_w, pad + k*tile_h
        sheet.paste(patch, (tx, ty + 28))
        ink.text((tx, ty + 5), name + "  native pixels: " + str(sw) + "x" + str(sh), fill="#202020")
        ink.text((tx, ty + 30 + sh), "Check texture vs ISO noise, haloes, glare, JPEG blocks", fill="#303030")
    target.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(target, format="PNG")

def inspect(path, module, outdir):
    raw = path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    warnings = []
    with Image.open(io.BytesIO(raw)) as source:
        source.verify()
    with Image.open(io.BytesIO(raw)) as source:
        fmt, w, h = source.format, source.width, source.height
        exif = source.getexif()
        iso = exif.get(34855)
        icc = bool(source.info.get("icc_profile"))
        if fmt not in ("JPEG", "PNG", "TIFF", "WEBP"):
            warnings.append("Nonstandard art master format")
        if min(w,h) < 1400:
            warnings.append("Low source dimension; scrutinize detail at final target size")
        if fmt == "JPEG" and len(raw) < .18 * w * h:
            warnings.append("Low bytes per pixel: investigate possible JPEG detail loss (not definitive)")
        if iso and isinstance(iso, (int, float)) and iso >= 1600:
            warnings.append("High capture ISO, potential luminance/chroma noise: review at 100%")
        preview = image_for_review(source, warnings)
    path_out = outdir / (module + "-inspection.png")
    render_sheet(preview, path_out, module, digest)
    preview_small = ImageOps.contain(preview, (640,640))
    stats = ImageStat.Stat(preview_small)
    return {
        "module_id":module, "file":str(path), "sha256":digest,
        "source_bytes":len(raw), "format":fmt, "width":w, "height":h,
        "embedded_icc":icc, "exif_iso":iso, "preview_RGB_mean":list(map(lambda n:round(n,1), stats.mean)),
        "inspection_sheet":str(path_out), "automated_warnings":warnings,
        "visual_fidelity_verdict":"UNREVIEWED",
        "human_checks":{"exact_artwork":"pending","museum_reference_colour":"pending",
            "dark_pigment_detail":"pending","highlight_detail":"pending",
            "brushwork_not_denoised":"pending","no_compression_or_halos":"pending",
            "no_camera_glare_or_perspective":"pending","full_composition":"pending",
            "mobile_hero_composition":"pending"},
        "legal_release":"BLOCKED", "app_release":"BLOCKED"
    }

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--staged",type=Path,default=STAGED)
    p.add_argument("--output",type=Path,default=REPORTS)
    p.add_argument("--module",action="append",default=[])
    args=p.parse_args()
    doc=json.loads(REGISTER.read_text(encoding="utf-8"))
    entries=[]; absent=[]
    for e in doc["entries"]:
        mod=e["module_id"]
        if args.module and mod not in args.module: continue
        matches=[q for ext in (".jpg",".jpeg",".png",".tif",".tiff",".webp")
                 for q in [args.staged/(mod+ext)] if q.is_file()]
        if len(matches)!=1:
            absent.append({"module_id":mod,"status":"not_staged" if not matches else "ambiguous_multiple_masters"})
            continue
        try:
            entries.append(inspect(matches[0],mod,args.output))
        except Exception as exc:
            absent.append({"module_id":mod,"status":"error","error":str(exc)})
    args.output.mkdir(parents=True,exist_ok=True)
    result={"report_type":"TECHNICAL_PREFLIGHT_ONLY","no_artwork_quality_pass_automatically":True,
            "reviewed_originals":entries,"missing_or_errors":absent}
    (args.output/"visual-preflight.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"inspected":len(entries),"missing":len(absent),
                      "report":str(args.output/"visual-preflight.json")},indent=2))
    return int(any(x["status"]=="error" for x in absent))

if __name__=="__main__":
    raise SystemExit(main())
