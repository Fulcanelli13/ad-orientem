#!/usr/bin/env python3
"""Source-grounded curatorial queues for Ad Orientem's existing Sacred Art.

ONE canonical 383-record lane + protected, overlapping annexes (107 approved,
22 Prayer heroes, 83 Breviarium plates). No counts from independent registries
are added as if they were distinct paintings.

Outputs exact per-ID licence-review, photo-repair/replace, and near-ready lists.
Nothing here marks art pristine; a photograph with a documented CC0 source is
still subject to full native-image, edge, fidelity and user aesthetic review.
"""
import csv, io, json, re
from collections import Counter
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/"data/calendar"
RESEARCH=ROOT/"data/research"
def j(name, folder=DATA):return json.loads((folder/name).read_text())
def csvrows(name):return list(csv.DictReader((DATA/name).open(newline="")))
def writecsv(name,rows,fields):
    with (DATA/name).open("w",newline="") as h:
        writer=csv.DictWriter(h,fieldnames=fields,extrasaction="ignore",lineterminator="\n")
        writer.writeheader()
        for row in rows:writer.writerow(row)

main=csvrows("sacred-art-bulk-screen-A200-20261028.csv")+csvrows("sacred-art-bulk-screen-B183-20261028.csv")
approved=csvrows("sacred-art-bulk-approved-107-photo-gates-20261028.csv")
a6=j("sacred-art-22-museum-official-cc0-photo-sha-20261028.v1.json")["records"]
a8=j("sacred-art-a8-44-visual-contact-screen-20261028.v1.json")["records"]
a8r=j("sacred-art-a8-44-photographic-preflight-20261028.v1.json")
prayer=j("prayer-sacred-art-pristine-master-registry-20261028.v1.json",RESEARCH)
brevia=j("sacred-art-breviarium-83-gallery-intake-20261029.v1.json")
bad=j("sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json")
b2=j("prayer-sacred-art-b2-reconciled-intake-20261028.v1.json",RESEARCH)

assert len(main)==383 and len({r["artwork_id"] for r in main})==383
assert len(approved)==107 and len(a6)==22 and len(a8)==44
assert len(prayer["primary_artworks"])==22 and len(prayer["placement_records"])==118
assert len(brevia["records"])==83 and len(bad["items"])==103
approvedBy={z["artwork_id"]:z for z in approved}
a6By={z["artwork_id"]:z for z in a6}
a8By={z["artwork_id"]:z for z in a8}
assert len(a6By)==22 and len(a8By)==44
assert all(k in approvedBy for k in a6By)
assert all(k in approvedBy for k in a8By)
assert not set(a6By)&set(a8By)
assert all(k in {z["artwork_id"] for z in main} for k in approvedBy)
bannedIds={z["artworkId"] for z in bad["items"]}
a8Licences=[z for z in a8r["licenceEvidence"] if z.get("per_file_page_checked_20261028")]
licenceA8Names={z["file"] for z in a8Licences}

def strbool(x):return str(x).lower() in ("true","yes","1")
def priority(z):return 0 if z["frozen_editorial_state"].startswith("APPROVED") else 1 if z["frozen_editorial_state"]=="PREVIOUSLY_RATED_ACCEPTABLE" else 2
def sourcehint(z,approval):
    return approval.get("source_page") or approval.get("external_exact_object_lead") or ""
def lic(z,official,approval,visual):
    if official:
        if official.get("official_eligible_photo_policy")=="CC0" and official.get("official_object_oa_flag_confirmed_20261028"):
            if official.get("source_photo_bytes_same_as_frozen_archive"):
                return ("OFFICIAL_CC0_SELECTED_SOURCE_HASH_MATCH","NO_FILE_LICENCE_RESEARCH_NEEDED","Official museum CC0 image source and existing selected archive SHA match")
            return ("OFFICIAL_CC0_CURRENT_VARIANT_DIFFERS","CONFIRM_SELECTED_ARCHIVE_FILE_VERSION","Official current JPEG is CC0 but differs from historical selected archive")
    if z["source_lane"] in ("NO_PHYSICAL_ORIGINAL","PARTIAL_WORK_ONLY"):
        return ("NO_COMPLETE_SOURCE_FOR_LICENCE","ACQUIRE_EXACT_COMPLETE_IMAGE_THEN_CHECK_TERMS","No exact full-work source to license")
    if visual and any(e["file"] in (approval.get("source_page") or "") for e in a8Licences):
        return ("PER_FILE_CC_BY_SA_EVIDENCE","VERIFY_ATTRIBUTION_AND_SHAREALIKE_IMPLEMENTATION","Exact Commons CC BY-SA 4.0 photo evidence exists but final licence compliance not established")
    if z["source_lane"]=="FULL_WORK_OPEN_METADATA":
        return ("OPEN_METADATA_ONLY","CHECK_EXACT_FILE_RIGHTS_AND_TERMS","Public-domain or open metadata without approved exact-file reuse evidence")
    return ("RIGHTS_EVIDENCE_GAP","IDENTIFY_PHOTOGRAPHER_AND_FILE_LICENCE","Exact image/photographer rights not established")

