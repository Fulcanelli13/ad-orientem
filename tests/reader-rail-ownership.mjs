import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderCueStateController } from "../src/mass/reader-cue-state.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const registries=Object.freeze({
  gestures:load("../data/presentation/reader-gestures.v1.json"),
  responses:load("../data/presentation/reader-responses.v1.json"),
  postures:load("../data/presentation/reader-postures.v1.json"),
  positions:load("../data/presentation/reader-priest-positions.v1.json"),
  voices:load("../data/presentation/reader-priest-voices.v1.json"),
  actions:load("../data/presentation/reader-priest-actions.v1.json"),
});
const sung=load("../data/presentation/reader-text-sung.v1.json");
const prepared={
  session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE",conditions:[]}},
  readerPreferences:{mode:"LIVE",postureProfile:"GUIDED_1962",gestureProfile:"GUIDED_1962"},
};
const ctrl=createReaderCueStateController({registries,sungCorpus:sung,prepared});
assert.equal(ctrl.supported,true);

const cues=sung.blocks.flatMap(block=>(block.units??[]).map(unit=>unit.cue_id))
  .filter(id=>/^AO\.SM\.C\d{4}$/.test(String(id)));
assert.equal(new Set(cues).size,279);

for(const cueId of cues){
  const state=ctrl.project(cueId);
  assert.equal(state.supported,true,cueId+" lost cue-state support");
  for(const channel of ["gesture","response","priestVoice","priestPosition","priestAction"]){
    const owner=String(state.ownership[channel]??"");
    assert.ok(!owner.includes("LEGACY"),cueId+" "+channel+" regressed to legacy ownership: "+owner);
  }
}

// Persistent channels must be established from the first certified cue onward.
const first=ctrl.project("AO.SM.C0001");
assert.equal(first.priestPosition.owner,"R17_CUE_SOURCE");
assert.equal(first.priestVoice.owner,"R17_CUE_SOURCE");

// Exact transient absence is intentional state, not a fallback request.
const plain=ctrl.project("AO.SM.C0002");
assert.equal(plain.ownership.gesture,"R17_EXACT_CUE_NONE");
assert.equal(plain.ownership.response,"R17_EXACT_CUE_NONE");

// Runtime must no longer observe legacy DOM for channels now owned by R17.
const nativeSource=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
const observerSlice=nativeSource.slice(nativeSource.indexOf("const targets=["));
assert.ok(observerSlice.includes('"#postureText"'),"FOLLOW_CONGREGATION observation disappeared");
for(const forbidden of ['"#stationText"','"#gestureText"','"#responseText"','"#voiceText"','"#scholaDock"','"#scholaStreamLine"']){
  assert.ok(!observerSlice.includes(forbidden),"native reader still observes legacy rail channel "+forbidden);
}

for(const dataset of [
  "r17OwnerGesture","r17OwnerResponse","r17OwnerPriestVoice",
  "r17OwnerPriestPosition","r17OwnerPosture","r17OwnerSchola",
  "r17OwnerPriestAction","r17OwnerSacredMinister",
]){
  assert.ok(nativeSource.includes(dataset),"missing runtime ownership diagnostic "+dataset);
}

assert.match(nativeSource,/R17_NATIVE_INDEPENDENT_SCHOLA_CLOCK/,"native Schola ownership marker missing");
console.log("reader rail ownership: PASS — Missa Cantata gesture/response/voice/position/action/Schola are native-owned; only FOLLOW_CONGREGATION posture remains observational.");
