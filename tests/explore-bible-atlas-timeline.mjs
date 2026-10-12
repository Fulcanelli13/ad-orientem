import assert from "node:assert/strict";
import {parseScriptureContext} from "../src/scripture/context.js";
import { readFileSync } from "node:fs";
import {
  buildBibleAtlas, atlasMapItems, atlasIndexForPin, atlasDetail, atlasPinEpisodes,
  atlasEraOverlay, renderBibleAtlasToString, ATLAS_GEO
} from "../src/find/bible-atlas.js";

const data=JSON.parse(readFileSync(new URL("../data/explore/bible-places-compact.v1.json",import.meta.url),"utf8"));
const stops=buildBibleAtlas(data.entries);
const by=(era,placeId)=>stops.find(s=>s.era===era&&s.placeId===placeId);
const named=name=>stops.find(s=>s.title_en===name);
assert.equal(stops.length,151,"first expanded Catholic Bible milestone itinerary");
assert.equal(new Set(stops.map(s=>s.era)).size,11,"era transitions");
assert.deepEqual(stops.map(s=>s.index),stops.map((_,i)=>i),"continuous stable milestone indices");
assert.equal(stops[0].title_en,"Creation");
assert.equal(stops[0].reference,"Genesis 1:1–31");
assert.equal(stops.at(-1).era,"REVELATION");
assert.equal(stops.at(-1).geo,null);
assert.ok(named("Letters to the four churches").index<named("Letters to the three churches").index&&named("Letters to the three churches").index<named("The heavenly liturgy").index,"Revelation sequence");
assert.ok(named("Paul heals a man in Lystra").index<named("Council of Jerusalem").index,"Acts 14 before Acts 15");
assert.ok(named("The seven brothers' witness").index<named("The Maccabean resistance").index,"Maccabean witness precedes revolt and restoration");
assert.ok(by("PASSION","bethphage").index<by("PASSION","olives").index,"Bethphage before entry");
assert.ok(by("PUBLIC","jericho").reference,"multiple Jericho episodes stay on timeline");
const temple=stops.find(s=>s.reference==="John 2:13–22");
assert.equal(temple.index,82,"single-event relocation preserves 151 canonical sources");
assert.equal(temple.eventKey,"biblical:event:jerusalem-temple-e3");
assert.equal(new Set(stops.map(s=>s.eventKey)).size,151,
 "every canonical biblical event must have one unique stable source identity");
assert.ok(stops.every(s=>s.eventKey.startsWith("biblical:")&&
 (s.sourceEventId===null||s.eventKey==="biblical:event:"+s.sourceEventId)),
 "artwork, theatre and genealogy must use stable event keys rather than screen indices");
assert.equal(temple.era,"PUBLIC");
assert.ok(temple.index>named("The wedding at Cana").index&&temple.index<by("PUBLIC","capernaum").index);
assert.equal(stops.filter(s=>s.reference==="John 2:13–22").length,1,"do not invent a second cleansing");
assert.match(atlasDetail(temple,"en"),/John narrates this cleansing/);
assert.match(atlasDetail(temple,"fr"),/Saint Jean raconte cette purification/);

for(const stop of stops){
  assert.ok(stop.title_en&&stop.title_fr&&stop.reference,"bilingual Scripture reference per milestone");
  assert.ok(parseScriptureContext(stop.reference),"Native Catholic Scripture reader rejects "+stop.reference);
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
assert.equal(atlasMapItems(stops,by("PUBLIC","capernaum").index).length,2,"Johannine Temple city context is visible before Capernaum");
assert.equal(atlasMapItems(stops,by("APOSTLES","rome").index).length,15,"apostolic sites progressively appear");
assert.equal(atlasIndexForPin(stops,by("APOSTLES","rome").index,"atlas:corinth"),by("APOSTLES","corinth").index);
assert.match(atlasDetail(by("INFANCY","jerusalem-temple"),"en"),/City-level reference/);
assert.match(atlasDetail(by("INFANCY","nazareth"),"en"),/Settlement marker only/);
assert.match(atlasDetail(by("ISRAEL","carmel"),"en"),/Mountain-region context only/);
assert.match(atlasDetail(by("PUBLIC","bethesda"),"en"),/Site-level location is provisional/);
assert.match(atlasDetail(by("INFANCY","bethlehem"),"en"),/Traditional site/);
assert.match(atlasDetail(by("PUBLIC","bethesda"),"fr"),/Localisation du site provisoire/);
assert.deepEqual(new Set(Object.values(ATLAS_GEO).map(g=>g.kind)),
 new Set(["city_context","traditional","settlement","mountain_region","site"]),
 "all known source-confidence classes have an explicit UI qualification");
assert.match(atlasDetail(by("EXODUS","sinai"),"fr"),/repère/);
assert.match(atlasDetail(by("APOSTLES","rome"),"en"),/data-ao-scripture-context="Acts 28:16–31"/);
const capIdx=by("PUBLIC","capernaum").index;
const pinSheet=atlasPinEpisodes(stops,data.entries,"capernaum",capIdx,"en");
assert.match(pinSheet,/data-bible-pin-episodes="capernaum"/);
assert.match(pinSheet,/Teaching and exorcism/);
assert.match(pinSheet,/data-ao-scripture-context=/,"pin detail exposes canonical passages");
const oldJerusalem=atlasPinEpisodes(stops,data.entries,"jerusalem",by("ISRAEL","jerusalem-temple").index,"en");
assert.doesNotMatch(oldJerusalem,/The Presentation of Jesus/,"ancient kingdom pin must not leak later infancy events");

assert.match(atlasEraOverlay("EXODUS","fr"),/L&#39;Exode/);
const en=renderBibleAtlasToString({language:"en",atlasStops:stops,atlasIndex:0});
const fr=renderBibleAtlasToString({language:"fr",atlasStops:stops,atlasIndex:71});
assert.match(en,/data-bible-track/);
assert.match(en,/data-bible-map/);
assert.match(en,/data-bible-era-overlay/);
assert.match(en,/data-bible-step="150"/);
assert.match(fr,/Atlas biblique/);
assert.match(fr,/Lire le passage/);
assert.match(en,/scroll-snap-type:x proximity/,"continuous horizontal swipe, not a rigid era carousel");
assert.ok(!en.includes("maps.google.com"),"Scripture stays in native reader");
console.log("PASS Biblical Atlas: 151 bilingual milestones, 11 eras, 35 site anchors, mobile timeline markup and canonical Scripture actions");
