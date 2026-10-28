import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const w3=load("data/calendar/sacred-art-breviarium-83-w3-weak-photo-alternatives-20261029.v1.json");
const w3b=load("assets/staged/sacred-art-breviarium-w3b-exact-originals-20261029/source-original-results.json");
const gallery=load("data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json");
const b2=load("assets/staged/sacred-art-breviarium-wave1-native-20261029/wave1-source-intake-results.json");
const prayer=load("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
const ban=load("data/calendar/sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json");
assert.equal(w3.schema,"AO_SACRED_ART_BREVIARIUM_W3_35_WEAK_28_NATIVE_QA_SOURCE_V1");
assert.equal(w3.weak_cohort.length,35);
assert.equal(w3.native_quality_cohort.length,28);
assert.equal(new Set(w3.weak_cohort.map(x=>x.id)).size,35);
assert.equal(new Set(w3.native_quality_cohort.map(x=>x.id)).size,28);
assert.equal(w3.counts.new_distinct_source_files_checked,10);
assert.equal(w3.counts.exact_file_metadata_returned,10);
assert.equal(w3.counts.weak_cases_with_alternative_file_metadata,7);
assert.equal(w3.counts.alternative_file_short_edge_improved_without_oversize,7);
assert.equal(w3.counts.already_archived_native_full_originals_in_28,2);
assert.equal(w3.counts.w3b_new_verified_source_originals_archived,2);
assert.equal(w3.counts.w3b_native_photo_rejected_for_frame,1);
assert.equal(w3.counts.w3b_native_source_painting_only_preliminary,1);
assert.equal(w3.counts.cumulative_breviarium_originals_archived,4);
assert.equal(w3.counts.new_pristine_certifications,0);
assert.equal(w3.counts.new_releases,0);
assert.equal(w3.counts.expenditure_eur,0);
assert.equal(w3b.processed_cases,6);
assert.equal(w3b.originals_verified_and_archived,2);
assert.equal(w3b.http_429_received,1);
assert.equal(w3b.not_attempted_after_429,3);
assert.equal(w3b.attempts_after_429,0);
assert.equal(w3b.production_released,0);
assert.equal(w3b.new_pristine_certifications,0);
assert.equal(b2.originals_sha1_byte_verified_and_archived,2);
assert.equal(gallery.records.length,83);
assert.equal(gallery.counts.hard_artist_exclusions,7);
assert.equal(gallery.counts.breviarium_total_originals_archived,4);
assert.equal(gallery.counts.w3b_photo_rejected_for_external_frame,1);
assert.equal(ban.counts.effectiveBannedIDRecords,103);
assert.equal(prayer.primary_artworks.length,22);
assert.equal(prayer.placement_records.length,118);
assert.equal(prayer.totals.pristine_publication_ready,0);
assert.equal(prayer.totals.production_activated,0);
let downloaded=0,total=0;
for(const r of w3b.cases){
 assert.equal(r.pristine_certified,false);
 assert.equal(r.production_allowed,false);
 const g=gallery.records.find(y=>y.breviarum_plate_id===r.plate_id);
 assert.ok(g);
 assert.equal(g.w3b_photo_alternative.status,r.status);
 if(r.path){
   const bytes=readFileSync(r.path);
   assert.equal(createHash("sha1").update(bytes).digest("hex"),r.sha1);
   assert.equal(createHash("sha256").update(bytes).digest("hex"),r.sha256);
   assert.equal(bytes.length,r.bytes);
   assert.equal(g.w3b_photo_alternative.sha256,r.sha256);
   assert.equal(g.w3b_photo_alternative.rights_final_certified,false);
   assert.equal(g.w3b_photo_alternative.pristine_certified,false);
   assert.ok(r.inspection_proof.path);
   const proof=readFileSync(r.inspection_proof.path);
   assert.equal(createHash("sha256").update(proof).digest("hex"),r.inspection_proof.sha256);
   downloaded++;
   total+=bytes.length;
 }
 if(r.status==="NOT_ATTEMPTED_AFTER_COMMONS_429")assert.ok(!r.path);
}
assert.equal(downloaded,2);
assert.equal(total,w3b.research_git_original_bytes);
const z=gallery.records.find(x=>x.breviarum_plate_id==="plate-zurbaran-francis").w3b_photo_alternative;
assert.equal(z.visual_review.class,"REJECT_NEW_PHOTOGRAPH_FRAME_AND_WALL");
assert.equal(z.pristine_certified,false);
const murillo=gallery.records.find(x=>x.breviarum_plate_id==="plate-murillo-immaculate").w3b_photo_alternative;
assert.equal(murillo.visual_review.class,"PRELIMINARY_PAINTING_ONLY_PHOTOGRAPH_RIGHTS_FIDELITY_HOLD");
assert.equal(murillo.rights_final_certified,false);
for(const r of w3.native_quality_cohort){
 assert.equal(r.full_native_edges_verified,false);
 assert.equal(r.painted_boundary_verified,false);
 assert.equal(r.tonal_fidelity_verified,false);
 assert.equal(r.pristine_certified,false);
 assert.equal(r.production_activated,false);
}
console.log(JSON.stringify({status:"PASS_BREVIARIUM_W3_63_AND_W3B_EXACT_ARCHIVES",
  weak:35,quality_cohort:28,verified_alternate_files:10,
  improved_bounded_candidate_files:7,physically_archived_four_cumulative:4,
  newly_archived_source_bytes_qa:2,explicit_frame_rejected:1,
  429_stop_obeyed:true,approved_prayer_heroes_unchanged:22,
  rejected_work_ids_protected:103,pristine_certifications:0,production_releases:0,cost_eur:0}));
