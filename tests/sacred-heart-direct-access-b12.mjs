import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SACRED_HEART_DEVOTIONS_V382} from "../src/pray/traditional-pray-data.js";
import {GOLDEN_ARROW_REPARATION_V1 as golden} from "../src/pray/icksp-golden-arrow-reparation.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";

const litany=SACRED_HEART_DEVOTIONS_V382.litany;
const reparation=canon.prayers.sacred_heart_short_prayer;
const consecration=SACRED_HEART_DEVOTIONS_V382.humanRaceConsecration;
const dedication=canon.prayers.devotion_consecration_christ_king;
for(const [name,item] of Object.entries({litany,reparation,consecration,dedication})){
 for(const lang of ["en","fr","la"])assert.ok(item[lang]?.length>100,"Missing full sourced "+name+" "+lang);
}
assert.equal(golden.la,null,"Golden Arrow: no fabricated Latin");
assert.match(golden.en,/Name of God/);assert.match(golden.fr,/Nom de Dieu/);
assert.match(golden.warningEn,/not the Act of Reparation/);
assert.match(reparation.la,/Iesu dulcissime, cuius/);
assert.match(consecration.la,/Iesu dulcissime, Redemptor humani generis/);
assert.notEqual(reparation.la,consecration.la,"Reparation and human-race consecration are separate rites");
assert.notEqual(dedication.la,consecration.la,"Personal Christ-King dedication is not the consecration of the human race");
assert.equal(golden.witnesses.en.status,"HISTORICAL_ENGLISH");
assert.equal(golden.witnesses.fr.status,"HISTORICAL_FRENCH");
assert.match(litany.sources.frenchLatin,/laportelatine/);
assert.match(consecration.sources.latin,/AAS-19-1927/);
assert.match(reparation.provenance.url,/https:/);
assert.match(dedication.provenance.url,/https:/);
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/pray/traditional-pray-styles.js",import.meta.url),"utf8");
assert.match(runtime,/HEART_STAGES=Object.freeze\(\["litany","reparation","golden_arrow","consecration"\]\)/);
assert.match(runtime,/const choices=sacredHeartDirectChoices\(tab\)/);
assert.match(runtime,/HEART_STAGES.map\(id=>/);
assert.match(runtime,/data-tp381-heart=/);
assert.match(runtime,/data-ao-heart-direct-choices/);
assert.match(runtime,/data-ao-heart-selected-context/);
assert.match(runtime,/data-ao-heart-related-direct/);
assert.match(runtime,/data-tp381-prayer="devotion_consecration_christ_king"/);
assert.match(runtime,/\$\{choices\}\$\{card\}\$\{related\}\$\{options\}/);
assert.match(runtime,/HEART_STAGES.includes\(opts.prayer\) \? opts.prayer : "litany"/);
assert.match(runtime,/open\("pray.sacred_heart",\{trigger:b,prayer:"golden_arrow"\}\)/,
 "The source-owned Golden Arrow shortcut must reach the named prayer");
assert.match(runtime,/const g=GOLDEN_ARROW_REPARATION_V1/);
assert.match(runtime,/prayer=prayerCard\("sacred_heart_short_prayer"/);
assert.match(runtime,/prayer=sourcedPrayerCard\(c,/);
assert.match(runtime,/sourcedPrayerCard\(l,/);
assert.match(runtime,/installSequentialDevotionalReader/);
assert.match(runtime,/kind:"sacredHeart",chapters/);
assert.match(css,/aoHeartChoiceGrid/);
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
console.log("PASS B12: four distinct one-tap Sacred Heart devotions, full source/edition integrity, separate Christ King dedication, targeted Holy Name crosslink.");
