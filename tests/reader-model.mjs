import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
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

const model=createMassReaderModel({resolvedMass:base,sectionMap,lowCorpus:low,sungCorpus:sung});
assert.equal(model.schema,"ao-mass-reader-model-v1");
assert.equal(model.totalCards,30);
assert.equal(model.corpusFamily,"SUNG");
assert.equal(model.actualCelebration.id,"holy_rosary");
assert.equal(model.properSource,"Sancti/10-07");
assert.equal(model.cards[14].title,"Consecration of the Sacred Host");
assert.equal(model.cards[15].title,"Consecration of the Chalice");
assert.equal(model.cards[20].title,"Agnus Dei");
assert.equal(model.cards[29].title,"Last Gospel");
assert.equal(model.cards[7].stateOnly,true,"Homily must stay state-only");

const host=model.cardForEvent("MC-CNS-010");
assert.equal(host.card.sectionId,"AO.CARD.015");
assert.equal(host.canonicalEventId,"MC-CNS-010");
assert.equal(host.progress.label,"15 / 30");
assert.equal(model.previousCard("AO.CARD.015").sectionId,"AO.CARD.014");
assert.equal(model.nextCard("AO.CARD.015").sectionId,"AO.CARD.016");
assert.equal(model.cardForEvent("MC-UNKNOWN"),null);

const lowModel=createMassReaderModel({
  resolvedMass:{...base,form:"LOW",overlays:[]},
  sectionMap,lowCorpus:low,sungCorpus:sung
});
assert.equal(lowModel.corpusFamily,"LOW");
assert.equal(lowModel.totalCards,30);

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,proper:null},sectionMap,lowCorpus:low,sungCorpus:sung
}),/READY resolved Proper/);

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,overlays:["REQUIEM"]},sectionMap,lowCorpus:low,sungCorpus:sung
}),/not yet certified for overlay REQUIEM/);

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,precedingRites:["ASPERGES"]},sectionMap,lowCorpus:low,sungCorpus:sung
}),/preceding rite graph/);

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,followingActions:["CORPUS_CHRISTI_PROCESSION"]},sectionMap,lowCorpus:low,sungCorpus:sung
}),/following-action graph/);

assert.throws(()=>createMassReaderModel({
  resolvedMass:{...base,distinctRite:"GOOD_FRIDAY"},sectionMap,lowCorpus:low,sungCorpus:sung
}),/distinct rite GOOD_FRIDAY/);

console.log("Mass reader model: PASS — 30 prebuilt Proper-safe cards; unsupported special graphs fail closed.");
