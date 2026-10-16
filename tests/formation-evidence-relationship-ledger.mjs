import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const historical=read("data/reference/formation-evidence-relationship-ledger.v1.json");
const baseline=read("data/reference/formation-canonical-source-crosswalk.v1.json");
const current=read("data/reference/formation-current-source-reconciliation.v2.json");
const prior=read("data/reference/formation-prior-audit-reconciliation.v1.json");
assert.equal(historical.schema,"AO_FORMATION_EVIDENCE_RELATIONSHIP_LEDGER_V1");
assert.match(historical.status,/UNPUBLISHED/);
assert.equal(historical.sections.length,564);
assert.equal(historical.edges.length,1541);
assert.equal(historical.checked_claims.length,8);
assert.equal(historical.counts.fully_certified_sections,0);
assert.equal(historical.counts.independently_theologically_approved_sections,0);
assert.equal(historical.counts.reverification_tasks_created,0);
assert.equal(current.metrics.currently_independently_certified_new_claims,0);
assert.equal(current.metrics.published_apologetics_crisis_dossiers,0);
const sections=new Map(historical.sections.map(s=>[s.section_key,s]));
const edges=new Map(historical.edges.map(e=>[e.edge_key,e]));
const oldReferences=new Map(baseline.source_bindings.map(s=>[s.key,s]));
const witness=new Map(baseline.witness_index.map(s=>[s.id,s]));
const revised=new Set(current.changed_previous_screened_sections.map(x=>x.section_key));
assert.equal(sections.size,564);
assert.equal(edges.size,1541);
assert.equal(oldReferences.size,408);
assert.equal(revised.size,22);
for(const e of historical.edges){
 assert.ok(sections.has(e.section_key));
 const binding=oldReferences.get(e.source_binding);
 assert.ok(binding,"Historical binding lost "+e.source_binding);
 assert.equal(e.witness_id,binding.witness_id);
 assert.equal(e.source_binding,e.section_key.split("::")[0]+"::"+e.edge_key.split("::").at(-1));
 assert.ok(witness.get(e.witness_id)?.url?.startsWith("https://"));
 assert.ok(["PASSAGE_OPENED_AND_CLAIM_CORROBORATED",
 "NO_CLAIM_VERDICT_RECORDED_IN_THIS_NEW_LEDGER"].includes(e.verification));
}
const checked=new Set();
for(const claim of historical.checked_claims){
 assert.ok(!checked.has(claim.edge_key));checked.add(claim.edge_key);
 const edge=edges.get(claim.edge_key);
 assert.ok(edge&&edge.verification==="PASSAGE_OPENED_AND_CLAIM_CORROBORATED");
 assert.equal(edge.review_id,claim.id);
 assert.equal(claim.checked_at,"2026-10-15");
 assert.equal(claim.verified_specific_claim_only,true);
 assert.equal(claim.whole_section_certified,false);
 assert.equal(claim.original_language_collated,false);
 assert.equal(claim.independent_theological_approval,false);
 assert.ok(claim.limitations&&claim.claim_checked&&claim.checked_locator);
 const binding=oldReferences.get(edge.source_binding);
 assert.equal(witness.get(binding.witness_id).url,claim.source_url);
}
assert.equal(checked.size,8);
assert.match(historical.checked_claims.find(c=>c.dossier==="APOL-012"&&c.role==="documented_objection").limitations,/not independent proof/i);
assert.match(historical.checked_claims.find(c=>c.dossier==="CR-IDM-06"&&c.role==="critical_response").limitations,/editorial inference/i);
const allNew=new Set(current.added_source_bindings.map(b=>b.key));
let currentEdges=0,retainedEdges=0,newEdges=0,claimLocators=0,dossiers=0,roles=0;
for(const f of current.source_files){
 const pack=read(f.path);const local=new Map(pack.source_registry.map(s=>[s.id,s]));
 for(const d of pack.dossiers){
  dossiers++;assert.equal(d.publication_allowed,false);
  for(let i=0;i<d.sections.length;i++){
   const s=d.sections[i],key=f.scope+"::"+d.id+"::"+String(i).padStart(2,"0");roles++;
   const old=sections.get(key);
   assert.ok(old,key+" old section identity missing");
   assert.equal(old.role,s.role,key+" previously reviewed section role cannot be changed");
   assert.equal(s.original_context_approved,false);
   assert.equal(s.french_final_approved,false);
   for(const id of s.source_ids){
    currentEdges++;const edgeKey=key+"::"+id;
    assert.ok(local.has(id),edgeKey+" orphan local citation");
    if(s.source_claim_locators?.[id])claimLocators++;
    if(edges.has(edgeKey))retainedEdges++;
    else{newEdges++;assert.ok(allNew.has(f.scope+"::"+id)||oldReferences.has(f.scope+"::"+id),
      edgeKey+" invented source identity");}
   }
  }
 }
}
assert.equal(dossiers,141);
assert.equal(roles,564);
assert.equal(currentEdges,1529);
assert.equal(retainedEdges,1399);
assert.equal(newEdges,130);
assert.equal(claimLocators,347);
assert.equal(current.metrics.original_edges_still_present,retainedEdges);
assert.equal(current.metrics.current_edges_not_in_legacy_ledger,newEdges);
assert.equal(current.metrics.current_evidence_edges,currentEdges);
assert.equal(current.metrics.claim_locators,claimLocators);
assert.equal(prior.metrics.matched_owner_screens,83);
assert.equal(prior.metrics.exact_matched_screen_sections,332);
assert.equal(current.metrics.changed_reviewed_sections,22);
assert.equal(current.metrics.exact_reviewed_sections_retained,310);
assert.ok(current.policy.some(x=>x.includes("not a statement that updated argument text is certified")));
console.log(JSON.stringify({status:"PASS_EDITORIAL_EVIDENCE_VERSION_RECONCILIATION",
 historicEdges:1541,previousBoundedChecksPreserved:checked.size,
 currentEdges,retainedOldEdgeIdentities:retainedEdges,newCurrentLinks:newEdges,
 historicalScreens:332,unchangedScreenedSections:310,
 supersededHistoricalScreenedSections:22,reverifiedSubclaims:0},null,2));
