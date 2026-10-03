import assert from "node:assert/strict";
import { V183_PRE_GOSPEL_LIVE_CONTRACT, assertV183PreGospelLiveContract } from "../src/mass/reader-live-pre-gospel.js";
import { readFileSync } from "node:fs";

const contract=assertV183PreGospelLiveContract();
assert.equal(contract.status,"RECOVERED_CONTRACT_LOCKED__RUNTIME_GATED_BY_G6");
assert.deepEqual(contract.order,["AO.SM.B021","AO.SM.B022","AO.SM.B023"]);
assert.equal(contract.gradual.ownership,"GRADUAL_ONLY");
assert.equal(contract.alleluiaTract.ownership,"ALLELUIA_TRACT");
assert.equal(contract.alleluiaTract.mayMergeIntoGradual,false);
assert.equal(contract.munda.ownership,"MUNDA_COR_MEUM_START");

const scholaSource=readFileSync(new URL("../src/mass/reader-schola.js",import.meta.url),"utf8");
assert.match(scholaSource,/id:"GRADUAL".*canonicalBlockIds:\["AO\.SM\.B021"\]/s);
assert.match(scholaSource,/id:"ALLELUIA_TRACT_SEQUENCE".*canonicalBlockIds:\["AO\.SM\.B022"\]/s);
assert.doesNotMatch(scholaSource,/id:"GRADUAL"[^\n]*AO\.SM\.B022/,
  "B022 leaked into the Gradual Schola ownership row");

console.log("v1.83 Gradual LIVE architecture: PASS — B021 main reader, B022 Schola, B023 Munda; source-first LIVE integration still gates LIVE.");
