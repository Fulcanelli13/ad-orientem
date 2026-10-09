import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {VERIFIED_MASS_SCRIPTURE_READINGS} from "../src/mass/scripture-reading-witness-index.js";
import {VERIFIED_SEGMENTED_MASS_READINGS} from "../src/mass/scripture-segmented-reading-index.js";
import {registeredMassReading,registeredSegmentedMassReading,massScriptureContextForCard} from "../src/mass/scripture-reading-context.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const audit=load("../data/mass/scripture-temporal-sunday-second-witness-audit.v1.json");
assert.equal(audit.schema,"ao-1962-sunday-reading-secondary-witness-v1");
assert.equal(audit.results.length,10);
assert.deepEqual(audit.totals,{sundayProperIdentities:10,readingSlots:20,agreedWithoutCorrection:18,correctedBoundaryErrors:2,unresolvedInBatch:0});
const paths=new Set();
let matches=0,changes=0;
for(const entry of audit.results){
 assert.ok(!paths.has(entry.sourcePath),"Duplicate witness Proper");
 paths.add(entry.sourcePath);
 const sunday=Number(entry.sourcePath.match(/^Tempora\/Pent(\d\d)-0$/)?.[1]);
 assert.ok(sunday>=10&&sunday<=19);
 assert.equal(entry.secondWitnessUrl,"https://1962missal.com/temporale/dom-"+["x","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix"][sunday-10]+"-post-pentecosten/");
 assert.equal(entry.originalLatinUrl,"https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/"+entry.sourcePath+".txt");
 const indexed=VERIFIED_MASS_SCRIPTURE_READINGS.find(x=>x.sourcePath===entry.sourcePath);
 assert.ok(indexed,entry.sourcePath);
 for(const slot of ["EPISTLE_OR_LESSON","GOSPEL"]){
  const expected=entry.publishedReadings[slot];
  const spec=indexed.readings[slot],split=VERIFIED_SEGMENTED_MASS_READINGS.find(x=>x.sourcePath===entry.sourcePath&&x.slot===slot);
  assert.ok(Boolean(spec)!==Boolean(split),"Exactly one owner per slot: "+entry.sourcePath+" "+slot);
  assert.equal((spec??split).reference,expected,"Published citation mismatch "+entry.sourcePath+" "+slot);
  const state=entry.comparisons[slot];
  if(state==="MATCH")matches++;else if(state.startsWith("CORRECTED_"))changes++;else assert.fail("Unreviewed result");
 }
}
assert.equal(matches,18);assert.equal(changes,2);
const ten=VERIFIED_MASS_SCRIPTURE_READINGS.find(x=>x.sourcePath==="Tempora/Pent10-0");
assert.equal(ten.readings.EPISTLE_OR_LESSON.reference,"1 Corinthians 12:2–11");
const tenProper={sourcePath:ten.sourcePath,epistle:{lat:ten.readings.EPISTLE_OR_LESSON.latinIncipit}};
assert.equal(registeredMassReading(tenProper,"EPISTLE_OR_LESSON")?.reference,"1 Corinthians 12:2–11");
const fifteen=VERIFIED_MASS_SCRIPTURE_READINGS.find(x=>x.sourcePath==="Tempora/Pent15-0");
assert.equal(fifteen.readings.EPISTLE_OR_LESSON,undefined,"Split reading must not be accessible as abbreviated single-range citation");
assert.equal(fifteen.sourceHolds.find(x=>x.slot==="EPISTLE_OR_LESSON")?.reason,"DISCONTINUOUS_EPISTLE_IN_SEGMENTED_REGISTER");
const corrected=VERIFIED_SEGMENTED_MASS_READINGS.find(x=>x.sourcePath==="Tempora/Pent15-0"&&x.slot==="EPISTLE_OR_LESSON");
assert.deepEqual(corrected.segments,[{book:"Galatians",chapter:5,verseStart:25,verseEnd:26},{book:"Galatians",chapter:6,verseStart:1,verseEnd:10}]);
const proper={sourcePath:fifteen.sourcePath,epistle:{lat:corrected.latinIncipit}};
assert.equal(registeredMassReading(proper,"EPISTLE_OR_LESSON"),null);
assert.equal(registeredSegmentedMassReading(proper,"EPISTLE_OR_LESSON")?.reference,corrected.reference);
const prep=p=>({session:{resolvedMass:{proper:{sourcePath:p.sourcePath,status:"READY",data:p}}}});
const card={blocks:[{properSlot:"EPISTLE_OR_LESSON"}]};
assert.equal(massScriptureContextForCard(card,prep(proper))?.segments?.length,2);
assert.equal(massScriptureContextForCard(card,prep({...proper,epistle:{...proper.epistle,reference:"Galatians 6:1–10"}}))?.state,"UNRESOLVED_REFERENCE","Stale incomplete explicit first-party citation must veto link");
console.log("PASS 10 published second-witness temporal Sundays, 20 reading boundaries, 18 matches and 2 corrections; Galatians 5:25–26; 6:1–10 stays segmented.");
