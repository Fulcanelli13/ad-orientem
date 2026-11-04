#!/usr/bin/env python3
"""R29 Sacred Atlas — offline exact-original batch processing.

Never fetches Wikimedia, proxies, mirrors, or any network source. Accepts
previously obtained originals named '<original_sha1>.jpg' in --source-dir.
Every file is verified against the owner's R28 frozen original SHA1 and bytes.
Stages review WebPs outside the repository. --apply adds only individually
rights-cleared exact originals to the canonical approved Place media registry.
"""
from __future__ import annotations
import argparse
import hashlib
import io
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DIR=ROOT/"data/geography"
LOCK=DIR/"research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json"
QA=DIR/"research/sacred-atlas-r28-owner-approved19-release-qa-20261104.v1.json"
REVIEW=DIR/"research/sacred-atlas-r29-selected19-final-rights-checklist-20261104.v1.json"
MEDIA=DIR/"approved-place-media.v1.json"
GALLERY=DIR/"approved-place-gallery.v1.json"
PLACES=DIR/"seed-registry.v1.json"
MAX_BYTES=20_000_000
MAX_PIXELS=40_000_000
MAX_WEBP=1280
REQUIRED=(
 "current_source_license_verified",
 "named_photo_author_verified",
 "current_source_revision_verified",
 "underlying_architecture_artwork_rights_verified",
 "exact_named_place_subject_verified",
 "full_frame_mobile_crop_approved",
 "public_release_approved",
)

def read(path):
    return json.loads(Path(path).read_text(encoding="utf8"))

def digest(b):
    return hashlib.sha256(b).hexdigest()

def is_released(item,photos):
    return any(p["place_id"]==item["place_id"] and p.get("status")=="APPROVED" for p in photos)

def policy_ready(row,gate):
    if (row["place_id"]!=gate.get("place_id") or
        row["original_sha1"]!=gate.get("original_sha1") or
        row["exact_original_file"]!=gate.get("original_title")):return False
    if not all(gate.get(k) is True for k in REQUIRED):return False
    if gate.get("publication_authorized") is not True:return False
    if gate.get("special_issue") and gate.get("special_issue_accepted") is not True:
        return False
    for field in ("reviewer","reviewed_at","evidence_url","rights_evidence_notes","source_revision_id","license_current_url"):
        if not str(gate.get(field) or "").strip():return False
    if not gate["evidence_url"].startswith("https://"):return False
    if not re.fullmatch(r"[0-9]+",str(gate["source_revision_id"])):return False
    if gate["license_current_url"].rstrip("/")!=row["license_url"].rstrip("/"):
        return False
    if len(gate["rights_evidence_notes"].strip())<40:return False
    return True

def load_contract():
    lock=read(LOCK);rights=read(REVIEW);source=read(PLACES);media=read(MEDIA);gallery=read(GALLERY);qa=read(QA)
    assert lock["schema"]=="AO_SACRED_ATLAS_R28_OWNER_APPROVED_19_EXACT_ORIGINALS_V1"
    assert rights["schema"]=="AO_SACRED_ATLAS_R29_APPROVED19_FINAL_RIGHTS_GATE_V1"
    assert lock["source_export_sha256"]==rights["input_export_sha256"]
    assert len(lock["decisions"])==19 and len(rights["rows"])==19
    assert len(source["places"])==530
    assert len(media["items"])>=379 and len(gallery["items"])>=42
    assert len({p["place_id"] for p in media["items"]})==len(media["items"])
    ids={p["place_id"] for p in source["places"]}
    old={q["place_id"]:q for q in qa["rows"]}
    gates={q["place_id"]:q for q in rights["rows"]}
    assert len(gates)==19
    assert len({x["original_sha1"] for x in lock["decisions"]})==19
    blocked={x["place_id"] for x in lock["held_places"]+lock["unreviewed_places"]}
    selected={x["place_id"] for x in lock["decisions"]}
    assert len(blocked)==4 and not selected&blocked
    assert selected<=ids and selected==set(gates)==set(old)
    for row in lock["decisions"]:
        if row["publication_authorized"] or not row["editorial_approval"]:
            raise ValueError("OWNER_EDITORIAL_SOURCE_LOCK_CHANGED")
        q=old[row["place_id"]]
        if q["source_sha1"]!=row["original_sha1"]:
            raise ValueError("SOURCE_QA_SHA1_MISMATCH")
        if not re.fullmatch(r"[0-9a-f]{40}",row["original_sha1"]):
            raise ValueError("INVALID_ORIGINAL_SHA1")
    return lock,rights,source,media,old

