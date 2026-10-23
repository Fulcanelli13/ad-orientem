import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';

const dir='previews/pius-x-study/evidence/';
const wave=JSON.parse(readFileSync(dir+'pius-x-salzano-wave7-transcription-research-120-20261024.v1.json','utf8'));
const inventory=JSON.parse(readFileSync(dir+'pius-x-outside12-wave5-bulk-inventory-228-20261024.v1.json','utf8'));
const owner=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
const source='https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-di-don-giuseppe-sarto-arciprete-di-salzano/';
assert.equal(wave.schema,'AO_SPX_P2_SALZANO_WAVE7_120_NODE_TRANSCRIPTION_CLAIM_TRIAGE_V1');
assert.equal(wave.status,'PRIVATE_MUSEUM_EDITORIAL_TRANSCRIPTION_RESEARCH_NOT_ORIGINAL_MANUSCRIPT_CERTIFICATION');
assert.equal(wave.summary.previousUnresearchedSalzanoNodes,120);
assert.equal(wave.summary.sourceOwnerSubjects,24);
assert.equal(wave.summary.sourceLocusGroups,24);
assert.equal(wave.summary.contextLevelResearchCandidates,87);
assert.equal(wave.summary.explicitScopeHolds,33);
assert.equal(wave.summary.otherOutsideTwelveNodesPreviouslyReviewed,18);
assert.equal(wave.summary.otherOutsideTwelveNodesPendingSourceReview,90);
for(const k of ['additionalOriginalManuscriptVerbatimExcerptAnchors','newModelSourceGateAdmissions','completeAnswersCertified','approvedTranslations','publicationApprovals'])
 assert.equal(wave.summary[k],0,k);
assert.equal(wave.records.length,120);
assert.equal(wave.sourceLoci.length,24);
assert.equal(wave.source.url,source);
assert.equal(wave.source.manuscriptQuestionNumbersAddedByTranscriber,true);
assert.equal(wave.source.authorHandCorrectionsReported,252);
assert.equal(wave.source.authorHandCorrectionsPersonallyCollated,false);
assert.equal(wave.source.originalManuscriptFolioImagesIndependentlyCertified,false);
assert(wave.importantEditorialTextWarnings.some(w=>w.kind==='ERRONEOUS_TRANSCRIPTION_Q_NUMBER'));
assert(wave.importantEditorialTextWarnings.some(w=>w.kind==='EDITORIAL_INTERPOLATION'));
const loci=new Map(wave.sourceLoci.map(a=>[a.chapterId,a]));
assert.equal(loci.size,24);
const incoming=new Map(inventory.records.filter(x=>x.sourceFamily==='SALZANO_MANUSCRIPT').map(r=>[r.nodeId,r]));
assert.equal(incoming.size,120);
const seen=new Set();
for(const r of wave.records){
 assert(!seen.has(r.nodeId),'duplicate source-owner dialogue: '+r.nodeId);seen.add(r.nodeId);
 const old=incoming.get(r.nodeId),loc=loci.get(r.chapterId),chapter=owner.chapters.get(r.chapterId);
 assert(old&&loc&&chapter,'Unknown Salzano source-owner '+r.nodeId);
 const node=chapter.nodes.find(n=>n.id===r.nodeId);
 assert(node,'Unknown actual P6 bilingual node '+r.nodeId);
 assert.equal(r.questionEn,node.q.en);
 assert.equal(r.questionFr,node.q.fr);
 assert.equal(r.questionEn,old.questionEn);
 assert.equal(r.questionFr,old.questionFr);
 assert.equal(r.sourceOwnerFile,old.sourceOwnerFile);
 assert.equal(r.nodeOwnerFile,old.nodeOwnerFile);
 assert.equal(r.canonicalQuestionLocus,old.sourceLocus);
 assert.equal(r.manuscriptEditorialNumberingRange,loc.museumEditorialQuestionRange);
 assert.deepEqual(r.museumPageLineRange,[loc.museumWebLineStart,loc.museumWebLineEnd]);
 assert.equal(r.sourceUrl,source);
 assert.equal(r.claimScope,loc.attestedTopicParaphrase);
 assert.equal(r.originalWordsReproduced,false);
 assert.equal(r.independentManuscriptImageCollated,false);
 assert.equal(r.translationApproved,false);
 assert.equal(r.completeAnswerApproved,false);
 assert.equal(r.modelGateEligible,false);
 assert.equal(r.publishingApproved,false);
 assert(!owner.sourceOnlyGate.get(r.chapterId)?.has(r.nodeId),'Research-only Salzano node crossed papal text gate');
 assert(!('answer' in r)&&!('answerEn' in r)&&!('answerFr' in r),'No duplicate answers');
 if(r.researchStatus==='HOLD_SOURCE_DOES_NOT_SETTLE_QUESTION'){
  assert(r.holdReason?.length>45);
 }else{
  assert.equal(r.researchStatus,'MUSEUM_TRANSCRIPTION_NUMBERED_QA_CONTEXT_CANDIDATE_NEEDS_CLAIM_LEVEL_FIDELITY_REVIEW');
  assert.equal(r.holdReason,null);
 }
}
for(const l of wave.sourceLoci){
 assert.equal(l.sourceUrl,source);
 assert(l.museumWebLineStart>=3&&l.museumWebLineStart<l.museumWebLineEnd&&l.museumWebLineEnd<=2458);
 assert.equal(l.numberingAddedByModernEditor,true);
 assert.equal(l.originalManuscriptQuestionNumbers,false);
 assert.equal(l.manuscriptFolioImageIndependentlyCollated,false);
 assert.equal(l.claimedOriginalVerbatimSnippet,null);
 assert(l.attestedTopicParaphrase.length>45);
}
assert.equal(seen.size,120);
assert.equal(new Set(wave.records.map(r=>r.chapterId)).size,24);
assert.equal(wave.records.filter(r=>r.researchStatus==='HOLD_SOURCE_DOES_NOT_SETTLE_QUESTION').length,33);
assert.equal(wave.records.filter(r=>r.researchStatus.startsWith('MUSEUM_TRANSCRIPTION_')).length,87);
assert.equal([...owner.sourceOnlyGate.values()].reduce((n,g)=>n+g.size,0),144);
assert.equal(owner.data.chapters.length,106);
assert.equal(owner.data.counts.allNodes,423);
assert.equal(owner.data.approvals.publishing,false);
const personalHold=wave.records.find(x=>x.questionEn==='Can an avatar tell me that my personal confession was valid?');
assert(personalHold&&personalHold.researchStatus==='HOLD_SOURCE_DOES_NOT_SETTLE_QUESTION');
console.log('PASS SPX_SALZANO_WAVE7: 120 original source-owner nodes, 24 transcribed Italian question loci, 87 contextual candidates and 33 holds; no manuscript-text certification, model gate promotion or publication approval');
