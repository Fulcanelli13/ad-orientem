#!/usr/bin/env python3
"""Merge 27 verified Commons file-rights pages into canonical 383 licence audit.

Licence only: do not claim archived SHA-256 identity from a Commons SHA-1
metadata page; no image downloads, no visual inspection, no production.
"""
from __future__ import annotations
import csv,json
from collections import Counter
from pathlib import Path
D=Path("data/calendar")
mainfile=D/"sacred-art-licence-first-383-exact-source-audit-20261029.v1.json"
newfile=D/"sacred-art-licence-next-112-source-identities-20261029.v1.json"
main=json.loads(mainfile.read_text())
follow=json.loads(newfile.read_text())
rows=main["records"]; evidence=follow["records"]
assert len(rows)==383 and len(evidence)==112
original={r["artwork_id"]:(r["recorded_archive_image_sha256"],r["editorial_state"],r["approved_107"]) for r in rows}
fixed={}
for z in evidence:
    rights=z.get("commons_exact_file_evidence")
    if rights is None:continue
    id=z["artwork_id"]
    previous=next(r for r in rows if r["artwork_id"]==id)
    assert previous["file_licence_audit_status"]=="SOURCE_IDENTIFICATION_NEEDED"
    assert not previous["source_url"]
    assert rights["metadata_checked_live"] is True
    assert rights["current_sha1"]
    assert rights["source_file_page"].startswith("https://commons.wikimedia.org/wiki/File:")
    assert z["saved_original_sha256"]==previous["recorded_archive_image_sha256"]
    cls=z["source_recovery_status"]
    if cls=="COMMONS_LITERAL_FILENAME_PD_OR_CC0_DECLARED_UNJOINED_ARCHIVE":
        status="COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED"
        classification="PUBLIC_DOMAIN_OR_CC0_DECLARED"
        action="VERIFY_ARCHIVED_SHA256_MATCHES_THIS_LICENSED_FILE_VERSION_AND_ARTWORK_IDENTITY"
    elif cls=="COMMONS_LITERAL_FILENAME_CC_BY_SA_CONDITIONAL":
        status="COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE"
        classification="FREE_LICENCE_CONDITIONAL_SHAREALIKE"
        action="VERIFY_CURRENT_IMAGE_BYTES_AND_IMPLEMENT_PHOTOGRAPHER_CREDIT_LICENSE_SHAREALIKE"
    elif cls=="COMMONS_LITERAL_FILENAME_CC_BY_ATTRIBUTION_CONDITIONAL":
        status="COMMONS_CC_BY_ATTRIBUTION_REQUIRED"
        classification="FREE_LICENCE_CONDITIONAL_ATTRIBUTION"
        action="VERIFY_IMAGE_BYTES_AND_IMPLEMENT_PHOTOGRAPHER_CREDIT_AND_LICENSE_NOTICE"
    else:raise ValueError("Unexpected purportedly verified rights "+cls)
    previous["file_licence_audit_status"]=status
    previous["required_licence_action"]=action
    previous["source_url"]=rights["source_file_page"]
    previous["commons_file_title"]=rights["source_file_title"]
    previous["commons_live_file_metadata"]={
      "live_file_found":True,"source":"CURRENT_COMMONS_FILE_IMAGEINFO",
      "current_image_sha1":rights["current_sha1"],"file_bytes":rights["source_bytes"],
      "mime":rights["current_mime"],
      "licence_short_name":rights["current_license_short_name"],
      "licence_url":rights["current_license_url"],
      "copyrighted":rights["current_copyrighted_flag"],
      "attribution":rights["current_attribution"],
      "credit":rights["current_credit"],
      "restrictions":rights["current_restrictions"],
      "file_page":rights["source_file_page"]}
    previous["commons_file_licence_class"]=classification
    previous["licence_check_unresolved_detail"]="Exact Commons file licence metadata verified 2026-10-29. Previously selected archived image SHA256 NOT matched to current source bytes; physical painting identity and reuse jurisdiction must be confirmed."
    previous["archived_photo_hash_matches_candidate_original"]=False
    previous["image_bytes_downloaded_in_this_pass"]=0
    previous["quality_review_performed_in_this_pass"]=False
    previous["production_released"]=False
    fixed[id]=status
