#!/usr/bin/env python3
"""Private, exact-object comparison of the original selected Lanfranco image and
Sailko's independent CC BY 3.0 photograph. Never grants photo approval or
changes public app. Reuses the bounded Wikimedia downloader and respects 429.
"""
import hashlib
import io
import json
from pathlib import Path
import sys
from PIL import Image, ImageOps, ImageDraw, ImageCms

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path(__file__).resolve().parent))
from batch1_seven_original_photo_qa import get_original

MANIFEST=ROOT/"data/artwork/batch1-lanfranco-sailko-photo-candidate.v1.json"

def decode_image(data):
    with Image.open(io.BytesIO(data)) as img:
        img.verify()
    with Image.open(io.BytesIO(data)) as img:
        return ImageOps.exif_transpose(img).copy()

def s_rgb(img):
    profile=img.info.get("icc_profile")
    if profile:
        try:
            return ImageCms.profileToProfile(img,ImageCms.ImageCmsProfile(io.BytesIO(profile)),ImageCms.createProfile("sRGB"),outputMode="RGB")
        except Exception as e:
            raise RuntimeError("Cannot preserve source colour fidelity: "+str(e)) from e
    return img.convert("RGB")

def sha256(data):return hashlib.sha256(data).hexdigest()

def draw_comparison(old,new,path):
    w,h=1780,1040
    canvas=Image.new("RGB",(w,h),"#10151b")
    draw=ImageDraw.Draw(canvas)
    for i,(img,title) in enumerate([(old,"CURRENT USER-SELECTION (WGA)"),(new,"Sailko CANDIDATE (NOT APPROVED)")]):
        target=ImageOps.contain(s_rgb(img),(824,780),Image.Resampling.LANCZOS)
        left=40+i*890+(824-target.width)//2
        top=105+(780-target.height)//2
        canvas.paste(target,(left,top))
        draw.text((40+i*890,44),title,fill="#f5f1e9")
        draw.text((40+i*890,928),f"Original dimensions: {img.width} x {img.height}",fill="#d8d6cf")
    draw.text((40,983),"Same NGI.72 painting. Different photographic edition / framing. Replacement requires owner approval.",fill="#dfb77b")
    canvas.save(path,quality=91,optimize=True)

def main():
    m=json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert m["qa_policy"]["publication_forbidden"] is True
    assert m["qa_policy"]["staging_in_app"] is False
    assert m["qa_policy"]["commit_binary_to_app"] is False
    assert m["proposed"]["userPhotoHandpicked"] is False
    assert m["proposed"]["userPhotoReplacementApproved"] is False
    assert m["promotion_gate"]["original_selection_must_remain_until_approval"] is True
    output=ROOT/m["qa_policy"]["output"]
    output.mkdir(parents=True,exist_ok=True)

    evidence={}
    for k in ("existing","proposed"):
        photo=m[k]
        file_title=photo["commonsTitle"]
        url,data,mime=get_original(file_title,limit=m["qa_policy"]["max_bytes"])
        img=decode_image(data)
        width,height=img.size
        if k=="existing":
            if [width,height]!=photo["expected_dimensions_px"] or sha256(data)!=photo["expected_sha256"]:
                raise RuntimeError("Selected user WGA photograph has changed, abort")
        else:
            if [width,height]!=photo["originalPixelsReported"]:
                raise RuntimeError("New independent photograph dimensions changed")
            if min(width,height)<m["qa_policy"]["short_side_min_px"]:
                raise RuntimeError("Candidate under minimum resolution")
        (output/("current-selected" if k=="existing" else "sailko-candidate")+".jpg").write_bytes(data)
        evidence[k]={"file_title":file_title,"download_url":url,"mime":mime,
                     "pixels":[width,height],"sha256":sha256(data),"bytes":len(data)}
        print(k,":",evidence[k],flush=True)
        if k=="existing":old=img
        else:new=img

    old_ratio=old.width/old.height
    new_ratio=new.width/new.height
    aspect_difference=abs(new_ratio/old_ratio-1)
    if aspect_difference>m["qa_policy"]["aspect_diff_max_fraction"]:
        raise RuntimeError("Photographic aspect differs too substantially, manual object comparison required")

    draw_comparison(old,new,output/"comparison-contact-sheet.jpg")
    photo=s_rgb(new)
    photo.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    derivative=output/"sailko-fullscene-1600.webp"
    photo.save(derivative,"WEBP",quality=89,method=6)
    with Image.open(derivative) as chk:
        chk.verify()
    evidence["candidate_webp"]={"relative_file":"sailko-fullscene-1600.webp",
                                "pixels":list(photo.size),
                                "sha256":sha256(derivative.read_bytes()),
                                "bytes":derivative.stat().st_size,
                                "full_frame":True,"crop_applied":False}
    evidence["aspect_ratio_relative_difference"]=round(aspect_difference,5)
    evidence["same_painting_basis"]={"institutional_inventory":m["painting"]["inventory"],
                  "museum_object_url":m["painting"]["objectURL"],
                  "manual_composition_review_required":True}
    evidence["source_license"]=m["proposed"]["sourceLicense"]
    evidence["source_license_url"]=m["proposed"]["licenseURI"]
    evidence["photographer"]=m["proposed"]["photographer"]
    evidence["mandatory_credit"]=m["qa_policy"]["source_photo_credit"]
    evidence["editorial_approval"]=False
    evidence["photo_replacement_approved"]=False
    evidence["app_asset_published"]=False
    evidence["state"]="EXACT_SOURCE_BYTES_QA_PASS_PRIVATE_REVIEW_ONLY"
    (output/"run-report.json").write_text(json.dumps(evidence,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (output/"README.txt").write_text(
        "Research photos: current selected image vs UNAPPROVED new Sailko image.\n"
        "Sailko image CC BY 3.0; photographer credit and adapted edition notice required.\n"
        "Download, dimensions and hashes validated, but publication requires approval.\n",encoding="utf-8")
    print("PASS_PRIVATE_COMPARISON",evidence["candidate_webp"],flush=True)

if __name__=="__main__":main()
