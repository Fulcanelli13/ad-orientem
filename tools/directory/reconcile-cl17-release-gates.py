#!/usr/bin/env python3
"""CL17: full evidence-to-publication release gates, and 39-site FSSP pilot.

Reads only the fully reconstructed CL2–CL16 research SQLite and CL17 owner
Potsdam crosscheck. Source acceptance != current Mass release or map approval.
No original or runtime tables are edited. Python standard library only.
"""
import argparse
import csv
import json
from collections import Counter,defaultdict
from pathlib import Path
import re
import sqlite3

OWNER=Path("data/directory/research/cl17-release-gates-20261026/potsdam-owner-crosscheck.json")
def export(path,rows):
    assert rows
    with path.open("w",encoding="utf-8",newline="") as out:
        w=csv.DictWriter(out,fieldnames=list(rows[0]),extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
def grade_address(value):
    # A documentary street address is not a coordinate or a verified entrance.
    has_post=bool(re.search(r"\b\d{5}\b",value))
    has_house=bool(re.search(r"(?<!\d)\d+[a-zA-Z]?(?!\d)",value.split(",")[0]))
    if has_house and has_post:return "STREET_NUMBER_AND_POSTCODE_DOCUMENTED"
    if has_house:return "STREET_NUMBER_POSTCODE_MISSING"
    if has_post:return "STREET_POSTCODE_NUMBER_MISSING"
    return "ADDRESS_DOCUMENTED_NOT_STREET_AND_POSTCODE_CONFIRMED"

def main():
    pa=argparse.ArgumentParser()
    pa.add_argument("--db",required=True,type=Path)
    pa.add_argument("--out-dir",required=True,type=Path)
    a=pa.parse_args()
    a.out_dir.mkdir(parents=True,exist_ok=True)
    extra=json.loads(OWNER.read_text(encoding="utf-8"))
    assert extra["schema"]=="AO_CL17_FSSP_POTSDAM_OWNER_CROSSCHECK_V1"
    assert extra["original_mass_row"]==20
    assert extra["single_venue_not_two"] is True
    assert extra["new_source_scoped_liturgical_book_evidence_accepted"] is True
    for f in ("physical_entrance_verified_for_public_map","geocode_verified","future_mass_calendar_verified","publication_approved","una_cum_assessed"):
        assert extra[f] is False
    db=sqlite3.connect(a.db)
    db.row_factory=sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    for table,n in [("canonical_site",2584),("venue_source",2687),("mass_time",4681),
                    ("classification_source",2715),("cl9_mass_candidate",432),
                    ("cl10_1962_mass_evidence",85),("cl11_mass_source_scope",118),
                    ("cl12_singleton_evidence",75),("cl13_remaining_1962_evidence",154),
                    ("cl14_fssp_direct_slot",73),("cl14_fssp_owner_site",38),
                    ("cl15_1962_hold_triage",197),("cl16_priority_one_slot",51)]:
        got=db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        assert got==n,(table,got,n)
    accepted={}
    layers=[
        ("CL10","cl10_1962_mass_evidence","accepted","exception_json"),
        ("CL11","cl11_mass_source_scope","book_evidence_accepted","evidence_json"),
        ("CL12","cl12_singleton_evidence","evidence_1962_accepted","evidence_json"),
        ("CL13","cl13_remaining_1962_evidence","evidence_1962_slot_accepted","evidence_json"),
        ("CL14","cl14_fssp_direct_slot","owner_1962_evidence_accepted","evidence_json"),
        ("CL16","cl16_priority_one_slot","accepted_research_book_evidence","evidence_json"),
    ]
    expected_counts={"CL10":79,"CL11":42,"CL12":12,"CL13":29,"CL14":73,"CL16":20}
    for phase,table,condition,jsoncol in layers:
        src=db.execute(f"SELECT row_no,{jsoncol} AS evidence FROM {table} WHERE {condition}=1").fetchall()
        assert len(src)==expected_counts[phase],(phase,len(src))
        for x in src:
            rid=x["row_no"]
            assert rid not in accepted,("Overlap in source acceptance",rid,phase,accepted.get(rid))
            e=json.loads(x["evidence"])
            if isinstance(e,list):exc=";".join(str(z) for z in e)
            else:exc=e.get("exception_codes") or e.get("exceptions") or ""
            accepted[rid]={"phase":phase,"exceptions":exc,"evidence":e}
    assert len(accepted)==255
    assert 20 not in accepted
    original=db.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=20").fetchone()
    assert original is not None
    m=json.loads(original["original_json"])
    assert m[14]=="https://www.alexianer-potsdam.de/st-josefs-kapelle"
    assert (m[6],m[7])==(extra["original_day"],extra["original_time"])
    assert "Josef" in m[2] or "Josef" in m[16]
    assert m[19]=="VERIFIED" and m[18]
    assert db.execute("SELECT COUNT(*) FROM cl12_singleton_evidence WHERE row_no=20 AND evidence_1962_accepted=0").fetchone()[0]==1
    assert db.execute("SELECT COUNT(*) FROM cl15_1962_hold_triage WHERE row_no=20").fetchone()[0]==1
    assert db.execute("SELECT COUNT(*) FROM cl16_priority_one_slot WHERE row_no=20").fetchone()[0]==0
    accepted[20]={"phase":"CL17","exceptions":";".join(extra["exception_codes"]),"evidence":extra}
    assert len(accepted)==256

    official={}
    fssp=db.execute("""SELECT d.row_no,d.official_site_id,s.group_id,s.owner_city,s.owner_name,
       s.address,s.owner_url FROM cl14_fssp_direct_slot d
       JOIN cl14_fssp_owner_site s ON s.official_site_id=d.official_site_id
       ORDER BY d.row_no""").fetchall()
    for x in fssp:
        official[x["row_no"]]=dict(x)
    assert len(official)==73
    assert set(official).issubset(set(accepted))
    assert len({x["group_id"] for x in official.values()})==38
    place_lock={}
    mass_rows=[]
    for rid in sorted(accepted):
        o=db.execute("SELECT source_id,group_id,original_json FROM mass_time WHERE row_no=?",(rid,)).fetchone()
        assert o is not None and o["group_id"]
        r=json.loads(o["original_json"])
        assert len(r)==28 and r[1]==o["source_id"] and r[26]==o["group_id"]
        anchor=db.execute("SELECT group_id,effective_anchor_id,name,country,physical_description,canonical_json,physical_json FROM canonical_site WHERE group_id=?",(o["group_id"],)).fetchone()
        link=db.execute("SELECT joined_canonical_group_id,classification_merge_state FROM venue_source WHERE source_id=?",(o["source_id"],)).fetchone()
        source_link="EXACT_JOIN" if link and link["joined_canonical_group_id"]==o["group_id"] else (
            "SOURCE_GROUP_CONFLICT_OR_NOT_JOINED" if link else "SOURCE_NOT_IN_VENUE_MASTER")
        physical="NOT_INDEPENDENTLY_CHECKED"
        site_id=""
        owner_name=""
        owner_city=""
        address=""
        owner_source=""
        if rid in official:
            e=official[rid]
            assert e["group_id"]==o["group_id"]
            physical="OWNER_NAMED_WORSHIP_PLACE_AND_ADDRESS_SOURCE"
            site_id=e["official_site_id"]
            owner_name=e["owner_name"];owner_city=e["owner_city"]
            address=e["address"];owner_source=e["owner_url"]
        if rid==20:
            physical="CHAPEL_OPERATOR_PLUS_DIOCESE_FSSP_DOCUMENTED_ADDRESS"
            site_id="CL17-DE-FSSP-POTSDAM"
            owner_name=extra["venue_name"];owner_city="Potsdam"
            address=extra["owner_address_for_chapel"]
            owner_source=extra["owner_witnesses"][0]["url"]
        if physical!="NOT_INDEPENDENTLY_CHECKED":
            key=site_id
            if key in place_lock:
                assert place_lock[key]["historical_group_id"]==o["group_id"]
            else:
                place_lock[key]={
                    "source_place_id":site_id,"historical_group_id":o["group_id"],
                    "owner_name":owner_name,"owner_city":owner_city,"owner_address":address,
                    "address_documentation_grade":grade_address(address),
                    "owner_source_url":owner_source,
                    "different_entrance_address":extra["hospital_car_access"] if rid==20 else "",
                    "current_owner_worship_address_evidence":1,
                    "frozen_canonical_site_exists":int(anchor is not None),
                    "stable_existing_anchor_id":anchor["effective_anchor_id"] if anchor else "",
                    "source_group_join_status":source_link,
                    "geocode_approved":0,"church_entrance_verified":0,
                    "operational_recurrence_approved":0,"public_mass_schedule_approved":0,
                    "public_venue_pin_approved":0,"una_cum_approved":0,
                    "release_gate":"GEO_AND_DATE_SPECIFIC_RECURRENCE_CHECK_REQUIRED",
                }
        all_exc=accepted[rid]["exceptions"]
        if not isinstance(all_exc,str):all_exc=json.dumps(all_exc,ensure_ascii=False)
        source_has_complex_schedule=bool(
            all_exc.strip() or ";" in r[6] or
            re.search(r"(1st|2nd|3rd|4th|5th|last|first|feast|school|summer|winter|holiday|monthly)",r[6]+" "+r[8]+" "+r[10],re.I))
        mass_rows.append({
          "mass_row_no":rid,"frozen_source_id":o["source_id"],"historical_group_id":o["group_id"],
          "site_name_historical":r[2],"country_of_canonical_group":anchor["country"] if anchor else "",
          "historical_day":r[6],"historical_local_time":r[7],
          "historical_recurrence":r[8],"historical_status":r[19],
          "historical_checked_on":r[18],"original_schedule_url":r[14],
          "book_evidence_phase":accepted[rid]["phase"],
          "book_1962_research_evidence_accepted":1,
          "owner_documented_exact_worship_address":int(physical!="NOT_INDEPENDENTLY_CHECKED"),
          "source_address_pilot_id":site_id,"source_address_grade":grade_address(address) if address else "NO_INDEPENDENT_OWNER_ADDRESS_REVIEW",
          "source_site_evidence":physical,"recorded_group_in_site_master":int(anchor is not None),
          "existing_group_anchor_id":anchor["effective_anchor_id"] if anchor else "",
          "venue_source_join_state":source_link,
          "exception_codes":all_exc,"recurrence_or_rite_exception_needs_rule_check":int(source_has_complex_schedule),
          "physical_coordinates_approved":0,
          "entrance_and_worship_room_confirmed":0,
          "future_dated_recurrence_approved":0,
          "liturgical_exception_machine_rule_approved":0,
          "public_site_pin_approved":0,
          "public_mass_time_approved":0,
          "una_cum_evidence_approved":0,
          "next_release_action":"VERIFY_GEOCODE_ENTRY_AND_SPECIFIC_DATED_MASS_SCHEDULE" if site_id else
             "RECONCILE_PRECISE_WORSHIP_LOCATION_OWNER_ADDRESS_AND_TIMETABLE"
        })
    assert len(mass_rows)==256
    assert len(place_lock)==39
    assert len({x["historical_group_id"] for x in place_lock.values()})==39
    assert sum(x["owner_documented_exact_worship_address"] for x in mass_rows)==74
    assert sum(x["book_1962_research_evidence_accepted"] for x in mass_rows)==256
    assert sum(x["book_evidence_phase"]=="CL17" for x in mass_rows)==1
    assert sum(x["public_mass_time_approved"] for x in mass_rows)==0
    assert db.execute("SELECT COUNT(*) FROM classification_source WHERE owner_verified_missal_1962=1").fetchone()[0]==3
    assert db.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
    # CL15's 197 held only loses the 20 CL16 wins and CL17 Potsdam (row 20).
    held=[dict(x) for x in db.execute("""SELECT h.row_no,h.source_id,h.group_id,h.source_url,
      h.recovery_lane,h.priority_tier FROM cl15_1962_hold_triage h
      WHERE h.row_no NOT IN (SELECT row_no FROM cl16_priority_one_slot WHERE accepted_research_book_evidence=1)
      AND h.row_no !=20 ORDER BY h.priority_tier,h.row_no""").fetchall()]
    assert len(held)==176
    assert not set(x["row_no"] for x in held) & set(accepted)
    assert len(set(accepted)|{r["row_no"] for r in held})==432
    assert len(set(accepted)&{r["row_no"] for r in held})==0

    places=sorted(place_lock.values(),key=lambda x:(x["owner_city"],x["owner_name"]))
    for place in places:
        place["source_candidate_mass_rows"]=sum(x["source_address_pilot_id"]==place["source_place_id"] for x in mass_rows)
    with db:
        db.executescript("""
        CREATE TABLE cl17_owner_site_stage(
            source_place_id TEXT PRIMARY KEY,historical_group_id TEXT NOT NULL UNIQUE,
            owner_name TEXT NOT NULL,owner_city TEXT NOT NULL,owner_address TEXT NOT NULL,
            address_grade TEXT NOT NULL,source_url TEXT NOT NULL,
            site_evidence_json TEXT NOT NULL,
            physical_approved INTEGER NOT NULL DEFAULT 0 CHECK(physical_approved=0),
            current_schedule_approved INTEGER NOT NULL DEFAULT 0 CHECK(current_schedule_approved=0),
            public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0));
        CREATE TABLE cl17_accepted_mass_gates(
            row_no INTEGER PRIMARY KEY,historical_group_id TEXT NOT NULL,
            source_place_id TEXT,owner_book_evidence INTEGER NOT NULL CHECK(owner_book_evidence=1),
            gate_json TEXT NOT NULL,
            physical_approved INTEGER NOT NULL DEFAULT 0 CHECK(physical_approved=0),
            current_schedule_approved INTEGER NOT NULL DEFAULT 0 CHECK(current_schedule_approved=0),
            public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0),
            una_cum_approved INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_approved=0),
            FOREIGN KEY(row_no) REFERENCES mass_time(row_no),
            FOREIGN KEY(source_place_id) REFERENCES cl17_owner_site_stage(source_place_id));
        CREATE TABLE cl17_potsdam_identity(
            row_no INTEGER PRIMARY KEY CHECK(row_no=20),
            source_place_id TEXT NOT NULL,
            venue_address TEXT NOT NULL,
            access_address TEXT NOT NULL,
            distinct_venues INTEGER NOT NULL CHECK(distinct_venues=0),
            public_approval INTEGER NOT NULL DEFAULT 0 CHECK(public_approval=0),
            document_json TEXT NOT NULL,FOREIGN KEY(row_no) REFERENCES mass_time(row_no));
        """)
        for p in places:
            db.execute("INSERT INTO cl17_owner_site_stage(source_place_id,historical_group_id,owner_name,owner_city,owner_address,address_grade,source_url,site_evidence_json) VALUES(?,?,?,?,?,?,?,?)",(
                p["source_place_id"],p["historical_group_id"],p["owner_name"],p["owner_city"],
                p["owner_address"],p["address_documentation_grade"],p["owner_source_url"],
                json.dumps(p,ensure_ascii=False,sort_keys=True)))
        for r in mass_rows:
            db.execute("INSERT INTO cl17_accepted_mass_gates(row_no,historical_group_id,source_place_id,owner_book_evidence,gate_json) VALUES(?,?,?,?,?)",(
                r["mass_row_no"],r["historical_group_id"],r["source_address_pilot_id"] or None,1,
                json.dumps(r,ensure_ascii=False,sort_keys=True)))
        db.execute("INSERT INTO cl17_potsdam_identity(row_no,source_place_id,venue_address,access_address,distinct_venues,document_json) VALUES(20,?,?,?,?,?)",(
            "CL17-DE-FSSP-POTSDAM",extra["owner_address_for_chapel"],extra["hospital_car_access"],0,
            json.dumps(extra,ensure_ascii=False,sort_keys=True)))
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert not db.execute("PRAGMA foreign_key_check").fetchall()
        assert db.execute("SELECT COUNT(*) FROM cl17_owner_site_stage").fetchone()[0]==39
        assert db.execute("SELECT COUNT(*) FROM cl17_accepted_mass_gates WHERE source_place_id IS NOT NULL").fetchone()[0]==74
        assert db.execute("SELECT COUNT(*) FROM cl17_accepted_mass_gates WHERE physical_approved=1 OR current_schedule_approved=1 OR public_approved=1 OR una_cum_approved=1").fetchone()[0]==0
    export(a.out_dir/"cl17_256_mass_evidence_to_release_gates.csv",mass_rows)
    export(a.out_dir/"cl17_39_fssp_owner_site_pilot.csv",places)
    export(a.out_dir/"cl17_176_unresolved_claims_carryover.csv",held)
    grade_counts=Counter(p["address_documentation_grade"] for p in places)
    sites_with_anchors=sum(p["frozen_canonical_site_exists"] for p in places)
    all_groups={m["historical_group_id"] for m in mass_rows}
    group_coverage=sum(db.execute("SELECT COUNT(*) FROM canonical_site WHERE group_id=?",(gid,)).fetchone()[0] for gid in all_groups)
    summary={
      "schema":"AO_CL17_EVIDENCE_TO_RELEASE_GATES_V1","as_of":"2026-10-26",
      "frozen_candidate_cohort":432,
      "prior_CL16_accepted_book_evidence_rows":255,
      "new_accepted_named_owner_programme_row":20,
      "accepted_book_evidence_rows":256,
      "held_book_evidence_rows":176,
      "distinct_historical_groups_with_accepted_rows":len(all_groups),
      "accepted_groups_existing_in_site_master":group_coverage,
      "fssp_source_named_worship_place_pilot":39,
      "pilot_historical_groups_with_existing_site_anchor":sites_with_anchors,
      "pilot_frozen_mass_rows_with_named_owner_address":74,
      "pilot_owner_address_documentation_grades":dict(grade_counts),
      "owner_named_address_not_equivalent_to_geocoded_entrance":True,
      "public_sites_new":0,"public_mass_times_new":0,
      "current_dated_recurrence_approvals_new":0,"physical_coordinate_or_entrance_approvals_new":0,
      "una_cum_approvals_new":0,"cl2_original_accepted_source_classification_witnesses":3,
      "Potsdam_identity_decision":"ONE_HOSPITAL_CHAPEL_TWO_DIFFERENT_REPORTED_ACCESS_ADDRESSES",
      "Potsdam_chapel_official_address":extra["owner_address_for_chapel"],
      "Potsdam_vehicle_access":extra["hospital_car_access"],
      "release_plan":[
        "Review the 39 source-named physical worship locations, verify coordinates, entrance/access and existing canonical place/anchor de-duplication before allowing pins.",
        "Normalize individual weekly/monthly/seasonal exceptions for 74 associated source-scoped candidate Mass rows.",
        "Recheck future date-specific Mass calendars and official exceptions as a separate operational signoff; historical VERIFIED and current owner webpage are not independent guarantees.",
        "Apply explicit public release gate only to sites/events meeting all conditions; never infer Una Cum, legal owner or celebrant identity.",
        "Continue 176 remaining liturgical-book evidence holds as a separate lane, deduplicated by owner URL."
      ],
      "disclaimer":"256 accepted rows concern exact source-scoped liturgical-book evidence, not 256 places or currently available Masses. CL17 stages 39 named venues, not 39 approved map pins."
    }
    (a.out_dir/"cl17_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS","accepted_book_rows":256,"still_held":176,
      "owner_address_pilot_sites":39,"pilot_mass_slots":74,
      "canonical_site_groups":len(all_groups),"public_releases":0},sort_keys=True))
    db.close()
if __name__=="__main__":main()
