import assert from "node:assert/strict";
import fs from "node:fs";
import {projectVisibleMassP8} from "../previews/visible-mass-3d/photographic-p8-form-bridge.mjs";
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const input={
 graph:read("data/mass/mc-event-graph.v1.json"),
 eventFragments:Array.from({length:6},(_,i)=>read("data/mass/mc-events-0"+(i+1)+".v1.json")),
 lowProfile:read("data/mass/low-mass-profile.v1.json"),
 solemnProfile:read("data/mass/solemn-mass-profile.v1.json"),
 solemnMinisterResearch:read("data/mass/ritus-1962-solemn-ministers-batch02.v1.json")
};
const p=projectVisibleMassP8(input);
assert.equal(p.forms.LOW.selectedCount,21);
assert.equal(p.forms.SOLEMN.selectedCount,28);
assert.equal(p.forms.LOW.maximalCertifiedContextEvents,168);
assert.equal(p.forms.SOLEMN.maximalCertifiedContextEvents,177);
assert.equal(p.ministerResearch.length,6);
assert.ok(p.ministerResearch.every(e=>e.status==="RESEARCH_NOT_RUNTIME_CERTIFIED"));
assert.ok(p.forms.LOW.items.every(e=>e.publication==="CERTIFIED_OBJECTIVE_EVENT"));
assert.ok(p.forms.LOW.items.every(e=>e.voiceClaimForSpecificForm===null));
for(const form of [p.forms.LOW,p.forms.SOLEMN]){
 assert.ok(form.items.some(e=>e.id==="MC-CNS-020"));
 assert.ok(form.items.some(e=>e.id==="MC-CNS-040"));
 assert.ok(form.items.some(e=>e.id==="MC-CNS-090"));
 assert.ok(form.items.some(e=>e.id==="MC-CNS-110"));
 assert.ok(form.items.every(e=>!e.photoProvesAction&&!e.massReaderCardId));
}
assert.ok(p.forms.SOLEMN.items.some(e=>e.id==="MC-COM-160"));
assert.ok(!p.forms.LOW.items.some(e=>e.id==="MC-COM-160"));
assert.ok(p.forms.SOLEMN.items.some(e=>e.id==="MC-ALT-040"));
assert.ok(!p.forms.LOW.items.some(e=>e.id==="MC-ALT-040"));
assert.ok(p.forms.SOLEMN.items.find(e=>e.id==="MC-COM-185").soundEvents
.some(x=>x.legal_status==="PRESCRIBED_CONDITIONALLY_IF_FAITHFUL_COMMUNICATE"));
assert.equal(p.modifiesReader,false);
assert.equal(p.publishesFullTraversal,false);
assert.equal(p.publishesMinisterResearchAsRuntime,false);
assert.throws(()=>projectVisibleMassP8({...input,graph:{
 ...input.graph,researchGatedForms:{...input.graph.researchGatedForms,
 MISSA_CANTATA:{status:"CERTIFIED"}}}}),/Missa Cantata/);
assert.throws(()=>projectVisibleMassP8({...input,solemnMinisterResearch:{
 ...input.solemnMinisterResearch,status:"PUBLISHED"}}),/minister details/);
console.log("PASS P8: Low 21/168, Solemn 28/177; distinct objective event actors, six research-only ministers; no false form, posture or photo parity");
