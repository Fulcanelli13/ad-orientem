#!/usr/bin/env python3
"""CL23: screen the entire remaining 32-site FSSP pilot in one pass.

Adds 17 first-pass source-named geospatial references; carries 15 holds,
and reconciles all 39 staged original owner sites. OSM church polygons,
church POI locations, and mere site reference points have DIFFERENT grades.
Never edits canonical master, door GPS, future schedule or public release.
"""
import argparse
import csv
from collections import Counter
from pathlib import Path
import json
import math
import sqlite3
import re

INPUT=Path("data/directory/research/cl23-bulk-geospatial-20261026/coordinate-evidence.json")
TYPES={
 "NAMED_CHURCH_SITE_COORDINATE","NAMED_CHURCH_POI",
 "OSM_NAMED_CHURCH_WAY","SECONDARY_NAMED_CHURCH_COORDINATE",
 "OSM_NAMED_CHAPEL_NODE"
}
TIER={
 "OSM_NAMED_CHURCH_WAY":"NAMED_CHURCH_FOOTPRINT_GEOMETRY_CENTER",
 "OSM_NAMED_CHAPEL_NODE":"NAMED_CHAPEL_POI_NODE_NOT_BUILDING_FOOTPRINT",
 "NAMED_CHURCH_SITE_COORDINATE":"NAMED_WORSHIP_OBJECT_SITE_REFERENCE",
 "NAMED_CHURCH_POI":"SOURCE_NAMED_CHURCH_POI_NOT_FOOTPRINT",
 "SECONDARY_NAMED_CHURCH_COORDINATE":"SECONDARY_NAMED_CHURCH_POINT",
}
def dist(x,y,a,b):
    R=6371000
    p1,p2=map(math.radians,(x,a))
    dp=p2-p1;dl=math.radians(b-y)
    h=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*R*math.atan2(math.sqrt(h),math.sqrt(1-h))
