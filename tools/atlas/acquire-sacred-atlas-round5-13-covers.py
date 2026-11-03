#!/usr/bin/env python3
"""Publish a bounded Phase B Sacred Atlas cover batch from PREVIOUS user selections.

Source claims are not approvals. Reuse the canonical Photo Finder importer, which
checks current Commons original SHA1, photo licence/author, original bytes, image
decode and WebP SHA256. Never replace a cover or change the TLM directory/gallery.
"""
from __future__ import annotations
import csv
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/geography/research/sacred-atlas-round5-selected-13-cover-manifest-20261103.v1.json"
EVIDENCE = ROOT / "data/geography/research/sacred-atlas-round5-published-cover-evidence-20261103.v1.json"
COVERS = ROOT / "data/geography/approved-place-media.v1.json"
GALLERY = ROOT / "data/geography/approved-place-gallery.v1.json"
PLACES = ROOT / "data/geography/seed-registry.v1.json"
DECISIONS = ROOT / "data/geography/research/photo-finder-20261030/decisions.json"
CREDITS = ROOT / "data/geography/research/photo-finder-20261030/credits.csv"
ADAPTER = ROOT / "tools/directory/release-photo-finder-decisions.py"

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def digest(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")).hexdigest()

def main():
    spec=importlib.util.spec_from_file_location("ao_finder_release_round5",ADAPTER)
    release=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(release)
    manifest=load(MANIFEST)
    assert manifest["schema"]=="AO_SACRED_ATLAS_PHASE_B_ROUND5_SELECTED_COVER_RELEASE_V1"
    rows=manifest["rows"]
    assert len(rows)==13 and len({r["place_id"] for r in rows})==13
    existing=load(COVERS);gallery=load(GALLERY);places=load(PLACES);decisions=load(DECISIONS)
    assert len(existing["items"])==manifest["baseline"]["approved_covers"]==312
    assert len(gallery["items"])==manifest["baseline"]["approved_gallery"]==42
    assert len(places["places"])==manifest["baseline"]["canonical_places"]==530
    before_cover_hash=digest(existing["items"])
    before_gallery_hash=digest(gallery)
    with CREDITS.open(encoding="utf-8-sig",newline="") as stream:
        credits=list(csv.DictReader(stream))
    plan=release.source_status(credits,decisions,places,existing,gallery)
    available={(t["place_id"],t["title"]):t for t in plan["tasks"] if t["role"]=="cover"}
    errors=plan["holds"]+plan["skips"]
    tasks=[];preflight_holds=[]
    for row in rows:
        pid=row["place_id"];title=row["reviewed_file"]
        assert decisions["decisions"][pid]["files"][0]==title, "Not user's original first choice"
        site=next(p for p in places["places"] if p["place_id"]==pid)
        assert site["photo_editorial"]["decision"]=="SELECTED"
        assert site["photo_editorial"]["cover_commons_file"]==title
        assert pid not in {x["place_id"] for x in existing["items"]}, "Refuse cover replacement"
        credit=next(x for x in credits if x["place_id"]==pid and x["rank"]=="1")
        assert (credit["commons_file"]==title and
          credit["original_sha1"]==row["expected_original_sha1"] and
          credit["licence"]==row["claimed_license"] and
          credit["author"]==row["claimed_author"] and
          [int(credit["width"]),int(credit["height"])]==row["expected_dimensions"])
        item=available.get((pid,title))
        if item is None:
            matching=[x for x in errors if x["place_id"]==pid and x.get("source_file")==title]
            preflight_holds.append({"place_id":pid,"file":title,"reason":
                matching[0]["reason"] if matching else "PRESELECTED_SOURCE_NOT_ELIGIBLE"})
            continue
        assert item["sha1"]==row["expected_original_sha1"]
        tasks.append(item)
    if not tasks: raise RuntimeError("No prior-selected cover passed source preflight")
    # This directory is deliberately local to the one-time Actions worker.
    # Only verified WebP derivatives and canonical registry/evidence will be committed.
    staged=Path("/tmp/ao-sacred-atlas-round5-selected-13-stage")
    # Only this bounded Sacred Atlas batch uses the more generous original-size
    # cap and EXIF/MPO decoding. Do not change global Directory source rules.
    import io, urllib.parse
    from PIL import Image,ImageOps
    stage=release.stage
    stage.MAX_ORIGINAL_BYTES=32_000_000
    stage.MAX_BATCH_ORIGINAL_BYTES=220_000_000
    stage.MAX_IMAGE_PIXELS=65_000_000
    def round5_metadata(entry):
        params=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
            "titles":entry["title"],"prop":"imageinfo",
            "iiprop":"url|size|sha1|mime|extmetadata"})
        payload=json.loads(stage.fetch(stage.COMMONS+"?"+params,2_000_000))
        pages=payload.get("query",{}).get("pages",[])
        if len(pages)!=1 or pages[0].get("title")!=entry["title"] or not pages[0].get("imageinfo"):
            raise ValueError("Exact pinned Commons file title is unavailable")
        info=pages[0]["imageinfo"][0]
        sz=int(info.get("size") or 0);w=int(info.get("width") or 0);h=int(info.get("height") or 0)
        if (info.get("sha1")!=entry["expected_sha1"] or
                info.get("mime") not in {"image/jpeg","image/png","image/webp"} or
                sz<1000 or sz>stage.MAX_ORIGINAL_BYTES or
                min(w,h)<650 or w*h>stage.MAX_IMAGE_PIXELS):
            raise ValueError("Source SHA1, MIME, size or dimensions outside pinned safety bounds")
        meta=info.get("extmetadata") or {}
        def get(key):
            return stage.clean((meta.get(key) or {}).get("value"))
        if entry["expected_license"]=="CC0":
            short=get("LicenseShortName").upper().replace(" ","")
            url=get("LicenseUrl")
            terms=get("UsageTerms").upper()
            parsed=urllib.parse.urlsplit(url) if url else None
            url_ok=bool(parsed and parsed.hostname=="creativecommons.org" and
                parsed.scheme in {"http","https"} and
                parsed.path.startswith("/publicdomain/zero/1.0"))
            if not short.startswith("CC0") or not (url_ok or "CC0" in terms):
                raise ValueError("CC0 dedication not independently affirmed in current Commons file metadata")
            author=get("Artist")
            if not author or len(author)>500:
                raise ValueError("No current CC0 photo author attribution")
            name="CC0"
        else:
            name,author=stage.license_from_metadata(info)
        if name!=entry["expected_license"]:
            raise ValueError("Current Commons copyright licence differs from selected source claim")
        stage.checked_https(info.get("url"),{"upload.wikimedia.org"})
        return info,name,author
    def round5_convert_original(original,info,entry):
        fmt={"image/jpeg":{"JPEG","MPO"},"image/png":{"PNG"},"image/webp":{"WEBP"}}[info["mime"]]
        with Image.open(io.BytesIO(original)) as source:
            if source.format not in fmt:
                raise ValueError("Decoded original format differs from declared Commons MIME")
            photo=ImageOps.exif_transpose(source)
            published_size=(int(info["width"]),int(info["height"]))
            if published_size not in (source.size,photo.size):
                raise ValueError("Decoded image dimensions do not match current Commons metadata, even after EXIF")
            photo=photo.convert("RGB")
        photo.thumbnail((1280,1280),Image.Resampling.LANCZOS)
        output=io.BytesIO()
        photo.save(output,format="WEBP",quality=84,method=6)
        binary=output.getvalue()
        if len(binary)<3000 or binary[:4]!=b"RIFF" or binary[8:12]!=b"WEBP":
            raise ValueError("Invalid full-frame WebP derivative")
        return binary,photo.size,False
    stage.convert_original=round5_convert_original
    report=release.verify_and_stage(tasks,staged,apply=True,
                                   metadata_loader=round5_metadata)
    approved=[r["item"] for r in report["media_records"]]
    holds=preflight_holds+report["exceptions"]
    assert len(approved)+len(holds)==13
    print("ROUND5_SOURCE_DIAGNOSTICS",json.dumps({"eligible_attempts":len(tasks),"accepted":len(approved),"preflight_holds":preflight_holds,"source_exceptions":report["exceptions"]},ensure_ascii=False),flush=True)
    assert len(approved)>=1, "No actual newly published covers"
    after=load(COVERS)
    assert len(after["items"])==312+len(approved)
    new_ids={a["place_id"] for a in approved}
    assert len(new_ids)==len(approved)
    prior=[x for x in after["items"] if x["place_id"] not in new_ids]
    assert digest(sorted(prior,key=lambda x:x["place_id"]))==digest(sorted(existing["items"],key=lambda x:x["place_id"])), "Prior covers changed"
    assert digest(load(GALLERY))==before_gallery_hash,"Gallery modified"
    after["version"]="1.6.10"
    COVERS.write_text(json.dumps(after,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    published=[{"place_id":x["place_id"],"asset_path":x["asset_path"],
      "source_url":x["source_url"],"source_sha1":x["source_sha1"],
      "derivative_sha256":x["derivative_sha256"],"license":x["license"],
      "license_url":x["license_url"],"credit":x["credit"],
      "dimensions":[x["width"],x["height"]]} for x in approved]
    EVIDENCE.write_text(json.dumps({
      "schema":"AO_SACRED_ATLAS_ROUND5_PRODUCTION_COVERS_V1",
      "date":"2026-11-03","scope":"SACRED_ATLAS_COVERS_NO_TLM",
      "manifest":str(MANIFEST.relative_to(ROOT)),
      "before":{"covers":312,"missing":218,"gallery":42,"prior_cover_metadata_sha256":before_cover_hash,"gallery_metadata_sha256":before_gallery_hash},
      "after":{"covers":len(after["items"]),"missing":530-len(after["items"]),"gallery":42},
      "reviewed":13,"published_count":len(approved),"held_count":len(holds),
      "published":published,"holds":holds,
      "current_commons_sha1_and_license_verified":True,
      "current_source_original_bytes_verified":True,
      "original_user_choices_preserved":True,
      "no_unselected_substitutions":True,
      "existing_covers_unchanged":True,
      "gallery_unchanged":True,
      "no_tlm_changes":True
    },ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("SACRED_ATLAS_ROUND5",json.dumps({"published":len(approved),"held":len(holds),"covers_after":len(after["items"]),"holds":holds},ensure_ascii=False),flush=True)

if __name__=="__main__":
    main()
