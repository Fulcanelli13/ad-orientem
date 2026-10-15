import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const manifest=JSON.parse(readFileSync("data/reference/formation-canonical-source-crosswalk.v1.json","utf8"));
assert.equal(manifest.schema,"AO_FORMATION_SOURCE_CROSSWALK_V1");
assert.match(manifest.status,/NON_DESTRUCTIVE/);
assert.equal(manifest.source_files.length,8);
const bindingByKey=new Map(manifest.source_bindings.map(s=>[s.key,s]));
const witnessById=new Map(manifest.witness_index.map(w=>[w.id,w]));
assert.equal(bindingByKey.size,manifest.source_bindings.length,"Scoped keys must remain unique");
assert.equal(witnessById.size,manifest.witness_index.length,"Witness IDs must remain unique");
assert.equal(new Set(manifest.witness_index.map(w=>w.url)).size,manifest.witness_index.length,
 "Witnesses are exact URL identities and cannot be inferred as work IDs");
const allSourceIDs=new Map();
const used=new Map();
let dossiers=0,sections=0,entries=0;
for(const file of manifest.source_files){
 const d=JSON.parse(readFileSync(file.path,"utf8"));
 assert.equal(d.publication_allowed,false,file.path+" was unexpectedly published");
 assert.equal(file.dossiers,d.dossiers.length,file.path+" dossier count mismatch");
 assert.equal(file.sources,d.source_registry.length,file.path+" sources count mismatch");
 dossiers+=d.dossiers.length;
 const localIDs=new Set();
 for(const s of d.source_registry){
  entries++;
  const key=file.scope+"::"+s.id;
  assert.ok(!localIDs.has(s.id),key+" duplicated inside its original source pack");
  localIDs.add(s.id);
  const binding=bindingByKey.get(key);
  assert.ok(binding,key+" not indexed");
  assert.equal(binding.scope,file.scope);
  assert.equal(binding.local_id,s.id);
  assert.equal(binding.title,s.title,key+" title changed in source index");
  assert.equal(binding.locator,s.locator||null,key+" printed locator lost");
  assert.equal(binding.role,s.role||s.provenance||null,key+" provenance role changed");
  assert.equal(binding.original_context_approved,s.original_context_approved===true);
  assert.equal(binding.original_passage_status,s.original_passage_status||null);
  const witness=witnessById.get(binding.witness_id);
  assert.ok(witness,key+" points to unknown witness");
  assert.equal(witness.url,s.url,key+" exact source URL changed");
  assert.ok(witness.source_bindings.includes(key),key+" missing reverse index");
  assert.match(witness.url,/^https:\/\//);
  if(!allSourceIDs.has(s.id))allSourceIDs.set(s.id,[]);
  allSourceIDs.get(s.id).push(binding.witness_id);
  used.set(key,0);
 }
 for(const dossier of d.dossiers){
  assert.equal(dossier.publication_allowed,false,dossier.id+" publication gate changed");
  for(const section of dossier.sections){
   sections++;
   assert.ok(Array.isArray(section.source_ids)&&section.source_ids.length>0,
    dossier.id+" has an unsourced canonical argument section");
   for(const id of section.source_ids){
    const key=file.scope+"::"+id;
    assert.ok(bindingByKey.has(key),key+" unresolved for "+dossier.id);
    used.set(key,used.get(key)+1);
   }
  }
 }
}
assert.equal(dossiers,141);
assert.equal(sections,564);
assert.equal(entries,408);
assert.equal(bindingByKey.size,entries);
assert.equal(witnessById.size,304);
assert.ok([...witnessById.values()].every(w=>
 w.source_bindings.length&&["URL_NOT_INDEPENDENTLY_TESTED_IN_THIS_PASS",
 "OFFICIAL_PAGE_OPENED_2026_10_15__SAME_DOCUMENT_IDENTITY_ONLY"].includes(w.inspection)));
const manuallyOpened=[...witnessById.values()].filter(w=>w.inspection.startsWith("OFFICIAL_PAGE_OPENED"));
assert.equal(manuallyOpened.length,2);
assert.ok(manuallyOpened.every(w=>w.host==="www.vatican.va"));
assert.equal(manifest.metrics.cross_url_work_identities_verified,1);
assert.equal(manifest.review_queue.named_cross_url_candidate[0].work_candidate_id,
 "WORK-PASTOR-AETERNUS-1870");
const unused=[...used.entries()].filter(([_,n])=>n===0).map(([key])=>key).sort();
assert.equal(unused.length,12,"Registry-only leads changed: preserve rather than erase them");
assert.deepEqual(unused,manifest.review_queue.uncited_sources.map(x=>x.key).sort(),
 "All uncited source leads must be flagged without deleting their original records");
const counts=new Map();
for(const [id,items] of allSourceIDs)if(items.length>1)counts.set(id,items);
assert.equal(counts.size,45);
const conflicts=[...counts.entries()].filter(([_,ids])=>new Set(ids).size>1);
assert.deepEqual(conflicts.map(([id])=>id),["V1"],
 "Never flatten source-pack-local IDs: two different original witness URLs share V1");
assert.equal(manifest.review_queue.short_id_collisions.length,45);
assert.equal(manifest.review_queue.multi_binding_urls.length,72);
assert.equal(manifest.metrics.dossiers,dossiers);
assert.equal(manifest.metrics.sections,sections);
assert.equal(manifest.metrics.scoped_source_bindings,entries);
assert.equal(manifest.metrics.exact_url_witnesses,witnessById.size);
assert.equal(manifest.metrics.unresolved_section_references,0);
assert.equal(manifest.metrics.uncited_source_bindings,unused.length);
assert.equal(manifest.metrics.evidence_edges,[...used.values()].reduce((a,b)=>a+b,0));
assert.equal(manifest.metrics.evidence_edges,1541);
assert.equal(manifest.metrics.unapproved_context_bindings,
 manifest.source_bindings.filter(x=>!x.original_context_approved).length);
assert.ok(manifest.rules.some(x=>x.includes("NOT a verified common author/work/edition/passage")));
console.log(JSON.stringify({
 dossiers,sections,scopedReferences:entries,exactURLWitnesses:witnessById.size,
 repeatedShortIDs:counts.size,unsafeShortIDConflicts:conflicts.map(([id])=>id),
 sourceReferenceEdges:[...used.values()].reduce((a,b)=>a+b,0),
 contextUnapproved:manifest.metrics.unapproved_context_bindings,
 result:"PASS_NONDESTRUCTIVE_CROSSWALK"
},null,2));
