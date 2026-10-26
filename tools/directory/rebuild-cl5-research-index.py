#!/usr/bin/env python3
"""Rebuild a standalone CL5 SQLite research index from committed CL2 and CL5 JSON."""
import argparse
import json
import sqlite3
import subprocess
import sys
from pathlib import Path

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    if args.output.exists():
        parser.error("Output already exists; refusing to overwrite")
    base=Path("data/directory/research")
    source=base/"cl5-provisional-intake-20261026/overlay.json"
    with source.open(encoding="utf-8") as fh: data=json.load(fh)
    # CL2's original part hashes, frozen counts and FKs are all checked by its importer.
    cmd=[sys.executable,"tools/directory/rebuild-cl2-research-snapshot.py",
         "--snapshot-dir",str(base/"cl2-unified-20261026"),
         "--output",str(args.output)]
    subprocess.run(cmd,check=True)
    with sqlite3.connect(args.output) as db:
        db.execute("PRAGMA foreign_keys=ON")
        db.executescript("""
        CREATE TABLE cl5_provisional_physical_intake (
          historical_group_id TEXT PRIMARY KEY,
          frozen_source_id TEXT NOT NULL UNIQUE,
          country TEXT NOT NULL,
          site_name TEXT NOT NULL,
          physical_description TEXT NOT NULL,
          source_url TEXT NOT NULL,
          source_authority TEXT NOT NULL,
          physical_type TEXT NOT NULL,
          intake_status TEXT NOT NULL CHECK(intake_status='PROVISIONAL_PHYSICAL_RESEARCH_INTAKE_NOT_CANONICAL'),
          original_CL2_canonical_id INTEGER NOT NULL DEFAULT 0 CHECK(original_CL2_canonical_id=0),
          public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0),
          payload_json TEXT NOT NULL
        );
        CREATE TABLE cl5_institutional_evidence (
          historical_group_id TEXT PRIMARY KEY,
          relationship_role TEXT NOT NULL,
          organization TEXT NOT NULL,
          evidence_url TEXT NOT NULL,
          evidence_scope TEXT NOT NULL,
          source_class TEXT NOT NULL,
          payload_json TEXT NOT NULL
        );
        CREATE TABLE cl5_address_backfills (
          historical_group_id TEXT PRIMARY KEY,
          country TEXT NOT NULL,
          description TEXT NOT NULL,
          evidence_url TEXT NOT NULL,
          physical_type TEXT NOT NULL,
          public_approved INTEGER NOT NULL DEFAULT 0 CHECK(public_approved=0),
          payload_json TEXT NOT NULL
        );
        CREATE TABLE cl5_identity_queue (
          exception_key TEXT PRIMARY KEY,
          historical_group_id TEXT NOT NULL,
          status TEXT NOT NULL,
          evidence_url TEXT,
          original_cl2_flag_open INTEGER NOT NULL CHECK(original_cl2_flag_open=1)
        );
        """)
        for x in data["provisional_physical_intake"]:
            db.execute("INSERT INTO cl5_provisional_physical_intake (historical_group_id,frozen_source_id,country,site_name,physical_description,source_url,source_authority,physical_type,intake_status,payload_json) VALUES (?,?,?,?,?,?,?,?,?,?)",(
            x["historical_group_id"],x["frozen_source_id"],x["country"],x["site_name"],
            x["physical_description"],x["source_url"],x["source_authority"],x["physical_type"],
            x["identity_disposition"],json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for x in data["institutional_classification_evidence"]:
            db.execute("INSERT INTO cl5_institutional_evidence (historical_group_id,relationship_role,organization,evidence_url,evidence_scope,source_class,payload_json) VALUES (?,?,?,?,?,?,?)",(
                x["group_id"],x["organization_role"],x["organization"],x["url"],
                x["scope"],x["source_type"],json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for x in data["additional_address_backfills"]:
            db.execute("INSERT INTO cl5_address_backfills (historical_group_id,country,description,evidence_url,physical_type,payload_json) VALUES (?,?,?,?,?,?)",(
                x["historical_group_id"],x["country"],x["description"],x["first_party_source_url"],
                x["physical_type"],json.dumps(x,ensure_ascii=False,sort_keys=True)))
        for x in data["identity_exception_disposition"]:
            db.execute("INSERT INTO cl5_identity_queue VALUES (?,?,?,?,1)",(
                x["exception_key"],x["historical_group_id"],
                x["classification_status"],x["source_url"]))
        counts={name:db.execute("SELECT COUNT(*) FROM "+name).fetchone()[0] for name in (
            "cl5_provisional_physical_intake","cl5_institutional_evidence",
            "cl5_address_backfills","cl5_identity_queue")}
        assert list(counts.values())==[17,4,5,40],counts
        # Never insert provisional candidates into canonical_site or public application tables.
        assert db.execute("SELECT COUNT(*) FROM canonical_site").fetchone()[0]==2584
        db.commit()
        row=db.execute("PRAGMA integrity_check").fetchone()[0]
        assert row=="ok",row
        print("CL5 SQLite research index built:",args.output)
        print("CL2 canonical_site unchanged at 2,584 historical IDs; supplemental CL5 rows:",counts)
if __name__=="__main__": main()
