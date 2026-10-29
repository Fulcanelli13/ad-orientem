#!/usr/bin/env python3
"""Promote only two explicitly visually reviewed St Alphonsus source photos.

Never invents a Place or venue identity. Reads rights-checked staged WebPs,
requires exact SHA256 and frozen original SHA1, then extends the two EXISTING
approved media manifests. Two lower-quality interior/altar sources stay held.
This is an exact-branch PR candidate; final publish requires CI + merge.
"""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
GEO=ROOT/"data/geography/seed-registry.v1.json"
STAGE=ROOT/"data/geography/research/directory-st-alphonsus-photo-stage-20261029.v1.json"
DECISION=ROOT/"data/geography/research/directory-st-alphonsus-photo-editorial-20261029.v1.json"
COVER=ROOT/"data/geography/approved-place-media.v1.json"
GALLERY=ROOT/"data/geography/approved-place-gallery.v1.json"
PLACE="place:US:st-alphonsus-baltimore"
VENUE="ao-fssp-national-shrine-of-st-alphonsus-liguori-114-w-saratoga-st-baltimore-md-21201-usa"
SUPPORTED={"CC0","CC-BY-SA-4.0"}


def load(p):
    return json.loads(p.read_text(encoding="utf-8"))


def prepare():
    geo,stage,dec,covers,gallery=map(load,(GEO,STAGE,DECISION,COVER,GALLERY))
    assert geo["schema"]=="EXPLORE_GEOGRAPHY_SEED_V1"
    assert stage["schema"]=="AO_ST_ALPHONSUS_STAGE_REPORT_V1"
    assert dec["schema"]=="AO_ST_ALPHONSUS_DIRECTORY_PHOTO_EDITORIAL_V1"
    assert covers["schema"]=="AO_APPROVED_PLACE_MEDIA_V1"
    assert gallery["schema"]=="AO_APPROVED_PLACE_GALLERY_V1"
    assert not stage["publication"]
    assert dec["place_id"]==PLACE==stage["place_id"]
    assert dec["venue_id"]==VENUE==stage["venue_id"]
    assert dec["exact_place_promotion_only"] and dec["alternate_building_fallback_forbidden"]
    matches=[l for l in geo["directoryPlaceLinks"] if l["place_id"]==PLACE and l["venue_id"]==VENUE
             and l["confidence"]=="CONFIRMED" and l["relationship"]=="LOCATED_AT"]
    assert len(matches)==1 and "SHR-ALPHONSUS-BALTIMORE" in matches[0]["source_ids"]
    selected=dec["approved_source_assets"]
    assert len(selected)==2
    assert {x["decision"] for x in selected}=={"APPROVE_HERO","APPROVE_GALLERY"}
    assert {x["role"] for x in selected}=={"EXTERIOR"}
    assert len(dec["held"])==2
    assert {x["role"] for x in dec["held"]}=={"INTERIOR","SACRED_DETAIL"}
    assert len({x["stage_filename"] for x in selected+dec["held"]})==4
    stage_by_name={Path(x["asset_path"]).name:x for x in stage["records"]}
    assert len(stage_by_name)==4
    prepared=[]
    for selection in selected:
        name=selection["stage_filename"]
        item=stage_by_name[name]
        assert item["status"]=="STAGED_REVIEW_REQUIRED_NOT_APPROVED" and not item["publication"]
        assert item["place_id"]==PLACE and item["venue_id"]==VENUE
        assert item["role"]==selection["role"]=="EXTERIOR"
        assert item["license"]==selection["license"] in SUPPORTED
        assert item["original_sha1"]==selection["source_sha1"]
        assert item["derivative_sha256"]==selection["derivative_sha256"]
        assert re.fullmatch(r"[a-zA-Z0-9-]+\.webp",selection["publish_filename"])
        src=ROOT/item["asset_path"]
        assert src.is_file()
        binary=src.read_bytes()
        assert binary[:4]==b"RIFF" and binary[8:12]==b"WEBP"
        assert len(binary)>12000
        assert hashlib.sha256(binary).hexdigest()==item["derivative_sha256"]
        assert item["source_url"].startswith("https://commons.wikimedia.org/wiki/File:")
        assert item["license_url"].startswith("https://creativecommons.org/")
        assert item["credit"] and item["alt_en"] and item["alt_fr"]
        destination=ROOT/("assets/approved/place-media" if selection["decision"]=="APPROVE_HERO"
                          else "assets/approved/place-gallery")/selection["publish_filename"]
        prepared.append((item,selection,src,destination))
    assert all(row["place_id"]!=PLACE for row in covers["items"]),"Duplicate cover ownership"
    assert all(row["place_id"]!=PLACE for row in gallery["items"]),"Duplicate gallery ownership"
    return covers,gallery,prepared


