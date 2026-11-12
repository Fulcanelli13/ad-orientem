import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const json = name => JSON.parse(readFileSync(new URL('./' + name, import.meta.url), 'utf8'));
const original = json('ORIGINAL_QUESTION_BANK_EVIDENCE.v1.json');
const current = json('questions.json');
const p0 = json('CANON_CONVERSATION_CROSSWALK_P0_20261018.v1.json');
const p1 = json('CANON_HISTORICAL_452_TOPIC_CONCORDANCE_P1_20261018.v1.json');
const audit = json('CANON_PROTESTANT25_SOURCE_ANSWER_AUDIT_P2_20261018.v1.json');
const names = json('CANON_DENOMINATIONAL_OPPONENT_SCOPE_SCREEN_P3_20261018.v1.json');
const overlap = json('CANON_HISTORICAL_CURRENT_TITLE_OVERLAP_20261018.v1.json');
const sourcePointers = json('CANON_TWO_NAMESPACE_SOURCE_POINTERS_20261018.v1.json');
const originals = original.numbered_question_excerpts;
assert.equal(originals.length, 452);
assert.equal(current.questions.length, 282);
assert.equal(p0.questions.length, 452);
assert.equal(p1.questions.length, 452);
assert.equal(new Set(p1.questions.map(q => q.historicalId)).size, 452);
const lookup = new Map(originals.map(x => [x.id, x]));
const allowed = new Set(current.questions
  .filter(q => ['Canonical Apologetics', 'Canonical Church Crisis'].includes(q.collection))
  .map(q => q.id));
assert.equal(allowed.size, 141);
for (const q of p1.questions) {
  const src = lookup.get(q.historicalId);
  assert.ok(src, 'unexpected historical ID ' + q.historicalId);
  assert.equal(q.question, src.question, 'changed original source wording ' + q.historicalId);
  assert.equal(q.bank, src.bank, 'changed original bank ' + q.historicalId);
  assert.equal(q.verbatimOriginalChatVerified, false);
  assert.equal(q.answerTextVerifiedForExactQuestion, false);
  assert.equal(q.canPublishCanonAnswer, false);
  assert.equal(q.conversationPresenter, 'MONSIEUR_LE_CHANOINE');
  for (const id of q.canonicalTopicCandidates) assert.ok(allowed.has(id), 'unknown owner ' + id);
  assert.equal(q.topicMappingStatus,
    q.canonicalTopicCandidates.length + q.otherOwnedModuleCandidates.length
      ? 'EDITORIAL_TOPIC_REFERRAL_CANDIDATE_ONLY'
      : 'NO_SUITABLE_CURRENT_OWNER_SELECTED');
}
const referrals = p1.questions.filter(q => q.topicMappingStatus === 'EDITORIAL_TOPIC_REFERRAL_CANDIDATE_ONLY');
assert.equal(referrals.length, 425);
assert.equal(p1.questions.length - referrals.length, 27);
assert.equal(new Set(p1.questions.map(q => q.bank)).size, 25);
assert.equal(audit.questions.length, 25);
assert.deepEqual(
  ['DIRECT_TOPIC_IN_DRAFT', 'PARTIAL_TOPIC_IN_DRAFT', 'NO_DEDICATED_ANSWER']
    .map(s => audit.questions.filter(q => q.status === s).length),
  [18, 5, 2]);
for (const q of audit.questions) {
  assert.ok(lookup.has(q.historicalId));
  assert.equal(q.publicUsePermitted, false);
  for (const owner of q.candidateDraftSourceOwners) {
    assert.ok(allowed.has(owner.canonicalId));
    assert.equal(owner.publicationAllowed, false);
  }
}
assert.equal(names.rows.length, 198);
for (const q of names.rows) assert.ok(lookup.has(q.historicalId));
assert.equal(overlap.summary.exactNormalizedCrossCollectionPairs, 1);
assert.equal(overlap.summary.duplicateHistoricalTitleGroups, 1);
assert.equal(sourcePointers.references.length, 734);
assert.equal(sourcePointers.references.filter(q => q.namespace === 'HISTORICAL_EXCERPT_20261012').length, 452);
assert.equal(sourcePointers.references.filter(q => q.namespace === 'CURRENT_REPOSITORY_QA_20261012').length, 282);
assert.ok(sourcePointers.references.every(q => q.conversationRole === 'MONSIEUR_LE_CHANOINE'));
assert.ok(sourcePointers.references.every(q => q.sourcePointer?.path && q.sourcePointer?.recordId));
console.log('Canon recovery contracts valid: 452 identities, 425 topic-only candidates, 27 topic gaps, 25 original-answer inspections, 198 limited denomination screens, no public claims');
