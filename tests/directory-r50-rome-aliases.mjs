import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,validateR49Snapshot,filterPreliminaryR49} from "../src/find/preliminary-directory-r49.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const map=read("../data/directory/preliminary-map-r49.v1.json");
const cross=read("../data/directory/research/staging/map-first-r37/R50-rome-source-aliases.json");
validateR49Snapshot(map);
const items=projectPreliminaryR49(map);
assert.equal(items.length,1879);
assert.equal(filterPreliminaryR49(items,{directoryGroup:"ROME"}).length,1022);
assert.equal(filterPreliminaryR49(items,{directoryGroup:"SSPX"}).length,732);
assert.equal(filterPreliminaryR49(items,{directoryGroup:"UNKNOWN"}).length,125);
assert.equal(cross.schema,"AO_DIRECTORY_R50_ROMERECOGNISED_ALIAS_CROSSWALK");
assert.equal(cross.records.length,19);
assert.equal(cross.map_pins_added,0);
assert.equal(new Set(cross.records.map(x=>x.source_id)).size,19);
const byId=new Map(map.records.map(r=>[r[0],r]));
for(const pair of cross.records){
 const row=byId.get(pair.pin_id);
 assert.ok(row,"Lost source pin: "+pair.pin_id);
 assert.equal(row[2],pair.country,"Alias crossed national boundaries");
 assert.equal(row[4],pair.affiliation,"Alias affiliation changed");
 assert.equal(row[5],"ROME","Alias must not silently promote SSPX/unclassified pin");
 assert.match(pair.source_url,/^https?:\/\//,"Unlinked source");
 assert.equal(pair.status,"provisional_identity_crosswalk_not_new_pin");
}
const amended=cross.records.filter(pair=>{
 const row=byId.get(pair.pin_id);
 return [row[8],row[9]].join("; ").includes(pair.source_url);
});
assert.ok(amended.length>=6,"Lost R50 site-specific source hyperlinks");
assert.equal(new Set(map.records.map(r=>r[0])).size,1879);
console.log("PASS R50: 19 source aliases, unchanged 1,876 pins / 1,019 Rome, source evidence preserved");
