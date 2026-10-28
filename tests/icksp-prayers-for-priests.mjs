import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ICKSP_PRIEST_PRAYERS_V1} from "../src/pray/icksp-prayers-for-priests.v1.js";

const {eternalPriest:prayer,sacredHeartHighPriest:held}=ICKSP_PRIEST_PRAYERS_V1;
assert.equal(prayer.id,"icksp_priest_eternal_priest");
assert.ok(Object.isFrozen(prayer));
assert.match(prayer.en,/O Jesus, Eternal Priest/);
assert.match(prayer.en,/Keep unstained their anointed hands/);
assert.match(prayer.en,/everlasting crown hereafter\. Amen\./);
assert.equal(prayer.languageStatus,"HISTORICAL_ENGLISH_ONLY_FRENCH_UNVERIFIED");
assert.equal(prayer.fr,undefined,"Never substitute an invented French translation");
assert.equal(prayer.la,undefined,"Never invent Latin");
assert.equal(held.status,"SOURCE_TEXT_CORRUPTED_RELEASE_HELD");
assert.equal(held.en,undefined,"Corrupted secondary prayer may not be rendered");
assert.match(prayer.note.en,/not attributed to St Thérèse/);
assert.match(prayer.editions.institute.url,/institute-christ-king\.org/);
assert.match(prayer.editions.historicalLead.status,/UNCOLLATED/);

const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
const hub=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const lazy=readFileSync(new URL("../src/pray/lazy-module-registry.js",import.meta.url),"utf8");
assert.match(runtime,/"pray\.prayers_for_priests":Object\.freeze/);
assert.match(runtime,/function renderPrayersForPriests\(\)/);
assert.match(runtime,/S\.route==="pray\.prayers_for_priests"\?renderPrayersForPriests\(\)/);
assert.match(runtime,/The verified source text is English/);
assert.match(hub,/\['external','pray\.prayers_for_priests'/);
for(const route of ["pray.marian_protection","pray.prayers_for_priests"]){
 assert.ok(lazy.includes('["'+route+'",'),"First-use lazy registry missing "+route);
}
console.log("ICKSP priest prayers: source, text hold, route and lazy navigation PASS");
