#!/usr/bin/env python3
"""P88 proof obligations: recovered Commons source triage is not image visual QA."""
import json
from pathlib import Path

path=Path("data/directory/research/p88-p85-recovered-84-source-triage-20261029.json")
o=json.loads(path.read_text(encoding="utf-8"))
assert o["schema"]=="AO_P88_P85_RECOVERED_PHOTOS_SOURCE_TRIAGE_V1"
assert o["source"]["sha256"]=="088ed95f549dbd9ad8ff2669d8365cec29a8287dbc83b8ed7564f1ed8fc5acd0"
rows=o["rows"]
assert len(rows)==84
assert [x["global_queue_row"] for x in rows]==list(range(302,386))
assert len({(x["physical_anchor_id"],x["commons_file_title"]) for x in rows})==84
counts={
    "EXCLUDE_SOURCE_SUBJECT_MISMATCH":7,
    "HOLD_DETAIL_OR_INTERIOR_FOR_GALLERY_ONLY":13,
    "HOLD_UNRESOLVED_EXACT_VENUE":5,
    "PENDING_IMAGE_AND_SITE_VERIFICATION":59,
}
for decision,n in counts.items():
    assert sum(x["disposition"]==decision for x in rows)==n
    assert o["counts"][decision]==n
assert o["counts"]["recovered"]==84
assert all(o["counts"][key]==0 for key in ("visually_inspected_in_this_pass",
    "exact_buildings_verified","rights_cleared","published"))
for x in rows:
    assert x["commons_file_title"].startswith("File:")
    assert x["source_url"].startswith("https://commons.wikimedia.org/wiki/File:")
    assert not any(x[k] for k in ("image_bytes_personally_inspected",
        "exact_building_identity_verified","rights_independently_cleared",
        "publication_allowed"))
    assert x["review_method"] in ("NOT_REVIEWED","SOURCE_TITLE_AND_DESCRIPTION_TRIAGE")
    assert x["disposition"]=="PENDING_IMAGE_AND_SITE_VERIFICATION" or x["review_method"]=="SOURCE_TITLE_AND_DESCRIPTION_TRIAGE"
assert {x["global_queue_row"] for x in rows if x["disposition"]=="EXCLUDE_SOURCE_SUBJECT_MISMATCH"}=={325,326,331,361,369,370,371}
assert {x["global_queue_row"] for x in rows if x["disposition"]=="HOLD_UNRESOLVED_EXACT_VENUE"}=={321,328,336,337,342}
assert {x["global_queue_row"] for x in rows if x["disposition"]=="HOLD_DETAIL_OR_INTERIOR_FOR_GALLERY_ONLY"}=={316,317,340,345,347,352,353,354,362,367,377,378,382}
print("P88 P85 84 photo source triage PASS: 7 subject mismatches excluded, 18 held, 59 unreviewed, 0 approvals")
