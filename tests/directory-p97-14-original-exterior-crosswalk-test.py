#!/usr/bin/env python3
"""P97 strict source-P94-to-R49 *candidate* reconciliation, not release."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
load=lambda p:json.loads((root/p).read_text(encoding="utf8"))
j=load("data/directory/research/p97-14-hero-exterior-venue-place-release-queue-20261029.json")
p=load("data/directory/research/p94-28-original-photo-visual-qa-20261029.json")
r=load("data/directory/preliminary-map-r49.v1.json")
assert j["schema"]=="AO_P97_PROMISING_14_EXTERIORS_EXACT_VENUE_RECONCILIATION_V1"
assert len(j["records"])==j["counts"]["promising_exteriors"]==14
cols={x:i for i,x in enumerate(r["columns"])}
assert len({x["global_review_row"] for x in j["records"]})==14
assert j["counts"]["exact_named_r49_candidate"]==11
assert j["counts"]["needs_r49_reconciliation"]==3
assert j["counts"]["confirmed_new_links"]==j["counts"]["approved_media"]==j["counts"]["published"]==0
ref={x["global_review_row"]:x for x in p["records"]}
for x in j["records"]:
 y=ref[x["global_review_row"]]
 assert y["visual_disposition"]=="PROMISING_PRIMARY_EXTERIOR"
 assert x["original_sha1"]==y["source_original_sha1"]
 assert x["original_sha256"]==y["downloaded_original_sha256"]
 assert x["physical_anchor_id"]==y["site_id"]
 matches=[row for row in r["records"] if str(row[cols["name"]]).strip().casefold()==x["church_name"].casefold() and row[cols["country"]]==x["country"]]
 assert len(matches)==x["r49_exact_name_country_candidate_count"]
 assert x["r49_venue_id"]==(matches[0][cols["id"]] if len(matches)==1 else None)
 assert x["place_link_status"]=="HOLD_EXACT_PHYSICAL_PLACE_LINK"
 assert not x["photo_approved"] and not x["published"] and not x["native_original_inspected_for_publication"]
assert j["policy"]["no_name_only_confirmed_place_links"]
print("P97 PASS: 14 source originals, 11 name/country R49 candidates, 3 venue holds, zero inferred publication")
