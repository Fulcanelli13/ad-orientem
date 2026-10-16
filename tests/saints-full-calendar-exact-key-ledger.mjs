import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
assert.equal(ledger.schema,"ao.saints.full-register-exact-source-keys.2026.v1");
assert.equal(ledger.status,"RESEARCH_UNION_OF_ORIGINAL_OWNER_KEYS_NOT_CANONICAL_UNIQUE_SAINTS");
assert.equal(ledger.records.length,608);
const S=ledger.summary;
assert.equal(S.exact_source_key_union_including_modern_collectives,608);
assert.equal(S.exact_source_key_union_excluding_modern_collectives,595);
assert.equal(S.keys_in_multiple_owner_families,33);
assert.equal(S.historical_source_keys,307);
assert.equal(S.later_named_source_keys,258);
assert.equal(S.doctor_source_keys,38);
assert.equal(S.profile_source_keys,30);
assert.equal(S.modern_collective_group_source_keys,13);
assert.equal(new Set(ledger.records.map(x=>x.source_key)).size,608);
assert.equal(ledger.records.filter(x=>x.family_sources.some(s=>s.family==="post1960_collectives")).length,13);
assert(ledger.records.every(x=>x.source_key&&x.names.length>0&&x.family_sources.length>0));
assert(ledger.records.every(x=>x.entity_inference!=="CERTIFIED_CANONIZED_INDIVIDUAL"));
assert(ledger.records.some(x=>x.source_key.startsWith("group.")));
assert(ledger.records.some(x=>x.source_key.startsWith("angel.")));
assert(ledger.records.some(x=>x.source_key.startsWith("event.")));
assert(ledger.records.every(x=>!x.artwork_id&&!x.geocoordinates&&!x.approved_liturgical_feast));
const familyCounts={};
for(const x of ledger.records)for(const edge of x.family_sources)familyCounts[edge.family]=(familyCounts[edge.family]||0)+1;
assert.deepEqual(familyCounts,{
 archived_1962:307,later_named:258,doctor:38,pilot_bio:6,
 doctor_research_bio:8,cross_vocation_research_bio:16,post1960_collectives:13});
const p=ledger.records.filter(x=>x.family_sources.some(s=>s.family==="pilot_bio"
 ||s.family==="doctor_research_bio"||s.family==="cross_vocation_research_bio"));
assert.equal(p.length,30);
const jf=ledger.records.find(x=>x.source_key==="blessed.jacques-desire-laval");
assert(jf&&jf.entity_inference==="PERSON_CANDIDATE_SOURCE_KEY_NOT_CERTIFIED","Blessed Laval must remain clearly non-canonized");

const review=ledger.identity_resolution_owner_readiness;
assert(review);
assert.equal(review.schema,"ao.saints.source-key-owner-readiness.w86.v1");
assert.equal(review.reviewed_key_rows,608);
assert.equal(review.final_canonical_person_id_decisions,0);
assert.deepEqual(review.entity_type_counts,{
  ANGELIC_SOURCE_RECORD:2,
  PERSON_CANDIDATE_SOURCE_KEY_NOT_CERTIFIED:529,
  GROUP_SOURCE_RECORD:70,
  LITURGICAL_EVENT_SOURCE_RECORD:7
});
assert.equal(review.archival_subjects_with_nominal_day_context,307);
assert.equal(review.archival_1962_nominal_day_source_occurrences,424);
assert.equal(review.doctors_owner_key_rows,38);
assert.equal(review.shrine_name_to_source_key_original_name_cases,81);
assert.equal(review.distinct_existing_keys_with_shrine_name_leads,86);
assert.equal(review.shrine_source_key_references,88);
assert.equal(review.cross_owner_doctor_comparison_key_ends,8);
assert.equal(review.doctor_pair_owner_final_approvals,0);
assert.equal(review.shrine_name_records_without_any_existing_key,38);
assert.equal(review.preliminary_no_key_research_queue.length,38);
assert(review.preliminary_no_key_research_queue.every(x=>!x.identity_certified && x.original_place_ids.length &&
  x.next_action==="SOURCE_OWNER_SOURCE_KEY_OR_ALIAS_DECISION_REQUIRED_NO_AUTO_PERSON_CREATION"));
