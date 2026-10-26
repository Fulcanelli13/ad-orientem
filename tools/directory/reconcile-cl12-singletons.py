#!/usr/bin/env python3
"""CL12: screen 75 single-candidate source URLs and adjudicate exact owner book claims.

This research-only layer never changes CL2 original rows, CL9/10/11, public
site IDs, recurrence approvals, or Una Cum. All rows remain source-auditable.
"""
import argparse
import csv
import json
import sqlite3
from pathlib import Path
from collections import Counter,defaultdict

DECISIONS=Path("data/directory/research/cl12-singleton-source-screen-20261026/evidence-decisions.json")
ACCEPT="OWNER_EDITION_1962_EXACT_SLOT_ACCEPTED_RESEARCH_ONLY"
HOLD="SCREENED_HELD_NO_EXACT_BOOK_EVIDENCE_OR_ACCESS"
def write_csv(path,items):
    with path.open("w",encoding="utf-8",newline="") as fp:
        writer=csv.DictWriter(fp,fieldnames=list(items[0]))
        writer.writeheader()
        writer.writerows(items)
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--db",type=Path,required=True)
    parser.add_argument("--cl9-csv",type=Path,required=True)
    parser.add_argument("--out-dir",type=Path,required=True)
    args=parser.parse_args()
    args.out_dir.mkdir(parents=True,exist_ok=True)
    d=json.loads(DECISIONS.read_text(encoding="utf-8"))
    assert d["schema"]=="AO_CL12_SINGLETON_SOURCE_WITNESSES_V1"
    assert d["review_date"]=="2026-10-26"
    owner_accept={int(x["row_no"]):x for x in d["accepted"]}
    special={int(x["row_no"]):x for x in d["exception_holds"]}
    assert len(owner_accept)==12
    assert len(special)==11
    assert not set(owner_accept)&set(special)
    assert set(d["unreachable_row_ids"])=={1765,1833,1839,4317}
    with args.cl9_csv.open(encoding="utf-8",newline="") as f:
        all_candidates=list(csv.DictReader(f))
    assert len(all_candidates)==432
    by_url=defaultdict(list)
    for r in all_candidates: by_url[r["schedule_url"]].append(r)
    assert len(by_url)==129
    rows=[r for r in all_candidates if len(by_url[r["schedule_url"]])==1 and r["cl9_url_reviewed"]=="NO"]
    assert len(rows)==75
    assert len({r["row_no"] for r in rows})==75
    assert len({r["schedule_url"] for r in rows})==75
    assert set(owner_accept)|set(special) <= {int(r["row_no"]) for r in rows}
    db=sqlite3.connect(args.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for table,expected in (("canonical_site",2584),("mass_time",4681),
                           ("cl9_owner_url_review",129),("cl10_1962_mass_evidence",85),
                           ("cl11_mass_source_scope",118)):
        got=db.execute("SELECT COUNT(*) FROM "+table).fetchone()[0]
        assert got==expected,(table,got,expected)
    assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    assert db.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence WHERE accepted=1").fetchone()[0]==79
    assert db.execute("SELECT COUNT(*) FROM cl11_mass_source_scope WHERE book_evidence_accepted=1").fetchone()[0]==42
    output=[]
    for r in rows:
        rid=int(r["row_no"])
        original=db.execute("SELECT original_json,source_id,group_id FROM mass_time WHERE row_no=?",(rid,)).fetchone()
        assert original is not None
        m=json.loads(original["original_json"])
        assert m[1]==r["source_id"] and original["group_id"]==r["group_id"]
        assert m[14]==r["schedule_url"] and m[9]==r["mass_type"]
        assert m[19]=="VERIFIED" and m[18]
        assert db.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence WHERE row_no=?",(rid,)).fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM cl11_mass_source_scope WHERE row_no=?",(rid,)).fetchone()[0]==0
        witness=owner_accept.get(rid)
        issue=special.get(rid)
        if witness:
            assert (m[6],m[7])==(witness["day"],witness["time"]),("Day/time mismatch",rid,m[6:8])
            assert witness["scope"] in {
                "PARISH_DIRECT_SLOT","PARISH_DIRECT_PROGRAMME","CATHEDRAL_DIRECT_SLOT",
                "SHRINE_DIRECT_SLOT","CELEBRATION_ORGANIZER_DIRECT_PROGRAMME",
                "DIOCESE_DIRECT_SLOT","PARISH_CALENDAR_DIRECT_SLOT"}
            status=ACCEPT
            reason=witness["observation"]
        else:
            status=issue["decision"] if issue else HOLD
            reason=issue["observation"] if issue else (
                "Source URL inspected in CL12 singleton pass; no directly established 1962 Missal "
                "edition for the exact historical day/time at adequate institutional or celebrant scope. "
                "Hold until independently scoped evidence is obtained.")
        access="NOT_RETRIEVABLE" if rid in d["unreachable_row_ids"] else "URL_SCREENED"
        evidence_url=r["schedule_url"]
        out={
          "row_no":rid,"source_id":r["source_id"],"group_id":r["group_id"],
          "name":r["name"],"historical_day":m[6],"historical_time":m[7],
          "original_mass_type":m[9],"source_url":r["schedule_url"],
          "evidence_url":evidence_url,"screening_access":access,
          "source_scope":witness["scope"] if witness else "UNESTABLISHED",
          "decision":status,"reason":reason,
          "edition_1962_accepted":int(bool(witness)),
          "edition_documented_but_slot_conflicts":int(rid==4522),
          "contemporary_observed_time":"17:00" if rid==4522 else "",
          "historical_schedule_status":m[19],"historical_checked":m[18],
          "current_recurrence_approved":0,
          "public_pin_approved":0,"una_cum_accepted":0,
          "owner_organization_role_inferred":0,
        }
        output.append(out)
    output.sort(key=lambda x:x["row_no"])
    assert len(output)==75
    assert sum(x["edition_1962_accepted"] for x in output)==12
    assert sum(x["edition_1962_accepted"]==0 for x in output)==63
    assert sum(x["edition_documented_but_slot_conflicts"] for x in output)==1
    assert sum(x["screening_access"]=="NOT_RETRIEVABLE" for x in output)==4
    with db:
        db.executescript("""
          CREATE TABLE cl12_singleton_evidence (
            row_no INTEGER PRIMARY KEY,
            source_id TEXT NOT NULL,group_id TEXT NOT NULL,
            source_url TEXT NOT NULL,decision TEXT NOT NULL,
            evidence_1962_accepted INTEGER NOT NULL CHECK(evidence_1962_accepted IN(0,1)),
            time_conflict INTEGER NOT NULL CHECK(time_conflict IN(0,1)),
            evidence_json TEXT NOT NULL,
            public_approval INTEGER NOT NULL DEFAULT 0 CHECK(public_approval=0),
            current_recurrence_approval INTEGER NOT NULL DEFAULT 0 CHECK(current_recurrence_approval=0),
            una_cum_accepted INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_accepted=0),
            FOREIGN KEY(row_no) REFERENCES mass_time(row_no)
          );
          CREATE INDEX cl12_singleton_group ON cl12_singleton_evidence(group_id);
        """)
        for r in output:
            db.execute("INSERT INTO cl12_singleton_evidence(row_no,source_id,group_id,source_url,decision,evidence_1962_accepted,time_conflict,evidence_json) VALUES(?,?,?,?,?,?,?,?)",(
                r["row_no"],r["source_id"],r["group_id"],r["source_url"],r["decision"],
                r["edition_1962_accepted"],r["edition_documented_but_slot_conflicts"],
                json.dumps(r,ensure_ascii=False,sort_keys=True)))
        assert db.execute("SELECT COUNT(*) FROM cl12_singleton_evidence WHERE evidence_1962_accepted=1").fetchone()[0]==12
        assert db.execute("SELECT COUNT(*) FROM cl12_singleton_evidence WHERE time_conflict=1").fetchone()[0]==1
        assert db.execute("SELECT COUNT(*) FROM cl12_singleton_evidence WHERE public_approval!=0 OR current_recurrence_approval!=0 OR una_cum_accepted!=0").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not db.execute("PRAGMA foreign_key_check").fetchall()
    write_csv(args.out_dir/"cl12_75_singleton_source_decisions.csv",output)
    summary={
      "schema":"AO_CL12_SINGLETON_SOURCE_SCREEN_V1",
      "date":"2026-10-26","original_CL9_candidates":432,
      "singleton_urls_screened":75,"singleton_rows_screened":75,
      "exact_owner_or_organizer_edition_claims_accepted":12,
      "singleton_rows_held":63,
      "unretrievable_page_rows":4,
      "specific_1962_edition_but_wrong_historical_time":1,
      "passau_frozen_time":"19:00","passau_official_current_date_time":"17:00",
      "source_urls_any_review_or_screen":129,
      "source_urls_scope_adjudicated":"54 CL9/11 URL reviews plus 75 CL12 URL preliminary screens",
      "CL10_adjudicated":85,"CL11_adjudicated":118,"CL12_adjudicated":75,
      "cumulative_slot_adjudicated":278,
      "cumulative_slot_claims_accepted":133,
      "cumulative_slot_held":145,
      "remaining_prior_CL9_reviewed_but_slot_unadjudicated":154,
      "unaltered_CL2_source_level_owner_1962_witnesses":3,
      "new_public_approvals":0,"new_current_timetable_approvals":0,"new_una_cum":0,
      "limitation":"URL screened is not evidence accepted. 63 singleton rows remain held, including explicit-edition/clock mismatch at Passau. Historical schedule VERIFIED is not current recurrence."
    }
    (args.out_dir/"cl12_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    db.close()
    print(json.dumps({"status":"PASS","screened":75,"accepted":12,"held":63,
      "frozen_schedule_time_conflicts":1,"source_url_screening_total":129,
      "cumulative_accepted_scoped":133,"public_releases":0},sort_keys=True))
if __name__=="__main__":
    main()
