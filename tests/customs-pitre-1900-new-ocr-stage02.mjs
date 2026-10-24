import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(p,'utf8'));
const prior=load('data/customs/master/pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json');
const one=load('data/customs/master/pitre-1900-new-rosalia-cosmas-piazza-original-ocr-stage01.v1.json');
const two=load('data/customs/master/pitre-1900-new-gangi-gratteri-geraci-marineo-original-ocr-stage02.v1.json');
const currentCatalog=load('data/customs/master/comprehensive-customs-working-catalogue.v1.json');
assert.equal(prior.records.length,129);
assert.equal(one.records.length,68);
assert.equal(two.records.length,53);
assert.deepEqual(two.summary.per_section,{HOLY_SPIRIT_GANGI:5,SAINT_JAMES_GRATTERI:10,BLESSED_SACRAMENT_GERACI:16,SAINT_CYRUS_MARINEO:22});
assert.equal(two.summary.total_staged_across_both,121);
assert.equal(two.summary.original_folio_images_inspected,0);
assert.equal(two.summary.unique_customs_certified,0);
assert.equal(two.summary.app_publications,0);
const ids=new Set(prior.records.map(x=>x.id));
for(let i=0;i<one.records.length+two.records.length;i++){
  const r=i<one.records.length?one.records[i]:two.records[i-one.records.length];
  assert.equal(r.id,'PIT1900-NEW-'+String(i+1).padStart(3,'0'));
  assert.ok(!ids.has(r.id),'Pitrè ID collision');
  ids.add(r.id);
  const isSecond=i>=one.records.length;
  const ocrLine=isSecond?r.source_ocr_html_line:r.source_ocr_html_line;
  assert.ok(Number.isInteger(ocrLine));
  assert.ok(r.description.length>35);
  if(isSecond){
    assert.ok(ocrLine>=6292&&ocrLine<=6855);
    assert.ok(r.locality&&r.classification&&r.source_section);
    assert.equal(r.original_printed_folio_image_verified,false);
    assert.equal(r.independent_author_corroboration_verified,false);
    assert.equal(r.ecclesiastical_authority_or_approved_rite_verified,false);
    assert.equal(r.unique_identity_verified,false);
    assert.equal(r.current_continuity_verified,false);
    assert.equal(r.canonical_master_id,null);
    assert.equal(r.publication_status,'RESEARCH_ONLY_NOT_PUBLISHED');
  }else{
    assert.equal(r.printed_folio_image_checked,false);
    assert.equal(r.canonical_master_owner,null);
    assert.equal(r.app_publication,false);
  }
}
assert.equal(ids.size,250);
assert.equal(two.records.some(r=>r.classification==='HOUSEHOLD_BLESSING_AUTHORITY_HOLD'),true);
assert.equal(two.records.some(r=>r.classification==='FOLK_EFFICACY_CLAIM_HOLD'),true);
assert.equal(two.records.some(r=>r.classification==='HISTORICAL_ALTERNATING_VARIANT'),true);

assert.equal(currentCatalog.external_source_observations_pitre_original_1900_new_ocr.length,293);
assert.equal(currentCatalog.summary.source_observations.total_source_detail_rows_including_external,3703);
assert.equal(currentCatalog.summary.source_observations.pitre_1900_original_new_seven_sections_ocr_details,121);
assert.equal(currentCatalog.summary.identity_working_rows.provisional_after_53_no_owner_action_review,408);
assert.equal(currentCatalog.summary.identity_working_rows.final_uniquely_verified_customs_added,0);
assert.equal(currentCatalog.external_source_observations_pitre_original_1900_ocr.length,129,
  'Original 129 remain in unified catalogue; 121 new staging records must not silently be counted as certified customs');
assert.equal(currentCatalog.summary.no_new_app_publications,true);
console.log('Pitrè 1900 121 fresh staged OCR details across 7 unmined chapters; 129 old records retained; no folio-verified/independent/ritual/identity/app promotions — PASS');
