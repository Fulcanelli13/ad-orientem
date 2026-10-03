import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBrowserMassRuntime } from "../src/mass/browser-runtime.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const presentationData=Object.freeze({
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
});
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus Rosarii","Introit of the Rosary"),
  collects:[t("Collecta Rosarii","Collect of the Rosary")],
  epistle:t("Epistola Rosarii","Epistle of the Rosary"),
  gradual:t("Graduale et Alleluia Rosarii","Gradual and Alleluia of the Rosary"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium Rosarii","Gospel of the Rosary"),
  offertory:t("Offertorium Rosarii","Offertory of the Rosary"),
  secrets:[t("Secreta Rosarii","Secret of the Rosary")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio Rosarii","Communion of the Rosary"),
  postcommunions:[t("Postcommunio Rosarii","Postcommunion of the Rosary")],
};
function rootFixture(){return {innerHTML:"",querySelector(){return null},querySelectorAll(){return []},addEventListener(){}}}
function celebration(overrides={}){return {
  date:"2026-10-04",calendarDay:{id:"Tempora/Pent18-0",title:"Sunday"},
  requestedCelebrationId:"holy_rosary",celebrationId:"holy_rosary",celebrationType:"votive",
  properSource:"Sancti/10-07",canStart:true,insertedRites:[],conditions:[],rubricSources:["RG60"],...overrides
}}

const root=rootFixture();
let mounted=false,loaded=false;
const runtime=createBrowserMassRuntime({
  root,
  celebrationApi:{getResolvedMass:()=>celebration()},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Holy Rosary",proper}),
  readReaderPreferences:()=>({mode:"live",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>{loaded=true;return presentationData},
  onReaderMounted:()=>{mounted=true},
});
const entered=await runtime.enter();
assert.equal(loaded,true); assert.equal(mounted,true);
assert.ok(root.innerHTML.includes('data-ao-reader-shell'));
assert.ok(root.innerHTML.includes("Holy Rosary"));
assert.equal(entered.session.resolvedMass.form,"MISSA_CANTATA_INCENSE");
assert.equal(entered.session.resolvedMass.presentationMode,"LIVE");
const model=runtime.getReaderModel();
assert.equal(model.totalCards,30);
assert.equal(model.properSource,"Sancti/10-07");
assert.equal(runtime.getCurrentSectionId(),"AO.CARD.001");
assert.equal(runtime.getReaderState().cardTitle,"Introit & Preparatory Prayers");
assert.ok(runtime.getReaderState().paragraphs.some(p=>p.primary==="Introit of the Rosary"));

const host=runtime.showCanonicalEvent("MC-CNS-010",{priestPosition:{label:"ALTAR CENTER"},priestVoice:{label:"SILENT"}});
assert.equal(host.card.sectionId,"AO.CARD.015");
assert.equal(runtime.getReaderState().cardTitle,"Consecration of the Sacred Host");
const same=runtime.showCanonicalEvent("MC-CNS-040",{gesture:{label:"GENUFLECT"}});
assert.equal(same.card.sectionId,"AO.CARD.015");
assert.ok(runtime.getReaderState().paragraphs.length>0);
const chalice=runtime.showCanonicalEvent("MC-CNS-080");
assert.equal(chalice.card.sectionId,"AO.CARD.016");
runtime.previous(); assert.equal(runtime.getCurrentSectionId(),"AO.CARD.015");
runtime.next(); assert.equal(runtime.getCurrentSectionId(),"AO.CARD.016");
runtime.destroy(); assert.equal(root.innerHTML,""); assert.equal(runtime.getReaderModel(),null);

const missingRoot=rootFixture();
const missing=createBrowserMassRuntime({
  root:missingRoot, celebrationApi:{getResolvedMass:()=>celebration()},
  resolveHostOptions:()=>({form:"low",celebrationTitle:"Holy Rosary",proper}),
  readReaderPreferences:()=>({mode:"live"}),
  loadPresentationData:async()=>{throw new Error("reader data unavailable")},
});
await assert.rejects(()=>missing.enter(),/reader data unavailable/);
assert.equal(missingRoot.innerHTML,"");

const requiemRoot=rootFixture();
const requiem=createBrowserMassRuntime({
  root:requiemRoot,
  celebrationApi:{getResolvedMass:()=>celebration({requestedCelebrationId:"requiem",celebrationId:"requiem",celebrationType:"requiem",properSource:"Votive/Requiem"})},
  resolveHostOptions:()=>({form:"solemn",celebrationTitle:"Requiem",proper}),
  readReaderPreferences:()=>({mode:"live"}),
  loadPresentationData:async()=>presentationData,
});
await assert.rejects(()=>requiem.enter(),/not yet certified for overlay REQUIEM/);
assert.equal(requiemRoot.innerHTML,"");

console.log("Browser Mass runtime PASS: atomic data-backed 30-card startup, Proper-safe navigation, canonical-event card routing.");
