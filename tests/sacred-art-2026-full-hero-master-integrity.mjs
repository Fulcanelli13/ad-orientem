import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const m=JSON.parse(readFileSync(new URL("../data/calendar/sacred-art-2026-complete-hero-coverage-master.v1.json",import.meta.url),"utf8"));
assert.equal(m.schema,"AO_2026_COMPLETE_HERO_COVERAGE_MASTER_V1");
assert.equal(m.year,2026);
assert.equal(m.counts.sundays,52);
assert.equal(m.counts.classIDates,53);
assert.equal(m.counts.additionalMajorHighlights,17);
assert.equal(m.counts.uniqueCalendarDates,102);
assert.equal(m.counts.lockedDateArtSelections,10);
assert.equal(m.counts.alreadyReleasedExactHeroes,0);
assert.equal(m.constraints.zeroCost,true);
assert.equal(m.constraints.noEmailOrContact,true);
assert.equal(m.constraints.noLicensingOutreach,true);
assert.equal(m.constraints.neverReselectLockedTen,true);
assert.equal(m.constraints.excludeFraAngelico,true);
assert.equal(m.constraints.rightsFailClosed,true);
const all=[...m.groups.sundays,...m.groups.classI,...m.groups.additionalMajorHighlights];
assert.equal(all.length,122);
assert.equal(m.dateIndex.length,102);
assert.equal(new Set(m.dateIndex.map(x=>x.date)).size,102);
const sundays=m.groups.sundays;
assert.equal(new Set(sundays.map(x=>x.date)).size,52);
for(const s of sundays){
 assert.equal(new Date(s.date+"T12:00:00Z").getUTCDay(),0,s.date+" is not Sunday");
 assert.notEqual(s.publicationStatus,"RELEASED");
 assert.equal(s.dateIso2026,s.date);
 for(const c of s.priorSundayResearch){
   assert.equal(c.curatorApprovedForThisDate,false);
   assert.equal(c.photoRightsVerified,false);
   if(/fra angelico/i.test([c.artist,c.title].join(" ")))assert.equal(c.excludedByKnownPolicy,true);
 }
}
assert.equal(new Set(m.groups.classI.map(x=>x.date)).size,53);
for(const d of m.groups.classI){
 assert.ok(d.observedPrincipalId?.includes(":"),d.date+" original expected 1962 principal missing");
 assert.notEqual(d.publicationStatus,"RELEASED");
 for(const s of d.historicalCuratorSubjectSelections||[]){
   assert.equal(s.selectedForThisExact2026Date,false);
 }
 for(const c of d.contextualReuseCandidates||[]){
   assert.equal(c.canClaimExactFeastDepiction,false);
 }
}
let locked=new Map;
for(const x of all){
 const b=x.lockedDatePainting;
 if(!b)continue;
 assert.equal(x.selectionStatus,"LOCKED_BY_USER_20261019",x.date);
 assert.equal(b.approvedForThisSpecificDate,true);
 assert.equal(b.originalReleaseStillPending,true);
 assert.equal(b.photoRightsPolicy,"ZERO_FEE_ZERO_CONTACT");
 if(locked.has(x.date)){
   const prev=locked.get(x.date);
   assert.equal(prev.title,b.title);
   assert.equal(prev.artist,b.artist);
 }else locked.set(x.date,b);
}
assert.equal(locked.size,10);
for(const x of m.dateIndex){
 const present=all.filter(a=>a.date===x.date);
 assert.deepEqual(x.groups.slice().sort(),[...new Set(present.map(q=>q.group))].sort());
 assert.equal(Boolean(x.lockedDatePainting),locked.has(x.date));
}
assert.equal(m.reusableEarlierArt.userSelectedSubjectAssignments.length,44);
assert.equal(m.counts.allUniqueDatesRuntimeVerified,102);
assert.equal(m.counts.allClassIPrincipalIDsRuntimeVerified,53);
assert.equal(m.counts.sundayPrincipalIDsRuntimeVerified,52);
assert.equal(m.counts.additionalHighlightsObservedPrincipalIDsRuntimeVerified,17);
assert.equal(m.counts.historicalSubjectArtworkIdentitiesReconciled,44);
assert.equal(m.acceptance.real1962DayResolverAllUniqueDates,"PASSED_102_102");
assert.equal(m.constraints.excludeElGrecoFromNewSuggestions,true);
for(const x of m.dateIndex){
 assert.equal(x.observedDayReady,true);
 assert.ok(x.observedPrincipalId && x.observedTitle);
}

assert.equal(m.reusableEarlierArt.ratingEligibleArtworkReviewPool.length,135);
for(const x of m.reusableEarlierArt.userSelectedSubjectAssignments){
 assert.equal(x.selectedForThisExact2026Date,false);
 assert.equal(x.noAutomaticRelease,true);
 assert.equal(x.catalogueArtwork?.artworkId,x.artworkId);
 assert.ok(x.catalogueArtwork?.artist && x.catalogueArtwork?.title);
 assert.ok(x.catalogueArtwork?.museumObjectUrl);
 if(/fra angelico|el greco/i.test(x.catalogueArtwork.artist))
   assert.equal(x.notEligibleForNewSuggestion,true);
}
for(const x of m.reusableEarlierArt.ratingEligibleArtworkReviewPool){
 assert.equal(x.placedForExactDate,false);
 assert.ok(!/fra angelico/i.test((x.artist||"")+" "+(x.title||"")));
}
const released=all.filter(x=>x.publicationStatus!=="NONE_VERIFIED");
assert.equal(released.length,0);
console.log("HERO_FULL_MASTER_INTEGRITY PASS 52 Sundays + 53 Class I + 17 spotlights = 102 unique dates; 10 exact user approvals; 44 older subject choices; 135 rating-eligible; zero released; zero cost or contact");
