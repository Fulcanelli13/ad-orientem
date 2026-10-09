import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {VERIFIED_MASS_SCRIPTURE_READINGS} from "../src/mass/scripture-reading-witness-index.js";
import {VERIFIED_SEGMENTED_MASS_READINGS} from "../src/mass/scripture-segmented-reading-index.js";
import {registeredMassReading,registeredSegmentedMassReading,massScriptureContextForCard} from "../src/mass/scripture-reading-context.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const audit=load("../data/mass/scripture-other-season-sunday-second-witness-audit.v1.json");
assert.equal(audit.schema,"ao-1962-other-temporal-sunday-second-published-witness-v1");
assert.equal(audit.results.length,23);
assert.deepEqual(audit.totals,{conditionalSourcePaths:23,scriptureSlots:46,singleRangeSlots:43,segmentedSlots:3,matchedCitationBoundaries:46,sourceCorrectionsProposed:0,unresolvedBoundariesInBatch:0});
const paths=new Set();
let singles=0,split=0;
const coords=s=>String(s).replace(/[–—]/g,"-").match(/\d+:\d+(?:-\d+)?(?:;\s*\d+:\d+(?:-\d+)?)*/)?.[0]?.replace(/\s+/g,"");
for(const row of audit.results){
 assert.equal(row.citationCheck,"MATCHED_ORIGINAL_LATIN_AND_SEPARATELY_PUBLISHED_DIGITAL_WITNESS");
 assert.ok(!paths.has(row.sourcePath),"Duplicate Other Season Sunday owner "+row.sourcePath);
 paths.add(row.sourcePath);
 assert.equal(row.sourceWitnessUrl,"https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/"+row.sourcePath+".txt");
 assert.ok(/^https:\/\/(?:1962missal\.com|mylatinmass\.com)\//.test(row.secondaryPublishedWitnessUrl));
 const indexed=VERIFIED_MASS_SCRIPTURE_READINGS.find(x=>x.sourcePath===row.sourcePath);
 assert.ok(indexed,row.sourcePath+" not in canonical register");
 for(const slot of ["EPISTLE_OR_LESSON","GOSPEL"]){
  const spec=indexed.readings[slot];
  const segmented=VERIFIED_SEGMENTED_MASS_READINGS.find(x=>x.sourcePath===row.sourcePath&&x.slot===slot);
  assert.ok(Boolean(spec)!==Boolean(segmented),"Exactly one owner for "+row.sourcePath+" "+slot);
  const r=row.readings[slot],actual=spec??segmented;
  assert.equal(actual.reference,r.reference);
  assert.equal(coords(actual.reference),coords(r.originalLatinSourceCitation),"Latin reference boundaries differ");
  assert.equal(row.sourceSectionOwners[slot],spec?.sourceOwner??row.sourcePath);
  if(segmented){
   split++;
   assert.equal(r.shape,"SEGMENTED");
   assert.equal(segmented.segments.length,2);
   assert.equal(indexed.sourceHolds.some(x=>x.slot===slot),true);
  }else{singles++;assert.equal(r.shape,"SINGLE_RANGE");}
  const field=slot==="GOSPEL"?"gospel":"epistle";
  const proper={sourcePath:row.sourcePath,[field]:{lat:actual.latinIncipit}};
  const matched=segmented?registeredSegmentedMassReading(proper,slot):registeredMassReading(proper,slot);
  assert.equal(matched?.reference,actual.reference);
  assert.equal((segmented?registeredSegmentedMassReading:registeredMassReading)({...proper,[field]:{lat:"Completely different source Latin"}},slot),null);
 }
}
assert.equal(singles,43);assert.equal(split,3);
const advent=audit.results.find(x=>x.sourcePath==="Tempora/Adv4-0");
assert.equal(advent.sourceSectionOwners.GOSPEL,"Tempora/Adv3-6");
const epiphany=audit.results.find(x=>x.sourcePath==="Tempora/Epi5-0");
assert.equal(epiphany.sourceSectionOwners.EPISTLE_OR_LESSON,"Tempora/Epi1-0");
const sept=audit.results.find(x=>x.sourcePath==="Tempora/Quadp1-0");
assert.ok(sept.secondaryPublishedWitnessUrl.includes("mylatinmass.com"));
assert.equal(sept.readings.EPISTLE_OR_LESSON.reference,"1Corinthians 9:24–27; 10:1–5");
const afterAsc=audit.results.find(x=>x.sourcePath==="Tempora/Pasc6-0");
assert.equal(afterAsc.readings.GOSPEL.reference,"John 15:26–27; 16:1–4");
for(const path of ["Tempora/Adv1-0","Tempora/Quadp1-0","Tempora/Nat1-0","Tempora/Nat2-0","Tempora/Epi1-0"]){
 assert.ok(audit.results.find(x=>x.sourcePath===path).editorialNotices.length>0);
}
console.log("PASS 23 other-season Sunday Proper identities / 46 citation boundaries; 43 single-range and 3 segmented, inheritance and external source defects documented");
