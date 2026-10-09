import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateReaderCueRegistries,
  createReaderCueStateController,
  conditionPasses,
  sungPresentationBaselineConditions,
  V180_ORDINARY_SUNG_PRESENTATION_FLAGS,
} from "../src/mass/reader-cue-state.js";

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
const gestureMatrix=load("../data/mass/gesture-matrix.v1.json");

const audit=validateReaderCueRegistries(registries,sung);
assert.deepEqual(
  {cues:audit.cueCount,gestures:audit.gestures,responses:audit.responses,postures:audit.postures,positions:audit.positions,voices:audit.voices,actions:audit.actions},
  {cues:279,gestures:59,responses:23,postures:23,positions:49,voices:126,actions:77}
);

assert.equal(conditionPasses(null,new Set()),true);
assert.equal(conditionPasses("INCENSE_ENABLED",new Set(["INCENSE_ENABLED"])),true);
assert.equal(conditionPasses("A && B",new Set(["A"])),false);
assert.equal(conditionPasses("A && B",new Set(["A","B"])),true);

const prepared={
  session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE",provenance:{conditions:[]}}},
  readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};
const ctrl=createReaderCueStateController({registries,sungCorpus:sung,prepared,gestureMatrix});
assert.equal(ctrl.supported,true);
assert.equal(ctrl.unresolvedPostureAnchors.length,5);
assert.equal(ctrl.audit.gestureAuthority,"GESTURE_MATRIX_SOT");

assert.deepEqual([...sungPresentationBaselineConditions(prepared)],[...V180_ORDINARY_SUNG_PRESENTATION_FLAGS],
  "ordinary Sung presentation baseline drifted from the executable v1.80 donor");
assert.deepEqual(prepared.session.resolvedMass.provenance.conditions,[],
  "presentation baseline mutated canonical resolved-Mass provenance");

let state=ctrl.project("AO.SM.C0001");
assert.equal(state.priestPosition.station,"FOOT_CENTER");
assert.equal(state.priestVoice.voice ?? state.priestVoice.value,"LOW / QUIET");
assert.match(state.gesture.action,/Sign of the Cross/i);
assert.equal(state.gesture.owner,"GESTURE_MATRIX_SOT");
assert.equal(state.gesture.sourceGestureId,"GM.F.C0001.01");
assert.equal(state.ownership.gesture,"GESTURE_MATRIX_SOT");
assert.equal(state.posture?.value,"STAND","v1.80 ordinary Sung opening posture is not visible");

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

assert.equal(ctrl.project("AO.SM.C0174").priestAction?.label,"ELEVATES HOST");
assert.equal(ctrl.project("AO.SM.C0181").priestAction?.label,"ELEVATES CHALICE");
assert.equal(ctrl.project("AO.SM.C0161").priestAction,null,"action lane invented an unsourced action");
assert.equal(ctrl.project("AO.SM.C0040",{conditions:[]}).priestAction,null,"incense action ignored its condition");
assert.equal(ctrl.project("AO.SM.C0040",{conditions:["INCENSE_ENABLED"]}).priestAction?.label,"BLESSES INCENSE");
assert.equal(ctrl.project("AO.SM.C0276").priestAction,null,"sedilia position transition duplicated into priest-action lane");

state=ctrl.project("AO.SM.C0265");
assert.match(state.gesture.action,/Sign of the Cross/i);
assert.equal(state.gesture.anchorLat,"Pater, et Fílius, ✠");
assert.equal(state.gesture.anchorEn,"the Father, and the Son, ✠");
assert.equal(state.gesture.anchorFr,"le Père, le Fils, ✠");
state=ctrl.project("AO.SM.C0269");
assert.match(state.gesture.action,/Forehead.*lips.*breast/i);
state=ctrl.project("AO.SM.C0273");
assert.match(state.gesture.action,/Genuflect/i);

state=ctrl.project("AO.SM.C0096");
assert.equal(state.gesture,null,"conditional Incarnatus source row was hard-coded universally");
assert.ok(state.gestureAdvisory);
assert.equal(state.ownership.gesture,"GESTURE_MATRIX_SOT_ADVISORY_FAIL_CLOSED");
assert.equal(state.gestureAdvisory.owner,"GESTURE_MATRIX_SOT_ADVISORY");

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
assert.equal(state.posture?.value,"SIT","v1.80 ordinary Sung default profile did not activate the Epistle sitting posture");
state=ctrl.project("AO.SM.C0075",{conditions:[]});
assert.equal(state.posture,null,"explicit condition override no longer provides a fail-closed test path");
state=ctrl.project("AO.SM.C0075",{conditions:["DEFAULT_SUNG_PROFILE"]});
assert.equal(state.posture.value,"SIT");

