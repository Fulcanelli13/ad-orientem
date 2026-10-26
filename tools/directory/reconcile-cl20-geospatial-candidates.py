#!/usr/bin/env python3
"""CL20: crosswalk independently identified worship BUILDINGS, not map entrances.

Carries six sourced church-POI candidates plus one explicitly rejected
potentially different hospital chapel POI through CL17–19 identities. No
geocoding service, network, cost, canonical mutation or public pin release.
"""
import argparse
import csv
import json
from math import radians,sin,cos,atan2,sqrt
from pathlib import Path
import sqlite3

MANIFEST=Path("data/directory/research/cl20-geo-entrance-20261026/source-geocodes.json")
GRADES={"CHURCH_FOOTPRINT_CORROBORATED","CHURCH_BUILDING_POI_CORROBORATED",
        "CHURCH_FOOTPRINT_IDENTIFIED_SINGLE_MAP_SOURCE",
        "CHURCH_BUILDING_PRIMARY_TOURISM_CORROBORATED",
        "SPATIAL_DISCREPANCY_HOLD"}
def distance_m(x,y,a,b):
    R=6371000.0
    p1,p2=radians(x),radians(a)
    dp=p2-p1
    dl=radians(b-y)
    h=sin(dp/2)**2+cos(p1)*cos(p2)*sin(dl/2)**2
    return 2*R*atan2(sqrt(h),sqrt(1-h))
