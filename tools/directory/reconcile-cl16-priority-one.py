#!/usr/bin/env python3
"""CL16: exact owner-evidence recovery for the CL15 priority-one 51-row queue.

Input: reconstructed CL2–CL15 SQLite and CL16 committed source evidence.
Output: two append-only research tables; CSV/JSON decisions. Never mutates
historical sources, accepted CL2 classification, operational recurrence or map.
"""
import argparse
import csv
import json
import sqlite3
from collections import Counter
from pathlib import Path

EVIDENCE=Path("data/directory/research/cl16-priority-one-20261026/evidence-decisions.json")
ACCEPT="CL16_ACCEPT_EXACT_1962_OR_JOHN_XXIII_OWNER_BOOK_WITNESS"
HOLD="CL16_HOLD_OWNER_EDITION_OR_SITE_PERMISSION"
def export_csv(path,rows):
    assert rows
    with path.open("w",encoding="utf-8",newline="") as fp:
        w=csv.DictWriter(fp,fieldnames=list(rows[0]),extrasaction="ignore")
        w.writeheader();w.writerows(rows)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",required=True,type=Path)
    p.add_argument("--out-dir",required=True,type=Path)
    opts=p.parse_args()
    opts.out_dir.mkdir(parents=True,exist_ok=True)
    d=json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert d["schema"]=="AO_CL16_PRIORITY_ONE_51_ROW_OWNER_EVIDENCE_V1"
    assert d["review_date"]=="2026-10-26"
    sources=d["sources"]
    assert len(sources)==13
    source_by_url={}
    locks={}
    for source in sources:
        url=source["original_source_url"]
        assert url not in source_by_url and url.startswith("https://")
        source_by_url[url]=source
        expected=source["expected_frozen_rows"]
        accepted=source["accepted_source_scoped_rows"]
        assert len(expected)==len(set(expected))
        assert set(accepted).issubset(set(expected))
        assert accepted==[x["row_no"] for x in source["accepted_original_slot_locks"]]
        assert source["current_schedule_publication"]=="HOLD"
        assert source["canonical_site_publication"]=="HOLD"
        assert source["una_cum"]=="NOT_ASSESSED"
        for proof in source["primary_evidence"]:
            assert proof["url"].startswith("https://")
            assert proof["role"]
        if accepted:
            assert source["primary_evidence"]
            assert source["disposition"] in (
                "EXPLICIT_FIRST_PARTY_OWNER_JOHN_XXIII_BOOK_PER_SLOT",
                "EXPLICIT_OWNER_2026_DATE_LISTED_1962_BOOK_PER_WEEKDAY",
                "FSSP_OWNER_EXTRAORDINARY_PROGRAMME_MATCHED_EXACT_RENOVATION_SITE",
                "EXPLICIT_CATHEDRAL_OWNER_1962_BOOK_PER_SLOT",
                "DIOCESAN_1962_NORMAL_WEEKLY_TIME_WITH_DATED_OVERRIDE"
            )
        for lock in source["accepted_original_slot_locks"]:
            assert lock["row_no"] not in locks
            assert isinstance(lock["day"],str) and len(lock["time"])==5
            locks[lock["row_no"]]=(source,lock)
    assert len({rid for x in sources for rid in x["expected_frozen_rows"]})==51
    assert len(locks)==20
    conn=sqlite3.connect(opts.db)
    conn.row_factory=sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    for t,n in (("mass_time",4681),("cl9_mass_candidate",432),
                ("cl10_1962_mass_evidence",85),("cl11_mass_source_scope",118),
                ("cl12_singleton_evidence",75),("cl13_remaining_1962_evidence",154),
                ("cl14_fssp_direct_slot",73),("cl15_1962_hold_triage",197),
                ("cl15_recovery_source_queue",94)):
        count=conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        assert count==n,(t,count)
    priority=conn.execute("SELECT row_no,source_id,group_id,source_url,triage_json FROM cl15_1962_hold_triage WHERE priority_tier=1").fetchall()
    assert len(priority)==51
    actual_priority_set={r["row_no"] for r in priority}
    accepted_or_held_ids={rid for s in sources for rid in s["expected_frozen_rows"]}
    assert actual_priority_set==accepted_or_held_ids,("source manifest does not cover entire CL15 tier 1",sorted(actual_priority_set-accepted_or_held_ids),sorted(accepted_or_held_ids-actual_priority_set))
    assert {r["source_url"] for r in priority}==set(source_by_url)
    assert len({r["source_url"] for r in priority})==13
    report=[]
    for r in priority:
        id=r["row_no"]
        src=source_by_url[r["source_url"]]
        assert id in src["expected_frozen_rows"]
        prior=json.loads(r["triage_json"])
        historical=conn.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=?",(id,)).fetchone()
        assert historical is not None
        original=json.loads(historical["original_json"])
        assert len(original)==28
        assert original[1]==r["source_id"]==historical["source_id"]
        assert historical["group_id"]==r["group_id"]
        assert original[14]==r["source_url"]
        accepted=id in locks
        if accepted:
            source,lock=locks[id]
            assert source["original_source_url"]==r["source_url"]
            assert (original[6],original[7])==(lock["day"],lock["time"]),(id,original[6:8],lock)
            assert original[19]=="VERIFIED"
        assert conn.execute("SELECT COUNT(*) FROM cl14_fssp_direct_slot WHERE row_no=?",(id,)).fetchone()[0]==0
        codes=list(src["exception_codes"])+src["slot_specific_exceptions"].get(str(id),[])
        report.append({
            "row_no":id,"original_source_id":r["source_id"],"frozen_group_id":r["group_id"],
            "historic_site_name":original[2],"historic_day":original[6],"historic_time":original[7],
            "historic_type_research_text":original[9],
            "original_timetable_url":r["source_url"],
            "evidence_urls":";".join(e["url"] for e in src["primary_evidence"]),
            "evidence_scope_category":src["disposition"],
            "review_outcome":ACCEPT if accepted else HOLD,
            "accepted_owner_book_evidence":int(accepted),
            "owner_observation":src["observation"],
            "exception_codes":";".join(codes),
            "previous_CL15_recovery_lane":prior["recovery_lane"],
            "prior_historical_schedule_status":original[19],
            "source_review_on":d["review_date"],
            "current_recurrence_approved":0,
            "approved_geocoded_site":0,
            "published_timetable":0,
            "published_book_filter":0,
            "una_cum_approved":0,
            "celebrant_approved":0
        })
    report.sort(key=lambda x:x["row_no"])
    assert sum(r["accepted_owner_book_evidence"] for r in report)==20
    assert sum(not r["accepted_owner_book_evidence"] for r in report)==31
    assert [r["row_no"] for r in report if r["accepted_owner_book_evidence"]]==sorted(locks)
    assert sum(r["accepted_owner_book_evidence"] for r in report if "stmarykazoo.org" in r["original_timetable_url"])==6
    assert sum(r["accepted_owner_book_evidence"] for r in report if "diocese49.org" in r["original_timetable_url"])==8
    assert sum(r["accepted_owner_book_evidence"] for r in report if "fsspniagara.com" in r["original_timetable_url"])==3
    assert sum(r["accepted_owner_book_evidence"] for r in report if "holyrosarycathedral.org" in r["original_timetable_url"])==2
    assert sum(r["accepted_owner_book_evidence"] for r in report if "bistum-passau.de" in r["original_timetable_url"])==1

    with conn:
        conn.executescript("""
        CREATE TABLE cl16_source_review (
            source_url TEXT PRIMARY KEY,disposition TEXT NOT NULL,
            candidate_rows INTEGER NOT NULL,accepted_rows INTEGER NOT NULL,
            evidence_json TEXT NOT NULL,
            current_recurrence_approved INTEGER NOT NULL DEFAULT 0 CHECK(current_recurrence_approved=0),
            public_site_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_site_approved=0));
        CREATE TABLE cl16_priority_one_slot (
            row_no INTEGER PRIMARY KEY,source_id TEXT NOT NULL,group_id TEXT NOT NULL,
            source_url TEXT NOT NULL,accepted_research_book_evidence INTEGER NOT NULL CHECK(accepted_research_book_evidence IN(0,1)),
            evidence_json TEXT NOT NULL,
            operational_mass_approved INTEGER NOT NULL DEFAULT 0 CHECK(operational_mass_approved=0),
            canonical_site_approved INTEGER NOT NULL DEFAULT 0 CHECK(canonical_site_approved=0),
            public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0),
            una_cum_accepted INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_accepted=0),
            FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
            FOREIGN KEY(source_url) REFERENCES cl16_source_review(source_url));
        CREATE INDEX cl16_by_group_id ON cl16_priority_one_slot(group_id);
        """)
        for source in sources:
            conn.execute("INSERT INTO cl16_source_review (source_url,disposition,candidate_rows,accepted_rows,evidence_json) VALUES (?,?,?,?,?)",(
                source["original_source_url"],source["disposition"],len(source["expected_frozen_rows"]),
                len(source["accepted_source_scoped_rows"]),json.dumps(source,sort_keys=True,ensure_ascii=False)))
        for r in report:
            conn.execute("INSERT INTO cl16_priority_one_slot (row_no,source_id,group_id,source_url,accepted_research_book_evidence,evidence_json) VALUES (?,?,?,?,?,?)",(
                r["row_no"],r["original_source_id"],r["frozen_group_id"],r["original_timetable_url"],
                r["accepted_owner_book_evidence"],json.dumps(r,sort_keys=True,ensure_ascii=False)))
        assert conn.execute("SELECT COUNT(*) FROM cl16_priority_one_slot").fetchone()[0]==51
        assert conn.execute("SELECT COUNT(*) FROM cl16_source_review").fetchone()[0]==13
        assert conn.execute("SELECT COUNT(*) FROM cl16_priority_one_slot WHERE accepted_research_book_evidence=1").fetchone()[0]==20
        assert conn.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert conn.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM cl16_priority_one_slot WHERE operational_mass_approved=1 OR canonical_site_approved=1 OR public_approved=1 OR una_cum_accepted=1").fetchone()[0]==0
        assert conn.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not conn.execute("PRAGMA foreign_key_check").fetchall()
    export_csv(opts.out_dir/"cl16_51_priority_source_decisions.csv",report)
    source_export=[]
    for s in sources:
        source_export.append({
          "source_url":s["original_source_url"],"rows":len(s["expected_frozen_rows"]),
          "source_scoped_1962_book_claims_accepted":len(s["accepted_source_scoped_rows"]),
          "remain_held":len(s["expected_frozen_rows"])-len(s["accepted_source_scoped_rows"]),
          "evidence_scope":s["disposition"],"exception_codes":";".join(s["exception_codes"]),
          "evidence_urls":";".join(w["url"] for w in s["primary_evidence"]),
          "new_public_mass_releases":0
        })
    export_csv(opts.out_dir/"cl16_13_source_review_summary.csv",source_export)
    remaining=[r for r in report if not r["accepted_owner_book_evidence"]]
    export_csv(opts.out_dir/"cl16_31_still_held_priority_one.csv",remaining)
    summary={
      "schema":"AO_CL16_PRIORITY_ONE_DIRECT_SOURCE_RECOVERY_V1","date":"2026-10-26",
      "source_cohort":"CL15 PRIORITY_TIER=1","priority_source_urls_examined":13,
      "original_CL15_priority_rows":51,
      "new_research_accepted_1962_book_claims":20,
      "remaining_held_within_priority_one":31,
      "CL15_prior_all_held":197,"CL14_prior_total_accepted":235,
      "cumulative_1962_book_evidence_accepted":255,
      "cumulative_still_held_1962_candidates":177,
      "full_cohort_original_historical_wording_candidates":432,
      "distinct_venues_not_inferred_from_row_count":True,
      "passed_exact_original_day_clock_assertions":20,
      "new_1962_canonical_site_classifications":0,"new_current_recurrence_approvals":0,
      "new_public_schedule_releases":0,"new_public_venue_releases":0,
      "new_geocodes_approved":0,"new_una_cum":0,
      "explicit_exceptions":[
        "Notre-Dame des Victoires Angers Tuesday 08:30 is school-term only and 09:00 Sunday is current Missal, not 1962.",
        "Passau standing Sunday 19:00 old rite has dated 2026-10-25 17:00 exception.",
        "Thorold FSSP St Aloysius 2026 construction remains in same church, with weekly bulletin override.",
        "Arlington in-parish authorization granted 2024 for two years; no fresh post-summer-2026 renewal established.",
        "Park Hills OLOL current physical church and times restored, but exact edition bridge to historical different-site decree stays held.",
        "Houma Gibson diocese owner page accessible and exact seven times, but prints Extraordinary Form rather than literal 1962 book.",
        "Self-referential Ad Orientem site pages and old lay Georgia blog are not independent owner evidence."
      ],
      "interpretation":"The 20 new claims concern the exact liturgical book at 20 historical timetable records, not 20 new churches or confirmation of current future recurring times. CL2's preexisting three accepted source-level classification witnesses remain independent.",
    }
    (opts.out_dir/"cl16_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","owner_sources":13,"rows_reviewed":51,
       "new_accepted_book_evidence":20,"rows_remaining_held":31,
       "cumulative_accepted":255,"cumulative_held":177,"public_releases":0},sort_keys=True))
    conn.close()
if __name__=="__main__":
    main()
