import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const original=read("artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json");
const report=read("artifacts/sacred-art-2026/104-existing-seasonal-marian-reuse-proposals.json");
const gallery=read("data/artwork/research-operational-989.v1.json");
const valid=new Map(gallery.works.map(x=>[x.workGroupId,x]));
assert.equal(original.dates.length,365);
assert.equal(report.proposals.length,104);
assert.equal(new Set(report.proposals.map(x=>x.date)).size,104);
assert.equal(report.totals.previousCandidateDays,218);
assert.equal(report.totals.previouslySeasonalOrMarianUnassigned,104);
assert.equal(report.totals.all2026Days,365);
assert.equal(report.totals.actualHomeArtworkPublicationCertified,0);
assert.equal(report.totals.provisionalDaysWithAtLeastOneExistingArtLead+
 report.totals.remainingDaysWithoutAnyProposal,365);
const priorByDate=new Map(original.dates.map(x=>[x.date,x]));
const marian=report.proposals.filter(x=>
 x.status==="MARIAN_SATURDAY_EXISTING_GALLERY_CANDIDATE");
assert.equal(marian.length,12);
for(const item of report.proposals){
 const day=priorByDate.get(item.date);
 assert.ok(day);
 assert.equal(day.selectionState,"SEASONAL_OR_MARIAN_REUSE_NOT_YET_ASSIGNED");
 assert.equal(day.observedPrincipalId,item.observedPrincipalId);
 assert.equal(item.productionPublished,false);
 assert.equal(item.exactImageRightsCertified,false);
 assert.equal(item.exactGospelDepictionCertified,false);
 assert.equal(item.originalPhotoVisualQaCertified,false);
 assert.equal(item.physicalArtworkIdentityDedupCertified,false);
 assert.equal(item.stage,"PROVISIONAL_EXISTING_ART_REUSE_NOT_USER_DATE_APPROVED");
 if(item.selection?.workGroupId){
  const w=valid.get(item.selection.workGroupId);
  assert.ok(w,"Source art absent from existing gallery");
  assert.ok(!w.historicalExclusion);
  assert.ok(!/fra angelico|el greco/i.test(w.artist??""));
  assert.ok(!/museodelprado\.es/i.test(w.selectedSourceUrl??""));
 }
 if(item.status==="SAME_VERIFIED_GOSPEL_EXISTING_DATED_ARTWORK_CANDIDATE"){
  assert.ok(item.donor,"Gospel reuse requires a dated donor");
  assert.equal(item.donor.sourceGospel,item.gospel.reference);
  assert.equal(item.gospel.status,"ACTUAL_SELECTED_PROPER_GOSPEL_VERIFIED");
 }
 if(item.status==="PREVIOUS_LITURGICAL_WEEK_ARTWORK_CANDIDATE"){
  assert.ok(item.donor);
  assert.equal(item.context,"LITURGICAL_WEEK_CONTEXT_NOT_GOSPEL_MATCH");
 }
 if(item.status==="MARIAN_SATURDAY_EXISTING_GALLERY_CANDIDATE"){
  assert.match(item.observedTitle,/B\. V\. M\./);
  assert.ok(["REVIEW::met:437175"].includes(item.selection.workGroupId));
  assert.equal(item.alternativeArtwork[0].workGroupId,"REVIEW::met:436261");
 }
}
for(const date of ["2026-01-03","2026-04-18","2026-11-28"]){
 const entry=report.proposals.find(x=>x.date===date);
 assert.equal(entry?.status,"MARIAN_SATURDAY_EXISTING_GALLERY_CANDIDATE");
}
for(const date of ["2026-01-07","2026-04-15","2026-07-27"]){
 const entry=report.proposals.find(x=>x.date===date);
 assert.equal(entry?.status,"SAME_VERIFIED_GOSPEL_EXISTING_DATED_ARTWORK_CANDIDATE");
}
for(const date of ["2026-03-04","2026-12-09"]){
 const entry=report.proposals.find(x=>x.date===date);
 assert.ok(entry?.selection,"Liturgical seasonal donor missing");
}
assert.equal(report.totals.newlyProposedExistingReuses+report.totals.remainingSeasonalOrMarianExceptions,104);
assert.equal(report.unresolved.length,report.totals.remainingSeasonalOrMarianExceptions);
console.log("PASS: 104 existing-gallery seasonal/BVM reuse assessments, no new art, no publication");
console.log(JSON.stringify(report.totals,null,2));
