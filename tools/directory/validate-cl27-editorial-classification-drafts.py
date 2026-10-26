#!/usr/bin/env python3
"""Validate offline user classification DRAFTS against CL2 without public promotion.

This is a research-ingestion guard, not a reviewer or a declaration of canonical
status, pontiff-recognition, Missal use, or Una Cum. No canonical rows are edited.
"""
import argparse
import json
import sqlite3
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

TAXONOMY = Path("data/directory/tlm-user-classification-taxonomy.v1.json")

def safe_date(value):
    try:
        return bool(value) and date.fromisoformat(value).isoformat() == value
    except (ValueError, TypeError, AttributeError):
        return False

def https_url(value):
    if not isinstance(value,str):
        return False
    p = urlsplit(value)
    return p.scheme == "https" and bool(p.netloc) and not p.username and not p.password

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--input",type=Path,required=True)
    p.add_argument("--report",type=Path,required=True)
    args=p.parse_args()
    assert args.db.is_file() and args.input.is_file()
    assert not args.report.exists(), "Refuse to overwrite an existing review report"
    taxonomy=json.loads(TAXONOMY.read_text(encoding="utf-8"))
    definitions={d["key"]:d for d in taxonomy["dimensions"]}
    raw=json.loads(args.input.read_text(encoding="utf-8"))
    assert raw.get("schema")=="AO_TLM_USER_CLASSIFICATION_DRAFTS_V1"
    assert raw.get("source_baseline")=="CL27"
    assert raw.get("status")=="RESEARCH_ONLY_UNREVIEWED"
    records=raw.get("records")
    assert isinstance(records,list) and len(records)<=5000
    db=sqlite3.connect(args.db)
    db.row_factory=sqlite3.Row
    assert db.execute("SELECT COUNT(*) FROM canonical_site").fetchone()[0]==2584
    assert db.execute("SELECT COUNT(*) FROM classification_source").fetchone()[0]==2715
    assert db.execute("SELECT COUNT(*) FROM mass_time").fetchone()[0]==4681

    result=[]
    for rowno,r in enumerate(records,1):
        assert isinstance(r,dict)
        assert r.get("public_approval") is False, "User drafts cannot approve publication"
        field,subject,value=r.get("field"),r.get("subject_type"),r.get("value")
        assert field in definitions, f"Unrecognized classification at row {rowno}"
        definition=definitions[field]
        assert subject in definition["subject"], f"Wrong subject scope at row {rowno}"
        assert value in definition.get("values",definition.get("searchable_source_labels",[])),f"Wrong code {field}:{value}"
        siteid=r.get("physical_site_context")
        site=db.execute("SELECT effective_anchor_id FROM canonical_site WHERE group_id=?",(siteid,)).fetchone()
        assert site is not None and site["effective_anchor_id"]==siteid, "Draft must link existing physical anchor"
        sources=r.get("source_ids",[])
        assert isinstance(sources,list) and len(sources)<=20
        assert all(isinstance(x,str) and x.strip() for x in sources)
        url=r.get("source_url")
        if url is not None:
            assert https_url(url), f"Source URL must be a safe HTTPS URL at row {rowno}"
        source_type=r.get("source_type")
        allowed=("PARISH_OFFICIAL","DIOCESE_OFFICIAL","COMMUNITY_OFFICIAL","HOLY_SEE_OFFICIAL",
                 "OFFICIAL_BULLETIN","NATIONAL_ASSOCIATION","SECONDARY_DIRECTORY","USER_SUBMISSION")
        assert source_type in allowed, f"Invalid authority class at row {rowno}"
        recorded_at=r.get("recorded_at")
        if recorded_at is not None:
            assert safe_date(recorded_at), f"Bad evidence date at row {rowno}"
        comment=r.get("evidence_excerpt")
        if comment is not None:
            assert isinstance(comment,str) and len(comment)<=20000
        subjectid=r.get("subject_id")
        if subject=="VENUE" and subjectid is not None:
            assert subjectid==siteid, "Venue subject must match the physical anchor context"
        ids_checked=[]
        for src in sources:
            match=db.execute("SELECT joined_canonical_group_id,classification_merge_state FROM venue_source WHERE source_id=?",(src,)).fetchone()
            if match is None:
                ids_checked.append("UNREGISTERED_SOURCE_ID")
            elif match["joined_canonical_group_id"] is None:
                ids_checked.append("HELD_GROUP_OR_IDENTITY")
            else:
                other=db.execute("SELECT effective_anchor_id FROM canonical_site WHERE group_id=?",(match["joined_canonical_group_id"],)).fetchone()
                ids_checked.append("SOURCE_MATCHES_ANCHOR" if other and other["effective_anchor_id"]==siteid else "SOURCE_LINKS_DIFFERENT_ANCHOR")
        complete=bool(subjectid and sources and url and recorded_at and comment)
        matching=bool(ids_checked) and all(x=="SOURCE_MATCHES_ANCHOR" for x in ids_checked)
        decision="SOURCE_LINKED_PENDING_INDEPENDENT_EVIDENCE_REVIEW" if complete and matching else "HOLD_INCOMPLETE_OR_SOURCE_CROSSWALK"
        result.append({
            "draft_index":rowno,"field":field,"value":value,"scope":subject,
            "physical_site_anchor":siteid,
            "frozen_source_checks":ids_checked,
            "review_gate":decision,"public_approved":False
        })

    summary={
        "submitted_drafts":len(result),
        "source_linked_pending_review":sum(x["review_gate"]=="SOURCE_LINKED_PENDING_INDEPENDENT_EVIDENCE_REVIEW" for x in result),
        "identity_or_evidence_holds":sum(x["review_gate"]!="SOURCE_LINKED_PENDING_INDEPENDENT_EVIDENCE_REVIEW" for x in result),
        "new_public_classifications":0,
        "new_public_mass_times":0
    }
    report={"schema":"AO_CL27_EDITORIAL_DRAFT_AUDIT_V1","status":"RESEARCH_ONLY_NOT_APPROVED",
            "source_baseline":"CL2","summary":summary,"records":result}
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Classification editorial intake:",summary)

if __name__=="__main__":
    main()
