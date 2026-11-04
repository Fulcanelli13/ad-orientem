import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prayerEditorialSlot} from '../src/pray/editorial-artwork-assignments.v1.js';
import {resolvePrayerEditorialArtwork} from '../src/pray/art-slot-map.v1.js';
const route=JSON.parse(readFileSync('data/pray/research/r5d-first-cohort-53-destinations.v1.json','utf8'));
const ledger=JSON.parse(readFileSync('data/pray/research/r5d-21-work-canonical-source-ledger.v1.json','utf8'));
const count={};
const bySource=new Map(ledger.works.map(w=>[w.sourcePage,w]));
assert.equal(ledger.works.length,21);
assert.equal(route.placements.length,53);
assert.equal(new Set(route.placements.map(x=>x.slotId)).size,53);
assert.equal(route.releaseAuthorized,false);
assert.equal(route.originalRosaryReaderUnaffected,true);
assert.equal(route.productionArtworkRegistryUnchanged,true);
for(const p of route.placements){
 count[p.destinationClass]=(count[p.destinationClass]||0)+1;
 assert.ok(bySource.has(p.officialOrCommonsSource),'Unknown source: '+p.slotId);
 const w=bySource.get(p.officialOrCommonsSource);
 assert.ok(w.slots.includes(p.slotId),'Source does not own editorial slot: '+p.slotId);
 assert.equal(w.imagePath,p.researchImagePath);
 assert.equal(w.sha256,p.imageSha256);
 const e=prayerEditorialSlot(p.slotId);
 assert.ok(e,'Missing editorial slot: '+p.slotId);
 assert.equal(e.hold,false);
 assert.equal(e.protectedCover,false);
 assert.equal(e.approvedOrInherited,true);
 assert.equal(e.sourceIdentityVerified,true);
 assert.equal(p.humanImageApproval,'PENDING');
 assert.equal(p.realDestinationBrowserAcceptance,'PENDING');
 assert.equal(p.publishEligible,false);
 assert.equal(p.productionReleased,false);
 assert.equal(resolvePrayerEditorialArtwork(p.slotId).state,'APPROVED_EXACT_PHOTO_PENDING');
 if(p.destinationClass==='PRAYER_COVER')assert.ok(p.slotId.startsWith('COV-'));
 if(p.destinationClass==='PRAYER_STAGE')assert.ok(p.slotId.startsWith('STG-'));
 if(p.destinationClass==='HOMEPAGE_HERO')assert.ok(p.slotId.startsWith('HERO-'));
 if(p.destinationClass==='PRAYER_CATEGORY_DOOR')assert.ok(p.slotId.startsWith('DOOR-'));
 assert.ok(!p.slotId.includes('rosary-'),'Signature Rosary remains deferred');
}
assert.deepEqual(count,{
 PRAYER_COVER:17,PRAYER_STAGE:30,HOMEPAGE_HERO:5,PRAYER_CATEGORY_DOOR:1
});
assert.equal(route.counts.prayerCoverOrStage,47);
assert.equal(route.counts.otherSurfaces,6);
console.log('PASS 53 canonical destinations: 47 Prayer covers/stages, 5 Home heroes, 1 Prayer door. 0 released, 0 claimed route passes.');
