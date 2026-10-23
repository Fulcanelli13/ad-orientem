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


const researchCatalogue = load('data/customs/master/comprehensive-customs-working-catalogue.v1.json');
const count = researchCatalogue.summary;
assert.equal(count.source_observations.combined_distinct_source_rows, 685);
assert.equal(count.source_observations.handbook_current_total, 574);
assert.equal(count.source_observations.family_1956_direct_scan, 111);
assert.equal(researchCatalogue.existing_master_identities.length, 56);
assert.equal(researchCatalogue.provisional_handbook_groups.length, 308);
assert.equal(researchCatalogue.provisional_historical_groups.length, 39);
assert.equal(researchCatalogue.addendum_unresolved_practice_leads.length, 6);
assert.equal(researchCatalogue.family_1956_source_observations.length, 111);
const allWorkingRows = [
  ...researchCatalogue.existing_master_identities,
  ...researchCatalogue.provisional_handbook_groups,
  ...researchCatalogue.provisional_historical_groups,
  ...researchCatalogue.addendum_unresolved_practice_leads
];
assert.equal(new Set(allWorkingRows.map(r => r.id)).size, allWorkingRows.length);
const allHandbookIds = new Set([...priorSourceIds, ...addendum.records.map(r => r.id)]);
assert.equal(allHandbookIds.size, 574);
for(const g of researchCatalogue.provisional_handbook_groups) for(const id of g.source_observations)
  assert.ok(priorSourceIds.has(id));
for(const g of researchCatalogue.provisional_historical_groups) for(const id of g.source_observations)
  assert.ok(priorSourceIds.has(id));
for(const g of researchCatalogue.addendum_unresolved_practice_leads) for(const id of g.source_observations)
  assert.ok(allHandbookIds.has(id));
assert.deepEqual(
  new Set(researchCatalogue.family_1956_source_observations.map(x => x.observation_id)),
  new Set(family1956.records.map(x => x.observation_id))
);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(count.no_new_app_publications,true);
console.log('Unified independent customs workbench index — 685 source mentions, 56 master identities, 347 provisional groups, 6 addendum leads — PASS');


const weiserFine = load('data/customs/master/weiser-handbook-targeted-addendum-ch10-13.v1.json');
const precursorWorks = load('data/customs/master/weiser-precursor-works-acquisition.v1.json');
assert.equal(weiserFine.records.length, 57);
assert.equal(new Set(weiserFine.records.map(r => r.id)).size, 57);
assert.equal(precursorWorks.works.length, 4);
assert.equal(new Set(precursorWorks.works.map(w => w.source_id)).size,4);
for (const row of weiserFine.records) {
  assert.ok(!allHandbookIds.has(row.id), 'Nested observation IDs cannot collide with original 574');
  assert.ok(priorSourceIds.has(row.relation.previous_source_observation));
  assert.equal(row.source.pdf_page_index_zero_based, row.source.printed_page+17, '1958 PDF mapping from sample screenshots');
  assert.ok(Number.isInteger(row.source.ocr_extracted_line_range[0]));
  assert.ok(row.source.ocr_extracted_line_range[1] > row.source.ocr_extracted_line_range[0]);
  assert.equal(row.approved_distinct_custom_identity,false);
  assert.equal(row.app_publication,'NONE');
}
assert.equal(count.source_observations.handbook_nested_granular_detail_mentions,340);
assert.equal(count.source_observations.all_book_research_rows_including_nested_details,1025);
assert.equal(researchCatalogue.handbook_granular_source_details.length,340);
const compiledDetailIds = new Set(researchCatalogue.handbook_granular_source_details.map(x=>x.id));
for (const r of weiserFine.records) assert.ok(compiledDetailIds.has(r.id), 'Earlier ch10–13 detail lost');
assert.equal(count.identity_working_rows.new_identity_proposals_from_nested_details,0);
console.log('Handbook ch10–13 research details — original 57 rows retained within expanded 1025-row workbench — PASS');


const remainingChapters = load('data/customs/master/weiser-handbook-targeted-addendum-ch14-28.v1.json');
assert.equal(remainingChapters.entries.length,121);
assert.equal(new Set(remainingChapters.entries.map(x=>x.id)).size,121);
assert.deepEqual(remainingChapters.summary.source_chapters_covered,Array.from({length:15},(_,i)=>i+14));
assert.equal(remainingChapters.summary.unique_printed_page_locations,42);
assert.equal(count.source_observations.handbook_nested_granular_detail_mentions,340);
assert.equal(count.source_observations.all_book_research_rows_including_nested_details,1025);
assert.equal(researchCatalogue.handbook_granular_source_details.length,340);

