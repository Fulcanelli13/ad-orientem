import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const a="data/artwork/";
const slate=read(a+"sacred-art-2026-class-ii-existing-match-review-slate-20261110.v1.json");
const first=read(a+"sacred-art-2026-class-ii-batch01-curatorial-proposals-20261110.v1.json");
const second=read(a+"sacred-art-2026-class-ii-batch02-remaining-50-curatorial-triage-20261110.v1.json");
const gallery=read(a+"research-semantic-candidates-989.v1.json");
const master=read(a+"sacred-art-2026-coverage-first-master-20261110.v1.json");
const coverage=first.rows.concat(second.rows);
assert.equal(first.rows.length,25);
assert.equal(second.rows.length,50);
assert.equal(coverage.length,75);
assert.equal(new Set(coverage.map(x=>x.date)).size,75,"No batch overlap or duplicate date");
assert.deepEqual(new Set(coverage.map(x=>x.date)),new Set(slate.all75ClassIIDateMatchingCandidates.map(x=>x.date)),
 "Exactly the original 75 unmatched Class II dates are now editorially triaged");
const slateIndex=new Map(slate.all75ClassIIDateMatchingCandidates.map(x=>[x.date,x]));
const galleryIndex=new Map(gallery.artworks.map(x=>[x.workGroupId,x]));
let withOriginalLeads=0, withoutOriginalLeads=0, mismatches=0, named=0;
for (const x of second.rows){
 const original=slateIndex.get(x.date);
 assert.ok(original,x.date);
 assert.equal(x.observance,original.observance,x.date);
 assert.equal(x.principalId,original.principalId,x.date);
 assert.equal(x.existingDateSpecificCandidateCount,original.candidates.length,x.date);
 const dow=new Date(x.date+"T12:00:00Z").getUTCDay();
 assert.equal(x.weekdayISO,dow===0?7:dow,x.date);
 assert.equal(x.civilSunday,dow===0,x.date);
 assert.equal(x.sourceSundayFlagDisagreesWithCivilDate,x.sourceIsSundayFlag!==x.civilSunday,x.date);
 if(x.sourceSundayFlagDisagreesWithCivilDate)mismatches++;
 if(x.existingDateSpecificCandidateCount)withOriginalLeads++;else withoutOriginalLeads++;
 assert.equal(x.dateSelectionApproved,false,x.date);
 assert.equal(x.photoRightsOrMobileQAConferred,false,x.date);
 assert.equal(x.publicReleaseEnabled,false,x.date);
 assert.ok(x.editorialReason.length>35,x.date);
 assert.ok(x.liturgicalSubjectWorkingLabel,x.date);
 if(x.recommendedWork){
  named++;
  const work=x.recommendedWork;
  if(work.sourceType==="EXISTING_GALLERY_989_TITLE_GROUP"){
   const found=galleryIndex.get(work.id);
   assert.ok(found,x.date);
   assert.equal(found.title,work.title,x.date);
   assert.equal(found.artist,work.artist,x.date);
  }else {
   assert.ok(original.candidates.some(c=>c.title===work.title&&c.artist===work.artist&&
    c.artworkId===work.id&&!c.excludedByUserPreferredArtistPolicy),x.date);
  }
  assert.equal(work.confirmedPaintingSubject,false,x.date);
  assert.equal(work.photoReleasedForThisDate,false,x.date);
 }
 if(x.existingReuseProposed?.surface==="CALENDAR_DATE"){
  assert.ok(master.calendar.days.find(d=>d.date===x.existingReuseProposed.id)?.selectedArt,x.date);
 }
}
assert.equal(withOriginalLeads,20);
assert.equal(withoutOriginalLeads,30);
assert.equal(second.counts.withNamedWorkRecommendation,named);
assert.equal(second.counts.explicitSubjectGaps,second.rows.filter(x=>x.classification==="EXACT_SUBJECT_GAP").length);
assert.equal(second.counts.withCrossSurfaceOrDateReuse,second.rows.filter(x=>x.existingReuseProposed).length);
assert.equal(second.counts.sourceSundayFlagCivilDateMismatches,mismatches);
assert.equal(mismatches,5);
assert.equal(first.count.approvedDateBindings,0);
assert.equal(second.counts.newCalendarApprovals,0);
assert.equal(second.counts.newImageAssets,0);
assert.equal(master.calendar.counts.unmappedClassII,75,"Editorial triage is not approved date mapping");
console.log("PASS all 75 Class II artwork gaps triaged from canonical slate (25 + 50): "+named+
 " named second-batch proposals, "+second.counts.explicitSubjectGaps+" explicit second-batch subject gaps; zero new Calendar approvals or image releases");
