import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const report=read("artifacts/sacred-art-2026/26-existing-sources-reconciliation.json");
const earlier=read("artifacts/sacred-art-2026/48-existing-gallery-exception-reconciliation.json");
const legacy=read("data/artwork/2026-26-legacy-classIII-source-recovery.v1.json");
const ctx=read("data/artwork/2026-26-existing-contextual-reuse-proposals.v1.json");
assert.equal(earlier.totals.provisionalWithArtworkLead,339);
assert.equal(report.dates.length,26);
assert.equal(new Set(report.dates.map(x=>x.date)).size,26);
assert.equal(report.totals.baselineProvisionalDays,339);
assert.equal(report.totals.newStrictExactFeastPaintingLeads,4);
assert.equal(report.totals.newCompositeFeastPartialLeads,4);
assert.equal(report.totals.newContextualGospelLeads,9);
assert.equal(report.totals.stillWithoutAnyProvisionalLead,9);
assert.equal(report.totals.datesWithAnyProvisionalArtLead,356);
assert.equal(report.totals.strictFullFeastOrContextualArtworkCandidates,352);
assert.equal(report.totals.datesWithNoOrOnlyPartialFeastCoverage,13);
assert.equal(report.totals.originalPhotoRightsCertified,0);
assert.equal(report.totals.productionHomeDatesNewlyCertified,0);
assert.equal(legacy.rows.length,8);
assert.equal(ctx.entries.length,9);
const unmapped=earlier.outstandingDates.filter(d=>d.candidates.length===0);
assert.deepEqual(report.dates.map(d=>d.date),unmapped.map(d=>d.date));
for(const day of report.dates){
 assert.equal(day.homepageImageProductionCertified,false);
 assert.equal(day.exactSelectedImageRightsVerified,false);
 assert.equal(day.originalPhotoNativeQaPassed,false);
 for(const item of day.candidates){
  assert.equal(item.originalPhotoRightsCertified,false);
  assert.equal(item.photoNativeQualityCertified,false);
  assert.equal(item.physicalObjectIdentityVerified,false);
  assert.equal(item.dateUserApproval,false);
  assert.equal(item.productionPublished,false);
  assert.doesNotMatch(item.artist??"",/fra angelico|el greco/i);
  assert.doesNotMatch(item.sourceUrl??"",/museodelprado\.es/i);
 }
 if(day.partialCompositeFeastOnly){
  assert.equal(day.strictWholeFeastSubjectCoveredByThisPass,false);
  assert.ok(day.candidates.length>0);
 }
}
const row=date=>report.dates.find(x=>x.date===date);
assert.match(row("2026-02-12").candidates[0].title,/Seven Founders/i);
assert.match(row("2026-06-05").candidates[0].title,/Bonifatius/i);
assert.match(row("2026-08-07").candidates[0].title,/Cajetan/i);
assert.match(row("2026-11-23").candidates[0].title,/Clément/i);
assert.equal(row("2026-04-22").partialCompositeFeastOnly,true);
assert.ok(row("2026-04-22").excludedEarlierSourceRows.some(x=>
 /NOT_A_PAINTING/.test(x.reason)));
assert.equal(row("2026-05-12").gospel.reference,null);
assert.equal(row("2026-05-12").partialCompositeFeastOnly,true);
assert.equal(row("2026-07-10").partialCompositeFeastOnly,true);
assert.ok(row("2026-07-10").candidates.every(x=>
 !/justa|sevill/i.test(x.title)));
assert.ok(row("2026-07-10").excludedEarlierSourceRows.some(x=>
 x.reason==="DIFFERENT_RUFINA_OF_SEVILLE"));
assert.equal(row("2026-07-28").partialCompositeFeastOnly,true);
const ctxRows=report.dates.filter(x=>x.existingResearchScope==="CONTEXTUAL_PERICOPE");
assert.equal(ctxRows.length,9);
for(const day of ctxRows){
 assert.equal(day.strictWholeFeastSubjectCoveredByThisPass,false);
 assert.equal(day.reconciliationState,"CONTEXTUAL_GOSPEL_THEOLOGICAL_LINK_NOT_EXACT_SCENE");
 assert.ok(day.contextualEditorialNote);
}
for(const date of ["2026-11-22","2026-11-27"]){
 assert.equal(row(date).candidates[0].historicalDonorDate,"2026-11-29");
 assert.equal(row(date).candidates[0].historicalDonorEditorialState,"USER_LOCKED_DATE_ARTWORK");
}
for(const date of ["2026-06-28","2026-07-12","2026-07-16","2026-07-17",
 "2026-08-30","2026-09-04","2026-09-23","2026-09-26","2026-11-15"]){
 assert.equal(row(date).candidates.length,0,"No invented lead for "+date);
}
console.log("PASS: 26 archived-source exceptions; 4 exact, 4 partial, 9 contextual, 9 still unmatched, no publication");
console.log(JSON.stringify(report.totals,null,2));