const provenancePrepared={
  session:{resolvedMass:{
    form:"MISSA_CANTATA_INCENSE",
    provenance:{conditions:["GLORIA_APPOINTED","CREDO_APPOINTED","AGNUS_DEI_PUBLIC","LAST_GOSPEL_PRESENT"]},
  }},
  readerPreferences:{mode:"LIVE",postureProfile:"TRADITIONAL_WALSH",gestureProfile:"TRADITIONAL"},
};
const provenanceCtrl=createReaderCueStateController({registries,sungCorpus:sung,prepared:provenancePrepared,gestureMatrix});
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
assert.deepEqual([...sungPresentationBaselineConditions({session:{resolvedMass:{form:"LOW"}}})],[],
  "ordinary Sung presentation flags leaked into Low Mass");
assert.equal(low.supported,false);
state=low.project("AO.SM.C0068");
assert.equal(state.gesture,null);
assert.match(state.reason,/NOT_CERTIFIED_FOR_LOW/);

// Exact projected response ownership: evaluate all 279 canonical cues so
// the 23 registered responses never persist after their source trigger ends.
const sourceUnits=sung.blocks.flatMap(block=>block.units??[]);
const allConditions=new Set([
  ...V180_ORDINARY_SUNG_PRESENTATION_FLAGS,
  "GLORIA_APPOINTED","CREDO_APPOINTED","AGNUS_DEI_PUBLIC","LAST_GOSPEL_PRESENT",
  "SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED","POST_CONSECRATION_STAND_PROFILE",
  "LOCAL_PROFILE_SIT_AFTER_COMMUNION","LOCAL_PROFILE_KNEEL_FOR_BLESSING",
  "PERSONALLY_SINGING_OR_PROFILE_STAND",
]);
const knownResponses=new Map(registries.responses.items.map(item=>[item.cueId,item]));
const knownPostures=registries.postures.items.filter(item=>item.cueId);
assert.equal(knownPostures.length,18,"posture timeline's canonical trigger count drifted");
for(const unit of sourceUnits){
  const id=unit.cue_id;
  const observed=ctrl.project(id,{conditions:[...allConditions]});
  const expected=knownResponses.get(id)?.text??null;
  assert.equal(observed.response?.text??null,expected,
    id+": response projected outside its exact canonical utterance");
}
for(const row of knownPostures){
  const observed=ctrl.project(row.cueId,{conditions:[...allConditions]});
  assert.equal(observed.posture?.value,row.posture,
    row.cueId+": required source-backed posture transition was lost or shifted");
}
for(const cueId of ["AO.SM.C0197","AO.SM.C0198","AO.SM.C0246"]){
  const observed=ctrl.project(cueId);
  assert.equal(observed.gesture,null,
    cueId+": duplicated Nobis quoque breast strike or private-formula Holy Name bow leaked");
}
for(const cueId of ["AO.SM.C0001","AO.SM.C0022","AO.SM.C0145","AO.SM.C0196",
                      "AO.SM.C0222","AO.SM.C0223","AO.SM.C0224","AO.SM.C0243",
                      "AO.SM.C0244","AO.SM.C0245","AO.SM.C0265","AO.SM.C0273","AO.SM.C0274"]){
  const observed=ctrl.project(cueId);
  assert.ok(observed.gesture?.anchorLat && observed.gesture?.anchorEn && observed.gesture?.anchorFr,
    cueId+": supported transient gesture lacks source-paired Latin/English/French word anchor");
}
for(const cueId of ["AO.SM.C0235","AO.SM.C0236","AO.SM.C0237","AO.SM.C0240"]){
  assert.equal(ctrl.project(cueId).gesture,null,
    cueId+": optional second Confiteor gesture leaked without local-custom consent");
  assert.ok(ctrl.project(cueId,{conditions:[...allConditions]}).gesture?.anchorLat,
    cueId+": locally enabled second Confiteor has no exact-source gesture anchor");
}

console.log("reader cue state: PASS — exact source cues, v1.80 priest actions, conditional fail-closed, persistent route/voice/posture transitions.");
