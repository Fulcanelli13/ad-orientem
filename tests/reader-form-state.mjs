import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateReaderFormStateData,
  createLowReaderCueStateController,
  createSolemnReaderCueStateController,
  createReaderFormCueStateController,
} from "../src/mass/reader-form-state.js";

const load=(p)=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const formState=load("../data/presentation/reader-form-state.v1.json");
const lowCorpus=load("../data/presentation/reader-text-low.v1.json");
const sungCorpus=load("../data/presentation/reader-text-sung.v1.json");
const registries=Object.freeze({
  gestures:load("../data/presentation/reader-gestures.v1.json"),
  responses:load("../data/presentation/reader-responses.v1.json"),
  postures:load("../data/presentation/reader-postures.v1.json"),
  positions:load("../data/presentation/reader-priest-positions.v1.json"),
  voices:load("../data/presentation/reader-priest-voices.v1.json"),
});

const audit=validateReaderFormStateData(formState);
assert.deepEqual(audit,{lowCueStates:275,solemnMinisterDeltas:19,pendingPax:0});

const lowPrepared={
  session:{resolvedMass:{form:"LOW",conditions:[]}},
  readerPreferences:{postureProfile:"OCONNELL_1962_COMMUNITY"},
};
const low=createLowReaderCueStateController({formStateData:formState,lowCorpus,prepared:lowPrepared});
assert.equal(low.supported,true);
assert.equal(low.form,"LOW");
assert.equal(low.canonicalCueCount,275);
let state=low.project("AO.SM.C0001");
assert.equal(state.priestPosition.station,"FOOT_CENTER");
assert.match(state.priestAction.action,/Sign of the Cross/i);
assert.equal(state.sacredMinister,null);
assert.equal(state.ownership.sacredMinister,"R18_FORM_NOT_APPLICABLE");

state=low.project("AO.SM.C0075");
assert.equal(state.priestPosition.station,"ALTAR_EPISTLE_MISSAL");
assert.equal(state.ownership.priestPosition,"R18_LOW_CUE_NATIVE");

state=low.project("AO.SM.C9999");
assert.equal(state.reason,"UNKNOWN_LOW_CUE");
assert.equal(state.priestPosition,null);
assert.equal(state.ownership.priestPosition,"R18_LOW_UNKNOWN_CUE");

const lowViaFactory=createReaderFormCueStateController({
  formStateData:formState,registries,lowCorpus,sungCorpus,prepared:lowPrepared
});
assert.equal(lowViaFactory.schema,"ao-r18-low-reader-cue-state-v1");
assert.equal(lowViaFactory.form,"LOW");

const solemnPrepared={
  session:{resolvedMass:{form:"SOLEMN",conditions:[]}},
  readerPreferences:{postureProfile:"OCONNELL_1962_COMMUNITY"},
};
const solemn=createSolemnReaderCueStateController({
  formStateData:formState,registries,sungCorpus,prepared:solemnPrepared
});
assert.equal(solemn.supported,true);
assert.equal(solemn.form,"SOLEMN");
assert.equal(solemn.audit.sacredMinisterDeltas,19);
assert.equal(solemn.audit.pendingPaxAuthority,0);

state=solemn.project("AO.SM.C0075");
assert.equal(state.priestPosition.station,"SEDILIA");
assert.equal(state.sacredMinister.actor,"SUBDEACON");
assert.equal(state.ownership.sacredMinister,"R18_SOLEMN_R04_NATIVE");

state=solemn.project("AO.SM.C0225");
assert.equal(state.sacredMinister.actor,"SUBDEACON → DEACON");
assert.equal(state.ownership.sacredMinister,"R18_SOLEMN_PAX_PRIMARY_SOURCE");
assert.equal(state.sacredMinister.authorityStatus,"CERTIFIED_PRIMARY_1962_RUBRIC");

const solemnViaFactory=createReaderFormCueStateController({
  formStateData:formState,registries,lowCorpus,sungCorpus,prepared:solemnPrepared
});
assert.equal(solemnViaFactory.schema,"ao-r18-solemn-reader-cue-state-v1");

const cueSource=readFileSync(new URL("../src/mass/reader-cue-state.js",import.meta.url),"utf8");
assert.doesNotMatch(
  cueSource,
  /SUPPORTED_FORMS[^\n]*LOW/,
  "LOW was incorrectly certified by reusing the Sung cue registry"
);

const nativeSource=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(nativeSource,/loadReaderFormStateData/);
assert.match(nativeSource,/createReaderFormCueStateController/);
assert.match(nativeSource,/resolvedForm==="LOW" \|\| resolvedForm==="SOLEMN"/);

console.log("reader form-state parity: PASS — LOW dedicated 275-cue source, SOLEMN 19 minister deltas, primary Pax, native form-aware routing.");
