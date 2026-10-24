import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {isMapPublishablePlaceGeo,assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";

const read=path=>JSON.parse(readFileSync(path,"utf8"));
const geography=read("data/geography/seed-registry.v1.json");
const corpus=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const r70=read("data/geography/research/sacred-geography-coverage-first-r70.v1.json");
const r71=read("data/geography/research/sacred-geography-r71-major-site-reconciliation.v1.json");
const venueId="place:BA:medjugorje-st-james-parish";
const shrineId="shrine:BA:medjugorje-queen-of-peace";
const pilgrimId="pilgrimage:BA:medjugorje-destination";
const reportId="apparition:BA:medjugorje";

assert.deepEqual([geography.places.length,corpus.shrines.length,corpus.pilgrimages.length,
  phenomena.apparitions.length,sources.sources.length],[371,257,240,33,669]);
assert.equal(assertExploreGeographyRegistry(geography).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({
  shrines:corpus.shrines,pilgrimages:corpus.pilgrimages,routes:corpus.routes,
  temporalLinks:corpus.temporalLinks,sources:sources.sources,places:geography.places
}).pass,true);
const place=geography.places.find(x=>x.place_id===venueId);
assert.ok(place);
assert.equal(place.address.country_code,"BA");
assert.equal(place.geo.precision,"site");
assert.equal(place.geo.source_ref,"osm:way:1115592386");
assert.ok(isMapPublishablePlaceGeo(place.geo,"BA"));
assert.ok(place.name.aliases.includes("Međugorje"));
const shrine=corpus.shrines.find(x=>x.shrine_id===shrineId);
const pilgrimage=corpus.pilgrimages.find(x=>x.pilgrimage_id===pilgrimId);
const apparition=phenomena.apparitions.find(x=>x.id===reportId);
assert.equal(shrine.place_id,venueId);
assert.equal(pilgrimage.destination_shrine_id,shrineId);
assert.equal(apparition.place_id,venueId);
assert.equal(shrine.recognition_class,"UNKNOWN","No unsupported official shrine status");
assert.equal(apparition.recognition_record,"NIHIL_OBSTAT_PUBLIC_DEVOTION_2024");
assert.match(apparition.summary_en,/not a declaration/i);
assert.match(apparition.summary_fr,/ne s'agit pas d'une reconnaissance/i);
const bySource=new Map(sources.sources.map(x=>[x.id,x]));
assert.ok(shrine.source_ids.every(x=>bySource.has(x)));
assert.ok(shrine.source_ids.some(x=>bySource.get(x)?.url.includes("vatican.va")));
assert.ok(shrine.source_ids.some(x=>bySource.get(x)?.url.includes("medjugorje.hr")));
assert.ok(shrine.source_ids.some(x=>bySource.get(x)?.url.includes("openstreetmap.org")));
assert.deepEqual(r71.published_new.map(x=>x.place_id),[venueId]);
assert.equal(r71.reviewed_existing.length,8);
assert.equal(r71.rejected_wrong_physical_alias.length,12);
const live=new Set(geography.places.map(x=>x.place_id));
for(const entry of r71.reviewed_existing)assert.ok(live.has(entry.place_id));
for(const entry of r71.rejected_wrong_physical_alias){
  const candidate=r70.candidates.find(x=>x.candidate_id===entry.candidate_id);
  // R71 rejects an incorrect alias to a different sanctuary, not later independent site research.
  if(entry.candidate_id==="SG-INV-0377"){
    assert.equal(candidate.reconciliation_status,"CONFIRMED_EXISTING_PROMOTION");
    assert.equal(candidate.confirmed_place_id,"place:US:allentown-guadalupe-national-shrine");
    assert.notEqual(candidate.confirmed_place_id,"place:US:guadalupe-shrine-la-crosse","Allentown must never be conflated with La Crosse");
  }else if(entry.candidate_id==="SG-INV-0431"){
    assert.equal(candidate.reconciliation_status,"CONFIRMED_EXISTING_PROMOTION");
    assert.equal(candidate.confirmed_place_id,"place:MX:guadalupe-zacatecas-historic-sanctuary");
    assert.notEqual(candidate.confirmed_place_id,"place:MX:basilica-guadalupe-mexico-city","Zacatecas never aliases Mexico City");
  }else if(entry.candidate_id==="SG-INV-0018"){
    assert.equal(candidate.reconciliation_status,"CONFIRMED_EXISTING_PROMOTION");
    assert.equal(candidate.confirmed_place_id,"place:FR:sacre-coeur-montmartre");
    assert.notEqual(candidate.confirmed_place_id,"place:FR:sanctuaire-sacre-coeur-paray","Montmartre is not Paray-le-Monial");
  }else assert.equal(candidate.reconciliation_status,"PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW");
  assert.equal(candidate.possible_existing_place_id,null,"Do not conflate distinct sanctuaries");
}
const q=read("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json");
assert.deepEqual([q.counts.explicit_promoted,q.counts.text_hint_review,q.counts.unmatched],[164,6,580]);
assert.equal(q.rows.find(x=>x.candidate_id==="SG-INV-0317").canonical_place_id,venueId);
const projection=projectExploreDataset({
 directory:{records:[],communities:[]},
 geography,shrines:{...corpus,sources:sources.sources},
 sacredPhenomena:phenomena,
 customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},media:{approved:[],gallery:[]}
});
for(const [lens,sourceId] of [["shrines",shrineId],["pilgrimages",pilgrimId],["apparitions",reportId]]){
 const item=projection.byLens[lens].find(x=>x.place_id===venueId);
 assert.ok(item,"Missing "+lens+" map projection");
 assert.equal(item.map_publishable,true);
 assert.ok(exploreMapFeatures([item]).length===1);
}
assert.equal(projection.byLens.apparitions.find(x=>x.place_id===venueId).status,
 "2024 nihil obstat for public devotion; alleged apparitions not declared supernatural");
console.log("PASS R71: Medjugorje place/pilgrimage/qualified apparition and 20 reviewed identity dispositions");