mainOut=[]
for z in main:
    id=z["artwork_id"];approval=approvedBy.get(id,{})
    official=a6By.get(id);visual=a8By.get(id)
    rights,action,reason=lic(z,official,approval,visual)
    hard_artist=bool(re.search(r"\b(el greco|fra angelico)\b",z["artist"],re.I))
    visual_status="NOT_NATIVE_PHOTO_INSPECTED"
    photo_action="FIRST_FULL_NATIVE_VISUAL_INSPECTION"
    visual_evidence=""
    if visual:
        vr=visual["visual_result"]; visual_evidence=visual.get("visual_notes") or ""
        if vr=="NO_OBVIOUS_EXTERNAL_FRAME_AT_CONTACT_SHEET_SCALE":
            visual_status="PRELIMINARY_CONTACT_SHEET_FRAME_FREE"
            photo_action="REVIEW_FULL_NATIVE_EDGE_COLOR_GLARE"
        elif vr in ("HOLD_BACKDROP_SUPPORT_BOUNDARY","HOLD_BORDER_CLASSIFICATION"):
            visual_status="BORDER_OR_SUPPORT_VIOLATION_SUSPECTED"
            photo_action="TEST_PAINT_PRESERVING_CROP_OR_REPLACE"
        else:
            visual_status="VISUAL_EVIDENCE_MISSING"
            photo_action="ACQUIRE_NATIVE_CONTACT_SHEET"
    # Evidence of inadequacy trumps an apparently unspecified visual status.
    if z["source_lane"]=="NO_PHYSICAL_ORIGINAL":
        visual_status="MISSING_PHOTOGRAPH"
        photo_action="ACQUIRE_EXACT_COMPLETE_SOURCE"
    elif z["source_lane"]=="PARTIAL_WORK_ONLY":
        visual_status="PARTIAL_ONLY"
        photo_action="REPLACE_WITH_FULL_PAINTED_WORK_PHOTO"
    elif approval.get("source_gate")=="A5_RESOLUTION_OR_DIMENSION_HOLD":
        visual_status="APPROVED_SOURCE_RESOLUTION_HOLD"
        photo_action="SOURCE_HIGHER_FIDELITY_EXACT_WORK"
    # Hard aesthetic bans and explicit rejected IDs may never be promoted
    # through a different source file.
    excluded=hard_artist or id in bannedIds
    if excluded:
        photo_action="EXCLUDED_BY_HISTORICAL_USER_EDIT"
        rights="EXCLUDED_NO_REUSE_REVIEW"
        action="DO_NOT_ACQUIRE"
        visual_status="EDITORIALLY_EXCLUDED"
    # Production ready is never set by bulk source metadata.
    rec={"artwork_id":id,"title":z["title"],"artist":z["artist"],"subject":z["subject"],
      "editorial_state":z["frozen_editorial_state"],"priority":z["priority"],
      "approved_primary_cohort":bool(approval),"source_lane":z["source_lane"],
      "licence_state":rights,"licence_next_action":action,
      "licence_evidence":reason,"source_page":sourcehint(z,approval),
      "photo_visual_state":visual_status,"photo_next_action":photo_action,
      "visual_evidence":visual_evidence,
      "prior_source_sha256":z.get("source_sha256") or approval.get("photo_sha256"),
      "source_image_identity_approved":False,
      "full_native_frame_free_certified":False,
      "colour_fidelity_certified":False,"curator_final_certified":False,
      "production_approved":False,"historical_exclusion":excluded}
    mainOut.append(rec)
# These are record-specific operational lists; no double counting by cross-module reuse.
rightsQueue=[x for x in mainOut if x["licence_state"] not in ("OFFICIAL_CC0_SELECTED_SOURCE_HASH_MATCH","EXCLUDED_NO_REUSE_REVIEW")]
needsImage=[x for x in mainOut if x["photo_next_action"] in (
   "ACQUIRE_EXACT_COMPLETE_SOURCE","REPLACE_WITH_FULL_PAINTED_WORK_PHOTO",
   "SOURCE_HIGHER_FIDELITY_EXACT_WORK","TEST_PAINT_PRESERVING_CROP_OR_REPLACE")]