const ch01_04 = load('data/customs/master/weiser-handbook-targeted-addendum-ch01-04.v1.json');
const ch05_09 = load('data/customs/master/weiser-handbook-targeted-addendum-ch05-09.v1.json');
assert.equal(ch01_04.records.length,41);
assert.equal(ch05_09.records.length,121);
assert.equal(ch01_04.summary.possibly_unindexed_source_details,12);
assert.equal(ch05_09.summary.possibly_unindexed_source_details,22);
assert.equal(count.source_review.handbook_ch01_to_09_potential_unindexed_details,34);
const earlyDetails = [...ch01_04.records,...ch05_09.records];
const earlyDetailIds = new Set(earlyDetails.map(r=>r.id));
assert.equal(earlyDetailIds.size,162);
assert.equal(count.source_observations.granular_details_spread_by_batch.ch01_to_04,41);
assert.equal(count.source_observations.granular_details_spread_by_batch.ch05_to_09,121);
for(const r of earlyDetails){
 const p = r.source?.printed_page ?? r.source_locator?.printed_page;
 const pdfp = r.source?.pdf_page_zero_based ?? r.source_locator?.pdf_page_zero_based;
 const parent = r.reference_to_original_index ?? r.original_observation_link ?? null;
 assert.equal(pdfp,p+17,'Printed page maps to zero-based 1958 PDF page');
 if(parent) assert.ok(priorSourceIds.has(parent),'Existing source parent must exist');
 assert.equal(r.app_publication,'NONE');
 assert.equal(r.uniqueness_status ?? r.actual_unique_practice_identity,'NOT_CERTIFIED'===r.uniqueness_status?'NOT_CERTIFIED':'UNRESOLVED');
}
const mappedTotals = earlyDetails.filter(r=>(r.reference_to_original_index ?? r.original_observation_link ?? null)===null).length;
assert.equal(mappedTotals,34);
assert.equal(new Set(researchCatalogue.handbook_granular_source_details.map(x=>x.id)).size,340);
console.log('Weiser ch01–09 source text extraction — 162 details across 9 chapters, 34 unmatched source actions, all retained — PASS');

const originalSubDetailIds = new Set(weiserFine.records.map(r=>r.id));
const newSubDetailIds = new Set(remainingChapters.entries.map(r=>r.id));
for(const row of remainingChapters.entries){
  assert.ok(!originalSubDetailIds.has(row.id), 'Do not overwrite previous 57 details');
  assert.ok(!allHandbookIds.has(row.id), 'Do not overwrite first-pass Handbook observations');
  assert.ok(priorSourceIds.has(row.parent.source_observation_id), 'Unknown source observation parent');
  assert.equal(row.location.pdf_page_zero_based,row.location.printed_page+17);
  assert.ok(row.location.ocr_line_start>=1);
  assert.ok(row.location.ocr_line_end>row.location.ocr_line_start);
  assert.equal(row.app_publication,'NONE');
  assert.equal(row.current_practice_claim,'NOT_ESTABLISHED');
}
assert.deepEqual(
  new Set(researchCatalogue.handbook_granular_source_details.map(x=>x.id)),
  new Set([...originalSubDetailIds,...newSubDetailIds,...earlyDetailIds])
);
assert.equal(remainingChapters.summary.independently_verified_new_distinct_customs,0);
assert.equal(remainingChapters.summary.app_published,0);
console.log('Weiser 1958 chapters 14–28: 121 traceable nested details across 42 printed-page locations, no source loss or new publication — PASS');


