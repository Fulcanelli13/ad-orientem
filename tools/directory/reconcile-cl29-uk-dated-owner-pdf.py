#!/usr/bin/env python3
"""CL29: research-only source-grounded SSPX UK five-page PDF + FSSP Warrington
bulletin dated service extraction. Not a public Mass calendar or venue master.
"""
import argparse,csv,hashlib,json,sqlite3
from collections import Counter
from datetime import date
from pathlib import Path
from zoneinfo import ZoneInfo

SRC=Path("data/directory/research/cl29-sspx-uk-20261026/evidence.json")
def write_csv(path,rows):
    assert rows
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),extrasaction="ignore")
        w.writeheader();w.writerows(rows)

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--db",required=True,type=Path)
    a.add_argument("--out-dir",required=True,type=Path)
    x=a.parse_args()
    x.out_dir.mkdir(parents=True,exist_ok=True)
    m=json.loads(SRC.read_text(encoding="utf-8"))
    assert m["schema"]=="AO_CL29_SSPX_UK_FSSP_PRIMARY_DATED_20261026_V1"
    docs=m["source_documents"]
    venues=m["venue_identity_register"]
    events=m["dated_mass_source_candidates"]
    exceptions=m["safety_exceptions"]
    overlap=m["overlap_research_audit"]
    assert len(docs)==2 and len(venues)==19 and len(events)==56 and len(exceptions)==8
    assert {d["document_key"] for d in docs}=={
        "SSPX_GB_PRIORY_2026_10_25","FSSP_WARRINGTON_2026_10_18_31"}
    assert {d["new_event_rows_from_document"] for d in docs}=={50,6}
    pdf=next(d for d in docs if d["medium"]=="PDF")
    assert pdf["pages"]==5 and pdf["web_pdf_screenshots_inspected_page_indices"]==[0,1,2,3,4]
    assert pdf["uri"]=="https://fsspx.uk/sites/default/files/documents/PrioryMassTimes-261025.pdf"
    assert pdf["document_binary_sha256"] is None
    assert pdf["document_binary_not_in_repository"] is True
    html=next(d for d in docs if d["medium"]=="FIRST_PARTY_ARCHIVE_HTML")
    assert html["archive_publication_date"]=="2026-10-17"
    assert "fssp.org.uk" in html["uri"]
    assert overlap["confirmed_global_canonical_site_assignments"]==0
    assert overlap["lexical_research_lead_is_not_approved_canonical_identity"] is True
    assert overlap["parallel_B44_B46_worldwide_pipelines_not_reconciled"] is True
    assert all(v==0 for v in m["gates"].values())
    assert len({v["research_venue_key"] for v in venues})==19
    named={v["research_venue_key"]:v for v in venues}
    assert Counter(v["source_organization"] for v in venues)==Counter({"SSPX":18,"FSSP":1})
    assert sum(v["venue_identity_grade"]=="LOCALITY_ONLY_MASS_PLACE_NOT_MATCHED" for v in venues)==1
    assert named["UK-HOLNEST-CL29"]["operator_worship_place_name"] is None
    assert all(v["original_global_master_id"] is None and
               v["canonical_identity_promoted"] is False and
               v["public_pin_approved"] is False for v in venues)
    assert all(v["operator_venue_directory_url"].startswith("https://") for v in venues)
    grouped=Counter()
    times=set()
    source_counts=Counter()
    for ev in events:
        assert ev["research_venue_key"] in named
        v=named[ev["research_venue_key"]]
        assert ev["source_org"]==v["source_organization"]
        assert ev["source_kind"] in {
            "FIRST_PARTY_FSSP_PUBLISHED_DATED_BULLETIN",
            "FIRST_PARTY_SSPX_PDF_DATED_MATRIX"}
        assert ev["reference_venue_name"]==(
            v["operator_worship_place_name"] or "Holnest (venue identity unresolved)")
        assert ev["date"]>="2026-10-26" and ev["date"]<="2026-11-01"
        date.fromisoformat(ev["date"])
        assert ev["timezone"]=="Europe/London"
        ZoneInfo(ev["timezone"])
        hh,mm=map(int,ev["local_time"].split(":"))
        assert 0<=hh<=23 and 0<=mm<60
        assert ev["mass_semantics"]=="EXPLICIT_MASS_IN_SOURCE"
        assert ev["source_doc_page_zero_index"]==v["source_document_page_zero_index"]
        assert ev["source_readback_date"]=="2026-10-26"
        assert ev["worldwide_master_match_state"]=="UNRESOLVED_NEVER_AUTOCREATE"
        assert ev["public_calendar_event_approved"] is False
        assert ev["public_site_approved"] is False
        assert ev["una_cum_claim_approved"] is False
        assert ev["document_integrity_checksum"]=="NOT_ACQUIRED_BINARY_ONLY_URL_AND_WEB_SCREENSHOT"
        assert ev["liturgical_book_edition_not_individually_attested"] is True
        if ev["source_org"]=="SSPX":
            assert ev["source_document_uri"]==pdf["uri"]
            assert ev["source_page_visually_inspected"] is True
            assert isinstance(ev["source_doc_page_zero_index"],int)
            assert 0<=ev["source_doc_page_zero_index"]<5
        else:
            assert ev["source_document_uri"]==html["uri"]
            assert ev["source_doc_page_zero_index"] is None
        if ev["research_venue_key"]=="UK-HOLNEST-CL29":
            assert ev["research_disposition"]=="HOLD_ACTUAL_CHURCH_NOT_LINKED"
        t=(ev["research_venue_key"],ev["date"],ev["local_time"],ev["timezone"])
        assert t not in times,("duplicate",t)
        times.add(t)
        grouped[ev["research_venue_key"]]+=1
        source_counts[ev["source_org"]]+=1
    assert source_counts==Counter({"SSPX":50,"FSSP":6})
    assert len(grouped)==19
    expected={
      "LON-HOLLOWAY":4,"LON-WIMBLEDON":5,"LEICESTER":1,"WOKING":1,
      "GROOMBRIDGE":1,"HERNE":1,"BURGHCLERE":9,"BRISTOL":10,"TAUNTON":1,
      "HOLNEST":1,"PRESTON":4,"RHOS":2,"MANCHESTER":1,"LIVERPOOL":1,
      "BINGLEY":1,"GATESHEAD":1,"GLASGOW":3,"EDINBURGH":3,"WARRINGTON":6}
    assert grouped==Counter({"UK-"+k+"-CL29":v for k,v in expected.items()})
    assert sum(n for n in grouped.values())==56
    assert [r["local_time"] for r in events if r["research_venue_key"]=="UK-EDINBURGH-CL29" and r["date"]=="2026-10-26"]==["07:00"]
    assert {r["local_time"] for r in events if r["research_venue_key"]=="UK-BRISTOL-CL29" and r["date"]=="2026-11-01"}=={"09:00","11:00"}
    assert {r["local_time"] for r in events if r["research_venue_key"]=="UK-LON-HOLLOWAY-CL29" and r["date"]=="2026-11-01"}=={"08:30","10:00"}
    assert [r["date"] for r in events if r["research_venue_key"]=="UK-WARRINGTON-CL29"]==[
        "2026-10-26","2026-10-27","2026-10-28",
        "2026-10-29","2026-10-30","2026-10-31"]
    assert not any(r["date"]=="2026-10-28" and r["research_venue_key"]=="UK-LON-WIMBLEDON-CL29" for r in events)
    assert not any(r["date"]=="2026-10-27" and r["research_venue_key"]=="UK-LON-HOLLOWAY-CL29" for r in events)
    assert {r["date"] for r in events if r["research_venue_key"]=="UK-PRESTON-CL29"}=={
        "2026-10-26","2026-10-30","2026-10-31","2026-11-01"}
    assert {r["key"] for r in exceptions}=={
        "SSPX_HOLNEST_BUILDING_UNMAPPED",
        "SSPX_HERME_TYPO",
        "SSPX_PRIORY_ADDRESS_NOT_ENTRANCE",
        "SSPX_PRESTON_VS_MANCHESTER",
        "SSPX_NO_MASS_NEGATIVE_CONTROL",
        "DATED_SOURCE_NOT_ACTUAL_CELEBRATION",
        "SSPX_ORGANIZATION_NOT_UNA_CUM",
        "WARRINGTON_THIRDPARTY_RESEARCH_MATCH_UNAPPROVED"}
    cx=sqlite3.connect(x.db)
    cx.row_factory=sqlite3.Row
    cx.execute("PRAGMA foreign_keys=ON")
    counts={
       "canonical_site":2584,"mass_time":4681,
       "cl17_owner_site_stage":39,"cl17_accepted_mass_gates":256,
       "cl18_recurrence_rules":74,
       "cl25_dated_operator_candidate":7,
       "cl26_external_date_specific_ordo_event":14,
       "cl27_local_dated_research_candidate":9,
       "cl28_crossnetwork_dated_source_candidate":18}
    for name,num in counts.items():
        found=cx.execute("SELECT COUNT(*) FROM "+name).fetchone()[0]
        assert found==num,(name,found,num)
    assert cx.execute("SELECT COUNT(*) FROM canonical_site WHERE release!='RESEARCH_ONLY_NOT_PUBLIC'").fetchone()[0]==0
    # Do NOT equate a lexical LMD research lead to an admitted canonical site.
    lmd=json.loads(Path(overlap["crosswalk_file"]).read_text(encoding="utf-8"))
    hints=[r for r in lmd["candidates"] if r["source_id"]==
         overlap["notable_existing_lexical_research_lead"]]
    assert len(hints)==1
    assert hints[0]["duplicate_state"]=="UNMATCHED_RESEARCH_LEAD"
    assert hints[0]["publication_state"]=="RESEARCH_ONLY_NOT_MASS_VENUE"
    with cx:
        cx.executescript("""
        CREATE TABLE cl29_research_source_document(
          document_key TEXT PRIMARY KEY,
          source_uri TEXT NOT NULL,
          evidence_json TEXT NOT NULL,
          source_binary_checksum TEXT,
          published_event_approval INTEGER NOT NULL DEFAULT 0 CHECK(published_event_approval=0));
        CREATE TABLE cl29_research_venue_identity(
          research_venue_key TEXT PRIMARY KEY,
          named_worship_place TEXT,
          venue_grade TEXT NOT NULL,
          source_org TEXT NOT NULL,
          global_canonical_site_id TEXT,
          evidence_json TEXT NOT NULL,
          approved_public_site INTEGER NOT NULL DEFAULT 0 CHECK(approved_public_site=0),
          approved_public_pin INTEGER NOT NULL DEFAULT 0 CHECK(approved_public_pin=0));
        CREATE TABLE cl29_operator_dated_mass_candidate(
          source_record_id TEXT PRIMARY KEY,
          research_venue_key TEXT NOT NULL,
          date_local TEXT NOT NULL,
          time_local TEXT NOT NULL,
          timezone TEXT NOT NULL,
          source_org TEXT NOT NULL,
          event_fingerprint TEXT NOT NULL UNIQUE,
          evidence_json TEXT NOT NULL,
          global_event_id TEXT,
          public_calendar_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_calendar_approved=0),
          una_cum_approved INTEGER NOT NULL DEFAULT 0 CHECK(una_cum_approved=0),
          FOREIGN KEY(research_venue_key) REFERENCES cl29_research_venue_identity(research_venue_key));
        CREATE TABLE cl29_source_exception_hold(
          exception_key TEXT PRIMARY KEY,
          evidence_json TEXT NOT NULL,
          release_from_exception INTEGER NOT NULL DEFAULT 0 CHECK(release_from_exception=0));
        """)
        for r in docs:
            cx.execute("INSERT INTO cl29_research_source_document(document_key,source_uri,evidence_json) VALUES (?,?,?)",(
                r["document_key"],r["uri"],json.dumps(r,sort_keys=True,ensure_ascii=False)))
        for v in venues:
            cx.execute("INSERT INTO cl29_research_venue_identity(research_venue_key,named_worship_place,venue_grade,source_org,evidence_json)"
               " VALUES (?,?,?,?,?)",(v["research_venue_key"],v["operator_worship_place_name"],
                  v["venue_identity_grade"],v["source_organization"],json.dumps(v,sort_keys=True,ensure_ascii=False)))
        emitted=[]
        for ev in events:
            k=(ev["research_venue_key"],ev["date"],ev["local_time"],ev["timezone"])
            fp=hashlib.sha256("|".join(k).encode("utf-8")).hexdigest()
            emitted.append({**ev,"research_event_fingerprint_sha256":fp})
            cx.execute("INSERT INTO cl29_operator_dated_mass_candidate "
                "(source_record_id,research_venue_key,date_local,time_local,timezone,source_org,event_fingerprint,evidence_json)"
                " VALUES (?,?,?,?,?,?,?,?)",(ev["record_id"],ev["research_venue_key"],ev["date"],ev["local_time"],
                ev["timezone"],ev["source_org"],fp,json.dumps(ev,sort_keys=True,ensure_ascii=False)))
        for h in exceptions:
            cx.execute("INSERT INTO cl29_source_exception_hold(exception_key,evidence_json) VALUES (?,?)",
                (h["key"],json.dumps(h,sort_keys=True,ensure_ascii=False)))
        assert cx.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert cx.execute("PRAGMA foreign_key_check").fetchall()==[]
        assert cx.execute("SELECT COUNT(*) FROM cl29_operator_dated_mass_candidate WHERE global_event_id IS NOT NULL OR public_calendar_approved=1 OR una_cum_approved=1").fetchone()[0]==0
        assert cx.execute("SELECT COUNT(*) FROM cl29_research_venue_identity WHERE global_canonical_site_id IS NOT NULL OR approved_public_site=1 OR approved_public_pin=1").fetchone()[0]==0
    write_csv(x.out_dir/"cl29_56_dated_mass_source_rows.csv",emitted)
    write_csv(x.out_dir/"cl29_19_worship_place_identity_research.csv",venues)
    write_csv(x.out_dir/"cl29_8_release_exception_holds.csv",exceptions)
    summary={
       "schema":"AO_CL29_UK_OPERATOR_DATED_PDF_AND_BULLETIN_V1",
       "operator_primary_documents_processed":2,
       "SSPX_pdf_pages_visually_inspected":5,
       "first_party_SSPX_dated_mass_cells":50,
       "first_party_FSSP_warrington_dated_mass_rows":6,
       "new_dated_source_candidates":56,
       "distinct_research_venue_references":19,
       "named_operator_venue_directory_identifications":18,
       "locality_only_actual_building_held":1,
       "source_exception_controls":8,
       "public_events_new":0,
       "public_venues_new":0,
       "public_pins_new":0,
       "new_una_cum":0,
       "global_canonical_site_mappings_approved":0,
       "global_event_identity_mappings_approved":0,
       "prior_CL25_CL28_research_source_candidate_rows":48,
       "cumulative_CL25_CL29_research_source_candidate_rows":104,
       "frozen_german_pilot_places_unchanged":39,
       "frozen_german_pilot_historic_patterns_unchanged":74,
       "original_1962_liturgical_wording_supported":256,
       "original_1962_liturgical_wording_held":176,
       "canonical_site_count_unchanged":2584,
       "mass_time_count_unchanged":4681,
       "source_PDF_binary_preserved_in_git":False
    }
    (x.out_dir/"cl29_summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps({"status":"PASS",**summary},sort_keys=True))
    cx.close()
if __name__=="__main__":
    main()
