#!/usr/bin/env python3
"""Reconcile the 245 existing B20/B21 source identities without publishing art.

This combines immutable source audit rows. Do not use to promote editorial artwork.
"""
import csv, json, pathlib, re
from collections import Counter
from datetime import datetime, timezone

BASE = pathlib.Path("data/research")
INPUTS = {
    "b20": BASE/"sacred-art-b20-wave150.audit.csv",
    "b21": BASE/"sacred-art-b21-museum95.audit.csv",
    "b21r1": BASE/"sacred-art-b21r1-budget16.audit.csv",
    "b21r2": BASE/"sacred-art-b21r2-cma9.audit.csv",
    "b20r1": BASE/"sacred-art-b20r1-cma10.audit.csv"
}
FIELDS = [
    "asset_source_id","record_id","source_sheet","source_row","title","artist","source_type",
    "source_url","source_evidence_link","related_records","recorded_rights_unverified",
    "metadata_license","metadata_license_url","institution_public_domain","rights_gate",
    "original_file_url","original_sha256","original_bytes","original_width","original_height","original_format",
    "museum_print_url","museum_print_sha256","museum_print_bytes","museum_print_width","museum_print_height","museum_print_format",
    "acquisition_tier","technical_status","quality_gate","visual_qa_status","scripture_placement_status",
    "editorial_approval","release_status","last_failure_or_hold","source_audit_provenance"
]
def read(path):
    with path.open(newline="",encoding="utf-8") as file:return list(csv.DictReader(file))
def good_sha(v):
    return bool(re.fullmatch(r"[a-fA-F0-9]{64}",v or ""))
def yesoriginal(row, other, label):
    sha=other.get("sha256","")
    if not good_sha(sha):raise ValueError(f"Missing valid original hash for {label}: {row['asset_source_id']}")
    row.update(original_file_url=other.get("resolved_original_url") or other.get("image_url") or row["original_file_url"],
               original_sha256=sha,original_bytes=other.get("bytes_acquired") or row["original_bytes"],
               original_width=other.get("decoded_width") or row["original_width"],
               original_height=other.get("decoded_height") or row["original_height"],
               original_format=other.get("format") or other.get("decoded_format") or row["original_format"],
               technical_status="SOURCE_ORIGINAL_DOWNLOADED_HASHED")
    row["quality_gate"]=other.get("resolution_gate") or other.get("quality_gate") or row["quality_gate"]
    row["source_audit_provenance"] += " | "+label
def yesprint(row,other,label):
    sha=other.get("sha256","")
    if not good_sha(sha):raise ValueError(f"Missing valid print hash for {label}: {row['asset_source_id']}")
    row.update(museum_print_url=other.get("image_url",""),museum_print_sha256=sha,
               museum_print_bytes=other.get("bytes_acquired",""),museum_print_width=other.get("decoded_width",""),
               museum_print_height=other.get("decoded_height",""),museum_print_format=other.get("decoded_format",""),
               technical_status="MUSEUM_PRINT_DERIVATIVE_DOWNLOADED_HASHED")
    row["quality_gate"]=other.get("quality_gate") or row["quality_gate"]
    row["source_audit_provenance"] += " | "+label
