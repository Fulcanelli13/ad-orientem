import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const root='data/customs/master/';
const stage=load(root+'pitre-1900-unmined-chapters-xi-xiii-xviii-xx-xxii-xxv-wave04.v1.json');
const queue=load(root+'pitre-1900-wave04-105-source-image-review-queue.v1.json');
const cat=load(root+'comprehensive-customs-working-catalogue.v1.json');
const old=cat.external_source_observations_pitre_original_1900_ocr;
const previous=cat.external_source_observations_pitre_original_1900_new_ocr;
const indexed=cat.external_source_observations_pitre_original_1900_wave04;
assert.equal(old.length,129);assert.equal(previous.length,293);
assert.equal(stage.records.length,105);
assert.equal(indexed.length,105);
assert.equal(queue.records.length,105);
assert.equal(new Set(stage.records.map(r=>r.source_chapter)).size,11);
assert.deepEqual(stage.summary.chapter_counts,{
  XI_CASTRONOVO_VITALE:7,
  XIII_NOVARA_TUSA_ASSUNTA:11,
  XIV_GIOIOSA_NICOLA:12,
  XV_SAN_MARCO_NICOLA:9,
  XVI_FIUMEDINISI_ANNUNZIATA:9,
  XVII_CASALVECCHIO_ONOFRIO:11,
  XVIII_NASO_CONO:11,
  XX_TRECASTAGNE_ALFIO:10,
  XXI_CERAMI_LAVINA:8,
  XXII_PALAGONIA_FEBRONIA:7,
  XXV_TROINA_SILVESTRO:10
});
const priorIds=new Set([...old,...previous].map(r=>r.id));
const seen=new Set(), queueIds=new Set(queue.records.map(r=>r.id));
assert.equal(queueIds.size,105);
for(let i=0;i<105;i++){
  const r=stage.records[i], m=indexed[i];
  assert.equal(r.id,'PIT1900-UNMINED-'+String(i+1).padStart(3,'0'));
  assert.ok(!priorIds.has(r.id),'A previous Pitrè ID may not be overwritten');
  assert.ok(!seen.has(r.id)); seen.add(r.id);
  assert.equal(m.id,r.id);
  assert.equal(m.label,r.action_or_detail);
  assert.equal(m.chapter_group,r.source_chapter);
  assert.equal(m.original_printed_page,r.original_printed_page);
  assert.equal(m.original_scan_pdf_page_1_based,r.original_scan_pdf_page_1_based);
  assert.equal(m.italian_normalized_anchor,r.original_italian_text_anchor);
  assert.ok(typeof r.original_italian_text_anchor==='string'&&r.original_italian_text_anchor.length>=11);
  assert.equal(r.original_scan_pdf_page_1_based-r.original_printed_page,r.original_scan_pdf_page_1_based<210?62:58);
  assert.equal(r.page_text_anchor_verified,true);
  assert.equal(m.original_pdf_text_anchor_confirmed,true);
  assert.equal(m.individual_page_image_visually_certified,false);
  assert.equal(m.unique_custom_identity_certified,false);
  assert.equal(m.working_master_owner,null);
  assert.equal(m.publication_state,'RESEARCH_ONLY');
  for(const flag of ['independent_historical_author_verified','ecclesiastical_ritual_approval_verified','current_practice_verified','unique_practice_identity_certified','app_published'])assert.equal(r[flag],false);
  const q=queue.records[i];assert.equal(q.id,r.id);assert.equal(q.original_italian_pdf_text_match,true);
  assert.equal(q.individual_page_image_confirmed,false);
  assert.equal(q.identity_certified,false);
  assert.equal(q.publicly_published,false);
}
assert.equal(cat.summary.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(cat.summary.source_observations.pitre_1900_wave04_new_original_edition_pdf_text_anchored_details,105);
assert.equal(cat.summary.source_observations.pitre_1900_all_1900_source_detail_records_now,718);
assert.equal(cat.summary.source_review.pitre_1900_1900_chapter_groups_with_some_indexed_evidence,60);
assert.equal(cat.summary.source_review.pitre_1900_1900_chapter_groups_unrepresented_in_this_register,0);
assert.equal(cat.summary.source_review.pitre_1900_1900_total_indexed_source_details,718);
assert.equal(cat.summary.source_review.pitre_1900_verified_all_original_1900_pdf_source_rows,422);
assert.equal(cat.summary.source_review.pitre_1900_wave04_individual_folio_image_verification_pending,105);
assert.equal(cat.summary.source_review.pitre_1900_full_527_original_image_checks_complete,false);
assert.equal(cat.summary.source_review.pitre_1900_2026_folio_verification_completed,false);
assert.equal(cat.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(cat.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(cat.summary.no_new_app_publications,true);
console.log('Pitrè 1900 Wave04: 105 genuine new chapter-level source observations, 11 newly represented index sections, 3703 total, 718 Pitrè, 105 individual image checks pending, no publication — PASS');
