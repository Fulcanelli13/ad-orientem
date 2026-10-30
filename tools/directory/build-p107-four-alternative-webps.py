#!/usr/bin/env python3
"""P107: retrieve four *exact* hash-pinned Wikimedia Commons JPEGs for editorial QA.
This is research-stage only. No approved-place-media mutation; no automatic rights approval.
"""
import hashlib
import io
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
from PIL import Image, ImageDraw, ImageOps

ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/directory/research/p107-four-commons-original-alternatives.v1.json"
OUT=ROOT/"data/directory/research/p107-four-webp-stage-audit.v1.json"
ORIGINALS=ROOT/"docs/research/directory/p107-alternative-originals-20261030"
STAGED=ROOT/"assets/staged/directory-p107"
REVIEW=ROOT/"docs/research/directory/p107-four-alternatives-contact-sheet.jpg"
USER_AGENT="AdOrientemPhotoVerification/1.0 (open source church-site imagery provenance; see github.com/Fulcanelli13/ad-orientem)"
MAX_EDGE=1400

def h(x, algo="sha256"): return hashlib.new(algo,x).hexdigest()

def source_urls(filename):
    canonical=filename.replace(" ","_")
    md5=hashlib.md5(canonical.encode("utf-8")).hexdigest()
    encoded=urllib.parse.quote(canonical,safe="")
    return [
       f"https://upload.wikimedia.org/wikipedia/commons/{md5[0]}/{md5[:2]}/{encoded}",
       "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encoded
    ]

def retrieve(original):
    failures=[]
    for url in source_urls(original["filename"]):
        try:
            req=urllib.request.Request(url,headers={
                "User-Agent":USER_AGENT,"Accept":"image/jpeg,image/*;q=0.8",
                "Referer":"https://commons.wikimedia.org/"
            })
            with urllib.request.urlopen(req,timeout=80) as response:
                content=response.read(25_000_001)
            if len(content)>25_000_000: raise ValueError("Source too large (>25MB)")
            if h(content,"sha1")!=original["source_sha1"]:
                raise ValueError("Commons file bytes differ from SHA1 pinned on source page")
            if len(content)!=original["source_bytes"]:
                raise ValueError("Commons source file length differs from pinned size")
            return content,url
        except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as exc:
            failures.append(str(exc))
    raise ValueError("Cannot acquire exact Commons original: "+" | ".join(failures))

def main():
    manifest=json.loads(INPUT.read_text(encoding="utf-8"))
    if manifest["schema"]!="AO_P107_FOUR_PINNED_COMMONS_ALTERNATIVE_ORIGINALS_V1":
        raise ValueError("Unexpected P107 source schema")
    rows=manifest["records"]
    if len(rows)!=4 or {x["row"] for x in rows}!={309,315,320,322}:
        raise ValueError("Unexpected photo shortlist: do not widen automated image intake")
    selected=[x for x in rows if x.get("selected_for_native_acquisition") is True]
    if len(selected)!=1 or selected[0]["row"]!=309:
        raise ValueError("Only visually screened Jihlava alternative is eligible for download")
    ORIGINALS.mkdir(parents=True,exist_ok=True)
    STAGED.mkdir(parents=True,exist_ok=True)
    REC=[]
    previews=[]
    for item in selected:
        raw,origin=retrieve(item)
        with Image.open(io.BytesIO(raw)) as im:
            if im.format!="JPEG" or im.size!=(item["width"],item["height"]):
                raise ValueError("Native image dimensions or type mismatched "+item["filename"])
            im.load()
            img=ImageOps.exif_transpose(im)
            if img.mode!="RGB": img=img.convert("RGB")
            img.thumbnail((MAX_EDGE,MAX_EDGE),Image.Resampling.LANCZOS)
            derivative=io.BytesIO()
            img.save(derivative,format="WEBP",quality=85,method=6,exif=b"")
            webp=derivative.getvalue()
        with Image.open(io.BytesIO(webp)) as verified:
            verified.load()
            if verified.format!="WEBP" or verified.size!=img.size:
                raise ValueError("Staged WebP cannot be decoded or resized incorrectly")
        original_path=ORIGINALS/(str(item["row"])+"-alternate-original.jpg")
        stage_path=STAGED/(str(item["row"])+"-alternate-full-frame.webp")
        if original_path.exists() and original_path.read_bytes()!=raw:
            raise ValueError("Do not overwrite a different archived original")
        if stage_path.exists() and stage_path.read_bytes()!=webp:
            raise ValueError("Do not overwrite a different staged derivative")
        original_path.write_bytes(raw)
        stage_path.write_bytes(webp)
        if not (0.995<=img.width/img.height/(item["width"]/item["height"])<=1.005):
            raise ValueError("Aspect ratio changed: hidden crop or distortion")
        if len(webp)>=2_000_000:
            raise ValueError("Mobile WebP exceeds 2MB")
        previews.append((item["row"],img))
        REC.append({
          "row":item["row"],"place_id":item["place_id"],
          "source_url":item["source_page"],"exact_download_url":origin,
          "photographer":item["creator"],"license":item["license"],"license_url":item["license_url"],
          "original_path":str(original_path.relative_to(ROOT)),
          "original_sha1_verified":h(raw,"sha1"),
          "original_sha256":h(raw,"sha256"),
          "original_bytes":len(raw),"original_dimensions":[item["width"],item["height"]],
          "staged_path":str(stage_path.relative_to(ROOT)),
          "staged_sha256":h(webp,"sha256"),
          "staged_bytes":len(webp),"staged_dimensions":list(img.size),
          "native_jpeg_decode":True,"no_crop":True,
          "source_licence_verified_on_commons_page":True,
          "visual_editorial_review":"PENDING_INDIVIDUAL_IMAGE_INSPECTION",
          "rights_and_derivative_publication_gate":"PENDING",
          "published":False
        })
    review=Image.new("RGB",(420*len(selected),780),"#171e25")
    draw=ImageDraw.Draw(review)
    for i,(row,img) in enumerate(previews):
        thumb=ImageOps.contain(img,(380,700),Image.Resampling.LANCZOS)
        review.paste(thumb,(420*i+(420-thumb.width)//2,40+(700-thumb.height)//2))
        draw.text((420*i+14,14),str(row)+" / EXACT ORIGINAL / NO CROP",fill="white")
    REVIEW.parent.mkdir(parents=True,exist_ok=True)
    review.save(REVIEW,format="JPEG",quality=90,optimize=True)
    payload={
      "schema":"AO_P107_FOUR_HASH_VERIFIED_ALTERNATIVE_STAGING_V1",
      "status":"RESEARCH_ONLY_NO_APPROVED_PLACE_MEDIA",
      "source":str(INPUT.relative_to(ROOT)),
      "counts":{"originals_sha1_verified":len(selected),"native_decodes":len(selected),
                "uncropped_webps_staged":len(selected),"candidates_screened":len(rows),"editorially_rejected_before_download":len(rows)-len(selected),"media_approved":0,"published":0},
      "contact_sheet":str(REVIEW.relative_to(ROOT)),
      "contact_sheet_sha256":h(REVIEW.read_bytes()),
      "records":REC
    }
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("P107 one selected original hash-verified; three poorer alternatives held, research-stage only")
    for x in REC:
        print(x["row"],x["original_sha1_verified"],x["staged_sha256"],x["staged_dimensions"])

if __name__=="__main__": main()
