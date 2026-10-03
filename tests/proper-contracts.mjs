import { assertProperManifestV2, validateProperManifestV2 } from "../src/mass/proper-contracts.js";
import { makeResolvedMass } from "../src/mass/session-engine.js";
import { withCompiledPreGospelSequence } from "../src/mass/pre-gospel-sequence.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const ordinary={
  schema:"ao-proper-manifest-v2",
  requirements:{crossParity:true},
  crossParityStatus:"PASS",
  orations:{
    collectSet:[{
      id:"COLLECT-1",
      bodyLat:"Oratio body",
      conclusionType:"PER_DOMINUM",
      conclusionLat:"Per Dominum nostrum Iesum Christum.",
      sourceRef:"FIXTURE"
    }],
    secretSet:[],
    postcommunionSet:[],
  },
  canonPackage:{},
  interlectionSequence:[],
};
expect(validateProperManifestV2(ordinary).pass,"ordinary fixture should pass");
assertProperManifestV2(ordinary);

const abbreviated=structuredClone(ordinary);
abbreviated.orations.collectSet[0].conclusionLat="Per Dominum...";
expect(!validateProperManifestV2(abbreviated).pass,"abbreviated conclusion was accepted");

const holyThursday=structuredClone(ordinary);
holyThursday.requirements={...holyThursday.requirements,communicantes:true,hancIgitur:true,quiPridie:true};
expect(!validateProperManifestV2(holyThursday).pass,"missing special Canon inserts did not fail closed");
holyThursday.canonPackage={
  communicantes:{variantId:"TEST-C",textLat:"Resolved Communicantes text",sourceRef:"PRIMARY_FIXTURE"},
  hancIgitur:{variantId:"TEST-H",textLat:"Resolved Hanc igitur text",sourceRef:"PRIMARY_FIXTURE"},
};
expect(!validateProperManifestV2(holyThursday).pass,"Holy Thursday without Qui pridie was accepted");
holyThursday.canonPackage.quiPridie={variantId:"TEST-QP",textLat:"Resolved Qui pridie text",sourceRef:"PRIMARY_FIXTURE"};
expect(validateProperManifestV2(holyThursday).pass,"resolved three-part Holy Thursday Canon insert set did not pass");

const emberBase=structuredClone(ordinary);
emberBase.requirements={...emberBase.requirements,preGospelSequence:true,preGospelSourceOrder:true};
expect(!validateProperManifestV2(emberBase).pass,
  "required source-ordered pre-Gospel sequence did not fail closed");

const emberSourceOrder=["OratioL2","LectioL1","GradualeL1","OratioL1","LectioL2"];
const source=(order)=>({
  order:["__TOP__",...order],
  map:Object.fromEntries(order.map(id=>[id,[id+" text"]]))
});
const ember=withCompiledPreGospelSequence(emberBase,{
  sourcePath:"Tempora/Ember-Test",
  sources:{la:source(emberSourceOrder),en:source(emberSourceOrder),fr:source(emberSourceOrder)},
});
expect(validateProperManifestV2(ember).pass,"source-ordered pre-Gospel sequence did not pass");
expect(
  ember.preGospelSequence.map(x=>x.sourceSectionId).join("|")===emberSourceOrder.join("|"),
  "Proper v2 reordered pre-Gospel nodes by numeric suffix"
);

const emberReordered=structuredClone(ember);
emberReordered.preGospelSequence.reverse();
expect(!validateProperManifestV2(emberReordered).pass,
  "reordered pre-Gospel sequence bypassed source-order proof");

const emberNoProof=structuredClone(ember);
delete emberNoProof.preGospelSequenceProvenance;
expect(!validateProperManifestV2(emberNoProof).pass,
  "source-order requirement passed without provenance");

const legacyAlias=structuredClone(ordinary);
delete legacyAlias.canonPackage;
legacyAlias.requirements={...legacyAlias.requirements,communicantes:true,interlectionSequence:true};
legacyAlias.canonProperInserts={
  communicantes:{variantId:"LEGACY-C",textLat:"Legacy alias Communicantes",sourceRef:"PRIMARY_FIXTURE"}
};
legacyAlias.interlectionSequence=[
  {id:"L1",type:"LESSON",payloadRef:"LESSON-1",sourceRef:"PRIMARY_FIXTURE"}
];
expect(validateProperManifestV2(legacyAlias).pass,"compatibility aliases stopped working");