def emit(path,records):
    assert records
    with path.open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=list(records[0]),extrasaction="ignore")
        w.writeheader();w.writerows(records)
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--out-dir",type=Path,required=True)
    args=p.parse_args()
    args.out_dir.mkdir(parents=True,exist_ok=True)
    data=json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert data["schema"]=="AO_CL20_SOURCE_GEOREFERENCES_CANDIDATE_BUILDINGS_V1"
    assert data["as_of"]=="2026-10-26"
    candidates=data["spatial_candidates"]
    rejected=data["blocked_site_hypotheses"]
    assert len(candidates)==6 and len(rejected)==1
    assert len({x["source_place_id"] for x in candidates})==6
    assert rejected[0]["source_place_id"]=="CL17-DE-FSSP-POTSDAM"
    conn=sqlite3.connect(args.db)
    conn.row_factory=sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    for table,num in (("canonical_site",2584),("mass_time",4681),
        ("cl14_fssp_direct_slot",73),("cl17_owner_site_stage",39),
        ("cl17_accepted_mass_gates",256),("cl18_site_verification",39),
        ("cl18_recurrence_rules",74),("cl19_second_source_review",27),
        ("cl19_dated_source_event",3)):
        count=conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        assert count==num,(table,count,num)
    owner={r["source_place_id"]:dict(r) for r in conn.execute("SELECT * FROM cl17_owner_site_stage")}
    assert len(owner)==39
    eligible=[]
    records=[]
    for c in candidates:
        sid=c["source_place_id"]
        assert sid in owner and sid.startswith("CL14-DE-FSSP-")
        assert c["spatial_kind"]=="CHURCH_BUILDING_REFERENCE_NOT_ENTRANCE"
        assert c["building_match_grade"] in GRADES
        assert not c["direct_church_door_coordinate_verified"]
        assert not c["editorial_coordinate_approved_for_public_map"]
        assert not c["current_mass_recurrence_approved"]
        assert not c["public_pin_approved"]
        assert c["research_building_match_eligible"]==(c["building_match_grade"]!="SPATIAL_DISCREPANCY_HOLD")
        lat,lon=c["proposed_latitude"],c["proposed_longitude"]
        assert 47<lat<54 and 8<lon<14
        coords=c["coordinate_witnesses"]
        assert len(coords)>=1
        for w in coords:
            assert w["url"].startswith("https://")
            assert 47<w["latitude"]<54 and 8<w["longitude"]<14
        assert c["independent_identity_references"]
        assert all(x["url"].startswith("https://") for x in c["independent_identity_references"])
        assert "ENTRANCE" in " ".join(c["unresolved_conflicts"]+["ENTRANCE_DOOR_REVIEW_PENDING"])
        match=conn.execute("SELECT COUNT(*) FROM cl18_site_verification WHERE source_place_id=?",(sid,)).fetchone()[0]
        assert match==1
        rank=conn.execute("SELECT COUNT(*) FROM cl19_second_source_review WHERE source_place_id=?",(sid,)).fetchone()[0]
        assert rank in (0,1)
        # A photographed historical-marker point is not a coordinate witness
        # to the church footprint; exclude it from spatial agreement check.
        support=[w for w in coords if "MARKER" not in w["feature_kind"]]
        assert support
        discrepancy=max(distance_m(lat,lon,w["latitude"],w["longitude"]) for w in support)
        assert discrepancy<100,(sid,discrepancy)
        if c["building_match_grade"]=="SPATIAL_DISCREPANCY_HOLD":
            assert sid=="CL14-DE-FSSP-026" and discrepancy>30
        else:
            assert discrepancy<25,(sid,discrepancy)
            eligible.append(sid)
        photo_marker=next((w for w in coords if "MARKER" in w["feature_kind"]),None)
        id_profile=owner[sid]
        record={
          "source_place_id":sid,"frozen_group_id":id_profile["historical_group_id"],
          "owner_named_church":id_profile["owner_name"],
          "owner_locality":id_profile["owner_city"],
          "owner_address":id_profile["owner_address"],
          "research_point_latitude":lat,"research_point_longitude":lon,
          "point_type":"NAMED_CHURCH_BUILDING_REFERENCE_NOT_ENTRANCE",
          "georeference_status":"RESEARCH_BUILDING_REFERENCE_ACCEPTED" if c["research_building_match_eligible"] else "SPATIAL_DISCREPANCY_HELD",
          "grade":c["building_match_grade"],
          "corroborating_geopoints":len(support),
          "max_witness_separation_metres":round(discrepancy,1),
          "named_feature_OSM_way_id":c["osm_way_id"] or "",
          "has_photographed_entrance_marker_vicinity":int(photo_marker is not None),
          "entrance_marker_latitude":photo_marker["latitude"] if photo_marker else "",
          "entrance_marker_longitude":photo_marker["longitude"] if photo_marker else "",
          "direct_worship_door_coordinate_verified":0,
          "owner_vehicle_access_documented":0,
          "building_coordinate_approved_for_public_map":0,
          "site_public_release":0,
          "future_mass_times_approved":0,
          "source_urls":";".join(w["url"] for w in coords),
          "identity_references":";".join(w["url"] for w in c["independent_identity_references"]),
          "risks":";".join(c["unresolved_conflicts"]),
          "required_action":"RESOLVE_SPA_TIAL_DISCREPANCY_AND_CHAPEL_ENTRANCE" if not c["research_building_match_eligible"] else "SURVEY_OR_SOURCE_CONFIRM_ACTUAL_VISITOR_WORSHIP_ENTRANCE"
        }
        records.append(record)
    assert len(eligible)==5 and len(records)==6
    # No coordinate can be assumed just because an OSM hospital campus
    # object is named a room of silence; church operator describes a separate
    # historic St Josef chapel and a separate vehicle entrance.
    potsdam=rejected[0]
    assert potsdam["candidate_feature_name"]=="Raum der Stille"
    assert potsdam["candidate_osm_way_id"]==31290074
    assert potsdam["owner_access_distinction_verified"] is True
    assert potsdam["osm_named_object_equated_to_actual_mass_chapel"] is False
    assert potsdam["candidate_coordinate_accepted"] is False
    assert potsdam["church_visitor_entrance_coordinate_approved"] is False
    assert potsdam["public_release"] is False
    assert potsdam["owner_verified_vehicle_access"]=="Zimmerstraße 6, 14471 Potsdam"
    assert conn.execute("SELECT COUNT(*) FROM cl17_potsdam_identity WHERE row_no=20 AND distinct_venues=0").fetchone()[0]==1
    assert conn.execute("SELECT COUNT(*) FROM cl17_owner_site_stage WHERE source_place_id=?",(potsdam["source_place_id"],)).fetchone()[0]==1
    with conn:
        conn.executescript("""
        CREATE TABLE cl20_building_spatial_candidate(
            source_place_id TEXT PRIMARY KEY,
            frozen_group_id TEXT NOT NULL,
            research_latitude REAL NOT NULL CHECK(research_latitude BETWEEN 47 AND 54),
            research_longitude REAL NOT NULL CHECK(research_longitude BETWEEN 8 AND 14),
            grade TEXT NOT NULL,building_reference_supported INTEGER NOT NULL
              CHECK(building_reference_supported IN(0,1)),
            source_json TEXT NOT NULL,
            visitor_entrance_geocode_approved INTEGER NOT NULL DEFAULT 0 CHECK(visitor_entrance_geocode_approved=0),
            public_geocoordinate_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_geocoordinate_approved=0),
            published_map_pin INTEGER NOT NULL DEFAULT 0 CHECK(published_map_pin=0),
            FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id)
        );
        CREATE TABLE cl20_rejected_object_hypothesis(
            source_place_id TEXT PRIMARY KEY,unverified_map_object TEXT NOT NULL,
            candidate_osm_way_id INTEGER NOT NULL,
            operator_vehicle_access_verified INTEGER NOT NULL
              CHECK(operator_vehicle_access_verified=1),
            map_object_confirmed_as_mass_chapel INTEGER NOT NULL
              CHECK(map_object_confirmed_as_mass_chapel=0),
            rejected_json TEXT NOT NULL,
            public_pin INTEGER NOT NULL DEFAULT 0 CHECK(public_pin=0),
            FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id)
        );
        """)
        for c,r in zip(candidates,records):
            conn.execute("INSERT INTO cl20_building_spatial_candidate(source_place_id,frozen_group_id,research_latitude,research_longitude,grade,building_reference_supported,source_json) VALUES(?,?,?,?,?,?,?)",(
              r["source_place_id"],r["frozen_group_id"],r["research_point_latitude"],
              r["research_point_longitude"],r["grade"],int(c["research_building_match_eligible"]),
              json.dumps(c,ensure_ascii=False,sort_keys=True)))
        conn.execute("INSERT INTO cl20_rejected_object_hypothesis(source_place_id,unverified_map_object,candidate_osm_way_id,operator_vehicle_access_verified,map_object_confirmed_as_mass_chapel,rejected_json) VALUES(?,?,?,?,?,?)",(
          potsdam["source_place_id"],potsdam["candidate_feature_name"],potsdam["candidate_osm_way_id"],
          1,0,json.dumps(potsdam,ensure_ascii=False,sort_keys=True)))
        assert conn.execute("SELECT COUNT(*) FROM cl20_building_spatial_candidate WHERE building_reference_supported=1").fetchone()[0]==5
        assert conn.execute("SELECT COUNT(*) FROM cl20_building_spatial_candidate WHERE building_reference_supported=0").fetchone()[0]==1
        assert conn.execute("SELECT COUNT(*) FROM cl20_rejected_object_hypothesis").fetchone()[0]==1
        assert conn.execute("SELECT COUNT(*) FROM cl20_building_spatial_candidate WHERE visitor_entrance_geocode_approved=1 OR public_geocoordinate_approved=1 OR published_map_pin=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM cl17_owner_site_stage WHERE geocoded_approved=1 OR public_approved=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert conn.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not conn.execute("PRAGMA foreign_key_check").fetchall()
    records.sort(key=lambda x:x["source_place_id"])
    emit(args.out_dir/"cl20_six_georeferenced_building_candidates.csv",records)
    held=[x for x in records if x["georeference_status"]=="SPATIAL_DISCREPANCY_HELD"]
    held.append({
      "source_place_id":potsdam["source_place_id"],
      "owner_named_church":potsdam["church"],
      "georeference_status":"CAMPUS_MAP_OBJECT_IDENTITY_UNPROVEN",
      "source_url":potsdam["candidate_url"],
      "candidate_map_way":potsdam["candidate_osm_way_id"],
      "candidate_feature_name":potsdam["candidate_feature_name"],
      "reason":potsdam["reason"],
      "current_public_approval":0
    })
    # Different dictionaries: write this exception queue with union columns.
    allfields=sorted({k for row in held for k in row})
    with (args.out_dir/"cl20_held_coordinate_and_entrance_exceptions.csv").open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=allfields,extrasaction="ignore")
        writer.writeheader();writer.writerows(held)
    owner={
      "source_place_id":potsdam["source_place_id"],"chapel":potsdam["church"],
      "operator_street_address":potsdam["owner_worship_site_address"],
      "vehicle_access":"Zimmerstraße 6, 14471 Potsdam",
      "vehicle_route_verified_from_operator":1,
      "distinct_access_point_from_chapel_address":1,
      "mapped_OSM_Raum_der_Stille_equated_to_mass_chapel":0,
      "chapel_door_location_approved":0,"public_venue_pin_approved":0
    }
    (args.out_dir/"cl20_potsdam_confirmed_vehicle_routing.json").write_text(json.dumps(owner,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    summary={
      "schema":"AO_CL20_BUILDING_GEOREFERENCE_NOT_ENTRANCE_RELEASE_V1",
      "date":"2026-10-26","pilot_owner_named_sites":39,
      "new_source_georeferenced_church_building_candidates":6,
      "building_reference_eligible_at_research_level":5,
      "spatial_disagreement_held_at_research_building_level":1,
      "potentially_wrong_Potsdam_OSM_chapel_object_excluded":1,
      "building_points_independently_entrance_confirmed":0,
      "Potsdam_operator_vehicle_access_route_documented":1,
      "original_accepted_1962_book_evidence_rows_unchanged":256,
      "original_held_1962_book_rows_unchanged":176,
      "pilot_source_scoped_mass_slots_unchanged":74,
      "new_approved_church_entrance_coordinates":0,
      "new_approved_public_church_map_points":0,
      "new_approved_future_mass_occurrences":0,
      "new_public_mass_schedules":0,
      "new_una_cum":0,
      "site_conflicts_prioritized":[
         "Bad Groenenbach mapped castle chapel vs building-reference discrepancy of several dozen metres and nearby castle.",
         "Potsdam OSM Raum der Stille way might not denote same historic St Josefs Sunday Mass chapel.",
         "Ried-Hoermannsberg Meringer Str 2 vs 4 and visitor entrance unresolved.",
         "Amberg Schulkirche Schulgasse 2 vs 4; marker coordinates indicate vicinity, not exact door.",
         "Amberg Mariahilf sanctuary church #4 vs monastery/contact #3.",
         "Schwaebisch Gmuend Leonhardskirche two street approaches and different nearby chapel.",
      ],
      "interpretation":"Five buildings now have an independently named geospatial point suitable for manual editorial map review; no point is an independently verified Mass-entrance coordinate or public pin. A sixth candidate has a spatial disagreement and Potsdam has a separate possible wrong-object match explicitly blocked."
    }
    (args.out_dir/"cl20_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","georeferenced":6,"building_match_research_accepted":5,"spatial_held":1,
      "Potsdam_possible_wrong_object_blocked":1,"confirmed_operator_vehicle_route":1,"public_pin_approved":0},sort_keys=True))
    conn.close()
if __name__=="__main__":main()
