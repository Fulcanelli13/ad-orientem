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
 // Identity-only releases may add an exact link to an existing Place without
 // inventing a newly published Place. Require explicit unchanged Place/source
 // counts and one source-proven venue relation in that exceptional case.
 const newPlaces=release.data.published_new??[];
 if(!newPlaces.length){
  assert.equal(release.id,"P108","Only explicit P108 identity-only link release is admitted");
  assert.equal(release.data.new_places,0);
  assert.equal(release.data.confirmed_directory_links_added,1);
  for(const field of ["places","sources","crosswalk","unlinked","geo_areas"])
   assert.equal(release.data.baseline[field],release.data.proposed[field],
    "Identity-only P108 cannot change canonical Place/source counts");
  assert.equal(release.data.proposed.directory_links,release.data.baseline.directory_links+1);
  const p=release.data.confirmed_existing_place_link;
  assert.ok(placeById.has(p.place_id),"P108 must reference an already-published Place");
  const matches=geo.directoryPlaceLinks.filter(l=>l.link_id===p.link_id&&l.venue_id===p.venue_id&&l.place_id===p.place_id);
  assert.equal(matches.length,1,"P108 must contribute exactly one confirmed original venue→Place link");
  assert.equal(matches[0].relationship,"LOCATED_AT");
  assert.equal(matches[0].confidence,"CONFIRMED");
  assert.deepEqual(matches[0].source_ids,p.source_ids);
  continue;
 }
 assert.ok(newPlaces.length>0,release.id+" must contain place-specific release records");
 for(const item of release.data.published_new){
  const p=placeById.get(item.place_id);
  assert.ok(p,"Release "+release.id+" Place missing: "+item.place_id);
  assert.equal(p.geo.matched_country_code,p.address.country_code);
  assert.ok(isMapPublishablePlaceGeo(p.geo,p.address.country_code));
  assert.ok(p.source_ids?.length>=1,"Identity source provenance not retained: "+item.place_id);
  for(const sid of p.source_ids)assert.ok(sourceById.has(sid),"Dangling typed site source "+sid);
  const links=geo.directoryPlaceLinks.filter(link=>link.place_id===p.place_id);
  if(["P92","P99","P104","P105"].includes(release.id)){
    const expected=release.data.published_new.find(x=>x.place_id===p.place_id);
    assert.equal(links.length,1 ,"Exact Directory bridge release requires independently sourced venue relation");
    assert.equal(links[0].venue_id,expected.directory_venue_id??expected.venue_id);
    assert.equal(links[0].confidence,"CONFIRMED");
    assert.equal(links[0].relationship,"LOCATED_AT");
    assert.ok(links[0].source_ids.length>=2);
  }else assert.equal(links.length,0,"Historical Place release must not acquire an inferred TLM venue link");
 }
}
assert.equal(assertExploreGeographyRegistry(geo).pass,true);
console.log("PASS live Sacred Places baseline: "+LIVE.places+" Places / "+LIVE.sources+" sources; "+RELEASES.length+" immutable release manifest(s); no unregistered promotions");
