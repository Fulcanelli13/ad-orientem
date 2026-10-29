#!/usr/bin/env python3
"""P94 true manual contact-sheet visual triage of P93 28-original audit."""
import json
from pathlib import Path
p=Path("data/directory/research/p94-28-original-photo-visual-qa-20261029.json")
j=json.loads(p.read_text(encoding="utf-8"))
assert j["schema"]=="AO_P94_TWENTY_EIGHT_ORIGINAL_DERIVATIVE_VISUAL_QA_V1"
rows=j["records"]
assert j["counts"]["processed"]==len(rows)==28
assert len({x["global_review_row"] for x in rows})==28
want={"PROMISING_PRIMARY_EXTERIOR":14,"CONDITIONAL_EXTERIOR":5,
      "WEAK_HERO_GALLERY_RESEARCH_ONLY":5,"HOLD_EXACT_BUILDING_FACADE_IDENTITY":1,
      "HOLD_ORIGINAL_TECHNICAL":3}
for key,value in want.items():
    assert sum(x["visual_disposition"]==key for x in rows)==j["counts"][key]==value
assert j["counts"]["previews_manually_seen"]==j["counts"]["original_sha_verified"]==25
assert {x["global_review_row"] for x in rows if x["visual_disposition"]=="HOLD_ORIGINAL_TECHNICAL"}=={13,34,129}
assert {x["global_review_row"] for x in rows if x["visual_disposition"]=="HOLD_EXACT_BUILDING_FACADE_IDENTITY"}=={341}
for r in rows:
    assert r["source_file"].startswith("File:")
    assert len(r["source_original_sha1"])==40
    assert r["observed_visual_issue"]
    assert not r["full_resolution_manually_inspected"] and not r["independent_rights_compliance_approved"] and not r["app_media_approved"] and not r["published"]
    if r["original_source_bytes_verified"]:
        assert len(r["downloaded_original_sha256"])==64
        assert r["visual_review_method"]=="P93_EXACT_1100PX_WEBP_PREVIEW_ON_PHYSICAL_CONTACT_SHEET"
    else:
        assert r["downloaded_original_sha256"] is None
        assert r["visual_disposition"]=="HOLD_ORIGINAL_TECHNICAL"
assert j["counts"]["rights_cleared"]==j["counts"]["media_approved"]==j["counts"]["published"]==0
print("P94 PASS: 25 actual 1100px original-derivative photographs manually triaged, 3 technical holds, zero production photos")