let archivedContextRows=0,archivedNominalEdges=0,doctorRows=0,shrineLinkedKeys=0,shrineReferenceEdges=0,pairEnds=0;
for(const item of ledger.records){
  const r=item.identity_source_reconciliation;
  assert(r && r.canonical_individual_identity_certified===false);
  assert.equal(r.exact_original_observance_to_person_identity_approved,false);
  assert.equal(r.archived_day_source_scope,"ORIGINAL_DATE_LEVEL_OCCURRENCES_NOT_PER_SUBJECT_OBSERVANCE_EQUIVALENCE");
  assert(!("archived_1962_source_ids" in r),"Do not mislabel shared day sources as saint-owned source IDs");
  assert.equal(r.mass_or_feast_modification_authorized,false);
  assert.equal(r.sacred_art_or_geography_publication_authorized,false);
  if(r.archived_1962_nominal_day_observance_ids.length)archivedContextRows++;
  archivedNominalEdges+=r.archived_1962_nominal_day_observance_ids.length;
  if(r.calendar_doctor_original_source_id)doctorRows++;
  if(r.original_shrine_name_source_leads.length)shrineLinkedKeys++;
  shrineReferenceEdges+=r.original_shrine_name_source_leads.length;
  pairEnds+=r.cross_owner_identity_candidates.length;
  assert(r.original_shrine_name_source_leads.every(x=>x.source_only_not_person_site_certified===true));
  assert(r.cross_owner_identity_candidates.every(x=>x.source_reference_only===true && x.calendar_owner_approved===false));
}
assert.deepEqual([archivedContextRows,archivedNominalEdges,doctorRows,shrineLinkedKeys,shrineReferenceEdges,pairEnds],
  [307,424,34,86,88,8]);
const laterWithout1962=["saint.gregory-narek","saint.hildegard-bingen","saint.john-avila","saint.john-henry-newman"];
for(const key of laterWithout1962){
 const item=ledger.records.find(x=>x.source_key===key);
 assert(item&&item.family_sources.some(f=>f.family==="doctor"));
 assert.equal(item.identity_source_reconciliation.calendar_doctor_original_source_id,null);
 assert.equal(item.identity_source_reconciliation.calendar_doctor_nominal_day,null);
}
assert.equal(review.doctors_owner_key_rows,38);
// Original archive exposes *both* 24 November observances as date-level
// context for both subjects. Only the separately evidenced Doctors bridge
// may propose a principal John of the Cross subject reference.
const john=ledger.records.find(x=>x.source_key==="saint.john-of-the-cross");
const chrysogonus=ledger.records.find(x=>x.source_key==="saint.chrysogonus");
assert(john && chrysogonus);
for(const r of [john.identity_source_reconciliation,chrysogonus.identity_source_reconciliation]){
  assert(r.archived_1962_nominal_day_observance_ids.includes("sancti:11-24:3:w"));
  assert(r.archived_1962_nominal_day_observance_ids.includes("sancti:11-24o:4:r"));
  assert.equal(r.exact_original_observance_to_person_identity_approved,false);
}
assert.equal(john.identity_source_reconciliation.cross_owner_identity_candidates.length,1);
assert.equal(chrysogonus.identity_source_reconciliation.cross_owner_identity_candidates.length,0);
assert.equal(john.identity_source_reconciliation.cross_owner_identity_candidates[0].original_1962_source_id,"sancti:11-24:3:w");
assert(!john.identity_source_reconciliation.cross_owner_identity_candidates.some(x=>x.original_1962_source_id==="sancti:11-24o:4:r"));

console.log("PASS 608 exactly deduplicated cross-owner source IDs, 33 overlaps, 30 unchanged lives and 13 modern group units");
