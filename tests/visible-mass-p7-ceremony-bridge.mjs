import assert from "node:assert/strict";
import fs from "node:fs";
import {projectVisibleMassP7} from "../previews/visible-mass-3d/photographic-p7-ceremony-bridge.mjs";
const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const input={
 textCorpus:read("data/presentation/reader-text-sung.v1.json"),
 rubricEvents:read("data/presentation/reader-rubric-events.v1.json"),
 priestPositions:read("data/presentation/reader-priest-positions.v1.json"),
 faithfulGestures:read("data/presentation/reader-gestures.v1.json"),
 guideRegistry:read("data/presentation/guide-registry.v1.json")
};
const p=projectVisibleMassP7(input);
assert.equal(p.records.length,15);
assert.equal(p.guideCoverage,32);
assert.equal(p.records[0].cueId,"AO.SM.C0001");
assert.equal(p.records[7].cueId,"AO.SM.C0174");
assert.equal(p.records[8].cueId,"AO.SM.C0181");
assert.ok(p.records[7].priestEvents.some(e=>e.label==="ELEVATES HOST"));
assert.ok(p.records[8].priestEvents.some(e=>e.label==="ELEVATES CHALICE"));
assert.ok(p.records[7].priestEvents.some(e=>e.kind==="BELL"));
assert.equal(p.records[5].condition,"INCENSE_ENABLED");
assert.equal(p.records[12].stationEvents[0].station,"COMMUNION_RAIL");
assert.ok(p.records[14].faithfulEvents.some(e=>e.action==="Genuflect"));
assert.equal(p.records[14].condition,"LAST_GOSPEL_PRESENT");
assert.ok(p.records.every(x=>!x.photographCeremonyProof));
assert.ok(p.records.every(x=>x.audiencePostureAuthority==="LOCAL_CUSTOM_NOT_UNIVERSAL_1962"));
assert.equal(p.publishesLowOrSolemnCueParity,false);
assert.equal(p.publishesSpecialRites,false);
assert.equal(p.modifiesMassReader,false);
for(const form of ["LOW","SOLEMN","SPECIAL","REQUIEM"]){
 assert.throws(()=>projectVisibleMassP7(input,form),/unreconciled ritual form/);
}
assert.throws(()=>projectVisibleMassP7({...input,guideRegistry:{...input.guideRegistry,status:"DRAFT"}}),/certified Guide/);
console.log("PASS Visible Mass P7: 15 exact Sung source cues with canonical roles/stations, Host and Chalice, conditional states, separate form gates, no ritual mutation");
