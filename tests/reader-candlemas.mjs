import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCandlemasPayload, createCandlemasReaderController } from "../src/mass/reader-candlemas.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-candlemas.v1.json");
const graph=extension.graphs.CND;

assert.equal(graph.length,11);
const built=buildCandlemasPayload({graph,payload});
assert.equal(built.readerPayloadComplete,true);
assert.equal(built.cards.length,7);
assert.equal(payload.blessingOrations.length,5);
assert.equal(built.cards[0].paragraphs.filter(x=>/^CND-R01-O\d$/.test(x.id)).length,5);
assert.ok(built.cards[0].paragraphs.filter(x=>/^CND-R01-O\d$/.test(x.id)).every(x=>x.latin.length>150));
assert.equal(built.cards[1].faithfulGesture,null);
assert.equal(built.cards[2].recipientStates.RECEIVE_CANDLE.posture,"KNEEL");
assert.equal(built.cards[4].objectState,"CANDLE_LIT");
assert.equal(built.cards[6].handoff,"INTROIT");
assert.equal(built.cards[6].ordinaryOpeningSuppressed,true);

const ctrl=createCandlemasReaderController({graph,payload});
let s=ctrl.project();
assert.equal(s.card.id,"CND-R01");
assert.equal(s.hasBlessedCandle,false);

ctrl.goTo("CND-R03");
s=ctrl.project();
assert.equal(s.recipientPosture,null,"recipient posture leaked before personal state");
ctrl.setRecipientState("RECIPIENT_CALLED");
assert.equal(ctrl.project().recipientPosture,"STAND_WALK");
ctrl.setRecipientState("RECEIVE_CANDLE");
s=ctrl.project();
assert.equal(s.recipientPosture,"KNEEL");
assert.equal(s.hasBlessedCandle,true);
ctrl.setRecipientState("CANDLE_RECEIVED");
assert.equal(ctrl.project().recipientPosture,"STAND_WALK");

ctrl.setProcessionParticipant(true);
ctrl.goTo("CND-R05");
assert.equal(ctrl.project().candleState,"CANDLE_LIT");

let object=ctrl.massCandleState("MC-GSP-060");
assert.equal(object.state,"CANDLE_LIT");
assert.equal(object.postureOverride,null);
object=ctrl.massCandleState("MC-SAN-010");
assert.equal(object.state,"CANDLE_LIT");
object=ctrl.massCandleState("MC-CNS-040");
assert.equal(object.state,"CANDLE_LIT");
object=ctrl.massCandleState("MC-COM-030");
assert.equal(object.state,"CANDLE_LIT");
object=ctrl.massCandleState("MC-COM-040");
assert.equal(object.state,null,"Candlemas forced candle state after Pater completion");

ctrl.goTo("CND-R07");
s=ctrl.project();
assert.equal(s.handoff,"INTROIT");
assert.equal(s.ordinaryOpeningSuppressed,true);

const observer=createCandlemasReaderController({graph,payload});
observer.goTo("CND-R03");
observer.setRecipientState("CANDLE_RECEIVED");
observer.goTo("CND-R05");
assert.equal(observer.project().candleState,"BLESSED_CANDLE_HELD",
  "observing with a candle silently implied participation and a lit candle");
assert.equal(observer.project().posture,null,
  "Candlemas procession posture imposed on a non-participant");
observer.setProcessionParticipant(true);
assert.equal(observer.project().posture,"PROCESSIONAL");
assert.equal(observer.project().candleState,"CANDLE_LIT");
observer.goTo("CND-R06");
assert.equal(observer.project().posture,"PROCESSIONAL_STAND");
observer.setProcessionParticipant(false);
assert.equal(observer.project().posture,null,
  "declining Candlemas procession retained the walking posture");
observer.goTo("CND-R04");
assert.equal(observer.project().posture,"STAND",
  "procession participation gate incorrectly hid communal prayer posture");

const noCandle=createCandlemasReaderController({graph,payload});
assert.equal(noCandle.massCandleState("MC-GSP-060").state,null,
  "Candle state was invented for someone without a blessed candle");

const resolved=makeResolvedMass({
  date:"2027-02-02",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"purificatio-bmv",type:"CALENDAR"},
  precedingRites:["CANDLEMAS"],
});
const plan=compileMassPlan(resolved);
assert.equal(plan.massEntry,"INTROIT");
assert.deepEqual([...plan.precedingGraphs],["CANDLEMAS"]);

const incomplete=structuredClone(payload);
incomplete.blessingOrations[3].latin="";
assert.throws(()=>buildCandlemasPayload({graph,payload:incomplete}),/blessing text missing/,
  "Candlemas accepted an incomplete five-prayer corpus");

console.log("native Candlemas payload: PASS — five prayers, personal candle reception, processional light and Mass candle-state windows.");
