#!/usr/bin/env python3
"""CL31: certify two research-only physical identity decisions and avoid the
parallel 296 historical Mass-row review queue. No canonical merge/public release.
"""
import argparse,csv,json,sqlite3
from collections import Counter
from datetime import date
from pathlib import Path

SOURCE=Path("data/directory/research/cl31-identity-queue-20261026/evidence.json")
TWO={"DE-FREIBURG-ADELHAUSER-KIRCHE-ORDO-VETUS":"RG-CC7E25BA567F",
     "UK-CHESHAM-BOIS-OUR-LADY-OF-PERPETUAL-SUCCOUR":"RG-ACE21207D458"}
THREE={"DE-S-DERBRARUP-CHRIST-K-NIG",
       "DE-STEPHANSPOSCHING-LOH-HEILIG-KREUZ","UK-HOLNEST-CL29"}
def write(path,items):
 assert items
 with path.open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=list(items[0]),extrasaction="ignore")
  w.writeheader();w.writerows(items)
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--db",type=Path,required=True)
 p.add_argument("--out-dir",type=Path,required=True)
 x=p.parse_args()
 x.out_dir.mkdir(parents=True,exist_ok=True)
 m=json.loads(SOURCE.read_text(encoding="utf-8"))
 assert m["schema"]=="AO_CL31_EXISTING_SITE_IDENTITY_AND_PARALLEL_296_ROW_QUEUE_V1"
 assert m["as_of"]=="2026-10-26"
 adjud=m["source_verified_two_anchor_adjudications"]
 holds=m["physical_location_confirmed_but_unlinked"]
 venues=m["site_reconciliation_32"]
 events=m["dated_event_reconciliation_104"]
 overlap=m["global_first_party_review_queue_overlap"]
 archive=m["source_original_pdf_preservation"]
 counts=m["status_summary"]
 assert len(adjud)==2 and {a["source_key"] for a in adjud}==set(TWO)
 assert len(holds)==3 and {a["source_key"] for a in holds}==THREE
 assert len(venues)==32 and len(events)==104
 assert all(not r["canonical_group_automerged"] and r["no_historical_id_merge"]
            and r["research_only_primary_existing_anchor"] for r in adjud)
 assert all(len(r["evidence"])>=2 and all(e["url"].startswith("https://") for e in r["evidence"]) for r in adjud)
 assert all(len(r["evidence"])>=2 for r in holds)
 assert all(r["canonical_group_merges_approved"] is False and
            r["public_venue_identity_approved"] is False for r in venues)
 assert all(r["public_event_approved"] is False and
            r["global_future_calendar_dedup_approved"] is False for r in events)
 assert archive["pdf_binary_permanently_archived"] is False
 assert archive["real_pdf_sha256"] is None
 assert archive["archive_completion_claimed"] is False
 assert archive["no_paid_storage_or_overage_authorized"] is True
 q=overlap["frozen_296_row_key_projection"]
 assert len(q)==296
 assert len({y["historical_row"] for y in q})==296
 assert Counter(y["queue"] for y in q)==Counter({"COHORT_200":200,"COHORT_71":71,"SECONDARY_25":25})
 anchors={y["effective_anchor_id"] for y in q}
 assert len(anchors)==143
 assert all(y["source_url"].startswith(("https://","http://")) for y in q)
 # Preserve the eight original unencrypted historical URLs as evidence. They are not publication links.
 assert sum(y["source_url"].startswith("http://") for y in q)==8
 assert overlap["source_rows_total"]==296
 assert overlap["distinct_effective_anchor_ids"]==143
 assert overlap["event_rows_on_any_296_review_queue_anchor"]==0
 assert overlap["parallel_review_audit_blob_sha"] and len(overlap["parallel_review_audit_blob_sha"])==40
 db=sqlite3.connect(x.db)
 db.row_factory=sqlite3.Row
 db.execute("PRAGMA foreign_keys=ON")
 for tab,n in {"canonical_site":2584,"mass_time":4681,
               "cl17_owner_site_stage":39,"cl18_recurrence_rules":74,
               "cl25_dated_operator_candidate":7,
               "cl26_external_date_specific_ordo_event":14,
               "cl27_local_dated_research_candidate":9,
               "cl28_crossnetwork_dated_source_candidate":18,
               "cl29_operator_dated_mass_candidate":56,
               "cl30_source_to_global_research_anchor":32,
               "cl30_dated_event_to_global_research_anchor":104}.items():
  got=db.execute("SELECT COUNT(*) FROM "+tab).fetchone()[0]
  assert got==n,(tab,got,n)
 sites={r["group_id"]:dict(r) for r in db.execute(
    "SELECT group_id,effective_anchor_id,country,name,physical_description FROM canonical_site")}
 assert len(sites)==2584
 original={r["source_venue_key"]:dict(r) for r in db.execute(
    "SELECT source_venue_key,proposed_effective_anchor_id,crosswalk_status FROM cl30_source_to_global_research_anchor")}
 site_by={r["research_venue_key"]:r for r in venues}
 assert set(site_by)==set(original)
 for a in adjud:
  k=a["source_key"]
  assert a["selected_effective_anchor_id"]==TWO[k]
  assert a["chosen_existing_group_id"]==TWO[k]
  assert a["other_existing_group_id"] in sites
  assert sites[a["chosen_existing_group_id"]]["effective_anchor_id"]==a["selected_effective_anchor_id"]
  assert sites[a["other_existing_group_id"]]["effective_anchor_id"]!=a["selected_effective_anchor_id"]
  assert site_by[k]["cl30_prior_single_anchor"] is None
  assert original[k]["proposed_effective_anchor_id"] is None
  assert site_by[k]["cl31_working_existing_anchor"]==TWO[k]
  assert site_by[k]["cl31_grade"]=="TWO_FROZEN_GROUPS_ONE_PHYSICAL_CHURCH_RESEARCH_PRIMARY_SELECTED_IDENTITY_MERGE_HELD"
 for r in venues:
  k=r["research_venue_key"]
  assert r["cl30_status"]==original[k]["crosswalk_status"]
  assert r["cl30_prior_single_anchor"]==original[k]["proposed_effective_anchor_id"]
  chosen=r["cl31_working_existing_anchor"]
  assert chosen==(TWO[k] if k in TWO else original[k]["proposed_effective_anchor_id"])
  if chosen:
   assert chosen in sites
  else:
   assert k in THREE
  if k in THREE:
   assert r["cl31_working_existing_anchor"] is None
  if r["attached_primary_sources"]:
   assert all(e["url"].startswith("https://") for e in r["attached_primary_sources"])
 before={(r["phase"],r["source_event_key"]):dict(r) for r in db.execute(
    "SELECT phase,source_event_key,source_venue_key,local_date,local_time,proposed_effective_anchor_id"
    " FROM cl30_dated_event_to_global_research_anchor")}
 assert len(before)==104
 linked=0;newlinks=0
 for r in events:
  k=(r["phase"],r["source_event_key"])
  assert k in before
  old=before[k]
  assert r["research_venue_key"]==old["source_venue_key"]
  assert r["local_date"]==old["local_date"] and r["local_time"]==old["local_time"]
  assert r["cl30_existing_anchor_candidate"]==old["proposed_effective_anchor_id"]
  chosen=site_by[r["research_venue_key"]]["cl31_working_existing_anchor"]
  assert r["cl31_working_anchor_candidate"]==chosen
  assert r["source_weekday"] in ("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday")
  date.fromisoformat(r["local_date"])
  if chosen:
   linked+=1
   assert chosen not in anchors,("parallel review queue duplication",chosen,k)
  if old["proposed_effective_anchor_id"] is None and chosen:newlinks+=1
 assert linked==100 and newlinks==18
 assert sum(v["cl31_working_existing_anchor"] is not None for v in venues)==29
 assert sum(v["cl31_working_existing_anchor"] is None for v in venues)==3
 assert sum(e["cl31_working_anchor_candidate"] is None for e in events)==4
 for y in q:
  assert y["effective_anchor_id"]
  assert isinstance(y["historical_row"],int)
  assert 0<=y["historical_row"]<=4681
 assert counts["source_venues_now_working"]==29
 assert counts["dated_rows_now_working"]==100
 assert counts["still_held_unlinked_dated_rows"]==4
 assert counts["still_held_unlinked_source_venues"]==3
 assert counts["new_working_linked_dated_rows"]==18
 assert counts["review_queue_items"]==296
 assert counts["review_queue_distinct_effective_anchors"]==143
 assert counts["crossphase_dated_rows_sharing_firstparty_review_anchor"]==0
 for key in ("new_canonical_merge_approvals","new_public_event_approvals",
             "new_public_pins","new_una_cum"):
  assert counts[key]==0
 with db:
  db.executescript("""
   CREATE TABLE cl31_worship_identity_working_crosswalk(
    source_venue_key TEXT PRIMARY KEY,
    cl30_candidate_anchor_id TEXT,
    cl31_research_working_anchor_id TEXT,
    identity_grade TEXT NOT NULL,
    evidence_json TEXT NOT NULL,
    canonical_identity_merged INTEGER NOT NULL DEFAULT 0 CHECK(canonical_identity_merged=0),
    public_worship_site_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_worship_site_approved=0),
    FOREIGN KEY(source_venue_key) REFERENCES cl30_source_to_global_research_anchor(source_venue_key),
    FOREIGN KEY(cl31_research_working_anchor_id) REFERENCES canonical_site(group_id));
   CREATE TABLE cl31_dated_source_anchor_candidate(
    phase TEXT NOT NULL,
    source_event_key TEXT NOT NULL,
    cl31_research_working_anchor_id TEXT,
    evidence_json TEXT NOT NULL,
    public_mass_date_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_mass_date_approved=0),
    PRIMARY KEY(phase,source_event_key),
    FOREIGN KEY(phase,source_event_key) REFERENCES
        cl30_dated_event_to_global_research_anchor(phase,source_event_key),
    FOREIGN KEY(cl31_research_working_anchor_id) REFERENCES canonical_site(group_id));
   CREATE TABLE cl31_parallel_global_owner_review_anchor(
    historical_row INTEGER PRIMARY KEY,
    effective_anchor_id TEXT NOT NULL,
    review_cohort TEXT NOT NULL,
    evidence_json TEXT NOT NULL,
    auto_resolved_by_dated_research INTEGER NOT NULL DEFAULT 0 CHECK(auto_resolved_by_dated_research=0));
  """)
  for r in venues:
   db.execute("INSERT INTO cl31_worship_identity_working_crosswalk "
    "(source_venue_key,cl30_candidate_anchor_id,cl31_research_working_anchor_id,identity_grade,evidence_json)"
    " VALUES(?,?,?,?,?)",(r["research_venue_key"],r["cl30_prior_single_anchor"],
      r["cl31_working_existing_anchor"],r["cl31_grade"],json.dumps(r,sort_keys=True,ensure_ascii=False)))
  for r in events:
   db.execute("INSERT INTO cl31_dated_source_anchor_candidate(phase,source_event_key,cl31_research_working_anchor_id,evidence_json)"
    " VALUES(?,?,?,?)",(r["phase"],r["source_event_key"],r["cl31_working_anchor_candidate"],
      json.dumps(r,sort_keys=True,ensure_ascii=False)))
  for r in q:
   db.execute("INSERT INTO cl31_parallel_global_owner_review_anchor"
    "(historical_row,effective_anchor_id,review_cohort,evidence_json) VALUES(?,?,?,?)",
    (r["historical_row"],r["effective_anchor_id"],r["queue"],json.dumps(r,sort_keys=True,ensure_ascii=False)))
  assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
  assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
  assert db.execute("SELECT COUNT(*) FROM mass_time").fetchone()[0]==4681
  assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
 write(x.out_dir/"cl31_32_venue_research_identities.csv",[
   {"key":r["research_venue_key"],"grade":r["cl31_grade"],"anchor":r["cl31_working_existing_anchor"],
    "public_site_approved":0} for r in venues])
 write(x.out_dir/"cl31_104_working_anchor_events.csv",[
   {"phase":r["phase"],"event_key":r["source_event_key"],"venue_key":r["research_venue_key"],
    "date":r["local_date"],"time":r["local_time"],
    "research_anchor":r["cl31_working_anchor_candidate"],"public_event_approved":0} for r in events])
 write(x.out_dir/"cl31_296_parallel_review_source_rows.csv",q)
 report={"schema":"AO_CL31_SITE_IDENTITY_AND_296_GLOBAL_OWNER_QUEUE_AUDIT_V1",
  "frozen_master_site_groups":2584,"frozen_master_mass_rows":4681,
  "source_venue_keys":32,"previous_CL30_single_anchor_keys":27,
  "added_research_only_single_working_anchor_keys":2,
  "total_research_working_anchor_keys":29,
  "prior_CL30_candidate_linked_source_dates":82,
  "newly_working_linked_source_dates":18,
  "CL31_total_working_linked_dated_source_events":100,
  "source_dates_in_cross_phase_corpus":104,
  "held_unlinked_venue_keys":3,"held_unlinked_source_dates":4,
  "parallel_owner_review_rows_preserved":296,
  "parallel_owner_review_distinct_anchors":143,
  "date_events_overlapping_owner_review_anchors":0,
  "remaining_master_duplicate_identity_merges_authorized":0,
  "source_pdf_original_binary_archived":False,
  "source_pdf_verified_sha256":None,
  "public_sites_promoted":0,"public_mass_occurrences_promoted":0,
  "public_pins_created":0,"una_cum_changed":0}
 (x.out_dir/"cl31_summary.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print(json.dumps({"status":"PASS",**report},sort_keys=True))
 db.close()
if __name__=="__main__":
 main()
