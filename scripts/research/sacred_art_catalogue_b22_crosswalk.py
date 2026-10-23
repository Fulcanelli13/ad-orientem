#!/usr/bin/env python3
"""Add NGA B22 image-level IIIF evidence to prior full-catalogue audit.
Preserve original frozen decisions and source snapshot; no app promotion.
"""
import collections,csv,json,pathlib,re
from datetime import datetime,timezone
ROOT=pathlib.Path("data/research")
BASE=ROOT/"sacred-art-catalogue451-reconciliation.csv"
NGA=ROOT/"sacred-art-b22-nga31.audit.csv"
OUT=ROOT/"sacred-art-catalogue451-after-b22.csv"
REPORT=ROOT/"sacred-art-catalogue451-after-b22.summary.json"
MISSING=ROOT/"sacred-art-missing48-after-b22.csv"
def read(path):
    with path.open(encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def save(path,rows,fields):
    with path.open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)
def main():
    original=read(BASE);images=read(NGA)
    assert len(original)==451 and len(images)==31
    assert len({r['artwork_id'] for r in original})==451
    assert len({r['artwork_id'] for r in images})==31
    assert all(i["acquisition_status"]=="ACQUIRED_IIIF_RENDITION_HASHED" for i in images)
    assert all(i["metadata_gate"]=="OPENACCESS_IMAGE_ROW_VERIFIED" and i["image_openaccess"]=="1" for i in images)
    assert all(re.fullmatch(r"[a-f0-9]{64}",i["sha256"]) for i in images)
    im={r["artwork_id"]:r for r in images}
    records=[];changed=[]
    fields=list(original[0].keys())+["nga_iiif_sha256","nga_iiif_rendition_url","nga_openaccess_image_uuid","image_acquisition_metadata_source"]
    for x in original:
        row=dict(x,nga_iiif_sha256="",nga_iiif_rendition_url="",nga_openaccess_image_uuid="",image_acquisition_metadata_source="")
        if x["artwork_id"] in im:
            info=im[x["artwork_id"]]
            assert x["catalogue_bucket"]=="UNMATCHED_SOURCE_NO_IMAGE",(x["artwork_id"],x["catalogue_bucket"])
            assert x["legacy_preview"]=="NO" and x["acquired_original_count"]=="0" and x["acquired_print_count"]=="0"
            assert re.search(r"/artworks/"+info["object_id"]+r"(?:-|$)",x["legacy_source_url"])
            row.update(
                catalogue_bucket="ACQUIRED_NGA_IIIF_RENDITION",
                collection_need="IMAGE_ALREADY_OBTAINED_IIIF_DERIVATIVE",
                match_basis="EXACT_NGA_OBJECT_ID_FROM_FROZEN_SOURCE",
                matched_acquisition_ids=info["asset_source_id"],
                source_candidates="1",
                next_action="HUMAN_VISUAL_AND_SCRIPTURE_QA_IIIF_IMAGE_NOT_ARCHIVAL_ORIGINAL",
                nga_iiif_sha256=info["sha256"],
                nga_iiif_rendition_url=info["iiif_image_url"],
                nga_openaccess_image_uuid=info["image_uuid"],
                image_acquisition_metadata_source="data/research/sacred-art-b22-nga31.audit.csv",
                notes="NGA image.openaccess=1; rights and art/Scripture suitability still require editorial QA")
            assert row["release_status"]=="HOLD_NO_NEW_APPROVAL"
            changed.append(row["artwork_id"])
        records.append(row)
    assert len(changed)==31
    buckets=collections.Counter(r["catalogue_bucket"] for r in records)
    active=[r for r in records if r["catalogue_bucket"]!="FROZEN_REJECTED"]
    missing=[r for r in active if r["legacy_preview"]=="NO" and r["acquired_original_count"]=="0" and r["acquired_print_count"]=="0" and not r["nga_iiif_sha256"]]
    covered=[r for r in active if r not in missing]
    assert len(active)==383 and len(covered)==335 and len(missing)==48
    assert buckets["ACQUIRED_NGA_IIIF_RENDITION"]==31
    assert collections.Counter(r["priority"] for r in missing)=={"P1":2,"P2":46}
    assert sum(r["frozen_selection"]=="YES" for r in records)==107
    assert sum(r["catalogue_bucket"]=="FROZEN_REJECTED" for r in records)==68
    assert all(r["release_status"]=="HOLD_NO_NEW_APPROVAL" for r in active)
    assert all(r["legacy_release_certified"]=="NO" for r in records)
    save(OUT,records,fields)
    save(MISSING,sorted(missing,key=lambda r:(r["priority"],int(r["catalogue_row"] or "0"))),fields)
    summary={
        "source_workbook":"Ad_Orientem_Complete_Visual_Asset_Master_Batch19_2026-10-23.xlsx",
        "catalogue_total":451,"frozen_previously_approved":107,"frozen_permanently_rejected":68,
        "active_entries":383,"with_recorded_image_or_preview":335,"without_recorded_image":48,
        "missing_by_priority":dict(collections.Counter(r["priority"] for r in missing)),
        "status_counts":dict(buckets),"new_nga_image_level_openaccess_verified":31,
        "acquisition_source_identities_b19_to_b22":276,
        "source_identities_with_image_files_b19_to_b22":190,
        "source_originals_acquired":145,"museum_print_derivatives_acquired":14,
        "nga_openaccess_iiif_renditions_acquired":31,
        "old_commons_rate_limited":83,"old_rights_holds":3,
        "new_editorial_approvals":0,"new_publication_approvals":0,
        "canonical_excel_modified":False,
        "notes":"Source counts are not artwork counts; 150 legacy previews remain uncertified. NGA IIIF renditions are not originals.",
        "timestamp_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    REPORT.write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True))
if __name__=="__main__":main()
