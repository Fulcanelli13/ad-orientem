import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildGoodFridayReader, createGoodFridayReaderController } from "../src/mass/reader-good-friday.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const core=load("../data/mass/special-days-core.v1.1.json");
const payload=load("../data/presentation/reader-good-friday.v1.json");
const graph=core.graphs.GF;

assert.equal(graph.length,56);
const resolved=makeResolvedMass({
  date:"2027-03-26",
  form:"SOLEMN",
  presentationMode:"LIVE",
  calendarCelebration:{id:"good-friday",type:"CALENDAR"},
  distinctRite:"GOOD_FRIDAY",
});
const plan=compileMassPlan(resolved);
assert.equal(plan.kind,"DISTINCT_RITE");
assert.equal(plan.rite,"GOOD_FRIDAY");
assert.equal(plan.canonicalMassGraphActive,false);
assert.equal(plan.ordinaryMassAssumptionsAllowed,false);

let built=buildGoodFridayReader({graph,payload});
assert.equal(built.ordinaryMassGraphActive,false);
assert.equal(built.sourceRecordCount,56);
assert.equal(built.jewishPrayerVariant,"PRINTED_1962");
assert.equal(built.venerationMode,"PERSONAL");
assert.equal(built.willReceiveCommunion,false);
assert.ok(built.steps.every(x=>/^GF-/.test(x.recordId)));
assert.equal(new Set(built.steps.map(x=>x.recordId)).size,built.steps.length);
assert.ok(!built.steps.some(x=>x.recordId==="GF-VEN-650"),"corporate veneration leaked into personal branch");
assert.ok(!built.steps.some(x=>x.recordId==="GF-COM-850"),"personal Communion step appeared for non-communicant");
for(const id of ["GF-VEN-600","GF-VEN-610","GF-VEN-620","GF-VEN-630","GF-VEN-640"]){
  assert.ok(built.steps.some(x=>x.recordId===id),id+" missing from personal veneration");
}

const death=built.steps.find(x=>x.recordId==="GF-PASS-320");
assert.equal(death.posture,"KNEEL");
assert.equal(death.action,"PAUSE_BRIEFLY");
assert.equal(death.surfaceKey,"PASSION_BEFORE_DEATH");
const resume=built.steps.find(x=>x.recordId==="GF-PASS-330");
assert.equal(resume.posture,"STAND");
assert.equal(resume.surfaceKey,"PASSION_AFTER_DEATH");
assert.ok(payload.passion.preDeath.at(-1).includes("tradidit spiritum"));
assert.ok(payload.passion.postDeath[0].startsWith("Iudaei ergo"));

for(let n=1;n<=9;n++){
  const s=String(n).padStart(2,"0");
  const kneel=built.steps.find(x=>x.recordId===`GF-SOP-${s}-K`);
  const rise=built.steps.find(x=>x.recordId===`GF-SOP-${s}-R`);
  assert.equal(kneel.posture,"KNEEL",s+" solemn prayer lost Flectamus genua");
  assert.equal(kneel.action,"SILENT_PRAYER");
  assert.equal(rise.posture,"STAND",s+" solemn prayer lost Levate");
  assert.equal(kneel.surfaceKey,rise.surfaceKey);
}
const jewishSurface=built.steps.find(x=>x.recordId==="GF-SOP-08-K");
assert.ok(jewishSurface.paragraphs.some(x=>/auferat velamen/.test(x.latin)),"printed 1962 Jewish prayer was not the default");
assert.ok(!jewishSurface.paragraphs.some(x=>/plenitudine gentium/.test(x.latin)),"2008 Jewish prayer silently replaced printed 1962 text");

const later=buildGoodFridayReader({graph,payload,jewishPrayerVariant:"HOLY_SEE_2008"});
const laterJewish=later.steps.find(x=>x.recordId==="GF-SOP-08-K");
assert.ok(laterJewish.paragraphs.some(x=>/plenitudine gentium/.test(x.latin)),"explicit 2008 overlay did not resolve");

for(const n of [1,2,3]){
  const k=built.steps.find(x=>x.recordId===`GF-X-52${n}`);
  const r=built.steps.find(x=>x.recordId===`GF-X-53${n}`);
  assert.equal(k.posture,"KNEEL");
  assert.equal(k.action,"BRIEF_SILENT_ADORATION");
  assert.equal(r.posture,"STAND");
  assert.equal(k.surfaceKey,`UNVEILING_${n}`);
}

const genuflect=built.steps.find(x=>x.recordId==="GF-VEN-620");
assert.equal(genuflect.personalOnly,true);
assert.equal(genuflect.action,"ONE_SIMPLE_GENUFLECTION");
assert.equal(genuflect.personalState,"GENUFLECTING");
assert.ok(!built.steps.some(x=>x.recordId==="GF-VEN-650"));

const corporate=buildGoodFridayReader({graph,payload,venerationMode:"CORPORATE_SILENT"});
assert.ok(corporate.steps.some(x=>x.recordId==="GF-VEN-650"));
for(const id of ["GF-VEN-600","GF-VEN-610","GF-VEN-620","GF-VEN-630","GF-VEN-640"]){
  assert.ok(!corporate.steps.some(x=>x.recordId===id),id+" leaked into corporate-silent branch");
}
const corp=corporate.steps.find(x=>x.recordId==="GF-VEN-650");
assert.equal(corp.action,"SILENT_ADORATION_FROM_PLACE");
assert.equal(corp.personalOnly,false);

const communicant=buildGoodFridayReader({graph,payload,willReceiveCommunion:true});
const receive=communicant.steps.find(x=>x.recordId==="GF-COM-850");
assert.equal(receive.actorScope,"COMMUNICANT");
assert.equal(receive.personalOnly,true);
assert.equal(receive.posture,"KNEEL");
assert.equal(receive.action,"RECEIVE_COMMUNION");
assert.equal(communicant.steps.find(x=>x.recordId==="GF-COM-830").posture,"STAND");
assert.equal(communicant.steps.find(x=>x.recordId==="GF-COM-840").posture,"KNEEL");
assert.equal(communicant.steps.find(x=>x.recordId==="GF-COM-860").posture,"STAND");

const end=communicant.steps.find(x=>x.recordId==="GF-END-900");
assert.equal(end.paragraphs.length,3);
assert.equal(end.posture,"STAND");
assert.equal(communicant.steps.at(-1).recordId,"GF-END-910");
assert.ok(!communicant.steps.some(x=>/FINAL_BLESSING|LAST_GOSPEL|ITE_MISSA/i.test(x.triggerKey)),"ordinary Mass ending leaked into Good Friday");

const ctrl=createGoodFridayReaderController({graph,payload,willReceiveCommunion:true});
assert.equal(ctrl.project().step.recordId,"GF-OPEN-010");
ctrl.goToRecord("GF-PASS-320");
assert.equal(ctrl.project().posture,"KNEEL");
assert.equal(ctrl.project().action,"PAUSE_BRIEFLY");
ctrl.next();
assert.equal(ctrl.project().step.recordId,"GF-PASS-330");
assert.equal(ctrl.project().posture,"STAND");

console.log("Good Friday distinct rite: PASS — 56-state graph, Passion death pause, nine Solemn Prayers, three unveilings, personal veneration/Communion and 1962 prayer policy.");
