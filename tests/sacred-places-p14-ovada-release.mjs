import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isMapPublishablePlaceGeo, assertExploreGeographyRegistry } from "../src/find/geography-contracts.js";
import { assertShrinesPilgrimagesRegistry } from "../src/find/shrines-contracts.js";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const geo=load("data/geography/seed-registry.v1.json");
const src=load("data/shrines/source-registry.v1.json");
const cross=load("data/explore/heritage-place-reconciliation.review.v1.json");
const shrines=load("data/shrines/shrines-pilgrimages-seed.v1.json");
const p13=load("data/geography/research/sacred-places-p13-identity-adjudication.v1.json");
const p14=load("data/geography/research/sacred-places-p14-ovada-canonical-release.v1.json");

assert.equal(p14.schema,"AO_SACRED_PLACES_P14_OVADA_CANONICAL_RELEASE_V1");
assert.equal(p13.summary.original_exception_slots,23);
assert.equal(p14.base.places,347);
assert.equal(p14.proposed.places,348);
assert.equal(geo.places.length,p14.proposed.places+5);
assert.equal(src.sources.length,p14.proposed.shrine_sources+15);
assert.equal(geo.geoAreas.length,141);
assert.equal(geo.directoryPlaceLinks.length,9);
assert.equal(cross.place_crosswalk.length,geo.places.length);
assert.equal(cross.counts.places,geo.places.length);
assert.equal(cross.exception_queues.places_without_direct_claim.length,cross.counts.places_without_direct_claim);
assert.equal(new Set(geo.places.map(p=>p.place_id)).size,geo.places.length);
assert.equal(new Set(src.sources.map(s=>s.id)).size,src.sources.length);
assert.equal(assertExploreGeographyRegistry(geo).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...shrines,sources:src.sources,places:geo.places}).pass,true);

const candidate=p13.decisions.find(x=>x.candidate_id==="candidate:SG-INV-0093");
assert.equal(candidate?.source_identity_gate,"RESOLVED");
const record=p14.published_new;
const id="place:IT:santuario-san-paolo-della-croce-ovada";
assert.equal(record.research_id,candidate.candidate_id);
assert.equal(record.place_id,id);
const matching=geo.places.filter(x=>x.place_id===id);
assert.equal(matching.length,1);
const place=matching[0];
assert.equal(place.name.official,record.canonical_name);
assert.equal(place.place_type,"shrine");
assert.deepEqual(place.geo_area_ids,["geo:country:IT"]);
assert.equal(place.mappable,true);
assert.equal(place.geo.lat,44.63312);
assert.equal(place.geo.lng,8.63989);
assert.equal(place.geo.precision,"site");
assert.equal(place.geo.geocoding_source,"OSM");
assert.equal(place.geo.source_url,"https://www.openstreetmap.org/way/48892861");
assert.equal(place.geo.source_ref,"osm:way:48892861");
assert.equal(place.geo.matched_country_code,"IT");
assert.match(place.geo.attribution,/OpenStreetMap/);
assert.equal(place.address.line1,"Corso Italia");
assert.equal(place.address.city,"Ovada");
assert.equal(place.address.country_code,"IT");
assert.equal(isMapPublishablePlaceGeo(place.geo,"IT"),true);
assert.deepEqual(place.source_ids,record.identity_provenance.map(x=>x.source_id));
for(const original of record.identity_provenance){
 const s=src.sources.find(x=>x.id===original.source_id);
 assert.ok(s,"Ovada source missing: "+original.source_id);
 assert.equal(s.url,original.url);
 assert.equal(s.directness,original.directness);
}
assert.equal(new Set(place.source_ids).size,3);
assert.equal(geo.places.filter(x=>x.geo?.source_ref===place.geo.source_ref).length,1);
assert.ok(cross.exception_queues.places_without_direct_claim.includes(id));
const item=cross.place_crosswalk.find(x=>x.place_id===id);
assert.ok(item,"New Place must be present in exact heritage crosswalk");
assert.deepEqual(item.record_ids,{},"No manufactured shrine, pilgrim, relic or apparition records");
assert.equal(geo.directoryPlaceLinks.some(x=>x.place_id===id),false,"No asserted 1962 Mass venue");
assert.equal(p14.published_new.rights_status,"TEXT_MAP_ONLY_NO_APPROVED_PHOTO");
assert.equal(p14.published_new.tlm_status,"NO_1962_MISSAL_ASSERTION");
assert.equal(p14.published_new.access_status,"CURRENT_VISITOR_HOURS_NOT_ASSERTED");
assert.equal(p14.proposed.approved_media_added,0);
assert.equal(p14.proposed.directory_place_links_added,0);
assert.deepEqual(p14.nonpublic_held_cases.map(x=>x.research_id).sort(),[
 "candidate:SG-INV-0654",
 "candidate:SG-INV-0696"
]);
assert.equal(p14.proposed.source_identity_holds_after,20);
console.log("PASS P14: Ovada named Catholic sanctuary, official parish and exact OSM building; 347→348 Places, 621→624 sources; no invented Mass or photo.");
