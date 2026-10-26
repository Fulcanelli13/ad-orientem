#!/usr/bin/env python3
"""CL11: reconcile 33 remaining multi-row owner URLs against CL2–CL10 without publication.

All direct literature assessments are explicit in committed reviews.json. This
deterministically matches their 118 original CL9 candidates and the 42 exact
source-backed day/time/book claims to original SQLite, preserving the 76 holds.
"""
import argparse
import csv
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
import sqlite3

SOURCE = Path("data/directory/research/cl11-source-reconciliation-20261026/reviews.json")
ACCEPTED = "ACCEPTED_EXPLICIT_OWNER_1962_AT_OR_MATCHED_TO_SLOT"
HELD = "HOLD_EXACT_BOOK_OR_DIRECT_EVIDENCE_OR_SLOT"
def write_csv(path, rows):
    if not rows: raise ValueError("No rows for "+str(path))
    with path.open("w", newline="", encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--db",required=True,type=Path)
    ap.add_argument("--cl9-csv",required=True,type=Path)
    ap.add_argument("--out-dir",required=True,type=Path)
    a=ap.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    data=json.loads(SOURCE.read_text(encoding="utf-8"))
    assert data["schema"]=="AO_CL11_REVIEWED_SOURCE_TRANCHE_V1"
    entries=data["urls"]
    assert len(entries)==33
    urls={x["url"]:x for x in entries}
    assert len(urls)==33
    assert sum(len(x["accepted_row_nos"]) for x in entries)==42
    assert sum(len(x["accepted_slot_expectations"]) for x in entries)==42
    with a.cl9_csv.open(newline="",encoding="utf-8") as fh:
        cohort=list(csv.DictReader(fh))
    assert len(cohort)==432
    assert len({x["row_no"] for x in cohort})==432
    by_url=defaultdict(list)
    for row in cohort: by_url[row["schedule_url"]].append(row)
    assert len(by_url)==129
    new_urls={url:rows for url,rows in by_url.items() if len(rows)>=2 and rows[0]["cl9_url_reviewed"]=="NO"}
    assert len(new_urls)==33 and sum(len(x) for x in new_urls.values())==118
    assert set(new_urls)==set(urls),"The CL11 source registry does not cover every remaining multi-row URL"
    assert sum(len(rows) for url,rows in by_url.items() if len(rows)==1 and rows[0]["cl9_url_reviewed"]=="NO")==75

    db=sqlite3.connect(a.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    assert db.execute("SELECT COUNT(*) FROM canonical_site").fetchone()[0]==2584
    assert db.execute("SELECT COUNT(*) FROM mass_time").fetchone()[0]==4681
    assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    assert db.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence").fetchone()[0]==85
    assert db.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence WHERE accepted=1").fetchone()[0]==79
    assert db.execute("SELECT COUNT(*) FROM cl9_owner_url_review").fetchone()[0]==129
    assert db.execute("SELECT COUNT(*) FROM cl9_owner_url_review WHERE reviewed=1").fetchone()[0]==21

    all_accepted_ids=set()
    out_rows=[]
    source_rows=[]
    for url, rows in sorted(new_urls.items(), key=lambda x:(-len(x[1]),x[0])):
        review=urls[url]
        assert review["research_only"] is True
        assert review["evidence_rechecked_on"]=="2026-10-26"
        assert review["public_approvals"]==review["una_cum_accepted"]==0
        accepted_ids=review["accepted_row_nos"]
        expected=review["accepted_slot_expectations"]
        assert len(set(accepted_ids))==len(accepted_ids)
        assert accepted_ids==[x["row_no"] for x in expected]
        row_ids={int(r["row_no"]) for r in rows}
        assert set(accepted_ids).issubset(row_ids),("review source row mismatch",url)
        locks={x["row_no"]:(x["day"],x["time"]) for x in expected}
        accepted_url=0
        for r in rows:
            id=int(r["row_no"])
            original=db.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=?",(id,)).fetchone()
            assert original is not None
            m=json.loads(original["original_json"])
            assert len(m)==28
            assert m[14]==url and m[1]==r["source_id"]
            assert original["group_id"]==r["group_id"]
            assert m[19]=="VERIFIED" and m[18] and m[14],("Prior historical schedule label unexpected",id)
            assert m[9]==r["mass_type"]
            admitted=id in accepted_ids
            if admitted:
                assert id not in all_accepted_ids
                all_accepted_ids.add(id)
                assert (m[6],m[7])==locks[id],("Original Mass day/time has changed",id,m[6],m[7],locks[id])
                assert db.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence WHERE row_no=?",(id,)).fetchone()[0]==0
                assert (review["claim_category"].startswith("EXPLICIT_") or review["claim_category"]=="EXPLICIT_SECOND_OWNER_MISSAL")
                accepted_url+=1
            out_rows.append({
              "row_no":id,"source_id":r["source_id"],"group_id":r["group_id"],
              "source_url":url,"supporting_owner_url":review["supporting_owner_url"],
              "place_as_frozen":m[2],"original_day":m[6],"original_time":m[7],
              "original_book_type_research_label":m[9],
              "owner_review_category":review["claim_category"],
              "access_status":review["access"],
              "decision":ACCEPTED if admitted else HELD,
              "direct_book_scope_accepted":int(admitted),
              "exception_codes":";".join(review["exception_codes"]),
              "owner_claim_observation":review["observation"],
              "historical_verified":m[19],
              "original_checked_on":m[18],
              "current_schedule_recertified":0,
              "canonical_venue_approved":0,
              "una_cum_verified":0,
              "original_owner_edition_field_mutated":0
            })
        source_rows.append({
          "source_url":url,
          "candidate_rows":len(rows),
          "accepted_slot_book_evidence":accepted_url,
          "held":len(rows)-accepted_url,
          "review_category":review["claim_category"],
          "access":review["access"],
          "supporting_owner_url":review["supporting_owner_url"],
          "exception_codes":";".join(review["exception_codes"]),
          "observation":review["observation"],
          "public_approvals":0,
        })
    assert len(out_rows)==118
    assert len(all_accepted_ids)==42
    assert sum(x["held"] for x in source_rows)==76
    assert sum(x["accepted_slot_book_evidence"] for x in source_rows)==42
    out_rows.sort(key=lambda r:r["row_no"])
    direct_accessible=sum(x["access"] not in ("HTTP_404","HTTP_403","INDEXED_OWNER_CONTENT_403_DIRECT") for x in source_rows)
    assert direct_accessible==30
    with db:
        db.executescript("""
        CREATE TABLE cl11_source_url_review (
           url TEXT PRIMARY KEY, review_class TEXT NOT NULL, access_status TEXT NOT NULL,
           supported_count INTEGER NOT NULL, total_count INTEGER NOT NULL,
           provenance_json TEXT NOT NULL, newly_published INTEGER NOT NULL DEFAULT 0 CHECK(newly_published=0));
        CREATE TABLE cl11_mass_source_scope (
           row_no INTEGER PRIMARY KEY, original_source_id TEXT NOT NULL,
           original_group_id TEXT, url TEXT NOT NULL, review_class TEXT NOT NULL,
           adjudication TEXT NOT NULL, book_evidence_accepted INTEGER NOT NULL CHECK(book_evidence_accepted IN (0,1)),
           evidence_json TEXT NOT NULL,
           public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0),
           current_recurrence_approved INTEGER NOT NULL DEFAULT 0 CHECK(current_recurrence_approved=0),
           una_cum_inferred INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_inferred=0),
           FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
           FOREIGN KEY(url) REFERENCES cl11_source_url_review(url));
        CREATE INDEX cl11_group_idx ON cl11_mass_source_scope(original_group_id);
        """)
        for x in source_rows:
            page=urls[x["source_url"]]
            db.execute("INSERT INTO cl11_source_url_review (url,review_class,access_status,supported_count,total_count,provenance_json) VALUES (?,?,?,?,?,?)",(
                x["source_url"],x["review_category"],x["access"],
                x["accepted_slot_book_evidence"],x["candidate_rows"],
                json.dumps(page,sort_keys=True,ensure_ascii=False)))
        for x in out_rows:
            db.execute("INSERT INTO cl11_mass_source_scope (row_no,original_source_id,original_group_id,url,review_class,adjudication,book_evidence_accepted,evidence_json) VALUES (?,?,?,?,?,?,?,?)",(
               x["row_no"],x["source_id"],x["group_id"],x["source_url"],
               x["owner_review_category"],x["decision"],x["direct_book_scope_accepted"],
               json.dumps(x,sort_keys=True,ensure_ascii=False)))
        assert db.execute("SELECT COUNT(*) FROM cl11_mass_source_scope WHERE book_evidence_accepted=1").fetchone()[0]==42
        assert db.execute("SELECT COUNT(*) FROM cl11_mass_source_scope WHERE book_evidence_accepted=0").fetchone()[0]==76
        assert db.execute("SELECT COUNT(*) FROM cl11_mass_source_scope WHERE public_approved<>0 OR current_recurrence_approved<>0 OR una_cum_inferred<>0").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not db.execute("PRAGMA foreign_key_check").fetchall()

    write_csv(a.out_dir/"cl11_33_source_url_decisions.csv",source_rows)
    write_csv(a.out_dir/"cl11_118_row_decisions.csv",out_rows)
    report={
      "schema":"AO_CL11_SOURCE_EVIDENCE_RECONCILIATION_V1",
      "reviewed_on":"2026-10-26",
      "source_urls_newly_dispositioned":33,
      "source_urls_directly_accessible":30,
      "source_urls_not_directly_accessible":3,
      "candidate_rows_newly_dispositioned":118,
      "new_accepted_exact_owner_1962_evidence_rows":42,
      "additional_rows_held_after_source_review":76,
      "still_unreviewed_singleton_urls":75,
      "still_unreviewed_singleton_rows":75,
      "total_source_urls":129,
      "all_sources_with_any_review_disposition":54,
      "all_rows_at_source_urls_with_any_review_disposition":357,
      "all_prior_CL10_adjudicated_rows":85,
      "prior_CL10_accepted_evidence_rows":79,
      "cumulative_CL10_CL11_adjudicated_rows":203,
      "cumulative_CL10_CL11_accepted_evidence_rows":121,
      "cumulative_CL10_CL11_held_rows":82,
      "not_yet_row_adjudicated":229,
      "unaltered_CL2_classification_1962_owner_witnesses":3,
      "una_cum_new":0,"public_pin_new":0,"current_timetable_new":0,
      "notes":[
        "118 is the sum of timetable rows at the 33 multi-row URL sources; 42 accepted row-scoped witness facts, not 42 distinct places.",
        "The Angers owner page returns 403, despite indexed current page and 2026 bulletins documenting John XXIII Missal; all eight are held under direct-source gate.",
        "Toronto Holy Family has a monthly Latin Ordinary Form substitution; do not infer Missal from language or affiliation.",
        "St John the Beloved 4th Sundays substitute Latin Novus Ordo; unresolved historic Monday 20:00 retained.",
        "The prior three accepted CL2 class-source witnesses remain unchanged and are not added to accepted celebration rows.",
        "Current recurring Mass validity requires independent release verification; none is approved here.",
      ],
    }
    (a.out_dir/"cl11_summary.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    db.close()
    print(json.dumps({"status":"PASS","sources_reviewed":33,"source_rows":118,"book_evidence_accepted":42,
                      "held":76,"prior_CL10_accepted":79,"cumulative_accepted_scoped":121,"new_public_releases":0},sort_keys=True))
if __name__=="__main__":
    main()
