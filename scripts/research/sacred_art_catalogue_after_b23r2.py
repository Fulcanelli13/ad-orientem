#!/usr/bin/env python3
"""Reconcile both B23 Commons cooldown waves onto the read-only 451-art catalogue.

Only records with exact 64-byte source image hashes become technically acquired.
Frozen decisions and publication holds are immutable. Existing legacy previews
remain represented, even when a new independent source image has been acquired.
"""
import csv,json,pathlib,re,collections
from datetime import datetime,timezone
DIR=pathlib.Path("data/research")
def read(name):
    with (DIR/name).open(encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def save(name,rows,fields):
    with (DIR/name).open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)
def main():
    master=read("sacred-art-catalogue451-after-b23.csv")
    a=read("sacred-art-b23-commons82.audit.csv")
    b=read("sacred-art-b23r2-commons47.audit.csv")
    c=read("sacred-art-b23r3-mpo1.audit.csv")
    assert len(master)==451 and len(a)==82 and len(b)==47 and len(c)==1
    seen=set()
    merged={}
    for record in a+b+c:
        sid=record["asset_source_id"]
        # 47 R2 identities are repeated in the earlier 82-row research manifest.
        # The initial queue status is intentionally superseded only by R2.
        if sid in merged and merged[sid]["download_status"]!="QUEUED_AFTER_FILE_LIMIT":
            if not (sid=="AO-SRC-D731162493ACD4" and merged[sid]["download_status"]=="DOWNLOAD_OR_DECODE_FAILED" and record["format"]=="MPO"):
                raise ValueError("Unexpected prior result overwritten for "+sid)
        seen.add(sid)
        merged[sid]=record
    assert len(merged)==82
    acquired={sid:r for sid,r in merged.items() if r["download_status"]=="ACQUIRED_DECODED_SHA256"}
    assert all(re.fullmatch(r"[0-9a-f]{64}",r["sha256"]) for r in acquired.values())
    assert all(r["editorial_gate"]=="NOT_APPROVED" for r in acquired.values())
    assert len(acquired)==82
    assert sum(r["format"]=="MPO" for r in acquired.values())==1
    columns=list(master[0])+["b23_bulk_source_ids","b23_bulk_original_sha256","b23_bulk_original_url",
             "b23_bulk_license_metadata","b23_bulk_resolution_gate","b23_bulk_mpo_format_hold"]
    result=[];enhanced=[];missing_gaps_recovered=[]
    for item in master:
        row=dict(item,b23_bulk_source_ids="",b23_bulk_original_sha256="",b23_bulk_original_url="",
                 b23_bulk_license_metadata="",b23_bulk_resolution_gate="",b23_bulk_mpo_format_hold="NO")
        sid_list=[x.strip() for x in row["matched_acquisition_ids"].split("|") if x.strip()]
        additions=[acquired[sid] for sid in sid_list if sid in acquired]
        if item["catalogue_bucket"]=="FROZEN_REJECTED":
            assert not additions or item["frozen_decision"]=="PERMANENTLY_REJECTED"
            result.append(row);continue
        if additions:
            row.update(b23_bulk_source_ids=" | ".join(x["asset_source_id"] for x in additions),
                b23_bulk_original_sha256=" | ".join(x["sha256"] for x in additions),
                b23_bulk_original_url=" | ".join(x["resolved_original_url"] for x in additions),
                b23_bulk_license_metadata=" | ".join(x["metadata_license"] for x in additions),
                b23_bulk_resolution_gate=" | ".join(x["resolution_gate"] for x in additions),
                b23_bulk_mpo_format_hold="YES" if any(x["format"]=="MPO" for x in additions) else "NO")
            if int(item["acquired_original_count"] or 0)==0 and not item["nga_iiif_sha256"] and not item["kress_image_sha256"] and int(item["acquired_print_count"] or 0)==0:
                row["catalogue_bucket"]="ACQUIRED_B23_COOLDOWN_ORIGINAL_WITH_LEGACY_PREVIEW" if item["legacy_preview"]=="YES" else "ACQUIRED_B23_COOLDOWN_ORIGINAL"
                row["collection_need"]="ORIGINAL_FILE_ACQUIRED_FROM_VERIFIED_SOURCE_PENDING_EDITORIAL_QA"
                row["acquired_original_count"]=str(len(additions))
                row["next_action"]="HUMAN_IMAGE_IDENTITY_CROP_SOURCE_LICENCE_AND_SCRIPTURE_QA"
                if item["legacy_preview"]=="NO":missing_gaps_recovered.append(item["artwork_id"])
            enhanced.append(item["artwork_id"])
        assert row["frozen_decision"]==item["frozen_decision"]
        assert row["release_status"]=="HOLD_NO_NEW_APPROVAL"
        result.append(row)
    missing=[r for r in result if r["catalogue_bucket"]!="FROZEN_REJECTED"
             and r["legacy_preview"]=="NO"
             and int(r["acquired_original_count"] or 0)==0
             and int(r["acquired_print_count"] or 0)==0
             and not r["nga_iiif_sha256"] and not r["kress_image_sha256"]]
    assert len(missing)==43-len(missing_gaps_recovered),(len(missing),missing_gaps_recovered)
    assert all(r["priority"]=="P2" for r in missing)
    assert sum(r["frozen_selection"]=="YES" for r in result)==107
    assert sum(r["catalogue_bucket"]=="FROZEN_REJECTED" for r in result)==68
    save("sacred-art-catalogue451-after-b23r2.csv",result,columns)
    save("sacred-art-missing-after-b23r2.csv",missing,columns)
    statuses=collections.Counter(r["download_status"] for r in merged.values())
    summary={
        "catalogue_entries":451,"active_artwork_entries":383,"prior_frozen_approvals_preserved":107,
        "permanently_rejected":68,"active_artwork_entries_with_image_or_preview":383-len(missing),
        "active_artwork_entries_without_image":len(missing),
        "missing_priority_breakdown":dict(collections.Counter(r["priority"] for r in missing)),
        "B23_recovered_source_images_from_original_82":len(acquired),
        "B23_82_identity_status_counts":dict(statuses),
        "B23_artwork_entries_with_new_original_source":len(enhanced),
        "B23_previously_image_less_artworks_recovered":len(missing_gaps_recovered),
        "B23_native_MPO_originals_under_format_hold":1,
        "B23_newly_covered_frozen_ids":missing_gaps_recovered,
        "B23_legacy_preview_only_remaining":sum(r["catalogue_bucket"]=="LEGACY_PREVIEW_ONLY" for r in result),
        "canonical_excel_modified":False,"new_editorial_approvals":0,"new_publication_approvals":0,
        "source_identities_screened":280,"source_identities_with_files":195+len(acquired),
        "prior_rights_holds":3,"unacquired_in_82":82-len(acquired),
        "updated_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    (DIR/"sacred-art-catalogue451-after-b23r2.summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
