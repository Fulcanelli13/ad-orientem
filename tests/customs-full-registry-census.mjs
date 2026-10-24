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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
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
 assert.equal(r.automatic_custom_merge ?? false,false); // Legacy motif records omit the field; neither case permits automatic merging
 assert.equal(r.published,false);
 irThemes[r.theme]=(irThemes[r.theme]||0)+1;
}
assert.deepEqual(irThemes,{EASTER:55,BRIGID:63,JOHN:18,MAY:17,PATTERN:4});
assert.equal(count.source_discovery_leads.irish_cbes_1937_1939_folio_references_index_only,36);
assert.equal(count.source_discovery_leads.irish_cbes_indexed_action_belief_leads_queued_nonadditive,157);
assert.equal(count.source_discovery_leads.irish_cbes_full_manuscript_pages_verified,0);
assert.equal(count.source_discovery_leads.irish_cbes_promoted_to_source_detail_count,0);
assert.equal(count.source_discovery_leads.irish_cbes_folk_belief_magic_leads_quarantined,34);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Irish indexed Dúchas folklore queue: 36 CBÉS folio references, 157 discovery descriptions, 143 motif-tagged, 34 folk claims quarantined, 0 verified folios and 0 additions to 2,343 source rows — PASS');


// Nonoverlapping Italian regional festival source expansion: Cocullo, Gubbio,
// multiple Sicilian saint-day bread/alms forms. 114 details are NOT 114 custom
// identities or independent historical witnesses.
const itLocalFeastsWave02=load('data/customs/master/italy-abruzzo-umbria-sicily-regional-feast-actions-wave02.v1.json');
assert.equal(itLocalFeastsWave02.records.length,114);
assert.equal(itLocalFeastsWave02.summary.source_action_and_detail_rows,114);
assert.equal(itLocalFeastsWave02.summary.source_pages,9);
assert.deepEqual(itLocalFeastsWave02.summary.by_region,{Abruzzo:21,Umbria:21,Sicily:72});
assert.equal(itLocalFeastsWave02.summary.unique_custom_identities_certified,0);
assert.equal(itLocalFeastsWave02.summary.source_independence_confirmed,0);
assert.equal(itLocalFeastsWave02.summary.ritual_approvals_verified,0);
assert.equal(itLocalFeastsWave02.summary.app_publications,0);
assert.equal(itLocalFeastsWave02.summary.prior_group_total_unchanged,408);
const itLocalFeastsIds=new Set(itLocalFeastsWave02.records.map(r=>r.id));
assert.equal(itLocalFeastsIds.size,114);
assert.equal(researchCatalogue.external_source_observations_italy_local_feasts_wave02.length,114);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_italy_local_feasts_wave02.map(r=>r.id)),itLocalFeastsIds);
const localTypeCount={};
for(let i=0;i<itLocalFeastsWave02.records.length;i++){
 const r=itLocalFeastsWave02.records[i];
 const s=itLocalFeastsWave02.source_index[r.source_key];
 assert.ok(s,'Unknown source key '+r.source_key);
 assert.equal(r.id,'ITREG26-'+String(i+1).padStart(3,'0'));
 assert.equal(r.evidence.url,s.url);
 assert.ok(Number.isInteger(r.evidence.web_display_line)&&r.evidence.web_display_line>=1&&r.evidence.web_display_line<=s.max);
 assert.ok(r.locality.length>=10&&r.label.length>=15&&r.occasion);
 assert.equal(r.practice_identity,'SOURCE_DETAIL_OR_POSSIBLE_VARIANT_NOT_VERIFIED_DISTINCT');
 assert.equal(r.app_publication,'NONE');
 assert.equal(r.authority_status,'SOURCE_IS_NOT_1962_ROMAN_RITUAL_APPROVAL');
 localTypeCount[r.classification]=(localTypeCount[r.classification]||0)+1;
}
assert.deepEqual(localTypeCount,itLocalFeastsWave02.summary.by_class);
assert.equal(count.source_observations.italy_abruzzo_umbria_sicily_feast_detail_rows,114);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Italy regional local feasts: 21 Cocullo + 21 Gubbio + 72 Sicily source details, 2457 total nonunique research rows, zero custom promotions — PASS');


// Three Spanish regional religious/festival complexes (Elche Marian sacred
// drama, Berga Corpus-related Patum, Caravaca Vera Cruz). A stage scene,
// dated 2026 parade substep, civic competition or modern ministerial festival
// description is neither an independent Catholic custom nor approval of a
// 1962 rite. No overlap allowed with Italian or Irish discovery pipelines.
const spRegions26=load('data/customs/master/spain-elche-berga-caravaca-three-regional-complexes-action-detail-pass.v1.json');
const spReview20=load('data/customs/master/spain-regional-20-working-owner-action-contrast-review.v1.json');
assert.equal(spRegions26.records.length,145);
assert.equal(spRegions26.summary.source_detail_records,145);
assert.deepEqual(spRegions26.summary.by_complex,{E:72,B:36,C:37});
assert.equal(spRegions26.summary.unique_local_festival_complexes,3);
assert.equal(spRegions26.summary.verified_distinct_new_customs,0);
assert.equal(spRegions26.summary.independent_primary_archival_witnesses_certified,0);
assert.equal(spRegions26.summary.app_publications,0);
assert.equal(Object.values(spRegions26.summary.claim_types).reduce((a,b)=>a+b,0),145);
assert.equal(spRegions26.critical_notes.length,4);
const spCount={E:0,B:0,C:0};
const spIds=new Set();
const spById=new Map();
for(const r of spRegions26.records){
 const g=r.observation_id.split('-')[1];
 assert.ok(['E','B','C'].includes(g));
 spCount[g]++;
 assert.equal(r.observation_id,'SPREG26-'+g+'-'+String(spCount[g]).padStart(3,'0'));
 assert.ok(!spIds.has(r.observation_id));
 spIds.add(r.observation_id);
 spById.set(r.observation_id,r);
 assert.ok(r.label.length>=19);
 assert.ok(r.detail_type.length>=4);
 assert.ok(r.source_locator.url.startsWith('https://'));
 if(r.source_locator.web_line!==null)assert.ok(Number.isInteger(r.source_locator.web_line)&&r.source_locator.web_line>=1);
 else assert.equal(r.source_locator.source_access,'WEB_SEARCH_STRUCTURED_EXCERPT_NOT_FULL_PAGE_LINE_NUMBER');
 assert.equal(r.ritual_authority,'NOT_VERIFIED_FOR_1962_USE');
 assert.equal(r.custom_identity_certified,false);
 assert.equal(r.app_publication,false);
 if(r.detail_type==='EXPLICIT_2026_PROGRAM')assert.equal(r.period,'EXPLICIT_2026_EVENT_ONLY');
}
assert.deepEqual(spCount,{E:72,B:36,C:37});
assert.equal(researchCatalogue.external_source_observations_spain_elche_berga_caravaca.length,145);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_spain_elche_berga_caravaca.map(r=>r.id)),spIds);
for(const r of researchCatalogue.external_source_observations_spain_elche_berga_caravaca){
 const base=spById.get(r.id);
 assert.ok(base);
 assert.equal(r.label,base.label);
 assert.equal(r.url,base.source_locator.url);
 assert.equal(r.web_line,base.source_locator.web_line);
 assert.equal(r.regional_complex_id,base.regional_complex);
 assert.equal(r.identity_certified,false);
}
assert.equal(spReview20.records.length,20);
assert.equal(spReview20.summary.compared_pairs,20);
assert.equal(spReview20.summary.verified_same_custom_identities,0);
assert.equal(spReview20.summary.automatic_merges,0);
assert.equal(spReview20.summary.confirmed_independent_witnesses,0);
assert.equal(spReview20.summary.app_publications,0);
const spOwnerIds=new Set([
 ...researchCatalogue.existing_master_identities,
 ...researchCatalogue.provisional_handbook_groups,
 ...researchCatalogue.provisional_historical_groups,
 ...researchCatalogue.provisional_unindexed_practice_leads,
 ...researchCatalogue.provisional_unassigned_action_leads
].map(r=>r.id));
assert.equal(new Set(spReview20.records.map(r=>r.review_id)).size,20);
for(const r of spReview20.records){
 const action=spById.get(r.new_source_id);
 assert.ok(action);
 assert.equal(r.source_action_label,action.label);
 assert.equal(r.source_url,action.source_locator.url);
 assert.equal(r.source_line,action.source_locator.web_line);
 assert.ok(spOwnerIds.has(r.existing_research_id));
 assert.ok(r.rationale.length>=50);
 assert.equal(r.practice_identity_confirmed,false);
 assert.equal(r.evidence_independence_confirmed,false);
 assert.equal(r.ecclesiastical_authority_confirmed,false);
 assert.equal(r.automatic_owner_assignment,false);
 assert.equal(r.app_publication,false);
}
assert.equal(count.source_observations.spain_three_source_detail_records,145);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.source_review.spain_twenty_label_level_action_relationships_reviewed,20);
assert.equal(count.source_review.spain_new_verified_distinct_customs,0);
assert.equal(count.source_review.spain_relations_auto_merged,0);
assert.equal(count.source_review.spain_verified_1962_ritual_authorizations,0);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Spain 145 source details (72 Elche, 36 Berga, 37 Caravaca) + 20 source-action contrasts; 2602 nonunique research rows, 0 new custom certifications and 0 app publication — PASS');


