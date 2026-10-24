import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root='data/learn/research/';
const read=name=>JSON.parse(readFileSync(root+name,'utf8'));
const audit=read('pius-x-first40-claim-italian-witness-review-20261020.v1.json');
const triage=read('pius-x-100answer-editorial-release-triage-20261020.v1.json');
const correction=read('pius-x-source-bounded-bilingual-corrections-20261020.v1.json');
const source=new Map(triage.records.map(x=>[x.id,x]));
assert.equal(audit.schema,'AO_SPX_40_SOURCE_CLAIM_AUDIT_V1');
assert.equal(audit.counts.audited,40);
assert.equal(audit.counts.meaningAligned,28);
assert.equal(audit.counts.sourceTighteningsProposed,12);
assert.equal(audit.counts.previouslyDraftedCorrections,5);
assert.equal(audit.counts.newlyDraftedBilingualCorrections,7);
assert.equal(audit.counts.noteworthyDoctrinalWordingErrors,2);
assert.equal(audit.counts.historicOrOtherContextCautions,5);
assert.equal(audit.counts.eligibleForPublication,0);
assert.equal(audit.counts.independentlySignedOff,0);
const prior=new Map(correction.records.map(p=>[p.turnId,p]));
const ids=new Set();
let aligned=0,proposed=0,older=0,newer=0,critical=0,cautions=0;
for(const record of audit.records){
 assert.ok(!ids.has(record.editorialQuestionId));ids.add(record.editorialQuestionId);
 const q=source.get(record.editorialQuestionId);
 assert.ok(q&&q.priority==='WAVE_1_FIRST_40');
 assert.equal(record.openingTurnId,q.turnId);
 assert.equal(record.originalOpeningEN,q.originalDraftEN);
 assert.equal(record.originalOpeningFR,q.originalDraftFR);
 assert.equal(record.sourceWitness,q.originalDigitalWitness);
 assert.equal(record.sourceDigitalLineRange.inspectedDate,'2026-10-20');
 assert.ok(record.sourceDigitalLineRange.start>=300&&record.sourceDigitalLineRange.end<=600);
 assert.ok(record.sourceDigitalLineRange.start<=record.sourceDigitalLineRange.end);
 assert.ok(record.sourceSemanticAnchors.length);
 assert.equal(record.attestation.humanTheologyApproval,false);
 assert.equal(record.attestation.humanBilingualApproval,false);
 assert.equal(record.attestation.historicalVoiceApproved,false);
 assert.equal(record.attestation.published,false);
 if(record.draftAssessment==='PRELIMINARY_SOURCE_MEANING_ALIGNED'){
  aligned++;assert.equal(record.proposedEN,null);assert.equal(record.proposedFR,null);
 }else{
  assert.equal(record.draftAssessment,'SOURCE_PRECISION_TIGHTENING_PROPOSED');
  proposed++;assert.ok(record.proposedEN&&record.proposedFR);
  assert.ok(record.flaggedReason);
  if(record.changeSource==='EXISTING_UNAPPROVED_CORRECTION_PR1458'){
   older++;
   const p=prior.get(record.openingTurnId);
   assert.ok(p);
   assert.equal(record.proposedEN,p.revisionCandidate.en);
   assert.equal(record.proposedFR,p.revisionCandidate.fr);
  }else{
   assert.equal(record.changeSource,'NEW_BILINGUAL_EDITORIAL_PROPOSAL');
   assert.equal(q.correctionEN,null);assert.equal(q.correctionFR,null);newer++;
  }
 }
 if(record.significantError)critical++;
 if(record.furtherContextHolds.length)cautions++;
}
assert.equal(aligned,28);assert.equal(proposed,12);assert.equal(older,5);assert.equal(newer,7);
assert.equal(critical,2);assert.equal(cautions,5);
assert.deepEqual([...ids].sort(),triage.waves.flatMap(w=>w.questionIds).sort());
for(const q of [652,657]){
 const rec=audit.records.find(r=>r.editorialQuestionId==='PX1905-Q'+q);
 assert.equal(rec.significantError,true);
}
const q650=audit.records.find(r=>r.editorialQuestionId==='PX1905-Q650');
assert.match(q650.editorialHistoricalContextEN,/1905/);
assert.match(q650.editorialHistoricalContextFR,/1905/);
assert.equal(q650.attestation.humanTheologyApproval,false);
assert.ok(!audit.records.some(r=>r.proposedEN?.includes('change or destruction')));
assert.equal(audit.scope.denzinger,'NOT_REQUIRED');
console.log('PASS: 40 primary Italian Q&A locations, 28 initially aligned, 12 corrections (5 existing, 7 new), five context cautions; no Denzinger, 0 human approvals and 0 published');
