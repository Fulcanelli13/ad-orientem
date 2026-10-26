#!/usr/bin/env python3
"""CL8: auditable, non-promoting completeness ledger for the CL2–CL7 research master.

Run after rebuild-cl7-research-index.py. Reads frozen CL2 rows and additive CL3–CL7
evidence; creates *research-only* audit tables and CSV/JSON exports. Never edits
application datasets, canonical IDs, classifications or timetable source rows.
Python standard library only.
"""
import argparse
import csv
import json
from collections import Counter
from datetime import date
from pathlib import Path
import re
import sqlite3

ROOT = Path("data/directory/research")
LITERAL_1962 = re.compile(r"(?<!\d)1962(?!\d)")
UNKNOWN = {"", "UNKNOWN", "UNRESOLVED", "NOT_ESTABLISHED",
           "NOT_YET_DOCUMENTED", "UNASSESSED", "NO_DOCUMENTED_DECLARATION"}
RELEASE = "HOLD_NOT_PUBLIC"
FIELD_KEYS = {
    "site": ("physical_description", "street_precision", "site_source_url",
             "public_physical_pin"),
    "classification": ("organization_hint", "institution_relationship",
             "institution_evidence_url", "organizing_role", "lay_association_role",
             "rite_source_claim", "missal_original_literal", "missal_edition_accepted",
             "owner_missal_evidence_url", "una_cum", "public_liturgical_filter"),
    "mass": ("mass_time", "frequency", "rite_or_mass_type", "schedule_source_url",
             "schedule_check_date", "historical_schedule_status",
             "current_recurrence_approved"),
}
def present(value):
    return value is not None and str(value).strip().upper() not in UNKNOWN

def j(value):
    return json.loads(value)

def load_overlay(name):
    return j((ROOT / name / "overlay.json").read_text(encoding="utf-8"))

