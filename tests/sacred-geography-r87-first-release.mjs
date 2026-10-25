import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import fs from "node:fs";
import assert from "node:assert/strict";
import {assertExploreGeographyRegistry, isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
const load = path => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8"));
const geography = load("../data/geography/seed-registry.v1.json");
const release = load("../data/geography/research/sacred-geography-r87-first-canonical-release.v1.json");
const sources = load("../data/shrines/source-registry.v1.json");
const shrineCorpus = load("../data/shrines/shrines-pilgrimages-seed.v1.json");
const heritage = load("../data/explore/heritage-place-reconciliation.review.v1.json");
assert.equal(release.schema,"AO_SACRED_GEOGRAPHY_R87_FIRST_CANONICAL_RELEASE_V1");
assert.equal(release.published_new.length,33);
const r89 = load("../data/geography/research/sacred-geography-r89-first-coverage-release.v1.json");
const r90 = load("../data/geography/research/sacred-geography-r90-coverage-first-release.v1.json");
const r91 = load("../data/geography/research/sacred-geography-r91-coverage-first-release.v1.json");
const r92 = load("../data/geography/research/sacred-geography-r92-verified-site-cohort.v1.json");
const r93 = load("../data/geography/research/sacred-geography-r93-first-presence-release.v1.json");
const p17 = load("../data/geography/research/sacred-places-p17-separated-bergamo-asuncion.v1.json");
assert.equal(geography.places.length,LIVE.places);
assert.equal(sources.sources.length,LIVE.sources);
assert.equal(89+r89.country_areas_added.length+r90.country_areas_added.length+r91.country_areas_added.length+r92.country_areas_added.length+r93.country_areas_added.length,141,"Historical R93 country-area baseline is frozen");
assert.equal(geography.geoAreas.length,LIVE.areas,"Current area count must come from immutable release ledger");
assert.equal(release.country_areas_added.length,17);
assert.equal(new Set(release.published_new.map(row=>row.place_id)).size,33);
assert.equal(new Set(release.published_new.map(row=>row.country)).size,24);
assert.equal(new Set(geography.places.map(x=>x.place_id)).size,geography.places.length);
assert.equal(new Set(sources.sources.map(x=>x.id)).size,sources.sources.length);
assert.equal(assertExploreGeographyRegistry(geography).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...shrineCorpus,sources:sources.sources,places:geography.places}).pass,true);
assert.equal(heritage.place_crosswalk.length,LIVE.heritage_crosswalk);
assert.deepEqual(new Set(geography.places.map(p=>p.place_id)),new Set(heritage.place_crosswalk.map(r=>r.place_id)),"R87 must extend independent review crosswalk without removing old Places");
const siteById = new Map(geography.places.map(p=>[p.place_id,p]));
const sourceById = new Map(sources.sources.map(s=>[s.id,s]));
for(const row of release.published_new) {
 const p = siteById.get(row.place_id);
 assert.ok(p,"missing "+row.place_id);
 assert.equal(p.address.country_code,row.country);
 assert.equal(p.geo.matched_country_code,row.country);
 assert.equal(p.geo_area_ids[0],"geo:country:"+row.country);
 assert.equal(p.geo.precision,row.precision);
 assert.ok(p.name.aliases.length>=1);
 assert.ok(p.address.formatted);
 assert.equal(p.geo.source_url,row.geo_source_url);
 assert.equal(p.geo.source_ref,row.geo_source_ref);
 assert.equal(p.geo.verified_at,"2026-10-19");
 assert.ok(isMapPublishablePlaceGeo(p.geo,row.country),"unpublishable geo "+row.place_id);
 assert.deepEqual(p.source_ids,row.source_ids);
 assert.equal(p.source_ids.length,2);
 for(const sid of p.source_ids) {
   const src=sourceById.get(sid);
   assert.ok(src,"missing source "+sid);
   assert.ok(src.url.startsWith("https://"));
 }
 assert.equal(sourceById.get(p.source_ids[0]).url,row.identity_source_url);
 assert.equal(sourceById.get(p.source_ids[1]).url,row.geo_source_url);
 if(p.geo.geocoding_source==="OSM"){
   assert.match(p.geo.source_ref,/^osm:(?:way|node):[0-9]+$/);
   assert.ok(p.geo.attribution.includes("OpenStreetMap"));
   assert.equal(row.geo_source_url,"https://www.openstreetmap.org/"+p.geo.source_ref.replace(/^osm:/,"").replace(":","/"));
 }else{
   assert.equal(p.geo.geocoding_source,"OFFICIAL_SOURCE");
   assert.ok(row.geo_source_url.startsWith("https://www.katolsk.no/"));
 }
 assert.equal(geography.directoryPlaceLinks.some(link=>link.place_id===p.place_id),false,
  "No Directory link without exact venue-to-site evidence: "+p.place_id);
}
for(const id of release.country_areas_added) {
 const country=geography.geoAreas.find(row=>row.geo_area_id===id);
 assert.ok(country&&country.area_type==="country");
 assert.deepEqual(country.parent_geo_area_ids,["geo:world"]);
 assert.match(id,/^geo:country:[A-Z]{2}$/);
}
const held=new Set(release.held.map(h=>h.research_id));
for(const key of ["AO-R82-DISC-005","SG-INV-0689","SG-INV-0215","AO-R82-DISC-075"])assert.ok(held.has(key));
console.log("PASS R87: 33 new physical Places; 24 countries; 17 new area scopes; 66 source records; old 261 Places conserved; no speculative TLM/Directory links.");
