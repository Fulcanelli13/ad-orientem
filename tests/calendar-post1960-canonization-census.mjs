import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const census=JSON.parse(readFileSync(new URL("../data/calendar/post1960-canonizations.official-batch1.v1.json",import.meta.url),"utf8"));
const pilot=JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-pilot.v1.json",import.meta.url),"utf8"));
assert.equal(census.schema,"AO_POST1960_CANONIZATION_EVENT_CENSUS_BATCH1_V1");
assert.equal(census.publicationStatus,"RESEARCH_ONLY_NOT_RUNTIME");
assert.equal(census.coverage.completeGlobal1960To2026,false);
assert.deepEqual(census.coverage.scopeYears,[2014,2018,2019,2022,2024,2025]);
assert.equal(census.years.length,6);
assert.equal(census.events.length,13);
assert.equal(census.persons.length,49);
assert.equal(census.groups.length,2);
assert.equal(census.groups.reduce((n,g)=>n+g.memberCount,0),27);
const pIds=new Set(census.persons.map(p=>p.id));
const eIds=new Set(census.events.map(e=>e.id));
const gIds=new Set(census.groups.map(g=>"canon-group."+g.id));
assert.equal(pIds.size,49);assert.equal(eIds.size,13);assert.equal(gIds.size,2);
for(const p of census.persons){
  assert.match(p.id,/^saint\.[a-z0-9-]+$/);
  assert.equal(p.liturgicalDate.monthDay,null,"Never invent a universal memorial date");
  assert.equal(p.liturgicalDate.status,"UNVERIFIED_NO_INFERENCE");
  assert.equal(p.calendar1962SourceId,null);
  assert.match(p.canonizedOn,/^20\d\d-\d\d-\d\d$/);
  assert.ok(eIds.has(p.canonizationEventId));
  assert.ok(p.sources.some(s=>s.startsWith("https://www.causesanti.va/")));
}
for(const e of census.events){
  assert.match(e.date,/^20\d\d-\d\d-\d\d$/);
  assert.equal(e.year,Number(e.date.slice(0,4)));
  assert.ok(["ORDINARY","EQUIVALENT_CANONIZATION"].includes(e.kind));
  assert.ok(e.namedIndividualIds.every(id=>pIds.has(id)));
  assert.ok(e.groupIds.every(id=>gIds.has(id)));
  assert.equal(new Set(e.namedIndividualIds).size,e.namedIndividualIds.length);
}
for(const g of census.groups){
  assert.ok(eIds.has(g.eventId));
  assert.ok(g.memberCount>1);
  assert.equal(g.memberIdentityStatus,"UNEXPANDED_IN_THIS_BATCH");
  assert.ok(!pIds.has("saint."+g.id),"Do not count a group as a single saint");
}
assert.equal(census.events.filter(e=>e.date==="2025-09-07")[0].namedIndividualIds.length,2);
assert.equal(census.events.filter(e=>e.date==="2025-10-19")[0].namedIndividualIds.length,7);
assert.equal(census.events.find(e=>e.date==="2024-10-20").groupIds.length,1);
assert.equal(census.events.find(e=>e.date==="2024-12-18").kind,"EQUIVALENT_CANONIZATION");
const pilotIds=new Set(pilot.persons.map(p=>p.id));
for(const reusedId of census.coverage.knownCanonicalPersonIdReuse)assert.ok(pIds.has(reusedId) && pilotIds.has(reusedId));
assert.equal(census.persons.find(p=>p.id==="saint.carlo-acutis").canonizedOn,
  pilot.persons.find(p=>p.id==="saint.carlo-acutis").recognition.canonizedOn);
console.log("Post-1960 official canonization census: PASS (13 events, 49 named persons, 2 groups containing 27 persons)");
