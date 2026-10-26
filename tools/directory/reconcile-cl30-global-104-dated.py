#!/usr/bin/env python3
"""CL30: cross-reference the CL25–29 104 source-dated research events
against existing frozen CL2 site identities, never minting any canonical site,
recurring Mass row, future app calendar entry, or public map pin.

Use standard library only. Rebuild the CL2–29 SQLite research DB first.
"""
import argparse,csv,json,sqlite3
from collections import Counter
from datetime import date
from pathlib import Path
from zoneinfo import ZoneInfo

EVIDENCE=Path("data/directory/research/cl30-global-source-crosswalk-20261026/evidence.json")
STATUS={
 "UNIQUE_NAMED_POSTCODE_RESEARCH_MATCH":22,
 "UNIQUE_ADDRESS_POSTCODE_RESEARCH_MATCH_NAME_REVIEW":2,
 "UNIQUE_NAME_STREET_RESEARCH_MATCH_NEEDS_CONFIRMATION":2,
 "SAME_EFFECTIVE_ANCHOR_MULTIPLE_HISTORICAL_ALIASES":1,
 "MULTIPLE_EFFECTIVE_ANCHORS_MANUAL_IDENTITY_REVIEW":2,
 "NO_RELIABLE_NAME_ADDRESS_MATCH":3}
def csvout(path,records):
 assert records
 with path.open("w",newline="",encoding="utf-8") as f:
  w=csv.DictWriter(f,fieldnames=list(records[0]),extrasaction="ignore")
  w.writeheader()
  w.writerows(records)

