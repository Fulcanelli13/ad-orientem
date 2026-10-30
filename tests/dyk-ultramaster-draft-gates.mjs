import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/research/did-you-know/",import.meta.url);
const load=name=>JSON.parse(readFileSync(new URL(name,root),"utf8"));
const sourceMap=load("dyk-customs-ultramaster-source-map.v1.json");
const prev=load("dyk-ultramaster-batch01.v1.json");
const weiser=load("dyk-ultramaster-batch02a-weiser.v1.json");
const pitre=load("dyk-ultramaster-batch02b-pitre.v1.json");
const supplement=load("dyk-source-first-batch01.v1.json");
const total=[...prev.facts,...weiser.facts,...pitre.facts,...supplement.facts];
assert.equal(sourceMap.counts.total_source_observations,3703);
assert.equal(sourceMap.bucket_summary.reduce((n,x)=>n+x.source_observations,0),3703);
assert.equal(sourceMap.counts.weiser_observations,1025);
assert.equal(sourceMap.counts.pitre_original_1900_observations,718);
assert.equal(sourceMap.counts.other_observations,1960);
assert.equal(sourceMap.counts.master_identity_rows,57);
assert.equal(sourceMap.counts.provisional_groups,408);
assert.equal(prev.facts.length,30);
assert.equal(weiser.facts.length,25);
assert.equal(pitre.facts.length,25);
assert.equal(supplement.facts.length,24);
assert.equal(supplement.deferred_canonical_customs_illustrations.length,16);
assert.equal(total.length,104);
assert.equal(new Set(total.map(x=>x.id)).size,104,"Duplicate DYK draft id");
const evidence=new Set();
const sourceStatus={WEISER_1958:0,PITRE_1900:0,glossary:0,mass_ceremonial:0};
for(const fact of total){
 const origin=fact.source_family||fact.category;
 assert.ok(origin in sourceStatus,fact.id+" has unknown owner");
 sourceStatus[origin]++;
 assert.match(fact.text.en,/^Did you know that /,fact.id+" English missing lead");
 assert.match(fact.text.fr,/^Saviez-vous qu/,fact.id+" French missing lead");
 assert.ok(fact.text.en.length<300&&fact.text.fr.length<320,fact.id+" length");
 assert.ok(fact.publication_authorized!==true,fact.id+" cannot publish");
 if(origin==="WEISER_1958"||origin==="PITRE_1900"){
  const refs=fact.original_source?.observation_ids||fact.source?.observation_ids||[];
  assert.ok(refs.length>0,fact.id+" missing observation owner");
  for(const id of refs){
   const key=origin+":"+id;
   assert.ok(!evidence.has(key),fact.id+" exact source observation reused");
   evidence.add(key);
  }
  assert.ok(fact.scoping||fact.scope,fact.id+" lacks local/historical scope");
  assert.ok(fact.editorial_state||fact.editorial_status,fact.id+" missing editorial hold");
  if(fact.id.startsWith("DYK-UM02-")){
   assert.equal(fact.publication_authorized,false);
   assert.ok(fact.link_status==="UNRESOLVED_EXISTING_MODULE","No guessed runtime URLs");
  }
 }
 if(origin==="glossary"||origin==="mass_ceremonial"){
  assert.match(fact.state,/NOT_APPROVED/);
 }
}
assert.deepEqual(sourceStatus,{WEISER_1958:45,PITRE_1900:35,glossary:19,mass_ceremonial:5});
for(const fact of pitre.facts){
 assert.equal(fact.source.source_page_checked,true,fact.id+" no original 1900 page correspondence");
 assert.equal(fact.source.independent_witness_certified,false);
 assert.ok(Number.isInteger(fact.source.original_printed_page));
 assert.ok(fact.source.italian_text_anchor);
}
for(const fact of weiser.facts)assert.ok(fact.source.record_id.startsWith("BULK150-"));
assert.ok(supplement.deferred_canonical_customs_illustrations.every(x=>x.state==="DEFERRED_SECONDARY_CANONICAL_EXAMPLE"));
console.log("DYK 104-source-first-draft integrity gate passed (all unapproved; nonpublishing)");
