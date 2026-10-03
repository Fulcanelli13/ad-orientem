import assert from "node:assert/strict";
import { resolveReaderPreferences } from "../src/mass/reader-state.js";
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

console.log("reader posture profile: PASS — congregation observation, sourced profile ownership, local override precedence, fail-closed gaps.");
