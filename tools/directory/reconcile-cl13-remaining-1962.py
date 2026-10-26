#!/usr/bin/env python3
"""CL13: close CL9's residual 154-row 1962-candidate adjudication (research only).

Completes the 432 historical candidate rows in one reproducible SQLite
research chain without changing canonical source tables or publication.
"""
import argparse
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path
import sqlite3

MANIFEST=Path("data/directory/research/cl13-final-1962-reconciliation-20261026/source-decisions.json")
ACCEPT="ACCEPT_OWNER_OR_DIOCESAN_1962_BOOK_AT_EXACT_HISTORICAL_SLOT"
HOLD="HOLD_EXACT_1962_SLOT_EVIDENCE_UNSATISFIED"
POLICY="INSTITUTIONAL_1962_PROGRAMME_WITNESS_ONLY"
def save_csv(path,rows):
    with path.open("w",encoding="utf-8",newline="") as handle:
        writer=csv.DictWriter(handle,fieldnames=list(rows[0]),extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--cl9-csv",type=Path,required=True)
    p.add_argument("--out-dir",type=Path,required=True)
    a=p.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
    assert manifest["schema"]=="AO_CL13_REMAINING_154_SOURCE_ADJUDICATION_V1"
    sources=manifest["sources"]
    assert len(sources)==12
    assert len(set(x["url"] for x in sources))==12
    owners={x["url"]:x for x in sources}
    assert sum(x["original_source_count"] for x in sources)==154
    assert sum(len(x["accepted_slots"]) for x in sources)==29
    exact={}
    for s in sources:
        assert s["primary_book_url"].startswith("https://")
        for lock in s["accepted_slots"]:
            rid=int(lock["row_no"])
            assert rid not in exact
            assert lock["decision"]=="ACCEPTED_1962_SOURCE_SCOPED_ONLY"
            assert isinstance(lock["day"],str) and len(lock["time"])==5
            exact[rid]=(s,lock)
    assert len(exact)==29

    with a.cl9_csv.open(newline="",encoding="utf-8") as f:
        cl9=list(csv.DictReader(f))
    assert len(cl9)==432
    remaining=[r for r in cl9 if r["cl9_url_reviewed"]=="YES" and r["cl9_followup"]!="VERIFY_CELEBRATION_SLOT_AND_EXCEPTION"]
    assert len(remaining)==154
    assert {r["schedule_url"] for r in remaining}==set(owners)
    freq=Counter(r["schedule_url"] for r in remaining)
    for url,s in owners.items():
        assert freq[url]==s["original_source_count"],(url,freq[url],s["original_source_count"])
    assert set(exact).issubset({int(x["row_no"]) for x in remaining})

    con=sqlite3.connect(a.db)
    con.row_factory=sqlite3.Row
    con.execute("PRAGMA foreign_keys=ON")
    for tab,size in (
        ("canonical_site",2584),("mass_time",4681),
        ("cl9_mass_candidate",432),
        ("cl10_1962_mass_evidence",85),
        ("cl11_mass_source_scope",118),
        ("cl12_singleton_evidence",75)):
        current=con.execute(f"SELECT COUNT(*) FROM {tab}").fetchone()[0]
        assert current==size,(tab,current)
    assert con.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    assert con.execute("SELECT COUNT(*) FROM cl10_1962_mass_evidence WHERE accepted=1").fetchone()[0]==79
    assert con.execute("SELECT COUNT(*) FROM cl11_mass_source_scope WHERE book_evidence_accepted=1").fetchone()[0]==42
    assert con.execute("SELECT COUNT(*) FROM cl12_singleton_evidence WHERE evidence_1962_accepted=1").fetchone()[0]==12

    rows=[]
    for r in remaining:
        rid=int(r["row_no"])
        o=con.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=?",(rid,)).fetchone()
        assert o is not None,(rid,"missing master")
        original=json.loads(o["original_json"])
        assert len(original)==28
        assert original[1]==r["source_id"] and o["source_id"]==r["source_id"]
        assert o["group_id"]==r["group_id"]
        assert original[14]==r["schedule_url"]
        assert original[9]==r["mass_type"]
        for earlier in ("cl10_1962_mass_evidence","cl11_mass_source_scope","cl12_singleton_evidence"):
            assert con.execute(f"SELECT COUNT(*) FROM {earlier} WHERE row_no=?",(rid,)).fetchone()[0]==0
        src=owners[r["schedule_url"]]
        lock=exact.get(rid)
        admitted=int(bool(lock))
        if admitted:
            assert src["url"]==lock[0]["url"]
            l=lock[1]
            assert (original[6],original[7])==(l["day"],l["time"]),(rid,original[6:8],l)
            if "site" in l:
                assert original[2]==l["site"],(rid,original[2],l["site"])
            assert original[19]=="VERIFIED" and original[18],("accepted row with no prior historical verification",rid)
            decision=ACCEPT
        else:
            decision=POLICY if src["review"]=="INSTITUTIONAL_EXCLUSIVE_1962_POLICY_NOT_SLOT_PROOF" else HOLD
        rows.append({
          "row_no":rid,"source_id":r["source_id"],"group_id":r["group_id"],
          "original_venue":original[2],"day":original[6],"time":original[7],
          "original_mass_type":original[9],"url":r["schedule_url"],
          "owner_1962_primary_url":src["primary_book_url"],
          "owner_1962_second_url":src.get("secondary_book_url",""),
          "owner_review_scope":src["review"],"adjudication":decision,
          "accepted_book_evidence_at_slot":admitted,
          "policy_1962_witness_only":int(decision==POLICY),
          "exception_codes":";".join(src["exceptions"]),
          "observation":src["observation"],
          "frozen_historical_schedule_status":original[19],
          "frozen_historical_check_date":original[18],
          "current_recurrence_approved":0,
          "public_venue_approved":0,
          "una_cum_accepted":0,
          "owner_or_celebrant_role_approved":0,
        })
    rows.sort(key=lambda x:x["row_no"])
    assert len(rows)==154
    assert sum(x["accepted_book_evidence_at_slot"] for x in rows)==29
    assert sum(not x["accepted_book_evidence_at_slot"] for x in rows)==125
    assert sum(x["policy_1962_witness_only"] for x in rows)==73
    assert len({x["group_id"] for x in rows if x["accepted_book_evidence_at_slot"]})<=29

    byurl=defaultdict(list)
    for r in rows: byurl[r["url"]].append(r)
    source_export=[]
    for u,s in sorted(owners.items(),key=lambda kv:(-kv[1]["original_source_count"],kv[0])):
        data=byurl[u]
        source_export.append({
            "source_url":u,
            "historical_candidate_rows":len(data),
            "scoped_1962_row_evidence_accepted":sum(x["accepted_book_evidence_at_slot"] for x in data),
            "unaccepted":sum(not x["accepted_book_evidence_at_slot"] for x in data),
            "policy_only":sum(x["policy_1962_witness_only"] for x in data),
            "owner_class":s["review"],"primary_book_witness":s["primary_book_url"],
            "exception_codes":";".join(s["exceptions"]),
            "evidence_summary":s["observation"],"public_release":0
        })
    assert len(source_export)==12
    with con:
        con.executescript("""
        CREATE TABLE cl13_source_review (
           url TEXT PRIMARY KEY,review_class TEXT NOT NULL,
           accepted_source_scope_rows INTEGER NOT NULL,original_source_rows INTEGER NOT NULL,
           review_json TEXT NOT NULL,
           approved_for_publication INTEGER NOT NULL DEFAULT 0 CHECK(approved_for_publication=0));
        CREATE TABLE cl13_remaining_1962_evidence (
           row_no INTEGER PRIMARY KEY,source_id TEXT NOT NULL,
           group_id TEXT NOT NULL,source_url TEXT NOT NULL,
           adjudication TEXT NOT NULL,evidence_1962_slot_accepted INTEGER NOT NULL
             CHECK(evidence_1962_slot_accepted IN (0,1)),
           institutional_programme_only INTEGER NOT NULL
             CHECK(institutional_programme_only IN (0,1)),
           evidence_json TEXT NOT NULL,
           public_approval INTEGER NOT NULL DEFAULT 0 CHECK(public_approval=0),
           current_recurrence_approval INTEGER NOT NULL DEFAULT 0 CHECK(current_recurrence_approval=0),
           una_cum_approval INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_approval=0),
           FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
           FOREIGN KEY(source_url) REFERENCES cl13_source_review(url));
        CREATE INDEX cl13_group_idx ON cl13_remaining_1962_evidence(group_id);
        """)
        for u,s in owners.items():
            con.execute("INSERT INTO cl13_source_review (url,review_class,accepted_source_scope_rows,original_source_rows,review_json) VALUES (?,?,?,?,?)",(
                u,s["review"],len(s["accepted_slots"]),s["original_source_count"],json.dumps(s,sort_keys=True,ensure_ascii=False)))
        for row in rows:
            con.execute("INSERT INTO cl13_remaining_1962_evidence (row_no,source_id,group_id,source_url,adjudication,evidence_1962_slot_accepted,institutional_programme_only,evidence_json) VALUES (?,?,?,?,?,?,?,?)",(
                row["row_no"],row["source_id"],row["group_id"],row["url"],row["adjudication"],
                row["accepted_book_evidence_at_slot"],row["policy_1962_witness_only"],
                json.dumps(row,sort_keys=True,ensure_ascii=False)))
        assert con.execute("SELECT COUNT(*) FROM cl13_remaining_1962_evidence WHERE evidence_1962_slot_accepted=1").fetchone()[0]==29
        assert con.execute("SELECT COUNT(*) FROM cl13_remaining_1962_evidence WHERE institutional_programme_only=1").fetchone()[0]==73
        assert con.execute("SELECT COUNT(*) FROM cl13_remaining_1962_evidence WHERE public_approval=1 OR current_recurrence_approval=1 OR una_cum_approval=1").fetchone()[0]==0
        assert con.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert con.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert con.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not con.execute("PRAGMA foreign_key_check").fetchall()
    save_csv(a.out_dir/"cl13_154_row_decisions.csv",rows)
    save_csv(a.out_dir/"cl13_12_owner_source_reviews.csv",source_export)
    unresolved=[r for r in rows if not r["accepted_book_evidence_at_slot"]]
    save_csv(a.out_dir/"cl13_125_unaccepted_exception_queue.csv",unresolved)
    cumulative={
        "cl10":{"rows":85,"accepted":79,"held":6},
        "cl11":{"rows":118,"accepted":42,"held":76},
        "cl12":{"rows":75,"accepted":12,"held":63},
        "cl13":{"rows":154,"accepted":29,"held":125},
    }
    assert sum(v["rows"] for v in cumulative.values())==432
    assert sum(v["accepted"] for v in cumulative.values())==162
    assert sum(v["held"] for v in cumulative.values())==270
    summary={
      "schema":"AO_CL13_ALL_432_CANDIDATES_ADJUDICATED_V1",
      "adjudication_date":"2026-10-26",
      "prior_CL9_candidate_pool":432,
      "urls_first_pass_screened":129,
      "cl13_source_urls":12,
      "cl13_rows_adjudicated":154,
      "new_research_accepted_1962_book_claim_rows":29,
      "new_held_exact_1962_book_claim_rows":125,
      "cl13_institutional_only_1962_policy_witness_rows":73,
      "cumulative_slot_rows_adjudicated":432,
      "cumulative_1962_book_evidence_accepted":162,
      "cumulative_book_evidence_held":270,
      "release_status":"RESEARCH_ONLY_NOT_PUBLIC",
      "preexisting_original_CL2_owner_source_1962_witnesses_unchanged":3,
      "una_cum_new":0,"public_venue_releases":0,"current_schedule_releases":0,
      "warning":"100% row disposition means each historical 1962 candidate has a researched accepted/held disposition, NOT that each row is factually verified or publishable. Accepted 162 are celebration-row 1962 evidence claims, not 162 distinct churches.",
      "next_gates":[
        "Recover exact direct owner evidence for the 125 CL13 holds including 73 FSSP institutional-policy records.",
        "Re-review all older CL10/11/12 holds, preserving source revisions and site substitutions.",
        "Reverify operational recurrence and physical place independently, before map publication.",
        "Never infer Una Cum, owner, society, or celebrant identity from Latin/old-rite wording."
      ],
      "phase_totals":cumulative,
      "source_breakdown":source_export,
    }
    (a.out_dir/"cl13_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    con.close()
    print(json.dumps({"status":"PASS","cl13_rows":154,"new_accepted":29,"new_held":125,
      "all_cl10_13_rows_adjudicated":432,"cumulative_accepted":162,
      "cumulative_held":270,"public_releases":0},sort_keys=True))
if __name__=="__main__":
    main()
