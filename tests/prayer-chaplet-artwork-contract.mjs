import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CHAPLET_ARTWORK_FAMILIES,resolveChapletArtworkStage} from "../src/pray/chaplet-artwork-stage-contract.v1.js";
import {resolveArtworkRuntimeIdentity} from "../src/pray/artwork-runtime-identity.v1.js";
import {isEditorialArtworkPlacementApproved,isUserApprovedPhotographPublishable} from "../src/pray/artwork-approval-policy.v1.js";

/** Guard approval decisions and five chaplet identities. This does NOT certify images. */
const dir="data/prayer/artwork-editorial-20261030/";
const read=name=>JSON.parse(readFileSync(dir+name,"utf8"));
const registry=read("balanced-reuse-20261030-assignments.v2.json");
const q2=read("decision-ledger-b01-b05.v1.json");
const b611=read("approved-unified-b06-b11-from-user-message.v1.json");
const newApproved=read("missing-art-approved-only-20261030.v1.json");
const overlay=read("cross-prayer-inheritance-20261030.v1.json");
const slots=new Map(registry.slots.map(s=>[s.slot_id,s]));
assert.equal(isEditorialArtworkPlacementApproved({id:"unapproved",eligible:true,editorial:"NEW_CANDIDATE_NOT_USER_APPROVED"}),false);
assert.equal(isEditorialArtworkPlacementApproved({id:"approved",eligible:true,editorial:"USER_APPROVED"}),true);
assert.equal(isEditorialArtworkPlacementApproved({id:"maybe",eligible:true,editorial:"USER_APPROVED_CROSS_PRAYER_REUSE"}),false);
assert.equal(isUserApprovedPhotographPublishable({id:"approved",eligible:true,editorial:"USER_APPROVED"}),false);
assert.equal(isEditorialArtworkPlacementApproved({id:"rejected",eligible:false,editorial:"USER_APPROVED"}),false);
const affirm=new Set([
 "USER_APPROVED",
 "USER_APPROVED_EXISTING_SAINTS_SELECTION",
 "USER_APPROVED_20261030_NEW_ARTWORK_REUSE",
 "USER_FINAL_LOCKED"
]);
const approvedIds=new Set([
 ...q2.records.filter(x=>x.prayer_editorial_status==="ACCEPTED_FOR_PRAYER_REVIEW").map(x=>x.artwork_id),
 ...b611.decisions.filter(x=>x.status==="ACCEPTED_AS_SHOWN_IN_UNIFIED_REVIEW").map(x=>x.artwork_id),
 ...registry.slots.flatMap(s=>s.works.filter(w=>affirm.has(w.editorial)).map(w=>w.id))
]);
const activeCross=registry.slots.flatMap(s=>s.works.filter(w=>w.editorial==="USER_APPROVED_CROSS_PRAYER_REUSE").map(w=>({slot:s.slot_id,...w})));
const quarantined=registry.slots.flatMap(s=>s.works.filter(w=>w.editorial==="CROSS_PRAYER_REUSE_UNAPPROVED_SOURCE").map(w=>({slot:s.slot_id,...w})));
assert.equal(registry.slots.length,267);
assert.equal(newApproved.approved.length,25);
assert.equal(q2.counts.accepted_for_prayer,114);
assert.equal(b611.decisions.length,107);
assert.equal(overlay.inherited_reuse_edges.length,105);
assert.equal(activeCross.length,92);
const excludedLybaert=registry.slots.flatMap(s=>s.works.filter(w=>/Lybaert/i.test(w.artist||"")).map(w=>({slot:s.slot_id,...w})));
assert.equal(excludedLybaert.length,2);
for(const work of excludedLybaert){assert.equal(work.eligible,false);assert.equal(work.editorial,"USER_REJECTED_LATER_ARTISTIC_FIT");assert.equal(work.exclude_from_shortlist,true);}
assert.equal(quarantined.length,12);
for(const w of activeCross)assert.ok(approvedIds.has(w.id),"Cross-module reuse without affirmative user decision: "+w.slot+"/"+w.id);
for(const w of quarantined){assert.equal(w.eligible,false,"Quarantined edge unexpectedly eligible: "+w.slot);assert.ok(!approvedIds.has(w.id),"Approved work wrongly quarantined: "+w.id);}
for(const s of registry.slots)for(const w of s.works){
 if(String(w.editorial).startsWith("NEW_CANDIDATE"))assert.ok(!affirm.has(w.editorial),"NOT_APPROVED substring vulnerability returned");
}
// The user approved cross-prayer REUSE where the same event fits; never
// infer exact hand/foot depiction from a generic Crucifixion candidate.
const families=Object.values(CHAPLET_ARTWORK_FAMILIES);
assert.equal(families.length,5);
const counts={};
let n=0;
for(const family of families){
 const ids=[family.cover,...family.stages],missingApproved=[];
 counts[family.route]={artworkSlots:ids.length,stages:family.stages.length,slotsWithApprovedStagePlacements:0,stagesWithoutApprovedPlacement:[]};
 for(const item of ids){
  n++;
  const row=slots.get(item.slot);
  assert.ok(row,"Chaplet scene missing from editorial registry: "+item.slot);
  assert.ok(row.works.some(w=>w.eligible),"Chaplet scene has no research candidate: "+item.slot);
  const resolved=resolveArtworkRuntimeIdentity({owner:"chaplet",id:family.route,stage:item.id});
  const direct=resolveChapletArtworkStage({id:family.route,stage:item.id});
  assert.equal(resolved.slot,item.slot);
  assert.equal(resolved.key,direct.key);
  assert.equal(resolved.publicationReady,false);
  assert.equal(resolved.assetUrl,null);
  const explicit=row.works.filter(w=>isEditorialArtworkPlacementApproved(w,{sourceArtIdApproved:approvedIds.has(w.id)}));
  if(explicit.length)counts[family.route].slotsWithApprovedStagePlacements++;
  else counts[family.route].stagesWithoutApprovedPlacement.push(item.id);
 }
 assert.equal(counts[family.route].stagesWithoutApprovedPlacement.length,0,
  "A chaplet cover/stage lost all affirmatively approved artwork: "+family.route);
 assert.equal(counts[family.route].slotsWithApprovedStagePlacements,ids.length,
  "Every chaplet scene should have an affirmatively approved artwork pool, not merely an unreviewed candidate");
 assert.equal(family.beadCountKnown,false);
 assert.equal(family.publicationReady,false);
 const invalid=resolveArtworkRuntimeIdentity({owner:"chaplet",id:family.route,stage:"invented_fifteenth_sorrow"});
 assert.equal(invalid.slot,null,"Unknown chaplet stages must fail closed");
}
assert.equal(n,26,"Expected 5 covers plus 21 stage-specific/shared-pool slots");
for(const item of [
 {id:"pray.five_wounds",stage:"sacred_side",expected:"STG-pray.five_wounds-05"},
 {id:"pray.precious_blood",stage:"circumcision",expected:"STG-pray.precious_blood-01"},
 {id:"prayer.seven_sorrows_chaplet",stage:"meet_cross",expected:"STG-prayer.seven_sorrows_chaplet-04"},
 {id:"pray.little_crown",stage:"beads",expected:"STG-pray.little_crown-01"},
 {id:"pray.divine_mercy",stage:"decades",expected:"STG-pray.divine_mercy-01"}
])assert.equal(resolveChapletArtworkStage(item).slot,item.expected);
assert.equal(resolveChapletArtworkStage({id:"pray.made_up",stage:"cover"}).slot,null);
const report={
 gate:"EDITORIAL_CHAPLET_STAGE_CONTRACT_PASS_NO_IMAGE_PUBLICATION",
 fiveChapletFamilies:families.length,
 artworkSlots:n,
 activeUserApprovedReuses:activeCross.length,
 quarantinedUnsupportedReuses:quarantined.length,
 unapprovedCandidatesStillPresent:true,
 readerRuntimeBeadParityCertified:false,
 photoRightsQualityPassed:false,
 publicationReady:false,
 byFamily:counts
};
console.log(JSON.stringify(report,null,2));
