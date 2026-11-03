import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const report=read("artifacts/sacred-art-2026/jan-feb-59-photo-readiness.json");
const original=read("artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json");
const humanPhoto=read("data/calendar/sacred-art-2026-batch01-60-exact-photo-owner-decisions-20261102.v1.json");
assert.equal(report.year,2026);
assert.equal(report.batch,"A");
assert.equal(report.noHomeMutation,true);
assert.equal(report.noNewPhotoAcquisition,true);
assert.equal(report.totals.dates,59);
assert.equal(report.totals.january,31);
assert.equal(report.totals.february,28);
assert.equal(report.totals.selectedProperGospelsVerified,58);
assert.equal(report.totals.datesWithResearchLead,59);
assert.equal(report.totals.datesNewlyImageRightsCertified,0);
assert.equal(report.totals.datesNewlyPhotoQualityCertified,0);
assert.equal(report.totals.datesNewlyPublishedToHomepage,0);
assert.equal(report.totals.datesBrowserVisuallyCertified,0);
assert.equal(report.totals.photoObjectsPreviouslyReviewed,60);
assert.equal(report.totals.photoObjectsPreviouslyApproved,25);
assert.equal(report.totals.photoObjectsPreviouslyRejected,35);
assert.equal(humanPhoto.rows.length,60);
const input=original.dates.filter(d=>/^2026-0[12]-/.test(d.date));
assert.deepEqual(report.dates.map(d=>d.date),input.map(d=>d.date));
assert.equal(new Set(report.dates.map(d=>d.date)).size,59);
for(const d of report.dates){
 const before=input.find(x=>x.date===d.date);
 assert.equal(before.observedPrincipalId,d.observedPrincipalId);
 assert.deepEqual(before.gospel,d.gospel);
 assert.ok(d.firstPhotoAuditCandidate);
 assert.equal(d.publicationAllowed,false);
 assert.equal(d.actualHomepageImageDisplayTested,false);
 assert.equal(d.imageCertification,"NOT_CERTIFIED_BY_THIS_SOURCE_AUDIT");
 assert.equal(d.totalResearchCandidateRows,d.alternatives.length+1);
 for(const c of [d.firstPhotoAuditCandidate,...d.alternatives]){
  assert.equal(c.certifiedForThisHomepageDate,false);
  assert.equal(c.physicalObjectIdentityIndependentlyCertified,false);
  assert.equal(c.photo.localBytesRehashedInThisAudit,false);
  assert.equal(c.photo.nativeWidth,null);
  assert.equal(c.photo.nativeHeight,null);
  assert.ok(c.blockers.includes("SELECTED_ORIGINAL_IMAGE_BYTES_NOT_CHECKED"));
  assert.ok(c.blockers.includes("ACTUAL_HOME_DATE_DISPLAY_NOT_BROWSER_CERTIFIED"));
  assert.notEqual(c.photo.photoOwnerDecision?.decision,"reject");
  assert.doesNotMatch(c.artist??"",/fra angelico|el greco/i);
  if(/museodelprado\.es/i.test(c.sourceUrl??"")){
   assert.equal(c.priorResearchSourceIsPradoHeld,true);
   assert.ok(c.blockers.includes("HISTORICAL_PRADO_PHOTO_SOURCE_HELD_DO_NOT_PUBLISH"));
   assert.equal(c.certifiedForThisHomepageDate,false);
  }
  if(c.photo.photoOwnerDecision){
   assert.equal(c.photo.photoOwnerDecision.originalFileReleaseQACompleted,false);
   assert.equal(c.photo.photoOwnerDecision.feastAssociationApproved,false);
  }
 }
}
assert.equal(report.totals.firstChoiceWithOperationalArtworkGroup+
 report.totals.firstChoiceSourceNotIn989,59);
assert.equal(Object.values(report.totals.byResearchLane).reduce((a,b)=>a+b,0),59);
const jan1=report.dates[0];
assert.equal(jan1.date,"2026-01-01");
assert.match(jan1.firstPhotoAuditCandidate.title,/Circumcision/i);
assert.equal(jan1.firstPhotoAuditCandidate.certifiedForThisHomepageDate,false);
assert.equal(jan1.firstPhotoAuditCandidate.historicalDateEditorialBasis,"NEW_DATE_SPECIFIC_APPROVAL");
assert.equal(jan1.firstPhotoAuditCandidate.preservedDateApproval,true);
const ash=report.dates.find(x=>x.date==="2026-02-18");
assert.equal(ash.firstPhotoAuditCandidate.historicalDateEditorialBasis,"NEW_DATE_SPECIFIC_APPROVAL");
assert.equal(ash.firstPhotoAuditCandidate.preservedDateApproval,true);
const lent1=report.dates.find(x=>x.date==="2026-02-22");
assert.equal(lent1.firstPhotoAuditCandidate.historicalDateEditorialBasis,"NEW_DATE_SPECIFIC_APPROVAL");
assert.equal(lent1.firstPhotoAuditCandidate.preservedDateApproval,true);
const epiphany=report.dates.find(x=>x.date==="2026-01-06");
assert.equal(epiphany.firstPhotoAuditCandidate.historicalDateEditorialBasis,
 "OCT17_PREVIOUSLY_APPROVED_ASSOCIATION_PRIMARY_NOT_EXPLICITLY_RECONFIRMED");
assert.equal(epiphany.firstPhotoAuditCandidate.preservedDateApproval,false);
assert.ok(report.dates.find(x=>x.date==="2026-02-12"));
assert.ok(report.dates.find(x=>x.date==="2026-02-28"));
console.log("PASS: January–February 59-day artwork/photo matrix, original user photo decisions protected, no fake publication");
console.log(JSON.stringify(report.totals,null,2));
