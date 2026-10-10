import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const mandatumSource=load("../data/mass/special-days-core.v1.1.json").optional_inserts.HOLY_THURSDAY_MANDATUM;
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


const holyThursdayResolved={
  ...base,date:"2027-03-25",overlays:[],actualCelebration:{id:"holy-thursday",type:"CALENDAR"},
  proper:{status:"READY",sourcePath:"Tempora/Quad6-4r",
    data:{...proper,sourcePath:"Tempora/Quad6-4r"}},
  precedingRites:[],followingActions:["HOLY_THURSDAY_POST"]
};
const htQuiet=createMassReaderModel({
  resolvedMass:holyThursdayResolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap
});
assert.equal(htQuiet.holyThursday,true);
assert.equal(htQuiet.mandatumPresent,false);
assert.equal(htQuiet.totalCards,38,"No Credo on 1962 Holy Thursday");
assert.equal(htQuiet.cardForEvent("MC-CRD-010"),null,"Holy Thursday Credo must not render");
const cue=(model,id)=>model.cards.flatMap(c=>c.paragraphs).find(p=>p.sourceCueIds?.includes(id));
for(const [id,phrase] of [
  ["AO.SM.C0157","et diem sacratíssimum"],
  ["AO.SM.C0161","trádidit discípulis suis Córporis et Sánguinis"],
  ["AO.SM.C0162","Per eúndem Christum"],
  ["AO.SM.C0168","hoc est, hódie"]
]){
 assert.ok(cue(htQuiet,id)?.alternate?.includes(phrase),id+" proper 1962 Latin not projected");
}
assert.equal(cue(htQuiet,"AO.SM.C0173").alternate,"HOC EST ENIM CORPUS MEUM.","Consecration formula mutated");
assert.equal(cue(htQuiet,"AO.SM.C0158").alternate,"Iesu Christi:","Communicantes cue split mutated");
assert.equal(htQuiet.cardBySequence(8).sourceSequence,8);
assert.equal(htQuiet.cardBySequence(9).sourceSequence,10);

const htMandatum=createMassReaderModel({
 resolvedMass:holyThursdayResolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
 holyThursdayMandatumPresent:true,
 holyThursdayMandatumSource:mandatumSource,
});
assert.equal(htMandatum.totalCards,39);
assert.equal(htMandatum.cardBySequence(9).sectionId,"AO.HT.MANDATUM");
assert.equal(htMandatum.cardBySequence(8).sourceSequence,8);
assert.equal(htMandatum.cardBySequence(10).sourceSequence,10);
assert.equal(htMandatum.mandatumPresent,true);
assert.deepEqual(htMandatum.mandatumEventIds,mandatumSource.events.map(x=>x.id));
assert.equal(htMandatum.cardBySequence(9).sourceRecordIds.length,6);
for(const [i,record] of mandatumSource.events.entries()){
  const found=htMandatum.cardForEvent(record.id);
  assert.equal(found.canonicalEventId,record.id);
  assert.equal(found.card.sectionId,"AO.HT.MANDATUM");
  assert.equal(found.mandatumStageIndex,i);
  assert.equal(found.mandatumEvent.actor_scope,record.actor_scope);
}
assert.throws(()=>createMassReaderModel({
 resolvedMass:holyThursdayResolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,
 holyThursdayMandatumPresent:true
}),/existing 1962 Mandatum source insert/);

assert.equal(htMandatum.cardBySequence(9).provenance.textComplete,false,"selected antiphons are not full printed certification");
assert.ok(htMandatum.cardBySequence(9).paragraphs.some(p=>p.alternate.includes("Mandátum novum do vobis")));
assert.ok(htMandatum.cardBySequence(9).paragraphs.some(p=>p.alternate.includes("Ubi cáritas")));
assert.ok(htMandatum.cardBySequence(9).paragraphs.some(p=>p.alternate.includes("Adésto, Dómine")));
assert.equal(htMandatum.cardBySequence(9).faithfulPosture,"LOCAL_OR_INHERIT");
assert.equal(htMandatum.cardForEvent("MC-CRD-010"),null);
assert.equal(htMandatum.cardForEvent("MC-CNS-010").card.sectionId,"AO.CANON.06");
assert.equal(htMandatum.previousCard("AO.HT.MANDATUM").sourceSectionId,"AO.CARD.008");
assert.equal(htMandatum.nextCard("AO.HT.MANDATUM").sourceSectionId,"AO.CARD.010");

const htLow=createMassReaderModel({
 resolvedMass:{...holyThursdayResolved,form:"LOW",presentationMode:"MISSAL"},
 sectionMap,lowCorpus:low,sungCorpus:sung
});
assert.equal(htLow.totalCards,29);
assert.ok(cue(htLow,"AO.SM.C0168").alternate.includes("hoc est, hódie"));
assert.ok(cue(htLow,"AO.SM.C0161").alternate.includes("Córporis et Sánguinis"));
const genericCue=cue(model,"AO.SM.C0168");
assert.ok(genericCue.alternate.includes("Qui prídie quam paterétur"));
assert.ok(!genericCue.alternate.includes("hoc est, hódie"));
assert.throws(()=>createMassReaderModel({
 resolvedMass:base,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap,holyThursdayMandatumPresent:true
}),/non-Holy-Thursday/);
console.log("1962 Holy Thursday Canon: PASS — 4 variant cues, both Mass forms, ordinary isolated, optional Mandatum after homily, no Credo.");
