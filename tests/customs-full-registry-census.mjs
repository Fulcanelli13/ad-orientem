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
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
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


// Therese Mueller / George A. Kelly online full-text source action screening.
// We verify source non-loss and explicit non-promotion, NOT edition facsimile
// parity, ecclesiastical rite authority or independent practice identity.
const muellerKelly=load('data/customs/master/mueller-1955-kelly-1959-ewtn-action-intake.v1.json');
assert.equal(muellerKelly.records.length,204);
assert.equal(muellerKelly.summary.total_source_action_observations,204);
assert.equal(muellerKelly.summary.mueller,122);
assert.equal(muellerKelly.summary.kelly,82);
assert.equal(muellerKelly.summary.verified_new_customs,0);
assert.equal(muellerKelly.summary.publications,0);
const mkIds=new Set(muellerKelly.records.map(r=>r.observation_id));
assert.equal(mkIds.size,204);
assert.equal(muellerKelly.records.filter(r=>r.observation_id.startsWith('MUE55-EWTN-')).length,122);
assert.equal(muellerKelly.records.filter(r=>r.observation_id.startsWith('KEL59-EWTN-')).length,82);
for(const r of muellerKelly.records){
 const s=r.observation_id.startsWith('MUE55-')?'MUELLER':r.observation_id.startsWith('KEL59-')?'KELLY':null;
 assert.ok(s);
 assert.ok(r.action_label.length>=12);
 assert.ok(r.source_locator.html_line_start>=muellerKelly.source_evidence[s].range[0]);
 assert.ok(r.source_locator.html_line_end<=muellerKelly.source_evidence[s].range[1]);
 assert.equal(r.source_locator.url,muellerKelly.source_evidence[s].url);
 assert.equal(r.identity_status,'UNVERIFIED_ACTION_OR_VARIANT_NOT_COUNTED_DISTINCT');
 assert.equal(r.app_publication,'NONE');
}
assert.equal(researchCatalogue.external_source_observations_mueller_kelly.length,204);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_mueller_kelly.map(x=>x.id)),mkIds);
assert.equal(count.source_observations.mueller_kelly_ewtn_source_action_observations,204);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Mueller/Kelly EWTN text source actions: 204/204 non-loss, 1,629 aggregate rows, no publication or new canonical groups — PASS');


// Read-only cross-corpus lexical match leads for new Mueller / Kelly actions.
// These cannot be used as evidence of practice identity, source independence,
// ritual authority or release eligibility.
const mkReview=load('data/customs/master/mueller-kelly-204-cross-source-candidate-review.v1.json');
assert.equal(mkReview.schema,'AO_CUSTOMS_MUELLER_KELLY_204_CROSS_CORPUS_NONMERGING_CANDIDATE_WORKLIST_V1');
assert.equal(mkReview.records.length,204);
assert.deepEqual(new Set(mkReview.records.map(x=>x.source_id)),mkIds);
assert.equal(mkReview.summary.rows_with_candidate,138);
assert.equal(mkReview.summary.rows_without_candidate,66);
assert.equal(mkReview.summary.candidate_links,380);
assert.equal(mkReview.summary.independent_witnesses_certified,0);
assert.equal(mkReview.summary.equivalent_customs_certified,0);
assert.equal(mkReview.summary.automatic_merges,0);
assert.equal(mkReview.summary.published_customs,0);
const mkComparisonTargets=new Set([
...researchCatalogue.existing_master_identities,
...researchCatalogue.provisional_handbook_groups,
...researchCatalogue.provisional_historical_groups,
...researchCatalogue.provisional_unindexed_practice_leads,
...researchCatalogue.provisional_unassigned_action_leads,
...researchCatalogue.external_source_observations_mcloughlin,
...researchCatalogue.external_source_observations_stokes,
...researchCatalogue.external_source_observations_catholicculture_excerpts
].map(x=>x.id));
let candidates=0;
for(const r of mkReview.records){
 assert.equal(r.identity_decision,'UNDECIDED');
 assert.equal(r.source_dependency_decision,'UNDECIDED');
 assert.equal(r.ecclesiastical_authority_decision,'UNDECIDED');
 assert.equal(r.app_publication,'NONE');
 assert.ok(r.candidate_links.length<=5);
 for(const c of r.candidate_links){
  assert.ok(mkComparisonTargets.has(c.target_id),'Unknown lexical target '+c.target_id);
  assert.equal(c.relation,'TEXT_OVERLAP_LEAD_ONLY_IDENTITY_UNDECIDED');
  assert.ok(c.similarity_score>=0.31);
  assert.ok(c.shared_tokens.length>=2);
  candidates++;
 }
}
assert.equal(candidates,380);
for(const ex of mkReview.manual_review_priority_examples) assert.ok(mkIds.has(ex.source_id));
console.log('Mueller/Kelly: 204 safely routed to 380 lexical comparison leads, zero equivalences or independent witnesses claimed — PASS');