// Italian archival-source accession is *only* a worklist for inspecting
// original documents. Do not count bibliography or archive holdings as customs.
const italianOriginalArchives=load('data/customs/master/italy-gubbio-salemi-pitre-original-archives-acquisition.v1.json');
assert.equal(italianOriginalArchives.records.length,27);
assert.equal(italianOriginalArchives.summary.archival_and_print_source_accession_tasks,27);
assert.deepEqual(italianOriginalArchives.summary.by_area,{GUBBIO:19,TRAPANI_SALEMI:8});
assert.deepEqual(italianOriginalArchives.summary.by_priority,{P0:15,P1:8,P2:4});
assert.equal(italianOriginalArchives.summary.pre1962_original_folios_directly_read,0);
assert.equal(italianOriginalArchives.verified_archival_inventory_context.inventory_archive_box,'busta 18');
assert.deepEqual(italianOriginalArchives.verified_archival_inventory_context.case_numbers,[42,43]);
assert.deepEqual(italianOriginalArchives.verified_archival_inventory_context.pdf_page_indices_zero_based,[36,37]);
assert.equal(italianOriginalArchives.verified_archival_inventory_context.year,1868);
assert.ok(italianOriginalArchives.verified_archival_inventory_context.interpretation.includes('NOT verify'));

assert.equal(italianOriginalArchives.summary.independent_historic_customs_verified,0);
assert.equal(italianOriginalArchives.summary.source_detail_count_increment,0);
assert.equal(italianOriginalArchives.summary.app_calendar_publications,0);
assert.equal(new Set(italianOriginalArchives.records.map(r=>r.id)).size,27);
for(const [i,r] of italianOriginalArchives.records.entries()){
 assert.equal(r.id,'ITA-ARCH-26-'+String(i+1).padStart(3,'0'));
 assert.ok(r.public_locator.url.startsWith('https://'));
 assert.ok(r.public_locator.anchor.length>=5);
 assert.ok(r.verification_questions.length>=1);
 assert.equal(r.primary_document_directly_inspected,false);
 assert.equal(r.standalone_custom_certified,false);
 assert.equal(r.source_detail_count_increment,0);
 assert.equal(r.publication_state,'RESEARCH_ONLY');
}
assert.equal(researchCatalogue.source_dataset_paths.italy_archival_original_acquisition,'data/customs/master/italy-gubbio-salemi-pitre-original-archives-acquisition.v1.json');
assert.equal(count.source_review.italian_original_archival_acquisition_tasks_nonadditive,27);
assert.equal(count.source_review.italian_original_archival_folios_inspected,0);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Italy archival originals: 27 acquisition tasks, 0 original folios opened, 0 new customs or added research rows — PASS');


