import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  base1962Identity,canonical1962Commemorations,reviewCommemorationAddition,
  reviewNewSaintMassChoice,reviewExternalSolemnity,reconcileHonouredToday
} from "../src/calendar/traditional-day-adjudication.js";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const matrix=load("data/calendar/traditional-calendar-adjudication-matrix.v1.json");
const annex=load("data/calendar/cum-sanctissima-protected-third-class.review.v1.json");
const pilot=load("data/calendar/living-sanctoral-pilot.v1.json");
assert.equal(matrix.schema,"AO_TRADITIONAL_CALENDAR_ADJUDICATION_MATRIX_V1");
assert.equal(matrix.canonicalBasis,"1962_ROMAN_CALENDAR_AND_APPLICABLE_TRADITIONAL_PARTICULAR_CALENDARS");
assert.equal(matrix.rules.length,18);
assert.equal(new Set(matrix.rules.map(x=>x.id)).size,matrix.rules.length);
assert.ok(matrix.rules.every(x=>x.autoChanges1962Mass===false&&matrix.sources[x.primaryWitness]?.startsWith("https://")));
for(const id of ["BASE_1962","SUNDAY_SECOND_CLASS","THIRD_FOURTH_CLASS","AFTER_1960_SAINT_MASS",
  "PROTECTED_70","OMITTED_OLDER_FEAST","FORMULARY_CHOICE","EXTERNAL_SOLEMNITY",
  "PARTICULAR_CALENDAR","HOMEPAGE_HONOUR"])
  assert.ok(matrix.rules.some(x=>x.id===id),id);

assert.equal(base1962Identity("sancti:10-15:3:w"),"sancti:10-15");
const r={day:{main:{id:"sancti:10-09:3:w",
    commemorations:["10-11","sancti:10-14:3:w","sancti:10-14:3:r"]},
  commemorations:["sancti:10-11:3:w",{id:"sancti:10-12:3:r",title:"Bishop"},
    {sourceId:"sancti:10-11:3:r",title:"same resolved saint"}]}},
  commemorations:[{id:"sancti:10-12:3:w"},{id:"sancti:10-13:3:r"}]};
const copy=structuredClone(r);
const ids=canonical1962Commemorations(r);
assert.deepEqual(ids.map(x=>x.identity),["sancti:10-11","sancti:10-12","sancti:10-14","sancti:10-13"]);
assert.deepEqual(r,copy,"review must not edit the resolver");
assert.deepEqual(canonical1962Commemorations({day:{commemorations:["10-11","St Someone"]}}),[],
  "Date-code-only and title-only aliases are not canonical IDs");
assert.deepEqual(canonical1962Commemorations({day:{commemorations:["sancti:10-03:3:w"]}}).map(x=>x.identity),
  ["sancti:10-03"],"real string-form IDs must not vanish");

const ctx=(p={})=>reviewCommemorationAddition(p);
assert.equal(ctx({dayClass:"II",sunday:true,candidateKind:"ORDINARY",candidateFeastClass:"III"}).status,"BLOCKED");
assert.equal(ctx({dayClass:"II",sunday:true,candidateKind:"ORDINARY",candidateFeastClass:"II"}).status,"REVIEW_REQUIRED");
assert.equal(ctx({dayClass:"II",sunday:true,candidateKind:"PRIVILEGED"}).status,"REVIEW_REQUIRED");
assert.equal(ctx({dayClass:"I",candidateKind:"ORDINARY"}).status,"BLOCKED");
assert.equal(ctx({dayClass:"I",candidateKind:"PRIVILEGED"}).status,"REVIEW_REQUIRED");
assert.equal(ctx({dayClass:"III",massForm:"SUNG",conventual:false,candidateKind:"ORDINARY"}).status,"BLOCKED");
assert.equal(ctx({dayClass:"III",massForm:"SUNG",conventual:true,candidateKind:"ORDINARY"}).status,"REVIEW_REQUIRED");
assert.equal(ctx({dayClass:"III",candidateKind:"ORDINARY",existing:["saint.one","saint.two"]}).status,"BLOCKED");
assert.equal(ctx({dayClass:"III",candidateId:"sancti:10-03:3:w",existing:["sancti:10-03:3:r"]}).status,"ALREADY_PRESENT");
assert.equal(ctx({dayClass:"II",sunday:false,candidateKind:"ORDINARY",existing:["sancti:01-01:3:w"]}).status,"BLOCKED");

