#!/usr/bin/env python3
"""CL26: 38/39 pilot worship/host references, one house-chapel hold,
and 14 *external-to-pilot* individually dated Mass research candidates.
Immutable CL2-25 ancestry, no app/calendar/map publication.
"""
import argparse
import csv
from datetime import date
import json
import math
import sqlite3
from pathlib import Path

INPUT=Path("data/directory/research/cl26-ringeisenhaus-dated-20261026/evidence.json")
EXTERNAL="DE-FREIBURG-ADELHAUSER-KIRCHE-ORDO-VETUS"

def meters(a,b,c,d):
    r=6371000
    a,c=math.radians(a),math.radians(c)
    x=math.sin((c-a)/2)**2+math.cos(a)*math.cos(c)*math.sin(math.radians(d-b)/2)**2
    return 2*r*math.atan2(math.sqrt(x),math.sqrt(1-x))

def csvout(path,rows):
    assert rows
    with path.open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

def main():
    pa=argparse.ArgumentParser()
    pa.add_argument("--db",required=True,type=Path)
    pa.add_argument("--out-dir",required=True,type=Path)
    opts=pa.parse_args()
    opts.out_dir.mkdir(parents=True,exist_ok=True)
    j=json.loads(INPUT.read_text(encoding="utf-8"))
    assert j["schema"]=="AO_CL26_GERMAN_FSSP_PILOT_FINAL_GEO_AND_FREIBURG_DATED_SOURCE_V1"
    assert j["as_of"]=="2026-10-26"
    g=j["source_place_geo_resolution"]
    h=j["deining_institutional_hold"]
    external=j["external_dated_local_organizer_programme"]
    events=j["explicit_external_dated_mass_candidates"]
    controls=j["source_classification_guardrails"]
    assert g["source_place_id"]=="CL14-DE-FSSP-026"
    assert g["host_building_osm_way_id"]==304721616
    assert g["chapel_named_osm_way_id"]==1036283953
    assert g["distinct_nearby_wrong_castle_osm_way_id"]==304720796
    assert "mapcarta.com/W304721616" in g["host_source_url"]
    assert "mapcarta.com/W1036283953" in g["chapel_source_url"]
    assert "mapcarta.com/W304720796" in g["wrong_castle_source_url"]
    assert g["municipality_chapel_in_host_building_url"].startswith("https://")
    assert g["older_church_listing_point"]["source_url"].startswith("https://")
    assert g["original_CL20_disputed_candidate_retained_not_overwritten"] is True
    assert g["host_point_does_not_approve_exact_chapel_room"] is True
    assert g["actual_worship_entrance_verified"] is False
    assert g["public_building_pin_approved"] is False
    assert g["dated_mass_occurrence_approved"] is False
    assert set(g["negative_controls"])=={
       "DO_NOT_MATCH_HOHES_SCHLOSS","DO_NOT_ASSUME_RUMOURED_40M_DIFF_IS_DOOR",
       "DISTINGUISH_OSM_CHAPEL_WAY_FROM_CIVIC_BUILDING_FOOTPRINT",
       "KEEP_CL20_ORIGINAL_HELD_RECORD_FOR_AUDIT"}
    host=g["host_building_coordinates"]
    chapel=g["chapel_reference_coordinates"]
    older=g["older_church_listing_point"]
    for x in (host,chapel,older):
        assert 47<x["latitude"]<55 and 6<x["longitude"]<14
    delta=meters(host["latitude"],host["longitude"],chapel["latitude"],chapel["longitude"])
    assert 20<delta<35,(delta,g)
    older_delta=meters(host["latitude"],host["longitude"],older["latitude"],older["longitude"])
    assert 10<older_delta<30,older_delta
    assert h["source_place_id"]=="CL14-DE-FSSP-036"
    assert h["status"]=="NAMED_FSSP_RELIGIOUS_HOUSE_WITH_MASS_TIMETABLE_NO_VERIFIED_PUBLIC_CHAPEL_COORDINATE"
    assert h["owner_local_schedule_url"].startswith("https://petrusbruderschaft.de/")
    assert h["owner_history_url"].startswith("https://petrusbruderschaft.de/")
    assert h["national_owner_label"]=="Haus St. Stola"
    assert h["local_owner_history_alias"]=="St. Sola"
    assert h["public_owner_address_exists"] is True
    assert h["chapel_room_shape_unknown"] is True
    assert h["operator_public_access_permission_unknown"] is True
    assert h["new_public_georeference_approved"] is False
    assert h["new_dated_mass_approved"] is False
    assert len(h["mass_rule"])==4
    assert {r["day"] for r in h["mass_rule"]}=={"Tuesday","Wednesday","Thursday","Saturday"}
    assert h["secondary_calendar_status"].startswith("MECHANICALLY_EXPANDED")
    assert external["site_key"]==EXTERNAL
    assert external["pilot_scope"]=="NOT_ONE_OF_THE_39_FROZEN_FSSP_GERMAN_OWNER_SITES"
    assert external["schedule_valid_through"]=="2026-12-27"
    assert external["programme_issued"]=="2026-07-30"
    assert external["deduplication"]=="DEFER_EXISTING_WORLDWIDE_MASTER_IDENTITY_LOOKUP_NO_NEW_CANONICAL_SITE"
    assert external["calendar_published"] is False
    assert len(events)==14
    assert len(controls)==3
    assert sum(x["additional_CL26_events"] for x in controls)==14
    assert sum(x["previous_CL25_events"] for x in controls)==7
    assert set(x["evidence_type"] for x in controls)=={
        "EXPLICIT_LOCAL_ORGANIZER_FUTURE_DATE_AND_TIME",
        "SYNDICATED_RECURRENT_RULE_EXPANDED_INTO_DATES"}
    dates=[]
    priestcount={"FSSP":0,"GODO_GANZ":0}
    for r in events:
        assert r["external_worship_place_key"]==EXTERNAL
        assert r["pilot_39_source_place_id"] is None
        assert r["source_url"]==external["programme_pdf_url"]
        assert r["source_level"]=="LOCAL_ORGANIZER_EXPLICIT_DATE_AND_TIME"
        assert r["source_pub_date_not_live_time_confirmation"] is True
        assert r["liturgical_form"]=="ROMAN_1962_ORDO_VETUS"
        assert r["timezone"]=="Europe/Berlin"
        assert r["worldwide_master_dedup_pending"] is True
        assert r["future_occurrence_public_approved"] is False
        assert r["public_pin_approved"] is False
        assert r["celebrant_as_published"] in priestcount
        priestcount[r["celebrant_as_published"]]+=1
        d=date.fromisoformat(r["date"])
        assert date(2026,10,26)<d<=date(2026,12,27)
        assert r["local_time"] in ("10:00","18:30","20:00")
        if d.weekday()==6: assert r["local_time"]=="10:00"
        dates.append(r["date"])
    assert dates==sorted(set(dates))
    assert priestcount=={"FSSP":6,"GODO_GANZ":8}
    assert external["fssp_celebrant_rows"]==6 and external["other_priest_rows"]==8
    assert set(x["date"] for x in events if x["local_time"]=="18:30")=={
        "2026-11-02","2026-12-08"}
    assert set(x["date"] for x in events if x["local_time"]=="20:00")=={"2026-12-24"}
    assert all(v==0 for v in j["release_zero"].values())

    db=sqlite3.connect(opts.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for tbl,n in (("canonical_site",2584),("mass_time",4681),
                  ("cl17_owner_site_stage",39),("cl17_accepted_mass_gates",256),
                  ("cl18_recurrence_rules",74),
                  ("cl20_building_spatial_candidate",6),
                  ("cl23_georeferenced_worship_object",17),
                  ("cl24_research_building_reference",8),
                  ("cl25_geographic_reference",6),
                  ("cl25_private_house_chapel_hold",1),
                  ("cl25_dated_operator_candidate",7),
                  ("cl25_operator_venue_exception",2)):
        actual=db.execute("SELECT COUNT(*) FROM "+tbl).fetchone()[0]
        assert actual==n,(tbl,actual,n)
    bad=db.execute("SELECT research_latitude,research_longitude,building_reference_supported "
            "FROM cl20_building_spatial_candidate WHERE source_place_id=?",
            (g["source_place_id"],)).fetchone()
    assert bad is not None and bad["building_reference_supported"]==0
    assert abs(bad["research_latitude"]-chapel["latitude"])<0.000001
    assert abs(bad["research_longitude"]-chapel["longitude"])<0.000001
    p=db.execute("SELECT source_place_id FROM cl17_owner_site_stage WHERE source_place_id=?",
                  (h["source_place_id"],)).fetchone()
    assert p is not None
    # The external Freiburg source must never be assigned a fabricated 39-site source ID.
    assert len({row["source_place_id"] for row in db.execute("SELECT * FROM cl17_owner_site_stage")})==39

    with db:
        db.executescript("""
        CREATE TABLE cl26_host_chapel_identity_resolution (
          source_place_id TEXT PRIMARY KEY,
          host_osm_way_id INTEGER NOT NULL,
          named_chapel_osm_way_id INTEGER NOT NULL,
          host_latitude REAL NOT NULL,
          host_longitude REAL NOT NULL,
          spatial_discrepancy_research_resolved INTEGER NOT NULL CHECK(spatial_discrepancy_research_resolved=1),
          actual_chapel_entrance_approved INTEGER NOT NULL DEFAULT 0 CHECK(actual_chapel_entrance_approved=0),
          public_pin_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_pin_approved=0),
          evidence_json TEXT NOT NULL,
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl26_unlocated_religious_house (
          source_place_id TEXT PRIMARY KEY,
          access_and_map_hold TEXT NOT NULL,
          public_geocoordinate_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_geocoordinate_approved=0),
          evidence_json TEXT NOT NULL,
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl26_external_date_specific_ordo_event (
          external_site_key TEXT NOT NULL,
          local_date TEXT NOT NULL,
          local_time TEXT NOT NULL,
          celebrant_grade TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          matched_canonical_site_id TEXT,
          published_calendar_instance INTEGER NOT NULL DEFAULT 0 CHECK(published_calendar_instance=0),
          public_map_pin_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_map_pin_approved=0),
          PRIMARY KEY(external_site_key,local_date,local_time));
        """)
        db.execute("INSERT INTO cl26_host_chapel_identity_resolution "
            "(source_place_id,host_osm_way_id,named_chapel_osm_way_id,host_latitude,host_longitude,"
            "spatial_discrepancy_research_resolved,evidence_json) VALUES (?,?,?,?,?,1,?)",
            (g["source_place_id"],g["host_building_osm_way_id"],g["chapel_named_osm_way_id"],
             host["latitude"],host["longitude"],json.dumps(g,ensure_ascii=False,sort_keys=True)))
        db.execute("INSERT INTO cl26_unlocated_religious_house "
            "(source_place_id,access_and_map_hold,evidence_json) VALUES (?,?,?)",
            (h["source_place_id"],h["status"],json.dumps(h,ensure_ascii=False,sort_keys=True)))
        for r in events:
            db.execute("INSERT INTO cl26_external_date_specific_ordo_event "
                "(external_site_key,local_date,local_time,celebrant_grade,evidence_json)"
                "VALUES (?,?,?,?,?)",
                (r["external_worship_place_key"],r["date"],r["local_time"],
                 r["celebrant_as_published"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert db.execute("SELECT COUNT(*) FROM cl26_external_date_specific_ordo_event "
                          "WHERE matched_canonical_site_id IS NOT NULL OR published_calendar_instance=1").fetchone()[0]==0
    old={r[0] for r in db.execute(
        "SELECT source_place_id FROM cl20_building_spatial_candidate WHERE building_reference_supported=1")}
    old|={r[0] for r in db.execute("SELECT source_place_id FROM cl23_georeferenced_worship_object")}
    old|={r[0] for r in db.execute("SELECT source_place_id FROM cl24_research_building_reference")}
    old|={r[0] for r in db.execute("SELECT source_place_id FROM cl25_geographic_reference")}
    old.add("CL17-DE-FSSP-POTSDAM")
    assert len(old)==37
    assert g["source_place_id"] not in old
    supported=old|{g["source_place_id"]}
    assert len(supported)==38
    assert h["source_place_id"] not in supported
    owner={r["source_place_id"]:dict(r) for r in db.execute("SELECT * FROM cl17_owner_site_stage")}
    assert len(owner)==39 and set(owner)==supported|{h["source_place_id"]}
    readiness=[]
    for sid,x in sorted(owner.items()):
        status=("CL26_RESOLVED_HOST_BUILDING_NAMED_CHAPEL_NOT_DOOR" if sid==g["source_place_id"]
                else "CL26_HOUSE_ACCESS_SPATIAL_HOLD" if sid==h["source_place_id"]
                else "CL2_CL25_PRIOR_RESEARCH_WORSHIP_OR_HOST_REFERENCE")
        readiness.append({
            "source_place_id":sid,"owner_church":x["owner_name"],
            "source_site_spatial_status":status,
            "research_named_site_or_host_building_reference":int(sid in supported),
            "independently_verified_entrance":0,
            "public_map_pin":0,"future_mass_calendar_instance_approved":0})
    assert sum(x["research_named_site_or_host_building_reference"] for x in readiness)==38
    csvout(opts.out_dir/"cl26_pilot_39_spatial_readiness.csv",readiness)
    csvout(opts.out_dir/"cl26_external_freiburg_14_dated_mass_candidates.csv",events)
    csvout(opts.out_dir/"cl26_schedule_source_grading_guardrails.csv",controls)
    summary={
        "schema":"AO_CL26_SPATIAL_HOST_AND_DATE_SPECIFIC_EXTERNAL_SOURCE_AUDIT_V1",
        "pilot_frozen_sites":39,"inherited_research_supported_sites":37,
        "CL20_spatial_conflict_correctly_resolved_host_level":1,
        "research_supported_named_worship_or_host_places":38,
        "research_worship_or_named_church_sites_excluding_interior_host_only":36,
        "host_only_interior_chapel_references":2,
        "remaining_unlocated_religious_house":1,
        "new_freiburg_external_to_pilot_individually_listed_ordo_dates":14,
        "new_freiburg_FSSP_celebrant_dates":6,
        "new_freiburg_other_celebrant_dates":8,
        "already_CL25_Nuremberg_individually_listed_dates":7,
        "cumulative_cross_phase_individually_listed_future_mass_candidates":21,
        "source_recurring_GOCATH_dates_approved":0,
        "new_mass_calendar_instances_published":0,
        "new_public_pins":0,"new_door_coordinates_approved":0,
        "frozen_74_historical_source_mass_patterns_unchanged":74,
        "original_supported_liturgical_book_evidence":256,
        "original_held_liturgical_book_evidence":176,
        "new_una_cum":0,
        "host_to_named_chapel_reference_separation_m":round(delta,1),
        "new_freiburg_worldwide_master_dedup_approved":0}
    (opts.out_dir/"cl26_summary.json").write_text(
        json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS",**summary},sort_keys=True))
    db.close()
if __name__=="__main__":
    main()
