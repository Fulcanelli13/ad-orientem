import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBrowserMassRuntime } from "../src/mass/browser-runtime.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const aspergesPayload=load("../data/presentation/reader-asperges.v1.json");
const specialExtension=load("../data/mass/special-days-extension.v1.3.json");
const aspergesData=Object.freeze({payload:aspergesPayload,graph:Object.freeze([...specialExtension.graphs.ASP])});
const presentationData=Object.freeze({
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
});
const eventGraph=load("../data/mass/mc-event-graph.v1.json");
const eventData=eventGraph.storage.eventFiles.flatMap(ref=>load("../"+ref.path).events);
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
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>{loaded=true;return presentationData},
  onReaderMounted:()=>{mounted=true},
});
const entered=await runtime.enter();
assert.equal(loaded,true); assert.equal(mounted,true);
assert.ok(root.innerHTML.includes('data-ao-reader-shell'));
assert.ok(root.innerHTML.includes("Holy Rosary"));
assert.equal(entered.session.resolvedMass.form,"MISSA_CANTATA_INCENSE");
assert.equal(entered.session.resolvedMass.presentationMode,"SIMPLE");
assert.equal(runtime.getReaderMode(),"SIMPLE");
assert.equal(runtime.setMode("LIVE"),"SIMPLE","standalone runtime allowed an uncertified LIVE mode switch");
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


const aspergesRoot=rootFixture();
const aspergesRuntime=createBrowserMassRuntime({
  root:aspergesRoot,
  celebrationApi:{getResolvedMass:()=>celebration({insertedRites:["asperges"]})},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Holy Rosary",proper,precedingRites:["ASPERGES"]}),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  loadAspergesData:async()=>aspergesData,
});
await aspergesRuntime.enter();
assert.equal(aspergesRuntime.getCurrentSectionId(),null,"Mass card became active before Asperges completed");
assert.equal(aspergesRuntime.getReaderState().cardTitle,"Sunday Aspersion");
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R01");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getReaderState().cardTitle,"Asperges me");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R03");
assert.equal(aspergesRuntime.getReaderState().gesture,null,"sprinkling gesture fired from card visibility");
aspergesRuntime.markActuallySprinkled();
assert.equal(aspergesRuntime.getReaderState().gesture.label,"MAKE_FULL_SIGN_OF_CROSS");
aspergesRuntime.next();
aspergesRuntime.next();
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R05");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getCurrentSectionId(),"AO.CARD.001");
assert.equal(aspergesRuntime.getReaderState().cardTitle,"Introit & Preparatory Prayers");
aspergesRuntime.previous();
assert.equal(aspergesRuntime.getAspergesState().card.id,"ASP-R05","Back from first Mass card did not return to Asperges handoff");
aspergesRuntime.next();
assert.equal(aspergesRuntime.getCurrentSectionId(),"AO.CARD.001");
aspergesRuntime.destroy();


const planAwareLowRoot=rootFixture();
const planAwareLow=createBrowserMassRuntime({
  root:planAwareLowRoot,
  celebrationApi:{getResolvedMass:()=>celebration({
    gloria:true,credo:true,faithfulCommunicantsPresent:true,
  })},
  resolveHostOptions:()=>({
    form:"low",celebrationTitle:"Holy Rosary",
    proper:{...proper,hasGloria:true,hasCredo:true},
    faithfulCommunicantsPresent:true,
    chantSetting:"GREGORIAN",
  }),
  readReaderPreferences:()=>({mode:"simple",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
  eventData,
});
await planAwareLow.enter();
assert.equal(planAwareLow.getObjectiveRuntime().supported,true);
assert.equal(planAwareLow.getObjectiveRuntime().owner,"R18_PLANNED_OBJECTIVE_TRAVERSAL");
assert.equal(planAwareLow.showCanonicalEvent("MC-OFF-110"),null,
  "Low browser runtime accepted Solemn offertory incensation outside its planned traversal");
assert.ok(planAwareLow.showCanonicalEvent("MC-CNS-010"),
  "Low browser runtime rejected a certified planned canonical event");
planAwareLow.destroy();

const liveBlockedRoot=rootFixture();
const liveBlocked=createBrowserMassRuntime({
  root:liveBlockedRoot,
  celebrationApi:{getResolvedMass:()=>celebration()},
  resolveHostOptions:()=>({form:"mc-incense",celebrationTitle:"Holy Rosary",proper}),
  readReaderPreferences:()=>({mode:"live",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}),
  loadPresentationData:async()=>presentationData,
});
await assert.rejects(()=>liveBlocked.enter(),/V1_83_48_CARD_LIVE_MAP_REQUIRED/,
  "standalone 30-card runtime bypassed the frozen v1.83 LIVE gate");
assert.equal(liveBlockedRoot.innerHTML,"");

const missingRoot=rootFixture();
const missing=createBrowserMassRuntime({
  root:missingRoot, celebrationApi:{getResolvedMass:()=>celebration()},
  resolveHostOptions:()=>({form:"low",celebrationTitle:"Holy Rosary",proper}),
  readReaderPreferences:()=>({mode:"simple"}),
  loadPresentationData:async()=>{throw new Error("reader data unavailable")},
});
await assert.rejects(()=>missing.enter(),/reader data unavailable/);
assert.equal(missingRoot.innerHTML,"");

const requiemRoot=rootFixture();
const requiem=createBrowserMassRuntime({
  root:requiemRoot,
  celebrationApi:{getResolvedMass:()=>celebration({requestedCelebrationId:"requiem",celebrationId:"requiem",celebrationType:"requiem",properSource:"Votive/Requiem"})},
  resolveHostOptions:()=>({form:"solemn",celebrationTitle:"Requiem",proper}),
  readReaderPreferences:()=>({mode:"simple"}),
  loadPresentationData:async()=>presentationData,
});
await assert.rejects(()=>requiem.enter(),/STRUCTURAL_OVERLAY_PROJECTION_PENDING|not yet certified for overlay REQUIEM/);
assert.equal(requiemRoot.innerHTML,"");

console.log("Browser Mass runtime PASS: ordinary 30-card flow plus explicit Asperges prelude/handoff; LIVE remains blocked behind v1.83 48-card parity.");
