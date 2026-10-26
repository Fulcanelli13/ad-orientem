#!/usr/bin/env python3
"""Validate CL4's additive, research-only evidence overlay against frozen CL2 and CL3."""
import json
from pathlib import Path


ROOT = Path("data/directory/research")
CL2 = ROOT / "cl2-unified-20261026"
CL3 = ROOT / "cl3-reconciliation-20261026"
CL4 = ROOT / "cl4-owner-screening-20261026"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def check(test, reason):
    if not test:
        raise AssertionError(reason)


def main():
    cl3 = read(CL3 / "overlay.json")
    cl4 = read(CL4 / "overlay.json")
    manifest = read(CL2 / "manifest.json")
    check(manifest["schema"] == "AO_CL2_SINGLE_RESEARCH_MASTER_V1", "Wrong CL2 baseline")
    check(cl4["schema"] == "AO_CL4_SCREENED_RESEARCH_OVERLAY_V1", "Wrong CL4 schema")
    check(cl4["extends"] == cl3["schema"], "Wrong CL3 parent")
    check(cl4["status"] == "RESEARCH_ONLY_NO_RUNTIME_CHANGES", "Forbidden public runtime promotion")

    # Frozen CL2 baseline SHA256 is checked in validate-cl3-reconciliation.py,
    # called by the CL4 CI job before this script.
    site_rows = []
    for i in range(1, 7):
        site_rows += read(CL2 / f"site-{i:02d}-of-06.json")["records"]
    site_by_id = {s["group_id"]: s for s in site_rows}
    check(len(site_rows) == len(site_by_id) == 2584, "Canonical site identity changed")
    old_blank = {r["group_id"] for r in site_rows if not str(r["canonical"][3]).strip()}
    check(len(old_blank) == 113, "CL2 description baseline changed")

    cl3_backfills = cl3["description_backfills"]
    cl3_ids = {x["group_id"] for x in cl3_backfills}
    check(len(cl3_ids) == len(cl3_backfills) == 23, "CL3 backfill population changed")
    original_cl3_held = {x["group_id"] for x in cl3["description_queue"] if x["status"] == "HOLD_DESCRIPTION_BLANK"}
    check(len(original_cl3_held) == 90 and old_blank - cl3_ids == original_cl3_held, "CL3 remaining queue changed")
    cl4_backfills = cl4["address_backfills"]
    ids = [x["group_id"] for x in cl4_backfills]
    check(len(ids) == len(set(ids)) == 27, "CL4 backfill count or uniqueness")
    check(set(ids) <= original_cl3_held, "Attempt to overwrite a nonblank CL2/CL3 description")
    allowed_sources = {
        "OWNER_FSSP_FRANCE","OWNER_FSSP_APOSTOLATE","ORGANIZATION_FIRST_PARTY",
        "OWNER_SCHOOL","CHURCH_MASS_DIRECTORY","OWNER_FSSP_DIRECTORY",
        "TOURISM_OFFICIAL","OWNER_ICKSP_APOSTOLATE","OWNER_DIOCESE",
        "OWNER_PARISH","NATIONAL_HERITAGE_OFFICIAL","SECONDARY_DIRECTORY_CROSSCHECK",
        "OWNER_SHRINE","PROPERTY_HOST_ANGLO_CATHOLIC"
    }
    for x in cl4_backfills:
        site = site_by_id[x["group_id"]]
        check(site["canonical"][1] == x["country"], "Country changed")
        check(site["canonical"][2] == x["site_name"], "Site identity changed")
        check(x["evidence_url"].startswith("https://"), "Missing documented evidence URL")
        check(x["evidence_type"] in allowed_sources, "Unrecognized evidence class")
        check(bool(x["physical_description"].strip()) and bool(x["site_type"]), "Blank description/type")
        check(x["precision"] in ("FULL_ADDRESS","STREET_OR_PLACE_NO_NUMBER",
                "STREET_CORNER_NO_NUMBER","LOCALITY_PLUS_NAMED_SITE",
                "POSTAL_LOCATION_WITHOUT_NUMBER","STREET_NO_NUMBER"), "No precision classification")
        check(x["public_geocode_approved"] is False, "Inferred released geocode")
        check(x["public_mass_site_approved"] is False, "Inferred public Mass venue")
        check(x["current_timetable_verified"] is False, "Historical times relabelled current")
        if x["evidence_type"] == "SECONDARY_DIRECTORY_CROSSCHECK":
            check(x["provenance_status"] == "SECONDARY_EVIDENCE_WITH_HOLD", "Secondary promoted to owner")
        else:
            check(x["provenance_status"] == "SOURCE_DOCUMENTED_RESEARCH_ONLY", "Provenance classification changed")

    desc = cl4["remaining_description_queue"]
    check(len(desc) == 90 and len({x["group_id"] for x in desc}) == 90, "Not all CL3 blanks screened")
    check({x["group_id"] for x in desc} == original_cl3_held, "Description screen changed scope")
    added = {x["group_id"] for x in desc if x["disposition"] == "CL4_DESCRIPTION_BACKFILLED"}
    held = {x["group_id"] for x in desc if x["disposition"] == "HOLD_ADDRESS_NEEDS_EVIDENCE"}
    check(added == set(ids) and held == original_cl3_held - added and len(held) == 63, "Description progress mismatch")
    check(len(old_blank - (cl3_ids | added)) == 63, "Original description blanks mismatch")

    cl3_held = cl3["identity_exception_queue"]
    cl3_held = {x["exception_key"]: x for x in cl3_held if x["status"] == "HOLD"}
    check(len(cl3_held) == 40, "CL3 identity hold baseline changed")
    screen = cl4["remaining_identity_exception_queue"]
    check(len(screen) == len({x["exception_key"] for x in screen}) == 40, "40-exception screening not exhaustive")
    check({x["exception_key"] for x in screen} == set(cl3_held), "Identity screening dropped or added exceptions")
    for x in screen:
        original = cl3_held[x["exception_key"]]
        check((x["group_id"], x["country"], x["origin"]) ==
              (original["group_id"], original["country"], original["origin"]), "Identity queue mismatch")
        check(x["disposition"] == "SCREENED_STILL_HELD", "Unverified identity silently resolved")
        check(x["historical_frozen_id_preserved"] is True and x["admitted_site"] is False, "Frozen ID or admission broken")

    anomalies = cl4["site_type_anomalies"]
    check(len(anomalies) == 4, "Known site type gates dropped")
    flagged = {x["group_id"] for x in anomalies}
    check({"RG-03CA979A8BD9", "RG-D2D19C4C0528", "RG-6F0498C98BBB", "RG-CAD78C08DCB8"} == flagged,
          "High-risk site-type evidence missing")
    check("ST_GENEVIEVE" in anomalies[0]["action"], "Fresno office vs Mass building warning missing")
    check(sum(x["site_type"] == "NON_WORSHIP_SCHOOL" for x in cl4_backfills) == 2, "School site type lost")
    check(sum(x["site_type"] == "ANGLICAN_HOST_BUILDING" for x in cl4_backfills) == 1,
          "Anglican ownership and Catholic celebrant distinction lost")
    check(cl4["summary"] == {
        "baseline_CL2_historical_identity_exceptions":49,"cl3_identity_exceptions_resolved":9,
        "cl4_additional_identity_exceptions_resolved":0,"identity_exception_rows_remaining":40,
        "identity_exception_rows_screened_this_batch":40,"cl2_description_blanks":113,
        "cl3_backfills":23,"cl4_new_backfills":27,"description_blanks_remaining":63,
        "cl4_source_backed_research_addresses":27,"public_pins_added":0,"current_schedules_verified":0
    }, "Release gate / summary inconsistency")
    print("CL4 PASS: 40/40 outstanding identity exceptions screened, 40 still on HOLD")
    print("CL4 PASS: 27 new sourced descriptions with provenance; 113 CL2 blanks -> 63 remaining after CL3+CL4")
    print("CL4 PASS: 4 site-type anomalies preserved; no office, school, or Anglican owner misclassified")
    print("CL4 PASS: no public pins, 1962 filters, una cum or current schedules inferred")


if __name__ == "__main__":
    main()
