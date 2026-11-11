import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAYER_ART_EDITORIAL_SLOTS_V1} from "../src/pray/editorial-artwork-assignments.v1.js";
import {resolvePrayerEditorialArtwork} from "../src/pray/art-slot-map.v1.js";

const queue=JSON.parse(readFileSync(new URL("../data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json",import.meta.url),"utf8"));
assert.equal(queue.schema,"AO_PRAYER_BULK_APPROVED_PHOTO_ACQUISITION_QUEUE_V1");
assert.equal(queue.counts.pendingSlots,138);
assert.equal(queue.counts.pinnedSourceURLGroups,60);
assert.equal(queue.counts.identitySourceRecoveryGroups,13);
assert.equal(queue.groups.length,73);
// The November 3 acquisition manifest is a historical 138-slot snapshot.
// Four of its original entries now reuse photographs ALREADY released elsewhere.
const reusedReleased=new Set([
 "HERO-22","STG-programme.first_saturday-01",
 "COV-pray.adoration","COV-pray.forty_hours"
]);
const ids=[],keys=new Set();
let pinned=0,recovery=0,pinnedSlots=0,recoverySlots=0;
for(const g of queue.groups){
 assert.ok(g.artist&&g.title&&g.slots?.length>0,"Source group requires work identity and placements");
 const key=g.sourcePage||"MISSING:"+g.artist+"||"+g.title;
 assert.ok(!keys.has(key),"Duplicate acquisition group "+key);
 keys.add(key);
 assert.equal(g.slotCount,g.slots.length);
 assert.deepEqual(g.rosaryDeferred,g.slots.filter(id=>id.startsWith("STG-pray.rosary-")||id==="COV-pray.rosary"),"Rosary stages must remain separately held");
 assert.equal(g.review.rightsForActualPhotoVerified,false,"A URL is not actual-file rights clearance");
 assert.equal(g.review.originalPhotoCaptured,false);
 assert.equal(g.review.framingAndResponsiveQA,false);
 assert.equal(g.review.publicationAuthorized,false);
 if(g.sourcePage){assert.equal(g.keyType,"PINNED_SOURCE_URL");pinned++;pinnedSlots+=g.slotCount}
 else{assert.equal(g.keyType,"OBJECT_SOURCE_RECOVERY");recovery++;recoverySlots+=g.slotCount}
 for(const id of g.slots){
  const row=PRAYER_ART_EDITORIAL_SLOTS_V1[id];
  assert.ok(row,"Unknown editorial slot "+id);
  const resolution=resolvePrayerEditorialArtwork(id);
  assert.equal(resolution.state,reusedReleased.has(id)?"PUBLISHED_EXACT_PHOTO":"APPROVED_EXACT_PHOTO_PENDING",
    id+" must retain its exact artwork and previously established release gate");
  if(reusedReleased.has(id))assert.ok(resolution.photo&&resolution.artId,id);
  assert.equal(row.selected.artist,g.artist,id);
  assert.equal(row.selected.title,g.title,id);
  assert.equal(row.selected.sourcePage||null,g.sourcePage,id);
  assert.equal(row.hold,false,id);
  assert.equal(row.protectedCover,false,id);
  ids.push(id);
 }
}
assert.equal(pinned,60);assert.equal(pinnedSlots,117);
assert.equal(recovery,13);assert.equal(recoverySlots,21);
assert.equal(ids.length,138);
assert.equal(new Set(ids).size,138,"No slot may be acquired twice");
const allPending=Object.keys(PRAYER_ART_EDITORIAL_SLOTS_V1).filter(id=>
 resolvePrayerEditorialArtwork(id).state==="APPROVED_EXACT_PHOTO_PENDING");
// Historical queue never included four Bouts photos because they were then released.
const withdrawnBouts=["STG-pray.angelus-04","STG-pray.angelus-05",
 "STG-pray.angelus-06","STG-pray.rosary-02"];
assert.equal(allPending.length,138,"Four reused works plus four withdrawn Bouts balance");
assert.deepEqual([...ids.filter(id=>!reusedReleased.has(id)),...withdrawnBouts].sort(),allPending.sort(),
 "No changed selections beyond four source reuses and exact rejected Bouts photo exclusion");
console.log("PASS: historical 138-slot source queue; four approved photo reuses, four rejected Bouts slots pending; 138 active pending");
