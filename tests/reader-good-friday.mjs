import assert from "node:assert/strict";
import "./distinct-rite-scripture-order.mjs";
import "./native-rite-scripture-context.mjs";
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
// Every kneel/rise pair shares its visual prayer text but only the exact
// Flectamus and Levate lines own the two canonical state events.
for(let n=1;n<=9;n++){
  const nn=String(n).padStart(2,"0");
  const kneel=built.steps.find(x=>x.recordId==="GF-SOP-"+nn+"-K");
  const rise=built.steps.find(x=>x.recordId==="GF-SOP-"+nn+"-R");
  const k=kneel.paragraphs.find(x=>x.id==="GF-SOP-"+nn+"-K");
  const r=kneel.paragraphs.find(x=>x.id==="GF-SOP-"+nn+"-R");
  assert.equal(k.latin,"Flectamus genua.");
  assert.equal(r.latin,"Levate.");
  assert.deepEqual([...k.sourceIds],["GF-SOP-"+nn+"-K"]);
  assert.deepEqual([...r.sourceIds],["GF-SOP-"+nn+"-R"]);
  assert.deepEqual([...rise.paragraphs.find(x=>x.id===k.id).sourceIds],[kneel.recordId]);
  assert.deepEqual([...rise.paragraphs.find(x=>x.id===r.id).sourceIds],[rise.recordId]);
  for(const row of kneel.paragraphs.filter(x=>!["GF-SOP-"+nn+"-K","GF-SOP-"+nn+"-R"].includes(x.id))){
    assert.deepEqual([...row.sourceIds],[],nn+" unrelated prayer text owns a kneeling event");
  }
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

for(let n=1;n<=3;n++){
  const kneel=built.steps.find(x=>x.recordId==="GF-X-52"+n);
  const rise=built.steps.find(x=>x.recordId==="GF-X-53"+n);
  for(const step of [kneel,rise]){
    const proclamation=step.paragraphs.find(x=>x.id==="GF-X-"+n+"-V");
    const response=step.paragraphs.find(x=>x.id==="GF-X-"+n+"-R");
    assert.deepEqual([...proclamation.sourceIds],[],"Ecce lignum falsely triggered kneeling");
    assert.deepEqual([...response.sourceIds],["GF-X-52"+n],"Cross response not tied to its own unveiling");
  }
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

const venerate=createGoodFridayReaderController({graph,payload});
venerate.goToRecord("GF-VEN-600");
const personalSequence=[
  ["GF-VEN-600","WAITING",null],
  ["GF-VEN-610","APPROACHING","APPROACH_CROSS"],
  ["GF-VEN-620","GENUFLECTING","ONE_SIMPLE_GENUFLECTION"],
  ["GF-VEN-630","VENERATING","KISS_OR_VENERATE_CROSS"],
  ["GF-VEN-640","COMPLETE","RETURN_TO_PLACE"],
];
for(const [i,[id,personalState,action]] of personalSequence.entries()){
  const state=venerate.project();
  assert.equal(state.step.recordId,id,"personal Cross state advanced from unrelated hymn text");
  assert.equal(state.personalState,personalState);
  assert.equal(state.action,action);
  assert.equal(state.personalOnly,true);
  assert.equal(state.card.id,"CROSS_VENERATION");
  if(i<personalSequence.length-1)venerate.next();
}
venerate.next();
assert.equal(venerate.project().step.recordId,"GF-X-700",
  "personal Cross veneration was not completed before altar replacement");
const noPersonal=createGoodFridayReaderController({graph,payload,venerationMode:"CORPORATE_SILENT"});
assert.equal(noPersonal.goToRecord("GF-VEN-620").step.recordId,"GF-OPEN-010",
  "corporate silent mode manufactured a personal genuflection state");
noPersonal.goToRecord("GF-VEN-650");
assert.equal(noPersonal.project().action,"SILENT_ADORATION_FROM_PLACE");

// Sacramental object movement is a separate 1962 source state; accompanying
// antiphons cannot imply that the Blessed Sacrament has reached the altar.
const objectRite=createGoodFridayReaderController({graph,payload});
for(const [record,posture,object] of [
  ["GF-COM-810","KNEEL","BLESSED_SACRAMENT_RETURNING"],
  ["GF-COM-820","STAND","BLESSED_SACRAMENT_AT_ALTAR"],
  ["GF-COM-830","STAND",null],
  ["GF-COM-840","KNEEL",null],
  ["GF-COM-860","STAND",null],
]){
  objectRite.goToRecord(record);
  const state=objectRite.project();
  assert.equal(state.posture,posture,record+" lost its distinct temporary posture");
  assert.equal(state.objectState,object,record+" retained a stale sacramental object state");
}
assert.equal(objectRite.project().step.recordId,"GF-COM-860");

console.log("Good Friday distinct rite: PASS — 56-state graph, Passion death pause, nine Solemn Prayers, three unveilings, personal veneration/Communion and 1962 prayer policy.");
