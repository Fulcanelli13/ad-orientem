import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';
const dir='previews/pius-x-study/evidence/';
const data=JSON.parse(readFileSync(dir+'pius-x-wave9-biography-quam-singulari-31-20261024.v1.json','utf8'));
const inventory=JSON.parse(readFileSync(dir+'pius-x-outside12-wave5-bulk-inventory-228-20261024.v1.json','utf8'));
const wave6=JSON.parse(readFileSync(dir+'pius-x-wave6-five-vatican-documents-evidence-18-20261024.v1.json','utf8'));
const wave7=JSON.parse(readFileSync(dir+'pius-x-salzano-wave7-transcription-research-120-20261024.v1.json','utf8'));
const wave8=JSON.parse(readFileSync(dir+'pius-x-catechismo-maggiore-wave8-59-20261024.v1.json','utf8'));
const owner=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
assert.equal(data.schema,'AO_SPX_P2_WAVE9_BIOGRAPHY_QUAM_SINGULARI_ALL31_V1');
assert.equal(data.status,'RESEARCH_ONLY_SOURCE_ANCHOR_CANDIDATES_NOT_VERIFIED_HISTORICAL_SPEECH');
const counts=data.summary;
assert.equal(counts.outside12PreviouslyUnhandledNodes,31);
assert.equal(counts.biographyNodes,27);
assert.equal(counts.congregationalDecreeNodes,4);
assert.equal(counts.biographySubjects,9);
assert.equal(counts.congregationalSubjects,1);
assert.equal(counts.sourceAnchorClaims,24);
assert.equal(counts.narrowContextCandidates,24);
assert.equal(counts.biographyResearchCandidates,21);
assert.equal(counts.congregationalResearchCandidates,3);
assert.equal(counts.explicitHolds,7);
assert.equal(counts.biographyHolds,6);
assert.equal(counts.congregationalHolds,1);
assert.equal(counts.originalOutside12ScreenedAcrossWaves5to9,228);
assert.equal(counts.originalOutside12UnscreenedNow,0);
assert.equal(counts.originalTwelveDocumentsHoldsUnchanged,51);
for(const k of ['newModelGateAdmissions','fullAnswersApproved','translationsCertified','publishingApprovals'])assert.equal(counts[k],0,k);
assert.equal(data.records.length,31);
assert.equal(data.sourceAnchors.length,24);
const anchor=new Map(data.sourceAnchors.map(a=>[a.id,a]));
assert.equal(anchor.size,24);
for(const a of anchor.values()){
 assert(a.sourceUrl.startsWith('https://'));
 assert(Number.isInteger(a.webLineStart)&&a.webLineStart>0);
 assert(Number.isInteger(a.webLineEnd)&&a.webLineEnd>=a.webLineStart);
 assert(a.claimSupported.length>=30);
 assert.equal(a.historicalSourceTextVerbatimCopied,false);
 assert.equal(a.originalPapalAuthorship,false);
 assert.equal(a.independentArchivalVerification,false);
 assert.equal(a.fullDialogueVerification,false);
}
const prev=new Map(inventory.records.filter(r=>['BIOGRAPHICAL_SECONDARY','CONGREGATIONAL_DECREE'].includes(r.sourceFamily)).map(r=>[r.nodeId,r]));
assert.equal(prev.size,31);
const seen=new Set();
let bio=0,decree=0,candidates=0,holds=0;
for(const r of data.records){
 assert(!seen.has(r.nodeId),'Repeated original node '+r.nodeId);seen.add(r.nodeId);
 const prior=prev.get(r.nodeId),chapter=owner.chapters.get(r.chapterId),node=chapter?.nodes.find(n=>n.id===r.nodeId);
 assert(prior&&chapter&&node,'Noncanonical Wave 9 node '+r.nodeId);
 for(const [k,p] of [['questionEn','questionEn'],['questionFr','questionFr'],['sourceOwnerFile','sourceOwnerFile'],['nodeOwnerFile','nodeOwnerFile'],['sourceFamily','sourceFamily']])assert.equal(r[k],prior[p],r.nodeId+'/'+k);
 assert.equal(r.canonicalSourceUrl,prior.sourceUrl);
 assert.equal(r.canonicalSourceLocus,prior.sourceLocus);
 assert.equal(r.questionEn,node.q.en);
 assert.equal(r.questionFr,node.q.fr);
 assert(!owner.sourceOnlyGate.get(r.chapterId)?.has(r.nodeId),'Non-papal or secondary source would cross papal generative gate');
 const isBio=r.sourceFamily==='BIOGRAPHICAL_SECONDARY';
 if(isBio){bio++;assert.equal(r.correctHistoricalSpeaker,'THIRD_PERSON_HISTORICAL_NARRATOR');}
 else{decree++;assert.equal(r.sourceFamily,'CONGREGATIONAL_DECREE');assert.equal(r.correctHistoricalSpeaker,'SACRED_CONGREGATION_DOCUMENT_PIUS_X_APPROVED');}
 for(const k of ['originalFirstPersonPiusXQuotationCertified','independentOriginalArchivalWitnessChecked','bilingualFullAnswerApproved','modelGateEligible','publishingApproved'])assert.equal(r[k],false,r.nodeId+'/'+k);
 assert(!('answer' in r)&&!('answerEn' in r)&&!('answerFr' in r));
 if(r.sourceAnchorIds.length){
  candidates++;
  assert(r.researchStatus.startsWith('BOUNDED_'));
  assert(r.claimScope?.length>35);
  assert.equal(r.holdReason,null);
  for(const id of r.sourceAnchorIds){
   const a=anchor.get(id);assert(a,'Missing provenance '+id);
   if(isBio)assert(a.sourceNature!=='1910_CONGREGATIONAL_DECREE_ENGLISH_TRANSLATION');
   else assert.equal(a.sourceNature,'1910_CONGREGATIONAL_DECREE_ENGLISH_TRANSLATION');
  }
 }else{
  holds++;assert.equal(r.researchStatus,'HOLD_UNATTESTED_PERSONAL_SPEECH_OR_PRESENT_DAY_CASE');
  assert(r.holdReason?.length>40);assert.equal(r.claimScope,null);
 }
}
assert.equal(bio,27);assert.equal(decree,4);
assert.equal(candidates,24);assert.equal(holds,7);
assert.equal(seen.size,31);
const conflicts=new Map(data.sourceConflicts.map(c=>[c.issue,c]));
for(const issue of ['SARTO_SIBLINGS_10_VS_11','FAMILY_WEALTH_NUANCE','PARENTAL_VOCATION_REPORTED_SECONDARY','QUAM_SINGULARI_ATTRIBUTION'])assert(conflicts.has(issue),issue);
assert(conflicts.get('SARTO_SIBLINGS_10_VS_11').sourceAClaim.includes('11 births'));
assert(conflicts.get('QUAM_SINGULARI_ATTRIBUTION').disposition.includes('HISTORICAL_CONGREGATION'));
const tailNode=data.records.find(r=>r.questionEn==="Can this 1910 decree settle my child's current eligibility?");
assert(tailNode?.researchStatus.startsWith('HOLD_'));
const waves=[wave6.records,wave7.records,wave8.records,data.records];
const all=new Set(waves.flat().map(r=>r.nodeId));
assert.equal(waves.reduce((n,x)=>n+x.length,0),228);
assert.equal(all.size,228);
assert.deepEqual([...all].sort(),[...new Set(inventory.records.map(r=>r.nodeId))].sort());
assert.equal([...owner.sourceOnlyGate.values()].reduce((n,x)=>n+x.size,0),144);
assert.equal(owner.data.counts.allNodes,423);
assert.equal(owner.data.chapters.length,106);
assert.equal(owner.data.approvals.publishing,false);
console.log('PASS SPX_WAVE9_FINAL31: 27 biography and 4 Congregation nodes triaged; 24 narrative/decree claim candidates and 7 holds; all 228 outside12 nodes uniquely accounted for, 144 source-only gate unchanged, no publication');
