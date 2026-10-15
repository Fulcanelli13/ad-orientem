import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assessOptionalPost1960SaintCelebration as assess} from "../src/calendar/optional-post1960-saint-review.js";

const pilot=JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-pilot.v1.json",import.meta.url),"utf8"));
const annex=JSON.parse(readFileSync(new URL("../data/calendar/cum-sanctissima-protected-third-class.review.v1.json",import.meta.url),"utf8"));
const byId=new Map(pilot.persons.map(p=>[p.id,p]));
const newman=byId.get("saint.john-henry-newman");
const pio=byId.get("saint.pio-pietrelcina");
const carlo=byId.get("saint.carlo-acutis");
const fields={protectedFeasts:annex.feasts};
const go=(saint,date,id,rank,extra={})=>assess({saint,date,observedDay:{main:{id,rank}},...fields,...extra});
const october=go(newman,"2026-10-09","sancti:10-09:3:w","III");
assert.equal(october.status,"CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW");
assert.equal(october.reason,"NO_CLASS_OR_PROTECTED_FEAST_BLOCKER_ESTABLISHED");
assert.equal(october.possibleBasis,"CUM_SANCTISSIMA_2020");
assert.equal(october.actualCelebrantSelection,"UNKNOWN_NOT_INFERRED");
assert.equal(october.formulariesSelected,false);
assert.equal(october.changes1962Principal,false);
assert.ok(october.additionalReview.includes("APPROVED_TRADITIONAL_MASS_FORMULARY"));

assert.equal(go(pio,"2026-09-23","tempora:Pent17-3:2:v","II").reason,"CLASS_I_OR_II_DAY");
assert.equal(go(newman,"2026-10-09","tempora:some-first-class:1:w","I").status,"BLOCKED");
assert.equal(go(newman,"2025-10-09","sancti:10-09:3:w","III").reason,
  "UNIVERSAL_CHURCH_MEMORIAL_DATE_NOT_ESTABLISHED");
assert.equal(go(carlo,"2026-10-12","sancti:10-12:3:w","III").status,"INDETERMINATE");
assert.equal(go(newman,"2019-10-09","sancti:10-09:3:w","III").reason,"PERSON_NOT_YET_CANONIZED");
assert.equal(go(pio,"2020-03-18","sancti:09-23:3:w","III").reason,"CUM_SANCTISSIMA_NOT_YET_IN_FORCE");

const asTeresa = structuredClone(newman);
asTeresa.observances=[{calendar:"CURRENT_ROMAN_GENERAL",monthDay:"10-15",sourceIds:["hypothetical-sourced-date"],publishedOn:"2020-04-01"}];
const protectedDay=go(asTeresa,"2026-10-15","sancti:10-15:3:w","III");
assert.equal(protectedDay.reason,"PROTECTED_THIRD_CLASS_OBSERVANCE");
assert.equal(protectedDay.status,"BLOCKED");
const falseProtectedId=go(asTeresa,"2026-10-15","sancti:10-15:3:r","III");
assert.equal(falseProtectedId.status,"CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW","must match source identity exactly");
assert.equal(go(newman,"2026-10-09",null,"III").status,"INDETERMINATE");
assert.equal(go(newman,"2026-10-09","sancti:10-09:3:w",null).status,"INDETERMINATE");
assert.equal(go(newman,"2026-10-09","sancti:10-09:3:w","III",{protectedFeasts:[]}).status,"INDETERMINATE");
assert.equal(go(newman,"2026-10-09",":feria:4:w","IV").status,"CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW");
assert.equal(assess({date:"2026-10-09",saint:{id:"canon-group.carmelites-compiegne"},observedDay:{},protectedFeasts:annex.feasts}).reason,"CANONIZATION_GROUP_NOT_PERSON");
assert.throws(()=>assess({date:"2026-02-30",saint:newman}),TypeError);
console.log("Cum sanctissima fail-closed optional celebration gate: PASS (principal untouched, unresolved dates blocked)");
