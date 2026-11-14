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
assert.equal(linked.length,167);
assert.equal(audit.records.filter(x=>!x.candidateCount).length,3);
assert.deepEqual(Object.entries(audit.counts.byClass).map(([rank,x])=>[rank,x.unmatchedBaseline,x.withResearchLeads,x.stillWithoutLeads]),[
 ['II',29,29,0],['III',101,98,3],['IV',40,40,0]
]);
const edges=audit.records.flatMap(x=>x.artworkRelationships);
assert.equal(edges.length,198);
assert.equal(edges.filter(x=>x.kind==='EXISTING_989_GROUP_RESEARCH_LINK').length,25);
assert.equal(edges.filter(x=>x.kind==='NEW_INSTITUTIONAL_OBJECT_LEAD').length,162);
assert.equal(edges.filter(x=>x.kind==='SECONDARY_OR_COMMONS_RESEARCH_ONLY').length,11);
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
assert.equal(audit.records.find(x=>x.date==='2026-02-20').verified1962Gospel.reference,'Matthew 5:43–48; 6:1–6','Friday after Ash Wednesday crosswalk');
assert.ok(audit.records.find(x=>x.date==='2026-02-20').verified1962Gospel.note.includes('6:1–4'),'source discrepancy preserved');
assert.equal(audit.records.find(x=>x.date==='2026-03-05').verified1962Gospel.reference,'Luke 16:19–31');
assert.equal(audit.records.find(x=>x.date==='2026-03-05').gospelReferenceFromMatchingIndex,null,'do not silently change canonical Gospel');
assert.ok(audit.records.find(x=>x.date==='2026-03-05').artworkRelationships.some(x=>x.key==='Rijks:SK-A-868'&&x.medium.includes('oil on canvas')),'Rijks exact parable oil');
assert.ok(audit.records.find(x=>x.date==='2026-03-05').artworkRelationships.some(x=>x.key==='Walters:W.535.185R'&&x.medium.includes('paper')),'Walters parable manuscript');
assert.equal(audit.records.find(x=>x.date==='2026-05-12').artworkRelationships[0].relation,'MULTI_SAINT_FEAST_PARTIAL','12 May lacks Pancras');
assert.equal(audit.records.find(x=>x.date==='2026-07-28').artworkRelationships[0].relation,'MULTI_SAINT_FEAST_PARTIAL','28 July lacks two popes');
assert.equal(audit.records.find(x=>x.date==='2026-09-16').artworkRelationships[0].relation,'MULTI_SAINT_FEAST_COMPLETE','Veronese shows Cornelius and Cyprian');
assert.equal(audit.records.find(x=>x.date==='2026-06-25').artworkRelationships.length,2,'William of Montevergine two distinct Vaccaro oils');
assert.ok(audit.records.find(x=>x.date==='2026-12-04').artworkRelationships.some(x=>x.key==='Met:419574'&&x.medium.includes('etching')),'Callot Chrysologus not oil painting');
for(const date of ['2026-12-01','2026-12-05']){
 const target=audit.records.find(x=>x.date===date);
 assert.equal(target.artworkRelationships[0].key,'Tate:N05613','John Martin single original across dates');
 assert.equal(target.artworkRelationships[0].relation,'APOCALYPTIC_CONTEXT_NOT_EXACT_LUKE','Revelation scene cannot be labeled literal Luke');
}
assert.ok(audit.records.find(x=>x.date==='2026-02-20').artworkRelationships.every(x=>x.relation==='SERMON_CONTEXT_NOT_VERSE_SPECIFIC'),'Brueghel is sermon context only');


assert.ok(audit.records.find(x=>x.date==='2026-01-24').artworkRelationships.some(x=>x.medium.includes('parchment')));
assert.ok(audit.records.find(x=>x.date==='2026-03-06').artworkRelationships.every(x=>x.medium.includes('manuscript')||x.medium.includes('woodcut')),'Wicked husbandmen art is non-oil fallback');
assert.ok(audit.records.find(x=>x.date==='2026-06-01').artworkRelationships.some(x=>x.remark.includes('copyright-restricted')));




assert.ok(audit.records.find(x=>x.date==='2026-11-08').artworkRelationships.some(x=>x.key==='Thyssen:1979.62'));
assert.ok(audit.records.find(x=>x.date==='2026-10-18').artworkRelationships.some(x=>x.key==='REVIEW::commons:150920'));

