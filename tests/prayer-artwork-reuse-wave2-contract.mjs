import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const w1=read("../data/prayer/artwork-editorial-20261031/approved-existing-art-reassignments-wave1.v1.json");
const w2=read("../data/prayer/artwork-editorial-20261031/approved-existing-art-reassignments-wave2.v1.json");
test("preexisting user KEPT art survives with unchanged identity and no new approval",()=>{
 assert.equal(w2.priorUserKeeps.length,7);
 for(const a of w2.priorUserKeeps){
  assert.equal(a.approval,"USER_KEEP_2026_10_28");
  assert.ok(a.sourceArtworkIds.length);
  assert.equal(a.publishable,false);
 }
 assert.deepEqual(w2.priorUserKeeps.find(x=>x.targetSlot==="COV-prayer.hymns").sourceArtworkIds,["historic:peter paul rubens:assumption of the virgin"]);
});
test("no new research is passed off as selected, approved, or published",()=>{
 const x=w2.newResearchPolicy;
 assert.equal(x.requireExplicitUserApprovalForEveryNewPainting,true);
 assert.equal(x.newCandidatesAutoAccepted,false);
 assert.equal(x.newCandidatesAutoPublished,false);
 assert.equal(x.userDidNotApproveAnyOfThese,true);
 assert.equal(x.pendingPreviouslySuggestedCandidates.length,4);
});
test("five generic doors inherit already-approved child pools without inventing images",()=>{
 assert.equal(w2.derivedGenericDoorPools.length,5);
 for(const d of w2.derivedGenericDoorPools){
  assert.match(d.targetSlot,/^DOOR-D[14679]$/);
  assert.equal(d.existingDonorSlots.length,3);
  assert.equal(d.requiresDirectSelectedPainting,false);
  assert.match(d.imagePublication,/NO_NEW_IMAGES/);
 }
});
test("previous approvals increase art mapping only on eight verifiable previously empty positions",()=>{
 const stats=w2.statistics;
 assert.equal(stats.baselineEditorialArtCovered,w1.wave.coveredAfterWave);
 assert.equal(stats.addedNewlyCoveredPositions,8);
 assert.equal(stats.editorialCoveredAfterWave,234);
 assert.equal(stats.stillUncovered,33);
 assert.equal(stats.remainingPrayerOnly,22);
 assert.equal(stats.remainingSeasonalHomepage,11);
 assert.equal(stats.editorialCoveredAfterWave+stats.stillUncovered,267);
 const original=new Set(w1.remainingWithoutApprovedArt.map(x=>x.slot));
 const now=new Set(w2.remaining.map(x=>x.slot));
 assert.equal(now.size,33);
 for(const target of now)assert.ok(original.has(target),target);
 for(const a of w2.existingApprovedContextualReuses){assert.ok(original.has(a.targetSlot));assert.ok(!now.has(a.targetSlot));assert.ok(a.artworks.length);}
});
