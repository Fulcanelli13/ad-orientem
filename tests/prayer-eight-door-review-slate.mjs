import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {resolvePrayerEditorialArtwork} from "../src/pray/art-slot-map.v1.js";
import {SAN_POLO_PUBLISHED_STATIONS} from "../src/pray/stations-verified-artwork-release.v1.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const get=path=>JSON.parse(readFileSync(root+"/"+path,"utf8"));
const master=get("data/prayer/artwork-editorial-20261101/curatorial-master-267-20261101.v1.json");
const file=get("data/prayer/artwork-editorial-20261105/discovery-eight-door-review-slate.v1.json");
const positive=/^(USER_APPROVED|USER_PREVIOUSLY_APPROVED|EXPLICIT_USER_DECISION|EXISTING_USER_FINAL_LOCK|PREVIOUS_DONOR_SELECTION)/;
assert.equal(master.assignments.length,267);
assert.equal(file.mode,"RESEARCH_ONLY_NOT_A_RELEASE");
assert.equal(file.sourceOfTruth.positions,267);
assert.equal(file.release.productionAssetsAdded,0);
assert.deepEqual(file.release.publishedDoorIds,["DOOR-D5"]);
assert.deepEqual(file.release.selectedOriginalsPending,["DOOR-D2","DOOR-D3","DOOR-D8"]);
assert.deepEqual(file.release.editorialDoorAssignmentsPending,["DOOR-D1","DOOR-D4","DOOR-D6","DOOR-D7","DOOR-D9"]);
assert.equal(file.fixedDoors.length,4);
assert.equal(file.fiveUnassigned.length,5);
assert.deepEqual(file.fixedDoors.map(x=>x.slot),["DOOR-D2","DOOR-D3","DOOR-D5","DOOR-D8"]);
for(const item of file.fixedDoors){
 const masterSlot=master.assignments.find(x=>x.slot===item.slot);
 assert.ok(masterSlot,"Fixed door missing in master");
 if(item.slot==="DOOR-D5"){
  assert.equal(item.state,"PUBLISHED_PROTECTED_DO_NOT_TOUCH");
  assert.equal(resolvePrayerEditorialArtwork(item.slot).state,"PUBLISHED_EXACT_PHOTO");
 }else{
  assert.equal(item.state,"EXACT_WORK_APPROVED_PHOTO_HOLD");
  assert.match(item.sourceSha1,/^[0-9a-f]{40}$/);
  assert.equal(item.pixels.length,2);
  assert.ok(item.bytes>1000000);
  assert.equal(resolvePrayerEditorialArtwork(item.slot).state,"APPROVED_EXACT_PHOTO_PENDING");
 }
}
const sourceSlots=new Set();
for(const door of file.fiveUnassigned){
 const from=master.assignments.find(x=>x.slot===door.slot);
 assert.equal(from.editorialStatus,"CATEGORY_POOL_NOT_AUTHORIZED");
 assert.equal(from.currentAssignment.painting,undefined);
 assert.equal(door.doorApproval,"NOT_GRANTED");
 assert.equal(door.rotationEnabled,false);
 assert.equal(door.proposals.length,3);
 assert.equal(resolvePrayerEditorialArtwork(door.slot).state,"INHERITED_POOL_NO_FIXED_PAINTING");
 for(let i=0;i<door.proposals.length;i++){
  const candidate=door.proposals[i];
  assert.equal(candidate.rank,i+1);
  assert.equal(candidate.doorUse,"PROPOSAL_PENDING_EXPLICIT_APPROVAL");
  assert.equal(candidate.sourceApprovalContext,"ORIGINAL_CHILD_SLOT_ONLY");
  assert.equal(candidate.photoQA,"UNVERIFIED_FOR_THIS_DOOR");
  assert.equal(candidate.productionEnabled,false);
  assert.match(candidate.title,/\S/);
  assert.ok(!sourceSlots.has(candidate.sourceSlot),"Duplicate proposed child slot "+candidate.sourceSlot);
  sourceSlots.add(candidate.sourceSlot);
  const original=master.assignments.find(x=>x.slot===candidate.sourceSlot);
  assert.ok(original?.userAlreadyCoveredByPriorApprovalOrInheritance);
  assert.ok(positive.test(original.currentAssignment.editorialStatus));
  assert.equal(original.currentAssignment.painting.title,candidate.title);
  assert.equal(original.currentAssignment.painting.artist||"Attribution incomplete in source ledger",candidate.artist);
  assert.equal(original.family,from.family,"Cross-family substitution requires separate review");
 }
}
assert.equal(sourceSlots.size,15);
assert.equal(Object.keys(SAN_POLO_PUBLISHED_STATIONS).length,0,"The unrelated Stations gallery must stay disabled");
console.log("PASS 9 Prayer doors: 1 unchanged published, 3 exact-work photo holds, 5 unassigned; 15 prior-child artwork proposals without new approvals or public images");