const farewellDates=['2026-04-26','2026-05-03','2026-05-06','2026-05-08','2026-05-10','2026-05-17','2026-05-21','2026-05-22'];
for(const date of farewellDates){
 const day=audit.records.find(x=>x.date===date);
 assert.equal(day.artworkRelationships.length,1,'only the single Brooklyn Tissot research lead is proposed: '+date);
 const candidate=day.artworkRelationships[0];
 assert.equal(candidate.key,'Brooklyn:00.159.225');
 assert.equal(candidate.relation,'WHOLE_FAREWELL_DISCOURSE_NOT_VERSE_SPECIFIC','do not inflate context to exact pericope');
 assert.ok(candidate.medium.includes('watercolor'),'Tissot is not an oil painting');
 assert.equal(candidate.newPlacementAuthority,'NOT_GRANTED');
}
const olivet=audit.records.find(x=>x.date==='2026-11-27').artworkRelationships[0];
assert.equal(olivet.key,'Brooklyn:00.159.213');
assert.equal(olivet.relation,'SAME_OLIVET_DISCOURSE_EPISODE_NOT_EXACT_SUBPASSAGE');
const josaphat=audit.records.find(x=>x.date==='2026-11-14').artworkRelationships[0];
assert.equal(josaphat.key,'MNW:catalog-510968-Simmler');
assert.equal(josaphat.kind,'SECONDARY_OR_COMMONS_RESEARCH_ONLY');
assert.ok(josaphat.scriptureOrIdentityAnchor.includes('Kuntsevych'));
assert.equal(josaphat.sourcePolicy,'DO_NOT_CURATE_WITHOUT_PRIMARY_ORIGINAL_AND_PHOTO_EVIDENCE');
assert.ok(!josaphat.title.includes('Barlaam'),'martyr Josaphat Kuntsevych is not legendary Barlaam and Josaphat');

assert.equal(audit.records.find(x=>x.date==='2026-03-09').artworkRelationships[0].relation,'SAME_NAZARETH_SYNAGOGUE_EVENT_BUT_EARLIER_VERSES');
assert.ok(audit.records.find(x=>x.date==='2026-03-09').artworkRelationships[0].remark.includes('NOT exact rejection'),'Nazareth reading vs rejection must differ');
assert.equal(audit.records.find(x=>x.date==='2026-03-17').artworkRelationships[0].key,'Rijks:RP-P-OB-44.918');
assert.equal(audit.records.find(x=>x.date==='2026-03-23').artworkRelationships[0].relation,'GOSPEL_SCENE_PARTIAL_EXACT');
assert.ok(audit.records.find(x=>x.date==='2026-03-24').artworkRelationships[0].remark.includes('Composite woodcut'));
assert.equal(audit.records.find(x=>x.date==='2026-07-10').artworkRelationships[0].relation,'MULTI_SAINT_FEAST_PARTIAL');
assert.ok(audit.records.find(x=>x.date==='2026-07-10').artworkRelationships[0].remark.includes('NOT depicted'),'Rufina/Seconda not Seven Brothers');
assert.equal(audit.records.find(x=>x.date==='2026-10-23').artworkRelationships[0].key,'IAPH:67609','Anthony Mary Claret not Anthony the Hermit');
const scripturalText=audit.records.find(x=>x.date==='2026-03-21').artworkRelationships[0];
assert.equal(scripturalText.key,'NGA:1937.1.2.b');
assert.equal(scripturalText.relation,'EXACT_GOSPEL_VERSE_AS_ICONOGRAPHIC_INSCRIPTION_NOT_LITERALEPISODE');
assert.ok(scripturalText.scriptureOrIdentityAnchor.includes('EGO SUM LUX MUNDI'));
const justin=audit.records.find(x=>x.date==='2026-04-14').artworkRelationships[0];
assert.equal(justin.key,'NGA:1969.15.672');
assert.ok(justin.scriptureOrIdentityAnchor.includes('S. IVSTINVS PHILOSOP. MART.'));
assert.ok(justin.remark.includes('FOUR-panel'),'four-panel Callot, no unlicensed cropping');
assert.deepEqual(audit.records.filter(x=>!x.candidateCount).map(x=>x.date).sort(),['2026-03-02','2026-03-10','2026-03-11']);

assert.equal(audit.records.filter(x=>x.liturgicalClass==='II'&&!x.candidateCount).length,0);
assert.equal(audit.records.filter(x=>x.liturgicalClass==='IV'&&!x.candidateCount).length,0);

console.log('PASS: 170 unchanged Calendar holds, 27 protected Prayer holds, 167 dated research leads / 198 edges, no rejected originals or publication authority.');