// Portugal: FOUR independent state heritage INVENTORY RECORDS, not 140 verified
// historically independent customs. 140 line-located source-action details,
// including Bracarense alternative rite descriptions, Episcopal rites, local
// Epiphany mural-painting variants, and Lent prayers for the departed.
const ptPci140=load('data/customs/master/portugal-four-pci-lent-easter-epiphany-local-details.v1.json');
const ptRel28=load('data/customs/master/portugal-four-pci-28-action-contrast-review.v1.json');
assert.equal(ptPci140.records.length,140);
assert.deepEqual(ptPci140.summary.by_umbrella,{B:49,E:32,A:42,V:17});
assert.equal(ptPci140.summary.consulted_national_inventory_documents,4);
assert.equal(ptPci140.summary.contextualized_regional_umbrella_records,4);
assert.equal(ptPci140.summary.new_unique_verified_customs,0);
assert.equal(ptPci140.summary.new_independent_archival_witnesses,0);
assert.equal(ptPci140.summary.app_publications,0);
const ptSourcesByTheme=new Map(ptPci140.sources.map(z=>[z.code,z]));
assert.equal(ptSourcesByTheme.size,4);
const ptCounter={B:0,E:0,A:0,V:0},ptMap=new Map();
for(const r of ptPci140.records){
 assert.ok(ptSourcesByTheme.has(r.theme));
 ptCounter[r.theme]++;
 assert.equal(r.observation_id,'PT-PCI26-'+r.theme+'-'+String(ptCounter[r.theme]).padStart(3,'0'));
 assert.ok(!ptMap.has(r.observation_id));
 ptMap.set(r.observation_id,r);
 const source=ptSourcesByTheme.get(r.theme);
 assert.equal(r.source_inventory_id,source.source_inventory);
 assert.equal(r.source_locator.url,source.url);
 assert.ok(Number.isInteger(r.source_locator.html_extracted_line));
 assert.ok(r.source_locator.html_extracted_line>=source.min&&r.source_locator.html_extracted_line<=source.max);
 assert.equal(r.source_locator.access,'PORTUGUESE_NATIONAL_INTANGIBLE_HERITAGE_INVENTORY_HTML_DIRECT');
 assert.equal(r.source_locator.original_historical_primary_documents_inspected,false);
 assert.equal(r.classification_status,'SOURCE_ACTION_OR_VARIANT_NOT_SEPARATE_CERTIFIED_CUSTOM');
 assert.equal(r.independent_firsthand_witnesses_certified,0);
 assert.equal(r.roman_1962_ritual_approval,'NOT_ESTABLISHED');
 assert.equal(r.app_publication,false);
 if(r.claim_classification==='ALTERNATIVE_RITE_CONTEXT')assert.equal(r.date_or_rite_scope,'BRACARENSE_RITE_NOT_1962_ROMAN_CUSTOM');
}
assert.deepEqual(ptCounter,{B:49,E:32,A:42,V:17});
assert.equal(researchCatalogue.external_source_observations_portugal_pci.length,140);
for(const x of researchCatalogue.external_source_observations_portugal_pci){
 const original=ptMap.get(x.id);
 assert.ok(original);
 assert.equal(x.label,original.action_label);
 assert.equal(x.line,original.source_locator.html_extracted_line);
 assert.equal(x.url,original.source_locator.url);
 assert.equal(x.source_work,original.source_inventory_id);
 assert.equal(x.identity_certified,false);
}
assert.equal(ptRel28.records.length,28);
assert.equal(ptRel28.summary.reviewed_pairs,28);
assert.equal(ptRel28.summary.source_ids_compared,28);
assert.equal(ptRel28.summary.canonical_equivalences_certified,0);
assert.equal(ptRel28.summary.verified_new_customs,0);
assert.equal(ptRel28.summary.automated_merges,0);
assert.equal(ptRel28.summary.app_publications,0);
const oldPtOwners=new Set([
 ...researchCatalogue.existing_master_identities,
 ...researchCatalogue.provisional_handbook_groups,
 ...researchCatalogue.provisional_historical_groups,
 ...researchCatalogue.provisional_unindexed_practice_leads,
 ...researchCatalogue.provisional_unassigned_action_leads
].map(x=>x.id));
assert.equal(new Set(ptRel28.records.map(x=>x.comparison_id)).size,28);
for(const x of ptRel28.records){
 const original=ptMap.get(x.new_source_id);
 assert.ok(original);
 assert.equal(x.source_label,original.action_label);
 assert.equal(x.source_html_line,original.source_locator.html_extracted_line);
 assert.ok(oldPtOwners.has(x.working_owner_id));
 assert.ok(x.rationale.length>=45);
 assert.equal(x.identity_certified,false);
 assert.equal(x.independent_witness_certified,false);
 assert.equal(x.roman1962_authority_certified,false);
 assert.equal(x.auto_merge,false);
 assert.equal(x.published,false);
}
assert.equal(count.source_observations.portugal_four_pci_lent_easter_epiphany_source_details,140);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.source_review.portugal_2026_action_family_label_relations_reviewed,28);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Portugal four PCI inventories: 140 sourced details, 28 nonmerging identity contrasts, 2742 research/detail rows and zero new customary identity certifications — PASS');


// THREE original family books, even though CatholicCulture and Sophia split
// them among 26 HTML excerpts. No host or article-level source independence.
const threeHouseholdWorks2026=load('data/customs/master/mcloughlin1956-craig1945-familylife1950s-article-source-actions.v1.json');
const threeWorksLookup=load('data/customs/master/three-works-133-prior-source-action-lookup.v1.json');
assert.equal(threeHouseholdWorks2026.summary.source_observation_or_component_rows,133);
assert.equal(threeHouseholdWorks2026.records.length,133);
assert.equal(threeHouseholdWorks2026.summary.distinct_original_books,3);
assert.deepEqual(threeHouseholdWorks2026.summary.by_work,{
 MCLOUGHLIN_EASTER_PENTECOST_1956:77,
 CRAIG_CANDLE_LIGHTED_1945:16,
 FAMILY_LIFE_BUREAU_1950S_REPRINT:40
});
assert.equal(threeHouseholdWorks2026.summary.independently_verified_unique_customs,0);
assert.equal(threeHouseholdWorks2026.summary.independent_corroborations_certified,0);
assert.equal(threeHouseholdWorks2026.summary.app_publications,0);
assert.equal(threeHouseholdWorks2026.source_works.length,3);
for(const w of threeHouseholdWorks2026.source_works)assert.equal(w.complete_book_examined,false);
const threeBookIds=new Set(threeHouseholdWorks2026.records.map(x=>x.source_observation_id));
assert.equal(threeBookIds.size,133);
const threeArticleUrls=new Set(threeHouseholdWorks2026.records.map(x=>x.source_url));
assert.equal(threeArticleUrls.size,26);
let previousBook=null;
for(const [i,x] of threeHouseholdWorks2026.records.entries()){
 assert.equal(x.source_observation_id,'CC3WORK-2026-'+String(i+1).padStart(3,'0'));
 assert.ok(x.action_label.length>=24);
 assert.ok(x.source_url.startsWith('https://'));
 assert.equal(x.action_identity_status,'SOURCE_DETAIL_OR_MENTION_NOT_DISTINCT_CUSTOM');
 assert.equal(x.inter_source_independence,'NOT_ESTABLISHED_AUTHOR_CITATIONS_OR_DERIVATIVE_PASSAGES_POSSIBLE');
 assert.equal(x.current_1962_rite_authority,'NOT_CHECKED');
 assert.equal(x.app_publication,'NONE');
 assert.ok(threeHouseholdWorks2026.summary.by_work[x.source_work]);
 assert.ok(x.claim_type.length>=15);
 if(x.source_article_id==='SOPHIA')assert.ok(x.source_url.includes('sophiainstitute.com'));
 else assert.ok(x.source_url.includes('catholicculture.org/culture/liturgicalyear/activities/view.cfm?id='+x.source_article_id));
}
assert.equal(researchCatalogue.external_source_observations_three_family_books.length,133);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_three_family_books.map(x=>x.id)),threeBookIds);
for(const x of researchCatalogue.external_source_observations_three_family_books){
 const src=threeHouseholdWorks2026.records.find(r=>r.source_observation_id===x.id);
 assert.ok(src);
 assert.equal(x.label,src.action_label);
 assert.equal(x.article_url,src.source_url);
 assert.equal(x.original_work,src.source_work);
 assert.equal(x.identity_certified,false);
}
assert.equal(threeWorksLookup.rows.length,133);
assert.deepEqual(new Set(threeWorksLookup.rows.map(x=>x.source_observation_id)),threeBookIds);
assert.equal(threeWorksLookup.summary.source_rows_screened,133);
assert.equal(threeWorksLookup.summary.prior_owner_family_labels,490);
assert.equal(threeWorksLookup.summary.prior_source_mentions,1717);
assert.equal(threeWorksLookup.summary.rows_with_owner_hints,37);
assert.equal(threeWorksLookup.summary.rows_with_other_source_hints,94);
assert.equal(threeWorksLookup.summary.rows_without_any_hints,31);
assert.equal(threeWorksLookup.summary.hint_links,329);
assert.equal(threeWorksLookup.summary.newly_certified_custom_identities,0);
assert.equal(threeWorksLookup.summary.independent_corroborations_confirmed,0);
assert.equal(threeWorksLookup.summary.app_publications,0);
let totalThreeHints=0;
for(const r of threeWorksLookup.rows){
 assert.equal(r.actual_same_custom_verified,false);
 assert.equal(r.independent_historical_witness_confirmed,false);
 assert.equal(r.automatic_merge,false);
 assert.equal(r.app_publication,false);
 for(const x of [...r.lookup_against_working_owners,...r.lookup_against_other_source_mentions]){
  assert.equal(x.relationship,'LEXICAL_DISCOVERY_ONLY_NO_IDENTITY_OR_HISTORICAL_INDEPENDENCE');
  assert.ok(x.shared.length>=2);
  totalThreeHints++;
 }
}
assert.equal(totalThreeHints,329);
assert.equal(count.source_observations.cc_three_earlier_family_works_action_details,133);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.source_review.cc_three_book_or_original_work_count,3);
assert.equal(count.source_review.cc_three_original_source_observation_components,133);
assert.equal(count.source_review.cc_three_article_urls_reviewed,26);
assert.equal(count.source_review.cc_three_lookup_hints,329);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Catholic family original-source lineage: 133 actions from three works / 26 excerpts, 329 nonmerging search hints; 2875 research observations, 0 new canonically distinct customs and 0 publication — PASS');


