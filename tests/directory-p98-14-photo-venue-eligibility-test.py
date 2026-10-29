#!/usr/bin/env python3
"""P98: separate exact building identity, traditional-Mass eligibility, and photo rights."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
def load(path):
    return json.loads((root / path).read_text(encoding="utf-8"))

d = load("data/directory/research/p98-14-photo-venue-eligibility-gates-20261029.json")
p97 = load("data/directory/research/p97-14-hero-exterior-venue-place-release-queue-20261029.json")
p94 = load("data/directory/research/p94-28-original-photo-visual-qa-20261029.json")
r49 = load("data/directory/preliminary-map-r49.v1.json")
places = load("data/geography/seed-registry.v1.json")

assert d["schema"] == "AO_P98_FOURTEEN_DIRECTORY_PHOTO_TLM_ELIGIBILITY_RELEASE_GATES_V1"
assert len(d["records"]) == d["counts"]["candidates_assessed"] == 14
assert d["counts"]["r49_named_candidates"] == 11
assert d["counts"]["r49_missing"] == 3
assert d["counts"]["source_verified_missing_traditional_mass_venue_leads"] == 1
assert d["counts"]["missing_venues_with_current_1962_mass_not_established"] == 2
for k in ("new_directory_venues_created", "confirmed_place_links_added",
          "full_native_image_reviews_completed", "rights_independently_cleared",
          "media_approved", "media_published"):
    assert d["counts"][k] == 0, k

col = {x: i for i, x in enumerate(r49["columns"])}
rows = {row[col["id"]]: row for row in r49["records"]}
p97_by = {rec["global_review_row"]: rec for rec in p97["records"]}
p94_by = {rec["global_review_row"]: rec for rec in p94["records"]}
assert set(p97_by) == {x["global_review_row"] for x in d["records"]}
assert len(places["places"]) >= 518
assert not ({x["canonical_place_id"] for x in d["records"]} - {None})
verified_leads = []
held_missing = []
for x in d["records"]:
    q = p97_by[x["global_review_row"]]
    v = p94_by[x["global_review_row"]]
    assert x["church_name"] == q["church_name"]
    assert x["physical_anchor_id"] == q["physical_anchor_id"] == v["site_id"]
    assert x["original_sha1"] == q["original_sha1"] == v["source_original_sha1"]
    assert x["original_sha256"] == q["original_sha256"] == v["downloaded_original_sha256"]
    assert x["source_claimed_license"] == v["source_licence_claim"]
    assert x["original_source_bytes_hash_verified"]
    assert not any((x["native_original_manually_inspected_for_release"],
                    x["rights_independently_approved"], x["new_directory_venue_created"],
                    x["photo_approved"], x["published"]))
    assert x["venue_id"] == q["r49_venue_id"]
    if x["venue_id"]:
        rr = rows[x["venue_id"]]
        assert rr[col["name"]].casefold() == x["church_name"].casefold()
        assert rr[col["country"]] == x["country"]
        assert x["r49_geo_precision"] == rr[col["precision"]]
        assert x["venue_identity_gate"] == "EXISTING_R49_NAME_COUNTRY_MATCH_NEEDS_EXACT_SITE_PHOTO_VALIDATION"
        assert x["tlm_eligibility"] == "EXISTING_DIRECTORY_CLAIM_PRESERVED_NOT_NEWLY_AUDITED"
    else:
        assert x["venue_identity_gate"] == "NO_R49_VENUE_NAME_COUNTRY_MATCH"
        assert x["r49_geo_precision"] is None
        if x["tlm_eligibility"] == "SOURCE_VERIFIED_CURRENT_1962_TRADITIONAL_MASS_VENUE_LEAD":
            verified_leads.append(x)
        else:
            assert x["tlm_eligibility"] == "HOLD_1962_MASS_NOT_ESTABLISHED"
            held_missing.append(x)
assert len(verified_leads) == 1 and verified_leads[0]["global_review_row"] == 127
n = verified_leads[0]
assert n["official_schedule_url"].startswith("https://icksp.org.uk/newbrighton/")
assert "1390763" in n["physical_identity_url"]
assert n["operator_address_url"].startswith("https://icksp.org.uk/newbrighton/")
assert n["geo_lead"]["precision"] == "HERITAGE_RECORD_APPROXIMATE_POINT_NOT_SITE_SURVEY"
assert n["potential_false_duplicate"]["venue_id"] in rows
assert n["potential_false_duplicate"]["disposition"] == "DISTINCT_DO_NOT_AUTO_JOIN"
assert {x["global_review_row"] for x in held_missing} == {61, 284}
assert d["release_safety"]["latin_chant_not_equivalent_to_1962_mass"]
assert d["release_safety"]["never_link_different_named_church_by_nearby_coordinate"]
print("P98 PASS: 14 candidates, one verified unlisted TLM church, two unestablished, zero publication")