def main():
    source={key:read(path) for key,path in INPUTS.items()}
    for key,n in {"b20":150,"b21":95,"b21r1":16,"b21r2":9,"b20r1":10}.items():
        if len(source[key])!=n:raise ValueError(f"{key}: expected {n} rows, got {len(source[key])}")
    data={}
    for wave in ("b20","b21"):
        for old in source[wave]:
            sid=old["asset_source_id"]
            if sid in data:raise ValueError("Duplicated source ID across waves: "+sid)
            row={k:"" for k in FIELDS}
            row.update(asset_source_id=sid,record_id=old.get("record_id",""),source_sheet=old.get("source_sheet",""),
                source_row=old.get("source_row",""),title=old.get("title",""),artist=old.get("artist",""),
                source_type=old.get("source_type",""),source_url=old.get("source_url",""),
                source_evidence_link=old.get("source_evidence_link",""),related_records=old.get("related_records",""),
                recorded_rights_unverified=old.get("rights_claim_unverified",""),
                metadata_license=old.get("metadata_license",""),metadata_license_url=old.get("metadata_license_url",""),
                institution_public_domain=old.get("institution_public_domain",""),
                rights_gate=old.get("rights_gate",""),acquisition_tier="NONE",technical_status="NOT_ACQUIRED",
                quality_gate=old.get("resolution_gate",""),visual_qa_status="NOT_INSPECTED",
                scripture_placement_status="NOT_APPROVED",editorial_approval="NOT_APPROVED",
                release_status="HOLD",last_failure_or_hold=old.get("failure",""),
                source_audit_provenance=f"data/research/sacred-art-{wave}-"+("wave150" if wave=="b20" else "museum95")+".audit.csv")
            status=old.get("download_status","")
            if status in ("ACQUIRED_DECODED_SHA256","VERIFIED_PRIOR_BATCH19"):
                yesoriginal(row,old,wave+":"+status)
            elif status=="SKIPPED_HOLD":
                row["technical_status"]="HOLD_RIGHTS"
            elif "429" in old.get("failure",""):
                row["technical_status"]="DEFERRED_COMMONS_HTTP_429"
            elif "over wave byte budget" in old.get("failure",""):
                row["technical_status"]="DEFERRED_BYTE_BUDGET"
            elif "over individual size cap" in old.get("failure",""):
                row["technical_status"]="HOLD_OVERSIZED_ORIGINAL"
            else:
                row["technical_status"]="REQUIRES_MANUAL_RESOLUTION"
            data[sid]=row
    for wave in ("b21r1","b21r2","b20r1"):
        for patch in source[wave]:
            sid=patch["asset_source_id"]
            if sid not in data:raise ValueError(f"{wave} introduced undocumented original identity: {sid}")
            row=data[sid]
            st=patch.get("download_status") or patch.get("acquisition_status")
            if st in ("ACQUIRED_DECODED_SHA256","ACQUIRED_ORIGINAL_SHA256"):
                if row["original_sha256"]:raise ValueError("Overwriting pre-existing original for "+sid)
                yesoriginal(row,patch,wave+":"+st)
            elif st=="ACQUIRED_PRINT_DERIVATIVE_SHA256":
                if row["original_sha256"] or row["museum_print_sha256"]:raise ValueError("Conflicting image acquisition for "+sid)
                yesprint(row,patch,wave+":"+st)
            elif st in ("HELD_FILE_EXCEEDS_SIZE_CAP","SKIPPED_RIGHTS_GATE","REQUIRES_OBJECT_OR_IMAGE_REVIEW"):
                row["technical_status"]="HOLD_OVERSIZED_ORIGINAL" if st=="HELD_FILE_EXCEEDS_SIZE_CAP" else "REQUIRES_MANUAL_RESOLUTION"
                row["last_failure_or_hold"]=patch.get("failure") or patch.get("error") or st
                row["source_audit_provenance"]+=" | "+wave+":"+st
    for row in data.values():
        tier=("ORIGINAL" if row["original_sha256"] else "MUSEUM_PRINT_DERIVATIVE" if row["museum_print_sha256"] else "NONE")
        row["acquisition_tier"]=tier
        if tier=="NONE" and row["technical_status"]=="NOT_ACQUIRED":raise ValueError("Unexplained no-image source: "+row["asset_source_id"])
    counters=Counter(row["acquisition_tier"] for row in data.values())
    residual=Counter(row["technical_status"] for row in data.values() if row["acquisition_tier"]=="NONE")
    assert len(data)==245, len(data)
    assert counters==Counter({"ORIGINAL":145,"MUSEUM_PRINT_DERIVATIVE":14,"NONE":86}),counters
    assert residual==Counter({"DEFERRED_COMMONS_HTTP_429":83,"HOLD_RIGHTS":3}),residual
    assert all(row["release_status"]=="HOLD" for row in data.values())
    assert all(row["editorial_approval"]=="NOT_APPROVED" for row in data.values())
    target=BASE/"sacred-art-acquisition-245-source-rollup.csv"
    with target.open("w",newline="",encoding="utf-8") as out:
        w=csv.DictWriter(out,fieldnames=FIELDS);w.writeheader();w.writerows(data.values())
    summary={
        "version":"B19-B21-B20R1-B21R2", "source_count":len(data),
        "source_coverage":dict(counters), "non_acquired_exception_count":dict(residual),
        "with_image_file":counters["ORIGINAL"]+counters["MUSEUM_PRINT_DERIVATIVE"],
        "new_visual_qa_approvals":0,"new_editorial_approvals":0,"new_publication_releases":0,
        "source_of_truth":"Ad_Orientem_Complete_Visual_Asset_Master_Batch19_2026-10-23.xlsx",
        "notes":"Research-side reconciliation export only; canonical Excel workbook not overwritten. Original image and museum print derivative have distinct hashes/columns. 245 records are not the entire artwork catalogue.",
        "produced_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    (BASE/"sacred-art-acquisition-245-source-rollup.summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps(summary,indent=2))
if __name__=="__main__":main()
