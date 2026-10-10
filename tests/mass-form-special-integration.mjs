import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {makeResolvedMass,compileMassPlan} from "../src/mass/session-engine.js";
import {projectSpecialStructure} from "../src/mass/reader-special-structure.js";
import {createReaderFormCueStateController} from "../src/mass/reader-form-state.js";
import {createReaderGestureMatrixController} from "../src/mass/reader-gesture-matrix.js";

const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=json("../data/mass/rite-overlay-registry.v1.json");
const sources={registry,extension:json("../data/mass/special-days-extension.v1.3.json"),
 core:json("../data/mass/special-days-core.v1.1.json")};
const formState=json("../data/presentation/reader-form-state.v1.json");
const lowCorpus=json("../data/presentation/reader-text-low.v1.json");
const sungCorpus=json("../data/presentation/reader-text-sung.v1.json");
const gestMatrix=createReaderGestureMatrixController({data:json("../data/mass/gesture-matrix.v1.json")});
const registries=Object.freeze({
 gestures:json("../data/presentation/reader-gestures.v1.json"),
 responses:json("../data/presentation/reader-responses.v1.json"),
 postures:json("../data/presentation/reader-postures.v1.json"),
 positions:json("../data/presentation/reader-priest-positions.v1.json"),
 voices:json("../data/presentation/reader-priest-voices.v1.json"),
 actions:json("../data/presentation/reader-priest-actions.v1.json"),
});
const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
const families=[
 {kind:"DAY",type:"CALENDAR",overlay:null},
 {kind:"VOTIVE",type:"VOTIVE",overlay:"VOTIVE_PROPER"},
 {kind:"REQUIEM",type:"REQUIEM",overlay:"REQUIEM"},
 {kind:"NUPTIAL",type:"NUPTIAL",overlay:"NUPTIAL"},
];
const proper={status:"READY",sourcePath:"Sancti/10-07",data:{sourcePath:"Sancti/10-07"}};
function prepare(form,family={},extra={}){
 const type=family.type??"CALENDAR",overlay=family.overlay??null;
 const resolvedMass=makeResolvedMass({
  date:"2026-10-04",form,presentationMode:"LIVE",
  calendarCelebration:{id:"tempora-xix",type:"CALENDAR",title:"XIX Sunday"},
  requestedCelebration:type==="CALENDAR"?null:{id:family.kind.toLowerCase(),type,title:family.kind},
  proper:type==="CALENDAR"?null:proper,
  overlays:overlay?[overlay]:[],
  ...extra,
 });
 return {session:{resolvedMass,plan:compileMassPlan(resolvedMass)},
  readerPreferences:{mode:"LIVE",gestureProfile:"GUIDED_1962",postureProfile:"FOLLOW_CONGREGATION"}};
}
let scenarios=0;
for(const form of forms){
 for(const family of families){
  const prepared=prepare(form,family);
  const plan=projectSpecialStructure(prepared,sources);
  assert.equal(plan.releaseSupport,true,form+"/"+family.kind);
  assert.equal(plan.blockingSpecialSegmentCount,0,form+"/"+family.kind);
  assert.equal(prepared.session.resolvedMass.actualCelebration.type,family.type);
  assert.equal(prepared.session.resolvedMass.form,form);
  assert.equal(prepared.session.resolvedMass.date,"2026-10-04");
  if(family.overlay)assert.ok(plan.segments.some(x=>x.id===family.overlay),form+"/"+family.kind);
  const formController=createReaderFormCueStateController({
    formStateData:formState,registries,lowCorpus,sungCorpus,
    prepared,gestureMatrix:gestMatrix,
  });
  assert.equal(formController.supported,true,form+"/"+family.kind);
  for(const cue of ["AO.SM.C0001","AO.SM.C0075","AO.SM.C0082","AO.SM.C0174","AO.SM.C0225","AO.SM.C0259"]){
    const projection=formController.project(cue);
    assert.equal(projection.supported,true,form+"/"+family.kind+"/"+cue);
    for(const lane of ["gesture","priestPosition","priestVoice","priestAction","response","sacredMinister"]){
      assert.ok(!String(projection.ownership?.[lane]??"").includes("LEGACY"),
       form+"/"+family.kind+"/"+cue+" inherited legacy "+lane);
    }
    if(form==="LOW")assert.equal(projection.sacredMinister,null);
    if(form.startsWith("MISSA_CANTATA"))assert.equal(projection.sacredMinister,null,
      "Missa Cantata was treated as Solemn Mass");
  }
  if(form==="LOW")assert.equal(formController.canonicalCueCount,275);
  scenarios++;
 }
}
for(const preceding of ["ASPERGES","PALM","ASH","CANDLEMAS","ROGATIONS"]){
 const prep=prepare("MISSA_CANTATA_INCENSE",families[0],{precedingRites:[preceding]});
 const projection=projectSpecialStructure(prep,sources);
 assert.equal(projection.releaseSupport,true,"special prelude "+preceding);
 assert.equal(projection.segments[0].id,preceding);
 assert.equal(projection.segments[0].readerPayload,"NATIVE_READER_PAYLOAD");
 assert.equal(projection.segments.at(-1).id,"ORDINARY_MASS");
 scenarios++;
}
for(const item of [
 {family:families[2],followingActions:["REQUIEM_ABSOLUTION"]},
 {family:families[0],followingActions:["CORPUS_CHRISTI_PROCESSION"]},
 {family:families[0],followingActions:["GENERIC_PROCESSION"]},
 {family:families[0],followingActions:["HOLY_THURSDAY_POST"]},
]){
 const prep=prepare("SOLEMN",item.family,{followingActions:item.followingActions});
 const projection=projectSpecialStructure(prep,sources);
 assert.equal(projection.releaseSupport,true);
 assert.equal(projection.segments.at(-1).id,item.followingActions[0]);
 scenarios++;
}
for(const rite of ["GOOD_FRIDAY","EASTER_VIGIL"]){
 const prep=prepare("SOLEMN",families[0],{distinctRite:rite});
 const projection=projectSpecialStructure(prep,sources);
 assert.equal(projection.releaseSupport,true,rite);
 assert.equal(projection.segments[0].id,rite);
 if(rite==="GOOD_FRIDAY")assert.equal(projection.ordinaryMassGraphActive,false,
  "Good Friday misrepresented as Mass");
 if(rite==="EASTER_VIGIL")assert.equal(projection.ordinaryMassGraphActive,true,
  "Easter Vigil lost its Mass phase");
 scenarios++;
}
const low=prepare("LOW",families[0]);
const lowCtrl=createReaderFormCueStateController({
 formStateData:formState,registries,lowCorpus,sungCorpus,prepared:low,gestureMatrix:gestMatrix,
});
assert.equal(lowCtrl.project("AO.SM.C0075").priestPosition.station,"ALTAR_EPISTLE_MISSAL");
assert.equal(lowCtrl.project("AO.SM.C0082").priestPosition.station,"ALTAR_GOSPEL_MISSAL");
assert.equal(lowCtrl.project("AO.SM.C0174").sacredMinister,null);
console.log("Mass integration grid: PASS — "+scenarios+" source-owned form × Mass-family/special-rite cases, 275 Low cues, 4 certified forms, no legacy or false sacred ministers.");
