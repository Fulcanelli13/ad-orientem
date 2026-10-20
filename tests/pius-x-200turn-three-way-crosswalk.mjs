import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base='data/learn/research/';
const read=x=>JSON.parse(readFileSync(base+x,'utf8'));
const v=read('pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json');
const draft=read('pius-x-sacraments-100family-200turn-source-screen-20261020.v1.json');
const candidates=read('pius-x-source-bounded-bilingual-corrections-20261020.v1.json');
const review=[
 read('pius-x-31family-62turn-italian-review-20261020.v1.json'),
 read('pius-x-23more-46turn-italian-review-20261020.v1.json'),
 read('pius-x-46final-92turn-italian-review-20261020.v1.json')
];
const oldDz={
 'MG-P012':878,'MG-P013':884,'MG-P014':885,'MG-P015':888,
 'MG-P005':940,'MG-P046':941,'MG-P018':948,'MG-P019':950
};
const knownPassages=new Set([
 'MG-P011','MG-P012','MG-P013','MG-P014','MG-P015',
 'MG-P005','MG-P008','MG-P018','MG-P019','MG-P046'
]);
assert.equal(v.schema,'AO_SPX_200TURN_THREE_WAY_CLAIM_LINK_AUDIT_V1');
assert.equal(v.answerEvidence.length,200);
assert.equal(v.count.draftAnswerTurns,200);
assert.equal(v.count.families,100);
assert.equal(v.count.publishedAnswers,0);
assert.equal(v.count.fullOriginalPrintCertifications,0);
assert.equal(v.count.modernDHNumberCertifications,0);
assert.equal(v.count.approvedCanonSpecificAnswers,0);
assert.equal(v.count.approvedEnglishFrenchReplies,0);
assert.equal(new Set(v.answerEvidence.map(x=>x.answerTurnId)).size,200);
const originalIndex=new Map(draft.records.flatMap(f=>f.turns.map((t,i)=>[f.familyId+'-T'+(i+1),{f,t,i}])));
const patchIndex=new Map(candidates.records.map(x=>[x.turnId,x]));
let sourceChanged=new Map();
for(const batch of review)for(const family of batch.records){
 const id=family.draftFamilyId||family.familyId;
 for(let i=0;i<2;i++){
  const key=id+'-T'+(i+1),t=family.turns[i];
  const original=originalIndex.get(key);
  assert.ok(original,'Unknown reviewed draft '+key);
  const claimed=t.inspectedSupportQIDs||t.screenedSourceQuestionIds;
  if(claimed.join()!=original.t.declaredSourceQuestionIds.join()){
   assert.ok(!sourceChanged.has(key),'Duplicate cross-reference repair '+key);
   sourceChanged.set(key,claimed);
  }
 }
}
assert.equal(sourceChanged.size,9);
let withDenz=0,mag=0,canon=0,variants=0;
for(const x of v.answerEvidence){
 const orig=originalIndex.get(x.answerTurnId);
 assert.ok(orig,'No source owner '+x.answerTurnId);
 assert.equal(x.familyId,orig.f.familyId);
 assert.equal(x.turnIndex,orig.i+1);
 assert.equal(x.questionEN,orig.t.questionEN);
 assert.equal(x.questionFR,orig.t.questionFR);
 assert.equal(x.originalAnswerOwner.path,orig.f.originPath);
 assert.equal(x.originalSource.sourceWitnessUrl,orig.f.witnessUrl);
 assert.equal(x.originalSource.original1905FacsimileCollated,false);
 assert.equal(x.originalSource.claimByClaimApproved,false);
 assert.equal(x.originalSource.sourceClass,'1905_PAPALLY_PRESCRIBED_CATECHISM_NOT_PERSONAL_AUTOGRAPH');
 const expected=sourceChanged.get(x.answerTurnId)||orig.t.declaredSourceQuestionIds;
 assert.deepEqual(x.originalSource.originalQuestionIds,expected);
 assert.equal(x.originalSource.sourceRefExtensionStatus,
  sourceChanged.has(x.answerTurnId)?'EVIDENCE_SCOPE_CORRECTION_PENDING_INDEPENDENT_CERTIFICATION':'DRAFT_SOURCE_ID_INITIAL_SCOPE_SCREEN_ONLY');
 assert.equal(x.bilingualRevision.availableAsUnapprovedOverlay,patchIndex.has(x.answerTurnId));
 assert.equal(x.bilingualRevision.releaseEligible,false);
 if(patchIndex.has(x.answerTurnId)){
  variants++;
  const p=patchIndex.get(x.answerTurnId);
  assert.equal(p.sourceOwnerPath,orig.f.originPath);
  assert.deepEqual(p.sourceQuestionIds,x.originalSource.originalQuestionIds);
  assert.equal(p.revisionStatus,'SOURCE_BOUNDED_EDITORIAL_CORRECTION_NOT_APPROVED_HISTORICAL_VOICE');
  assert.equal(p.published,false);
  assert.equal(p.theologyApproved,false);
  assert.ok(p.revisionCandidate.en&&p.revisionCandidate.fr);
 }
 assert.equal(x.chanoine.offerColleagueSwitch,true);
 assert.equal(x.chanoine.requiresVisitorConsent,true);
 assert.equal(x.chanoine.approvedTopicSpecificResponse,false);
 assert.equal(x.chanoine.loopPrevention,true);
 if(x.chanoine.sharedRouterTopicCandidate){
  assert.ok(['canon.apologetics_apol_031','canon.apologetics_apol_030'].includes(x.chanoine.sharedRouterTopicCandidate));
  assert.equal(x.chanoine.routerTopicStatus,'SOURCE_GAP');
  assert.ok(['apostolate:AQ04','apostolate:AQ05'].includes(x.chanoine.sourceExtractivePilotOwnerCandidate));
  canon++;
 } else assert.equal(x.chanoine.sourceExtractivePilotOwnerCandidate,null);
 if(x.magisterium.passageCandidates.length)mag++;
 if(x.magisterium.passageCandidates.some(p=>p.oldDenzinger))withDenz++;
 for(const p of x.magisterium.passageCandidates){
  assert.ok(knownPassages.has(p.passageId),'Unregistered passage '+p.passageId);
  assert.ok(p.originalDocumentLocus);
  assert.match(p.originalDocumentUrl,/^https:\/\//);
  assert.equal(p.claimToMagisteriumApproved,false);
  if(p.oldDenzinger){
   assert.equal(p.oldDenzinger.number,oldDz[p.passageId]);
   assert.equal(p.oldDenzinger.edition,'DZ11_BANNWART_1911');
   assert.equal(p.oldDenzinger.facsimileCertified,false);
   assert.equal(p.oldDenzinger.modernDHNumberCertified,false);
  }
 }
 assert.equal(x.magisterium.approval,false);
 assert.equal(x.magisterium.officialNumberFromCertifiedDenzingerEdition,null);
 assert.equal(x.citationsShownInPublishedApp,false);
 assert.equal(x.approvedAnswer,false);
}
assert.equal(variants,10);
assert.equal(v.count.sourceQuestionLocatorExtendedTurns,sourceChanged.size);
assert.equal(v.count.bilingualRevisedCandidateTurns,variants);
assert.equal(v.count.magisteriumOriginalDocumentCandidateTurns,mag);
assert.equal(v.count.named1911OldDzCandidateTurns,withDenz);
assert.equal(v.count.canonSpecificHeldTopicCandidates,canon);
assert.equal(v.count.unassessedMagisteriumApplicability,200-mag);
const check=v.answerEvidence.find(x=>x.answerTurnId==='SPX-1905-E-657-T1');
assert.deepEqual(check.magisterium.passageCandidates.map(x=>x.passageId),['MG-P008','MG-P014']);
const mid=v.answerEvidence.find(x=>x.answerTurnId==='SPX-1905-E-633-T1');
assert.deepEqual(mid.originalSource.originalQuestionIds,['PX1905-Q628','PX1905-Q633']);
assert.equal(mid.magisterium.applicabilityStatus,'UNASSESSED_NOT_NOT_APPLICABLE');
console.log('PASS SPX 200 turns: 9 source corrections, 10 EN/FR revision candidates, '+mag+' magisterium topic leads, '+withDenz+' provisional Dz records, '+canon+' unapproved Canon referral leads, 0 published');