// Giuseppe Pitrè's Palermo retrospective social history is a direct textual
// witness, but NOT direct inspection of his separately catalogued 1881/1900
// books or any original eighteenth-century archival folios.
const pitrePalermo110=load('data/customs/master/pitre-palermo-retrospective-vol1-vol2-source-details-wave01.v1.json');
assert.equal(pitrePalermo110.records.length,110);
assert.equal(pitrePalermo110.summary.observation_details,110);
assert.deepEqual(pitrePalermo110.summary.by_volume,{V1:18,V2:92});
assert.equal(pitrePalermo110.summary.source_documents,2);
assert.equal(pitrePalermo110.summary.original_1881_and_1900_books_directly_read,false);
assert.equal(pitrePalermo110.summary.pre1900_archival_folios_directly_read,0);
assert.equal(pitrePalermo110.summary.new_distinct_customs,0);
assert.equal(pitrePalermo110.summary.identity_merges,0);
assert.equal(pitrePalermo110.summary.app_publications,0);
const pitreIds=new Set(pitrePalermo110.records.map(r=>r.observation_id));
assert.equal(pitreIds.size,110);
assert.equal(researchCatalogue.external_source_observations_pitre_palermo_1950.length,110);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_pitre_palermo_1950.map(r=>r.id)),pitreIds);
const pByVol={V1:0,V2:0},pTypes={};
for(const [i,r] of pitrePalermo110.records.entries()){
 assert.equal(r.observation_id,'PIT-PAL-26-'+String(i+1).padStart(3,'0'));
 assert.ok(['V1','V2'].includes(r.volume));
 assert.equal(r.source_url,pitrePalermo110.sources[r.volume].url);
 assert.ok(Number.isInteger(r.source_html_line));
 assert.ok(r.source_html_line>=100&&r.source_html_line<=(r.volume==='V1'?3999:3471));
 assert.ok(r.action_detail.length>=18);
 assert.equal(r.witness_level,'DIRECT_PITRE_HISTORICAL_SYNTHESIS_NOT_DIRECT_ARCHIVAL_OR_EYEWITNESS_DOCUMENT');
 assert.equal(r.original_manuscript_verified,false);
 assert.equal(r.distinct_custom_identity_certified,false);
 assert.equal(r.independent_corrob_verified,false);
 assert.equal(r.rite_1962_checked,false);
 assert.equal(r.app_publication,'NONE');
 pByVol[r.volume]++;
 pTypes[r.claim_class]=(pTypes[r.claim_class]||0)+1;
}
assert.deepEqual(pByVol,pitrePalermo110.summary.by_volume);
assert.deepEqual(pTypes,pitrePalermo110.summary.types);
assert.equal(count.source_observations.pitre_palermo_historic_text_vol1_vol2_action_details,110);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Pitrè Palermo historical texts: 110 source-located details (92+18), 2985 research rows, 0 certified new identities or app publication — PASS');


// Same described action is not proof of an independently observed historical
// custom. Confirm 41 reviewed label-level contrasts are reversible and cannot
// merge or certify an action, even when their labels are near-identical.
const threeWorksManual41=load('data/customs/master/three-household-books-41-manual-action-contrast-review.v1.json');
assert.equal(threeWorksManual41.records.length,41);
assert.equal(threeWorksManual41.summary.pairs_reviewed,41);
assert.equal(threeWorksManual41.summary.source_rows_represented,39);
assert.equal(threeWorksManual41.summary.confirmed_independent_historical_witnesses,0);
assert.equal(threeWorksManual41.summary.verified_distinct_custom_identities,0);
assert.equal(threeWorksManual41.summary.owner_merges,0);
assert.equal(threeWorksManual41.summary.app_publications,0);
assert.equal(new Set(threeWorksManual41.records.map(r=>r.relation_id)).size,41);
const existingOwnersAndSources=new Map([
 ...researchCatalogue.existing_master_identities,
 ...researchCatalogue.provisional_handbook_groups,
 ...researchCatalogue.provisional_historical_groups,
 ...researchCatalogue.provisional_unindexed_practice_leads,
 ...researchCatalogue.provisional_unassigned_action_leads,
 ...researchCatalogue.external_source_action_families_mcloughlin,
 ...Object.entries(researchCatalogue).filter(([k,v])=>k.startsWith('external_source_observations_')&&Array.isArray(v)).flatMap(([k,v])=>v)
].map(r=>[r.id,r]));
const threeWorksById=new Map(threeHouseholdWorks2026.records.map(r=>[r.source_observation_id,r]));
let negatives=0,sameDescriptions=0;
for(const r of threeWorksManual41.records){
 const src=threeWorksById.get(r.source_observation_id);
 const target=existingOwnersAndSources.get(r.compared_prior_id);
 assert.ok(src,'source action must exist');
 assert.ok(target,'review target must exist');
 assert.equal(r.source_description,src.action_label);
 assert.equal(r.source_url,src.source_url);
 assert.equal(r.compared_prior_description,target.label);
 assert.ok(r.reason.length>=55);
 assert.equal(r.historical_identity_certified,false);
 assert.equal(r.source_independence_confirmed,false);
 assert.equal(r.ritual_approval_verified,false);
 assert.equal(r.auto_merged,false);
 assert.equal(r.app_published,false);
 if(r.action_description_relation.startsWith('FALSE_LEXICAL_MATCH_'))negatives++;
 if(r.action_description_relation.startsWith('SAME_'))sameDescriptions++;
}
assert.ok(negatives>=10);
assert.ok(sameDescriptions>=10);
assert.equal(Object.values(threeWorksManual41.summary.relationship_types).reduce((a,b)=>a+b,0),41);
assert.equal(count.source_review.cc_three_books_label_action_pairs_manually_compared,41);
assert.equal(count.source_review.cc_three_books_distinct_action_rows_reviewed_at_least_once,39);
assert.equal(count.source_review.cc_three_books_manual_distinct_custom_identity_certifications,0);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Domestic 3-work 41 action-description contrasts: >=10 false matches, >=10 same described cores, 0 independent corroboration, 0 certification and 0 publication — PASS');


