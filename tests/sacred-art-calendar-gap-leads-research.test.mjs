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
assert.equal(linked.length,136);
assert.equal(audit.records.filter(x=>!x.candidateCount).length,34);
assert.deepEqual(Object.entries(audit.counts.byClass).map(([rank,x])=>[rank,x.unmatchedBaseline,x.withResearchLeads,x.stillWithoutLeads]),[
 ['II',29,25,4],['III',101,76,25],['IV',40,35,5]
]);
const edges=audit.records.flatMap(x=>x.artworkRelationships);
assert.equal(edges.length,161);
assert.equal(edges.filter(x=>x.kind==='EXISTING_989_GROUP_RESEARCH_LINK').length,25);
assert.equal(edges.filter(x=>x.kind==='NEW_INSTITUTIONAL_OBJECT_LEAD').length,126);
assert.equal(edges.filter(x=>x.kind==='SECONDARY_OR_COMMONS_RESEARCH_ONLY').length,10);
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
assert.ok(audit.records.find(x=>x.date==='2026-09-06').artworkRelationships.some(x=>x.key==='KHM:GG52'));
assert.ok(audit.records.find(x=>x.date==='2026-09-23').artworkRelationships.some(x=>x.key==='Vatican:Pinacoteca:333'));
assert.ok(audit.records.find(x=>x.date==='2026-06-07').artworkRelationships.some(x=>x.key==='Wellcome:45078i'));
assert.ok(audit.records.find(x=>x.date==='2026-07-12').artworkRelationships.some(x=>x.key==='Rijks:200392356'));
assert.ok(audit.records.find(x=>x.date==='2026-10-11').artworkRelationships.some(x=>x.key==='Brooklyn:Tissot-Officers-Son-UNRESOLVED'));
assert.ok(audit.records.find(x=>x.date==='2026-09-26').artworkRelationships.some(x=>x.key==='Rijks:200267736'));
assert.ok(audit.records.find(x=>x.date==='2026-10-12').artworkRelationships.some(x=>x.key==='Brooklyn:Tissot-Officers-Son-UNRESOLVED'));
assert.ok(audit.records.find(x=>x.date==='2026-01-28').artworkRelationships.some(x=>x.key==='Cincinnati:1917.58'),'saint Peter Nolasco museum original');
assert.ok(audit.records.find(x=>x.date==='2026-02-07').artworkRelationships.some(x=>x.key==='Kress:K1047'),'Romuald original');
assert.ok(audit.records.find(x=>x.date==='2026-06-18').artworkRelationships.some(x=>x.key==='Vatican:IconRoom:9'),'Ephrem icon');
assert.ok(audit.records.find(x=>x.date==='2026-09-18').artworkRelationships.some(x=>x.key==='Met:724811'),'Costanzi Joseph of Cupertino');
assert.ok(audit.records.find(x=>x.date==='2026-09-22').artworkRelationships.some(x=>x.key==='Louvre:MI888'),'Cerezo original Thomas of Villanova');
assert.ok(audit.records.find(x=>x.date==='2026-10-03').artworkRelationships.every(x=>x.newPlacementAuthority==='NOT_GRANTED'),'protected Thérèse cover stays');
assert.equal(audit.records.find(x=>x.date==='2026-01-22').artworkRelationships[0].relation,'MULTI_SAINT_FEAST_PARTIAL');
assert.ok(audit.records.find(x=>x.date==='2026-08-19').artworkRelationships.some(x=>x.key==='Orne:998.25.30'));
assert.ok(audit.records.find(x=>x.date==='2026-08-21').artworkRelationships.some(x=>x.key==='Chambery:M170'&&x.remark.includes('AFTER Champaigne')));
assert.ok(audit.records.find(x=>x.date==='2026-09-03').artworkRelationships.some(x=>x.key==='MullerUry:PiusX:1907'&&x.kind==='SECONDARY_OR_COMMONS_RESEARCH_ONLY'));
assert.ok(audit.records.find(x=>x.date==='2026-11-10').artworkRelationships.some(x=>x.key==='Holburne:A17'&&x.remark.includes('Piazzetta')));
assert.ok(audit.records.find(x=>x.date==='2026-05-05').artworkRelationships.some(x=>x.key==='Walters:37.453'));
assert.ok(audit.records.find(x=>x.date==='2026-11-17').artworkRelationships.some(x=>x.key==='ICCD:0800232370'&&x.title.includes('Thaumaturgus')));
assert.ok(audit.records.find(x=>x.date==='2026-11-26').artworkRelationships.every(x=>!x.title.includes('Pope')&&x.remark.includes('Gozzolini')),'November 26 must be abbot Sylvester Gozzolini, not Pope Sylvester I');
assert.deepEqual(audit.records.find(x=>x.date==='2026-11-26').artworkRelationships.map(x=>x.key).sort(),['ICCD:1100255012','ICCD:1200199733-5']);
assert.ok(!audit.records.some(row=>row.artworkRelationships.some(x=>x.key==='ICCD:1200239580')),'Pope Sylvester I Lanfranco must not be bound to Nov 26');
assert.ok(audit.records.find(x=>x.date==='2026-06-10').artworkRelationships.some(x=>x.key==='NationalTrust:998409'&&x.title.includes('Margaret of Scotland')),'do not confuse St Margaret of Scotland with other Margarets');
assert.ok(audit.records.find(x=>x.date==='2026-09-02').artworkRelationships.some(x=>x.key==='HungarianNationalGallery:55.967.1'&&x.remark.includes('copyrighted')),'King St Stephen is not protomartyr and photo still rights-held');
assert.ok(audit.records.find(x=>x.date==='2026-10-13').artworkRelationships.some(x=>x.key==='NationalGallery:NG4451'&&x.remark.includes('Edward the Confessor')),'Wilton group motif must identify the correct Edward');
assert.ok(audit.records.find(x=>x.date==='2026-10-16').artworkRelationships.some(x=>x.key==='LvivNationalGallery:Ж-1791'&&x.remark.includes('Silesian')),'Hedwig of Silesia not Jadwiga');
assert.equal(audit.records.find(x=>x.date==='2026-10-19').artworkRelationships.length,2,'preserve both exact St Peter of Alcantara paintings');
assert.ok(audit.records.find(x=>x.date==='2026-10-19').artworkRelationships.every(x=>x.remark.includes('Peter of Alcántara')||x.title.includes('Peter of Alcántara')),'St Peter of Alcantara not apostle');
assert.ok(audit.records.find(x=>x.date==='2026-04-27').artworkRelationships.every(x=>x.medium.includes('engraving')),'Canisius print remains labelled non-oil');
assert.ok(audit.records.find(x=>x.date==='2026-08-08').artworkRelationships.every(x=>x.medium.includes('charcoal')),'Curé Ars remains a drawing research lead');

assert.ok(audit.records.find(x=>x.date==='2026-01-24').artworkRelationships.some(x=>x.medium.includes('parchment')));
assert.ok(audit.records.find(x=>x.date==='2026-03-06').artworkRelationships.every(x=>x.medium.includes('manuscript')||x.medium.includes('woodcut')),'Wicked husbandmen art is non-oil fallback');
assert.ok(audit.records.find(x=>x.date==='2026-06-01').artworkRelationships.some(x=>x.remark.includes('copyright-restricted')));




assert.ok(audit.records.find(x=>x.date==='2026-11-08').artworkRelationships.some(x=>x.key==='Thyssen:1979.62'));
assert.ok(audit.records.find(x=>x.date==='2026-10-18').artworkRelationships.some(x=>x.key==='REVIEW::commons:150920'));
console.log('PASS: 170 unchanged Calendar holds, 27 protected Prayer holds, 136 dated research leads / 161 edges, no rejected originals or publication authority.');