const secondPassCoverage = load('data/customs/master/weiser-1958-second-pass-page-coverage.v1.json');
assert.equal(secondPassCoverage.chapters.length,28);
assert.equal(secondPassCoverage.summary.detail_observations_from_four_second_pass_files,340);
assert.equal(secondPassCoverage.summary.combined_detail_and_addendum_rows,346);
assert.equal(secondPassCoverage.summary.distinct_page_locations_having_at_least_one_source_detail,120);
assert.equal(secondPassCoverage.summary.printed_pages_not_yet_represented_in_detail_pass,222);
assert.equal(secondPassCoverage.summary.fully_line_by_line_reaudited_pages_certified,0);
assert.equal(secondPassCoverage.summary.fully_line_by_line_reaudited_chapters,0);
assert.equal(secondPassCoverage.chapters.reduce((n,r)=>n+r.number_of_first_plus_second_pass_detail_rows,0),346);
assert.equal(secondPassCoverage.chapters.reduce((n,r)=>n+r.unique_printed_page_locations,0),120);
for(const r of secondPassCoverage.chapters) {
 assert.ok(r.main_chapter_page_count>=r.unique_printed_page_locations);
 assert.equal(new Set(r.unique_printed_pages_with_located_details).size,r.unique_printed_page_locations);
 assert.ok(r.unique_printed_pages_with_located_details.every(p=>p>=r.printed_page_range[0]&&p<=r.printed_page_range[1]));
 assert.equal(r.complete_page_by_page_second_read_confirmed,false);
}
console.log('Handbook source-page coverage — 28/28 indexed, 120/342 locations touched, 222 without new detail location; no full page reading claimed — PASS');


const orphanAdjudication = load('data/customs/master/weiser-ch01-09-unindexed-leads-adjudication.v1.json');
assert.equal(orphanAdjudication.records.length,34);
assert.equal(orphanAdjudication.working_research_groups.length,24);
assert.equal(orphanAdjudication.summary.other_context_variant_or_comparison_cases,10);
assert.equal(new Set(orphanAdjudication.records.map(x=>x.source_detail_id)).size,34);
const earlyUnparented = new Set(earlyDetails.filter(r=>(r.reference_to_original_index??r.original_observation_link??null)===null).map(x=>x.id));
assert.deepEqual(new Set(orphanAdjudication.records.map(x=>x.source_detail_id)),earlyUnparented);
assert.equal(new Set(orphanAdjudication.working_research_groups.map(x=>x.provisional_id)).size,24);
assert.equal(researchCatalogue.provisional_unindexed_practice_leads.length,24);
assert.equal(count.identity_working_rows.total_provisional_groups_including_unindexed,371);
assert.equal(count.identity_working_rows.provisional_early_chapter_unindexed_groups,24);
for(const r of orphanAdjudication.records) {
 assert.equal(r.distinct_custom_verified,false);
 assert.equal(r.app_publication,false);
 if(r.existing_source_relation_under_review) assert.ok(priorSourceIds.has(r.existing_source_relation_under_review));
}
for(const g of researchCatalogue.provisional_unindexed_practice_leads){
 assert.ok(earlyUnparented.has(g.source_observation_id));
 assert.equal(g.identity_status,'UNVERIFIED_DISTINCTNESS_OR_CATHOLIC_SPECIFICITY');
}
console.log('Unindexed 34 source details: 24 provisional group leads, 10 contextual/variant dispositions — PASS');


