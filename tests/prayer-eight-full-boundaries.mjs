import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAY_COLLATION_NOTICES_V1} from "../src/pray/source-collation-notices.v1.js";
const register=JSON.parse(readFileSync("data/pray/prayer-eight-full-boundaries.v1.json","utf8"));
const historical=JSON.parse(readFileSync("data/pray/prayer-reviewed18-edition-variants.v1.json","utf8"));
const owner=JSON.parse(readFileSync("data/pray/prayer-source-certification-inventory.v3.json","utf8"));
const reviewed=new Set(historical.items.map(x=>x.id));
assert.equal(register.schema,"AO_PRAYER_EIGHT_FULL_SOURCE_BOUNDARIES_V1");
assert.equal(register.counts.prayers,8);
assert.equal(register.counts.language_cells,24);
assert.equal(register.items.length,8);
assert.equal(new Set(register.items.map(x=>x.id)).size,8);
assert.equal(register.counts.completely_verbatim_certified,0);
assert.equal(Object.keys(PRAY_COLLATION_NOTICES_V1).length,12);
let langCount=0;
for(const row of register.items){
 assert.ok(reviewed.has(row.id),"not in canonical 18-record review "+row.id);
 const prayer=PRAY_CANONICAL_DATA_V435930.prayers[row.id];
 assert.ok(prayer,"canonical prayer missing "+row.id);
 const proof=owner.prayers.find(x=>x.id===row.id);
 assert.ok(proof,"source inventory owner missing "+row.id);
 assert.equal(row.normalized_app_text_unchanged,true);
 assert.equal(row.editorial_release_gate,"HOLD_FOR_ORIGINAL_EDITION_LANGUAGE_RIGHTS_AND_INDEPENDENT_SIGNOFF");
 for(const language of ["en","fr","la"]){
  const entry=row.languages[language];langCount++;
  assert.ok(prayer[language]?.trim(),"empty prayer text "+row.id+"/"+language);
  assert.ok(entry.outcome.length>12,"missing classification "+row.id+"/"+language);
  assert.ok(entry.observed_difference.length>70,"missing original source observation "+row.id+"/"+language);
  assert.equal(entry.body_nonempty,true);
  assert.equal(entry.entire_text_structurally_reviewed,true);
  assert.equal(entry.edition_exact_verbatim_certified,false);
  assert.match(entry.original_or_comparator_url,/^https:\/\//);
 }
}
assert.equal(langCount,24);
for(const id of ["weekday_magnificat","weekday_benedictus"]){
 const row=register.items.find(x=>x.id===id);
 assert.equal(row.requires_1962_office_review,true);
 const prayer=PRAY_CANONICAL_DATA_V435930.prayers[id];
 assert.match(prayer.en,/Glory to the Father/);
 assert.doesNotMatch(prayer.fr,/Gloire au Père/);
 assert.doesNotMatch(prayer.la,/Gloria Patri/);
 assert.ok(PRAY_COLLATION_NOTICES_V1[id]?.notice.en.includes("doxology"),"new canticle source warning missing");
}
assert.match(PRAY_COLLATION_NOTICES_V1.foundations_grace_after_meals.notice.en,/shortened composite/);
assert.match(PRAY_COLLATION_NOTICES_V1.marian_hail_holy_queen.notice.en,/appends Pray for us/);
assert.match(PRAY_COLLATION_NOTICES_V1.foundations_apostles_creed.notice.en,/Ainsi soit-il/);
assert.equal(PRAY_CANONICAL_DATA_V435930.prayers.marian_memorare.la.includes("Mater Verbi incarnati"),false);
assert.match(PRAY_CANONICAL_DATA_V435930.prayers.marian_memorare.la,/Mater Verbi,/);
console.log("PASS 8 long Prayer source boundaries, 24 locale original/comparator observations, 12 source notes, 0 false certification");
