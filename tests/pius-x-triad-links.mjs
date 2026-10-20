import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const names = ['b02-b05','b06-b09','b10-b13','b14-b16-b50-pilot'];
const lengths = [200,200,200,210];
const all = [];
for (let i = 0; i < names.length; i++) {
  const path = 'data/learn/research/pius-x-triad-audit-' + names[i] + '-20261020.v1.json';
  const shard = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(shard.records.length, lengths[i]);
  assert.equal(shard.state, 'RESEARCH_ONLY_NO_RUNTIME');
  assert.equal(shard.counts.published, 0);
  all.push(...shard.records);
}
assert.equal(all.length, 810);
assert.equal(new Set(all.map(r => r.draftInstanceId)).size, 810);
for (const r of all) {
  assert.ok(r.spx.url && r.spx.locus, r.draftInstanceId);
  assert.equal(r.spx.sourceVerifiedForAnswer, false);
  assert.equal(r.publicationApproved, false);
  assert.equal(r.chanoine.offerOptIn, true);
  assert.equal(r.chanoine.requiresConsent, true);
  assert.equal(r.chanoine.sourceGated, true);
  assert.equal(r.chanoine.answerCertified, false);
  assert.ok(r.denzinger.status === 'UNASSESSED_NO_NUMBER_ASSIGNED' || r.denzinger.status === 'OLD_DZ_OCR_CANDIDATE_UNCERTIFIED');
  for (const d of r.denzinger.references) {
    assert.equal(d.originalPageImageChecked, false);
    assert.equal(d.modernDHConfirmed, false);
    assert.equal(d.relationshipApproved, false);
  }
}
console.log('SPX research triad: 810 draft instances accounted for; 0 certified.');