const all340 = load('data/customs/master/all-340-granular-to-practice-reconciliation.v1.json');
const all371 = load('data/customs/master/371-group-family-geographic-reconciliation.v1.json');
const sharedPairReview = load('data/customs/master/54-coassociation-pairs-nonmerger-review.v1.json');
assert.equal(all340.records.length,340);
assert.equal(new Set(all340.records.map(x=>x.detail_id)).size,340);
assert.deepEqual(
 new Set(all340.records.map(x=>x.detail_id)),
 new Set(researchCatalogue.handbook_granular_source_details.map(x=>x.id))
);
assert.equal(all340.summary.with_group_candidates,242);
assert.equal(all340.summary.with_master_candidates,71);
assert.equal(all340.summary.without_group_or_master_candidates,53);
const allGroupIds=new Set([
 ...researchCatalogue.provisional_handbook_groups.map(x=>x.id),
 ...researchCatalogue.provisional_historical_groups.map(x=>x.id),
 ...researchCatalogue.provisional_unindexed_practice_leads.map(x=>x.id)
]);
assert.equal(allGroupIds.size,371);
for(const detail of all340.records){
 assert.equal(detail.source_retained,true);
 assert.equal(detail.distinctness_verified,false);
 assert.equal(detail.publication_state,'RESEARCH_ONLY');
 if(detail.parent_source_observation_id)assert.ok(priorSourceIds.has(detail.parent_source_observation_id));
 for(const id of detail.candidate_provisional_group_ids)assert.ok(allGroupIds.has(id));
 for(const m of detail.candidate_working_master_ids)assert.ok(masterSet.has(m.identity_id));
}
assert.equal(all371.provisional_groups.length,371);
assert.deepEqual(new Set(all371.provisional_groups.map(x=>x.provisional_group_id)),allGroupIds);
assert.equal(all371.summary.groups_with_explicit_owner_candidate,47);
assert.equal(all371.summary.groups_without_explicit_owner_candidate,324);
assert.equal(all371.family_1956_cross_links.length,111);
assert.equal(all371.geographic_families.length,53);
const familyObsIds = new Set(family1956.records.map(x=>x.observation_id));
for(const f of all371.family_1956_cross_links){
 assert.ok(familyObsIds.has(f.family_1956_observation_id));
 assert.equal(f.unique_new_custom_verified,false);
 for(const id of f.candidate_provisional_group_ids)assert.ok(allGroupIds.has(id));
 for(const id of f.candidate_master_identity_ids)assert.ok(masterSet.has(id));
}
for(const row of all371.provisional_groups){
 assert.equal(row.identity_verified,false);
 assert.equal(row.publication_state,'RESEARCH_ONLY');
 for(const m of row.owner_identity_candidates)assert.ok(masterSet.has(m.id));
}
for(const g of all371.geographic_families) if(g.working_master_custom_id) assert.ok(masterSet.has(g.working_master_custom_id));
assert.equal(all371.summary.geographic_families_with_master_relation,23);
assert.equal(all371.summary.geographic_families_without_master_relation,30);
assert.equal(all371.summary.family_1956_with_any_owner_candidate,49);
assert.equal(all371.summary.family_1956_without_owner_candidate,62);
assert.equal(sharedPairReview.pair_candidates.length,54);
assert.equal(new Set(sharedPairReview.pair_candidates.map(p=>[p.group_a,p.group_b].sort().join('|'))).size,54);
for(const p of sharedPairReview.pair_candidates){
 assert.ok(allGroupIds.has(p.group_a)&&allGroupIds.has(p.group_b));
 assert.equal(p.identity_equivalence_verified,false);
 assert.equal(p.app_publication,false);
}
assert.equal(researchCatalogue.summary.identity_working_rows.provisional_groups_with_explicit_existing_owner_relation,47);
assert.equal(researchCatalogue.summary.source_review.shared_owner_or_family_source_coassociation_edges,54);
assert.equal(all371.summary.certified_distinct_new_practices,0);
assert.equal(all340.summary.automatic_merges,0);
console.log('Independent customs identity graph — 340 nested details, 371 group rows, 111 family observations, 53 geographic families, 54 non-merging co-associations — PASS');


