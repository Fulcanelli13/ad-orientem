import assert from "node:assert/strict";
import {
  extractCanonicalCueId,
  resolveFaithfulGestureForCue,
} from "../src/mass/faithful-gesture-cues.js";

assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0056",gestureProfile:"GUIDED_1962"}),null,
  "customary Gloria bow leaked into GUIDED_1962");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0056",gestureProfile:"TRADITIONAL"}).type,"HEAD_BOW");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0068",gestureProfile:"TRADITIONAL"}).type,"SIGN_OF_CROSS");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0090",gestureProfile:"TRADITIONAL"}).type,"HEAD_BOW");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0101",gestureProfile:"TRADITIONAL"}).type,"HEAD_BOW");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0104",gestureProfile:"TRADITIONAL"}).type,"SIGN_OF_CROSS");

const incarnatus=resolveFaithfulGestureForCue({cueId:"AO.SM.C0096",gestureProfile:"ESSENTIAL"});
assert.equal(incarnatus.type,"GENUFLECT");
assert.equal(incarnatus.owner,"R17_RUBRICAL_CUE");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0096",gestureProfile:"GUIDED_1962"}).type,"GENUFLECT");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0096",gestureProfile:"TRADITIONAL",incarnatusAction:"KNEEL"}).type,"KNEEL");

assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0091",gestureProfile:"TRADITIONAL"}),null,
  "gesture inferred from adjacent Credo cue");

assert.equal(extractCanonicalCueId({currentCueId:"AO.SM.C0104"}),"AO.SM.C0104");
assert.equal(extractCanonicalCueId({current:{paragraph:{sourceCueId:"AO.SM.C0064"}}}),"AO.SM.C0064");
assert.equal(extractCanonicalCueId({random:"AO.SM.C0064"}),null);

console.log("faithful Gloria/Credo cue ownership: PASS");
