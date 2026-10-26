#!/usr/bin/env python3
"""Recreate original CL2 SQLite + queryable CL5 and CL6 evidence tables, with no public import."""
import argparse
import json
import sqlite3
import subprocess
import sys
from pathlib import Path

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",type=Path,required=True)
    a=ap.parse_args()
    if a.output.exists():
        ap.error("Refusing to overwrite an existing file")
    subprocess.run([sys.executable, "tools/directory/rebuild-cl5-research-index.py",
                    "--output",str(a.output)],check=True)
    src=Path("data/directory/research/cl6-source-reconciliation-20261026/overlay.json")
    with src.open(encoding="utf-8") as f: d=json.load(f)
    assert d["release_state"]=="NO_PUBLIC_CHANGES_NO_CANONICAL_ADMISSION"
    with sqlite3.connect(a.output) as db:
        db.execute("PRAGMA foreign_keys=ON")
        db.executescript("""
        CREATE TABLE cl6_source_review (
          historical_group_id TEXT PRIMARY KEY,
          frozen_source_id TEXT NOT NULL UNIQUE,
          country TEXT NOT NULL,
          name TEXT NOT NULL,
          disposition TEXT NOT NULL,
          source_url TEXT,
          source_type TEXT,
          reconciled_to_canonical INTEGER NOT NULL CHECK(reconciled_to_canonical=0),
          new_current_schedule_approved INTEGER NOT NULL CHECK(new_current_schedule_approved=0),
          public_place_approved INTEGER NOT NULL CHECK(public_place_approved=0),
          provenance_json TEXT NOT NULL
        );
        CREATE TABLE cl6_address_backfill (
          historical_group_id TEXT PRIMARY KEY,
          frozen_anchor_id TEXT NOT NULL,
          country TEXT NOT NULL,
          site_name TEXT NOT NULL,
          description TEXT NOT NULL,
          source_url TEXT NOT NULL,
          source_authority TEXT NOT NULL,
          site_type TEXT NOT NULL,
          precision TEXT NOT NULL,
          public_map_approved INTEGER NOT NULL CHECK(public_map_approved=0),
          provenance_json TEXT NOT NULL
        );
        CREATE TABLE cl6_identity_holds (
          exception_key TEXT PRIMARY KEY,
          historical_group_id TEXT NOT NULL,
          status TEXT NOT NULL CHECK(status='OPEN_RESEARCH_ONLY'),
          canonical_join_approved INTEGER NOT NULL CHECK(canonical_join_approved=0)
        );
        CREATE TABLE cl6_safeguards (
          issue_code TEXT PRIMARY KEY,
          historical_group_id TEXT NOT NULL,
          disposition TEXT NOT NULL,
          evidence_url TEXT NOT NULL,
          provenance_json TEXT NOT NULL
        );
        """)
        for x in d["classification_only_source_review"]:
            db.execute("""INSERT INTO cl6_source_review VALUES (?,?,?,?,?,?,?,?,?,?,?)""", (
                x["frozen_group_id"],x["frozen_source_id"],x["country"],x["name"],
                x["disposition"],x["additional_evidence_url"],x["source_type"],0,0,0,
                json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for x in d["location_backfills"]:
            db.execute("""INSERT INTO cl6_address_backfill VALUES (?,?,?,?,?,?,?,?,?,?,?)""", (
                x["historical_group_id"],x["frozen_anchor_id"],x["country"],x["site_name"],
                x["physical_description"],x["evidence_url"],x["evidence_authority"],
                x["site_type"],x["precision"],0,json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for x in d["identity_queue"]:
            db.execute("""INSERT INTO cl6_identity_holds VALUES (?,?,?,0)""",(
                x["exception_key"],x["historical_group_id"],x["status"]))
        for x in d["exception_safeguards"]:
            db.execute("""INSERT INTO cl6_safeguards VALUES (?,?,?,?,?)""",(
                x["code"],x["group_id"],x["disposition"],x["evidence_url"],
                json.dumps(x,ensure_ascii=False,sort_keys=True)))
        got=[db.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0] for name in [
            "canonical_site","cl5_provisional_physical_intake","cl6_source_review",
            "cl6_address_backfill","cl6_identity_holds","cl6_safeguards"]]
        assert got==[2584,17,17,9,40,6],got
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
        db.commit()
        print("CL6 standalone SQLite research master reconstructed successfully:",a.output)
        print("Counts: canonical_site=2584, CL5 leads=17, CL6 source reviews=17,",
              "CL6 new descriptions=9, open exceptions=40, source safeguards=6")
if __name__=="__main__": main()
