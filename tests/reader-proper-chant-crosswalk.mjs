import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CHRISTMAS_DAY_PROPER_SCORES_1961} from "../src/mass/reader-christmas-proper-scores-1961.js";
import {SCHOLA_SCORE_CATALOGUE,availableNativeScholaScores} from "../src/mass/reader-chant-score-pilot.js";
import {
  PROPER_CHANT_SOURCE_SCHEMA,normalizeChantLatin,
  matchSourceOwnedProperScores,scoreForSourceOwnedProperTrack,
} from "../src/mass/reader-proper-chant-crosswalk.js";

const records=CHRISTMAS_DAY_PROPER_SCORES_1961;
assert.equal(records.length,5);
assert.equal(SCHOLA_SCORE_CATALOGUE.length,17,"Seven Ordinary and ten source-gated Proper references");
const expected={
  INTROIT:"GREGOBASE-72",GRADUAL:"GREGOBASE-1163",
  ALLELUIA_TRACT_SEQUENCE:"GREGOBASE-324",
  OFFERTORY:"GREGOBASE-1274",COMMUNION:"GREGOBASE-1139",
};
assert.deepEqual(Object.fromEntries(records.map(r=>[r.trackId,r.id])),expected);
for(const rec of records){
  assert.ok(rec.gabc.includes("%%"));
  assert.match(rec.sourceUrl,/gregobase\.selapa\.net\/chant\.php\?id=\d+/);
  assert.ok(rec.bookWitnesses.every(x=>/1961/.test(x)));
  assert.equal(rec.status,"SOURCE_MATCH_REQUIRED_NOT_DATE_ASSIGNED");
  assert.equal(availableNativeScholaScores(rec.trackId).length,2);
}
assert.equal(normalizeChantLatin("Púer nátus est nobis"),"puer natus est nobis");
assert.equal(normalizeChantLatin("Caéli terræ"),"caeli terrae");
const mapped={
  schema:"ao-reader-proper-slots-v1",sourcePath:"Sancti/12-25m3",
  slots:Object.fromEntries([
    ["INTROIT", "Puer natus est nobis, et filius datus est nobis."],
    ["GRADUAL","Viderunt omnes fines terrae salutare Dei nostri."],
    ["ALLELUIA_TRACT_SEQUENCE","Allelúia, allelúia. Dies sanctificatus illuxit nobis."],
    ["OFFERTORY","Tui sunt caeli, et tua est terra."],
    ["COMMUNION","Viderunt omnes fines terrae salutare Dei nostri."],
  ].map(([slot,latin])=>[slot,{status:"READY",data:{paragraphs:[{latin}]}}])),
};
const source=matchSourceOwnedProperScores(mapped);
assert.equal(source.schema,PROPER_CHANT_SOURCE_SCHEMA);
assert.equal(source.status,"PARTIALLY_MATCHED");
assert.equal(source.candidates.length,5);
assert.deepEqual(Object.fromEntries(source.candidates.map(c=>[c.trackId,c.scoreId])),expected);
assert.equal(scoreForSourceOwnedProperTrack(source,"COMMUNION")?.id,"GREGOBASE-1139");
assert.equal(scoreForSourceOwnedProperTrack(source,"KYRIE"),null);
assert.equal(source.candidates[0].sourcePath,"Sancti/12-25m3");
assert.equal(source.candidates[0].certainty,"TEXT_MATCH_NOT_LOCAL_CHANT_OBSERVED");
for(const chant of records){
 assert.deepEqual(chant.sourcePathAllowlist,["Sancti/12-25m3"]);
 assert.match(chant.sourcePageScanUrl,/\/sources\/2\/(?:59|60|61)\.png$/);
}
assert.equal(matchSourceOwnedProperScores({...mapped,
 sourcePath:"Tempora/12-25-3"}).candidates.length,0,
 "A synthetic Christmas source path must not claim the real source identity");

assert.equal(matchSourceOwnedProperScores({...mapped,sourcePath:""}).status,"SOURCE_UNREADY");
assert.equal(matchSourceOwnedProperScores({...mapped,schema:"untrusted"}).status,"SOURCE_UNREADY");
assert.equal(matchSourceOwnedProperScores({...mapped,slots:{}}).candidates.length,0);
assert.equal(matchSourceOwnedProperScores({...mapped,slots:{
  ...mapped.slots,INTROIT:{status:"MISSING",data:{paragraphs:[{latin:"Puer natus est nobis"}]}}
}}).candidates.some(x=>x.trackId==="INTROIT"),false);
assert.equal(matchSourceOwnedProperScores({...mapped,slots:{
  ...mapped.slots,INTROIT:{status:"READY",data:{paragraphs:[{latin:"Dominus dixit ad me."}]}}
}}).candidates.some(x=>x.trackId==="INTROIT"),false,
  "A different Christmas Mass must never receive the Christmas Day Introit");
const wrongSlot=matchSourceOwnedProperScores({...mapped,slots:{
  ...mapped.slots,COMMUNION:{status:"READY",data:{paragraphs:[{latin:"Puer natus est nobis"}]}}
}});
assert.equal(wrongSlot.candidates.some(x=>x.trackId==="COMMUNION"),false);
const alleluiaMore=matchSourceOwnedProperScores({...mapped,slots:{
  ...mapped.slots,ALLELUIA_TRACT_SEQUENCE:{status:"READY",data:{paragraphs:[
    {latin:"Alleluia, Alleluia. Dies sanctificatus illuxit nobis"},
    {latin:"Alleluia, Venite ad me omnes"}
  ]}}
}});
assert.equal(alleluiaMore.candidates.some(x=>x.trackId==="ALLELUIA_TRACT_SEQUENCE"),false);
const ambiguous=matchSourceOwnedProperScores(mapped,{catalogue:[
  records[0],{...records[0],id:"GREGOBASE-REPETITION"}
]});
assert.equal(ambiguous.candidates.some(x=>x.trackId==="INTROIT"),false);
const reader=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
const score=readFileSync(new URL("../src/mass/reader-chant-score-pilot.js",import.meta.url),"utf8");
assert.match(native,/properChantSlots:ready\.model\?\.properSlots\?\?null/);
assert.match(reader,/matchSourceOwnedProperScores\(properChantSlots\)/);
assert.match(score,/matchedProper\.get\(track\)===item\.id/);
assert.doesNotMatch(score,/new Audio\(|getUserMedia\(|releaseBenedictus\(/);
console.log("PASS source-matched Proper: five exact chant slots, fail-closed wrong Mass/source/compound");
