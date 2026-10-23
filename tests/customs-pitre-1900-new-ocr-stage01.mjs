import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = p => JSON.parse(readFileSync(p,'utf8'));
const prior = load('data/customs/master/pitre-1900-feste-patronali-original-edition-ocr-actions-wave01.v1.json');
const latest = load('data/customs/master/pitre-1900-new-rosalia-cosmas-piazza-original-ocr-stage01.v1.json');
const census = load('data/customs/master/comprehensive-customs-source-census.v1.json');
assert.equal(prior.records.length,129);
assert.equal(latest.records.length,68);
assert.deepEqual(latest.summary.section_counts,{
  ROSALIA_PALERMO:27, COSMAS_DAMIAN_PALERMO:29, ASSUMPTION_PIAZZA_ARMERINA:12
});
assert.equal(latest.prior_baselines_unchanged.old_source_detail_catalogue_rows,3114);
assert.equal(latest.prior_baselines_unchanged.old_provisional_groups,408);
assert.equal(latest.summary.original_printed_page_facsimiles_checked,0);
assert.equal(latest.summary.new_distinct_customs_certified,0);
assert.equal(latest.summary.publication_count,0);
const existingIds=new Set(prior.records.map(r=>r.id));
const newIds=new Set();
const textIdents=new Set();
for(let i=0;i<latest.records.length;i++){
  const r=latest.records[i];
  assert.equal(r.id,'PIT1900-NEW-'+String(i+1).padStart(3,'0'));
  assert.ok(!existingIds.has(r.id) && !newIds.has(r.id),'collision or duplicate Pitrè ID');
  newIds.add(r.id);
  assert.ok(Number.isInteger(r.source_ocr_html_line));
  assert.ok((r.source_ocr_html_line>=2430 && r.source_ocr_html_line<=5100) ||
    (r.source_ocr_html_line>=20600 && r.source_ocr_html_line<=20733),'outside directly read chapter spans');
  assert.equal(r.original_edition_year,1900);
  assert.equal(r.source_url,latest.source.original_text_url);
  assert.ok(r.description.length>35);
  assert.ok(r.classification && r.locality && r.occasion);
  const identity=r.source_section+'|'+r.source_ocr_html_line+'|'+r.description.toLowerCase();
  assert.ok(!textIdents.has(identity),'duplicate extracted detail');
  textIdents.add(identity);
  for(const gated of ['printed_folio_image_checked','eyewitness_independently_verified',
    'source_independence_verified','current_practice_continuity_verified',
    'ecclesiastical_approval_verified','unique_custom_identity_certified','app_publication']){
    assert.equal(r[gated],false,gated+' accidentally promoted');
  }
  assert.equal(r.canonical_master_owner,null);
}
assert.equal(newIds.size,68);
assert.equal(census.source_observations.length,568,
 'Prior source census rows must remain unchanged in a separately staged Pitrè intake');
console.log('Pitrè recovered original OCR: 68 independently located STAGED details, old 129 IDs intact, 3114 unified baseline unchanged, 408 groups preserved, no publication — PASS');