assert len(fixed)==27
assert Counter(fixed.values())=={
 "COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED":20,
 "COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE":5,
 "COMMONS_CC_BY_ATTRIBUTION_REQUIRED":2}
assert all(original[r["artwork_id"]]==(r["recorded_archive_image_sha256"],r["editorial_state"],r["approved_107"]) for r in rows)
count=Counter(r["file_licence_audit_status"] for r in rows)
ap=Counter(r["file_licence_audit_status"] for r in rows if r["approved_107"])
assert len(rows)==383 and sum(count.values())==383 and sum(ap.values())==107
assert count["SOURCE_IDENTIFICATION_NEEDED"]==85
assert count["COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED"]==80
assert count["COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE"]==19
assert count["COMMONS_CC_BY_ATTRIBUTION_REQUIRED"]==2
main["schema"]="AO_SACRED_ART_LICENCE_FIRST_383_20261029_V3"
main["counts"]["licence_dispositions"]=dict(count)
main["counts"]["approved_107_dispositions"]=dict(ap)
main["counts"]["commons_exact_file_titles_queried"]+=27
main["counts"]["commons_exact_file_metadata_received"]+=27
main["counts"]["additional_exact_commons_file_metadata_checked"]+=27
main["counts"]["commons_public_domain_file_metadata_only"]=count["COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED"]
main["counts"]["conditional_cc_by_sa_photographer_terms"]=count["COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE"]
main["counts"]["conditional_cc_by_attribution_photographer_terms"]=count["COMMONS_CC_BY_ATTRIBUTION_REQUIRED"]
main["counts"]["remaining_no_exact_source_url"]=85
main["counts"]["new_licence_file_pages_joined_in_112_missing_cohort"]=27
main["counts"]["live_museum_objects_checked_remains_from_prior_pass"]=134
main["counts"]["quality_review_performed_in_this_pass"]=0
main["counts"]["image_files_downloaded"]=0
main["counts"]["production_releases"]=0
main["counts"]["cost_eur"]=0
main["licence_112_source_gap_followup"]={
   "source":"data/calendar/sacred-art-licence-next-112-source-identities-20261029.v1.json",
   "exact_file_pages_newly_identified":27,
   "pd_or_cc0_declarations":20,
   "cc_by_sa_conditional":5,
   "cc_by_conditional":2,
   "still_missing":85,
   "saved_image_version_not_yet_licence_certified":27,
   "quality_inspection_started":False,
   "no_image_download":True}
mainfile.write_text(json.dumps(main,indent=2,ensure_ascii=False)+"\n")
fields=["artwork_id","title","artist","editorial_state","approved_107","file_licence_audit_status","required_licence_action","source_url",
 "museum_api","museum_current_live_policy","commons_file_title","commons_file_licence_class","recorded_archive_image_sha256",
 "archived_photo_hash_matches_candidate_original","licence_check_unresolved_detail"]
def csvexport(filename,sub):
    with (D/filename).open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore",lineterminator="\n")
        w.writeheader();w.writerows(sub)
csvexport("sacred-art-licence-first-383-review-20261029.csv",rows)
csvexport("sacred-art-licence-first-383-holds-20261029.csv",[
 x for x in rows if x["file_licence_audit_status"] not in
 ("EXACT_SELECTED_ARCHIVE_OFFICIAL_CC0_SHA_VERIFIED",
  "EXACT_OFFICIAL_CC0_ARCHIVE_PREVIOUSLY_VERIFIED_API_403_HOLD",
  "OFFICIAL_CC0_ARCHIVE_PROVENANCE_SHA_LINKED")])
print(json.dumps({"checked":383,"new_file_licences":27,
"previous_missing":112,"remaining_missing":85,"file_public_domain_declared":80,
"conditional_CC_BY_SA":19,"conditional_CC_BY":2,
"approved_107":dict(ap),"quality_checks":0,"cost_eur":0},sort_keys=True))
