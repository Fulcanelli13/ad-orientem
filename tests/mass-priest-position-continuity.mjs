import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>JSON.parse(readFileSync(new URL(file,import.meta.url),'utf8'));
const original=read('../data/presentation/reader-priest-positions.v1.json');
const source=read('../data/presentation/reader-text-sung.v1.json');
const expanded=read('../data/presentation/mass-priest-position-continuity-20261020.v1.json');
const lock=read('../data/presentation/mass-icon-final-user-lock-20261020.v1.json');
const byId=new Map(lock.items.map(x=>[x.id,x]));
const sourceUnits=source.blocks.flatMap(b=>b.units??[]).sort((a,b)=>a.sort-b.sort);
assert.equal(source.blocks.length,96);
assert.equal(sourceUnits.length,280);
assert.equal(new Set(sourceUnits.map(x=>x.cue_id)).size,280);
assert.equal(original.items.length,49);
assert.equal(expanded.cues.length,280);
assert.equal(expanded.blocks.length,96);
assert.equal(expanded.sourceTransitions.length,49);
assert.deepEqual(expanded.cues.map(x=>x.cueId),sourceUnits.map(x=>x.cue_id),
 'Station projection has reordered or removed source cues');
assert.deepEqual(
 expanded.sourceTransitions.map(({cueId,station,facing,routeId,condition})=>({cueId,station,facing,routeId,condition})).sort((a,b)=>a.cueId.localeCompare(b.cueId)),
 original.items.map(({cueId,station,facing,routeId,condition})=>({cueId,station,facing,routeId,condition})).sort((a,b)=>a.cueId.localeCompare(b.cueId)),
 'Original sourced station event changed');
const cue=id=>expanded.cues.find(c=>c.cueId==='AO.SM.'+id);
const expected={
 C0042:'ALTAR_EPISTLE_MISSAL',
 C0072:'ALTAR_EPISTLE_MISSAL',
 C0109:'ALTAR_CENTER',
 C0113:'ALTAR_EPISTLE_MISSAL',
 C0114:'ALTAR_CENTER',
 C0125:'ALTAR_EPISTLE_SIDE',
 C0128:'ALTAR_CENTER',
 C0134:'ALTAR_CENTER',
 C0144:'ALTAR_CENTER',
 C0253:'ALTAR_EPISTLE_MISSAL'
};
for(const [id,station] of Object.entries(expected))
 assert.equal(cue(id)?.defaultTrack.station,station,
  '1962 position error: '+id+' should be '+station);
for(const [a,b] of [['C0107','C0109'],['C0131','C0134'],['C0134','C0144']]){
 assert.equal(cue(a)?.defaultTrack.station,cue(b)?.defaultTrack.station,
  'Station unexpectedly changed between events '+a+' and '+b);
}
const routeCues=expanded.cues.filter(c=>c.defaultTrack.status==='MOVING_ALONG_AUTHORIZED_ROUTE');
const asyncCues=expanded.cues.filter(c=>c.defaultTrack.status==='AWAIT_INDEPENDENT_OBSERVATION');
assert.ok(routeCues.length>0,'No transit states retained');
assert.ok(asyncCues.length>0,'An asynchronous priest state was falsely treated as visible');
for(const row of [...routeCues,...asyncCues]){
 assert.equal(row.defaultTrack.proposedIconAssetId,null,
  'Unknown/in-motion priest state must not draw stationary icon at '+row.cueId);
}
for(const row of expanded.cues){
 assert.equal(row.liveObservationRule,'REFERENCE_CEREMONIAL_SEQUENCE_NOT_PROOF_OF_ACTUAL_PRIEST_POSITION');
 const id=row.defaultTrack.proposedIconAssetId;
 if(!id)continue;
 const a=byId.get(id);
 assert.ok(a&&(a.status==='approved'||a.status==='repurposed')&&!a.rejected,
  'Rejected/unapproved priest station art at '+row.cueId);
 assert.equal(row.defaultTrack.proposedIconExactUserName,a.name,
  'Final user name changed for '+id);
}
for(const sourceRow of original.items.filter(x=>x.condition))
 assert.ok(expanded.sourceTransitions.some(x=>x.cueId===sourceRow.cueId && x.condition===sourceRow.condition && !x.inDefaultSimpleChantTrack),
  'Conditional transition silently became universal '+sourceRow.cueId);
for(const block of expanded.blocks){
 const rows=expanded.cues.filter(c=>c.blockId===block.blockId);
 assert.ok(rows.length,'Source block lost '+block.blockId);
 assert.equal(block.firstCue,rows[0].cueId);
 assert.equal(block.lastCue,rows.at(-1).cueId);
}

assert.equal(expanded.missalPositionTransitions.length,3);
assert.deepEqual(expanded.missalPositionTransitions.map(x=>x.cueId),
 ['AO.SM.C0001','AO.SM.C0081','AO.SM.C0249']);
const cases=[
 ['C0072','ALTAR_EPISTLE_MISSAL','EPISTLE_SIDE'],
 ['C0109','ALTAR_CENTER','GOSPEL_SIDE'],
 ['C0113','ALTAR_EPISTLE_MISSAL','GOSPEL_SIDE'],
 ['C0114','ALTAR_CENTER','GOSPEL_SIDE'],
 ['C0125','ALTAR_EPISTLE_SIDE','GOSPEL_SIDE'],
 ['C0134','ALTAR_CENTER','GOSPEL_SIDE'],
 ['C0144','ALTAR_CENTER','GOSPEL_SIDE'],
 ['C0249','ALTAR_EPISTLE_MISSAL','EPISTLE_SIDE'],
 ['C0250','ALTAR_EPISTLE_MISSAL','EPISTLE_SIDE'],
 ['C0253','ALTAR_EPISTLE_MISSAL','EPISTLE_SIDE']
];
for(const [id,priest,book] of cases){
 const x=cue(id);
 assert.equal(x?.defaultTrack.station,priest,'Incorrect priest station at '+id);
 assert.equal(x?.missal.location,book,'Incorrect Missal location at '+id);
 assert.equal(x?.missal.stationDistinctFromBook,true,'Missal is not priest station at '+id);
}
for(const id of ['C0249','C0250']){
 assert.equal(cue(id)?.defaultTrack.renderPolicy,
   'SHOW_ONLY_AFTER_INDEPENDENT_MC_END_010_PRIEST_EVENT',
   'Reader scrolling falsely triggered priest return to Epistle side '+id);
 assert.equal(cue(id)?.missal.observationGate,'MC-END-010');
}
assert.equal(expanded.formActorExceptions.length,3);
assert.ok(expanded.formActorExceptions.some(x=>x.form==='SOLEMN'&&x.cueId==='AO.SM.C0086'&&x.liturgicalActor==='DEACON'&&x.priestPosition==='ALTAR_EPISTLE_SIDE'),
 'Solemn Gospel is sung by deacon, not by celebrant at Gospel-side missal');

console.log('1962 source priest-station continuity: 280/280 sung cues, 96/96 source blocks, 49/49 transitions; no art/position overrides.');