// Concurrent-research collision guard: second independent source-action pass
// of the SAME 1955 Mueller EWTN witness is preserved as annotated detail, NOT
// 100 new source witnesses or new customs.
const muellerSecond=load('data/customs/master/mueller-1955-our-childrens-year-of-grace-ewtn-first-pass.v1.json');
const muellerCross=load('data/customs/master/mueller-100-second-pass-to-122-nonadditive-source-crosswalk.v1.json');
assert.equal(muellerSecond.records.length,100);
assert.equal(muellerSecond.summary.observations,100);
assert.equal(muellerSecond.summary.distinct_custom_identities_certified,0);
assert.equal(muellerCross.records.length,100);
assert.equal(muellerCross.summary.primary_mueller_source_obs,122);
assert.equal(muellerCross.summary.secondary_mueller_detail_obs,100);
assert.equal(muellerCross.summary.exact_ewtn_line_co_located,95);
assert.equal(muellerCross.summary.without_exact_line,5);
assert.equal(muellerCross.summary.secondary_obs_added_to_catalogue_source_count,0);
assert.equal(muellerCross.summary.app_publications,0);
const secondaryIds=new Set(muellerSecond.records.map(r=>r.observation_id));
assert.equal(secondaryIds.size,100);
assert.deepEqual(new Set(muellerCross.records.map(r=>r.secondary_source_observation_id)),secondaryIds);
const priorMuellerIds=new Set(muellerKelly.records.filter(r=>r.observation_id.startsWith('MUE55-')).map(r=>r.observation_id));
assert.equal(priorMuellerIds.size,122);
const priorMuellerById=new Map(muellerKelly.records.filter(r=>priorMuellerIds.has(r.observation_id)).map(r=>[r.observation_id,r]));
const secondMuellerById=new Map(muellerSecond.records.map(r=>[r.observation_id,r]));
let coLocated=0;
for(const r of muellerCross.records){
 const detail=secondMuellerById.get(r.secondary_source_observation_id);
 assert.ok(detail);
 assert.equal(r.ewtn_line,detail.source_locator.html_line_start);
 assert.equal(r.add_to_1629_source_rows,false);
 assert.equal(r.separate_distinct_custom_verified,false);
 assert.equal(r.independent_second_author_corroboration,false);
 if(r.co_located_prior_mueller_source_ids.length)coLocated++;
 for(const id of r.co_located_prior_mueller_source_ids){
  const prior=priorMuellerById.get(id);
  assert.ok(prior);
  assert.equal(prior.source_locator.html_line_start,r.ewtn_line);
 }
}
assert.equal(coLocated,95);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.source_observations.mueller_second_pass_detail_rows_not_added_to_source_total,100);
assert.equal(count.source_review.mueller_secondary_exact_text_line_colocated,95);
assert.equal(count.source_review.mueller_secondary_without_exact_line_owner,5);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Mueller concurrent second-pass overlap: 100 preserved, 95 same-line, 5 unmatched; 1,629 unique source-detail indexing rows unchanged — PASS');

// Search-hint extraction over 198 Stokes source observations + 100 NONADDITIVE
// Mueller second-pass details, with ALL 298 routed explicitly. These are
// retrieval aids only, never source-level semantic identity decisions.
const stokesMuellerRouting=load('data/customs/master/stokes-mueller-298-source-routing-lexical-screen.v1.json');
assert.equal(stokesMuellerRouting.records.length,298);
assert.equal(stokesMuellerRouting.summary.input_stokes,198);
assert.equal(stokesMuellerRouting.summary.input_mueller,100);
assert.equal(stokesMuellerRouting.summary.candidate_pool_size,490);
assert.equal(stokesMuellerRouting.summary.rows_with_automated_lexical_hints,119);
assert.equal(stokesMuellerRouting.summary.rows_without_automated_hints,179);
assert.equal(stokesMuellerRouting.summary.individual_hints,208);
assert.equal(stokesMuellerRouting.summary.verified_identity_equivalences,0);
assert.equal(stokesMuellerRouting.summary.confirmed_independent_corroborations,0);
assert.equal(stokesMuellerRouting.summary.app_publications,0);
const allSourceIds=new Set([...stokesIds,...secondaryIds]);
assert.deepEqual(new Set(stokesMuellerRouting.records.map(r=>r.source_observation_id)),allSourceIds);
const candidateOwners=new Set([
 ...researchCatalogue.existing_master_identities,
 ...researchCatalogue.provisional_handbook_groups,
 ...researchCatalogue.provisional_historical_groups,
 ...researchCatalogue.provisional_unindexed_practice_leads,
 ...researchCatalogue.provisional_unassigned_action_leads,
 ...researchCatalogue.external_source_action_families_mcloughlin
].map(r=>r.id));
assert.equal(candidateOwners.size,490);
let hints=0;
for(const r of stokesMuellerRouting.records){
 assert.equal(r.identity_verification,'NOT_PERFORMED');
 assert.equal(r.corroboration_status,'NOT_EVALUATED_PRIMARY_WITNESS_VS_DERIVATIVE');
 assert.equal(r.normalized_unique_custom_owner,null);
 assert.equal(r.app_publication,false);
 assert.ok(r.candidate_lookup_hints.length<=3);
 for(const c of r.candidate_lookup_hints){
  assert.ok(candidateOwners.has(c.candidate_id));
  assert.equal(c.status,'RETRIEVAL_HINT_NOT_SEMANTICALLY_ADJUDICATED');
  assert.ok(c.shared.length>=2);
  hints++;
 }
}
assert.equal(hints,208);
assert.equal(count.source_review.stokes_mueller_source_rows_routed_lexically_noncanonical,298);
assert.equal(count.source_review.stokes_mueller_source_rows_with_label_retrieval_hints,119);
assert.equal(count.source_review.stokes_mueller_source_rows_without_label_retrieval_hints,179);
console.log('Stokes 198 + Mueller 100 second-pass source observations: 298/298 nonmerging label routes, 119 with hints, no source duplication or app publication — PASS');


