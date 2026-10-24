import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const d='data/customs/master/';
const source=load(d+'pitre-1900-original-ocr-unmined-messina-ragusa-scicli-comiso-mazara-calatafimi-wave03.v1.json');
const final=load(d+'pitre-1900-uploaded-facsimile-156-wave03-remaining-original-page-verifications.v1.json');
const previous=load(d+'pitre-1900-uploaded-facsimile-121-stage01-stage02-new-original-page-verifications.v1.json');
const old=load(d+'pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json');
const prior16=load(d+'pitre-1900-uploaded-facsimile-25p0-16-wave03-page-gates.v1.json');
const originalP0=prior16.original_129_p0_page_checks;
const originalP1=load(d+'pitre-1900-uploaded-facsimile-17-p1-date-region-page-gates.v1.json');
const originalP2=load(d+'pitre-1900-uploaded-facsimile-87-p2-original-page-verifications.v1.json');
const closed=load(d+'pitre-1900-current-zero-outstanding-original-edition-page-queue.v1.json');
const historical=load(d+'pitre-1900-156-wave03-remaining-original-folio-page-queue.v1.json');
const catalogue=load(d+'comprehensive-customs-working-catalogue.v1.json');
assert.equal(source.records.length,172);
assert.equal(final.records.length,156);
assert.equal(previous.records.length,121);
assert.equal(old.records.length,129);
assert.equal(prior16.additional_wave03_highrisk_page_checks.length,16);
assert.equal(closed.records.length,0);
assert.equal(historical.records.length,156);
assert.equal(closed.summary.original_printed_page_checks_verified,422);
assert.equal(final.summary.verified_original_1900_observations_total,422);
assert.equal(final.summary.remaining_1900_source_page_checks,0);
assert.deepEqual(final.summary.source_section_counts,{
 MESSINA_ASSUNTA:43,RAGUSA_GEORGE_JOHN:37,SCICLI_MILIZIE:29,
 COMISO_EASTER:15,MAZARA_ST_VITUS:18,CALATAFIMI_CRUCIFIX:14
});
assert.equal(final.summary.distinct_pdf_pages_reviewed,49);
const bySource=new Map(source.records.map(x=>[x.id,x]));
const byIndex=new Map(catalogue.external_source_observations_pitre_original_1900_new_ocr.map(x=>[x.id,x]));
const historicalIds=new Set(historical.records.map(x=>x.id));
const finalIds=new Set();
const pages=new Set();
function expectedPrinted(p){
 if(p>=209&&p<=212)return p-62;
 if((p>=213&&p<=226)||(p>=381&&p<=406)||(p>=553&&p<=563))return p-58;
 throw new Error('Out-of-scope scan PDF page '+p);
}
for(const x of final.records){
 assert.ok(historicalIds.has(x.id)&&bySource.has(x.id)&&byIndex.has(x.id));
 assert.ok(!finalIds.has(x.id),'Duplicate source ID in finished original page audit');
 finalIds.add(x.id);
 const original=bySource.get(x.id),row=byIndex.get(x.id);
 assert.equal(x.original_1900_ocr_line,original.ocr_line);
 assert.equal(x.original_description,original.action_or_detail_summary);
 assert.equal(x.original_feast_complex,original.feast_complex);
 assert.equal(x.original_printed_page,expectedPrinted(x.original_scan_pdf_page_1_based));
 assert.equal(row.original_1900_printed_page,x.original_printed_page);
 assert.equal(row.original_1900_scan_pdf_page_1_based,x.original_scan_pdf_page_1_based);
 assert.equal(row.original_page_evidence_anchor,x.italian_normalized_anchor);
 assert.equal(row.facsimile_provenance_file,d+'pitre-1900-uploaded-facsimile-156-wave03-remaining-original-page-verifications.v1.json');
 assert.equal(row.original_page_evidence_anchor_form,'NORMALIZED_SEARCH_LOCATOR_NOT_VERBATIM');
 assert.equal(row.original_printed_folio_verified,true);
 assert.equal(x.normalized_ocr_phrase_exactly_once_on_pdf_page,true);
 assert.equal(x.original_source_page_contact_image_visually_reviewed,true);
 assert.equal(x.facsimile_original_1900_printed_folio_confirmed,true);
 assert.ok(x.italian_normalized_anchor.length>=3);
 for(const name of ['older_independent_historical_witness_read','same_author_1881_independent',
    'approved_catholic_ritual_text_verified','current_calendar_date_verified',
    'distinct_custom_certified','app_published'])assert.equal(x[name],false);
 assert.equal(row.official_1962_rite_approved,false);
 assert.equal(row.source_independence_certified,false);
 assert.equal(row.unique_practice_identity_certified,false);
 assert.equal(row.present_continuity_certified,false);
 assert.equal(row.publication_state,'RESEARCH_ONLY');
 pages.add(x.original_scan_pdf_page_1_based);
}
assert.deepEqual(finalIds,historicalIds);
assert.equal(pages.size,49);
const allNewSources=new Set([
 ...previous.records.map(x=>x.source_id),
 ...prior16.additional_wave03_highrisk_page_checks.map(x=>x.source_id),
 ...final.records.map(x=>x.id)
]);
assert.equal(allNewSources.size,293);
assert.deepEqual(allNewSources,new Set(catalogue.external_source_observations_pitre_original_1900_new_ocr.map(x=>x.id)));
assert.equal(catalogue.external_source_observations_pitre_original_1900_new_ocr.filter(x=>x.original_printed_folio_verified).length,293);
assert.equal(catalogue.external_source_observations_pitre_original_1900_ocr.filter(x=>x.printed_scan_page_verified).length,129);
const totalPageSet=new Set([
 ...originalP0.map(x=>x.pdf_page_1_based),
 ...prior16.additional_wave03_highrisk_page_checks.map(x=>x.pdf_page_1_based),
 ...originalP1.records.map(x=>x.original_scan_pdf_page_1_based),
 ...originalP2.records.map(x=>x.pdf_page_1_based),
 ...previous.records.map(x=>x.pdf_page_1_based),
 ...final.records.map(x=>x.original_scan_pdf_page_1_based)
]);
assert.equal(totalPageSet.size,144);
assert.equal(catalogue.summary.source_review.pitre_1900_original_129_verified,129);
assert.equal(catalogue.summary.source_review.pitre_1900_new_293_original_folio_images_verified,293);
assert.equal(catalogue.summary.source_review.pitre_1900_all_original_folio_record_checks,422);
assert.equal(catalogue.summary.source_review.pitre_1900_unchecked_record_pages_remaining,0);
assert.equal(catalogue.summary.source_review.pitre_1900_full_422_unique_pdf_pages_checked,144);
assert.equal(catalogue.summary.source_review.pitre_1900_new_remaining_page_checks,0);
assert.equal(catalogue.summary.source_review.pitre_1900_2026_folio_verification_completed,true);
assert.equal(catalogue.summary.source_observations.total_source_detail_rows_including_external,3407);
assert.equal(catalogue.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(catalogue.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(catalogue.summary.no_new_app_publications,true);
assert.equal(closed.summary.authenticated_1962_ritual_approvals,0);
assert.equal(closed.summary.new_unique_customs_certified,0);
assert.equal(closed.summary.new_app_publications,0);
console.log('Pitrè 1900 original edition complete: 422/422 source-detail folios, 144 distinct scan pages, 0 further page queue, 3407 nonunique research rows, 408 groups and no rite/identity/publication promotions — PASS');
