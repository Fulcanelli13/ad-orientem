import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveRogationMassVariant, rogationProperReady, ROGATION_PROPER_KEYS } from "../src/mass/rogation-mass-selection.js";
import { buildRogationsPayload, createRogationsReaderController } from "../src/mass/reader-rogations.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-rogations.v1.json");
const graph=extension.graphs.ROG;
const sourceGate=load("../data/mass/rogation-proper-source-gate.v1.json");
const researchProper=load("../data/mass/rogation-proper-trilingual.v1.json");
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
assert.ok(sourceGate.properSections.every(x=>
  x.latinVerified === true && x.englishVerified === false &&
  x.frenchVerified === false && typeof x.exactSourceLocator === "string"),
  "Original 1962 Latin is source-collated but unpublished EN/FR cannot be certified");
assert.ok(sourceGate.sourceWitnesses.some(x=>x.type==="textual_candidate_not_normative_for_class"&&/NOT itself/.test(x.warning)),
  "A general online Rogation-week Proper must not certify processional class/rubrics");



assert.ok(sourceGate.properSections.every(x=>x.candidate && x.candidate.status==="LATIN_COLLATED_EN_FR_EDITING_UNPUBLISHED"),
  "Every Rogation Proper section must have an explicit uncertified candidate status");
assert.ok(sourceGate.properSections.every(x=>x.candidate.sourceLinks.length>=2 && /ORIGINAL_DRAFT_EN_FR_EDITORIAL_REVIEW_PENDING/.test(x.candidate.translationRights)),
  "No derivative translation may be published without independent textual and rights validation");
assert.match(sourceGate.properSections.find(x=>x.key==="epistle").candidate.passageReference,/James 5:16/);
assert.match(sourceGate.properSections.find(x=>x.key==="gospel").candidate.passageReference,/Luke 11:5/);
assert.match(sourceGate.properSections.find(x=>x.key==="secret").candidate.passageReference,/English absent/);
assert.equal(researchProper.schema,"AO_1962_ROGATION_PROPER_V1");
assert.equal(researchProper.publicationAllowed,false);
assert.equal(researchProper.sections.length,9);
assert.equal(researchProper.source.status,"LATIN_SOURCE_PASSAGE_VISUALLY_CHECKED_IN_1962_VATICAN_SCAN");
assert.ok(researchProper.sections.every(s=>
  s.sourceLocator===sourceGate.properSections.find(x=>x.key===s.key).exactSourceLocator));
assert.equal(researchProper.interlectionalVariants.outsideEastertide.status,"RESEARCH_ONLY_VARIANTS_NOT_SELECTABLE");
assert.ok(["gradual","alleluia","tract"].every(k=>
  researchProper.interlectionalVariants.outsideEastertide[k].latin.length>90));
assert.deepEqual(researchProper.sections.map(s=>s.key),ROGATION_PROPER_KEYS);
assert.ok(researchProper.sections.every(s=>
  s.latin?.length>100 && s.english?.length>100 && s.french?.length>100 &&
  /Missale Romanum \(1962\)/.test(s.sourceLocator)
),"All 9 Rogation source passages must contain Latin and independently drafted EN/FR");
assert.match(researchProper.sections.find(x=>x.key==="gradual_alleluia").latin,/Propitius esto.*Exsultabo/s);
assert.match(researchProper.sections.find(x=>x.key==="communion").references.join(";"),/Lc 11:9/);
assert.doesNotMatch(researchProper.sections.find(x=>x.key==="gradual_alleluia").latin,/Confitemini Domino/);
assert.equal(rogationProperReady(sourceGate,researchProper),false);


assert.deepEqual(ROGATION_PROPER_KEYS,sourceGate.properSections.map(x=>x.key));
assert.equal(rogationProperReady(sourceGate),false);
for(const date of ["2024-05-06","2027-05-03"]) {
  // The date is deliberately NOT a selector input; observance must come from
  // the actual day resolver and the public rite must be chosen separately.
  const defaultChoice=resolveRogationMassVariant({choice:"DAY_MASS"});
  assert.equal(defaultChoice.availability,"AVAILABLE",date);
  assert.equal(defaultChoice.massEntry,"FOOT_CLUSTER",date);
  assert.deepEqual(defaultChoice.precedingRites,[],date);
  const blocked=resolveRogationMassVariant({
    choice:"ROGATION_MASS",observanceConfirmed:true,
    service:"PUBLIC_PROCESSION",dayClass:4,sourceGate
  });
  assert.equal(blocked.availability,"BLOCKED",date);
  assert.equal(blocked.reason,"PROPER_NOT_SOURCE_CERTIFIED",date);
  assert.equal(blocked.massEntry,null,date);
}
assert.equal(resolveRogationMassVariant({
  choice:"ROGATION_MASS",observanceConfirmed:false,
  service:"PUBLIC_PROCESSION",dayClass:4,sourceGate
}).reason,"ROGATION_OBSERVANCE_NOT_CONFIRMED");
assert.equal(resolveRogationMassVariant({
  choice:"ROGATION_MASS",observanceConfirmed:true,
  service:"PRIVATE_PRAYERS",dayClass:4,sourceGate
}).reason,"PUBLIC_RITE_NOT_CONFIRMED");
assert.equal(resolveRogationMassVariant({
  choice:"ROGATION_MASS",observanceConfirmed:true,
  service:"PUBLIC_PROCESSION",dayClass:1,sourceGate
}).reason,"VOTIVE_II_CLASS_IMPEDED");
assert.equal(resolveRogationMassVariant({
  choice:"ROGATION_MASS",observanceConfirmed:true,
  service:"PUBLIC_PROCESSION",sourceGate
}).reason,"DAY_CLASS_NOT_VERIFIED");

