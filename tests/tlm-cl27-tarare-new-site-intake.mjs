import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const intake=JSON.parse(readFileSync(new URL(
 "../data/directory/research/cl27-tarare-new-site-20261108/intake.v1.json",
 import.meta.url),"utf8"));
const master=JSON.parse(readFileSync(new URL(
 "../data/directory/generated/cl2-physical-site-index.v1.json",
 import.meta.url),"utf8"));
const live=JSON.parse(readFileSync(new URL(
 "../data/directory/cl27-dated-mass-programme-paita-20261108.v1.json",
 import.meta.url),"utf8"));
assert.equal(master.counts.effective_physical_sites,2579);
assert.equal(intake.schema,"AO_CL27_NEW_CL2_SITE_DATED_INTAKE_V1");
assert.equal(intake.status,"HOLD_RESEARCH_ONLY_NOT_PART_OF_WORLDWIDE_DIRECTORY");
assert.equal(intake.owner_approval,"PENDING");
assert.equal(intake.physical_site.name,"Chapelle Notre-Dame de Bel Air");
assert.equal(intake.physical_site.country,"FR");
assert.equal(intake.physical_site.address,"1620 chemin de Bel Air, 69170 Tarare, France");
assert.equal(intake.physical_site.associated_ministry,"Capucins de Morgon");
assert.equal(intake.physical_site.existing_cl2_anchor,null);
assert.equal(intake.physical_site.coordinate_status,"NO_INDEPENDENTLY_VERIFIED_POSITION");
assert.equal(intake.physical_site.duplicate_check.result,"NO_EXACT_PHYSICAL_SITE_MATCH");
assert.equal(intake.physical_site.duplicate_check.must_not_alias_to_nearby,true);
assert.equal(intake.programme.timezone,"Europe/Paris");
assert.equal(intake.programme.source_scope,"NAMED_DATES_ONLY_2026_TO_2027_NO_RECURRENCE");
assert.equal(intake.programme.source_url,
 "https://laportelatine.org/lieux/morgon/chapelle-notre-dame-de-bel-air-tarare");
assert.ok(intake.exclusions.not_in_live_directory);
assert.ok(intake.exclusions.not_in_global_mass_calendar);
assert.ok(intake.exclusions.no_extra_weekly_sundays);
assert.equal(intake.programme.events.length,9);
const expectedDates=[
 "2026-10-11","2026-11-15","2026-12-13","2027-01-24","2027-02-28",
 "2027-03-21","2027-04-18","2027-05-23","2027-06-20"
];
assert.deepEqual(intake.programme.events.map(x=>x.local_date),expectedDates);
assert.equal(new Set(expectedDates).size,9);
for(const event of intake.programme.events){
 assert.equal(new Date(event.local_date+"T00:00:00Z").getUTCDay(),0);
 assert.equal(event.local_time,"10:30");
 assert.equal(event.service_type,"MASS");
 assert.equal(event.mass_form,"NOT_STATED");
 assert.equal(event.verification_state,"FIRST_PARTY_PROGRAMME_NOT_LIVE_CONFIRMATION");
 assert.equal(event.publication_status,event.local_date<"2026-11-08"?
   "PAST_LISTED_DATE":"HOLD_UNTIL_CL2_OWNER_APPROVAL");
 for(const forbidden of ["rrule","frequency","weekly","missal_edition","una_cum","canonical_status"]){
  assert.ok(!Object.hasOwn(event,forbidden),"Tarare must not gain unsupported "+forbidden);
 }
}
assert.ok(master.records.every(row=>!row.slice(1).some(x=>
 typeof x==="string"&&/1620 chemin de Bel Air|Tarare/i.test(x))));
assert.ok(live.sites.every(s=>s.cl2_anchor!=="CL2-CANDIDATE-FR-TARARE-BEL-AIR-20261108"));
assert.equal(live.sites[0].events.length,2,"Existing Païta release stays unchanged");
assert.equal(intake.physical_site.duplicate_check.checked_excel_profile_count,2582);
assert.ok(intake.excel_master.url.startsWith("https://docs.google.com/spreadsheets/d/"));
console.log("PASS CL27 Tarare: one held new-site candidate, 9 individually printed Sundays, 0 current church / Mass import, no fabricated CL2 ID or 1962/Una Cum");
