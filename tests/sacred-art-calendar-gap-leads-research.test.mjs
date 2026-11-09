import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const audit=read('data/artwork/research/m2m-calendar-unmatched170-exact-scene-leads-20261110.v1.json');
const targets=read('data/artwork/research/m2m-destinations-640-20261109.v1.json').records;
const original=read('data/artwork/research-operational-989.v1.json').works;
const rejected=read('data/artwork/research/m2m-qa-evidence-20261109.v1.json').records.rejected_originals;

assert.equal(audit.status,'RESEARCH_ONLY_NOT_MATCHING_AUTHORITY_NOT_PUBLICATION');
assert.equal(audit.records.length,170);
assert.equal(new Set(audit.records.map(x=>x.date)).size,170);
const knownOpen=targets.filter(x=>x.target_type==='CALENDAR'&&x.existing_v3_id==='NONE');
assert.deepEqual(audit.records.map(x=>x.date).sort(),knownOpen.map(x=>x.target_id).sort());
assert.equal(targets.filter(x=>x.target_type==='PRAYER'&&x.existing_v3_id==='NONE').length,27);
const openPrayerStatuses=targets.filter(x=>x.target_type==='PRAYER'&&x.existing_v3_id==='NONE').map(x=>x.existing_v3_status);
assert.equal(openPrayerStatuses.filter(x=>x==='POOL_NOT_AUTHORISED').length,5);
assert.equal(openPrayerStatuses.filter(x=>x==='SUPPLEMENTARY_NOT_ASSIGNED').length,8);
assert.equal(openPrayerStatuses.filter(x=>x==='HOLD_RESPECTED').length,14);

const linked=audit.records.filter(x=>x.candidateCount>0);
assert.equal(linked.length,42);
assert.equal(audit.records.filter(x=>!x.candidateCount).length,128);
assert.deepEqual(Object.entries(audit.counts.byClass).map(([rank,x])=>[rank,x.unmatchedBaseline,x.withResearchLeads,x.stillWithoutLeads]),[
 ['II',29,14,15],['III',101,8,93],['IV',40,20,20]
]);
const edges=audit.records.flatMap(x=>x.artworkRelationships);
assert.equal(edges.length,50);
assert.equal(edges.filter(x=>x.kind==='EXISTING_989_GROUP_RESEARCH_LINK').length,24);
assert.equal(edges.filter(x=>x.kind==='NEW_INSTITUTIONAL_OBJECT_LEAD').length,20);
assert.equal(edges.filter(x=>x.kind==='SECONDARY_OR_COMMONS_RESEARCH_ONLY').length,6);
assert.equal(audit.counts.newAuthorizedAssignments,0);
const groups=new Map(original.map(x=>[x.workGroupId,x]));
const rejectedIDs=new Set(rejected.map(x=>String(x.id||'').toLowerCase()));
for (const item of audit.records){
 assert.equal(item.baselineStatus,'NONE_NO_APPROVED_CANDIDATE');
 assert.equal(item.candidateCount,item.artworkRelationships.length);
 assert.ok(item.observedPrincipalId && item.gospelReferenceFromMatchingIndex !== undefined);
 assert.equal(new Set(item.artworkRelationships.map(x=>x.key)).size,item.artworkRelationships.length,'duplicate image/work at '+item.date);
 for(const edge of item.artworkRelationships){
  assert.ok(edge.key&&edge.title&&edge.sourceUrl,'missing research provenance '+item.date);
  assert.equal(edge.newPlacementAuthority,'NOT_GRANTED');
  assert.equal(edge.imageRightsStatus,'NOT_CLEARED');
  assert.equal(edge.identityStatus,'EXACT_ORIGINAL_AND_PHOTO_NOT_CERTIFIED');
  if(edge.kind==='EXISTING_989_GROUP_RESEARCH_LINK'){
   const group=groups.get(edge.key);
   assert.ok(group,'unknown existing work '+edge.key);
   assert.equal(group.historicalExclusion,false);
   assert.ok(!rejectedIDs.has(String(group.canonicalArtworkId||'').toLowerCase()),'globally rejected original');
   if(edge.key.startsWith('REVIEW::commons:')&&!group.userReviewStates.some(x=>/APPROVED|PLACEMENT_KEEP|FINAL_MODULE/.test(x))){
    assert.equal(edge.commonsPolicy,'RESEARCH_ONLY_NOT_AUTO_ADMITTED_TO_CURATED_POOL');
   }
  }
 }
}
assert.ok(audit.records.find(x=>x.date==='2026-02-01').artworkRelationships.some(x=>x.key==='Nationalmuseum:NM420'));
assert.ok(audit.records.find(x=>x.date==='2026-02-08').artworkRelationships.some(x=>x.key==='Timken:1957:002'));
assert.ok(audit.records.find(x=>x.date==='2026-08-09').artworkRelationships.some(x=>x.key==='UMMA:1960/2.93'));
assert.ok(audit.records.find(x=>x.date==='2026-11-08').artworkRelationships.some(x=>x.key==='Thyssen:1979.62'));
assert.ok(audit.records.find(x=>x.date==='2026-10-18').artworkRelationships.some(x=>x.key==='REVIEW::commons:150920'));
console.log('PASS: 170 unchanged Calendar holds, 27 protected Prayer holds, 42 dated research leads / 50 edges, no rejected originals or publication authority.');
