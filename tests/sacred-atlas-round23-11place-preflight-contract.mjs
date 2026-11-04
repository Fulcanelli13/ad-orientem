import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const folder='data/geography/research/';
const manifest=JSON.parse(readFileSync(folder+'sacred-atlas-round22-11place-verified-sources-20261104.json','utf8'));
const pre=JSON.parse(readFileSync(folder+'sacred-atlas-round23-11place-publication-preflight-20261104.json','utf8'));
assert.equal(pre.schema,'AO_SACRED_ATLAS_R23_11PLACE_RELEASE_PREFLIGHT_V1');
assert.equal(pre.summary.places,11);
assert.equal(pre.summary.byte_verified_originals,25);
assert.equal(pre.summary.editorially_selected,0);
assert.equal(pre.summary.publication_authorized,0);
assert.equal(pre.baseline_published,379);
assert.equal(pre.baseline_total,530);
assert.equal(pre.places.length,manifest.places.length);
assert.equal(pre.places.reduce((n,p)=>n+p.source_verified_photos,0),25);
assert.equal(new Set(pre.places.map(p=>p.place_id)).size,11);
for(const place of pre.places){
 const original=manifest.places.find(p=>p.place_id===place.place_id);
 assert.ok(original,'known Place ID');
 assert.equal(place.source_verified_photos,original.photo_candidates.length);
 assert.deepEqual(place.candidate_files,original.photo_candidates.map(c=>c.file));
 assert.equal(place.source_credit_requirements.length,original.photo_candidates.length);
 assert.ok(/^https:\/\/commons\.wikimedia\.org\//.test(place.source_evidence),'Commons evidence');
 for(const [i,credit] of place.source_credit_requirements.entries()){
  const c=original.photo_candidates[i];
  for(const key of ['file','author','license','license_url','source_url'])assert.equal(credit[key],c[key],key+' must match verified manifest');
  assert.equal(credit.license_link_required,true);
  assert.equal(credit.modification_notice_required_for_cropped_derivative,true);
 }
 assert.equal(place.visual_composition_state,'NOT_OWNER_APPROVED');
 assert.equal(place.foreground_rights_state,'UNRESOLVED');
 assert.equal(place.cropping_state,'NOT_VALIDATED');
 assert.equal(place.publication_state,'HOLD');
}
const seton=pre.places.find(p=>p.place_id==='place:US:seton-emmitsburg');
assert.equal(seton.comparison_lead.binary_status,'NOT_YET_VERIFIED');
assert.equal(seton.comparison_lead.width,7842);
const altoetting=pre.places.find(p=>p.place_id==='place:DE:friedhofskirche-st-michael-altoetting');
assert.equal(altoetting.source_verified_photos,15);
assert.ok(altoetting.candidate_files.includes('File:Friedhofskirche Altötting 16.jpg'));
console.log('Round 23: 11 sites, 25 credit requirements, all unapproved and unpublishable pending gates.');
