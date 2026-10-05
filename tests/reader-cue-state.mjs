import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateReaderCueRegistries,
  createReaderCueStateController,
  conditionPasses,
} from "../src/mass/reader-cue-state.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const registries=Object.freeze({
  gestures:load("../data/presentation/reader-gestures.v1.json"),
  responses:load("../data/presentation/reader-responses.v1.json"),
  postures:load("../data/presentation/reader-postures.v1.json"),
  positions:load("../data/presentation/reader-priest-positions.v1.json"),
  voices:load("../data/presentation/reader-priest-voices.v1.json"),
});
const sung=load("../data/presentation/reader-text-sung.v1.json");

const audit=validateReaderCueRegistries(registries,sung);
assert.deepEqual(
  {cues:audit.cueCount,gestures:audit.gestures,responses:audit.responses,postures:audit.postures,positions:audit.positions,voices:audit.voices},
  {cues:279,gestures:59,responses:23,postures:23,positions:49,voices:126}
);

assert.equal(conditionPasses(null,new Set()),true);
assert.equal(conditionPasses("INCENSE_ENABLED",new Set(["INCENSE_ENABLED"])),true);
assert.equal(conditionPasses("A && B",new Set(["A"])),false);
assert.equal(conditionPasses("A && B",new Set(["A","B"])),true);

const prepared={
  session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE",provenance:{conditions:[]}}},
  readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};
const ctrl=createReaderCueStateController({registries,sungCorpus:sung,prepared});
assert.equal(ctrl.supported,true);
assert.equal(ctrl.unresolvedPostureAnchors.length,5);

let state=ctrl.project("AO.SM.C0001");
assert.equal(state.priestPosition.station,"FOOT_CENTER");
assert.equal(state.priestVoice.voice ?? state.priestVoice.value,"LOW / QUIET");
assert.match(state.gesture.action,/Sign of the Cross/i);
assert.equal(state.posture,null,"conditional procession posture was invented");

state=ctrl.project("AO.SM.C0041");
assert.equal(state.priestPosition.station,"ROUTE_CONTROLLED");
assert.equal(state.priestPosition.routeId,"ENTRANCE_ALTAR_INCENSATION");
assert.equal(state.priestVoice.value,"SILENT");

state=ctrl.project("AO.SM.C0068");
assert.match(state.gesture.action,/Sign of the Cross/i);
assert.equal(state.priestPosition.station,"ALTAR_CENTER");
assert.equal(state.priestVoice.value,"QUIET PRIVATE RECITATION");

state=ctrl.project("AO.SM.C0084");
assert.match(state.gesture.action,/Forehead.*lips.*breast/i);

state=ctrl.project("AO.SM.C0104");
assert.match(state.gesture.action,/Sign of the Cross/i);

state=ctrl.project("AO.SM.C0148");
assert.match(state.gesture.action,/Sign of the Cross/i);

state=ctrl.project("AO.SM.C0173");
assert.equal(state.gesture,null,"Host elevation fired on the words of Consecration instead of the action cue");
state=ctrl.project("AO.SM.C0174");
assert.ok(state.gesture);
assert.doesNotMatch(state.gesture.action,/Sign of the Cross/i,"Host elevation invented a cross");
assert.match(state.gesture.action,/Sacred Host/i);

state=ctrl.project("AO.SM.C0179");
assert.equal(state.gesture,null,"Chalice elevation fired on the consecration words");
state=ctrl.project("AO.SM.C0180");
assert.equal(state.gesture,null,"Chalice elevation fired before Hæc quotiescúmque completed");
state=ctrl.project("AO.SM.C0181");
assert.ok(state.gesture);
assert.doesNotMatch(state.gesture.action,/Sign of the Cross/i,"Chalice elevation invented a cross");
assert.match(state.gesture.action,/Chalice/i);

state=ctrl.project("AO.SM.C0265");
assert.match(state.gesture.action,/Sign of the Cross/i);
state=ctrl.project("AO.SM.C0269");
assert.match(state.gesture.action,/Forehead.*lips.*breast/i);
state=ctrl.project("AO.SM.C0273");
assert.match(state.gesture.action,/Genuflect/i);

state=ctrl.project("AO.SM.C0096");
assert.equal(state.gesture,null,"conditional Incarnatus source row was hard-coded universally");
assert.ok(state.gestureAdvisory);
assert.equal(state.ownership.gesture,"R17_SOURCE_ADVISORY_FAIL_CLOSED");

state=ctrl.project("AO.SM.C0071");
assert.equal(state.response.text,"Et cum spíritu tuo.");
state=ctrl.project("AO.SM.C0072");
assert.equal(state.response,null,"response leaked beyond exact cue");
state=ctrl.project("AO.SM.C0239");
assert.equal(state.response,null,"optional second Confiteor response ignored condition");
state=ctrl.project("AO.SM.C0239",{conditions:["SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED"]});
assert.equal(state.response.text,"Amen.");

state=ctrl.project("AO.SM.C0072");
assert.equal(state.priestPosition.station,"ALTAR_EPISTLE_MISSAL");
state=ctrl.project("AO.SM.C0082");
assert.equal(state.priestPosition.station,"ALTAR_GOSPEL_MISSAL");

state=ctrl.project("AO.SM.C0075");
assert.equal(state.posture,null,"default sung posture activated without explicit profile condition");
state=ctrl.project("AO.SM.C0075",{conditions:["DEFAULT_SUNG_PROFILE"]});
assert.equal(state.posture.value,"SIT");

const provenancePrepared={
  session:{resolvedMass:{
    form:"MISSA_CANTATA_INCENSE",
    provenance:{conditions:["GLORIA_APPOINTED","CREDO_APPOINTED","AGNUS_DEI_PUBLIC","LAST_GOSPEL_PRESENT"]},
  }},
  readerPreferences:{mode:"LIVE",postureProfile:"TRADITIONAL_WALSH",gestureProfile:"TRADITIONAL"},
};
const provenanceCtrl=createReaderCueStateController({registries,sungCorpus:sung,prepared:provenancePrepared});
state=provenanceCtrl.project("AO.SM.C0061");
assert.equal(state.posture?.value,"STAND","canonical provenance condition did not preserve Gloria standing posture");
state=provenanceCtrl.project("AO.SM.C0222");
assert.equal(state.posture?.value,"STAND","canonical provenance condition did not preserve Agnus standing posture");
state=provenanceCtrl.project("AO.SM.C0273");
assert.equal(state.posture?.value,"STAND","canonical provenance condition did not preserve Last Gospel standing posture");
state=ctrl.project("AO.SM.C0150",{conditions:["DEFAULT_SUNG_PROFILE","CANON_START","AO_DEFAULT_1962_SUNG"]});
assert.equal(state.posture.value,"KNEEL");

const low=createReaderCueStateController({
  registries,sungCorpus:sung,
  prepared:{session:{resolvedMass:{form:"LOW",conditions:[]}},readerPreferences:{}},
});
assert.equal(low.supported,false);
state=low.project("AO.SM.C0068");
assert.equal(state.gesture,null);
assert.match(state.reason,/NOT_CERTIFIED_FOR_LOW/);

console.log("reader cue state: PASS — exact source cues, conditional fail-closed, persistent route/voice/posture transitions.");
