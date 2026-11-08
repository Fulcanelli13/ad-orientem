#!/usr/bin/env python3
"""Reproducible research-only full-frame WebP derivatives from authenticated
Cleveland/Met originals. Never edits public gallery or application modules.
"""
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageCms, ImageOps

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/"data/artwork/batch1-two-mobile-staging.v1.json"
ORIGINALS=ROOT/"artifacts/sacred-art-firstparty-batch1"

def main():
    manifest=json.loads(MANIFEST.read_text(encoding="utf8"))
    assert manifest["no_publication"] is True
    assert manifest["explicit_owner_photo_approval"] is False
    assert manifest["actual_app_assignments_changed"]==0
    assert len(manifest["items"])==2
    assert manifest["derivative_rule"]=="PRESERVE_FULL_PAINTED_FRAME_WITH_NO_CROP"
    output=ROOT/manifest["output_folder"]
    checked=[]
    for row in manifest["items"]:
        photo_path=ORIGINALS/row["file"]
        if not photo_path.is_file():raise RuntimeError("Missing first-party original "+str(photo_path))
        content=photo_path.read_bytes()
        sha=hashlib.sha256(content).hexdigest()
        if sha!=row["source_sha256"]:raise RuntimeError("Museum source SHA256 changed: "+row["id"])
        with Image.open(io.BytesIO(content)) as img:img.verify()
        with Image.open(io.BytesIO(content)) as img:dims=list(img.size)
        if dims!=row["original_dimensions_px"]:raise RuntimeError("Museum source dimensions changed: "+row["id"])
        if row["source_rights"] not in ("CMA_SHARE_LICENSE_CC0","MET_IS_PUBLIC_DOMAIN_TRUE"):
            raise RuntimeError("Official public-domain/open-access photo rights not established")
        if row["publication_approved"] or row["user_selected_this_photographic_version"]:
            raise RuntimeError("Research cannot grant photo owner approval")
        checked.append((row,content))
    output.mkdir(parents=True,exist_ok=True)
    results=[]
    for row,source in checked:
        with Image.open(io.BytesIO(source)) as original:
            photo=ImageOps.exif_transpose(original)
            icc=photo.info.get("icc_profile")
            if icc:
                src=ImageCms.ImageCmsProfile(io.BytesIO(icc))
                photo=ImageCms.profileToProfile(photo,src,ImageCms.createProfile("sRGB"),outputMode="RGB")
            else:photo=photo.convert("RGB")
            original_size=list(photo.size)
            photo.thumbnail(tuple(manifest["target_maximum_dimensions_px"]),Image.Resampling.LANCZOS)
            staged_size=list(photo.size)
            if abs(staged_size[0]/staged_size[1]-original_size[0]/original_size[1])>0.001:
                raise RuntimeError("Original image framing was changed")
            target=output/row["derivative"]
            photo.save(target,"WEBP",quality=89,method=6,exact=True)
        staged=target.read_bytes()
        with Image.open(io.BytesIO(staged)) as check:check.verify()
        results.append({
            "id":row["id"],"title":row["title"],"museum":row["museum"],"inventory":row["inventory"],
            "source_sha256":row["source_sha256"],
            "image_path":str(target.relative_to(ROOT)),
            "webp_sha256":hashlib.sha256(staged).hexdigest(),"webp_bytes":len(staged),
            "original_size":original_size,"staged_size":staged_size,
            "full_frame_preserved":True,"crop_applied":False,"icc_to_srgb":bool(icc),
            "release_approved":False,"owner_photo_selected":False,
            "status":"STAGED_RESEARCH_BRANCH_ONLY_NOT_APP_OR_PAGES"
        })
    result={
        "schema":"AO_SACRED_ART_BATCH1_TWO_MUSEUM_MOBILE_STAGING_RESULT_V1",
        "source":"data/artwork/batch1-two-mobile-staging.v1.json",
        "publication_approved":False,"release_count":0,"paintings":results,
        "scope":"Research-branch media staging excluded from allowlisted GitHub Pages output"
    }
    file=ROOT/"data/artwork/batch1-two-mobile-staging-output.v1.json"
    file.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps(result,indent=2,ensure_ascii=False),flush=True)

if __name__=="__main__":main()
