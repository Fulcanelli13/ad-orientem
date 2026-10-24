import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const root='data/customs/master/';
const cat=load(root+'comprehensive-customs-working-catalogue.v1.json');
const wave=load(root+'pitre-1900-wave05-editorial-staging-and-holds.v1.json');
const review=load(root+'pitre-1900-wave06-237-image-preview-review-and-3-anchor-corrections.v1.json');
const coverage=load(root+'pitre-1900-complete-60-chapter-source-coverage-inventory.v1.json');
const rows=cat.external_source_observations_pitre_original_1900_wave05;
assert.equal(rows.length,132);
assert.equal(wave.accepted_source_observation_stage.length,132);
assert.equal(wave.held_source_leads.length,63);
assert.equal(cat.summary.source_observations.total_source_detail_rows_including_external,3644);
assert.equal(cat.summary.source_observations.pitre_1900_all_1900_source_detail_records_now,659);
assert.equal(cat.summary.source_observations.pitre_1900_wave05_noncanonical_new_chapter_observations,132);
assert.equal(cat.summary.source_review.pitre_1900_1900_chapter_groups_with_some_indexed_evidence,60);
assert.equal(cat.summary.source_review.pitre_1900_1900_chapter_groups_unrepresented_in_this_register,0);
assert.equal(cat.summary.source_review.pitre_1900_wave05_full_folio_image_certifications,0);
assert.equal(cat.summary.source_review.pitre_1900_wave06_rendered_image_crop_previews_inspected,237);
assert.equal(coverage.summary.total_chapters_with_some_source_observations,60);
assert.equal(coverage.summary.still_without_1900_source_observations,0);
assert.equal(coverage.summary.chapters_declared_exhaustively_mined,0);
assert.equal(coverage.summary.workbench_source_detail_total,3644);
assert.equal(coverage.summary.all_pitre_1900_source_observations_now,659);
assert.equal(coverage.chapters.filter(r=>r.coverage_after_wave05==='WAVE05_SOURCE_OBSERVATIONS_INDEXED_RESEARCH_ONLY').length,29);
assert.equal(coverage.chapters.filter(r=>r.fully_extracted_verified).length,0);
const allPrior=[
...cat.external_source_observations_pitre_original_1900_ocr,
...cat.external_source_observations_pitre_original_1900_new_ocr,
...cat.external_source_observations_pitre_original_1900_wave04
];
assert.equal(allPrior.length,527);
const original=new Set(allPrior.map(x=>x.id));
const w5=new Set(),c5=new Set();
const reviews=new Map(review.records.map(x=>[x.id,x]));
for(let i=0;i<rows.length;i++){
 const r=rows[i],s=wave.accepted_source_observation_stage[i],v=reviews.get(r.id);
 assert.equal(r.id,s.id);
 assert.match(r.id,/^PIT1900-W05-OBS-\\d{3}$/);
 assert.ok(!original.has(r.id)&&!w5.has(r.id));w5.add(r.id);c5.add(r.chapter_group);
 assert.equal(r.label,s.action_or_detail);
 assert.equal(r.chapter_group,s.source_chapter);
 assert.equal(r.original_printed_page,s.original_printed_page);
 assert.equal(r.original_scan_pdf_page_1_based,s.original_scan_pdf_page_1_based);
 assert.ok(v);
 assert.equal(r.italian_normalized_anchor,v.corrected_anchor||s.original_italian_text_anchor);
 assert.equal(r.original_pdf_sha256,review.source.pdf_sha256);
 assert.equal(r.original_pdf_text_anchor_confirmed,true);
 assert.equal(r.image_region_contact_sheet_inspected,true);
 assert.equal(r.individual_page_image_visually_certified,false);
 assert.equal(r.unique_custom_identity_certified,false);
 assert.equal(r.independent_source_certified,false);
 assert.equal(r.rite_approval_certified,false);
 assert.equal(r.current_calendar_continuity_certified,false);
 assert.equal(r.working_master_owner,null);
 assert.equal(r.publication_state,'RESEARCH_ONLY');
}
assert.equal(c5.size,29);
assert.equal(new Set(wave.held_source_leads.map(r=>r.source_lead_id)).size,63);
assert.equal(cat.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(cat.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(cat.summary.no_new_app_publications,true);
console.log('PASS Pitrè Wave07 noncanonical intake: +132 indexed, 3644 source rows, 659 Pitrè, 60/60 chapters represented; no new custom certification or publication.');
