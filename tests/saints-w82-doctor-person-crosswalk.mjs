import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const review=read("data/saints/w82-four-historical-doctors-source-identity-review-20261016.v1.json");
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
const historical=read("data/saints/historical-v4333-311-components.recovered.v1.json");
const collisions=read("data/saints/six-duplicate-name-alias-evidence-20261016.v1.json");
const doctors=read("data/saints/read-only-calendar-art-index-20261015.v1.json");
const ledgerIds=new Set(ledger.records.map(x=>x.source_key));
const calendarDoctors=new Map(doctors.doctors_roster.map(x=>[x.calendar_person_id,x]));
const nameCollisions=new Map(collisions.records.map(x=>[x.shrine_name_literal,x]));

assert.equal(review.schema,"ao.saints.w82-four-historical-doctors-source-identity-review.2026.v1");
assert.equal(review.records.length,4);
assert.equal(review.counts.total,4);
assert.equal(review.counts.primary_historical_matches,4);
assert.equal(review.counts.owner_final_approvals,0);
assert.equal(review.counts.new_canonical_keys,0);
const allNames=new Set(),allKeys=new Set(),allHistoricIds=new Set(),allDoctorIds=new Set();
for(const row of review.records){
 assert(!allNames.has(row.shrine_name_literal));
 allNames.add(row.shrine_name_literal);
 assert(ledgerIds.has(row.archived_historical_source_key));
 assert(ledgerIds.has(row.calendar_doctor_roster_source_key));
 allKeys.add(row.observance_primary_1962_source_id);
 allHistoricIds.add(row.archived_historical_source_key);
 allDoctorIds.add(row.calendar_doctor_roster_source_key);
 const collision=nameCollisions.get(row.shrine_name_literal);
 assert(collision);
 assert.deepEqual(collision.competing_source_keys.sort(),[row.archived_historical_source_key,row.calendar_doctor_roster_source_key].sort());
 assert.equal(collision.preferred_selection_status,"OWNER_PROPOSED_ALIAS_SAME_NOMINAL_DAY_SOURCE_ID_FINAL_CONFIRMATION_PENDING");
 assert.equal(collision.historic_component_id,row.archived_component_id);
 assert.equal(collision.historic_subject_id,row.archived_historical_source_key);
 assert(collision.raw_archive_observance_source_ids.includes(row.observance_primary_1962_source_id));
 const roster=calendarDoctors.get(row.calendar_doctor_roster_source_key);
 assert(roster);
 assert.equal(roster.nominal_day_1962,row.nominal_1962_date_mm_dd);
 assert.equal(roster.original_source_id,row.observance_primary_1962_source_id);
 if(row.doctor_declaration_after_1962)assert.equal(roster.declaration_date,row.doctor_declaration_after_1962);
 const historicalDay=historical.rows.find(x=>x.date===row.nominal_1962_date_mm_dd);
 assert(historicalDay);
 assert(historicalDay.components.some(x=>x.historical_component_id===row.archived_component_id&&
   x.historical_identity_id===row.archived_historical_source_key));
 assert(historicalDay.original_source_observances.some(x=>x.id===row.observance_primary_1962_source_id));
 assert.equal(row.subject_equivalence,"SOURCE_CORROBORATED_SAME_HISTORICAL_PERSON_CANDIDATE");
 assert.match(row.source_attestation.url,/^https:\/\/www\.vatican\.va\//);
 for(const [gate,value] of Object.entries(row.explicit_conditions)){
  assert.equal(value,false,gate+" must not be auto-authorized");
 }
}
assert.equal(allNames.size,4);
assert.equal(allKeys.size,4);
assert.equal(allHistoricIds.size,4);
assert.equal(allDoctorIds.size,4);
const john=review.records.find(x=>x.shrine_name_literal==="Saint John of the Cross");
const x=review.john_of_the_cross_exception;
assert(john);
assert.equal(x.historic_subject_id,john.archived_historical_source_key);
assert.equal(x.principal_source_id,john.observance_primary_1962_source_id);
assert.equal(x.distinct_other_commemoration_source_id,"sancti:11-24o:4:r");
assert.equal(x.distinct_other_commemoration_subject,"St Chrysogonus");
assert.equal(x.same_person_with_john_of_cross,false);
const day=historical.rows.find(d=>d.date==="11-24");
assert(day.original_source_observances.some(y=>y.id===x.distinct_other_commemoration_source_id&&/Chrysogonus/.test(y.title)));
assert.notEqual(x.principal_source_id,x.distinct_other_commemoration_source_id);
assert(review.records.every(r=>r.observance_primary_1962_source_id!==x.distinct_other_commemoration_source_id));
console.log("PASS four independent historical/Doctor person source candidates with 1962 IDs; Chrysogonus commemoration preserved; zero Calendar/public person changes");