def write_csv(path, fields, records):
    with path.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(records)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", type=Path, required=True,
                    help="Existing research-only SQLite rebuilt from CL2–CL7")
    ap.add_argument("--output-dir", type=Path, required=True)
    a = ap.parse_args()
    a.output_dir.mkdir(parents=True, exist_ok=True)
    if not a.db.is_file():
        ap.error("No existing CL7 research SQLite; rebuild it first")
    db = sqlite3.connect(a.db)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for name, expected in (("canonical_site",2584),("classification_source",2715),
                           ("venue_source",2687),("mass_time",4681),
                           ("identity_exception",49),("cl7_description",13)):
        count = db.execute("SELECT COUNT(*) FROM " + name).fetchone()[0]
        if count != expected:
            raise ValueError(f"Unexpected {name} baseline: {count} != {expected}")
    if db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]:
        raise ValueError("CL2 research release invariant breached")
    if db.execute("SELECT COUNT(*) FROM venue_source WHERE joined_canonical_group_id IS NULL").fetchone()[0] != 5:
        raise ValueError("Five held CL2 conflicting source/group links changed")

    # CL3/4 are overlays validated by their own CI scripts but not materialised
    # in rebuild-cl7-research-index.py. Load their exact committed source JSON.
    overlays = (
        (3, load_overlay("cl3-reconciliation-20261026")["description_backfills"],
         "group_id", "description", "source_url", "precision"),
        (4, load_overlay("cl4-owner-screening-20261026")["address_backfills"],
         "group_id", "physical_description", "evidence_url", "precision"),
        (5, load_overlay("cl5-provisional-intake-20261026")["additional_address_backfills"],
         "historical_group_id", "description", "first_party_source_url", "geocode_precision"),
        (6, load_overlay("cl6-source-reconciliation-20261026")["location_backfills"],
         "historical_group_id", "physical_description", "evidence_url", "precision"),
        (7, load_overlay("cl7-final-description-screen-20261026")["description_backfills"],
         "historical_group_id", "physical_description", "source_url", "precision"),
    )
    expected_overlay_sizes = (23,27,5,9,13)
    physical_updates = {}
    for (batch, items, gid, desc, url, precision), expected in zip(overlays, expected_overlay_sizes):
        if len(items) != expected:
            raise ValueError(f"CL{batch} overlay size changed: {len(items)}")
        for item in items:
            key = item[gid]
            if key in physical_updates:
                raise ValueError(f"Overlapping original description backfill: {key}")
            physical_updates[key] = {
                "description": item[desc], "url": item.get(url) or "",
                "precision": item.get(precision) or "UNSPECIFIED",
                "batch": "CL" + str(batch),
            }
    fields = []
    def add(scope, identity, group_id, field, raw, evidence, url="", note=""):
        state = ("PRESENT" if present(raw) else
                 "NOT_ASSESSED" if evidence == "NOT_INDEPENDENTLY_ASSESSED" else
                 "NOT_APPLICABLE" if evidence in ("NO_RELEASE_APPROVAL",
                      "NO_SITE_CELEBRATION_RELEASE", "NO_CURRENT_TIMETABLE_RELEASE")
                 else "MISSING")
        fields.append((scope,identity,group_id,field,state,evidence,
                       str(raw) if raw is not None else "",url or "",note,RELEASE))
    site_gaps = []
    checked_site_ids = set()
    for s in db.execute("SELECT * FROM canonical_site ORDER BY group_id"):
        gid = s["group_id"]
        checked_site_ids.add(gid)
        can = j(s["canonical_json"])
        extra = physical_updates.get(gid)
        desc = extra["description"] if extra else s["physical_description"]
        url = extra["url"] if extra else (s["backfill_source"] or "")
        evidence = "RESEARCH_BACKFILL" if extra else (
            "CL2_BACKFILL" if s["backfill_tier"] else "ORIGINAL_SOURCE_TEXT")
        add("site",gid,gid,"physical_description",desc,evidence,url,
            extra["batch"] if extra else "")
        precision = extra["precision"] if extra else ""
        add("site",gid,gid,"street_precision",precision,
            "RESEARCH_PRECISION_LABEL" if extra else "NOT_INDEPENDENTLY_ASSESSED",url,
            "Precision is not an approved geocode")
        add("site",gid,gid,"site_source_url",can[9],"SOURCE_URL_RECORDED" if present(can[9]) else "NONE",
            can[9] or "")
        add("site",gid,gid,"public_physical_pin",None,"NO_RELEASE_APPROVAL")
        if not present(desc) or not present(precision):
            site_gaps.append({"group_id":gid,"anchor_id":s["effective_anchor_id"],
                "country":s["country"],"name":s["name"],
                "description":desc,"description_missing":int(not present(desc)),
                "precise_street_evidence_unestablished":int(not present(precision)),
                "precision":precision,"source_url":url or (can[9] or ""),
                "action":"RECOVER_PHYSICAL_DESCRIPTION" if not present(desc)
                    else "VERIFY_STREET_PRECISION_AND_BUILDING_ENTRANCE"})
    if len(checked_site_ids)!=2584 or len(physical_updates)!=77:
        raise ValueError("Physical site baseline or 77 overlay IDs changed")
    if not set(physical_updates).issubset(checked_site_ids):
        raise ValueError("Backfill references a noncanonical CL2 group")
    description_missing = sum(x["description_missing"] for x in site_gaps)
    if description_missing != 36:
        raise ValueError(f"Effective CL7 blank description count should be 36, got {description_missing}")

    institutional_queue = []
    classified = {}
    for c in db.execute("SELECT * FROM classification_source ORDER BY source_id"):
        values = j(c["source_json"])
        source_id, group_id = c["source_id"], c["group_id"]
        classified[source_id] = (values, c["join_state"])
        hint = values[5] if present(values[5]) and values[6] == "SOURCE_LABEL_ONLY" else None
        add("classification",source_id,group_id,"organization_hint",hint,
            "SOURCE_LABEL_ONLY" if hint else "NONE",values[14] or "",
            "Institutional affiliation does not establish celebrant or rite")
        relationship = values[19]
        maturity = values[18] or ""
        add("classification",source_id,group_id,"institution_relationship",relationship,
            "DIRECT_OWNER_PAGE_REVIEWED" if maturity == "DIRECT_OWNER_PAGE_REVIEWED"
                else "LINK_NOT_DIRECTLY_REVIEWED" if relationship else "NONE",
            values[16] or "")
        institutional_url = values[16]
        add("classification",source_id,group_id,"institution_evidence_url",institutional_url,
            maturity or "NONE",institutional_url or "")
        add("classification",source_id,group_id,"organizing_role",values[8],
            "ROLE_UNESTABLISHED")
        add("classification",source_id,group_id,"lay_association_role",values[7],
            "MENTION_ONLY_NOT_CONFIRMED" if present(values[7]) else "ROLE_UNESTABLISHED")
        add("classification",source_id,group_id,"rite_source_claim",values[9],
            "SOURCE_RITE_CLAIM_ONLY" if present(values[9]) else "NONE")
        add("classification",source_id,group_id,"missal_original_literal",values[11],
            "COLLECTED_LITERAL_NOT_ACCEPTED" if present(values[11]) else "NONE")
        accepted = values[23] if values[22] == "OWNER_1962_DIRECT_WITNESS_REVIEWED" else None
        add("classification",source_id,group_id,"missal_edition_accepted",accepted,
            "OWNER_WITNESS_ACCEPTED" if accepted else "NONE",values[21] or "")
        add("classification",source_id,group_id,"owner_missal_evidence_url",values[21],
            values[22] or "NONE",values[21] or "")
        add("classification",source_id,group_id,"una_cum",values[12],
            "CELEBRATION_EVIDENCE_NOT_ESTABLISHED")
        add("classification",source_id,group_id,"public_liturgical_filter",None,
            "NO_SITE_CELEBRATION_RELEASE")
        if institutional_url:
            institutional_queue.append({"source_id":source_id,"group_id":group_id,
                "name":values[3], "organization_hint":values[5],
                "institutional_url":institutional_url,"maturity":maturity,
                "priority":"REVIEW_URL" if maturity != "DIRECT_OWNER_PAGE_REVIEWED" else "REVIEWED",
                "existing_relationship":relationship or "",
                "scope":"INSTITUTION_ONLY_NOT_MISSAL_OR_UNA_CUM"})
    if len(classified)!=2715 or len(institutional_queue)!=200:
        raise ValueError("CL2 classification/institutional denominator changed")
    if sum(x["priority"]=="REVIEW_URL" for x in institutional_queue)!=195:
        raise ValueError("Expected 195 institutional URL reviews outstanding")

    # Preserve *all* explicit wording paths, including researcher notes.
    # A researcher-transcribed '1962' is a lead, not proof of the owner's words.
    reconciliation = []
    for m in db.execute("SELECT * FROM mass_time ORDER BY row_no"):
        values = j(m["original_json"])
        row_id = str(m["row_no"])
        gid = m["group_id"] or ""
        sid = m["source_id"]
        for field, idx in (("mass_time",7),("frequency",8),("rite_or_mass_type",9),
                           ("schedule_source_url",14),("schedule_check_date",18),
                           ("historical_schedule_status",19)):
            evidence = ("HISTORICAL_VERIFIED_LABEL_NOT_CURRENT" if field=="historical_schedule_status"
                        and values[idx]=="VERIFIED" else "RESEARCH_SOURCE_ROW")
            add("mass",row_id,gid,field,values[idx],evidence,
                values[14] or "","No current recurrence implied" if idx==19 else "")
        add("mass",row_id,gid,"current_recurrence_approved",None,
            "NO_CURRENT_TIMETABLE_RELEASE",values[14] or "")
        type_1962 = bool(LITERAL_1962.search(values[9] or ""))
        excerpt_1962 = bool(LITERAL_1962.search(values[16] or ""))
        note_1962 = any(LITERAL_1962.search(values[i] or "") for i in (10,21,23))
        john_xxiii = bool(re.search(r"Missal of St[.]? John XXIII",values[9] or "",re.I))
        if not (type_1962 or excerpt_1962 or note_1962 or john_xxiii):
            continue
        category = ("TYPE_LITERAL_1962" if type_1962 else
                    "TRANSCRIBED_EXCERPT_1962" if excerpt_1962 else
                    "RESEARCH_NOTE_1962" if note_1962 else "JOHN_XXIII_LABEL")
        found = classified.get(sid)
        join_state = found[1] if found else "NO_CLASSIFICATION_SOURCE"
        accepted = found is not None and found[0][23]=="1962" and found[0][22]=="OWNER_1962_DIRECT_WITNESS_REVIEWED"
        gate = "HOLD_IDENTITY_CONFLICT" if join_state not in ("JOINED_EXACT_SOURCE_AND_GROUP",) else "HOLD_SOURCE_SCOPE_REVIEW"
        reconciliation.append({"row_no":m["row_no"],"source_id":sid,"group_id":gid,
            "name":values[2],"wording_category":category,
            "mass_type":values[9] or "","evidence_excerpt":values[16] or "",
            "research_notes":values[23] or "","schedule_url":values[14] or "",
            "schedule_checked":values[18] or "","historical_status":values[19] or "",
            "classification_join":join_state,"existing_owner_accepted_1962":int(bool(accepted)),
            "new_owner_accepted_1962":0,"una_cum_established":0,
            "release_gate":gate})
    if len(fields) != 2584*4+2715*11+4681*7:
        raise ValueError("Unexpected per-field audit ledger size")
    if len(reconciliation) < 388:
        raise ValueError("Literal timetable evidence unexpectedly missing")

    with db:
        db.executescript("""
        DROP TABLE IF EXISTS cl_audit_field;
        DROP TABLE IF EXISTS cl_1962_reconciliation;
        CREATE TABLE cl_audit_field (
          scope TEXT NOT NULL,record_id TEXT NOT NULL,group_id TEXT,
          field_key TEXT NOT NULL,presence TEXT NOT NULL,evidence_state TEXT NOT NULL,
          raw_value TEXT NOT NULL,source_url TEXT NOT NULL,note TEXT NOT NULL,
          release_state TEXT NOT NULL CHECK(release_state='HOLD_NOT_PUBLIC'),
          PRIMARY KEY (scope,record_id,field_key));
        CREATE INDEX cl_audit_group_idx ON cl_audit_field(group_id);
        CREATE TABLE cl_1962_reconciliation (
          row_no INTEGER PRIMARY KEY,source_id TEXT NOT NULL,group_id TEXT,
          wording_category TEXT NOT NULL,join_state TEXT NOT NULL,
          owner_accepted_existing INTEGER NOT NULL CHECK(owner_accepted_existing IN (0,1)),
          newly_accepted INTEGER NOT NULL DEFAULT 0 CHECK(newly_accepted=0),
          publication_approved INTEGER NOT NULL DEFAULT 0 CHECK(publication_approved=0));
        """)
        db.executemany("INSERT INTO cl_audit_field VALUES (?,?,?,?,?,?,?,?,?,?)",fields)
        db.executemany("INSERT INTO cl_1962_reconciliation (row_no,source_id,group_id,wording_category,join_state,owner_accepted_existing) VALUES (?,?,?,?,?,?)",
            [(r["row_no"],r["source_id"],r["group_id"],r["wording_category"],
              r["classification_join"],r["existing_owner_accepted_1962"]) for r in reconciliation])
    counts = [dict(row) for row in db.execute("""
        SELECT scope,field_key,COUNT(*) AS denominator,
          SUM(presence='PRESENT') AS collected,SUM(presence='MISSING') AS missing,
          SUM(presence='NOT_ASSESSED') AS not_assessed,
          SUM(presence='NOT_APPLICABLE') AS not_applicable,
          SUM(evidence_state IN ('OWNER_WITNESS_ACCEPTED','DIRECT_OWNER_PAGE_REVIEWED',
              'OWNER_1962_DIRECT_WITNESS_REVIEWED')) AS direct_accepted,
          SUM(release_state!='HOLD_NOT_PUBLIC') AS released
        FROM cl_audit_field GROUP BY scope,field_key ORDER BY scope,field_key""")]
    per_type = dict(Counter(r["wording_category"] for r in reconciliation))
    metric = {r["scope"]+"."+r["field_key"]:r for r in counts}
    assert metric["classification.missal_edition_accepted"]["direct_accepted"]==3
    assert metric["classification.una_cum"]["collected"]==0
    assert metric["classification.organizing_role"]["collected"]==0
    assert metric["mass.historical_schedule_status"]["denominator"]==4681
    assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
    assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
    assert not db.execute("SELECT 1 FROM cl_audit_field WHERE release_state!='HOLD_NOT_PUBLIC'").fetchone()

    write_csv(a.output_dir/"field_metrics.csv",
              ["scope","field_key","denominator","collected","missing","not_assessed",
               "not_applicable","direct_accepted","released"],counts)
    write_csv(a.output_dir/"missal_1962_reconciliation.csv",
              ["row_no","source_id","group_id","name","wording_category","mass_type",
               "evidence_excerpt","research_notes","schedule_url","schedule_checked",
               "historical_status","classification_join","existing_owner_accepted_1962",
               "new_owner_accepted_1962","una_cum_established","release_gate"],reconciliation)
    write_csv(a.output_dir/"institutional_url_review_queue.csv",
              ["source_id","group_id","name","organization_hint","institutional_url",
               "maturity","priority","existing_relationship","scope"],institutional_queue)
    write_csv(a.output_dir/"physical_precision_queue.csv",
              ["group_id","anchor_id","country","name","description",
               "description_missing","precise_street_evidence_unestablished",
               "precision","source_url","action"],site_gaps)
    report = {
      "schema":"AO_CL_COMPLETENESS_AUDIT_V1",
      "snapshot_date":date.today().isoformat(),
      "input":"CL2–CL7 rebuilt research-only SQLite; original CL2 source shards unchanged",
      "denominators":{"historical_sites":2584,"provisional_anchors":2579,
          "source_classifications":2715,"mass_rows":4681},
      "original_CL2_description_blanks":113,
      "effective_CL7_description_blanks":description_missing,
      "backfills_CL3_CL7":len(physical_updates),
      "institutional_source_urls":len(institutional_queue),
      "institutional_urls_not_directly_reviewed":
          sum(r["priority"]=="REVIEW_URL" for r in institutional_queue),
      "timetable_reconciliation_candidates":len(reconciliation),
      "timetable_wording_breakdown":per_type,
      "distinct_candidate_group_ids":len({r["group_id"] for r in reconciliation}),
      "candidate_historical_verified_labels":sum(r["historical_status"]=="VERIFIED" for r in reconciliation),
      "original_historical_verified_timetable_labels":3347,
      "previously_reported_1962_candidates":396,
      "comparison_warning":"396 is a historical research count, not asserted identical to the explicit reproducible extraction here.",
      "new_missal_acceptances":0,"new_public_site_releases":0,
      "new_current_timetable_releases":0,
      "per_field":counts,
      "limits":["No automatic rite/edition inference from institutional name.",
          "No Una Cum from venue-level affiliation.",
          "Research timetable labels VERIFIED do not authorize current recurrence.",
          "Unassessed original addresses are not certified street-level locations.",
          "CL3–CL7 overlay descriptions remain research-only."]
    }
    (a.output_dir/"cl_completeness_summary.json").write_text(
        json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    db.close()
    print(json.dumps({"status":"PASS","field_rows":len(fields),
        "effective_blank_descriptions":description_missing,
        "institutional_urls_to_review":195,
        "1962_wording_candidates":len(reconciliation),
        "breakdown":per_type,"new_public_approvals":0},sort_keys=True))

if __name__ == "__main__":
    main()
