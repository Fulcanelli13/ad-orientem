import assert from "node:assert/strict";
import {
  POSTCOMMUNION_EXIT_CUES,
  compilePostcommunionExitDelta,
  assertPostcommunionExitOwnership,
} from "../src/mass/postcommunion-exit.js";

const ordinary=compilePostcommunionExitDelta();
assertPostcommunionExitOwnership(ordinary);
assert.equal(ordinary.mode,"ORDINARY");
assert.deepEqual(ordinary.suppressBaseCueIds,[]);
assert.deepEqual(ordinary.activeOrder,[
  "AO.SM.C0254","AO.SM.C0255","AO.SM.C0256","AO.SM.C0257",
]);
assert.equal(ordinary.exitOwner,"AO.SM.C0256");

const pop=compilePostcommunionExitDelta({prayerOverPeoplePresent:true});
assertPostcommunionExitOwnership(pop);
assert.equal(pop.mode,"PRAYER_OVER_PEOPLE");
assert.deepEqual(pop.suppressBaseCueIds,["AO.SM.C0256"]);
assert.equal(pop.activeOrder.includes("AO.SM.C0256"),false,
  "B088 ordinary exit leaked ahead of Prayer over the People");
assert.deepEqual(pop.activeOrder,[
  "AO.SM.C0254","AO.SM.C0255","R17.POP.010","R17.POP.020","AO.SM.C0257",
]);
assert.equal(pop.insertionGraph[0].station,"ALTAR_EPISTLE_MISSAL",
  "priest left the Missal before Prayer over the People");
assert.equal(pop.insertionGraph[1].semanticDonorCueId,"AO.SM.C0256");
assert.equal(pop.insertionGraph[1].before,"AO.SM.C0257");

// Guard against a tempting but invalid implementation that merely inserts the prayer
// after the already-executed ordinary exit.
assert.throws(()=>assertPostcommunionExitOwnership({
  ...pop,
  suppressBaseCueIds:[],
  activeOrder:[
    "AO.SM.C0254","AO.SM.C0255","AO.SM.C0256","R17.POP.010","R17.POP.020","AO.SM.C0257",
  ],
}),/must be suppressed|executed before/);

console.log("P2-008 Postcommunion exit ownership: PASS — C0256 deferred until after Prayer over the People.");
