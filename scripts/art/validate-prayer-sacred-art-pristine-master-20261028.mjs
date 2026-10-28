import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const r=read("data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json");
for(const tag of ["editorial22","readiness22"]){
 const evidence=r.evidence_sources.find(x=>x.key===tag);
 assert.ok(evidence,"Missing historical source anchor "+tag);
 const bytes=readFileSync(evidence.path);
 const header=Buffer.from("blob "+bytes.length+"\0","utf8");
 const sha=createHash("sha1").update(header).update(bytes).digest("hex");
 assert.equal(sha,evidence.git_blob_sha,
  "Canonical main source diverged since 28 Oct bulk reconciliation: "+tag);
}
const final=read("data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json");
const old=read("data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json");
const decision=read("data/calendar/prayer-31-section-review-reconciliation-20261028.v1.json");
const visual=read("data/calendar/prayer-wave1-visual-composition-review-20261028.v1.json");
const native=read("data/calendar/prayer-wave1-post-ci-photo-quality-gates-20261028.v1.json");
assert.equal(r.schema,"AO_PRAYER_SACRED_ART_PRISTINE_MASTER_REGISTRY_V1");
assert.equal(r.policy.no_false_pristine_claim,true);
assert.equal(r.policy.no_paid_assets_no_upscaled_substitutes,true);
assert.equal(r.primary_artworks.length,22);
assert.equal(r.placement_records.length,118);
assert.equal(r.sections.length,31);
assert.equal(final.final_approved_heroes.length,22);
assert.equal(old.entries.length,22);
assert.equal(decision.modules.length,31);
assert.equal(decision.counts.union_placement_records,118);
assert.deepEqual(r.primary_artworks.map(x=>x.module_id),
 final.final_approved_heroes.map(x=>x.module_id),"canonical hero editorial order changed");
const oldBy=Object.fromEntries(old.entries.map(x=>[x.module_id,x]));
for(const h of r.primary_artworks){
 const x=oldBy[h.module_id];
 assert.ok(x,"missing original readiness entry "+h.module_id);
 assert.equal(h.title,x.title,"hero title mismatch "+h.module_id);
 assert.equal(h.artist,x.artist,"hero artist mismatch "+h.module_id);
 assert.equal(h.editorial_status,"USER_FINAL_APPROVED");
 assert.equal(h.original.archived,Boolean(x.physical_master_acquired));
 assert.equal(h.original.sha256,x.staged_research_file?.sha256||x.sha256||null,
  "source checksum drift "+h.module_id);
 assert.equal(h.quality.pristine_certified,false);
 assert.equal(h.quality.photo_ready_for_publication,false);
 assert.equal(h.quality.native_pixel_full_audit_complete,false);
 assert.equal(h.quality.painted_area_approved,false);
 assert.equal(h.quality.source_photo_rights_certified,false);
 assert.equal(h.production_activated,false);
 if(h.original.archived)assert.match(h.original.sha256,/^[0-9a-f]{64}$/);
}
assert.deepEqual(r.placement_records.map(x=>x.placement_key),
 decision.modules.flatMap(x=>x.placements.map(y=>y.placement_key)));
assert.equal(new Set(r.placement_records.map(x=>x.placement_key)).size,118);
for(const x of r.placement_records){
 const match=decision.modules.flatMap(m=>m.placements).find(y=>y.placement_key===x.placement_key);
 assert.equal(x.current_editorial_action,match.action,"placement decision changed "+x.placement_key);
 assert.equal(x.record_origin,match.record_origin);
 assert.equal(x.pristine_photo_verified,false);
}
const count=action=>r.placement_records.filter(x=>x.current_editorial_action===action).length;
assert.deepEqual({keep:count("keep"),reject:count("reject"),photo:count("better-photo"),
 referral:count("elsewhere"),unreviewed:count("unreviewed")},
 {keep:47,reject:51,photo:13,referral:6,unreviewed:1});
