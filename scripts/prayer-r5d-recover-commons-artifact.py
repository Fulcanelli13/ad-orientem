#!/usr/bin/env python3
"""Restore two exact QA-only Commons photos from the 2026-11-04 acquisition artifact.

Never redownload from Wikimedia. Fail closed on missing source proof or drift.
The originating artifact is workflow run 41788484887, artifact 13302342542.
"""
import hashlib, json, shutil, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
ART=Path(sys.argv[1]) if len(sys.argv)>1 else Path("recovered-commons")
EVIDENCE=ART/"r5d-commons-a"/"evidence.json"
DEST=ROOT/"assets/prayer/research/r5d-commons-recovered-originals"
MASTER=json.loads((ROOT/"data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json").read_text())
SOURCE_PAGES={
    "https://commons.wikimedia.org/wiki/File:David_Teniers_the_Elder_-_The_Agony_in_the_Garden.jpg",
    "https://commons.wikimedia.org/wiki/File:Philippe%20de%20Champaigne-Pr%C3%A9sentation%20au%20temple.jpg",
}
records=json.loads(EVIDENCE.read_text())["records"]
selected=[r for r in records if r["source_page"] in SOURCE_PAGES]
if len(selected)!=2 or {r["source_page"] for r in selected}!=SOURCE_PAGES:
    raise SystemExit(f"Expected both selected evidence records; found {len(selected)}")
DEST.mkdir(parents=True,exist_ok=True)
archived=[]
for row in selected:
    if row["status"]!="ACQUIRED_FOR_QA" or row["publication_authorized"] is not False:
        raise SystemExit(f"Missing QA-only acquisition: {row['master_title']}")
    master=next((r for r in MASTER["groups"] if r["sourcePage"]==row["source_page"]),None)
    if not master or sorted(row["approved_slots"])!=sorted(
        slot for slot in master["slots"] if slot not in master["rosaryDeferred"]
    ):
        raise SystemExit(f"Editorial slot mismatch: {row['master_title']}")
    filename=row["research_image_file"]
    original=ART/"r5d-commons-a"/filename
    data=original.read_bytes()
    if len(data)!=row["bytes"] or hashlib.sha256(data).hexdigest()!=row["sha256"]:
        raise SystemExit(f"Original file integrity mismatch: {filename}")
    target=DEST/filename
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest()!=row["sha256"]:
        raise SystemExit(f"Refusing to replace different preserved image: {filename}")
    shutil.copyfile(original,target)
    archived.append({**row,"original_artifact_run":41788484887,"original_artifact_id":13302342542,
                     "permanent_research_path":str(target.relative_to(ROOT)),
                     "publication_authorized":False,"visual_review_status":"PENDING",
                     "reader_qa_status":"PENDING"})
if sum(len(row["approved_slots"]) for row in archived)!=6:
    raise SystemExit("Expected exactly six non-Rosary stage/cover placements")
(DEST/"manifest.json").write_text(json.dumps({
    "schema":"AO_PRAYER_R5D_COMMONS_ARTIFACT_RECOVERY_V1",
    "recovered":2,"approved_placement_candidates":6,
    "publication_authorized":False,"records":archived
},indent=2)+"\n")
print("Restored two hash-matched Commons source images and six assigned slots; not published.")
