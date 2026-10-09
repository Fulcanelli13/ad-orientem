import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildRogationsPayload, createRogationsReaderController } from "../src/mass/reader-rogations.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-rogations.v1.json");
const graph=extension.graphs.ROG;
const sourceGate=load("../data/mass/rogation-proper-source-gate.v1.json");
assert.equal(sourceGate.status,"RESEARCH_ONLY_NOT_AVAILABLE_FOR_MASS_SELECTION");
assert.equal(sourceGate.publicationAllowed,false);
assert.equal(sourceGate.scope.defaultMass.class,4);
assert.equal(sourceGate.scope.defaultMass.colour,"white");
assert.equal(sourceGate.scope.conditionalMass.class,2);
assert.equal(sourceGate.scope.conditionalMass.colour,"violet");
assert.equal(sourceGate.scope.conditionalMass.requires,"explicit public litanies or procession");
assert.equal(sourceGate.scope.conditionalMass.handoff,"INTROIT");
assert.equal(sourceGate.scope.conditionalMass.omitOpeningPrayers,true);
assert.equal(sourceGate.scope.conditionalMass.gloria,false);
assert.equal(sourceGate.scope.conditionalMass.credo,false);
assert.equal(sourceGate.properSections.length,9);
assert.equal(new Set(sourceGate.properSections.map(x=>x.key)).size,9);
assert.ok(sourceGate.properSections.every(x=>!x.latinVerified&&!x.englishVerified&&!x.frenchVerified&&!x.exactSourceLocator),
  "Rogation Proper cannot be marked complete without passage-by-passage source collation");
assert.ok(sourceGate.sourceWitnesses.some(x=>x.type==="textual_candidate_not_normative_for_class"&&/NOT itself/.test(x.warning)),
  "A general online Rogation-week Proper must not certify processional class/rubrics");



assert.ok(sourceGate.properSections.every(x=>x.candidate && x.candidate.status==="DISCOVERED_NOT_COLLATED_TO_1962_MISSALE"),
  "Every Rogation Proper section must have an explicit uncertified candidate status");
assert.ok(sourceGate.properSections.every(x=>x.candidate.sourceLinks.length>=2 && x.candidate.translationRights==="NOT_CLEARED"),
  "No derivative translation may be published without independent textual and rights validation");
assert.match(sourceGate.properSections.find(x=>x.key==="epistle").candidate.passageReference,/James 5:16/);
assert.match(sourceGate.properSections.find(x=>x.key==="gospel").candidate.passageReference,/Luke 11:5/);
assert.match(sourceGate.properSections.find(x=>x.key==="secret").candidate.passageReference,/English absent/);

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
