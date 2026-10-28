#!/usr/bin/env python3
"""Batch 4: 20 frozen Prayer hero originals + 3 B2 photographic candidates.

Photographic evidence is not curatorial certification. Verifies the exact frozen
source bytes, inspects native detail and edge pixels, records non-decisive
instrumental diagnostics, and creates compact labelled review panels.
No source alteration, upscaling, automated crop, paid asset or publication.
"""
from __future__ import annotations
import gc
import hashlib
import io
import json
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

from PIL import Image, ImageCms, ImageDraw, ImageFilter, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json"
B2 = ROOT / "data/research/prayer-sacred-art-b2-reconciled-intake-20261028.v1.json"
OUT = ROOT / "assets/staged/prayer-pristine-bulk-23-photo-inspection-20261028"
OUT.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 46_000_000
MAX_PIXELS = 75_000_000
Image.MAX_IMAGE_PIXELS = MAX_PIXELS
UA = "AdOrientem-Prayer-SacredArt-Native-Bulk-Review/1.0 (GitHub: Fulcanelli13/ad-orientem)"
reg = json.loads(REGISTRY.read_text(encoding="utf-8"))
b2 = json.loads(B2.read_text(encoding="utf-8"))
assert len(reg["primary_artworks"]) == 22
assert len(reg["placement_records"]) == 118
assert len(reg["sections"]) == 31
assert reg["totals"]["pristine_publication_ready"] == 0
assert reg["totals"]["production_activated"] == 0
heroes = [x for x in reg["primary_artworks"] if x["original"]["archived"]]
assert len(heroes) == 20

SUPPLEMENT_KEYS = ("tiepolo-prado-descent", "teniers-agony-antwerp", "vandyck-holy-spirit")
extra = [x for x in b2["records"] if x["case_id"] in SUPPLEMENT_KEYS]
assert len(extra) == 3
assert {x["case_id"] for x in extra} == set(SUPPLEMENT_KEYS)
assert all(x["archived_native"] for x in extra)

ISSUE_ACTIONS = {
    "NO_OBVIOUS_EXTERNAL_FRAME": "FOCAL_DETAIL_COLOUR_RIGHTS_EXAMINATION",
    "TRIM_EXPOSED_SUPPORT": "PRECISE_PAINTED_BOUNDARY_REQUIRED",
    "REMOVE_WHITE_NONART_SURROUND": "NONPAINTED_MARGIN_BOUNDARY_REQUIRED",
    "REPLACE_PHOTOGRAPH_EXTERNAL_FRAME": "REPLACE_BAD_FRAME_GLARE_PHOTOGRAPH",
    "REPLACE_PHOTOGRAPH_GALLERY_INSTALLATION": "REPLACE_GALLERY_INSTALLATION_PHOTOGRAPH",
    "BETTER_NATIVE_DETAIL_REQUESTED": "SHARPER_FAITHFUL_ORIGINAL_REQUIRED",
    "REVIEW_PRINT_POSTER_BOUNDARY": "POSTER_BOUNDARY_AND_REPRODUCTION_RIGHTS_REVIEW",
    "CHECK_ARCHED_PANEL_BOUNDS": "ARCHED_PAINTED_BOUNDARY_REVIEW",
    "CHECK_SUSPECT_RED_CORNER_MARK": "VERIFY_POSSIBLE_OVERPRINT_OR_WATERMARK"
}

def fetch_bytes(ref, path):
    encoded = "/".join(urllib.parse.quote(t, safe="") for t in path.split("/"))
    url = "https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/" + urllib.parse.quote(ref, safe="/") + "/" + encoded
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=65) as response:
        raw = response.read(MAX_BYTES + 1)
    if not raw or len(raw) > MAX_BYTES:
        raise ValueError("SOURCE_EMPTY_OR_EXCEEDS_LIMIT")
    return raw

def source_for_hero(row):
    original = row["original"]
    src = original.get("recovered_location") or original
    ref = src.get("ref") or src.get("git_ref")
    path = src.get("path")
    if not ref or not path:
        raise ValueError("PINNED_SOURCE_REF_OR_PATH_MISSING")
    return fetch_bytes(ref, path), ref, path

def render_rgb(im):
    transposed = ImageOps.exif_transpose(im)
    profile = transposed.info.get("icc_profile")
    if profile:
        try:
            result = ImageCms.profileToProfile(
                transposed.convert("RGB"), ImageCms.ImageCmsProfile(io.BytesIO(profile)),
                ImageCms.createProfile("sRGB"), outputMode="RGB"
            )
            return result, "PREVIEW_EMBEDDED_ICC_TO_SRGB"
        except Exception:
            return transposed.convert("RGB"), "PREVIEW_ICC_CONVERSION_FAILED_SOURCE_UNALTERED"
    return transposed.convert("RGB"), "PREVIEW_UNTAGGED_RGB_NO_COLOUR_CERTIFICATION"