// Elsa Chaney, Grailville Writing Center, 1955: 170 individually located
// action/variant source observations. These are NOT 170 distinct customs, and
// text overlap with Stokes/Mueller/Weiser/others is not independent corroboration.
const chaney55=load('data/customs/master/chaney-1955-twelve-days-christmas-ewtn-source-intake.v1.json');
const chaneyCross=load('data/customs/master/chaney-1955-170-cross-source-nonmerging-candidate-review.v1.json');
assert.equal(chaney55.records.length,170);
assert.equal(chaney55.summary.observations,170);
assert.equal(chaney55.source.original_publication_year,1955);
assert.equal(chaney55.source.imprimatur_date,'1955-05-25');
assert.equal(chaney55.source.original_printed_pages_verified,false);
assert.equal(chaney55.summary.certified_independent_corroborations,0);
assert.equal(chaney55.summary.verified_distinct_new_customs,0);
assert.equal(chaney55.summary.app_publications,0);
assert.deepEqual(chaney55.summary.claims,{
 AUTHOR_SUGGESTION_OR_ADAPTATION:90,
 REPORTED_PRACTICE_NOT_INDEPENDENTLY_VERIFIED:52,
 HOME_PRAYER_LITURGICAL_TEXT_ADAPTATION_NO_RITE_AUTHORIZATION_CLAIM:7,
 HISTORICAL_OR_COMPARATIVE_CLAIM_NOT_VERIFIED:6,
 EXPLICITLY_ATTRIBUTED_OTHER_AUTHOR:1,
 POSSIBLE_ECCLESIASTICAL_RITUAL_AUTHORITY_NOT_VERIFIED:9,
 GRAILVILLE_AUTHOR_FIRST_PERSON:5
});
const chaneyIds=new Set(chaney55.records.map(x=>x.observation_id));
assert.equal(chaneyIds.size,170);
const chaneySections=new Set();
for(const [i,r] of chaney55.records.entries()){
 assert.equal(r.observation_id,'CHANEY55-EWTN-'+String(i+1).padStart(3,'0'));
 assert.equal(r.source_locator.url,chaney55.source.url);
 assert.ok(r.action_label && r.action_label.length>16);
 assert.ok(r.source_locator.html_line_start>=150 && r.source_locator.html_line_end<=897);
 assert.ok(r.source_locator.html_line_end>=r.source_locator.html_line_start);
 assert.equal(r.source_independence_status,'DIFFERENT_BOOK_AND_AUTHOR_NOT_INDEPENDENT_CORROBORATION_CERTIFIED');
 assert.equal(r.identity_status,'SOURCE_OBSERVATION_UNVERIFIED_DISTINCTNESS_OR_VARIANT');
 assert.equal(r.ritual_authority,'NOT_CHECKED_AGAINST_APPLICABLE_1962_ROMAN_RITUAL');
 assert.equal(r.app_publication,'NONE');
 chaneySections.add(r.source_section);
}
assert.ok(chaneySections.size>=9);
assert.equal(researchCatalogue.external_source_observations_chaney.length,170);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_chaney.map(r=>r.id)),chaneyIds);
assert.equal(count.source_observations.chaney_1955_online_source_observations,170);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.source_observations.mueller_second_pass_detail_rows_not_added_to_source_total,100);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
for(const r of researchCatalogue.external_source_observations_chaney){
 const orig=chaney55.records.find(x=>x.observation_id===r.id);
 assert.ok(orig);
 assert.equal(r.label,orig.action_label);
 assert.deepEqual(r.web_lines,[orig.source_locator.html_line_start,orig.source_locator.html_line_end]);
 assert.equal(r.identity_certified,false);
}
assert.equal(chaneyCross.records.length,170);
assert.deepEqual(new Set(chaneyCross.records.map(r=>r.source_id)),chaneyIds);
assert.equal(chaneyCross.summary.prior_group_pool,490);
assert.equal(chaneyCross.summary.prior_other_author_source_pool,604);
assert.equal(chaneyCross.summary.records_with_group_hints,50);
assert.equal(chaneyCross.summary.records_with_other_author_hints,103);
assert.equal(chaneyCross.summary.total_hints,380);
assert.equal(chaneyCross.summary.rows_without_any_lexical_hints,65);
assert.equal(chaneyCross.summary.certified_equivalences,0);
assert.equal(chaneyCross.summary.certified_distinct_new_customs,0);
assert.equal(chaneyCross.summary.app_publications,0);
const chaneyOwnerTargets=new Set([
 ...researchCatalogue.existing_master_identities,
 ...researchCatalogue.provisional_handbook_groups,
 ...researchCatalogue.provisional_historical_groups,
 ...researchCatalogue.provisional_unindexed_practice_leads,
 ...researchCatalogue.provisional_unassigned_action_leads,
 ...researchCatalogue.external_source_action_families_mcloughlin
].map(x=>x.id));
const chaneySourceTargets=new Set([
 ...researchCatalogue.external_source_observations_mcloughlin,
 ...researchCatalogue.external_source_observations_stokes,
 ...researchCatalogue.external_source_observations_catholicculture_excerpts,
 ...researchCatalogue.external_source_observations_mueller_kelly
].map(x=>x.id));
assert.equal(chaneyOwnerTargets.size,490);
assert.equal(chaneySourceTargets.size,604);
let hintCount=0;
for(const r of chaneyCross.records){
 assert.equal(r.review_state,'RETRIEVAL_HINTS_NOT_MANUAL_SEMANTIC_RECONCILIATION');
 assert.equal(r.independent_witness_certified,false);
 assert.equal(r.distinct_custom_certified,false);
 assert.equal(r.automatic_merge,false);
 assert.equal(r.publication_state,'RESEARCH_ONLY');
 for(const x of r.prior_group_lookup){
  assert.ok(chaneyOwnerTargets.has(x.target_id));
  assert.equal(x.relationship,'LEXICAL_DISCOVERY_ONLY_NO_ACTION_EQUIVALENCE');
  hintCount++;
 }
 for(const x of r.other_author_observation_lookup){
  assert.ok(chaneySourceTargets.has(x.target_id));
  assert.equal(x.relationship,'LEXICAL_DISCOVERY_ONLY_NO_ACTION_EQUIVALENCE');
  hintCount++;
 }
}
assert.equal(hintCount,380);
console.log('Chaney 1955: 170/170 source actions, 380 search-only cross-source hints, 1,799 research rows, 408 unchanged provisional groups, zero publications — PASS');


