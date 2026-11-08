#!/usr/bin/env python3
"""Research-only painting-boundary photograph edition of Lanfranco NGI.72.

The selected WGA photograph is immutable. A separate, previously unselected
Sailko CC BY 3.0 photo is rectified to exclude its photographed physical frame.
This is image processing, NOT owner approval or a public app release.
"""
import hashlib
import io
import json
from pathlib import Path
import sys

from PIL import Image, ImageCms, ImageDraw, ImageOps, ImageFile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from batch1_seven_original_photo_qa import get_original

CONFIG=ROOT/"data/artwork/batch1-lanfranco-sailko-frameless-review.v1.json"
Image.MAX_IMAGE_PIXELS=120_000_000
ImageFile.LOAD_TRUNCATED_IMAGES=False

def digest(data):
    return hashlib.sha256(data).hexdigest()

def get_locked_original(title,expected_sha,dimensions):
    url,data,mime=get_original(title,limit=25_000_000)
    if not mime.startswith("image/"):
        raise RuntimeError("Unsupported source MIME "+mime)
    if digest(data)!=expected_sha:
        raise RuntimeError("SOURCE SHA256 FAILURE "+title)
    with Image.open(io.BytesIO(data)) as verify:
        verify.verify()
    with Image.open(io.BytesIO(data)) as image:
        if list(image.size)!=dimensions:
            raise RuntimeError("Source dimensions not locked "+title)
    return url,data

def to_srgb(img):
    img=ImageOps.exif_transpose(img)
    profile=img.info.get("icc_profile")
    if profile:
        return ImageCms.profileToProfile(img,ImageCms.ImageCmsProfile(io.BytesIO(profile)),ImageCms.createProfile("sRGB"),outputMode="RGB"),True
    return img.convert("RGB"),False

def candidate_edition(img,conf):
    t=conf["transformation"]
    if t["method"]!="PIL_QUAD_PERSPECTIVE_CORRECTION_AND_DOWNRES_LANCZOS":
        raise RuntimeError("Unsupported transform")
    width,height=t["quad_native_output_pixels"]
    if t["quad_points_source_pixels_in_order"]!=["upper_left","lower_left","lower_right","upper_right"]:
        raise RuntimeError("Unexpected quad order")
    quad=[v for xy in t["quad_xy"] for v in xy]
    if not all(0<=x<img.width and 0<=y<img.height for x,y in t["quad_xy"]):
        raise RuntimeError("Painting boundary outside original photo")
    corrected=img.transform((width,height),Image.Transform.QUAD,tuple(quad),resample=Image.Resampling.BICUBIC)
    bounds=tuple(t["max_display_dimensions"])
    corrected.thumbnail(bounds,Image.Resampling.LANCZOS)
    if corrected.width>bounds[0] or corrected.height>bounds[1]:
        raise RuntimeError("Display max dimensions exceeded")
    if corrected.width<1200 or corrected.height<750:
        raise RuntimeError("Full painting display resolution insufficient")
    if abs(corrected.width/corrected.height - width/height)>0.002:
        raise RuntimeError("Output image aspect distortion")
    return corrected

