import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus,selectEvidence} from '../tools/pius-x-generative-review.mjs';

const dir='previews/pius-x-study/evidence/';
const review=JSON.parse(readFileSync(dir+'pius-x-p23-bilingual-claim-fidelity-audit-20261024.v1.json','utf8'));
const sample=JSON.parse(readFileSync(dir+'pius-x-p22-bilingual-claim-acceptance-pilot-20261024.v1.json','utf8'));
const store=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
assert.equal(review.schema,'AO_SPX_P23_BILINGUAL_CLAIM_SOURCE_FIDELITY_AUDIT_V1');
assert.equal(review.status,'MODEL_EDITORIAL_SOURCE_COMPARISON_ONLY_NOT_INDEPENDENT_HUMAN_SIGNOFF');
assert.equal(review.summary.chapters,4);
assert.equal(review.summary.nodesReviewed,11);
assert.equal(review.summary.englishSpecimensReviewed,11);
assert.equal(review.summary.frenchSpecimensReviewed,11);
assert.equal(review.summary.sentenceLevelClaimUnits,23);
assert.equal(review.summary.sourceWitnessesMatchedToOfficialVaticanContext,18);
assert.equal(review.summary.pairedSpecimensRevisedAfterContextReview,5);
assert.equal(review.summary.remainingEnglishFrenchClaimsRequiringHumanReview,23);
for(const k of ['certifiedEnglishTranslations','certifiedFrenchTranslations','historicVoiceApprovals','publishingApprovals','newModelGateAdmissions','liveInferenceProviderCalls'])
 assert.equal(review.summary[k],0,k);