const actionReview53 = load('data/customs/master/53-no-owner-customs-action-review.v1.json');
const pairReview54 = load('data/customs/master/54-coassociation-action-level-relationship-review.v1.json');
assert.equal(actionReview53.records.length,53);
assert.equal(new Set(actionReview53.records.map(x => x.source_detail_id)).size,53);
assert.equal(actionReview53.new_provisional_groups.length,37);
assert.equal(new Set(actionReview53.new_provisional_groups.map(x=>x.provisional_group_id)).size,37);
assert.equal(actionReview53.summary.new_provisional_action_group_labels,37);
assert.equal(actionReview53.summary.input_unassigned_detail_records,53);
const noCandidates = new Set(
 load('data/customs/master/all-340-granular-to-practice-reconciliation.v1.json').records
 .filter(r=>!r.candidate_provisional_group_ids.length&&!r.candidate_working_master_ids.length)
 .map(r=>r.detail_id)
);
assert.equal(noCandidates.size,53);
assert.deepEqual(new Set(actionReview53.records.map(x=>x.source_detail_id)),noCandidates);
const knownDetailIds = new Set(researchCatalogue.handbook_granular_source_details.map(x=>x.id));
const previousGroupIds = new Set([
 ...researchCatalogue.provisional_handbook_groups.map(x=>x.id),
 ...researchCatalogue.provisional_historical_groups.map(x=>x.id),
 ...researchCatalogue.provisional_unindexed_practice_leads.map(x=>x.id)
]);
for(const r of actionReview53.records) {
  assert.ok(knownDetailIds.has(r.source_detail_id));
  assert.equal(r.practice_identity_verified,false);
  assert.equal(r.publication_state,'RESEARCH_ONLY');
  for(const id of r.related_previous_group_candidates) assert.ok(previousGroupIds.has(id));
  for(const id of r.proposed_provisional_group_ids)
    assert.ok(actionReview53.new_provisional_groups.some(g=>g.provisional_group_id===id));
}
for(const r of actionReview53.new_provisional_groups) {
  assert.ok(!previousGroupIds.has(r.provisional_group_id));
  assert.equal(r.distinctness_verified,false);
  assert.equal(r.publication_state,'RESEARCH_ONLY');
  for(const id of r.source_detail_ids) assert.ok(noCandidates.has(id));
}
assert.equal(researchCatalogue.provisional_unassigned_action_leads.length,37);
assert.equal(researchCatalogue.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(researchCatalogue.summary.source_review.all_53_unassigned_detail_cases_action_classified,53);
assert.equal(researchCatalogue.summary.source_observations.all_book_research_rows_including_nested_details,1025);
assert.equal(pairReview54.records.length,54);
assert.equal(new Set(pairReview54.records.map(r=>r.pair_id)).size,54);
assert.equal(pairReview54.summary.final_mergers,0);
assert.equal(pairReview54.summary.source_verified_sameness,0);
const priorPairs = load('data/customs/master/54-coassociation-pairs-nonmerger-review.v1.json').pair_candidates;
assert.deepEqual(new Set(priorPairs.map(p=>p.relation_review_id)),new Set(pairReview54.records.map(p=>p.pair_id)));
for(const r of pairReview54.records){
  assert.ok(previousGroupIds.has(r.group_a));
  assert.ok(previousGroupIds.has(r.group_b));
  assert.equal(r.equivalence_certified,false);
  assert.equal(r.automatic_merge_allowed,false);
  assert.equal(r.publication_state,'RESEARCH_ONLY');
}
assert.equal(pairReview54.summary.plausibly_related_action_variants,7);
assert.equal(pairReview54.summary.clearly_different_reported_actions,25);
assert.equal(pairReview54.summary.remaining_context_related,22);
assert.equal(researchCatalogue.summary.source_review.coassociation_pair_label_relationships_reviewed,54);
console.log('53 orphan details adjudicated; 37 newly staged action groups (408 provisional total); 54 pair comparisons, zero automatic merges — PASS');


const mcloughlinText = load('data/customs/master/mcloughlin-family-advent-fulltext-ewtn-first-pass.v1.json');
const mcloughlinGroups = load('data/customs/master/mcloughlin-family-advent-action-family-reconciliation.v1.json');
assert.equal(mcloughlinText.records.length,70);
assert.equal(mcloughlinGroups.families.length,26);
const mclIds = new Set(mcloughlinText.records.map(r=>r.observation_id));
assert.equal(mclIds.size,70);
const allMcLReferences = mcloughlinGroups.families.flatMap(g=>g.included_source_observation_ids);
assert.equal(allMcLReferences.length,70);
assert.deepEqual(new Set(allMcLReferences),mclIds);
assert.equal(mcloughlinGroups.summary.certified_distinct_new_catholic_customs,0);
assert.equal(mcloughlinGroups.summary.publication_changes,0);
assert.equal(count.source_observations.total_source_detail_rows_including_external,1425);
assert.equal(count.source_observations.all_book_research_rows_including_nested_details,1025);
assert.equal(researchCatalogue.external_source_observations_mcloughlin.length,70);
assert.equal(researchCatalogue.external_source_action_families_mcloughlin.length,26);
assert.equal(new Set(researchCatalogue.external_source_action_families_mcloughlin.map(g=>g.id)).size,26);
const priorGroupIds = new Set([...researchCatalogue.provisional_handbook_groups, ...researchCatalogue.provisional_historical_groups, ...researchCatalogue.provisional_unindexed_practice_leads, ...researchCatalogue.provisional_unassigned_action_leads, ...researchCatalogue.addendum_unresolved_practice_leads].map(r=>r.id));
for(const r of mcloughlinText.records){
 assert.equal(r.identity_status,'SOURCE_OBSERVATION_ONLY_DISTINCTNESS_UNDECIDED');
 assert.equal(r.app_publication,'NONE');
 assert.ok(r.source_locator.html_line_start>=104 && r.source_locator.html_line_end<=421);
 assert.ok(r.source_locator.html_line_end>=r.source_locator.html_line_start);
}
for(const g of mcloughlinGroups.families){
 assert.equal(g.app_publication,false);
 for(const id of g.possible_master_ids) assert.ok(masterSet.has(id));
 for(const id of g.possible_provisional_group_ids) assert.ok(priorGroupIds.has(id));
}
console.log('Helen McLoughlin online textual witness: 70 source observations, 26 reversible action families, 1,095 aggregate research rows — PASS');


// Source-witness expansion after McLoughlin: 1955 Stokes compilation. These
// are source-located action observations, NOT distinct customs or independent
// corroborations of Stokes's cited authors (Trapp, Mueller, Attwater, Byles).
const stokes55 = load('data/customs/master/stokes-1955-family-liturgy-ewtn-first-pass.v1.json');
assert.equal(stokes55.records.length,198);
assert.equal(stokes55.summary.records,198);
assert.equal(stokes55.summary.verified_distinct_customs_added,0);
assert.equal(stokes55.summary.prior_provisional_group_count_unchanged,408);
assert.equal(stokes55.summary.app_published,0);
assert.equal(stokes55.summary.source_does_not_independently_corroborate_cited_authors,true);
assert.equal(stokes55.source.imprimatur_date,'1955-09-24');
const stokesIds=new Set(stokes55.records.map(r=>r.observation_id));
assert.equal(stokesIds.size,198);
const expectedStokesClaims={
  REPORTED_OR_DESCRIBED_PRACTICE_UNVERIFIED:98,
  AUTHOR_SUGGESTED_PRACTICE:49,
  POSSIBLE_RITUAL_OR_AUTHORITY_CLAIM_REQUIRES_PRIMARY_CHECK:14,
  FOLK_BELIEF_OR_DRAMATIZATION_NOT_ENDORSED:3,
  SECONDARY_NAMED_SOURCE_OR_FAMILY_REPORT:27,
  HISTORICAL_CUSTOM_CLAIM_NOT_VERIFIED:7
};
const actualStokesClaims=Object.fromEntries(Object.keys(expectedStokesClaims).map(k=>[k,stokes55.records.filter(r=>r.claim_characterization===k).length]));
assert.deepEqual(actualStokesClaims,expectedStokesClaims);
assert.deepEqual(stokes55.summary.claim_characters,expectedStokesClaims);
for(const [i,r] of stokes55.records.entries()){
  assert.equal(r.observation_id,'STOKES55-EWTN-'+String(i+1).padStart(3,'0'));
  assert.ok(r.action_label && r.source_section);
  assert.ok(r.source_locator.html_line_start>=132 && r.source_locator.html_line_end<=570);
  assert.ok(r.source_locator.html_line_start<=r.source_locator.html_line_end);
  assert.equal(r.source_locator.url,stokes55.source.url);
  assert.equal(r.identity_status,'SOURCE_ACTION_ONLY_NOT_VERIFIED_DISTINCT_CUSTOM');
  assert.equal(r.ritual_authority,'NOT_VALIDATED_AGAINST_1962_ROMAN_RITUAL');
  assert.equal(r.app_publication,'NONE');
}
assert.equal(researchCatalogue.external_source_observations_stokes.length,198);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_stokes.map(r=>r.id)),stokesIds);
assert.equal(count.source_observations.stokes_1955_online_source_action_observations,198);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
for(const r of researchCatalogue.external_source_observations_stokes){
  const orig=stokes55.records.find(o=>o.observation_id===r.id);
  assert.ok(orig);
  assert.deepEqual(r.web_lines,[orig.source_locator.html_line_start,orig.source_locator.html_line_end]);
  assert.equal(r.label,orig.action_label);
  assert.equal(r.type,orig.claim_characterization);
  assert.equal(r.identity_certified,false);
}
console.log('Stokes 1955 family practices: 198 separately indexed witness details, 1,293 aggregate research rows, 408 prior provisional groups preserved, no publication — PASS');


