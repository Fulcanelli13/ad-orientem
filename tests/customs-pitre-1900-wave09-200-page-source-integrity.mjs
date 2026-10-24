import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root='data/customs/master/';
const load=n=>JSON.parse(readFileSync(root+n,'utf8'));
const screen=load('pitre-1900-wave09-200-original-page-screening.v1.json');
const stage=load('pitre-1900-wave09-200-page-action-staging.v1.json');
const cat=load('comprehensive-customs-working-catalogue.v1.json');
const coverage=load('pitre-1900-wave09-post-intake-560-page-coverage.v1.json');
const index=load('pitre-1900-complete-60-chapter-source-coverage-inventory.v1.json');
const expectedAbsent=[7,8,9,10,23,24,25,26,151,152,153,154];
assert.equal(screen.summary.pages_from_previous_gap_queue_screened,200);
assert.equal(screen.summary.keyword_candidate_fragments_for_editorial_review,438);
assert.equal(screen.summary.substantive_pdf_text_pages,183);
assert.equal(screen.summary.illustration_or_minimal_ocr_pages,17);
assert.equal(screen.summary.other_accessible_no_observation_pages_left,41);
assert.equal(screen.summary.missing_original_numbered_folios_in_available_pdf,12);
assert.deepEqual(screen.missing_folios.map(x=>x.printed_page),expectedAbsent);
assert.equal(screen.screened_pages.length,200);
assert.equal(new Set(screen.screened_pages.map(x=>x.printed_page)).size,200);
assert.equal(new Set(screen.screened_pages.map(x=>x.original_scan_pdf_page_1_based)).size,200);
assert.equal(screen.screened_pages.reduce((a,x)=>a+x.keyword_fragment_count,0),438);
assert.equal(screen.screened_pages.filter(x=>x.screen_result==='IMAGE_HEAVY_OR_MINIMAL_OCR').length,17);
const pg=new Map(screen.screened_pages.map(x=>[x.printed_page,x]));
const offset=p=>p<=6?70:p<=22?66:p<=150?62:58;
for(const [p,r] of pg){
 assert.equal(r.original_scan_pdf_page_1_based,p+offset(p));
 assert.ok(!expectedAbsent.includes(p));
 assert.equal(r.individual_original_page_image_certified,false);
 assert.equal(r.new_custom_identity_certified,false);
}
assert.equal(stage.summary.action_observations_staged,51);
assert.equal(stage.observations.length,51);
assert.equal(stage.summary.distinct_chapters,23);
assert.equal(stage.summary.source_observation_workbench_total_pre_stage,3652);
assert.equal(cat.external_source_observations_pitre_original_1900_wave09.length,51);
const earlier=[
 ...cat.external_source_observations_pitre_original_1900_ocr,
 ...cat.external_source_observations_pitre_original_1900_new_ocr,
 ...cat.external_source_observations_pitre_original_1900_wave04,
 ...cat.external_source_observations_pitre_original_1900_wave05,
 ...cat.external_source_observations_pitre_original_1900_wave08
];
assert.equal(earlier.length,667);
const usedIds=new Set(earlier.map(x=>x.id)),usedPages=new Set();
for(let i=0;i<51;i++){
 const s=stage.observations[i],r=cat.external_source_observations_pitre_original_1900_wave09[i];
 assert.equal(s.id,'PIT1900-W09-OBS-'+String(i+1).padStart(3,'0'));
 assert.equal(r.id,s.id);
 assert.ok(!usedIds.has(r.id));usedIds.add(r.id);
 assert.ok(!usedPages.has(r.original_printed_page));usedPages.add(r.original_printed_page);
 assert.equal(r.original_printed_page,s.source_printed_page);
 assert.equal(r.original_scan_pdf_page_1_based,pg.get(r.original_printed_page).original_scan_pdf_page_1_based);
 assert.equal(r.chapter_group,s.source_chapter);
 assert.equal(r.label,s.research_synopsis);
 assert.equal(r.italian_normalized_anchor,s.italian_ocr_anchor);
 assert.equal(r.original_pdf_sha256,screen.source.pdf_sha256);
 assert.equal(r.original_pdf_normalized_text_anchor_confirmed,true);
 assert.equal(s.anchor_word_exact_match_recheck_required,true,'stage is historical record, updated catalogue contains later confirmed normalized matches');
 assert.equal(r.individual_page_image_visually_certified,false);
 assert.equal(r.original_folio_completeness_verified,false);
 assert.equal(r.source_independence_certified,false);
 assert.equal(r.rite_approval_certified,false);
 assert.equal(r.current_calendar_continuity_certified,false);
 assert.equal(r.unique_custom_identity_certified,false);
 assert.equal(r.working_master_owner,null);
 assert.equal(r.publication_state,'RESEARCH_ONLY');
}
assert.equal(coverage.summary.original_1900_source_observations,718);
assert.equal(coverage.summary.printed_pages_with_one_or_more_indexed_observations,358);
assert.equal(coverage.summary.printed_pages_with_no_indexed_source_observation,202);
assert.equal(coverage.summary.wave09_screened_original_pages,200);
assert.equal(coverage.summary.wave09_research_only_source_rows_newly_indexed,51);
assert.equal(coverage.summary.original_pdf_printed_folios_missing_from_both_available_scans,12);
assert.equal(coverage.summary.chapter_ids_with_some_indexed_observations,60);
assert.equal(coverage.summary.chapter_ids_exhaustively_mined,0);
assert.equal(coverage.summary.source_pages_fully_line_by_line_certified,0);
assert.equal(coverage.source_page_completion_worklist.length,202);
const gap=new Set(coverage.source_page_completion_worklist.map(x=>x.printed_page));
assert.equal(gap.size,202);for(const p of expectedAbsent)assert.ok(gap.has(p));
for(const p of usedPages)assert.ok(!gap.has(p));
assert.equal(cat.summary.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(cat.summary.source_observations.pitre_1900_all_1900_source_detail_records_now,718);
assert.equal(cat.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(cat.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(cat.summary.no_new_app_publications,true);
assert.equal(index.summary.workbench_source_detail_total,3703);
assert.equal(index.summary.all_pitre_1900_source_observations_now,718);
assert.equal(index.summary.body_pages_with_one_or_more_indexed_source_observations,358);
assert.equal(index.summary.body_pages_with_no_indexed_source_observations,202);
assert.equal(index.summary.source_pages_missing_from_both_available_pdfs,12);
assert.equal(index.summary.chapters_declared_exhaustively_mined,0);
console.log('PASS Pitrè Wave09: 200 source locations screened, 51 original-text-matched research rows, 718 Pitrè rows, 3703 workbench rows, 358/560 source-located printed pages, 12 scan-missing folios, no custom/calendar promotion.');
