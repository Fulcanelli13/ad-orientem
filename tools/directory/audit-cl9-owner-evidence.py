#!/usr/bin/env python3
"""CL9 owner-page evidence reconciliation, research only; no automatic class promotion.

Inputs: CL8's reproducible 432-row CSV and committed 21 reviewed URL summaries.
Outputs: 432-row source-scoped join, 129-URL review ledger, SQLite indexes, summary.
No third-party packages and no runtime/public dataset writes.
"""
import argparse
import csv
from collections import Counter, defaultdict
import json
from pathlib import Path
import sqlite3

REVIEWS=Path("data/directory/research/cl9-missal-source-review-20261026/source-reviews.json")
ALLOWED={
 "OWNER_SCHEDULE_ONLY_BOOK_NOT_EXPLICIT",
 "SITE_LITURGICAL_PROGRAM_1962_EXPLICIT",
 "OWNER_TRADITIONAL_PROGRAM_BOOK_NOT_EXPLICIT",
 "MIXED_RITE_LYONESE_EXPLICIT",
 "LAY_ASSOCIATION_TLM_SCHEDULE_NOT_OWNER",
 "SITE_MISSAL_JOHN_XXIII_WITH_MIXED_FORMS",
 "CELEBRATION_SLOT_1962_EXPLICIT",
 "CELEBRATION_SLOT_1962_WITH_EXCEPTIONS",
 "DIOCESAN_UMBRELLA_1962_NOT_SITE_SCHEDULE",
 "OWNER_PRECONCILIAR_MISSAL_NOT_EXACT_EDITION",
}
OWNER_EXPLICIT={
 "SITE_LITURGICAL_PROGRAM_1962_EXPLICIT",
 "SITE_MISSAL_JOHN_XXIII_WITH_MIXED_FORMS",
 "CELEBRATION_SLOT_1962_EXPLICIT",
 "CELEBRATION_SLOT_1962_WITH_EXCEPTIONS",
}
def csv_write(path,rows,fieldnames):
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=fieldnames,extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--cl8-csv",type=Path,required=True)
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--out-dir",type=Path,required=True)
    a=p.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    with a.cl8_csv.open(newline="",encoding="utf-8") as f:
        base=list(csv.DictReader(f))
    doc=json.loads(REVIEWS.read_text(encoding="utf-8"))
    assert doc["schema"]=="AO_CL9_DIRECT_OWNER_SOURCE_REVIEW_V1"
    reviews=doc["reviews"]
    assert len(reviews)==21,(len(reviews),21)
    by_url={}
    for r in reviews:
        url=r["url"]
        assert url not in by_url and url.startswith("https://"),url
        assert r["scope"] in ALLOWED,r["scope"]
        assert r["reviewed_on"]=="2026-10-26"
        assert r["new_formal_1962_approvals"]==0 and r["public_release"]=="HOLD"
        by_url[url]=r
    assert len(base)==432
    assert len({x["row_no"] for x in base})==432
    assert len({x["group_id"] for x in base})==173
    assert len({x["source_id"] for x in base})==173
    urls={x["schedule_url"] for x in base}
    assert len(urls)==129
    assert by_url.keys() <= urls,(by_url.keys()-urls)
    linked=[]
    by_source=defaultdict(list)
    for r in base:
        if r["new_owner_accepted_1962"]!="0" or r["una_cum_established"]!="0":
            raise ValueError("Unexpected CL8 accepted claim: "+r["row_no"])
        url=r["schedule_url"]
        review=by_url.get(url)
        row=dict(r)
        row.update({
            "cl9_url_reviewed":"YES" if review else "NO",
            "cl9_owner_scope":review["scope"] if review else "UNREVIEWED",
            "cl9_related_owner_url":review.get("supporting_url","") if review else "",
            "cl9_exception_codes":";".join(review["exceptions"]) if review else "",
            "cl9_row_level_1962_accepted":"NO",
            "cl9_public_release":"HOLD",
            "cl9_followup":("VERIFY_CELEBRATION_SLOT_AND_EXCEPTION" if review and review["scope"] in OWNER_EXPLICIT
               else "HANDLE_NON_ROMAN_RITE" if review and review["scope"]=="MIXED_RITE_LYONESE_EXPLICIT"
               else "OBTAIN_OWNER_EDITION_SCOPE" if review else "REVIEW_OWNER_OR_PRIMARY_SOURCE"),
        })
        linked.append(row)
        by_source[url].append(row)
    assert len(by_source)==129
    n_reviewed=sum(x["cl9_url_reviewed"]=="YES" for x in linked)
    assert n_reviewed==239,n_reviewed
    n_explicit=sum(x["cl9_owner_scope"] in OWNER_EXPLICIT for x in linked)
    assert n_explicit==85,n_explicit
    assert len({x["group_id"] for x in linked if x["cl9_url_reviewed"]=="YES"})==62

    url_rows=[]
    for url,items in sorted(by_source.items(),key=lambda kv:(-len(kv[1]),kv[0])):
        rev=by_url.get(url)
        url_rows.append({
          "url":url,"candidate_rows":len(items),
          "distinct_group_ids":len({x["group_id"] for x in items}),
          "reviewed":"YES" if rev else "NO",
          "owner_scope":rev["scope"] if rev else "UNREVIEWED",
          "supporting_url":rev.get("supporting_url","") if rev else "",
          "observed_claim":rev["observed_claim"] if rev else "",
          "limitations":rev["limitation"] if rev else "",
          "exceptions":";".join(rev["exceptions"]) if rev else "",
          "new_missal_accepted":"NO","public_release":"HOLD",
        })
    assert len(url_rows)==129 and sum(x["candidate_rows"] for x in url_rows)==432
    with sqlite3.connect(a.db) as db:
        db.execute("PRAGMA foreign_keys=ON")
        assert db.execute("SELECT COUNT(*) FROM mass_time").fetchone()[0]==4681
        assert db.execute("SELECT COUNT(*) FROM classification_source").fetchone()[0]==2715
        assert db.execute("SELECT COUNT(*) FROM cl_1962_reconciliation").fetchone()[0]==432
        assert db.execute("SELECT COUNT(*) FROM cl_audit_field").fetchone()[0]==72968
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        db.executescript("""
        CREATE TABLE IF NOT EXISTS cl9_owner_url_review (
          url TEXT PRIMARY KEY,owner_scope TEXT NOT NULL,candidate_rows INTEGER NOT NULL,
          reviewed INTEGER NOT NULL CHECK(reviewed IN (0,1)),
          evidence_json TEXT NOT NULL,missal_accepted INTEGER NOT NULL DEFAULT 0 CHECK(missal_accepted=0),
          release TEXT NOT NULL CHECK(release='HOLD'));
        CREATE TABLE IF NOT EXISTS cl9_mass_candidate (
          row_no INTEGER PRIMARY KEY,source_id TEXT NOT NULL,group_id TEXT,
          original_url TEXT NOT NULL,owner_scope TEXT NOT NULL,
          review_done INTEGER NOT NULL CHECK(review_done IN (0,1)),
          missal_accepted INTEGER NOT NULL DEFAULT 0 CHECK(missal_accepted=0),
          una_cum_accepted INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_accepted=0),
          public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0),
          original_claim_text TEXT NOT NULL, FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
          FOREIGN KEY(original_url) REFERENCES cl9_owner_url_review(url));
        CREATE INDEX IF NOT EXISTS cl9_mass_group_idx ON cl9_mass_candidate(group_id);
        """)
        assert db.execute("SELECT COUNT(*) FROM cl9_owner_url_review").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM cl9_mass_candidate").fetchone()[0]==0
        for x in url_rows:
            review=by_url.get(x["url"])
            db.execute("INSERT INTO cl9_owner_url_review (url,owner_scope,candidate_rows,reviewed,evidence_json,release) VALUES (?,?,?,?,?,'HOLD')",(
                x["url"],x["owner_scope"],x["candidate_rows"],
                int(x["reviewed"]=="YES"),
                json.dumps(review or {},ensure_ascii=False,sort_keys=True)))
        for x in linked:
            db.execute("INSERT INTO cl9_mass_candidate (row_no,source_id,group_id,original_url,owner_scope,review_done,original_claim_text) VALUES (?,?,?,?,?,?,?)",(
                x["row_no"],x["source_id"],x["group_id"],x["schedule_url"],x["cl9_owner_scope"],
                int(x["cl9_url_reviewed"]=="YES"),x["mass_type"]))
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not db.execute("PRAGMA foreign_key_check").fetchall()
        assert db.execute("SELECT COUNT(*) FROM cl9_mass_candidate WHERE missal_accepted=1 OR una_cum_accepted=1 OR public_approved=1").fetchone()[0]==0
        db.commit()
    csv_write(a.out_dir/"cl9_432_mass_candidates.csv",linked,list(linked[0]))
    csv_write(a.out_dir/"cl9_129_source_urls.csv",url_rows,list(url_rows[0]))
    summary={
     "schema":"AO_CL9_OWNER_SOURCE_RECONCILIATION_V1",
     "reviewed_on":"2026-10-26",
     "candidate_rows":432,"candidate_sites":173,"source_urls":129,
     "source_urls_directly_reviewed":21,"source_urls_pending":108,
     "candidate_rows_at_reviewed_urls":239,"candidate_rows_at_pending_urls":193,
     "candidate_groups_at_reviewed_urls":62,
     "candidate_rows_owner_site_or_slot_1962_wording":85,
     "scope_counts":dict(Counter(x["cl9_owner_scope"] for x in linked)),
     "first_party_1962_potential_further_validation":85,
     "new_owner_accepted_1962":0,"new_una_cum_accepted":0,"new_public_releases":0,
     "exclusions":["Institution affiliation does not assert exact Missal edition.",
      "Old timetable VERIFIED is not public-current recurrence.",
      "Exception at St John Cantius: first Sundays 2002 Missal, not 1962.",
      "Exception at Saint-Just Lyon: Sunday 08:30 in Lyonese rite; not universally 1962 Roman Rite.",
      "Diocesan umbrella list for Paris does not establish specific candidate site's celebration.",
      "Owner source review is not equivalent to checking each recurring slot.",
      "Evidence from a page can be historical, so future currentness review is mandatory."]
    }
    (a.out_dir/"cl9_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS", "source_urls":129, "reviewed":21, "candidate_rows_reconciled":239,
      "unreviewed_candidates":193, "potential_owner_1962_scoped":85,
      "newly_accepted":0,"public_release":0}))

if __name__=="__main__":
    main()
