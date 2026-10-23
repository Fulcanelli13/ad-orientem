#!/usr/bin/env python3
"""Read-only B23 reconciliation, one P1 + three P2 exact-source Commons images.
No pre-existing frozen selection, photo or publication decision may be altered.
"""
import csv,json,pathlib,collections,re
from datetime import datetime,timezone
BASE=pathlib.Path("data/research")
def read(path):
    with (BASE/path).open(encoding="utf-8",newline="") as file:return list(csv.DictReader(file))
def write(path,records,fields):
    with (BASE/path).open("w",encoding="utf-8",newline="") as file:
        writer=csv.DictWriter(file,fieldnames=fields,extrasaction="ignore");writer.writeheader();writer.writerows(records)
def main():
    prior=read("sacred-art-catalogue451-after-b22kress.csv")
    p1=read("sacred-art-b23-p1-pentecost.audit.csv")
    p2=read("sacred-art-b23-p2-commons3.audit.csv")
    assert len(prior)==451 and len(p1)==1 and len(p2)==3
    acquisitions=p1+p2
    idmap={r["record_id"]:r for r in acquisitions}
    assert len(idmap)==4 and set(idmap)=={"commons-debray-pentecost","W44-006","podesti-margaret-mary-source","commons-baroncelli-pentecost"}
    assert all(x["download_status"]=="ACQUIRED_DECODED_SHA256" and x["metadata_status"]=="SOURCE_METADATA_VERIFIED" for x in acquisitions)
    assert all(re.fullmatch(r"[0-9a-f]{64}",x["sha256"]) for x in acquisitions)
    assert all(x["editorial_gate"]=="NOT_APPROVED" for x in acquisitions)
    columns=list(prior[0])+["b23_source_id","b23_source_sha256","b23_source_url","b23_file_url","b23_license","b23_license_url",
                            "b23_original_width","b23_original_height","b23_resolution_gate","b23_credit_requirements"]
    checked=[]
    result=[]
    for r in prior:
        row=dict(r,b23_source_id="",b23_source_sha256="",b23_source_url="",b23_file_url="",b23_license="",b23_license_url="",
                     b23_original_width="",b23_original_height="",b23_resolution_gate="",b23_credit_requirements="")
        if row["artwork_id"] in idmap:
            a=idmap[row["artwork_id"]]
            assert r["catalogue_bucket"] in ("COMMONS_429_NO_IMAGE","UNMATCHED_SOURCE_NO_IMAGE")
            assert r["legacy_preview"]=="NO" and r["release_status"]=="HOLD_NO_NEW_APPROVAL"
            assert r["acquired_original_count"]=="0" and r["acquired_print_count"]=="0"
            assert r["legacy_source_url"]==a["source_url"]
            row.update(catalogue_bucket="ACQUIRED_B23_SOURCE_FILE_ORIGINAL",
                collection_need="SOURCE_IMAGE_ACQUIRED_PENDING_FULL_EDITORIAL_QA",
                next_action="VERIFY_ARTWORK_IDENTITY_IMAGE_QUALITY_SCRIPTURE_AND_LICENCE_CREDIT",
                match_basis="EXACT_EXISTING_FROZEN_ARTWORK_ID_AND_SOURCE_URL",
                matched_acquisition_ids=a["asset_source_id"],source_candidates="1",acquired_original_count="1",
                b23_source_id=a["asset_source_id"],b23_source_sha256=a["sha256"],b23_source_url=a["source_url"],
                b23_file_url=a["resolved_original_url"],b23_license=a["metadata_license"],
                b23_license_url=a["metadata_license_url"],b23_original_width=a["decoded_width"],
                b23_original_height=a["decoded_height"],b23_resolution_gate=a["resolution_gate"],
                b23_credit_requirements="ATTRIBUTION_AND_SHAREALIKE_REVIEW" if "BY-SA" in a["metadata_license"].upper() else "RIGHTS_PROVENANCE_REVIEW",
                notes="Acquisition only; original licence compliance, visual historical identity and artwork context remain pending")
            checked.append(row["artwork_id"])
        result.append(row)
    assert len(checked)==4
    missing=[r for r in result if r["catalogue_bucket"] not in ("FROZEN_REJECTED",) and
             r["legacy_preview"]=="NO" and r["acquired_original_count"]=="0" and r["acquired_print_count"]=="0" and
             not r["nga_iiif_sha256"] and not r["kress_image_sha256"]]
    covered=383-len(missing)
    assert len(missing)==43 and covered==340
    assert all(r["priority"]=="P2" for r in missing)
    assert sum(x["frozen_selection"]=="YES" for x in result)==107
    assert sum(x["catalogue_bucket"]=="FROZEN_REJECTED" for x in result)==68
    assert all(x["release_status"]=="HOLD_NO_NEW_APPROVAL" for x in result if x["catalogue_bucket"]!="FROZEN_REJECTED")
    write("sacred-art-catalogue451-after-b23.csv",result,columns)
    write("sacred-art-missing43-after-b23.csv",sorted(missing,key=lambda x:int(x["catalogue_row"])),columns)
    summary={"source_workbook":"Ad_Orientem_Complete_Visual_Asset_Master_Batch19_2026-10-23.xlsx",
             "catalogue_entries":451,"frozen_approved":107,"permanently_rejected":68,"active_artworks":383,
             "active_with_image_or_legacy_preview":340,"active_without_recorded_image":43,
             "missing_by_priority":{"P0":0,"P1":0,"P2":43},
             "catalogue_status_counts":dict(collections.Counter(x["catalogue_bucket"] for x in result)),
             "source_identities_screened":280,"source_identities_with_images":195,
             "original_source_images":149,"CMA_print_derivatives":14,"NGA_IIIF_derivatives":31,"Kress_institution_JPEG":1,
             "previous_commons_429_remaining":82,"previous_source_rights_holds":3,
             "legacy_previews_unverified":150,"B23_new_images":4,"B23_below_resolution_threshold":2,
             "publication_approvals_created":0,"editorial_approvals_created":0,"canonical_excel_modified":False,
             "checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (BASE/"sacred-art-catalogue451-after-b23.summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
