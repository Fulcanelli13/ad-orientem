import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const d=JSON.parse(readFileSync("data/calendar/sacred-art-licence-first-383-exact-source-audit-20261029.v1.json","utf8"));
const c=d.counts, s=c.licence_dispositions;
assert.equal(d.schema,"AO_SACRED_ART_LICENCE_FIRST_383_20261029_V3");
assert.equal(d.records.length,383);
assert.equal(new Set(d.records.map(x=>x.artwork_id)).size,383);
assert.equal(c.total_canonical_records,383);
assert.equal(c.approved_artworks,107);
assert.equal(d.records.filter(x=>x.approved_107).length,107);
assert.equal(c.museum_unique_live_object_checks,134);
assert.equal(c.museum_object_apis_cc0,125);
assert.equal(c.museum_object_api_holds,9);
assert.equal(c.commons_exact_file_titles_queried,101);
assert.equal(c.commons_exact_file_metadata_received,101);
assert.equal(c.commons_metadata_api_batch_errors,0);
assert.equal(c.additional_exact_commons_file_metadata_checked,34);
assert.equal(c.additional_NGA_US_policy_sources_classified,34);
assert.equal(c.exact_official_CC0_archived_sha_provenance,92);
assert.equal(c.commons_public_domain_file_metadata_only,80);
assert.equal(c.conditional_cc_by_sa_photographer_terms,19);
assert.equal(s.EXACT_SELECTED_ARCHIVE_OFFICIAL_CC0_SHA_VERIFIED,17);
assert.equal(s.EXACT_OFFICIAL_CC0_ARCHIVE_PREVIOUSLY_VERIFIED_API_403_HOLD,1);
assert.equal(s.OFFICIAL_CC0_ARCHIVE_PROVENANCE_SHA_LINKED,74);
assert.equal(s.COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED,80);
assert.equal(s.COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE,19);
assert.equal(s.NGA_US_OPEN_ACCESS_POLICY_FILE_ELIGIBILITY_UNCONFIRMED,34);
assert.equal(s.SOURCE_IDENTIFICATION_NEEDED,85);
assert.equal(s.NO_COMPLETE_IMAGE_TO_LICENSE,25);
assert.equal(s.OFFICIAL_CC0_OBJECT_NOT_EXACT_ARCHIVED_PHOTO_CERTIFIED,22);
assert.equal(s.OFFICIAL_CC0_PHOTOGRAPH_VERSION_REQUIRES_JOIN,3);
assert.equal(s.MET_OFFICIAL_OBJECT_API_RIGHTS_NOT_LIVE_VERIFIED,8);
assert.equal(s.MUSEUM_COLLECTION_REUSE_RIGHTS_HOLD,3);
assert.equal(s.HISTORICALLY_EXCLUDED_NO_NEW_LICENSING,9);
assert.equal(s.FROZEN_CONTRADICTORY_EDITORIAL_AUTHORITIES,1);
assert.equal(Object.values(s).reduce((a,b)=>a+b,0),383);
assert.equal(c.licence_only_phase_complete_all_dispositioned,true);
assert.equal(c.quality_review_performed_in_this_pass,0);
assert.equal(c.image_files_downloaded,0);
assert.equal(c.production_releases,0);
assert.equal(c.cost_eur,0);
assert.equal(d.records.filter(x=>x.quality_review_performed_in_this_pass).length,0);
assert.equal(d.records.filter(x=>x.image_bytes_downloaded_in_this_pass!==0).length,0);
assert.equal(d.records.filter(x=>x.production_released).length,0);
assert.equal(d.records.find(x=>x.artwork_id==="cma-122338").file_licence_audit_status,"FROZEN_CONTRADICTORY_EDITORIAL_AUTHORITIES");
assert.equal(d.records.find(x=>x.artwork_id==="met-712539").file_licence_audit_status,"EXACT_OFFICIAL_CC0_ARCHIVE_PREVIOUSLY_VERIFIED_API_403_HOLD");
const titleCases=d.records.filter(x=>x.source_url.startsWith("File:"));
const recovered=d.records.filter(x=>x.file_licence_audit_status!=="SOURCE_IDENTIFICATION_NEEDED" && x.artwork_id.startsWith("C3") && x.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
assert.equal(recovered.length,27);
assert.equal(c.remaining_no_exact_source_url,85);
assert.equal(c.new_licence_file_pages_joined_in_112_missing_cohort,27);
assert.equal(c.conditional_cc_by_attribution_photographer_terms,2);
assert.equal(s.COMMONS_CC_BY_ATTRIBUTION_REQUIRED,2);
for(const x of recovered){assert.ok(x.commons_live_file_metadata?.current_image_sha1); assert.equal(x.image_bytes_downloaded_in_this_pass,0);assert.equal(x.quality_review_performed_in_this_pass,false);}
assert.equal(titleCases.length,7);
assert.equal(titleCases.filter(x=>x.commons_live_file_metadata?.live_file_found).length,7);
const failed=d.records.filter(x=>x.file_licence_audit_status==="NGA_US_OPEN_ACCESS_POLICY_FILE_ELIGIBILITY_UNCONFIRMED");
assert.equal(failed.length,34);
for(const x of failed) assert.equal(x.commons_live_file_metadata,null);
console.log(JSON.stringify({status:"PASS_383_LICENCES_CHECKED_NO_PHOTOS_OR_PRODUCTION",
  source_cases:383,approved_works:107,official_cc0_provenance:92,
  Commons_PD_declarations:80,conditional_CC_BY_SA:19,conditional_CC_BY:2,new_exact_file_pages:27,remaining_unlinked_source:85,
  NGA_policy_photo_eligibility_holds:34,other_holds:146,
  excluded:9,editorial_conflict:1,
  image_downloads:0,quality_rechecks:0,production_activations:0,cost_eur:0}));
