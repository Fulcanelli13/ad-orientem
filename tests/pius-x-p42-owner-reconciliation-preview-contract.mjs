/**
 * P1.42 structural contract; cannot certify a human review or apply patches.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const sha=s=>createHash('sha256').update(s,'utf8').digest('hex');
const root='artifacts/pius-x-study-expanded/';
const p41=read(root+'SPX_P41_39_Italian_English_French_Specialist_Dossier.json');
const p42=read(root+'SPX_P42_39_Exact_Owner_Reconciliation_Preview.json');
const ledger=read(root+'SPX_P42_39_Blank_Human_Review_Decisions.json');
const triage=read('data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json');
assert.equal(p42.schema,'AO_SPX_P42_EXACT_SOURCE_OWNER_RECONCILIATION_PREVIEW_V1');
assert.equal(p42.status,'READY_FOR_REVIEW_ONLY_ZERO_SIGNOFFS_NO_WRITES');
assert.equal(ledger.schema,'AO_SPX_P42_HUMAN_REVIEW_DECISION_TEMPLATE_V1');
assert.equal(ledger.status,'ALL_PENDING_NO_SIGNOFFS');
assert.equal(p42.records.length,39);
assert.equal(ledger.cases.length,39);
assert.equal(triage.records.length,100);
assert.equal(p41.records.length,39);
assert.equal(Object.keys(p42.files).length,10);
assert.deepEqual([p42.counts.originalOpenings,p42.counts.stagedExactOwnerTurnPairs,
p42.counts.sourceOwnerFilesCovered,p42.counts.remainingSpecialistReview,
p42.counts.previousP35Holds,p42.counts.previousP37SecondPass,p42.counts.signedOffCases,
p42.counts.sourceOwnerRecordsEdited,p42.counts.existingP6_423Changed,p42.counts.published],
[100,39,10,26,24,11,0,0,0,0]);
assert(Object.values(p42.safeguards).every(x=>x===true));
const from41=new Map(p41.records.map(x=>[x.sourceQid,x]));
const owners=new Map(triage.records.map(x=>[x.id,x]));
const files=new Map();
for(const path of Object.keys(p42.files)){
 const raw=readFileSync(path,'utf8');
 assert.equal(sha(raw),p42.files[path].unmodifiedFileSHA256);
 const j=JSON.parse(raw);
 assert.equal(j.records.length,10);
 files.set(path,new Map(j.records.map(x=>[x.source.questionId,x])));
}
const seen=new Set();
for(const r of p42.records){
 assert(!seen.has(r.sourceQid));seen.add(r.sourceQid);
 const z=from41.get(r.sourceQid),o=owners.get(r.sourceQid),f=files.get(r.ownerPath).get(r.sourceQid);
 assert(z&&o&&f);
 assert.equal(r.turnId,o.turnId);
 assert.equal(r.ownerPath,z.originalOwnerPath);
 assert.equal(r.familyId,f.id);
 assert.equal(r.turnOrdinal,0);
 assert.equal(r.turnKind,'opening');
 assert.equal(r.exactSourceQuestionId,f.source.questionId);
 assert.equal(r.expectedCurrentOpeningSHA256,sha(JSON.stringify(f.turns[0])));
 assert.equal(r.originalEN,f.turns[0].response.en);
 assert.equal(r.originalFR,f.turns[0].response.fr);
 assert.equal(r.originalEnglishSHA256,sha(r.originalEN));
 assert.equal(r.originalFrenchSHA256,sha(r.originalFR));
 assert.equal(r.proposedEnglishSHA256,sha(r.proposedEN));
 assert.equal(r.proposedFrenchSHA256,sha(r.proposedFR));
 assert.equal(r.proposedEN,z.p41RecommendedReviewCandidateEN);
 assert.equal(r.proposedFR,z.p41RecommendedReviewCandidateFR);
 assert.equal(r.originalAnswerItalian,z.italianWitnesses[0].safeItalianAnswerForDisplay);
 assert.equal(r.scope,'EXACT_OPENING_RESPONSE_FIELDS_ONLY_NO_FOLLOWUP_MODIFICATIONS');
 assert.equal(r.automatedSourceOwnerWriteAllowed,false);
 assert.equal(r.humanSignoffApproved,false);
 assert.equal(r.published,false);assert.equal(r.canMerge,false);
 assert.equal(Object.keys(r.signoffs).length,5);
 for(const signed of Object.values(r.signoffs)){
   assert.equal(signed.decision,'NOT_REVIEWED');
   assert.equal(signed.reviewerName,null);
   assert.equal(signed.originalItalianConsulted,false);
   assert.equal(signed.originalPrintEditionCollated,false);
 }
 const l=ledger.cases.find(x=>x.sourceQid===r.sourceQid);
 assert(l); assert.deepEqual(l.requiredHumanReviews,r.signoffs);
 assert.equal(l.expectedCurrentOpeningSHA256,r.expectedCurrentOpeningSHA256);
 assert.equal(l.proposedEnglishSHA256,r.proposedEnglishSHA256);
 assert.equal(l.proposedFrenchSHA256,r.proposedFrenchSHA256);
 assert.equal(l.decision,'PENDING');assert.equal(l.changeApproved,false);assert.equal(l.publicationApproved,false);
}
assert.equal(seen.size,39);
const excluded=new Set(Object.values(p42.excludedQueues).flat());
assert.equal(excluded.size,61);
assert([...excluded].every(x=>!seen.has(x)));
assert.equal(new Set([...excluded,...seen]).size,100);
assert(p42.records.find(x=>x.sourceQid==='PX1905-Q611').technicalReviewerLane==='TECHNICAL_SACRAMENTAL_THEOLOGY');
assert(p42.records.find(x=>x.sourceQid==='PX1905-Q657').technicalReviewerLane==='TECHNICAL_SACRAMENTAL_THEOLOGY');
console.log('PASS P42_EXACT_OWNER_RECONCILIATION_PREVIEW '+JSON.stringify({ownerFiles:10,candidateTurns:39,reviewersSigned:0,recordsEdited:0,dialoguesEdited:0,publication:0}));
