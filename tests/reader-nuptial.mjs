import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";
import { projectSpecialStructure } from "../src/mass/reader-special-structure.js";
import { validateNuptialReaderPayload } from "../src/mass/reader-nuptial.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const nuptialData=load("../data/presentation/reader-nuptial.v1.json");
const registry=load("../data/mass/rite-overlay-registry.v1.json");
const extension=load("../data/mass/special-days-extension.v1.3.json");
const core=load("../data/mass/special-days-core.v1.1.json");

assert.equal(validateNuptialReaderPayload(nuptialData),true);
assert.deepEqual(nuptialData.cards.map(x=>x.insertionId),[
  "FIRST_NUPTIAL_BLESSING_AFTER_PATER",
  "DEUS_QUI_POTESTATE_NUPTIAL_BLESSING",
  "FINAL_BLESSING_OVER_SPOUSES",
]);

const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Commune/C10a",
  introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale","Gradual"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
const resolved=makeResolvedMass({
  date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"LIVE",
  calendarCelebration:{id:"calendar",type:"CALENDAR"},
  requestedCelebration:{id:"nuptial",type:"NUPTIAL",title:"Nuptial Mass"},
  proper:{status:"READY",data:proper,sourcePath:"Commune/C10a"},
  overlays:["NUPTIAL"],
});
const model=createMassReaderModel({resolvedMass:resolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,nuptialData});
assert.equal(model.totalCards,42);
assert.equal(model.nuptialInsertionCount,3);

const ids=model.cards.map(x=>x.sectionId);
const pater=ids.indexOf(model.cards.find(x=>x.sourceSectionId==="AO.CARD.019"||x.sectionId==="AO.CARD.019").sectionId);
assert.equal(ids[pater+1],"AO.NUPTIAL.01");
assert.equal(ids[pater+2],"AO.NUPTIAL.02");
const dismissal=model.cards.findIndex(x=>x.sourceSectionId==="AO.CARD.028"||x.sectionId==="AO.CARD.028");
assert.equal(ids[dismissal+1],"AO.NUPTIAL.03");
assert.equal(model.cards.find(x=>x.sectionId==="AO.NUPTIAL.01").faithfulPosture,null);
assert.equal(model.cards.find(x=>x.sectionId==="AO.NUPTIAL.03").faithfulGesture,null);

assert.throws(()=>createMassReaderModel({
  resolvedMass:resolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
}),/NUPTIAL_READER_PAYLOAD_REQUIRED/);

const projection=projectSpecialStructure({session:{resolvedMass:resolved,plan:compileMassPlan(resolved)}},{registry,extension,core});
assert.equal(projection.releaseSupport,true);
const nuptialSegments=projection.segments.filter(x=>String(x.id).includes("NUPTIAL")||x.id==="FINAL_BLESSING_OVER_SPOUSES");
assert.equal(nuptialSegments.length,4);
assert.ok(nuptialSegments.every(x=>x.renderable===true));

console.log("Nuptial reader: PASS — three recovered source insertions compose into LIVE without mutating canonical Mass identity or faithful posture.");