// Pitrè source reconciliation is historical-context grouping, NOT identity
// certification or a second intake of already-counted 110 source details.
const pitreContextReview=load('data/customs/master/pitre-110-context-clusters-31-manual-cross-source-contrast.v1.json');
assert.equal(pitreContextReview.summary.pitre_source_observations_routed,110);
assert.equal(pitreContextReview.summary.document_context_clusters,35);
assert.equal(pitreContextReview.summary.comparison_pairs_manually_triaged,31);
assert.equal(pitreContextReview.summary.same_author_cross_volume_repetition_candidates,2);
assert.equal(pitreContextReview.summary.source_rows_added,0);
assert.equal(pitreContextReview.summary.new_distinct_customs_certified,0);
assert.equal(pitreContextReview.summary.original_archival_folios_inspected,0);
assert.equal(pitreContextReview.summary.independent_witnesses_certified,0);
assert.equal(pitreContextReview.summary.merges,0);
assert.equal(pitreContextReview.summary.calendar_publications,0);
const pitreOriginalIds=new Set(pitrePalermo110.records.map(r=>r.observation_id));
assert.equal(pitreOriginalIds.size,110);
const pitreClusterIds=new Set();
const pitreSeen=new Set();
for(const c of pitreContextReview.clusters){
 assert.ok(!pitreClusterIds.has(c.cluster_id));pitreClusterIds.add(c.cluster_id);
 assert.equal(c.source_observation_count,c.source_observation_ids.length);
 assert.equal(c.independent_custom_identity_certified,false);
 assert.equal(c.calendar_publication,'NONE');
 for(const id of c.source_observation_ids){
  assert.ok(pitreOriginalIds.has(id));
  assert.ok(!pitreSeen.has(id));
  pitreSeen.add(id);
 }
}
assert.equal(pitreClusterIds.size,35);
assert.deepEqual(pitreSeen,pitreOriginalIds);
assert.equal(pitreContextReview.source_action_to_cluster.length,110);
for(const z of pitreContextReview.source_action_to_cluster){
 const original=pitrePalermo110.records.find(r=>r.observation_id===z.source_id);
 assert.ok(original);
 assert.ok(pitreClusterIds.has(z.cluster_id));
 assert.equal(z.original_volume,original.volume);
 assert.equal(z.original_source_web_line,original.source_html_line);
 assert.equal(z.claim_class,original.claim_class);
 assert.equal(z.canonical_identity,'NONE');
}
const pitreReviewOwnerIds=new Set(
 Object.entries(researchCatalogue)
 .filter(([key,value])=>Array.isArray(value)&&key!=='external_source_observations_pitre_palermo_1950')
 .flatMap(([key,rows])=>rows.map(r=>r.id).filter(Boolean))
);
assert.equal(pitreContextReview.comparisons.length,31);
assert.equal(new Set(pitreContextReview.comparisons.map(r=>r.review_id)).size,31);
for(const r of pitreContextReview.comparisons){
 assert.ok(pitreOriginalIds.has(r.source_id));
 assert.ok(pitreClusterIds.has(r.source_cluster_id));
 assert.ok(pitreReviewOwnerIds.has(r.existing_research_id));
 assert.ok(r.rationale.length>=70);
 assert.equal(r.historical_practice_identity_proven,false);
 assert.equal(r.source_independence_proven,false);
 assert.equal(r.automatic_merge,false);
 assert.equal(r.rite_authority_proven,false);
 assert.equal(r.calendar_publication,false);
}
assert.equal(pitreContextReview.same_author_repeated_components.length,2);
for(const r of pitreContextReview.same_author_repeated_components){
 assert.ok(pitreOriginalIds.has(r.source_id)&&pitreOriginalIds.has(r.repeated_by));
 assert.ok(r.status.includes('NOT_IDENTITY_PROVEN'));
}
assert.equal(researchCatalogue.source_dataset_paths.pitre_context_clusters_31_cross_source,'data/customs/master/pitre-110-context-clusters-31-manual-cross-source-contrast.v1.json');
assert.equal(count.source_review.pitre_110_context_cluster_routing_nonadditive,110);
assert.equal(count.source_review.pitre_historic_event_context_clusters_not_distinct_customs,35);
assert.equal(count.source_review.pitre_manual_31_action_pair_contrasts_no_merges,31);
assert.equal(count.source_review.pitre_intervolume_same_author_repetitions_flagged,2);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Pitrè reconciliation: 110/110 actions mapped to 35 historic contexts; 31 manually compared action labels and 2 same-author repeat flags, 2,985 source rows unchanged, zero mergers/publications — PASS');


