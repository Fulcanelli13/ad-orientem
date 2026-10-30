import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';

const dir='previews/pius-x-study/evidence/';
const wave=JSON.parse(readFileSync(dir+'pius-x-catechismo-maggiore-wave8-59-20261024.v1.json','utf8'));
const inventory=JSON.parse(readFileSync(dir+'pius-x-outside12-wave5-bulk-inventory-228-20261024.v1.json','utf8'));
const owner=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
const prior=new Map(inventory.records.filter(r=>r.sourceFamily==='CATECHISMO_MAGGIORE_1905').map(r=>[r.nodeId,r]));
assert.equal(wave.schema,'AO_SPX_P2_CATECHISMO_MAGGIORE_WAVE8_ALL59_V1');
assert.equal(wave.status,'PRIVATE_1905_ITALIAN_EDITION_CLAIM_TRIAGE_UNAPPROVED');
assert.equal(wave.summary.sourceNodePopulation,59);
assert.equal(wave.summary.catechismSubjects,14);
assert.equal(wave.summary.sourceSections,3);
assert.equal(wave.summary.sectionLocusGroups,14);
assert.equal(wave.summary.shortItalianEditionWitnesses,44);
assert.equal(wave.summary.claimBoundedCandidates,47);
assert.equal(wave.summary.explicitHolds,12);
assert.equal(wave.summary.outside12NodesStillAwaitingReview,31);
for(const key of ['original1905CatechismTextAuthorshipCertifications','newSourceGateAdmissions','certifiedTranslations','authenticatedWholeReplies','publishingApprovals'])assert.equal(wave.summary[key],0,key);
assert.equal(wave.provenance.textEdition,'Compendio della dottrina cristiana, 1905');
assert.equal(wave.provenance.originalHistoricalTextPrintedNotPiusXAutograph,true);
assert.equal(wave.provenance.papalAdoptionLetter,'https://www.vatican.va/content/pius-x/it/letters/documents/hf_p-x_let_19050614_compendio-catechismo.html');
assert(wave.provenance.popePersonalAutograph===undefined); // no implicit authored quotation or diary field
const chapterMap=new Map(wave.chapters.map(c=>[c.chapterId,c]));
assert.equal(chapterMap.size,14);
const byId=new Map(wave.witnesses.map(w=>[w.id,w]));
assert.equal(byId.size,44);
const expectedSections={I:0,IV:0,V:0};
for(const w of wave.witnesses){
 assert(Number.isInteger(w.editorialCatechismQuestion)&&w.editorialCatechismQuestion>0);
 assert(Number.isInteger(w.sourceWebLine)&&w.sourceWebLine>=10);
 assert(w.italian1905PrintedTextFragment.length>=18);
 assert(w.claimSupported.length>=30);
 assert(w.sourceUrl.startsWith('https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/'));
 assert.equal(w.speakerAttribution,'1905_APPROVED_CATECHISM_TEXT_NOT_VERIFIED_PERSONAL_PIUS_X_WORDS');
 assert.equal(w.originalAutographByPiusX,false);
 assert.equal(w.translationApproved,false);
 assert.equal(w.publicationApproved,false);
 assert(chapterMap.has(w.chapterId));
}
assert.equal(byId.get('CM05-SPX056-Q171-2').italian1905PrintedTextFragment,'senza sua colpa, ossia in buona fede');
assert.equal(byId.get('CM05-SPX001-Q655-2').editorialCatechismQuestion,655);
assert.equal(byId.get('CM05-SPXEXP041-Q633-3').editorialCatechismQuestion,633);
const seen=new Set();
for(const r of wave.records){
 assert(!seen.has(r.nodeId),'duplicate Wave8 node '+r.nodeId);seen.add(r.nodeId);
 const older=prior.get(r.nodeId),chapter=owner.chapters.get(r.chapterId);
 const node=chapter?.nodes.find(n=>n.id===r.nodeId),summary=chapterMap.get(r.chapterId);
 assert(older&&node&&summary,'Unknown existing original node '+r.nodeId);
 assert.equal(r.questionEn,older.questionEn);
 assert.equal(r.questionFr,older.questionFr);
 assert.equal(r.questionEn,node.q.en);
 assert.equal(r.questionFr,node.q.fr);
 assert.equal(r.sourceOwnerFile,older.sourceOwnerFile);
 assert.equal(r.nodeOwnerFile,older.nodeOwnerFile);
 assert.equal(r.sourceUrl,older.sourceUrl);
 assert.equal(r.sourceLocus,older.sourceLocus);
 assert.equal(r.sourceFamily,'CATECHISMO_MAGGIORE_1905');
 assert.equal(r.questionRange,summary.questionRange);
 assert(r.attribution.includes('NOT_AUTOMATICALLY_PERSONALLY_AUTHORED'));
 assert.equal(r.originalTextEditionVerified,true);
 for(const k of ['personallyAuthoredByPiusXCertified','translationApproved','fullAnswerApproved','modelGateEligible','publishingApproved'])assert.equal(r[k],false,r.nodeId+'/'+k);
 assert(!owner.sourceOnlyGate.get(r.chapterId)?.has(r.nodeId),'Wave8 research must not add a model-gated source '+r.nodeId);
 assert(!('answer' in r)&&!('answerEn' in r)&&!('answerFr' in r),'No parallel editorial dialogue answers');
 if(r.status==='HOLD_OUTSIDE_EXACT_1905_QA_OR_PERSONAL_DECISION'){
  assert(r.holdReason?.length>35);
  assert.equal(r.claimScope,null);
  assert.deepEqual(r.witnessIds,[]);
 }else{
  assert.equal(r.status,'BOUNDED_1905_ITALIAN_CATECHISM_EDITION_CLAIM_CANDIDATE_UNAPPROVED');
  assert.equal(r.holdReason,null);
  assert(r.claimScope?.length>30);
  assert(r.witnessIds.length>=1&&r.witnessIds.every(id=>byId.get(id)?.chapterId===r.chapterId));
 }
 expectedSections[r.catechismSection]++;
}
assert.deepEqual(expectedSections,{I:16,IV:35,V:8});
assert.equal(seen.size,59);
assert.equal(prior.size,59);
assert.equal(wave.records.filter(r=>r.status.startsWith('BOUNDED_')).length,47);
assert.equal(wave.records.filter(r=>r.status.startsWith('HOLD_')).length,12);
assert.equal([...owner.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
assert.equal(owner.data.counts.allNodes,423);
assert.equal(owner.data.chapters.length,106);
assert.equal(owner.data.approvals.publishing,false);
const currentLawHold=wave.records.find(r=>r.questionEn==='Can I use its historical fasting prescription as present-day universal law?');
const destHold=wave.records.find(r=>r.questionEn==='Can I ask the avatar for the eternal fate of a deceased relative?');
assert(currentLawHold?.status.startsWith('HOLD_')&&destHold?.status.startsWith('HOLD_'));
console.log('PASS SPX_CATECHISMO_WAVE8: 59 source-owner nodes, 14 subjects, 44 original Italian printed-edition witnesses, 47 narrow candidates and 12 holds; no new model-gated, certified or published nodes');