def converted(row,raw,expected_dimensions):
    if len(raw)!=row["original_bytes"]:
        raise ValueError("ORIGINAL_BYTE_SIZE_MISMATCH")
    if hashlib.sha1(raw).hexdigest()!=row["original_sha1"]:
        raise ValueError("ORIGINAL_SHA1_MISMATCH")
    if len(raw)>MAX_BYTES or raw[:3]!=b"\xff\xd8\xff":
        raise ValueError("ORIGINAL_JPEG_SIZE_OR_SIGNATURE_UNSAFE")
    from PIL import Image, ImageOps
    Image.MAX_IMAGE_PIXELS=MAX_PIXELS
    with Image.open(io.BytesIO(raw)) as input_image:
        if input_image.format!="JPEG":
            raise ValueError("EXPECTED_JPEG_ORIGINAL")
        width,height=input_image.size
        if width*height>MAX_PIXELS or min(width,height)<650:
            raise ValueError("UNSAFE_ORIGINAL_DIMENSIONS")
        if all(isinstance(n,int) for n in row["pixel_dimensions"]):
            if [width,height]!=row["pixel_dimensions"]:
                raise ValueError("FROZEN_ORIGINAL_DIMENSIONS_MISMATCH")
        elif expected_dimensions and [width,height]!=expected_dimensions:
            raise ValueError("SOURCE_PAGE_DIMENSIONS_MISMATCH")
        original=ImageOps.exif_transpose(input_image)
        preview=original.convert("RGB")
    preview.thumbnail((MAX_WEBP,MAX_WEBP),Image.Resampling.LANCZOS)
    if min(preview.size)<350:
        raise ValueError("REVIEW_PREVIEW_TOO_SMALL")
    buf=io.BytesIO()
    preview.save(buf,format="WEBP",quality=84,method=6)
    webp=buf.getvalue()
    if webp[:4]!=b"RIFF" or webp[8:12]!=b"WEBP":
        raise ValueError("WEBP_OUTPUT_INVALID")
    return webp,list(preview.size)

