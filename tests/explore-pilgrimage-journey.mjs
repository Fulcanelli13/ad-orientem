import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPilgrimageItems} from "../src/find/explore-projection.js";
import {
  buildPilgrimageJourneyCatalogue,selectedPilgrimageJourney,
  renderPilgrimageJourneyPanel,
} from "../src/find/pilgrimage-journey.js";

const seed=JSON.parse(readFileSync(new URL("../data/shrines/shrines-pilgrimages-seed.v1.json",import.meta.url),"utf8"));
const registry=JSON.parse(readFileSync(new URL("../data/shrines/source-registry.v1.json",import.meta.url),"utf8"));
const geography=JSON.parse(readFileSync(new URL("../data/geography/seed-registry.v1.json",import.meta.url),"utf8"));
const projected=projectPilgrimageItems({
 pilgrimages:seed.pilgrimages,shrines:seed.shrines,
 routes:seed.routes,temporalLinks:seed.temporalLinks,
 places:geography.places,sources:registry.sources,
});
const journeys=buildPilgrimageJourneyCatalogue(projected,registry.sources);
assert.equal(seed.pilgrimages.length,240,"Do not confuse source destinations with mapped routes");
assert.equal(seed.routes.length,20);
assert.equal(journeys.length,20,"Show all 20 source-linked route identities, no inferred extras");
assert.equal(new Set(journeys.map(j=>j.id)).size,20);
assert.ok(journeys.every(j=>j.routeGeometry===null&&j.stops.length===0),
  "Published corpus has no verified route lines or intermediate stops");
assert.ok(journeys.every(j=>j.sources.length>0&&
 j.sources.every(src=>src.url.startsWith("https://"))),
 "Each selected route must provide real original source evidence");
assert.ok(journeys.every(j=>j.state==="DOCUMENTED_UNMAPPED"));
assert.ok(journeys.every(j=>j.origin&&j.destination&&j.destinationPlaceId));
const chartres=journeys.find(row=>row.id==="route:FR:paris-chartres-pentecost");
assert.ok(chartres);
assert.equal(chartres.stageCount,3,"Reported source stage count is retained without invented points");
assert.equal(chartres.stops.length,0);
const mauritius=journeys.find(row=>row.id==="route:MU:pere-laval-saint-louis");
assert.ok(mauritius&&mauritius.origin.includes("Saint-Louis"));
assert.equal(mauritius.destinationPlaceId,"place:MU:pere-laval-sainte-croix");
assert.equal(selectedPilgrimageJourney(journeys,chartres.id)?.id,chartres.id);
assert.equal(selectedPilgrimageJourney(journeys,"missing")?.id,journeys[0].id);
const en=renderPilgrimageJourneyPanel({routes:journeys,selectedId:chartres.id,language:"en"});
const fr=renderPilgrimageJourneyPanel({routes:journeys,selectedId:chartres.id,language:"fr"});
assert.equal((en.match(/data-explore-journey-select=/g)||[]).length,20);
assert.match(en,/documented routes/);
assert.match(en,/Saint-Sulpice/);
assert.match(en,/individual locations not yet mapped/);
assert.match(en,/data-explore-journey-destination=/);
assert.match(fr,/parcours attestés/);
assert.match(fr,/Sources originales/);
assert.doesNotMatch(en,/(?:data-explore-journey-waypoint|route-polyline|turn-by-turn directions\s+available)/i);
const poisoned=buildPilgrimageJourneyCatalogue([
 {lens:"pilgrimages",place_id:"place:a",map_publishable:true,
  geo:{lat:null,lng:null},raw:{shrine:{name:"Shrine"},routes:[
    {route_id:"route:fake",name:"Unmapped text",origin_label:"Old church",
     destination_place_id:"place:a",route_state:"DOCUMENTED_UNMAPPED",source_ids:[]},
    {route_id:"route:mismatch",name:"Other destination",origin_label:"Old church",
     destination_place_id:"place:b",source_ids:[]},
  ]}}
],[]);
assert.equal(poisoned.length,1);
assert.equal(poisoned[0].destinationGeo,null,"Null coordinate must not become a fabricated map point");
assert.equal(poisoned[0].sources.length,0,"Do not fabricate source URLs");
console.log("PASS D journey catalogue: 240 source pilgrimages, 20 routes, zero fabricated geometry, EN/FR + publisher evidence");
