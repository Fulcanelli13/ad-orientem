// Source-critical P1 dedup and P2 family routing; never approves/appends Mass prose.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL('../'+path, import.meta.url),'utf8'));
const prefix='data/learn/research/';
const d=read(prefix+'mystery-mass-p1-22-dedup-p2-180-prayer-families-20261015.v1.json');
const p=read(prefix+'mystery-mass-p1-six-lookups-thirtytwo-source-alignments-20261015.v1.json');
const manuscript=read(prefix+'mystery-mass-source-led-narrative-drafts-20261014.v1.json');
const verifiedStudies=new Map(manuscript.liturgicalStudySelections.flatMap(x=>
  x.studyOfMassExistingDrafts.map(s=>[s.id,s])));
assert.equal(verifiedStudies.size,44);
assert.equal(d.p1ClauseDecisions.length,32);
assert.equal(p.parentEvidenceThirtyTwo.length,32);
const original=new Map(p.parentEvidenceThirtyTwo.map(x=>[x.unitId,x]));
const expected={OPTIONAL_MICRO_DETAIL_IN_EXISTING_OWNER:10,REUSE_44_BILINGUAL_STUDIES:12,
  REFERENCE_ONLY_NO_NEW_TEXT:6,UPSTREAM_TEXT_BOUNDARY_REPAIR:2,SHARED_FORMULA_NO_NEW_TEXT:2};
const count={};
for(const x of d.p1ClauseDecisions){
 assert(original.has(x.unitId),'New unowned claim: '+x.unitId);
 assert.equal(x.sourceCueId,original.get(x.unitId).sourceCueId);
 assert.equal(x.sourceFit,original.get(x.unitId).assessment);
 assert.equal(x.review,'UNPUBLISHED_INHERITED_OWNER_ONLY');
 for(const id of x.existingBilingualStudyIds){
  const study=verifiedStudies.get(id);
  assert(study&&study.originalEnglishDeep&&study.originalFrenchDeep,'non-existent bilingual study: '+id);
 }
 count[x.editorialOutcome]=(count[x.editorialOutcome]??0)+1;
}
assert.deepEqual(count,d.counts.p1Outcomes);
assert.deepEqual(count,expected);
assert.equal(d.counts.distinctPrayerOwnersWithOptionalDetail,7);
assert.equal(d.p2FamilyPlan.length,12);
assert.equal(d.p2FamilyPlan.reduce((n,x)=>n+x.count,0),180);
assert.equal(d.counts.p2DistinctSourceParents,121);
assert.equal(d.counts.p2NamedPrayerTitles,49);
assert(d.p2FamilyPlan.every(x=>x.certainty==='FAMILY_TRIAGE_NOT_AUTHOR_QUOTATION_CERTIFICATION'));
assert.equal(d.p2FamilyPlan.find(x=>x.name.includes('Canon doxology')).reviewPolicy,'AO.CANON.14');
assert.equal(d.counts.additionalPublicationsApproved,0);
assert.equal(d.githubWorkbookCommitted,false);
console.log('P1/P2 study review passed: 32 decisions = 12 reused, 10 optional existing-owner details, 10 non-writing/repair; 180 P2 clauses grouped into 12 waves. No publication approvals.');
