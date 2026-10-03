import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { legacyReaderStateSnapshot, prepareNativeReaderPreview, resolveGestureProjection, resolveCueOwnedChannels, createCardTransitionTransientGuard } from "../src/mass/reader-native-preview.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
};
const cueRegistries=Object.freeze({
  gestures:load("../data/presentation/reader-gestures.v1.json"),
  responses:load("../data/presentation/reader-responses.v1.json"),
  postures:load("../data/presentation/reader-postures.v1.json"),
  positions:load("../data/presentation/reader-priest-positions.v1.json"),
  voices:load("../data/presentation/reader-priest-voices.v1.json"),
});
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("I","Introit"),collects:[t("C","Collect")],epistle:t("E","Epistle"),
  gradual:t("G","Gradual"),sequence:{lat:"",en:""},gospel:t("Gsp","Gospel"),
  offertory:t("O","Offertory"),secrets:[t("S","Secret")],preface:t("P","Preface"),
  communion:t("Cm","Communion"),postcommunions:[t("Pc","Postcommunion")],
};
const eventData=[
  {id:"MC-INT-020",actor:"PRIEST",title:"Priest recites Introit",contentRef:"proper.introit",sourceMomentRefs:["E08"],voice:{audibility:"LOW_VOICE",speechAudibility:"LOW_VOICE"}},
  {id:"MC-CRD-025",actor:"PRIEST",title:"Priest reaches Et incarnatus",contentRef:"ordinary.credo",sourceMomentRefs:["E21"],voice:{audibility:"LOW_VOICE",speechAudibility:"LOW_VOICE"}},
];
const prepared={
  session:{resolvedMass:{
    schema:"ao-resolved-mass-v2",date:"2026-10-04",form:"MISSA_CANTATA_INCENSE",
    presentationMode:"LIVE",calendarCelebration:{id:"day",type:"CALENDAR"},
    actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
    explicitlySelectedCelebration:true,proper:{status:"READY",data:proper},
    overlays:["VOTIVE_PROPER"],precedingRites:[],followingActions:[],distinctRite:null,
  }},
  readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};
const ready=await prepareNativeReaderPreview({prepared,presentationData:data,eventData,cueRegistries});
assert.equal(ready.model.totalCards,30);
assert.equal(ready.model.cards[14].title,"Consecration of the Sacred Host");
assert.equal(ready.model.cards[15].title,"Consecration of the Chalice");
assert.equal(ready.cueState.supported,true);
assert.equal(ready.cueState.project("AO.SM.C0084").priestPosition.station,"ALTAR_GOSPEL_MISSAL");
assert.equal(ready.cueState.project("AO.SM.C0071").response.text,"Et cum spíritu tuo.");
assert.ok(ready.model.cards[0].paragraphs.length>0);
assert.ok(ready.model.cards.some(card=>card.paragraphs.some(p=>p.primary==="Introit")),"resolved Proper text never entered native card model");

const nodes={
  "#stationText":{textContent:"ALTAR"},
  "#postureText":{textContent:"KNEEL"},
  "#gestureText":{textContent:"BOW"},
  "#responseText":{textContent:"Amen"},
  "#voiceText":{textContent:"LOW VOICE"},
  "#scholaDock":{classList:{contains:x=>x==="show"}},
  "#scholaStreamLine":{textContent:"Sanctus"},
};
const snapshot=legacyReaderStateSnapshot({querySelector:s=>nodes[s]??null});
assert.equal(snapshot.priestPosition.label,"ALTAR");
assert.equal(snapshot.posture.label,"KNEEL");
assert.equal(snapshot.gesture.label,"BOW");
assert.equal(snapshot.response.label,"Amen");
assert.equal(snapshot.priestVoice.label,"LOW VOICE");
assert.equal(snapshot.schola.label,"Sanctus");

const disputed={
  gesture:null,
  ownership:{gesture:"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION"},
};
assert.equal(resolveGestureProjection(disputed,{label:"BOW"}),null,
  "disputed legacy bow leaked into R17 Gloria/Credo");
const certified={
  gesture:{label:"GENUFLECT"},
  ownership:{gesture:"R17_NATIVE"},
};
assert.equal(resolveGestureProjection(certified,{label:"BOW"}).label,"GENUFLECT",
  "certified native gesture did not outrank legacy fallback");

assert.equal(resolveGestureProjection(disputed,{label:"LEGACY BOW"},{
  cueId:"AO.SM.C0056",gestureProfile:"GUIDED_1962"
}),null,"customary Gloria cue leaked into GUIDED_1962");
assert.equal(resolveGestureProjection(disputed,{label:"LEGACY BOW"},{
  cueId:"AO.SM.C0056",gestureProfile:"TRADITIONAL"
}).type,"HEAD_BOW","exact traditional Gloria cue did not resolve");
assert.equal(resolveGestureProjection(disputed,{label:"LEGACY CROSS"},{
  cueId:"AO.SM.C0104",gestureProfile:"TRADITIONAL"
}).type,"SIGN_OF_CROSS","exact traditional Credo cross did not resolve");
assert.equal(resolveGestureProjection(null,{label:"LEGACY BOW"},{
  cueId:"AO.SM.C0090",gestureProfile:"GUIDED_1962"
}),null,"known Credo cue fell back to legacy despite profile suppression");


