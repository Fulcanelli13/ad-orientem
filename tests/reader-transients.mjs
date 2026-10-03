import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACTION_CINEMATIC_BINDINGS, BELL_CUE_BINDINGS, createReaderTransientController, partTransitionCinematic, validateReaderTransientBindings } from "../src/mass/reader-transients.js";

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
assert.equal(controller.project("AO.SM.C0145").bell.canonicalEventIds[0],"MC-SAN-020");
assert.equal(controller.project("AO.SM.C0161").bell.canonicalEventIds[0],"MC-CAN-070");
assert.deepEqual(controller.project("AO.SM.C0174").bell.canonicalEventIds,["MC-CNS-030","MC-CNS-040"]);
assert.equal(controller.project("AO.SM.C0174").cinematic.kind,"ELEVATION");
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

const unsupported=createReaderTransientController({events,prepared:{session:{resolvedMass:{form:"LOW",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"]}}}});
assert.equal(unsupported.supported,false);
assert.equal(unsupported.project("AO.SM.C0174").ownership.bell,"LEGACY_FALLBACK");

const partA={part:"Mass of the Catechumens",title:"Credo"},partB={part:"Mass of the Faithful",title:"Offertory"};
assert.equal(partTransitionCinematic(partA,{...partA,title:"Collect"}),null,"same-part card change triggered part cinema");
const transition=partTransitionCinematic(partA,partB);
assert.equal(transition.kind,"PART_TRANSITION");
assert.equal(transition.owner,"R17_SECTION_MAP_DISPLAY_GROUPING");
assert.equal(transition.canonicalAuthority,false);
assert.equal(transition.durationMs,920);
assert.equal(partTransitionCinematic(null,partA,{initial:true}).part,"Mass of the Catechumens");

console.log("reader transients: PASS — five bell anchors, five major-action cinematics, condition fail-closed, and part-transition ownership.");