def make_contact_sheet(old,framed,edited,path):
    imgs=[(old,"EXISTING WGA — SELECTED"),(framed,"SAILKO ORIGINAL — GILT FRAME"),(edited,"SAILKO EDITION — FRAME EXCLUDED")]
    canvas=Image.new("RGB",(2160,710),"#111922")
    draw=ImageDraw.Draw(canvas)
    for i,(img,name) in enumerate(imgs):
        draw.text((26+i*720,24),name,fill="#f0ede8")
        thumb=ImageOps.contain(img,(670,550),Image.Resampling.LANCZOS)
        canvas.paste(thumb,(26+i*720+(670-thumb.width)//2,70+(550-thumb.height)//2))
        draw.text((26+i*720,640),f"{img.width} x {img.height}",fill="#c5c6ca")
    draw.text((26,677),"UNPUBLISHED REVIEW ONLY · Sailko CC BY 3.0; candidate rectified to exclude physical frame",fill="#d8b685")
    canvas.save(path,quality=89,optimize=True)

def main():
    conf=json.loads(CONFIG.read_text(encoding="utf-8"))
    assert conf["status"]=="RESEARCH_ONLY_PHOTOGRAPH_CANDIDATE_NO_EDITORIAL_APPROVAL"
    assert not conf["owner_approval_for_exact_version"]
    assert not conf["owner_approval_for_display_edition"]
    assert not conf["output"]["pages_publication"]
    assert conf["output"]["new_app_photo_release_count"]==0
    selected=conf["existing_selection_protected"]
    candidate=conf["candidate"]
    assert not candidate["user_selected_this_specific_photo"]

    review_dir=ROOT/conf["output"]["private_review_artifacts_folder"]
    review_dir.mkdir(parents=True,exist_ok=True)
    old_url,oldbytes=get_locked_original(selected["file"],selected["sha256"],selected["image_pixels"])
    candidate_url,newbytes=get_locked_original(candidate["source_file_title"],candidate["source_sha256"],candidate["original_pixels"])

    with Image.open(io.BytesIO(oldbytes)) as old_image:
        old_srgb,_=to_srgb(old_image)
    with Image.open(io.BytesIO(newbytes)) as new_image:
        framed,icc_converted=to_srgb(new_image)
    edited=candidate_edition(framed,conf)
    staged_path=ROOT/conf["output"]["candidate_file"]
    staged_path.parent.mkdir(parents=True,exist_ok=True)
    edited.save(staged_path,format="WEBP",quality=89,method=6)
    with Image.open(staged_path) as verify:
        verify.verify()
    with Image.open(staged_path) as check:
        if check.size!=edited.size:
            raise RuntimeError("Staged edition was not exact")
    # Retain private source originals in short-lived workflow artifacts, not app.
    (review_dir/"current-wga-original.jpg").write_bytes(oldbytes)
    (review_dir/"sailko-original-with-frame.jpg").write_bytes(newbytes)
    edited.save(review_dir/"sailko-painting-only-review.jpg",format="JPEG",quality=91,optimize=True)
    make_contact_sheet(old_srgb,framed,edited,review_dir/"frameless-contact-sheet.jpg")
    raw=staged_path.read_bytes()
    report={
        "schema":"AO_SACRED_ART_BATCH1_LANFRANCO_FRAMELESS_PHOTO_QA_RESULT_V1",
        "painting":"Lanfranco The Miracle of the Loaves and Fishes NGI.72",
        "source_selection_preserved":True,
        "current_selected_image_sha256":digest(oldbytes),"current_image_source":old_url,
        "candidate_photo_source_sha256":digest(newbytes),"candidate_image_source":candidate_url,
        "quad_xy":conf["transformation"]["quad_xy"],
        "quad_native_output_pixels":conf["transformation"]["quad_native_output_pixels"],
        "painting_only_size_pixels":list(edited.size),
        "webp_bytes":len(raw),"webp_sha256":digest(raw),
        "webp_stage_path":conf["output"]["candidate_file"],
        "icc_profile_to_srgb_converted":icc_converted,
        "physical_frame_excluded":True,
        "painting_edge_bounds_need_final_visual_signoff":True,
        "generative_edits":False,
        "new_edition_framing":"PERSPECTIVE_RECTIFIED_PAINTED_AREA",
        "source_photo_license":"CC BY 3.0 Unported",
        "source_photo_credit":candidate["attribution"],
        "license_url":candidate["license_url"],
        "app_photo_released":False,"owner_exact_photo_approval":False,
        "owner_frameless_edition_approval":False,
        "app_asset_registry_modified":False,
        "result":"PRIVATE_RESEARCH_REVIEW_READY_NOT_APPROVED"
    }
    report_path=ROOT/conf["output"]["report_file"]
    report_path.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (review_dir/"run-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("PASS_FRAMELESS_LANFRANCO_PRIVATE_ONLY "+json.dumps(report),flush=True)

if __name__=="__main__":
    main()
