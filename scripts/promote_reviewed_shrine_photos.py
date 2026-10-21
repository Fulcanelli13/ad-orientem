#!/usr/bin/env python3
"""Promote precisely five source-verified, visually reviewed photos to canonical Explore.
Runs only on an explicitly trusted same-repository PR branch. Never fills held sites.
"""
from __future__ import annotations
import hashlib, json, shutil
from pathlib import Path
from stage_shrine_photo_candidates import stage

ROOT=Path(__file__).resolve().parents[1]
CANDIDATE=ROOT/"data/geography/research/shrine-seven-photo-recovery-20261021.v1.json"
MEDIA=ROOT/"data/geography/approved-place-media.v1.json"
LEDGER=ROOT/"data/shrines/editorial-master-inventory-20261021.v1.json"
SHRINES=ROOT/"data/shrines/shrines-pilgrimages-seed.v1.json"
TEST=ROOT/"tests/shrine-marian-editorial-inventory-contract.mjs"
ACCEPT="EDITORIALLY_ACCEPTED_EXACT_SITE_AND_FULL_FRAME_20261021"
def write_json(path,data):
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
def main():
    candidate=json.loads(CANDIDATE.read_text(encoding="utf8"))
    media=json.loads(MEDIA.read_text(encoding="utf8"))
    ledger=json.loads(LEDGER.read_text(encoding="utf8"))
    shrines=json.loads(SHRINES.read_text(encoding="utf8"))
    reviewed=candidate["candidates"]
    assert len(reviewed)==5
    assert all(x.get("image_review_state")==ACCEPT for x in reviewed),"Not all photos visually accepted"
    place_to_shrine={x["place_id"]:x for x in shrines["shrines"]}
    byplace={x["place_id"]:x for x in media["items"]}
    for c in reviewed:
        id=c["place_id"]
        if id not in place_to_shrine: raise RuntimeError("No canonical shrine "+id)
        if id in byplace: # Idempotence must never silently overwrite a different image.
            if (byplace[id].get("source_url")!=c["source_url"]):
                raise RuntimeError("Existing different approved photo "+id)
            print("ALREADY APPROVED:",id,flush=True)
            continue
        data=stage(c) # Downloads exact original; verifies SHA1, licence and URL.
        target="assets/approved/place-media/"+id.replace("place:","").replace(":","-")+".webp"
        src=ROOT/"artifacts/shrine-photo-source-review"/data["candidate_filename"]
        dst=ROOT/target
        if dst.exists(): raise RuntimeError("Unregistered path already exists: "+target)
        dst.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(src,dst)
        if hashlib.sha256(dst.read_bytes()).hexdigest()!=data["derivative_sha256"]:
            raise RuntimeError("Converted asset hash mismatch")
        # The licensing claim is not an inferred saint/miracle claim. Exact
        # Commons metadata, author credit and the original source accompany each.
        record={
            "place_id":id,"status":"APPROVED","asset_path":target,
            "credit":c["credit"],"license":c["license"],"license_url":c["license_url"],
            "source_url":c["source_url"],"source_sha1":data["original_sha1"],
            "derivative_sha256":data["derivative_sha256"],
            "source_place_ref":place_to_shrine[id]["source_ids"][0],
            "alt_en":c["alt_en"],"alt_fr":c["alt_fr"],
            "changes_en":"Resized to fit 1280 px maximum and converted to WebP; no crop or compositing.",
            "changes_fr":"Image redimensionnée à 1 280 px maximum et convertie en WebP ; aucun recadrage ni montage.",
            "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
            "reviewed_at":"2026-10-21",
            "review_method":"Original Wikimedia file page, photographer and exact licence verified; downloaded original SHA1 checked against Wikimedia; whole-frame photograph compared against exact Place on 2026-10-21 contact sheet; local derivative SHA256 verified.",
            "width":data["candidate_dimensions"][0],"height":data["candidate_dimensions"][1],
            "orientation":"portrait" if data["candidate_dimensions"][1]>data["candidate_dimensions"][0] else "landscape"
        }
        media["items"].append(record);byplace[id]=record
        print("APPROVED",id,target,data["candidate_dimensions"],flush=True)
    media["items"].sort(key=lambda row:row["place_id"])
    media["version"]="1.3.0"
    write_json(MEDIA,media)
    for s in ledger["shrines"]:
        x=byplace.get(s["place_id"])
        if x and x["status"]=="APPROVED" and s["hero_media"]!="APPROVED_LOCAL":
            s["hero_media"]="APPROVED_LOCAL";s["hero_asset_path"]=x["asset_path"]
            s["next_editorial_action"]="QA_RELEASED_FOLIO" if s["detailed_guide"]=="PUBLISHED" else "WRITE_SOURCE_LINKED_GUIDE"
    for p in ledger["pilgrimages"]:
        if p["destination_place_id"] in byplace:
            p["destination_hero"]="APPROVED_LOCAL"
    ledger["summary"]["shrineApprovedHero"]=sum(s["hero_media"]=="APPROVED_LOCAL" for s in ledger["shrines"])
    ledger["summary"]["shrineGuideAndHero"]=sum(s["hero_media"]=="APPROVED_LOCAL" and s["detailed_guide"]=="PUBLISHED" for s in ledger["shrines"])
    ledger["summary"]["marianApprovedHero"]=sum(s["hero_media"]=="APPROVED_LOCAL" and s["category"]=="MARIAN" for s in ledger["shrines"])
    ledger["summary"]["approvedSitePhotos"]=len(byplace)
    write_json(LEDGER,ledger)
    assert len(byplace)==24,(len(byplace),ledger["summary"])
    assert ledger["summary"]["shrineGuideAndHero"]==24
    assert ledger["summary"]["marianApprovedHero"]==14
    # Keep the exact existing source/coverage contract aligned with the
    # deterministic conversion. No historic shrine IDs or descriptions change.
    original=TEST.read_text(encoding="utf8")
    new=original.replace("assert.equal(ledger.summary.shrineApprovedHero,19);","assert.equal(ledger.summary.shrineApprovedHero,24);").replace(
        "assert.equal(ledger.summary.shrineGuideAndHero,19);","assert.equal(ledger.summary.shrineGuideAndHero,24);")
    new=new.replace("25 detailed guides; all 18 previously approved local site photographs","25 detailed guides; all 24 approved local site photographs")
    if new==original and "shrineApprovedHero,24" not in original:raise RuntimeError("Unrecognized coverage test version")
    TEST.write_text(new,encoding="utf8")
    print("PROMOTION READY: 24 approved site pictures, all tied to existing detailed guides; Solas Bhríde held.")
if __name__=="__main__":main()
