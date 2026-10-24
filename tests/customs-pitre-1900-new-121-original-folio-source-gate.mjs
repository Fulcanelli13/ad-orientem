import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const d='data/customs/master/';
const wave=read(d+'pitre-1900-uploaded-facsimile-121-stage01-stage02-new-original-page-verifications.v1.json');
const one=read(d+'pitre-1900-new-rosalia-cosmas-piazza-original-ocr-stage01.v1.json');
const two=read(d+'pitre-1900-new-gangi-gratteri-geraci-marineo-original-ocr-stage02.v1.json');
const old=read(d+'pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json');
const other16=read(d+'pitre-1900-uploaded-facsimile-25p0-16-wave03-page-gates.v1.json');
const queue=read(d+'pitre-1900-156-wave03-remaining-original-folio-page-queue.v1.json');
const catalogue=read(d+'comprehensive-customs-working-catalogue.v1.json');
assert.equal(wave.records.length,121);
assert.equal(one.records.length,68);assert.equal(two.records.length,53);
assert.equal(wave.summary.source_sections_checked,7);
assert.equal(wave.summary.unique_source_pdf_pages_checked,48);
assert.equal(wave.summary.new_verified_all_pitre_records,266);
assert.equal(wave.summary.still_pending_new_observations,156);
assert.equal(wave.source.compressed_user_supplied_scan_sha256,
'100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee');
assert.deepEqual(wave.summary.per_section,{
 ROSALIA_PALERMO:27,COSMAS_DAMIAN_PALERMO:29,ASSUMPTION_PIAZZA_ARMERINA:12,
 HOLY_SPIRIT_GANGI:5,SAINT_JAMES_GRATTERI:10,BLESSED_SACRAMENT_GERACI:16,SAINT_CYRUS_MARINEO:22
});
const sourceRows=[...one.records,...two.records];
const master=new Map(catalogue.external_source_observations_pitre_original_1900_new_ocr.map(x=>[x.id,x]));
const ids=new Set(),pages=new Set(),cohorts=new Map();
function expectedPrinted(pdf){
 if(pdf<=75)return pdf-70;
 if(pdf<=88)return pdf-66;
 if(pdf<=99)return pdf-62;
 if(pdf>=133&&pdf<=201)return pdf-62;
 if(pdf>=615&&pdf<=618)return pdf-58;
 throw new Error('Unexpected source-page offset: '+pdf);
}
for(let i=0;i<121;i++){
 const v=wave.records[i],prior=sourceRows[i],index=master.get(v.source_id);
 assert.equal(v.source_id,'PIT1900-NEW-'+String(i+1).padStart(3,'0'));
 assert.equal(v.source_id,prior.id);
 assert.ok(!ids.has(v.source_id));ids.add(v.source_id);
 assert.equal(v.source_original_html_ocr_line,prior.source_ocr_html_line);
 assert.equal(v.source_action_or_detail,prior.description);
 assert.equal(v.source_section,prior.source_section);
 assert.equal(v.pdf_page_1_based,index.original_1900_scan_pdf_page_1_based);
 assert.equal(v.printed_page,index.original_1900_printed_page);
 assert.equal(v.printed_page,expectedPrinted(v.pdf_page_1_based));
 assert.equal(v.italian_normalized_text_anchor,index.original_page_evidence_anchor);
 assert.equal(index.facsimile_provenance_file,d+'pitre-1900-uploaded-facsimile-121-stage01-stage02-new-original-page-verifications.v1.json');
 assert.equal(index.original_printed_folio_verified,true);
 assert.equal(index.original_page_evidence_anchor_form,'NORMALIZED_SEARCH_LOCATOR_NOT_VERBATIM');
 assert.ok(v.italian_normalized_text_anchor.length>=4);
 assert.equal(v.italian_anchor_matched_in_uploaded_pdf_text_layer,true);
 assert.equal(v.source_page_image_in_contact_sheet_reviewed,true);
 assert.equal(v.original_1900_edition_folio_located,true);
 for(const flag of ['author_independence_certified','independent_historical_witness_verified',
   'ecclesiastical_ritual_authorization_verified','modern_calendar_continuity_verified',
   'unique_practice_identity_certified','app_publication'])assert.equal(v[flag],false);
 assert.equal(index.source_independence_certified,false);
 assert.equal(index.official_1962_rite_approved,false);
 assert.equal(index.unique_practice_identity_certified,false);
 assert.equal(index.present_continuity_certified,false);
 assert.equal(index.publication_state,'RESEARCH_ONLY');
 pages.add(v.pdf_page_1_based);
 cohorts.set(v.source_section,(cohorts.get(v.source_section)||0)+1);
}
assert.equal(ids.size,121);assert.equal(pages.size,48);
assert.equal(old.records.length,129);
assert.equal(catalogue.external_source_observations_pitre_original_1900_ocr.filter(x=>x.printed_scan_page_verified).length,129);
const verifiedNew=new Set(catalogue.external_source_observations_pitre_original_1900_new_ocr.filter(x=>x.original_printed_folio_verified).map(x=>x.id));
assert.equal(verifiedNew.size,137);
assert.equal(other16.additional_wave03_highrisk_page_checks.length,16);
for(const x of other16.additional_wave03_highrisk_page_checks){assert.ok(verifiedNew.has(x.source_id));assert.ok(!ids.has(x.source_id));}
const pending=new Set(catalogue.external_source_observations_pitre_original_1900_new_ocr.filter(x=>!x.original_printed_folio_verified).map(x=>x.id));
assert.equal(pending.size,156);assert.equal(queue.records.length,156);
assert.deepEqual(pending,new Set(queue.records.map(x=>x.id)));
assert.equal(catalogue.summary.source_review.pitre_1900_all_original_folio_record_checks,266);
assert.equal(catalogue.summary.source_review.pitre_1900_new_293_original_folio_images_verified,137);
assert.equal(catalogue.summary.source_review.pitre_1900_new_remaining_page_checks,156);
assert.equal(catalogue.summary.source_review.pitre_1900_full_422_unique_pdf_pages_checked,107);
assert.equal(catalogue.summary.source_observations.total_source_detail_rows_including_external,3407);
assert.equal(catalogue.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(catalogue.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(catalogue.summary.no_new_app_publications,true);
console.log('Pitrè uploaded 1900: 121 newly original-page matched source rows (7 chapters/48 PDF pages); 266/422 checked, 156 pending, no evidence-gate promotions — PASS');
