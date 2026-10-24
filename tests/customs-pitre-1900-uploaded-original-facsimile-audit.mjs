import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const source=load('data/customs/master/pitre-1900-uploaded-facsimile-25p0-16-wave03-page-gates.v1.json');
const gate=load('data/customs/master/pitre-1900-129-original-witness-facsimile-and-1881-dependency-gates.v1.json');
const p0base=load('data/customs/master/pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json');
const wave3=load('data/customs/master/pitre-1900-original-ocr-unmined-messina-ragusa-scicli-comiso-mazara-calatafimi-wave03.v1.json');
const catalog=load('data/customs/master/comprehensive-customs-working-catalogue.v1.json');
assert.equal(source.source.uploaded_compressed_scan_sha256,'100e2b3164bd7a342c5c0c5d01df2a60b4635d5695dea456e9b93769866ee5ee');
assert.equal(source.source.uploaded_compressed_scan_bytes,4476151);
assert.equal(source.source.pdf_page_count_direct_library_read,632);
assert.equal(source.original_129_p0_page_checks.length,25);
assert.equal(source.additional_wave03_highrisk_page_checks.length,16);
assert.equal(source.summary.individually_anchored_original_edition_records,41);
const expectedP0=new Set(gate.records.filter(r=>r.priority==='P0_SOURCE_CRITICAL').map(r=>r.original_source_id));
const original=new Map(p0base.records.map(r=>[r.id,r]));
const third=new Map(wave3.records.map(r=>[r.id,r]));
const all=new Set(), pages=new Set();
for(const record of source.original_129_p0_page_checks){
 assert.ok(expectedP0.has(record.source_id),'Only P0 original records should be included');
 assert.ok(original.has(record.source_id),'Missing original author witness');
 assert.equal(record.original_1900_ocr_line,original.get(record.source_id).html_ocr_line);
 assert.deepEqual(record.validation_flags_retained,gate.records.find(g=>g.original_source_id===record.source_id).validation_flags);
 all.add(record.source_id);
}
assert.equal(all.size,25);
assert.deepEqual(all,expectedP0);
for(const record of source.additional_wave03_highrisk_page_checks){
 assert.ok(third.has(record.source_id),'High-risk staged ID must exist');
 assert.ok(!all.has(record.source_id),'Original/new collision');
 all.add(record.source_id);
}
assert.equal(all.size,41);
for(const record of [...source.original_129_p0_page_checks,...source.additional_wave03_highrisk_page_checks]){
 assert.ok(Number.isInteger(record.pdf_page_1_based)&&record.pdf_page_1_based>=1&&record.pdf_page_1_based<=632);
 assert.ok(Number.isInteger(record.printed_page)&&record.printed_page>=1&&record.printed_page<=600);
 assert.ok(record.italian_text_layer_anchor.length>=11);
 assert.equal(record.page_image_visually_inspected,true);
 assert.equal(record.text_anchor_checked,true);
 assert.equal(record.original_edition_page_identified,true);
 assert.equal(record.historical_independent_source_attested,false);
 assert.equal(record.formal_rite_authorized,false);
 assert.equal(record.folk_miracle_certified,false);
 assert.equal(record.unique_practice_certified,false);
 assert.equal(record.app_published,false);
 pages.add(record.pdf_page_1_based);
}
assert.equal(pages.size,33);
assert.equal(source.summary.unique_pdf_folios_examined,33);
assert.equal(source.summary.total_research_source_detail_rows_unchanged,3407);
assert.equal(catalog.summary.source_observations.total_source_detail_rows_including_external,3407);
assert.equal(catalog.summary.source_review.pitre_1900_original_folio_images_visually_checked,129);
assert.equal(catalog.summary.source_review.pitre_1900_new_293_original_folio_images_verified,137);
assert.equal(catalog.summary.source_review.pitre_1900_uploaded_facsimile_total_located_observations,41);
assert.equal(catalog.summary.source_review.pitre_1900_uploaded_facsimile_unique_pdf_pages_checked,42);
assert.equal(catalog.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(catalog.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(catalog.summary.no_new_app_publications,true);
assert.equal(catalog.source_dataset_paths.pitre_1900_uploaded_original_scan_page_verification,'data/customs/master/pitre-1900-uploaded-facsimile-25p0-16-wave03-page-gates.v1.json');
const indexedOld=new Map(catalog.external_source_observations_pitre_original_1900_ocr.map(r=>[r.id,r]));
const indexedNew=new Map(catalog.external_source_observations_pitre_original_1900_new_ocr.map(r=>[r.id,r]));
for(const p of source.original_129_p0_page_checks){
 const idx=indexedOld.get(p.source_id);
 assert.equal(idx.printed_scan_page_verified,true);
 assert.equal(idx.original_1900_printed_page,p.printed_page);
 assert.equal(idx.original_1900_scan_pdf_page_1_based,p.pdf_page_1_based);
 assert.equal(idx.original_page_evidence_anchor,p.italian_text_layer_anchor);
}
for(const p of source.additional_wave03_highrisk_page_checks){
 const idx=indexedNew.get(p.source_id);
 assert.equal(idx.original_printed_folio_verified,true);
 assert.equal(idx.original_1900_printed_page,p.printed_page);
 assert.equal(idx.original_1900_scan_pdf_page_1_based,p.pdf_page_1_based);
 assert.equal(idx.original_page_evidence_anchor,p.italian_text_layer_anchor);
}
assert.equal(catalog.external_source_observations_pitre_original_1900_ocr.filter(r=>r.printed_scan_page_verified).length,129);
assert.equal(catalog.external_source_observations_pitre_original_1900_new_ocr.filter(r=>r.original_printed_folio_verified).length,137);
console.log('Pitrè 1900 UPLOADED SCAN: 25/25 P0 plus 16 high-risk records located in 33 rendered printed original pages, 3407 corpus unchanged, zero rite/identity/publication certification — PASS');
