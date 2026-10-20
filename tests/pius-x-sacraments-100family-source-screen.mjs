import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const x=read('data/learn/research/pius-x-sacraments-100family-200turn-source-screen-20261020.v1.json');
assert.equal(x.schema,'AO_SPX_100_FAMILY_200_TURN_SOURCE_LOCATOR_SCREEN_V1');
assert.equal(x.records.length,100);
assert.equal(x.counts.turns,200);
assert.equal(x.counts.distinctNumberedOpeningQuestions,100);
assert.equal(x.counts.withinCohortFollowupSourceReuseLinks,99);
assert.equal(x.counts.turnsMissingDeclaredQuestionSupport,0);
assert.equal(x.counts.originalSourceAnswerSemanticallyCertified,0);
assert.equal(x.counts.published,0);
const ids=new Set();
for(const r of x.records){
 assert.ok(!ids.has(r.familyId));ids.add(r.familyId);
 const q=Number(r.openingQuestionId.split('Q')[1]);
 assert.ok(q>=567&&q<=666,r.familyId);
 assert.ok(r.batch===9||r.batch===10);
 assert.equal(r.turns.length,2);
 assert.equal(r.claimLevelEvidenceCertified,false);
 assert.equal(r.denzingerEditionLinkApproved,false);
 assert.equal(r.chanoineFollowupCertified,false);
 const origin=read(r.originPath).records.find(t=>t.id===r.familyId);
 assert.ok(origin);
 for(let k=0;k<2;k++){
  const t=r.turns[k],o=origin.turns[k];
  assert.deepEqual(t.declaredSourceQuestionIds,o.supports);
  assert.deepEqual([t.questionEN,t.questionFR],[o.question.en,o.question.fr]);
  assert.deepEqual([t.englishTextApproved,t.frenchTextApproved,t.doctrineApproved],[false,false,false]);
 }
}
const reviewed=read('data/learn/research/pius-x-mass-eucharist-penance-26turn-evidence-20261020.v1.json');
for(const r of reviewed.records.filter(e=>e.draftFamilyId.startsWith('SPX-1905-S-')||e.draftFamilyId.startsWith('SPX-1905-E-'))){
 assert.ok(ids.has(r.draftFamilyId));
}
console.log('SPX 100 source-opening questions/200 drafted turns accounted for, 99 source continuation links; no certifications');
