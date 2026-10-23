#!/usr/bin/env python3
"""B25 canonical 451 catalogue acquisition crosswalk — exact Ribera P001092 only."""
import csv,json,pathlib,re
from datetime import datetime,timezone
ROOT=pathlib.Path("data/research")
def read(name):
    with (ROOT/name).open(newline="",encoding="utf-8") as f:return list(csv.DictReader(f))
def write(name,rows,headers):
    with (ROOT/name).open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=headers);w.writeheader();w.writerows(rows)
def main():
    prior=read("sacred-art-catalogue451-after-b24.csv")
    audit=read("sacred-art-b25-ribera-jude.audit.csv")
    assert len(prior)==451 and len(audit)==1
    a=audit[0]
    assert a["record_id"]=="ART-usepe-de-ibera-aint-udas-haddeus"
    assert a["asset_source_id"]=="AO-B25-RIBERA-P001092"
    assert a["metadata_status"]=="SOURCE_METADATA_VERIFIED"
    assert a["download_status"]=="ACQUIRED_DECODED_SHA256"
    assert re.fullmatch(r"[a-f0-9]{64}",a["sha256"])
    assert a["editorial_gate"]=="NOT_APPROVED"
    fieldnames=list(prior[0])+["b25_source_id","b25_source_sha256","b25_technical_resolution","b25_source_file_url","b25_photo_license","b25_object_accession"]
    out=[];updated=0
    for old in prior:
        row=dict(old,b25_source_id="",b25_source_sha256="",b25_technical_resolution="",b25_source_file_url="",b25_photo_license="",b25_object_accession="")
        if row["artwork_id"]==a["record_id"]:
            updated+=1
            assert old["catalogue_bucket"] in ("NO_SOURCE_NO_IMAGE","UNMATCHED_SOURCE_NO_IMAGE")
            assert old["frozen_decision"]=="UNREVIEWED" and old["legacy_preview"]=="NO"
            assert old["release_status"]=="HOLD_NO_NEW_APPROVAL"
            row.update(
              catalogue_bucket="ACQUIRED_B25_PRADO_JUDAS_SOURCE_JPEG",
              collection_need="SOURCE_IMAGE_PRESENT_BUT_RESOLUTION_RIGHTS_QA_HOLD",
              matched_acquisition_ids=a["asset_source_id"],match_basis="EXACT_PRADO_P001092_NOT_NG6577_OR_P001085",
              acquired_original_count="1",source_candidates="1",
              next_action="RESOLUTION_BELOW_2400_FIND_BETTER_FILE_VERIFY_PHOTO_RIGHTS_ART_IDENTITY_AND_CREDIT",
              b25_source_id=a["asset_source_id"],b25_source_sha256=a["sha256"],
              b25_technical_resolution=a["resolution_gate"],b25_source_file_url=a["resolved_original_url"],
              b25_photo_license=a["metadata_license"],b25_object_accession="P001092",
              notes="Confirmed museum Saint Judas inventory P001092; not NG6577 ambiguous apostle nor attributed P001085. Image under preferred 2400px. Publication HOLD.")
        assert row["frozen_decision"]==old["frozen_decision"] and row["release_status"]==old["release_status"]
        out.append(row)
    assert updated==1
    missing=[r for r in out if r["catalogue_bucket"]!="FROZEN_REJECTED" and
      r["legacy_preview"]=="NO" and int(r["acquired_original_count"] or "0")==0 and
      int(r["acquired_print_count"] or "0")==0 and not r["nga_iiif_sha256"] and not r["kress_image_sha256"]]
    assert len(missing)==30
    assert sum(r["frozen_selection"]=="YES" for r in out)==107
    assert sum(r["catalogue_bucket"]=="FROZEN_REJECTED" for r in out)==68
    write("sacred-art-catalogue451-after-b25.csv",out,fieldnames)
    write("sacred-art-missing30-after-b25.csv",missing,fieldnames)
    s={"catalogue_total":451,"active_artworks":383,"rejected_preserved":68,"frozen_approved_preserved":107,
       "active_with_image_or_preview":353,"active_no_image":30,"new_images_collected":1,
       "B25_exact_inventory":"P001092","B25_original_resolution_gate":a["resolution_gate"],
       "source_identities_screened":293,"source_identities_with_files":290,
       "new_editorial_approvals":0,"new_publication_approvals":0,"canonical_excel_modified":False,
       "verified_at":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (ROOT/"sacred-art-catalogue451-after-b25.summary.json").write_text(json.dumps(s,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(s,sort_keys=True))
if __name__=="__main__":main()
