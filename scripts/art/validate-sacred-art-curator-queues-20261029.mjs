import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const main=read("data/calendar/sacred-art-curator-queues-383-20261029.v1.json");
const manual=read("data/calendar/sacred-art-curator-official18-native-first-visual-20261029.v1.json");
const museum=read("assets/staged/sacred-art-curator-18-official-cc0-native-qa-20261029/native-official-photo-qa.json");
const prayer=read("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
const excludes=read("data/calendar/sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json");
const a8=read("data/calendar/sacred-art-a8-44-visual-contact-screen-20261028.v1.json");
const g=read("data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json");
const c=main.counts;
assert.equal(main.schema,"AO_SACRED_ART_CURATORIAL_QUEUES_20261029_V1");
assert.equal(main.main_records.length,383);
assert.equal(new Set(main.main_records.map(x=>x.artwork_id)).size,383);
assert.equal(c.main_total,383);
assert.equal(c.main_approved,107);
assert.equal(c.licence_queue,355);
assert.equal(main.licence_review_queue.length,355);
assert.equal(c.excluded_records,9);
assert.equal(c.conflicting_historical_approved_and_rejected_ids,1);
assert.equal(c.official_cc0_matching_selected_source_sha,18);
assert.equal(c.official_cc0_current_other_variant,3);
assert.equal(c.open_metadata_needs_file_proof,216);
assert.equal(c.rights_evidence_gap,99);
assert.equal(c.missing_or_partial_source_needs_rights_and_acquisition,25);
assert.equal(c.conditional_cc_by_sa_file_terms_to_implement,12);
assert.equal(c.direct_visual_or_source_photo_repair_queue,65);
assert.equal(main.first_visual_photo_repair_or_acquisition_queue.length,65);
assert.equal(c.preliminary_a8_frame_free,40);
assert.equal(c.a8_border_support_issues,2);
assert.equal(c.official_cc0_original_first_visual_reviewed,18);
assert.equal(c.official_cc0_first_pass_clean,3);
assert.equal(c.official_cc0_requires_nonart_crop,13);
assert.equal(c.official_cc0_complex_frame_or_mount,1);
assert.equal(c.user_disliked_siena_not_curated,1);
assert.equal(manual.records.length,18);
assert.equal(museum.official_original_retrievals_source_SHA_verified,18);
assert.equal(museum.official_retrieval_holds,0);
assert.equal(museum.native_photo_review_sheets,6);
assert.equal(main.official_cc0_shortlist_needs_final_native_qa.length,3);
assert.deepEqual(new Set(main.official_cc0_shortlist_needs_final_native_qa.map(x=>x.artwork_id)),
 new Set(["cma-143784","cma-148758","met-442488"]));
for(const x of manual.records){
  const r=main.main_records.find(z=>z.artwork_id===x.artwork_id);
  assert.ok(r,x.artwork_id);
  assert.equal(x.source_sha256,r.prior_source_sha256);
  assert.equal(x.photo_source_rights,"OFFICIAL_MUSEUM_CC0_CURRENT_FILE_SOURCE_SHA_EXACT");
  assert.equal(x.first_visual_review_completed,true);
  assert.equal(x.final_pristine_certified,false);
  assert.equal(r.production_approved,false);
}
const conflicting=main.main_records.filter(x=>x.historical_editorial_conflict);
assert.equal(conflicting.length,1);
assert.equal(conflicting[0].artwork_id,"cma-122338");
assert.equal(conflicting[0].photo_next_action,"HOLD_CONFLICTING_APPROVAL_AND_REJECTION_AUTHORITIES");
assert.equal(main.main_records.find(x=>x.artwork_id==="met-459131").photo_next_action,
 "HOLD_USER_REJECTED_AESTHETIC_CHOICE");
assert.equal(main.prayer_hero_curation.length,22);
assert.equal(c.prayer_archived,20);
assert.equal(c.prayer_visually_plausible,10);
assert.equal(c.prayer_rejected_photo,2);
assert.equal(main.breviarium_research_curation.length,83);
assert.equal(c.breviarium_original_photo_archived,4);
assert.equal(c.breviarum_frame_rejected,1);
assert.equal(prayer.primary_artworks.length,22);
assert.equal(prayer.placement_records.length,118);
assert.equal(excludes.counts.effectiveBannedIDRecords,103);
assert.equal(a8.counts.total,44);
assert.equal(g.records.length,83);
assert.equal(c.final_pristine_certified,0);
assert.equal(c.production_activated,0);
assert.equal(c.cost_eur,0);
console.log(JSON.stringify({
 status:"PASS_SACRED_ART_CURATION_383_FULL_QUEUES",
 gallery:383,approved:107,rights_review:355,
 image_repair_acquisition:65,
 official_cc0_exact:18,first_visual_clean:3,
 museum_border_crop:13,museum_complex_frame:1,
 a8_contact_preliminary_clean:40,prayer_first_pass_clean:10,
 breviarium_originals:4,editorial_conflicts:1,
 historical_rejections_protected:103,production_released:0,cost_eur:0
}));
