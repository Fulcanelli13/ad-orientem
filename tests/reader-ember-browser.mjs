import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBrowserMassRuntime } from "../src/mass/browser-runtime.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const presentationData=Object.freeze({
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
});
const t=(lat,en)=>({lat,en});
const order=["OratioL2","LectioL1","GradualeL1"];
const nodes=[
  {id:"PRE_GOSPEL.01.OratioL2",type:"ORATION",sourceSectionId:"OratioL2",sourceOrderIndex:0,orderAuthority:"SOURCE_ORDER",payloadRef:"O2",sourceRef:"Tempora/Ember:OratioL2"},
  {id:"PRE_GOSPEL.02.LectioL1",type:"LESSON",sourceSectionId:"LectioL1",sourceOrderIndex:1,orderAuthority:"SOURCE_ORDER",payloadRef:"L1",sourceRef:"Tempora/Ember:LectioL1"},
  {id:"PRE_GOSPEL.03.GradualeL1",type:"GRADUAL",sourceSectionId:"GradualeL1",sourceOrderIndex:2,orderAuthority:"SOURCE_ORDER",payloadRef:"G1",sourceRef:"Tempora/Ember:GradualeL1"},
];
const proper={
  schema:"ao-proper-manifest-v2",sourcePath:"Tempora/Ember",
  requirements:{preGospelSequence:true,preGospelSourceOrder:true,crossParity:true},
  crossParityStatus:"PASS",
  introit:t("Introitus","Introit"),collects:[t("Collecta","Collect")],
  epistle:t("Epistola ordinaria","Ordinary Epistle"),gradual:t("Graduale ordinarium","Ordinary Gradual"),
  sequence:{lat:"",en:""},gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
  orations:{collectSet:[],secretSet:[],postcommunionSet:[]},canonPackage:{},
  preGospelSequence:nodes,
  preGospelSequenceProvenance:{schema:"ao-pre-gospel-source-order-v1",orderAuthority:"SOURCE_ORDER",structuralLanguage:"la",sourcePath:"Tempora/Ember",sourceOrder:order},
  preGospelPayloads:{
    O2:{bodyLat:"Orémus. Oratio secunda.",bodyEn:"Let us pray. Second prayer.",conclusionLat:"Per Dóminum nostrum Iesum Christum.",conclusionEn:"Through our Lord Jesus Christ."},
    L1:{textLat:"Lectio prima.",textEn:"First lesson."},
    G1:{textLat:"Graduale primum.",textEn:"First gradual."},
  },
};
function rootFixture(){return {innerHTML:"",querySelector(){return null},querySelectorAll(){return []},addEventListener(){}}}
const root=rootFixture();
const runtime=createBrowserMassRuntime({
  root,
  celebrationApi:{getResolvedMass:()=>({
    date:"2026-09-19",calendarDay:{id:"Tempora/Ember",title:"Ember Saturday"},
    requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",celebrationType:"calendar",
    properSource:"Tempora/Ember",canStart:true,insertedRites:[],conditions:[],rubricSources:["MR62","RG60"]
  })},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Ember Saturday",proper,overlays:["EMBER_LESSONS"]}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
});
const entered=await runtime.enter();
assert.ok(entered.session.plan.insertions.includes("RESOLVED_PREPARATORY_LESSONS"));
assert.equal(runtime.getReaderModel().totalCards,33);
assert.deepEqual(runtime.getReaderModel().emberSourceOrder,order);
assert.equal(runtime.getCurrentSectionId(),"AO.CARD.001");

runtime.next();
runtime.next();
runtime.next();
assert.equal(runtime.getCurrentSectionId(),"AO.CARD.004");
runtime.next();
assert.equal(runtime.getCurrentSectionId(),"AO.EMBER.01");
assert.equal(runtime.getReaderState().cardTitle,"Prayer · 1");
assert.equal(runtime.getReaderState().posture.label,"STAND");
runtime.next();
assert.equal(runtime.getCurrentSectionId(),"AO.EMBER.02");
assert.equal(runtime.getReaderState().cardTitle,"Lesson · 2");
assert.equal(runtime.getReaderState().posture.label,"SIT");
runtime.next();
assert.equal(runtime.getCurrentSectionId(),"AO.EMBER.03");
assert.equal(runtime.getReaderState().cardTitle,"Gradual");
assert.equal(runtime.getReaderState().posture.label,"STAND");
runtime.next();
assert.equal(runtime.getCurrentSectionId(),"AO.CARD.005");
assert.equal(runtime.getReaderState().cardTitle,"Epistle / Lesson");
assert.ok(runtime.getReaderState().paragraphs.some(p=>p.primary==="Ordinary Epistle"));
runtime.previous();
assert.equal(runtime.getCurrentSectionId(),"AO.EMBER.03","Back from ordinary Epistle skipped final Ember node");
runtime.destroy();

console.log("Ember browser runtime: PASS — source-order insertion navigates Collect → Ember nodes → ordinary Epistle with conservative card-entry posture.");
