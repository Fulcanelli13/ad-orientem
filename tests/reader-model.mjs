import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus Rosarii","Introit of the Rosary"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale et Alleluia","Gradual and Alleluia"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
const base={
  schema:"ao-resolved-mass-v2",
  date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"LIVE",
  actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
  calendarCelebration:{id:"Tempora/Pent18-0",type:"CALENDAR"},
  explicitlySelectedCelebration:true,
  proper:{status:"READY",data:proper,sourcePath:"Sancti/10-07"},
  overlays:["VOTIVE_PROPER"],
  precedingRites:[],
  followingActions:[],
  distinctRite:null,
};

const model=createMassReaderModel({resolvedMass:base,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(model.schema,"ao-mass-reader-model-v1");
assert.equal(model.totalCards,39);
assert.equal(model.structureOwner,"SOURCE_FIRST_LIVE");
assert.equal(model.corpusFamily,"SUNG");
assert.equal(model.actualCelebration.id,"holy_rosary");
assert.equal(model.properSource,"Sancti/10-07");
assert.equal(model.cards[13].title,"Te igitur");
assert.equal(model.cards[17].title,"Quam oblationem");
assert.equal(model.cards[18].title,"Consecration of the Sacred Host");
assert.equal(model.cards[19].title,"Consecration of the Chalice");
assert.equal(model.cards[26].title,"Per ipsum · Minor Elevation");
assert.equal(model.cards[29].title,"Agnus Dei");
assert.equal(model.cards[38].title,"Last Gospel");
assert.equal(model.cards[7].stateOnly,true,"Homily must stay state-only");

const host=model.cardForEvent("MC-CNS-010");
assert.equal(host.card.sectionId,"AO.CANON.06");
assert.equal(host.canonicalEventId,"MC-CNS-010");
assert.equal(host.progress.label,"19 / 39");
assert.equal(model.previousCard("AO.CANON.06").sectionId,"AO.CANON.05");
assert.equal(model.nextCard("AO.CANON.06").sectionId,"AO.CANON.07");
assert.equal(model.cardForEvent("MC-UNKNOWN"),null);

const lowModel=createMassReaderModel({
  resolvedMass:{...base,form:"LOW",presentationMode:"SIMPLE",overlays:[]},
  sectionMap,lowCorpus:low,sungCorpus:sung
});
assert.equal(lowModel.corpusFamily,"LOW");
assert.equal(lowModel.totalCards,30);

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,proper:null},sectionMap,lowCorpus:low,sungCorpus:sung
}),/READY resolved Proper/);

const requiemModel=createMassReaderModel({
  resolvedMass:{...base,overlays:["REQUIEM"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(requiemModel.totalCards,39,"plan-owned Requiem overlay duplicated or removed Mass reader cards");
const requiemAbsolutionModel=createMassReaderModel({
  resolvedMass:{...base,overlays:["REQUIEM"],followingActions:["REQUIEM_ABSOLUTION"]},
  sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(requiemAbsolutionModel.totalCards,39,"Requiem Absolution following action mutated the Mass reader model");

const aspergesModel=createMassReaderModel({
  resolvedMass:{...base,precedingRites:["ASPERGES"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(aspergesModel.totalCards,39,"Asperges prelude mutated the LIVE Mass card model");
const palmModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["PALM"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(palmModel.totalCards,39,"Palm prelude mutated the LIVE Mass card model");
const ashModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["ASH"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(ashModel.totalCards,39,"Ash prelude mutated the LIVE Mass card model");
const candlemasModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["CANDLEMAS"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(candlemasModel.totalCards,39,"Candlemas prelude mutated the LIVE Mass card model");
const rogationsModel=createMassReaderModel({resolvedMass:{...base,precedingRites:["ROGATIONS"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap});
assert.equal(rogationsModel.totalCards,39,"Rogations prelude mutated the LIVE Mass card model");
const corpusModel=createMassReaderModel({
  resolvedMass:{...base,followingActions:["CORPUS_CHRISTI_PROCESSION"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(corpusModel.totalCards,39,"Corpus Christi following action mutated the LIVE Mass card model");

const genericProcessionModel=createMassReaderModel({
  resolvedMass:{...base,followingActions:["GENERIC_PROCESSION"]},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(genericProcessionModel.totalCards,39,"Generic Procession following action mutated the LIVE Mass card model");

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,distinctRite:"UNSUPPORTED_TEST_RITE"},sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
}),/distinct rite UNSUPPORTED_TEST_RITE/);

console.log("Mass reader model: PASS — 39-step source-first LIVE and 30-card SIMPLE/MISSAL models remain Proper-safe.");
