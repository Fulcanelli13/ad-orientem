#!/usr/bin/env python3
"""CL32 — all 104 source-dated observations receive provenance grade and
as-of calendar-date classification. Two Stephansposching Masses are now
directly corroborated by host parish. Still NO public release.
"""
from __future__ import annotations
import argparse,csv,json,sqlite3
from collections import Counter
from datetime import date
from pathlib import Path
from zoneinfo import ZoneInfo

PATH=Path("data/directory/research/cl32-date-proof-freshness-20261027/evidence.json")
ALLOWED={
 "DIRECT_LOCAL_ORGANIZER_DATE_SPECIFIC_MASS":26,
 "DIRECT_OPERATOR_DATE_SPECIFIC_MASS":68,
 "DIRECT_HOST_PARISH_DATE_SPECIFIC_MASS":4,
 "DIRECT_OPERATOR_BUT_AMBIGUOUS_SERVICE_DESCRIPTION":1,
 "MUTABLE_SEARCH_INDEX_DATE_NEEDS_DIRECT_RECHECK":4,
 "SECONDARY_EXPLICIT_DATE_PENDING_LOCAL_CONFIRMATION":1}
REL={"PAST_SOURCE_DATE":8,"SAME_LOCAL_DATE_AS_AUDIT":5,"FUTURE_CALENDAR_DATE":91}

