import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const decisions=read("data/calendar/prayer-31-section-review-reconciliation-20261028.v1.json");
const wave=read("data/calendar/prayer-hero-wave1-release-manifest-20261028.v1.json");
const reviews=read("data/calendar/prayer-wave1-remaining-photo-decisions-20261028.v1.json");
const evidence=read("assets/staged/prayer-wave1-photo-comparison-20261028/comparison-evidence.json");
const output=read("assets/staged/prayer-wave1-photo-comparison-20261028/candidate-proof-manifest.json");
assert.equal(wave.modules.length,6,"never change selected Wave 1 primary count");
assert.deepEqual(wave.modules.map(x=>x.section),[
 "morning","evening","angelus","rosary","confession","seven-sorrows"]);
assert.ok(wave.modules.every(x=>x.editorial_primary.user_final===true && x.photo.app_release==="BLOCKED" && x.code_activated===false));
assert.equal(decisions.remaining_unreviewed.length,1);
assert.equal(decisions.remaining_unreviewed[0].placement_key,"sacred-heart::heart-jesus--primary");
assert.equal(reviews.immutable_contract.primaries_changed,0);
assert.equal(reviews.immutable_contract.previous_approval_registers_changed,0);
assert.equal(reviews.immutable_contract.app_releases,0);
assert.equal(reviews.immutable_contract.cost_eur,0);
assert.equal(reviews.aggregate.photo_released,0);
assert.deepEqual(reviews.photo_reviews.map(x=>x.module).sort(),["seven-sorrows","rosary","angelus","evening"].sort());
assert.deepEqual(output.entries.map(x=>x.module).sort(),["angelus","rosary"].sort());
assert.equal(output.production_releases,0);
assert.equal(output.editorial_primaries_unchanged,true);
assert.equal(evidence.photo_releases,0);
assert.equal(evidence.source_images.sorrows_old.prior_hash_matched,true);
assert.equal(evidence.source_images.angelus.prior_hash_matched,true);
assert.equal(evidence.source_images.rosary_sailko.prior_hash_matched,true);
for(const key of ["sorrows_new","rosary_yorck"]){
 const row=evidence.source_images[key];
 assert.ok(row.archived_source_original);
 const blob=readFileSync(row.archived_source_original);
 assert.equal(createHash("sha256").update(blob).digest("hex"),row.sha256,key+" source SHA-256");
}
assert.equal(evidence.source_images.rosary_yorck.sha256,
 "595c186cf5e71cfba242f2db6af53c75169e2498bf15c7f4f08966bfba0605ca");
assert.equal(evidence.source_images.sorrows_new.sha256,
 "9ac17078b83f2cf6031aa70a86917929cdeea16927e66c4bb7c0f7671ec89667");
const rosary=reviews.photo_reviews.find(x=>x.module==="rosary");
assert.equal(rosary.no_artwork_reselection,true);
assert.equal(rosary.recommend_photo.sha256,evidence.source_images.rosary_yorck.sha256);
assert.equal(rosary.candidate_original_previews.length,2);
assert.equal(rosary.rejected_photo_candidates.length,2);
const angelus=reviews.photo_reviews.find(x=>x.module==="angelus");
assert.equal(angelus.v2_edge_review.startsWith("HOLD"),true);
assert.equal(angelus.candidate_cropped_previews.length,2);
for(const hero of output.entries){
 assert.equal(hero.final_photo_approved,false);
 assert.equal(hero.original_master_bytes_modified,false);
 for(const candidate of hero.previews){
  const b=readFileSync(candidate.path);
  assert.equal(createHash("sha256").update(b).digest("hex"),candidate.sha256,candidate.path);
  assert.ok(candidate.pixels[0]>0&&candidate.pixels[1]>0);
  assert.equal(candidate.retouched,false);
  assert.equal(candidate.upscaled,false);
 }
}
const seven=reviews.photo_reviews.find(x=>x.module==="seven-sorrows");
assert.equal(seven.source_candidate_choice,"KEEP_VERIFIED_EXISTING_FOR_NOW");
assert.equal(reviews.photo_reviews.find(x=>x.module==="evening").source_candidate_choice,"HOLD_NO_IMAGE_SWAP");
console.log(JSON.stringify({
 result:"PASS_NO_RELEASE_PHOTO_PROPOSAL_GATE",
 approved_primary_count:wave.modules.length,
 open_exception:decisions.remaining_unreviewed[0].placement_key,
 new_open_source_originals_sha256_verified:2,
 source_previews_sha256_verified:4,
 pending_photo_decisions:4,
 production_releases:0
}));