const byId=new Map(pilot.persons.map(x=>[x.id,x]));
const resolve=(id,rank)=>({main:{id,rank}});
const newman=reviewNewSaintMassChoice({
 date:"2026-10-09",saint:byId.get("saint.john-henry-newman"),
 observedDay:resolve("sancti:10-09:3:w","III"),protectedFeasts:annex.feasts
});
assert.equal(newman.status,"CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW");
assert.equal(newman.massInsertionAuthorized,false);
assert.equal(newman.selectedFormularyId,null);
assert.equal(newman.original1962PrincipalId,"sancti:10-09:3:w");
assert.equal(reviewNewSaintMassChoice({
 date:"2026-09-23",saint:byId.get("saint.pio-pietrelcina"),
 observedDay:resolve("tempora:Pent17-3:2:v","II"),protectedFeasts:annex.feasts
}).status,"BLOCKED");
assert.equal(reviewNewSaintMassChoice({
 date:"2025-10-09",saint:byId.get("saint.john-henry-newman"),
 observedDay:resolve("sancti:10-09:3:w","III"),protectedFeasts:annex.feasts
}).status,"INDETERMINATE");

const external=(props={})=>reviewExternalSolemnity({
 feastDate:"2026-10-07",targetDate:"2026-10-04",targetDayClass:"II",...props
});
assert.equal(external({basis:"ROSARY",sourceUrl:"https://la.wikisource.org/wiki/Pagina:Missale_Romanum_1962.pdf/24"}).status,"REVIEW_REQUIRED");
assert.equal(external({targetDate:"2026-10-11",basis:"ROSARY",sourceUrl:"https://la.wikisource.org/wiki/Pagina:Missale_Romanum_1962.pdf/24"}).status,"BLOCKED");
assert.equal(external({basis:"PRINCIPAL_PATRON",sourceUrl:"https://example.org/patron"}).status,"UNVERIFIED");
assert.equal(external({basis:"PRINCIPAL_PATRON",localityId:"church:test",sourceUrl:"https://example.org/patron"}).status,"REVIEW_REQUIRED");
assert.equal(external({basis:"PRINCIPAL_PATRON",localityId:"church:test",sourceUrl:"https://example.org/patron",targetDayClass:"I"}).status,"BLOCKED");
assert.equal(external({basis:"NON_EXISTENT",sourceUrl:"https://example.org"}).status,"UNVERIFIED");
assert.equal(external({basis:"LOCAL_ORDINARY_POPULAR_CELEBRATION",localityId:"church:test",sourceUrl:"https://example.org"}).status,"UNVERIFIED");
assert.equal(external({basis:"LOCAL_ORDINARY_POPULAR_CELEBRATION",localityId:"church:test",ordinaryAssignedDate:true,sourceUrl:"https://example.org"}).status,"REVIEW_REQUIRED");

// Explicit identity bridge; never infer from same display name.
const result=reconcileHonouredToday({
 resolution:{day:{main:{id:"sancti:10-03:3:w"},commemorations:["sancti:10-15:3:w"]}},
 secondaryCards:[{id:"saint.therese-lisieux"},{id:"saint.teresa-avila"},{id:"saint.other"}],
 particularObservances:[{id:"saint.other"},{id:"saint.local"}],
 canonicalPersonForSourceId:{"sancti:10-03":"saint.therese-lisieux","sancti:10-15":"saint.teresa-avila"}
});
assert.equal(result.principalSourceId,"sancti:10-03:3:w");
assert.deepEqual(result.supplementaryHonours.map(x=>x.id),["saint.other","saint.local"]);
assert.deepEqual(result.suppressedDuplicatePersonIds,["saint.therese-lisieux","saint.teresa-avila","saint.other"]);
assert.equal(result.massReaderUnchanged,true);
console.log("Living traditional Calendar: source matrix, no duplicate identity, Mass/Sunday limits and lawful external solemnity review PASS");
