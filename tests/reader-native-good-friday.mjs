import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { makeResolvedMass, compileMassPlan } from "../src/mass/session-engine.js";
import { prepareNativeReaderPreview, goodFridayFormulaAtFocus } from "../src/mass/reader-native-preview.js";

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

// Focus ownership is source-ID-only and cannot be caused by unrelated
// intention text or the Ecce lignum versicle. Exercise all 9 + 3 sources.
for(let n=1;n<=9;n++){
  const number=String(n).padStart(2,"0");
  const rows=[
    {cueId:"GF-SOP-"+number+"-K",top:320,bottom:345},
    {cueId:"GF-SOP-"+number+"-R",top:415,bottom:440},
    {cueId:"GF-SOP-"+number+"-I",top:120,bottom:290},
  ];
  assert.equal(goodFridayFormulaAtFocus({
    scrollTop:140,clientHeight:500,items:rows,
  }),"GF-SOP-"+number+"-K","Flectamus genua was skipped in prayer "+number);
  assert.equal(goodFridayFormulaAtFocus({
    scrollTop:240,clientHeight:500,items:rows,
  }),"GF-SOP-"+number+"-R","Levate did not end kneeling in prayer "+number);
  assert.equal(goodFridayFormulaAtFocus({scrollTop:0,clientHeight:500,items:rows}),null,
    "kneeling began at the prayer-card opening instead of the actual words");
}
for(let n=1;n<=3;n++){
  assert.equal(goodFridayFormulaAtFocus({
    scrollTop:135,clientHeight:500,items:[
      {cueId:"GF-X-51"+n,top:310,bottom:328},
      {cueId:"GF-X-52"+n,top:330,bottom:356},
      {cueId:"GF-X-53"+n,top:359,bottom:391},
    ]
  }),"GF-X-52"+n,"Cross unveiling "+n+" did not wait for Venite adoremus");
}
assert.equal(goodFridayFormulaAtFocus({
  scrollTop:250,clientHeight:500,
  items:[{cueId:"UNRELATED-HYMN",top:320,bottom:540}]
}),null,"a hymn incorrectly triggered a Good Friday kneel");

console.log("native Good Friday preview preparation: PASS — distinct rite bypasses Ordinary Mass model/state and retains certified Passion/veneration states.");
