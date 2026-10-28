import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {applyExploreDarkCartography,EXPLORE_DARK_CARTOGRAPHY}
 from "../src/find/explore-cartography-style.js";

const ids=Object.keys(EXPLORE_DARK_CARTOGRAPHY);
assert.ok(ids.includes("place_country_major")&&ids.includes("place_city_large")
 &&ids.includes("water_name")&&ids.includes("boundary_country_z0-4"),
 "Map legibility needs country, city, water and frontier hierarchy");
assert.ok(!ids.some(id=>id.startsWith("ao-")||id.includes("cluster")||id.includes("emblem")),
 "Basemap contrast must never rewrite canonical Place markers or institution symbols");
const layers=ids.map(id=>({id,type:EXPLORE_DARK_CARTOGRAPHY[id].type}));
layers.push({id:"ao-explore-points",type:"circle"});
const paint=[],layout=[];
const map={
 getStyle:()=>({layers}),
 setPaintProperty:(...args)=>paint.push(args),
 setLayoutProperty:(...args)=>layout.push(args),
};
const result=applyExploreDarkCartography(map);
assert.equal(result.applied,ids.length);
assert.equal(result.skipped,0);
assert.ok(paint.some(([id,p,v])=>id==="place_country_major"&&p==="text-color"&&v==="#e0cc9f"));
assert.ok(paint.some(([id,p,v])=>id==="water_name"&&p==="text-color"&&v==="#86abb7"));
assert.ok(paint.some(([id,p])=>id==="boundary_country_z0-4"&&p==="line-color"));
assert.ok(layout.some(([id,p])=>id==="place_city"&&p==="text-size"));
assert.ok(paint.every(([id])=>!id.startsWith("ao-")));
assert.ok(layout.every(([id])=>!id.startsWith("ao-")));
assert.deepEqual(applyExploreDarkCartography({getStyle:()=>({layers:[]}),
 setPaintProperty:()=>{},setLayoutProperty:()=>{}}),{applied:0,skipped:ids.length});
assert.deepEqual(applyExploreDarkCartography({}),{applied:0,skipped:0});
assert.deepEqual(applyExploreDarkCartography({getStyle:()=>null,
 setPaintProperty:()=>{},setLayoutProperty:()=>{}}),{applied:0,skipped:0});
const wrong={getStyle:()=>({layers:[{id:"water",type:"symbol"}]}),
 setPaintProperty:()=>{throw Error("must not edit wrong-type layer")},setLayoutProperty:()=>{}};
assert.equal(applyExploreDarkCartography(wrong).applied,0);
const fail={getStyle:()=>({layers:[{id:"water",type:"fill"}]}),
 setPaintProperty:()=>{throw Error("provider revision")},setLayoutProperty:()=>{}};
assert.equal(applyExploreDarkCartography(fail).skipped,ids.length);
const runtime=readFileSync("src/find/map-runtime.js","utf8");
assert.match(runtime,/if\(selectedStyle===DEFAULT_STYLE&&!styleOverride\)\{[\s\S]*applyExploreDarkCartography\(map\)/,
 "The dark palette must be opt-in only for the verified default provider style");
assert.match(runtime,/style:selectedStyle/);
assert.match(runtime,/styleOverride\?\?win\.AO_EXPLORE_MAP_STYLE_URL\?\?win\.AO_DIRECTORY_MAP_STYLE_URL\?\?DEFAULT_STYLE/);
assert.ok(!/setStyle\(|setFilter\(|addSource\(|addLayer\(/.test(
 readFileSync("src/find/explore-cartography-style.js","utf8")),
 "Palette enhancer must not remount maps, change filters, introduce fake Places or add layers");
console.log("PASS Explore cartographic readability: provenance-safe map labels, sea/land boundaries, no Place mutations");