def make_media(row,gate,webp,dimensions,name):
    license_code=row["license_claim"].replace(" ","-")
    if license_code not in {
       "CC-BY-2.0","CC-BY-2.5","CC-BY-3.0","CC-BY-4.0",
       "CC-BY-SA-2.0","CC-BY-SA-2.5","CC-BY-SA-3.0","CC-BY-SA-4.0"
    }:raise ValueError("UNSUPPORTED_RIGHTS_LICENSE")
    token=hashlib.sha256((row["place_id"]+"\0"+row["exact_original_file"]).encode("utf8")).hexdigest()[:22]
    a="assets/approved/place-media/pf-"+token+".webp"
    w,h=dimensions
    return {
     "place_id":row["place_id"],"status":"APPROVED","asset_path":a,
     "source_url":row["original_commons_page"],"source_sha1":row["original_sha1"],
     "derivative_sha256":digest(webp),"credit":row["source_author"],
     "license":license_code,"license_url":row["license_url"].rstrip("/")+"/",
     "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
     "width":w,"height":h,"orientation":"portrait" if h>w else "landscape",
     "alt_en":"Photograph of "+name,"alt_fr":"Photographie de "+name,
     "changes_en":"Full-frame scaled WebP, EXIF orientation normalized; no crop or recolouring.",
     "changes_fr":"Image entière redimensionnée en WebP, orientation EXIF corrigée ; sans recadrage ni retouche.",
     "reviewed_at":gate["reviewed_at"],
     "review_method":"R28 owner-selected exact file SHA1; R29 independent source, authorship, underlying rights and mobile full-frame review by "+gate["reviewer"]+". Source rev "+str(gate["source_revision_id"])+".",
     "source_place_ref":"R28_OWNER_EXACT_ORIGINAL_20261104"
    }

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source-dir",type=Path,help="Directory of exact original JPEG bytes named <sha1>.jpg")
    p.add_argument("--output-dir",type=Path,help="New private staging directory outside the repository")
    p.add_argument("--apply",action="store_true",help="Explicitly publish only rows with complete documented final rights review")
    args=p.parse_args()
    lock,review,seed,media,qa=load_contract()
    gates={x["place_id"]:x for x in review["rows"]}
    pending=[x for x in lock["decisions"] if not is_released(x,media["items"])]
    ready=[x for x in pending if policy_ready(x,gates[x["place_id"]])]
    if not args.source_dir:
        print(json.dumps({"schema":"AO_R29_OFFLINE_BATCH_READINESS_V1",
           "owner_selections":19,"already_published":19-len(pending),
           "pending":len(pending),"rights_ready":len(ready),
           "missing_rights_reviews":len(pending)-len(ready),
           "original_network_requests":0,"production_registry_modified":False},indent=2))
        if args.apply:raise ValueError("SOURCE_DIR_REQUIRED_FOR_APPLY")
        return
    if not args.output_dir:raise ValueError("OUTPUT_DIR_REQUIRED_FOR_BYTE_STAGING")
    directory=args.source_dir.resolve()
    out=args.output_dir.resolve()
    if not directory.is_dir():raise ValueError("ORIGINAL_SOURCE_DIRECTORY_NOT_FOUND")
    if out==ROOT or ROOT in out.parents:
        raise ValueError("REVIEW_STAGING_MUST_BE_OUTSIDE_PUBLIC_REPOSITORY")
    if out.exists():raise ValueError("REFUSE_OVERWRITE_EXISTING_STAGING_DIR")
    if args.apply and not ready:raise ValueError("NO_INDEPENDENTLY_RIGHTS_CLEARED_SOURCES_FOR_PUBLICATION")
    sites={p["place_id"]:p["name"]["official"] for p in seed["places"]}
    stage=[]
    # Verify all candidate raw bytes before creating output or publishing anything.
    for row in pending:
        rawfile=directory/(row["original_sha1"]+".jpg")
        gate=gates[row["place_id"]]
        if not rawfile.exists():
            if args.apply and policy_ready(row,gate):
                raise ValueError("APPROVED_SOURCE_BYTES_MISSING:"+row["place_id"])
            stage.append({"place_id":row["place_id"],"state":"ORIGINAL_BYTES_NOT_PROVIDED"})
            continue
        if not rawfile.is_file() or rawfile.is_symlink() or rawfile.stat().st_size>MAX_BYTES:
            raise ValueError("UNSAFE_ORIGINAL_FILE")
        source=rawfile.read_bytes()
        q=qa[row["place_id"]]["current_page_observation"]
        expected=q.get("image_dimensions_current_page") if q else None
        webp,dimensions=converted(row,source,expected)
        token=hashlib.sha256((row["place_id"]+"\0"+row["exact_original_file"]).encode("utf8")).hexdigest()[:22]
        rec=make_media(row,gate,webp,dimensions,sites[row["place_id"]]) if policy_ready(row,gate) else None
        stage.append({"place_id":row["place_id"],"state":"READY_FOR_EXPLICIT_RELEASE" if rec else "SOURCE_BYTES_VERIFIED_RIGHTS_REVIEW_PENDING",
          "source_sha1":row["original_sha1"],"candidate_file":"pf-"+token+".webp",
          "webp_sha256":digest(webp),"webp_dimensions":dimensions,
          "public_record":rec,"webp_bytes":webp})
    if args.apply and not any(x.get("public_record") for x in stage):
        raise ValueError("NO_VERIFIED_AND_RIGHTS_CLEARED_SOURCE_BYTES")
    out.mkdir(parents=True)
    report=[]
    for item in stage:
        entry={k:v for k,v in item.items() if k!="webp_bytes"}
        if "webp_bytes" in item:
            (out/item["candidate_file"]).write_bytes(item["webp_bytes"])
            entry.pop("public_record",None)
            entry["review_preview_only"]=not bool(item["public_record"])
        report.append(entry)
    if args.apply:
        records=[x["public_record"] for x in stage if x.get("public_record")]
        names=set()
        for rec in records:
            path=ROOT/rec["asset_path"]
            if path.exists() or rec["place_id"] in names or is_released(rec,media["items"]):
                raise ValueError("PUBLIC_ASSET_PATH_OR_PLACE_COLLISION")
            names.add(rec["place_id"])
        for item in stage:
            rec=item.get("public_record")
            if not rec:continue
            target=ROOT/rec["asset_path"]
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(item["webp_bytes"])
            if digest(target.read_bytes())!=rec["derivative_sha256"]:
                raise ValueError("PUBLISHED_DERIVATIVE_DIGEST_MISMATCH")
            media["items"].append(rec)
        media["items"].sort(key=lambda x:x["place_id"])
        v=media["version"].split(".")
        if len(v)!=3 or not all(x.isdigit() for x in v):raise ValueError("INVALID_MEDIA_VERSION")
        media["version"]=".".join([v[0],v[1],str(int(v[2])+1)])
        # Atomic registry write, performed after binary validation.
        with tempfile.NamedTemporaryFile("w",dir=MEDIA.parent,encoding="utf8",delete=False) as f:
            f.write(json.dumps(media,ensure_ascii=False,indent=2)+"\n")
            temp=Path(f.name)
        temp.replace(MEDIA)
    reportData={
      "schema":"AO_R29_EXACT_SOURCE_OFFLINE_STAGE_V1",
      "source_manifest_sha256":lock["source_export_sha256"],
      "owner_selections":19,
      "original_files_read":sum("source_sha1" in x for x in report),
      "ready_for_release":sum(x["state"]=="READY_FOR_EXPLICIT_RELEASE" for x in report),
      "rights_pending":sum(x["state"]=="SOURCE_BYTES_VERIFIED_RIGHTS_REVIEW_PENDING" for x in report),
      "missing_original_bytes":sum(x["state"]=="ORIGINAL_BYTES_NOT_PROVIDED" for x in report),
      "production_modified":args.apply,
      "public_cover_additions":sum(x["state"]=="READY_FOR_EXPLICIT_RELEASE" for x in report) if args.apply else 0,
      "network_requests":0,
      "rows":report
    }
    (out/"report.json").write_text(json.dumps(reportData,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps({k:v for k,v in reportData.items() if k!="rows"},indent=2))

if __name__=="__main__":
    try:main()
    except Exception as e:
        print("R29_FAIL_CLOSED:",type(e).__name__+":",e,file=sys.stderr)
        sys.exit(1)
