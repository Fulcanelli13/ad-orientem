import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createReaderStructureController,
  LIVE_STRUCTURE_STATUS,
  makeStructureCards,
  structureSupport,
} from "../src/mass/reader-structure.js";

const canonSourceMap=JSON.parse(readFileSync(new URL("../data/presentation/reader-canon-source-map.v1.json",import.meta.url),"utf8"));

const ordinary={
  readerPreferences:{mode:"LIVE"},
  session:{
    resolvedMass:{form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE"},
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:[]},
  },
};

assert.equal(makeStructureCards("MISSAL").length,30);
assert.equal(makeStructureCards("SIMPLE").length,30);
assert.equal(makeStructureCards("LIVE",canonSourceMap).length,39);

const live=makeStructureCards("LIVE",canonSourceMap);
assert.equal(live[0].id,"AO.R19.LIVE.M01");
assert.equal(live[0].title,"Introit & Preparatory Prayers");
assert.equal(live[13].id,"AO.CANON.01");
assert.equal(live[13].title,"Te igitur");
assert.equal(live[18].id,"AO.CANON.06");
assert.equal(live[18].title,"Consecration of the Sacred Host");
assert.equal(live[19].id,"AO.CANON.07");
assert.equal(live[19].title,"Consecration of the Chalice");
assert.equal(live[26].id,"AO.CANON.14");
assert.equal(live[26].title,"Per ipsum · Minor Elevation");
assert.equal(live.at(-1).id,"AO.R19.LIVE.M30");
assert.equal(live.at(-1).title,"Last Gospel");

assert.equal(LIVE_STRUCTURE_STATUS,"SOURCE_FIRST_FULL_MASS_CERTIFIED");
assert.equal(structureSupport(ordinary).supported,true);
assert.equal(structureSupport(ordinary).reason,null);

const liveCtrl=createReaderStructureController(ordinary,{canonSourceMap});
assert.equal(liveCtrl.supported,true);
let s=liveCtrl.snapshot();
assert.equal(s.mode,"LIVE");
assert.equal(s.total,39);
assert.equal(s.title,"Introit & Preparatory Prayers");
liveCtrl.goToBase("AO.SM.M14");
s=liveCtrl.snapshot();
assert.equal(s.cardId,"AO.CANON.01");
assert.equal(s.title,"Te igitur");
liveCtrl.next();
assert.equal(liveCtrl.snapshot().title,"Memento, Domine — Living");

const missingCanon=createReaderStructureController(ordinary);
assert.equal(missingCanon.supported,false);
assert.equal(missingCanon.reason,"SOURCE_FIRST_LIVE_CANON_MAP_REQUIRED");
assert.equal(missingCanon.snapshot().total,0);

const missalPrepared={
  ...ordinary,
  readerPreferences:{mode:"MISSAL"},
  session:{
    ...ordinary.session,
    resolvedMass:{...ordinary.session.resolvedMass,presentationMode:"MISSAL"},
  },
};
const ctrl=createReaderStructureController(missalPrepared,{canonSourceMap});
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

ctrl.setMode("LIVE");
s=ctrl.snapshot();
assert.equal(s.mode,"LIVE","certified LIVE request did not change active structure");
assert.equal(s.total,39);
assert.equal(s.baseIds[0],"AO.SM.M11");
assert.equal(s.title,"Orate fratres & Secret");

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
const palmPrepared={...missalPrepared,session:{...missalPrepared.session,plan:{kind:"MASS",precedingGraphs:["PALM"],followingGraphs:[],overlayGraphs:[]}}};
assert.equal(structureSupport(palmPrepared).supported,true,"certified Palm prelude remained structurally blocked");
const ashPrepared={...missalPrepared,session:{...missalPrepared.session,plan:{kind:"MASS",precedingGraphs:["ASH"],followingGraphs:[],overlayGraphs:[]}}};
assert.equal(structureSupport(ashPrepared).supported,true,"certified Ash prelude remained structurally blocked");
const candlemasPrepared={...missalPrepared,session:{...missalPrepared.session,plan:{kind:"MASS",precedingGraphs:["CANDLEMAS"],followingGraphs:[],overlayGraphs:[]}}};
assert.equal(structureSupport(candlemasPrepared).supported,true,"certified Candlemas prelude remained structurally blocked");
const rogationsPrepared={...missalPrepared,session:{...missalPrepared.session,plan:{kind:"MASS",precedingGraphs:["ROGATIONS"],followingGraphs:[],overlayGraphs:[]}}};
assert.equal(structureSupport(rogationsPrepared).supported,true,"certified Rogation prelude remained structurally blocked");

for(const [label,plan] of [
  ["preceding",{kind:"MASS",precedingGraphs:["EMBER_LESSONS"],followingGraphs:[],overlayGraphs:[]}],
  ["following",{kind:"MASS",precedingGraphs:[],followingGraphs:["CORPUS_CHRISTI_PROCESSION"],overlayGraphs:[]}],
  ["overlay",{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["REQUIEM"]}],
  ["distinct",{kind:"DISTINCT_RITE",precedingGraphs:[],followingGraphs:[],overlayGraphs:[]}],
]){
  const prepared={...ordinary,session:{...ordinary.session,plan}};
  assert.equal(structureSupport(prepared).supported,false,label+" should fail closed");
  const controller=createReaderStructureController(prepared,{canonSourceMap});
  const before=controller.snapshot();
  controller.next();
  assert.deepEqual(controller.snapshot(),before,label+" mutated unsupported structure");
}

console.log("reader structure contract: PASS — 39-step source-first LIVE replaces the old 20-group donor.");
