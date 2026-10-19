import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectLowMassCommunionWarning,LOW_COMMUNION_BELL_RUBRIC}
 from "../src/mass/reader-low-communion-bell.js";
import {createReaderTransientController} from "../src/mass/reader-transients.js";
const j=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const events=[1,2,3,4,5,6].flatMap(n=>j("../data/mass/mc-events-0"+n+".v1.json").events);
const prepared={session:{resolvedMass:{form:"LOW",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"]}}};
const transient=createReaderTransientController({events,prepared});
const old=transient.project("AO.SM.C0225");
assert.equal(old.bell,null,"Do not silently promote canonical event MC-COM-185 to Low");
assert.equal(old.reason,"CANONICAL_EVENT_UNAVAILABLE_FOR_FORM");
const result=projectLowMassCommunionWarning({
 form:"LOW",activeCueId:"AO.SM.C0225",
 conditions:prepared.session.resolvedMass.conditions,canonicalTransient:old,
});
assert.equal(result.applies,true);
assert.equal(result.owner,"1962_LOW_MASS_RITUS_SERVANDUS_X6_DISPLAY_ONLY");
assert.equal(result.status,"SOURCE_RUBRIC_DISPLAY_ONLY_NOT_CANONICAL_TRAVERSAL");
assert.equal(result.bell.cueId,"AO.SM.C0225");
assert.equal(result.bell.sourceTiming.rubricalWindow,"SHORTLY_BEFORE_FAITHFUL_COMMUNION");
assert.equal(result.bell.sourceTiming.customaryAnchor,"SHORTLY_AFTER_AGNUS_DEI");
assert.equal(result.bell.canonicalEventIds.length,0);
assert.equal(result.bell.soundEvents.length,0);
assert.equal(result.bell.observedNow,false);
assert.equal(result.bell.actuallyHeard,"UNKNOWN");
assert.equal(result.bell.status,"EXPECTED_NOT_OBSERVED");
assert.equal(result.cinematic.kind,"BELL");
assert.equal(result.cinematic.canonicalAuthority,false);
assert.ok(LOW_COMMUNION_BELL_RUBRIC.exactLatin.startsWith("Si qui sunt communicandi"));
assert.equal(LOW_COMMUNION_BELL_RUBRIC.explicitlyNot,"PRIEST_DOMINE_NON_SUM_DIGNUS_C0229_TO_C0231");
assert.equal(LOW_COMMUNION_BELL_RUBRIC.canonicalEventIdStillUncertified,"MC-COM-185");
for(const cueId of ["AO.SM.C0224","AO.SM.C0226","AO.SM.C0229","AO.SM.C0230","AO.SM.C0231","AO.SM.C0242"]){
 assert.equal(projectLowMassCommunionWarning({
  form:"LOW",activeCueId:cueId,conditions:prepared.session.resolvedMass.conditions,
  canonicalTransient:transient.project(cueId)}).bell,null,
  cueId+" must not become the old priest Domine non sum dignus ringing");
}
for(const form of ["SOLEMN","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","REQUIEM"]){
 assert.equal(projectLowMassCommunionWarning({
  form,activeCueId:"AO.SM.C0225",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"],
  canonicalTransient:old}).bell,null,form+" must retain existing canonical owner");
}
assert.equal(projectLowMassCommunionWarning({
 form:"LOW",activeCueId:"AO.SM.C0225",
 conditions:[],canonicalTransient:old}).bell,null,
 "No communicants, no warning bell");
assert.equal(projectLowMassCommunionWarning({
 form:"LOW",activeCueId:"AO.SM.C0225",
 canonicalTransient:old}).bell,null,"Unknown communicants cannot imply a warning");
assert.equal(projectLowMassCommunionWarning({
 form:"LOW",activeCueId:"AO.SM.C0225",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"],
 canonicalTransient:old,transitionPending:true}).bell,null,
 "Do not bypass card-transition clearing");
const duplicated=projectLowMassCommunionWarning({
 form:"LOW",activeCueId:"AO.SM.C0225",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"],
 canonicalTransient:{...old,bell:{cueId:"AO.SM.C0225"}},
});
assert.equal(duplicated.bell,null,"Future canonical certification must supersede independent overlay");
assert.equal(duplicated.status,"DUPLICATE_PREVENTED");
assert.equal(projectLowMassCommunionWarning({
 form:"LOW",activeCueId:"AO.SM.C0225",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"],
 canonicalTransient:{reason:"EXTRA_UNKNOWN"}}).bell,null);
const profile=j("../data/mass/low-mass-profile.v1.json");
assert.ok(profile.acceptance.forbiddenOrUnavailableSourceMoments.includes("E60"),
 "Source-only display must not modify objective traversal certification");
assert.equal(profile.acceptance.oldPriestDNSDBellAsCommunionWarning,"FORBIDDEN");
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(native,/projectLowMassCommunionWarning\(/);
assert.match(native,/canonicalTransient:transientProjection/);
assert.match(native,/transitionPending:transientGuard\.pending===true/);
assert.match(native,/expectedBell:communionBell,expectedCinematic:communionCinematic/);
console.log("PASS: Low 1962 X.6 Communion warning is conditional source-only expected cue after Agnus Dei; never certifies E60, claims observed ringing or revives priest DNSD.");