// Independent-author online excerpt intake: this is NOT an exhaustive source read
// or confirmation of historically distinct practices. Secondary-host caveats apply.
const ccEx = load('data/customs/master/trapp-berger-newland-catholicculture-excerpts-wave01.v1.json');
assert.equal(ccEx.records.length,132);
assert.equal(ccEx.source_pages.length,29);
assert.equal(ccEx.summary.source_observation_rows,132);
assert.deepEqual(ccEx.summary.by_author,{TRAPP:54,BERGER:21,NEWLAND:57});
assert.equal(ccEx.summary.verified_distinct_new_customs,0);
assert.equal(ccEx.summary.app_publications,0);
assert.equal(ccEx.original_source_pages_not_inspected,true);
const ccIds = new Set(ccEx.records.map(r=>r.observation_id));
assert.equal(ccIds.size,132);
const ccPageIndex=new Map(ccEx.source_pages.map(p=>[p.source_key,p]));
assert.equal(ccPageIndex.size,29);
for(const p of ccEx.source_pages) {
 assert.equal(p.evidence_scope,'ONLY_THE_ONLINE_EXCERPT_NOT_FULL_BOOK');
 assert.ok(p.online_url.startsWith('https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id='));
 assert.ok(p.record_count>0);
}
for(const r of ccEx.records) {
 assert.ok(ccPageIndex.has(r.source_key));
 assert.ok(r.independently_worded_action_label.length>14);
 assert.equal(r.app_publication,'NONE');
 assert.equal(r.existing_identity,'UNMATCHED_REVIEW_REQUIRED_NO_NEW_CUSTOM_ASSERTED');
 assert.equal(r.rite_approval,'NOT_CHECKED_AGAINST_1962_RITUAL');
 assert.equal(r.source_locator.url,ccPageIndex.get(r.source_key).online_url);
}
assert.equal(researchCatalogue.external_source_observations_catholicculture_excerpts.length,132);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_catholicculture_excerpts.map(r=>r.id)),ccIds);
assert.equal(count.source_observations.catholicculture_trapp_berger_newland_excerpt_source_actions,132);
assert.equal(count.source_observations.total_source_detail_rows_including_external,1425);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Historical author excerpts: 132 observations on 29 URLs, 1,425 aggregate research rows, no identity/publishing promotion — PASS');


