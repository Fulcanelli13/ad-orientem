import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 buildBibleAtlas,atlasMapItems,atlasIndexForPin,atlasDetail,atlasEraOverlay,renderBibleAtlasToString,ATLAS_GEO
} from "../src/find/bible-atlas.js";

const data=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(data.entries);
assert.equal(stops.length,48,"editorial milestone count");
assert.equal(new Set(stops.map(s=>s.era)).size,11,"distinct chronological era chapters");
assert.deepEqual(stops.map(s=>s.index),stops.map((_,i)=>i),"milestone IDs remain ordered");
assert.equal(stops[0].title_en,"Creation");
assert.equal(stops[0].reference,"Genesis 1:1–2:3");
assert.equal(stops.at(-1).era,"REVELATION");
assert.equal(stops.at(-1).geo,null,"Apocalyptic visions are not map-pointed");
assert.equal(stops.find(s=>s.placeId==="sinai").geo,null,"disputed modern Sinai not pinned");
assert.equal(stops.find(s=>s.placeId==="jordan-baptism").geo,null,"competing riverbank sites not pinned");
assert.equal(stops.find(s=>s.placeId==="cana").geo,null,"traditional identification not asserted as proven");
assert.equal(stops.find(s=>s.placeId==="ur").geo,null,"unreviewed atlas geo remains held");
for(const stop of stops){
 assert.ok(stop.title_en&&stop.title_fr&&stop.reference,"each milestone bilingual and verse-linked");
 if(stop.geo){
  assert.ok(Number.isFinite(stop.geo.lat)&&Number.isFinite(stop.geo.lng)&&stop.geo.url.startsWith("https://"));
  assert.ok(Object.values(ATLAS_GEO).includes(stop.geo),"only curated, attributed map points");
 }
}
const heb=stops.find(s=>s.placeId==="hebron");
const jer=stops.find(s=>s.placeId==="jerusalem-temple");
const cap=stops.find(s=>s.placeId==="capernaum");
const rome=stops.find(s=>s.placeId==="rome");
assert.equal(atlasMapItems(stops,0).length,0,"no invented Creation coordinate");
assert.equal(atlasMapItems(stops,heb.index).length,1,"Hebron appears with Abraham milestone");
assert.equal(atlasMapItems(stops,jer.index).length,3,"three unique Nativity phase sites, including current");
assert.equal(atlasMapItems(stops,cap.index).length,1,"public ministry resets pins to current era");
assert.equal(atlasMapItems(stops,rome.index).length,4,"apostolic milestones reveal four distinct sites");
assert.equal(atlasIndexForPin(stops,rome.index,"atlas:corinth"),stops.find(s=>s.placeId==="corinth").index);
assert.match(atlasDetail(jer,"en"),/City-level reference/);
assert.match(atlasDetail(stops.find(s=>s.placeId==="sinai"),"fr"),/repère/);
assert.match(atlasDetail(rome,"en"),/data-ao-scripture-context="Acts 28:16–31"/);
assert.match(atlasEraOverlay("EXODUS","fr"),/L'Exode/);
const en=renderBibleAtlasToString({language:"en",atlasStops:stops,atlasIndex:0});
const fr=renderBibleAtlasToString({language:"fr",atlasStops:stops,atlasIndex:15});
assert.match(en,/data-bible-track/);
assert.match(en,/data-bible-map/);
assert.match(en,/data-bible-era-overlay/);
assert.match(en,/data-bible-step="47"/);
assert.match(fr,/Atlas biblique/);
assert.match(fr,/Lire le passage/);
assert.ok(!en.includes("maps.google.com"),"event scripture remains native, not outbound");
console.log("PASS Biblical Atlas: 48 milestones, 11 eras, curated pin lifecycle, bilingual native reader and cinematic surface.");
