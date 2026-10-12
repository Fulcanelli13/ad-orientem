import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspect1962PrefaceSelection,PREFACE_SELECTION_WITNESSES} from "../src/mass/1962-preface-decision.js";
const sample=JSON.parse(readFileSync(new URL("../data/calendar/audits/1962-2026-preface-runtime-10-date-audit.v1.json",import.meta.url),"utf8"));
let contradictions=0;
for(const row of sample.rows){
  const result=inspect1962PrefaceSelection({principalCelebrationId:row.mainId,
    selectedPreface:{lat:row.prefaceLatinOpening}});
  if(["2026-05-24","2026-10-07","2026-12-08"].includes(row.date)){
    assert.equal(result.status,"CONTRADICTION",row.date);
    assert.equal(result.actualId,"COMMUNIS",row.date);
    assert.equal(result.requiredId,row.date==="2026-05-24"?"SPIRITU":"MARIA");
    contradictions++;
  }
  if(row.date==="2026-02-02"){
    assert.equal(result.status,"MATCH");
    assert.equal(result.requiredId,"NATIVITATE");
  }
  if(["2026-10-11","2026-10-18"].includes(row.date))
    assert.equal(result.status,"UNMAPPED_SOURCE","No date-specific or commemoration-based Preface override");
}
assert.equal(contradictions,3);
const correct=[
 ["tempora:Pasc7-0:1:r","de Spiritu Sancto\nVere dignum"],
 ["sancti:10-07:2:w","de Beata Maria Virgine\nVere dignum"],
 ["sancti:12-08:1:w","de Beata Maria Virgine\nVere dignum"]
];
for(const [principalCelebrationId,lat] of correct)
  assert.equal(inspect1962PrefaceSelection({principalCelebrationId,selectedPreface:{lat}}).status,"MATCH");
assert.equal(inspect1962PrefaceSelection({principalCelebrationId:"sancti:10-07:2:w",selectedPreface:{lat:""}}).status,"MISSING_PREFACE");
assert.equal(inspect1962PrefaceSelection({principalCelebrationId:"sancti:10-07:2:w",selectedPreface:{lat:"Communis"},requestedCelebrationId:"other-votive"}).status,"NEEDS_SELECTED_FORMULARY");
assert.equal(PREFACE_SELECTION_WITNESSES.verifiedOwnerKeys.length,4);
console.log("PASS: detects 3/10 wrong Preface owners in real 2026 runtime; no fabricated substitutions; Purification exception protected.");