def csvout(path,items):
 assert items
 with path.open("w",encoding="utf-8",newline="") as f:
  fieldnames=list(dict.fromkeys(k for row in items for k in row))
  w=csv.DictWriter(f,fieldnames=fieldnames)
  w.writeheader();w.writerows(items)

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--db",type=Path,required=True)
 p.add_argument("--out-dir",type=Path,required=True)
 opt=p.parse_args()
 opt.out_dir.mkdir(parents=True,exist_ok=True)
 j=json.loads(PATH.read_text(encoding="utf-8"))
 assert j["schema"]=="AO_CL32_SOURCE_DATED_104_EVIDENCE_GRADE_AND_ASOF_20261027_V1"
 assert j["as_of_date"]=="2026-10-27"
 assert j["source_pinned_cl31_sha"]=="663cb8cc375a4994b25e7988f3230e7c7178cfc1"
 assert j["legacy_source_rows_not_rewritten"] is True
 rows=j["all_104_dated_source_audit_rows"]
 upgrades=j["specific_new_primary_host_parish_confirmations"]
 sud=j["suedrbrarup_dated_source_reassertion"]
 hol=j["holnest_private_chapel_hold"]
 limitations=j["source_limitations"]
 assert len(rows)==104 and len(upgrades)==2
 assert {x["date"] for x in upgrades}=={"2026-11-13","2026-12-04"}
 assert {x["time"] for x in upgrades}=={"19:00"}
 assert {x["research_venue_key"] for x in upgrades}=={"DE-STEPHANSPOSCHING-LOH-HEILIG-KREUZ"}
 assert all(x["official_host_parish_url"]=="https://michaelsbuch-stephansposching.de/neugikeiten/" for x in upgrades)
 assert all(x["operator_phrase"]=="Hl. Messe in der außerordentlichen Form des römischen Ritus" for x in upgrades)
 assert all(x["original_source_grade_retained_in_cl28"] is True and
            x["cl2_site_master_id_resolved"] is False and
            x["public_calendar_approved"] is False for x in upgrades)
 assert sud["date"]=="2026-11-02" and sud["time"]=="18:30"
 assert sud["local_latin_mass_operator_url"]=="https://www.alte-messe-im-norden.de/"
 assert sud["host_parish_source_url"].startswith("https://pfarrei-stella-maris.de/")
 assert sud["wrong_same_name_bonn_christ_koenig_must_not_match"] is True
 assert sud["auto_generate_monthly_pattern"] is False
 assert sud["public_calendar_approved"] is False
 assert hol["research_venue_key"]=="UK-HOLNEST-CL29"
 assert hol["named_operator_private_chapel"] is True
 assert hol["no_public_georeference"] is True
 assert hol["public_pin_approved"] is False
 assert limitations["original_sspx_pdf_binary_archived"] is False
 assert limitations["original_sspx_pdf_sha256"] is None
 assert limitations["full_global_event_conflict_check_ran"] is False
 assert limitations["source_witness_currentness_needs_recheck_at_publication"] is True
 assert Counter(x["source_quality"] for x in rows)==Counter(ALLOWED)
 assert Counter(x["relative_calendar_date_status"] for x in rows)==Counter(REL)
 assert Counter(x["phase"] for x in rows)==Counter({"CL25":7,"CL26":14,"CL27":9,"CL28":18,"CL29":56})
 current=date.fromisoformat(j["as_of_date"])
 pairs=set();hasanchor=0;directMass=0
 for r in rows:
  k=(r["phase"],r["source_event_key"])
  assert k not in pairs,k
  pairs.add(k)
  d=date.fromisoformat(r["local_date"])
  expected="PAST_SOURCE_DATE" if d<current else "SAME_LOCAL_DATE_AS_AUDIT" if d==current else "FUTURE_CALENDAR_DATE"
  assert r["relative_calendar_date_status"]==expected
  assert r["as_of_calendar_date"]=="2026-10-27"
  assert len(r["local_time"])==5 and r["local_time"][2]==":"
  hh,mm=map(int,r["local_time"].split(":"))
  assert 0<=hh<24 and 0<=mm<60
  ZoneInfo(r["timezone"])
  assert r["source_listing_does_not_prove_actual_mass_celebrated"] is True
  assert r["accepted_actual_date_specific_mass_in_public_calendar"] is False
  assert r["original_pdf_binary_integrity_reverified"] is False
  assert r["eligible_for_public_find_automatically"] is False
  assert r["original_unreviewed_operator_grade_preserved"] is True
  assert r["positive_primary_source_url"] is None or r["positive_primary_source_url"].startswith("https://")
  if r["working_existing_cl2_anchor"]:hasanchor+=1
  if r["source_quality"] in ("DIRECT_LOCAL_ORGANIZER_DATE_SPECIFIC_MASS",
      "DIRECT_OPERATOR_DATE_SPECIFIC_MASS",
      "DIRECT_HOST_PARISH_DATE_SPECIFIC_MASS"):
   directMass+=1
   assert r["positive_primary_source_url"]
  if r["source_quality"]=="MUTABLE_SEARCH_INDEX_DATE_NEEDS_DIRECT_RECHECK":
   assert r["phase"]=="CL27" and r["positive_primary_source_url"] is None
  if r["source_quality"]=="SECONDARY_EXPLICIT_DATE_PENDING_LOCAL_CONFIRMATION":
   assert r["phase"]=="CL28" and r["source_event_key"]=="CL28-016"
  if r["source_quality"]=="DIRECT_OPERATOR_BUT_AMBIGUOUS_SERVICE_DESCRIPTION":
   assert r["phase"]=="CL28" and r["source_event_key"]=="CL28-005"
 assert hasanchor==100 and directMass==98
 u=[r for r in rows if r["phase"]=="CL28" and
     r["source_quality"]=="DIRECT_HOST_PARISH_DATE_SPECIFIC_MASS" and
     r["research_venue_key"]=="DE-STEPHANSPOSCHING-LOH-HEILIG-KREUZ"]
 assert {(x["source_event_key"],x["local_date"],x["local_time"]) for x in u}=={
   ("CL28-017","2026-11-13","19:00"),("CL28-018","2026-12-04","19:00")}
 assert all(x["working_existing_cl2_anchor"] is None for x in u)
 assert {(x["source_event_key"],x["local_date"],x["local_time"]) for x in rows if
    x["research_venue_key"]=="DE-S-DERBRARUP-CHRIST-K-NIG"}=={("G26-NORTH-04","2026-11-02","18:30")}
 assert all(x["working_existing_cl2_anchor"] is None for x in rows if x["research_venue_key"]=="UK-HOLNEST-CL29")
 summary=j["counts"]
 assert summary["source_date_rows"]==104
 assert summary["direct_operator_or_host_date_specific_unambiguous_mass_evidence"]==98
 assert summary["source_date_with_ambiguous_mass_vs_adoration"]==1
 assert summary["mutable_index_only_needs_direct_live_confirmation"]==4
 assert summary["secondary_date_only_needs_local_operator"]==1
 assert summary["direct_host_parish_date_upgrade_from_cl28_secondary"]==2
 assert summary["mapped_to_existing_cl2_working_anchor_research_only"]==100
 assert summary["unmatched_named_or_private_site_working_anchor"]==4
 assert summary["date_before_as_of"]==8
 assert summary["date_equal_as_of"]==5
 assert summary["date_after_as_of"]==91
 assert all(summary[x]==0 for x in
  ("truly_published_mass_instances","new_canonical_venues","new_public_map_pins","una_cum_status_changes"))
 db=sqlite3.connect(opt.db)
 db.row_factory=sqlite3.Row
 db.execute("PRAGMA foreign_keys=ON")
 for table,num in {"canonical_site":2584,"mass_time":4681,
     "cl31_worship_identity_working_crosswalk":32,
     "cl31_dated_source_anchor_candidate":104,
     "cl31_parallel_global_owner_review_anchor":296,
     "cl28_crossnetwork_dated_source_candidate":18}.items():
  actual=db.execute("SELECT COUNT(*) FROM "+table).fetchone()[0]
  assert actual==num,(table,actual,num)
 prior={ (r["phase"],r["source_event_key"]):dict(r) for r in db.execute(
   "SELECT phase,source_event_key,cl31_research_working_anchor_id"
   " FROM cl31_dated_source_anchor_candidate")}
 assert set(prior)==pairs
 before={r["research_source_event_key"]:r["evidence_grade"] for r in db.execute(
   "SELECT research_source_event_key,evidence_grade FROM cl28_crossnetwork_dated_source_candidate")}
 assert before["CL28-017"].startswith("SECONDARY_")
 assert before["CL28-018"].startswith("SECONDARY_")
 assert before["CL28-016"].startswith("SECONDARY_")
 for row in rows:
  k=(row["phase"],row["source_event_key"])
  assert prior[k]["cl31_research_working_anchor_id"]==row["working_existing_cl2_anchor"]
  if row["working_existing_cl2_anchor"]:
   assert db.execute("SELECT 1 FROM canonical_site WHERE group_id=?",
         (row["working_existing_cl2_anchor"],)).fetchone()
 with db:
  db.executescript("""
    CREATE TABLE cl32_source_date_mass_evidence_grade (
      phase TEXT NOT NULL,
      source_event_key TEXT NOT NULL,
      local_date TEXT NOT NULL,
      local_time TEXT NOT NULL,
      quality_grade TEXT NOT NULL,
      time_distance_status TEXT NOT NULL,
      working_site_anchor TEXT,
      source_json TEXT NOT NULL,
      automatically_published INTEGER NOT NULL DEFAULT 0 CHECK(automatically_published=0),
      PRIMARY KEY(phase,source_event_key),
      FOREIGN KEY(phase,source_event_key) REFERENCES cl31_dated_source_anchor_candidate(phase,source_event_key),
      FOREIGN KEY(working_site_anchor) REFERENCES canonical_site(group_id));
    CREATE TABLE cl32_direct_host_parish_date_proof (
      venue_key TEXT NOT NULL,
      exact_date TEXT NOT NULL,
      local_time TEXT NOT NULL,
      official_source TEXT NOT NULL,
      source_json TEXT NOT NULL,
      promoted_original_secondary_source INTEGER NOT NULL DEFAULT 0 CHECK(promoted_original_secondary_source=0),
      new_public_calendar_event INTEGER NOT NULL DEFAULT 0 CHECK(new_public_calendar_event=0),
      PRIMARY KEY(venue_key,exact_date,local_time));
  """)
  for r in rows:
   db.execute("INSERT INTO cl32_source_date_mass_evidence_grade "
     "(phase,source_event_key,local_date,local_time,quality_grade,time_distance_status,working_site_anchor,source_json)"
     " VALUES(?,?,?,?,?,?,?,?)",
     (r["phase"],r["source_event_key"],r["local_date"],r["local_time"],
      r["source_quality"],r["relative_calendar_date_status"],
      r["working_existing_cl2_anchor"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
  for r in upgrades:
   db.execute("INSERT INTO cl32_direct_host_parish_date_proof "
    "(venue_key,exact_date,local_time,official_source,source_json)"
    " VALUES(?,?,?,?,?)",(r["research_venue_key"],r["date"],r["time"],
     r["official_host_parish_url"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
  assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
  assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
  assert db.execute("SELECT COUNT(*) FROM mass_time").fetchone()[0]==4681
  assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
  assert db.execute("SELECT COUNT(*) FROM cl32_source_date_mass_evidence_grade WHERE automatically_published=1").fetchone()[0]==0
 csvout(opt.out_dir/"cl32_104_date_specific_evidence_grade_and_freshness.csv",rows)
 csvout(opt.out_dir/"cl32_2_host_parish_source_corroborations.csv",upgrades)
 held=[r for r in rows if r["source_quality"] not in(
    "DIRECT_LOCAL_ORGANIZER_DATE_SPECIFIC_MASS",
    "DIRECT_OPERATOR_DATE_SPECIFIC_MASS",
    "DIRECT_HOST_PARISH_DATE_SPECIFIC_MASS") or not r["working_existing_cl2_anchor"]]
 csvout(opt.out_dir/"cl32_source_or_identity_exception_queue.csv",held)
 report={"schema":"AO_CL32_104_SOURCE_EVIDENCE_GRADE_RESULT_V1",**summary,
  "source_or_identity_exception_queue_rows":len(held),
  "zero_original_secondary_grade_mutations":True,
  "original_PDF_binary_retrieved_or_hashed":False}
 (opt.out_dir/"cl32_summary.json").write_text(
     json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print(json.dumps({"status":"PASS",**report},ensure_ascii=False,sort_keys=True))
 db.close()

if __name__=="__main__":
 main()