// The lexical relation pass is discovery-only. It must never silently merge
// a source observation or manufacture an independent evidence witness.
const ccLex=load('data/customs/master/132-excerpt-actions-cross-source-lexical-review.v1.json');
assert.equal(ccLex.schema,'AO_CUSTOMS_132_CATHOLICCULTURE_SOURCE_ACTION_LEXICAL_REVIEW_V1');
assert.equal(ccLex.records.length,132);
assert.equal(ccLex.summary.observations_routed,132);
assert.equal(ccLex.summary.with_lexical_candidate,61);
assert.equal(ccLex.summary.without_lexical_candidate,71);
assert.equal(ccLex.summary.lexical_suggestion_links,105);
assert.equal(ccLex.summary.automatic_merges,0);
assert.equal(ccLex.summary.verified_unique_customs,0);
assert.equal(ccLex.summary.app_publications,0);
assert.equal(ccLex.summary.manual_identity_reviews_completed,0);
assert.equal(ccLex.summary.source_independence_certified,0);
assert.deepEqual(new Set(ccLex.records.map(r=>r.source_id)),ccIds);
const pastTargets=new Set([...researchCatalogue.existing_master_identities,...researchCatalogue.provisional_handbook_groups,...researchCatalogue.provisional_historical_groups,...researchCatalogue.provisional_unindexed_practice_leads,...researchCatalogue.provisional_unassigned_action_leads,...researchCatalogue.external_source_observations_mcloughlin,...researchCatalogue.external_source_observations_stokes].map(r=>r.id));
for(const row of ccLex.records){
 assert.equal(row.manual_action_identity_decision,'UNREVIEWED');
 assert.equal(row.source_independence_decision,'UNREVIEWED');
 assert.equal(row.automatic_merges,0);
 assert.equal(row.app_publication,'NONE');
 for(const c of row.candidate_links){
   assert.ok(pastTargets.has(c.target_id));
   assert.equal(c.review_status,'LEXICAL_REVIEW_ONLY_NOT_EQUIVALENCE');
 }
}
console.log('132 excerpt-action lexical review rows, 105 low-confidence suggestions, 0 merges or claims of source independence — PASS');
