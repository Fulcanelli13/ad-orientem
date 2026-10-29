import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const lock=read('../data/presentation/mass-icon-final-user-lock-20261020.v1.json');
const crosswalk=read('../data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json');
const byId=new Map(lock.items.map(a=>[a.id,a]));
const banned=new Set([...lock.previouslyExcludedExactArtwork,
  ...lock.permanentlyRejectedExactArtwork.map(a=>a.id),
  ...lock.items.filter(a=>a.rejected).map(a=>a.id)]);
assert.equal(lock.sourceBankTotal,182,'Final review has a different inventory count');
assert.equal(lock.items.length,182,'Final exact-name inventory truncated');
assert.equal(crosswalk.rows.length,414,'Unexpected source registry coverage');
assert.equal(lock.items.filter(a=>a.status==='approved').length,120);
assert.equal(lock.items.filter(a=>a.status==='repurposed').length,16);
assert.equal(lock.items.filter(a=>a.rejected).length,31);
const sections=[
 ['reader-postures.v1.json',23,'faithful_posture'],
 ['reader-gestures.v1.json',59,'faithful_gesture'],
 ['reader-priest-actions.v1.json',77,'priest_action'],
 ['reader-priest-positions.v1.json',49,'priest_position'],
 ['reader-priest-voices.v1.json',126,'priest_voice'],
 ['reader-responses.v1.json',23,'response'],
 ['reader-rubric-events.v1.json',57,'rubric']
];
for(const [source,count,lane] of sections){
 const original=read('../data/presentation/'+source).items;
 const rows=crosswalk.rows.filter(x=>x.sourceRegistry===source);
 assert.equal(original.length,count,source+' original count changed');
 assert.equal(rows.length,original.length,source+' crosswalk truncated');
 rows.forEach((row,i)=>{
  assert.equal(row.lane,lane,'Wrong actor lane: '+source);
  assert.deepEqual(row.sourceEvent,original[i],'Source cue mutated: '+source+':'+i);
 });
}
for(const row of crosswalk.rows){
 if(row.assetId===null){
  assert.equal(row.runtimeAssetKey,null);
  assert.equal(row.assetName,null);
  continue;
 }
 assert.ok(!banned.has(row.assetId),'Rejected icon referenced: '+row.assetId);
 const asset=byId.get(row.assetId);
 assert.ok(asset,'Unknown asset ID '+row.assetId);
 assert.ok(asset.status==='approved'||asset.status==='repurposed','Inactive art used '+row.assetId);
 assert.equal(row.assetName,asset.name,'User-given name changed on '+row.assetId);
 assert.ok(row.assetPath,'No source path proposed for '+row.assetId);
 assert.ok(row.runtimeAssetKey,'No runtime lookup key for '+row.assetId);
}
const cue=(lane,id)=>crosswalk.rows.find(r=>r.lane===lane&&r.cueId===id);
const exact=[
 ['AO.SM.C0110','v46_priest_elevate_host_rich'],
 ['AO.SM.C0114','v46_priest_elevate_chalice_rich'],
 ['AO.SM.C0174','v46_priest_elevation'],
 ['AO.SM.C0181','ao_elevation_chalice'],
 ['AO.SM.C0216','ea_priest_fraction_host'],
 ['AO.SM.C0221','ea_priest_commingling'],
 ['AO.SM.C0232','ea_priest_communion_host_original'],
 ['AO.SM.C0234','ea_priest_communion_chalice_original'],
 ['AO.SM.C0246','v46_priest_rail_after_rich'],
 ['AO.SM.C0247','ao_purify_chalice'],
 ['AO.SM.C0248','ao_purify_fingers']
];
for(const [id,assetId] of exact)
 assert.equal(cue('priest_action',id)?.assetId,assetId,'Incorrect source action '+id);
assert.equal(cue('priest_action','AO.SM.C0124')?.assetId,null,
 'Minister-incensing cue was assigned to an incorrect priest image');
