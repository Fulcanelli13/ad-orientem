import { assertProperManifestV2, validateProperManifestV2 } from "../src/mass/proper-contracts.js";
import { makeResolvedMass } from "../src/mass/session-engine.js";

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
  canonProperInserts:{},
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
holyThursday.canonProperInserts={
  communicantes:{variantId:"TEST-C",textLat:"Resolved Communicantes text",sourceRef:"PRIMARY_FIXTURE"},
  hancIgitur:{variantId:"TEST-H",textLat:"Resolved Hanc igitur text",sourceRef:"PRIMARY_FIXTURE"},
};
expect(!validateProperManifestV2(holyThursday).pass,"Holy Thursday without Qui pridie was accepted");
holyThursday.canonProperInserts.quiPridie={variantId:"TEST-QP",textLat:"Resolved Qui pridie text",sourceRef:"PRIMARY_FIXTURE"};
expect(validateProperManifestV2(holyThursday).pass,"resolved three-part Holy Thursday Canon insert set did not pass");

const ember=structuredClone(ordinary);
ember.requirements={...ember.requirements,interlectionSequence:true};
expect(!validateProperManifestV2(ember).pass,"required empty interlection sequence did not fail closed");
ember.interlectionSequence=[
  {id:"O1",type:"ORATION",payloadRef:"COLLECT-EMBER-1",sourceRef:"PRIMARY_FIXTURE"},
  {id:"L1",type:"LESSON",payloadRef:"LESSON-1",sourceRef:"PRIMARY_FIXTURE"},
  {id:"C1",type:"GRADUAL",payloadRef:"GRADUAL-1",sourceRef:"PRIMARY_FIXTURE"},
  {id:"O2",type:"ORATION",payloadRef:"COLLECT-EMBER-2",sourceRef:"PRIMARY_FIXTURE"},
  {id:"L2",type:"LESSON",payloadRef:"LESSON-2",sourceRef:"PRIMARY_FIXTURE"},
];
expect(validateProperManifestV2(ember).pass,"ordered interlection sequence did not pass");

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
brokenAtBoundary.canonProperInserts.quiPridie=null;
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

console.log("Proper Resolver 2.0 source-reconciliation contracts PASS.");