// Action-label relation reviews are review evidence, NOT verified historic
// source independence or canonical identity. Prevent inadvertent promotion.
const chaneyManual24=load('data/customs/master/chaney-1955-action-description-24-manual-relations.v1.json');
assert.equal(chaneyManual24.records.length,24);
assert.equal(chaneyManual24.summary.pairs_reviewed,24);
assert.equal(chaneyManual24.summary.SAME_REPORTED_ACTION_CORE,12);
assert.equal(chaneyManual24.summary.SPECIFIC_COMPONENT_OF_RELATED_PRACTICE,2);
assert.equal(chaneyManual24.summary.RITUAL_PREPARATION_FOR_RELATED_ACTION,1);
assert.equal(chaneyManual24.summary.SAME_PROPOSED_ACTION_RITUAL_AUTHORITY_UNCERTAIN,1);
assert.equal(chaneyManual24.summary.DISTINCT_ACTION_FALSE_LEXICAL_MATCH,6);
assert.equal(chaneyManual24.summary.RELATED_DIFFERENT_PRIMARY_ACTION,2);
assert.equal(chaneyManual24.summary.verified_distinct_customs,0);
assert.equal(chaneyManual24.summary.final_mergers,0);
assert.equal(chaneyManual24.summary.independent_corrob_confirmed,0);
assert.equal(chaneyManual24.summary.app_publications,0);
assert.equal(new Set(chaneyManual24.records.map(r=>r.review_id)).size,24);
assert.equal(count.source_review.chaney_1955_manually_reviewed_label_level_relationship_pairs,24);
assert.equal(count.source_review.chaney_1955_action_core_label_matches,12);
assert.equal(count.source_review.chaney_1955_false_lexical_matches_rejected,6);
const allPriorOwners=new Set([...chaneyOwnerTargets,...chaneySourceTargets]);
let falseCandidates=0;
for(const row of chaneyManual24.records) {
 assert.ok(chaneyIds.has(row.source_id));
 assert.ok(allPriorOwners.has(row.compared_prior_id));
 assert.ok(chaney55.records.some(r=>r.observation_id===row.source_id && r.source_locator.html_line_start===row.source_ewtn_line));
 assert.equal(row.exact_historical_practice_identity_certified,false);
 assert.equal(row.independence_of_historical_witnesses_certified,false);
 assert.equal(row.ritual_approval_certified,false);
 assert.equal(row.regional_scope_equality_certified,false);
 assert.equal(row.automatic_merge,false);
 assert.equal(row.app_publication,false);
 assert.ok(row.reason.length>=35);
 if(row.action_description_relationship==='DISTINCT_ACTION_FALSE_LEXICAL_MATCH')falseCandidates++;
}
assert.equal(falseCandidates,6);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Chaney 24 source-description comparisons: 12 same action core, 6 false lexical matches, 0 verified source-independent identities, 0 merges — PASS');


// Curated top-105 Mueller/Kelly label comparisons are reversible triage only.
const mkLabel105=load('data/customs/master/mueller-kelly-top105-curated-label-level-triage.v1.json');
assert.equal(mkLabel105.records.length,105);
assert.equal(mkLabel105.summary.triaged_pairs,105);
assert.equal(mkLabel105.summary.CLOSE_ACTION_RELATION_PROVENANCE_UNDECIDED,46);
assert.equal(mkLabel105.summary.RELATED_COMPONENT_OR_VARIANT_NOT_IDENTICAL,38);
assert.equal(mkLabel105.summary.DIFFERENT_ACTION_OR_FEAST_LABEL_MATCH_ONLY,21);
assert.equal(mkLabel105.summary.primary_text_identity_verifications,0);
assert.equal(mkLabel105.summary.certified_source_independences,0);
assert.equal(mkLabel105.summary.merged_groups,0);
for (const r of mkLabel105.records) {
 assert.ok(mkIds.has(r.source_id));
 assert.ok(mkComparisonTargets.has(r.target_id));
 assert.equal(r.automatic_merge,false);
 assert.equal(r.canonical_identity_decision,'NONE');
 assert.equal(r.primary_source_comparison,'NOT_DONE');
 assert.equal(r.app_publication,'NONE');
}

