import assert from "node:assert/strict";
import {test} from "node:test";
import {buildSacredNetwork,networkFocus} from "../src/find/mapcn-network-model.js";
import {renderNetworkPanel} from "../src/find/mapcn-network-presentation.js";
const sample={
 geography:{places:[
   {place_id:"place:a",name:{official:"St Winifred's Well"}},
   {place_id:"place:b",name:{official:"St Winifred's Parish"}},
   {place_id:"place:c",name:{official:"Another church"}}
 ],placeRelationships:[
   {id:"rel:ab",source_place_id:"place:a",target_place_id:"place:b",
    relationship_kind:"PARISH_AND_ASSOCIATED_SHRINE",
    description_en:"Separate sites, one parish association",
    source_url:"https://example.org/well",source_label:"Parish source"},
   {id:"rel:missing",source_place_id:"place:c",target_place_id:"place:a",
    relationship_kind:"SAME_PILGRIMAGE_PRECINCT",source_url:"http://unsafe.test"},
 ]},
 shrines:{
  sources:[{id:"SH-1",url:"https://example.org/shrine",title:"Shrine authority"},
    {id:"ROUTE-1",url:"https://example.org/route",title:"Organizer"}],
  shrines:[{shrine_id:"shrine:a",place_id:"place:a",name:"Shrine of the Well",source_ids:["SH-1"]}],
  pilgrimages:[{pilgrimage_id:"pilgrimage:a",name:"To the Well",destination_shrine_id:"shrine:a",
    route_ids:["route:a"],source_ids:["SH-1"]}],
  routes:[{route_id:"route:a",name:"A documented walk",destination_place_id:"place:a",
    waypoint_place_ids:["place:b"],source_ids:["ROUTE-1"]}],
  routeStageSiteLinks:[{stage_id:"route:a#stage-2",canonical_place_id:"place:b",
    site_relation:"MATCHED_SITE"}],
  temporalLinks:[{temporal_link_id:"temporal:a",subject_id:"pilgrimage:a",
    binding_state:"BOUND_TO_CALENDAR",calendar_semantic_key:"feast.local",
    source_event_label:"A local feast",source_ids:["SH-1"]},
    {temporal_link_id:"unbound",subject_id:"pilgrimage:a",binding_state:"RESEARCH_ONLY",
      calendar_semantic_key:"feast.inferred",source_ids:["SH-1"]}]
 },
 sacredPhenomena:{
  relics:[{id:"relic:a",place_id:"place:a",title_en:"A recorded relic",
    authentication:"NOT_INDEPENDENTLY_CERTIFIED_BY_APP",
    source_url:"https://example.org/relic"}],
  apparitions:[{id:"apparition:a",place_id:"place:b",title_en:"An apparition tradition",
    recognition_record:"NOT_APPROVED",source_url:"https://example.org/apparition"}]
 }
};
test("Every edge derives from exact record keys and a cited HTTPS source",()=>{
 const graph=buildSacredNetwork(sample);
 assert.ok(graph.edges.length>=9);
 assert.ok(graph.nodes.some(n=>n.id==="place:a"));
 assert.ok(graph.nodes.some(n=>n.type==="calendar"&&n.id==="feast.local"));
 assert.ok(graph.edges.every(e=>/^https:\/\//.test(e.source.url)));
 assert.ok(graph.edges.some(e=>e.kind==="ROUTE_STAGE_SITE"));
 assert.ok(graph.edges.some(e=>e.kind==="PILGRIMAGE_DESTINATION"));
 assert.ok(!graph.nodes.some(n=>n.id==="feast.inferred"));
 assert.ok(!graph.edges.some(e=>e.recordId==="rel:missing"));
 assert.ok(graph.rejections.missingSource>=1);
});
test("Physical places stay distinct and graph never joins saint names",()=>{
 const graph=buildSacredNetwork(sample);
 assert.notEqual(graph.byKey.get("place:a"),graph.byKey.get("place:b"));
 assert.ok(!graph.nodes.some(n=>n.type==="saint"));
 assert.ok(!graph.edges.some(e=>e.kind==="SAME_PERSON_INFERRED"));
 assert.ok(graph.nodes.every(n=>graph.neighbors.has(n.key)));
});
test("Graph admits only source-backed relic and apparition associations",()=>{
 const graph=buildSacredNetwork(sample);
 const relic=graph.edges.find(e=>e.kind==="RELIC_AT_SITE");
 assert.match(relic.claimEn,/not independently certified/);
 const app=graph.edges.find(e=>e.kind==="APPARITION_AT_SITE");
 assert.match(app.claimEn,/not an app declaration/);
 const variant=structuredClone(sample);
 variant.sacredPhenomena.relics[0].source_url="";
 assert.equal(buildSacredNetwork(variant).edges.some(e=>e.kind==="RELIC_AT_SITE"),false);
});
test("Search and facet focus remain bounded and respect selected entity IDs",()=>{
 const graph=buildSacredNetwork(sample);
 const focused=networkFocus(graph,{focus:"place:a",kind:"place",limit:10});
 assert.equal(focused.current.key,"place:a");
 assert.ok(focused.connections>0);
 assert.ok(focused.relations.length<=10);
 assert.equal(networkFocus(graph,{search:"not actually a node"}).matching,0);
});
test("Network view is bilingual, keyboard-accessible, escapes source labels and opens canonical Place only",()=>{
 const graph=buildSacredNetwork(sample);
 const en=renderNetworkPanel({graph,language:"en",filters:{networkFocus:"place:a"}});
 assert.match(en,/data-network-panel/);
 assert.match(en,/aoNetworkGraph/);
 assert.match(en,/role="button" tabindex="0"/);
 assert.match(en,/data-explore-open-place="place:a"/);
 assert.match(en,/href="https:\/\/example.org\/well"/);
 assert.match(en,/not routes, distances|not geographical/i);
 const fr=renderNetworkPanel({graph,language:"fr",filters:{networkFocus:"place:a"}});
 assert.match(fr,/Liens sacrés/);
 assert.match(fr,/relations documentées|Relations documentées/);
 assert.ok(!/<script|onerror=/.test(fr));
});
test("Untrusted canonical names are escaped in SVG and HTML",()=>{
 const hostile=structuredClone(sample);
 hostile.geography.places[0].name.official='<img src=x onerror=alert(1)>';
 const graph=buildSacredNetwork(hostile);
 const html=renderNetworkPanel({graph,filters:{networkFocus:"place:a"}});
 assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"));
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
});
