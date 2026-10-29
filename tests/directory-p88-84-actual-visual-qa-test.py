#!/usr/bin/env python3
"""Exact 84 WebP-source visual audit, distinct from source-semantic triage."""
import json
from pathlib import Path
d=Path("data/directory/research")
source=json.loads((d/"p88-p85-recovered-84-source-triage-20261029.json").read_text(encoding="utf8"))
visual=json.loads((d/"p88-p85-84-actual-thumbnail-visual-qa-20261029.json").read_text(encoding="utf8"))
assert visual["schema"]=="AO_P88_P85_ADDITIONAL_84_ACTUAL_THUMBNAIL_VISUAL_QA_V1"
assert visual["sources"]["p86_385_queue_sha256"]==source["source"]["sha256"]
assert visual["sources"]["p87_workflow_run"]==40886896842
assert visual["sources"]["p87_artifact_ids"]==[12902538538,12903725333,12904005126]
expected={"OFF_TOPIC":7,"DETAIL_ONLY":25,"WEAK_VIEW":17,
          "AMBIGUOUS_VENUE":4,"PLAUSIBLE_EXTERIOR":31}
rows=visual["visual_review_rows"]
assert len(rows)==visual["counts"]["reviewed_source_assignments"]==84
assert {x["visual_sheet_index"] for x in rows}==set(range(1,85))
assert {x["global_queue_row"] for x in rows}==set(range(302,386))
for k,n in expected.items():
    assert sum(x["visual_disposition"]==k for x in rows)==visual["counts"][k]==n
assert sum(expected.values())==84
source_by_row={r["global_queue_row"]:r for r in source["rows"]}
for x in rows:
    r=source_by_row[x["global_queue_row"]]
    assert (x["physical_anchor_id"],x["commons_file_title"],x["source_original_sha1"])==(
      r["physical_anchor_id"],r["commons_file_title"],r["source_original_sha1"])
    assert not any(x[k] for k in ("exact_building_verified","rights_independently_cleared",
        "original_full_resolution_inspected","approved_or_published"))
    if r["disposition"]=="EXCLUDE_SOURCE_SUBJECT_MISMATCH":
        assert x["visual_disposition"]=="OFF_TOPIC"
    if x["preferred_single_exterior_for_site"]:
        assert x["visual_disposition"]=="PLAUSIBLE_EXTERIOR"
one=[r for r in rows if r["preferred_single_exterior_for_site"]]
assert len(one)==25==visual["counts"]["one_per_named_site_research_choices"]
assert len({r["physical_anchor_id"] for r in one})==25
for k in ("building_identities_independently_verified","rights_independently_cleared",
          "photos_approved","photos_published"):
    assert visual["counts"][k]==0
print("P88 actual 84-image visual triage PASS; 31 plausible exteriors, 25 per-site research picks, 0 approvals")
