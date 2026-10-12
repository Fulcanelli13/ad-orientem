import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {previewPriestCeremonialOwnership as project} from "../tools/mass/priest-owner-independent-clock-preview.mjs";

const load=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const matrix=load("mass/gesture-matrix.v1.json");
const corpus=load("presentation/reader-text-sung.v1.json");
const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
const common={gestureMatrix:matrix,sungCorpus:corpus};
for(const form of forms){
  for(const publicCueId of ["AO.SM.C0145","AO.SM.C0148"]){
    const without=project({form,publicCueId,...common});
    assert.equal(without.priestAction,null,"Schola cue emitted a priest action");
    assert.equal(without.reason,"SCHOLA_CUE_NOT_PRIEST_OBSERVATION");
    assert.equal(without.scholaCueRetained,publicCueId,"Schola public text lost");
    assert.equal(without.faithfulPosture,null,"priest event inferred faithful posture");
    assert.equal(without.runtimeApproved,false);
  }
}
const observations=[
  ["PRIEST_SANCTUS_RECITATION","GM.P.C0145.01","AO.SM.C0145"],
  ["PRIEST_BENEDICTUS_RECITATION","GM.P.C0148.01","AO.SM.C0148"]
];
for(const [eventType,id,cue] of observations){
 for(const form of forms){
   // The public choir may be singing different words; observed priest time remains independent.
   const actual=project({form,publicCueId:"AO.SM.C0143",
     observedPriestEvent:{actor:"PRIEST",eventType,observed:true},...common});
   assert.equal(actual.owner,"PRIEST_OBSERVATION");
   assert.equal(actual.priestAction.sourceGestureId,id);
   assert.equal(actual.priestAction.sourceCanonicalCueId,cue);
   assert.equal(actual.priestAction.owner,"OBSERVED_PRIEST_EVENT_NOT_SCHOLA");
   assert.equal(actual.publicCueId,"AO.SM.C0143");
   assert.equal(actual.scholaCueRetained,"AO.SM.C0143");
   assert.equal(actual.faithfulPosture,null);
   assert.equal(actual.researchOnly,true);
   assert.equal(actual.runtimeApproved,false);
 }
}
for(const observedPriestEvent of [
 {actor:"SCHOLA",eventType:"PRIEST_SANCTUS_RECITATION",observed:true},
 {actor:"PRIEST",eventType:"PRIEST_SANCTUS_RECITATION",observed:false},
 {actor:"PRIEST",eventType:"UNKNOWN",observed:true}
]){
 const x=project({form:"MISSA_CANTATA_SIMPLE",publicCueId:"AO.SM.C0145",observedPriestEvent,...common});
 assert.equal(x.priestAction,null,"unsupported observation was accepted");
}
assert.equal(project({form:"LOW",publicCueId:"AO.SM.C0151",...common}).priestAction,null,
 "altar kiss must not move without phrase boundary gate");
assert.equal(project({form:"SOLEMN",publicCueId:"AO.SM.C0211",...common}).priestAction,null,
 "paten handoff inferred from private Amen");
assert.equal(project({form:"LOW",publicCueId:"AO.SM.C0001",...common}).priestAction,null,
 "pre-Mass reverence invented at In nomine");
assert.equal(project({form:"HIGH",publicCueId:"AO.SM.C0145",...common}).reason,"UNSUPPORTED_FORM");
assert.equal(project({form:"SOLEMN",publicCueId:"AO.SM.C0999",...common}).reason,"UNKNOWN_CUE");
console.log("PASS priest-owner proof of concept: Schola clock never drives priest Sanctus/Benedictus; observed priest act is independently sourced, research-only.");
