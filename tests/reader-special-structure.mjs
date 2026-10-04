import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";
import { projectSpecialStructure, validateSpecialStructureSources } from "../src/mass/reader-special-structure.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=load("../data/mass/rite-overlay-registry.v1.json");
const extension=load("../data/mass/special-days-extension.v1.3.json");
const core=load("../data/mass/special-days-core.v1.1.json");
const sources={registry,extension,core};

const audit=validateSpecialStructureSources(sources);
assert.equal(audit.recoveredRegistryEntries,13);

const base={
  date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"dominica-xix",type:"CALENDAR"},
};

function prepared(extra={}){
  const resolvedMass=makeResolvedMass({...base,...extra});
  return {session:{resolvedMass,plan:compileMassPlan(resolvedMass)}};
}

let p=projectSpecialStructure(prepared(),sources);
assert.equal(p.releaseSupport,true);
assert.equal(p.specialSegmentCount,0);
assert.equal(p.segments.length,1);
assert.equal(p.segments[0].massEntry,"FOOT_CLUSTER");

p=projectSpecialStructure(prepared({precedingRites:["ASPERGES"]}),sources);
assert.equal(p.releaseSupport,true);
assert.equal(p.reason,null);
assert.equal(p.segments[0].readerPayload,"NATIVE_READER_PAYLOAD");
assert.equal(p.segments[0].id,"ASPERGES");
assert.equal(p.segments[0].handoff,"FOOT_CLUSTER");
assert.equal(p.segments[1].id,"ORDINARY_MASS");
assert.equal(p.segments[1].massEntry,"FOOT_CLUSTER");

for(const rite of ["PALM","ASH","CANDLEMAS","ROGATIONS"]){
  p=projectSpecialStructure(prepared({precedingRites:[rite]}),sources);
  assert.equal(p.segments[0].id,rite);
  assert.equal(p.segments[1].massEntry,"INTROIT",rite+" did not hand Mass to Introit");
  if(["PALM","ASH","CANDLEMAS"].includes(rite)){
    assert.equal(p.segments[0].readerPayload,"NATIVE_READER_PAYLOAD");
    assert.equal(p.releaseSupport,true,rite+" native reader was not release-supported");
  }else{
    assert.equal(p.releaseSupport,false,"Structural projector remains payload-agnostic for Rogations; native runtime is certified separately");
  }
  if(rite==="PALM")assert.equal(p.ending.normalLastGospel,false,"Palm procession failed to suppress Last Gospel");
}
p=projectSpecialStructure(prepared({precedingRites:["CANDLEMAS"]}),sources);
assert.deepEqual([...p.objectStates],["CANDLE_STATE_OVERLAY"]);

p=projectSpecialStructure(prepared({
  overlays:["REQUIEM"],
  proper:{status:"READY",data:{}},
}),sources);
assert.equal(p.ending.blessingAllowed,false);
const requiemSegment=p.segments.find(x=>x.id==="REQUIEM");
assert.ok(requiemSegment);
assert.equal(requiemSegment.planOwned,true);
assert.equal(requiemSegment.renderable,true);
assert.equal(requiemSegment.readerPayload,"PLAN_APPLIED_TO_ORDINARY_READER");
assert.equal(p.blockingSpecialSegmentCount,0);
assert.equal(p.releaseSupport,true);
assert.equal(p.readerPayloadComplete,true);

p=projectSpecialStructure(prepared({
  overlays:["REQUIEM"],
  proper:{status:"READY",data:{}},
  followingActions:["REQUIEM_ABSOLUTION"],
}),sources);
const abs=p.segments.find(x=>x.id==="REQUIEM_ABSOLUTION");
assert.ok(abs);
assert.equal(abs.readerPayload,"NATIVE_READER_PAYLOAD");
assert.equal(abs.renderable,true);
assert.equal(p.releaseSupport,true);

p=projectSpecialStructure(prepared({followingActions:["CORPUS_CHRISTI_PROCESSION"]}),sources);
assert.equal(p.ending.dismissal,"BENEDICAMUS_DOMINO");
assert.equal(p.ending.blessingAllowed,false);
assert.equal(p.ending.normalLastGospel,false);
assert.equal(p.segments.at(-1).id,"CORPUS_CHRISTI_PROCESSION");

const gf=makeResolvedMass({...base,distinctRite:"GOOD_FRIDAY"});
p=projectSpecialStructure({session:{resolvedMass:gf,plan:compileMassPlan(gf)}},sources);
assert.equal(p.kind,"DISTINCT_RITE");
assert.equal(p.ordinaryMassGraphActive,false);
assert.equal(p.reason,"DISTINCT_RITE_READER_PAYLOAD_REQUIRED");

const ev=makeResolvedMass({...base,distinctRite:"EASTER_VIGIL"});
p=projectSpecialStructure({session:{resolvedMass:ev,plan:compileMassPlan(ev)}},sources);
assert.equal(p.kind,"COMPOSITE_DISTINCT_RITE");
assert.equal(p.ordinaryMassGraphActive,true);
assert.equal(p.segments[1].id,"ORDINARY_MASS");
assert.equal(p.segments[1].ordinaryOpeningSuppressed,true);

console.log("special structure projection: PASS — compiled rite plan is preserved; missing reader payload fails closed.");
