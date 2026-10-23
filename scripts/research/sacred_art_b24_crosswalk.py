#!/usr/bin/env python3
"""B24 complete frozen-catalogue source crosswalk; no editorial/rights auto-promotions."""
import csv,json,pathlib,collections,re
from datetime import datetime,timezone
ROOT=pathlib.Path("data/research")
IN="sacred-art-catalogue451-after-b23r2.csv"
B24=("sacred-art-b24-exact8.audit.csv","sacred-art-b24-exact4.audit.csv")
OUT="sacred-art-catalogue451-after-b24.csv"
MISSING="sacred-art-missing-after-b24.csv"
SUMMARY="sacred-art-catalogue451-after-b24.summary.json"
def read(name):
    with (ROOT/name).open(encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def write(name,rows,fields):
    with (ROOT/name).open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
def main():
    old=read(IN);audit=[r for file in B24 for r in read(file)]
    assert len(old)==451 and len({r["artwork_id"] for r in old})==451
    assert len(audit)==12 and len({r["record_id"] for r in audit})==12
    byid={r["record_id"]:r for r in audit}
    fields=list(old[0])+["b24_source_id","b24_original_sha256","b24_license","b24_license_url",
                        "b24_original_url","b24_source_dimensions","b24_technical_resolution",
                        "b24_source_identity_evidence","b24_creative_commons_attribution_gate"]
    result=[];newfiles=[];holds=[]
    for r in old:
        row=dict(r,b24_source_id="",b24_original_sha256="",b24_license="",b24_license_url="",
                 b24_original_url="",b24_source_dimensions="",b24_technical_resolution="",
                 b24_source_identity_evidence="",b24_creative_commons_attribution_gate="")
        auditrow=byid.get(r["artwork_id"])
        if auditrow:
            assert r["frozen_decision"]=="UNREVIEWED" and r["release_status"]=="HOLD_NO_NEW_APPROVAL"
            assert r["legacy_preview"]=="NO" and r["acquired_original_count"]=="0"
            assert r["acquired_print_count"]=="0" and not r["nga_iiif_sha256"] and not r["kress_image_sha256"]
            assert auditrow["metadata_status"]=="SOURCE_METADATA_VERIFIED" and auditrow["editorial_gate"]=="NOT_APPROVED"
            if auditrow["download_status"]=="ACQUIRED_DECODED_SHA256":
                assert re.fullmatch(r"[a-f0-9]{64}",auditrow["sha256"])
                row.update(catalogue_bucket="ACQUIRED_B24_EXACT_OBJECT_SOURCE_FILE",
                    collection_need="SOURCE_IMAGE_ACQUIRED_RELEASE_QA_HOLD",
                    matched_acquisition_ids=auditrow["asset_source_id"],
                    match_basis="EXACT_FROZEN_ARTWORK_ID_AND_CORROBORATED_INSTITUTIONAL_OBJECT",
                    source_candidates="1",acquired_original_count="1",
                    next_action="VERIFY_ORIGINAL_COLOUR_CROP_PHOTO_RIGHTS_EXACT_SCENE_AND_CREDITS",
                    b24_source_id=auditrow["asset_source_id"],b24_original_sha256=auditrow["sha256"],
                    b24_license=auditrow["metadata_license"],b24_license_url=auditrow["metadata_license_url"],
                    b24_original_url=auditrow["resolved_original_url"],
                    b24_source_dimensions=auditrow["decoded_width"]+"x"+auditrow["decoded_height"],
                    b24_technical_resolution=auditrow["resolution_gate"],
                    b24_source_identity_evidence="Institutional object ID/inventory corroboration in B24 source manifest",
                    b24_creative_commons_attribution_gate="ATTRIBUTION_OR_SHAREALIKE_LEGAL_REVIEW" if "CC BY" in auditrow["metadata_license"] else "PUBLIC_DOMAIN_PHOTOGRAPH_SCOPE_REVIEW")
                newfiles.append(r["artwork_id"])
            else:holds.append({"id":r["artwork_id"],"reason":auditrow["download_status"]})
        if row["catalogue_bucket"]!="FROZEN_REJECTED":assert row["release_status"]=="HOLD_NO_NEW_APPROVAL"
        assert row["frozen_decision"]==r["frozen_decision"]
        result.append(row)
    assert len(newfiles)+len(holds)==12
    missing=[r for r in result if r["catalogue_bucket"]!="FROZEN_REJECTED"
             and r["legacy_preview"]=="NO" and int(r["acquired_original_count"] or "0")==0
             and int(r["acquired_print_count"] or "0")==0
             and not r["nga_iiif_sha256"] and not r["kress_image_sha256"]]
    assert len(missing)==43-len(newfiles)
    assert all(r["priority"]=="P2" for r in missing)
    assert sum(r["frozen_selection"]=="YES" for r in result)==107
    assert sum(r["catalogue_bucket"]=="FROZEN_REJECTED" for r in result)==68
    write(OUT,result,fields);write(MISSING,missing,fields)
    summary={"catalogue_count":451,"rejected_artworks":68,"active_artworks":383,
       "original_107_editorial_selections_preserved":107,
       "active_with_image_or_preview":383-len(missing),"active_without_recorded_image":len(missing),
       "new_B24_exact_source_images_acquired":len(newfiles),"new_B24_technical_holds":holds,
       "B24_new_image_resolution_gates":dict(collections.Counter(r["resolution_gate"] for r in audit if r["download_status"]=="ACQUIRED_DECODED_SHA256")),
       "prior_source_identities_screened":280,"source_identities_screened_now":292,
       "prior_source_files_acquired":277,"source_files_acquired_now":277+len(newfiles),
       "legacy_preview_only_before_B24":108,
       "new_editorial_approvals":0,"publication_approvals":0,"canonical_master_excel_modified":False,
       "note":"Image file counts are NOT release approvals; resolution below 2400 and institutional photo rights remain separate human gates.",
       "generated_at":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (ROOT/SUMMARY).write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
