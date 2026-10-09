import assert from "node:assert/strict";
import {parseDistrictIndex,parseDistrictPlaces} from "../tools/directory/acquire-sspx-worldwide-index.mjs";
const host="https://map.fsspx.org";
const index=parseDistrictIndex([
 {href:host+"/fr/districts/africa",text:"District Afrique 32"},
 {href:host+"/fr/districts/france",text:"District France 235"},
 {href:host+"/fr/districts/asia",text:"District Asia 53"},
 {href:host+"/fr/districts/africa",text:"District Afrique 32"},
 {href:host+"/fr/districts/",text:"Index 24"},
 {href:"https://other.site/fr/districts/wrong",text:"Wrong 30"},
],{minimumDistricts:3});
assert.equal(index.length,3);
assert.deepEqual(index.map(x=>x.expected_source_entities),[32,53,235]);
assert.throws(()=>parseDistrictIndex([],{}),/incomplete/);
const africa=index.find(x=>x.district_slug==="africa");
const cards=Array.from({length:25},(_,i)=>({
 href:host+"/fr/places/chapelle-test-"+i,
 text:i===0?"Saint Joseph Chapel · Sunday Weekdays":"Saint Test "+i+" · Commune",
}));
cards.push({href:"https://untrusted.example/fr/places/fake",text:"Sunday"});
cards.push(cards[0]);
const parsed=parseDistrictPlaces(africa,cards);
assert.equal(parsed.discovered,25);
assert.equal(parsed.records.filter(x=>x.sunday_badge_claim).length,1);
assert.equal(parsed.records[0].source_url,host+"/fr/places/chapelle-test-0");
assert.equal(parsed.records[0].source_place_id,"chapelle-test-0");
assert.equal(parsed.records[0].weekday_badge_claim,true);
assert.throws(()=>parseDistrictPlaces(africa,cards.slice(0,4)),/incomplete/);
assert.equal(parsed.expected,32);
console.log("SSPX worldwide district source index tests: PASS");
