#!/usr/bin/env python3
"""CL27 — bulk source-intake ledger (39 frozen pilot places), nine explicit
future-source candidates, and mandatory syndicator negative controls.
All additions are research only: no site merges, no public pins, no calendar events.
"""
import argparse
import csv
from collections import Counter
from datetime import date
import json
import sqlite3
from pathlib import Path

INPUT=Path("data/directory/research/cl27-operator-bulk-20261026/evidence.json")
def output_csv(path,rows):
    assert rows
    with path.open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]),extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--db",type=Path,required=True)
    parser.add_argument("--out-dir",type=Path,required=True)
    p=parser.parse_args()
    p.out_dir.mkdir(parents=True,exist_ok=True)
    raw=json.loads(INPUT.read_text(encoding="utf-8"))
    assert raw["schema"]=="AO_CL27_DATED_OPERATOR_BATCH_AND_NEGATIVE_FEED_TESTS_V1"
    assert raw["as_of"]=="2026-10-26"
    pilot=raw["frozen_pilot_site_sources"]
    feeds=raw["source_feeds_reviewed"]
    dates=raw["additional_individually_listed_future_mass_candidates"]
    problems=raw["source_feed_quality_exceptions"]
    policy=raw["source_approval_policy"]
    assert len(pilot)==39 and len(feeds)==10 and len(dates)==9 and len(problems)==6
    assert len({x["source_place_id"] for x in pilot})==39
    assert {x["source_place_id"] for x in pilot}=={
       *(f"CL14-DE-FSSP-{i:03d}" for i in range(1,39)),
       "CL17-DE-FSSP-POTSDAM"}
    assert {x["id"] for x in feeds}=={
       "NORTH2026","BLAIBACH2026","ATKATZELSDORF2026",
       "SAARLOUIS","REINBEK","OBERFLOCKENBACH",
       "WIGRATZBAD","ST_CLEMENS_HANNOVER","PMT_GENERAL","GOCATH"}
    assert sum(x["listed_future_event_count"] for x in feeds)==9
    assert {x["code"] for x in problems}=={
      "WALLDUERN_MONTHLY_NOT_WEEKLY",
      "TANN_EXCLUDED_FIRST_FRIDAY",
      "WINTERLINGEN_SEASON_AND_ALTERNATE_VENUE",
      "POTSDAM_TRIPLE_SYNDICATED_WORSHIP_LABEL",
      "RECURRENCE_EXPANSION_NOT_OWNER_DATE_CONFIRMATION",
      "KATZELSDORF_MUTABLE_PARISH_INDEX_SNAPSHOT"}
    assert sum(x["release"]=="BLOCK" for x in problems)==5
    assert sum(x["release"]=="HOLD_FOR_REFRESH" for x in problems)==1
    assert policy=={
      "date_specific_local_operator":"SOURCE_CANDIDATE_ONLY",
      "diocesan_search_index":"CANDIDATE_REQUIRES_CURRENT_DIRECT_RECHECK",
      "recurrence_only":"NOT_AN_EVENT",
      "syndicated_projection":"NOT_AN_EVENT",
      "approved_future_occurrences":0,
      "worldwide_master_identity_assignments":0,
      "new_public_map_pins":0,
      "new_una_cum":0}
    orig={x["source_place_id"]:x for x in pilot}
    for psite in pilot:
        assert psite["owner_directory_source"].startswith("https://")
        assert psite["future_event_approved"] is False
    assert len({r["owner_historical_row_nos"][0] for r in pilot
        if r["owner_historical_row_nos"]})==38
    specific=Counter()
    setkeys=set()
    for e in dates:
        assert e["external_source_record_key"] not in setkeys
        setkeys.add(e["external_source_record_key"])
        assert date.fromisoformat(e["date"])>date(2026,10,26)
        assert e["timezone"] in ("Europe/Berlin","Europe/Vienna")
        assert len(e["local_time"])==5 and e["local_time"][2]==":"
        assert e["source_url"].startswith("https://")
        assert e["source_observed_at"]=="2026-10-26"
        assert e["original_public_mass_approval"] is False
        assert e["exact_date_venue_independent_human_recheck_pending"] is True
        assert bool(e["pilot_source_place_id"])!=bool(e["external_place_key"])
        if e["pilot_source_place_id"]:
            assert e["pilot_source_place_id"] in orig
        specific[e["event_class"]]+=1
    assert specific==Counter({
      "LOCAL_APOSTOLATE_EXPLICIT_DATE_HUMAN_PUBLISHED":5,
      "DIOCESAN_PARISH_EXPLICIT_DATE_ON_SEARCH_INDEX_SNAPSHOT":4})
    assert len({(e["pilot_source_place_id"] or e["external_place_key"],e["date"],e["local_time"])
                for e in dates})==9
    assert sorted(e["date"] for e in dates if e["pilot_source_place_id"]=="CL14-DE-FSSP-002")==[
      "2026-11-01","2026-12-06"]
    assert [(e["date"],e["local_time"]) for e in dates if e["pilot_source_place_id"]=="CL14-DE-FSSP-038"]==[
      ("2026-11-01","11:30")]
    vienna=[e for e in dates if e["external_place_key"]=="AT-KATZELSDORF-PFARRKIRCHE"]
    assert len(vienna)==4 and all("source" in e["evidence_limit"].lower() for e in vienna)
    assert set(e["date"] for e in vienna)=={"2026-11-01","2026-11-06","2026-11-08","2026-11-15"}
    # Not every Sunday is independently listed by that source; DO NOT manufacture Nov 22.
    assert "2026-11-22" not in [e["date"] for e in vienna]
    db=sqlite3.connect(p.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for tbl,n in (("canonical_site",2584),("mass_time",4681),
        ("cl17_owner_site_stage",39),("cl17_accepted_mass_gates",256),
        ("cl18_recurrence_rules",74),
        ("cl23_georeferenced_worship_object",17),
        ("cl24_research_building_reference",8),
        ("cl25_geographic_reference",6),
        ("cl25_dated_operator_candidate",7),
        ("cl26_host_chapel_identity_resolution",1),
        ("cl26_external_date_specific_ordo_event",14)):
        k=db.execute("SELECT COUNT(*) FROM "+tbl).fetchone()[0]
        assert k==n,(tbl,k,n)
    ids={x["source_place_id"] for x in db.execute("SELECT source_place_id FROM cl17_owner_site_stage")}
    assert ids==set(orig)
    # Confirm source dates overlap neither earlier Nürnberg nor Freiburg datasets.
    prev=[("CL14-DE-FSSP-028",r["mass_local_date"],r["mass_local_time"])
          for r in db.execute("SELECT mass_local_date,mass_local_time FROM cl25_dated_operator_candidate")]
    prev+= [(r["external_site_key"],r["local_date"],r["local_time"])
            for r in db.execute("SELECT external_site_key,local_date,local_time FROM cl26_external_date_specific_ordo_event")]
    assert len(prev)==21
    new={(r["pilot_source_place_id"] or r["external_place_key"],r["date"],r["local_time"])
         for r in dates}
    assert not(new&set(prev))
    with db:
        db.executescript("""
        CREATE TABLE cl27_39_pilot_operator_source_ledger (
          source_place_id TEXT PRIMARY KEY,
          dated_future_source_status TEXT NOT NULL,
          source_evidence_json TEXT NOT NULL,
          future_event_approved INTEGER NOT NULL DEFAULT 0 CHECK(future_event_approved=0),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl27_local_dated_research_candidate (
          source_record_key TEXT PRIMARY KEY,
          pilot_source_place_id TEXT,
          external_site_key TEXT,
          local_date TEXT NOT NULL,
          local_time TEXT NOT NULL,
          source_grade TEXT NOT NULL,
          source_evidence_json TEXT NOT NULL,
          independently_approved INTEGER NOT NULL DEFAULT 0 CHECK(independently_approved=0),
          published_mass_instance INTEGER NOT NULL DEFAULT 0 CHECK(published_mass_instance=0),
          FOREIGN KEY(pilot_source_place_id) REFERENCES cl17_owner_site_stage(source_place_id),
          CHECK ((pilot_source_place_id IS NULL) != (external_site_key IS NULL)));
        CREATE TABLE cl27_schedule_feed_negative_control (
          exception_code TEXT PRIMARY KEY,
          disposition TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          published_schedule_from_feed INTEGER NOT NULL DEFAULT 0 CHECK(published_schedule_from_feed=0));
        """)
        for x in pilot:
            db.execute("INSERT INTO cl27_39_pilot_operator_source_ledger "
                "(source_place_id,dated_future_source_status,source_evidence_json) VALUES (?,?,?)",
                (x["source_place_id"],x["exact_future_event_operator_screen_status"],
                 json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for x in dates:
            db.execute("INSERT INTO cl27_local_dated_research_candidate "
                "(source_record_key,pilot_source_place_id,external_site_key,local_date,"
                "local_time,source_grade,source_evidence_json) VALUES (?,?,?,?,?,?,?)",
                (x["external_source_record_key"],x["pilot_source_place_id"],
                 x["external_place_key"],x["date"],x["local_time"],x["event_class"],
                 json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for x in problems:
            db.execute("INSERT INTO cl27_schedule_feed_negative_control "
                "(exception_code,disposition,evidence_json) VALUES (?,?,?)",
                (x["code"],x["release"],json.dumps(x,ensure_ascii=False,sort_keys=True)))
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM cl27_local_dated_research_candidate WHERE published_mass_instance=1 OR independently_approved=1").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    output_csv(p.out_dir/"cl27_39_pilot_site_operator_date_screen.csv",pilot)
    output_csv(p.out_dir/"cl27_9_explicit_dated_source_candidates.csv",dates)
    output_csv(p.out_dir/"cl27_10_source_feed_triage.csv",feeds)
    output_csv(p.out_dir/"cl27_6_syndication_quality_exceptions.csv",problems)
    summary={
     "schema":"AO_CL27_DATED_OPERATOR_BULK_SCREEN_V1",
     "frozen_pilot_source_places_scoped":39,
     "feeds_screened_and_classified":10,
     "new_individually_listed_future_source_candidates":9,
     "of_which_local_organizer_full_page_date_candidates":5,
     "of_which_mutable_index_requires_direct_refresh":4,
     "new_german_pilot_source_event_candidates":3,
     "new_outside_pilot_source_event_candidates":6,
     "previous_CL25_individually_listed_dates":7,
     "previous_CL26_individually_listed_dates":14,
     "cumulative_cross_phase_dated_source_candidates":30,
     "source_syndication_negative_controls":6,
     "hard_false_occurrence_or_wrong_venue_syndication_guards":5,
     "indexed_source_requires_direct_refresh":1,
     "research_supported_pilot_building_or_host_references_unchanged":38,
     "unlocated_private_pilot_religious_house_unchanged":1,
     "frozen_pilot_mass_patterns_unchanged":74,
     "1962_wording_evidence_supported_unchanged":256,
     "1962_wording_evidence_held_unchanged":176,
     "approved_new_future_Mass_events":0,
     "new_public_map_pins":0,
     "new_entrance_coordinates":0,
     "new_una_cum":0,
     "mass_time_rows_unchanged":4681,
     "canonical_site_rows_unchanged":2584
    }
    (p.out_dir/"cl27_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS",**summary},sort_keys=True))
    db.close()
if __name__=="__main__":
    main()
