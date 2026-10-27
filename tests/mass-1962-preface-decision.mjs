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
assert.equal(PREFACE_SELECTION_WITNESSES.verifiedSeasonalPatterns.length,2);
for(const [id,required,good] of [
 ["tempora:Quad1-1:3:v","QUADRAGESIMA","de Quadragesima"],
 ["tempora:Quad4-6:3:v","QUADRAGESIMA","de Quadragesima"],
 ["tempora:Pasc6-6:1:r","SPIRITU","de Spiritu Sancto"],
 ["tempora:Pasc7-5:1:r","SPIRITU","de Spiritu Sancto"]
]){
 const wrong=inspect1962PrefaceSelection({principalCelebrationId:id,selectedPreface:{lat:"Communis"}});
 assert.equal(wrong.status,"CONTRADICTION",id);
 assert.equal(wrong.requiredId,required,id);
 const proper={mainId:id,preface:{lat:"Communis",en:"Common",fr:"Commune"}};
 const withheld=properToReaderSlots(proper,{language:"fr"});
 assert.equal(withheld.slots.PREFACE.status,"MISSING",id);
 assert.equal(withheld.slots.PREFACE.reason,"1962 Preface source decision: CONTRADICTION",id);
 const certified=inspect1962PrefaceSelection({principalCelebrationId:id,selectedPreface:{lat:good+"\\nVere dignum"}});
 assert.equal(certified.status,"MATCH",id);
 const restored=properToReaderSlots({...proper,preface:{lat:good+"\\nVere dignum",en:"Liturgical Preface",fr:"Préface liturgique"}},{language:"fr"});
 assert.equal(restored.slots.PREFACE.status,"READY",id);
}
assert.equal(inspect1962PrefaceSelection({principalCelebrationId:"sancti:03-19:1:w",
 selectedPreface:{lat:"Communis"}}).status,"UNMAPPED_SOURCE");
assert.equal(inspect1962PrefaceSelection({principalCelebrationId:"tempora:Quad2-1:3:v",
 selectedPreface:{lat:"Communis"},requestedCelebrationId:"votive"}).status,"NEEDS_SELECTED_FORMULARY");

console.log("PASS: detects 3/10 wrong Preface owners in real 2026 runtime; no fabricated substitutions; Purification exception protected.");

// Reader projection must fail closed on an authenticated contradictory owner.
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
const fakeText={lat:"Communis\\nVere dignum",en:"Common Preface",fr:"Préface commune"};
const wrong={mainId:"tempora:Pasc7-0:1:r",preface:fakeText};
const blocked=properToReaderSlots(wrong);
assert.equal(blocked.slots.PREFACE.status,"MISSING");
assert.equal(blocked.slots.PREFACE.reason,"1962 Preface source decision: CONTRADICTION");
const correctReader=properToReaderSlots({...wrong,preface:{...fakeText,lat:"de Spiritu Sancto\\nVere dignum"}});
assert.equal(correctReader.slots.PREFACE.status,"READY");
const protectedPurification=properToReaderSlots({...wrong,mainId:"sancti:02-02:2:w",preface:{...fakeText,lat:"de Nativitate Domini\\nVere dignum"}});
assert.equal(protectedPurification.slots.PREFACE.status,"READY");
const unknown=properToReaderSlots({...wrong,mainId:"tempora:Pasc8-0:2:w"});
assert.equal(unknown.slots.PREFACE.status,"READY","Unknown source should not be silently reclassified");
