#!/usr/bin/env python3
"""Read-only P0 B33 source-persistence accounting and no-promotion regression."""
import csv,json
from pathlib import Path
R=Path("data/research")
def load(s):return json.loads((R/s).read_text(encoding="utf-8"))
def rows(s):
 with (R/s).open(newline="",encoding="utf-8") as f:return list(csv.DictReader(f))
b=load("sacred-art-b33-p0-64-complete-research-coverage.json")
nine=load("sacred-art-b33-nine-exception-reconciliation.json")
meta=load("sacred-art-b33-seven-case-exact-source-and-two-alias-evidence.json")
s=load("sacred-art-b33-six-source-summary.json")
files=rows("sacred-art-b33-six-source-decisions.csv")
assert b["active_P0_artworks"]==64
assert len(b["rows"])==64 and len({r["artwork_id"] for r in b["rows"]})==64
assert len(nine["case_records"])==7 and len(nine["alias_records"])==2
assert len(meta["new_research_candidate_sources"])==6
assert len(files)==6 and len({r["artwork_id"] for r in files})==6
assert s["new_source_files_archived"]==6 and s["source_holds"]==0
assert s["new_source_bytes"]==43174596
assert b["newly_acquired_research_image_bytes_B29_B33"]==361357435
assert b["already_archived_B27_alias_file_bytes"]==5884993
assert b["physical_file_bytes_represented_all_P0_with_B27_alias"]==367242428
assert b["counts"]=={
 "HISTORIC_EXACT_ORIGINAL_RETRIEVED":13,
 "ALTERNATIVE_SOURCE_BYTES_RETRIEVED_NOT_SELECTED":29,
 "B32_RESEARCH_SOURCE_RECOVERED_NOT_SELECTED":13,
 "B27_EXISTING_SOURCE_CROSS_IDENTITY_HOLD":2,
 "B33_ACCESSIONED_ORIGINAL_SOURCE_RESEARCH_ONLY":6,
 "BLOCKED_WRONG_PHOTO":1}
assert b["historically_selected_originals_byte_verified"]==13
assert b["other_unselected_source_file_or_alias"]==50
assert not b["canonical_451_modified"] if "canonical_451_modified" in b else True
assert all(r.get("B33_new_source_rights_approved") is False and
           r.get("B33_editorial_source_promotion") is False for r in b["rows"])
assert all(r["photo_identity_approved"]=="NO" and r["editorial_choice_changed"]=="NO"
           and r["publication_rights_approved"]=="NO" for r in files)
assert all(r["acquisition_status"]=="NEW_RESEARCH_ORIGINAL_SOURCE_NOT_SELECTED" for r in files)
assert len({r["downloaded_sha256"] for r in files})==6
assert sum(int(r["bytes_acquired"]) for r in files)==s["new_source_bytes"]
assert {r["artwork_id"] for r in files}=={r["artwork_id"] for r in meta["new_research_candidate_sources"]}
assert {r["artwork_id"] for r in b["rows"] if r["physical_state"]=="BLOCKED_WRONG_PHOTO"}=={"G25-003"}
print("B33 P0 evidence-only coverage gate PASS: 64 originals tracked, 63 physical sources, 1 Prado source hold; no approvals")
