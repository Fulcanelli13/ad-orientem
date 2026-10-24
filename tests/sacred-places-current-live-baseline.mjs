import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LEDGER,RELEASES,LIVE,BASE,CURRENT_RELEASE_PLACE_IDS} from "./helpers/sacred-places-live-baseline.mjs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geo=load("data/geography/seed-registry.v1.json");
const src=load("data/shrines/source-registry.v1.json");
const cross=load("data/explore/heritage-place-reconciliation.review.v1.json");
const p16=load("data/geography/research/sacred-places-p16-three-qualified-site-release.v1.json");
assert.equal(LEDGER.schema,"AO_SACRED_PLACES_LIVE_RELEASE_CHAIN_V1");
assert.deepEqual([BASE.places,BASE.sources,BASE.heritage_crosswalk,BASE.places_without_direct_claim],[361,659,361,102]);
assert.deepEqual([geo.places.length,src.sources.length,cross.place_crosswalk.length,cross.exception_queues.places_without_direct_claim.length,geo.geoAreas.length,geo.directoryPlaceLinks.length],[LIVE.places,LIVE.sources,LIVE.heritage_crosswalk,LIVE.unlinked,LIVE.areas,LIVE.links]);
assert.equal(cross.counts.places,LIVE.places);
assert.equal(cross.counts.places_without_direct_claim,LIVE.unlinked);
assert.equal(p16.held_exceptions.length,BASE.historical_title_holds);
const placeById=new Map(geo.places.map(p=>[p.place_id,p])), sourceById=new Map(src.sources.map(s=>[s.id,s]));
assert.equal(placeById.size,geo.places.length);
assert.equal(sourceById.size,src.sources.length);
assert.deepEqual(new Set(geo.places.map(p=>p.place_id)),new Set(cross.place_crosswalk.map(x=>x.place_id)),"Canonical and heritage Place owners must contain same physical IDs");
assert.equal(new Set(CURRENT_RELEASE_PLACE_IDS).size,CURRENT_RELEASE_PLACE_IDS.length,"Duplicate Place ID across release manifests");
for(const release of RELEASES){
 assert.ok(release.data.published_new?.length>0,release.id+" must contain place-specific release records");
 for(const item of release.data.published_new){
  const p=placeById.get(item.place_id);
  assert.ok(p,"Release "+release.id+" Place missing: "+item.place_id);
  assert.equal(p.geo.matched_country_code,p.address.country_code);
  assert.ok(isMapPublishablePlaceGeo(p.geo,p.address.country_code));
  assert.ok(p.source_ids?.length>=1,"Identity source provenance not retained: "+item.place_id);
  for(const sid of p.source_ids)assert.ok(sourceById.has(sid),"Dangling typed site source "+sid);
  assert.ok(!geo.directoryPlaceLinks.some(link=>link.place_id===p.place_id),"New Places should not acquire inferred TLM venue links");
 }
}
assert.equal(assertExploreGeographyRegistry(geo).pass,true);
console.log("PASS live Sacred Places baseline: "+LIVE.places+" Places / "+LIVE.sources+" sources; "+RELEASES.length+" immutable release manifest(s); no unregistered promotions");
