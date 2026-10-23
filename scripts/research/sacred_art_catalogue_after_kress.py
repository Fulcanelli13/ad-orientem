#!/usr/bin/env python3
"""Reconcile institutional Kress K2027 image into the existing frozen 451 artworks.
Read-only research crosswalk; never change selections or app publication state.
"""
import csv,json,pathlib,collections,re
from datetime import datetime,timezone
ROOT=pathlib.Path("data/research")
PRIOR=ROOT/"sacred-art-catalogue451-after-b22.csv"
KRESS=ROOT/"sacred-art-b22-kress-k2027.audit.csv"
OUT=ROOT/"sacred-art-catalogue451-after-b22kress.csv"
MISSING=ROOT/"sacred-art-missing47-after-b22kress.csv"
REPORT=ROOT/"sacred-art-catalogue451-after-b22kress.summary.json"
def read(p):
    with p.open(encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def save(p,rows,h):
    with p.open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=h);w.writeheader();w.writerows(rows)
def main():
    base=read(PRIOR);k=read(KRESS)
    assert len(base)==451 and len(k)==1
    art=k[0];assert art["artwork_id"]=="kress-k2027"
    assert art["acquisition_status"]=="ACQUIRED_INSTITUTION_JPEG_SHA256"
    assert re.fullmatch("[a-f0-9]{64}",art["sha256"])
    assert art["publication_status"]=="HOLD"
    assert int(art["decoded_width"])>=2400 and int(art["decoded_height"])>=2400
    headers=list(base[0].keys())+["kress_image_sha256","kress_source_original_url","kress_tier","kress_dimensions","kress_rights_evidence"]
    out=[];matched=0
    for r in base:
        row=dict(r,kress_image_sha256="",kress_source_original_url="",kress_tier="",kress_dimensions="",kress_rights_evidence="")
        if r["artwork_id"]=="kress-k2027":
            matched+=1
            assert r["catalogue_bucket"]=="UNMATCHED_SOURCE_NO_IMAGE"
            assert r["legacy_preview"]=="NO" and r["acquired_original_count"]=="0"
            assert r["release_status"]=="HOLD_NO_NEW_APPROVAL"
            assert r["legacy_source_url"]==art["source_url"]
            row.update(catalogue_bucket="ACQUIRED_KRESS_INSTITUTION_JPEG",
                collection_need="IMAGE_OBTAINED_INSTITUTIONAL_JPEG",
                match_basis="EXACT_KRESS_K2027_ID_AND_REPOSITORY",
                matched_acquisition_ids="AO-KRESS-K2027",source_candidates="1",
                next_action="VISUAL_QA_OBJECT_IDENTITY_AND_SOURCE_REUSE_VERIFICATION",
                kress_image_sha256=art["sha256"],kress_source_original_url=art["image_url"],
                kress_tier=art["image_tier"],
                kress_dimensions=art["decoded_width"]+"x"+art["decoded_height"],
                kress_rights_evidence=art["source_url"])
        out.append(row)
    assert matched==1
    missing=[r for r in out if r["catalogue_bucket"]!="FROZEN_REJECTED" and
        r["legacy_preview"]=="NO" and r["acquired_original_count"]=="0" and r["acquired_print_count"]=="0" and
        not r["nga_iiif_sha256"] and not r["kress_image_sha256"]]
    assert len(missing)==47
    assert collections.Counter(x["priority"] for x in missing)=={"P1":1,"P2":46}
    assert sum(x["frozen_selection"]=="YES" for x in out)==107
    assert sum(x["catalogue_bucket"]=="FROZEN_REJECTED" for x in out)==68
    save(OUT,out,headers)
    save(MISSING,sorted(missing,key=lambda r:(r["priority"],int(r["catalogue_row"] or 0))),headers)
    summary={
        "source_workbook":"Ad_Orientem_Complete_Visual_Asset_Master_Batch19_2026-10-23.xlsx",
        "total_artwork_entries":451,"frozen_previously_approved":107,"permanently_rejected":68,
        "active_artwork_entries":383,"with_recorded_image_or_preview":336,"without_recorded_image":47,
        "missing_by_priority":dict(collections.Counter(x["priority"] for x in missing)),
        "catalogue_status_counts":dict(collections.Counter(x["catalogue_bucket"] for x in out)),
        "acquisition_source_identities_total":277,"source_identities_with_image_files":191,
        "source_originals":145,"museum_print_derivatives":14,
        "nga_iiif_renditions":31,"kress_institution_downloads":1,
        "deferred_commons":83,"retained_rights_holds":3,
        "legacy_previews_not_release_certified":150,
        "new_visual_qa_approvals":0,"new_editorial_approvals":0,"new_publication_approvals":0,
        "canonical_excel_modified":False,"generated_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    REPORT.write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
