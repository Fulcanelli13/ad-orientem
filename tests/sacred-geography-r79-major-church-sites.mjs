import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const g=read("data/geography/seed-registry.v1.json");
const s=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const sacred=read("data/explore/sacred-phenomena-seed.v1.json");
const r=read("data/geography/research/sacred-geography-coverage-first-r70.v1.json");
const q=read("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json");
const release=read("data/geography/research/sacred-geography-r79-major-church-sites.v1.json");
const heritage=read("data/explore/heritage-place-reconciliation.review.v1.json");
assert.equal(release.schema,"AO_SACRED_GEOGRAPHY_R79_MAJOR_CHURCH_COVERAGE_V1");
assert.equal(release.new_sites.length,3);
assert.deepEqual([g.places.length,s.shrines.length,s.pilgrimages.length,sources.sources.length],[371,257,240,669]);
assert.equal(assertExploreGeographyRegistry(g).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...s,sources:sources.sources,places:g.places}).pass,true);
assert.equal(heritage.place_crosswalk.length,371);
assert.deepEqual([r.summary.candidate_status.CONFIRMED_EXISTING_PROMOTION,
r.summary.candidate_status.POTENTIAL_EXISTING_ID_REVIEW,
r.summary.candidate_status.PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW],[166,6,578]);
assert.deepEqual([q.counts.explicit_promoted,q.counts.text_hint_review,q.counts.unmatched],[164,6,580]);
assert.deepEqual(new Set(release.new_sites.map(x=>x.country)),new Set(["GB","FR","IT"]));
const ids=new Map(g.places.map(x=>[x.place_id,x]));
const originals=new Map(sources.sources.map(x=>[x.id,x]));
const projected=projectExploreDataset({
 directory:{records:[],communities:[]},geography:g,shrines:{...s,sources:sources.sources},
 sacredPhenomena:sacred,customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]},editorial:{featured:[],placeGuides:[]},media:{approved:[],gallery:[]}
});
for(const e of release.new_sites){
 const place=ids.get(e.place_id);
 assert.ok(place&&place.address?.country_code===e.country);
 assert.equal(place.geo.source_ref,"osm:way:"+e.geo_source_url.split("/").pop());
 assert.ok(isMapPublishablePlaceGeo(place.geo,e.country));
 assert.ok(place.name.aliases.length);
 const sh=s.shrines.find(x=>x.shrine_id===e.shrine_id);
 const p=s.pilgrimages.find(x=>x.pilgrimage_id===e.pilgrimage_id);
 assert.equal(sh?.place_id,e.place_id);
 assert.equal(sh?.recognition_class,"UNKNOWN");
 assert.ok(sh.origin_summary.length>125&&sh.origin_summary_fr.length>125);
 assert.equal(p?.destination_shrine_id,e.shrine_id);
 assert.deepEqual(p.route_ids,[]);
 assert.deepEqual(p.temporal_link_ids,[]);
 for(const sourceId of e.source_ids)assert.ok(originals.get(sourceId)?.url?.startsWith("https://"));
 assert.equal(originals.get(e.source_ids[0]).url,e.identity_source_url);
 assert.equal(originals.get(e.source_ids[1]).url,e.geo_source_url);
 assert.equal(r.candidates.find(x=>x.candidate_id===e.candidate_id).confirmed_place_id,e.place_id);
 assert.equal(q.rows.find(x=>x.candidate_id===e.candidate_id).canonical_place_id,e.place_id);
 for(const lens of ["shrines","pilgrimages"]){
  const item=projected.byLens[lens].find(x=>x.place_id===e.place_id);
  assert.equal(exploreMapFeatures([item]).length,1);
 }
}
for(const x of release.previously_mislinked_but_already_published){
 assert.ok(ids.has(x.place_id));
 assert.equal(g.places.filter(p=>p.place_id===x.place_id).length,1,"Existing canonical Place must not be duplicated");
 assert.equal(r.candidates.find(c=>c.candidate_id===x.candidate_id).confirmed_place_id,x.place_id);
}
assert.equal(sacred.apparitions.length,33,"No invented apparitions");
assert.equal(sacred.relics.length,122,"No unexamined relic authenticity claims");
console.log("PASS R79: 3 exact original-source Catholic landmark Places and 2 corrected reused major church identities");