// Regional French intangible-heritage evidence: many action descriptions
// nested inside TWO ceremonial complexes; none means a new custom identity.
const frBreton=load('data/customs/master/france-2020-breton-pardons-pci-regional-detail-pass.v1.json');
const frBasque=load('data/customs/master/france-2018-basque-besta-berri-pci-detail-pass.v1.json');
assert.equal(frBreton.records.length,71);
assert.equal(frBasque.records.length,56);
assert.equal(frBreton.summary.new_unique_customs_certified,0);
assert.equal(frBasque.summary.distinct_custom_identities_certified,0);
assert.equal(frBreton.summary.source_documents,1);
assert.equal(frBasque.summary.source_documents,1);
assert.equal(researchCatalogue.external_source_observations_france_pci_brittany.length,71);
assert.equal(researchCatalogue.external_source_observations_france_pci_besta.length,56);
const bretonIds=new Set(frBreton.records.map(r=>r.observation_id));
const basqueIds=new Set(frBasque.records.map(r=>r.observation_id));
assert.equal(bretonIds.size,71);
assert.equal(basqueIds.size,56);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_france_pci_brittany.map(r=>r.id)),bretonIds);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_france_pci_besta.map(r=>r.id)),basqueIds);
for(const [source,expected] of [[frBreton,71],[frBasque,56]]){
 assert.equal(source.records.length,expected);
 for(const r of source.records){
  assert.ok(r.action_label.length>15);
  assert.ok(r.source_url.startsWith('https://www.pci-lab.fr/'));
  assert.ok(Number.isInteger(r.source_line||r.source_web_line));
  assert.equal(r.publication_state,'RESEARCH_ONLY');
  assert.ok((r.parent_practice_family||'').length>5);
 }
}
assert.equal(count.source_observations.france_pci_breton_pardon_source_detail_rows,71);
assert.equal(count.source_observations.france_pci_basque_besta_berri_source_detail_rows,56);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('French PCI regional: 71 Breton + 56 Basque source action/variant details, 1926 combined source/detail rows, zero new identities or app publications — PASS');


// Domestic Lent–Easter family source intake: the 1992 editor's EWTN
// excerpt and seven Hynes 1977 reprinted CatholicCulture pages. The 125
// independently labelled source actions are neither historical custom
// identities nor approval of liturgical or family blessing formulas.
const lentEaster125=load('data/customs/master/lent-easter-wff92-hynes77-source-action-intake.v1.json');
const lentEasterLookup=load('data/customs/master/lent-easter-125-source-candidate-lookup.v1.json');
assert.equal(lentEaster125.records.length,125);
assert.equal(lentEaster125.summary.wff_source_actions,68);
assert.equal(lentEaster125.summary.hynes_source_actions,57);
assert.equal(lentEaster125.summary.total_source_action_observations,125);
assert.equal(lentEaster125.summary.unique_community_customs_certified,0);
assert.equal(lentEaster125.summary.independent_corroborations_certified,0);
assert.equal(lentEaster125.summary.app_publications,0);
assert.deepEqual(lentEaster125.summary.claim_types,{
 AUTHOR_SUGGESTION_OR_FAMILY_ADAPTATION:101,
 HISTORICAL_OR_ORIGIN_REPORT_UNVERIFIED:9,
 REPORTED_PRACTICE_NOT_INDEPENDENTLY_VERIFIED:10,
 PUBLIC_LITURGICAL_CEREMONY_CONTEXT_NOT_FAMILY_CUSTOM:3,
 FAMILY_PRAYER_FORMULA_AUTHORITY_UNVERIFIED:2
});
const leIds=new Set(lentEaster125.records.map(x=>x.observation_id));
assert.equal(leIds.size,125);
const wffRows=lentEaster125.records.filter(x=>x.observation_id.startsWith('WFF92-EWTN-'));
const hRows=lentEaster125.records.filter(x=>x.observation_id.startsWith('HYN77-CC-'));
assert.equal(wffRows.length,68);
assert.equal(hRows.length,57);
for(const [i,r] of wffRows.entries()){
 assert.equal(r.observation_id,'WFF92-EWTN-'+String(i+1).padStart(3,'0'));
 assert.equal(r.locator.online_url,'https://www.ewtn.com/catholicism/library/lent--easter-a-sourcebook-for-families-10456');
 assert.ok(r.locator.web_line_start>=150&&r.locator.web_line_start<=374);
}
const hPages=new Set();
for(const [i,r] of hRows.entries()){
 assert.equal(r.observation_id,'HYN77-CC-'+String(i+1).padStart(3,'0'));
 assert.ok(r.locator.web_line_start>=125&&r.locator.web_line_start<=148);
 assert.equal(r.locator.online_url,'https://www.catholicculture.org/culture/liturgicalyear/activities/view.cfm?id='+r.locator.excerpt_activity_id);
 hPages.add(r.locator.excerpt_activity_id);
}
assert.deepEqual(hPages,new Set([114,511,512,513,514,515,516]));
for(const r of lentEaster125.records){
 assert.ok(r.action_label && r.action_label.length>16);
 assert.equal(r.locator.printed_page,'NOT_VERIFIED');
 assert.equal(r.historical_authority,'NOT_INFERRED');
 assert.equal(r.current_1962_rite_compatibility,'NOT_ASSESSED');
 assert.equal(r.canonical_custom_owner,null);
 assert.equal(r.app_publication,'NONE');
}
assert.equal(researchCatalogue.external_source_observations_wff_hynes.length,125);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_wff_hynes.map(r=>r.id)),leIds);
assert.equal(count.source_observations.wff1992_lent_easter_excerpt_actions,68);
assert.equal(count.source_observations.hynes1977_lent_holy_week_excerpt_actions,57);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
assert.equal(lentEasterLookup.rows.length,125);
assert.deepEqual(new Set(lentEasterLookup.rows.map(x=>x.source_id)),leIds);
assert.equal(lentEasterLookup.summary.owner_candidates_total,490);
assert.equal(lentEasterLookup.summary.prior_source_observation_candidates_total,901);
assert.equal(lentEasterLookup.summary.rows_with_owner_hints,50);
assert.equal(lentEasterLookup.summary.rows_with_source_hints,84);
assert.equal(lentEasterLookup.summary.rows_without_either,34);
assert.equal(lentEasterLookup.summary.hint_links,372);
assert.equal(lentEasterLookup.summary.certified_independent_witnesses,0);
assert.equal(lentEasterLookup.summary.automated_merges,0);
let leHints=0;
const historicalTargets=new Set([
 ...researchCatalogue.existing_master_identities,
 ...researchCatalogue.provisional_handbook_groups,
 ...researchCatalogue.provisional_historical_groups,
 ...researchCatalogue.provisional_unindexed_practice_leads,
 ...researchCatalogue.provisional_unassigned_action_leads,
 ...researchCatalogue.external_source_action_families_mcloughlin,
 ...researchCatalogue.external_source_observations_mcloughlin,
 ...researchCatalogue.external_source_observations_stokes,
 ...researchCatalogue.external_source_observations_catholicculture_excerpts,
 ...researchCatalogue.external_source_observations_mueller_kelly,
 ...researchCatalogue.external_source_observations_chaney,
 ...researchCatalogue.external_source_observations_france_pci_brittany,
 ...researchCatalogue.external_source_observations_france_pci_besta
].map(r=>r.id));
assert.equal(historicalTargets.size,1391);
for(const r of lentEasterLookup.rows){
 assert.equal(r.manual_identity_decision,'UNREVIEWED');
 assert.equal(r.source_independence,'UNREVIEWED');
 assert.equal(r.canonical_owner,null);
 assert.equal(r.app_publication,false);
 for(const c of [...r.owner_hints,...r.prior_source_hints]){
  assert.ok(historicalTargets.has(c.target_id));
  assert.equal(c.status,'LEXICAL_HINT_ONLY_NO_EQUIVALENCE_OR_INDEPENDENT_WITNESS');
  leHints++;
 }
}
assert.equal(leHints,372);
console.log('Lent/Easter 125 sourced actions from 1992 and 1977 excerpts: complete 125/125, 372 search-only hints, 2,051 working rows, 0 verified custom identities and 0 publication — PASS');


