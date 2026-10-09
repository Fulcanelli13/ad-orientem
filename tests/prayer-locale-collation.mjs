import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRAYER_COMPENDIUM_FRENCH_IDS_V1,PRAYER_FRENCH_COMPARATIVE_IDS_V1, FRENCH_COMPENDIUM_URL_V1,prayerCompendiumFrenchWitness} from "../src/pray/compendium-french-witnesses.v1.js";

const source=JSON.parse(readFileSync("data/pray/prayer-locale-collation-evidence.v1.json","utf8"));
const prior=JSON.parse(readFileSync("data/pray/prayer-reviewed18-edition-variants.v1.json","utf8"));
const expected=prior.items.map(x=>x.id);
assert.equal(source.schema,"AO_PRAYER_LOCALE_COLLATION_EVIDENCE_V1");
assert.equal(source.items.length,18);
assert.deepEqual(source.items.map(x=>x.id),expected);
assert.equal(source.counts.language_cells,54);
assert.equal(source.counts.externally_anchored_cells,50);
assert.equal(source.counts.fully_certified_prayers,0);
assert.equal(source.counts.fully_certified_language_cells,0);
const statuses={};
for(const row of source.items){
 const p=PRAY_CANONICAL_DATA_V435930.prayers[row.id];
 assert.ok(p,"noncanonical Prayer ID "+row.id);
 for(const locale of ["en","fr","la"]){
  const cell=row.statuses[locale];
  assert.ok(cell,"missing locale "+row.id+" "+locale);
  assert.ok(p[locale]?.trim(),"locale has no canonical text "+row.id+" "+locale);
  assert.equal(cell.canonical_text_present,true);
  assert.equal(cell.certified_verbatim,false);
  assert.equal(cell.independent_translation_certified,false);
  assert.ok(cell.grade.length>8,"unclassified "+row.id+" "+locale);
  if(cell.source_url)assert.match(cell.source_url,/^https:\/\//);
  statuses[cell.grade]=(statuses[cell.grade]||0)+1;
 }
 assert.equal(row.release_gate,"EXACT_EDITION_AND_LANGUAGE_REVIEW_PENDING");
}
assert.deepEqual(statuses,source.counts.status_frequency);
assert.equal(PRAYER_COMPENDIUM_FRENCH_IDS_V1.length,16);
assert.equal(new Set(PRAYER_COMPENDIUM_FRENCH_IDS_V1).size,16);
assert.equal(new Set(PRAYER_FRENCH_COMPARATIVE_IDS_V1).size,PRAYER_FRENCH_COMPARATIVE_IDS_V1.length);
for(const id of PRAYER_FRENCH_COMPARATIVE_IDS_V1)assert.ok(PRAYER_COMPENDIUM_FRENCH_IDS_V1.includes(id));
for(const id of PRAYER_COMPENDIUM_FRENCH_IDS_V1){
 assert.ok(expected.includes(id));
 assert.equal(prayerCompendiumFrenchWitness(id)?.url,FRENCH_COMPENDIUM_URL_V1);
}
for(const id of ["foundations_grace_before_meals","foundations_grace_after_meals","mass_confiteor"])assert.equal(prayerCompendiumFrenchWitness(id),null);
assert.equal(source.items.find(x=>x.id==="foundations_act_of_hope").statuses.fr.grade,"PUBLISHED_FRENCH_ANOMALY");
assert.equal(prayerCompendiumFrenchWitness("foundations_act_of_hope").isComparative,false,"printed Acte d'espérance is independently witnessed, not an alternative text");
assert.equal(prayerCompendiumFrenchWitness("foundations_our_father").isComparative,true,"traditional French Lord's Prayer differs from published edition");
assert.equal(source.items.find(x=>x.id==="adoration_anima_christi").statuses.en.grade,"ENGLISH_PROSE_NOT_PRINTED_POEM");
assert.equal(source.items.find(x=>x.id==="foundations_our_father").statuses.fr.grade,"TRADITIONAL_FRENCH_NOT_2005");
assert.equal(source.items.find(x=>x.id==="foundations_eternal_rest").statuses.fr.grade,"FRENCH_TRANSLATION_NOT_2005");
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.match(runtime,/localeWitness=!edition&&isFr\(\)\?prayerCompendiumFrenchWitness\(p\.id\):null/);
assert.match(runtime,/url=localeWitness\?\.url\|\|praySourceURL\(p\)/);
assert.ok(runtime.includes("localeWitness.isComparative?L('Compare the published French edition'"),"source link must distinguish comparison from actual printed text");
assert.match(runtime,/const SOURCE_REGISTRY=/,"original source registry still present");
console.log("PASS Prayer 18x3 edition/locale evidence: 54 cells, French original target, no false full certification");
