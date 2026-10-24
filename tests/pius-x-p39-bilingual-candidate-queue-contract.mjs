/**
 * P1.39 deterministic contract only. This does NOT verify the accuracy of
 * Italian-English-French translation, theology, historical scope or papal voice.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const dir='previews/pius-x-study/evidence/';
const p39=load(dir+'pius-x-p39-bilingual29-and-specialist36-20261024.v1.json');
const p38=load(dir+'pius-x-p38-sixtyfive-new-italian-source-assessments-20261024.v1.json');
const p35=load(dir+'pius-x-p35-35-high-priority-editorial-findings-20261024.v1.json');
const p37=load(dir+'pius-x-p37-eleven-second-pass-translation-review-20261024.v1.json');
const original=load('data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json');
assert.equal(p39.schema,'AO_SPX_P39_29_BILINGUAL_CANDIDATE_CORRECTIONS_AND_36_SPECIALIST_QUEUE_V1');
assert.deepEqual([p39.corrections.length,p39.firstPassAlignedSpecialistQueue.length,
p39.prior24P35HoldsPreservedByReference.length,p39.previous11P37CasesExcluded.length],[29,36,24,11]);
assert.equal(p39.counts.openingCohort,100);
assert.equal(p39.counts.independentlyApproved,0);
assert.equal(p39.counts.sourceOwnerRecordsModified,0);
assert.equal(p39.counts.originalAvatarDialogueNodesModified,0);
assert.equal(p39.counts.published,0);
assert(Object.values(p39.approval).every(v=>v===false));
const owner=new Map(original.records.map(r=>[r.id,r]));
assert.equal(owner.size,100);
const assessed=new Map(p38.assessments.map(r=>[r.sourceQid,r]));
const from35=new Set(p35.findings.map(r=>r.sourceQid));
const from37=new Set(p37.records.map(r=>r.sourceQid));
assert.equal(assessed.size,65);
assert.equal(from35.size,35);
assert.equal(from37.size,11);
const groupIds=new Set();
for(const row of p39.corrections){
 const id=row.sourceQid,a=assessed.get(id),o=owner.get(id);
 assert(o&&a&&a.classification!=='SOURCE_CORE_PLAUSIBLE'&&!groupIds.has(id));
 assert(!from35.has(id)&&!from37.has(id));
 groupIds.add(id);
 assert.equal(row.originalDraftEN,o.originalDraftEN);
 assert.equal(row.originalDraftFR,o.originalDraftFR);
 assert.equal(row.sourceOwnerPath,o.sourceOwnerPath);
 assert.equal(row.originalDigitalWitness,o.originalDigitalWitness);
 assert.deepEqual(row.sourceQuestionIds,o.supportedSourceQuestionIds);
 assert.equal(row.sourceReviewFinding,a.sourceToDraftFinding);
 assert.equal(row.sourceReviewClass,a.classification);
 assert(row.proposedEN.trim().length>15&&row.proposedFR.trim().length>15);
 assert(row.changesEN&&row.changesFR);
 assert.equal(row.isPapalAutographQuote,false);
 assert.equal(row.candidateStatus,'ASSISTANT_PROPOSED_SOURCE_LIMITED_PARAPHRASE_UNAPPROVED');
 for(const k of ['printFacsimileCollated','translationCertified','doctrinalApproved','humanReviewerSigned','publicationApproved'])assert.equal(row[k],false);
}
for(const row of p39.firstPassAlignedSpecialistQueue){
 const id=row.sourceQid,a=assessed.get(id),o=owner.get(id);
 assert(o&&a&&a.classification==='SOURCE_CORE_PLAUSIBLE'&&!groupIds.has(id));
 assert(!from35.has(id)&&!from37.has(id));
 groupIds.add(id);
 assert.equal(row.sourceReviewFinding,a.sourceToDraftFinding);
 assert.equal(row.sourceOwnerPath,o.sourceOwnerPath);
 assert.equal(row.queueStatus,'READY_FOR_SPECIALIST_REVIEW_NOT_APPROVED');
 for(const k of ['sourceSemanticsCertified','translationCertified','doctrinalApproved','humanReviewerSigned','publicationApproved'])assert.equal(row[k],false);
}
for(const row of p39.prior24P35HoldsPreservedByReference){
 assert(from35.has(row.sourceQid)&&!from37.has(row.sourceQid)&&!groupIds.has(row.sourceQid));
 groupIds.add(row.sourceQid);
 assert.equal(row.status,'P35_EXISTING_HOLD_UNCHANGED');
}
for(const id of p39.previous11P37CasesExcluded){
 assert(from35.has(id)&&from37.has(id)&&!groupIds.has(id));
 groupIds.add(id);
}
assert.equal(groupIds.size,100);
const get=n=>p39.corrections.find(r=>r.sourceQid==='PX1905-Q'+n);
assert.match(get('568').proposedEN,/obliged always/);
assert.match(get('568').proposedFR,/tenu de professer toujours/);
assert.match(get('606').proposedEN,/renewal/);
assert.match(get('606').proposedFR,/renouvellement/);
assert.match(get('625').proposedEN,/which is grace/);
assert.doesNotMatch(get('625').proposedEN,/sanctifying grace/);
assert.match(get('626').proposedEN,/concupiscence/);
assert.match(get('637').proposedEN,/clothing/);
assert.match(get('664').proposedEN,/united to the priest/);
assert.equal(p39.sourceHeadingBoundaryPolicy.casesAlreadyIdentifiedInP38,8);
for(const id of p39.sourceHeadingBoundaryPolicy.withinThisCorrectionCohort)assert(get(id.slice(-3)).digitalHeadingBoundaryCheckRequired);
console.log('PASS P39_STRUCTURE_ONLY '+JSON.stringify({corrections:29,specialist:36,priorHolds:24,priorSecondPass:11,sourceOwnerMutations:0,humanApprovals:0}));
