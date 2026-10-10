import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAYER_LIBRARY_GUIDE_CATEGORIES,libraryGuideForPrayer} from "../src/pray/library-context.js";

const data=PRAY_CANONICAL_DATA_V435930;
const prayers=Object.values(data.prayers);
assert.equal(prayers.length,48,"Unexpected change in canonical Prayer Library count");
assert.deepEqual([...PRAYER_LIBRARY_GUIDE_CATEGORIES].sort(),Object.keys(data.categories).sort(),
 "A Prayer Library category has no dedicated contextual Guide");
assert.equal(new Set(prayers.map(p=>p.id)).size,48);

for(const p of prayers){
 const en=libraryGuideForPrayer(p),fr=libraryGuideForPrayer(p,{french:true});
 assert.ok(en&&fr,p.id+" has no guide in both languages");
 assert.equal(en.id,p.id);
 assert.equal(en.category,p.category);
 assert.equal(fr.category,p.category);
 for(const x of [en.context,en.practice,fr.context,fr.practice]){
  assert.ok(typeof x==="string"&&x.length>50,p.id+" Guide is blank/placeholder");
  assert.ok(!/source-locked|Ad Orientem|TODO|to be written/i.test(x),p.id+" has editorial placeholder copy");
 }
 assert.notEqual(en.context,fr.context,p.id+" French guide was not localized");
 assert.equal(en.witness,fr.witness,p.id+" Guide changes its source attribution with UI language");
 assert.equal(p.en,PRAY_CANONICAL_DATA_V435930.prayers[p.id].en,p.id+" canonical prayer was mutated");
}
for(const id of ["litany_loreto_1962","litany_loreto_current"]){
 assert.ok(libraryGuideForPrayer(data.prayers[id]).versionNote,id+" lacks edition boundary");
 assert.ok(libraryGuideForPrayer(data.prayers[id],{french:true}).versionNote,id+" lacks French edition boundary");
}
assert.equal(libraryGuideForPrayer({id:"unknown",category:"unreviewed"}),null,
 "Unreviewed prayer categories must fail closed, not invent guidance");

const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
for(const anchor of [
 'libraryOverviewGuide()',
 'function libraryContextMarkup(p)',
 'libraryContextMarkup(p)',
 'libraryGuideForPrayer(p,{french:isFr()})',
 'devotionalGuide(\'penitential\')',
 'devotionalGuide(\'litany\')',
 'devotionalGuide(\'sevenWords\')',
 'prayerBlock(LIB.open,{scriptureContext:true})',
 'prayerBlock(id,{scriptureContext:true})',
 'sourceLine(p)',
 'litanySourceDisclosure()'
])assert.ok(runtime.includes(anchor),"Prayer runtime lost Guide/source anchor "+anchor);
for(const phrase of [
 "This is the Litany proper extracted from a historical transcription",
 "No unverified French translation of those meditations is supplied",
 "The historical order and the verses shown here have separate sources"
])assert.ok(runtime.includes(phrase),"Guide lost source/edition boundary: "+phrase);
for(const id of ["holyName","heart","communion","goodDeath"]){
 const traditional=readFileSync("src/pray/traditional-pray-runtime.js","utf8");
 assert.ok(traditional.includes('traditionalContextGuide("'+id+'")'),"Missing traditional context Guide "+id);
}
console.log("PASS contextual Prayer Guides: 48/48 library records, nine categories, EN/FR, edition boundaries and five guided devotion surfaces");
