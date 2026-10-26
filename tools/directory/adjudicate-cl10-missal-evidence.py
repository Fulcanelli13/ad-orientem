#!/usr/bin/env python3
"""CL10: source-scoped 1962 Mass *evidence* adjudication (NOT current Mass publication).

CL2–CL9 inputs are immutable. Validates 85 timetable slots against nine
independently reviewed first-party page programmes and exact day/time source
rows. Writes append-only CL10 SQLite research tables and regenerable CSV/JSON.
Retains conditional 2002-Missal substitutions and six uncertain weekday rows.
Python standard library only.
"""
import argparse
from collections import Counter
import csv
import json
from pathlib import Path
import sqlite3

ROOT = Path("data/directory/research/cl10-1962-slot-adjudication-20261026")
EVIDENCE = ROOT/"owner-slot-evidence.json"
ACCEPTED = "ACCEPTED_OWNER_BOOK_SOURCE_SCOPED"
CONDITIONAL = "ACCEPTED_OWNER_BOOK_WITH_DATE_EXCEPTION"
HELD = "HOLD_UNRESOLVED_WEEKDAY_SLOT"
def csv_output(path,records):
    with path.open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=list(records[0]))
        writer.writeheader(); writer.writerows(records)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--cl9-csv",type=Path,required=True)
    p.add_argument("--out-dir",type=Path,required=True)
    args=p.parse_args()
    args.out_dir.mkdir(parents=True,exist_ok=True)
    doc=json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert doc["schema"]=="AO_CL10_OWNER_MISSAL_SLOT_ADJUDICATION_V1"
    books={"1962_ROMAN","MISSAL_JOHN_XXIII_1962_ROMAN"}
    sources=doc["source_pages"]
    assert len(sources)==9
    by_url={}
    slot_lookup={}
    for s in sources:
        url=s["url"]
        assert url.startswith("https://") and url not in by_url
        assert s["owner_edition_url"].startswith("https://")
        assert s["book"] in books
        assert s["evidence_scope"] in ("OWNER_PROGRAMME_MATCHED_TIMETABLE_SLOT","OWNER_SLOT_1962","OWNER_SLOT_EF_JOHN_XXIII")
        by_url[url]=s
        keyset=set()
        for slot in s["slots"]:
            key=(slot["day"],slot["time"])
            assert key not in keyset,(url,key)
            keyset.add(key)
            assert slot["decision"] in ("ACCEPTED","HOLD_WEEKDAY_SHORTHAND")
            assert len(slot["time"])==5 and slot["time"][2]==":"
            assert all(isinstance(e,str) for e in slot["exceptions"])
            slot_lookup[(url,*key)]=slot
    with args.cl9_csv.open(newline="",encoding="utf-8") as f:
        base=list(csv.DictReader(f))
    target=[r for r in base if r["cl9_followup"]=="VERIFY_CELEBRATION_SLOT_AND_EXCEPTION"]
    assert len(base)==432 and len(target)==85
    assert set(r["schedule_url"] for r in target)==set(by_url)
    assert len({r["group_id"] for r in target})==9
    db=sqlite3.connect(args.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    assert db.execute("SELECT COUNT(*) FROM cl9_mass_candidate").fetchone()[0]==432
    assert db.execute("SELECT COUNT(*) FROM cl9_owner_url_review WHERE reviewed=1").fetchone()[0]==21
    assert db.execute("SELECT COUNT(*) FROM mass_time").fetchone()[0]==4681
    assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    site_by_url={}
    result=[]
    matched_keys=set()
    for r in target:
        no=int(r["row_no"])
        row=db.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=?",(no,)).fetchone()
        assert row is not None and row["source_id"]==r["source_id"] and row["group_id"]==r["group_id"]
        raw=json.loads(row["original_json"])
        assert len(raw)==28 and raw[14]==r["schedule_url"]
        assert raw[19]=="VERIFIED" and raw[18] and raw[14]
        assert raw[9]==r["mass_type"]
        day,clock=raw[6],raw[7]
        key=(r["schedule_url"],day,clock)
        assert key not in matched_keys,("Duplicated canonical timetable day/clock",key)
        matched_keys.add(key)
        slot=slot_lookup.get(key)
        assert slot is not None,("Owner time/day mismatch",no,key)
        page=by_url[r["schedule_url"]]
        assert r["cl9_owner_scope"] in (
            "SITE_LITURGICAL_PROGRAM_1962_EXPLICIT",
            "SITE_MISSAL_JOHN_XXIII_WITH_MIXED_FORMS",
            "CELEBRATION_SLOT_1962_EXPLICIT",
            "CELEBRATION_SLOT_1962_WITH_EXCEPTIONS")
        site_by_url.setdefault(page["url"],set()).add(r["group_id"])
        conditional=bool(slot["exceptions"])
        state=HELD if slot["decision"]=="HOLD_WEEKDAY_SHORTHAND" else (
            CONDITIONAL if conditional else ACCEPTED)
        evidence_accepted=int(state!=HELD)
        exc=list(slot["exceptions"])
        if page["exception_model"] not in exc:
            exc.append(page["exception_model"])
        x={
          "historical_mass_row":no,"frozen_source_id":r["source_id"],"historical_group_id":r["group_id"],
          "site":page["site"],"source_day":day,"source_time":clock,
          "owner_schedule_url":page["url"],"owner_book_witness_url":page["owner_edition_url"],
          "owner_edition_claim":page["owner_edition_claim"],
          "owner_schedule_claim":page["owner_schedule_claim"],
          "book_claim":page["book"],"claim_scope":page["evidence_scope"],
          "adjudication":state,"owner_evidence_accepted":evidence_accepted,
          "exceptions":";".join(exc),
          "underlying_historical_schedule_label":raw[19],
          "original_schedule_check_date":raw[18],
          "public_venue_approved":0,"current_recurrence_approved":0,
          "una_cum_inferred":0,"celebrant_identity_inferred":0,
          "reason_if_held":"Parish's compact M S a weekday notation is not independently established by each weekday on that page." if state==HELD else "",
        }
        result.append(x)
    assert len(result)==85 and len(matched_keys)==85
    assert len(slot_lookup)==85 and len(site_by_url)==9
    assert all(len(groups)==1 for groups in site_by_url.values())
    totals=Counter(r["adjudication"] for r in result)
    assert totals==Counter({ACCEPTED:77,CONDITIONAL:2,HELD:6}),totals
    assert sum(r["owner_evidence_accepted"] for r in result)==79
    assert {r["source_day"] for r in result if r["adjudication"]==CONDITIONAL}=={"Sunday"}
    assert all("FIRST_SUNDAY_2002_NOT_1962" in r["exceptions"] for r in result if r["adjudication"]==CONDITIONAL)

    # No edit or release of canonical/source tables: CL10 is a separate append-only
    # research overlay, with original CL2 classifications still at exactly 3.
    with db:
        db.executescript("""
        CREATE TABLE cl10_owner_book_claim(
          url TEXT PRIMARY KEY,site TEXT NOT NULL,owner_book_witness_url TEXT NOT NULL,
          book_claim TEXT NOT NULL,evidence_scope TEXT NOT NULL,
          source_review_date TEXT NOT NULL,public_release INTEGER NOT NULL DEFAULT 0
            CHECK(public_release=0),source_json TEXT NOT NULL);
        CREATE TABLE cl10_1962_mass_evidence(
          row_no INTEGER PRIMARY KEY,
          group_id TEXT NOT NULL,original_source_id TEXT NOT NULL,
          owner_url TEXT NOT NULL,book_claim TEXT NOT NULL,
          scope TEXT NOT NULL,adjudication TEXT NOT NULL,
          accepted INTEGER NOT NULL CHECK(accepted IN (0,1)),
          exception_json TEXT NOT NULL,
          current_recurrence_approved INTEGER NOT NULL DEFAULT 0 CHECK(current_recurrence_approved=0),
          public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0),
          una_cum_assessed INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_assessed=0),
          FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
          FOREIGN KEY(owner_url) REFERENCES cl10_owner_book_claim(url));
        CREATE INDEX cl10_group ON cl10_1962_mass_evidence(group_id);
        """)
        for source in sources:
            db.execute("INSERT INTO cl10_owner_book_claim (url,site,owner_book_witness_url,book_claim,evidence_scope,source_review_date,source_json) VALUES (?,?,?,?,?,?,?)",(
                source["url"],source["site"],source["owner_edition_url"],source["book"],
                source["evidence_scope"],doc["source_review_date"],json.dumps(source,ensure_ascii=False)))
        for r in result:
            db.execute("INSERT INTO cl10_1962_mass_evidence (row_no,group_id,original_source_id,owner_url,book_claim,scope,adjudication,accepted,exception_json) VALUES (?,?,?,?,?,?,?,?,?)",(
                r["historical_mass_row"],r["historical_group_id"],r["frozen_source_id"],
                r["owner_schedule_url"],r["book_claim"],r["claim_scope"],r["adjudication"],
                r["owner_evidence_accepted"],json.dumps(r["exceptions"].split(";"),ensure_ascii=False)))
        assert db.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence WHERE accepted=1").fetchone()[0]==79
        assert db.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence WHERE current_recurrence_approved!=0 OR public_approved!=0 OR una_cum_assessed!=0").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
    result.sort(key=lambda x:x["historical_mass_row"])
    csv_output(args.out_dir/"cl10_85_mass_evidence_decisions.csv",result)
    counts_by_source=[]
    for source in sources:
        items=[r for r in result if r["owner_schedule_url"]==source["url"]]
        counts_by_source.append({
          "source_url":source["url"],"site":source["site"],
          "candidate_rows":len(items),
          "owner_book_evidence_accepted":sum(i["owner_evidence_accepted"] for i in items),
          "held":sum(i["adjudication"]==HELD for i in items),
          "conditional_1962_with_2002_exception":sum(i["adjudication"]==CONDITIONAL for i in items),
          "book_claim":source["book"],"evidence_scope":source["evidence_scope"],
          "current_recurrence_approved":0,"public_release":0,
        })
    csv_output(args.out_dir/"cl10_9_owner_source_adjudications.csv",counts_by_source)
    summary={
      "schema":"AO_CL10_RESEARCH_1962_EVIDENCE_ADJUDICATION_V1",
      "source_review_date":"2026-10-26",
      "starting_CL9_candidates":432,"selected_for_adjudication":85,
      "official_urls_reexamined":9,"distinct_historical_group_ids":9,
      "accepted_source_scoped_1962_book_evidence_rows":79,
      "accepted_conditional_1962_rows":2,
      "accepted_nonconditional_1962_rows":77,
      "held_weekday_shorthand_rows":6,
      "newly_accepted_owner_evidence_claims_per_celebration":79,
      "existing_CL2_owner_accepted_classification_source_rows_unchanged":3,
      "remaining_CL9_candidates_not_yet_slot_adjudicated":432-85,
      "una_cum_classifications":0,"current_timetable_releases":0,"public_venue_releases":0,
      "warning":"79 is the number of owner-evidence-supported schedule-row claims, NOT 79 distinct sites, currently verifiable Mass times, or globally accepted canonical labels. Conditional rows are never 1962 on first Sundays.",
      "site_breakdown":counts_by_source,
    }
    (args.out_dir/"cl10_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    db.close()
    print(json.dumps({"status":"PASS","candidate_rows":85,"accepted_scoped_book_evidence":79,
                      "nonconditional":77,"conditional":2,"held":6,
                      "new_public_approvals":0},sort_keys=True))
if __name__=="__main__":
    main()
