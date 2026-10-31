import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/prayer/artwork-editorial-20261030/";
const review=JSON.parse(readFileSync("data/calendar/prayer-art-reviewed117-user-decisions-20261028.v1.json","utf8"));
const overlay=JSON.parse(readFileSync(dir+"approved-artwork-inheritance-overlay-20261031.v1.json","utf8"));
const keeps=JSON.parse(readFileSync(dir+"prior-explicit-keeps-cross-module-20261031.v1.json","utf8"));
const reg=JSON.parse(readFileSync(dir+"balanced-reuse-20261030-assignments.v2.json","utf8"));
assert.equal(keeps.sourceKeepCount,review.decisions.filter(x=>x.action==="keep").length);
assert.equal(keeps.sourcePlacementRejectionCount,review.decisions.filter(x=>x.action==="reject").length);
assert.equal(keeps.additionalSlotCount,7);
assert.equal(keeps.placements.length,7);
const seen=new Set();
for(const p of keeps.placements){
 assert.ok(reg.slots.some(x=>x.slot_id===p.slot),"Prior keep target must be canonical editorial slot");
 assert.ok(!seen.has(p.slot),"A prior keep must not be counted twice");seen.add(p.slot);
 assert.ok(!overlay.rules.some(x=>x.slot===p.slot&&["EXACT_SCENE","DEVOTIONAL_SUBJECT"].includes(x.relationship)),"Explicit keep must not overlap safe scene inheritance: "+p.slot);
 for(const id of p.originalReviewArtworkIds){
  const decision=review.decisions.find(x=>x.module_id===p.reviewModule&&x.artwork_id===id&&x.action==="keep");
  assert.ok(decision,"Every extra approved edge must be an affirmative 28 Oct placement keep: "+p.slot+" "+id);
 }
 assert.equal(p.license,"NOT_VERIFIED_PD_CC0");
 assert.equal(p.photoQuality,"NOT_VERIFIED");
 assert.equal(p.publicationAllowed,false);
}
assert.ok(keeps.placements.some(x=>x.slot==="STG-pray.angelus-03"&&x.note.includes("evening")));
assert.equal(keeps.global.editoriallyCovered,160+15+18+7);
assert.equal(keeps.global.editoriallyUncovered,267-keeps.global.editoriallyCovered);
assert.equal(keeps.global.contextualProposalsNotApproved,38);
assert.equal(keeps.global.certifiedPhotos,0);
assert.equal(keeps.policy.onlyPDOrCC0NativePhotoAllowed,true);
assert.equal(keeps.policy.noNewApproval,true);
console.log(JSON.stringify({result:"PASS",sourceKept:keeps.sourceKeepCount,sourceRejected:keeps.sourcePlacementRejectionCount,additionalPreviouslyApprovedSlots:7,editoriallyCovered:200,gaps:67,certifiedPhotoFiles:0},null,2));
