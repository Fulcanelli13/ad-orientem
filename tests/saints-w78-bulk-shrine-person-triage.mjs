import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const q=read("data/saints/w78-bulk-119-shrine-person-match-triage-20261016.v1.json");
const previous=read("data/saints/existing-shrine-geography-readiness-20261016.v1.json");
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
const aliases=read("data/saints/six-duplicate-name-alias-evidence-20261016.v1.json");
const primary=read("data/saints/w78-113-shrine-name-source-evidence-20261016.v1.json");
assert.equal(q.primary_evidence_registry,"data/saints/w78-113-shrine-name-source-evidence-20261016.v1.json");
assert.equal(primary.counts.curated_variant_name_leads,24);
assert.equal(primary.counts.names_with_no_supported_key_after_curated_leads,39);
assert.equal(q.schema,"ao.saints.w78-all-119-shrine-name-person-match-triage.v1");
assert.equal(q.records.length,119);assert.equal(q.counts.original_association_edges,145);
const keys=new Set(ledger.records.map(x=>x.source_key));
const prior=new Map(previous.rows.map(x=>[x.legacy_name_literal,x]));
const seen=new Set(),tiers={};
for(const r of q.records){
 assert(!seen.has(r.shrine_name_literal));seen.add(r.shrine_name_literal);
 const old=prior.get(r.shrine_name_literal);assert(old);
 assert.deepEqual(r.original_shrine_associations.map(x=>x.place_id),old.physical_place_associations.map(x=>x.place_id));
 assert.deepEqual(r.original_shrine_associations.map(x=>x.original_source_ids),old.physical_place_associations.map(x=>x.provenance_source_ids));
 assert(r.original_shrine_associations.every(x=>!x.person_identity_certified&&!x.new_pin_authorized));
 assert(r.candidate_source_keys.every(x=>keys.has(x)));
 assert.equal(r.canonical_person_key,null);
 tiers[r.matching_tier]=(tiers[r.matching_tier]??0)+1;
}
assert.deepEqual(tiers,{
 EXACT_FULL_NAME_SINGLE_SOURCE_KEY_CANDIDATE:50,
 EXPLICIT_COMPETING_SOURCE_KEYS_ALIAS_OWNER_REVIEW:6,
 TITLE_STRIPPED_SOURCE_KEY_LEAD_NOT_CERTIFIED:6,
 NO_EXACT_OR_TITLE_STRIPPED_SOURCE_KEY:57
});
for(const x of aliases.records){
 const found=q.records.find(y=>y.shrine_name_literal===x.shrine_name_literal);
 assert.equal(found.matching_tier,"EXPLICIT_COMPETING_SOURCE_KEYS_ALIAS_OWNER_REVIEW");
 assert.deepEqual(found.candidate_source_keys,x.competing_source_keys);
}
const leads=q.records.filter(x=>x.matching_tier==="TITLE_STRIPPED_SOURCE_KEY_LEAD_NOT_CERTIFIED");
assert.deepEqual(leads.map(x=>x.candidate_source_keys[0]).sort(),[
 "saint.andrew","saint.bartholomew","saint.mark","saint.matthew","saint.matthias","uganda-martyrs-22"
]);
assert(q.records.find(x=>x.shrine_name_literal==="Uganda Martyrs").candidate_source_keys.every(x=>!x.startsWith("saint.")));
for(const x of leads){
 const original=primary.no_exact_key.find(y=>y.shrine_source_name===x.shrine_name_literal);
 assert(original&&original.source_key_candidate===x.candidate_source_keys[0]);
 assert.equal(original.identity_gate,"CURATED_VARIANT_NAME_LEAD_REQUIRES_OWNER_CERTIFICATION");
}
assert.equal(q.counts.newly_certified_person_to_shrine_life_event_edges,0);
assert.equal(q.counts.new_geocoded_pin_records,0);
assert.equal(q.counts.approved_artwork_assets,0);
console.log("PASS W78: 119 names, 145 unchanged shrine associations, 50 single/6 aliases/6 title leads/57 held; no invented identities or pins");
