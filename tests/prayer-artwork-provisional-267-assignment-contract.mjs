import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../data/prayer/artwork-editorial-20261031/"+p,import.meta.url),"utf8"));
const assignments=read("provisional-one-choice-per-267-art-position.v1.json");
const index=read("all-267-source-linked-artwork-candidate-collection.v1.json");
test("all 267 Prayer art positions have a stageable but nonpublished selection",()=>{
 const s=assignments.stats;
 assert.equal(s.total,267);
 assert.equal(s.existingApprovedLinked,244);
 assert.equal(s.provisionalOnly,23);
 assert.equal(s.provisionalSeasonal,11);
 assert.equal(s.provisionalPrayer,12);
 assert.equal(s.selectedSourcesWithPhotoAcquired,0);
 assert.equal(s.producedReleaseMutations,0);
 const sl=new Set();
 for(const p of assignments.placements){
  assert.ok(!sl.has(p.slot),p.slot);
  sl.add(p.slot);
  assert.ok(p.assignment);
  assert.equal(p.assignment.productionEnabled,false,p.slot);
  assert.equal(p.currentEditoriallyCoveredBeforeNewReview,p.assignment.mode!=="PROVISIONAL_MATCH_WAIT_FOR_ONE_FUTURE_BULK_REVIEW");
 }
 assert.equal(sl.size,267);
 assert.equal(index.counts.onePerPositionProvisionalAssignments,267);
 assert.equal(index.counts.newArtworkApprovedByThisResearch,0);
});
test("new research can be collected and assigned provisionally without receiving approval",()=>{
 const still=assignments.placements.filter(x=>x.assignment.mode==="PROVISIONAL_MATCH_WAIT_FOR_ONE_FUTURE_BULK_REVIEW");
 assert.equal(still.length,23);
 for(const x of still){
  assert.equal(x.assignment.approvedNow,false);
  assert.ok(x.assignment.painting.artist);
  assert.ok(x.assignment.painting.title);
  assert.ok(x.assignment.editorialStatus);
  assert.ok(x.assignment.mode.includes("FUTURE_BULK_REVIEW"));
 }
 const others=assignments.placements.filter(x=>x.assignment.mode!=="PROVISIONAL_MATCH_WAIT_FOR_ONE_FUTURE_BULK_REVIEW");
 assert.equal(others.length,244);
});
