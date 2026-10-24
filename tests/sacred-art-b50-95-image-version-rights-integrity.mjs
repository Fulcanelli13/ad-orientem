#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
const R="data/research/";
const s=JSON.parse(fs.readFileSync(R+"sacred-art-b50-95-photo-rights-resolution-summary.json","utf8"));
const d=JSON.parse(fs.readFileSync(R+"sacred-art-b50-95-source-specific-commons-license-checks.json","utf8"));
const prior=JSON.parse(fs.readFileSync(R+"sacred-art-b49-383-photo-license-and-git-image-summary.json","utf8"));
const source=fs.readFileSync(R+"sacred-art-b50-95-exact-photo-version-evidence.csv","utf8");
const queue=fs.readFileSync(R+"sacred-art-b49-95-frozen-approved-rights-review-queue.csv","utf8");
assert.equal(s.schema,"AO_B50_APPROVED95_EXACT_IMAGE_RIGHTS_VERSION_AND_TECHNICAL_GATES_V1");
assert.equal(d.schema,"AO_B50_COMPARABLE_95_SOURCES_PER_ID_V1");
assert.equal(s.approved_artworks_in_firstpass,95);
assert.equal(s.all_frozen_artwork_decisions_preserved,107);
assert.equal(s.reviewed_exact_artwork_IDs,95);
assert.equal(s.all_95_records_frozen_approved,true);
assert.equal(s.end_to_end_publishable_completed,0);
assert.equal(s.specific_archived_exact_file_photographer_legal_review_completed,0);
assert.equal(s.source_image_visual_artwork_identity_review_completed,0);
assert.equal(s.chosen_editorial_photo_version_approved,0);
assert.equal(s.zero_completed_means_not_certified_not_no_rights,true);
assert.equal(s.frozen_107_approval_selection_changed,0);
assert.equal(s.frozen_383_artwork_record_changes,0);
assert.equal(s.app_photo_publication_events,0);
assert.equal(s.strictly_zero_euro,true);
assert.equal(d.artworks.length,95);
assert.equal(d.new_rights_approvals,0);
assert.equal(d.zero_euro,true);
assert.equal(new Set(d.artworks.map(z=>z.artwork_id)).size,95);
assert.equal(source.trim().split(/\r?\n/).length,96);
assert.equal(queue.trim().split(/\r?\n/).length,96);
assert.equal(s.per_frozen_ID_SHA_source_matched_records,
  d.artworks.filter(z=>z.selected_evidence).length);
assert.ok(s.per_frozen_ID_SHA_source_matched_records<=95);
assert.ok(s.commons_current_file_size_and_dimensions_match<=s.commons_file_pages_readable);
assert.equal(s.commons_responses_succeeded+s.commons_access_blocked_or_failed,s.commons_batch_requests);
assert.equal(s.commons_batch_requests,d.commons_endpoint_checks.length);
assert.equal(prior.historically_approved_with_complete_object_and_open_photo_metadata_claim,95);
assert.equal(s.commons_evidence_classes.COMMONS_METADATA_UNAVAILABLE_OR_MISSING+
(s.commons_evidence_classes.COMMONS_FILE_VERSION_SIZE_DIMENSIONS_MATCH||0)+
(s.commons_evidence_classes.COMMONS_FILE_PRESENT_VERSION_MISMATCH_OR_NO_LOCAL_SIZE||0),95);
for(const e of d.artworks){
 assert.equal(e.editorial_or_commercial_reproduction_approved,false);
 if(e.selected_evidence){
  assert.equal(e.selected_evidence.sha256.length,64);
  assert.ok(e.source_sha_candidates.includes(e.selected_evidence.sha256));
  assert.ok(e.selected_evidence.source_page.length>0||e.selected_evidence.origin.length>0);
  assert.ok(e.other_same_id_sha_matched_evidence.some(x=>x.sha256===e.selected_evidence.sha256));
 }
}
assert.ok(source.includes("photographer_exact_file_commercial_reuse_legal_review_completed"));
assert.ok(source.includes("one_final_best_photo_version_approved_for_artwork"));
console.log("B50_RIGHTS_AND_SOURCE_PASS all 95 frozen approved IDs, 95/source SHA evidence and Commons version audit completed with exact-source and legal-photo gates separately held; €0; no image published.");
