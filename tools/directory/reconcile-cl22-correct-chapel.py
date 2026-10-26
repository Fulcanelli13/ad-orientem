#!/usr/bin/env python3
"""CL22: correctly named Potsdam church footprint and Amberg photo-marker vicinity.

An OSM church-way reference is a building candidate, never a surveyed doorway.
Preserves the explicit CL20/CL21 veto on nearby Raum der Stille, a separate
chapel. This script adds TWO research-only records and touches no runtime data.
"""
import argparse
import csv
import json
import math
from pathlib import Path
import sqlite3

INPUT=Path("data/directory/research/cl22-correct-chapel-20261026/spatial-witnesses.json")
def metres(lat1,lon1,lat2,lon2):
    R=6371000
    p1,p2=map(math.radians,(lat1,lat2))
    dp=p2-p1; dl=math.radians(lon2-lon1)
    a=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.atan2(math.sqrt(a),math.sqrt(1-a))
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--out-dir",type=Path,required=True)
    a=p.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    data=json.loads(INPUT.read_text(encoding="utf-8"))
    assert data["schema"]=="AO_CL22_CORRECT_CHAPEL_BUILDING_AND_PORTAL_VICINITY_V1"
    assert data["as_of"]=="2026-10-26"
    rows=data["records"]
    assert len(rows)==2 and len({r["source_place_id"] for r in rows})==2
    by_id={r["source_place_id"]:r for r in rows}
    pots=by_id["CL17-DE-FSSP-POTSDAM"]
    amb=by_id["CL14-DE-FSSP-030"]
    assert pots["outcome"]=="CORRECT_MASS_CHAPEL_BUILDING_REFERENCE_SUPPORTED"
    assert amb["outcome"]=="SOUTHWEST_PORTAL_PHOTO_MARKER_VICINITY_NOT_DOOR"
    assert "way 301020129" in pots["research_building"]["source_map_feature"]
    assert "way 31290074" in pots["wrong_nearby_target"]["source_map_feature"]
    assert "way 52739490" in amb["research_building"]["source_map_feature"]
    assert pots["research_building"]["source_url"]=="https://mapcarta.com/W301020129"
    assert amb["historical_marker_vicinity"]["source_url"]=="https://www.hmdb.org/m.asp?m=242442"
    assert all(r["actual_door_point"] is None and
               r["door_coordinate_surveyed"] is False and
               r["operational_door_verified"] is False and
               r["site_publication_approved"] is False and
               r["current_mass_approved"] is False for r in rows)
    assert data["overall_policy"]=={
       "research_building_points_new":1,
       "portal_vicinity_markers_new":1,
       "public_doors_new":0,"public_pins_new":0,
       "verified_future_events_new":0,"una_cum_new":0}
    false=pots["wrong_nearby_target"]
    pb=pots["research_building"]
    am=amb["research_building"]
    mk=amb["historical_marker_vicinity"]
    wrong_dist=metres(pb["lat"],pb["lon"],false["lat"],false["lon"])
    marker_dist=metres(am["lat"],am["lon"],mk["lat"],mk["lon"])
    assert 15<wrong_dist<25,wrong_dist
    assert 15<marker_dist<30,marker_dist
    db=sqlite3.connect(a.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for table,expected in (("canonical_site",2584),("mass_time",4681),
        ("cl17_owner_site_stage",39),("cl17_accepted_mass_gates",256),
        ("cl18_recurrence_rules",74),("cl19_second_source_review",27),
        ("cl20_building_spatial_candidate",6),("cl20_rejected_object_hypothesis",1),
        ("cl21_entrance_evidence",7),("cl21_excluded_wrong_target",5)):
        n=db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        assert n==expected,(table,n,expected)
    for sid in by_id:
        assert db.execute("SELECT COUNT(*) FROM cl17_owner_site_stage WHERE source_place_id=?",(sid,)).fetchone()[0]==1
        assert db.execute("SELECT COUNT(*) FROM cl21_entrance_evidence WHERE source_place_id=? AND actual_door_gps_approved=0 AND public_pin_approved=0",(sid,)).fetchone()[0]==1
    assert db.execute("SELECT COUNT(*) FROM cl20_building_spatial_candidate WHERE source_place_id=?",(pots["source_place_id"],)).fetchone()[0]==0
    assert db.execute("SELECT COUNT(*) FROM cl20_building_spatial_candidate WHERE source_place_id=? AND building_reference_supported=1",(amb["source_place_id"],)).fetchone()[0]==1
    assert db.execute("SELECT COUNT(*) FROM cl20_rejected_object_hypothesis WHERE source_place_id=? AND candidate_osm_way_id=31290074 AND map_object_confirmed_as_mass_chapel=0",(pots["source_place_id"],)).fetchone()[0]==1
    assert db.execute("SELECT COUNT(*) FROM cl21_excluded_wrong_target WHERE source_place_id=? AND excluded_osm_way_id=31290074 AND confirmed_as_mass_door=0",(pots["source_place_id"],)).fetchone()[0]==1

    report=[]
    for r in rows:
        sid=r["source_place_id"]
        loc=db.execute("SELECT historical_group_id,owner_name,owner_address FROM cl17_owner_site_stage WHERE source_place_id=?",(sid,)).fetchone()
        building=r["research_building"]
        assert building["source_map_feature"].startswith("OpenStreetMap way")
        if sid==pots["source_place_id"]:
            assert 52<building["lat"]<53 and 13<building["lon"]<14
        else:
            assert 49<building["lat"]<50 and 11<building["lon"]<12
        witness=r["historical_marker_vicinity"] if sid==amb["source_place_id"] else false
        report.append({
          "source_place_id":sid,
          "historical_group_id":loc["historical_group_id"],
          "church":loc["owner_name"],
          "owner_address":loc["owner_address"],
          "building_osm_way":building["source_map_feature"],
          "building_reference_lat":building["lat"],
          "building_reference_lon":building["lon"],
          "map_reference_status":"RESEARCH_ONLY_CORRECT_CHAPEL_WAY" if sid==pots["source_place_id"] else "INHERITED_CL20_BUILDING_WAY",
          "nearby_feature_role":"EXCLUDED_SEPARATE_CHAPEL" if sid==pots["source_place_id"] else "PHOTO_MARKER_NEAR_ENTRANCE",
          "nearby_feature_lat":witness["lat"],"nearby_feature_lon":witness["lon"],
          "feature_separation_metres":round(metres(building["lat"],building["lon"],witness["lat"],witness["lon"]),1),
          "nearby_feature_url":witness["source_url"],
          "source_owner_url":r["independent_owner_witnesses"][0]["url"],
          "source_building_url":building["source_url"],
          "operational_church_door_surveyed":0,
          "visitor_entrance_gps_approved":0,"public_site_pin_approved":0,
          "current_mass_event_approved":0,
          "next_action":"VERIFY_ST_JOSEFS_HISTORIC_DOUBLE_LEAF_PORTAL_NODE" if sid==pots["source_place_id"] else "LOCATE_SW_ORNATE_PORTAL_AGAINST_BUILDING_POLYGON_AND_PHOTO_VICINITY",
        })
    assert len(report)==2
    with db:
        db.executescript("""
        CREATE TABLE cl22_building_vs_door_research (
           source_place_id TEXT PRIMARY KEY,
           historical_group_id TEXT NOT NULL,
           building_lat REAL NOT NULL,building_lon REAL NOT NULL,
           source_osm_way_id INTEGER NOT NULL,
           source_role TEXT NOT NULL,
           evidence_json TEXT NOT NULL,
           surveyed_door_approved INTEGER NOT NULL DEFAULT 0 CHECK(surveyed_door_approved=0),
           public_point_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_point_approved=0),
           current_mass_approved INTEGER NOT NULL DEFAULT 0 CHECK(current_mass_approved=0),
           FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id)
        );
        CREATE TABLE cl22_spatial_lookalike_veto (
           source_place_id TEXT PRIMARY KEY,
           excluded_osm_way_id INTEGER NOT NULL CHECK(excluded_osm_way_id=31290074),
           excluded_feature_label TEXT NOT NULL,
           separate_from_correct_chapel INTEGER NOT NULL CHECK(separate_from_correct_chapel=1),
           vetted_public_gps INTEGER NOT NULL DEFAULT 0 CHECK(vetted_public_gps=0),
           FOREIGN KEY(source_place_id) REFERENCES cl22_building_vs_door_research(source_place_id)
        );
        """)
        for r in report:
            src=by_id[r["source_place_id"]]
            way=int(src["research_building"]["source_map_feature"].split()[-1])
            db.execute("INSERT INTO cl22_building_vs_door_research (source_place_id,historical_group_id,building_lat,building_lon,source_osm_way_id,source_role,evidence_json) VALUES(?,?,?,?,?,?,?)",(
                r["source_place_id"],r["historical_group_id"],r["building_reference_lat"],r["building_reference_lon"],way,r["map_reference_status"],json.dumps(src,sort_keys=True,ensure_ascii=False)))
        db.execute("INSERT INTO cl22_spatial_lookalike_veto(source_place_id,excluded_osm_way_id,excluded_feature_label,separate_from_correct_chapel) VALUES(?,?,?,1)",(
            pots["source_place_id"],31290074,false["label"]))
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not db.execute("PRAGMA foreign_key_check").fetchall()
        assert db.execute("SELECT COUNT(*) FROM cl22_building_vs_door_research").fetchone()[0]==2
        assert db.execute("SELECT COUNT(*) FROM cl22_spatial_lookalike_veto").fetchone()[0]==1
        assert db.execute("SELECT COUNT(*) FROM cl22_building_vs_door_research WHERE surveyed_door_approved=1 OR public_point_approved=1 OR current_mass_approved=1").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    with (a.out_dir/"cl22_two_site_building_vs_entrance_evidence.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(report[0]));w.writeheader();w.writerows(report)
    summary={
       "schema":"AO_CL22_CORRECT_CHAPEL_FOOTPRINT_WITHOUT_DOOR_APPROVAL_V1",
       "as_of":"2026-10-26",
       "source_place_ids_reconciled":2,
       "new_potsdam_correct_chapel_osm_building_way":301020129,
       "excluded_wrong_potsdam_quiet_chapel_way":31290074,
       "distance_between_distinct_chapel_building_references_m":round(wrong_dist,1),
       "new_research_church_building_reference_supported":1,
       "new_geolocated_southwest_marker_near_amberg_portal":1,
       "amberg_marker_vicinity_distance_from_building_reference_m":round(marker_dist,1),
       "total_pilot_named_sites_unchanged":39,
       "total_book_supported_rows_unchanged":256,
       "total_book_held_rows_unchanged":176,
       "total_pilot_mass_patterns_unchanged":74,
       "new_verified_worship_door_GPS":0,
       "new_operational_access_approvals":0,
       "new_public_pins":0,"new_mass_schedules":0,"new_una_cum":0,
       "interpretation":"OpenStreetMap distinguishes the correct St Josefs Catholic chapel from adjacent Raum der Stille by separate ways about 19m apart. Building centroid is research reference, not the actual public worship entrance. Amberg photographed historical marker is about 21m from church building reference, not proof of portal coordinates."
    }
    (a.out_dir/"cl22_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","new_correct_mass_chapel_building":1,
      "marker_vicinity":1,"excluded_other_chapel":1,"public_door_points":0},sort_keys=True))
    db.close()
if __name__=="__main__":
    main()
