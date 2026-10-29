import assert from "node:assert/strict";
import { resolveReaderPreferences } from "../src/mass/reader-state.js";
import {projectRequiemChoirPosture,isRequiemChoirPostureApplicable} from "../src/mass/reader-requiem-choir-posture.js";
import {
  findLocalPostureOverride,
  resolveReaderPostureChannel,
} from "../src/mass/reader-posture-profile.js";

const sourced={
  cueId:"AO.SM.C0075",
  posture:{
    label:"SIT",
    value:"SIT",
    cueId:"AO.SM.C0075",
    sourcePostureId:"AO.SM.POST.007",
    authority:"B1/C1",
    sources:"OC64",
    persistent:true,
  },
};

const follow=resolveReaderPreferences({
  postureProfile:"FOLLOW_CONGREGATION",
});
let state=resolveReaderPostureChannel({
  preferences:follow,
  cueProjection:sourced,
  legacyPosture:{label:"KNEEL"},
  cueId:"AO.SM.C0075",
});
assert.equal(state.posture.label,"KNEEL","FOLLOW_CONGREGATION stopped observing the visible congregation");
assert.equal(state.owner,"FOLLOW_CONGREGATION_OBSERVED");

state=resolveReaderPostureChannel({
  preferences:follow,
  cueProjection:sourced,
  legacyPosture:null,
  cueId:"AO.SM.C0075",
});
assert.equal(state.posture.value,"SIT","FOLLOW_CONGREGATION without observer did not fall back to sourced posture");
assert.equal(state.owner,"FOLLOW_CONGREGATION_SOURCE_FALLBACK");
assert.equal(state.sourcePostureId,"AO.SM.POST.007");

const oconnell=resolveReaderPreferences({
  postureProfile:"OCONNELL_1962_COMMUNITY",
});
state=resolveReaderPostureChannel({
  preferences:oconnell,
  cueProjection:sourced,
  legacyPosture:{label:"KNEEL"},
  cueId:"AO.SM.C0075",
});
assert.equal(state.posture.value,"SIT","O'Connell profile ignored sourced posture");
assert.equal(state.posture.owner,"OCONNELL_1962_COMMUNITY");
assert.equal(state.sourcePostureId,"AO.SM.POST.007");

const oconnellMissing=resolveReaderPostureChannel({
  preferences:oconnell,
  cueProjection:null,
  legacyPosture:{label:"KNEEL"},
  cueId:"AO.SM.C0076",
});
assert.equal(oconnellMissing.posture,null,"profile invented posture from legacy fallback");
assert.equal(oconnellMissing.owner,"PROFILE_FAIL_CLOSED");

const localPrefs=resolveReaderPreferences({
  postureProfile:"MY_LOCAL",
  localPostures:{
    "AO.SM.C0075":"STAND",
    "AO.CARD.005":"SIT",
    "AO.SM.M05":"KNEEL",
  },
});
assert.deepEqual(
  findLocalPostureOverride(localPrefs,{cueId:"AO.SM.C0075",sectionId:"AO.CARD.005",macroId:"AO.SM.M05"}),
  {key:"AO.SM.C0075",value:"STAND"},
  "local posture precedence changed"
);
state=resolveReaderPostureChannel({
  preferences:localPrefs,
  cueProjection:sourced,
  legacyPosture:{label:"KNEEL"},
  cueId:"AO.SM.C0075",
  sectionId:"AO.CARD.005",
  macroId:"AO.SM.M05",
});
assert.equal(state.posture.value,"STAND","MY_LOCAL did not own exact saved override");
assert.equal(state.owner,"LOCAL_OVERRIDE");
assert.equal(state.localKey,"AO.SM.C0075");

const localMissing=resolveReaderPreferences({
  postureProfile:"MY_LOCAL",
  localPostures:{},
});
state=resolveReaderPostureChannel({
  preferences:localMissing,
  cueProjection:sourced,
  legacyPosture:{label:"KNEEL"},
  cueId:"AO.SM.C0075",
});
assert.equal(state.posture,null,"empty MY_LOCAL profile leaked sourced or legacy posture");
assert.equal(state.owner,"LOCAL_FAIL_CLOSED");


