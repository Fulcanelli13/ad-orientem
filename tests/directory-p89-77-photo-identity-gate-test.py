#!/usr/bin/env python3
"""P89 documentary venue identity checks never bypass rights or original QA."""
import json
from pathlib import Path
root=Path("data/directory/research")
d=json.loads((root/"p89-77-documentary-building-identity-gate-20261029.json").read_text(encoding="utf8"))
p86=json.loads((root/"p86-actual-visual-photo-qa-301-20261029.json").read_text(encoding="utf8"))
p88=json.loads((root/"p88-p85-84-actual-thumbnail-visual-qa-20261029.json").read_text(encoding="utf8"))
assert d["schema"]=="AO_P89_EXACT_SITE_77_DOCUMENTARY_CHECK_V1"
expected=set(p86["shortlist"]["preferred_one_based_source_row"])
expected|={x["global_queue_row"] for x in p88["visual_review_rows"] if x["preferred_single_exterior_for_site"]}
assert len(expected)==77
a=d["data"]
assert len(a)==len({x["row"] for x in a})==len({x["site_id"] for x in a})==77
assert {x["row"] for x in a}==expected
want={"DOCUMENTARY_MATCH":30,"EXCLUDE_MISMATCH":4,"HOLD":43}
assert {k:sum(x["status"]==k for x in a) for k in want}==want
assert (d["counts"]["total"],d["counts"]["documentary_matches"],d["counts"]["wrong_site_or_subject"],d["counts"]["still_held"])==(77,30,4,43)
assert {x["row"] for x in a if x["status"]=="EXCLUDE_MISMATCH"}=={173,197,265,297}
for row in a:
    assert row["photo"].startswith("File:") and row["photo_url"].startswith("https://commons.wikimedia.org/wiki/File:")
    assert not row["original_verified"] and not row["rights_cleared"] and not row["published"]
    if row["status"]=="DOCUMENTARY_MATCH":
        assert row["evidence"]["url"].startswith("https://")
        assert "wikimedia.org" not in row["evidence"]["url"]
        assert row["evidence"]["address"]
    else:
        assert row["evidence"] is None
    if row["status"]=="EXCLUDE_MISMATCH":
        assert row["issue"]
assert set(map(int,d["quality_pilots"]))=={373,376,384,385}
assert sum(x["composition"]=="PROMISING" for x in d["quality_pilots"].values())==2
assert all(x["rights_status"]=="SOURCE_LICENCE_PAGE_CHECKED_NOT_FINAL" for x in d["quality_pilots"].values())
assert all(d["counts"][k]==0 for k in ("original_bytes_verified","rights_cleared","published"))
print("P89 identity gate PASS: 30 documentary matches; 4 mismatches excluded; 43 held; zero releases")
