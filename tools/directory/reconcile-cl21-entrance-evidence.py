#!/usr/bin/env python3
"""CL21: entrance evidence and WRONG-OBJECT vetoes for seven FSSP sites.

The programme deliberately distinguishes a photograph/architectural entrance
description, vehicle campus access, the exterior church door's surveyed
coordinates, and effective liturgical visitor access. No live output is
published and no upstream source or canonical master is altered.
"""
import argparse
import csv
import json
import sqlite3
from pathlib import Path

INPUT=Path("data/directory/research/cl21-entrance-evidence-20261026/entrance-observations.json")
GRADES={
 "ARCHITECTURAL_PORTAL_SIDE_DOCUMENTED_NOT_GPS",
 "OWNER_ARCHITECTURAL_MAIN_PORTAL_AND_HISTORIC_ALTERNATE",
 "PORTAL_EXISTS_FACE_NOT_IDENTIFIED",
 "STREET_APPROACH_DOCUMENTED_EXTERIOR_DOOR_UNLOCATED",
 "CEMETERY_ACCESS_AND_CHURCH_ADDRESS_UNRESOLVED",
 "SAME_TOWN_TWO_BUILDINGS_EXACT_ROOM_UNLOCATED",
 "SEPARATE_HISTORIC_CHAPEL_DOOR_VISUALLY_DESCRIBED",
}
ARCHITECTURAL={"ARCHITECTURAL_PORTAL_SIDE_DOCUMENTED_NOT_GPS",
 "OWNER_ARCHITECTURAL_MAIN_PORTAL_AND_HISTORIC_ALTERNATE",
 "SEPARATE_HISTORIC_CHAPEL_DOOR_VISUALLY_DESCRIBED"}
