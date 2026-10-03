import assert from "node:assert/strict";
import {
  createReaderStructureController,
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

const ctrl=createReaderStructureController(ordinary);
assert.equal(ctrl.supported,true);
let s=ctrl.snapshot();
assert.equal(s.mode,"LIVE");
assert.equal(s.localIndex,1);
assert.equal(s.localTotal,1);
assert.equal(s.title,"Preparatory Rites");

ctrl.goToBase("AO.SM.M11");
s=ctrl.snapshot();
assert.equal(s.cardId,"AO.R17.LIVE.C10");
assert.equal(s.sectionId,"offertory");
assert.equal(s.localIndex,1);
assert.equal(s.localTotal,2);

ctrl.setMode("MISSAL");
s=ctrl.snapshot();
assert.equal(s.mode,"MISSAL");
assert.equal(s.baseIds[0],"AO.SM.M11");
assert.equal(s.title,"Orate fratres & Secret");
assert.equal(s.localIndex,2);
assert.equal(s.localTotal,4);

ctrl.setMode("LIVE");
s=ctrl.snapshot();
assert.equal(s.cardId,"AO.R17.LIVE.C10");
assert.equal(s.anchorBaseId,"AO.SM.M11");

ctrl.goToBase("AO.SM.M09");
s=ctrl.snapshot();
assert.equal(s.sectionId,"catechumens");
assert.equal(s.localIndex,8);
assert.equal(s.localTotal,8);
ctrl.next();
s=ctrl.snapshot();
assert.equal(s.cardId,"AO.R17.LIVE.C10");
assert.equal(s.sectionId,"offertory");

const votive={
  ...ordinary,
  session:{
    ...ordinary.session,
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["VOTIVE_PROPER"]},
  },
};
assert.equal(structureSupport(votive).supported,true);

for(const [label,plan] of [
  ["preceding",{kind:"MASS",precedingGraphs:["ASPERGES"],followingGraphs:[],overlayGraphs:[]}],
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
