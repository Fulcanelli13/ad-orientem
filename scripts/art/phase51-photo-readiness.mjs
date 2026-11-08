import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Deterministic, offline and fail-closed. Run from repo root:
// node scripts/art/phase51-photo-readiness.mjs
// node scripts/art/phase51-photo-readiness.mjs --json
// This never downloads, edits, publishes, or creates asset files.
const here = import.meta.url;
const load = p => JSON.parse(readFileSync(new URL(p, here), 'utf8'));
const source = load('../../data/artwork/phase51-photo-readiness-15-objects.v1.json');
const passports = load('../../data/artwork/phase50-institutional-object-passports.v1.json');
const links = load('../../data/artwork/canonical-selected-photo-identity-decisions.v1.json');
const threshold = source.image_pixels_goal.short_side_px;

assert.equal(source.consumer_mode, 'RESEARCH_ONLY_NOT_IMPORTED_BY_APP');
assert.equal(source.selected_photographs.length, 18);
assert.equal(passports.passports.length, 15);
const mapping = new Map(passports.passports.flatMap(p => p.selected_ids.map(id => [id, p])));
assert.equal(mapping.size, 18);
const selectedSet = new Set();
const groups = new Map();
for(const p of source.selected_photographs) {
  assert.ok(!selectedSet.has(p.selected_id), 'Duplicate selected id: '+p.selected_id);
  selectedSet.add(p.selected_id);
  assert.ok(mapping.has(p.selected_id), 'Selection not present in museum passport: '+p.selected_id);
  assert.equal(p.physical_object_id, mapping.get(p.selected_id).physical_id);
  assert.equal(p.museum_catalogue_url, mapping.get(p.selected_id).official_catalogue);
  assert.equal(p.automatically_replace_selected_photo, false);
  assert.equal(p.release_eligible, false, 'No replacement may be auto-released');
  assert.equal(p.photo_pixels_downloaded_and_inspected, false);
  assert.equal(p.selected_original_short_side_px < threshold,p.low_resolution_for_proposed_1200_short_px);
  assert.equal(p.short_side_pixels_missing_to_target,Math.max(0,threshold-p.selected_original_short_side_px));
  assert.ok(p.selected_commons_file_page.startsWith('https://commons.wikimedia.org/wiki/File:'));
  const cluster = groups.get(p.physical_object_id) ?? [];
  cluster.push(p);
  groups.set(p.physical_object_id, cluster);
}
assert.equal(groups.size,15,'15 unique institutional physical paintings');
assert.equal(links.verified_object_links.length,14,'Do not change cross-register counts in photo workflow');
assert.equal(links.scope.rejected_research_source_records_kept_excluded,1599);
for(const lead of source.alternative_nonhandpicked_research_leads) {
  assert.equal(lead.owner_selected,false);
  assert.equal(lead.automatically_admit,false);
  assert.equal(lead.status,'HOLD_FOR_EXACT_PHOTO_PROVENANCE_AND_VISUAL_QA');
  assert.ok(groups.has(lead.physical_object_id), 'Candidate must reference known exact painting');
}

const actions=[...groups].map(([physical_object_id,photos])=>{
  const worstShort=Math.min(...photos.map(p=>p.selected_original_short_side_px));
  return {
    physical_object_id,
    painting:photos[0].work_title,
    museum:photos[0].museum,
    inventory:photos[0].inventory,
    museum_catalogue_url:photos[0].museum_catalogue_url,
    selected_photographs:photos.map(p=>({id:p.selected_id,original_url:p.selected_commons_file_page,short_side_px:p.selected_original_short_side_px})),
    priority_deficit_px:Math.max(0,threshold-worstShort),
    current_photo_reuse_gate:photos[0].institutional_reuse_gate,
    state:'RESEARCH_ONLY_NEEDS_BETTER_APPROVED_PHOTOGRAPH',
    publication_authorized:false
  };
}).sort((a,b)=>b.priority_deficit_px-a.priority_deficit_px||a.physical_object_id.localeCompare(b.physical_object_id));
if(process.argv.includes('--json')) console.log(JSON.stringify({threshold,summary:source.counts,queue:actions},null,2));
else {
  console.log('Phase 51 photographic readiness: 15 physical paintings / 18 handpicked photo versions.');
  console.log('Resolution below '+threshold+'px short-side: '+source.counts.below_short_side_target+' / 18; cleared for publication: 0.');
  for(const q of actions) console.log(String(q.priority_deficit_px).padStart(4)+' px deficit | '+q.museum+' | '+q.inventory+' | '+q.painting);
}
