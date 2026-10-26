#!/usr/bin/env python3
"""CL28: validate dated future TLM source events across UK/DE and hard-zero releases.
No inferred recurrences; do not auto-admit sites to worldwide master.
"""
import argparse
import csv
import json
import hashlib
import sqlite3
from collections import Counter
from datetime import date
from pathlib import Path
from zoneinfo import ZoneInfo

SOURCE=Path("data/directory/research/cl28-crossnetwork-dated-20261026/evidence.json")

def write_csv(path, rows):
    assert rows
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--db",type=Path,required=True)
    parser.add_argument("--out-dir",type=Path,required=True)
    a=parser.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    d=json.loads(SOURCE.read_text(encoding="utf-8"))
    assert d["schema"]=="AO_CL28_CROSS_NETWORK_DATE_SPECIFIC_OPERATOR_BULK_V1"
    assert d["as_of"]=="2026-10-26"
    events=d["new_source_listed_candidates"]
    negative=d["source_negative_and_release_controls"]
    sources=d["operator_source_backlog"]
    assert len(events)==18
    assert len(negative)==9
    assert len(sources)==9
    assert set(x["priority"] for x in sources)<={1,2}
    assert sum(x["safe_candidates"] for x in sources)==18
    assert sum(x["status"] in (
        "NOVEMBER_LINK_INDEXED_DOCUMENT_NOT_FETCHED",
        "OCTOBER_ONLY_AT_OBSERVED_TIME",
        "LATEST_DIRECT_PDF_READ_COVERS_ONLY_18_TO_25_OCT",
        "LATEST_VERIFIED_PDF_OCT_18_25",
        "ARCHIVE_2026_ACCESSIBLE_THROUGH_AUG_SEPT_IN_HTML_FETCH")
        for x in sources)==6
    assert len({x["source_url"] for x in sources})==len(sources)
    assert {x["source"] for x in negative}=={
       "FSSP_UK_ALL_SOULS","FSSP_UK_ADORATION_TEXT","INGOLSTADT_ST_WILLIBALD",
       "DEGGENDORF_SECOND_MONDAY","STEPHANSPOSCHING_DATE_SPECIFIC",
       "FSSP_SAARLOUIS_NOVEMBER_PDF","REINBEK_NOVEMBER_MESSPLAN",
       "WIGRATZBAD_LAST_WEEKLY_PDF","FSSP_MUENCHEN_CYCLE"}
    assert {x["decision"] for x in negative if x["observed"]==0}=={
      "DOCUMENT_VISIBLE_BUT_UNREAD","DOCUMENT_LINK_VISIBLE_BUT_PDF_UNREAD",
      "PDF_COVERS_PAST_18_25_OCT","OCTOBER_NEWSLETTER_NOT_FUTURE_NOVEMBER"}
    assert d["source_scope_notes"]["pilot_sites_unchanged"]==39
    assert d["source_scope_notes"]["cl27_supported_georeferences_unchanged"]==38
    assert d["source_scope_notes"]["worldwide_deduplication_unperformed"] is True
    assert all(v==0 for v in d["release_zero"].values())
    grades=Counter(x["source_grade"] for x in events)
    assert grades==Counter({
      "FIRST_PARTY_FSSP_DATED_MASS_INTENTION":13,
      "HOST_PARISH_EXPLICIT_DATED_FSSP_MASS":2,
      "SECONDARY_COMPILED_DATE_SPECIFIC_EXCEPTION":1,
      "SECONDARY_COMPILED_EXPLICIT_2026_DATE":2})
    seen=set()
    place_counts=Counter()
    site_time=[]
    source_fingerprints=[]
    for x in events:
        assert x["research_source_event_key"] not in seen
        seen.add(x["research_source_event_key"])
        k=x["pilot_source_place_id"] or x["external_site_key"]
        assert bool(x["pilot_source_place_id"])!=bool(x["external_site_key"])
        assert x["source_url"].startswith("https://")
        assert x["source_observation"]=="2026-10-26"
        assert date.fromisoformat(x["local_date"])>date(2026,10,26)
        assert x["timezone"] in ("Europe/London","Europe/Berlin")
        assert ZoneInfo(x["timezone"]) is not None
        assert len(x["local_time"])==5 and x["local_time"][2]==":"
        hh,mm=map(int,x["local_time"].split(":"))
        assert 0<=hh<=23 and 0<=mm<=59
        assert x["matched_worldwide_master_id"] is None
        assert x["source_calendar_not_equivalent_to_actual_occurrence"] is True
        assert x["public_mass_approved"] is False and x["public_venue_approved"] is False
        assert x["una_cum_approved"] is False
        assert x["research_disposition"] in {
          "SOURCE_LISTED_NOT_INDEPENDENTLY_APPROVED",
          "HOLD_AMBIGUOUS_SERVICE_LABEL",
          "HOLD_PENDING_LOCAL_OPERATOR_CORROBORATION"}
        if x["source_grade"]=="FIRST_PARTY_FSSP_DATED_MASS_INTENTION":
            assert x["source_url"]=="https://fssp.org.uk/sunday-bulletin-18-october-2026/"
        if x["source_grade"]=="HOST_PARISH_EXPLICIT_DATED_FSSP_MASS":
            assert k=="CL14-DE-FSSP-021"
        if x["source_grade"].startswith("SECONDARY_"):
            assert x["research_disposition"]=="HOLD_PENDING_LOCAL_OPERATOR_CORROBORATION"
        item=(k,x["local_date"],x["local_time"],x["timezone"])
        assert item not in seen # string keys and tuple keys share same set safely
        seen.add(item)
        place_counts[k]+=1
        site_time.append(item)
        fingerprint=hashlib.sha256("|".join(item).encode("utf-8")).hexdigest()
        source_fingerprints.append({**x,"normalized_site_date_time_sha256":fingerprint})
    assert len(site_time)==18 and len(set(site_time))==18
    assert len(place_counts)==6
    assert sorted(place_counts.values())==[1,2,2,2,4,7]
    # 7 new at Our Lady of Ransom, four at Chesham, one at All Saints:
    # OLOR: four weekdays + one Sat + three All Souls = eight; Chesham 4 (Nov1+three All Souls).
    assert place_counts["UK-BEDFORD-OUR-LADY-OF-RANSOM-KEMPSTON"]==8
    assert place_counts["UK-CHESHAM-BOIS-OUR-LADY-OF-PERPETUAL-SUCCOUR"]==4
    assert place_counts["UK-BEDFORD-ALL-SAINTS-KEMPSTON"]==1
    assert sum(1 for x in events if x["local_date"]=="2026-11-02")==6
    assert {x["local_time"] for x in events if x["local_date"]=="2026-11-02" and "CHESHAM" in (x["external_site_key"] or "")}=={"06:30","10:00","10:30"}
    assert sum(x["research_disposition"]=="HOLD_AMBIGUOUS_SERVICE_LABEL" for x in events)==1
    assert sum(x["research_disposition"]=="HOLD_PENDING_LOCAL_OPERATOR_CORROBORATION" for x in events)==3
    assert len([x for x in events if x["pilot_source_place_id"]=="CL14-DE-FSSP-021"])==2
    assert len([x for x in events if x["source_grade"].startswith("SECONDARY_")])==3
    # Never copy last year's All Souls moved date: 2025 Nov3 != 2026 Nov2.
    assert "2025-11-03" not in (x["local_date"] for x in events)

    db=sqlite3.connect(a.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    base_checks={
      "canonical_site":2584,"mass_time":4681,"cl17_owner_site_stage":39,
      "cl17_accepted_mass_gates":256,"cl18_recurrence_rules":74,
      "cl23_georeferenced_worship_object":17,
      "cl24_research_building_reference":8,
      "cl25_geographic_reference":6,
      "cl25_dated_operator_candidate":7,
      "cl26_external_date_specific_ordo_event":14,
      "cl27_39_pilot_operator_source_ledger":39,
      "cl27_local_dated_research_candidate":9}
    for t,n in base_checks.items():
        count=db.execute("SELECT COUNT(*) FROM "+t).fetchone()[0]
        assert count==n,(t,count,n)
    pilotids={r[0] for r in db.execute("SELECT source_place_id FROM cl17_owner_site_stage")}
    assert set(x["pilot_source_place_id"] for x in events if x["pilot_source_place_id"]).issubset(pilotids)
    old={
      ("CL14-DE-FSSP-028",x["mass_local_date"],x["mass_local_time"])
      for x in db.execute("SELECT mass_local_date,mass_local_time FROM cl25_dated_operator_candidate")
    }
    old|={
      (x["external_site_key"],x["local_date"],x["local_time"])
      for x in db.execute("SELECT external_site_key,local_date,local_time FROM cl26_external_date_specific_ordo_event")
    }
    old|={
      (x["pilot_source_place_id"] or x["external_site_key"],x["local_date"],x["local_time"])
      for x in db.execute("SELECT pilot_source_place_id,external_site_key,local_date,local_time FROM cl27_local_dated_research_candidate")
    }
    assert len(old)==30
    assert not old.intersection((x[0],x[1],x[2]) for x in site_time)
    with db:
        db.executescript("""
          CREATE TABLE cl28_crossnetwork_dated_source_candidate(
            research_source_event_key TEXT PRIMARY KEY,
            pilot_source_place_id TEXT,
            external_site_key TEXT,
            local_date TEXT NOT NULL,
            local_time TEXT NOT NULL,
            timezone TEXT NOT NULL,
            evidence_grade TEXT NOT NULL,
            event_fingerprint_sha256 TEXT NOT NULL UNIQUE,
            evidence_json TEXT NOT NULL,
            matched_global_site_id TEXT,
            approved_future_mass INTEGER NOT NULL DEFAULT 0 CHECK(approved_future_mass=0),
            approved_public_venue INTEGER NOT NULL DEFAULT 0 CHECK(approved_public_venue=0),
            FOREIGN KEY(pilot_source_place_id) REFERENCES cl17_owner_site_stage(source_place_id),
            CHECK((pilot_source_place_id IS NULL)!=(external_site_key IS NULL))
          );
          CREATE TABLE cl28_feed_readback_hold(
            exception_source TEXT PRIMARY KEY,
            hold_disposition TEXT NOT NULL,
            evidence_json TEXT NOT NULL,
            published_without_readback INTEGER NOT NULL DEFAULT 0 CHECK(published_without_readback=0)
          );
        """)
        for x in source_fingerprints:
            db.execute("INSERT INTO cl28_crossnetwork_dated_source_candidate"
              "(research_source_event_key,pilot_source_place_id,external_site_key,local_date,local_time,timezone,"
              "evidence_grade,event_fingerprint_sha256,evidence_json) VALUES(?,?,?,?,?,?,?,?,?)",(
                x["research_source_event_key"],x["pilot_source_place_id"],x["external_site_key"],
                x["local_date"],x["local_time"],x["timezone"],x["source_grade"],
                x["normalized_site_date_time_sha256"],json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for h in negative:
            db.execute("INSERT INTO cl28_feed_readback_hold(exception_source,hold_disposition,evidence_json)"
                " VALUES(?,?,?)",(h["source"],h["decision"],json.dumps(h,ensure_ascii=False,sort_keys=True)))
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM cl28_crossnetwork_dated_source_candidate "
                          "WHERE matched_global_site_id IS NOT NULL OR approved_future_mass=1").fetchone()[0]==0
    write_csv(a.out_dir/"cl28_18_date_specific_candidate_events.csv",source_fingerprints)
    write_csv(a.out_dir/"cl28_9_source_backlog.csv",sources)
    write_csv(a.out_dir/"cl28_9_exception_readback_controls.csv",negative)
    report={
      "schema":"AO_CL28_CROSSNETWORK_DATED_OPERATOR_RECONCILIATION_V1",
      "source_event_records_new":18,"first_party_FSSP_uk_dated_rows":13,
      "host_parish_dated_FSSP_Germany_rows":2,
      "secondary_exact_date_rows":3,
      "ambiguous_Mass_vs_adoration_service_label_held":1,
      "secondary_dates_held_for_local_operator_confirmation":3,
      "source_listed_without_those_4_holds":14,
      "new_date_specific_site_locations":6,
      "new_German_pilot_event_candidates":2,
      "new_external_to_pilot_event_candidates":16,
      "cross_phase_source_listed_candidate_rows_CL25_CL28":48,
      "previous_phase_source_listed_candidates":30,
      "local_source_date_time_fingerprint_collisions_prior_phases":0,
      "unread_or_stale_source_feed_deferrals":6,
      "source_readback_and_exception_controls":9,
      "All_Souls_2026_distinct_location_time_slots":6,
      "prior_existing_pilot_39_sites":39,
      "prior_geo_references":38,
      "historic_pilot_mass_patterns_unchanged":74,
      "1962_wording_supported_unchanged":256,
      "1962_wording_held_unchanged":176,
      "canonical_site_total_unchanged":2584,
      "mass_time_total_unchanged":4681,
      "public_calendar_new":0,"public_sites_new":0,
      "public_geocodes_new":0,"Una_Cum_new":0,
      "global_master_dedup_approved":0,
      "ci_verify_final_required":True}
    (a.out_dir/"cl28_summary.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS",**report},sort_keys=True))
    db.close()

if __name__=="__main__":
    main()
