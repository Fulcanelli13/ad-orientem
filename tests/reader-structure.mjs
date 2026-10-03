import assert from "node:assert/strict";
import {
  createReaderStructureController,
  LIVE_STRUCTURE_STATUS,
  makeStructureCards,
  structureSupport,
} from "../src/mass/reader-structure.js";

const ordinary={
  readerPreferences:{mode:"LIVE"},
  session:{
    resolvedMass:{form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE"},
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:[]},
  },
};

assert.equal(makeStructureCards("MISSAL").length,30);
assert.equal(makeStructureCards("SIMPLE").length,30);
assert.equal(makeStructureCards("LIVE").length,20);

const live=makeStructureCards("LIVE");
assert.equal(live[0].id,"AO.R17.LIVE.C01");
assert.equal(live[0].title,"Preparatory Rites");
assert.equal(live.at(-1).id,"AO.R17.LIVE.C20");
assert.deepEqual([...live[9].baseIds],["AO.SM.M10","AO.SM.M11"]);

assert.equal(LIVE_STRUCTURE_STATUS,"PROVISIONAL_V1_65_DONOR_ONLY");
assert.equal(structureSupport(ordinary).supported,false);
assert.equal(structureSupport(ordinary).reason,"V1_83_48_CARD_LIVE_MAP_REQUIRED");

const blockedLive=createReaderStructureController(ordinary);
assert.equal(blockedLive.supported,false);
let s=blockedLive.snapshot();
assert.equal(s.mode,"LIVE");
assert.equal(s.total,20);
assert.equal(s.reason,"V1_83_48_CARD_LIVE_MAP_REQUIRED");
const blockedBefore=s;
blockedLive.next();
assert.deepEqual(blockedLive.snapshot(),blockedBefore,"provisional LIVE donor navigated despite v1.83 gate");

const missalPrepared={
  ...ordinary,
  readerPreferences:{mode:"MISSAL"},
  session:{
    ...ordinary.session,
    resolvedMass:{...ordinary.session.resolvedMass,presentationMode:"MISSAL"},
  },
};
const ctrl=createReaderStructureController(missalPrepared);
assert.equal(ctrl.supported,true);
s=ctrl.snapshot();
assert.equal(s.mode,"MISSAL");
assert.equal(s.title,"Introit & Preparatory Prayers");

ctrl.goToBase("AO.SM.M11");
s=ctrl.snapshot();
assert.equal(s.baseIds[0],"AO.SM.M11");
assert.equal(s.title,"Orate fratres & Secret");
assert.equal(s.localIndex,2);
assert.equal(s.localTotal,4);

const beforeLiveAttempt=s;
ctrl.setMode("LIVE");
s=ctrl.snapshot();
assert.equal(s.mode,"MISSAL","unsupported LIVE request changed the active structure");
assert.equal(s.reason,"V1_83_48_CARD_LIVE_MAP_REQUIRED");
assert.equal(s.cardId,beforeLiveAttempt.cardId);

const votive={
  ...missalPrepared,
  session:{
    ...missalPrepared.session,
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["VOTIVE_PROPER"]},
  },
};
assert.equal(structureSupport(votive).supported,true,
  "Votive Proper should remain structurally supported in certified MISSAL mode");

const aspergesPrepared={...missalPrepared,session:{...missalPrepared.session,plan:{kind:"MASS",precedingGraphs:["ASPERGES"],followingGraphs:[],overlayGraphs:[]}}};
assert.equal(structureSupport(aspergesPrepared).supported,true,"certified Asperges prelude remained structurally blocked");

for(const [label,plan] of [
  ["preceding",{kind:"MASS",precedingGraphs:["PALM"],followingGraphs:[],overlayGraphs:[]}],
  ["following",{kind:"MASS",precedingGraphs:[],followingGraphs:["CORPUS_CHRISTI_PROCESSION"],overlayGraphs:[]}],
  ["overlay",{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["REQUIEM"]}],
  ["distinct",{kind:"DISTINCT_RITE",precedingGraphs:[],followingGraphs:[],overlayGraphs:[]}],
]){
  const prepared={...ordinary,session:{...ordinary.session,plan}};
  assert.equal(structureSupport(prepared).supported,false,label+" should fail closed");
  const c=createReaderStructureController(prepared);
  const before=c.snapshot();
  c.next();
  assert.deepEqual(c.snapshot(),before,label+" mutated unsupported structure");
}

console.log("reader structure contract: PASS");
