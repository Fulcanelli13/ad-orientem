import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root='data/customs/master/';
const load=n=>JSON.parse(readFileSync(root+n,'utf8'));
const cat=load('comprehensive-customs-working-catalogue.v1.json');
const older=load('pitre-1900-wave05-editorial-staging-and-holds.v1.json');
const audit=load('pitre-1900-wave08-63-held-source-cases-adjudication.v1.json');
const pages=load('pitre-1900-wave08-560-original-body-pages-completeness-queue.v1.json');
const inventory=load('pitre-1900-complete-60-chapter-source-coverage-inventory.v1.json');
const allArrays=[
 cat.external_source_observations_pitre_original_1900_ocr,
 cat.external_source_observations_pitre_original_1900_new_ocr,
 cat.external_source_observations_pitre_original_1900_wave04,
 cat.external_source_observations_pitre_original_1900_wave05,
 cat.external_source_observations_pitre_original_1900_wave08
];
assert.deepEqual(allArrays.map(a=>a.length),[129,293,105,132,8]);
const all=allArrays.flat();
assert.equal(all.length,667);
assert.equal(new Set(all.map(r=>r.id)).size,667);
assert.equal(cat.summary.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(cat.summary.source_observations.pitre_1900_all_1900_source_detail_records_now,718);
assert.equal(cat.summary.source_review.pitre_1900_1900_chapter_groups_with_some_indexed_evidence,60);
assert.equal(cat.summary.source_review.pitre_1900_wave08_63_held_cases_triaged,63);
assert.equal(cat.summary.source_review.pitre_1900_wave08_held_source_actions_recovered,8);
assert.equal(cat.summary.source_review.pitre_1900_wave08_holds_remaining_not_indexed,55);
assert.equal(cat.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(cat.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(cat.summary.no_new_app_publications,true);
assert.equal(older.held_source_leads.length,63);
assert.equal(audit.records.length,63);
assert.equal(new Set(audit.records.map(r=>r.source_lead_id)).size,63);
assert.deepEqual(new Set(audit.records.map(r=>r.source_lead_id)),new Set(older.held_source_leads.map(r=>r.source_lead_id)));
assert.equal(audit.records.filter(r=>r.research_intake_allowed).length,8);
assert.equal(audit.records.filter(r=>!r.research_intake_allowed).length,55);
assert.equal(audit.summary.earlier_held_leads,63);
assert.equal(audit.summary.remaining_leads_excluded_from_research_observation_intake,55);
assert.equal(audit.summary.new_unique_customs_certified??0,0);
assert.equal(audit.summary.app_publications,0);
const recovery=new Set(audit.records.filter(r=>r.research_intake_allowed).map(r=>r.source_lead_id));
const fromIndex=new Set();
for(let i=0;i<8;i++){
 const row=cat.external_source_observations_pitre_original_1900_wave08[i];
 assert.equal(row.id,'PIT1900-W08-OBS-'+String(i+1).padStart(3,'0'));
 assert.ok(recovery.has(row.from_wave05_screen_lead));
 assert.ok(!fromIndex.has(row.from_wave05_screen_lead)); fromIndex.add(row.from_wave05_screen_lead);
 const action=audit.records.find(r=>r.source_lead_id===row.from_wave05_screen_lead);
 assert.equal(row.label,action.source_action_research_synopsis);
 assert.equal(row.original_printed_page,action.original_printed_page);
 assert.equal(row.original_pdf_sha256,audit.source.pdf_sha256);
 assert.equal(row.individual_page_image_visually_certified,false);
 assert.equal(row.independent_source_certified,false);
 assert.equal(row.rite_approval_certified,false);
 assert.equal(row.current_calendar_continuity_certified,false);
 assert.equal(row.unique_custom_identity_certified,false);
 assert.equal(row.working_master_owner,null);
 assert.equal(row.publication_state,'RESEARCH_ONLY');
}
const xi=inventory.chapters.find(c=>c.id==='XI'),xli=inventory.chapters.find(c=>c.id==='XLI');
assert.equal(xi.table_of_contents_printed_page,141);
assert.equal(xi.actual_chapter_heading_printed_page,140);
assert.equal(xli.table_of_contents_printed_page,400);
assert.equal(xli.actual_chapter_heading_printed_page,406);
const fixIds=['PIT1900-W05-OBS-097','PIT1900-W05-OBS-098'];
for(const id of fixIds){
 const r=cat.external_source_observations_pitre_original_1900_wave05.find(x=>x.id===id);
 assert.ok(r&&r.chapter_group==='XL'&&r.original_chapter_group_prior_to_boundary_correction==='XLI');
 assert.ok(r.original_research_label_prior_to_boundary_correction.includes('Villafranca')||r.original_research_label_prior_to_boundary_correction.includes('Mortelle'));
 assert.ok(r.label.includes('Campobello'));
}
const correction=audit.records.find(r=>r.source_lead_id==='PIT1900-SCREEN-099');
assert.equal(correction.original_staged_chapter,'XLI');
assert.equal(correction.corrected_body_chapter,'XL');
assert.equal(correction.research_intake_allowed,false);
assert.equal(correction.linked_existing_source_id,'PIT1900-W05-OBS-098');
assert.equal(pages.summary.original_body_printed_pages,560);
assert.equal(pages.summary.original_1900_source_observations,667);
assert.equal(pages.summary.printed_pages_with_one_or_more_indexed_observations,307);
assert.equal(pages.summary.printed_pages_with_no_indexed_source_observation,253);
assert.equal(pages.summary.chapter_ids_with_some_indexed_observations,60);
assert.equal(pages.summary.chapter_ids_exhaustively_mined,0);
assert.equal(pages.summary.source_pages_fully_line_by_line_certified,0);
assert.equal(pages.chapters.length,60);
assert.equal(pages.source_page_completion_worklist.length,253);
const pagesWith=new Set(pages.chapters.flatMap(c=>c.indexed_printed_page_locations));
const pagesMissing=new Set(pages.source_page_completion_worklist.map(c=>c.printed_page));
assert.equal(pagesWith.size,307);assert.equal(pagesMissing.size,253);
for(let p=1;p<=560;p++)assert.notEqual(pagesWith.has(p),pagesMissing.has(p));
assert.equal(inventory.summary.all_pitre_1900_source_observations_now,718);
assert.equal(inventory.summary.workbench_source_detail_total,3703);
assert.equal(inventory.summary.body_pages_with_no_indexed_source_observations,202);
assert.equal(inventory.summary.chapters_declared_exhaustively_mined,0);
console.log('PASS Pitrè Wave08: 63/63 adjudicated, +8 research-only actions, 3703 workbench rows, 667 original-edition details, XI/XLI corrected, 307/560 indexed page locations, no app publication.');
