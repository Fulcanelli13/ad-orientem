import assert from "node:assert/strict";
import {parseNorthAmericaCards,reconcileWithRegistry,DISTRICTS} from "../tools/directory/acquire-sspx-north-america.mjs";

const us=[
  {title:"Saint Francis Chapel",raw:"Saint Francis Chapel\n125 Parish Street\nBelmont, NC 28012\nUnited States\nPhone: +1 123 456 7890\n1. Sunday Mass"},
  {title:"Immaculate Conception Academy",raw:"Immaculate Conception Academy\n25 Education Avenue\nCambridge, MA 02139\nUnited States\n1. Sunday Mass\n2. Weekday Mass"},
  {title:"Saint Anne Mission",raw:"Saint Anne Mission\nFour Seasons Motel\n230 Union Road\nPortland, ME 04101\nUnited States\nSecond Sunday 4:00pm\n1. Sunday Mass"},
  {title:"Saint Joseph Priory",raw:"Saint Joseph Priory\n95 Friary Boulevard\nRochester, NY 14614\nUnited States\n1. Priests' Residence\n2. Weekday Mass"},
  {title:"Capilla Nuestra Señora de Fátima",raw:"Capilla Nuestra Señora de Fátima\nCalle Saturno 1535\n32540 Ciudad Juarez, Chih.\nMexico\n1. Misa dominical"},
  {title:"No Location Mission",raw:"No Location Mission\nBurlington, VT\nUnited States\n1. Sunday Mass"},
  {title:"Saint Francis Chapel",raw:"Saint Francis Chapel\n125 Parish Street\nBelmont, NC 28012\nUnited States\n1. Sunday Mass"},
];
const usParsed=parseNorthAmericaCards(us,{district:"US"});
assert.equal(usParsed.source_place_entries,6);
assert.equal(usParsed.site_candidates,2);
assert.deepEqual(usParsed.records.map(r=>r.n),["Saint Francis Chapel","Saint Anne Mission"]);
assert.equal(usParsed.records[1].ps,"CONDITIONAL_MASS");
assert.equal(usParsed.records[0].ps,"CURRENT_PUBLIC_MASS");
assert.ok(usParsed.records[0].a.includes("125 Parish Street"));
assert.equal(usParsed.records[0].cc,"US");
assert.ok(usParsed.exceptions.some(e=>e.reason==="INSTITUTIONAL_PUBLIC_ACCESS_REVIEW"));
assert.ok(usParsed.exceptions.some(e=>e.reason==="NO_PUBLIC_SUNDAY_TAG"));
assert.ok(usParsed.exceptions.some(e=>e.reason==="OUT_OF_DISTRICT_COUNTRY"));
assert.ok(usParsed.exceptions.some(e=>e.reason==="NO_ACTIONABLE_PHYSICAL_ADDRESS"));
const baseline=[{u:"SSPX-OLD-1",cc:"US",l:"Belmont",n:"St Francis Chapel",a:"125 Parish St., Belmont, NC 28012"}];
const reconciled=reconcileWithRegistry(usParsed,baseline);
assert.equal(reconciled.registry_new_count,1);
assert.equal(reconciled.registry_new_records[0].n,"Saint Anne Mission");
assert.ok(reconciled.held.some(e=>e.reason==="MATCHES_EXISTING_PROVIDER_VENUE"));
const ca=[
  {title:"Église Saint-Gérard",raw:"Église Saint-Gérard\n1530 Chemin Principal\nSaint-Gerard-Des-Laurentides QC G9R 1E4\nCanada\n1. Messe dominicale\n2. Messe en semaine"},
  {title:"Mission Peace River",raw:"Mission Peace River\nWeberville Community Club\nPeace River AB T8S 1V8\nCanada\nMass 4 times a year, please call\n1. Sunday Mass"},
  {title:"Our Lady Mount Carmel Academy",raw:"Our Lady Mount Carmel Academy\n2483 Bleams Road\nNew Hamburg ON N3A 3J2\nCanada\n1. Priests Residence\n2. Weekday Mass"},
  {title:"Maritimes Missions",raw:"Maritimes Missions\nNB\nCanada\n1. Sunday Mass"},
];
const caParsed=parseNorthAmericaCards(ca,{district:"CA"});
assert.equal(caParsed.site_candidates,2);
assert.equal(caParsed.records[0].l,"Saint-Gerard-Des-Laurentides");
assert.equal(caParsed.records[1].ps,"CONDITIONAL_MASS");
assert.ok(caParsed.records.every(r=>r.su===DISTRICTS.CA.url));
assert.ok(caParsed.exceptions.some(r=>r.reason==="NO_ACTIONABLE_PHYSICAL_ADDRESS"));
assert.throws(()=>parseNorthAmericaCards([],{district:"FR"}),/unknown district/);
console.log("SSPX US/Canada bulk directory parsing and deduplication: PASS");