def row_common(item,destination):
    return {
        "place_id":PLACE,"status":"APPROVED",
        "asset_path":destination.relative_to(ROOT).as_posix(),
        "credit":item["credit"],"license":item["license"],"license_url":item["license_url"],
        "source_url":item["source_url"],"source_sha1":item["original_sha1"],
        "derivative_sha256":item["derivative_sha256"],
        "alt_en":item["alt_en"],"alt_fr":item["alt_fr"],
        "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
        "reviewed_at":"2026-10-29",
        "review_method":"Exact approved LOCATED_AT church; Wikimedia individual original SHA1, author and CC licence independently checked; complete 1280px WebP visually reviewed without crop or frame",
        "changes_en":"Original frame resized to 1280 px and converted to WebP; no crop, recolouring or montage.",
        "changes_fr":"Image originale redimensionnée à 1 280 px et convertie en WebP ; sans recadrage, retouche ni montage.",
        "width":item["width"],"height":item["height"],
        "orientation":"portrait" if item["height"]>item["width"] else "landscape",
    }


def promote(validate_only=False):
    if all((
        any(x["place_id"]==PLACE for x in load(COVER)["items"]),
        any(x["place_id"]==PLACE for x in load(GALLERY)["items"]),
    )):
        # Existing approval must have been committed as a complete set. A
        # subsequent validation is performed by tests; never double append.
        return "ALREADY_PROMOTED"
    covers,gallery,prepared=prepare()
    if validate_only:
        return "VALIDATED_NO_MUTATION"
    for item,selection,src,destination in prepared:
        assert not destination.exists(), "Refuse overwriting an approved binary"
        destination.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(src,destination)
        assert hashlib.sha256(destination.read_bytes()).hexdigest()==item["derivative_sha256"]
        row=row_common(item,destination)
        if selection["decision"]=="APPROVE_HERO":
            row["source_place_ref"]="SHR-ALPHONSUS-BALTIMORE"
            covers["items"].append(row)
        else:
            row.update(media_id="st-alphonsus-baltimore-sunny-facade-2018",
                       kind="PHOTO",content_kind="PHOTO",chapter_id="place",
                       media_role="EXTERIOR",label_en=item["label_en"],
                       label_fr=item["label_fr"],
                       caption_en="The red-brick Gothic facade and entrance of the National Shrine of St Alphonsus in Baltimore.",
                       caption_fr="Façade néogothique en brique et entrée du sanctuaire national Saint-Alphonse de Baltimore.")
            gallery["items"].append(row)
    assert len(covers["items"])==32 and len(gallery["items"])==7
    COVER.write_text(json.dumps(covers,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    GALLERY.write_text(json.dumps(gallery,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return "TWO_VISUALLY_REVIEWED_EXTERIOR_PHOTOS_APPROVED_IN_PR"


if __name__=="__main__":
    args=argparse.ArgumentParser()
    args.add_argument("--validate-only",action="store_true")
    parsed=args.parse_args()
    print(promote(validate_only=parsed.validate_only),flush=True)