// Dedicated French regional primary-document lane: La Sanch ministerial inventory.
// Historical variants, material aspects and processional details are NOT new
// distinct customs; the 2023 inventory is one secondary archival witness.
const frSanch23=load('data/customs/master/france-2023-la-sanch-ministry-inventory-source-actions.v1.json');
assert.equal(frSanch23.records.length,86);
assert.equal(frSanch23.summary.source_action_and_historical_variant_details,86);
assert.equal(frSanch23.summary.direct_source_document_count,1);
assert.equal(frSanch23.summary.regional_complexes,1);
assert.equal(frSanch23.summary.verified_new_distinct_customs,0);
assert.equal(frSanch23.summary.new_provisional_custom_ids,0);
assert.equal(frSanch23.summary.app_publications,0);
assert.equal(frSanch23.source.pdf_pages,36);
assert.equal(researchCatalogue.external_source_observations_france_sanch.length,86);
const frSanchIds=new Set(frSanch23.records.map(r=>r.observation_id));
assert.equal(frSanchIds.size,86);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_france_sanch.map(r=>r.id)),frSanchIds);
const frSanchKinds={};
for(const [i,r] of frSanch23.records.entries()){
 assert.equal(r.observation_id,'FRSAN23-'+String(i+1).padStart(3,'0'));
 assert.ok(r.label.length>=18);
 assert.ok(r.source_locator.pdf_page>=1&&r.source_locator.pdf_page<=36);
 assert.ok(Number.isInteger(r.source_locator.web_extracted_line));
 assert.ok(r.source_locator.web_extracted_line>=0&&r.source_locator.web_extracted_line<=1373);
 assert.equal(r.source_locator.pdf_url,frSanch23.source.url);
 assert.equal(r.parent_complex,'LA_SANCH_ROUSSILLON_HOLY_WEEK_CONFRATERNITY_PROCESSIONS');
 assert.equal(r.app_publication,'NONE');
 assert.equal(r.identity_status,'ONE_COMPONENT_OR_REGIONAL_VARIANT_NOT_CERTIFIED_DISTINCT');
 frSanchKinds[r.kind]=(frSanchKinds[r.kind]||0)+1;
}
assert.deepEqual(frSanchKinds,frSanch23.summary.kinds);
assert.equal(count.source_observations.france_sanch_2023_source_detail_rows,86);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('France La Sanch source PDF: 86 page/line-located details, 2137 aggregate source-detail rows, zero identity merges or app publication — PASS');