assert.equal(cue('priest_action','AO.SM.C0265')?.assetId,null,
 'Final blessing wrongly reused an indulgentiam image');
assert.equal(cue('priest_position','AO.SM.C0001')?.assetId,null,
 'User-rejected Foot Centre pictogram was reintroduced');
assert.equal(cue('priest_position','AO.SM.C0001')?.sourceEvent.station,'FOOT_CENTER',
 'Removing artwork must not erase correct ceremonial position');
assert.equal(cue('priest_position','AO.SM.C0001')?.semanticResolution,
 'EXPLICIT_USER_VETO_OF_FOOT_CENTRE_ARTWORK');
for(const row of crosswalk.rows.filter(x=>x.lane==='priest_position')){
 if(row.sourceEvent.station?.includes('EPISTLE') && row.assetId)
  assert.equal(row.assetId,'v46_priest_gospel_rich','Epistle/Gospel physical artwork swapped back');
 if(row.sourceEvent.station?.includes('GOSPEL') && row.assetId)
  assert.equal(row.assetId,'v46_priest_epistle_rich','Gospel/Epistle physical artwork swapped back');
}
for(const row of crosswalk.rows.filter(x=>x.lane==='priest_voice')){
 const voice=String(row.sourceEvent.voice||'').toUpperCase();
 if(/LOW|QUIET|SECRET/.test(voice) && !/SILENT|INAUDIBLE/.test(voice) && row.assetId)
  assert.notEqual(row.assetId,'ao_pray_silent','Low voice incorrectly made silent');
}

const semantics=read('../data/presentation/mass-icon-final-semantic-lexicon-20261020.v1.json');
assert.equal(semantics.schema,'ao-mass-icon-semantic-lexicon-v1');
for(const concept of semantics.concepts){
  const asset=byId.get(concept.assetId);
  assert.ok(asset,'Unknown concept target '+concept.assetId);
  assert.equal(asset.name,concept.exactUserName,'Semantic lexicon changed a user name');
  assert.equal(asset.rejected,false,'Rejected artwork leaked into semantic dictionary');
}
const semanticCount=concept=>crosswalk.rows.filter(r=>r.semanticConcept===concept).length;
assert.equal(semanticCount('FAITHFUL_BOW_GENERIC'),23,
  'Faithful head-bow labels no longer reconcile to user-approved Faithful Bow');
assert.equal(semanticCount('BREAST_STRIKE_ANY_ACTOR'),8,
  'Priest breast-strike cue count changed');
assert.equal(semanticCount('PRIEST_PROFOUND_BOW'),1,
  'Priest adoration bow was lost');
assert.equal(crosswalk.counts.faithful_gesture.mapped,49);
assert.equal(crosswalk.counts.priest_action.mapped,61);
assert.equal(crosswalk.counts.priest_action.total,77);
for(const r of crosswalk.rows.filter(r=>r.semanticConcept==='FAITHFUL_BOW_GENERIC')){
  assert.equal(r.assetId,'v46_bow');
  assert.equal(r.assetName,'Faithful Bow');
  assert.equal(r.displayDetailFromSource,true,
    'Exact head bow rubric text must qualify general bow artwork');
}
for(const cueId of ['AO.SM.C0124','AO.SM.C0125','AO.SM.C0088','AO.SM.C0204','AO.SM.C0242','AO.SM.C0265']){
 const row=crosswalk.rows.find(r=>r.lane==='priest_action'&&r.cueId===cueId);
 assert.equal(row?.assetId,null,'Cross-actor, object or rite mismatch silently reused art '+cueId);
}
for(const variant of semantics.sourceConditionalResolvers){
 for(const branch of variant.branches){
   const asset=byId.get(branch.assetId);
   assert.ok(asset,'Unresolved conditional asset '+branch.assetId);
   assert.equal(branch.name,asset.name,'Conditional branch changed user display name');
 }
}

console.log('Mass final icon crosswalk: '+crosswalk.rows.length+' source rows verified against exact user names and rejections; no runtime changes.');
