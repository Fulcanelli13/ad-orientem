import assert from "node:assert/strict";
import {test} from "node:test";
import {buildSacredRelationshipNetwork,sacredNetworkNeighborhood} from "../src/find/mapcn-sacred-network.js";
import {renderSacredNetworkPanel} from "../src/find/mapcn-sacred-network-presentation.js";
const place=id=>({place_id:id,name:{official:id}});
const shrSource={id:"S-1",title:"Sanctuary",url:"https://example.org/source"};
const csSource={id:"C-1",title:"Custom attestation",url:"https://example.org/custom"};
function dataset(){
 return {
  geography:{places:[place("place:lourdes"),place("place:chapel"),place("place:well")],
   placeRelationships:[{source_place_id:"place:chapel",target_place_id:"place:well",
    relationship_kind:"PARISH_AND_ASSOCIATED_SHRINE",description_en:"Parish and shrine separately addressed",
    source_url:"https://example.org/related"},
    {source_place_id:"place:lourdes",target_place_id:"place:well",description_en:"Unsupported",source_url:""}]},
  shrines:{sources:[shrSource],
   shrines:[{shrine_id:"shrine:lourdes",place_id:"place:lourdes",name:"Lourdes Shrine",
     associated_saints:["St Bernadette"],source_ids:["S-1"]}],
   pilgrimages:[{pilgrimage_id:"pilgrimage:lourdes",name:"Pilgrimage to Lourdes",
     destination_shrine_id:"shrine:lourdes",source_ids:["S-1"]}],
   routes:[{route_id:"route:verified",name:"Pilgrim walk",destination_place_id:"place:well",source_ids:["S-1"]}],
   routeStageEvidence:[{route_id:"route:verified",waypoints:[
     {waypoint_id:"route:verified#stage-1",name_en:"Parish Chapel",source_url:"https://example.org/stage"}]}],
   routeStageSiteLinks:[{stage_id:"route:verified#stage-1",canonical_place_id:"place:chapel",
     original_stage_name:"Parish Chapel",site_relation:"MATCHED_SITE",
     coordinate_source:"CANONICAL_GEOGRAPHY_ONLY"}],
   temporalLinks:[{temporal_link_id:"time:one",subject_type:"PILGRIMAGE",
     subject_id:"pilgrimage:lourdes",binding_state:"BOUND_TO_CALENDAR",
     calendar_semantic_key:"feast.lourdes",source_event_label:"Our Lady of Lourdes",source_ids:["S-1"]}]},
  sacredPhenomena:{relics:[{id:"relic:one",place_id:"place:lourdes",title_en:"Relic of A",
    associated_person:"St Example",source_url:"https://example.org/relic"},
   {id:"relic:invalid",place_id:"place:chapel",title_en:"Unverified",
    source_url:"http://untrusted.example"}],
   apparitions:[{id:"apparition:lourdes",place_id:"place:lourdes",title_en:"Our Lady of Lourdes",
     source_url:"https://example.org/apparition",recognition_record:"HISTORICALLY_APPROVED"}]},
  customs:{sources:[csSource],
   customs:[{custom_id:"one",name:"Local custom",publication_state:"PUBLISHED"},
     {custom_id:"unpublished",name:"No public witness",publication_state:"DRAFT"}],
   attestations:[{attestation_id:"one",place_id:"place:well",custom_id:"one",
      map_policy:"PLACE_CONTEXT",source_ids:["C-1"]},
     {attestation_id:"not-public",place_id:"place:well",custom_id:"unpublished",
      source_ids:["C-1"]}]}
 };
}
test("Network only uses exact canonical ID joins with source URLs",()=>{
 const g=buildSacredRelationshipNetwork(dataset());
 assert.ok(g.totalNodes>=10);
 assert.ok(g.totalEdges>=9);
 for(const edge of g.edges){
   assert.match(edge.url,/^https:\/\//);
   assert.ok(g.byId.has(edge.from)&&g.byId.has(edge.to));
 }
 assert.equal(g.byId.has("relic:invalid"),false);
 assert.equal(g.byId.has("custom:unpublished"),false);
 assert.equal(g.edges.some(e=>e.description==="Unsupported"),false);
});
test("Explicit stage-site link is contextual, not a walking line",()=>{
 const graph=buildSacredRelationshipNetwork(dataset());
 const stage=graph.edges.find(x=>x.description.includes("Parish Chapel"));
 assert.ok(stage);
 assert.equal(stage.from,"route:verified");
 assert.equal(stage.to,"place:chapel");
 assert.match(stage.description,/canonical site/);
 const bad=dataset();
 bad.shrines.routeStageSiteLinks[0].original_stage_name="Different person's stage";
 assert.equal(buildSacredRelationshipNetwork(bad).edges.some(x=>x.description.includes("Parish Chapel")),false);
});
test("Sourced person is a mention, never a canonical Saints identity",()=>{
 const g=buildSacredRelationshipNetwork(dataset());
 const person=g.nodes.find(n=>n.label==="St Bernadette");
 assert.ok(person.attributionOnly);
 assert.match(person.id,/^person-mention:/);
 assert.equal(g.nodes.some(n=>n.id==="saint:bernadette"),false);
});
test("Calendar is only semantic contextual association; no computed feast date",()=>{
 const g=buildSacredRelationshipNetwork(dataset());
 const association=g.edges.find(e=>e.type==="CALENDAR");
 assert.ok(association);
 assert.match(association.description,/not an automatically computed occurrence/);
 assert.equal(g.byId.get(association.to).label,"Our Lady of Lourdes");
});
test("Network selection and filters are deterministic and do not modify graph",()=>{
 const g=buildSacredRelationshipNetwork(dataset());
 const n=sacredNetworkNeighborhood(g,"place:lourdes");
 assert.equal(n.root.id,"place:lourdes");
 assert.ok(n.total>=3);
 assert.equal(sacredNetworkNeighborhood(g,"place:lourdes",{kind:"APPARITION"}).total,1);
 assert.equal(sacredNetworkNeighborhood(g,"place:lourdes",{kind:"CUSTOM"}).total,0);
 assert.equal(g.edges.length,g.totalEdges);
});
test("Bilingual source cards, graphical edges and script-safe content",()=>{
 const g=buildSacredRelationshipNetwork(dataset());
 const en=renderSacredNetworkPanel({network:g,rootId:"place:lourdes",language:"en"});
 assert.match(en,/data-sacred-network-panel/);
 assert.match(en,/aoSacredNetworkGraph/);
 assert.match(en,/not roads, journeys/);
 assert.match(en,/Read original source/);
 assert.match(en,/data-network-close/);
 const fr=renderSacredNetworkPanel({network:g,rootId:"place:lourdes",language:"fr"});
 assert.match(fr,/Liens sacrés/);
 assert.match(fr,/Lire la source originale/);
 const evil=dataset();
 evil.sacredPhenomena.relics[0].title_en="<img src=x onerror=alert(1)>";
 const escaped=renderSacredNetworkPanel({network:buildSacredRelationshipNetwork(evil),rootId:"place:lourdes"});
 assert.doesNotMatch(escaped,/<img src=x onerror/);
 assert.match(escaped,/&lt;img src=x onerror=alert\(1\)&gt;/);
});
