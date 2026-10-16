import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const evidence=read("data/saints/six-duplicate-name-alias-evidence-20261016.v1.json");
const index=read("data/saints/existing-shrine-geography-readiness-20261016.v1.json");
const historical=read("data/saints/historical-v4333-311-components.recovered.v1.json");
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
const originalBridge=read("data/saints/parallel-owner-identity-bridge-20261015.v1.json");
const previousAliases=read("data/saints/1962-doctors-historical-id-alias-review.v1.json");
assert.equal(evidence.schema,"ao.saints.six-colliding-name-owner-alias-evidence.2026.v1");
assert.equal(evidence.records.length,6);
assert.equal(new Set(evidence.records.map(x=>x.shrine_name_literal)).size,6);
assert.equal(evidence.counts.already_exact_owner_identity_linked,1);
assert.equal(evidence.counts.doctor_alias_candidates_with_matching_nominal_day,4);
assert.equal(evidence.counts.source_context_ledgers_needing_owner_confirmation,1);
const byName=new Map(index.rows.map(x=>[x.legacy_name_literal,x]));
for(const r of evidence.records){
 const row=byName.get(r.shrine_name_literal);
 assert(row);
 assert.deepEqual(r.competing_source_keys,row.candidate_source_keys);
 assert.equal(r.competing_source_keys.length,2);
 assert(r.competing_source_keys.includes(r.preferred_existing_profile_source_key));
 assert.deepEqual(r.geography_site_ids,row.physical_place_associations.map(x=>x.place_id));
 assert.equal(r.published_new_map_pin_links,undefined);
 assert.equal(r.artwork_authorized,false);
 assert.equal(r.publication_authorized,false);
 assert.equal(r.map_pin_identity_authorized,false);
 assert(ledger.records.some(x=>x.source_key===r.preferred_existing_profile_source_key));
 const day=historical.rows.find(x=>x.date===r.nominal_day_1962);
 assert(day);
 assert(day.components.some(x=>x.historical_component_id===r.historic_component_id&&
    x.historical_identity_id===r.historic_subject_id));
 assert.deepEqual(r.raw_archive_observance_source_ids,day.original_source_observances.map(x=>x.id));
 if(r.preferred_selection_status==="OWNER_PROPOSED_ALIAS_SAME_NOMINAL_DAY_SOURCE_ID_FINAL_CONFIRMATION_PENDING"){
  assert(previousAliases.proposed_pairs.some(x=>x.calendar_person_id===r.preferred_existing_profile_source_key&&
   x.historical_identity_id===r.historic_subject_id));
  assert.equal(r.doctor_nominal_day_source_compatible,true);
  assert.equal(r.canonical_person_identity_merge_approved,false);
 }
}
const th=evidence.records.find(x=>x.shrine_name_literal==="Saint Thérèse of Lisieux");
assert(th&&th.canonical_person_identity_merge_approved);
assert.deepEqual(th.source_bound_liturgical_identity_bridge,{
 saints_id:"saint:therese-of-lisieux",calendar_id:"saint.therese-lisieux",
 observed_2026_source_id:"sancti:10-03:3:w"});
assert(originalBridge.identity_links.some(x=>x.saints_id===th.source_bound_liturgical_identity_bridge.saints_id&&
 x.calendar_person_id===th.source_bound_liturgical_identity_bridge.calendar_id));
const francis=evidence.records.find(x=>x.shrine_name_literal==="Saint Francis of Assisi");
assert(francis&&francis.preferred_selection_status==="SOURCE_NAME_AND_HISTORICAL_CONTEXT_LEAD_NOT_CERTIFIED");
assert.equal(francis.canonical_person_identity_merge_approved,false);
console.log("PASS W77 6 alias source pairs, 4 owner-proposed Calendar cases, 1 existing Thérèse identity bridge, 1 Francis held candidate; no public promotions");
