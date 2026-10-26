#!/usr/bin/env python3
"""CL19: second-source screening for 27 previously unreviewed German FSSP pilot sites.

Research-only continuation of CL18. Hard separation: church identity source,
published coordinate candidate, verified entrance, future owner-announced
celebration, and public schedule approval. Python standard library only.
"""
import argparse
import csv
from collections import Counter
from pathlib import Path
from datetime import date
import json
import sqlite3

MANIFEST=Path("data/directory/research/cl19-remaining-fssp-20261026/site-reviews.json")
GRADES={"INDEPENDENT_PRIMARY","LOCAL_FSSP_ONLY","SECONDARY_HERITAGE"}
DATED=[
  {"source_place_id":"CL14-DE-FSSP-004","mass_row_no":23,"date":"2026-10-11","historical_time":"10:30","observed_owner_time":"08:00","evidence_url":"https://koeln.petrusbruderschaft.de/termine/termine-duesseldorf/","evidence_kind":"DATED_OWNER_OVERRIDE_PAST","release_approved":0},
  {"source_place_id":"CL14-DE-FSSP-028","mass_row_no":54,"date":"2026-11-08","historical_time":"18:00","observed_owner_time":"18:00","evidence_url":"https://lateinische-messe-nuernberg.de/termine/","evidence_kind":"DATED_LOCAL_ORGANIZER_ANNOUNCED","release_approved":0},
  {"source_place_id":"CL14-DE-FSSP-028","mass_row_no":54,"date":"2026-11-22","historical_time":"18:00","observed_owner_time":"18:00","evidence_url":"https://lateinische-messe-nuernberg.de/termine/","evidence_kind":"DATED_LOCAL_ORGANIZER_ANNOUNCED","release_approved":0},
]
def write_csv(path,records):
    assert records
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(records[0]),extrasaction="ignore")
        w.writeheader();w.writerows(records)
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",required=True,type=Path)
    p.add_argument("--out-dir",required=True,type=Path)
    a=p.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    doc=json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert doc["schema"]=="AO_CL19_REMAINING_27_FSSP_SOURCE_IDENTITY_REVIEW_V1"
    assert doc["as_of"]=="2026-10-26"
    entries=doc["entries"]
    assert len(entries)==27
    assert len({r["source_place_id"] for r in entries})==27
    grade_count=Counter(r["secondary_source_grade"] for r in entries)
    assert grade_count==Counter({"INDEPENDENT_PRIMARY":22,"LOCAL_FSSP_ONLY":4,"SECONDARY_HERITAGE":1}),grade_count
    conn=sqlite3.connect(a.db)
    conn.row_factory=sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    expected={"mass_time":4681,"cl17_owner_site_stage":39,"cl17_accepted_mass_gates":256,
      "cl18_recurrence_rules":74,"cl18_site_verification":39}
    for t,n in expected.items():
        assert conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]==n,(t,n)
    reviewed_prior={r["source_place_id"] for r in conn.execute("SELECT source_place_id FROM cl18_site_verification WHERE independent_crosscheck=1")}
    assert len(reviewed_prior)==12
    pilot={r["source_place_id"]:dict(r) for r in conn.execute("SELECT * FROM cl17_owner_site_stage")}
    assert len(pilot)==39
    chosen={r["source_place_id"] for r in entries}
    assert not reviewed_prior&chosen
    assert chosen==set(pilot)-reviewed_prior
    assert set(pilot)==reviewed_prior|chosen
    out=[]
    followups=[]
    for r in entries:
        sid=r["source_place_id"]
        assert r["secondary_source_grade"] in GRADES
        assert r["sources"] and all(x["url"].startswith("https://") and x["role"] for x in r["sources"])
        assert r["independently_verified_worship_entrance"] is False
        assert r["independently_approved_public_coordinates"] is False
        assert r["date_specific_mass_recurrence_approved"] is False
        assert r["public_release"] is False
        assert r["physical_church_identity_research_confirmed"]==(r["secondary_source_grade"]=="INDEPENDENT_PRIMARY")
        owner=pilot[sid]
        affected=conn.execute("SELECT COUNT(*) FROM cl18_recurrence_rules WHERE source_place_id=?",(sid,)).fetchone()[0]
        assert affected>=1
        has_candidate=bool(r.get("published_building_coordinate_candidate"))
        if has_candidate:
            coordinate=r["published_building_coordinate_candidate"]
            assert sid=="CL14-DE-FSSP-022"
            assert 48 < coordinate["lat"] < 50 and 10 < coordinate["lon"] < 13
            assert coordinate["kind"]=="SOURCE_PUBLISHED_CHURCH_BUILDING_REFERENCE_ONLY"
            assert coordinate["public_approved"] is False
        row={
          "source_place_id":sid,"historical_group_id":owner["historical_group_id"],
          "owner_named_site":owner["owner_name"],"owner_city":owner["owner_city"],
          "frozen_owner_address":owner["owner_address"],
          "second_source_grade":r["secondary_source_grade"],
          "independent_primary_church_identity":int(r["secondary_source_grade"]=="INDEPENDENT_PRIMARY"),
          "reviewed_citation_count":len(r["sources"]),
          "citation_urls":";".join(x["url"] for x in r["sources"]),
          "source_observation":r["observation"],
          "blocking_exceptions":";".join(r["blocking_exceptions"]),
          "associated_mass_rows":affected,
          "published_building_coord_candidate":int(has_candidate),
          "candidate_latitude":str(r["published_building_coordinate_candidate"]["lat"]) if has_candidate else "",
          "candidate_longitude":str(r["published_building_coordinate_candidate"]["lon"]) if has_candidate else "",
          "church_entrance_verified":0,"geocoordinate_approved":0,
          "recurrence_approved":0,"public_pin_approved":0,"public_mass_approved":0,
          "next_check":"INDEPENDENT_DOOR_LEVEL_SITE_ACCESS_AND_OWNER_FUTURE_CALENDAR" if not r["blocking_exceptions"] else
                       "RESOLVE_SOURCE_EXCEPTIONS_AND_VERIFY_DOOR_AND_FUTURE_CALENDAR"
        }
        out.append(row)
        if r["blocking_exceptions"]:
            followups.append(row)
    out.sort(key=lambda x:x["source_place_id"])
    followups.sort(key=lambda x:x["source_place_id"])
    assert sum(x["associated_mass_rows"] for x in out)==sum(conn.execute("SELECT COUNT(*) FROM cl18_recurrence_rules WHERE source_place_id=?",(x["source_place_id"],)).fetchone()[0] for x in out)
    assert sum(x["published_building_coord_candidate"] for x in out)==1
    assert len({x["historical_group_id"] for x in out})==27
    assert len(DATED)==3
    for event in DATED:
        x=conn.execute("SELECT g.historical_group_id,m.original_json FROM cl17_accepted_mass_gates g JOIN mass_time m ON m.row_no=g.row_no WHERE g.row_no=? AND g.source_place_id=?",(event["mass_row_no"],event["source_place_id"])).fetchone()
        assert x is not None
        original=json.loads(x["original_json"])
        assert original[7]==event["historical_time"]
        assert event["observed_owner_time"] and date.fromisoformat(event["date"])
        assert event["release_approved"]==0
    with conn:
        conn.executescript("""
        CREATE TABLE cl19_second_source_review (
           source_place_id TEXT PRIMARY KEY,source_grade TEXT NOT NULL,
           group_id TEXT NOT NULL,review_json TEXT NOT NULL,
           independent_primary INTEGER NOT NULL CHECK(independent_primary IN (0,1)),
           entrance_verified INTEGER NOT NULL DEFAULT 0 CHECK(entrance_verified=0),
           geocode_approved INTEGER NOT NULL DEFAULT 0 CHECK(geocode_approved=0),
           public_release INTEGER NOT NULL DEFAULT 0 CHECK(public_release=0),
           FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id)
        );
        CREATE TABLE cl19_dated_source_event (
           source_place_id TEXT NOT NULL,row_no INTEGER NOT NULL,event_date TEXT NOT NULL,
           source_clock TEXT NOT NULL,reported_clock TEXT NOT NULL,
           status TEXT NOT NULL,source_url TEXT NOT NULL,
           public_approval INTEGER NOT NULL DEFAULT 0 CHECK(public_approval=0),
           event_json TEXT NOT NULL,
           PRIMARY KEY(row_no,event_date),
           FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
           FOREIGN KEY(source_place_id) REFERENCES cl19_second_source_review(source_place_id)
        );
        """)
        for r in entries:
            conn.execute("INSERT INTO cl19_second_source_review(source_place_id,source_grade,group_id,review_json,independent_primary) VALUES(?,?,?,?,?)",(
                r["source_place_id"],r["secondary_source_grade"],
                pilot[r["source_place_id"]]["historical_group_id"],
                json.dumps(r,ensure_ascii=False,sort_keys=True),
                int(r["secondary_source_grade"]=="INDEPENDENT_PRIMARY")))
        for e in DATED:
            conn.execute("INSERT INTO cl19_dated_source_event(source_place_id,row_no,event_date,source_clock,reported_clock,status,source_url,event_json) VALUES(?,?,?,?,?,?,?,?)",(
                e["source_place_id"],e["mass_row_no"],e["date"],e["historical_time"],
                e["observed_owner_time"],e["evidence_kind"],e["evidence_url"],
                json.dumps(e,ensure_ascii=False,sort_keys=True)))
        assert conn.execute("SELECT COUNT(*) FROM cl19_second_source_review").fetchone()[0]==27
        assert conn.execute("SELECT COUNT(*) FROM cl19_second_source_review WHERE independent_primary=1").fetchone()[0]==22
        assert conn.execute("SELECT COUNT(*) FROM cl19_dated_source_event").fetchone()[0]==3
        assert conn.execute("SELECT COUNT(*) FROM cl19_second_source_review WHERE entrance_verified=1 OR geocode_approved=1 OR public_release=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM cl19_dated_source_event WHERE public_approval=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM cl18_site_verification WHERE independent_crosscheck=1").fetchone()[0]==12
        assert conn.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert conn.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not conn.execute("PRAGMA foreign_key_check").fetchall()
    write_csv(a.out_dir/"cl19_27_remaining_place_reviews.csv",out)
    write_csv(a.out_dir/"cl19_source_exceptions_for_followup.csv",followups)
    write_csv(a.out_dir/"cl19_3_dated_owner_calendar_witnesses.csv",DATED)
    summary={
      "schema":"AO_CL19_FINAL_39_FSSP_SITE_SOURCE_SCREEN_V1","as_of":"2026-10-26",
      "owner_named_pilot_sites":39,
      "already_crosschecked_in_CL18":12,
      "new_sites_screened_against_another_source":27,
      "pilot_sites_with_some_second_source_screen":39,
      "new_independent_primary_church_identity_sources":22,
      "new_same_institution_local_FSSP_sources":4,
      "new_secondary_only_heritage_references":1,
      "all_new_sites_public_entrances_approved":0,
      "all_new_sites_geocodes_approved":0,
      "new_source_published_building_coord_candidates":1,
      "candidate_coords_are_entrance_verified":False,
      "historical_book_supported_mass_rows_unchanged":256,
      "unresolved_original_book_candidates_unchanged":176,
      "39_pilot_source_scope_mass_rows_unchanged":74,
      "dated_owner_calendar_observations_committed":3,
      "upcoming_2026_11_08_and_11_22_nuremberg_owner_announcement_only":True,
      "old_2026_10_11_duesseldorf_0800_override_preserved":True,
      "new_current_mass_occurrence_public_approvals":0,
      "new_public_map_pins":0,
      "new_una_cum":0,
      "cautions":[
        "Stuttgart St Albert source postcodes 70439 and 70435 differ despite same church number.",
        "Schwaebisch Gmuend St Leonhard has Friedhofstrasse 2 vs Aalener Strasse 2; nearby Herrgottsruhkapelle at Aalener 4 is distinct.",
        "Amberg Mariahilf sanctuary operator gives number 3, city monument inventory calls number 4 the church and number 3 monastery.",
        "Bad Groenenbach Schlosskapelle is in Ringeisenhaus, not inside the neighbouring Hohe Schloss.",
        "Landsberg Ignatiuskapelle is first floor above sacristy of Heilig Kreuz; access via courtyard and open barrier during Mass.",
        "Heidelberg weekly 18:00 practice began 2024-12-01, older twice-monthly text remains on site.",
        "Dusseldorf 2026-10-11 08:00 is an explicit one-day exception to Sunday 10:30.",
        "Odenthal Heilig Kreuz is also named by another Christian congregation; physical ownership cannot be inferred.",
        "Bonn Rheinbacher Str street number 13 appears on FSSP international only and requires direct building-door corroboration.",
        "Nussdorf Leonhardiweg 5 is parish office, not established to be chapel door.",
      ],
      "next_release_steps":[
        "Independent coordinate + exact public worship-room door mapping for 39 staged sites using footprint/owner directions, prioritizing known cross-source disputes.",
        "Use actual future dated local calendars for corresponding 74 Mass rules; preserve changed venue, month and feast exceptions.",
        "Only explicitly approve Mass recurrence/site publication after separate automated and human editorial checks, never from the 2026-10-27--12-31 arithmetic previews."
      ]
    }
    (a.out_dir/"cl19_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","reviewed_remaining":27,"independent_primary_new":22,"local_FSSP_only":4,"secondary_only":1,"full_pilot_source_review":39,"public_releases":0},sort_keys=True))
    conn.close()
if __name__=="__main__":main()
