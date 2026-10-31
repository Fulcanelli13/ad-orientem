import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/prayer/artwork-editorial-20261030/";
const read=s=>JSON.parse(readFileSync(dir+s,"utf8"));
const research=read("stations-baroque-quality-and-rights-20261031.v1.json");
const rejection=read("stations-seven-pd-photo-source-candidates-20261031.v1.json");
const master=read("master-map-275-reconciliation-20261031.v1.json");
const mapping=read("prior-explicit-keeps-cross-module-20261031.v1.json");
const slots=read("balanced-reuse-20261030-assignments.v2.json").slots;
assert.equal(research.schema,"AO_STATIONS_ARTISTIC_AND_PD_CC0_SOURCE_RESEARCH_V1");
assert.deepEqual(research.slots.map(s=>s.slot),["STG-pray.stations-03","STG-pray.stations-07","STG-pray.stations-08","STG-pray.stations-09","STG-pray.stations-10","STG-pray.stations-11"]);
assert.equal(research.tally.currentlyUnmappedStations,6);
assert.equal(research.tally.viableExactSubjectPaintingForReview,1);
assert.equal(research.tally.paidSourceExcluded,1);
assert.equal(research.tally.stationsApprovedInThisPass,0);
assert.equal(research.tally.freePhotoFilesCertifiedInThisPass,0);
assert.equal(research.baseline.editorialMapped,mapping.global.editoriallyCovered);
assert.equal(research.baseline.editorialUnmapped,mapping.global.editoriallyUncovered);
assert.equal(master.scope.canonical_editorial_slots,research.baseline.totalEditorialSlots);
assert.equal(rejection.context.unmappedStationSlots,6);
assert.equal(rejection.context.lybaertArtworksExcluded,7);
const xi=research.slots.find(s=>s.station==="XI"),x=research.slots.find(s=>s.station==="X");
assert.equal(xi.status,"EDITORIAL_REVIEW_PENDING");
assert.equal(xi.reviewCandidate.approval,"NOT_USER_APPROVED");
assert.equal(xi.reviewCandidate.publicationReady,false);
assert.equal(xi.reviewCandidate.assetUrl,null);
assert.equal(xi.reviewCandidate.nativeWidth,2324);
assert.equal(xi.reviewCandidate.nativeHeight,3212);
assert.equal(xi.reviewCandidate.imageRights.includes("PUBLIC_DOMAIN_MARK"),true);
assert.equal(xi.reviewCandidate.rightsJurisdictionQA,"NOT_CLEARED");
assert.equal(xi.reviewCandidate.photoQualityQA,"NOT_CLEARED");
assert.equal(x.status,"RIGHTS_BLOCKED_SOURCE_FOUND");
assert.equal(x.blockedWork.photoFileUsable,false);
assert.equal(x.blockedWork.price,"PAID_RIGHTS_AGENCY_PHOTO");
assert.equal(research.constraints.costEUR,0);
assert.deepEqual(research.constraints.originalFileRightsAllowed,["CC0","PUBLIC_DOMAIN"]);
for(const s of research.slots){
 assert.ok(slots.some(x=>x.slot_id===s.slot),"Unknown Station slot");
 assert.ok(!/Lybaert|El Greco|Fra Angelico/i.test(JSON.stringify(s)),"User-rejected artwork cannot be shortlist candidate");
}
for(const slot of slots){
 for(const w of slot.works.filter(w=>/Lybaert/i.test(w.artist||""))){
  assert.equal(w.eligible,false,"Historical Lybaert candidate reactivated");
  assert.equal(w.editorial,"USER_REJECTED_LATER_ARTISTIC_FIT");
 }
}
assert.equal(research.preexistingApprovedSourceVerification.productionReady,false);
assert.equal(research.preexistingApprovedSourceVerification.nativeBytesFetchedIntoAppRepo,false);
assert.equal(research.preexistingApprovedSourceVerification.layoutScreenshotQA,false);
console.log("PASS: 6 unmapped Stations, 1 dark oil painting for editor (not approved), 1 commercial photo blocked, 0 published, Lybaert excluded.");
