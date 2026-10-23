import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const source = load('data/customs/master/weiser-observations.v0.json');
const census = load('data/customs/master/comprehensive-customs-source-census.v1.json');
const master = load('data/customs/master/working-master.v1.json');
const family = load('data/customs/master/weiser-family-preview-batch01.v1.json');
const batches = [
  load('data/customs/master/full-registry-working-groups-ch01-14.v1.json'),
  load('data/customs/master/full-registry-working-groups-ch15-28.v1.json'),
  load('data/customs/master/full-registry-working-groups-supplement.v1.json')
];
const crosswalk = load('data/customs/master/full-registry-observation-crosswalk.v1.json');

const originalIds = source.records.map(r => r.id);
const original = new Set(originalIds);
assert.equal(source.records.length, 568);
assert.equal(original.size, 568);
assert.equal(new Set(source.records.map(r => r.chapter)).size, 28);
assert.equal(census.source_observations.length, 568);
assert.deepEqual(new Set(census.source_observations.map(r => r.id)), original);

const groups = batches.flatMap(b => b.groups);
assert.equal(groups.length, 308);
assert.equal(new Set(groups.map(g => g.proposal_id)).size, 308);
const groupIds = new Set(groups.map(g => g.proposal_id));
const observationsInGroups = groups.flatMap(g => g.mapped_source_observations.map(o => o.id));
assert.equal(observationsInGroups.length, 309);
assert.equal(new Set(observationsInGroups).size, 309);
for (const id of observationsInGroups) assert.ok(original.has(id), 'Unknown source observation ' + id);
for (const group of groups) {
  assert.equal(group.publication_state, 'RESEARCH_ONLY');
  assert.equal(group.status, 'PROVISIONAL_PRACTICE_OR_VARIANT_NOT_PROVEN_DISTINCT');
  assert.ok(group.mapped_source_observations.length > 0);
}
assert.equal(master.records.length, 56);
const masterIds = new Set(master.records.map(r => r.id));
assert.equal(crosswalk.records.length, 568);
assert.equal(new Set(crosswalk.records.map(r => r.source_id)).size, 568);
assert.deepEqual(new Set(crosswalk.records.map(r => r.source_id)), original);
const expectedRoutes = {
  PROVISIONAL_PRACTICE_GROUP:309,
  PREVIOUS_WORKING_MASTER_LINK:42,
  ADDITIONAL_PROPOSED_WORKING_MASTER_LINK:18,
  ADDITIONAL_PROPOSED_GROUP_RELATION:1,
  BACKGROUND_CONTEXT_OR_MULTI_PRACTICE_REFERENCE:17,
  OTHER_LITURGY_OR_EXISTING_PRACTICE_OWNER_RECHECK:71,
  HISTORICAL_PRACTICE_VERSUS_CONTEXT_RECHECK:76,
  DISPUTED_FOLKLORE_OR_NON_CATHOLIC_CONTEXT_RECHECK:34
};
const actualRoutes = Object.fromEntries(Object.keys(expectedRoutes).map(k => [k, crosswalk.records.filter(r => r.route === k).length]));
assert.deepEqual(actualRoutes, expectedRoutes);
for(const r of crosswalk.records) {
  assert.ok(r.research_retained && r.source_exists);
  assert.equal(r.app_publication_eligibility, 'NOT_DETERMINED');
  assert.equal(r.separately_verified_new_custom, false);
  if (r.route === 'PROVISIONAL_PRACTICE_GROUP' || r.route === 'ADDITIONAL_PROPOSED_GROUP_RELATION') assert.ok(groupIds.has(r.target));
  if (r.route === 'ADDITIONAL_PROPOSED_WORKING_MASTER_LINK') assert.ok(masterIds.has(r.target));
  if (r.route === 'PREVIOUS_WORKING_MASTER_LINK') {
    assert.ok(Array.isArray(r.target) && r.target.length);
    for (const id of r.target) assert.ok(masterIds.has(id), 'Missing master target ' + id);
  }
}
assert.equal(family.records.length, 16);
assert.equal(new Set(family.records.map(r => r.id)).size,16);
assert.equal(new Set(family.records.map(r => r.grouping_proposal)).size,14);
assert.equal(family.summary.book_fully_mined, false);
console.log('Customs comprehensive census: 568/568 source parity, 308 provisional groups, 309 mentions grouped, 16 Family-book preview mentions, zero publications — PASS');