strong=[x for x in mainOut if x["licence_state"]=="OFFICIAL_CC0_SELECTED_SOURCE_HASH_MATCH" and x["approved_primary_cohort"] and not x["historical_exclusion"]]
photoCleanA8=[x for x in mainOut if x["photo_visual_state"]=="PRELIMINARY_CONTACT_SHEET_FRAME_FREE"]
# High potential only: official image hash + CC0 + original >= 2400px
# (quality is NOT presumed)
a6strong=[]
for x in strong:
    src=a6By[x["artwork_id"]]
    dims=src.get("official_current_image_dimensions") or []
    if len(dims)==2 and min(dims)>=2400:
        a6strong.append({**x,"official_current_image_dimensions":dims,
          "museum":src["museum"],"official_object_api":src["official_object_api"],
          "proof_label":"OFFICIAL_CC0_SOURCE_HASH_MATCH_NATIVE_VISUAL_REVIEW_PENDING"})
# Keep the additional registers separate; they overlap with the 383 inventory.
prayerAnnex=[]
for x in prayer["primary_artworks"]:
    t=x["quality"].get("batch4_review_sheet_visual_triage") or {}
    issue=t.get("class") or ("NOT_ACQUIRED" if not x["original"]["archived"] else "NOT_REVIEWED")
    if issue=="PLAUSIBLE_PAINTING_ONLY_IMAGE":action="FIRST_CANDIDATE_FINAL_FIDELITY_RIGHTS_REVIEW"
    elif issue=="REJECT_CURRENT_PHOTOGRAPH":action="REPLACE_PHOTO_OR_PROVE_PROJECTION_SAFE_PAINT_CROP"
    elif issue=="NOT_ACQUIRED":action="ACQUIRE_UNMODIFIED_EXACT_PAINTING_ORIGINAL"
    elif issue in ("PAINTED_FIELD_NEEDS_BOUNDARY_TRIM","NONART_WHITE_MARGIN_CROP_PROOF_REQUIRED","ARCHED_PAINTED_FIELD_REVIEW"):action="TRY_LOSSLESS_PAINT_PRESERVING_CROP_OR_ALPHA"
    else:action="SPECIFIC_PHOTO_QUALITY_REPAIR_OR_ALTERNATIVE"
    prayerAnnex.append({"owner":"PRAYER","id":x["module_id"],"title":x["title"],"artist":x["artist"],
       "master_original_archived":bool(x["original"]["archived"]), "master_sha256":x["original"]["sha256"],
       "first_visual_result":issue,"first_visual_observation":t.get("observation") or "",
       "photo_action":action,"source_page":x.get("source",{}).get("page"),
       "original_photo_rights_final":False,"pristine_final":False,"production_activated":False})
brevAnnex=[]
for x in brevia["records"]:
    up=x.get("w3b_photo_alternative") or x.get("bulk_photo_firstwave") or {}
    review=up.get("visual_review") or {}
    status=review.get("class") or ("SOURCE_ORIGINAL_ARCHIVED_UNCERTIFIED" if up.get("archive_path") else "NOT_INSPECTED_SOURCE_ORIGINAL")
    brevAnnex.append({"owner":"BREVIARIUM_RESEARCH","id":x["breviarum_plate_id"],"title":x["title"],
       "artist":x["artist_as_credited"],"source_file":x["commons_filename"],
       "aesthetic_triage":x["aesthetic_triage"],"current_photo_visual_class":status,
       "current_source_original_archived":bool(up.get("archive_path")),
       "current_archive_sha256":up.get("sha256") or up.get("archive_sha256"),
       "licence_exact_file_reviewed":False,"pristine_final":False,"production_activated":False})
