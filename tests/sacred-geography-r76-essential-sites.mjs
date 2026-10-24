import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const g=read("data/geography/seed-registry.v1.json"),s=read("data/shrines/shrines-pilgrimages-seed.v1.json"),sources=read("data/shrines/source-registry.v1.json"),ph=read("data/explore/sacred-phenomena-seed.v1.json");
const r=read("data/geography/research/sacred-geography-coverage-first-r70.v1.json"),q=read("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json"),h=read("data/explore/heritage-place-reconciliation.review.v1.json"),m=read("data/geography/research/sacred-geography-r76-essential-audit.v1.json");
assert.equal(m.schema,"AO_SACRED_GEOGRAPHY_R76_FINAL_ESSENTIAL_AUDIT_V1");
assert.equal(m.published_new.length,3);
assert.equal(m.held.length,10);
assert.deepEqual([g.geoAreas.length,g.places.length,s.shrines.length,s.pilgrimages.length,sources.sources.length],[141,353,257,240,639]);
assert.equal(assertExploreGeographyRegistry(g).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({...s,sources:sources.sources,places:g.places}).pass,true);
assert.equal(r.candidates.length,750);
assert.equal(q.rows.length,750);
assert.deepEqual([r.summary.candidate_status.CONFIRMED_EXISTING_PROMOTION,r.summary.candidate_status.POTENTIAL_EXISTING_ID_REVIEW,r.summary.candidate_status.PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW],[166,6,578]);
assert.deepEqual([q.counts.explicit_promoted,q.counts.text_hint_review,q.counts.unmatched,q.counts.essential_remaining],[164,6,580,6]);
const places=new Map(g.places.map(x=>[x.place_id,x])),shrines=new Map(s.shrines.map(x=>[x.shrine_id,x])),pilgrimages=new Map(s.pilgrimages.map(x=>[x.pilgrimage_id,x])),ids=new Set(sources.sources.map(x=>x.id));
assert.equal(places.size,g.places.length);
assert.equal(new Set(s.shrines.map(x=>x.place_id)).size,257);
assert.equal(new Set(s.shrines.map(x=>places.get(x.place_id)?.address.country_code)).size,69);
const projection=projectExploreDataset({directory:{records:[],communities:[]},geography:g,shrines:{...s,sources:sources.sources},sacredPhenomena:ph,customs:{customs:[],attestations:[],sources:[]},novenas:{records:[],links:[],sources:[]},editorial:{featured:[],placeGuides:[]},media:{approved:[],gallery:[]}});
assert.deepEqual(new Set(m.published_new.map(x=>x.country)),new Set(["US","TT","GH"]));
for(const row of m.published_new){
 const place=places.get(row.place_id),sh=shrines.get(row.shrine_id);
 assert.ok(place&&sh,"Unbacked Place or Shrine "+row.candidate_id);
 assert.equal(place.address.country_code,row.country);
 assert.ok(isMapPublishablePlaceGeo(place.geo,row.country));
 assert.deepEqual([place.geo.lat,place.geo.lng,place.geo.precision,place.geo.source_url],[row.lat,row.lng,row.precision,row.geo_source_url]);
 assert.equal(sh.place_id,row.place_id);
 assert.ok(sh.source_ids.every(id=>ids.has(id)));
 assert.ok(sh.origin_summary.length>60&&sh.origin_summary_fr.length>60);
 assert.equal(r.candidates.find(x=>x.candidate_id===row.candidate_id)?.confirmed_place_id,row.place_id);
 assert.equal(q.rows.find(x=>x.candidate_id===row.candidate_id)?.canonical_place_id,row.place_id);
 assert.equal(exploreMapFeatures(projection.byLens.shrines.filter(x=>x.place_id===row.place_id)).length,1);
 assert.ok(!ph.apparitions.some(x=>x.place_id===row.place_id));
 assert.ok(!ph.relics.some(x=>x.place_id===row.place_id));
 if(row.pilgrimage_id){
  assert.equal(pilgrimages.get(row.pilgrimage_id)?.destination_shrine_id,row.shrine_id);
  assert.equal(exploreMapFeatures(projection.byLens.pilgrimages.filter(x=>x.place_id===row.place_id)).length,1);
 }else{
  assert.equal(s.pilgrimages.some(x=>x.destination_shrine_id===row.shrine_id),false,"Kumasi cathedral does not imply invented pilgrimage");
 }
}
assert.equal(h.place_crosswalk.length,353);
assert.equal(exploreMapFeatures(projection.byLens.shrines).length,257);
assert.equal(exploreMapFeatures(projection.byLens.pilgrimages).length,240);
// The historical ten R76 holds are an immutable audit; later independent site research resolves a subset.
const remaining=new Set(q.rows.filter(x=>x.priority==="Essential"&&x.status!=="EXPLICIT_PROMOTED").map(x=>x.candidate_id));
assert.equal(remaining.size,6);
assert.ok([...remaining].every(id=>m.held.some(x=>x.candidate_id===id)));
assert.equal(q.rows.find(x=>x.candidate_id==="SG-INV-0248").status,"UNMATCHED");
assert.equal(q.rows.find(x=>x.candidate_id==="SG-INV-0746").status,"TEXT_HINT_REVIEW");
console.log("PASS R76: three physical Catholic locations, two pilgrimages, 10 documented essential holds, no duplicate/out-of-scope Place");
