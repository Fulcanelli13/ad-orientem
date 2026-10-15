import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(path,"utf8"));
const crosswalk=read("data/reference/formation-canonical-source-crosswalk.v1.json");
const audit=read("data/reference/formation-evidence-relationship-ledger.v1.json");
assert.equal(audit.schema,"AO_FORMATION_EVIDENCE_RELATIONSHIP_LEDGER_V1");
assert.match(audit.status,/UNPUBLISHED/);
assert.equal(audit.counts.fully_certified_sections,0);
assert.equal(audit.counts.independently_theologically_approved_sections,0);
assert.equal(audit.sections.length,564);
assert.equal(audit.edges.length,1541);
assert.equal(audit.checked_claims.length,8);
const sectionMap=new Map(audit.sections.map(s=>[s.section_key,s]));
const edgeMap=new Map(audit.edges.map(e=>[e.edge_key,e]));
const sourceMap=new Map(crosswalk.source_bindings.map(s=>[s.key,s]));
assert.equal(sectionMap.size,audit.sections.length);
assert.equal(edgeMap.size,audit.edges.length);
const checks=new Map(audit.checked_claims.map(x=>[x.edge_key,x]));
assert.equal(checks.size,8);
const evidenceKinds=new Set([
 "DIRECT_PRIMARY_TEXT_SUPPORT","ORIGINAL_DISPUTANT_POSITION","ORIGINAL_PROPONENT_POSITION",
 "ORIGINAL_SPEAKER_POSITION","CONTEXTUAL_EVIDENCE"
]);
let totalSections=0,totalEdges=0,withLocator=0,unreviewed=0,roleCounts={};
for(const file of crosswalk.source_files){
 const d=read(file.path);
 assert.equal(d.publication_allowed,false,file.path+" publication gate moved");
 for(const dos of d.dossiers){
  assert.equal(dos.publication_allowed,false,dos.id+" publication promoted");
  for(let index=0;index<dos.sections.length;index++){
   const original=dos.sections[index];
   const sectionKey=file.scope+"::"+dos.id+"::"+String(index).padStart(2,"0");
   const s=sectionMap.get(sectionKey);
   assert.ok(s,sectionKey+" missing");
   assert.equal(s.section_index,index);
   assert.equal(s.role,original.role);
   assert.equal(s.attribution,original.attribution||null,
    "Author attribution was modified for "+sectionKey);
   assert.equal(s.evidence_status,"NOT_CERTIFIED");
   assert.equal(s.original_context_approved,original.original_context_approved===true);
   assert.equal(s.french_final_approved,original.french_final_approved===true);
   assert.equal(s.source_count,original.source_ids.length);
   roleCounts[s.role]=(roleCounts[s.role]||0)+1;
   totalSections++;
   for(const sourceID of original.source_ids){
    const edgeKey=sectionKey+"::"+sourceID;
    const edge=edgeMap.get(edgeKey);
    assert.ok(edge,edgeKey+" missing");
    const binding=sourceMap.get(file.scope+"::"+sourceID);
    assert.ok(binding,edgeKey+" lost original source");
    assert.equal(edge.source_binding,binding.key);
    assert.equal(edge.witness_id,binding.witness_id);
    assert.equal(edge.claim_locator,original.source_claim_locators?.[sourceID]||null);
    if(edge.claim_locator)withLocator++;
    const review=checks.get(edgeKey);
    if(review){
     assert.equal(edge.verification,"PASSAGE_OPENED_AND_CLAIM_CORROBORATED");
     assert.equal(edge.review_id,review.id);
     assert.ok(evidenceKinds.has(edge.relationship));
     assert.equal(review.relationship,edge.relationship);
     assert.equal(review.source_id,sourceID);
     assert.equal(review.dossier,dos.id);
     assert.equal(review.role,original.role);
     assert.equal(review.source_url,d.source_registry.find(x=>x.id===sourceID).url);
     assert.equal(review.checked_at,"2026-10-15");
     assert.ok(review.checked_locator&&review.claim_checked&&review.limitations);
     assert.equal(review.verified_specific_claim_only,true);
     assert.equal(review.whole_section_certified,false);
     assert.equal(review.original_language_collated,false);
     assert.equal(review.independent_theological_approval,false);
    }else{
     unreviewed++;
     assert.equal(edge.relationship,"UNASSESSED",edgeKey+" was categorized automatically");
     assert.equal(edge.verification,"NOT_CHECKED",edgeKey+" was falsely certified");
     assert.ok(!edge.review_id);
    }
    totalEdges++;
   }
  }
 }
}
assert.equal(totalSections,564);
assert.equal(totalEdges,1541);
assert.equal(withLocator,248);
assert.equal(unreviewed,1533);
assert.deepEqual(roleCounts,audit.counts.role_counts);
assert.equal(audit.counts.source_edges_with_claim_locator,withLocator);
assert.equal(audit.counts.checked_edges,checks.size);
assert.equal(audit.counts.unreviewed_edges,unreviewed);
assert.deepEqual(audit.checked_claims.map(x=>x.dossier).sort(),
 ["APOL-002","APOL-002","APOL-002","APOL-012","APOL-012","APOL-012","CR-IDM-06","CR-IDM-06"]);
const justin=audit.checked_claims.find(x=>x.dossier==="APOL-012"&&x.source_id==="JUSTIN71"&&x.role==="documented_objection");
assert.match(justin.limitations,/not independent proof/i,
 "An ancient polemical allegation must not be treated as manuscript evidence");
const francis=audit.checked_claims.find(x=>x.dossier==="CR-IDM-06"&&x.role==="critical_response");
assert.match(francis.limitations,/editorial inference/i,
 "A reasoned inference cannot be attributed as the Pope's exact assertion");
console.log(JSON.stringify({status:"PASS_EDITORIAL_EVIDENCE_PILOT",dossiers:141,
 sections:totalSections,sourceEdges:totalEdges,checkedSubclaims:checks.size,
 unreviewedEdges:unreviewed,explicitClaimLocators:withLocator,fullyApprovedSections:0},null,2));
