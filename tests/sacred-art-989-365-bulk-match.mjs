import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=relative=>JSON.parse(readFileSync(new URL("../"+relative,import.meta.url),"utf8"));
const gallery=read("data/artwork/research-operational-989.v1.json");
const source=read("data/artwork/research-source-records-3205.v1.json");
const prior=read("data/artwork/2026-prior-date-artwork-evidence.v1.json");
const semantics=read("data/artwork/research-semantic-candidates-989.v1.json");
assert.equal(semantics.artworks.length,989);
assert.equal(semantics.counts.tagged,657);
assert.equal(semantics.counts.untagged,332);
const duplicate=read("data/artwork/research-prior-duplicate-decisions.v1.json");
assert.equal(duplicate.reviewGroups.length,18);
assert.equal(duplicate.reviewedHumanDecisions.length,4);
assert.equal(duplicate.counts.automaticExactSourceAliases,12);
assert.equal(duplicate.counts.identitiesMerged,0);
const sourceIds=new Set(source.records.map(x=>x.recordId));
for(const decision of duplicate.reviewedHumanDecisions){
 assert.ok(sourceIds.has(decision.preferredSourceRecord),
  "Existing preferred source photo missing from consolidated archive");
 assert.ok(decision.allRecordsRetained);
}

const current=read("data/calendar/research/2026-calendar-gospel-home-artwork-source-crosswalk.v1.json");
const report=read("artifacts/sacred-art-2026/365-existing-gallery-bulk-match.json");
assert.equal(gallery.works.length,989);
assert.equal(source.records.length,3205);
assert.equal(new Set(gallery.works.map(x=>x.workGroupId)).size,989);
assert.equal(new Set(source.records.map(x=>x.recordId)).size,3205);
const groups=new Set(gallery.works.map(x=>x.workGroupId));
const approved=source.records.filter(x=>x.originalUserDecision==="IMPORT"||x.originalUserDecision==="IMPORT_WITH_CORRECTIONS");
const rejected=source.records.filter(x=>x.originalUserDecision==="REJECT");
assert.equal(approved.length,856);
assert.equal(rejected.length,1599);
assert.equal(source.records.filter(x=>x.isOperationalCandidate&&!groups.has(x.workGroupId)).length,0);
assert.equal(gallery.works.filter(x=>x.queue==="PHOTO_QA_OR_REPAIR").length,548);
assert.equal(gallery.works.filter(x=>x.queue==="RIGHTS_OR_ALTERNATIVE").length,441);
assert.ok(gallery.works.every(x=>x.productionReleased===false));
assert.equal(prior.days.length,365);
assert.equal(current.dates.length,365);
assert.equal(report.dates.length,365);
assert.equal(new Set(report.dates.map(x=>x.date)).size,365);
assert.equal(report.stats.protectedDateArtDates,10);
assert.equal(report.stats.historicalDatedSelectionDates,53);
assert.equal(report.stats.historicCuratedProposalDates,40);
assert.equal(report.stats.artworkDatesPublishedCertifiedByThisAudit,0);
assert.equal(report.stats.actualImageBytesCheckedByThisAudit,0);
assert.equal(Object.values(report.coverageByClass).reduce((n,x)=>n+x.days,0),365);
assert.deepEqual(Object.fromEntries(Object.entries(report.coverageByClass).map(([k,v])=>[k,v.days])),
 {I:53,II:76,III:165,IV:71});
for(let i=0;i<365;i++){
 const row=report.dates[i];
 assert.equal(row.date,prior.days[i].date);
 assert.equal(row.date,current.dates[i].date);
 assert.equal(row.observedPrincipalId,current.dates[i].observedPrincipalId);
 assert.ok(row.selectionState);
 assert.equal(row.candidateCount,row.candidates.length);
 assert.ok(row.usableResearchCandidateCount<=row.candidateCount);
 for(const item of row.candidates){
  assert.equal(item.productionPublished,false);
  assert.equal(item.originalPhotoRightsCertified,false);
  assert.equal(item.originalPhotoQualityCertified,false);
  assert.equal(item.physicalObjectIdentityCertified,false);
  if(item.groupId)assert.ok(groups.has(item.groupId));
 }
}
const allSaints=report.dates.find(d=>d.date==="2026-11-01");
assert.equal(allSaints.protectedDateArtwork!=null,true);
const christKing=report.dates.find(d=>d.date==="2026-10-25");
assert.ok(christKing.protectedDateArtwork);
const december=report.dates.find(d=>d.date==="2026-12-16");
assert.equal(december.gospel.reference===null || typeof december.gospel.reference==="string",true);
const agatha=report.dates.find(d=>d.date==="2026-02-05");
assert.ok(agatha.candidates.some(x=>x.evidenceKind==="EXISTING_GALLERY_EXACT_SAINT_TITLE_SCREEN"),
 "Existing Saint Agatha painting must be recovered without a new search");
if(report.stats.sourceResolvedGospels===355){
 const cana=report.dates.find(d=>d.date==="2026-01-18");
 assert.ok(cana.candidates.some(x=>x.evidenceKind==="VERIFIED_GOSPEL_EXISTING_GALLERY_TITLE_SCREEN"),
 "Cana wedding painting exists in historical gallery and must be Gospel screened");
}
const marian=report.dates.find(d=>d.date==="2026-01-03");
assert.equal(marian.seasonalOrMarianReuseRequired,true);
assert.ok(report.dates.every(d=>!d.candidates.some(c=>c.approval==="AUTOMATICALLY_APPROVED")));
console.log("PASS: 3,205 source decisions, 989 operational groups and 365 source-guarded artwork candidate dates");
console.log(JSON.stringify(report.stats,null,2));
