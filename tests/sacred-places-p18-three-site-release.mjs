import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const geo=load("data/geography/seed-registry.v1.json");
const src=load("data/shrines/source-registry.v1.json");
const cross=load("data/explore/heritage-place-reconciliation.review.v1.json");
const shrineCorpus=load("data/shrines/shrines-pilgrimages-seed.v1.json");
const prior=load("data/geography/research/sacred-places-p16-three-qualified-site-release.v1.json");
const r=load("data/geography/research/sacred-places-p18-three-site-release.v1.json");
assert.equal(r.schema,"AO_SACRED_PLACES_P18_THREE_SITE_RELEASE_V1");
assert.deepEqual([r.baseline.places,r.baseline.typed_sources,r.baseline.heritage_crosswalk],[356,647,356]);
assert.deepEqual([geo.places.length,src.sources.length,cross.place_crosswalk.length],[359,653,359]);
assert.equal(cross.counts.places,359);
assert.equal(cross.counts.places_without_direct_claim,100);
assert.equal(cross.exception_queues.places_without_direct_claim.length,100);
assert.equal(geo.geoAreas.length,141);
assert.equal(geo.directoryPlaceLinks.length,9);
assert.equal(r.published_new.length,3);
assert.equal(new Set(geo.places.map(x=>x.place_id)).size,359);
assert.equal(new Set(src.sources.map(x=>x.id)).size,653);
assert.equal(assertExploreGeographyRegistry(geo).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...shrineCorpus,sources:src.sources,places:geo.places}).pass,true);
assert.equal(prior.held_exceptions.length,16);
assert.equal(r.research_policy.original_hold_count,16);
assert.equal(r.proposed.original_exception_holds_left,16);
const byPlace=new Map(geo.places.map(x=>[x.place_id,x]));
const bySource=new Map(src.sources.map(x=>[x.id,x]));
const chars="23456789CFGHJMPQRVWX",res=[20,1,.05,.0025,.000125];
function center(code){
 assert.match(code,/^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/);
 const d=code.replace("+","");let lat=-90,lng=-180;
 for(let i=0;i<5;i++){lat+=chars.indexOf(d[2*i])*res[i];lng+=chars.indexOf(d[2*i+1])*res[i];}
 return [Number((lat+.0000625).toFixed(7)),Number((lng+.0000625).toFixed(7))];
}
for(const item of r.published_new){
 const p=byPlace.get(item.place_id);
 assert.ok(p,"P18 site absent from canonical owner "+item.place_id);
 assert.equal(p.name.official,item.name);
 assert.equal(p.place_type,item.place_type);
 assert.equal(p.address.country_code,item.country);
 assert.equal(p.geo.matched_country_code,item.country);
 assert.equal(p.geo.precision,item.precision);
 assert.deepEqual([p.geo.lat,p.geo.lng],[item.lat,item.lng]);
 assert.deepEqual(p.source_ids,item.source_ids);
 assert.ok(p.mappable&&isMapPublishablePlaceGeo(p.geo,item.country),"No source-backed pin");
 assert.equal(geo.directoryPlaceLinks.some(x=>x.place_id===p.place_id),false,"No inferred 1962-Missal venue");
 assert.equal(shrineCorpus.shrines.some(x=>x.place_id===p.place_id),false,"No inferred shrine owner record");
 const c=cross.place_crosswalk.filter(x=>x.place_id===p.place_id);
 assert.equal(c.length,1);assert.deepEqual(c[0].record_ids,{});
 assert.ok(cross.exception_queues.places_without_direct_claim.includes(p.place_id));
 for(const id of item.source_ids){
  const source=bySource.get(id);
  assert.ok(source,"Missing institutional or map source "+id);
  assert.match(source.url,/^https:\/\//);
  assert.ok(source.contribution&&source.directness);
 }
 if(item.location_code){
  assert.equal(p.geo.geocoding_source,"OTHER");
  assert.equal(p.geo.source_ref,"olc:"+item.location_code);
  assert.deepEqual(center(item.location_code),[p.geo.lat,p.geo.lng]);
  assert.equal(p.geo.attribution,undefined,"Grid cell is not an OSM building feature");
 }else{
  assert.equal(p.geo.geocoding_source,"OSM");
  assert.equal(p.geo.source_ref,"osm:"+item.osm_type+":"+item.osm_id);
  assert.equal(p.geo.source_url,"https://www.openstreetmap.org/"+item.osm_type+"/"+item.osm_id);
  assert.match(p.geo.attribution,/OpenStreetMap/);
 }
}
assert.equal(byPlace.get("place:US:sacred-heart-shrine-hales-corners").address.city,"Hales Corners");
assert.equal(byPlace.get("place:NI:ermita-guadalupe-matagalpa").place_type,"chapel");
assert.equal(byPlace.get("place:IT:santuario-beata-vergine-neve-foppolo").address.line1,"Via Magri 12");
assert.ok(byPlace.has("place:IT:basilica-santa-maria-maggiore-bergamo"));
for(const id of r.research_policy.cases_not_automatically_resolved){
 assert.ok(prior.held_exceptions.some(x=>x.candidate_id===id),"P18 must not erase original conflated title: "+id);
}
assert.equal(r.proposed.new_approved_media,0);
assert.equal(r.proposed.new_tlm_links,0);
console.log("PASS P18 359 canonical Places, 653 typed sources, three distinct mapped Catholic sites, original 16 title holds retained");