// First directly read ORIGINAL 1900 edition of Pitre's Feste patronali,
// not the separate posthumous Palermo historical volumes and not the 1881
// Spettacoli. Source-index observations are NOT verified distinct customs.
const pitre1900OriginalOCR=load('data/customs/master/pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json');
assert.equal(pitre1900OriginalOCR.summary.source_action_detail_rows,129);
assert.equal(pitre1900OriginalOCR.records.length,129);
assert.equal(Object.keys(pitre1900OriginalOCR.summary.municipalities_or_localities).length,14);
assert.equal(pitre1900OriginalOCR.source.edition,'Carlo Clausen, Torino-Palermo 1900');
assert.equal(pitre1900OriginalOCR.source.text_source_original_1900_edition,true);
assert.equal(pitre1900OriginalOCR.source.scan_page_image_visually_checked,false);
assert.equal(pitre1900OriginalOCR.summary.printed_page_folio_verified,0);
assert.equal(pitre1900OriginalOCR.summary.original_1881_volume_read,false);
assert.equal(pitre1900OriginalOCR.summary.pre_1900_primary_witness_originals_read,0);
assert.equal(pitre1900OriginalOCR.summary.new_distinct_customs_certified,0);
assert.equal(pitre1900OriginalOCR.summary.independent_historical_witnesses_certified,0);
assert.equal(pitre1900OriginalOCR.summary.automatic_identity_merges,0);
assert.equal(pitre1900OriginalOCR.summary.app_publications,0);
assert.equal(researchCatalogue.external_source_observations_pitre_original_1900_ocr.length,129);
assert.equal(researchCatalogue.source_dataset_paths.pitre_1900_original_feste_patronali,'data/customs/master/pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json');
const p1900ByType={},p1900ByLocality={},p1900Ids=new Set();
for(let i=0;i<pitre1900OriginalOCR.records.length;i++){
 const r=pitre1900OriginalOCR.records[i];
 assert.equal(r.id,'PIT1900-IT-'+String(i+1).padStart(3,'0'));
 assert.ok(!p1900Ids.has(r.id));
 p1900Ids.add(r.id);
 assert.ok(Number.isInteger(r.html_ocr_line)&&r.html_ocr_line>=175&&r.html_ocr_line<=20700);
 assert.ok(r.reported_action_or_component.length>18);
 assert.equal(r.source_url,pitre1900OriginalOCR.source.full_ocr_text_url);
 assert.equal(r.original_edition_ocr_directly_read,true);
 assert.equal(r.original_scan_page_visually_verified,false);
 assert.equal(r.independent_secondary_source_verified,false);
 assert.equal(r.ritual_approval_1962_verified,false);
 assert.equal(r.regional_practice_identity_certified,false);
 assert.equal(r.app_publication,'NONE');
 p1900ByLocality[r.location]=(p1900ByLocality[r.location]||0)+1;
 p1900ByType[r.claim_type]=(p1900ByType[r.claim_type]||0)+1;
}
assert.deepEqual(p1900ByLocality,pitre1900OriginalOCR.summary.municipalities_or_localities);
assert.deepEqual(p1900ByType,pitre1900OriginalOCR.summary.classification_counts);
assert.deepEqual(new Set(researchCatalogue.external_source_observations_pitre_original_1900_ocr.map(r=>r.id)),p1900Ids);
assert.equal(count.source_observations.pitre_original_1900_feste_patronali_ocr_details,129);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Pitre ORIGINAL 1900: 129 direct OCR text line observations across 14 localities, no independent-witness claims, 3703 source-detail total, zero publication — PASS');


// Complete nonadditive reconciliation of the EXISTING 129 first-pass Pitrè
// 1900 OCR observations. Exactly 82 rows are involved in the 71 prior
// human action-description comparison edges. The remaining 47 rows are
// individually triaged as components, feast contexts, older unread witnesses,
// folk belief holds or public historical/civic context. NOT a new OCR intake.
const pitre1900Previous71=load('data/customs/master/pitre-1900-action-family-71-manual-comparisons.v1.json');
const pitre1900Exhaustive=load('data/customs/master/pitre-1900-full-129-coverage-47-unpaired-action-triage.v1.json');
assert.equal(pitre1900Previous71.records.length,71);
assert.equal(pitre1900Exhaustive.records.length,129);
assert.equal(pitre1900Exhaustive.families.length,7);
assert.equal(pitre1900Exhaustive.summary.prior_pitre_1900_source_rows,129);
assert.equal(pitre1900Exhaustive.summary.prior_pitre_1900_action_relation_edges,71);
assert.equal(pitre1900Exhaustive.summary.existing_relation_coverage_rows,82);
assert.equal(pitre1900Exhaustive.summary.unpaired_source_rows_triaged,47);
assert.equal(pitre1900Exhaustive.summary.locality_buckets,14);
assert.equal(pitre1900Exhaustive.summary.intra_pitre_pairs,45);
assert.equal(pitre1900Exhaustive.summary.new_source_details,0);
assert.equal(pitre1900Exhaustive.summary.proven_new_distinct_customs,0);
assert.equal(pitre1900Exhaustive.summary.source_folio_images_verified,0);
assert.equal(pitre1900Exhaustive.summary.source_independence_certified,0);
assert.equal(pitre1900Exhaustive.summary.automatic_merges,0);
assert.equal(pitre1900Exhaustive.summary.app_publications,0);
assert.deepEqual(pitre1900Exhaustive.summary.unpaired_route_classes,{
 COMPLEX_ROOT_OR_FEAST_SCOPE:6,
 COMPONENT_OR_MATERIAL_OF_KNOWN_COMPLEX:31,
 REPORTED_FOLK_EFFICACY_HOLD:5,
 REFERENCED_OLDER_DOCUMENT_NOT_DIRECTLY_VERIFIED:2,
 HISTORICAL_OR_SOCIAL_CONTEXT:3
});
assert.equal(new Set(pitre1900Previous71.records.map(r=>r.review_id)).size,71);
const p1900ReviewsById=new Map(pitre1900OriginalOCR.records.map(r=>[r.id,[]]));
for(const rel of pitre1900Previous71.records){
 assert.ok(p1900Ids.has(rel.source_id));
 assert.equal(rel.source_action,pitre1900OriginalOCR.records.find(r=>r.id===rel.source_id).reported_action_or_component);
 assert.equal(rel.source_independence_certified,false);
 assert.equal(rel.one_shared_historical_custom_identity_certified,false);
 assert.equal(rel.ritual_1962_approved,false);
 assert.equal(rel.automatic_master_owner_merge,false);
 assert.equal(rel.app_publication,false);
 p1900ReviewsById.get(rel.source_id).push(rel.review_id);
 if(p1900Ids.has(rel.comparison_id))p1900ReviewsById.get(rel.comparison_id).push(rel.review_id);
}
assert.equal(pitre1900Exhaustive.families[0].start,1);
assert.equal(pitre1900Exhaustive.families.at(-1).end,129);
let reviewedPitre=0,unpairedPitre=0,claimFolkPitre=0;
const pitreBySourceId=new Map(pitre1900OriginalOCR.records.map(r=>[r.id,r]));
for(const row of pitre1900Exhaustive.records){
 const original=pitreBySourceId.get(row.source_id);
 assert.ok(original);
 assert.equal(row.original_source_url,original.source_url);
 assert.equal(row.original_html_ocr_line,original.html_ocr_line);
 assert.equal(row.original_location,original.location);
 assert.equal(row.original_occasion,original.occasion);
 assert.equal(row.source_claim_type,original.claim_type);
 assert.deepEqual(new Set(row.previous_71_review_edges),new Set(p1900ReviewsById.get(row.source_id)));
 assert.ok(pitre1900Exhaustive.families.some(x=>x.id===row.provisional_parent_festival_family));
 assert.equal(row.original_facsimile_verified,false);
 assert.equal(row.original_witness_independence_verified,false);
 assert.equal(row.canonical_custom_identity_verified,false);
 assert.equal(row.ministerial_ritual_text_verified,false);
 assert.equal(row.master_owner_assignment,null);
 assert.equal(row.published,false);
 if(row.previous_71_review_edges.length){
  reviewedPitre++;
  assert.equal(row.review_route,'PRIOR_MANUAL_ACTION_PAIR_REFERENCED');
  assert.equal(row.unpaired_screen_disposition,null);
  assert.equal(row.unpaired_screen_specific_focus,null);
 }else{
  unpairedPitre++;
  assert.equal(row.review_route,'NEW_EDITORIAL_SCREEN_OF_UNPAIRED_OBSERVATION');
  assert.ok(row.unpaired_screen_specific_focus.length>=30);
  if(row.unpaired_screen_disposition==='REPORTED_FOLK_EFFICACY_HOLD')claimFolkPitre++;
 }
}
assert.equal(reviewedPitre,82);
assert.equal(unpairedPitre,47);
assert.equal(claimFolkPitre,5);
assert.equal(count.source_review.pitre_1900_all_129_source_rows_action_families_reconciled,129);
assert.equal(count.source_review.pitre_1900_prior_action_pair_reviews_integrated,71);
assert.equal(count.source_review.pitre_1900_distinct_source_rows_covered_by_71_reviews,82);
assert.equal(count.source_review.pitre_1900_previously_unpaired_source_rows_triaged,47);
assert.equal(researchCatalogue.source_dataset_paths.pitre_original_1900_complete_129_71_47_reconciliation,'data/customs/master/pitre-1900-full-129-coverage-47-unpaired-action-triage.v1.json');
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Pitrè 1900: 129/129 first-pass source observations accounted for; 71 comparison links covering 82 and 47 explicit exceptions; 0 new source rows, identities or publications — PASS');


