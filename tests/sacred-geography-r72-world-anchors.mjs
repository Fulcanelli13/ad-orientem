import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";

const read=path=>JSON.parse(readFileSync(path,"utf8"));
const g=read("data/geography/seed-registry.v1.json");
const s=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const sacred=read("data/explore/sacred-phenomena-seed.v1.json");
const r70=read("data/geography/research/sacred-geography-coverage-first-r70.v1.json");
const q=read("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json");
const release=read("data/geography/research/sacred-geography-r72-world-anchors.v1.json");
const heritage=read("data/explore/heritage-place-reconciliation.review.v1.json");
const sourceById=new Map(sources.sources.map(x=>[x.id,x]));

assert.equal(release.schema,"AO_SACRED_GEOGRAPHY_R72_WORLD_ANCHORS_V1");
assert.equal(release.sites.length,7);
assert.deepEqual(new Set(release.sites.map(x=>x.country)),new Set(["IT","PT","HU","CN","PH","GT","PY"]));
assert.equal(new Set(release.sites.map(x=>x.place_id)).size,7);
assert.deepEqual([g.places.length,s.shrines.length,s.pilgrimages.length,sources.sources.length],[359,257,240,653]);
assert.equal(new Set(g.places.map(x=>x.place_id)).size,g.places.length);
assert.equal(new Set(s.shrines.map(x=>x.place_id)).size,257);
assert.equal(assertExploreGeographyRegistry(g).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...s,sources:sources.sources,places:g.places}).pass,true);
assert.deepEqual([r70.summary.candidate_status.CONFIRMED_EXISTING_PROMOTION,
r70.summary.candidate_status.POTENTIAL_EXISTING_ID_REVIEW,
r70.summary.candidate_status.PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW],[166,6,578]);
assert.deepEqual([q.counts.explicit_promoted,q.counts.text_hint_review,q.counts.unmatched],[164,6,580]);
assert.equal(r70.candidates.length,750);
assert.equal(heritage.place_crosswalk.length,359);
assert.equal(heritage.counts.places,359);
assert.deepEqual(release.governance,{no_duplicate_place_ids:true,source_links_direct:true,
identity_verified_separately_from_geo:true,description_level:"BASIC_BILINGUAL",images_added:0,
calendar_dates_added:0,route_geometries_added:0,apparition_records_added:0,relic_records_added:0});

const projected=projectExploreDataset({
  directory:{records:[],communities:[]},geography:g,shrines:{...s,sources:sources.sources},
  customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:sacred,
  novenas:{records:[],links:[],sources:[]},editorial:{featured:[],placeGuides:[]},
  media:{approved:[],gallery:[]}
});
const profiles=buildExplorePlaceProfiles({
  directory:{records:[],communities:[]},geography:g,shrines:{...s,sources:sources.sources},
  customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:sacred,
  novenas:{records:[],links:[],sources:[]},editorial:{featured:[],placeGuides:[]},
  media:{approved:[],gallery:[]}
},projected,{today:"2026-10-15"});
assert.equal(profiles.length,g.places.length);
for(const entry of release.sites){
 const place=g.places.find(x=>x.place_id===entry.place_id);
 assert.ok(place,"missing canonical site "+entry.place_id);
 assert.ok(isMapPublishablePlaceGeo(place.geo,entry.country),"unverified geo "+entry.place_id);
 assert.equal(place.geo.source_ref,"osm:way:"+entry.geo_source_url.split("/").pop());
 assert.equal(place.address.country_code,entry.country);
 assert.ok(place.name.aliases.length>0);
 const shrine=s.shrines.find(x=>x.shrine_id===entry.shrine_id);
 const pilgrimage=s.pilgrimages.find(x=>x.pilgrimage_id===entry.pilgrimage_id);
 assert.equal(shrine?.place_id,entry.place_id);
 assert.equal(shrine?.recognition_class,"UNKNOWN","no unverified jurisdictional recognition");
 assert.ok(shrine.origin_summary.length>125&&shrine.origin_summary_fr.length>125);
 assert.equal(pilgrimage?.destination_shrine_id,entry.shrine_id);
 assert.deepEqual(pilgrimage.route_ids,[],"no assumed routes");
 assert.deepEqual(pilgrimage.temporal_link_ids,[],"no assumed calendar feast");
 for(const id of entry.source_ids)assert.ok(sourceById.get(id)?.url?.startsWith("https://"));
 assert.ok(sourceById.get(entry.source_ids[0]).url===entry.site_identity_url);
 assert.ok(sourceById.get(entry.source_ids[1]).url===entry.geo_source_url);
 const c=r70.candidates.find(x=>x.candidate_id===entry.candidate_id);
 const row=q.rows.find(x=>x.candidate_id===entry.candidate_id);
 assert.equal(c.reconciliation_status,"CONFIRMED_EXISTING_PROMOTION");
 assert.equal(c.confirmed_place_id,entry.place_id);
 assert.equal(row.canonical_place_id,entry.place_id);
 assert.equal(row.status,"EXPLICIT_PROMOTED");
 const profilesForPlace=profiles.filter(x=>x.place_id===entry.place_id);
 assert.equal(profilesForPlace.length,1);
 const shrinePin=projected.byLens.shrines.find(x=>x.place_id===entry.place_id);
 const pilgrimPin=projected.byLens.pilgrimages.find(x=>x.place_id===entry.place_id);
 assert.equal(exploreMapFeatures([shrinePin]).length,1);
 assert.equal(exploreMapFeatures([pilgrimPin]).length,1);
 assert.equal(sacred.apparitions.some(x=>x.place_id===entry.place_id),false,"no invented apparition record");
}
console.log("PASS R72: seven world-anchor sanctuaries with linked sources, canonical site pins, bilingual descriptions and mapped pilgrimage cards");