const requiem={form:"SOLEMN",overlays:["REQUIEM"],actualCelebration:{type:"REQUIEM"}};
const requiemCantata={...requiem,form:"MISSA_CANTATA_SIMPLE"};
const ordinary={form:"SOLEMN",actualCelebration:{type:"CALENDAR"}};
const lowRequiem={...requiem,form:"LOW"};
assert.equal(isRequiemChoirPostureApplicable(requiem),true);
assert.equal(isRequiemChoirPostureApplicable(requiemCantata),true);
assert.equal(isRequiemChoirPostureApplicable(lowRequiem),false);
assert.equal(isRequiemChoirPostureApplicable(ordinary),false);
for(const [cue,value,start,transition,rule] of [
 ["C0072","KNEEL","C0072",true,"COLLECTS"],
 ["C0074","KNEEL","C0072",false,"COLLECTS"],
 ["C0150","KNEEL","C0150",true,"AFTER_SANCTUS_TO_PATERNOSTER"],
 ["C0182","KNEEL","C0150",false,"AFTER_SANCTUS_TO_PATERNOSTER"],
 ["C0207","KNEEL","C0150",false,"AFTER_SANCTUS_TO_PATERNOSTER"],
 ["C0208","STAND","C0208",true,"PATERNOSTER_INTRODUCTION"],
 ["C0210","STAND","C0208",false,"PATERNOSTER_INTRODUCTION"],
 ["C0253","KNEEL","C0253",true,"POSTCOMMUNIONS"],
 ["C0256","KNEEL","C0253",false,"POSTCOMMUNIONS"],
 ["C0257","STAND","C0257",true,"AFTER_POSTCOMMUNIONS"],
 ["C0261","STAND","C0257",false,"AFTER_POSTCOMMUNIONS"],
]){
 const x=projectRequiemChoirPosture("AO.SM."+cue,requiem);
 assert.equal(x?.value,value,cue+" choir posture");
 assert.equal(x?.cueId,"AO.SM."+start,cue+" posture start must be canonical");
 assert.equal(x?.transition,transition,cue+" transition must not repeat in the span");
 assert.equal(x?.actorScope,"CHOIR_ONLY",cue+" must never be a universal pew instruction");
 assert.equal(x?.rule,rule);
}
for(const cue of ["C0071","C0075","C0149","C0222","C0225","C0226","C0252","C0267"]){
 assert.equal(projectRequiemChoirPosture("AO.SM."+cue,requiem),null,
   cue+" outside the strict choir-only §521(c) windows");
}
assert.equal(projectRequiemChoirPosture("AO.SM.C0150",ordinary),null);
assert.equal(projectRequiemChoirPosture("AO.SM.C0150",lowRequiem),null);
assert.equal(projectRequiemChoirPosture("AO.SM.C0150",requiem,{reason:"RITUS_OMITTED"}),null);
assert.equal(projectRequiemChoirPosture("AO.CARD.016",requiem),null);

const choirPrefs=resolveReaderPreferences({postureProfile:"REQUIEM_CHOIR_1962"});
assert.equal(choirPrefs.postureProfile,"REQUIEM_CHOIR_1962");
const cueFor=id=>({cueId:id,posture:{label:"STAND",value:"STAND",
  cueId:"AO.SM.C0137",sourcePostureId:"AO.SM.POST.015",persistent:true}});
for(const cue of ["AO.SM.C0072","AO.SM.C0150","AO.SM.C0208","AO.SM.C0253","AO.SM.C0257"]){
 const result=resolveReaderPostureChannel({
  preferences:choirPrefs,cueId:cue,cueProjection:cueFor(cue),resolvedMass:requiem,
 });
 assert.equal(result.owner,"REQUIEM_CHOIR_1962",cue+" did not apply opted-in choir profile");
 assert.equal(result.posture?.transition,true,cue+" has no visible posture change");
 assert.equal(result.posture?.cueId,cue);
}
const choirPersistent=resolveReaderPostureChannel({
 preferences:choirPrefs,cueId:"AO.SM.C0190",cueProjection:cueFor("AO.SM.C0190"),
 resolvedMass:requiem,
});
assert.equal(choirPersistent.posture.value,"KNEEL");
assert.equal(choirPersistent.posture.transition,false);
const localChoir=resolveReaderPreferences({postureProfile:"REQUIEM_CHOIR_1962",
 localPostures:{"AO.SM.C0150":"STAND"}});
const overridden=resolveReaderPostureChannel({
 preferences:localChoir,cueId:"AO.SM.C0150",
 cueProjection:cueFor("AO.SM.C0150"),resolvedMass:requiem,
});
assert.equal(overridden.owner,"LOCAL_OVERRIDE");
assert.equal(overridden.posture.value,"STAND");
const fixedChoir=resolveReaderPostureChannel({
 preferences:localChoir,cueId:"AO.SM.C0150",resolvedMass:requiem,
 cueProjection:{posture:{label:"KNEEL",value:"KNEEL",fixed:true,cueId:"AO.SM.C0150"}},
});
assert.equal(fixedChoir.owner,"SOURCED_FIXED");
const notRequiem=resolveReaderPostureChannel({
 preferences:choirPrefs,cueId:"AO.SM.C0150",cueProjection:cueFor("AO.SM.C0150"),
 resolvedMass:ordinary,
});
assert.equal(notRequiem.owner,"REQUIEM_CHOIR_SOURCE_FALLBACK");
assert.equal(notRequiem.posture.value,"STAND");
const followRequiem=resolveReaderPostureChannel({
 preferences:follow,cueId:"AO.SM.C0150",cueProjection:cueFor("AO.SM.C0150"),
 resolvedMass:requiem,legacyPosture:{label:"SIT"},
});
assert.equal(followRequiem.owner,"FOLLOW_CONGREGATION_OBSERVED");
assert.equal(followRequiem.posture.label,"SIT");

console.log("reader posture profile: PASS — congregation observation, sourced profile ownership, local override precedence, fail-closed gaps.");
