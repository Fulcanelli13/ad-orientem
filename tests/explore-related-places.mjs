import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectExploreDataset,filterExploreItems} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,explorePlaceProfile} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {loadExploreDataset,EXPLORE_DATA_URLS} from "../src/find/explore-data-service.js";

const load=path=>JSON.parse(readFileSync(path,"utf8"));
const geography=load("data/geography/seed-registry.v1.json");
const relations=load("data/geography/related-places.v1.json");
const shrines=load("data/shrines/shrines-pilgrimages-seed.v1.json");
assert.equal(relations.schema,"AO_EXPLICIT_RELATED_PLACES_V1");
assert.equal(relations.relationships.length,2);
assert.ok(EXPLORE_DATA_URLS.relatedPlaces.endsWith("/data/geography/related-places.v1.json"));
const placeIds=new Set(geography.places.map(p=>p.place_id));
for(const link of relations.relationships){
  assert.ok(placeIds.has(link.source_place_id));
  assert.ok(placeIds.has(link.target_place_id));
  assert.notEqual(link.source_place_id,link.target_place_id);
  assert.match(link.source_url,/^https:\/\//);
  assert.ok(link.description_en&&link.description_fr&&link.verified_date);
}
const dataset={
 geography:{...geography,placeRelationships:relations.relationships},
 directory:{records:[],communities:[]},
 shrines:{shrines:shrines.shrines,pilgrimages:[],routes:[],temporalLinks:[],sources:[]},
 sacredPhenomena:{apparitions:[],relics:[]},
 customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]}
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-09"});
assert.equal(profiles.length,geography.places.length);
const cases=[
 ["place:DE:kevelaer-kerzenkapelle","place:DE:kevelaer-gnadenkapelle","Kerzenkapelle"],
 ["place:GB:holywell-st-winefride-church","place:GB:holywell-st-winefride","St Winefride's RC Church"]
];
for(const [childId,parentId,query] of cases){
 const child=explorePlaceProfile(profiles,childId),parent=explorePlaceProfile(profiles,parentId);
 assert.ok(child&&parent);
 assert.equal(child.related_places.length,1);
 assert.equal(parent.related_places.length,1);
 assert.equal(child.related_places[0].place_id,parentId);
 assert.equal(parent.related_places[0].place_id,childId);
 assert.equal(child.counts.shrines,0,"a parish church or candle chapel is not a second canonical shrine by association");
 assert.equal(child.geo.lat,null,"coordinates must not be inherited from the related shrine");
 assert.equal(child.geo.lng,null);
 assert.ok(child.directions_url.includes("query="),"a valid street address must be available for directions");
 assert.ok(!child.directions_url.includes("query=0%2C0"),"null coordinates must not send pilgrims to Null Island");
 assert.ok(parent.sources.some(x=>x.role==="RELATIONSHIP"&&x.url.startsWith("https://")));
 const hits=filterExploreItems(projection.byLens.shrines,{query});
 assert.ok(hits.some(x=>x.place_id===parentId),"the child place name must be discoverable through the associated shrine search");
 const en=renderExploreToString(buildExploreViewModel({language:"en",items:hits,lens:"shrines",counts:projection.counts,view:"list",selectedPlaceId:parentId,placeProfiles:profiles}));
 const fr=renderExploreToString(buildExploreViewModel({language:"fr",items:hits,lens:"shrines",counts:projection.counts,view:"list",selectedPlaceId:parentId,placeProfiles:profiles}));
 assert.ok(en.includes('data-explore-open-place="'+childId+'"'));
 assert.ok(fr.includes('data-explore-open-place="'+childId+'"'));
 assert.match(en,/RELATED PLACES/);
 assert.match(fr,/LIEUX ASSOCIÉS/);
 assert.ok(!en.includes('data-explore-place-owner="'+childId+'"'),"the primary profile remains the selected owner until tapped");
}
console.log("PASS Explore related-place search, bidirectional links, EN/FR and null-coordinate address fallback");
