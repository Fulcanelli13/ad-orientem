import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildPalmPayload, createPalmReaderController } from "../src/mass/reader-palm.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-palm.v1.json");
const graph=extension.graphs.PALM;

assert.equal(graph.length,12);

const built=buildPalmPayload({graph,payload});
assert.equal(built.cards.length,7);
assert.equal(built.cards[0].id,"PALM-R01");
assert.equal(built.cards[1].id,"PALM-R02");
assert.equal(built.cards[2].gesture,"GOSPEL_CROSSES");
assert.equal(built.cards[3].posture,"PROCESSIONAL");
assert.equal(built.cards[6].handoff,"INTROIT");
assert.equal(built.cards[6].ordinaryOpeningSuppressed,true);
assert.equal(built.cards[6].normalLastGospel,false);

for(const card of built.cards){
  for(const row of card.paragraphs)assert.ok(row.latin,"Palm reader row contains blank liturgical text");
}

const ctrl=createPalmReaderController({graph,payload});
let state=ctrl.project();
assert.equal(state.card.id,"PALM-R01");

ctrl.goTo("PALM-R02");
state=ctrl.project();
assert.equal(state.recipientPosture,null,"recipient posture leaked before personal state");
ctrl.setRecipientState("RECIPIENT_CALLED");
state=ctrl.project();
assert.equal(state.recipientPosture,"STAND_WALK");
assert.equal(state.recipientAction,"APPROACH_ALTAR_RAIL");
ctrl.setRecipientState("RECEIVE_PALM");
state=ctrl.project();
assert.equal(state.recipientPosture,"KNEEL");
assert.equal(state.recipientAction,"RECEIVE_PALM");
ctrl.setRecipientState("PALM_RECEIVED");
state=ctrl.project();
assert.equal(state.recipientPosture,"STAND_WALK");

ctrl.goTo("PALM-R04");
state=ctrl.project();
assert.equal(state.card.actorScope,"FAITHFUL_PARTICIPATING");
assert.equal(state.card.posture,"PROCESSIONAL");

ctrl.goTo("PALM-R07");
state=ctrl.project();
assert.equal(state.handoff,"INTROIT");
assert.equal(state.ordinaryOpeningSuppressed,true);
assert.equal(state.normalLastGospel,false);

const resolved=makeResolvedMass({
  date:"2027-03-21",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"palm-sunday",type:"CALENDAR"},
  precedingRites:["PALM"],
});
const plan=compileMassPlan(resolved);
assert.equal(plan.massEntry,"INTROIT");
assert.equal(plan.normalLastGospel,false,"Palm procession plan failed to suppress Last Gospel");
assert.deepEqual([...plan.precedingGraphs],["PALM"]);

console.log("native Palm payload: PASS — twelve-record coverage, personal distribution state, procession and Introit/Last-Gospel handoff.");
