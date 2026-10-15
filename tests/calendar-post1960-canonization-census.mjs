import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const census=JSON.parse(readFileSync(new URL("../data/calendar/post1960-canonizations.official-batch1.v1.json",import.meta.url),"utf8"));
const pilot=JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-pilot.v1.json",import.meta.url),"utf8"));
assert.equal(census.schema,"AO_POST1960_CANONIZATION_EVENT_CENSUS_BATCH1_V1");
assert.equal(census.publicationStatus,"RESEARCH_ONLY_NOT_RUNTIME");
assert.equal(census.coverage.completeGlobal1960To2026,false);
assert.deepEqual(census.coverage.scopeYears, [...census.years.map(y=>y.year)].sort((a,b)=>a-b));
assert.equal(census.coverage.all51OfficialIndexYearsTranscribed,true);
assert.equal(census.years.length,51);
assert.equal(census.events.length,112);
assert.equal(census.persons.length,258);
assert.equal(census.groups.length,13);
assert.equal(census.groups.reduce((n,g)=>n+(g.unexpandedMemberCount??g.memberCount??0),0),497);
assert.equal(census.coverage.unverifiedApproximateGroupMembers,800);
assert.equal(census.coverage.groupsWithApproximateCounts,1);
const pIds=new Set(census.persons.map(p=>p.id));
const eIds=new Set(census.events.map(e=>e.id));
const gIds=new Set(census.groups.map(g=>"canon-group."+g.id));
assert.equal(pIds.size,258);assert.equal(eIds.size,112);assert.equal(gIds.size,13);
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
  assert.ok(["ORDINARY","EQUIVALENT_CANONIZATION","DICASTERY_LISTED_FORM_NOT_INDEPENDENTLY_CHECKED"].includes(e.kind));
  assert.ok(e.namedIndividualIds.every(id=>pIds.has(id)));
  assert.ok(e.groupIds.every(id=>gIds.has(id)));
  assert.equal(new Set(e.namedIndividualIds).size,e.namedIndividualIds.length);
}
for(const g of census.groups){
  assert.ok(eIds.has(g.eventId));
  assert.ok(g.memberCount>1 || (g.memberCount===null && g.estimatedMemberCount>1 && g.countPrecision==="APPROXIMATELY_PER_DICASTERY_NOT_EXACT"));
  assert.ok(["UNEXPANDED_IN_THIS_BATCH","PARTIAL_IDENTITIES_NEED_EXPANSION","ALL_MEMBERS_NAMED_IN_THIS_BATCH"].includes(g.memberIdentityStatus));
  if(g.memberIdentityStatus==="ALL_MEMBERS_NAMED_IN_THIS_BATCH")assert.equal(g.unexpandedMemberCount,0);
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
assert.equal(census.coverage.knownGroupMembersAlreadyIncludedInNamedRecords,15);
assert.equal(census.events.find(e=>e.date==="1964-10-18").groupIds.length,1);
assert.equal(census.groups.find(g=>g.id==="uganda-martyrs-22").unexpandedMemberCount,20);
assert.equal(census.groups.find(g=>g.id==="korean-martyrs-103").unexpandedMemberCount,101);
assert.equal(census.groups.find(g=>g.id==="vietnamese-martyrs-117").unexpandedMemberCount,116);
assert.equal(census.groups.find(g=>g.id==="japan-martyrs-16-1987").unexpandedMemberCount,13);
assert.equal(census.groups.find(g=>g.id==="forty-martyrs-england-wales").unexpandedMemberCount,40);
assert.equal(census.groups.find(g=>g.id==="paraguay-jesuit-martyrs-3").unexpandedMemberCount,0);
assert.equal(census.persons.find(p=>p.id==="saint.jadwiga-queen-poland").identityAdjudication.status,"CERTIFIED_IDENTITY_BY_PAPAL_CANONIZATION_HOMILY");
assert.equal(census.persons.find(p=>p.id==="saint.jadwiga-queen-poland").publicationHold,undefined);
assert.equal(census.persons.find(p=>p.id==="saint.john-avila").canonizedOn,"1970-05-31");
console.log("Post-1960 official canonization census: PASS (51 official index years, 112 events, 258 named persons, 13 cohorts, 497 unexpanded exact + Otranto approximate)");
