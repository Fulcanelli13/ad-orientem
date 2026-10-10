import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateR49Snapshot,projectPreliminaryR49,filterPreliminaryR49} from "../src/find/preliminary-directory-r49.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const raw=read("../data/directory/preliminary-map-r49.v1.json");
const alias=read("../data/directory/research/staging/map-first-r37/R52-named-worship-source-aliases.json");
assert.doesNotThrow(()=>validateR49Snapshot(raw));
const items=projectPreliminaryR49(raw);
const byPin=new Map(items.map(x=>[x.source_id,x]));
assert.equal(items.length,1876);
assert.equal(filterPreliminaryR49(items,{directoryGroup:"ROME"}).length,1019);
assert.equal(filterPreliminaryR49(items,{directoryGroup:"SSPX"}).length,732);
assert.equal(alias.schema,"AO_R52_NAMED_WORSHIP_SOURCE_ALIASES");
assert.equal(alias.records.length,6);
assert.equal(alias.new_pins,0);
assert.equal(new Set(alias.records.map(x=>x.source_id)).size,6);
let count=0;
for(const pair of alias.records){
 const pin=byPin.get(pair.pin_id);
 assert.ok(pin,"Missing linked physical site: "+pair.pin_id);
 assert.equal(pin.preliminary_group,"ROME","Must not classify SSPX/unknown as Rome");
 assert.ok(pair.status==="provisional_identity_crosswalk_not_new_pin");
 assert.match(pair.source_url,/^https?:\/\//);
 if(pin.source_links.some(x=>x.url===pair.source_url))count++;
}
assert.ok(count>=alias.additional_site_links,"Original source hyperlinks did not survive");
assert.ok(items.every(item=>item.sections.length===0),"No unverified Mass timetables are publishable");
console.log("PASS R52: six physical-site aliases, category separation, no fake pins or timetable");
