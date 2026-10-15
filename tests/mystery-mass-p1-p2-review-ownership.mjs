import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const d=load('data/learn/research/mystery-mass-p1-seven-prayers-p2-58-editorial-review-20261015.v1.json');
const p1=load('data/learn/research/mystery-mass-p1-six-lookups-thirtytwo-source-alignments-20261015.v1.json');
const manuscript=load('data/learn/research/mystery-mass-source-led-narrative-drafts-20261014.v1.json');
const latin=load('data/presentation/reader-text-sung.v1.json');
assert.equal(d.metrics.p1ExistingPrayerOwners,7);
assert.equal(d.metrics.p1AdditionalClausePointers,10);
assert.equal(d.metrics.p2NewlyReviewedClausePointers,58);
assert.equal(d.metrics.p2OriginalBatchPrep,27);
assert.equal(d.metrics.p2OriginalBatchCommunion,31);
assert.equal(d.metrics.p2RemainingFamilyClassifiedButNotReviewed,122);
assert.equal(d.metrics.leadingCommaFragments,7);
assert.equal(d.metrics.approvedPublicationCount,0);
assert.equal(d.workbookGitHubCommitted,false);

const knownCueIds=new Set(latin.blocks.flatMap(b=>b.units.map(x=>x.cue_id)));
const studies=new Map(manuscript.liturgicalStudySelections.map(x=>[x.owner,new Set(x.studyOfMassExistingDrafts.map(y=>y.id))]));
const fromEarlier=new Set(p1.parentEvidenceThirtyTwo.filter(x=>x.assessment.startsWith('DIRECT_AUTHOR_EXPOSITION')).map(x=>x.unitId));
const seenP1=new Set();
for(const group of d.p1SevenExistingPrayerOwners){
 assert(studies.has(group.owner),'no canonical source-owner '+group.owner);
 assert(group.latinUnits.length===group.micro.length);
 for(const id of group.latinUnits){
  assert(!seenP1.has(id),'duplicate P1 unit');seenP1.add(id);
  assert(fromEarlier.has(id),'P1 direct author material not in existing 32 source ledger: '+id);
  const match=id.match(/^AO\.V3\.(\d{4})\.U\d{3}$/);
  assert(match);
  assert(knownCueIds.has('AO.SM.C'+match[1]),'missing Mass cue '+id);
 }
 for(const studyId of group.old)assert(studies.get(group.owner).has(studyId),'lost old bilingual study '+studyId);
 assert(group.sourceUrl.startsWith('https://'));
 assert.equal(group.review,'NO_PUBLICATION_APPROVAL');
}
assert.equal(seenP1.size,10);
const expect={SCRIPTURE_ALREADY_OWNED:13,REPEATED_RESPONSE:10,CONFITEOR_ROLE_VARIANT:2,SHARED_CONCLUSION:1,P1_EXISTING_OWNER_ADDITION:1,ALREADY_COVERED:27,TARGETED_SOURCE_COLLATION:1,SCRIPTURE_CROSS_REF:1,OPTIONAL_SECOND_CONFITEOR:2};
const seenP2=new Set();
for(const [key,size] of Object.entries(expect)){
 assert.equal(d.p2Classifications[key]?.length,size,key);
 for(const id of d.p2Classifications[key]){
  assert(!seenP2.has(id),'duplicate P2 unit '+id);seenP2.add(id);
  const match=id.match(/^AO\.V3\.(\d{4})\.U\d{3}$/);
  assert(match);
  assert(knownCueIds.has('AO.SM.C'+match[1]),'missing actual Mass source cue for '+id);
 }
}
assert.equal(seenP2.size,58);
assert.equal(d.sourceSpanFlags.length,7);
assert(d.sourceSpanFlags.every(id=>seenP2.has(id)));
assert.deepEqual(d.p2Classifications.TARGETED_SOURCE_COLLATION,['AO.V3.0227.U001']);
assert.deepEqual(d.p2Classifications.SCRIPTURE_CROSS_REF,['AO.V3.0233.U003']);
for(const x of d.p2ExistingStudyLinks){
 assert(x.conditional);
 assert([...studies.values()].some(s=>s.has(x.study)),'unknown bilingual source '+x.study);
}
assert(d.otherNonPromotion.some(x=>x.includes('Second Confiteor')));
assert(d.otherNonPromotion.some(x=>x.includes('42 author')));
console.log('Mystery reviewer gate: 7 existing prayer groups / 10 candidate micro-details and 58 P2 clause decisions / 7 span flags; 44 inherited bilingual studies and normative Mass reader preserved.');