const prayerOverPeople=structuredClone(ordinary);
prayerOverPeople.orations.prayerOverPeople={
  id:"POP-1",
  bodyLat:"Prayer over the People body",
  conclusionType:"PER_DOMINUM",
  conclusionLat:"Per Dominum nostrum Iesum Christum.",
  sourceRef:"PRIMARY_FIXTURE"
};
const popResolved=makeResolvedMass({
  date:"2026-10-04",
  form:"low",
  presentationMode:"live",
  calendarCelebration:{id:"lent_fixture",type:"CALENDAR"},
  proper:prayerOverPeople,
});
const popPlan=(await import("../src/mass/session-engine.js")).compileMassPlan(popResolved);
expect(
  popPlan.insertions.includes("PRAYER_OVER_PEOPLE_AFTER_POSTCOMMUNION_BEFORE_FINAL_DOMINUS_VOBISCUM"),
  "Prayer over the People insertion was not compiled at the session boundary"
);
expect(popPlan.postcommunionExit?.mode==="PRAYER_OVER_PEOPLE",
  "Prayer over the People did not take Postcommunion exit ownership");
expect(popPlan.postcommunionExit?.suppressBaseCueIds?.includes("AO.SM.C0256"),
  "B088/C0256 ordinary exit was not suppressed");
expect(popPlan.postcommunionExit?.activeOrder?.join("|")===[
  "AO.SM.C0254","AO.SM.C0255","R17.POP.010","R17.POP.020","AO.SM.C0257"
].join("|"),"Postcommunion/Prayer-over-People handoff order changed");

const parityPending=structuredClone(ordinary);
parityPending.crossParityStatus="PENDING";
expect(!validateProperManifestV2(parityPending).pass,"required cross parity PENDING did not fail closed");

let sessionBlocked=false;
try {
  makeResolvedMass({
    date:"2026-10-04",
    form:"low",
    presentationMode:"live",
    calendarCelebration:{id:"test",type:"CALENDAR"},
    requestedCelebration:{id:"holy_thursday_fixture",type:"SPECIAL_FORMULARY"},
    proper:{status:"READY",data:holyThursday},
  });
} catch { sessionBlocked=true; }
expect(sessionBlocked===false,"valid Proper v2 was blocked by session boundary");

const brokenAtBoundary=structuredClone(holyThursday);
brokenAtBoundary.canonPackage.quiPridie=null;
let brokenBlocked=false;
try {
  makeResolvedMass({
    date:"2026-10-04",
    form:"low",
    presentationMode:"live",
    calendarCelebration:{id:"test",type:"CALENDAR"},
    requestedCelebration:{id:"holy_thursday_fixture",type:"SPECIAL_FORMULARY"},
    proper:{status:"READY",data:brokenAtBoundary},
  });
} catch { brokenBlocked=true; }
expect(brokenBlocked,"invalid Proper v2 bypassed session boundary");

const coverageGate=structuredClone(ordinary);
coverageGate.requirements={
  ...coverageGate.requirements,
  requiredContainers:["COLLECT_SET","GOSPEL","POSTCOMMUNION_SET"],
};
coverageGate.slots={gospel:{payloadRef:"GOSPEL-1"}};
coverageGate.orations.postcommunionSet=[{
  id:"POSTCOMMUNION-1",
  bodyLat:"Postcommunion body",
  conclusionType:"PER_DOMINUM",
  conclusionLat:"Per Dominum nostrum Iesum Christum.",
  sourceRef:"FIXTURE"
}];
expect(validateProperManifestV2(coverageGate).pass,"valid required container coverage failed");

const coverageBroken=structuredClone(coverageGate);
delete coverageBroken.slots.gospel;
expect(!validateProperManifestV2(coverageBroken).pass,"required container coverage was bypassed");

console.log("Proper Resolver 2.0 source-reconciliation contracts PASS.");
