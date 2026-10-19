import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACTION_CINEMATIC_BINDINGS, BELL_CUE_BINDINGS, BELL_SOURCE_WINDOWS, CANON_ELEVATION_BELL_PHASES, createReaderTransientController, partTransitionCinematic, resolveCanonStageBellCinematic, validateReaderTransientBindings } from "../src/mass/reader-transients.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const events=["../data/mass/mc-events-01.v1.json","../data/mass/mc-events-02.v1.json","../data/mass/mc-events-03.v1.json","../data/mass/mc-events-04.v1.json","../data/mass/mc-events-05.v1.json","../data/mass/mc-events-06.v1.json"].flatMap(path=>load(path).events);

const audit=validateReaderTransientBindings(events);
assert.equal(audit.bellCueCount,5);
assert.deepEqual(audit.cueIds,["AO.SM.C0145","AO.SM.C0161","AO.SM.C0174","AO.SM.C0181","AO.SM.C0225"]);
assert.equal(BELL_CUE_BINDINGS.length,5);
assert.equal(ACTION_CINEMATIC_BINDINGS.length,3);
assert.deepEqual(audit.actionCinematicCueIds,["AO.SM.C0204","AO.SM.C0242","AO.SM.C0265"]);

const controller=createReaderTransientController({events,prepared:{session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"]}}}});
assert.equal(controller.supported,true);
// Source-clock landmarks are not sound detection. At Sung Mass the choir
// can be singing Sanctus at a different instant from the priest's recitation.
assert.deepEqual(Object.keys(BELL_SOURCE_WINDOWS),audit.cueIds);
for(const binding of BELL_CUE_BINDINGS){
 const bell=controller.project(binding.cueId).bell;
 assert.equal(bell?.sourceTiming,BELL_SOURCE_WINDOWS[binding.cueId]);
 assert.equal(bell?.status,"EXPECTED_NOT_OBSERVED");
 assert.equal(bell?.notAnObservation,true);
 assert.equal(bell?.observedNow,false);
 assert.equal(bell?.actuallyHeard,"UNKNOWN");
 assert.equal(controller.project(binding.cueId).cinematic?.observedNow,false);
}
assert.equal(BELL_SOURCE_WINDOWS["AO.SM.C0145"].sourceClock,"SCHOLA_PUBLIC");
assert.equal(BELL_SOURCE_WINDOWS["AO.SM.C0145"].rubricalWindow,"PRIEST_RECITES_SANCTUS");
assert.equal(BELL_SOURCE_WINDOWS["AO.SM.C0161"].rubricalWindow,"SHORTLY_BEFORE_CONSECRATION");
assert.equal(BELL_SOURCE_WINDOWS["AO.SM.C0161"].timingPrecision,
 "COMMON_ANCHOR_NOT_MANDATED_EXACT_WORD");
assert.equal(BELL_SOURCE_WINDOWS["AO.SM.C0225"].rubricalWindow,"SHORTLY_BEFORE_FAITHFUL_COMMUNION");
assert.equal(BELL_SOURCE_WINDOWS["AO.SM.C0225"].timingPrecision,
 "APPROXIMATE_SOURCE_TEXT_LANDMARK");
assert.equal(controller.project("AO.SM.C0225").bell.detail,"Before Communion of the faithful");
assert.equal(controller.project("AO.SM.C0225").cinematic.subtitle,"BEFORE COMMUNION OF THE FAITHFUL");
assert.equal(controller.project("AO.SM.C0145").bell.canonicalEventIds[0],"MC-SAN-020");
assert.equal(controller.project("AO.SM.C0161").bell.canonicalEventIds[0],"MC-CAN-070");
assert.deepEqual(controller.project("AO.SM.C0174").bell.canonicalEventIds,["MC-CNS-030","MC-CNS-040"]);
assert.equal(controller.project("AO.SM.C0174").cinematic.kind,"ELEVATION");
assert.deepEqual(CANON_ELEVATION_BELL_PHASES["AO.SM.C0174"].map(x=>x.canonicalEventId),
 ["MC-CNS-030","MC-CNS-040","MC-CNS-040"]);
assert.deepEqual(CANON_ELEVATION_BELL_PHASES["AO.SM.C0181"].map(x=>x.canonicalEventId),
 ["MC-CNS-100","MC-CNS-110","MC-CNS-110"]);
for(const [cueId,phases] of Object.entries(CANON_ELEVATION_BELL_PHASES)){
 assert.deepEqual(phases.map(x=>x.moment),
 ["FIRST_GENUFLECTION","ELEVATION","SECOND_GENUFLECTION"]);
 assert.deepEqual(phases.map(x=>x.status),
 ["CONDITIONAL_THREE_RING_PATTERN","PRESCRIBED_ELEVATION_WINDOW",
  "CONDITIONAL_THREE_RING_PATTERN_DISTRIBUTION"]);
 assert.ok(phases[2].additionalCanonicalSoundEvent===false,
  "Customary final genuflection ringing must reuse the existing sound event");
 assert.equal(phases[2].canonicalEventId,phases[1].canonicalEventId,
  "Three distributed strikes are not four canonical sound-event records");
 assert.equal(controller.project(cueId).bell.phases,phases,
   "The source-backed opportunity map must preserve separate genuflection/elevation sound records");
}
const expected=controller.project("AO.SM.C0174");
const before=resolveCanonStageBellCinematic({cueId:"AO.SM.C0174",
 expectedBell:expected.bell,expectedCinematic:expected.cinematic});
assert.equal(before.observationOverrides,false);
assert.equal(before.bell.canonicalEventIds.length,2);
const observedGenuflection={cueId:"AO.SM.C0174",
 status:"INDEPENDENT_CANON_STAGE_OBSERVED",observedNow:true,
 priestAction:{id:"AO.RUB.C0174.01"},bell:null,cinematic:null};
const first=resolveCanonStageBellCinematic({cueId:"AO.SM.C0174",
 expectedBell:expected.bell,expectedCinematic:expected.cinematic,
 observedCanon:observedGenuflection});
assert.equal(first.observationOverrides,true);
assert.equal(first.bell,null,"First genuflection cannot claim a server bell");
assert.equal(first.cinematic,null,"First genuflection cannot animate a Host elevation");
assert.equal(first.bellOwner,"EXPLICIT_CANON_STAGE_NO_BELL_OBSERVED");
const raised=resolveCanonStageBellCinematic({cueId:"AO.SM.C0174",
 expectedBell:expected.bell,expectedCinematic:expected.cinematic,
 observedCanon:{...observedGenuflection,
   priestAction:{id:"AO.RUB.C0174.02"},
   cinematic:{cueId:"AO.SM.C0174",kind:"ELEVATION"}}});
assert.equal(raised.bell,null,"Observed priest elevation cannot invent simultaneous ringing");
assert.equal(raised.cinematic.kind,"ELEVATION");
const ring=resolveCanonStageBellCinematic({cueId:"AO.SM.C0174",
 expectedBell:expected.bell,expectedCinematic:expected.cinematic,
 observedCanon:{...observedGenuflection,
  bell:{cueId:"AO.SM.C0174",id:"AO.RUB.C0174.03"}}});
assert.equal(ring.bell.id,"AO.RUB.C0174.03",
  "Only the independently witnessed server bell may appear as observed");
const settled=resolveCanonStageBellCinematic({cueId:"AO.SM.C0174",
 expectedBell:expected.bell,expectedCinematic:expected.cinematic,
 observedCanon:{...observedGenuflection,observedNow:false,status:"NO_ACTIVE_CANON_STAGE"}});
assert.equal(settled.bell,null,"Bell cannot reappear when a witnessed Canon stage expires");
assert.equal(settled.cinematic,null,"Elevation focus must expire independently");
const mismatch=resolveCanonStageBellCinematic({cueId:"AO.SM.C0181",
 expectedBell:controller.project("AO.SM.C0181").bell,
 expectedCinematic:controller.project("AO.SM.C0181").cinematic,
 observedCanon:observedGenuflection});
assert.equal(mismatch.observationOverrides,false,
 "A Host observation cannot alter the Chalice source cue");
assert.equal(controller.project("AO.SM.C0173").bell,null,"Host words must remain bell-free");
assert.equal(controller.project("AO.SM.C0180").bell,null,"Chalice words must remain bell-free");
assert.deepEqual(controller.project("AO.SM.C0181").bell.canonicalEventIds,["MC-CNS-100","MC-CNS-110"]);
assert.equal(controller.project("AO.SM.C0225").bell.canonicalEventIds[0],"MC-COM-185");
assert.equal(controller.project("AO.SM.C0225").cinematic.kind,"BELL");
assert.equal(controller.project("AO.SM.C0204").cinematic.title,"MINOR ELEVATION");
assert.equal(controller.project("AO.SM.C0204").cinematic.canonicalEventIds[0],"MC-CAN-180");
assert.equal(controller.project("AO.SM.C0242").cinematic.title,"ECCE AGNUS DEI");
assert.equal(controller.project("AO.SM.C0242").cinematic.canonicalEventIds[0],"MC-COM-270");
assert.equal(controller.project("AO.SM.C0173").bell,null,"Host words cue acquired the elevation bell");
assert.equal(controller.project("AO.SM.C0180").bell,null,"Chalice words cue acquired the elevation bell");

const blessingController=createReaderTransientController({events,prepared:{session:{resolvedMass:{form:"MISSA_CANTATA_SIMPLE",conditions:[]},plan:{blessingAllowed:true}}}});
assert.equal(blessingController.project("AO.SM.C0265").cinematic.title,"BLESSING");
assert.equal(blessingController.project("AO.SM.C0265").cinematic.canonicalEventIds[0],"MC-END-130");

const noCommunion=createReaderTransientController({events,prepared:{session:{resolvedMass:{form:"MISSA_CANTATA_SIMPLE",conditions:[]}}}});
assert.equal(noCommunion.project("AO.SM.C0225").bell,null,"conditional Communion warning fired without communicants");
assert.equal(noCommunion.project("AO.SM.C0225").ownership.bell,"R17_CONDITION_FAIL_CLOSED");

const low=createReaderTransientController({events,prepared:{session:{resolvedMass:{form:"LOW",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"]},plan:{blessingAllowed:true}}}});
assert.equal(low.supported,true);
assert.equal(low.project("AO.SM.C0145").bell.canonicalEventIds[0],"MC-SAN-020");
assert.equal(low.project("AO.SM.C0145").bell.sourceTiming.sourceClock,"PUBLIC_TEXT",
  "Low Mass Sanctus bell must follow the priest's Sanctus, not an absent Schola");
assert.equal(low.project("AO.SM.C0145").bell.sourceTiming.form,"LOW");
assert.equal(controller.project("AO.SM.C0145").bell.sourceTiming.sourceClock,"SCHOLA_PUBLIC",
  "Sung source landmark must remain the choir's text, distinct from priest timing");
assert.equal(low.project("AO.SM.C0161").bell.canonicalEventIds[0],"MC-CAN-070");
assert.equal(low.project("AO.SM.C0174").cinematic.kind,"ELEVATION");
assert.equal(low.project("AO.SM.C0181").cinematic.kind,"ELEVATION");
assert.equal(low.project("AO.SM.C0204").cinematic.title,"MINOR ELEVATION");
assert.equal(low.project("AO.SM.C0242").cinematic.title,"ECCE AGNUS DEI");
assert.equal(low.project("AO.SM.C0265").cinematic.title,"BLESSING");
assert.equal(low.project("AO.SM.C0225").bell,null,"Low Mass acquired the unavailable Communion-warning bell");
assert.equal(low.project("AO.SM.C0225").reason,"CANONICAL_EVENT_UNAVAILABLE_FOR_FORM");
assert.equal(low.project("AO.SM.C0225").ownership.bell,"R18_FORM_CERTIFIED_ABSENCE");

const solemn=createReaderTransientController({events,prepared:{session:{resolvedMass:{form:"SOLEMN",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"]},plan:{blessingAllowed:true}}}});
assert.equal(solemn.supported,true);
assert.equal(solemn.project("AO.SM.C0145").bell.canonicalEventIds[0],"MC-SAN-020");
assert.equal(solemn.project("AO.SM.C0174").cinematic.kind,"ELEVATION");
assert.equal(solemn.project("AO.SM.C0181").cinematic.kind,"ELEVATION");
assert.equal(solemn.project("AO.SM.C0225").bell.canonicalEventIds[0],"MC-COM-185");
assert.equal(solemn.project("AO.SM.C0225").bell.soundEvents[0].legalStatus,"PRESCRIBED_CONDITIONALLY_IF_FAITHFUL_COMMUNICATE");
assert.equal(solemn.project("AO.SM.C0204").cinematic.title,"MINOR ELEVATION");
assert.equal(solemn.project("AO.SM.C0242").cinematic.title,"ECCE AGNUS DEI");
assert.equal(solemn.project("AO.SM.C0265").cinematic.title,"BLESSING");

for(const controllerUnderTest of [low,solemn]){
  for(const cueId of ["AO.SM.C0145","AO.SM.C0161","AO.SM.C0174","AO.SM.C0181","AO.SM.C0204","AO.SM.C0225","AO.SM.C0242","AO.SM.C0265"]){
    const projected=controllerUnderTest.project(cueId);
    assert.ok(!String(projected.ownership.bell).includes("LEGACY"),controllerUnderTest.form+" "+cueId+" bell fell back to legacy");
    assert.ok(!String(projected.ownership.cinematic).includes("LEGACY"),controllerUnderTest.form+" "+cueId+" cinematic fell back to legacy");
  }
}

const unknown=createReaderTransientController({events,prepared:{session:{resolvedMass:{form:"UNSUPPORTED"}}}});
assert.equal(unknown.supported,false);
assert.equal(unknown.project("AO.SM.C0174").ownership.bell,"LEGACY_FALLBACK");

const partA={part:"Mass of the Catechumens",title:"Credo"},partB={part:"Mass of the Faithful",title:"Offertory"};
assert.equal(partTransitionCinematic(partA,{...partA,title:"Collect"}),null,"same-part card change triggered part cinema");
const transition=partTransitionCinematic(partA,partB);
assert.equal(transition.kind,"PART_TRANSITION");
assert.equal(transition.owner,"R17_SECTION_MAP_DISPLAY_GROUPING");
assert.equal(transition.canonicalAuthority,false);
assert.equal(transition.durationMs,920);
assert.equal(partTransitionCinematic(null,partA,{initial:true}).part,"Mass of the Catechumens");

console.log("reader transients: PASS — Missa Cantata, Low and Solemn native transients, form-certified absence, condition gating, and part-transition ownership.");
