import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=x=>JSON.parse(readFileSync(x,"utf8"));
const baseline=read("data/reference/formation-canonical-source-crosswalk.v1.json");
const delta=read("data/reference/formation-current-source-reconciliation.v2.json");
assert.equal(baseline.schema,"AO_FORMATION_SOURCE_CROSSWALK_V1");
assert.equal(delta.schema,"AO_FORMATION_CURRENT_SOURCE_RECONCILIATION_V2");
assert.equal(delta.metrics.currently_independently_certified_new_claims,0);
assert.equal(delta.metrics.published_apologetics_crisis_dossiers,0);
assert.equal(baseline.source_files.length,8);
assert.equal(baseline.source_bindings.length,408);
assert.equal(baseline.witness_index.length,304);
assert.equal(baseline.metrics.evidence_edges,1541,"Do not rewrite the 2026-10-15 historical audit snapshot");
const original=new Map(baseline.source_bindings.map(x=>[x.key,x]));
const originalURLs=new Map(baseline.witness_index.map(x=>[x.id,x.url]));
const added=new Map(delta.added_source_bindings.map(x=>[x.key,x]));
assert.equal(added.size,119);
assert.equal(delta.metrics.scoped_source_bindings_added,119);
assert.equal(delta.metrics.scoped_source_bindings_removed,0);
assert.equal(delta.old_identity_changes.length,0);
assert.equal(delta.missing_historical_bindings.length,0);
for(const w of baseline.witness_index) {
 assert.match(w.url,/^https:\/\//);
 assert.ok(["URL_NOT_INDEPENDENTLY_TESTED_IN_THIS_PASS",
 "OFFICIAL_PAGE_OPENED_2026_10_15__SAME_DOCUMENT_IDENTITY_ONLY"].includes(w.inspection));
}
const scopes=new Set(),ids=new Set(),allUrls=new Set();
let dossiers=0,sections=0,edges=0,locators=0,sourceCount=0;
for(const f of delta.source_files) {
 const pack=read(f.path);
 scopes.add(f.scope);
 assert.equal(pack.publication_allowed,false);
 assert.equal(pack.dossiers.length,f.dossiers);
 assert.equal(pack.source_registry.length,f.sources_now);
 const local=new Map();
 for(const s of pack.source_registry) {
  const key=f.scope+"::"+s.id;
  assert.ok(!ids.has(key),"Duplicate pack-local ID "+key);ids.add(key);
  local.set(s.id,s);sourceCount++;allUrls.add(s.url);
  assert.match(s.url,/^https:\/\//);
  assert.equal(s.original_context_approved,false,"Never import independent approval from editor correction");
  const old=original.get(key),extra=added.get(key);
  assert.ok((old&&!extra)||(!old&&extra),key+" must have exactly one canonical identity history");
  if(old) {
   assert.equal(originalURLs.get(old.witness_id),s.url,key+" original URL changed without review");
   assert.equal(old.title,s.title,key+" original title changed");
   assert.equal(old.locator,s.locator||null,key+" historical source locator changed");
   assert.equal(old.role,s.role||s.provenance||null,key+" historical provenance changed");
  } else {
   assert.equal(extra.url,s.url);
   assert.equal(extra.title,s.title);
   assert.equal(extra.locator,s.locator||null);
   assert.equal(extra.role,s.role||s.provenance||null);
   assert.match(extra.scope_status,/NOT_NEWLY_VERIFIED/);
  }
 }
 let localEdges=0;
 for(const d of pack.dossiers) {
  assert.equal(d.publication_allowed,false);
  assert.equal(d.sections.length,4);
  dossiers++;
  for(const section of d.sections) {
   assert.equal(section.original_context_approved,false);
   assert.equal(section.french_final_approved,false);
   sections++;
   assert.ok(section.source_ids.length>0,"Uncited section "+d.id+" "+section.role);
   for(const id of section.source_ids) {
    assert.ok(local.has(id),"Missing actual local source "+f.scope+"::"+id+" in "+d.id);
    localEdges++;edges++;
    if(section.source_claim_locators?.[id])locators++;
   }
  }
 }
 assert.equal(localEdges,f.evidence_edges_now,"Source-to-argument graph changed; reconcile this pack separately");
}
assert.equal(scopes.size,8);
assert.equal(ids.size,527);
assert.equal(sourceCount,527);
assert.equal(allUrls.size,332);
assert.equal(dossiers,141);
assert.equal(sections,564);
assert.equal(edges,1529);
assert.equal(locators,347);
assert.deepEqual({source_bindings:sourceCount,url_witnesses:allUrls.size,
 current_evidence_edges:edges,claim_locators:locators},{
 source_bindings:delta.metrics.source_bindings,url_witnesses:delta.metrics.url_witnesses,
 current_evidence_edges:delta.metrics.current_evidence_edges,claim_locators:delta.metrics.claim_locators});
assert.equal(baseline.review_queue.uncited_sources.length,12,
 "Historical registry-only leads must not be silently eliminated from the baseline snapshot");
assert.equal(baseline.metrics.cross_url_work_identities_verified,1);
console.log(JSON.stringify({result:"PASS_NONDESTRUCTIVE_CROSSWALK_CURRENT",
 historicalBindingsPreserved:408,addedExistingCorrectionBindings:119,
 uniqueCurrentURLDestinations:332,sourceEdges:edges,
 certifiedNewClaims:0,researchReverificationJobs:0},null,2));