def main():
 p=argparse.ArgumentParser()
 p.add_argument("--db",type=Path,required=True)
 p.add_argument("--out-dir",type=Path,required=True)
 a=p.parse_args()
 a.out_dir.mkdir(parents=True,exist_ok=True)
 m=json.loads(EVIDENCE.read_text(encoding="utf-8"))
 assert m["schema"]=="AO_CL30_PHASE25_29_104_DATED_EVENT_CROSSWALK_TO_CL2_GLOBAL_RESEARCH_SITES_V1"
 assert m["as_of"]=="2026-10-26"
 up=m["upstream"]
 assert up["base_cl29_commit"]=="c39fb0769f4fc674cd7c31eb7117549db4f19b67"
 assert up["global_schedule_audit_pr"]==1775
 assert up["global_schedule_audit_head_sha"]=="93c38db8069b72cb72453fde2b8becf6af382ab9"
 assert up["source_phases"]==["CL25","CL26","CL27","CL28","CL29"]
 assert len(up["cl2_site_chunk_digests"])==6
 assert sum(x["rows"] for x in up["cl2_site_chunk_digests"])==2584
 assert all(len(x["sha256"])==64 for x in up["cl2_site_chunk_digests"])
 sources=m["venue_candidate_crosswalk"]
 rows=m["crossphase_date_source_candidate_rows"]
 assert len(sources)==32 and len(rows)==104
 assert len({x["research_venue_key"] for x in sources})==32
 assert len({(r["phase"],r["source_event_key"]) for r in rows})==104
 assert Counter(x["research_crosswalk_status"] for x in sources)==Counter(STATUS)
 assert all(x["mapping_public_approved"] is False and x["site_master_identity_promoted"] is False
            and x["date_event_approved"] is False for x in sources)
 assert all(r["full_worldwide_future_event_crosswalk_certified"] is False
            and r["source_event_released"] is False
            and r["app_future_event_approved"] is False for r in rows)
 assert all(v==0 for v in m["no_publication_gates"].values())
 stated=m["counts"]
 assert stated["crossphase_input_events"]==104
 assert stated["distinct_source_worship_place_keys"]==32
 assert stated["geographic_site_candidates"]==2584
 assert stated["unique_site_candidate_keys_with_source_level_anchor"]==27
 assert stated["proposed_research_event_rows_with_anchor_candidate"]==82
 assert stated["historical_duplicate_review_events"]==1
 assert stated["source_identity_status_counts"]==STATUS
 cx=sqlite3.connect(a.db)
 cx.row_factory=sqlite3.Row
 cx.execute("PRAGMA foreign_keys=ON")
 for tab,n in {
  "canonical_site":2584,"mass_time":4681,"cl17_owner_site_stage":39,
  "cl17_accepted_mass_gates":256,"cl18_recurrence_rules":74,
  "cl25_dated_operator_candidate":7,
  "cl26_external_date_specific_ordo_event":14,
  "cl27_local_dated_research_candidate":9,
  "cl28_crossnetwork_dated_source_candidate":18,
  "cl29_operator_dated_mass_candidate":56,
  "cl29_research_venue_identity":19}.items():
  found=cx.execute("SELECT COUNT(*) FROM "+tab).fetchone()[0]
  assert found==n,(tab,found,n)
 canonical={r["group_id"]:dict(r) for r in cx.execute(
  "SELECT group_id,effective_anchor_id,country,name,physical_description,release FROM canonical_site")}
 assert len(canonical)==2584
 placeby={}
 for x in sources:
  key=x["research_venue_key"]
  placeby[key]=x
  assert x["country"] in ("GB","DE","AT")
  assert x["research_crosswalk_status"] in STATUS
  groups=x["alternative_source_group_ids"]
  candidates=x["candidate_evidence"]
  assert groups or x["matched_candidate_anchor_id"] is None
  assert len(set(groups))==len(groups)
  assert candidates
  assert x["distinct_candidate_anchor_count"]==len(set(canonical[g]["effective_anchor_id"] for g in groups))
  assert x["matched_candidate_anchor_id"] is None or x["matched_candidate_anchor_id"] in canonical
  assert all(g in canonical and canonical[g]["country"]==x["country"] for g in groups)
  assert all(y["group_id"] in canonical for y in candidates)
  for y in candidates:
   orig=canonical[y["group_id"]]
   assert y["effective_anchor_id"]==orig["effective_anchor_id"]
   assert y["name"]==orig["name"]
   assert y["physical_description"]==orig["physical_description"]
   assert orig["country"]==x["country"]
  if x["research_crosswalk_status"]=="NO_RELIABLE_NAME_ADDRESS_MATCH":
   assert not groups and x["matched_candidate_anchor_id"] is None
  elif x["research_crosswalk_status"]=="MULTIPLE_EFFECTIVE_ANCHORS_MANUAL_IDENTITY_REVIEW":
   assert len(groups)>=2 and x["distinct_candidate_anchor_count"]>1
   assert x["matched_candidate_anchor_id"] is None
  else:
   assert len(groups)>=1 and x["distinct_candidate_anchor_count"]==1
   assert x["matched_candidate_anchor_id"]==canonical[groups[0]]["effective_anchor_id"]
  if x["research_crosswalk_status"]=="SAME_EFFECTIVE_ANCHOR_MULTIPLE_HISTORICAL_ALIASES":
   assert key=="UK-MANCHESTER-CL29"
   assert set(groups)=={"RG-D9490DF575C9","RG-E0C932E6CB74"}
   assert x["matched_candidate_anchor_id"]=="RG-D9490DF575C9"
 assert placeby["UK-WARRINGTON-CL29"]["matched_candidate_anchor_id"]=="RG-2E1FB8361143"
 assert placeby["UK-WARRINGTON-CL29"]["research_crosswalk_status"]=="UNIQUE_NAMED_POSTCODE_RESEARCH_MATCH"
 assert placeby["DE-FREIBURG-ADELHAUSER-KIRCHE-ORDO-VETUS"]["matched_candidate_anchor_id"] is None
 assert placeby["UK-CHESHAM-BOIS-OUR-LADY-OF-PERPETUAL-SUCCOUR"]["matched_candidate_anchor_id"] is None
 assert placeby["UK-HOLNEST-CL29"]["matched_candidate_anchor_id"] is None

 expected={}
 for r in cx.execute("SELECT source_place_id,mass_local_date,mass_local_time FROM cl25_dated_operator_candidate"):
  expected[("CL25",r["source_place_id"],r["mass_local_date"],r["mass_local_time"])]=1
 for r in cx.execute("SELECT external_site_key,local_date,local_time FROM cl26_external_date_specific_ordo_event"):
  expected[("CL26",r["external_site_key"],r["local_date"],r["local_time"])]=1
 for r in cx.execute("SELECT pilot_source_place_id,external_site_key,local_date,local_time FROM cl27_local_dated_research_candidate"):
  expected[("CL27",r["pilot_source_place_id"] or r["external_site_key"],r["local_date"],r["local_time"])]=1
 for r in cx.execute("SELECT pilot_source_place_id,external_site_key,local_date,local_time FROM cl28_crossnetwork_dated_source_candidate"):
  expected[("CL28",r["pilot_source_place_id"] or r["external_site_key"],r["local_date"],r["local_time"])]=1
 for r in cx.execute("SELECT research_venue_key,date_local,time_local FROM cl29_operator_dated_mass_candidate"):
  expected[("CL29",r["research_venue_key"],r["date_local"],r["time_local"])]=1
 assert len(expected)==104
 found=set()
 linked=0; collision_count=0
 for r in rows:
  assert r["phase"] in ("CL25","CL26","CL27","CL28","CL29")
  assert r["research_venue_key"] in placeby
  key=(r["phase"],r["research_venue_key"],r["local_date"],r["local_time"])
  assert key in expected and key not in found,("cross-phase drift or duplicate",key)
  found.add(key)
  date.fromisoformat(r["local_date"])
  assert len(r["local_time"])==5 and r["local_time"][2]==":"
  assert r["timezone"] in ("Europe/Berlin","Europe/London","Europe/Vienna")
  ZoneInfo(r["timezone"])
  site=placeby[r["research_venue_key"]]
  assert r["site_match_class"]==site["research_crosswalk_status"]
  assert r["possible_effective_anchor_id"]==site["matched_candidate_anchor_id"]
  if r["possible_effective_anchor_id"]: linked+=1
  warn=r["preexisting_historical_duplicate_slot_review"]
  if warn:
   collision_count+=1
   assert r["research_venue_key"]=="UK-MANCHESTER-CL29"
   assert r["local_date"]=="2026-11-01" and r["local_time"]=="09:30"
   assert warn["collision_site_day_time_key"]=="RG-D9490DF575C9|sunday|09:30"
   assert warn["frozen_historical_row_ids"]==[313,540]
   assert all(cx.execute("SELECT 1 FROM mass_time WHERE row_no=?",(i,)).fetchone()
              for i in warn["frozen_historical_row_ids"])
 assert found==set(expected)
 assert linked==82 and collision_count==1
 assert Counter(r["phase"] for r in rows)==Counter({"CL25":7,"CL26":14,"CL27":9,"CL28":18,"CL29":56})

 with cx:
  cx.executescript("""
  CREATE TABLE cl30_source_to_global_research_anchor(
   source_venue_key TEXT PRIMARY KEY,
   country TEXT NOT NULL,
   crosswalk_status TEXT NOT NULL,
   proposed_effective_anchor_id TEXT,
   evidence_json TEXT NOT NULL,
   promotion_approved INTEGER NOT NULL DEFAULT 0 CHECK(promotion_approved=0),
   new_canonical_venue_admitted INTEGER NOT NULL DEFAULT 0 CHECK(new_canonical_venue_admitted=0),
   FOREIGN KEY(proposed_effective_anchor_id) REFERENCES canonical_site(group_id));
  CREATE TABLE cl30_dated_event_to_global_research_anchor(
   phase TEXT NOT NULL,
   source_event_key TEXT NOT NULL,
   source_venue_key TEXT NOT NULL,
   local_date TEXT NOT NULL,
   local_time TEXT NOT NULL,
   proposed_effective_anchor_id TEXT,
   evidence_json TEXT NOT NULL,
   app_mass_calendar_approved INTEGER NOT NULL DEFAULT 0 CHECK(app_mass_calendar_approved=0),
   public_recurring_mass_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_recurring_mass_approved=0),
   PRIMARY KEY(phase,source_event_key),
   FOREIGN KEY(source_venue_key) REFERENCES cl30_source_to_global_research_anchor(source_venue_key),
   FOREIGN KEY(proposed_effective_anchor_id) REFERENCES canonical_site(group_id));
  """)
  for r in sources:
   cx.execute("INSERT INTO cl30_source_to_global_research_anchor"
    "(source_venue_key,country,crosswalk_status,proposed_effective_anchor_id,evidence_json)"
    " VALUES (?,?,?,?,?)",(r["research_venue_key"],r["country"],r["research_crosswalk_status"],
      r["matched_candidate_anchor_id"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
  for r in rows:
   cx.execute("INSERT INTO cl30_dated_event_to_global_research_anchor "
    "(phase,source_event_key,source_venue_key,local_date,local_time,proposed_effective_anchor_id,evidence_json)"
    " VALUES (?,?,?,?,?,?,?)",(r["phase"],r["source_event_key"],r["research_venue_key"],
      r["local_date"],r["local_time"],r["possible_effective_anchor_id"],
      json.dumps(r,ensure_ascii=False,sort_keys=True)))
  assert cx.execute("PRAGMA foreign_key_check").fetchall()==[]
  assert cx.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
  assert cx.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
  assert cx.execute("SELECT COUNT(*) FROM mass_time").fetchone()[0]==4681
  assert cx.execute("SELECT COUNT(*) FROM cl30_dated_event_to_global_research_anchor "
   "WHERE app_mass_calendar_approved=1 OR public_recurring_mass_approved=1").fetchone()[0]==0
  assert cx.execute("SELECT COUNT(*) FROM cl30_source_to_global_research_anchor "
   "WHERE promotion_approved=1 OR new_canonical_venue_admitted=1").fetchone()[0]==0
 csvout(a.out_dir/"cl30_32_source_venue_crosswalk.csv",[
  {"research_venue_key":r["research_venue_key"],"country":r["country"],"name":r["source_name"],
   "address":r["source_address"],"status":r["research_crosswalk_status"],
   "candidate_anchor_id":r["matched_candidate_anchor_id"],"candidate_group_ids":";".join(r["alternative_source_group_ids"]),
   "public_admitted":0} for r in sources])
 csvout(a.out_dir/"cl30_104_dated_event_crosswalk.csv",[
  {"phase":r["phase"],"source_event_key":r["source_event_key"],
   "venue_key":r["research_venue_key"],"date":r["local_date"],
   "time":r["local_time"],"timezone":r["timezone"],
   "candidate_anchor_id":r["possible_effective_anchor_id"],
   "identity_class":r["site_match_class"],
   "historical_collision_warning":int(r["preexisting_historical_duplicate_slot_review"] is not None),
   "public_mass_approved":0} for r in rows])
 csvout(a.out_dir/"cl30_5_venue_identity_hold_queue.csv",[
  {"key":r["research_venue_key"],"name":r["source_name"],"address":r["source_address"],
   "status":r["research_crosswalk_status"],"alternatives":";".join(r["alternative_source_group_ids"])}
  for r in sources if r["matched_candidate_anchor_id"] is None])
 summary={
  "schema":"AO_CL30_104_CROSSPHASE_GLOBAL_RESEARCH_CROSSWALK_REPORT_V1",
  "frozen_site_master_rows":2584,"frozen_mass_time_rows":4681,
  "source_dates_reconciled":104,"source_venue_keys":32,
  "candidate_unique_research_anchors":27,
  "source_date_rows_with_single_anchor_candidate":82,
  "held_source_venue_keys":5,
  "held_source_date_rows":22,
  "named_postcode_match_venue_keys":22,
  "same_effective_anchor_multi_alias_cases":1,
  "multiple_effective_anchor_ambiguous_venues":2,
  "no_suitable_venue_match":3,
  "historical_verified_timetable_collision_on_new_date":1,
  "new_master_venues":0,"new_public_mass_instances":0,
  "new_public_map_pins":0,"new_una_cum":0,
  "historical_mass_records_untouched":4681,
  "pilot_39_site_identities_untouched":39}
 (a.out_dir/"cl30_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 print(json.dumps({"status":"PASS",**summary},sort_keys=True))
 cx.close()

if __name__=="__main__":
 main()
