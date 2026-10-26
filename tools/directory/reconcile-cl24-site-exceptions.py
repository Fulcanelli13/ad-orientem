#!/usr/bin/env python3
"""CL24: research-only resolution of the 15 held CL23 FSSP worship places.

Never writes to canonical_site, mass_time, real door coordinates, schedules,
or public maps. Building footprints and historic times are separate gates.
"""
import argparse
import csv
import json
import re
import sqlite3
from pathlib import Path

INPUT = Path("data/directory/research/cl24-fssp-15-site-resolution-20261026/evidence.json")
TYPES = {
    "OSM_NAMED_WORSHIP_BUILDING_WAY",
    "HERITAGE_NAMED_CHURCH_SITE_COORDINATE",
    "PUBLISHED_NAMED_CHURCH_SITE_COORDINATE",
}
def write_csv(path, records):
    if not records:
        raise AssertionError("empty report " + str(path))
    with path.open("w", newline="", encoding="utf-8") as fh:
        wr = csv.DictWriter(fh, fieldnames=list(records[0]))
        wr.writeheader()
        wr.writerows(records)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    opts = parser.parse_args()
    opts.out_dir.mkdir(parents=True, exist_ok=True)
    data = json.loads(INPUT.read_text(encoding="utf-8"))
    assert data["schema"] == "AO_CL24_FSSP_ALL_15_EXCEPTION_RESOLUTION_V1"
    refs = data["accepted_new_research_building_references"]
    holds = data["still_held"]
    assert len(refs) == 8 and len(holds) == 7
    assert len({x["source_place_id"] for x in refs + holds}) == 15
    assert {r["feature_type"] for r in refs} == TYPES
    assert sum(r["feature_type"] == "OSM_NAMED_WORSHIP_BUILDING_WAY" for r in refs) == 5
    assert {x["source_place_id"] for x in holds} == {
        "CL14-DE-FSSP-025", "CL14-DE-FSSP-028", "CL14-DE-FSSP-034",
        "CL14-DE-FSSP-035", "CL14-DE-FSSP-036", "CL14-DE-FSSP-037",
        "CL14-DE-FSSP-038"}
    db = sqlite3.connect(opts.db)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for tbl, number in (("canonical_site", 2584), ("mass_time", 4681),
                        ("cl17_owner_site_stage",39), ("cl17_accepted_mass_gates",256),
                        ("cl18_recurrence_rules",74),
                        ("cl20_building_spatial_candidate",6),
                        ("cl22_building_vs_door_research",2),
                        ("cl23_georeferenced_worship_object",17),
                        ("cl23_unlocated_pilot_site",15)):
        assert db.execute("SELECT COUNT(*) FROM " + tbl).fetchone()[0] == number, tbl
    original = {r["source_place_id"]: dict(r) for r in db.execute(
        "SELECT * FROM cl17_owner_site_stage")}
    cl23held = {r[0] for r in db.execute("SELECT source_place_id FROM cl23_unlocated_pilot_site")}
    assert {r["source_place_id"] for r in refs + holds} == cl23held
    for r in refs:
        assert r["feature_type"] in TYPES
        assert 47 < r["latitude"] < 55 and 6 < r["longitude"] < 14
        assert r["geometry_source_url"].startswith("https://")
        assert r["independent_identity_url"].startswith("https://")
        assert r["public_pin_approved"] is False
        assert r["surveyed_visitor_door_verified"] is False
        assert r["current_specific_Mass_occurrence_verified"] is False
        assert r["building_reference_research_only"] is True
        if r["feature_type"] == "OSM_NAMED_WORSHIP_BUILDING_WAY":
            assert isinstance(r["osm_way_id"], int) and r["osm_way_id"] > 0
            assert re.search(r"/W" + str(r["osm_way_id"]) + r"(?:$|[/?#])",
                             r["geometry_source_url"])
        else:
            assert r["osm_way_id"] is None
    for r in holds:
        assert r["building_geometry_unresolved"] is True
        assert r["public_pin_approved"] is False
        assert r["surveyed_visitor_door_verified"] is False
        assert r["current_specific_Mass_occurrence_verified"] is False
        assert r["source_url"].startswith("https://")
    op = data["high_priority_operational_exception"]
    assert op["source_place_id"] == "CL14-DE-FSSP-007"
    assert op["status"] == "CLOSURE_OR_VENUE_TRANSFER_UNVERIFIED_SOURCE_CONFLICT"
    assert op["historically_recorded_mass_patterns_retained"] is True
    assert op["no_published_future_dates"] is True
    assert op["future_venue_requires_positive_operator_dated_confirmation"] is True
    assert op["office_closure_is_not_church_closure"] is True
    assert op["primary_operator_timetable_url"].startswith("https://")
    with db:
        db.executescript("""
            CREATE TABLE cl24_research_building_reference (
              source_place_id TEXT PRIMARY KEY,
              latitude REAL NOT NULL CHECK(latitude BETWEEN 47 AND 55),
              longitude REAL NOT NULL CHECK(longitude BETWEEN 6 AND 14),
              grade TEXT NOT NULL,
              evidence_json TEXT NOT NULL,
              surveyed_door_approved INTEGER NOT NULL DEFAULT 0 CHECK(surveyed_door_approved=0),
              future_occurrence_approved INTEGER NOT NULL DEFAULT 0 CHECK(future_occurrence_approved=0),
              public_pin_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_pin_approved=0),
              FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
            CREATE TABLE cl24_remaining_spatial_hold (
              source_place_id TEXT PRIMARY KEY,
              blocker TEXT NOT NULL,
              evidence_json TEXT NOT NULL,
              public_pin_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_pin_approved=0),
              FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
            CREATE TABLE cl24_operational_exception (
              source_place_id TEXT PRIMARY KEY,
              operational_status TEXT NOT NULL,
              operator_evidence_json TEXT NOT NULL,
              future_occurrence_approved INTEGER NOT NULL DEFAULT 0 CHECK(future_occurrence_approved=0),
              FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        """)
        for r in refs:
            db.execute("INSERT INTO cl24_research_building_reference "
                "(source_place_id,latitude,longitude,grade,evidence_json) VALUES (?,?,?,?,?)",
                (r["source_place_id"],r["latitude"],r["longitude"],
                 r["feature_type"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
        for r in holds:
            db.execute("INSERT INTO cl24_remaining_spatial_hold "
                "(source_place_id,blocker,evidence_json) VALUES (?,?,?)",
                (r["source_place_id"],r["blocker"],
                 json.dumps(r,ensure_ascii=False,sort_keys=True)))
        db.execute("INSERT INTO cl24_operational_exception "
            "(source_place_id,operational_status,operator_evidence_json) VALUES (?,?,?)",
            (op["source_place_id"],op["status"],json.dumps(op,ensure_ascii=False,sort_keys=True)))
        assert db.execute("PRAGMA foreign_key_check").fetchall() == []
        assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        assert db.execute("SELECT COUNT(*) FROM canonical_site "
                          "WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0] == 0
        assert db.execute("SELECT COUNT(*) FROM classification_source "
                          "WHERE owner_verified_missal_1962=1").fetchone()[0] == 3
        assert db.execute("SELECT COUNT(*) FROM cl24_research_building_reference "
                          "WHERE public_pin_approved=1 OR surveyed_door_approved=1 "
                          "OR future_occurrence_approved=1").fetchone()[0] == 0
    support = {x["source_place_id"] for x in refs}
    left = {x["source_place_id"] for x in holds}
    cl23 = {x[0] for x in db.execute("SELECT source_place_id FROM cl23_georeferenced_worship_object")}
    cl20 = {x["source_place_id"]: bool(x["building_reference_supported"])
            for x in db.execute("SELECT * FROM cl20_building_spatial_candidate")}
    cl22 = {"CL17-DE-FSSP-POTSDAM"}
    supported = support | cl23 | {k for k,v in cl20.items() if v} | cl22
    spatial_conflicts = {k for k,v in cl20.items() if not v}
    assert len(supported) == 31 and len(spatial_conflicts) == 1
    assert len(left) == 7 and len(supported | spatial_conflicts | left) == 39
    assert not (supported & spatial_conflicts or supported & left or spatial_conflicts & left)
    rows = []
    for sid in sorted(original):
        d = original[sid]
        if sid in support: kind = "CL24_NEW_RESEARCH_NAMED_WORSHIP_PLACE"
        elif sid in cl23: kind = "CL23_RESEARCH_NAMED_WORSHIP_PLACE"
        elif sid in cl22: kind = "CL22_CORRECT_NAMED_CHAPEL_OBJECT"
        elif sid in spatial_conflicts: kind = "CL20_CONFLICT_HELD"
        elif sid in cl20: kind = "CL20_RESEARCH_BUILDING_REFERENCE"
        else: kind = "CL24_STILL_NO_SOURCE_NAMED_SPATIAL_POINT"
        rows.append({
            "source_place_id":sid,"name":d["owner_name"],"city":d["owner_city"],
            "original_address":d["owner_address"],"spatial_state":kind,
            "research_supported_building_reference":int(sid in supported),
            "spatial_conflict_held":int(sid in spatial_conflicts),
            "remaining_without_spatial_reference":int(sid in left),
            "operational_closure_exception":int(sid == op["source_place_id"]),
            "published_entrance_or_map_pin":0,"approved_future_mass_occurrence":0})
    assert len(rows) == 39
    write_csv(opts.out_dir/"cl24_8_new_building_references.csv",refs)
    write_csv(opts.out_dir/"cl24_7_spatial_holds.csv",holds)
    write_csv(opts.out_dir/"cl24_full_39_site_readiness.csv",rows)
    total_with_georef = 31
    report = {
        "schema":"AO_CL24_FSSP_39_SITE_SPATIAL_READINESS_V1",
        "pilot_frozen_sites":39,"cl23_spatial_exceptions_screened":15,
        "new_research_supported_named_building_references":8,
        "new_of_which_named_osm_worship_building_ways":5,
        "remaining_no_source_named_geospatial_reference":7,
        "research_supported_named_geospatial_references":total_with_georef,
        "existing_spatial_conflicts_held":1,
        "all_with_any_spatial_candidate_including_conflict":32,
        "one_operational_closure_conflict_for_manual_review":1,
        "provisional_alternate_worship_place_leads_without_admission":0,
        "pilot_historical_mass_row_patterns_unchanged":74,
        "source_1962_book_evidence_supported_unchanged":256,
        "source_1962_book_evidence_held_unchanged":176,
        "newly_approved_church_door_coordinates":0,
        "newly_approved_public_map_pins":0,
        "newly_approved_future_mass_instances":0,
        "newly_approved_una_cum":0}
    (opts.out_dir/"cl24_summary.json").write_text(
        json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS",**report},sort_keys=True))
    db.close()

if __name__ == "__main__":
    main()
