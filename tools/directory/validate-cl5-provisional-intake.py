#!/usr/bin/env python3
"""Validate additive CL5 evidence against the immutable CL2/CL3/CL4 research masters."""
import hashlib
import json
from pathlib import Path

ROOT=Path("data/directory/research")
def load(p): return json.loads(p.read_text(encoding="utf-8"))
def req(ok,msg):
    if not ok: raise AssertionError(msg)

def main():
    cl2=ROOT/"cl2-unified-20261026"
    manifest=load(cl2/"manifest.json")
    cl3=load(ROOT/"cl3-reconciliation-20261026/overlay.json")
    cl4=load(ROOT/"cl4-owner-screening-20261026/overlay.json")
    cl5=load(ROOT/"cl5-provisional-intake-20261026/overlay.json")
    req(cl5["status"]=="RESEARCH_ONLY_ADDITIVE_NOT_CANONICAL_NO_PUBLIC_IMPORT","CL5 release violation")
    req(cl5["schema"]=="AO_CL5_PROVISIONAL_PHYSICAL_INTAKE_V1","CL5 schema changed")
    site_rows=[]
    for part in manifest["shards"]["site"]:
        p=cl2/part["path"]
        req(hashlib.sha256(p.read_bytes()).hexdigest()==part["sha256"],"CL2 shard tampered "+part["path"])
        site_rows.extend(load(p)["records"])
    site_map={row["group_id"]:row for row in site_rows}
    req(len(site_rows)==len(site_map)==2584,"Frozen canonical population changed")
    req(len(set(x["effective_anchor_id"] for x in site_rows))==2579,"Distinct physical anchors changed")
    orphan_rows=load(cl2/"classification_orphan-01-of-01.json")["records"]
    orphan_ids={r["group_id"]:r["source_id"] for r in orphan_rows}
    req(len(orphan_rows)==36,"Original classification-only count changed")
    issue_rows=load(cl2/"identity_issue-01-of-01.json")["records"]
    req(len(issue_rows)==49,"Original identity exceptions changed")
    old_cl4={r["exception_key"]:r for r in cl4["remaining_identity_exception_queue"]}
    req(len(old_cl4)==40,"Original CL4 exceptions changed")
    norm=lambda s: "".join(x for x in str(s or "").casefold() if x.isalnum())
    leads=cl5["provisional_physical_intake"]
    req(len(leads)==17 and len({r["historical_group_id"] for r in leads})==17,"Physical lead count/duplicate")
    for r in leads:
        group=r["historical_group_id"]
        req(group not in site_map and group in orphan_ids,"Provisional lead not an orphan")
        req(r["frozen_source_id"]==orphan_ids[group],"Original source ID changed")
        req(r["country"]==old_cl4["GROUP:B92_CLASSIFICATION_MASTER_ONLY:"+group]["country"],"Country changed")
        req(r["source_url"].startswith("https://"),"No browsable source")
        req(r["identity_disposition"]=="PROVISIONAL_PHYSICAL_RESEARCH_INTAKE_NOT_CANONICAL","Wrong admission type")
        req(r["candidate_counted_in_cl2_physical_sites"] is False,"Candidate disguised as canonical")
        req(r["verified_current_schedule"] is False and r["public_map_admitted"] is False and r["una_cum_established"] is False,"Unjustified release")
        addr=norm(r["physical_description"].split(";")[0])
        req(len(addr)>9,"Address too nonspecific for intake")
        matches=[s["group_id"] for s in site_rows if s["canonical"][1]==r["country"] and
                 norm(s["canonical"][3])==addr]
        req(not matches and r["exact_existing_description_collision_count"]==0,"Existing CL2 address collision")

    addr=cl5["additional_address_backfills"]
    old_blanks={r["group_id"] for r in cl4["remaining_description_queue"]
                if r["disposition"]=="HOLD_ADDRESS_NEEDS_EVIDENCE"}
    req(len(old_blanks)==63,"CL4 blank count changed")
    req(len(addr)==5 and len({a["historical_group_id"] for a in addr})==5,"CL5 address count/duplicate")
    for r in addr:
        req(r["historical_group_id"] in old_blanks,"Overwrite CL2/CL3/CL4 description")
        req(r["country"]==site_map[r["historical_group_id"]]["canonical"][1],"Address country mismatch")
        req(r["site_name"]==site_map[r["historical_group_id"]]["canonical"][2],"Address site mismatch")
        req(r["first_party_source_url"].startswith("https://"),"Missing address provenance")
        req(r["public_map_approved"] is False and r["current_latin_mass_verification"]=="NOT_ASSERTED_BY_ADDRESS_BACKFILL","Unsafe backfill")
    req(len(old_blanks-{r["historical_group_id"] for r in addr})==58,"Remaining description count changed")

    inst=cl5["institutional_classification_evidence"]
    req(len(inst)==4 and len({x["group_id"] for x in inst})==4,"Institutional count/duplicate")
    for x in inst:
        req(x["group_id"] in site_map,"Institutional group is not canonical")
        key="GROUP:B98_LOCATION_MASTER_ONLY:"+x["group_id"]
        req(key in old_cl4,"Not originally a location-only missing classification")
        req(x["url"].startswith("https://"),"No institutional source")
        req(x["source_type"].endswith("FIRST_PARTY"),"Not first party")
        req(x["organization_role"] and x["scope"],"Evidence scope missing")
    trail=cl5["identity_exception_disposition"]
    req(len(trail)==40 and len({x["exception_key"] for x in trail})==40,"Exception trail incomplete")
    req({x["exception_key"] for x in trail}==set(old_cl4),"Exception keys changed")
    req(all(x["still_open"] and x["admitted_to_original_CL2"] is False for x in trail),"Frozen identity closed")
    req(sum(x["classification_status"]=="PROVISIONAL_BUILDING_INTAKE_SOURCE_CONFIRMED" for x in trail)==17,"Intake trail mismatch")
    req(sum(x["classification_status"]=="FIRST_PARTY_INSTITUTIONAL_EVIDENCE_CAPTURED_NO_CL2_JOIN" for x in trail)==4,"Institution trail mismatch")
    req(cl5["summary"]=={
      "classification_only_open_CL4":34,"provisional_corroborated_new_physical_site_leads":17,
      "classification_only_still_without_provisional_evidence":17,
      "location_only_CL4":6,"institutional_relationships_documented":4,
      "location_only_without_firstparty_institutional_evidence":2,
      "total_original_identity_exception_flags_remaining_until_canonical_merge":40,
      "original_description_gaps_CL4":63,"new_firstparty_backfills":5,
      "description_gaps_CL5":58,"new_public_pins":0,"new_current_mass_schedule_approvals":0
    },"CL5 summary/release mismatch")
    print("CL5 PASS: 17 first-party/local-organizer corroborated physical research leads absent from frozen CL2 IDs and exact-address matches")
    print("CL5 PASS: 4 source-scoped institutional facts, 5 new first-party Canada addresses (63 -> 58 blanks)")
    print("CL5 PASS: all 40 historical identity flags stay open pending canonical source integration; zero public promotions")

if __name__=="__main__": main()
