import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync,statSync} from "node:fs";
const root=path=>new URL("../"+path,import.meta.url);
const read=path=>JSON.parse(readFileSync(root(path),"utf8"));
const packageData=read("data/artwork/batch1-three-photo-release-preflight.v1.json");
const queue=read("data/artwork/sacred-art-batch1-25-release-progress.v1.json");
const photoDecisions=read("data/artwork/batch1-photo-release-decision-contract.v1.json");
const originalTwo=read("data/artwork/batch1-two-mobile-staging-output.v1.json");
const lan=read("data/artwork/batch1-lanfranco-sailko-frameless-qa-output.v1.json");
assert.equal(packageData.scope,"RESEARCH_BRANCH_ONLY_NO_PUBLICATION");
assert.equal(packageData.counts.candidate_photos,3);
assert.equal(packageData.counts.existing_prayer_positions,18);
assert.equal(packageData.counts.photographs_authorized,0);
assert.equal(packageData.counts.photographs_published,0);
assert.equal(packageData.release_pr_not_created,true);
assert.equal(packageData.production_release_state.app_registry_changed,false);
assert.equal(queue.counts.previouslyReleasedPhotoEntries,16);
assert.equal(packageData.production_release_state.existing_16_gallery_entries_preserved,true);
assert.equal(packageData.release_package_entries.length,3);
const seen=new Set(),placements=new Set();
for(const entry of packageData.release_package_entries){
 assert.ok(!seen.has(entry.id));
 seen.add(entry.id);
 const baseline=queue.nextNineSourcePhotographWorkQueue.find(w=>w.id===entry.id);
 assert.ok(baseline);
 assert.equal(baseline.knownSelectedSlotCount,entry.existing_prayer_position_count);
 assert.deepEqual(baseline.selectedSlotIds,entry.intended_existing_prayer_positions);
 const opt=photoDecisions.work_items.find(w=>w.artwork_id===entry.id).options.find(o=>o.photo_id===entry.exact_photo_id);
 assert.ok(opt?.eligible_for_publication_qa_request);
 assert.equal(opt.rights_state,entry.source_rights_status);
 assert.equal(opt.source_sha256,entry.source_original_sha256,"Original museum/photographer JPEG SHA must match");
 assert.equal(opt.display_edition_sha256,entry.staged_artifact_sha256,"Approved displayed WebP SHA must match separately");
 let original;
 if(entry.id==="artwork-pending:09"){
  original=lan;
  assert.equal(lan.webp_stage_path,entry.staged_artifact_path);
  assert.equal(lan.webp_sha256,entry.staged_artifact_sha256);
 }else{
  original=originalTwo.paintings.find(p=>p.id===entry.id);
  assert.equal(original.image_path,entry.staged_artifact_path);
  assert.equal(original.webp_sha256,entry.staged_artifact_sha256);
 }
 assert.ok(entry.staged_artifact_path.startsWith("assets/staged/sacred-art-batch1/"));
 const raw=readFileSync(root(entry.staged_artifact_path));
 assert.equal(raw.length,entry.staged_artifact_bytes);
 assert.equal(statSync(root(entry.staged_artifact_path)).size,entry.staged_artifact_bytes);
 assert.equal(createHash("sha256").update(raw).digest("hex"),entry.staged_artifact_sha256);
 assert.equal(entry.source_photo_selection_approved_by_owner,false);
 assert.equal(entry.exact_display_edition_approved_by_owner,false);
 assert.equal(entry.publication_qa_authorized_by_owner,false);
 assert.equal(entry.public_release_approval,false);
 assert.equal(entry.photograph_to_app_assignment,false);
 assert.equal(entry.target_public_asset_path,null);
 assert.equal(entry.object_fit,"contain");
 assert.equal(entry.allow_cover_crop,false);
 for(const slot of entry.intended_existing_prayer_positions){
  assert.ok(!placements.has(slot),"Duplicate Prayer destination: "+slot);
  placements.add(slot);
 }
}
assert.equal(placements.size,18);
const e=packageData.release_package_entries.find(x=>x.id==="artwork-pending:09");
assert.ok(e.source_credit.includes("Sailko")&&e.source_credit.includes("CC BY 3.0"));
assert.ok(e.source_credit.includes("adapted"));
assert.ok(packageData.release_package_entries.find(x=>x.id==="artwork-pending:01").source_credit.includes("Follower of Sodoma"));
assert.ok(packageData.release_package_entries.find(x=>x.id==="artwork-pending:02").source_credit.includes("Workshop of Peter Paul Rubens"));
console.log("PASS: three SHA-256-matched staged WebPs, 18 original Prayer slots, zero owner approval or public publication.");
