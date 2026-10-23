import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';

const dir='previews/pius-x-study/evidence/';
const batch=JSON.parse(readFileSync(dir+'pius-x-wave6-five-vatican-documents-evidence-18-20261024.v1.json','utf8'));
const inventory=JSON.parse(readFileSync(dir+'pius-x-outside12-wave5-bulk-inventory-228-20261024.v1.json','utf8'));
const owner=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
const expectedDocCounts={S:[3,2,1,'la'],V:[3,2,1,'la'],G:[4,3,1,'la'],C:[4,4,0,'it'],L:[4,3,1,'it']};
assert.equal(batch.schema,'AO_SPX_WAVE6_FIVE_VATICAN_DOCUMENTS_18_NODE_CLAIM_EVIDENCE_V1');
assert.equal(batch.status,'RESEARCH_ONLY_ATTESTED_VATICAN_EDITION_SNIPPETS_NOT_SOURCE_GATE_PROMOTED');
assert.equal(batch.summary.screenedOriginalOutside12Nodes,18);
assert.equal(batch.summary.researchOnlyBoundedClaimCandidates,14);
assert.equal(batch.summary.explicitHolds,4);
assert.equal(batch.summary.addedShortVaticanEditionWitnesses,25);
assert.equal(batch.summary.originalLanguageLatinDocumentFamilies,3);
assert.equal(batch.summary.vaticanItalianOnlyDocumentFamilies,2);
assert.equal(batch.summary.otherOutside12NodesToResearch,210);
for(const key of ['newModelEvidenceAdmissions','fullAnswersApproved','translationsCertified','publishingApprovals'])
 assert.equal(batch.summary[key],0,key);
assert.equal(batch.records.length,18);
assert.equal(batch.witnesses.length,25);
assert.equal(new Set(batch.records.map(x=>x.nodeId)).size,18);
assert.equal(new Set(batch.witnesses.map(x=>x.id)).size,25);
const prior=new Map(inventory.records.map(r=>[r.nodeId,r]));
const docs=new Map(batch.documents.map(d=>[d.documentKey,d]));
assert.equal(docs.size,5);
const byId=new Map(batch.witnesses.map(w=>[w.id,w]));
for(const [key,expected] of Object.entries(expectedDocCounts)){
 const d=docs.get(key);
 assert(d);
 const rows=batch.records.filter(r=>r.documentKey===key);
 assert.equal(rows.length,expected[0]);
 assert.equal(rows.filter(r=>r.witnessIds.length>0).length,expected[1]);
 assert.equal(rows.filter(r=>r.holdReason).length,expected[2]);
 assert.equal(d.lang,expected[3]);
 assert(d.url.startsWith('https://www.vatican.va/content/pius-x/'));
 if(key==='C'||key==='L')assert(d.edition.includes('ORIGINAL_COMPOSITION_LANGUAGE_UNCONFIRMED'));
}
for(const w of batch.witnesses){
 const d=docs.get(w.documentKey);
 assert(d);
 assert.equal(w.sourceUrl,d.url);
 assert.equal(w.vaticanEditionLanguage,d.lang);
 assert.equal(w.editionProvenance,d.edition);
 assert.equal(w.originalCompositionLanguageCertified,false);
 assert(Number.isInteger(w.sourcePageLine)&&w.sourcePageLine>=35);
 assert(w.originalText.length>=17&&w.originalText.length<=190);
 assert(w.claimSupported.length>=20);
 assert(w.speaker==='PIUS_X_AUTHOR'||w.speaker==='ANSELM_QUOTED_BY_PIUS_X'||w.speaker==='ANSELM_REPORTED_BY_PIUS_X'||w.speaker==='BENEDICT_XIV_QUOTED_BY_PIUS_X');
 assert.equal(w.translationApproved,false);
 assert.equal(w.publishingApproved,false);
}
assert.equal(byId.get('W5-L-FAITHFUL').speaker,'BENEDICT_XIV_QUOTED_BY_PIUS_X');
assert.equal(byId.get('W5-C-CORRECTION').speaker,'ANSELM_REPORTED_BY_PIUS_X');
assert.equal(byId.get('W5-C-FAITH').speaker,'ANSELM_QUOTED_BY_PIUS_X');
for(const r of batch.records){
 const earlier=prior.get(r.nodeId);
 assert(earlier&&earlier.sourceFamily==='PAPAL_DOCUMENTS','Not an outside12 papal owner: '+r.nodeId);
 const doc=docs.get(r.documentKey);
 assert(doc&&doc.chapter===r.chapterId);
 assert.equal(r.questionEn,earlier.questionEn);
 assert.equal(r.questionFr,earlier.questionFr);
 assert.equal(r.sourceLocus,earlier.sourceLocus);
 assert.equal(r.originalOwnerFile,earlier.sourceOwnerFile);
 assert.equal(r.sourceOwnerPartial,earlier.ownerPartial);
 assert.equal(r.sourceUrl,doc.url);
 const c=owner.chapters.get(r.chapterId),n=c?.nodes.find(n=>n.id===r.nodeId);
 assert(n&&n.q.en===r.questionEn&&n.q.fr===r.questionFr);
 assert(!owner.sourceOnlyGate.get(r.chapterId)?.has(r.nodeId),'Wave6 research bypassed P6 gate: '+r.nodeId);
 const admittedResearch=r.status==='BOUNDED_VATICAN_EDITION_CLAIM_CANDIDATE_UNAPPROVED';
 if(admittedResearch){
  assert(r.witnessIds.length&&r.narrowClaimScope?.length>30&&r.holdReason===null);
  for(const id of r.witnessIds){
   const w=byId.get(id);
   assert(w&&w.documentKey===r.documentKey,'Wrong speaker/source or unattested excerpt '+id);
  }
 }else{
  assert(r.status.startsWith('HOLD_')&&r.holdReason.length>30);
  assert.deepEqual(r.witnessIds,[]);
  assert.equal(r.narrowClaimScope,null);
 }
 assert.equal(r.translationApproved,false);
 assert.equal(r.completeAnswerApproved,false);
 assert.equal(r.modelGateEligible,false);
 assert.equal(r.publishingApproved,false);
}
assert.equal(batch.records.filter(x=>x.witnessIds.length).length,14);
assert.equal(batch.records.filter(x=>x.holdReason).length,4);
assert.equal(inventory.records.length,228);
assert.equal([...owner.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
assert.equal(owner.data.counts.allNodes,423);
assert.equal(owner.data.approvals.publishing,false);
console.log('PASS SPX_WAVE6_18_VATICAN_NODES: 14 bounded source-edition research candidates, 4 explicit historical/current-law holds, 25 excerpt anchors; 144 model evidence admissions unchanged; 0 publishing approvals');
