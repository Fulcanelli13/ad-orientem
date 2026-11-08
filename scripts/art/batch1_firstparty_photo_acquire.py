#!/usr/bin/env python3
"""Download and verify two official museum CC0 images to PRIVATE review artifacts.
This script may never modify public app assets or its release registry.
"""
import hashlib
import io
import json
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from PIL import Image, ImageOps, ImageDraw, ImageFile

Image.MAX_IMAGE_PIXELS = 120_000_000
ImageFile.LOAD_TRUNCATED_IMAGES = False
ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data/artwork/batch1-two-firstparty-photo-stage.v1.json"
OUT = ROOT / "artifacts/sacred-art-firstparty-batch1"
USER_AGENT = "AdOrientemResearch/1.0 (GitHub: Fulcanelli13/ad-orientem; photo source quality review only)"

def fetch(url, max_size=60_000_000):
    request=Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json,image/jpeg,image/*;q=0.9"})
    with urlopen(request,timeout=50) as response:
        last=urlsplit(response.url)
        if last.scheme!="https":
            raise RuntimeError("Only HTTPS source files accepted")
        content_type=response.headers.get("Content-Type","")
        data=response.read(max_size+1)
        if len(data)>max_size:
            raise RuntimeError("Download exceeds size limit")
        return data,content_type,response.url

def get_museum_metadata(row):
    data,ctype,url=fetch(row["api_url"],max_size=5_000_000)
    if not ctype.startswith("application/json"):
        raise RuntimeError("API metadata was not JSON: "+ctype)
    doc=json.loads(data)
    if row["museum"]=="Cleveland Museum of Art":
        d=doc.get("data")
        if not isinstance(d,dict) or d.get("accession_number")!=row["inventory"]:
            raise RuntimeError("Cleveland accession identity mismatch")
        if d.get("share_license_status")!="CC0":
            raise RuntimeError("Cleveland selected object image is not labelled CC0")
        if "crucifixion" not in d.get("title","").lower():
            raise RuntimeError("Cleveland artwork title mismatch")
        images=d.get("images") or {}
        image=(images.get("print") or images.get("web") or {}).get("url")
        if not image:
            raise RuntimeError("Cleveland CC0 object lacks public photo")
        accepted_hosts={"openaccess-cdn.clevelandart.org"}
        return d,image,accepted_hosts
    else:
        d=doc
        if d.get("objectID")!=row["museum_object_id"] or d.get("accessionNumber")!=row["inventory"]:
            raise RuntimeError("Met accession/object identity mismatch")
        if d.get("isPublicDomain") is not True:
            raise RuntimeError("The Met object is not classified public domain")
        if "teresa" not in d.get("title","").lower() or "purgatory" not in d.get("title","").lower():
            raise RuntimeError("Met title does not match expected painting")
        image=d.get("primaryImage")
        if not image:
            raise RuntimeError("Met public-domain original photograph URL missing")
        accepted_hosts={"images.metmuseum.org"}
        return d,image,accepted_hosts

def make_preview(path, image, info):
    Image.MAX_IMAGE_PIXELS=120_000_000
    source=ImageOps.exif_transpose(image).convert("RGB")
    thumb=ImageOps.contain(source,(950,1050))
    canvas=Image.new("RGB",(1024,1200),"#11171e")
    ox=(1024-thumb.width)//2
    canvas.paste(thumb,(ox,52))
    draw=ImageDraw.Draw(canvas)
    draw.text((36,20),info["museum"]+" / "+info["inventory"],fill="white")
    draw.text((36,1110),info["title"][:100],fill="white")
    draw.text((36,1144),"Photo review only - attribution verification / explicit approval pending",fill="#c9c9c9")
    canvas.save(path,quality=90,optimize=True)

def main():
    manifest=json.loads(SOURCE.read_text(encoding="utf-8"))
    assert manifest["counted"]["candidate_physical_paintings"]==2
    assert manifest["counted"]["photographs_approved"]==0
    assert manifest["counted"]["paintings_newly_released"]==0
    assert manifest["rules"]["auto_release"] is False
    assert manifest["rules"]["auto_owner_photo_selection"] is False
    OUT.mkdir(parents=True,exist_ok=True)
    results=[]
    for row in manifest["items"]:
        record={
            "id":row["id"],"source":row["sourcePage"],"museum":row["museum"],
            "expected_inventory":row["inventory"],"prayer_slot_count":row["expected_existing_prayer_position_count"],
            "image_release_approved":False,"editorial_approval":False,
            "photographer_source_image_not_replaced":True,
        }
        try:
            meta,image_url,allowed=get_museum_metadata(row)
            if urlsplit(image_url).scheme!="https" or urlsplit(image_url).netloc not in allowed:
                raise RuntimeError("Museum image URL not from approved first-party image host")
            original,ctype,final_url=fetch(image_url,max_size=row["max_download_bytes"])
            if urlsplit(final_url).netloc not in allowed:
                raise RuntimeError("Image redirect left official source host")
            if not ctype.startswith("image/"):
                raise RuntimeError("Image bytes served as non-image "+ctype)
            with Image.open(io.BytesIO(original)) as probe:
                probe.verify()
            with Image.open(io.BytesIO(original)) as img:
                width,height=img.size
                if min(width,height)<1200:
                    raise RuntimeError("Official photograph short-side below 1200px target")
                make_preview(OUT/(row["id"].replace(":","_")+".jpg"),img,row)
            imgpath=OUT/(row["id"].replace(":","_")+"-official-original.jpg")
            imgpath.write_bytes(original)
            details={
                "museum_title":meta.get("title"),"museum_artist_statement":
                    (meta.get("creators") if row["museum"]=="Cleveland Museum of Art" else meta.get("artistDisplayName")),
                "museum_attribution_used":row["institutional_artist"],
                "api_url":row["api_url"],"image_url":final_url,
                "width":width,"height":height,"bytes":len(original),
                "sha256":hashlib.sha256(original).hexdigest(),
                "specific_official_image_rights":row["expected_api_photo_rights"],
                "photo_review_preview_path":(row["id"].replace(":","_")+".jpg"),
                "state":"SOURCE_BYTES_CERTIFIED_REVIEW_ONLY",
            }
            record.update(details)
            (OUT/(row["id"].replace(":","_")+"-museum-metadata.json")).write_text(
                json.dumps(meta,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
        except Exception as exc:
            record["state"]="FAILED_SOURCE_QA"
            record["error"]=str(exc)
        results.append(record)
        print(json.dumps(record,ensure_ascii=False),flush=True)
    report={
        "schema":"AO_SACRED_ART_BATCH1_FIRSTPARTY_SOURCE_QA_RESULT_V1",
        "source_sha":"GitHub Actions run-specific checkout; see workflow provenance",
        "release_count":0,"editorial_approvals":0,
        "photo_source_checks":results,
    }
    (OUT/"run-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (OUT/"PRIVATE_REVIEW_ONLY.txt").write_text(
        "These photographs remain for private visual review only. They are NOT newly approved, "
        "not part of the curated gallery, and not deployed to public GitHub Pages.\n"
        "Museum source and institutional artist attribution recorded in run-report.json.\n",
        encoding="utf-8")
    if not all(r["state"]=="SOURCE_BYTES_CERTIFIED_REVIEW_ONLY" for r in results):
        raise SystemExit(1)

if __name__=="__main__":
    main()
