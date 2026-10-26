#!/usr/bin/env python3
"""CL18 FSSP release preparation: normalize 74 source schedules and crosscheck 39 sites.

Entirely offline stdlib, deterministic 2026-10-27--2026-12-31 provisional
occurrences. These are rule projections and NEVER confirmed Mass dates.
Original CL2--CL17 tables/IDs remain immutable; outputs are research-only.
"""
import argparse
import calendar
import csv
from collections import Counter,defaultdict
from datetime import date,timedelta
import json
import re
import sqlite3
from pathlib import Path

SOURCE=Path("data/directory/research/cl18-fssp-calendar-address-20261026/local-crosschecks.json")
DAY={"Monday":0,"Tuesday":1,"Wednesday":2,"Thursday":3,"Friday":4,"Saturday":5,"Sunday":6}
MONTH={calendar.month_name[i]:i for i in range(1,13)}
RANGE_START=date(2026,10,27)
RANGE_END=date(2026,12,31)
RULES={"WEEKLY","NTH_OF_MONTH","LAST_IN_SELECTED_MONTHS","UNRESOLVED_FEAST_DAY"}
ROW_WARNINGS={
  24:["SKIP_SECOND_MONDAY","FEAST_DAY_EXCEPTION_NEEDS_1962_CALENDAR"],
  45:["JUNE_13_OCT_03_OWNER_OVERRIDE_NEEDS_DATE_CHECK"],
  48:["FEAST_DAY_EXCLUSION_NEEDS_1962_CALENDAR"],
  53:["WIGRATZBAD_SEPARATE_CHAPEL"],
  56:["SITE_STREET_2_VS_4"],
  57:["PARISH_1000_1115_VS_FSSP_1015"],
  1274:["WIGRATZBAD_SEPARATE_SEMINAR_CHAPEL"],
  3456:["FIRST_SATURDAY_VS_SATURDAY_AFTER_FIRST_FRIDAY"],
  3482:["WEEKDAY_EVENING_MAY_MOVE_TO_ANOTHER_CHURCH"],
  49:["SITE_STREET_2_VS_4"],
}
BLOCK_CLOCK={57,3456}
ADDRESS_EXCEPTIONS={
 "CL14-DE-FSSP-024":"BUILDING_NUMBER_2_VS_4",
 "CL14-DE-FSSP-030":"ADJOINING_SCHOOL_VS_CHURCH_2_VS_4",
 "CL17-DE-FSSP-POTSDAM":"SAME_CHAPEL_MULTIPLE_CAMPUS_ENTRANCES",
}
def dump_csv(p,records):
    assert records
    with p.open("w",encoding="utf-8",newline="") as fp:
        w=csv.DictWriter(fp,fieldnames=list(records[0]),extrasaction="ignore")
        w.writeheader();w.writerows(records)
def parse_rule(raw):
    raw=raw.strip()
    if raw=="Feast days":
        return {"syntax":"UNRESOLVED_FEAST_DAY","days":[],"ordinal":[],
                "months":[],"auto_expand":False,"source_expression":raw}
    if raw.startswith("Last Thursday of "):
        m=re.fullmatch(r"Last Thursday of (.+)",raw)
        assert m
        nums=[MONTH[x.strip()] for x in re.split(r", | and ",m.group(1)) if x.strip()]
        assert nums==[1,3,5,7,9,11],nums
        return {"syntax":"LAST_IN_SELECTED_MONTHS","days":[3],
                "ordinal":["LAST"],"months":nums,"auto_expand":True,"source_expression":raw}
    parts=[p.strip() for p in raw.split(";")]
    assert parts and all(parts)
    hits=[]
    for text in parts:
        m=re.fullmatch(r"(1st|2nd|3rd|4th|5th) (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)",text)
        if m:
            hits.append(("ordinal",DAY[m.group(2)],int(m.group(1)[0])))
        else:
            assert text in DAY,("Unparsed or ambiguous original recurrence",raw,text)
            hits.append(("weekly",DAY[text],0))
    assert len({x[0] for x in hits})==1,raw
    kind=hits[0][0]
    if kind=="weekly":
        assert len({x[1] for x in hits})==len(hits)
        return {"syntax":"WEEKLY","days":[x[1] for x in hits],
                "ordinal":[],"months":[],"auto_expand":True,"source_expression":raw}
    assert len({(x[1],x[2]) for x in hits})==len(hits)
    return {"syntax":"NTH_OF_MONTH","days":[x[1] for x in hits],
            "ordinal":[x[2] for x in hits],"months":[],"auto_expand":True,"source_expression":raw}
