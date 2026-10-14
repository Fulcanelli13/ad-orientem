import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCanonVIII8Attendants,createCanonVIII8AttendantReview}
 from "../src/mass/reader-canon-viii8-elevation-attendants.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const evidence={
 source:read("../data/research/mass-canon-viii8-elevation-attendants-20261014.json"),
 legacyMinisters:read("../data/research/mass-canon-minister-form-branches-20261013.json"),
};
const audit=validateCanonVIII8Attendants(evidence);
assert.equal(audit.actions.length,6);
assert.equal(evidence.legacyMinisters.branches.length,11);
assert.equal(evidence.source.publication,"FORBIDDEN");
assert.ok(audit.actions.every(x=>x.publishable===false&&!x.observedNow));
const ctrl=createCanonVIII8AttendantReview(evidence);
assert.equal(ctrl.preview().scheduledActions.length,0);
assert.equal(ctrl.preview({editorialPreview:true,form:"NOT_SOURCED"}).scheduledActions.length,0);
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){
 const p=ctrl.preview({editorialPreview:true,form,communicantsPresent:true,
  fastDay1962:true,massForDead:true});
 assert.equal(p.status,"NO_VIII8_TORCH_OR_SUBDEACON_RULE_FOR_THIS_FORM");
 assert.equal(p.scheduledActions.length,0);
}
for(const absent of [{},{communicantsPresent:true,fastDay1962:null,massForDead:false},
 {communicantsPresent:"yes",fastDay1962:false,massForDead:false}]){
 const p=ctrl.preview({editorialPreview:true,form:"SOLEMN",...absent});
 assert.equal(p.status,"VIII8_EXCEPTION_CONTEXT_NOT_VERIFIED");
 assert.equal(p.scheduledActions.length,0);
}
let combos=0;
for(const communicantsPresent of [false,true])
 for(const fastDay1962 of [false,true])
  for(const massForDead of [false,true]){
   const p=ctrl.preview({editorialPreview:true,form:"SOLEMN",
    communicantsPresent,fastDay1962,massForDead});
   const untilCommunion=communicantsPresent||fastDay1962||massForDead;
   assert.equal(p.status,"VIII8_PLANNED_SOURCE_ORDER_EDITORIAL_ONLY");
   assert.equal(p.publishable,false);
   assert.equal(p.observedNow,false);
   assert.equal(p.torchMinimumCount,2);
   assert.equal(p.extinguishAfter,untilCommunion?"COMMUNION":"CHALICE_ELEVATION");
   assert.equal(p.scheduledActions.length,3,"Overlapping exceptions must not create multiple extinguishings");
   assert.deepEqual(p.scheduledActions.map(x=>x.actor),["ACOLYTES","SUBDEACON","ACOLYTES"]);
   assert.deepEqual(p.scheduledActions.map(x=>x.action),[
    "LIGHT_MINIMUM_TWO_TORCHES","GENUFLECT_IN_HIS_PLACE","EXTINGUISH_TORCHES"]);
   assert.equal(p.scheduledActions[2].relativeAnchor,untilCommunion?"AFTER_COMMUNION":"AFTER_CHALICE_ELEVATION");
   assert.deepEqual(p.reviewExceptionReasons,[
    ...(communicantsPresent?["COMMUNICANTS_PRESENT"]:[]),
    ...(fastDay1962?["FAST_DAY_1962"]:[]),
    ...(massForDead?["MASS_FOR_DEAD"]:[])]);
   assert.ok(p.scheduledActions.every(x=>!x.observedNow&&!x.publishable));
   combos++;
  }
assert.equal(combos,8);
const corrupt=mut=>{const x=structuredClone(evidence);mut(x);return x};
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.source.rows[0].actor="PRIEST";
})),/source action/);
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.source.rows[1].actor="ACOLYTES";
})),/source action/);
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.source.rows[1].observedNow=true;
})),/source action/);
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.source.rows[2].sourceSection="IX.3";
})),/source action/);
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.source.rows[3].condition="SOURCE_PRESCRIBED";
})),/exception ownership/);
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.source.rows[5].publishable=true;
})),/source action/);
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.legacyMinisters.branches.pop();
})),/existing minister ledger/);
assert.throws(()=>validateCanonVIII8Attendants(corrupt(x=>{
 x.source.reusedExistingMinisterIDs.pop();
})),/duplicate or override/);
console.log("PASS: VIII.8 6 acolyte/subdeacon source actions, 8 overlapping torch-duration contexts, four forms, 11 old minister branches untouched and zero LIVE publication.");
