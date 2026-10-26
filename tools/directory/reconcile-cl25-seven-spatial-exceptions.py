#!/usr/bin/env python3
"""CL25: last seven FSSP pilot geospatial exceptions, and owner-listed dated Mass candidates.
Research-only tables. Host building for upstairs chapel != mapped chapel room or door.
"""
import argparse
import csv
import datetime
import json
import re
import sqlite3
from pathlib import Path

INPUT=Path("data/directory/research/cl25-last-seven-geo-20261026/evidence.json")
def export(path, items):
    assert items, path
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(items[0]))
        w.writeheader()
        w.writerows(items)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--db",type=Path,required=True)
    ap.add_argument("--out-dir",type=Path,required=True)
    opts=ap.parse_args()
    opts.out_dir.mkdir(parents=True,exist_ok=True)
    j=json.loads(INPUT.read_text(encoding="utf-8"))
    assert j["schema"]=="AO_CL25_RESOLVE_LAST_SEVEN_FSSP_SPATIAL_EXCEPTIONS_V1"
    assert j["as_of"]=="2026-10-26"
    refs=j["new_georeferenced_research_objects"]
    held=j["remaining_private_chapel_hold"]
    dated=j["exact_dated_operator_mass_candidates"]
    changes=j["operator_change_evidence"]
    assert len(refs)==6 and len(held)==1 and len(dated)==7 and len(changes)==2
    ids={x["source_place_id"] for x in refs}
    assert len(ids)==6 and held[0]["source_place_id"]=="CL14-DE-FSSP-036"
    assert sum(x["osm_way_id"] is not None for x in refs)==5
    assert sum(x["spatial_class"]=="HOST_CHURCH_BUILDING_NOT_EXACT_UPSTAIRS_WORSHIP_ROOM" for x in refs)==1
    assert {x["source_place_id"] for x in refs+[held[0]]}=={
        "CL14-DE-FSSP-025","CL14-DE-FSSP-028","CL14-DE-FSSP-034",
        "CL14-DE-FSSP-035","CL14-DE-FSSP-036","CL14-DE-FSSP-037",
        "CL14-DE-FSSP-038"}
    db=sqlite3.connect(opts.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for tbl,n in (("canonical_site",2584),("mass_time",4681),
                  ("cl17_owner_site_stage",39),("cl17_accepted_mass_gates",256),
                  ("cl18_recurrence_rules",74),("cl23_georeferenced_worship_object",17),
                  ("cl24_research_building_reference",8),
                  ("cl24_remaining_spatial_hold",7),
                  ("cl24_operational_exception",1)):
        actual=db.execute("SELECT COUNT(*) FROM "+tbl).fetchone()[0]
        assert actual==n,(tbl,actual,n)
    cl24held={x[0] for x in db.execute("SELECT source_place_id FROM cl24_remaining_spatial_hold")}
    assert ids|{held[0]["source_place_id"]}==cl24held
    original={x["source_place_id"]:dict(x) for x in db.execute("SELECT * FROM cl17_owner_site_stage")}
    assert len(original)==39
    for x in refs:
        assert x["source_place_id"] in original
        assert 47<x["latitude"]<55 and 6<x["longitude"]<14
        assert x["geospatial_source_url"].startswith("https://")
        assert x["independent_worship_room_url"].startswith("https://")
        assert x["architectural_source_url"].startswith("https://")
        assert x["geometry_is_research_only"] is True
        for key in ("verified_entrance_coordinate","future_mass_approved",
                    "public_map_approved"):
            assert x[key] is False
        assert x["canonical_source_id_unchanged"] is True
        if x["osm_way_id"] is not None:
            assert isinstance(x["osm_way_id"],int) and x["osm_way_id"]>0
            assert re.search(r"/W"+str(x["osm_way_id"])+r"(?:$|[/?#])",
                             x["geospatial_source_url"])
        assert x["spatial_class"]!="HOUSE_CHAPEL_PRIVATE_ACCESS_GEOPOINT_NOT_VERIFIED"
    l=next(x for x in refs if x["source_place_id"]=="CL14-DE-FSSP-025")
    assert l["osm_way_id"]==87971830
    assert l["spatial_class"]=="HOST_CHURCH_BUILDING_NOT_EXACT_UPSTAIRS_WORSHIP_ROOM"
    assert "stairs" in l["visit_information"].lower()
    n=next(x for x in refs if x["source_place_id"]=="CL14-DE-FSSP-028")
    assert n["osm_way_id"] is None
    assert n["spatial_class"]=="NAMED_CATHOLIC_CHURCH_SITE_COORDINATE_NOT_OSM_WAY"
    assert held[0]["status"]=="HOUSE_CHAPEL_PRIVATE_ACCESS_GEOPOINT_NOT_VERIFIED"
    assert held[0]["owner_url"].startswith("https://")

    listing_dates=[]
    for x in dated:
        assert x["source_place_id"]=="CL14-DE-FSSP-028"
        d=datetime.date.fromisoformat(x["date"])
        assert d>=datetime.date(2026,10,26)
        assert x["local_time"]=="18:00" and x["timezone"]=="Europe/Berlin"
        assert x["source_url"]=="https://lateinische-messe-nuernberg.de/termine/"
        assert x["listing_status"]=="OPERATOR_EXACT_DATE_LISTED_NOT_INDEPENDENT_EDITORIAL_APPROVAL"
        assert x["church_object_geospatial_research_only"] is True
        assert x["approved_app_mass_calendar"] is False
        assert x["public_release"] is False
        listing_dates.append(x["date"])
    assert listing_dates==[
        "2026-11-08","2026-11-22","2026-12-13","2026-12-25",
        "2026-12-27","2027-01-10","2027-01-24"]
    assert datetime.date(2026,12,25).weekday()==4
    assert all(datetime.date.fromisoformat(d).weekday()==6
               for d in listing_dates if d!="2026-12-25")
    assert {x["issue"] for x in changes}=={
        "NUREMBERG_TEMPORARY_VENUE","RECKLINGHAUSEN_CLOSURE_CLAIM_RETRACTED"}
    nu=next(x for x in changes if x["issue"]=="NUREMBERG_TEMPORARY_VENUE")
    assert nu["auto_transfer_back_forbidden"] is True
    assert nu["future_after_last_listed_date_held"] is True
    rechange=next(x for x in changes if x["issue"]=="RECKLINGHAUSEN_CLOSURE_CLAIM_RETRACTED")
    assert rechange["future_operator_dated_confirmation_required"] is True
    op=db.execute("SELECT operational_status FROM cl24_operational_exception WHERE source_place_id='CL14-DE-FSSP-007'").fetchone()
    assert op and op[0]=="CLOSURE_OR_VENUE_TRANSFER_UNVERIFIED_SOURCE_CONFLICT"
    assert all(v==0 for v in j["release_zero"].values())

    with db:
        db.executescript("""
        CREATE TABLE cl25_geographic_reference (
          source_place_id TEXT PRIMARY KEY,
          latitude REAL NOT NULL CHECK(latitude BETWEEN 47 AND 55),
          longitude REAL NOT NULL CHECK(longitude BETWEEN 6 AND 14),
          geometry_kind TEXT NOT NULL,
          host_building_only INTEGER NOT NULL CHECK(host_building_only IN (0,1)),
          evidence_json TEXT NOT NULL,
          surveyed_entrance_approved INTEGER NOT NULL DEFAULT 0 CHECK(surveyed_entrance_approved=0),
          published_public_pin INTEGER NOT NULL DEFAULT 0 CHECK(published_public_pin=0),
          future_mass_approved INTEGER NOT NULL DEFAULT 0 CHECK(future_mass_approved=0),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl25_private_house_chapel_hold (
          source_place_id TEXT PRIMARY KEY,
          blocker TEXT NOT NULL,
          no_public_geocoordinate INTEGER NOT NULL DEFAULT 1 CHECK(no_public_geocoordinate=1),
          evidence_json TEXT NOT NULL,
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl25_dated_operator_candidate (
          source_place_id TEXT NOT NULL,
          mass_local_date TEXT NOT NULL,
          mass_local_time TEXT NOT NULL,
          venue_identity_text TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          app_calendar_approved INTEGER NOT NULL DEFAULT 0 CHECK(app_calendar_approved=0),
          PRIMARY KEY(source_place_id,mass_local_date,mass_local_time),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl25_operator_venue_exception (
          issue TEXT PRIMARY KEY,
          source_place_id TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          inferred_mass_event_published INTEGER NOT NULL DEFAULT 0 CHECK(inferred_mass_event_published=0),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        """)
        for x in refs:
            db.execute("INSERT INTO cl25_geographic_reference "
                "(source_place_id,latitude,longitude,geometry_kind,host_building_only,evidence_json) "
                "VALUES (?,?,?,?,?,?)",
                (x["source_place_id"],x["latitude"],x["longitude"],
                 x["spatial_class"],
                 int(x["spatial_class"]=="HOST_CHURCH_BUILDING_NOT_EXACT_UPSTAIRS_WORSHIP_ROOM"),
                 json.dumps(x,sort_keys=True,ensure_ascii=False)))
        for x in held:
            db.execute("INSERT INTO cl25_private_house_chapel_hold "
                "(source_place_id,blocker,evidence_json) VALUES (?,?,?)",
                (x["source_place_id"],x["reason"],json.dumps(x,sort_keys=True,ensure_ascii=False)))
        for x in dated:
            db.execute("INSERT INTO cl25_dated_operator_candidate "
                "(source_place_id,mass_local_date,mass_local_time,venue_identity_text,evidence_json)"
                "VALUES (?,?,?,?,?)",
                (x["source_place_id"],x["date"],x["local_time"],
                 x["worship_place"],json.dumps(x,sort_keys=True,ensure_ascii=False)))
        for x in changes:
            db.execute("INSERT INTO cl25_operator_venue_exception "
                "(issue,source_place_id,evidence_json) VALUES (?,?,?)",
                (x["issue"],x["source_place_id"],json.dumps(x,sort_keys=True,ensure_ascii=False)))
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
        assert db.execute("SELECT COUNT(*) FROM canonical_site "
            "WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source "
            "WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    prior_supported={x[0] for x in db.execute(
        "SELECT source_place_id FROM cl20_building_spatial_candidate WHERE building_reference_supported=1")}
    prior_supported|={x[0] for x in db.execute(
        "SELECT source_place_id FROM cl23_georeferenced_worship_object")}
    prior_supported|={x[0] for x in db.execute(
        "SELECT source_place_id FROM cl24_research_building_reference")}
    prior_supported.add("CL17-DE-FSSP-POTSDAM")
    assert len(prior_supported)==31
    assert not (prior_supported&ids)
    all_georefs=prior_supported|ids
    assert len(all_georefs)==37
    prior_conflict={x[0] for x in db.execute(
        "SELECT source_place_id FROM cl20_building_spatial_candidate WHERE building_reference_supported=0")}
    assert prior_conflict=={"CL14-DE-FSSP-026"}
    private_held={x["source_place_id"] for x in held}
    assert len(all_georefs|prior_conflict|private_held)==39
    assert not(all_georefs&prior_conflict or all_georefs&private_held)
    stage=[]
    for sid,x in sorted(original.items()):
        state=("CL25_HOST_FOOTPRINT_INTERIOR_ROOM_NOT_MAPPED" if sid=="CL14-DE-FSSP-025"
               else "CL25_NEW_NAMED_WORSHIP_BUILDING_REFERENCE" if sid in ids
               else "CL20_CONFLICT_HELD" if sid in prior_conflict
               else "CL25_PRIVATE_HOUSE_CHAPEL_UNLOCATED" if sid in private_held
               else "CL20_CL24_PRIOR_RESEARCH_REFERENCE")
        stage.append({"source_place_id":sid,"original_name":x["owner_name"],
            "original_city":x["owner_city"],"spatial_state":state,
            "research_named_worship_or_host_building":int(sid in all_georefs),
            "mapped_actual_worship_room_geometry":int(sid in all_georefs and sid!="CL14-DE-FSSP-025"),
            "original_spatial_conflict_held":int(sid in prior_conflict),
            "private_house_hold":int(sid in private_held),
            "surveyed_visitor_door_approved":0,"public_pin_approved":0,
            "future_mass_approved":0})
    assert len(stage)==39
    export(opts.out_dir/"cl25_6_worship_or_host_geo_references.csv",refs)
    export(opts.out_dir/"cl25_1_private_house_chapel_hold.csv",held)
    export(opts.out_dir/"cl25_7_dated_owner_mass_candidates.csv",dated)
    export(opts.out_dir/"cl25_39_site_spatial_readiness.csv",stage)
    summary={
        "schema":"AO_CL25_FSSP_PILOT_SPATIAL_AND_DATED_SOURCE_SCREEN_V1",
        "frozen_pilot_sites":39,
        "inherited_supported_georeferences":31,
        "new_research_worship_or_host_georeferences":6,
        "new_named_osm_worship_or_host_way_references":5,
        "new_church_specific_non_osm_way_coordinates":1,
        "research_supported_worship_or_host_georeferences":37,
        "of_which_host_building_without_chapel_room_geometry":1,
        "research_worship_place_building_references_excluding_host_only":36,
        "prior_spatial_conflict_held":1,
        "private_house_chapel_without_public_geo":1,
        "remaining_exceptions_not_research_mapped":2,
        "new_explicit_operator_dated_mass_candidates":7,
        "new_approved_operator_dated_mass_instances":0,
        "operator_venue_exception_records":2,
        "source_closure_transfer_claims_retracted":1,
        "original_historical_mass_patterns_unchanged":74,
        "original_book_1962_supported_unchanged":256,
        "original_book_1962_held_unchanged":176,
        "newly_approved_entrances":0,"new_public_mass_schedule_entries":0,
        "new_public_map_pins":0,"new_una_cum_approvals":0
    }
    (opts.out_dir/"cl25_summary.json").write_text(
        json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS",**summary},sort_keys=True))
    db.close()
if __name__=="__main__":
    main()