def csvwrite(path,items):
    assert items
    fields=list(items[0])
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore")
        w.writeheader()
        w.writerows(items)
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--db",type=Path,required=True)
    parser.add_argument("--out-dir",type=Path,required=True)
    a=parser.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    data=json.loads(INPUT.read_text(encoding="utf-8"))
    assert data["schema"]=="AO_CL23_FULL_REMAINDER_32_SITES_SOURCE_GEO_TRIAGE_V1"
    assert data["as_of"]=="2026-10-26"
    geos=data["accepted_named_georeferences"]
    holds=data["special_holds"]
    assert len(geos)==17 and len({r["source_place_id"] for r in geos})==17
    assert len({x["source_place_id"] for x in holds})==len(holds)==6
    assert {x["candidate_feature_type"] for x in geos}==TYPES
    assert Counter(x["candidate_feature_type"] for x in geos)==Counter({
      "OSM_NAMED_CHURCH_WAY":6,
      "NAMED_CHURCH_SITE_COORDINATE":6,
      "NAMED_CHURCH_POI":3,
      "SECONDARY_NAMED_CHURCH_COORDINATE":1,
      "OSM_NAMED_CHAPEL_NODE":1})
    db=sqlite3.connect(a.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for table,n in (("canonical_site",2584),("mass_time",4681),
           ("cl17_owner_site_stage",39),("cl17_accepted_mass_gates",256),
           ("cl18_recurrence_rules",74),
           ("cl19_second_source_review",27),
           ("cl20_building_spatial_candidate",6),
           ("cl22_building_vs_door_research",2),
           ("cl22_spatial_lookalike_veto",1)):
        k=db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        assert k==n,(table,k,n)
    places={x["source_place_id"]:dict(x) for x in db.execute(
        "SELECT * FROM cl17_owner_site_stage")}
    assert len(places)==39
    inherited={x["source_place_id"] for x in db.execute(
        """SELECT source_place_id FROM cl20_building_spatial_candidate
           UNION SELECT source_place_id FROM cl22_building_vs_door_research""")}
    assert len(inherited)==7,inherited
    assert "CL17-DE-FSSP-POTSDAM" in inherited
    assert "CL14-DE-FSSP-026" in inherited
    remaining=set(places)-inherited
    assert len(remaining)==32
    new_ids={r["source_place_id"] for r in geos}
    assert new_ids.issubset(remaining)
    unresolved=remaining-new_ids
    assert len(unresolved)==15
    assert {x["source_place_id"] for x in holds}.issubset(unresolved)

    geolist=[]
    for r in geos:
        sid=r["source_place_id"]
        p=places[sid]
        assert r["candidate_feature_type"] in TYPES
        assert r["research_point_disposition"]=="ACCEPT_NAMED_WORSHIP_BUILDING_OR_CHURCH_POI_ONLY"
        assert 47<r["candidate_latitude"]<55
        assert 6<r["candidate_longitude"]<14
        assert r["geospatial_source_url"].startswith("https://")
        assert r["independent_identity_url"].startswith("https://")
        assert r["mapped_feature_identifier"]
        assert all(r[x] is False for x in (
            "direct_exterior_door_verified","future_Mass_time_verified",
            "canonical_site_modified","public_map_approved"))
        if r["candidate_feature_type"]=="OSM_NAMED_CHURCH_WAY":
            assert re.search(r"\bway \d+\b",r["mapped_feature_identifier"])
            assert re.search(r"mapcarta.com/(?:de/)?W\d+",r["geospatial_source_url"])
        if r["candidate_feature_type"]=="OSM_NAMED_CHAPEL_NODE":
            assert re.search(r"\bnode \d+\b",r["mapped_feature_identifier"])
        assert not db.execute(
          "SELECT 1 FROM cl20_building_spatial_candidate WHERE source_place_id=?",(sid,)).fetchone()
        assert not db.execute(
          "SELECT 1 FROM cl22_building_vs_door_research WHERE source_place_id=?",(sid,)).fetchone()
        candidate={
           "source_place_id":sid,
           "original_historical_group_id":p["historical_group_id"],
           "owner_name":p["owner_name"],
           "owner_city":p["owner_city"],
           "original_source_address":p["owner_address"],
           "latitude":r["candidate_latitude"],
           "longitude":r["candidate_longitude"],
           "geospatial_grade":TIER[r["candidate_feature_type"]],
           "source_feature_type":r["candidate_feature_type"],
           "mapped_feature_identifier":r["mapped_feature_identifier"],
           "coordinate_source_url":r["geospatial_source_url"],
           "owner_or_independent_identity_source_url":r["independent_identity_url"],
           "identity_exceptions":";".join(r["independence_limitations"]),
           "owner_name_coordinate_match_research_pass":1,
           "mapped_polygon_center":int(r["candidate_feature_type"]=="OSM_NAMED_CHURCH_WAY"),
           "visitor_door_coordinate_verified":0,
           "actual_mass_day_entry_verified":0,
           "current_mass_recurrence_approved":0,
           "public_map_pin_approved":0
        }
        geolist.append(candidate)
    geolist.sort(key=lambda x:x["source_place_id"])
    assert len(geolist)==17
    # Critical same-town chapels are separate, far-enough named mapped objects.
    wig={r["source_place_id"]:r for r in geolist if r["owner_city"]=="Wigratzbad"}
    assert set(wig)=={"CL14-DE-FSSP-027","CL14-DE-FSSP-033"}
    sep=dist(wig["CL14-DE-FSSP-027"]["latitude"],wig["CL14-DE-FSSP-027"]["longitude"],
        wig["CL14-DE-FSSP-033"]["latitude"],wig["CL14-DE-FSSP-033"]["longitude"])
    assert 100<sep<200,sep
    assert len({(r["latitude"],r["longitude"]) for r in geolist})==17

    manual={r["source_place_id"]:r["risk"] for r in holds}
    holdlist=[]
    for sid in sorted(unresolved):
        p=places[sid]
        prior=db.execute("SELECT independent_crosscheck FROM cl18_site_verification WHERE source_place_id=?",(sid,)).fetchone()
        assert prior is not None
        new=db.execute("SELECT source_grade FROM cl19_second_source_review WHERE source_place_id=?",(sid,)).fetchone()
        holdlist.append({
            "source_place_id":sid,"original_historical_group_id":p["historical_group_id"],
            "owner_name":p["owner_name"],"owner_city":p["owner_city"],
            "owner_address":p["owner_address"],
            "source_identity_screened":1,
            "mapped_church_geocoordinate_in_CL23":0,
            "prior_independent_source_class":"CL18_LOCAL_CROSSCHECK" if prior["independent_crosscheck"] else (new["source_grade"] if new else "OWNER_DIRECTORY_ONLY"),
            "special_identity_or_address_hazard":manual.get(sid,"NO_UNAMBIGUOUS_NAMED_WORSHIP_BUILDING_COORDINATE_FOUND_IN_THIS_BULK_PASS"),
            "next_action":"TARGETED_NAMED_BUILDING_WAY_OR_CHURCH_POI_SEARCH_IN_LOCAL_GEOHERITAGE_SOURCES",
            "surveyed_entrance":0,"public_pin":0,"published_recurring_mass":0
        })
    assert len(holdlist)==15
    # Three-way full coverage of physical staging, without silently
    # converting CL20's Bad Groenenbach held point into an approval.
    every=set(inherited)|new_ids|unresolved
    assert every==set(places) and len(every)==39
    all_mass_rows=[dict(r) for r in db.execute("SELECT row_no,source_place_id FROM cl17_accepted_mass_gates WHERE source_place_id IS NOT NULL")]
    assert len(all_mass_rows)==74
    newly_supported_mass_rows=sum(r["source_place_id"] in new_ids for r in all_mass_rows)
    inherited_rows=sum(r["source_place_id"] in inherited for r in all_mass_rows)
    unresolved_mass_rows=sum(r["source_place_id"] in unresolved for r in all_mass_rows)
    assert newly_supported_mass_rows+inherited_rows+unresolved_mass_rows==74
    assert newly_supported_mass_rows>17 and inherited_rows>=7

    with db:
        db.executescript("""
        CREATE TABLE cl23_georeferenced_worship_object (
          source_place_id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL,
          latitude REAL NOT NULL CHECK(latitude BETWEEN 47 AND 55),
          longitude REAL NOT NULL CHECK(longitude BETWEEN 6 AND 14),
          feature_type TEXT NOT NULL,
          geometric_grade TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          surveyed_entrance_approved INTEGER NOT NULL DEFAULT 0 CHECK(surveyed_entrance_approved=0),
          future_mass_recurrence_approved INTEGER NOT NULL DEFAULT 0 CHECK(future_mass_recurrence_approved=0),
          public_pin_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_pin_approved=0),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl23_unlocated_pilot_site (
          source_place_id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL,
          blocker TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          public_geocoding_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_geocoding_approved=0),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        """)
        for x in geolist:
            db.execute("INSERT INTO cl23_georeferenced_worship_object(source_place_id,group_id,latitude,longitude,feature_type,geometric_grade,evidence_json) VALUES(?,?,?,?,?,?,?)",(
                x["source_place_id"],x["original_historical_group_id"],
                x["latitude"],x["longitude"],x["source_feature_type"],x["geospatial_grade"],
                json.dumps(x,sort_keys=True,ensure_ascii=False)))
        for x in holdlist:
            db.execute("INSERT INTO cl23_unlocated_pilot_site(source_place_id,group_id,blocker,evidence_json) VALUES(?,?,?,?)",(
                x["source_place_id"],x["original_historical_group_id"],x["special_identity_or_address_hazard"],
                json.dumps(x,sort_keys=True,ensure_ascii=False)))
        assert db.execute("SELECT COUNT(*) FROM cl23_georeferenced_worship_object").fetchone()[0]==17
        assert db.execute("SELECT COUNT(*) FROM cl23_georeferenced_worship_object WHERE feature_type='OSM_NAMED_CHURCH_WAY'").fetchone()[0]==6
        assert db.execute("SELECT COUNT(*) FROM cl23_unlocated_pilot_site").fetchone()[0]==15
        assert db.execute("SELECT COUNT(*) FROM cl23_georeferenced_worship_object WHERE surveyed_entrance_approved=1 OR future_mass_recurrence_approved=1 OR public_pin_approved=1").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]

    csvwrite(a.out_dir/"cl23_17_named_spatial_candidates.csv",geolist)
    csvwrite(a.out_dir/"cl23_15_remaining_spatial_holds.csv",holdlist)
    # Full pilot source-site 39-row geospatial ledger with the prior
    # CL20 spatially HELD candidate clearly differentiated.
    stage=[]
    for sid,p in sorted(places.items()):
        if sid in new_ids:
            status="CL23_NEW_NAMED_CHURCH_GEOREFERENCE"
            g=next(x for x in geolist if x["source_place_id"]==sid)
            lat,lon=g["latitude"],g["longitude"]
        elif sid=="CL17-DE-FSSP-POTSDAM":
            status="CL22_CORRECT_MASS_CHAPEL_FOOTPRINT_SOURCE_POINT"
            o=db.execute("SELECT building_lat,building_lon FROM cl22_building_vs_door_research WHERE source_place_id=?",(sid,)).fetchone()
            lat,lon=o["building_lat"],o["building_lon"]
        elif sid in inherited:
            o=db.execute("SELECT research_latitude,research_longitude,building_reference_supported FROM cl20_building_spatial_candidate WHERE source_place_id=?",(sid,)).fetchone()
            assert o is not None
            status="CL20_BUILDING_REFERENCE_RESEARCH" if o["building_reference_supported"] else "CL20_SPATIAL_CONFLICT_HELD"
            lat,lon=o["research_latitude"],o["research_longitude"]
        else:
            status="NO_NAMED_WORSHIP_BUILDING_SPATIAL_POINT_YET"
            lat=lon=""
        stage.append({
            "source_place_id":sid,"group_id":p["historical_group_id"],
            "name":p["owner_name"],"city":p["owner_city"],
            "original_address":p["owner_address"],"spatial_screen_status":status,
            "research_latitude":lat,"research_longitude":lon,
            "evidence_directly_denotes_mass_entrance":0,
            "coordinate_currently_approved_for_publication":0,
            "current_Mass_datetime_approved":0,
        })
    assert len(stage)==39
    csvwrite(a.out_dir/"cl23_full_39_site_spatial_readiness.csv",stage)
    statuses=Counter(x["spatial_screen_status"] for x in stage)
    assert statuses["CL23_NEW_NAMED_CHURCH_GEOREFERENCE"]==17
    assert statuses["NO_NAMED_WORSHIP_BUILDING_SPATIAL_POINT_YET"]==15
    assert statuses["CL20_BUILDING_REFERENCE_RESEARCH"]==5
    assert statuses["CL20_SPATIAL_CONFLICT_HELD"]==1
    assert statuses["CL22_CORRECT_MASS_CHAPEL_FOOTPRINT_SOURCE_POINT"]==1
    summary={
      "schema":"AO_CL23_ALL_39_OWNER_PLACE_SPATIAL_SCREEN_V1",
      "as_of":"2026-10-26",
      "all_owner_named_physical_sites":39,
      "remaining_without_candidate_as_of_CL22":32,
      "new_directly_named_spatial_church_references":17,
      "new_mapped_OSM_church_building_ways":6,
      "new_mapped_OSM_chapel_nodes":1,
      "new_other_named_church_site_or_POI_references":10,
      "new_without_any_directly_named_spatial_reference":15,
      "previous_CL20_built_site_research_supported":5,
      "previous_CL20_spatially_held":1,
      "previous_CL22_correct_Potsdam_chapel_building":1,
      "total_research_georeferenced_or_candidate_points":24,
      "total_research_supported_georeferences_excluding_spatially_held":23,
      "all_spatial_states":dict(statuses),
      "pilot_book_evidenced_mass_rows":74,
      "pilot_mass_rows_with_new_CL23_georeference":newly_supported_mass_rows,
      "pilot_mass_rows_with_previous_CL20_22_candidate":inherited_rows,
      "pilot_mass_rows_without_site_coordinate":unresolved_mass_rows,
      "wigratzbad_two_distinct_chapel_features_separated_m":round(sep,1),
      "original_full_book_evidence_cohort_accepted":256,
      "original_full_book_evidence_cohort_held":176,
      "independent_actual_church_entrance_coordinates_approved":0,
      "future_calendar_occurrences_approved":0,
      "public_church_pins_new":0,
      "public_mass_times_new":0,
      "una_cum_new":0,
      "warning":"New 17 church-specific map references are NOT 17 verified entrances and include object points/POIs weaker than OSM building polygons. The old Bad Groenenbach spatially held point is retained as held; no routine auto-geocoder or map release.",
      "next_gate":"Target 15 unresolved venues with authoritative named church way or site POI; prioritize actual physical entrance at each place and date-specific Mass exceptions separately."
    }
    (a.out_dir/"cl23_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","new_named_georeferences":17,"remaining_spatial_holds":15,
        "pilot_sites_screened":39,"research_accepted_points":23,
        "prior_spatially_held":1,"new_public_pins":0},sort_keys=True))
    db.close()
if __name__=="__main__":
    main()
