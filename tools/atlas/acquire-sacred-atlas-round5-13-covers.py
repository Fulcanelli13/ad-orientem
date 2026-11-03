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
    report=release.verify_and_stage(tasks,staged,apply=True)
    approved=[r["item"] for r in report["media_records"]]
    holds=preflight_holds+report["exceptions"]
    assert len(approved)+len(holds)==13
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
