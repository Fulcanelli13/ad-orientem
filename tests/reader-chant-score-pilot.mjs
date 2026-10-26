import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  SCHOLA_SCORE_PILOT,SCHOLA_SCORE_CATALOGUE,SCHOLA_SCORE_TRACK_IDS,
  availableNativeScholaScores,resolveNativeScholaScore,
  scoreReadingProgress,scoreReadingStep,
} from "../src/mass/reader-chant-score-pilot.js";

const noSelection=resolveNativeScholaScore({trackId:"KYRIE"});
assert.equal(noSelection.status,"OPTIONAL_EXAMPLE_AVAILABLE");
assert.equal(noSelection.score,null,"Kyrie must never get an implicit musical setting");
assert.deepEqual(noSelection.availableIds,["GREGOBASE-545","GREGOBASE-2982","GREGOBASE-1184"]);
assert.equal(resolveNativeScholaScore({trackId:"SANCTUS_BENEDICTUS"}).score,null,
  "Benedictus must not inherit a Kyrie melody");
assert.equal(resolveNativeScholaScore({trackId:"OFFERTORY"}).status,"NO_VERIFIED_SCORE_SELECTION");
assert.equal(resolveNativeScholaScore({trackId:"KYRIE",selectedScoreId:"UNKNOWN"}).score,null);
assert.equal(resolveNativeScholaScore({trackId:"UNKNOWN",selectedScoreId:SCHOLA_SCORE_PILOT.id}).score,null);
assert.equal(availableNativeScholaScores("KYRIE").length,3);
assert.deepEqual(availableNativeScholaScores("SANCTUS_BENEDICTUS"),[]);
assert.equal(SCHOLA_SCORE_CATALOGUE.length,3);
for(const record of SCHOLA_SCORE_CATALOGUE){
  const selected=resolveNativeScholaScore({trackId:"KYRIE",selectedScoreId:record.id});
  assert.equal(selected.status,"EXAMPLE_ONLY_NOT_SELECTED_FOR_MASS");
  assert.equal(selected.actualChoirMelody,"UNKNOWN");
  assert.equal(selected.score.id,record.id);
  assert.equal(selected.score.trackId,"KYRIE");
  assert.match(selected.score.sourceUrl,/gregobase\.selapa\.net\/chant\.php\?id=\d+/);
  assert.match(selected.score.svgUrl,/gregobase\.selapa\.net\/download\.php\?format=svg&id=\d+/);
  assert.equal(selected.score.bookWitnesses.length,2);
  assert.match(selected.score.bookWitnesses[0],/1961/);
}
const selected=resolveNativeScholaScore({trackId:"KYRIE",selectedScoreId:SCHOLA_SCORE_PILOT.id});
assert.match(selected.score.gabc,/mode:3;/);
assert.match(selected.score.gabc,/\(c4\)/);
assert.match(selected.score.gabc,/Chri\(k\)ste/);
assert.deepEqual(SCHOLA_SCORE_TRACK_IDS,[
  "INTROIT","KYRIE","GLORIA","GRADUAL","ALLELUIA_TRACT_SEQUENCE",
  "CREDO","OFFERTORY","SANCTUS_BENEDICTUS","AGNUS_DEI","COMMUNION",
]);
assert.equal(scoreReadingProgress({scrollTop:0,scrollHeight:800,clientHeight:300}),0);
assert.equal(scoreReadingProgress({scrollTop:250,scrollHeight:800,clientHeight:300}),.5);
assert.equal(scoreReadingProgress({scrollTop:5000,scrollHeight:800,clientHeight:300}),1);
assert.equal(scoreReadingProgress({scrollTop:-50,scrollHeight:800,clientHeight:300}),0);
assert.equal(scoreReadingProgress({scrollTop:500,scrollHeight:100,clientHeight:300}),0);
assert.equal(scoreReadingStep(300),216);
assert.equal(scoreReadingStep(0),80);

const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const scoreModule=readFileSync(new URL("../src/mass/reader-chant-score-pilot.js",import.meta.url),"utf8");
assert.match(dom,/import \{ installNativeScholaScorePilot \} from "\.\/reader-chant-score-pilot\.js";/);
assert.match(dom,/chantScorePilot=installNativeScholaScorePilot\(root,\{onLayoutChange/);
assert.match(dom,/chantScorePilot\?\.update\(schola\)/);
assert.match(dom,/chantScorePilot\?\.destroy\(\)/);
assert.match(dom,/chantScorePilot\?\.hide\?\.\(\)/);
assert.match(dom,/const notationOpen=dock\.dataset\.notation==="true"/);
assert.match(scoreModule,/const onPanelKey=event=>/);
assert.match(scoreModule,/lastTrack=track/);
assert.match(scoreModule,/Reference score|Reference Kyrie|reference score/i);
assert.doesNotMatch(scoreModule,/\.next\(\)|\.releaseBenedictus\(\)|onScholaAdvance\(/);
assert.doesNotMatch(scoreModule,/new Audio\(|getUserMedia\(|SpeechRecognition/);
console.log("Gregorian continuous score pilot PASS: three 1961 sources, manual scrolling, no simulated choir state");
