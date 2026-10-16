import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const w78=read("data/saints/w78-113-shrine-name-source-evidence-20261016.v1.json");
const w77=read("data/saints/six-duplicate-name-alias-evidence-20261016.v1.json");
const geo=read("data/saints/existing-shrine-geography-readiness-20261016.v1.json");
const registry=read("data/shrines/source-registry.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
const named=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const source=new Map(registry.sources.map(x=>[x.id,x]));
const shrine=new Map(shrines.shrines.map(x=>[x.shrine_id,x]));
const allkeys=new Set(ledger.records.map(x=>x.source_key));
const original=new Map(geo.rows.map(x=>[x.legacy_name_literal,x]));
const six=new Set(w77.records.map(x=>x.shrine_name_literal));
assert.equal(w78.schema,"ao.saints.w78-113-shrine-name-source-evidence.v1");
assert.equal(w78.status,"DERIVED_RESEARCH_ONLY_ORIGINAL_SHRINE_CLAIMS_WITH_PERSON_IDENTITY_APPROVAL_GATES");
assert.equal(w78.single_exact_key.length,50);
assert.equal(w78.no_exact_key.length,63);
assert.equal(w78.counts.pilot_owner_links_already_existing,5);
assert.equal(w78.counts.truncated_source_key_holds,2);
assert.equal(w78.counts.curated_variant_name_leads,24);
assert.equal(w78.counts.names_with_no_supported_key_after_curated_leads,39);
assert.equal(w78.counts.existing_shrine_site_associations,137);
assert.equal(w78.counts.original_source_url_evidence_records,209);
assert.equal(w78.counts.distinct_original_physical_place_ids,114);
assert.equal(w78.counts.name_rows_with_all_site_edges_primary_or_official,104);
assert.equal(w78.counts.published_new_saint_pins,0);
assert.equal(w78.counts.canonically_merged_person_keys,0);
const rows=[...w78.single_exact_key,...w78.no_exact_key];
assert.equal(rows.length,113);
assert.equal(new Set(rows.map(x=>x.shrine_source_name)).size,113);
assert(!rows.some(x=>six.has(x.shrine_source_name)),"The six W77 ambiguous names must remain in their own owner reconciliation");
assert.equal(rows.reduce((n,x)=>n+x.site_links.length,0),137);
assert.equal(137+w77.records.reduce((n,x)=>n+x.geography_site_ids.length,0),145);
assert(named.people.length===6);
const status={};
for(const row of rows){
 const originalRow=original.get(row.shrine_source_name);
 assert(originalRow);
 assert.deepEqual(row.site_links.map(x=>x.original_place_id),
  originalRow.physical_place_associations.map(x=>x.place_id));
 const key=row.original_source_key_candidate??row.source_key_candidate;
 if(key)assert(allkeys.has(key),"Curated variants must refer only to existing ledger IDs");
 if(row.source_key_candidate)assert.equal(row.unapproved_canonical_alias,undefined);
 if(row.existing_pilot_person_id){
  assert(named.people.some(p=>p.saint_id===row.existing_pilot_person_id&&p.legacy_source_name===row.shrine_source_name));
 }
 const st=row.person_identity_gate??row.identity_gate;
 status[st]=(status[st]??0)+1;
 for(const edge of row.site_links){
  assert.equal(edge.new_coordinates,null);
  assert.equal(edge.new_person_id,null);
  assert.equal(edge.artwork_id,null);
  assert.equal(edge.identity_owner_certified,false);
  const s=shrine.get(edge.original_shrine_id);
  assert(s&&s.place_id===edge.original_place_id);
  assert(s.associated_saints.includes(row.shrine_source_name));
  assert(edge.original_source_evidence.length>=1);
  for(const evidence of edge.original_source_evidence){
   const live=source.get(evidence.source_id);
   assert(live&&s.source_ids.includes(live.id));
   assert.equal(evidence.url,live.url);
   assert.match(evidence.url,/^https:\/\//);
   assert.equal(evidence.directness,live.directness);
  }
 }
}
assert.equal(status.EXISTING_SIX_PILOT_OWNER_PERSON_TO_PLACE_LINK,5);
assert.equal(status.TRUNCATED_CANONICAL_SOURCE_KEY_HOLD,2);
assert.equal(status.SINGLE_EXACT_NAME_CANDIDATE_NOT_PERSON_ID_OWNER_APPROVED,43);
assert.equal(status.CURATED_VARIANT_NAME_LEAD_REQUIRES_OWNER_CERTIFICATION,24);
assert.equal(status.NO_EXACT_SOURCE_KEY_NO_CURATED_VARIANT_LEAD+
  (status.COLLECTIVE_OR_MULTIPLE_FIGURES_NO_SINGLE_CANONICAL_PERSON??0)+
  (status.ANGELIC_FIGURE_NOT_HUMAN_SAINT??0),39);
assert(w78.single_exact_key.find(x=>x.shrine_source_name==="Saint John the Evangelist").person_identity_gate==="TRUNCATED_CANONICAL_SOURCE_KEY_HOLD");
assert(w78.single_exact_key.find(x=>x.shrine_source_name==="Saint Luke the Evangelist").person_identity_gate==="TRUNCATED_CANONICAL_SOURCE_KEY_HOLD");
for(const name of ["Saint John the Baptist","Saint Joseph","Saint Michael the Archangel"]){
 const x=w78.no_exact_key.find(x=>x.shrine_source_name===name);
 assert.equal(x.source_key_candidate,null,"Feast/event homonyms must not become person identities");
}
for(const name of ["Uganda Martyrs","Saint Maurice and the Theban martyrs"]){
 const x=w78.no_exact_key.find(x=>x.shrine_source_name===name);
 assert.equal(x.source_subject_kind,"GROUP");
}
console.log("PASS W78 113 name rows/137 shrine-site edges/209 source references; 24 curated identity leads remain non-public, 39 unresolved, 2 truncated source IDs held");
