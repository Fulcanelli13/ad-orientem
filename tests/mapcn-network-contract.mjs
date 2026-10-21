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
  shrines:[{shrine_id:"shrine:a",place_id:"place:a",name:"Shrine of the Well",associated_saints:["Saint Example","Saint Example"],source_ids:["SH-1"]}],
  pilgrimages:[{pilgrimage_id:"pilgrimage:a",name:"To the Well",destination_shrine_id:"shrine:a",
    route_ids:["route:a"],source_ids:["SH-1"]}],
  routes:[{route_id:"route:a",name:"A documented walk",destination_place_id:"place:a",
    waypoint_place_ids:["place:b"],source_ids:["ROUTE-1"]}],
  routeStageSiteLinks:[{stage_id:"route:a#stage-2",canonical_place_id:"place:b",
    original_stage_name:"Stage B",coordinate_source:"CANONICAL_GEOGRAPHY_ONLY",
    site_relation:"MATCHED_SITE"}],
  routeStageEvidence:[{route_id:"route:a",waypoints:[
    {waypoint_id:"route:a#stage-2",name_en:"Stage B",source_url:"https://example.org/stage"}]}],
  temporalLinks:[{temporal_link_id:"temporal:a",subject_id:"pilgrimage:a",
    binding_state:"BOUND_TO_CALENDAR",calendar_semantic_key:"feast.local",
    source_event_label:"A local feast",source_ids:["SH-1"]},
    {temporal_link_id:"unbound",subject_id:"pilgrimage:a",binding_state:"RESEARCH_ONLY",
      calendar_semantic_key:"feast.inferred",source_ids:["SH-1"]}]
 },
 sacredPhenomena:{
  relics:[{id:"relic:a",place_id:"place:a",title_en:"A recorded relic",
    authentication:"NOT_INDEPENDENTLY_CERTIFIED_BY_APP",
    associated_person:"Saint Example",source_url:"https://example.org/relic"}],
  apparitions:[{id:"apparition:a",place_id:"place:b",title_en:"An apparition tradition",
    recognition_record:"NOT_APPROVED",source_url:"https://example.org/apparition"}]
 },
 customs:{
  customs:[{custom_id:"DEV-009",name:"Ex-votos",family:"Sacred objects",publication_state:"PUBLISHED"},
    {custom_id:"HOLD-01",name:"Unpublished",publication_state:"CONTEXT_ONLY"}],
  sources:[{id:"CUSTOM-1",issuer:"Shrine publisher",url:"https://example.org/exvotos"},
    {id:"CUSTOM-UNSAFE",issuer:"Unknown",url:"http://example.org/unsafe"}],
  attestations:[
    {attestation_id:"att:one",custom_id:"DEV-009",place_id:"place:a",
      geographic_precision:"PLACE",map_policy:"PLACE",source_ids:["CUSTOM-1"]},
    {attestation_id:"att:duplicate",custom_id:"DEV-009",place_id:"place:a",
      geographic_precision:"PLACE",map_policy:"PLACE",source_ids:["CUSTOM-1"]},
    {attestation_id:"att:area",custom_id:"DEV-009",place_id:null,
      geographic_precision:"COUNTRY",map_policy:"AREA_CONTEXT",place_name_hint:"Guess",
      source_ids:["CUSTOM-1"]},
    {attestation_id:"att:unpublished",custom_id:"HOLD-01",place_id:"place:b",
      geographic_precision:"PLACE",map_policy:"PLACE",source_ids:["CUSTOM-1"]},
    {attestation_id:"att:unsafe",custom_id:"DEV-009",place_id:"place:c",
      geographic_precision:"PLACE",map_policy:"PLACE",source_ids:["CUSTOM-UNSAFE"]}
  ]
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

test("Published customs require exact canonical Place, publisher, and HTTPS evidence",()=>{
 const graph=buildSacredNetwork(sample);
 const customs=graph.edges.filter(e=>e.kind==="CUSTOM_ATTESTED_PLACE");
 assert.equal(customs.length,1,"Duplicate exact custom/place claims must collapse");
 assert.equal(customs[0].from,"custom:DEV-009");
 assert.equal(customs[0].to,"place:a");
 assert.equal(customs[0].source.url,"https://example.org/exvotos");
 assert.ok(!graph.nodes.some(n=>n.id==="HOLD-01"));
 assert.ok(!graph.edges.some(e=>["att:area","att:unsafe","att:unpublished"].includes(e.recordId)));
 const noPublisher=structuredClone(sample);
 noPublisher.customs.sources[0].issuer="";
 assert.equal(buildSacredNetwork(noPublisher).edges.some(e=>e.kind==="CUSTOM_ATTESTED_PLACE"),false);
});
test("Person mentions remain record-scoped, never canonical Saints catalogue links",()=>{
 const graph=buildSacredNetwork(sample);
 const people=graph.nodes.filter(n=>n.type==="person");
 assert.equal(people.length,2);
 assert.equal(graph.edges.filter(e=>e.kind==="PERSON_SOURCE_MENTION").length,2);
 assert.ok(people.every(n=>n.key.startsWith("person:")&&!n.key.startsWith("saint:")));
 assert.ok(graph.edges.filter(e=>e.kind==="PERSON_SOURCE_MENTION")
   .every(e=>/^https:\/\//.test(e.source.url)&&/Saints identity/.test(e.claimEn)));
 const hostile=structuredClone(sample);
 hostile.shrines.shrines[0].associated_saints=["<svg onload=alert(1)>"];
 const html=renderNetworkPanel({graph:buildSacredNetwork(hostile),
   filters:{networkFocus:"shrine:shrine:a"}});
 assert.ok(html.includes("&lt;svg onload=alert(1)&gt;"));
 assert.ok(!html.includes("<svg onload=alert(1)>"));
});
test("A route's generic source cannot authenticate an unmatched named waypoint",()=>{
 const graph=buildSacredNetwork(sample);
 assert.ok(graph.edges.some(e=>e.kind==="ROUTE_STAGE_SITE"&&
   e.recordId==="route:a#stage-2"&&e.source.url==="https://example.org/stage"));
 const missing=structuredClone(sample);
 missing.shrines.routeStageEvidence=[];
 assert.ok(!buildSacredNetwork(missing).edges.some(e=>e.recordId==="route:a#stage-2"));
 const mismatch=structuredClone(sample);
 mismatch.shrines.routeStageSiteLinks[0].original_stage_name="Wrong Stage";
 assert.ok(!buildSacredNetwork(mismatch).edges.some(e=>e.recordId==="route:a#stage-2"));
});
test("Both relationship categories have bilingual facets and direct custom folios",()=>{
 const graph=buildSacredNetwork(sample);
 assert.ok(networkFocus(graph,{kind:"custom"}).results.every(n=>n.type==="custom"));
 assert.ok(networkFocus(graph,{kind:"person"}).results.every(n=>n.type==="person"));
 const en=renderNetworkPanel({graph,language:"en",filters:{networkFocus:"custom:DEV-009"}});
 assert.match(en,/data-network-open-custom="DEV-009"/);
 const fr=renderNetworkPanel({graph,language:"fr",filters:{networkFocus:"custom:DEV-009"}});
 assert.match(fr,/Ouvrir la coutume documentée/);
 const mention=renderNetworkPanel({graph,language:"fr",filters:{networkFocus:"person:relic:a"}});
 assert.match(mention,/aucune identité établie/);
 assert.doesNotMatch(mention,/data-saint-crosslink-target/);
});