// Pitrè 1900 source-access recovery; six copies/serial references are access
// routes, NOT six independent first-hand authors. The original 1881 St Lucy
// source remains unread and no second original-1900 OCR chapter is claimed.
const pitreWitnessRecovery=load('data/customs/master/pitre-1900-129-original-witness-facsimile-and-1881-dependency-gates.v1.json');
assert.equal(pitreWitnessRecovery.records.length,129);
assert.equal(pitreWitnessRecovery.witness.length,6);
assert.equal(pitreWitnessRecovery.summary.older_1900_source_rows,129);
assert.equal(pitreWitnessRecovery.summary.source_rows_newly_added,0);
assert.deepEqual(pitreWitnessRecovery.summary.source_validation_priorities,{
 P2_STANDARD_FACSIMILE:87,
 P0_SOURCE_CRITICAL:25,
 P1_CONTEXT_VERIFICATION:17
});
assert.equal(pitreWitnessRecovery.summary.original_1900_facsimile_pages_checked,0);
assert.equal(pitreWitnessRecovery.summary.original_1881_body_passages_read,0);
assert.equal(pitreWitnessRecovery.summary.distinct_independent_historical_authors_verified,0);
assert.equal(pitreWitnessRecovery.summary.calendar_app_changes,0);
assert.equal(new Set(pitreWitnessRecovery.witness.map(w=>w.witness_id)).size,6);
for(const witness of pitreWitnessRecovery.witness){
 assert.ok(witness.url.startsWith('https://'));
 assert.equal(witness.separate_independent_historical_author,false);
 assert.equal(witness.full_text_directly_read_this_run,false);
}
assert.equal(pitreWitnessRecovery.untouched_original_book_access_targets.length,4);
const originalPitreById=new Map(pitre1900OriginalOCR.records.map(r=>[r.id,r]));
assert.equal(originalPitreById.size,129);
const recoveryIds=new Set();
let explicitPriorHoldCount=0;
for(const gate of pitreWitnessRecovery.records){
 const original=originalPitreById.get(gate.original_source_id);
 assert.ok(original);
 assert.ok(!recoveryIds.has(gate.original_source_id));
 recoveryIds.add(gate.original_source_id);
 assert.equal(gate.original_1900_ocr_line,original.html_ocr_line);
 assert.equal(gate.locality,original.location);
 assert.equal(gate.occasion,original.occasion);
 assert.equal(gate.action,original.reported_action_or_component);
 assert.equal(gate.claim_type,original.claim_type);
 assert.equal(gate.required_folio_image,true);
 assert.equal(gate.folio_image_visually_checked,false);
 assert.equal(gate.source_1881_text_compared,false);
 assert.equal(gate.distinct_predecessor_author_corroborated,false);
 assert.equal(gate.official_1962_ritual_text_verified,false);
 assert.equal(gate.unique_practice_identity_certified,false);
 assert.equal(gate.app_publication,false);
 if(gate.validation_flags.includes('EXPLICIT_PRIOR_SOURCE_OR_AUTHOR_DEPENDENCE_HOLD'))explicitPriorHoldCount++;
}
assert.equal(recoveryIds.size,129);
assert.equal(explicitPriorHoldCount,5);
const stLucyPrior=pitreWitnessRecovery.records.find(r=>r.original_source_id==='PIT1900-IT-083');
assert.ok(stLucyPrior.validation_flags.includes('SAME_AUTHOR_1881_ST_LUCY_CHAPTER_P424'));
assert.equal(count.source_review.pitre_1900_original_129_facsimile_source_gates,129);
assert.equal(count.source_review.pitre_1900_129_source_critical_p0,25);
assert.equal(count.source_review.pitre_1900_129_context_p1,17);
assert.equal(count.source_review.pitre_1900_129_standard_p2,87);
assert.equal(count.source_review.pitre_1900_six_bibliographic_access_routes_nonindependent,6);
assert.equal(researchCatalogue.source_dataset_paths.pitre_original_1900_witness_and_1881_dependency_gates,'data/customs/master/pitre-1900-129-original-witness-facsimile-and-1881-dependency-gates.v1.json');
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Pitrè archival source access: 129/129 provenance gates, six access routes, 1881 self-reference held, 0 new source rows or publications — PASS');