def diagnostic(img):
    # These measurements describe this candidate only; no aesthetic quality
    # or analogue-film/photo-rights conclusions may be derived from them.
    small = img.copy()
    small.thumbnail((800, 800), Image.Resampling.LANCZOS)
    gray = ImageOps.grayscale(small)
    hist = gray.histogram()
    n = max(1, small.width * small.height)
    edges = gray.filter(ImageFilter.FIND_EDGES)
    out = {
        "sampled_analysis_pixels": [small.width, small.height],
        "dark_luma_fraction_0_to_4": round(sum(hist[:5]) / n, 6),
        "light_luma_fraction_251_to_255": round(sum(hist[251:]) / n, 6),
        "edge_filter_variance_heuristic": round(ImageStat.Stat(edges).var[0], 3),
        "metrics_not_photo_certifications": True
    }
    small.close()
    return out

def previews(img):
    thumb = img.copy()
    thumb.thumbnail((215, 278), Image.Resampling.LANCZOS)
    w,h = img.size
    side = min(w,h,310)
    center = img.crop(((w-side)//2,(h-side)//2,(w+side)//2,(h+side)//2))
    corner_side = min(w,h,155)
    corners = [img.crop((x,y,x+corner_side,y+corner_side)) for x,y in (
        (0,0),(w-corner_side,0),(0,h-corner_side),(w-corner_side,h-corner_side))]
    return {"whole": thumb, "center": center, "corners": corners}

def make_sheet(chunk, index):
    card_h = 378
    W=1290
    canv=Image.new("RGB",(W,35+card_h*len(chunk)),(17,20,24))
    draw=ImageDraw.Draw(canv)
    draw.text((12,9),"B4: verified originals, 310px native centres and 155px corners | NO PRISTINE APPROVAL",fill=(236,225,211))
    for j,(record,tile) in enumerate(chunk):
        y=35+j*card_h
        draw.text((14,y+9),record["id"]+"  |  "+record["title"][:80],fill=(239,223,198))
        draw.text((14,y+31),record["review_action"]+" | SHA-256 "+("MATCH" if record["checksum_valid"] else "FAIL"),fill=(174,205,208))
        whole=tile["whole"]
        canv.paste(whole,(18+(215-whole.width)//2,y+60+(278-whole.height)//2))
        draw.text((30,y+345),"ENTIRE SOURCE (SCALED)",fill=(180,184,186))
        center=tile["center"]
        canv.paste(center,(260,y+64))
        draw.text((267,y+350),"CENTRAL NATIVE 310px",fill=(180,184,186))
        for k,crop in enumerate(tile["corners"]):
            x=590+(k%2)*165
            cy=y+62+(k//2)*170
            canv.paste(crop,(x,cy))
        draw.text((598,y+350),"FOUR NATIVE CORNERS",fill=(180,184,186))
        notes=record.get("previous_visual_observation") or record.get("source_photo_observation") or ""
        for ix,line in enumerate([notes[z:z+46] for z in range(0,min(len(notes),138),46)]):
            draw.text((930,y+75+ix*22),line,fill=(220,208,197))
        draw.text((930,y+190),"QUALITY / RIGHTS: HOLD",fill=(239,188,157))
        draw.text((930,y+216),"No auto-crop or tonal edit",fill=(182,187,192))
        draw.text((930,y+242),"Original bytes not modified",fill=(182,187,192))
    path=OUT / ("native-full-center-corners-"+str(index).zfill(2)+".jpg")
    canv.save(path,"JPEG",quality=89,optimize=True,subsampling=0)
    return {"path":str(path.relative_to(ROOT)),"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"cases":[r["id"] for r,_ in chunk]}

rows=[]
review_images=[]
sheets=[]

def add_result(row, raw, expected_sha, expected_pixels, ref, path, action, observation):
    actual_sha=hashlib.sha256(raw).hexdigest()
    if actual_sha != expected_sha:
        raise ValueError("SHA256_MISMATCH")
    with Image.open(io.BytesIO(raw)) as source:
        source.load()
        pixels = list(source.size)
        if pixels != expected_pixels:
            raise ValueError("PIXEL_DIMENSIONS_MISMATCH")
        if source.width * source.height > MAX_PIXELS:
            raise ValueError("PIXEL_LIMIT")
        info = {
            "original_raster_format":source.format,
            "native_mode":source.mode,
            "has_embedded_icc":bool(source.info.get("icc_profile")),
            "exif_tag_count":len(source.getexif()),
            "original_bytes":len(raw)
        }
        rgb, color_state=render_rgb(source)
    try:
        d=diagnostic(rgb)
        p=previews(rgb)
    finally:
        rgb.close()
    record={
        "id":row["id"],"kind":row["kind"],"artist":row["artist"],"title":row["title"],
        "source_ref":ref,"source_path":path,"source_sha256":actual_sha,
        "native_pixels":pixels,"checksum_valid":True,
        "previous_issue_class":row["issue"],"review_action":action,
        "previous_visual_observation":observation,
        "raw_photo_metadata":info,"preview_colour_handling":color_state,
        "nondecisive_raster_diagnostics":d,
        "source_bytes_unmodified":True,
        "colour_fidelity_certified":False,
        "painted_surface_boundaries_certified":False,
        "native_detail_curator_accepted":False,
        "photo_reproduction_rights_certified":False,
        "pristine_certified":False,
        "production_approved":False
    }
    rows.append(record)
    review_images.append((record,p))
    if len(review_images)==4:
        sheets.append(make_sheet(review_images,len(sheets)+1))
        review_images.clear()
        gc.collect()

for hero in heroes:
    issue=hero["quality"]["native_batch_visual_review"]["preliminary_issue_class"]
    key=hero["module_id"]
    row={"id":key,"kind":"PRIMARY_HERO","artist":hero["artist"],"title":hero["title"],"issue":issue}
    try:
        raw,ref,path=source_for_hero(hero)
        add_result(row,raw,hero["original"]["sha256"],hero["original"]["dimensions_px"],ref,path,
            ISSUE_ACTIONS[issue],hero["quality"]["native_batch_visual_review"]["visible_observation"])
        print("PASS ORIGINAL",key,flush=True)
    except Exception as err:
        rows.append({"id":key,"kind":"PRIMARY_HERO","status":"RETRIEVAL_OR_VALIDATION_FAILURE",
             "failure":str(err)[:250],"pristine_certified":False,"production_approved":False})
        print("HOLD ORIGINAL",key,str(err)[:130],flush=True)
    finally:
        raw=None
        gc.collect()

for source in extra:
    key=source["case_id"]
    row={"id":key,"kind":"B2_PHOTO_CANDIDATE","artist":source["artist"],
         "title":source["title"],"issue":source["photographic_assessment"]}
    try:
        raw=Path(ROOT / source["evidence_file"]).read_bytes()
        if len(raw)>MAX_BYTES:
            raise ValueError("SOURCE_EXCEEDS_LIMIT")
        action="CANDIDATE_PAINT_SURFACE_DETAIL_AND_RIGHTS_HOLD"
        if min(source["pixels"])<1800:
            action="CANDIDATE_LIMITED_NATIVE_PIXELS_AND_RIGHTS_HOLD"
        add_result(row,raw,source["source_original_sha256"],source["pixels"],
            "research/prayer-artwork-pristine-registry-bulk-20261028",
            source["evidence_file"],action,source.get("visual_observation") or "")
        print("PASS B2 CANDIDATE",key,flush=True)
    except Exception as err:
        rows.append({"id":key,"kind":"B2_PHOTO_CANDIDATE","status":"RETRIEVAL_OR_VALIDATION_FAILURE",
             "failure":str(err)[:250],"pristine_certified":False,"production_approved":False})
        print("HOLD B2 CANDIDATE",key,str(err)[:130],flush=True)
    finally:
        raw=None
        gc.collect()

if review_images:
    sheets.append(make_sheet(review_images,len(sheets)+1))
    review_images.clear()
summary={
    "schema":"AO_PRAYER_B4_23_ORIGINAL_CENTRE_PIXEL_BULK_AUDIT_V1",
    "date":"2026-10-28",
    "scope":{"frozen_primary_originals":20,"additional_B2_photo_candidates":3,"unarchived_primary_heroes":2},
    "checked_total":len(rows),
    "hash_and_dimensions_verified":sum(r.get("checksum_valid",False) for r in rows),
    "verification_failures":sum(not r.get("checksum_valid",False) for r in rows),
    "review_actions":dict(Counter(r.get("review_action","RETRIEVAL_HOLD") for r in rows)),
    "pristine_certified":0,
    "rights_cleared":0,
    "production_activated":0,
    "cost_eur":0,
    "do_not_equate_sha_or_dpi_with_photo_quality":True,
    "does_not_reopen_editorial_choices":True,
    "no_unapproved_cropping_or_upscaling":True,
    "rows":rows,
    "contact_sheets":sheets
}
(OUT/"batch4-23-photo-source-inspection.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print(json.dumps({k:summary[k] for k in
    ("checked_total","hash_and_dimensions_verified","verification_failures",
     "review_actions","pristine_certified","rights_cleared","production_activated","cost_eur")},sort_keys=True))
if len(rows)!=23 or summary["hash_and_dimensions_verified"]!=23 or len(sheets)!=6:
    raise SystemExit("INCOMPLETE_ORIGINAL_AUDIT_NO_FULL_BATCH_SUCCESS_CLAIM")
