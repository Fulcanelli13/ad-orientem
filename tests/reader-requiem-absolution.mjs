import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRequiemAbsolutionPayload, createRequiemAbsolutionReaderController } from "../src/mass/reader-requiem-absolution.js";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-requiem-absolution.v1.json");
const graph=extension.graphs.ABS;

assert.equal(graph.length,5);

let built=buildRequiemAbsolutionPayload({graph,payload,bodyPresent:true,burialProcession:true});
assert.equal(built.cards.length,5);
assert.equal(built.cards[0].id,"ABS-R01");
assert.equal(built.cards[1].id,"ABS-R02");
assert.ok(built.cards[1].paragraphs[0].latin.startsWith("Non intres"));
assert.equal(built.cards[2].id,"ABS-R03");
assert.ok(built.cards[2].paragraphs.some(x=>x.latin.includes("Líbera me")));
assert.equal(built.cards[3].faithfulGesture,null);
assert.ok(built.cards[3].paragraphs.some(x=>x.latin==="Pater noster."));
assert.equal(built.cards[4].id,"ABS-R05");
assert.equal(built.cards[4].posture,"PROCESSIONAL");
assert.equal(built.cards[4].handoff,"BURIAL_PROCESSION");

built=buildRequiemAbsolutionPayload({graph,payload,bodyPresent:false,burialProcession:true});
assert.equal(built.cards.length,3,"body-absent branch retained body/burial-only cards");
assert.ok(!built.cards.some(x=>x.id==="ABS-R02"),"Non intres appeared without body present");
assert.ok(!built.cards.some(x=>x.id==="ABS-R05"),"In paradisum appeared without a body-present burial procession");
assert.ok(built.cards.find(x=>x.id==="ABS-R04").paragraphs.some(x=>x.latin.startsWith("Absolve")));

const ctrl=createRequiemAbsolutionReaderController({graph,payload,bodyPresent:true,burialProcession:true});
assert.equal(ctrl.project().card.id,"ABS-R01");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R02");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R03");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R04");
ctrl.next();
assert.equal(ctrl.project().card.id,"ABS-R05");
assert.equal(ctrl.project().atEnd,true);
ctrl.previous();
assert.equal(ctrl.project().card.id,"ABS-R04");

const proper={status:"READY",data:{
  sourcePath:"Votive/Requiem",
  introit:{lat:"Requiem aeternam",en:"Eternal rest"},
  collects:[{lat:"Deus indulgentiarum",en:"O God"}],
  epistle:{lat:"Lectio",en:"Lesson"},
  gradual:{lat:"Requiem aeternam",en:"Eternal rest"},
  sequence:{lat:"Dies irae",en:"Day of wrath"},
  gospel:{lat:"Sequentia sancti Evangelii",en:"Gospel"},
  offertory:{lat:"Domine Jesu Christe",en:"Lord Jesus Christ"},
  secrets:[{lat:"Propitiare",en:"Be propitious"}],
  preface:{lat:"Praefatio",en:"Preface"},
  communion:{lat:"Lux aeterna",en:"Eternal light"},
  postcommunions:[{lat:"Praesta quaesumus",en:"Grant we beseech"}],
}};
const requiem=makeResolvedMass({
  date:"2026-10-04",form:"SOLEMN",presentationMode:"SIMPLE",
  calendarCelebration:{id:"TEMP",type:"CALENDAR"},
  requestedCelebration:{id:"requiem",type:"REQUIEM",title:"Requiem"},
  proper,
  overlays:["REQUIEM"],
  followingActions:["REQUIEM_ABSOLUTION"],
});
const plan=compileMassPlan(requiem);
assert.equal(plan.normalLastGospel,false);
assert.equal(plan.blessingAllowed,false);
assert.deepEqual([...plan.followingGraphs],["REQUIEM_ABSOLUTION"]);
assert.equal(plan.lifecycle.followingAction.active,true);

assert.throws(()=>compileMassPlan(makeResolvedMass({
  date:"2026-10-04",form:"SOLEMN",presentationMode:"SIMPLE",
  calendarCelebration:{id:"TEMP",type:"CALENDAR"},
  followingActions:["REQUIEM_ABSOLUTION"],
})),/requires the Requiem overlay/);

console.log("native Requiem Absolution: PASS — body branch, Libera, responses, no lay imitation and burial-procession branch.");
