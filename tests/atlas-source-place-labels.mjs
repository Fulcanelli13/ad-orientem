import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_GEO,ATLAS_SETTLEMENT_LABELS,atlasSourceSettlementLabel,
 buildBibleAtlas,atlasMapItems} from "../src/find/bible-atlas.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
const records=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(records.entries);
assert.equal(stops.length,151);
const approved=Object.keys(ATLAS_SETTLEMENT_LABELS);
assert.ok(approved.length>=15&&approved.length<=30);
for(const key of approved){
 const geo=Object.values(ATLAS_GEO).find(g=>g.key===key);
 assert.ok(geo,"No new place coordinates or unsupported label: "+key);
 assert.ok(["settlement","city_context"].includes(geo.kind),key);
 assert.ok(geo.url,"Canonical existing geolocation evidence required: "+key);
 assert.ok(atlasSourceSettlementLabel(geo,"en"));
 assert.ok(atlasSourceSettlementLabel(geo,"fr"));
}
assert.equal(atlasSourceSettlementLabel(ATLAS_GEO.transfiguration),null);
assert.equal(atlasSourceSettlementLabel(ATLAS_GEO.gethsemane),null);
assert.equal(atlasSourceSettlementLabel(null),null);
const on=atlasMapItems(stops,10,{cinematic:true,language:"en"});
const off=atlasMapItems(stops,10);
assert.equal(off.length,on.length);
assert.deepEqual(on.map(x=>x.geo),off.map(x=>x.geo));
assert.deepEqual(on.map(x=>x.item_id),off.map(x=>x.item_id));
assert.equal(on.find(x=>x.item_id==="atlas:hebron")?.atlas_label,"Hebron");
assert.equal(off.find(x=>x.item_id==="atlas:hebron")?.atlas_label,undefined);
const fr=atlasMapItems(stops,10,{cinematic:true,language:"fr"});
assert.equal(fr.find(x=>x.item_id==="atlas:hebron")?.atlas_label,"Hébron");
assert.deepEqual(fr.map(x=>x.geo),on.map(x=>x.geo));
for(let index=0;index<stops.length;index++){
 const selected=atlasMapItems(stops,index,{cinematic:true,language:"en"});
 const original=atlasMapItems(stops,index);
 const features=exploreMapFeatures(selected),baseline=exploreMapFeatures(original);
 assert.deepEqual(features.map(x=>x.geometry),baseline.map(x=>x.geometry),
  "Labels must never create or alter coordinates at "+index);
 assert.deepEqual(features.map(x=>x.properties.item_id),baseline.map(x=>x.properties.item_id));
 assert.ok(features.every(x=>x.properties.atlas_label===undefined||approved.includes(
  x.properties.item_id.slice("atlas:".length))),"Only canonical approved labels");
 assert.ok(original.every(x=>x.atlas_label===undefined),
  "Normal Atlas must not acquire editorial labels");
}
const nameChanges=exploreMapFeatures(fr);
assert.equal(nameChanges.find(x=>x.properties.item_id==="atlas:hebron")?.properties.atlas_label,"Hébron");
assert.equal(exploreMapFeatures(off)[0]?.properties.atlas_label,undefined);
assert.ok(ATLAS_GEO.bethlehem.kind==="traditional" &&
 atlasSourceSettlementLabel(ATLAS_GEO.bethlehem)===null,
 "Traditional site precision must never become a certified settlement label");
console.log("PASS settlement-source-only bilingual map labels; no new geometry, unlocated sites, normal Atlas pollution or invented history");
console.log(JSON.stringify({totalSourceStops:151,curatedNames:approved.length,labelledMamre:"Hebron",cinematicOnly:true}));
