#!/usr/bin/env python3
"""CL15: reproducible recovery triage of ALL 197 remaining 1962 candidate holds.

Evidence collection, liturgical-book acceptance, current operational recurrence,
physical identity and publication are separate gates. This appends research
tables ONLY and never promotes a source claim or publication flag.
"""
import argparse
import csv
import json
import sqlite3
from pathlib import Path
from collections import Counter,defaultdict
from urllib.parse import urlparse

SUPPLEMENT=Path("data/directory/research/cl15-1962-recovery-triage-20261026/source-leads.json")
SOURCE_ANGERS="https://cathedralestmauricenotredame.diocese49.org/la-paroisse/horaires-a-remttre-apres-ete/"
SOURCE_FSSP="https://petrusbruderschaft.de/pages/wo-wir-sind/deutschland/messorte.php"
FIELDS="row_no,source_id,group_id,source_url,phase,primary_blocker,recovery_lane,next_proof_required,decision_confidence,owner_source_access,priority_tier,cohort_reason,all_flags,exception_observation,source_type,original_day,original_time,original_venue,historical_status,original_research_label,liturgical_book_accepted,current_recurrence_approved,physical_identity_approved,una_cum_approved,public_release"
ALLOWED_LANES={
 "A_RETRIEVE_PRIMARY_PAGE_OR_BULLETIN",
 "B_RECONCILE_TIME_OR_WEEKDAY",
 "C_RECONCILE_MIXED_RITE_OR_EDITION",
 "D_RECONCILE_SITE_OR_PERMISSION",
 "E_OBTAIN_EXPLICIT_OWNER_BOOK_STATEMENT",
 "F_REPLACE_SECONDARY_OR_AGGREGATOR_EVIDENCE",
}
EVIDENCE_ONLY_FLAGS=("new_cl2_owner_classification","current_recurrence_approved","physical_identity_approved","una_cum_approved","public_release")
def emit_csv(path,records):
    assert records
    with path.open("w",encoding="utf-8",newline="") as out:
        w=csv.DictWriter(out,fieldnames=FIELDS.split(",") if "197_" in path.name else list(records[0]),extrasaction="ignore")
        w.writeheader();w.writerows(records)

