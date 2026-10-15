import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const census=JSON.parse(readFileSync(new URL("../data/calendar/post1960-canonizations.official-batch1.v1.json",import.meta.url),"utf8"));
const pilot=JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-pilot.v1.json",import.meta.url),"utf8"));
assert.equal(census.schema,"AO_POST1960_CANONIZATION_EVENT_CENSUS_BATCH1_V1");
assert.equal(census.publicationStatus,"RESEARCH_ONLY_NOT_RUNTIME");
assert.equal(census.coverage.completeGlobal1960To2026,false);
assert.deepEqual(census.coverage.scopeYears,[1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2021,2022,2024,2025]);
assert.equal(census.years.length,25);
assert.equal(census.events.length,54);
assert.equal(census.persons.length,179);
assert.equal(census.groups.length,7);
assert.equal(census.groups.reduce((n,g)=>n+(g.unexpandedMemberCount??g.memberCount??0),0),207);
assert.equal(census.coverage.unverifiedApproximateGroupMembers,800);
assert.equal(census.coverage.groupsWithApproximateCounts,1);
const pIds=new Set(census.persons.map(p=>p.id));
const eIds=new Set(census.events.map(e=>e.id));
const gIds=new Set(census.groups.map(g=>"canon-group."+g.id));
assert.equal(pIds.size,179);assert.equal(eIds.size,54);assert.equal(gIds.size,7);
for(const p of census.persons){
  assert.match(p.id,/^saint\.[a-z0-9-]+$/);
  assert.equal(p.liturgicalDate.monthDay,null,"Never invent a universal memorial date");
  assert.equal(p.liturgicalDate.status,"UNVERIFIED_NO_INFERENCE");
  assert.equal(p.calendar1962SourceId,null);
  assert.match(p.canonizedOn,/^(?:19|20)\d\d-\d\d-\d\d$/);
  assert.ok(p.canonizedOn>"1960-07-26");
  assert.ok(eIds.has(p.canonizationEventId));
  assert.ok(p.sources.some(s=>s.startsWith("https://www.causesanti.va/")));
}
for(const e of census.events){
  assert.match(e.date,/^(?:19|20)\d\d-\d\d-\d\d$/);
  assert.equal(e.year,Number(e.date.slice(0,4)));
  assert.ok(["ORDINARY","EQUIVALENT_CANONIZATION"].includes(e.kind));
  assert.ok(e.namedIndividualIds.every(id=>pIds.has(id)));
  assert.ok(e.groupIds.every(id=>gIds.has(id)));
  assert.equal(new Set(e.namedIndividualIds).size,e.namedIndividualIds.length);
}
for(const g of census.groups){
  assert.ok(eIds.has(g.eventId));
  assert.ok(g.memberCount>1 || (g.memberCount===null && g.estimatedMemberCount>1 && g.countPrecision==="APPROXIMATELY_PER_DICASTERY_NOT_EXACT"));
  assert.ok(["UNEXPANDED_IN_THIS_BATCH","PARTIAL_IDENTITIES_NEED_EXPANSION"].includes(g.memberIdentityStatus));
  if(g.memberIdentityStatus==="PARTIAL_IDENTITIES_NEED_EXPANSION")assert.ok(g.individuallyIdentifiedPersonIds?.length>0 && g.unexpandedMemberCount>0);
  assert.ok(!pIds.has("saint."+g.id),"Do not count a group as a single saint");
}
assert.equal(census.events.filter(e=>e.date==="2025-09-07")[0].namedIndividualIds.length,2);
assert.equal(census.events.filter(e=>e.date==="2025-10-19")[0].namedIndividualIds.length,7);
assert.equal(census.events.find(e=>e.date==="2024-10-20").groupIds.length,1);
assert.equal(census.events.find(e=>e.date==="2024-12-18").kind,"EQUIVALENT_CANONIZATION");
assert.equal(census.events.find(e=>e.date==="2017-05-13").namedIndividualIds.length,2);
assert.equal(census.events.find(e=>e.date==="2017-10-15").groupIds.length,1);
assert.equal(census.persons.find(p=>p.id==="saint.teresa-calcutta").canonizedOn,"2016-09-04");
const pilotIds=new Set(pilot.persons.map(p=>p.id));
for(const reusedId of census.coverage.knownCanonicalPersonIdReuse)assert.ok(pIds.has(reusedId) && pilotIds.has(reusedId));
assert.equal(census.persons.find(p=>p.id==="saint.carlo-acutis").canonizedOn,
  pilot.persons.find(p=>p.id==="saint.carlo-acutis").recognition.canonizedOn);
assert.ok(pIds.has("saint.louis-martin") && pIds.has("saint.zelie-guerin"),"Both Martin parents have distinct identities");
assert.equal(census.events.find(e=>e.date==="2015-10-18").namedIndividualIds.filter(x=>/martin|guerin/.test(x)).length,2);
assert.equal(census.persons.find(p=>p.id==="saint.hildegard-bingen").canonizedOn,"2012-05-10");
assert.equal(census.events.find(e=>e.date==="2013-05-12").groupIds.length,1);
assert.equal(census.groups.find(g=>g.id==="martyrs-otranto-1480").estimatedMemberCount,800);
assert.equal(census.groups.find(g=>g.id==="martyrs-otranto-1480").memberCount,null);
assert.equal(census.persons.find(p=>p.id==="saint.pio-pietrelcina").canonizedOn,"2002-06-16");
assert.equal(census.events.find(e=>e.date==="1999-11-21").groupIds.length,1);
assert.equal(census.groups.find(g=>g.id==="martyrs-turon-lasallian-1934").memberCount,9);
for(const g of census.groups.filter(g=>g.individuallyIdentifiedPersonIds?.length)){
 assert.equal(g.memberCount,g.unexpandedMemberCount+g.individuallyIdentifiedPersonIds.length);
 assert.ok(g.individuallyIdentifiedPersonIds.every(id=>pIds.has(id)));
 assert.ok(g.individuallyIdentifiedPersonIds.every(id=>census.persons.find(p=>p.id===id)?.canonizationGroupIds?.includes("canon-group."+g.id)));
}
assert.equal(census.events.find(e=>e.date==="2000-10-01").namedIndividualIds.length,6);
assert.equal(census.years.find(y=>y.year===2000).sourceEventTotalPeople,151);
assert.equal(census.groups.find(g=>g.id==="martyrs-china-1648-1930").unexpandedMemberCount,117);
assert.equal(census.groups.find(g=>g.id==="martyrs-mexico-1927").unexpandedMemberCount,24);
assert.equal(census.coverage.knownGroupMembersAlreadyIncludedInNamedRecords,4);
console.log("Post-1960 official canonization census: PASS (54 events, 179 named persons, 7 groups; 207 unexpanded exact and ~800 estimated martyrs)");
