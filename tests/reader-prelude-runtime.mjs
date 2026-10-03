import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createNativePreludeRuntime } from "../src/mass/reader-prelude-runtime.js";
import { prepareNativeReaderPreview } from "../src/mass/reader-native-preview.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const extension=load("../data/mass/special-days-extension.v1.3.json");
const aspergesData={payload:load("../data/presentation/reader-asperges.v1.json"),graph:extension.graphs.ASP};
const palmData={payload:load("../data/presentation/reader-palm.v1.json"),graph:extension.graphs.PALM};
const ashData={payload:load("../data/presentation/reader-ash.v1.json"),graph:extension.graphs.ASH};
const presentationData={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
};
const guideData={registry:load("../data/presentation/guide-registry.v1.json"),url:"test://guide"};
const cueRegistries={
  gestures:load("../data/presentation/reader-gestures.v1.json"),
  responses:load("../data/presentation/reader-responses.v1.json"),
  postures:load("../data/presentation/reader-postures.v1.json"),
  positions:load("../data/presentation/reader-priest-positions.v1.json"),
  voices:load("../data/presentation/reader-priest-voices.v1.json"),
};
const eventData=[
  "../data/mass/mc-events-01.v1.json","../data/mass/mc-events-02.v1.json","../data/mass/mc-events-03.v1.json",
  "../data/mass/mc-events-04.v1.json","../data/mass/mc-events-05.v1.json","../data/mass/mc-events-06.v1.json",
].flatMap(path=>load(path).events);
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",introit:t("I","Introit"),collects:[t("C","Collect")],epistle:t("E","Epistle"),
  gradual:t("G","Gradual"),sequence:{lat:"",en:""},gospel:t("Gsp","Gospel"),offertory:t("O","Offertory"),
  secrets:[t("S","Secret")],preface:t("P","Preface"),communion:t("Cm","Communion"),postcommunions:[t("Pc","Postcommunion")],
};

function prepared(kind){
  return {
    session:{
      resolvedMass:{
        schema:"ao-resolved-mass-v2",date:"2026-10-04",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
        calendarCelebration:{id:"day",type:"CALENDAR"},actualCelebration:{id:"day",type:"CALENDAR",title:"Day"},
        explicitlySelectedCelebration:false,proper:{status:"READY",data:proper},overlays:[],
        precedingRites:kind?[kind]:[],followingActions:[],distinctRite:null,
      },
      plan:{kind:"MASS",precedingGraphs:kind?[kind]:[],followingGraphs:[],overlayGraphs:[],massEntry:kind==="ASPERGES"?"FOOT_CLUSTER":kind?"INTROIT":"FOOT_CLUSTER"},
    },
    readerPreferences:{mode:"SIMPLE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
  };
}

let rt=await createNativePreludeRuntime({prepared:prepared("ASPERGES"),aspergesData});
assert.equal(rt.kind,"ASPERGES");
assert.equal(rt.project().card.id,"ASP-R01");
rt.goToEnd();
assert.equal(rt.handoff,"FOOT_CLUSTER");

rt=await createNativePreludeRuntime({prepared:prepared("PALM"),palmData});
assert.equal(rt.kind,"PALM");
rt.goToEnd();
assert.equal(rt.handoff,"INTROIT");
rt.controller.goTo("PALM-R02");
rt.setRecipientState("RECEIVE_PALM");
assert.equal(rt.renderMoment().posture.label,"KNEEL");

rt=await createNativePreludeRuntime({prepared:prepared("ASH"),ashData});
assert.equal(rt.kind,"ASH");
rt.controller.goTo("ASH-R03");
rt.setRecipientState("RECEIVE_ASHES");
assert.equal(rt.renderMoment().posture.label,"KNEEL");
rt.goToEnd();
assert.equal(rt.handoff,"INTROIT");

assert.equal(await createNativePreludeRuntime({prepared:prepared(null)}),null);

const ready=await prepareNativeReaderPreview({
  prepared:prepared("ASH"),presentationData,eventData,cueRegistries,guideData,ashData
});
assert.equal(ready.prelude.kind,"ASH");
assert.equal(ready.model.totalCards,30,"Ash prelude mutated native preview Mass card count");
assert.equal(ready.prelude.project().card.id,"ASH-R01");

console.log("native prelude runtime: PASS — Asperges/Palm/Ash mount independently and preserve Mass identity.");