// Italian UNESCO network comprises FOUR localized festival complexes, not
// 110 newly discovered distinct or ecclesiastically approved Catholic customs.
// Local foundation, municipal, practitioner and secondary research anchors
// preserve page-specific actions, period scope and provenance.
const itProcessions4=load('data/customs/master/italy-four-unesco-processional-complexes-local-detail-pass.v1.json');
assert.equal(itProcessions4.records.length,110);
assert.equal(itProcessions4.summary.observations,110);
assert.deepEqual(itProcessions4.summary.by_region,{N:30,S:41,P:18,V:21});
assert.equal(itProcessions4.summary.regional_complexes,4);
assert.equal(itProcessions4.summary.independent_festival_complexes_on_UNESCO_list,4);
assert.equal(itProcessions4.summary.distinct_new_catholic_custom_identities_certified,0);
assert.equal(itProcessions4.summary.independent_archival_witnesses_verified,0);
assert.equal(itProcessions4.summary.app_publications,0);
assert.ok(itProcessions4.unesco_reference.includes('unesco.cultura.gov.it'));
const itIds=new Set(itProcessions4.records.map(r=>r.observation_id));
assert.equal(itIds.size,110);
const regionMap={
 N:'NOLA_SAN_PAOLINO_GIGLI',
 S:'SASSARI_ASSUMPTION_CANDELIERI',
 P:'PALMI_MARIAN_SACRED_LETTER_VARIA',
 V:'VITERBO_SANTA_ROSA_MACCHINA'
};
const regionCounters={N:0,S:0,P:0,V:0};
const sourceUrls=new Set(itProcessions4.sources.map(s=>s.url));
assert.equal(sourceUrls.size,8);
for(const r of itProcessions4.records){
 const reg=r.observation_id.split('-')[2];
 assert.ok(regionMap[reg]);
 regionCounters[reg]++;
 assert.equal(r.observation_id,'IT-BSSP26-'+reg+'-'+String(regionCounters[reg]).padStart(3,'0'));
 assert.equal(r.regional_complex_id,regionMap[reg]);
 assert.ok(r.label.length>=22);
 assert.ok(r.detail_type.length>=4);
 assert.ok(sourceUrls.has(r.source_locator.url),'unknown source URL');
 assert.ok(Number.isInteger(r.source_locator.web_text_line)&&r.source_locator.web_text_line>=1);
 assert.equal(r.source_locator.source_edition,'ONLINE_CULTURAL_OR_FESTIVAL_DESCRIPTION_EXACT_PAGE_NOT_HISTORICAL_PRIMARY_ARCHIVE');
 assert.equal(r.independent_witness_class,'THIS_IS_ONE_COMPONENT_OF_REGIONAL_FESTIVAL_COMPLEX_NOT_INDEPENDENT_CUSTOM_OR_ATTESTATION');
 assert.equal(r.roman_1962_ritual_authority,'NOT_VERIFIED');
 assert.equal(r.final_custom_identity_certified,false);
 assert.equal(r.calendar_published,false);
 if(r.source_locator.url.includes('/programma/'))assert.equal(r.period_scope,'EXPLICIT_2026_PROGRAMME');
 if(r.source_locator.url.includes('palmiviva.it'))assert.equal(r.period_scope,'SPECIFIC_2023_TOURIST_EVENT');
}
assert.deepEqual(regionCounters,{N:30,S:41,P:18,V:21});
assert.equal(researchCatalogue.external_source_observations_italy_four_unesco.length,110);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_italy_four_unesco.map(r=>r.id)),itIds);
const itById=new Map(itProcessions4.records.map(r=>[r.observation_id,r]));
for(const r of researchCatalogue.external_source_observations_italy_four_unesco){
 const original=itById.get(r.id);
 assert.ok(original);
 assert.equal(r.label,original.label);
 assert.equal(r.regional_complex_id,original.regional_complex_id);
 assert.equal(r.source_url,original.source_locator.url);
 assert.equal(r.web_line,original.source_locator.web_text_line);
 assert.equal(r.identity_certified,false);
}
assert.equal(count.source_observations.italy_four_unesco_festival_source_details,110);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.source_review.italy_2013_unesco_processional_festival_complexes,4);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Italian UNESCO four festival complexes: 110/110 local sourced components, 2,247 research rows, 408 provisional groups retained, zero new customs or app publication — PASS');


// Regional Italy lane independent of the four previously indexed UNESCO festivals.
// 96 source-located subactions belong to THREE Sicilian Holy Week complexes.
const sicilyHolyWeek26=load('data/customs/master/italy-sicily-enna-trapani-caltanissetta-holyweek-source-actions.v1.json');
assert.equal(sicilyHolyWeek26.records.length,96);
assert.equal(sicilyHolyWeek26.summary.source_detail_rows,96);
assert.equal(sicilyHolyWeek26.summary.source_pages,12);
assert.deepEqual(sicilyHolyWeek26.summary.by_locality,{ENN:48,TP:20,CL:28});
assert.equal(sicilyHolyWeek26.summary.regional_holy_week_complexes,3);
assert.equal(sicilyHolyWeek26.summary.unique_distinct_customs_certified,0);
assert.equal(sicilyHolyWeek26.summary.new_provisional_group_ids,0);
assert.equal(sicilyHolyWeek26.summary.app_publications,0);
assert.equal(researchCatalogue.external_source_observations_italy_sicily_holy_week.length,96);
assert.equal(count.source_observations.italy_sicily_three_cities_holy_week_source_details,96);
const itsiIds=new Set(sicilyHolyWeek26.records.map(r=>r.id));
assert.equal(itsiIds.size,96);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_italy_sicily_holy_week.map(r=>r.id)),itsiIds);
for(const r of sicilyHolyWeek26.records){
 assert.ok(r.action_or_detail_label.length>20);
 assert.ok(sicilyHolyWeek26.source_index[r.source_id]);
 assert.equal(r.source_locator.url,sicilyHolyWeek26.source_index[r.source_id].url);
 assert.ok(Number.isInteger(r.source_locator.html_line)&&r.source_locator.html_line>=0);
 assert.equal(r.identity_status,'REGIONAL_ACTION_OR_VARIANT_NOT_VERIFIED_DISTINCT');
 assert.equal(r.app_publication,'NONE');
 assert.equal(r.ritual_1962_status,'NOT_CHECKED');
}
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Sicilian Holy Week: 48 Enna + 20 Trapani + 28 Caltanissetta = 96 indexed action/details; 2343 nonunique source rows; 0 custom promotions — PASS');