const guidedSource=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"FOREHEAD · LIPS · BREAST",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:null,
  legacy:{gesture:{label:"LEGACY"}},
  cueId:"AO.SM.C0084",
  gestureProfile:"GUIDED_1962",
});
assert.equal(guidedSource.gesture.label,"FOREHEAD · LIPS · BREAST",
  "GUIDED_1962 suppressed a source-backed Gospel gesture");

const guidedGloria=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"EXTRACTED BOW",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:{ownership:{gesture:"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION"}},
  legacy:{gesture:{label:"LEGACY BOW"}},
  cueId:"AO.SM.C0056",
  gestureProfile:"GUIDED_1962",
});
assert.equal(guidedGloria.gesture,null,
  "GUIDED_1962 leaked a customary Gloria bow from the raw source registry");

const traditionalGloria=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"EXTRACTED BOW",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:{ownership:{gesture:"R17_FAIL_CLOSED_PENDING_SOURCE_ADJUDICATION"}},
  legacy:{},
  cueId:"AO.SM.C0056",
  gestureProfile:"TRADITIONAL",
});
assert.equal(traditionalGloria.gesture.type,"HEAD_BOW",
  "TRADITIONAL profile lost the adjudicated Gloria bow");

const essentialSource=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:{
    supported:true,reason:null,
    gesture:{label:"FOREHEAD · LIPS · BREAST",owner:"R17_CUE_SOURCE"},
    response:null,priestVoice:null,priestPosition:null,
    ownership:{gesture:"R17_CUE_NATIVE",response:"R17_EXACT_CUE_NONE",priestVoice:"R17_FAIL_CLOSED",priestPosition:"R17_FAIL_CLOSED"},
  },
  eventState:null,legacy:{},
  cueId:"AO.SM.C0084",
  gestureProfile:"ESSENTIAL",
});
assert.equal(essentialSource.gesture,null,
  "ESSENTIAL unexpectedly inherited the full Guided source-gesture catalogue");

const transitionGuard=createCardTransitionTransientGuard();
assert.equal(transitionGuard.pending,false);
assert.deepEqual(transitionGuard.filter({gesture:{label:"BOW"},response:{label:"AMEN"}}),{
  gesture:{label:"BOW"},response:{label:"AMEN"}
});
transitionGuard.begin();
assert.equal(transitionGuard.pending,true);
assert.deepEqual(transitionGuard.filter({gesture:{label:"BOW"},response:{label:"AMEN"}}),{
  gesture:null,response:null
},"card transition leaked prior transient gesture/response");
transitionGuard.resolveCue("AO.SM.C0100");
assert.equal(transitionGuard.pending,false);
assert.equal(transitionGuard.filter({gesture:{label:"NEW"}}).gesture.label,"NEW");


const staleLegacy={
  priestPosition:{label:"STALE LEGACY POSITION"},
  priestVoice:{label:"STALE LEGACY VOICE"},
  gesture:{label:"STALE LEGACY GESTURE"},
  response:{label:"STALE LEGACY RESPONSE"},
};
const waiting=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:null,
  eventState:null,
  legacy:staleLegacy,
  cueId:null,
  gestureProfile:"GUIDED_1962",
});
assert.equal(waiting.priestPosition,null,"certified cue owner leaked stale legacy priest position while focus was unresolved");
assert.equal(waiting.priestVoice,null,"certified cue owner leaked stale legacy priest voice while focus was unresolved");
assert.equal(waiting.gesture,null,"certified cue owner leaked stale legacy gesture while focus was unresolved");
assert.equal(waiting.response,null,"certified cue owner leaked stale legacy response while focus was unresolved");
assert.equal(waiting.ownership.priestPosition,"R17_CUE_WAITING_FAIL_CLOSED");

const exactCue=ready.cueState.project("AO.SM.C0071");
const exactOwned=resolveCueOwnedChannels({
  cueControllerSupported:true,
  cueProjection:exactCue,
  eventState:null,
  legacy:staleLegacy,
  cueId:"AO.SM.C0071",
  gestureProfile:"GUIDED_1962",
});
assert.equal(exactOwned.priestPosition.station,"ALTAR_CENTER");
assert.equal(exactOwned.priestVoice.value,"LISTENS");
assert.equal(exactOwned.response.text,"Et cum spíritu tuo.");
assert.equal(exactOwned.gesture,null);

const unsupportedOwned=resolveCueOwnedChannels({
  cueControllerSupported:false,
  cueProjection:null,
  eventState:null,
  legacy:staleLegacy,
  gestureProfile:"GUIDED_1962",
});
assert.equal(unsupportedOwned.priestPosition.label,"STALE LEGACY POSITION");
assert.equal(unsupportedOwned.priestVoice.label,"STALE LEGACY VOICE");
assert.equal(unsupportedOwned.response.label,"STALE LEGACY RESPONSE");
assert.equal(unsupportedOwned.ownership.priestPosition,"LEGACY_FALLBACK");

let blocked=false;
try{
  await prepareNativeReaderPreview({
    prepared:{...prepared,session:{resolvedMass:{...prepared.session.resolvedMass,overlays:["REQUIEM"]}}},
    presentationData:data,
    eventData,
    cueRegistries,
  });
}catch(error){blocked=/not yet certified for overlay REQUIEM/.test(String(error.message))}
assert.equal(blocked,true,"unsupported special graph did not fail closed");

console.log("native reader preview: PASS — R17 owns cards; legacy state donation is explicit and temporary.");
