#!/usr/bin/env python3
"""Close B30: exact 13 selected originals vs 51 unselected P0 source candidates.

For 51 unselected artworks, this is a provenance triage, not automatic adoption
of a replacement source. Prevent duplicate acquisition and preserve all frozen
selection, identity and copyright holds.
"""
from collections import Counter
import csv
import json
from pathlib import Path

R=Path("data/research")
OUT=Path("artifacts/sacred-art-b30-p0-closeout")
def csvrows(file):
 with (R/file).open(encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def write(file,records):
 with (OUT/file).open(encoding="utf-8",newline="") as f:
  writer=csv.DictWriter(f,fieldnames=list(records[0]));writer.writeheader();writer.writerows(records)

def main():
 x=json.loads((R/"sacred-art-b29-p0-64-all-81-photo-variants.json").read_text())
 screen=csvrows("sacred-art-b29-81-live-source-screener.csv")
 first=json.loads((R/"sacred-art-b29-selected-exact7-corrected.summary.json").read_text())
 second=json.loads((R/"sacred-art-b30-six-selected-acquisition.summary.json").read_text())
 object_map=json.loads((R/"sacred-art-b30-six-institutional-object-crosswalk.json").read_text())
 legacy=csvrows("sacred-art-b28-legacy108-master-recovery.csv")
 assert len(screen)==81 and len(x["rows"])==64
 assert len(object_map["files"])==6
 assert first["forensically_verified_exact_selected_originals"]==7
 assert second["strict_selected_byte_recoveries"]==6
 assert second["recovered_source_image_bytes"]==50520114
 assert first["total_selected_image_bytes"]==34246875
 assert len(legacy)==108
 byscreen={}
 for s in screen:byscreen.setdefault(s["artwork_id"],[]).append(s)
 recovered=set(r["artwork_id"] for r in first["files"])
 recovered.update(r["artwork_id"] for r in csvrows("sacred-art-b30-six-selected-acquisition.csv")
             if r["acquisition_status"]=="HISTORIC_SELECTED_ORIGINAL_BYTES_VERIFIED_IDENTITY_HOLD")
 assert len(recovered)==13
 assert all(r["selected_historical_source_original_sha256"] for r in x["rows"] if r["artwork_id"] in recovered)
 remaining=[]
 for r in x["rows"]:
  id=r["artwork_id"]
  if id in recovered:continue
  assert not r["selected_historical_source_original_sha256"], "A historically selected original is unexpectedly missing: "+id
  variants=byscreen.get(id,[])
  assert len(variants)==1,"B30 expects one historical alternative per unselected P0 item: "+id
  s=variants[0]
  if s["bulk_status"]=="SOURCE_METADATA_SUPPORTED_NOT_SELECTED_MASTER":
   status="EXACT_SOURCE_CANDIDATE_NOT_FROZEN_SELECTED"
   action="B31_TECHNICAL_SOURCE_RESEARCH_ONLY_AFTER_ITEM_LEVEL_IDENTITY_GATE"
  elif s["bulk_status"]=="ARTWORK_IDENTITY_HOLD":
   status="IDENTITY_HOLD_NO_NEW_ACQUISITION"
   action="VERIFY_EXACT_WORK_INVENTORY_AND_HISTORIC_PHOTO_MATCH"
  elif s["bulk_status"]=="INSTITUTIONAL_PHOTO_RIGHTS_HOLD":
   status="INSTITUTIONAL_REUSE_HOLD_NO_NEW_ACQUISITION"
   action="SECURE_OR_VERIFY_SOURCE_PHOTOGRAPH_REUSE_PERMISSION"
  else:raise ValueError("Unexpected B29 source status: "+s["bulk_status"])
  remaining.append({
   "artwork_id":id,"title":r["title"],"artist":r["artist"],"frozen_decision":r["frozen_decision"],
   "historically_selected_original_sha256":"UNRECORDED",
   "candidate_photo_key":s["photo_key"],
   "candidate_original_sha_from_gallery_key":s["photo_key"].split("|")[2],
   "candidate_source_page":s["source_page"],
   "candidate_original_url":s["original_url"],
   "candidate_current_commons_license":s["current_commons_license"],
   "identity_basis":s["identity_basis"],
   "candidate_long_edge_px":s["technical_long_edge"],
   "B29_source_status":s["bulk_status"],
   "disposition":status,"next_action":action,
   "frozen_historical_editorial_choice_preserved":"YES",
   "new_candidate_as_approved_selected_original":"NO",
   "publication_rights_approved":"NO",
  })
 assert len(remaining)==51
 c=Counter(r["disposition"] for r in remaining)
 assert c=={"EXACT_SOURCE_CANDIDATE_NOT_FROZEN_SELECTED":29,
            "IDENTITY_HOLD_NO_NEW_ACQUISITION":21,
            "INSTITUTIONAL_REUSE_HOLD_NO_NEW_ACQUISITION":1}
 OUT.mkdir(parents=True,exist_ok=True)
 write("sacred-art-b30-remaining51-p0-acquisition-gates.csv",remaining)
 summary={
  "schema":"AO_B30_P0_64_COVERAGE_CLOSEOUT_V1",
  "prior_P0_artworks":64,
  "exact_historical_originals_archived_and_checksum_verified":13,
  "original_source_bytes_archived_in_B29_and_B30":34246875+50520114,
  "originals_with_long_edge_2400px_pass":5+4,
  "originals_with_resolution_review_hold":2+2,
  "remaining_P0_without_verified_historical_original":51,
  "remaining_dispositions":dict(c),
  "remaining_source_candidates_with_passable_rights_metadata_but_unselected":29,
  "remaining_identity_hold":21,
  "remaining_institutional_photo_reuse_hold":1,
  "prior_108_legacy_only_works_after_13_technical_recoveries":95,
  "current_recovery_archives_unpublished":True,
  "new_binary_acquisitions_by_this_closeout":0,
  "new_artwork_selection_approvals":0,
  "new_publication_approvals":0,
  "frozen_451_catalogue_decisions_unchanged":True,
  "next_priority":"B31 batch 29 recorded source candidates for research-only retrieval, no frozen-selection promotion",
 }
 (OUT/"sacred-art-b30-p0-64-closeout.summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B30_P0_CLOSEOUT_VERIFIED",json.dumps(summary),flush=True)

if __name__=="__main__":main()
