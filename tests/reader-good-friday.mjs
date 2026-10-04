import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildGoodFridayReader,createGoodFridayReaderController} from "../src/mass/reader-good-friday.js";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const payload=load("../data/presentation/reader-good-friday.v1.json");
const core=load("../data/mass/special-days-core.v1.1.json");
const graph=core.graphs.GF;

assert.equal(payload.schema,"ao-r28-good-friday-payload-v1");
assert.equal(payload.status,"SOURCE_PINNED_1962_GOOD_FRIDAY_LATIN");
assert.equal(graph.length,56);

const built=buildGoodFridayReader({graph,payload});
assert.equal(built.schema,"ao-r28-good-friday-reader-v1");
assert.equal(built.ordinaryMassGraphActive,false);
assert.equal(built.sourceRecordCount,56);
assert.ok(built.activeStepCount>40);
assert.equal(built.jewishPrayerVariant,"PRINTED_1962");
assert.equal(built.venerationMode,"PERSONAL");
assert.equal(built.willReceiveCommunion,false);

const ctrl=createGoodFridayReaderController({graph,payload});
let s=ctrl.project();
assert.equal(s.ordinaryMassGraphActive,false);
assert.equal(s.step.recordId,"GF-OPEN-010");
assert.equal(s.posture,"STAND");

s=ctrl.goToRecord("GF-PASS-320");
assert.equal(s.step.recordId,"GF-PASS-320");
assert.equal(s.posture,"KNEEL");
assert.equal(s.action,"PAUSE_BRIEFLY");
assert.match(s.card.title,/Passion/);
s=ctrl.goToRecord("GF-PASS-330");
assert.equal(s.posture,"STAND");

for(const [kneel,rise] of [
  ["GF-SOP-01-K","GF-SOP-01-R"],
  ["GF-SOP-05-K","GF-SOP-05-R"],
  ["GF-SOP-09-K","GF-SOP-09-R"],
]){
  s=ctrl.goToRecord(kneel);
  assert.equal(s.posture,"KNEEL");
  assert.equal(s.action,"SILENT_PRAYER");
  assert.equal(ctrl.goToRecord(rise).posture,"STAND");
}

for(const [kneel,rise] of [
  ["GF-X-521","GF-X-531"],["GF-X-522","GF-X-532"],["GF-X-523","GF-X-533"],
]){
  s=ctrl.goToRecord(kneel);
  assert.equal(s.posture,"KNEEL");
  assert.equal(s.action,"BRIEF_SILENT_ADORATION");
  assert.equal(ctrl.goToRecord(rise).posture,"STAND");
}

s=ctrl.goToRecord("GF-VEN-600");
assert.equal(s.personalOnly,true);
assert.equal(s.personalState,"WAITING");
assert.equal(s.posture,"SIT");
assert.equal(ctrl.goToRecord("GF-VEN-610").action,"APPROACH_CROSS");
assert.equal(ctrl.goToRecord("GF-VEN-620").action,"ONE_SIMPLE_GENUFLECTION");
assert.equal(ctrl.goToRecord("GF-VEN-630").action,"KISS_OR_VENERATE_CROSS");
s=ctrl.goToRecord("GF-VEN-640");
assert.equal(s.action,"RETURN_TO_PLACE");
assert.equal(s.posture,"SIT");

const corporate=createGoodFridayReaderController({graph,payload,venerationMode:"CORPORATE_SILENT"});
s=corporate.goToRecord("GF-VEN-650");
assert.equal(s.step.recordId,"GF-VEN-650");
assert.equal(s.action,"SILENT_ADORATION_FROM_PLACE");
assert.equal(s.step.branchCondition,"CROSS_VENERATION_MODE=CORPORATE_SILENT");

s=ctrl.goToRecord("GF-COM-810");
assert.equal(s.objectState,"BLESSED_SACRAMENT_RETURNING");
assert.equal(s.posture,"KNEEL");
s=ctrl.goToRecord("GF-COM-820");
assert.equal(s.objectState,"BLESSED_SACRAMENT_AT_ALTAR");
assert.equal(s.posture,"STAND");
s=ctrl.goToRecord("GF-COM-830");
assert.equal(s.action,"RECITE_PATER");
assert.equal(s.posture,"STAND");
assert.equal(ctrl.goToRecord("GF-COM-840").posture,"KNEEL");

const communicant=createGoodFridayReaderController({graph,payload,willReceiveCommunion:true});
s=communicant.goToRecord("GF-COM-850");
assert.equal(s.step.recordId,"GF-COM-850");
assert.equal(s.personalOnly,true);
assert.equal(s.personalState,"RECEIVING_COMMUNION");
assert.equal(s.action,"RECEIVE_COMMUNION");
assert.equal(communicant.goToRecord("GF-COM-860").posture,"STAND");

s=ctrl.goToRecord("GF-END-910");
assert.equal(s.posture,"STAND");
assert.equal(s.atEnd,true);

const resolved=makeResolvedMass({
  date:"2027-03-26",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
  calendarCelebration:{id:"good-friday",type:"CALENDAR"},distinctRite:"GOOD_FRIDAY"
});
const plan=compileMassPlan(resolved);
assert.equal(plan.kind,"DISTINCT_RITE");
assert.equal(plan.rite,"GOOD_FRIDAY");
assert.equal(plan.canonicalMassGraphActive,false);

console.log("native Good Friday runtime: PASS — canonical 56-state controller remains distinct from ordinary Mass.");
