#!/usr/bin/env python3
"""Assert frozen CL2→CL6 directory identities, evidence counts, and release holds."""
import hashlib
import json
from pathlib import Path

ROOT = Path("data/directory/research")
def load(path):
    return json.loads(path.read_text(encoding="utf-8"))
def require(ok, message):
    if not ok:
        raise AssertionError(message)

def main():
    cl2 = ROOT / "cl2-unified-20261026"
    manifest = load(cl2 / "manifest.json")
    cl3 = load(ROOT / "cl3-reconciliation-20261026/overlay.json")
    cl4 = load(ROOT / "cl4-owner-screening-20261026/overlay.json")
    cl5 = load(ROOT / "cl5-provisional-intake-20261026/overlay.json")
    cl6 = load(ROOT / "cl6-source-reconciliation-20261026/overlay.json")
    require(cl6["schema"] == "AO_CL6_CONTINUATION_RESEARCH_OVERLAY_V1", "Unexpected CL6 version")
    require(cl6["extends"] == cl5["schema"], "Baseline pointer changed")
    require(cl6["release_state"] == "NO_PUBLIC_CHANGES_NO_CANONICAL_ADMISSION", "Release gate violated")

    rows=[]
    for part in manifest["shards"]["site"]:
        raw=(cl2/part["path"]).read_bytes()
        require(hashlib.sha256(raw).hexdigest() == part["sha256"], "Original CL2 site SHA mismatch")
        rows.extend(json.loads(raw)["records"])
    site_ids = {x["group_id"] for x in rows}
    site_by_id = {x["group_id"]: x for x in rows}
    require(len(rows) == len(site_ids) == 2584, "CL2 site population changed")
    require(len({r["effective_anchor_id"] for r in rows}) == 2579, "CL2 physical anchors changed")

    cl4_sources = {x["group_id"]: x for x in cl4["remaining_identity_exception_queue"]
                   if x["origin"]=="B92_CLASSIFICATION_MASTER_ONLY"}
    require(len(cl4_sources) == 34, "CL4 original classified-only population changed")
    cl5_ids={x["historical_group_id"] for x in cl5["provisional_physical_intake"]}
    require(len(cl5_ids)==17, "CL5 provisional intake population changed")
    still_open=set(cl4_sources)-cl5_ids
    require(len(still_open)==17, "Expected 17 remaining unprocessed B92 source groups")
    review=cl6["classification_only_source_review"]
    require(len(review)==17 and {r["frozen_group_id"] for r in review}==still_open, "CL6 source review dropped/added cases")
    require(len({r["exception_key"] for r in review})==17, "Duplicate exception")
    evid=[x for x in review if x["additional_evidence_url"]]
    held=[x for x in review if not x["additional_evidence_url"]]
    require(len(evid)==7 and len(held)==10, "CL6 extra evidence count inconsistent")
    for r in review:
        require(r["frozen_group_id"] not in site_ids, "B92 provisional review is already canonical")
        prev=cl4_sources[r["frozen_group_id"]]
        require((r["frozen_source_id"],r["country"],r["name"]) ==
                (prev["source_id"],prev["country"],prev["site_name"]), "Original ID/name change")
        require(r["reconciled_to_canonical"] is False and
                r["new_site_admitted"] is False and
                r["new_current_schedule_approved"] is False and
                r["public_place_approved"] is False,"Unsourced public promotion")
        if r["additional_evidence_url"]:
            require(r["additional_evidence_url"].startswith("https://"),"Malformed source URL")
            require(bool(r["source_type"]) and bool(r["evidence_scope"]), "No evidence scope")
        else:
            require(r["disposition"]=="HOLD_SOURCE_ONLY_AWAITING_INDEPENDENT_BUILDING_EVIDENCE",
                    "Unverified source promoted")

    cl4_blank={r["group_id"] for r in cl4["remaining_description_queue"]
               if r["disposition"]=="HOLD_ADDRESS_NEEDS_EVIDENCE"}
    cl5_add={r["historical_group_id"] for r in cl5["additional_address_backfills"]}
    remaining=cl4_blank-cl5_add
    require(len(cl4_blank)==63 and len(cl5_add)==5 and len(remaining)==58, "CL5 gap baseline changed")
    backfills=cl6["location_backfills"]
    add_ids={x["historical_group_id"] for x in backfills}
    require(len(backfills)==len(add_ids)==9,"CL6 backfill count/duplicates")
    require(add_ids <= remaining,"CL6 overwrote existing physical description")
    for row in backfills:
        site=site_by_id[row["historical_group_id"]]
        require((row["country"],row["site_name"],row["frozen_anchor_id"]) ==
                (site["canonical"][1],site["canonical"][2],site["effective_anchor_id"]),
                "CL6 backfill original identity changed")
        require(not str(site["canonical"][3]).strip(), "Overwriting CL2 original description")
        require(row["evidence_url"].startswith("https://"), "Missing source URL")
        require(row["physical_description"].strip() and row["precision"] and row["site_type"],"Missing physical description metadata")
        require(not row["exact_pin_approved"] and not row["public_mass_site_approved"] and
                not row["any_new_recurring_mass_approved"],"Unjustified public pin or Mass")
    require(len(remaining-add_ids)==49,"CL6 49 blank remainder mismatch")

    queue=cl6["identity_queue"]
    old={x["exception_key"] for x in cl5["identity_exception_disposition"]}
    require(len(queue)==40 and len({r["exception_key"] for r in queue})==40
            and {r["exception_key"] for r in queue}==old,"Identity queue does not match CL5")
    require(all(r["status"]=="OPEN_RESEARCH_ONLY" and r["canonical_join_approved"] is False for r in queue),
            "An identity exception closed without canonical reconciliation")
    protections=cl6["exception_safeguards"]
    require(len(protections)==6 and len({x["code"] for x in protections})==6,"Safeguards lost")
    require("CL5_KETY_STREET_NUMBER_CONFLICT" in {x["code"] for x in protections},"Kety address conflict lost")
    require("FSSP_RESIDENCE_NOT_MASS_CHURCH" in {x["code"] for x in protections},"Residence distinction lost")
    require(cl6["summary"]=={
      "classification_only_cases_outstanding_from_CL5":17,
      "classification_only_cases_evidence_added":7,
      "classification_only_cases_still_without_independent_additional_corrob":10,
      "provisional_site_leads_from_CL5":17,
      "provisional_site_leads_with_CL6_additional_evidence":7,
      "identity_exception_flags_still_open":40,
      "cl5_blank_descriptions":58,"cl6_new_location_backfills":9,
      "descriptions_still_blank":49,"original_806_gaps_documented_cumulative":757,
      "public_sites_approved":0,"current_mass_schedules_approved":0
    },"Expected counts changed")
    print("CL6 PASS: 17/17 remaining classification-only cases screened; 7 evidence updates, 10 held")
    print("CL6 PASS: 9 uniquely sourced descriptions, 58 -> 49 blanks; 757/806 original blanks documented")
    print("CL6 PASS: 40 lineage flags remain open; six anomaly safeguards held; no public releases")

if __name__=="__main__": main()
