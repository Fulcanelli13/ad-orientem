#!/usr/bin/env python3
"""P90: originals proven and visually inspected, but no invalid photo publication."""
import json
from pathlib import Path
p=Path("data/directory/research/p90-two-originals-media-publication-gates-20261029.json")
d=json.loads(p.read_text(encoding="utf8"))
assert d["schema"]=="AO_P90_TWO_VERIFIED_ORIGINALS_RELEASE_GATES_V1"
assert d["source_audit_git_branch"]=="research/p90-original-two-church-photos-20261029"
assert d["counts"]["source_originals_retrieved"]==d["counts"]["sha1_verified"]==d["counts"]["sha256_verified"]==d["counts"]["originals_visually_inspected"]==d["counts"]["composition_passed_for_full_frame"]==d["counts"]["confirmed_r49_venue_ids"]==2
assert d["counts"]["confirmed_canonical_place_media_links"]==d["counts"]["production_approved"]==d["counts"]["published"]==0
assert len(d["originals"])==2
assert {x["global_review_row"] for x in d["originals"]}=={376,384}
assert {x["venue_id"] for x in d["originals"]}=={"AO-AMER-R28-US-25-03","V19:DIO-US-MN-ST-PAUL-SAINT-AGNES"}
assert len({x["physical_anchor_id"] for x in d["originals"]})==2
for x in d["originals"]:
    assert len(x["original_sha1"])==40 and len(x["downloaded_sha256"])==64
    assert x["source_bytes"]>1_000_000 and len(x["source_dimensions"])==2
    assert x["full_original_sha1_and_sha256_verified"] and x["original_visual_inspected"]
    assert x["image_composition_status"].startswith("PASS")
    assert x["mobile_display_policy"].startswith("FULL_FRAME")
    assert x["source_license_claim_matched"]
    assert x["canonical_r49_venue_resolved"] and not x["canonical_place_media_link_resolved"]
    assert x["place_id"] is None
    assert not x["place_media_approval"] and not x["published"]
    assert x["publication_status"]=="HOLD_CANONICAL_PLACE_MEDIA_LINK_AND_CREDIT_RENDERING"
    assert x["source_page"].startswith("https://commons.wikimedia.org/wiki/File:")
    assert x["permanent_original_archive"].startswith("research/p90-original-two-church-photos-20261029/")
    assert x["permanent_derivative_archive"].startswith("research/p90-original-two-church-photos-20261029/")
assert next(x for x in d["originals"] if x["global_review_row"]==376)["attribution_notice_required"]
assert not next(x for x in d["originals"] if x["global_review_row"]==384)["attribution_notice_required"]
print("P90 2 originals verified, full-frame inspected, exactly mapped to R49, 0 Place links or production media — PASS")
