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


const family1956 = load('data/customs/master/weiser-family-1956-fullscan-source-pass01.v1.json');
const familyBridge = load('data/customs/master/weiser-two-book-relationship-review.v1.json');
assert.equal(family1956.records.length, 111);
assert.equal(new Set(family1956.records.map(r => r.observation_id)).size, 111);
assert.equal(family1956.summary.claimed_full_text_exhaustive, false);
const previewIds = new Set(family.records.map(r => r.id));
for (const r of family1956.records) {
  assert.ok(r.source_locator.original_printed_page >= 1);
  assert.ok(r.source_locator.pdf_page_index >= 1);
  assert.ok(r.source_locator.extracted_line_start >= 1);
  assert.ok(r.source_locator.extracted_line_end >= r.source_locator.extracted_line_start);
  assert.equal(r.publication, 'RESEARCH_ONLY');
  if (r.prior_preview_id) assert.ok(previewIds.has(r.prior_preview_id));
}
const fullIds = new Set(family1956.records.map(r => r.observation_id));
assert.equal(familyBridge.records.length, 111);
assert.deepEqual(new Set(familyBridge.records.map(r => r.family_observation_id)), fullIds);
assert.equal(new Set(familyBridge.records.map(r => r.family_observation_id)).size, 111);
const priorSourceIds = new Set(source.records.map(r => r.id));
const masterSet = new Set(master.records.map(r => r.id));
for (const r of familyBridge.records) {
  assert.equal(r.identity_decision, 'UNRESOLVED_NOT_NEW_CUSTOM_CONFIRMED');
  assert.equal(r.publication_state, 'RESEARCH_ONLY');
  for (const link of r.proposed_handbook_observation_relations) assert.ok(priorSourceIds.has(link.observation_id));
  for (const link of r.proposed_master_identity_relations) assert.ok(masterSet.has(link.identity_id));
  if (r.earlier_preview_overlap_id) assert.ok(previewIds.has(r.earlier_preview_overlap_id));
}
assert.equal(familyBridge.records.filter(r => r.proposed_handbook_observation_relations.length).length, 54);
assert.equal(familyBridge.records.filter(r => r.proposed_master_identity_relations.length).length, 16);
assert.equal(familyBridge.records.filter(r => !r.proposed_handbook_observation_relations.length && !r.proposed_master_identity_relations.length).length, 56);
assert.equal(familyBridge.records.filter(r => !!r.earlier_preview_overlap_id).length, 15);
console.log('Weiser family 1956 direct scan + cross-book candidate relationships — PASS');


const historical = load('data/customs/master/historical-practice-recovery-ch01-28.v1.json');
const context181 = load('data/customs/master/context-historical-contested-181-review.v1.json');
const addendum = load('data/customs/master/weiser-handbook-addendum-st-stephen.v1.json');
assert.equal(historical.records.length,39);
assert.equal(new Set(historical.records.map(r => r.source_observation_id)).size,39);
const historicalIds = new Set(historical.records.map(r => r.research_group_id));
assert.equal(historicalIds.size,39);
assert.equal(context181.records.length,181);
const contextIds = new Set(context181.records.map(r => r.source_observation_id));
assert.equal(contextIds.size,181);
for (const r of context181.records) {
  assert.ok(priorSourceIds.has(r.source_observation_id));
  assert.equal(r.research_retained, true);
  assert.equal(r.distinctness_certified, false);
  assert.equal(r.app_publication, false);
  if(r.proposed_historical_group_id) assert.ok(historicalIds.has(r.proposed_historical_group_id));
}
assert.equal(context181.records.filter(r => r.proposed_historical_group_id).length,39);
assert.deepEqual(
  new Set(context181.records.map(r => r.source_observation_id)),
  new Set(crosswalk.records.filter(r => [
    'OTHER_LITURGY_OR_EXISTING_PRACTICE_OWNER_RECHECK',
    'HISTORICAL_PRACTICE_VERSUS_CONTEXT_RECHECK',
    'DISPUTED_FOLKLORE_OR_NON_CATHOLIC_CONTEXT_RECHECK'
  ].includes(r.route)).map(r => r.source_id))
);
assert.equal(addendum.records.length,6);
assert.equal(new Set(addendum.records.map(r => r.id)).size,6);
for (const r of addendum.records) {
  assert.ok(!priorSourceIds.has(r.id), 'Addendum must not overwrite the 568-record source');
  assert.ok([128,129].includes(r.printed_page));
  assert.equal(r.research_status,'PRIMARY_PAGE_VISUALLY_CHECKED_NOT_IDENTITY_CERTIFIED');
  assert.equal(r.app_publication,'NONE');
  for (const otherId of r.possible_existing_links) assert.ok(priorSourceIds.has(otherId));
}
assert.equal(addendum.records.filter(r => r.secondary_witnesses.length).length,1);
const previewCoverage = new Set(
  family1956.records.flatMap(r => [
    ...(r.prior_preview_id ? [r.prior_preview_id] : []),
    ...(r.additional_previous_preview_ids || [])
  ])
);
assert.equal(previewCoverage.size,16);
assert.deepEqual(previewCoverage,previewIds);
const bridgeCoverage = new Set(familyBridge.records.flatMap(r => [
  ...(r.earlier_preview_overlap_id ? [r.earlier_preview_overlap_id] : []),
  ...(r.additional_earlier_preview_overlap_ids || [])
]));
assert.deepEqual(bridgeCoverage,previewIds);
console.log('Weiser historical/context/disputed 181-case audit, 39 recovered leads, 6 PDF-checked addendum observations and full 16 preview bridge — PASS');
