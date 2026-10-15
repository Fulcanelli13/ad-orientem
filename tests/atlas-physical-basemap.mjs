import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_PHYSICAL_STYLE,ATLAS_PHYSICAL_SOURCES} from "../src/find/atlas-physical-style.js";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const source=read("data/explore/bible-places-compact.v1.json");
const stops=buildBibleAtlas(source.entries);
assert.equal(stops.length,151);
assert.equal(stops[0].title_en,"Creation");
const kinds=[["land",1420,"Polygon"],["lakes",7,"Polygon"],["rivers",17,"LineString"]];
let total=0;
for(const [name,minimum,geometry] of kinds){
 const file=ATLAS_PHYSICAL_SOURCES[name];
 assert.match(file,new RegExp("/data/explore/atlas-physical-"+name+"-50m.geojson$"));
 const json=JSON.parse(readFileSync(new URL(file),"utf8"));
 assert.equal(json.type,"FeatureCollection",name);
 assert.ok(json.features.length>=minimum,name+" changed without new provenance review");
 assert.ok(json.features.every(f=>["Polygon","MultiPolygon","LineString","MultiLineString"].includes(f.geometry?.type)),name);
 const bytes=JSON.stringify(json).length;total+=bytes;
 assert.ok(json.features.every(f=>f.properties&&Object.keys(f.properties).length===0),
   "Do not silently import physical names as geopolitical or era data");
}
assert.ok(total<1_500_000,"Physical source download budget exceeded");
assert.equal(ATLAS_PHYSICAL_STYLE.version,8);
assert.deepEqual(Object.keys(ATLAS_PHYSICAL_STYLE.sources).sort(),
 ["ao-physical-lakes","ao-physical-land","ao-physical-rivers"].sort());
assert.ok(ATLAS_PHYSICAL_STYLE.layers.some(l=>l.type==="background"));
assert.ok(ATLAS_PHYSICAL_STYLE.layers.some(l=>l.type==="fill"));
assert.ok(ATLAS_PHYSICAL_STYLE.layers.some(l=>l.type==="line"));
assert.ok(ATLAS_PHYSICAL_STYLE.layers.every(l=>l.type!=="symbol"),
 "No modern city/country/admin label layers may enter the physical style");
assert.ok(ATLAS_PHYSICAL_STYLE.layers.every(l=>!/country|boundary|administrative|road/i.test(l.id)),
 "Physical review cannot secretly reproduce administrative/road boundaries");
assert.ok(ATLAS_PHYSICAL_STYLE.layers.every(l=>!l.source||ATLAS_PHYSICAL_STYLE.sources[l.source]));
assert.ok(Object.values(ATLAS_PHYSICAL_STYLE.sources).every(s=>s.type==="geojson"&&
 s.data.startsWith("file:")||s.data.startsWith("https:")),
 "Physical sources must be resolvable local URLs");
const owner=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
const map=readFileSync(new URL("../src/find/map-runtime.js",import.meta.url),"utf8");
assert.match(owner,/styleOverride:bibleCinemaPreview\?ATLAS_PHYSICAL_STYLE:null/,
 "Physical style must be review-flag-only");
assert.match(map,/style:styleOverride\?\?win\.AO_EXPLORE_MAP_STYLE_URL/,
 "Never change existing directory and default map style ownership");
assert.ok(stops.some(s=>s.geo?.key==="jerusalem"));
assert.ok(stops.some(s=>!s.geo),"Do not add inferred geographic pins");
console.log("PASS public-domain physical GeoJSON review; 151 source events untouched, zero political labels, normal maps isolated");
console.log(JSON.stringify({physicalFeatures:1420+7+17,bytes:total,display:"MODERN_PHYSICAL_GEOGRAPHY_NOT_PERIOD_RECONSTRUCTION"}));