assert len(mainOut)==383 and len(prayerAnnex)==22 and len(brevAnnex)==83
assert len(strong)==18, f"Official CC0 exact matches must be 18, found {len(strong)}"
assert len(rightsQueue)==355, f"Expected 355 active records needing file-specific licensing gate after 10 exclusions, got {len(rightsQueue)}"
assert len(a6strong)<=18
stats={
 "source_register":"383 canonical main artworks, not deduplicated with annexes",
 "main_total":len(mainOut),"main_approved":sum(x["approved_primary_cohort"] for x in mainOut),
 "licence_queue":len(rightsQueue),"official_cc0_matching_selected_source_sha":len(strong),
 "official_cc0_current_other_variant":sum(x["licence_state"]=="OFFICIAL_CC0_CURRENT_VARIANT_DIFFERS" for x in mainOut),
 "open_metadata_needs_file_proof":sum(x["licence_state"]=="OPEN_METADATA_ONLY" for x in mainOut),
 "rights_evidence_gap":sum(x["licence_state"]=="RIGHTS_EVIDENCE_GAP" for x in mainOut),
 "missing_or_partial_source_needs_rights_and_acquisition":sum(x["licence_state"]=="NO_COMPLETE_SOURCE_FOR_LICENCE" for x in mainOut),
 "excluded_records":sum(x["historical_exclusion"] for x in mainOut),
 "direct_visual_or_source_photo_repair_queue":len(needsImage),
 "photo_need_by_action":dict(Counter(x["photo_next_action"] for x in mainOut)),
 "preliminary_a8_frame_free":len(photoCleanA8),
 "a8_border_support_issues":sum(x["photo_visual_state"]=="BORDER_OR_SUPPORT_VIOLATION_SUSPECTED" for x in mainOut),
 "official_cc0_good_resolution_first_final_visual_queue":len(a6strong),
 "prayer_locked_heroes":len(prayerAnnex),"prayer_archived":sum(x["master_original_archived"] for x in prayerAnnex),
 "prayer_visually_plausible":sum(x["first_visual_result"]=="PLAUSIBLE_PAINTING_ONLY_IMAGE" for x in prayerAnnex),
 "prayer_rejected_photo":sum(x["first_visual_result"]=="REJECT_CURRENT_PHOTOGRAPH" for x in prayerAnnex),
 "prayer_repair_or_different_source":sum(x["photo_action"] in ("REPLACE_PHOTO_OR_PROVE_PROJECTION_SAFE_PAINT_CROP","TRY_LOSSLESS_PAINT_PRESERVING_CROP_OR_ALPHA","SPECIFIC_PHOTO_QUALITY_REPAIR_OR_ALTERNATIVE") for x in prayerAnnex),
 "breviarium_source_plates":len(brevAnnex),
 "breviarium_original_photo_archived":sum(x["current_source_original_archived"] for x in brevAnnex),
 "breviarum_frame_rejected":sum(x["current_photo_visual_class"]=="REJECT_NEW_PHOTOGRAPH_FRAME_AND_WALL" for x in brevAnnex),
 "final_pristine_certified":0,"production_activated":0,"cost_eur":0
}
report={"schema":"AO_SACRED_ART_CURATORIAL_QUEUES_20261029_V1","as_of":"2026-10-29",
 "purpose":"Evidence-driven photo-rights and visual curation; no automatic original substitution",
 "source_data":{
   "main_383":["data/calendar/sacred-art-bulk-screen-A200-20261028.csv","data/calendar/sacred-art-bulk-screen-B183-20261028.csv"],
   "selected_107":"data/calendar/sacred-art-bulk-approved-107-photo-gates-20261028.csv",
   "a6_official_museum_22":"data/calendar/sacred-art-22-museum-official-cc0-photo-sha-20261028.v1.json",
   "a8_visual_44":"data/calendar/sacred-art-a8-44-visual-contact-screen-20261028.v1.json",
   "prayer_22":"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json",
   "breviarium_83":"data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json"},
 "caveats":["An official museum source's CC0 rights are confirmed for the current image; when the historical saved JPEG is a different variant, re-link exact-file provenance.",
  "40 apparently frameless A8 images were inspected only at reduced contact-sheet scale. Do not mark final just from their thumbnails.",
  "Prayer 22 and Breviarium 83 overlap main 383 and other modules; never sum unique artwork counts across them.",
  "A frame is potentially crop-removable. Only replace if reflections/perspective/painted-pixel damage or inadequate resolution make safe crop impossible.",
  "All explicit historic user approvals and rejections preserved. El Greco and Fra Angelico stay excluded."],
 "counts":stats,"main_records":mainOut,
 "licence_review_queue":rightsQueue,
 "first_visual_photo_repair_or_acquisition_queue":needsImage,
 "official_cc0_shortlist_needs_final_native_qa":a6strong,
 "contact_sheet_plausibly_frame_free_needs_rights_qa":photoCleanA8,
 "prayer_hero_curation":prayerAnnex,
 "breviarium_research_curation":brevAnnex}
output=DATA/"sacred-art-curator-queues-383-20261029.v1.json"
output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
writecsv("sacred-art-curator-licence-review-20261029.csv",rightsQueue,
 ["artwork_id","title","artist","editorial_state","priority","licence_state","licence_next_action","source_lane","source_page","prior_source_sha256"])
writecsv("sacred-art-curator-photo-repair-20261029.csv",needsImage,
 ["artwork_id","title","artist","editorial_state","priority","photo_visual_state","photo_next_action","visual_evidence","source_lane","source_page","prior_source_sha256"])
writecsv("sacred-art-curator-near-ready-20261029.csv",a6strong,
 ["artwork_id","title","artist","editorial_state","museum","official_object_api","official_current_image_dimensions","proof_label","prior_source_sha256"])
print(json.dumps(stats,sort_keys=True,ensure_ascii=False))
