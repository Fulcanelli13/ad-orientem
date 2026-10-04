import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildAshPayload, createAshReaderController } from "../src/mass/reader-ash.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-ash.v1.json");
const graph=extension.graphs.ASH;

assert.equal(graph.length,8);
const built=buildAshPayload({graph,payload});
assert.equal(built.readerPayloadComplete,true);
assert.equal(built.missingOrationIds.length,0);
assert.equal(built.cards.length,5);
assert.equal(built.cards[0].blessingOrations.length,4);
assert.ok(built.cards[0].paragraphs.filter(x=>/^ASH-R01-O\d$/.test(x.id)).every(x=>x.latin.length>40));
assert.equal(built.cards[1].faithfulGesture,null);
assert.equal(built.cards[2].recipientStates.RECEIVE_ASHES.posture,"KNEEL");
assert.equal(built.cards[4].handoff,"INTROIT");
assert.equal(built.cards[4].ordinaryOpeningSuppressed,true);

const ctrl=createAshReaderController({graph,payload});
let s=ctrl.project();
assert.equal(s.card.id,"ASH-R01");
ctrl.goTo("ASH-R03");
s=ctrl.project();
assert.equal(s.recipientPosture,null,"Ash recipient posture leaked before personal state");
ctrl.setRecipientState("RECIPIENT_CALLED");
assert.equal(ctrl.project().recipientPosture,"STAND_WALK");
ctrl.setRecipientState("RECEIVE_ASHES");
assert.equal(ctrl.project().recipientPosture,"KNEEL");
ctrl.setRecipientState("ASHES_RECEIVED");
assert.equal(ctrl.project().recipientPosture,"STAND_WALK");
ctrl.goTo("ASH-R05");
s=ctrl.project();
assert.equal(s.handoff,"INTROIT");
assert.equal(s.ordinaryOpeningSuppressed,true);

const resolved=makeResolvedMass({
  date:"2027-02-10",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"ash-wednesday",type:"CALENDAR"},
  precedingRites:["ASH"],
});
const plan=compileMassPlan(resolved);
assert.equal(plan.massEntry,"INTROIT");
assert.equal(plan.normalLastGospel,true);
assert.deepEqual([...plan.precedingGraphs],["ASH"]);

const incomplete=structuredClone(payload);
incomplete.blessingOrations[2].fullText=null;
const partial=buildAshPayload({graph,payload:incomplete});
assert.equal(partial.readerPayloadComplete,false);
assert.deepEqual([...partial.missingOrationIds],["ASH-OR-03"]);
assert.throws(()=>createAshReaderController({graph,payload:incomplete}),/ASH_FULL_TEXT_HYDRATION_REQUIRED/);

console.log("native Ash payload: PASS — eight-record coverage, four recovered orations, personal reception state and Introit handoff.");