// Synthetic fully attested fixture checks the future acceptance route, without
// changing or shipping the actual research-only ledger as published text.

const afterPublicLitanies=resolveRogationMassVariant({
  choice:"DAY_MASS",observanceConfirmed:true,
  service:"PUBLIC_PROCESSION",dayClass:1,sourceGate
});
assert.equal(afterPublicLitanies.availability,"AVAILABLE");
assert.equal(afterPublicLitanies.properOwner,"DAY_RESOLVER");
assert.equal(afterPublicLitanies.massEntry,"INTROIT");
assert.equal(afterPublicLitanies.omitOpeningPrayers,true);
assert.deepEqual(afterPublicLitanies.precedingRites,["ROGATIONS"]);
assert.equal(resolveRogationMassVariant({
  choice:"DAY_MASS",observanceConfirmed:false,
  service:"PUBLIC_PROCESSION",dayClass:4,sourceGate
}).availability,"BLOCKED");

const certifiedMock=structuredClone(sourceGate);
certifiedMock.status="PUBLISHED_1962_ROGATION_PROPER";
certifiedMock.publicationAllowed=true;
for(const s of certifiedMock.properSections) {
  s.latinVerified=s.englishVerified=s.frenchVerified=true;
  s.exactSourceLocator="Missale Romanum (1962), validated source locator";
  s.candidate.translationRights="CLEARED";
}
assert.equal(rogationProperReady(certifiedMock),false,
  "A metadata-only certificate without the actual Rogation Proper must fail closed");
const syntheticProper={
  schema:"AO_1962_ROGATION_PROPER_V1",
  status:"PUBLISHED_1962_ROGATION_PROPER",publicationAllowed:true,
  sections:certifiedMock.properSections.map(s=>({
    key:s.key,sourceLocator:s.exactSourceLocator,
    latin:"TEST ONLY - fabricated Latin fixture content; not publishable",
    english:"TEST ONLY - fabricated English fixture content; not publishable",
    french:"TEST ONLY - fabricated French fixture content; not publishable"
  }))
};
assert.equal(rogationProperReady(certifiedMock,syntheticProper),true);
syntheticProper.status="SOURCE_RESEARCH_UNPUBLISHED";
assert.equal(rogationProperReady(certifiedMock,syntheticProper),false);
syntheticProper.status="PUBLISHED_1962_ROGATION_PROPER";
const permitted=resolveRogationMassVariant({
  choice:"ROGATION_MASS",observanceConfirmed:true,
  service:"ORDINARY_AUTHORIZED_SUPPLICATIONS",dayClass:2,sourceGate:certifiedMock,sourceProper:syntheticProper
});
assert.equal(permitted.availability,"AVAILABLE");
assert.equal(permitted.massClass,2);
assert.equal(permitted.colour,"violet");
assert.equal(permitted.massEntry,"INTROIT");
assert.deepEqual(permitted.precedingRites,["ROGATIONS"]);
assert.equal(permitted.gloria,false);
assert.equal(permitted.credo,false);
certifiedMock.properSections[6].frenchVerified=false;
assert.equal(rogationProperReady(certifiedMock,syntheticProper),false);

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
  date:"2027-05-03",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"MISSAL",
  calendarCelebration:{id:"feria-rogationum",type:"CALENDAR"},
  precedingRites:["ROGATIONS"],
});
const plan=compileMassPlan(resolved);
assert.equal(plan.massEntry,"INTROIT");
assert.deepEqual([...plan.precedingGraphs],["ROGATIONS"]);

console.log("native Rogations payload: PASS — six-record graph, undoubled 1962 Litany, Sancta Maria procession boundary and Introit handoff.");
