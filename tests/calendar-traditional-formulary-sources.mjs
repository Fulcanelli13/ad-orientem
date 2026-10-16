import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 reviewTraditionalMassFormulary,reviewAdditionalSaintCommemoration,
 reviewDoctorTitle
} from "../src/calendar/traditional-formulary-review.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const registry=load("data/calendar/traditional-mass-formulary-review.v1.json");
assert.equal(registry.schema,"AO_TRADITIONAL_MASS_FORMULARY_REVIEW_V1");
assert.deepEqual(registry.precedence.map(x=>x.sourceKind),[
 "PRO_ALIQUIBUS_LOCIS_1962",
 "HOLY_SEE_APPROVED_TRADITIONAL_SUPPLEMENT",
 "COMMON_OF_SAINTS_1962"
]);
assert.deepEqual(registry.commemorationOrations,["collect","secret","postcommunion"]);
assert.equal(registry.knownCases.find(x=>x.saintId==="saint.john-henry-newman")?.traditionalSelectedFormularyId,null);
assert.equal(registry.knownCases.find(x=>x.saintId==="saint.john-henry-newman")?.stKevinsEvent?.exactMassFormulary,
  "UNKNOWN_NO_FIRST_PARTY_PROGRAM_FOUND");
const eligible={status:"CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW"};
const blocked={status:"BLOCKED",reason:"CLASS_I_OR_II_DAY"};
const review=(x={})=>reviewTraditionalMassFormulary({
 date:"2026-10-09",saintId:"saint.john-henry-newman",
 observed1962Id:"sancti:10-09:3:w",eligibility:eligible,...x});
assert.equal(review().status,"POTENTIALLY_ELIGIBLE_TEXTS_UNRESOLVED");
assert.equal(review().selectedFormularyId,null);
assert.equal(review().authorizedToChangeMass,false);
assert.equal(review({eligibility:blocked}).status,"BLOCKED");
assert.equal(review({eligibility:{status:"INDETERMINATE"}}).status,"INDETERMINATE");
const prayers={
 orations:Object.fromEntries(["collect","secret","postcommunion"].map(
 x=>[x,{latin:"Test reference only, not approved for liturgical use",reference:"1962:TEST"}]))
};
const s=(kind,id,valid=true)=>({
 kind,formularyId:id,edition:"1962",saintId:"saint.john-henry-newman",
 approvalStatus:"VERIFIED_TRADITIONAL_1962_SOURCE",
 approvedSourceUrl:"https://example.invalid/1962-missal",
 monthDay:"10-09",...(valid?prayers:{})
});
const modern={...s("COMMON_OF_SAINTS_1962","legacy-doctor"),edition:"1970"};
assert.equal(review({candidates:[modern]}).status,"POTENTIALLY_ELIGIBLE_TEXTS_UNRESOLVED",
 "Modern Roman Missal is never a 1962 formulary");
const common=s("COMMON_OF_SAINTS_1962","common.1962");
const proper=s("PRO_ALIQUIBUS_LOCIS_1962","local.1962");
const supplement=s("HOLY_SEE_APPROVED_TRADITIONAL_SUPPLEMENT","supplement.1962");
assert.equal(review({candidates:[common]}).status,"DISPLACED_1962_ORATIONS_MISSING",
 "Mass of Newman must retain the omitted Leonardi's three orations");
assert.equal(review({candidates:[common],displaced1962Orations:prayers}).status,"MASS_TYPE_REVIEW_REQUIRED");
const evaluated=review({candidates:[common,supplement,proper],
 displaced1962Orations:prayers,commemorationLimitReviewed:true});
assert.equal(evaluated.sourceCandidateId,"local.1962",
 "The oldest approved applicable source takes priority over Supplement and Common");
assert.equal(evaluated.status,"REQUIRES_LITURGICAL_AND_CELEBRANT_APPROVAL");
assert.equal(evaluated.authorizedToChangeMass,false);
assert.equal(evaluated.selectedFormularyId,null,
 "An advisory source decision never selects a proper for the reader");
assert.equal(review({candidates:[s("COMMON_OF_SAINTS_1962","missing-prayers",false)]}).status,
 "FORMULARY_INCOMPLETE");

const c=(x={})=>reviewAdditionalSaintCommemoration({
 date:"2026-10-09",saintId:"saint.john-henry-newman",dayClass:"III",...x});
assert.equal(c().status,"BLOCKED","Modern feast-date alone is not a 1962 optional commemoration");
assert.equal(c({dayClass:"II",source:proper,prayers}).status,"BLOCKED");
assert.equal(c({dayClass:"III",source:common,prayers}).status,"BLOCKED",
 "The §5 fallback Common does not automatically confer the narrower §6 ad libitum commemoration faculty");
assert.equal(c({dayClass:"III",source:proper,prayers:null}).status,"TEXTS_UNVERIFIED");
assert.equal(c({dayClass:"III",source:proper,prayers,massType:"SUNG_NONCONVENTUAL"}).status,"BLOCKED");
assert.equal(c({dayClass:"III",source:proper,prayers,existingCommemorations:2}).status,"BLOCKED");
assert.equal(c({dayClass:"III",source:proper,prayers}).status,"REQUIRES_RUBRICAL_AND_CELEBRANT_APPROVAL");
assert.equal(c({dayClass:"IV",source:proper,prayers}).authorizedToChangeMass,false);
assert.equal(c({date:"2026-10-10",source:proper,prayers}).status,"BLOCKED",
 "A source on 9 October does not license a commemoration on 10 October");

const d=reviewDoctorTitle({canonicalSaintId:"saint.therese-lisieux",
 traditional1962FeastId:"sancti:10-03:3:w",
 doctorDeclaredOn:"1997-10-19",date:"2026-10-03"});
assert.equal(d.status,"CANONICAL_IDENTITY_TITLE_ENRICHMENT_ONLY");
assert.equal(d.traditional1962FeastId,"sancti:10-03:3:w");
assert.equal(reviewDoctorTitle({canonicalSaintId:"saint.therese-lisieux",
 doctorDeclaredOn:"1997-10-19",date:"1962-10-03"}).status,"DOCTOR_TITLE_NOT_YET_DECLARED");
console.log("Traditional Mass formulary research PASS: source hierarchy, three orations, Newman/St Kevin unresolved, Doctor identity, no Mass mutation");
