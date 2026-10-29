import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {internalPrayerView,supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {OCCASIONAL_INTERCESSIONS_B20,OCCASIONAL_PURPOSES_B20,OCCASIONAL_CANONICAL_REUSE_B20,OCCASIONAL_HOLDS_B20,occasionalIntercessionFor} from "../src/pray/occasional-intercessions-b20.js";

const historic=OCCASIONAL_INTERCESSIONS_B20;
assert.deepEqual(OCCASIONAL_PURPOSES_B20,["sick","family","difficulties"]);
assert.equal(historic.length,2);
assert.equal(new Set(historic.map(x=>x.id)).size,2);
assert.deepEqual(historic.map(x=>x.purpose),["sick","family"]);
assert.ok(historic.every(x=>x.sourceLinks.length>0&&x.sourceLinks.every(url=>url.startsWith("https://"))));
assert.ok(historic.every(x=>x.sourceStatus.includes("PRINT_IMAGE_UNCOLLATED")));
assert.ok(historic.every(x=>x.en.length>180&&!x.fr&&!x.la));
assert.match(historic[0].en,/N\.N\./);
assert.match(historic[0].en,/Our Father, Hail Mary, Glory be to the Father/);
assert.match(historic[1].en,/O most loving Jesus/);
const canonical=PRAY_CANONICAL_DATA_V435930.prayers?.devotion_ad_te_beate_ioseph;
assert.ok(canonical&&canonical.en&&canonical.la&&canonical.fr,"Canonical St Joseph prayer must exist in three languages");
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48,"Original 48 canonical prayers preserved");
assert.equal(OCCASIONAL_CANONICAL_REUSE_B20.difficulties,canonical.id);
for(const purpose of OCCASIONAL_PURPOSES_B20){
 const en=occasionalIntercessionFor(purpose,"en",false,canonical);
 const fr=occasionalIntercessionFor(purpose,"fr",false,canonical);
 assert.ok(en&&fr);
 assert.equal(en.purpose,purpose);
 if(purpose==="difficulties"){
  assert.equal(en.id,canonical.id);
  assert.equal(en.canonical,true);
  assert.equal(en.text,canonical.en);
  assert.equal(fr.text,canonical.fr);
  assert.equal(fr.language,"fr");
  assert.equal(occasionalIntercessionFor(purpose,"en",true,canonical).text,canonical.la);
  assert.equal(occasionalIntercessionFor(purpose,"fr",true,canonical).language,"la");
  assert.equal(occasionalIntercessionFor(purpose,"en",false,{}),null);
 }else{
  assert.equal(en.canonical,false);
  assert.equal(fr.language,"en");
  assert.equal(fr.labelOriginal,true);
  assert.equal(fr.text,en.text,"Do not invent or apply French translations");
  assert.equal(occasionalIntercessionFor(purpose,"fr",true,canonical).language,"en");
 }
}
assert.equal(occasionalIntercessionFor("unknown","en",false,canonical),null);
assert.equal(occasionalIntercessionFor("sick","de",false,canonical),null);
assert.equal(internalPrayerView("pray.occasional_intercessions"),"occasionals");
assert.equal(supportedDirectPrayerRoute("pray.occasional_intercessions"),true);
assert.equal(internalPrayerView("pray.for_priests"),"priests","Existing B19 must remain intact");
assert.ok(OCCASIONAL_HOLDS_B20.length>=3);
const UI=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/pray/occasional-intercessions-styles.js",import.meta.url),"utf8");
for(const part of [
 "function renderOccasionalIntercessions(){",
 "data-ao-occasional-intercession",
 "data-p435930-occasional-purpose",
 "data-p435930-occasional-latin",
 "occasionalIntercessionFor",
 "OCCASIONAL_PURPOSES_B20",
 
 "'pray.occasional_intercessions':{id:'pray.occasional_intercessions'",
 "else if(view==='occasionals')html=renderOccasionalIntercessions()"
]) assert.ok(UI.includes(part),"Missing actual B20 UI contract: "+part);
assert.ok(UI.includes("['own','pray.occasional_intercessions'"),
 "Source-owned contextual Prayer card route must be declared exactly: pray.occasional_intercessions");
assert.ok(UI.includes("related.map(item=>prayFamilyItem(item,true))"),
 "Contextual Prayer route must use shared illustrated module card without a duplicate owner");
assert.ok(css.includes("min-height:48px"));
assert.ok(css.includes("max-width:360px"));
const register=JSON.parse(readFileSync(new URL("../data/pray/prayer-corpus-admissions-b20.v1.json",import.meta.url),"utf8"));
assert.equal(register.newDistinctPublishedWorkCount,2);
assert.equal(register.reusedExistingWorkCount,1);
assert.equal(register.baselineCanonicalPrayerCount,48);
assert.equal(register.policy.noInventedTranslations,true);
console.log("B20 occasional intercessions: 2 sourced EN works, canonical 3-language St Joseph reuse, 3 routes, original 48 prayer bank, French fail-closed, styles and source gates PASS");
