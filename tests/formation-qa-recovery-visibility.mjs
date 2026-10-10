import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const ledger=load("data/learn/formation-qa-recovery-visibility.v1.json");
const raw=load("data/learn/forensic-recovery-register-2026-10-08.v1.json");
const reviews=load("data/learn/formation-141-claim-scope-matrix-2026-10-09.v1.json");
const research=load("data/learn/formation-123-source-claim-gates-2026-10-09.v1.json");
const index=new Map(ledger.records.map(x=>[x.key,x]));
assert.equal(ledger.schema,"AO_FORMATION_QA_RECOVERY_VISIBILITY_V1");
assert.equal(ledger.records.length,1527);
assert.equal(index.size,1527);
for(const x of ledger.records)assert.ok(x.id&&x.source_key&&existsSync(x.source_file)&&x.access,x.key);
for(const [name,source] of [["A",raw.legacy_apologetics],["C",raw.legacy_church_crisis],["TLM",raw.traditional_mass_objections]]){
 assert.equal(ledger.counts.layers["historical-"+name],source.length);
 for(const x of source){
  const y=index.get("historical/"+x.id);
  assert.equal(y.evidence,x.evidence);
  assert.equal(y.prompt_en,x.original_title_en??null);
  if(name!=="TLM"){
   assert.equal(x.original_question,null);
   assert.equal(y.exact_owner_verified,false);
   assert.deepEqual(y.candidate_owners,x.possible_canonical_targets);
  }
 }
}
assert.equal(reviews.dossiers.length,141);
for(const x of reviews.dossiers){
 const y=index.get("canonical/"+x.id);
 assert.equal(y.source_file,x.source_file);
 assert.equal(y.sections,x.section_count);
 assert.equal(y.source_scope_reviewed_sections,x.sections_with_bounded_review);
 assert.equal(y.published,false);
}
assert.equal(research.entries.length,123);
for(const x of research.entries){
 const y=index.get("research/"+x.id);
 assert.equal(y.canonical_owner,x.canonical_owner);
 assert.equal(y.citation_instances,x.source_link_occurrences);
 assert.equal(y.published,false);
}
for(const id of ["CSE055","CSE056","CSE058"])assert.equal(index.get("sexual/"+id).access,"EDITORIAL_ARCHIVE_WITH_REDIRECT");
assert.equal(ledger.counts.layers["archival-LTF"],54);
assert.equal(ledger.counts.layers["catechism-witness"],433);
assert.equal(ledger.counts.layers["sexual-ethics"],150);
console.log("PASS 1527 Formation evidence projections and publication holds");
