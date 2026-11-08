#!/usr/bin/env python3
"""Inspect exact Ghent Adoration panel candidates, PRIVATE SOURCE-QA ONLY.
No registration, public app updates, or assumptions from Commons metadata.
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
MANIFEST=ROOT/"data/artwork/batch1-ghent-three-exact-panel-candidate-photos.v1.json"
OUT=ROOT/"artifacts/sacred-art-batch1-ghent-panel-review"
Image.MAX_IMAGE_PIXELS=140_000_000

def to_rgb(image):
    im=ImageOps.exif_transpose(image)
    icc=im.info.get("icc_profile")
    if icc:
        return ImageCms.profileToProfile(im,ImageCms.ImageCmsProfile(io.BytesIO(icc)),ImageCms.createProfile("sRGB"),outputMode="RGB")
    return im.convert("RGB")

def sha(data):return hashlib.sha256(data).hexdigest()

def thumb(img,path,name):
    im=to_rgb(img)
    im.thumbnail((1100,850),Image.Resampling.LANCZOS)
    sheet=Image.new("RGB",(1160,950),"#141821")
    sheet.paste(im,((1160-im.width)//2,42+(850-im.height)//2))
    dr=ImageDraw.Draw(sheet)
    dr.text((30,15),name[:120],fill="#f0ede8")
    dr.text((30,919),"UNAPPROVED PHOTO - review only",fill="#d6ba8c")
    sheet.save(path,"JPEG",quality=90,optimize=True)
    return sheet

def contact(previews,dest):
    width=1200*len(previews);height=1110
    output=Image.new("RGB",(width,height),"#0f1520")
    draw=ImageDraw.Draw(output)
    for i,(label,p) in enumerate(previews):
        image=Image.open(p).convert("RGB")
        output.paste(image,(i*1200+20,30))
        draw.text((i*1200+35,1005),label,fill="#f3f1ed")
        draw.text((i*1200+35,1050),"Candidate source · no automatic selection or publication",fill="#d7bc9c")
    output.save(dest,quality=87,optimize=True)

def main():
    m=json.loads(MANIFEST.read_text(encoding="utf8"))
    assert m["counts"]["candidate_photographs"]==3
    assert m["counts"]["new_app_photo_assets"]==0
    assert m["publish"] is False
    assert m["owner_selected_specific_photo"] is False
    assert len(m["candidates"])==3
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    previews=[]
    for candidate in m["candidates"]:
        row={"id":candidate["id"],"source":candidate["source_page"],"source_provenance":candidate["source_provenance"],
             "declared_commons_license_class":candidate["declared_rights"],
             "specific_reuse_permission_established":False,
             "owner_photo_approved":False,"app_publication":False}
        try:
            uri,bits,mime=get_original(candidate["source_filename"],limit=35_000_000)
            if not mime.startswith("image/"):raise ValueError("Not an image")
            with Image.open(io.BytesIO(bits)) as image: image.verify()
            with Image.open(io.BytesIO(bits)) as image:
                dims=list(image.size)
                if dims!=candidate["expected_dimensions"]:raise ValueError("Source pixel dimensions mismatch")
                if min(dims)<1200:raise ValueError("Below source-quality threshold")
                review_name=candidate["id"]+"-preview.jpg"
                thumb(image,OUT/review_name,candidate["id"])
            rawfile=OUT/(candidate["id"]+"-exact-original.jpg")
            rawfile.write_bytes(bits)
            row.update({"state":"SOURCE_IMAGE_BYTES_VERIFIED_NOT_APPROVED","source_url":uri,"dimensions":dims,
                       "bytes":len(bits),"sha256":sha(bits),"preview":review_name,
                       "exact_panel_visual_confirmation_pending":True,
                       "restoration_state_confirmation_pending":True})
            previews.append((candidate["id"],OUT/review_name))
        except Exception as ex:
            row.update({"state":"SOURCE_IMAGE_QA_FAILED","error":str(ex)})
        records.append(row)
        print(json.dumps(row,ensure_ascii=False),flush=True)
    if previews:
        contact(previews,OUT/"three-ghent-sources-contact-sheet.jpg")
    result={"schema":"AO_SACRED_ART_BATCH1_GHENT_PANEL_PRIVATE_IMAGE_QA_V1","paintings":1,
            "sources_attempted":3,"source_bytes_verified":len(previews),
            "image_release_approved":0,"app_gallery_modified":False,
            "license_decisions_granted":0,"photograph_selection_granted":0,
            "sources":records,
            "unresolved_huesca":"00029 exact photo only 567x479 in known collection; no invented upscale"}
    (OUT/"run-report.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    (OUT/"NOT_FOR_PUBLICATION.txt").write_text(
         "These exact Ghent source photographs are research candidates, not owner-selected or cleared.\n"
         "Do not publish to Home, Prayer, Calendar, GitHub Pages, or any public image registry.\n"
         "Institutional Art in Flanders material with contractual restrictions was NOT downloaded.\n",encoding="utf8")
    if len(previews)==0:raise SystemExit(1)
    print("FINAL_GHENT_QA "+json.dumps({"verified":len(previews),"unapproved":len(previews)}),flush=True)

if __name__=="__main__":main()
