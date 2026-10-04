import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRogationsPayload, createRogationsReaderController } from "../src/mass/reader-rogations.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-rogations.v1.json");
const graph=extension.graphs.ROG;

assert.equal(graph.length,6);
const built=buildRogationsPayload({graph,payload});
assert.equal(built.readerPayloadComplete,true);
assert.equal(built.petitionsDuplicated,false);
assert.equal(built.cards.length,6);
assert.equal(built.cards[0].id,"ROG-R01");
assert.equal(built.cards[0].posture,"STAND");
assert.equal(built.cards[1].posture,"KNEEL");
assert.equal(built.cards[1].petitionsDuplicated,false);
assert.equal(built.cards[2].processionBeginsAt,"Sancta Maria");
assert.equal(built.cards[2].posture,"PROCESSIONAL");
assert.match(built.cards[2].paragraphs[0].latin,/Sancta Maria/);
assert.equal(built.cards[5].handoff,"INTROIT");
assert.equal(built.cards[5].ordinaryOpeningSuppressed,true);
assert.equal(payload.postLitany.orations.length,10);
assert.ok(built.cards[2].paragraphs.length>100,"Rogation Litany was abridged");
for(const card of built.cards){
  for(const row of card.paragraphs)assert.ok(row.latin,"Rogations reader row contains blank liturgical text");
}

const ctrl=createRogationsReaderController({graph,payload});
let state=ctrl.project();
assert.equal(state.card.id,"ROG-R01");
assert.equal(state.processionActive,false);
ctrl.next();
assert.equal(ctrl.project().card.id,"ROG-R02");
assert.equal(ctrl.project().card.posture,"KNEEL");
ctrl.next();
state=ctrl.project();
assert.equal(state.card.id,"ROG-R03");
assert.equal(state.processionActive,true);
ctrl.goTo("ROG-R06");
state=ctrl.project();
assert.equal(state.handoff,"INTROIT");
assert.equal(state.ordinaryOpeningSuppressed,true);

const resolved=makeResolvedMass({
  date:"2027-05-10",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"feria-rogationum",type:"CALENDAR"},
  precedingRites:["ROGATIONS"],
});
const plan=compileMassPlan(resolved);
assert.equal(plan.massEntry,"INTROIT");
assert.deepEqual([...plan.precedingGraphs],["ROGATIONS"]);

console.log("native Rogations payload: PASS — six-record graph, undoubled 1962 Litany, Sancta Maria procession boundary and Introit handoff.");