def nth_of_month(d):
    return (d.day-1)//7+1
def last_weekday_of_month(d):
    return d.day+7>calendar.monthrange(d.year,d.month)[1]
def expected(d,rule):
    if rule["syntax"]=="UNRESOLVED_FEAST_DAY":return False
    if rule["syntax"]=="WEEKLY":return d.weekday() in rule["days"]
    if rule["syntax"]=="NTH_OF_MONTH":
        return any(d.weekday()==w and nth_of_month(d)==k for w,k in zip(rule["days"],rule["ordinal"]))
    if rule["syntax"]=="LAST_IN_SELECTED_MONTHS":
        return d.month in rule["months"] and d.weekday()==rule["days"][0] and last_weekday_of_month(d)
    raise AssertionError(rule)
def dates():
    current=RANGE_START
    while current<=RANGE_END:
        yield current
        current+=timedelta(days=1)
def main():
    a=argparse.ArgumentParser()
    a.add_argument("--db",type=Path,required=True)
    a.add_argument("--out-dir",type=Path,required=True)
    opts=a.parse_args()
    opts.out_dir.mkdir(parents=True,exist_ok=True)
    doc=json.loads(SOURCE.read_text(encoding="utf-8"))
    assert doc["schema"]=="AO_CL18_FSSP_LOCAL_CROSSCHECK_V1"
    assert doc["reviewed_on"]=="2026-10-26"
    checks=doc["crosschecks"]
    assert len(checks)==12
    assert len({x["source_place_id"] for x in checks})==12
    for c in checks:
        assert c["site_coordinate_approved"] is False and c["visitor_entrance_approved"] is False
        assert c["date_specific_mass_approved"] is False and c["public_release"] is False
        assert c["sources"] and all(e["url"].startswith("https://") for e in c["sources"])
    bysite={c["source_place_id"]:c for c in checks}

    conn=sqlite3.connect(opts.db)
    conn.row_factory=sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    for name,num in [("canonical_site",2584),("mass_time",4681),
          ("cl14_fssp_owner_site",38),("cl14_fssp_direct_slot",73),
          ("cl15_1962_hold_triage",197),("cl16_priority_one_slot",51),
          ("cl17_owner_site_stage",39),("cl17_accepted_mass_gates",256),
          ("cl17_potsdam_identity",1)]:
        n=conn.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]
        assert n==num,(name,n,num)
    pilot=[dict(r) for r in conn.execute("""SELECT g.row_no,g.historical_group_id,g.source_place_id,
         m.original_json AS source_json,s.owner_name,s.owner_city,s.owner_address,
         s.address_grade,s.source_url AS owner_url
         FROM cl17_accepted_mass_gates g
         JOIN mass_time m ON m.row_no=g.row_no
         JOIN cl17_owner_site_stage s ON s.source_place_id=g.source_place_id
         ORDER BY g.row_no""")]
    assert len(pilot)==74
    assert len({r["row_no"] for r in pilot})==74
    assert len({r["source_place_id"] for r in pilot})==39
    assert {r["source_place_id"] for r in pilot}=={r["source_place_id"] for r in conn.execute("SELECT source_place_id FROM cl17_owner_site_stage")}
    assert set(bysite).issubset({r["source_place_id"] for r in pilot})
    assert set(ROW_WARNINGS).issubset({r["row_no"] for r in pilot})
    assert all(int(r["row_no"]) in [20,18,21,22,23,24,25,27,29,28,30,31,32,33,34,36,38,39,44,40,42,45,46,48,49,51,52,53,54,55,56,57,1272,1274,1275,1761,1779,1790,1850] or r["row_no"]>3400 for r in pilot)

    results=[]
    previews=[]
    for item in pilot:
        source=json.loads(item["source_json"])
        assert len(source)==28
        assert source[26]==item["historical_group_id"]
        raw=source[6]
        rule=parse_rule(raw)
        row_no=item["row_no"]
        warnings=list(ROW_WARNINGS.get(row_no,[]))
        site_check=bysite.get(item["source_place_id"])
        if site_check:
            for code in site_check["blockers"]:
                if code not in warnings: warnings.append(code)
        if item["source_place_id"] in ADDRESS_EXCEPTIONS:
            warnings.append(ADDRESS_EXCEPTIONS[item["source_place_id"]])
        # Fee of source-level exceptions never implies rejection of a book
        # claim. It prevents treating projected occurrences as current times.
        occurrence_mode="MANUAL_ONLY" if rule["syntax"]=="UNRESOLVED_FEAST_DAY" else "RULE_PREVIEW_NO_OCCURRENCE_APPROVAL"
        time_conflict=row_no in BLOCK_CLOCK
        if time_conflict:occurrence_mode="RULE_PREVIEW_TIME_OR_MONTH_CADENCE_DISPUTED"
        currentness="DATE_SPECIFIC_OWNER_CALENDAR_NOT_SIGNED_OFF"
        if warnings and row_no not in BLOCK_CLOCK:
            currentness="LOCAL_EXCEPTION_OR_SITE_CHECK_REQUIRED"
        for dt in dates():
            if not expected(dt,rule):continue
            suppressed=(row_no==24 and dt.weekday()==0 and nth_of_month(dt)==2)
            if suppressed:continue
            preview={
                "historical_row_no":row_no,"source_place_id":item["source_place_id"],
                "projected_local_date":dt.isoformat(),"local_time":source[7],
                "rule_syntax":rule["syntax"],"source_day":raw,
                "site_name":item["owner_name"],
                "current_occurrence_verified":0,
                "timezone_validation_required":1,
                "owner_calendar_exception_checked":0,
                "ready_to_publish":0,
                "status":"UNCONFIRMED_RULE_PREVIEW",
                "reasons":";".join(warnings+["NOT_A_CONFIRMED_MASS_DATE"])
            }
            previews.append(preview)
        results.append({
            "historical_row_no":row_no,"historical_group_id":item["historical_group_id"],
            "source_place_id":item["source_place_id"],
            "named_worship_site":item["owner_name"],"owner_locality":item["owner_city"],
            "owner_address":item["owner_address"],"owner_address_grade":item["address_grade"],
            "original_day_expression":raw,"original_local_clock":source[7],
            "parsed_recurrence_kind":rule["syntax"],
            "weekdays_monday_0":";".join(str(x) for x in rule["days"]),
            "ordinal_in_month":";".join(str(x) for x in rule["ordinal"]),
            "permitted_calendar_months":";".join(str(x) for x in rule["months"]),
            "derived_date_projection_possible":int(rule["auto_expand"]),
            "supplementary_warnings":";".join(warnings),
            "rule_preview_state":occurrence_mode,
            "owner_calendar_currentness":currentness,
            "source_url":item["owner_url"],"source_snapshot_date":"2026-10-26",
            "coordinate_approved":0,"church_entrance_approved":0,
            "date_specific_mass_verified":0,"public_map_pin_approved":0,
            "public_mass_schedule_approved":0,
        })
    assert len(results)==74
    assert len(previews)>200 and len(previews)<1500,len(previews)
    assert sum(x["parsed_recurrence_kind"]=="UNRESOLVED_FEAST_DAY" for x in results)==1
    assert sum(x["derived_date_projection_possible"] for x in results)==73
    assert sum(x["parsed_recurrence_kind"]=="LAST_IN_SELECTED_MONTHS" for x in results)==1
    assert len({x["source_place_id"] for x in previews})==39 or len({x["source_place_id"] for x in previews})==38

    site_rows=[]
    group_to_site=defaultdict(list)
    for item in pilot:
        group_to_site[item["source_place_id"]].append(item)
    for source_place,group in sorted(group_to_site.items()):
        x=group[0]
        cross=bysite.get(source_place)
        address_issue=source_place in ADDRESS_EXCEPTIONS or (
            cross is not None and any("CHURCH_DOOR" in v or "SITE_STREET" in v or "REQUIRES_DOOR" in v for v in cross["blockers"]))
        rule_rows=[y for y in results if y["source_place_id"]==source_place]
        exceptional=sum(bool(y["supplementary_warnings"]) for y in rule_rows)
        site_rows.append({
            "source_place_id":source_place,"historical_group_id":x["historical_group_id"],
            "owner_name":x["owner_name"],"locality":x["owner_city"],
            "owner_stated_address":x["owner_address"],"address_grade":x["address_grade"],
            "local_owner_crosscheck_performed":int(cross is not None),
            "crosscheck_kind":cross["issue_class"] if cross else "BASE_OWNER_DIRECTORY_ONLY",
            "second_source_evidence_urls":";".join(z["url"] for z in cross["sources"]) if cross else "",
            "documented_source_disagreement":cross["evidence_note"] if cross else "",
            "needs_entrance_disambiguation":int(address_issue),
            "associated_historical_mass_rows":len(group),
            "rows_with_exception_warnings":exceptional,
            "geocode_point_verified":0,"doorway_verified":0,
            "future_mass_recurrence_approved":0,
            "public_map_pin_approved":0,
            "ready_for_release":"NO",
            "next_required_evidence":"RESOLVE_ENTRANCE_AND_ADDRESS_DISAGREEMENT" if address_issue else
            "INDEPENDENT_ENTRANCE_GEOCODE_AND_EFFECTIVE_DATED_CALENDAR"
        })
    assert len(site_rows)==39
    assert sum(x["local_owner_crosscheck_performed"] for x in site_rows)==12
    assert sum(x["needs_entrance_disambiguation"] for x in site_rows)>=3
    hold_rows=[x for x in results if x["supplementary_warnings"] or x["parsed_recurrence_kind"]=="UNRESOLVED_FEAST_DAY"]
    assert len(hold_rows)>10
    with conn:
        conn.executescript("""
        CREATE TABLE cl18_recurrence_rules (
          row_no INTEGER PRIMARY KEY,source_place_id TEXT NOT NULL,
          rule_syntax TEXT NOT NULL,owner_weekday_expression TEXT NOT NULL,
          normalized_json TEXT NOT NULL,
          calendar_currentness_approved INTEGER NOT NULL DEFAULT 0 CHECK(calendar_currentness_approved=0),
          publication_approved INTEGER NOT NULL DEFAULT 0 CHECK(publication_approved=0),
          FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl18_site_verification (
          source_place_id TEXT PRIMARY KEY,historical_group_id TEXT NOT NULL,
          owner_address TEXT NOT NULL,independent_crosscheck INTEGER NOT NULL,
          crosscheck_json TEXT NOT NULL,
          entrance_approved INTEGER NOT NULL DEFAULT 0 CHECK(entrance_approved=0),
          geocode_approved INTEGER NOT NULL DEFAULT 0 CHECK(geocode_approved=0),
          public_release INTEGER NOT NULL DEFAULT 0 CHECK(public_release=0),
          FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl18_unverified_projection(
          row_no INTEGER NOT NULL,projected_date TEXT NOT NULL,clock TEXT NOT NULL,
          owner_calendar_verified INTEGER NOT NULL DEFAULT 0 CHECK(owner_calendar_verified=0),
          released INTEGER NOT NULL DEFAULT 0 CHECK(released=0),
          projection_json TEXT NOT NULL,
          PRIMARY KEY(row_no,projected_date),
          FOREIGN KEY(row_no) REFERENCES cl18_recurrence_rules(row_no));
        """)
        for z in results:
            conn.execute("INSERT INTO cl18_recurrence_rules (row_no,source_place_id,rule_syntax,owner_weekday_expression,normalized_json) VALUES (?,?,?,?,?)",(
                z["historical_row_no"],z["source_place_id"],z["parsed_recurrence_kind"],
                z["original_day_expression"],json.dumps(z,ensure_ascii=False,sort_keys=True)))
        for z in site_rows:
            conn.execute("INSERT INTO cl18_site_verification (source_place_id,historical_group_id,owner_address,independent_crosscheck,crosscheck_json) VALUES(?,?,?,?,?)",(
                z["source_place_id"],z["historical_group_id"],z["owner_stated_address"],
                z["local_owner_crosscheck_performed"],json.dumps(z,ensure_ascii=False,sort_keys=True)))
        for z in previews:
            conn.execute("INSERT INTO cl18_unverified_projection (row_no,projected_date,clock,projection_json) VALUES(?,?,?,?)",(
                z["historical_row_no"],z["projected_local_date"],z["local_time"],json.dumps(z,ensure_ascii=False,sort_keys=True)))
        assert conn.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not conn.execute("PRAGMA foreign_key_check").fetchall()
        assert conn.execute("SELECT COUNT(*) FROM cl18_recurrence_rules").fetchone()[0]==74
        assert conn.execute("SELECT COUNT(*) FROM cl18_site_verification").fetchone()[0]==39
        assert conn.execute("SELECT COUNT(*) FROM cl18_unverified_projection WHERE owner_calendar_verified=1 OR released=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM cl18_site_verification WHERE entrance_approved=1 OR geocode_approved=1 OR public_release=1").fetchone()[0]==0
        assert conn.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
        assert conn.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0

    dump_csv(opts.out_dir/"cl18_74_normalized_mass_rules.csv",results)
    dump_csv(opts.out_dir/"cl18_39_site_second_source_screen.csv",site_rows)
    dump_csv(opts.out_dir/"cl18_unverified_future_rule_projections.csv",previews)
    dump_csv(opts.out_dir/"cl18_manual_exception_queue.csv",hold_rows)
    summary={
      "schema":"AO_CL18_NORMALIZED_FSSP_SCHEDULE_AND_PHYSICAL_CROSSCHECK_V1",
      "as_of":"2026-10-26",
      "original_1962_wording_pool":432,
      "prior_CL17_accepted_book_scope_claims_unchanged":256,
      "prior_CL17_unaccepted_book_scope_claims_unchanged":176,
      "named_pilot_places":39,
      "pilot_mass_rows_with_parsed_source_calendar_rules":74,
      "auto_expandable_rule_expressions":73,
      "manual_feast_only_rule_expressions":1,
      "distinct_place_local_owner_second_source_reviews":12,
      "places_needing_explicit_address_or_church_door_disambiguation":sum(x["needs_entrance_disambiguation"] for x in site_rows),
      "pilot_sites_not_independently_crosschecked":27,
      "rule_preview_start":RANGE_START.isoformat(),
      "rule_preview_end":RANGE_END.isoformat(),
      "unverified_projected_candidate_dates":len(previews),
      "manual_exception_queue_rows":len(hold_rows),
      "public_pin_approvals_new":0,"church_entrance_geocode_approvals_new":0,
      "future_date_schedule_approvals_new":0,"public_mass_events_new":0,"una_cum_new":0,
      "known_critical_conflicts":[
         "Ried-Hörmannsberg: church entrance number 2 vs 4 across FSSP and heritage sources.",
         "Amberg St Augustinus: school/chapel Deutsche Schulgasse 2 vs 4, do not derive entrance by address match alone.",
         "Recklinghausen St Joseph: first Saturday vs Saturday after first Friday can mean different dates.",
         "Neumarkt St Jobst: FSSP Sunday 10:15 conflicts with parish Sunday 10:00 and 11:15.",
         "Türkheim: weekday 18:30 occasionally moved from Kapuzinerkirche to nearby parish church.",
         "Grafing Mondays exclude feasts; monthly/feast rules require 1962 calendar context.",
         "Wigratzbad Sühnekirche, Seminarkapelle and Gnadenkapelle are distinct chapels; the third is outside 432-row source cohort.",
         "Munich Catholic Kreuzkirche is not the unrelated Protestant namesake.",
      ],
      "interpretation":"74 schedules normalized into deterministic rule formats. All generated dates are UNVERIFIED RULE PROJECTIONS, never public Mass offerings. No timezone localization or calendar effective-date/holiday approval inferred.",
      "next_release_tasks":[
         "Verify physical worship entrance coordinates for 39 source-named sites (27 still only national-directory source).",
         "Resolve cross-source street/address and recurring-clock differences before active publication.",
         "Apply 1962 feast calendar and exceptions to owner-issued future events rather than mechanical weekly recurrence.",
         "Owner-check date/time/site for next live weeks, then obtain explicit release clearance independent of source book acceptance."
      ]
    }
    (opts.out_dir/"cl18_summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","sites":39,"crosschecked":12,"rules":74,"rule_previews_unverified":len(previews),"ambiguous_address_sites":summary["places_needing_explicit_address_or_church_door_disambiguation"],"new_public_approvals":0},sort_keys=True))
    conn.close()
if __name__=="__main__":main()
