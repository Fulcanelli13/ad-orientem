import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";
import { prepareNativeReaderPreview } from "../src/mass/reader-native-preview.js";

const core=JSON.parse(readFileSync(new URL("../data/mass/special-days-core.v1.1.json",import.meta.url),"utf8"));
const payload=JSON.parse(readFileSync(new URL("../data/presentation/reader-good-friday.v1.json",import.meta.url),"utf8"));

const resolvedMass=makeResolvedMass({
  date:"2027-03-26",
  form:"SOLEMN",
  presentationMode:"LIVE",
  calendarCelebration:{id:"good-friday",type:"CALENDAR",title:"Good Friday"},
  distinctRite:"GOOD_FRIDAY",
});
const prepared={
  schema:"ao-mass-entry-bootstrap-v1",
  session:{resolvedMass,plan:compileMassPlan(resolvedMass)},
  readerPreferences:{mode:"LIVE",language:"en"},
};

let ordinaryLoads=0;
const ready=await prepareNativeReaderPreview({
  prepared,
  goodFridayData:{graph:core.graphs.GF,payload},
  loadPresentationData:()=>{ordinaryLoads+=1;throw new Error("ordinary presentation must not load");},
  loadEventData:()=>{ordinaryLoads+=1;throw new Error("ordinary events must not load");},
  loadCueRegistries:()=>{ordinaryLoads+=1;throw new Error("ordinary cue registries must not load");},
  loadGuideData:()=>{ordinaryLoads+=1;throw new Error("ordinary guide must not load");},
});

assert.equal(ordinaryLoads,0);
assert.equal(ready.distinctRite,"GOOD_FRIDAY");
assert.equal(ready.model,null);
assert.ok(ready.goodFridayController);
let state=ready.goodFridayController.project();
assert.equal(state.step.recordId,"GF-OPEN-010");
assert.equal(state.ordinaryMassGraphActive,false);
ready.goodFridayController.goToRecord("GF-PASS-320");
state=ready.goodFridayController.project();
assert.equal(state.posture,"KNEEL");
assert.equal(state.action,"PAUSE_BRIEFLY");
ready.goodFridayController.goToRecord("GF-VEN-620");
state=ready.goodFridayController.project();
assert.equal(state.personalOnly,true);
assert.equal(state.personalState,"GENUFLECTING");
assert.equal(state.action,"ONE_SIMPLE_GENUFLECTION");

console.log("native Good Friday preview preparation: PASS — distinct rite bypasses Ordinary Mass model/state and retains certified Passion/veneration states.");
