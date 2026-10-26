#!/usr/bin/env python3
"""Reconstruct CL2–CL7 research master from only GitHub-committed source files."""
import argparse
import json
import sqlite3
import subprocess
import sys
from pathlib import Path

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",required=True,type=Path)
    args=parser.parse_args()
    if args.output.exists(): parser.error("Destination already exists; refusing overwrite")
    subprocess.run([sys.executable,"tools/directory/rebuild-cl6-research-index.py",
                    "--output",str(args.output)],check=True)
    with Path("data/directory/research/cl7-final-description-screen-20261026/overlay.json").open(
            encoding="utf-8") as f:
        doc=json.load(f)
    assert doc["release_state"]=="RESEARCH_ONLY_NOT_PUBLIC_NO_CANONICAL_CHANGE"
    with sqlite3.connect(args.output) as db:
        db.execute("PRAGMA foreign_keys=ON")
        db.executescript("""
        CREATE TABLE cl7_description (
          historical_group_id TEXT PRIMARY KEY,
          original_anchor_id TEXT NOT NULL,
          country TEXT NOT NULL,
          site_name TEXT NOT NULL,
          physical_description TEXT NOT NULL,
          evidence_url TEXT NOT NULL,
          evidence_class TEXT NOT NULL,
          physical_site_type TEXT NOT NULL,
          precision TEXT NOT NULL,
          published INTEGER NOT NULL DEFAULT 0 CHECK(published=0),
          recurrent_1962_mass_approved INTEGER NOT NULL DEFAULT 0 CHECK(recurrent_1962_mass_approved=0),
          full_provenance_json TEXT NOT NULL
        );
        CREATE TABLE cl7_remaining_description_queue (
          historical_group_id TEXT PRIMARY KEY,
          country TEXT NOT NULL,
          site_name TEXT NOT NULL,
          disposition TEXT NOT NULL
        );
        CREATE TABLE cl7_residual_b92_hold (
          historical_group_id TEXT PRIMARY KEY,
          frozen_source_id TEXT NOT NULL UNIQUE,
          country TEXT NOT NULL,
          site_name TEXT NOT NULL,
          hold_state TEXT NOT NULL CHECK(hold_state='HOLD')
        );
        CREATE TABLE cl7_release_hazard (
          historical_group_id TEXT PRIMARY KEY,
          problem TEXT NOT NULL,
          evidence_url TEXT NOT NULL,
          release_state TEXT NOT NULL
        );
        """)
        for r in doc["description_backfills"]:
            db.execute("""INSERT INTO cl7_description (
              historical_group_id,original_anchor_id,country,site_name,physical_description,
              evidence_url,evidence_class,physical_site_type,precision,full_provenance_json
            ) VALUES (?,?,?,?,?,?,?,?,?,?)""",(
                r["historical_group_id"],r["original_anchor_id"],r["country"],r["site_name"],
                r["physical_description"],r["source_url"],r["evidence_class"],
                r["physical_site_type"],r["precision"],
                json.dumps(r,ensure_ascii=False,sort_keys=True)
            ))
        for r in doc["description_queue"]:
            db.execute("INSERT INTO cl7_remaining_description_queue VALUES (?,?,?,?)",(
                r["group_id"],r["country"],r["site_name"],r["review_disposition"]))
        for r in doc["ten_b92_source_only_review_holds"]:
            db.execute("INSERT INTO cl7_residual_b92_hold VALUES (?,?,?,?,?)",(
                r["historical_group_id"],r["frozen_source_id"],r["country"],
                r["site_name"],r["canonical_admission"]))
        for r in doc["release_hazards"]:
            db.execute("INSERT INTO cl7_release_hazard VALUES (?,?,?,?)",(
                r["group_id"],r["issue"],r["evidence_url"],r["public_state"]))
        expected={"canonical_site":2584,"cl5_provisional_physical_intake":17,
                  "cl6_source_review":17,"cl7_description":13,
                  "cl7_remaining_description_queue":49,
                  "cl7_residual_b92_hold":10,"cl7_release_hazard":6}
        got={k:db.execute("SELECT COUNT(*) FROM "+k).fetchone()[0] for k in expected}
        assert got==expected,(got,expected)
        assert db.execute("SELECT COUNT(*) FROM cl7_remaining_description_queue WHERE disposition='HOLD_MISSING_SUFFICIENT_PHYSICAL_DESCRIPTION'").fetchone()[0]==36
        assert db.execute("PRAGMA integrity_check").fetchone()[0]=="ok"
        assert db.execute("PRAGMA foreign_key_check").fetchall()==[]
        db.commit()
    print("CL7 complete research master rebuilt from committed data:",args.output)
    print("Tables:",got)

if __name__=="__main__": main()