// Seven original-1900 sections newly extracted in a controlled, page-image-unverified
// OCR expansion. Reconcile 68 + 53 staged observations into 121 workbench entries;
// NEVER infer 121 distinct approved customs or confuse them with the original 129.
const pitreNewS1=load('data/customs/master/pitre-1900-new-rosalia-cosmas-piazza-original-ocr-stage01.v1.json');
const pitreNewS2=load('data/customs/master/pitre-1900-new-gangi-gratteri-geraci-marineo-original-ocr-stage02.v1.json');
assert.equal(pitreNewS1.records.length,68);
assert.equal(pitreNewS2.records.length,53);
const pitreNewStages=[...pitreNewS1.records,...pitreNewS2.records];
const pitreNewCatalogue=researchCatalogue.external_source_observations_pitre_original_1900_new_ocr.slice(0,121);
assert.equal(pitreNewCatalogue.length,121);
assert.equal(new Set(pitreNewCatalogue.map(r=>r.id)).size,121);
assert.equal(new Set(pitreNewCatalogue.map(r=>r.section)).size,7);
for(let i=0;i<121;i++){
 const raw=pitreNewStages[i], row=pitreNewCatalogue[i];
 assert.equal(row.id,'PIT1900-NEW-'+String(i+1).padStart(3,'0'));
 assert.equal(row.id,raw.id);
 assert.ok(!p1900Ids.has(row.id));
 assert.equal(row.label,raw.description);
 assert.equal(row.locality,raw.locality);
 assert.equal(row.occasion,raw.occasion);
 assert.equal(row.claim_class,raw.classification);
 assert.equal(row.source_1900_html_ocr_line,raw.source_ocr_html_line);
 assert.equal(row.original_printed_folio_verified,true);
 assert.equal(row.source_independence_certified,false);
 assert.equal(row.official_1962_rite_approved,false);
 assert.equal(row.unique_practice_identity_certified,false);
 assert.equal(row.present_continuity_certified,false);
 assert.equal(row.working_master_owner,null);
 assert.equal(row.publication_state,'RESEARCH_ONLY');
 assert.ok(row.source_file.includes('pitre-1900-new-'));
}
assert.equal(count.source_observations.pitre_1900_original_new_seven_sections_ocr_details,121);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.source_review.pitre_1900_new_121_original_ocr_source_rows_indexed,121);
assert.equal(count.source_review.pitre_1900_new_121_distinct_1900_section_labels,7);
assert.equal(count.source_review.pitre_1900_new_121_original_folio_images_verified,0);
assert.equal(count.source_review.pitre_1900_new_121_verified_unique_customs,0);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Pitrè original 1900: 121 genuinely staged source-detail rows indexed beyond the prior 129; 3703 total; zero certification or publication — PASS');
  
// High-volume 1900 full-text direct OCR wave03, six newly mined festival complexes.
// Exactly 172 new source/detail observations, WITHOUT creating new canonical customs.
const pitreWave03=load('data/customs/master/pitre-1900-original-ocr-unmined-messina-ragusa-scicli-comiso-mazara-calatafimi-wave03.v1.json');
assert.equal(pitreWave03.records.length,172);
assert.equal(pitreWave03.summary.new_source_action_detail_observations,172);
assert.equal(pitreWave03.summary.festival_complexes,6);
assert.deepEqual(pitreWave03.summary.section_counts,{
 MESSINA_ASSUNTA:47,
 RAGUSA_GEORGE_JOHN:40,
 SCICLI_MILIZIE:33,
 COMISO_EASTER:15,
 MAZARA_ST_VITUS:20,
 CALATAFIMI_CRUCIFIX:17
});
assert.equal(pitreWave03.summary.original_folio_images_verified,0);
assert.equal(pitreWave03.summary.certified_distinct_customs,0);
assert.equal(pitreWave03.summary.app_publications,0);
assert.equal(researchCatalogue.external_source_observations_pitre_original_1900_new_ocr.length,293);
const indexedPitre3=researchCatalogue.external_source_observations_pitre_original_1900_new_ocr.slice(121);
assert.equal(indexedPitre3.length,172);
const scanPitre20261024=load('data/customs/master/pitre-1900-uploaded-facsimile-25p0-16-wave03-page-gates.v1.json');
const scanPitreNewVerifiedIds=new Set(scanPitre20261024.additional_wave03_highrisk_page_checks.map(r=>r.source_id));
const scanWave03Final=load('data/customs/master/pitre-1900-uploaded-facsimile-156-wave03-remaining-original-page-verifications.v1.json');
for(const entry of scanWave03Final.records)scanPitreNewVerifiedIds.add(entry.id);
const p3Seen=new Set();
for(let i=0;i<172;i++){
 const raw=pitreWave03.records[i], idx=indexedPitre3[i];
 assert.equal(raw.id,'PIT1900-NEW-'+String(i+122).padStart(3,'0'));
 assert.equal(raw.id,idx.id);
 assert.ok(!p1900Ids.has(idx.id));
 assert.ok(!p3Seen.has(idx.id)); p3Seen.add(idx.id);
 assert.equal(raw.ocr_line,idx.source_1900_html_ocr_line);
 assert.equal(raw.action_or_detail_summary,idx.label);
 assert.equal(raw.feast_complex,idx.section);
 assert.equal(raw.kind,idx.claim_class);
 assert.ok(Number.isInteger(raw.ocr_line)&&raw.ocr_line>=7000&&raw.ocr_line<=18885);
 assert.ok(raw.action_or_detail_summary.length>=35);
 assert.equal(raw.original_page_facsimile_inspected,false);
 assert.equal(raw.same_author_1881_independent,false);
 assert.equal(raw.underlying_pre_1900_witness_read,false);
 assert.equal(raw.catholic_ritual_approval_verified,false);
 assert.equal(raw.independent_witness_certified,false);
 assert.equal(raw.distinct_custom_certified,false);
 assert.equal(raw.modern_practice_verified,false);
 assert.equal(raw.automatic_group_or_master_merge,false);
 assert.equal(raw.app_publication,false);
 assert.equal(idx.original_printed_folio_verified,scanPitreNewVerifiedIds.has(idx.id));
 assert.equal(idx.source_independence_certified,false);
 assert.equal(idx.official_1962_rite_approved,false);
 assert.equal(idx.unique_practice_identity_certified,false);
 assert.equal(idx.present_continuity_certified,false);
 assert.equal(idx.working_master_owner,null);
 assert.equal(idx.publication_state,'RESEARCH_ONLY');
}
assert.equal(p3Seen.size,172);
assert.equal(count.source_observations.pitre_1900_original_new_six_complexes_wave03_ocr_details,172);
assert.equal(count.source_observations.pitre_1900_original_all_new_sections_ocr_details,293);
assert.equal(count.source_review.pitre_1900_new_293_original_ocr_source_rows_indexed,293);
assert.equal(count.source_review.pitre_1900_new_293_distinct_local_festival_complexes,13);
assert.equal(count.source_review.pitre_1900_new_293_original_folio_images_verified,293);
assert.equal(count.source_review.pitre_1900_new_293_verified_unique_customs,0);
assert.equal(count.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(count.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(count.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(researchCatalogue.summary.no_new_app_publications,true);
console.log('Pitrè 1900 wave03: 172 new OCR observations from 6 untouched complexes, 3703 unified rows, zero page/identity/ritual/app promotion — PASS');