def triage(row,source,lead):
    phase=row["phase"]
    klass=row["prior_decision"]
    u=row["source_url"]
    data=(klass+" "+row["original_research_label"]+" "+row["prior_observation"]).lower()
    flags=[]
    access="REVIEWED_OR_PRIOR_SCREENED"
    if u==SOURCE_ANGERS:
        lane="A_RETRIEVE_PRIMARY_PAGE_OR_BULLETIN"
        proof="Direct retrievable owner parish bulletin/timetable identifying each of eight specific 1962/JXXIII day/time slots; confirm whether Sunday 09:00 is instead current Missal."
        flags=["OWNER_PAGE_403","SECONDARY_DIOCESAN_DIRECTORY_1962_SUNDAY_1030_ONLY","OTHER_SLOTS_UNPROVEN"]
        access="OWNER_DIRECT_403_SECONDARY_DIOCESAN_DIRECTORY_AVAILABLE"
    elif phase=="CL11" and ("403" in klass or "404" in klass):
        lane="A_RETRIEVE_PRIMARY_PAGE_OR_BULLETIN"
        proof="Working replacement official source or directly readable diocesan bulletin with exact Missal-book statement for the frozen venue/day/time."
        access="OWNER_PRIMARY_LINK_UNAVAILABLE"
        flags=["ORIGINAL_LINK_403_OR_404"]
    elif phase=="CL12" and klass=="HOLD_LINK_NOT_RETRIEVABLE":
        lane="A_RETRIEVE_PRIMARY_PAGE_OR_BULLETIN"
        proof="Find independent current official venue or diocesan Mass programme and verify the exact site and book; do not rely on archived Ad Orientem link."
        access="ORIGINAL_SOURCE_NOT_RETRIEVABLE"
        flags=["LINK_INACCESSIBLE","AGGREGATOR_OR_LAY_EVIDENCE"]
    elif phase=="CL10":
        lane="B_RECONCILE_TIME_OR_WEEKDAY"
        proof="Find readable first-party Monday–Saturday schedule at St Mary Kalamazoo confirming each weekday individually, not compact M S a shorthand."
        flags=["WEEKDAY_SHORTHAND_AMBIGUOUS","SUNDAY_SLOTS_ALREADY_ACCEPTED"]
    elif phase=="CL12" and klass=="HOLD_TIME_MISMATCH":
        lane="B_RECONCILE_TIME_OR_WEEKDAY"
        proof="Compare frozen Sunday 19:00 with dated diocesan 17:00; preserve historic row, record effective date and obtain owner confirmation of present programme."
        flags=["SUNDAY_1900_VS_1700","EDITION_ALREADY_WITNESSED_SLOT_NOT"]
    elif u=="https://www.ololparish.org/mass-times/":
        lane="D_RECONCILE_SITE_OR_PERMISSION"
        proof="Current Bishop/parish document explicitly applying 1962 programme to present Park Hills site and exact 10 times, distinguishing temporary St Ann Mission 2024."
        flags=["2024_DIFFERENT_TEMPORARY_MASS_SITE","CURRENT_LOCATION_OWNER_SCOPE_MISMATCH"]
    elif u in ("https://www.latinmassarlington.org/find-tlm/parishes",
                 "https://stjohnbeloved.latinmassarlington.org/"):
        lane="D_RECONCILE_SITE_OR_PERMISSION"
        proof="Current diocesan/parish primary authorization and 1962-book coverage per church/time; validate summer 2026 extension and ordinary-form substitutions."
        flags=["LAY_DIRECTORY_NOT_DIOCESAN_OWNER","INDULT_SCOPE_DATE_RECHECK","LATIN_ORDINARY_FORM_SUBSTITUTIONS"]
    elif u=="https://www.fsspniagara.com/":
        lane="D_RECONCILE_SITE_OR_PERMISSION"
        proof="Post-building-work current official 2026 timetable, exact physical chapel, and first-party 1962 book scope for every time."
        flags=["2026_BUILDING_WORKS","FSSP_AFFILIATION_NOT_SLOT_BOOK_PROOF"]
    elif u in ("https://www.communicantes.fr/horairescomplets.html",
                 "https://oratory-toronto.org/holy-family-parish/",
                 "https://www.diocesi.brescia.it/orari-s-messe-cattedrale/",
                 "https://www.diocesi.trieste.it/orari-sante-messe/"):
        lane="C_RECONCILE_MIXED_RITE_OR_EDITION"
        proof="Direct time/celebrant or institution source specifying exact 1962 Roman Missal, or explicit alternate Lyonese / 2002 / 1970 edition, and effective monthly or archdiocesan-feast exceptions."
        flags=["LATIN_OR_VETUS_ORDO_NOT_EXACT_MISSAL","MIXED_RITES_OR_DATE_EXCEPTIONS"]
        if "communicantes.fr" in u:flags+=["SUNDAY_0830_LYONESE_SEPARATE","ARCHDIOCESAN_FEAST_LYONESE","SCHEDULE_VERSION_2017"]
        if "oratory-toronto" in u:flags+=["SUNDAY_LATIN_NOVUS_ORDO_ONCE_MONTHLY"]
        if "brescia" in u:flags+=["CATHEDRAL_VATICAN_II_LATIN_SEPARATE_FROM_SAN_ZENO"]
    elif phase=="CL12" and ("AGGREGATOR" in klass or u.startswith("https://adorientem.church/")):
        lane="F_REPLACE_SECONDARY_OR_AGGREGATOR_EVIDENCE"
        proof="Independent parish or diocesan primary witness for actual physical place, specific book and celebration, not app self-reference."
        flags=["SECONDARY_APP_CANNOT_SELF_VALIDATE"]
    elif phase=="CL12" and ("saintjohn.church" in u or "stmary" in u):
        lane="E_OBTAIN_EXPLICIT_OWNER_BOOK_STATEMENT"
        proof="Current official or diocesan programme specifically naming the 1962 Missal for the exact historical row."
        flags=["FIRST_PASS_ONLY_NO_ROW_BOOK_PROOF"]
    else:
        lane="E_OBTAIN_EXPLICIT_OWNER_BOOK_STATEMENT"
        proof="Owner, diocese or directly responsible organizer states literal Missal edition (1962/John XXIII), attaches it to this exact worship site and Mass day/time and preserves exceptions."
        flags=["LATIN_TLM_EF_OR_VETUS_ORDO_UNSPECIFIED_EDITION"]
        if phase=="CL12": flags+=["SINGLETON_ONLY_FIRST_PASS_SCREEN"]
        if u=="https://www.stmarynorwalk.net/liturgy/": flags+=["HISTORICAL_2013_OWNER_1962_BUT_CURRENT_ORDINARY_FORM_MIX","THURSDAY_SCHOOL_TERM_EXCEPTION"]
        if u=="https://latinmasspensacola.org/": flags+=["THIRD_PARTY_1962_DESCRIPTION_NO_CURRENT_DIRECT_OWNER_CERTIFICATION","THIRD_PARTY_TIME_VARIATIONS"]
        if "preconciliar" in data: flags+=["PRECONCILIAR_NOT_PRECISE_BOOK_YEAR"]
    if lead is not None:
        assert u in {SOURCE_ANGERS, "https://latinmasspensacola.org/", "https://www.stmarynorwalk.net/liturgy/"}
        assert lead["source_url"]==u and lead["approved_slot_evidence"]==0
    # Risk-adjusted priority is a *research queue rank*, not probability of approval.
    priority=1 if lane in ("A_RETRIEVE_PRIMARY_PAGE_OR_BULLETIN","B_RECONCILE_TIME_OR_WEEKDAY","D_RECONCILE_SITE_OR_PERMISSION") else (
             2 if lane=="C_RECONCILE_MIXED_RITE_OR_EDITION" else 3)
    if lane=="F_REPLACE_SECONDARY_OR_AGGREGATOR_EVIDENCE": priority=4
    confidence="HOLD_REQUIRES_SPECIFIC_PRIMARY_EVIDENCE"
    if lane=="A_RETRIEVE_PRIMARY_PAGE_OR_BULLETIN" and u==SOURCE_ANGERS:
        confidence="PARTIAL_SECONDARY_DIOCESAN_SOURCE_NOT_ALL_SLOTS"
    return lane,priority,proof,flags,access,confidence

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--out-dir",type=Path,required=True)
    args=p.parse_args()
    args.out_dir.mkdir(parents=True,exist_ok=True)
    supplement=json.loads(SUPPLEMENT.read_text(encoding="utf-8"))
    assert supplement["schema"]=="AO_CL15_ADDITIONAL_PRIMARY_RESEARCH_LEADS_V1"
    lead_by_url={r["source_url"]:r for r in supplement["leads"]}
    assert len(lead_by_url)==len(supplement["leads"])==3
    db=sqlite3.connect(args.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    expected={"mass_time":4681,"cl9_mass_candidate":432,"cl10_1962_mass_evidence":85,
              "cl11_mass_source_scope":118,"cl12_singleton_evidence":75,
              "cl13_remaining_1962_evidence":154,"cl14_fssp_direct_slot":73}
    for table,n in expected.items():
        assert db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]==n,table
    queries=[
      ("CL10","SELECT row_no,original_source_id AS source_id,group_id,owner_url AS source_url,adjudication AS prior_decision FROM cl10_1962_mass_evidence WHERE accepted=0"),
      ("CL11","SELECT row_no,original_source_id AS source_id,original_group_id AS group_id,url AS source_url,review_class AS prior_decision FROM cl11_mass_source_scope WHERE book_evidence_accepted=0"),
      ("CL12","SELECT row_no,source_id,group_id,source_url,decision AS prior_decision FROM cl12_singleton_evidence WHERE evidence_1962_accepted=0"),
      ("CL13","SELECT row_no,source_id,group_id,source_url,adjudication AS prior_decision FROM cl13_remaining_1962_evidence WHERE evidence_1962_slot_accepted=0 AND row_no NOT IN (SELECT row_no FROM cl14_fssp_direct_slot)")
    ]
    original_src={
     "CL10":("cl10_1962_mass_evidence","reason_if_held"),
     "CL11":("cl11_mass_source_scope","owner_claim_observation"),
     "CL12":("cl12_singleton_evidence","reason"),
     "CL13":("cl13_remaining_1962_evidence","observation"),
    }
    rows=[]
    for phase,sql in queries:
        candidates=db.execute(sql).fetchall()
        for record in candidates:
            row=dict(record);row["phase"]=phase
            id=int(row["row_no"])
            orig=db.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=?",(id,)).fetchone()
            assert orig is not None
            m=json.loads(orig["original_json"])
            assert len(m)==28
            assert m[1]==row["source_id"] and orig["group_id"]==row["group_id"]
            assert m[14]==row["source_url"]
            table,_field=original_src[phase]
            stored=db.execute(f"SELECT evidence_json FROM {table} WHERE row_no=?",(id,)).fetchone()
            prior_doc=json.loads(stored["evidence_json"])
            reason=prior_doc.get("reason_if_held") or prior_doc.get("owner_claim_observation") or prior_doc.get("reason") or prior_doc.get("observation") or ""
            row["original_research_label"]=m[9]
            row["prior_observation"]=reason
            lane,rank,proof,flags,access,conf=triage(row,orig,lead_by_url.get(row["source_url"]))
            assert lane in ALLOWED_LANES
            assert len(proof)>30
            rows.append({
              "row_no":id,"source_id":row["source_id"],"group_id":row["group_id"],
              "source_url":row["source_url"],"phase":phase,
              "primary_blocker":lane.split("_",1)[1],
              "recovery_lane":lane,"next_proof_required":proof,
              "decision_confidence":conf,"owner_source_access":access,"priority_tier":rank,
              "cohort_reason":row["prior_decision"],"all_flags":";".join(flags),
              "exception_observation":reason,"source_type":urlparse(row["source_url"]).hostname or "",
              "original_day":m[6],"original_time":m[7],"original_venue":m[2],
              "historical_status":m[19],"original_research_label":m[9],
              "liturgical_book_accepted":0,"current_recurrence_approved":0,
              "physical_identity_approved":0,"una_cum_approved":0,"public_release":0,
            })
    assert len(rows)==197
    assert len({r["row_no"] for r in rows})==197
    counts=Counter(r["phase"] for r in rows)
    assert counts==Counter({"CL10":6,"CL11":76,"CL12":63,"CL13":52}),counts
    assert len({r["source_url"] for r in rows})==94
    for r in rows:
        assert db.execute("SELECT COUNT(*) FROM cl14_fssp_direct_slot WHERE row_no=?",(r["row_no"],)).fetchone()[0]==0
    assert {r["row_no"] for r in rows if r["source_url"]==SOURCE_ANGERS}==set(range(4038,4046))
    assert len([r for r in rows if r["recovery_lane"]=="B_RECONCILE_TIME_OR_WEEKDAY"])==7
    assert len([r for r in rows if r["source_url"]=="https://www.ololparish.org/mass-times/"])==10
    assert len([r for r in rows if r["recovery_lane"]=="C_RECONCILE_MIXED_RITE_OR_EDITION"])==18
    assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3

    grouped=defaultdict(list)
    for r in rows:grouped[r["source_url"]].append(r)
    url_report=[]
    for url,part in grouped.items():
        lanes=Counter(x["recovery_lane"] for x in part)
        assert len(lanes)==1,(url,lanes)
        ids=sorted(r["row_no"] for r in part)
        url_report.append({
          "source_url":url,"domain":urlparse(url).netloc,
          "blocked_historical_rows":len(part),
          "frozen_group_ids":len({r["group_id"] for r in part}),
          "group_id_values":";".join(sorted({r["group_id"] for r in part})),
          "row_ids":";".join(str(i) for i in ids),
          "recovery_lane":part[0]["recovery_lane"],
          "priority_tier":part[0]["priority_tier"],
          "required_evidence":part[0]["next_proof_required"],
          "access_evidence":part[0]["owner_source_access"],
          "flags":part[0]["all_flags"],
          "supplemental_lead_url":lead_by_url.get(url,{}).get("new_url",""),
          "source_claim_accepted":0,"public_release":0,
        })
    url_report.sort(key=lambda x:(x["priority_tier"],-x["blocked_historical_rows"],x["source_url"]))
    assert len(url_report)==94
    assert sum(x["blocked_historical_rows"] for x in url_report)==197
    priority_one=[x for x in url_report if x["priority_tier"]==1]
    assert priority_one
    rows.sort(key=lambda x:x["row_no"])
    with db:
        db.executescript("""
        CREATE TABLE cl15_recovery_source_queue (
          source_url TEXT PRIMARY KEY,recovery_lane TEXT NOT NULL,
          priority_tier INTEGER NOT NULL CHECK(priority_tier BETWEEN 1 AND 4),
          held_source_rows INTEGER NOT NULL, evidence_json TEXT NOT NULL,
          new_public_approval INTEGER NOT NULL DEFAULT 0 CHECK(new_public_approval=0));
        CREATE TABLE cl15_1962_hold_triage (
          row_no INTEGER PRIMARY KEY,source_id TEXT NOT NULL,
          group_id TEXT NOT NULL,source_url TEXT NOT NULL,
          recovery_lane TEXT NOT NULL,priority_tier INTEGER NOT NULL CHECK(priority_tier BETWEEN 1 AND 4),
          triage_json TEXT NOT NULL,
          book_1962_accepted INTEGER NOT NULL DEFAULT 0 CHECK(book_1962_accepted=0),
          recurrence_approved INTEGER NOT NULL DEFAULT 0 CHECK(recurrence_approved=0),
          physical_site_approved INTEGER NOT NULL DEFAULT 0 CHECK(physical_site_approved=0),
          una_cum_approved INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_approved=0),
          public_released INTEGER NOT NULL DEFAULT 0 CHECK(public_released=0),
          FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
          FOREIGN KEY(source_url) REFERENCES cl15_recovery_source_queue(source_url));
        CREATE INDEX cl15_triage_lane ON cl15_1962_hold_triage(recovery_lane,priority_tier);
        CREATE INDEX cl15_triage_group ON cl15_1962_hold_triage(group_id);
        """)
        for r in url_report:
            db.execute("INSERT INTO cl15_recovery_source_queue(source_url,recovery_lane,priority_tier,held_source_rows,evidence_json) VALUES (?,?,?,?,?)",(
               r["source_url"],r["recovery_lane"],r["priority_tier"],r["blocked_historical_rows"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
        for r in rows:
            db.execute("INSERT INTO cl15_1962_hold_triage(row_no,source_id,group_id,source_url,recovery_lane,priority_tier,triage_json) VALUES (?,?,?,?,?,?,?)",(
                r["row_no"],r["source_id"],r["group_id"],r["source_url"],r["recovery_lane"],r["priority_tier"],json.dumps(r,ensure_ascii=False,sort_keys=True)))
        assert db.execute("SELECT COUNT(*) FROM cl15_1962_hold_triage").fetchone()[0]==197
        assert db.execute("SELECT COUNT(*) FROM cl15_recovery_source_queue").fetchone()[0]==94
        assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
        assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert db.execute("SELECT COUNT(*) FROM cl15_1962_hold_triage WHERE book_1962_accepted=1 OR recurrence_approved=1 OR physical_site_approved=1 OR una_cum_approved=1 OR public_released=1").fetchone()[0]==0
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not db.execute("PRAGMA foreign_key_check").fetchall()

    emit_csv(args.out_dir/"cl15_197_held_rows.csv",rows)
    emit_csv(args.out_dir/"cl15_94_priority_source_queues.csv",url_report)
    emit_csv(args.out_dir/"cl15_priority_1_first_party_recovery.csv",priority_one)
    lane_totals=Counter(r["recovery_lane"] for r in rows)
    report={
      "schema":"AO_CL15_197_HOLDS_COMPLETE_RECOVERY_TRIAGE_V1",
      "date":"2026-10-26",
      "frozen_1962_wording_candidates":432,
      "source_scoped_book_evidence_accepted_previously":235,
      "unresolved_claims_triaged":197,
      "distinct_source_urls_for_unresolved_claims":94,
      "phase_unresolved_counts":dict(counts),
      "primary_recovery_lane_counts":dict(sorted(lane_totals.items())),
      "priority_1_urls":len(priority_one),
      "priority_1_rows":sum(r["blocked_historical_rows"] for r in priority_one),
      "source_url_decisions_recovered_from_cl14":73,
      "new_book_accepted":0,"new_current_recurrence_approvals":0,
      "new_physical_site_approvals":0,"new_una_cum":0,"new_public_releases":0,
      "explicit_liturgical_book_but_wrong_time_row":4522,
      "disclaimer":"Complete triage of unresolved research holds, NOT new source certification or an ability to publish these historical schedules. Priority is proposed research order, not an acceptance probability.",
      "process_order":[
        "Repair 403/404/unreachable owner links; compare official alternatives and liturgical-book scope.",
        "Resolve precisely documented weekday shorthand and Passau 19:00 vs dated 17:00 clock contradiction.",
        "Check Park Hills 2024 temporary-site evidence vs present ownership and Arlington 2026 permission.",
        "Separate Lyonese/Latin 2002/1970/Missal 1962 at celebration/date scope.",
        "Seek explicit first-party edition statements for the remaining TLM/EF/Latin candidates; hold if unavailable.",
        "Verify physical coordinates and present recurrence separately before any directory or map release."
      ]
    }
    (args.out_dir/"cl15_summary.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","total_holds":197,"URLs":94,"lane_counts":report["primary_recovery_lane_counts"],"priority_one_rows":report["priority_1_rows"],"new_approved":0},sort_keys=True))
    db.close()
if __name__=="__main__":
    main()
