import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/research/did-you-know/",import.meta.url);
const load=name=>JSON.parse(readFileSync(new URL(name,root),"utf8"));
const sourceMap=load("dyk-customs-ultramaster-source-map.v1.json");
const legacy=load("dyk-legacy-reconciliation-v1.json");
const prev=load("dyk-ultramaster-batch01.v1.json");
const weiser=load("dyk-ultramaster-batch02a-weiser.v1.json");
const pitre=load("dyk-ultramaster-batch02b-pitre.v1.json");
const wider=load("dyk-ultramaster-batch03-wider-corpus.v1.json");
const supplement=load("dyk-source-first-batch01.v1.json");
const total=[...prev.facts,...weiser.facts,...pitre.facts,...wider.facts,...supplement.facts];
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
assert.equal(wider.facts.length,50);
assert.equal(supplement.facts.length,24);
assert.equal(supplement.deferred_canonical_customs_illustrations.length,16);
assert.equal(total.length,154);
assert.equal(new Set(total.map(x=>x.id)).size,154,"Duplicate DYK draft id");
const evidence=new Set();
const sourceStatus={WEISER_1958:0,PITRE_1900:0,glossary:0,mass_ceremonial:0};
for(const fact of total){
 const origin=fact.source_family||fact.category;
 assert.ok(origin in sourceStatus,fact.id+" has unknown owner");
 sourceStatus[origin]++;
 assert.match(fact.text.en,/^Did you know that /,fact.id+" English missing lead");
 assert.match(fact.text.fr,/^Saviez-vous qu/,fact.id+" French missing lead");
 assert.ok(fact.text.en.length<300&&fact.text.fr.length<340,fact.id+" length");
 assert.ok(fact.publication_authorized!==true,fact.id+" cannot publish");
 if(origin==="WEISER_1958"||origin==="PITRE_1900"){
  const refs=fact.original_source?.observation_ids||fact.source?.observation_ids||fact.source?.original_observation_ids||[];
  assert.ok(refs.length>0,fact.id+" missing observation owner");
  for(const id of refs){
   const key=origin+":"+id;
   assert.ok(!evidence.has(key),fact.id+" exact source observation reused");
   evidence.add(key);
  }
  assert.ok(fact.scoping||fact.scope,fact.id+" lacks local/historical scope");
  assert.ok(fact.editorial_state||fact.editorial_status,fact.id+" missing editorial hold");
  assert.equal(fact.publication_authorized,false);
  if(fact.id.startsWith("DYK-UM02-"))assert.equal(fact.link_status,"UNRESOLVED_EXISTING_MODULE");
  if(fact.id.startsWith("DYK-UM03-"))assert.equal(fact.deep_link_status,"NOT_RESOLVED");
 }else assert.match(fact.state,/NOT_APPROVED/,fact.id+" not held");
}
assert.deepEqual(sourceStatus,{WEISER_1958:70,PITRE_1900:60,glossary:19,mass_ceremonial:5});
for(const fact of pitre.facts){
 assert.equal(fact.source.source_page_checked,true,fact.id+" no original 1900 page correspondence");
 assert.equal(fact.source.independent_witness_certified,false);
 assert.ok(Number.isInteger(fact.source.original_printed_page));
 assert.ok(fact.source.italian_text_anchor);
}
for(const fact of wider.facts.filter(x=>x.source_family==="PITRE_1900")){
 assert.equal(fact.source.original_page_location_checked,true);
 assert.equal(fact.source.source_page_image_reviewed,true);
 assert.equal(fact.source.independent_original_witness_verified,false);
 assert.ok(Number.isInteger(fact.source.original_printed_page));
}
for(const fact of wider.facts.filter(x=>x.source_family==="WEISER_1958"))assert.equal(fact.source.original_page_narrow_action_checked,true);
for(const fact of weiser.facts)assert.ok(fact.source.record_id.startsWith("BULK150-"));
assert.ok(supplement.deferred_canonical_customs_illustrations.every(x=>x.state==="DEFERRED_SECONDARY_CANONICAL_EXAMPLE"));
assert.equal(legacy.new_public_draft_counts.all,154);
assert.equal(legacy.new_public_draft_counts.source_record_flags,18);
assert.equal(legacy.new_public_draft_counts.no_exact_legacy_source_match,136);
assert.equal(legacy.new_public_draft_counts.exact_english_text_matches,0);
assert.equal(legacy.legacy_counts.home_preview_bank_eligible,612);
assert.equal(legacy.legacy_counts.archival_conversion_rows,195);
assert.equal(legacy.flagged_public_drafts.length,18);
const glossaryIDs=new Set(supplement.facts.filter(f=>f.category==="glossary").map(f=>f.source.record_id));
for(const x of legacy.flagged_public_drafts){
 assert.ok(supplement.facts.some(f=>f.id===x.draft_id&&f.source.record_id===x.canonical_source_record_id));
 assert.ok(glossaryIDs.has(x.canonical_source_record_id));
 assert.equal(x.editorial_status,"SAME_SOURCE_REVIEW_REQUIRED");
 assert.ok(!Object.hasOwn(x,"private_original_text"),"No private text in public ledger");
}
console.log("DYK 154-draft source integrity gate passed (0 approved; 0 published)");
