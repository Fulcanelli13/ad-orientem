#!/usr/bin/env python3
"""Validate CL7's source-backed physical descriptions against frozen CL2–CL6."""
import hashlib
import json
from pathlib import Path

ROOT=Path("data/directory/research")
def load(path):
    return json.loads(path.read_text(encoding="utf-8"))
def require(condition,message):
    if not condition: raise AssertionError(message)

def main():
    root2=ROOT/"cl2-unified-20261026"
    manifest=load(root2/"manifest.json")
    c3=load(ROOT/"cl3-reconciliation-20261026/overlay.json")
    c4=load(ROOT/"cl4-owner-screening-20261026/overlay.json")
    c5=load(ROOT/"cl5-provisional-intake-20261026/overlay.json")
    c6=load(ROOT/"cl6-source-reconciliation-20261026/overlay.json")
    c7=load(ROOT/"cl7-final-description-screen-20261026/overlay.json")
    require(c7["schema"]=="AO_CL7_FINAL_GAPS_RESEARCH_OVERLAY_V1","Unexpected CL7 schema")
    require(c7["extends"]==c6["schema"],"CL7 references wrong CL6 baseline")
    require(c7["release_state"]=="RESEARCH_ONLY_NOT_PUBLIC_NO_CANONICAL_CHANGE","Public release not authorized")
    original=[]
    for part in manifest["shards"]["site"]:
        raw=(root2/part["path"]).read_bytes()
        require(hashlib.sha256(raw).hexdigest()==part["sha256"],"CL2 source shard modified")
        original += json.loads(raw)["records"]
    byid={x["group_id"]:x for x in original}
    require(len(original)==len(byid)==2584,"CL2 historical site identities altered")
    require(len({s["effective_anchor_id"] for s in original})==2579,"CL2 effective anchors altered")
    original_blank={s["group_id"] for s in original if not str(s["canonical"][3]).strip()}
    require(len(original_blank)==113,"CL2 initial physical-description population changed")
    c3ids={x["group_id"] for x in c3["description_backfills"]}
    c4ids={x["group_id"] for x in c4["address_backfills"]}
    c5ids={x["historical_group_id"] for x in c5["additional_address_backfills"]}
    c6ids={x["historical_group_id"] for x in c6["location_backfills"]}
    prior=c3ids | c4ids | c5ids | c6ids
    require([len(c3ids),len(c4ids),len(c5ids),len(c6ids)]==[23,27,5,9],"Previous backfill populations changed")
    require(len(prior)==64 and prior<=original_blank,"Prior backfill duplicate or non-original site")
    waiting=original_blank-prior
    require(len(waiting)==49,"Expected 49 original CL6 description gaps")
    c7r=c7["description_backfills"]
    c7ids=[x["historical_group_id"] for x in c7r]
    require(len(c7r)==len(set(c7ids))==13,"CL7 backfills missing or duplicated")
    require(set(c7ids)<=waiting,"CL7 attempted to overwrite existing physical descriptions")
    allowed_class={"SECONDARY_GEOLOCATED_BUILDING_REGISTRY","SPECIALIST_VENUE_LOCATION",
                   "OPENSTREETMAP_BUILDING_GEOMETRY","HISTORICAL_DIOCESAN_DIRECTORY",
                   "ONTARIO_HERITAGE_TRUST","CATHOLIC_SCHOOL_BOARD_PARISH_DIRECTORY",
                   "MUNICIPAL_TOURISM_OFFICIAL","ARCHDIOCESE_PROPERTY_REGISTER",
                   "SPECIALIST_TRADITIONAL_MASS_DIRECTORY",
                   "BERGAMO_TOURISM_OFFICIAL","GENOA_METROPOLITAN_GOVERNMENT","ICKSP_FIRST_PARTY"}
    for row in c7r:
        s=byid[row["historical_group_id"]]
        require(row["site_name"]==s["canonical"][2] and row["country"]==s["canonical"][1],
                "CL7 description attached to the wrong site")
        require(row["original_anchor_id"]==s["effective_anchor_id"],"CL7 anchor changed")
        require(row["source_url"].startswith("https://"),"No stable evidence URL")
        require(row["evidence_class"] in allowed_class,"Unclassified physical source")
        require(row["physical_description"].strip() and row["physical_site_type"],"Empty physical evidence")
        require(row["precision"] in ("STREET_NAME_ONLY","POSTAL_NUMBER","NAMED_CAMPUS_NO_NUMBER","POSTAL_RANGE"),
                "Unjustified geocode precision")
        require(row["verified_2026_schedule"] is False and row["geocode_public_approved"] is False and
                row["identity_public_admitted"] is False,"CL7 promoted unverified Mass/site")
    q=c7["description_queue"]
    require(len(q)==49 and len({x["group_id"] for x in q})==49,"Description screen incomplete")
    require({x["group_id"] for x in q}==waiting,"Original CL6 description gaps lost")
    docs={x["group_id"] for x in q if x["review_disposition"]=="CL7_SOURCE_BACKED_DESCRIPTION"}
    holds={x["group_id"] for x in q if x["review_disposition"]=="HOLD_MISSING_SUFFICIENT_PHYSICAL_DESCRIPTION"}
    require(docs==set(c7ids) and holds==waiting-docs and len(holds)==36,"Backfill disposition mismatch")
    queue=c7["identity_exception_queue"]
    old={x["exception_key"] for x in c6["identity_queue"]}
    require(len(queue)==40 and {x["exception_key"] for x in queue}==old,"Identity exception history changed")
    require(all(x["cl7_review_state"]=="OPEN_NO_NEW_GROUP_JOIN" and
                x["promote_to_canonical"] is False for x in queue),"Unproven identity admission")
    ten=c7["ten_b92_source_only_review_holds"]
    oldten={x["frozen_group_id"] for x in c6["classification_only_source_review"]
            if not x["additional_evidence_url"]}
    require(len(ten)==10 and len({x["historical_group_id"] for x in ten})==10
            and {x["historical_group_id"] for x in ten}==oldten,"Residual 10 B92 queue changed")
    require(all(x["canonical_admission"]=="HOLD" for x in ten),"B92 hold improperly lifted")
    hazards=c7["release_hazards"]
    require(len(hazards)==6 and len({x["group_id"] for x in hazards})==6,"CL7 hazards missing")
    require({x["group_id"] for x in hazards} <= set(c7ids),"Safeguard doesn't match a CL7 site")
    require(c7["summary"]=={
       "cl6_remaining_description_blanks":49,
       "cl7_description_backfills":13,
       "description_blanks_after_cl7":36,
       "initial_missing_descriptions_806_documented":770,
       "original_CL2_physical_site_anchors_unchanged":2579,
       "original_identity_exception_flags_open":40,
       "original_unverified_independent_B92_cases_still_held":10,
       "current_mass_timetables_promoted":0,"public_places_promoted":0
       },"CL7 counts drifted")
    print("CL7 PASS: 13 sourced descriptions, original 49 gaps -> 36 remaining")
    print("CL7 PASS: 770/806 original blanks now have research descriptions")
    print("CL7 PASS: 40 original identity flags, 10 source-only holds and 6 hazards preserved")
    print("CL7 PASS: 2,579 physical anchors unchanged, zero public pins/current timetables")

if __name__=="__main__": main()
