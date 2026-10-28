import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CALENDAR_SEMANTIC_REGISTRY} from "../src/calendar/intelligence.js";
import {CONNECTED_SACRED_ENTITIES_VERSION,deriveConnectedSacredEntities,
  connectedPlaceReferences} from "../src/find/connected-sacred-entities.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const data={
  geography:read("data/geography/seed-registry.v1.json"),
  shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json"),
  customs:read("data/customs/customs-atlas-seed.v1.json"),
  phenomena:read("data/explore/sacred-phenomena-seed.v1.json"),
  saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
  saintsCalendarBridge:read("data/saints/parallel-owner-identity-bridge-20261015.v1.json"),
};
const calendarSemanticKeys=Object.keys(CALENDAR_SEMANTIC_REGISTRY);
const graph=deriveConnectedSacredEntities(data,{calendarSemanticKeys});
assert.equal(graph.schema,CONNECTED_SACRED_ENTITIES_VERSION);
assert.ok(graph.public_context.length>0);
assert.ok(graph.editorial_review.length>0);
assert.equal(new Set([...graph.public_context,...graph.editorial_review].map(x=>x.id)).size,
  graph.public_context.length+graph.editorial_review.length);
assert.ok([...graph.public_context,...graph.editorial_review].every(x=>
  x.provenance.source_ids.length>0&&!Object.hasOwn(x,"geo")&&!Object.hasOwn(x,"mass_schedule")));
assert.ok(graph.public_context.every(x=>x.from.type==="place"&&
  data.geography.places.some(p=>p.place_id===x.from.id)));

const place=id=>connectedPlaceReferences(graph,id);
const editorial=id=>connectedPlaceReferences(graph,id,{includeEditorial:true});
const has=(arr,relation,to)=>arr.some(x=>x.relation===relation&&x.to.id===to);
const chartres=place("place:FR:chartres-notre-dame");
assert.ok(has(chartres,"PILGRIMAGE_CALENDAR_CONTEXT","liturgical.pentecost_monday"));
assert.ok(!chartres.some(x=>x.to.type==="person"),"a patron or Calendar date must not synthesize a person identity");

const paray=place("place:FR:sanctuaire-sacre-coeur-paray");
assert.ok(has(paray,"PLACE_ATTESTED_CUSTOM","DOM-006"));
assert.ok(has(paray,"PILGRIMAGE_CALENDAR_CONTEXT","feast.sacred_heart"));
assert.ok(has(paray,"ATTESTED_RELIC_CUSTODY","relic:FR:margaret-mary-paray"));
assert.ok(!has(paray,"DOCUMENTED_PERSON_SHRINE_ASSOCIATION","saint:margaret-mary-alacoque"),
  "research-only biography cannot become a public cross-link");
assert.ok(has(editorial("place:FR:sanctuaire-sacre-coeur-paray"),
  "DOCUMENTED_PERSON_SHRINE_ASSOCIATION","saint:margaret-mary-alacoque"));

const anne=place("place:FR:sainte-anne-d-auray");
assert.ok(has(anne,"PLACE_ATTESTED_CUSTOM","DEV-007"));
assert.ok(!anne.some(x=>x.to.type==="person"),
  "name in shrine text does not establish a canonical saint ID");

const notre=place("place:FR:notre-dame-paris");
const passion=["relic:FR:crown-of-thorns-paris","relic:FR:cross-paris","relic:FR:holy-nail-paris"];
for(const id of passion)assert.ok(has(notre,"ATTESTED_RELIC_CUSTODY",id),id);
for(const row of notre.filter(x=>x.relation==="ATTESTED_RELIC_CUSTODY")){
  assert.equal(row.relic_authenticity,"NOT_INDEPENDENTLY_CERTIFIED");
  assert.equal(row.visitor_access,"NOT_ASSERTED");
}
assert.ok(!notre.some(x=>x.to.type==="calendar_semantic"),
  "relic presence alone creates no feast or devotional event");
const pilgrim=editorial("place:MU:pere-laval-sainte-croix");
assert.ok(has(pilgrim,"DOCUMENTED_PERSON_SHRINE_ASSOCIATION","blessed:jacques-desire-laval"));
assert.ok(!place("place:MU:pere-laval-sainte-croix").some(x=>x.to.type==="person"));

const identity=graph.editorial_review.filter(x=>x.relation==="EXACT_REVIEWED_PERSON_IDENTITY");
assert.ok(identity.some(x=>x.from.id==="saint:therese-of-lisieux"&&
  x.to.id==="saint.therese-lisieux"));
assert.ok(identity.every(x=>x.to.type==="calendar_person"&&
  !Object.hasOwn(x,"feast_date")&&!Object.hasOwn(x,"mass_proper_id")));

const missing=deriveConnectedSacredEntities({
  ...data,
  geography:{...data.geography,places:[]},
},{calendarSemanticKeys});
assert.equal(missing.public_context.length,0);
assert.equal(missing.editorial_review.filter(x=>x.from.type==="place").length,0);
assert.deepEqual(connectedPlaceReferences(graph,"place:ZZ:never-verified"),[]);
assert.deepEqual(connectedPlaceReferences(graph,""),[]);
assert.ok(Object.isFrozen(graph.public_context));
console.log("Connected sacred entities P64: source-owned edges, Calendar boundaries, Saints holds, Customs and relics PASS");
