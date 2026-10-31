import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/prayer/artwork-editorial-20261030/";
const entries=JSON.parse(readFileSync(dir+"stations-seven-pd-photo-source-candidates-20261031.v1.json","utf8"));
const registry=JSON.parse(readFileSync(dir+"balanced-reuse-20261030-assignments.v2.json","utf8"));
const global=JSON.parse(readFileSync(dir+"prior-explicit-keeps-cross-module-20261031.v1.json","utf8"));
const expected=["03","05","07","08","09","10","11"].map(i=>"STG-pray.stations-"+i);
assert.equal(entries.schema,"AO_PRAYER_STATIONS_SEVEN_PD_SOURCE_RESEARCH_V2");
assert.deepEqual(entries.entries.map(e=>e.editorialSlot),expected);
assert.deepEqual(entries.rejectedHistoricalCandidates.map(e=>e.editorialSlot),expected);
assert.equal(entries.context.previousEditorialCovered,199);
assert.equal(entries.context.currentEditorialCovered,global.global.editoriallyCovered);
assert.equal(entries.context.remainingEditorialGaps,global.global.editoriallyUncovered);
assert.equal(entries.context.remainingEditorialGaps,67);
assert.equal(entries.context.currentEditorialCovered,200);
assert.equal(entries.context.inheritedAlreadyApprovedPaintingSlots,1);
assert.equal(entries.context.unmappedStationSlots,6);
assert.equal(entries.context.newlyApproved,0);
assert.equal(entries.context.activePaintingCandidates,1);
assert.equal(entries.context.unapprovedEtchingAlternatives,7);
assert.equal(entries.context.lybaertArtworksExcluded,7);
assert.equal(entries.context.newlyApproved,0);
assert.equal(entries.context.productionClearedImages,0);
assert.equal(entries.hardExclusion.status,"USER_REJECTED_PERMANENT_EXCLUDE");
assert.equal(entries.hardExclusion.mayOnlyReverseByNewExplicitUserApproval,true);
for(const e of entries.entries){
 assert.ok(registry.slots.some(s=>s.slot_id===e.editorialSlot));
 if(e.editorialSlot==="STG-pray.stations-05"){
   assert.match(e.actualPaintingSelection,/Domenichino/);
   assert.equal(e.inheritance.artworkId,"REVIEW::commons:22178536");
   assert.equal(e.inheritance.rightsBasis,"Getty Open Content CC0 and Commons PD-Art");
   assert.equal(e.inheritance.stillNeedsNativePhotoQA,true);
   assert.equal(e.inheritance.publicationAllowed,false);
 }else{
   assert.equal(e.actualPaintingSelection,"NONE");
   assert.equal(e.inheritance,null);
 }
 assert.equal(e.artisticApproval,e.editorialSlot==="STG-pray.stations-05"?"SAME_SCENE_REUSE_OF_EXISTING_USER_APPROVAL_NOT_NEW_SELECTION":"NOT_REQUESTED_OR_GRANTED");
 assert.equal(e.unapprovedEtchingResearch.length,1);
 assert.equal(e.unapprovedEtchingResearch[0].artist,"Giovanni Domenico Tiepolo");
 assert.equal(e.unapprovedEtchingResearch[0].approvedByUser,false);
 assert.equal(e.unapprovedEtchingResearch[0].publicationReady,false);
 assert.equal(e.publication.ready,false);
 assert.equal(e.publication.assetUrl,null);
 assert.equal(e.publication.runtimeDisplayEnabled,false);
 assert.ok(!JSON.stringify(e).includes("Lybaert"),"Rejected oil artwork must not remain in selectable candidate object");
}
for(const e of entries.rejectedHistoricalCandidates){
 assert.equal(e.artist,"Théophile Lybaert");
 assert.equal(e.decision,"USER_REJECTED_ARTISTIC_FIT");
 assert.equal(e.blockedAcrossAllPrayerAndOtherAdOrientemArtContexts,true);
 assert.equal(e.doNotResurfaceAsRecommendation,true);
 assert.equal(e.doNotRecheckOrSubstituteWithoutUserExplicitlyReversingRejection,true);
 assert.ok(e.originalFilePage.includes("Theophile_Lybaert"));
}
assert.equal(new Set(entries.rejectedHistoricalCandidates.map(e=>e.originalFilePage)).size,7);
const benediction=entries.guardrails.find(x=>x.id==="BENEDICTION_BLESSING_EXACTNESS");
assert.equal(benediction.publicationAllowed,false);
const therese=entries.guardrails.find(x=>x.id==="THERESA_PHOTOGRAPH_REUSE");
assert.equal(therese.publicationAllowed,false);
console.log("PASS: Lybaert rejected and unselectable in all 7 Station slots; 7 etchings research-only; 67 current editorial gaps; no new photo release.");
