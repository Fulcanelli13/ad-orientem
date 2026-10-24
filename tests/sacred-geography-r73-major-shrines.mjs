import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const g=read("data/geography/seed-registry.v1.json");
const s=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const ph=read("data/explore/sacred-phenomena-seed.v1.json");
const r=read("data/geography/research/sacred-geography-coverage-first-r70.v1.json");
const q=read("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json");
const manifest=read("data/geography/research/sacred-geography-r73-major-shrines.v1.json");
const h=read("data/explore/heritage-place-reconciliation.review.v1.json");
assert.equal(manifest.schema,"AO_SACRED_GEOGRAPHY_R73_MAJOR_SHRINES_V1");
assert.equal(manifest.sites.length,9);
assert.equal(manifest.existing_confirmed.length,12);
assert.deepEqual([g.places.length,s.shrines.length,s.pilgrimages.length,sources.sources.length],[356,257,240,647]);
assert.equal(assertExploreGeographyRegistry(g).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...s,sources:sources.sources,places:g.places}).pass,true);
assert.equal(h.place_crosswalk.length,356);
assert.deepEqual([r.summary.candidate_status.CONFIRMED_EXISTING_PROMOTION,
 r.summary.candidate_status.POTENTIAL_EXISTING_ID_REVIEW,
 r.summary.candidate_status.PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW],[166,6,578]);
assert.deepEqual([q.counts.explicit_promoted,q.counts.text_hint_review,q.counts.unmatched],[164,6,580]);
assert.equal(r.candidates.length,750,"Original candidate universe must be preserved");
const p=new Map(g.places.map(x=>[x.place_id,x]));
const ids=new Set(sources.sources.map(x=>x.id));
const projected=projectExploreDataset({
 directory:{records:[],communities:[]},geography:g,shrines:{...s,sources:sources.sources},
 sacredPhenomena:ph,customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]},editorial:{featured:[],placeGuides:[]},
 media:{approved:[],gallery:[]}
});
for(const row of manifest.sites){
 const place=p.get(row.place_id);
 assert.ok(place,"Missing new Place "+row.place_id);
 assert.equal(place.address.country_code,row.country);
 assert.ok(isMapPublishablePlaceGeo(place.geo,row.country),"Unpublishable map coordinate "+row.place_id);
 assert.equal(place.geo.source_url,row.geo_source_url);
 assert.equal(place.geo.precision,row.precision);
 assert.ok(place.name.aliases.length>0);
 const shrine=s.shrines.find(x=>x.shrine_id===row.shrine_id);
 const pilgrimage=s.pilgrimages.find(x=>x.pilgrimage_id===row.pilgrimage_id);
 assert.equal(shrine?.place_id,row.place_id);
 assert.equal(pilgrimage?.destination_shrine_id,row.shrine_id);
 assert.equal(shrine.recognition_class,"UNKNOWN","Unverified juridical recognition");
 assert.ok(shrine.origin_summary.length>60&&shrine.origin_summary_fr.length>60);
 assert.ok(shrine.source_ids.every(id=>ids.has(id)));
 assert.deepEqual(pilgrimage.route_ids,[]);
 assert.deepEqual(pilgrimage.temporal_link_ids,[]);
 assert.equal(r.candidates.find(x=>x.candidate_id===row.candidate_id)?.confirmed_place_id,row.place_id);
 assert.equal(q.rows.find(x=>x.candidate_id===row.candidate_id)?.canonical_place_id,row.place_id);
 assert.equal(exploreMapFeatures(projected.byLens.shrines.filter(x=>x.place_id===row.place_id)).length,1);
 assert.equal(exploreMapFeatures(projected.byLens.pilgrimages.filter(x=>x.place_id===row.place_id)).length,1);
 assert.ok(!ph.apparitions.some(x=>x.place_id===row.place_id),"No fabricated apparition");
}
for(const row of manifest.existing_confirmed){
 assert.ok(p.has(row.place_id),"Reused non-existing Place "+row.place_id);
 assert.equal(r.candidates.find(x=>x.candidate_id===row.candidate_id)?.confirmed_place_id,row.place_id);
}
assert.equal(new Set(g.places.map(x=>x.place_id)).size,g.places.length,"Duplicate physical sites");
console.log("PASS R73: nine sourced national shrine pins, twelve correct canonical reuses, 750 research identities intact");
