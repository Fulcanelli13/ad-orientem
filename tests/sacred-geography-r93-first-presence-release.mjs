import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geo=load("data/geography/seed-registry.v1.json");
const src=load("data/shrines/source-registry.v1.json");
const cross=load("data/explore/heritage-place-reconciliation.review.v1.json");
const r92=load("data/geography/research/sacred-geography-r92-verified-site-cohort.v1.json");
const r93=load("data/geography/research/sacred-geography-r93-first-presence-release.v1.json");
const p17=load("data/geography/research/sacred-places-p17-separated-bergamo-asuncion.v1.json");
const laterP28=load("data/geography/research/sacred-places-p28-world-11-exact-map.v1.json");
const laterP30=load("data/geography/research/sacred-places-p30-world-8-exact-map.v1.json");
const laterP31=load("data/geography/research/sacred-places-p31-world-9-exact-map.v1.json");
const laterP33=load("data/geography/research/sacred-places-p33-eight-exact-sites-four-areas.v1.json");
const shrines=load("data/shrines/shrines-pilgrimages-seed.v1.json");
assert.equal(r93.schema,"AO_SACRED_GEOGRAPHY_R93_FIRST_PRESENCE_CATHOLIC_PLACES_V1");
assert.equal(r92.result.places,336,"Previous production release is frozen");
assert.equal(r93.published_new.length,11);
assert.equal(r93.country_areas_added.length,11);
assert.equal(new Set(r93.published_new.map(x=>x.country)).size,11);
assert.equal(geo.places.length,LIVE.places);
assert.equal(geo.geoAreas.length,LIVE.areas);
assert.equal(130+r93.country_areas_added.length,141,"R93 historical area baseline");
assert.equal(src.sources.length,LIVE.sources);
assert.equal(new Set(geo.places.map(x=>x.place_id)).size,geo.places.length);
assert.equal(new Set(src.sources.map(x=>x.id)).size,src.sources.length);
assert.equal(geo.directoryPlaceLinks.length,9);
assert.equal(cross.place_crosswalk.length,geo.places.length);
assert.equal(cross.counts.places,geo.places.length);
assert.equal(cross.counts.places_without_direct_claim,cross.exception_queues.places_without_direct_claim.length);
assert.equal(assertExploreGeographyRegistry(geo).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...shrines,sources:src.sources,places:geo.places}).pass,true);
const byPlace=new Map(geo.places.map(x=>[x.place_id,x]));
const bySource=new Map(src.sources.map(x=>[x.id,x]));
const releaseIds=new Set(r93.published_new.map(x=>x.place_id));
const laterPlaceIds=new Set([...laterP28.published_new,...laterP30.published_new,...laterP31.published_new,...laterP33.published_new].map(x=>x.place_id));
const earlier=geo.places.filter(x=>!releaseIds.has(x.place_id)&&!laterPlaceIds.has(x.place_id));
// R93 first-presence means empty before R93, not empty after subsequent P28 publication.
const usedCountries=new Set(earlier.map(x=>x.address.country_code));
const usedGeos=new Set(earlier.map(x=>x.geo?.source_ref));
const alpha="23456789CFGHJMPQRVWX",resolution=[20,1,.05,.0025,.000125];
function center(code){
 assert.match(code,/^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2}$/);
 const symbols=code.replace("+","");let lat=-90,lng=-180;
 for(let i=0;i<5;i++){lat+=alpha.indexOf(symbols[i*2])*resolution[i];lng+=alpha.indexOf(symbols[i*2+1])*resolution[i];}
 return [Number((lat+.0000625).toFixed(7)),Number((lng+.0000625).toFixed(7))];
}
const newGeo=new Set();let mapped=0,olc=0;
for(const r of r93.published_new){
 assert.ok(!usedCountries.has(r.country),"Not previously empty country "+r.country);
 assert.ok(!usedGeos.has(r.geo_source_ref),"Pre-existing physical feature reused "+r.geo_source_ref);
 assert.ok(!newGeo.has(r.geo_source_ref),"Repeated new geo ref "+r.geo_source_ref);newGeo.add(r.geo_source_ref);
 assert.ok(r93.country_areas_added.includes("geo:country:"+r.country));
 const p=byPlace.get(r.place_id);assert.ok(p,r.place_id);
 assert.equal(p.name.official,r.name);assert.equal(p.place_type,"cathedral");
 assert.equal(p.address.country_code,r.country);
 assert.deepEqual(p.geo_area_ids,["geo:country:"+r.country]);
 assert.equal(p.geo.lat,r.lat);assert.equal(p.geo.lng,r.lng);
 assert.equal(p.geo.matched_country_code,r.country);
 assert.equal(p.geo.source_ref,r.geo_source_ref);
 assert.equal(p.geo.source_url,r.geo_source_url);
 assert.equal(p.geo.geocoding_source,r.geo_source_kind);
 assert.equal(p.geo.verified_at,r93.date);
 assert.ok(isMapPublishablePlaceGeo(p.geo,r.country));
 assert.deepEqual(p.source_ids,r.source_ids);
 assert.equal(r.source_ids.length,2);
 assert.equal(bySource.get(r.source_ids[0])?.url,r.identity_source_url);
 assert.equal(bySource.get(r.source_ids[0])?.directness,r.identity_source_directness);
 assert.equal(bySource.get(r.source_ids[1])?.url,r.geo_source_url);
 assert.equal(bySource.get(r.source_ids[1])?.directness,"SECONDARY");
 if(r.geo_source_kind==="OSM"){
  mapped++;
  assert.match(r.geo_source_ref,/^osm:way:\d+$/);
  assert.equal(r.geo_source_url,"https://www.openstreetmap.org/"+r.geo_source_ref.replace(/^osm:/,"").replace(":","/"));
  assert.ok(p.geo.attribution.includes("OpenStreetMap"));
 }else{
  olc++;assert.equal(r.geo_source_kind,"OTHER");
  assert.match(r.geo_source_ref,/^olc:/);
  assert.deepEqual([p.geo.lat,p.geo.lng],center(r.geo_source_ref.slice(4)));
  assert.match(r.geo_source_url,/gcatholic\.org\/churches\//);
  assert.ok(!p.geo.attribution,"Do not fabricate OSM attribution for Plus Code point");
 }
 assert.equal(geo.directoryPlaceLinks.some(x=>x.place_id===r.place_id),false);
 assert.equal(r.tlm_status,"NO_1962_MISSAL_ASSERTION");
 assert.equal(r.access_status,"CURRENT_VISITOR_HOURS_NOT_ASSERTED");
 const x=cross.place_crosswalk.find(x=>x.place_id===r.place_id);
 assert.ok(x&&Object.keys(x.record_ids).length===0,"New Place must not imply unsupported shrine/relic/Directory joins");
 assert.ok(cross.exception_queues.places_without_direct_claim.includes(r.place_id));
}
assert.equal(mapped,4);assert.equal(olc,7);
assert.equal(newGeo.size,11);
assert.equal(r93.tlm_venue_links_added,0);
assert.equal(r93.related_shrine_records_added,0);
assert.equal(r93.result.places,r93.baseline.places+r93.published_new.length);
assert.equal(r93.result.sources,r93.baseline.sources+2*r93.published_new.length);
assert.ok(r93.held.some(x=>x.country==="AO"&&x.research_id==="AO-R82-DISC-040"));
console.log("PASS R93: eleven distinct first-presence Catholic cathedral Places (4 OSM polygons + 7 explicit ~14m Plus Code site cells); 336→347 canonical Places, 599→621 sources, no invented Mass or shrine links.");
