import fs from 'node:fs';
import assert from 'node:assert/strict';
// Research-only. Does not promote or publish any assets.
const read = n => JSON.parse(fs.readFileSync('data/calendar/'+n,'utf8'));
const user=read('prayer-art-reviewed117-user-decisions-20261028.v1.json');
const catalog=read('prayer-module-original-31-review-catalog-20261028.v1.json');
const review=read('prayer-31-section-review-reconciliation-20261028.v1.json');
const heroes=read('prayer-hero-wave1-release-manifest-20261028.v1.json');
const rows=review.modules.flatMap(x=>x.placements);
const actions=['keep','reject','better-photo','elsewhere'];
const counts=Object.fromEntries(actions.map(x=>[x,rows.filter(y=>y.action===x).length]));
assert.equal(catalog.pools.length,31);
assert.equal(catalog.pools.reduce((n,p)=>n+p.options.length,0),115);
assert.equal(user.decisions.length,117);
assert.equal(rows.length,118);
assert.equal(new Set(rows.map(x=>x.placement_key)).size,118);
assert.deepEqual(counts,{keep:47,reject:51,'better-photo':13,elsewhere:6});
assert.equal(rows.filter(x=>x.action==='unreviewed').length,1);
assert.equal(review.export_only_records_preserved.length,3);
assert.equal(review.relocation_instructions.filter(x=>!x.destination_module_id).length,1);
assert.equal(review.counts.sections_with_keep,27);
assert.equal(heroes.modules.length,6);
/* AO_WAVE1_PHOTO_SOURCE_GUARD: protects source/photo release from editorial drift. */
assert.deepEqual(review.remaining_unreviewed.map(x=>x.placement_key),
  ['sacred-heart::heart-jesus--primary']);
assert.equal(heroes.photo_source_evidence_update.editorial_primaries_changed,0);
assert.equal(heroes.photo_source_evidence_update.historic_approvals_changed,0);
assert.equal(heroes.photo_source_evidence_update.cost_eur,0);
assert.equal(heroes.photo_source_evidence_update.photography_cleared_for_production_in_this_update,0);

const byKey=new Map(rows.map(x=>[x.placement_key,x]));
for(const d of user.decisions){
  const row=byKey.get(d.placement_key);
  assert.ok(row,'missing user placement '+d.placement_key);
  assert.equal(row.action,d.action,'altered user decision '+d.placement_key);
  if(d.action==='elsewhere')assert.equal(row.requested_destination,d.destination||null);
}
assert.deepEqual(heroes.modules.map(x=>x.hero_register_module),['morning','evening','angelus','rosary','confession','sorrows']);
for(const h of heroes.modules){
  assert.equal(h.editorial_primary.user_final,true);
  assert.ok(h.photo_source_recheck,'no exact source QA record for '+h.section);
  assert.match(h.photo_source_recheck.source_page,/^https:\/\//);
  assert.ok(h.photo_source_recheck.source_photo_rights);
  assert.ok(h.photo_source_recheck.first_action);
  assert.ok(h.photo_source_recheck.mobile_critical_content.length);
  assert.ok(h.photo_source_recheck.forbid.length);

  assert.ok(h.editorial_primary.title&&h.editorial_primary.artist);
  if(h.photo.existing_master_acquired_by_previous_manifest)
    assert.match(h.photo.original_sha256_recorded,/^[a-f0-9]{64}$/i);
  // RELEASE-SAFETY: activated entries must carry all independent photo/rights gates.
  if(h.code_activated){
    assert.equal(h.photo.quality_verdict,'PASS');
    assert.equal(h.photo.framing_pass,true);
    assert.equal(h.photo.responsive_crop_approved,true);
    assert.equal(h.photo.app_release,'CLEARED');
    assert.ok(h.asset_id&&h.approved_crops.portrait&&h.approved_crops.landscape);
    assert.equal(h.blockers.length,0);
  }
}
const active=heroes.modules.filter(x=>x.code_activated).length;
if(process.argv.includes('--require-ready'))assert.equal(active,6,'All six images must pass final release gates');
console.log(JSON.stringify({status:'PASS_RESEARCH_CONSISTENCY',reviewed:user.decisions.length,placementRecords:rows.length,
  catalogOrphanDecisionsPreserved:3,unreviewed:1,heroPrimaries:6,
  recordedOriginalMasters:heroes.modules.filter(x=>x.photo.existing_master_acquired_by_previous_manifest).length,
  productionCleared:heroes.modules.filter(x=>x.photo.app_release==='CLEARED').length,activeInApp:active},null,2));
