// Research coverage ledger for the living traditional Calendar.
// Canonization records certify who was enrolled among the saints, NOT feast dates.
// Keeps groups as one collective profile and later Doctor titles on one person.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const census=read("data/calendar/post1960-canonizations.official-batch1.v1.json");
const pilot=read("data/calendar/living-sanctoral-pilot.v1.json");
const doctors=read("data/calendar/doctors-of-church-roster.review.v1.json");
const dates=read("data/calendar/living-sanctoral-modern-observances.review.v1.json");
assert.equal(census.coverage.namedIndividualRecords,census.persons.length);
assert.equal(census.coverage.unexpandedGroupRecords,census.groups.length);
const index=new Map();
for(const person of census.persons){
  assert.ok(person?.id&&/^saint\./.test(person.id));
  assert.ok(!index.has(person.id),"Census duplicates the same canonized person "+person.id);
  index.set(person.id,person);
}
for(const person of pilot.persons){
  assert.ok(person?.id);
  if(!index.has(person.id))index.set(person.id,person);
}
const dateMap=new Map(),doctorMap=new Map();
for(const x of dates.observances){
  assert.ok(index.has(x.subjectId)||doctors.doctors.some(d=>d.canonicalPersonId===x.subjectId)||
    x.subjectId.startsWith("canon-group."),"Orphan date: "+x.subjectId);
  const arr=dateMap.get(x.subjectId)||[];
  arr.push({monthDay:x.monthDay,scope:x.authorityScope,
    universalStatus:x.universalStatus,publishedOn:x.publishedOn,sourceUrl:x.sourceUrl});
  dateMap.set(x.subjectId,arr);
}
for(const doctor of doctors.doctors){
  assert.ok(doctor.canonicalPersonId,"Doctor without canonical ID");
  assert.ok(!doctorMap.has(doctor.canonicalPersonId),"One Doctor is duplicated: "+doctor.canonicalPersonId);
  doctorMap.set(doctor.canonicalPersonId,doctor);
}
const rows=[];
for(const [id,person] of index){
  const approved=dateMap.get(id)||[];
  const vatican=approved.filter(x=>x.universalStatus==="CERTIFIED_BY_DECREE");
  const particular=approved.filter(x=>x.universalStatus!=="CERTIFIED_BY_DECREE");
  const historical=pilot.persons.find(x=>x.id===id)?.calendar1962?.principalId||
    doctorMap.get(id)?.observanceSourceIdentity||null;
  const name=person.name?.en||person.name||null;
  rows.push({
    canonicalPersonId:id,name,
    canonizedOn:person.recognition?.canonizedOn||person.canonizedOn||null,
    historical1962SourceId:historical,
    modernDates:approved,
    doctorDeclaredOn:pilot.persons.find(x=>x.id===id)?.recognition?.doctorDeclaredOn||
      doctorMap.get(id)?.declarationDate||null,
    reviewPriority:vatican.length?"TRADITIONAL_MASS_ELIGIBILITY_AND_FORMULARY_REVIEW":
      particular.length?"VERIFY_DATE_AUTHORITY_AND_JURISDICTION":"RESEARCH_UNIVERSAL_OR_PARTICULAR_FEAST_DATE",
    neverInventMassAuthority:true
  });
}
rows.sort((a,b)=>a.reviewPriority.localeCompare(b.reviewPriority)||a.canonicalPersonId.localeCompare(b.canonicalPersonId));
const groups=census.groups.map(group=>{
 const id="canon-group."+group.id,entries=dateMap.get(id)||[];
 return {
   canonicalGroupId:id,
   name:group.presentation?.title?.en||group.name||null,
   knownDateWitnesses:entries,
   reviewPriority:entries.length?"VERIFY_JURISDICTION_AND_DATE":"VERIFY_GROUP_FEAST_DATE",
   enumerateIndividualMembers:false,
   neverInventMassAuthority:true
 }
});
const summary={
 censusPost1960NamedPersons:census.persons.length,
 additionalUniquePilotPersons:index.size-census.persons.length,
 distinctNamedResearchPersons:index.size,
 groupProfiles:groups.length,
 doctorsOnSeparateIdentityObjects:0,
 doctorCensus:doctorMap.size,
 dateSourceRows:dates.observances.length,
 datedIndividualPersonProfiles:rows.filter(x=>x.modernDates.length).length,
 datedCollectiveProfiles:groups.filter(x=>x.knownDateWitnesses.length).length,
 datedVaticanGeneralRomanPersonProfiles:rows.filter(x=>x.modernDates.some(d=>d.universalStatus==="CERTIFIED_BY_DECREE")).length,
 individualProfilesRequiringDateAuthority:rows.filter(x=>!x.modernDates.some(d=>d.universalStatus==="CERTIFIED_BY_DECREE")).length,
 collectiveProfilesRequiringIndependentUniversalDate:groups.filter(x=>!x.knownDateWitnesses.some(d=>d.universalStatus==="CERTIFIED_BY_DECREE")).length,
 worldwideComplete:false,year2026CensusComprehensive:false
};
const report={
  schema:"AO_LIVING_TRADITIONAL_DATE_AUTHORITY_BACKLOG_V1",
  asOf:"2026-10-16",publicationStatus:"RESEARCH_AND_PLANNING_ONLY",
  sourceScope:"51 official indexed canonization year pages, not every saint/canonization worldwide",
  legalBasis:"2020 Cum sanctissima and 1960 General Rubrics; source date does not authorize Mass",
  summary,individuals:rows,collectives:groups
};
assert.equal(new Set(rows.map(x=>x.canonicalPersonId)).size,rows.length);
assert.equal(new Set(groups.map(x=>x.canonicalGroupId)).size,groups.length);
assert.equal(summary.dateSourceRows,14);
assert.equal(summary.doctorCensus,38);
assert.ok(rows.some(x=>x.canonicalPersonId==="saint.carlo-acutis"&&x.modernDates.length===0),
  "Carlo's universal traditional liturgical date not certified by this research");
assert.ok(rows.find(x=>x.canonicalPersonId==="saint.john-henry-newman")?.modernDates
  .some(x=>x.publishedOn==="2026-02-03"));
assert.ok(rows.every(x=>x.neverInventMassAuthority));
mkdirSync(new URL("../artifacts/calendar-oracle/",import.meta.url),{recursive:true});
writeFileSync(new URL("../artifacts/calendar-oracle/living-traditional-date-authority-backlog.json",import.meta.url),
  JSON.stringify(report,null,2)+"\n");
console.log("LIVING_TRADITIONAL_DATE_AUTHORITY_GAPS="+JSON.stringify(summary));
