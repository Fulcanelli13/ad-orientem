import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = path => JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const p = load('../data/artwork/phase51-photo-readiness-15-objects.v1.json');
const owners = load('../data/artwork/phase50-institutional-object-passports.v1.json');
const canonical = load('../data/artwork/canonical-selected-photo-identity-decisions.v1.json');

const passIds = owners.passports.flatMap(x=>x.selected_ids);
assert.equal(owners.passports.length,15);
assert.equal(passIds.length,18);
assert.equal(new Set(passIds).size,18);
assert.equal(p.image_pixels_goal.short_side_px,1200);
assert.equal(p.consumer_mode,'RESEARCH_ONLY_NOT_IMPORTED_BY_APP');
assert.equal(p.selected_photographs.length,18);
assert.equal(p.counts.below_short_side_target,18);
assert.equal(p.counts.release_eligible,0);
assert.equal(p.counts.source_photo_bytes_newly_tested,0);
assert.equal(canonical.verified_object_links.length,14);
assert.equal(canonical.scope.rejected_research_source_records_kept_excluded,1599);
const rows=new Map();
for(const r of p.selected_photographs){
  assert.ok(passIds.includes(r.selected_id), 'Unknown selected row: '+r.selected_id);
  assert.ok(!rows.has(r.selected_id), 'Duplicate selected row: '+r.selected_id);
  rows.set(r.selected_id,r);
  const owner=owners.passports.find(a=>a.selected_ids.includes(r.selected_id));
  assert.equal(r.physical_object_id,owner.physical_id);
  assert.equal(r.museum_catalogue_url,owner.official_catalogue);
  assert.equal(r.low_resolution_for_proposed_1200_short_px,true);
  assert.ok(r.selected_original_short_side_px>0&&r.selected_original_short_side_px<1200);
  assert.equal(r.short_side_pixels_missing_to_target,1200-r.selected_original_short_side_px);
  assert.equal(r.photo_commercial_reuse_status,'NOT_CLEARED_FOR_DEPLOYMENT');
  assert.equal(r.editorial_approval,'NOT_INFERRED_FROM_HANDPICKING');
  assert.equal(r.release_eligible,false);
  assert.equal(r.automatically_replace_selected_photo,false);
  assert.equal(r.photo_pixels_downloaded_and_inspected,false);
  assert.ok(r.institutional_policy_url.startsWith('https://'));
  assert.ok(r.selected_commons_file_page.startsWith('https://commons.wikimedia.org/wiki/File:'));
}
assert.equal(rows.size,18);
assert.equal(new Set([...rows.values()].map(x=>x.physical_object_id)).size,15);
for(const a of owners.passports){
  for(const id of a.selected_ids){
    const x=rows.get(id);
    assert.ok(x,'Missing selected row '+id);
    assert.deepEqual(x.possible_same_object_other_selected_ids,a.selected_ids.filter(i=>i!==id));
  }
}
assert.equal(p.alternative_nonhandpicked_research_leads.length,1);
for(const x of p.alternative_nonhandpicked_research_leads){
  assert.equal(x.owner_selected,false);
  assert.equal(x.automatically_admit,false);
  assert.equal(x.status,'HOLD_FOR_EXACT_PHOTO_PROVENANCE_AND_VISUAL_QA');
  assert.ok(x.original_pixels.width>=1200&&x.original_pixels.height>=1200);
}
assert.equal(p.hard_guards.no_selected_photo_replacement_without_explicit_approval,true);
assert.equal(p.hard_guards.no_commons_promotion_of_unhandpicked,true);
assert.equal(p.hard_guards.require_visual_qa_of_new_image_bytes,true);
assert.equal(p.hard_guards.require_exact_photo_license,true);
console.log('Phase 51 PASS: 18/18 sources below 1200px short-side target; 15 accession-backed objects; 0 releases; 14 historical cross-register links preserved.');
