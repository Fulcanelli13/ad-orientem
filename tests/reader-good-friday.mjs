import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildGoodFridayPayload,createGoodFridayReaderController} from "../src/mass/reader-good-friday.js";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const core=load("../data/mass/special-days-core.v1.1.json");
const payload=load("../data/presentation/reader-good-friday.v1.json");
const graph=core.graphs.GF;

assert.equal(graph.length,56);
const built=buildGoodFridayPayload({graph,payload});
assert.equal(built.readerPayloadComplete,true);
assert.equal(built.sourceBlobSha,"608809d88d3b0d587e20e53d8ab22d4bde0c865e");
assert.equal(built.cards.length,9);
assert.equal(built.cards[2].title,"Passion according to St John");
assert.ok(built.cards[3].paragraphs.length>=40,"Solemn Prayers corpus was truncated");
assert.ok(built.cards[5].paragraphs.length>=100,"Cross veneration chants were truncated");
assert.ok(built.cards[7].paragraphs.some(x=>/Pater noster/.test(x.latin)));
assert.equal(built.cards[8].paragraphs.length,0,"Good Friday conclusion should be state-only");

const ctrl=createGoodFridayReaderController({graph,payload});
let s=ctrl.project();
assert.equal(s.card.id,"GF-R01");
assert.equal(s.activeEventId,"GF-OPEN-010");
assert.equal(s.posture,"STAND");
assert.equal(s.ordinaryMassGraphActive,false);

s=ctrl.setEvent("GF-OPEN-020");
assert.equal(s.posture,"KNEEL_PROFOUND_BOW");
s=ctrl.setEvent("GF-OPEN-030");
assert.equal(s.posture,"KNEEL_UPRIGHT");

s=ctrl.setEvent("GF-PASS-320");
assert.equal(s.card.id,"GF-R03");
assert.equal(s.posture,"KNEEL");
assert.equal(s.action,"PAUSE_BRIEFLY");
s=ctrl.setEvent("GF-PASS-330");
assert.equal(s.posture,"STAND");

for(const pair of [
  ["GF-SOP-01-K","GF-SOP-01-R"],["GF-SOP-04-K","GF-SOP-04-R"],["GF-SOP-09-K","GF-SOP-09-R"]
]){
  assert.equal(ctrl.setEvent(pair[0]).posture,"KNEEL");
  assert.equal(ctrl.project().action,"SILENT_PRAYER");
  assert.equal(ctrl.setEvent(pair[1]).posture,"STAND");
}

for(const [kneel,rise] of [
  ["GF-X-521","GF-X-531"],["GF-X-522","GF-X-532"],["GF-X-523","GF-X-533"]
]){
  s=ctrl.setEvent(kneel);
  assert.equal(s.card.id,"GF-R05");
  assert.equal(s.posture,"KNEEL");
  assert.equal(s.action,"BRIEF_SILENT_ADORATION");
  assert.equal(ctrl.setEvent(rise).posture,"STAND");
}

assert.equal(ctrl.setEvent("GF-VEN-600").posture,"SIT");
s=ctrl.setEvent("GF-VEN-610");
assert.equal(s.action,"APPROACH_CROSS");
assert.equal(s.personalState,"APPROACHING");
assert.equal(ctrl.setEvent("GF-VEN-620").action,"ONE_SIMPLE_GENUFLECTION");
assert.equal(ctrl.setEvent("GF-VEN-630").action,"KISS_OR_VENERATE_CROSS");
s=ctrl.setEvent("GF-VEN-640");
assert.equal(s.posture,"SIT");
assert.equal(s.action,"RETURN_TO_PLACE");
s=ctrl.setEvent("GF-VEN-650");
assert.equal(s.action,"SILENT_ADORATION_FROM_PLACE");
assert.equal(s.branchCondition,"CROSS_VENERATION_MODE=CORPORATE_SILENT");

s=ctrl.setEvent("GF-COM-810");
assert.equal(s.card.id,"GF-R07");
assert.equal(s.posture,"KNEEL");
assert.equal(s.objectState,"BLESSED_SACRAMENT_RETURNING");
s=ctrl.setEvent("GF-COM-820");
assert.equal(s.card.id,"GF-R08");
assert.equal(s.posture,"STAND");
assert.equal(s.objectState,"BLESSED_SACRAMENT_AT_ALTAR");
s=ctrl.setEvent("GF-COM-830");
assert.equal(s.action,"RECITE_PATER");
assert.equal(s.posture,"STAND");
assert.equal(ctrl.setEvent("GF-COM-840").posture,"KNEEL");
s=ctrl.setEvent("GF-COM-850");
assert.equal(s.actorScope,"COMMUNICANT");
assert.equal(s.personalState,"RECEIVING_COMMUNION");
assert.equal(s.action,"RECEIVE_COMMUNION");
assert.equal(ctrl.setEvent("GF-COM-860").posture,"STAND");

s=ctrl.setEvent("GF-END-900");
assert.equal(s.card.id,"GF-R09");
assert.equal(s.posture,"STAND");
assert.equal(s.action,"RESPOND_AMEN");
assert.equal(ctrl.setEvent("GF-END-910").posture,"STAND");
assert.throws(()=>ctrl.setEvent("MC-END-230"),/Unknown Good Friday event/,
  "Good Friday controller accepted an ordinary Mass event");

const resolved=makeResolvedMass({
  date:"2027-03-26",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
  calendarCelebration:{id:"good-friday",type:"CALENDAR"},
  distinctRite:"GOOD_FRIDAY",
});
const plan=compileMassPlan(resolved);
assert.equal(plan.kind,"DISTINCT_RITE");
assert.equal(plan.rite,"GOOD_FRIDAY");
assert.equal(plan.canonicalMassGraphActive,false);

console.log("native Good Friday: PASS — 56 event-owned states, full source corpus and no ordinary Mass graph.");
