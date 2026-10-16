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
    {sourceId:"sancti:10-11:3:r",title:"same resolved saint"}]},
  commemorations:[{id:"sancti:10-12:3:w"},{id:"sancti:10-13:3:r"}]};
const copy=structuredClone(r);
const ids=canonical1962Commemorations(r);
assert.deepEqual(ids.map(x=>x.identity),["sancti:10-11","sancti:10-12"],
  "The resolved day must take priority; main/root fallback may contain candidates");
assert.deepEqual(canonical1962Commemorations({
  day:{commemorations:["10-11","St Someone"],main:{commemorations:["sancti:10-14:3:w"]}}
}).map(x=>x.identity),["sancti:10-14"],
  "A label-only preferred container must not suppress a sourced fallback");
assert.deepEqual(canonical1962Commemorations({day:{main:{commemorations:["sancti:10-14:3:w"]}}}).map(x=>x.identity),
  ["sancti:10-14"],"Use main only if day-level commemorations are genuinely absent");
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
const nestedNewman=reviewNewSaintMassChoice({
 date:"2026-10-09",saint:byId.get("saint.john-henry-newman"),
 observedDay:{date:"2026-10-09",day:{main:{id:"sancti:10-09:3:w",rank:"III"}},proper:{status:"ready"}},
 protectedFeasts:annex.feasts
});
assert.equal(nestedNewman.status,"CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW",
  "Actual production-resolution shape must not conceal a source-attested candidate");
assert.equal(nestedNewman.massInsertionAuthorized,false);
const compactPerson={...byId.get("saint.john-henry-newman"),observances:undefined};
const sourceObservance={
 subjectId:"saint.john-henry-newman",monthDay:"10-09",
 authorityScope:"GENERAL_ROMAN_VATICAN_DECREE",universalStatus:"CERTIFIED_BY_DECREE",
 sourceUrl:"https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2026/02/03/260203a.html",
 publishedOn:"2026-02-03"
};
const compactReview=reviewNewSaintMassChoice({
 date:"2026-10-09",saint:compactPerson,sourceObservance,
 observedDay:{day:{main:{id:"sancti:10-09:3:w",rank:"III"}}},
 protectedFeasts:annex.feasts
});
assert.equal(compactReview.status,"CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW",
  "Exact Holy See date witness must be joined to the compact person");
assert.equal(compactReview.massInsertionAuthorized,false);
const usOnly=reviewNewSaintMassChoice({
 date:"2026-10-09",saint:compactPerson,
 sourceObservance:{...sourceObservance,authorityScope:"USCCB_2026_CALENDAR_WITNESS"},
 observedDay:{day:{main:{id:"sancti:10-09:3:w",rank:"III"}}},
 protectedFeasts:annex.feasts
});
assert.equal(usOnly.status,"INDETERMINATE","US-only date witness never confers global authority");
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
// A first-party 1962-use chaplaincy bulletin describes a *local* transfer
// and novena prayers, not a worldwide first-class feast or Mass commemoration.
const particular=load("data/calendar/particular-traditional-calendar-witnesses.review.v1.json");
assert.equal(particular.schema,"AO_PARTICULAR_TRADITIONAL_CALENDAR_WITNESSES_REVIEW_V1");
assert.equal(particular.publicationStatus,"SOURCE_WITNESS_ONLY_NOT_RUNTIME_APPLIED");
assert.equal(particular.witnesses.length,1);
const stKevins=particular.witnesses[0];
assert.equal(stKevins.originalFeastDate,"2026-05-26");
assert.equal(stKevins.observedTransferredDate,"2026-06-01");
assert.equal(stKevins.localRankReported,"FIRST_CLASS");
assert.equal(stKevins.effectiveScope,"THIS_CHAPLAINCY_2026_ONLY");
assert.equal(stKevins.appliesTo1962UniversalCalendar,false);
assert.equal(stKevins.changesAnyOtherVenueOrMass,false);
assert.equal(stKevins.devotionalNovena.startsOn,"2026-05-23");
assert.equal(stKevins.devotionalNovena.liturgicalCommemorationOrationCertified,false);
assert.equal(stKevins.sourceVenueIdentity.canonicalVenueId,null);
assert.equal(reviewCommemorationAddition({
  dayClass:"II",sunday:true,candidateKind:"ORDINARY",candidateFeastClass:"III"
}).status,"BLOCKED","Local novena cannot fabricate a Sunday Mass commemoration");
console.log("Living traditional Calendar: source matrix, no duplicate identity, Mass/Sunday limits and lawful external solemnity review PASS");