assert.equal(review.manualReviewRequired,true);
assert.equal(review.claimUnits.length,23);
assert.equal(review.witnesses.length,18);
assert.equal(review.sourceTextContexts.length,4);
assert.equal(sample.cases.length,11);
const all=new Map(review.witnesses.map(w=>[w.id,w]));
assert.equal(all.size,18);
const allowed=new Map(sample.cases.map(c=>[c.nodeId,c]));
assert.equal(allowed.size,11);
const claimed=new Map(),seen=new Set();
const sentenceSplit=text=>text.trim().split(/(?<=[.!?])\s+/u).filter(Boolean);
const correct=[['SPX-PILOT-01','la',3],['SPX-PILOT-09','la',3],['SPX-029','it',3],['SPX-NEW-012','la',2]];
for(const [chapter,lang,count] of correct){
 const cs=sample.cases.filter(c=>c.chapterId===chapter);
 assert.equal(cs.length,count);
 assert(cs.every(c=>c.sourceLanguage===lang));
}
for(const w of review.witnesses){
 assert(w.originalText.length>=10); // Latin 'ductu vestro' is a valid short direct witness
 assert(w.document.length>3);
 assert(['la','it'].includes(w.originalLanguage));
 assert.equal(w.speaker,'PIUS_X_AUTHOR');
 assert.equal(w.archivalAutographCertified,false);
 assert.equal(w.fullDocumentTranslationCertified,false);
 const [start,end]=w.officialVaticanPageLines;
 assert(Number.isInteger(start)&&Number.isInteger(end)&&start>0&&end>=start);
}
for(const unit of review.claimUnits){
 assert(!seen.has(unit.id),'Duplicate claim unit '+unit.id);seen.add(unit.id);
 const c=allowed.get(unit.nodeId);
 assert(c&&c.chapterId===unit.chapterId,'Unknown P6 response '+unit.nodeId);
 const chapter=store.chapters.get(c.chapterId),node=chapter?.nodes.find(n=>n.id===c.nodeId);
 assert(chapter&&node);
 assert.deepEqual(c.question,node.q);
 assert(!node.partial);
 assert.equal(unit.originalSpeechVerbatim,false);
 assert.equal(unit.qualifiedHumanReviewed,false);
 assert.equal(unit.bilingualTranslationCertified,false);
 assert.equal(unit.publishingApproved,false);
 assert.equal(unit.claimSupportAssessment,'SUPPORTED_OR_NARROWLY_PARAPHRASED_BY_REVIEWED_PRIMARY_TEXT_NOT_HUMAN_CERTIFIED');
 assert.equal(unit.frenchMeaningParity,'EDITORIAL_PARITY_CHECK_PROVISIONAL');
 // A concise affirmation is valid only for the explicitly audited
 // charity-opening node; it must be followed by sourced explanatory sentences.
 const briefAffirmation=unit.nodeId==='SPX.DIALOGUE.SPX-029.OPEN'&&unit.ordinal===1&&
   unit.englishClaim==='Yes.'&&unit.frenchClaim==='Oui.'&&
   unit.witnessIds.includes('IF-TRUTH')&&unit.witnessIds.includes('IF-MERCY');
 assert(briefAffirmation||
   (unit.englishClaim.length>=5&&unit.frenchClaim.length>=5));
 const en=sentenceSplit(c.replySpecimen.en),fr=sentenceSplit(c.replySpecimen.fr);
 assert.equal(en.length,fr.length);
 assert.equal(unit.englishClaim,en[unit.ordinal-1],'Audited English changed without reevaluation');
 assert.equal(unit.frenchClaim,fr[unit.ordinal-1],'Audited French changed without reevaluation');
 assert(Array.isArray(unit.witnessIds)&&unit.witnessIds.length>0);
 assert.equal(unit.witnessIds.length,unit.officialVaticanLineRanges.length);
 for(const [i,id] of unit.witnessIds.entries()){
  const w=all.get(id),source=unit.officialVaticanLineRanges[i];
  assert(w,'Unknown original-language witness ID '+id);
  assert(c.evidenceIds.includes(id),'Audit cites a fragment not licensed to source-owner '+unit.nodeId);
  assert.deepEqual([source.start,source.end],w.officialVaticanPageLines);
  assert.equal(source.witnessId,id);
 }
 for(const language of ['en','fr']){
  const selected=selectEvidence(store,{chapterId:unit.chapterId,nodeId:unit.nodeId,question:c.question[language],language});
  assert.equal(selected.status,'eligible',unit.nodeId+'/'+language+' '+selected.reason);
  const witnesses=new Set(selected.evidence.flatMap(e=>e.originalLanguageWitnesses.map(w=>w.id)));
  assert(unit.witnessIds.every(id=>witnesses.has(id)),'Claim cites off-node witness '+unit.id);
 }
 if(!claimed.has(unit.nodeId))claimed.set(unit.nodeId,[]);
 claimed.get(unit.nodeId).push(unit);
}
assert.equal(claimed.size,11);
for(const c of sample.cases){
 assert(c.replySpecimen.en.length>80);
 assert(c.replySpecimen.fr.length>80);
 assert.equal(claimed.get(c.nodeId).length,sentenceSplit(c.replySpecimen.en).length);
 assert.equal(c.publishingApproved,false);
}
const exceptions=new Set(['AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_1','AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_2',
 'AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_1','AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_2','SPX.DIALOGUE.SPX-029.F2']);
assert.deepEqual(new Set(sample.cases.filter(c=>c.contentRevisionReason).map(c=>c.nodeId)),exceptions);
assert(!allowed.get('AO.SPX.DIALOGUE.SPX_PILOT_01.FOLLOW_1').replySpecimen.en.includes('in the times'));
assert(!allowed.get('AO.SPX.DIALOGUE.SPX_PILOT_09.FOLLOW_1').replySpecimen.en.includes('speak with God'));
assert(!allowed.get('SPX.DIALOGUE.SPX-029.F2').replySpecimen.en.includes('Instruction, example'));
const heading=review.sourceTextContexts.find(x=>x.document==='Haerent animo');
assert(heading.contextLines.some(x=>x[0]<=33&&x[1]>=36),'Priestly audience requires contextual heading');
const christ=review.sourceTextContexts.find(x=>x.document==='E supremi');
assert(christ.contextLines.some(x=>x[0]<=65&&x[1]>=69),'Christ-to-God source is section eight');
assert.equal([...store.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.data.approvals.publishing,false);
console.log('PASS SPX_P23_CLAIM_FIDELITY: 23 bilingual claim sentences / 11 canonical nodes / 18 source fragments, human signoff and publication remain blocked');