def writecsv(path,records):
    assert records
    fields=sorted({k for r in records for k in r})
    with path.open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--db",required=True,type=Path)
    parser.add_argument("--out-dir",required=True,type=Path)
    a=parser.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    data=json.loads(INPUT.read_text(encoding="utf-8"))
    assert data["schema"]=="AO_CL21_ENTRANCE_EVIDENCE_GRADES_V1"
    assert data["as_of"]=="2026-10-26"
    records=data["reviews"]
    exclusions=data["excluded_wrong_target_objects"]
    assert len(records)==7 and len(exclusions)==5
    assert len({r["source_place_id"] for r in records})==7
    assert len({(r["source_place_id"],r["excluded_label"]) for r in exclusions})==5
    assert {r["entrance_evidence_grade"] for r in records}==GRADES
    assert sum(r["entrance_evidence_grade"] in ARCHITECTURAL for r in records)==3

    conn=sqlite3.connect(a.db)
    conn.row_factory=sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    expected={
       "canonical_site":2584,"mass_time":4681,
       "cl17_owner_site_stage":39,"cl17_accepted_mass_gates":256,
       "cl18_recurrence_rules":74,"cl19_second_source_review":27,
       "cl20_building_spatial_candidate":6,"cl20_rejected_object_hypothesis":1
    }
    for table,n in expected.items():
        found=conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        assert found==n,(table,found,n)
    stage={r["source_place_id"]:dict(r) for r in conn.execute("SELECT source_place_id,historical_group_id,owner_name,owner_city,owner_address FROM cl17_owner_site_stage")}
    assert len(stage)==39
    prior_sites={r["source_place_id"] for r in conn.execute("SELECT source_place_id FROM cl20_building_spatial_candidate")}
    assert len(prior_sites)==6
    expected_set=prior_sites|{"CL17-DE-FSSP-POTSDAM"}
    assert {r["source_place_id"] for r in records}==expected_set
    observations=[]
    for r in records:
        sid=r["source_place_id"]
        assert sid in stage
        assert r["entrance_evidence_grade"] in GRADES
        assert r["evidence"] and all(
            e["url"].startswith("https://") and e["attested_fact"] and
            e["checked_on"]=="2026-10-26" for e in r["evidence"])
        assert r["entrance_coordinate_latitude"] is None
        assert r["entrance_coordinate_longitude"] is None
        assert all(r[k] is False for k in [
          "actual_worship_door_gps_verified",
          "door_usable_during_future_mass_verified",
          "approved_public_direction",
          "approved_public_map_pin"])
        if sid=="CL17-DE-FSSP-POTSDAM":
            assert "Raum der Stille" in " ".join(r["unresolved_risks"]+r["identifying_landmarks"]) or "RAUM_DER_STILLE" in " ".join(r["unresolved_risks"])
            assert conn.execute("SELECT COUNT(*) FROM cl17_potsdam_identity WHERE row_no=20 AND distinct_venues=0").fetchone()[0]==1
        source=stage[sid]
        geo=conn.execute("SELECT research_latitude,research_longitude,building_reference_supported,grade FROM cl20_building_spatial_candidate WHERE source_place_id=?",(sid,)).fetchone()
        if sid=="CL17-DE-FSSP-POTSDAM":
            assert geo is None
        else:assert geo is not None
        observations.append({
          "source_place_id":sid,
          "historical_group_id":source["historical_group_id"],
          "owner_church_name":source["owner_name"],
          "owner_city":source["owner_city"],
          "original_owner_address":source["owner_address"],
          "church_building_reference_latitude":geo["research_latitude"] if geo else "",
          "church_building_reference_longitude":geo["research_longitude"] if geo else "",
          "building_reference_supported":geo["building_reference_supported"] if geo else 0,
          "observed_entrance_evidence_grade":r["entrance_evidence_grade"],
          "architecture_or_external_door_identifiable":int(r["entrance_evidence_grade"] in ARCHITECTURAL),
          "building_side_or_architectural_clue":r["architectural_entry_description"],
          "owner_vehicle_access_routing_statement":r["operator_access_description"],
          "research_navigation_note_not_published":r["narrative_routing_instruction"],
          "landmark_terms":";".join(r["identifying_landmarks"]),
          "important_risks":";".join(r["unresolved_risks"]),
          "provenance_urls":";".join(e["url"] for e in r["evidence"]),
          "primary_followup":r["next_editorial_gate"],
          "surveyed_actual_worship_door_coordinate":0,
          "current_operational_entry_confirmed":0,
          "approved_for_public_map_pin":0,
          "approved_for_public_directions":0,
          "approved_current_mass_event":0,
        })
    assert len(observations)==7
    assert sum(r["architecture_or_external_door_identifiable"] for r in observations)==3
    bad={r["source_place_id"]:r for r in exclusions}
    assert {"CL17-DE-FSSP-POTSDAM","CL14-DE-FSSP-026","CL14-DE-FSSP-017","CL14-DE-FSSP-022","CL14-DE-FSSP-029"}==set(bad)
    for e in exclusions:
        assert e["source_place_id"] in stage
        assert e["reason"]
        assert e["evidence_url"].startswith("https://")
        if e["source_place_id"]=="CL17-DE-FSSP-POTSDAM":
            assert e["excluded_osm_way_id"]==31290074
            assert conn.execute("SELECT COUNT(*) FROM cl20_rejected_object_hypothesis WHERE source_place_id=? AND candidate_osm_way_id=31290074 AND map_object_confirmed_as_mass_chapel=0",(e["source_place_id"],)).fetchone()[0]==1
    with conn:
        conn.executescript("""
        CREATE TABLE cl21_entrance_evidence (
           source_place_id TEXT PRIMARY KEY,
           historical_group_id TEXT NOT NULL,
           grade TEXT NOT NULL,
           architectural_entry_identified INTEGER NOT NULL CHECK(architectural_entry_identified IN (0,1)),
           evidence_json TEXT NOT NULL,
           actual_door_gps_approved INTEGER NOT NULL DEFAULT 0 CHECK(actual_door_gps_approved=0),
           operational_access_approved INTEGER NOT NULL DEFAULT 0 CHECK(operational_access_approved=0),
           public_directions_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_directions_approved=0),
           public_pin_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_pin_approved=0),
           FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl21_excluded_wrong_target (
           source_place_id TEXT NOT NULL,target_label TEXT NOT NULL,
           excluded_osm_way_id INTEGER,
           evidence_url TEXT NOT NULL,
           reason TEXT NOT NULL,
           confirmed_as_mass_door INTEGER NOT NULL DEFAULT 0 CHECK(confirmed_as_mass_door=0),
           public_pin_allowed INTEGER NOT NULL DEFAULT 0 CHECK(public_pin_allowed=0),
           PRIMARY KEY(source_place_id,target_label),
           FOREIGN KEY(source_place_id) REFERENCES cl21_entrance_evidence(source_place_id));
        """)
        for r in observations:
            conn.execute("INSERT INTO cl21_entrance_evidence (source_place_id,historical_group_id,grade,architectural_entry_identified,evidence_json) VALUES (?,?,?,?,?)",(
               r["source_place_id"],r["historical_group_id"],r["observed_entrance_evidence_grade"],r["architecture_or_external_door_identifiable"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
        for e in exclusions:
            conn.execute("INSERT INTO cl21_excluded_wrong_target (source_place_id,target_label,excluded_osm_way_id,evidence_url,reason) VALUES(?,?,?,?,?)",(
               e["source_place_id"],e["excluded_label"],e["excluded_osm_way_id"],e["evidence_url"],e["reason"]))
        assert conn.execute("SELECT COUNT(*) FROM cl21_entrance_evidence").fetchone()[0]==7
        assert conn.execute("SELECT COUNT(*) FROM cl21_excluded_wrong_target").fetchone()[0]==5
        assert conn.execute("SELECT COUNT(*) FROM cl21_entrance_evidence WHERE architectural_entry_identified=1").fetchone()[0]==3
        assert conn.execute("SELECT COUNT(*) FROM cl21_entrance_evidence WHERE actual_door_gps_approved=1 OR operational_access_approved=1 OR public_directions_approved=1 OR public_pin_approved=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM cl21_excluded_wrong_target WHERE confirmed_as_mass_door=1 OR public_pin_allowed=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert conn.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not conn.execute("PRAGMA foreign_key_check").fetchall()
    writecsv(a.out_dir/"cl21_seven_entrance_and_approach_evidence_grades.csv",observations)
    writecsv(a.out_dir/"cl21_five_explicit_wrong_object_exclusions.csv",exclusions)
    summary={
      "schema":"AO_CL21_CHURCH_ENTRY_AND_WRONG_TARGET_VETO_V1",
      "as_of":"2026-10-26",
      "original_owner_site_pilot":39,
      "original_1962_book_evidence_supported_rows":256,
      "original_book_candidate_holds":176,
      "CL20_source_geocoded_building_candidates_unchanged":6,
      "CL20_building_points_research_supported":5,
      "entry_route_site_reviews":7,
      "exterior_architectural_portal_or_main_door_identification_records":3,
      "wrong_place_or_not_an_exterior_church_door_explicitly_excluded":5,
      "Potsdam_Raum_der_Stille_separate_Auferstehungskapelle_confirmed_by_hospital":True,
      "Potsdam_vehicle_campus_entry_Zimmerstrasse_6_verified":True,
      "Amberg_St_Augustinus_southwest_portal_identified":True,
      "Amberg_Maria_Hilf_main_stair_portal_2020_side_entrance_exception_recorded":True,
      "Eichstaett_three_holy_sepulchre_doors_not_exterior_church_entrances":True,
      "Bad_Groenenbach_Ringeisenhaus_not_adjacent_castle":True,
      "new_verified_door_level_coordinates":0,
      "new_operational_mass_entrance_approvals":0,
      "new_published_direction_records":0,
      "new_public_map_pins":0,
      "new_confirmed_future_mass_schedules":0,
      "new_una_cum":0,
      "next_actions":[
       "Verify door GPS for the southwest architectural portal of Amberg St Augustinus against a church polygon and geotagged operator/field imagery; do not substitute historic-marker coordinates.",
       "Ask/operator-check which Maria Hilf portal is open for current FSSP Masses; a 2020 side-door COVID exception is not contemporary routing.",
       "Find true historic St Josefs chapel footprint and arch door on Alexianer campus; remove Raum der Stille / Auferstehungskapelle feature from any auto-match.",
       "Locate Schlosskapelle entry specifically inside front of Ringeisenhaus; exclude Hohes Schloss landmark.",
       "Treat Eichstaett inner Holy Sepulchre door descriptions as irrelevant for church exterior portal mapping."
      ]
    }
    (a.out_dir/"cl21_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","reviewed":7,"architectural_entry_identifications":3,
      "wrong_object_vetoes":5,"approved_door_gps":0,"public_pins":0},sort_keys=True))
    conn.close()
if __name__=="__main__":main()
