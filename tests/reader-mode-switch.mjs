import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildReaderModeModels,
  captureReaderModeAnchor,
  findReaderModeAnchorCard,
} from "../src/mass/reader-mode-switch.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
  nuptialData:load("../data/presentation/reader-nuptial.v1.json"),
};
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit"),collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),
  alleluia_tract:t("Alleluia","Alleluia"),sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),postcommunions:[t("Postcommunio","Postcommunion")],
};
const resolvedMass={
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
const prepared={
  session:{resolvedMass,plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],overlayGraphs:["VOTIVE_PROPER"],normalLastGospel:true,blessingAllowed:true}},
  readerPreferences:{mode:"LIVE",language:"en",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};

const live=buildReaderModeModels({prepared,data,mode:"LIVE"});
assert.equal(live.sourceModel.totalCards,39);
assert.equal(live.presentationModel.totalCards,48);
assert.equal(live.presentationModel.structureOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
assert.equal(prepared.session.resolvedMass.presentationMode,"LIVE","mode rebuild mutated canonical resolved Mass");

const host=live.presentationModel.cards.find(card=>
  card.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0174"))
);
assert.ok(host,"LIVE Host elevation cue not found");
const anchor=captureReaderModeAnchor(host,{activeCueId:"AO.SM.C0174"});

const simple=buildReaderModeModels({prepared,data,mode:"SIMPLE"});
assert.equal(simple.sourceModel.totalCards,30);
assert.equal(simple.presentationModel.totalCards,30);
assert.equal(simple.sourceModel.presentationMode,"SIMPLE");
const simpleHost=findReaderModeAnchorCard(simple.presentationModel,anchor);
assert.equal(simpleHost.sectionId,"AO.CARD.015","Host cue did not remain anchored when switching LIVE -> SIMPLE");
assert.ok(simpleHost.paragraphs.some(p=>(p.sourceCueIds??[]).includes("AO.SM.C0174")));

const missal=buildReaderModeModels({prepared,data,mode:"MISSAL"});
assert.equal(missal.presentationModel.totalCards,30);
const missalHost=findReaderModeAnchorCard(missal.presentationModel,anchor);
assert.equal(missalHost.sectionId,"AO.CARD.015","Host cue did not remain anchored when switching LIVE -> MISSAL");

const backLive=findReaderModeAnchorCard(live.presentationModel,captureReaderModeAnchor(simpleHost,{activeCueId:"AO.SM.C0174"}));
assert.equal(backLive.sectionId,host.sectionId,"Host cue did not return to the exact LIVE card");

const split=live.presentationModel.cards.find(card=>card.sectionId==="AO.LIVE48.020.C");
assert.ok(split,"Pax Domini split card missing");
const splitAnchor=captureReaderModeAnchor(split);
const simplePax=findReaderModeAnchorCard(simple.presentationModel,splitAnchor);
assert.equal(simplePax.sectionId,"AO.CARD.020","split LIVE card did not collapse to its source macro without guessing");

const nuptialPrepared={
  ...prepared,
  session:{
    ...prepared.session,
    resolvedMass:{...resolvedMass,overlays:["NUPTIAL"],actualCelebration:{id:"nuptial",type:"NUPTIAL",title:"Nuptial Mass"}},
    plan:{...prepared.session.plan,overlayGraphs:["NUPTIAL"]},
  },
};
const nuptialLive=buildReaderModeModels({prepared:nuptialPrepared,data,mode:"LIVE"});
assert.equal(nuptialLive.sourceModel.totalCards,42);
assert.equal(nuptialLive.presentationModel.totalCards,51);
const insertion=nuptialLive.presentationModel.cards.find(card=>card.sectionId==="AO.NUPTIAL.02");
assert.ok(insertion);
const insertionAnchor=captureReaderModeAnchor(insertion);
const nuptialSimple=buildReaderModeModels({prepared:nuptialPrepared,data,mode:"SIMPLE"});
assert.equal(nuptialSimple.sourceModel.totalCards,33);
assert.equal(findReaderModeAnchorCard(nuptialSimple.presentationModel,insertionAnchor).sectionId,"AO.NUPTIAL.02",
  "Nuptial insertion identity was lost across mode switch");

console.log("reader mode switch: PASS — MISSAL/SIMPLE/LIVE rebuild presentation only and preserve exact source anchors.");
