import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(p,'utf8'));
const path='data/learn/research/pius-x-mass-eucharist-penance-26turn-evidence-20261020.v1.json';
const a=read(path);
assert.equal(a.schema,'AO_SPX_FIRST_26_TURN_EVIDENCE_REVIEW_V1');
assert.equal(a.records.length,13);
assert.equal(a.counts.familiesReviewedAgainstDigitalItalian,13);
assert.equal(a.counts.turnsInspected,26);
assert.equal(a.counts.turnsIndependentlyCertified,0);
assert.equal(a.counts.denzingerModernConcordanceCertified,0);
assert.equal(a.counts.oldDzFacsimileCertified,0);
assert.equal(a.counts.productionApproved,0);
assert.equal(new Set(a.records.map(r=>r.draftFamilyId)).size,13);
for(const r of a.records){
 assert.equal(r.turns.length,2);
 assert.ok(r.sourceWitness.witnessUrl.startsWith('https://'));
 assert.equal(r.sourceWitness.original1905PrintedFacsimileCollated,false);
 assert.equal(r.sourceWitness.authorshipClass,'PAPALLY_PRESCRIBED_CATECHISM_NOT_PERSONAL_PIUS_X_AUTHORSHIP');
 assert.equal(r.independentSemanticMergeApproved,false);
 assert.equal(r.approval.publication,false);
 assert.ok(r.editorialWarnings.length);
 for(const m of r.denzingerCandidateWitnesses){
  assert.equal(m.edition,'DZ11_BANNWART_1911');
  assert.match(m.originalDocumentUrl,/^https:\/\//);
  assert.equal(m.denzingerStatus,'NUMBER_AND_UNIT_FOUND_IN_NAMED_1911_OCR_BUT_PAGE_FACSIMILE_NOT_COLLATED');
  assert.equal(m.relationReview,'DOC_UNIT_TOPIC_APPROPRIATENESS_SCREENED_NOT_CLAIM_APPROVED');
 }
 const origin=read(r.originalDraftPath);
 const original=(origin.records||origin.items||origin.entries).find(x=>x.id===r.draftFamilyId);
 assert.ok(original,r.draftFamilyId);
 const originalTurns=original.turns||[original.opening,original.followup];
 for(let i=0;i<2;i++){
  const t=r.turns[i],o=originalTurns[i];
  assert.equal(t.turnIndex,i+1);
  assert.deepEqual([t.questionEN,t.questionFR],[o.question?.en,o.question?.fr]);
  assert.deepEqual([t.responseEN,t.responseFR],[o.response?.en,o.response?.fr]);
  assert.ok(t.sourceSupportQuestionIds.length);
  assert.ok(t.sourceSupportQuestionIds.every(s=>/^PX1905-Q[0-9]{1,3}$/.test(s)));
  assert.equal(t.supportAssessment,'DIGITAL_ITALIAN_TEXT_MEANING_SCREENED_NOT_INDEPENDENTLY_CERTIFIED');
  assert.equal(t.allStatementsIndependentlyCertified,false);
  assert.equal(t.chanoine.visitorConsentRequired,true);
  assert.equal(t.chanoine.exactReplyCertified,false);
  assert.equal(t.englishCheckedByIndependentReviewer,false);
  assert.equal(t.frenchCheckedByIndependentReviewer,false);
 }
}
const q607=a.records.find(x=>x.draftFamilyId==='SPX-1905-S-607');
assert.deepEqual(q607.turns[0].sourceSupportQuestionIds,['PX1905-Q596','PX1905-Q607','PX1905-Q609','PX1905-Q610']);
assert.deepEqual(q607.turns[1].sourceSupportQuestionIds,['PX1905-Q608']);
const q55=a.records.find(x=>x.draftFamilyId==='SPX-055');
assert.ok(q55.turns[0].sourceSupportQuestionIds.includes('PX1905-Q199'));
console.log('SPX original-source turn audit PASS: 13 families, 26 bilingual draft turns, zero publication certifications');
