/**
 * Structural contract for P1.40 assistant-only second-pass semantic notes.
 * Passing CI does not constitute original-language, professional translation,
 * doctrinal, papal-authorship, or publication approval.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='previews/pius-x-study/evidence/';
const p39=load(dir+'pius-x-p39-bilingual29-and-specialist36-20261024.v1.json');
const p40=load(dir+'pius-x-p40-65-answer-second-pass-20261024.v1.json');
const owner=load('data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json');
assert.equal(p40.schema,'AO_SPX_P40_SECOND_PASS_ITALIAN_TO_EN_FR_SOURCE_SCOPE_65_V1');
assert.equal(p40.status,'ASSISTANT_SECOND_PASS_NOT_INDEPENDENT_SPECIALIST_OR_PRINT_EDITION_SIGNOFF');
const {counts:c}=p40;
assert.deepEqual([
c.originalOpeningCohort,c.existingP37SecondPassCasesUnchanged,c.olderP35HoldsUnchanged,
c.p39ProposalsReviewed,c.p39ProposalsKeptProvisionally,c.p39ProposalsNeedingRefinement,
c.previouslyAlignedCasesRescreened,c.additionalConcernsIdentified,c.alignedWithoutNewConcerns,
c.totalEditorialCorrectionCasesInCurrent65,c.independentHumanSignoffs,c.certifiedWholeTranslations,
c.productionDialogueChanges,c.published],[100,11,24,29,26,3,36,10,26,39,0,0,0,0]);
const old=new Map(p39.corrections.map(x=>[x.sourceQid,x]));
const aligned=new Map(p39.firstPassAlignedSpecialistQueue.map(x=>[x.sourceQid,x]));
const owned=new Map(owner.records.map(x=>[x.id,x]));
assert.equal(owned.size,100);
assert.equal(p40.p39SecondPass29.length,29);
assert.equal(p40.newlyFlaggedFromPreviouslyAligned36.length,10);
assert.equal(p40.alignedStillAwaitingSpecialistReview26.length,26);
const seen=new Set();
let refined=0;
for(const r of p40.p39SecondPass29){
 const prev=old.get(r.sourceQid);
 assert(prev&&!seen.has(r.sourceQid));
 seen.add(r.sourceQid);
 assert.equal(prev.proposedEN,r.originalP39CandidateEN);
 assert.equal(prev.proposedFR,r.originalP39CandidateFR);
 assert(r.finalResearchCandidateEN?.length>25&&r.finalResearchCandidateFR?.length>25);
 if(r.secondPassDisposition==='REFINEMENT_REQUIRED'){
  refined++;
  assert.notEqual(r.finalResearchCandidateEN,r.originalP39CandidateEN);
  assert.notEqual(r.finalResearchCandidateFR,r.originalP39CandidateFR);
 }else assert.equal(r.secondPassDisposition,'NO_NEW_MATERIAL_DISCREPANCY_IDENTIFIED_ON_SECOND_PASS');
 for(const key of ['candidateHasNotBeenApplied','secondPassIsAssistantOnly'])assert.equal(r[key],true);
 for(const key of ['printWitnessCompared','professionalTranslatorApproved','theologicalReviewerApproved','publicationApproved'])assert.equal(r[key],false);
}
assert.equal(refined,3);
for(const r of p40.newlyFlaggedFromPreviouslyAligned36){
 const prev=aligned.get(r.sourceQid),o=owned.get(r.sourceQid);
 assert(prev&&o&&!seen.has(r.sourceQid));seen.add(r.sourceQid);
 assert.equal(r.sourceOwnerPath,o.sourceOwnerPath);
 assert.equal(r.originalDraftEN,o.originalDraftEN);
 assert.equal(r.originalDraftFR,o.originalDraftFR);
 assert(r.finalResearchCandidateEN?.length>25&&r.finalResearchCandidateFR?.length>25);
 assert.equal(r.assistantDraftOnly,true);
 assert.equal(r.approved,false);
 assert.equal(r.published,false);
}
for(const r of p40.alignedStillAwaitingSpecialistReview26){
 const prev=aligned.get(r.sourceQid);
 assert(prev&&!seen.has(r.sourceQid));seen.add(r.sourceQid);
 assert.equal(r.secondPassDisposition,'NO_NEW_MATERIAL_DISCREPANCY_IDENTIFIED_ON_SECOND_PASS');
 for(const key of ['sourceTranslationApproved','professionalTranslationApproved','humanTheologicalApproved','publicationApproved'])assert.equal(r[key],false);
}
assert.equal(seen.size,65);
assert.deepEqual(p40.prior24P35HoldsStillSeparate,p39.prior24P35HoldsPreservedByReference);
assert.deepEqual(p40.prior11P37SecondPassStillSeparate,p39.previous11P37CasesExcluded);
const finalSet=new Set([...seen,...p40.prior24P35HoldsStillSeparate.map(x=>x.sourceQid),...p40.prior11P37SecondPassStillSeparate]);
assert.equal(finalSet.size,100);
assert(Object.entries(p40.releaseGates).filter(([k])=>!['originalOwnerUnchanged','all423P6NodesUnchanged','notMerged'].includes(k)).every(([,v])=>v===false));
assert.equal(p40.p39SecondPass29.find(x=>x.sourceQid==='PX1905-Q625').finalResearchCandidateEN.includes('material food'),true);
assert(p40.p39SecondPass29.find(x=>x.sourceQid==='PX1905-Q613').finalResearchCandidateEN.includes('where His Blood is'));
assert(p40.newlyFlaggedFromPreviouslyAligned36.find(x=>x.sourceQid==='PX1905-Q638').finalResearchCandidateEN.includes('contrition'));
assert(p40.newlyFlaggedFromPreviouslyAligned36.find(x=>x.sourceQid==='PX1905-Q659').finalResearchCandidateEN.includes('purgatory'));
assert(p40.newlyFlaggedFromPreviouslyAligned36.find(x=>x.sourceQid==='PX1905-Q657').requiresSpecialistTheologicalReview);
console.log('PASS P40_RESEARCH_STRUCTURE_ONLY '+JSON.stringify({reviewed:65,existingCorrections:29,additionalFlags:10,refined:3,stillAligned:26,priorHolds:24,priorSecondPass:11,approved:0,liveDialogueMutations:0}));