// Irish Schools' Collection: the Dúchas full-story pages were protected by a
// website security gate in this source pass. Only web-index-excerpt discovery
// leads are supported. These 157 rows must NOT be added to 2,343 master rows.
const irishCbesIndexedLeads=load('data/customs/master/irish-cbes-1930s-easter-brigid-john-may-indexed-excerpt-leads.v1.json');
const irishCbesMotifs=load('data/customs/master/irish-cbes-157-indexed-folklore-motif-screen.v1.json');
assert.equal(irishCbesIndexedLeads.sources.length,36);
assert.equal(irishCbesIndexedLeads.records.length,157);
assert.equal(irishCbesIndexedLeads.summary.unique_indexed_folio_references,36);
assert.equal(irishCbesIndexedLeads.summary.indexed_folklore_action_or_belief_leads,157);
assert.equal(irishCbesIndexedLeads.summary.direct_manuscript_pages_visually_verified,0);
assert.equal(irishCbesIndexedLeads.summary.folklore_leads_promoted_to_source_detail_master,0);
assert.equal(irishCbesIndexedLeads.summary.distinct_customs_certified,0);
assert.equal(irishCbesIndexedLeads.summary.app_publications,0);
assert.deepEqual(irishCbesIndexedLeads.summary.by_claim_type,{
 REPORTED_HOUSEHOLD_OR_COMMUNAL_PRACTICE:108,
 FOLK_BELIEF_OR_MAGIC_QUARANTINED_NOT_RECOMMENDED:34,
 REPORTED_BLESSING_OR_DEVOTIONAL_CONTEXT_RITUAL_APPROVAL_UNCHECKED:10,
 SECONDARY_HISTORICAL_EXPLANATION_OR_CESSATION_CLAIM:5
});
const irSourceKeys=new Set(irishCbesIndexedLeads.sources.map(s=>s.source_key));
assert.equal(irSourceKeys.size,36);
for(const s of irishCbesIndexedLeads.sources){
 assert.match(s.indexed_url,/^https:\/\/www\.duchas\.ie\//);
 assert.equal(s.original_manuscript_facsimile_inspected,false);
 assert.equal(s.locality_verified,false);
 assert.equal(s.access_verification,'DIRECT_OPEN_PRODUCED_SECURITY_CHALLENGE_SOURCE_MATERIAL_FROM_WEB_SEARCH_INDEX');
 assert.ok(s.volume && s.page);
}
const irLeadIds=new Set(irishCbesIndexedLeads.records.map(r=>r.observation_id));
assert.equal(irLeadIds.size,157);
for(const [i,r] of irishCbesIndexedLeads.records.entries()){
 assert.equal(r.observation_id,'IR-CBES-IDX-'+String(i+1).padStart(3,'0'));
 assert.ok(irSourceKeys.has(r.source_key));
 assert.equal(r.source_access_level,'INDEXED_DUCHAS_TRANSCRIPT_EXCERPT_NOT_OPENED_MANUSCRIPT');
 assert.equal(r.not_canonical_custom_identity,true);
 assert.equal(r.source_independence_unverified,true);
 assert.equal(r.no_ritual_authority_claim,true);
 assert.equal(r.app_publication,'NONE');
}
assert.equal(irishCbesMotifs.records.length,157);
assert.deepEqual(new Set(irishCbesMotifs.records.map(r=>r.source_observation_id)),irLeadIds);
assert.equal(irishCbesMotifs.summary.source_rows_screened,157);
assert.equal(irishCbesMotifs.summary.folio_references,36);
assert.equal(irishCbesMotifs.summary.controlled_motif_classes,31);
assert.equal(irishCbesMotifs.summary.rows_with_controlled_motif_hints,143);
assert.equal(irishCbesMotifs.summary.rows_without_controlled_motif_hints,14);
assert.equal(irishCbesMotifs.summary.certified_distinct_new_customs,0);
assert.equal(irishCbesMotifs.summary.full_folio_verifications,0);
assert.equal(irishCbesMotifs.summary.app_publications,0);
const irThemes={};
for(const r of irishCbesMotifs.records){
 const detail=irishCbesIndexedLeads.records.find(x=>x.observation_id===r.source_observation_id);
 assert.ok(detail);
 assert.equal(r.source_folio_key,detail.source_key);
 assert.equal(r.claim_type,detail.claim_type);
 assert.equal(r.full_page_compared,false);
 assert.equal(r.informant_independence_checked,false);
 assert.equal(r.ecclesiastical_approval_checked,false);
 assert.equal(r.automatic_custom_merge,false);
 assert.equal(r.published,false);
 irThemes[r.theme]=(irThemes[r.theme]||0)+1;
}
assert.deepEqual(irThemes,{EASTER:55,BRIGID:63,JOHN:18,MAY:17,PATTERN:4});
assert.equal(count.source_discovery_leads.irish_cbes_1937_1939_folio_references_index_only,36);
assert.equal(count.source_discovery_leads.irish_cbes_indexed_action_belief_leads_queued_nonadditive,157);
assert.equal(count.source_discovery_leads.irish_cbes_full_manuscript_pages_verified,0);
assert.equal(count.source_discovery_leads.irish_cbes_promoted_to_source_detail_count,0);
assert.equal(count.source_discovery_leads.irish_cbes_folk_belief_magic_leads_quarantined,34);
assert.equal(count.source_observations.total_source_detail_rows_including_external,2343);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Irish indexed Dúchas folklore queue: 36 CBÉS folio references, 157 discovery descriptions, 143 motif-tagged, 34 folk claims quarantined, 0 verified folios and 0 additions to 2,343 source rows — PASS');
