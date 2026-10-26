import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  SCHOLA_SCORE_PILOT,SCHOLA_SCORE_TRACK_IDS,resolveNativeScholaScore,
} from "../src/mass/reader-chant-score-pilot.js";

const noSelection=resolveNativeScholaScore({trackId:"KYRIE"});
assert.equal(noSelection.status,"OPTIONAL_EXAMPLE_AVAILABLE");
assert.equal(noSelection.score,null,"Example must not be selected implicitly");
assert.equal(resolveNativeScholaScore({trackId:"SANCTUS_BENEDICTUS"}).score,null);
assert.equal(resolveNativeScholaScore({trackId:"OFFERTORY"}).status,"NO_VERIFIED_SCORE_SELECTION");
assert.equal(resolveNativeScholaScore({trackId:"KYRIE",selectedScoreId:"UNKNOWN"}).score,null);
assert.equal(resolveNativeScholaScore({trackId:"UNKNOWN",selectedScoreId:SCHOLA_SCORE_PILOT.id}).score,null);
const selected=resolveNativeScholaScore({trackId:"KYRIE",selectedScoreId:SCHOLA_SCORE_PILOT.id});
assert.equal(selected.status,"EXAMPLE_ONLY_NOT_SELECTED_FOR_MASS");
assert.equal(selected.actualChoirMelody,"UNKNOWN");
assert.equal(selected.score.id,"GREGOBASE-545");
assert.equal(selected.score.trackId,"KYRIE");
assert.match(selected.score.gabc,/mode:3;/);
assert.match(selected.score.gabc,/\(c4\)/);
assert.match(selected.score.gabc,/Chri\(k\)ste/);
assert.match(selected.score.sourceUrl,/gregobase\.selapa\.net\/chant\.php\?id=545/);
assert.deepEqual(SCHOLA_SCORE_TRACK_IDS,[
  "INTROIT","KYRIE","GLORIA","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
  "CREDO","OFFERTORY","SANCTUS_BENEDICTUS","AGNUS_DEI","COMMUNION",
]);
const source=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.match(source,/import \{ installNativeScholaScorePilot \} from "\.\/reader-chant-score-pilot\.js";/);
assert.match(source,/chantScorePilot=installNativeScholaScorePilot\(root\)/);
assert.match(source,/chantScorePilot\?\.update\(schola\)/);
assert.match(source,/chantScorePilot\?\.destroy\(\)/);
console.log("Gregorian score pilot: source provenance, nonassignment and reader integration PASS");
