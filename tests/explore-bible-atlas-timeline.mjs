import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildBibleAtlas, atlasMapItems, atlasIndexForPin, atlasDetail,
  atlasEraOverlay, renderBibleAtlasToString, ATLAS_GEO
} from "../src/find/bible-atlas.js";

const data=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(data.entries);
const by=(era,placeId)=>stops.find(s=>s.era===era&&s.placeId===placeId);
const named=name=>stops.find(s=>s.title_en===name);
assert.equal(stops.length,143,"first expanded Catholic Bible milestone itinerary");
assert.equal(new Set(stops.map(s=>s.era)).size,11,"era transitions");
assert.deepEqual(stops.map(s=>s.index),stops.map((_,i)=>i),"continuous stable milestone indices");
assert.equal(stops[0].title_en,"Creation");
assert.equal(stops[0].reference,"Genesis 1:1–2:3");
assert.equal(stops.at(-1).era,"REVELATION");
assert.equal(stops.at(-1).geo,null);
assert.ok(named("Letters to the seven churches").index<named("The heavenly liturgy").index,"Revelation sequence");
assert.ok(named("Paul heals a man in Lystra").index<named("Council of Jerusalem").index,"Acts 14 before Acts 15");
assert.ok(named("The seven brothers' witness").index<named("The Maccabean resistance").index,"Maccabean witness precedes revolt and restoration");
assert.ok(by("PASSION","bethphage").index<by("PASSION","olives").index,"Bethphage before entry");
assert.ok(by("PUBLIC","jericho").reference,"multiple Jericho episodes stay on timeline");

for(const stop of stops){
  assert.ok(stop.title_en&&stop.title_fr&&stop.reference,"bilingual Scripture reference per milestone");
  assert.ok(!String(stop.title_en).includes("undefined"),"no empty projected title");
  if(stop.geo){
    assert.ok(Number.isFinite(stop.geo.lat)&&Math.abs(stop.geo.lat)<=90);
    assert.ok(Number.isFinite(stop.geo.lng)&&Math.abs(stop.geo.lng)<=180);
    assert.match(stop.geo.url,/^https:\/\//);
    assert.ok(Object.values(ATLAS_GEO).includes(stop.geo),"only evidence-qualified map locations");
  }
}
const geoKeys=new Set(stops.filter(s=>s.geo).map(s=>s.geo.key));
assert.equal(geoKeys.size,35,"deduplicated actual map anchors");
assert.ok(stops.filter(s=>s.geo).length>=75);
for(const placeId of ["sinai","jordan-baptism","cana","ur","emmaus"]){
  assert.equal(stops.find(s=>s.placeId===placeId).geo,null,placeId+" contested point remains unpinned");
}
for(const [id,geo] of Object.entries(ATLAS_GEO)){
  assert.ok(geo.key&&geo.kind&&geo.url,id+" has provenance and confidence kind");
}
const geoByKey=new Map();
for(const geo of Object.values(ATLAS_GEO)){
  const coord=[geo.lat,geo.lng];
  if(geoByKey.has(geo.key))assert.deepEqual(coord,geoByKey.get(geo.key),"same site cannot jitter: "+geo.key);
  geoByKey.set(geo.key,coord);
}
assert.equal(atlasMapItems(stops,0).length,0,"no Creation coordinate");
assert.equal(atlasMapItems(stops,by("PATRIARCHS","hebron").index).length,1);
assert.equal(atlasMapItems(stops,by("ISRAEL","shiloh").index).length,1);
assert.equal(atlasMapItems(stops,by("EXILE","nineveh").index).length,1);
assert.equal(atlasMapItems(stops,by("EXILE","babylon").index).length,2);
assert.equal(atlasMapItems(stops,by("INFANCY","jerusalem-temple").index).length,4,"Infancy adds Nazareth, Ein Kerem, Bethlehem, Jerusalem");
assert.equal(atlasMapItems(stops,by("PUBLIC","capernaum").index).length,1);
assert.equal(atlasMapItems(stops,by("APOSTLES","rome").index).length,15,"apostolic sites progressively appear");
assert.equal(atlasIndexForPin(stops,by("APOSTLES","rome").index,"atlas:corinth"),by("APOSTLES","corinth").index);
assert.match(atlasDetail(by("INFANCY","jerusalem-temple"),"en"),/City-level reference/);
assert.match(atlasDetail(by("EXODUS","sinai"),"fr"),/repère/);
assert.match(atlasDetail(by("APOSTLES","rome"),"en"),/data-ao-scripture-context="Acts 28:16–31"/);
assert.match(atlasEraOverlay("EXODUS","fr"),/L'Exode/);
const en=renderBibleAtlasToString({language:"en",atlasStops:stops,atlasIndex:0});
const fr=renderBibleAtlasToString({language:"fr",atlasStops:stops,atlasIndex:71});
assert.match(en,/data-bible-track/);
assert.match(en,/data-bible-map/);
assert.match(en,/data-bible-era-overlay/);
assert.match(en,/data-bible-step="142"/);
assert.match(fr,/Atlas biblique/);
assert.match(fr,/Lire le passage/);
assert.match(en,/scroll-snap-type:x proximity/,"continuous horizontal swipe, not a rigid era carousel");
assert.ok(!en.includes("maps.google.com"),"Scripture stays in native reader");
console.log("PASS Biblical Atlas: 143 bilingual milestones, 11 eras, 35 site anchors, mobile timeline markup and canonical Scripture actions");
