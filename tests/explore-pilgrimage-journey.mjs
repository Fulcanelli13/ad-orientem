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
const evidence=JSON.parse(readFileSync(new URL("../data/shrines/route-stage-evidence-20261020.v1.json",import.meta.url),"utf8"));
assert.equal(evidence.schema,"AO_PILGRIMAGE_STAGE_EVIDENCE_V1");
const projected=projectPilgrimageItems({
 pilgrimages:seed.pilgrimages,shrines:seed.shrines,
 routes:seed.routes,temporalLinks:seed.temporalLinks,
 places:geography.places,sources:registry.sources,
});
const journeys=buildPilgrimageJourneyCatalogue(projected,registry.sources,evidence.routes);
assert.equal(evidence.routes.length,17,"Official-stage evidence now covers 17 itinerary identities");
assert.equal(evidence.routes.reduce((n,r)=>n+r.waypoints.length,0),64);
const canonicalRoutes=new Map(seed.routes.map(row=>[row.route_id,row]));
for(const entry of evidence.routes){
 assert.ok(canonicalRoutes.has(entry.route_id),"Do not create noncanonical route identity");
 assert.ok(/^https:\/\//.test(entry.source_url));
 assert.equal(entry.stage_geometry_policy,"NAMED_STAGES_ONLY_NO_WALKING_LINE");
 assert.deepEqual(entry.waypoints.map(w=>w.ordinal),
   entry.waypoints.map((w,i)=>i+1),"Organizer stages must retain source order");
 for(const waypoint of entry.waypoints){
  assert.equal(waypoint.lat,null);
  assert.equal(waypoint.lng,null);
  assert.equal(waypoint.geometry_status,"NAMED_UNMAPPED");
  assert.ok(waypoint.name_en&&waypoint.name_fr);
  assert.equal(waypoint.source_url,entry.source_url);
 }
}
assert.equal(journeys.reduce((n,r)=>n+r.namedStages.length,0),64);
assert.equal(journeys.filter(r=>r.namedStages.length>0).length,17);
assert.ok(journeys.every(j=>j.mappedStages.length===0),
 "Named stages are not navigable geographic stops");
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
assert.deepEqual(chartres.namedStages.map(stage=>stage.name),[
 "Saint-Sulpice Church, Paris","Choisel overnight camp","Gas overnight camp",
 "Notre-Dame Cathedral, Chartres",
]);
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
assert.match(en,/named stages from official evidence/);
assert.match(en,/Choisel overnight camp/);
assert.match(en,/Gas overnight camp/);
assert.equal((en.match(/data-journey-named-stage=/g)||[]).length,4);
assert.match(en,/data-explore-journey-destination=/);
assert.match(fr,/parcours attestés/);
assert.match(fr,/Sources originales/);
assert.match(fr,/Bivouac de Choisel/);
const paray=journeys.find(row=>row.id==="route:FR:paray-pilgrim-path");
assert.equal(paray.namedStages.length,4);
assert.equal(paray.namedStages[1].nameFr,"Chapelle Saint-Jean");
const walk=journeys.find(row=>row.id==="route:US:walk-to-mary");
assert.equal(walk.namedStages.length,4);
assert.ok(walk.officialMapUrl?.startsWith("https://www.google.com/maps/d/embed?"));
const walkHtml=renderPilgrimageJourneyPanel({routes:journeys,selectedId:walk.id});
assert.match(walkHtml,/Official interactive route map/);
assert.match(walkHtml,/St. Peter and Paul Parish/);
assert.ok(journeys.every(j=>j.routeGeometry===null&&j.stops.length===0));
const preith=journeys.find(j=>j.id==="route:DE:preith-bettbrunn");
assert.equal(preith.namedStages.length,9);
assert.equal(preith.namedStages[1].role,"PASS_THROUGH");
const belem=journeys.find(j=>j.id==="route:BR:belem-cathedral-nazare");
assert.equal(belem.namedStages.length,7);
assert.equal(belem.namedStages[3].role,"PASS_THROUGH");
const belemHtml=renderPilgrimageJourneyPanel({routes:journeys,selectedId:belem.id});
assert.match(belemHtml,/ROUTE PASSES THROUGH/);
assert.match(belemHtml,/11 October 2026/);
// Edition-specific source overrides must not manufacture a route endpoint.
const walsingham=journeys.find(j=>j.id==="route:GB:ely-walsingham-lms");
assert.equal(walsingham.destinationRelation,"RELATED_SHRINE_NOT_EVENT_ENDPOINT");
assert.equal(walsingham.destinationGeo,null);
assert.ok(walsingham.relatedShrineGeo,"Keep existing mapped Catholic shrine as a related place");
assert.equal(walsingham.namedStages.at(-1).name,"Walsingham Priory grounds (final Mass near Holy House site)");
const walsinghamHtml=renderPilgrimageJourneyPanel({routes:journeys,selectedId:walsingham.id});
assert.match(walsinghamHtml,/NOT the pilgrimage endpoint/);
assert.match(walsinghamHtml,/Explore related Catholic shrine/);
assert.doesNotMatch(walsinghamHtml,/data-explore-journey-focus/);
const martyrs=journeys.find(j=>j.id==="route:CA:canadian-martyrs-traditional");
assert.equal(martyrs.namedStages[0].name,"St Ignace II, 1645 Rosemount Road");
assert.equal(martyrs.namedStages[1].name,"Crystal Beach Park, Victoria Harbour (lunch)");
assert.equal(martyrs.namedStages[2].role,"DESTINATION");
const dutch=journeys.find(j=>j.id==="route:NL:winthagen-maastricht-sterre-der-zee");
assert.equal(dutch.namedStages.length,4);
assert.match(dutch.namedStages[2].name,/St Gerlachus/);
const zapopan=journeys.find(j=>j.id==="route:MX:guadalajara-zapopan-romeria");
assert.equal(zapopan.namedStages.length,10);
assert.equal(zapopan.namedStages[8].name,"Arco de Zapopan");
const remaining=journeys.filter(j=>!j.namedStages.length).map(j=>j.id).sort();
assert.deepEqual(remaining,[
 "route:NG:nne-enyemaka-rosary-procession",
 "route:NZ:nga-tapuwae-russell",
 "route:US:great-meadows-doylestown-czestochowa",
].sort());
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
console.log("PASS D journey catalogue: 240 pilgrimages, 20 routes, 64 named stages on 17 routes, zero fabricated geolocation, EN/FR + organizer sources");
