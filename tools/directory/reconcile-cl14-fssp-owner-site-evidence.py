#!/usr/bin/env python3
"""CL14: exact owner-evidence match for 73 held FSSP DE source rows.

Adds non-public evidence and physical-address research to the same SQLite
lineage. The original CL2–CL13 records and acceptance flags remain immutable.
The source schedule's explicit exceptions are kept; no recurrence releases.
"""
import argparse
import csv
import json
import sqlite3
from pathlib import Path
from collections import defaultdict, Counter

MANIFEST=Path("data/directory/research/cl14-fssp-owner-site-match-20261026/owner-slots.json")
ORIGINAL_URL="https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php"
def emit_csv(path,rows):
    if not rows: raise ValueError("Empty output")
    with path.open("w",encoding="utf-8",newline="") as fp:
        w=csv.DictWriter(fp,fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--db",required=True,type=Path)
    parser.add_argument("--out-dir",required=True,type=Path)
    args=parser.parse_args()
    args.out_dir.mkdir(parents=True,exist_ok=True)
    d=json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert d["schema"]=="AO_CL14_DIRECT_FSSP_OWNER_SLOT_AND_ADDRESS_EVIDENCE_V1"
    assert d["retrieved_on"]=="2026-10-26"
    assert d["original_schedule_source_url"]==ORIGINAL_URL
    sites=d["physical_sites"]
    assert len(sites)==38
    accepted_slots=[(p,s) for p in sites for s in p["original_slot_locks"]]
    assert len(accepted_slots)==73
    assert len({s["row_no"] for p,s in accepted_slots})==73
    db=sqlite3.connect(args.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for table,n in [("canonical_site",2584),("mass_time",4681),("cl9_mass_candidate",432),
                    ("cl10_1962_mass_evidence",85),("cl11_mass_source_scope",118),
                    ("cl12_singleton_evidence",75),("cl13_remaining_1962_evidence",154)]:
        got=db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        assert got==n,(table,got,n)
    former=db.execute("SELECT row_no FROM cl13_remaining_1962_evidence WHERE institutional_programme_only=1 AND evidence_1962_slot_accepted=0").fetchall()
    formal_held={r["row_no"] for r in former}
    assert len(formal_held)==73
    assert formal_held=={s["row_no"] for p,s in accepted_slots}
    assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    source_rows=db.execute("SELECT row_no FROM mass_time WHERE row_no=3468").fetchone()
    assert source_rows is not None and 3468 not in formal_held

    site_out=[]
    slot_out=[]
    unique_groups=set()
    unique_address=set()
    for idx,p in enumerate(sites,1):
        assert p["owner_page_url"]==ORIGINAL_URL
        assert p["owner_1962_policy_url"].startswith("https://")
        assert p["book_evidence_status"]=="OWNER_1962_PROGRAMME_MATCHED_TO_NAMED_VENUE_AND_SLOT"
        assert p["location_status"]=="FIRST_PARTY_NAMED_ADDRESS_EVIDENCE_ONLY"
        assert p["canonical_place_approved"] is False
        assert p["current_week_recurring_public_approval"] is False
        assert p["address"] and p["city"] and p["church"]
        loc=p["city"]+"|"+p["church"]+"|"+p["address"]
        assert loc not in unique_address,loc
        unique_address.add(loc)
        assert len(p["owner_page_lines"])==2 and p["owner_page_lines"][0] < p["owner_page_lines"][1]
        site_groups=set()
        for s in p["original_slot_locks"]:
            n=int(s["row_no"])
            r=db.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=?",(n,)).fetchone()
            assert r is not None,(n,"historical row missing")
            row=json.loads(r["original_json"])
            assert len(row)==28
            assert row[14]==ORIGINAL_URL,(n,"non-authoritative original URL")
            assert row[19]=="VERIFIED" and row[18],(n,"prior dated timetable status")
            assert (row[6],row[7])==(s["day"],s["time"]),(n,row[6:8],s)
            assert row[26]==r["group_id"] and r["source_id"]==row[1]
            assert db.execute("SELECT COUNT(*) FROM cl13_remaining_1962_evidence WHERE row_no=? AND institutional_programme_only=1 AND evidence_1962_slot_accepted=0",(n,)).fetchone()[0]==1
            site_groups.add(r["group_id"])
            exception_list=list(p["exceptions"])
            if s["day"].startswith("1st ") and "FIRST_DAY_OF_MONTH_ONLY" not in exception_list:
                exception_list.append("FIRST_DAY_OF_MONTH_ONLY")
            slot_out.append({
              "row_no":n,"source_id":r["source_id"],"group_id":r["group_id"],
              "official_site_id":f"CL14-DE-FSSP-{idx:03d}",
              "owner_site":p["church"],"owner_city":p["city"],"owner_street_address":p["address"],
              "frozen_venue_label":row[2],"source_day":row[6],"source_time":row[7],
              "historical_recurrence":row[8],
              "owner_source_url":ORIGINAL_URL,"owner_policy_url":p["owner_1962_policy_url"],
              "owner_page_line_start":p["owner_page_lines"][0],"owner_page_line_end":p["owner_page_lines"][1],
              "owner_book_evidence":"FSSP_PROGRAMME_1962",
              "owner_named_place_time_confirmed":1,
              "exception_codes":";".join(exception_list),
              "previous_CL13_status":"HELD_INSTITUTIONAL_OWNER_POLICY_ONLY",
              "new_CL14_status":"ACCEPTED_1962_OWNER_BOOK_AND_DIRECT_VENUE_TIME_RESEARCH",
              "original_schedule_check_date":row[18],
              "rechecked_owner_page_date":d["retrieved_on"],
              "current_recurrence_release":0,"geocode_approved":0,"public_pin_release":0,
              "una_cum_accepted":0,"celebrant_inferred":0,
            })
        # All rows for this named owner place must have the same historical group.
        assert len(site_groups)==1,(p["city"],p["church"],site_groups)
        site_group=next(iter(site_groups))
        assert site_group not in unique_groups,("two distinct source locations collapsed onto group_id",site_group)
        unique_groups.add(site_group)
        site_out.append({
            "official_site_id":f"CL14-DE-FSSP-{idx:03d}",
            "group_id":site_group,"owner_venue":p["church"],"owner_city":p["city"],
            "owner_address":p["address"],"owner_url":p["owner_page_url"],
            "source_page_lines":str(p["owner_page_lines"][0])+"-"+str(p["owner_page_lines"][1]),
            "source_day_time_rows":len(p["original_slot_locks"]),
            "exceptions":";".join(p["exceptions"]),
            "owner_address_evidence_captured":1,
            "geocoded_place_verified":0,
            "current_recurrence_approved":0,
            "public_place_release":0,
        })
    assert len(unique_groups)==38
    assert len(slot_out)==73
    assert len(site_out)==38
    assert {r["row_no"] for r in slot_out}==formal_held
    # CL13 held population remains unchanged; CL14 overlays it, never writes to CL13.
    with db:
        db.executescript("""
          CREATE TABLE cl14_fssp_owner_site (
            official_site_id TEXT PRIMARY KEY, group_id TEXT NOT NULL UNIQUE,
            owner_city TEXT NOT NULL, owner_name TEXT NOT NULL, address TEXT NOT NULL,
            owner_url TEXT NOT NULL, source_json TEXT NOT NULL,
            geocoded_approved INTEGER NOT NULL DEFAULT 0 CHECK(geocoded_approved=0),
            current_schedule_approved INTEGER NOT NULL DEFAULT 0 CHECK(current_schedule_approved=0),
            public_release INTEGER NOT NULL DEFAULT 0 CHECK(public_release=0)
          );
          CREATE TABLE cl14_fssp_direct_slot (
            row_no INTEGER PRIMARY KEY,official_site_id TEXT NOT NULL,
            group_id TEXT NOT NULL,source_id TEXT NOT NULL,
            owner_1962_evidence_accepted INTEGER NOT NULL CHECK(owner_1962_evidence_accepted=1),
            evidence_json TEXT NOT NULL,
            una_cum_approved INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_approved=0),
            public_schedule_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_schedule_approved=0),
            public_site_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_site_approved=0),
            FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
            FOREIGN KEY(official_site_id) REFERENCES cl14_fssp_owner_site(official_site_id)
          );
          CREATE INDEX cl14_fssp_slot_group_idx ON cl14_fssp_direct_slot(group_id);
        """)
        for p,r in zip(sites,site_out):
            db.execute("INSERT INTO cl14_fssp_owner_site (official_site_id,group_id,owner_city,owner_name,address,owner_url,source_json) VALUES (?,?,?,?,?,?,?)",(
                r["official_site_id"],r["group_id"],p["city"],p["church"],p["address"],p["owner_page_url"],json.dumps(p,ensure_ascii=False,sort_keys=True)))
        for r in slot_out:
            db.execute("INSERT INTO cl14_fssp_direct_slot (row_no,official_site_id,group_id,source_id,owner_1962_evidence_accepted,evidence_json) VALUES (?,?,?,?,1,?)",(
                r["row_no"],r["official_site_id"],r["group_id"],r["source_id"],json.dumps(r,sort_keys=True,ensure_ascii=False)))
        assert db.execute("SELECT COUNT(*) FROM cl14_fssp_direct_slot").fetchone()[0]==73
        assert db.execute("SELECT COUNT(*) FROM cl14_fssp_owner_site").fetchone()[0]==38
        assert db.execute("SELECT COUNT(*) FROM cl14_fssp_direct_slot WHERE public_schedule_approved!=0 OR public_site_approved!=0 OR una_cum_approved!=0").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM cl13_remaining_1962_evidence WHERE institutional_programme_only=1 AND evidence_1962_slot_accepted=0").fetchone()[0]==73
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
    slot_out.sort(key=lambda r:r["row_no"])
    emit_csv(args.out_dir/"cl14_73_owner_matched_mass_slots.csv",slot_out)
    emit_csv(args.out_dir/"cl14_38_named_source_places.csv",site_out)
    remaining=270-73
    accepted=162+73
    assert accepted==235 and remaining==197 and accepted+remaining==432
    summary={
      "schema":"AO_CL14_1962_OWNER_PROGRAMME_VENUE_SLOT_RECONCILIATION_V1",
      "date":"2026-10-26","input_prior_CL13_held_FSSP_rows":73,
      "fssp_de_owner_site_addresses_source_matched":38,
      "exact_venue_day_time_1962_book_evidence_accepted":73,
      "in_source_owner_time_mismatches":0,
      "prior_CL13_original_hold_flags_unchanged":73,
      "cumulative_evidence_decisions_unique_historical_candidates":432,
      "cumulative_source_scoped_book_evidence_accepted_after_CL14":235,
      "cumulative_book_claims_still_held_after_CL14":197,
      "preexisting_original_CL2_source_owner_witnesses_unchanged":3,
      "source_named_address_documented_not_geocoded":38,
      "new_public_approved_sites":0,"new_public_approved_timetables":0,
      "new_una_cum":0,"new_approved_geocodes":0,
      "source_only_warning":"73 newly corroborated book+named venue+time rows are research owner evidence; not 73 distinct venues (38 named source places), not 73 public recurrence approvals. Live-week operations, physical geocoding, date exceptions and independent publication controls remain unmet.",
      "source_urls":[d["original_schedule_source_url"],d["edition_scope_source_url"]],
      "exception_sites":[{"site":p["church"],"city":p["city"],"exceptions":p["exceptions"]} for p in sites if p["exceptions"]],
    }
    (args.out_dir/"cl14_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    db.close()
    print(json.dumps({"status":"PASS","owner_named_places":38,
      "previously_held_rows_supported":73,"new_cumulative_accepted":235,
      "remaining_held":197,"public_releases":0},sort_keys=True))
if __name__=="__main__":
    main()
