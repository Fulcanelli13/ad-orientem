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
console.log("PASS 608 exactly deduplicated cross-owner source IDs, 33 overlaps, 30 unchanged lives and 13 modern group units");