assert.equal(r.totals.locked_primary_paintings,22);
assert.equal(r.totals.masters_archived,20);
assert.equal(r.totals.masters_missing,2);
assert.equal(r.totals.pristine_publication_ready,0);
assert.equal(r.totals.production_activated,0);
assert.equal(r.totals.request_better_photo,13);
assert.equal(r.totals.distinct_better_photo_artworks,10);
assert.equal(r.totals.native_hash_ci_pass,20);
const fullBatch=read("assets/staged/prayer-pristine-bulk-native-audit-20261028/native-audit.json");
assert.equal(fullBatch.scheduled_originals,20);
assert.equal(fullBatch.originals_verified_exact_bytes,20);
assert.equal(fullBatch.originals_requiring_file_recovery,0);
assert.equal(fullBatch.pristine_quality_final_certified,0);
assert.equal(fullBatch.native_corner_sheets.length,4);
const scanById=Object.fromEntries(fullBatch.results.map(x=>[x.module_id,x]));
for(const hero of r.primary_artworks){
 if(!hero.original.archived)continue;
 const check=scanById[hero.module_id];
 assert.equal(check?.result,"PASS_EXACT_PINNED_BYTES_AND_DIMENSIONS",hero.module_id);
 assert.equal(check.sha256_recomputed,hero.original.sha256,hero.module_id+" sha");
 assert.deepEqual(check.pixels_verified,hero.original.dimensions_px,hero.module_id+" pixels");
 assert.equal(hero.original.hash_verification,"REHASHED_20_MASTER_BATCH_CI_PASS");
 assert.equal(hero.quality.native_batch_visual_review?.technical_integrity,
  "PASS_PINNED_SHA_AND_PIXEL_DIMENSIONS");
 assert.equal(hero.quality.native_batch_visual_review?.source_photo_publication_approved,false);
}
assert.equal(r.batch_execution.B0_BULK_RECONCILIATION.hero_records_processed,22);
assert.equal(r.batch_execution.B0_BULK_RECONCILIATION.review_placements_processed,118);
assert.equal(r.batch_execution.B0_BULK_RECONCILIATION.master_hashes_recalculated_in_this_pass,0);
assert.deepEqual(r.batch_execution.B1_IMAGE_ACQUISITION.exact_original_missing.map(x=>x.module_id),
 ["angel","evening"]);
assert.deepEqual(r.batch_execution.B1_IMAGE_ACQUISITION.existing_original_needs_better_photo.map(x=>x.module_id).sort(),
 ["holy-spirit","michael","salvation"].sort());
const rosary=r.primary_artworks.find(x=>x.module_id==="rosary");
assert.equal(rosary.original.hash_verification,"REHASHED_20_MASTER_BATCH_CI_PASS");
assert.equal(rosary.original.recovered_location.sha256,
 "595c186cf5e71cfba242f2db6af53c75169e2498bf15c7f4f08966bfba0605ca");
const independentSailko=native.entries.find(x=>x.module_id==="rosary")?.native_asset?.sha256_verified_by_workflow;
assert.equal(independentSailko,"5563d32307c7b479e86b0060dc8bc17f9b699c938d293ff5bd6f4555ee1f7045");
assert.notEqual(rosary.original.sha256,independentSailko,
 "A different photographed version must never silently replace the selected master");
const m=r.editorial_exceptions.unreviewed_placements;
assert.equal(m.length,1);
assert.equal(m[0].placement_key,"sacred-heart::heart-jesus--primary");
assert.equal(r.editorial_exceptions.separate_22_final_primary_approvals_unmodified,true);
assert.equal(visual.summary.released_to_app,0);
assert.equal(native.scope.app_images_released,0);
const intake=read("assets/staged/prayer-art-bulk-acquisition-b2-20261028/intake-results.json");
assert.equal(intake.attempted,14);
assert.equal(intake.original_native_sources_archived,1);
assert.equal(intake.production_releases,0);
assert.equal(intake.pristine_photo_final_certifications,0);
const carracci=intake.cases.find(x=>x.case_id==="carracci-burial-met");
assert.equal(carracci.status,"RESEARCH_SOURCE_ARCHIVED_NOT_PRISTINE");
assert.deepEqual([carracci.native_archive.width,carracci.native_archive.height],[3122,3875]);
const carracciRaw=readFileSync(carracci.native_archive.path);
assert.equal(createHash("sha256").update(carracciRaw).digest("hex"),carracci.native_archive.sha256);
assert.equal(r.batch_execution.B1_IMAGE_ACQUISITION.archive_new_source_master.original_is_pristine,false);
assert.equal(r.batch_execution.B1_IMAGE_ACQUISITION.archive_new_source_master.master_sha256,
 carracci.native_archive.sha256);
assert.equal(r.totals.pristine_publication_ready,0);
assert.equal(r.evidence_sources.length,6);
assert.ok(r.evidence_sources.every(x=>x.git_blob_sha?.length===40));
console.log(JSON.stringify({
 result:"PASS_BULK_PRAYER_ART_MASTER_INTEGRITY",
 primary_paintings:r.totals.locked_primary_paintings,
 image_masters_archived:r.totals.masters_archived,
 image_masters_missing:r.totals.masters_missing,
 native_sha_proofs_recorded:r.totals.native_hash_ci_pass,
 placement_rows:r.totals.placements,
 sections:r.totals.sections,
 better_photo_placements:r.totals.request_better_photo,
 distinct_photo_requests:r.totals.distinct_better_photo_artworks,
 pristine_certified:0,production_released:0,
 records_reconciled:r.totals.locked_primary_paintings+r.totals.placements,
 cost_eur:0
}));
