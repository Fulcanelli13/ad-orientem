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
assert.equal(built.cards.length,8);
assert.ok(built.totalRows>=170,"Rogations payload regressed to an abridged litany");
assert.equal(built.processionalRule.calendarDateDoesNotActivateRite,true);
assert.equal(built.processionalRule.invocationResponseRepeat,2);
assert.equal(built.cards.at(-1).handoff,"INTROIT");
assert.equal(built.cards.at(-1).ordinaryOpeningSuppressed,true);

const all=built.cards.flatMap(c=>c.paragraphs).map(r=>r.latin);
assert.ok(all.some(x=>/Ut fructus terræ dare et conserváre dignéris/.test(x)));
assert.ok(all.some(x=>/Sancte (Ioseph|Joseph), ora pro nobis/.test(x)));
assert.ok(all.some(x=>/A fúlgure et tempestáte/.test(x)));
assert.ok(all.some(x=>/A peste, fame et bello/.test(x)));

const ctrl=createRogationsReaderController({graph,payload});
let s=ctrl.project();
assert.equal(s.card.id,"ROG-R01");
assert.equal(s.faithfulPosture,null);
ctrl.setProcessionParticipant(true);
assert.equal(ctrl.project().faithfulPosture,null,"participant flag alone fabricated a procession");
ctrl.setProcessionActive(true);
assert.equal(ctrl.project().faithfulPosture,"PROCESSIONAL");
ctrl.setProcessionParticipant(false);
assert.equal(ctrl.project().faithfulPosture,null);
ctrl.setProcessionParticipant(true);
ctrl.goTo("ROG-R08");
s=ctrl.project();
assert.equal(s.faithfulPosture,null,"Mass bridge retained processional posture");
assert.equal(s.handoff,"INTROIT");
assert.equal(s.ordinaryOpeningSuppressed,true);

const resolved=makeResolvedMass({
  date:"2027-04-25",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"st-mark",type:"CALENDAR"},
  precedingRites:["ROGATIONS"],
});
const plan=compileMassPlan(resolved);
assert.equal(plan.massEntry,"INTROIT");
assert.deepEqual([...plan.precedingGraphs],["ROGATIONS"]);

const noRite=makeResolvedMass({
  date:"2027-04-25",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"st-mark",type:"CALENDAR"},
  precedingRites:[],
});
assert.deepEqual([...compileMassPlan(noRite).precedingGraphs],[],
  "Rogations were inferred from calendar date without explicit rite activation");

console.log("native Rogations payload: PASS — full Litany corpus, explicit processional state and Introit handoff.");
