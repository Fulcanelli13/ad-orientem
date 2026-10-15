import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=x=>JSON.parse(readFileSync(x,"utf8"));
const index=read("data/reference/formation-prior-audit-reconciliation.v1.json");
const cross=read("data/reference/formation-canonical-source-crosswalk.v1.json");
const delta=read("data/reference/formation-current-source-reconciliation.v2.json");
const history=read("data/learn/formation-123-source-claim-gates-2026-10-09.v1.json");
const primary=read("data/learn/formation-primary-context-review-2026-10-09.v1.json");
const tlm=read("data/learn/traditional-mass-objections-026-050-recovered.v1.json");
const corpus=new Map(cross.source_files.flatMap(file=>read(file.path).dossiers.map(d=>
 [d.id,{d,scope:file.scope,path:file.path}])));
const norm=x=>String(x||"").replace(/\s+/g," ").trim();
const hash=value=>{
 let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}
 return (h>>>0).toString(16).padStart(8,"0");
};
assert.equal(index.schema,"AO_FORMATION_PRIOR_AUDIT_RECONCILIATION_V1");
assert.match(index.status,/NO_NEW_SOURCE_PASS/);
assert.equal(index.owners.length,141);
assert.equal(corpus.size,141);
assert.equal(index.metrics.matched_owner_screens,83);
assert.equal(index.metrics.exact_matched_screen_sections,332);
assert.equal(index.metrics.new_claim_verifications,0);
assert.equal(index.metrics.fully_certified_owners,0);
const seen=new Set(),screened=new Set(),linkedRoles=new Set();
let matchedSections=0,screenedOwners=0,linkedPrimary=0,currentlyExact=0,currentlySuperseded=0;
const supersededRoles=new Map(delta.changed_previous_screened_sections.map(x=>[x.owner+"::"+x.role,x]));
for(const row of index.owners){
 assert.ok(!seen.has(row.owner),"Duplicate canonical owner "+row.owner);seen.add(row.owner);
 const current=corpus.get(row.owner);assert.ok(current,"Invented dossier owner "+row.owner);
 assert.equal(row.scope,current.scope);
 assert.equal(row.canonical_path,current.path);
 assert.equal(row.section_count,current.d.sections.length);
 assert.equal(row.publication_allowed,false);
 assert.equal(row.whole_dossier_independently_certified,false);
 if(row.prior_draft_screen){
  screenedOwners++;screened.add(row.owner);
  const source=row.prior_draft_screen;
  assert.equal(source.all_source_and_english_role_text_matched,true);
  assert.equal(source.final_certified,false);
  assert.equal(source.audit_commit,"3ebe6a6dc1e1dd0757f0ed80d3eefaf80e6c9f21");
  assert.match(source.review_type,/NOT_CLAIM_CERTIFICATION/);
  assert.equal(source.role_fingerprints.length,current.d.sections.length);
  for(const role of source.role_fingerprints){
   const section=current.d.sections.find(s=>s.role===role.role);
   assert.ok(section,row.owner+" historical role missing: "+role.role);
   const actual=hash(norm(section.text.en)+"\n"+section.source_ids.join("|"));
   const changed=supersededRoles.get(row.owner+"::"+role.role);
   if(changed){
    currentlySuperseded++;
    assert.equal(changed.previous_fingerprint,role.text_source_fingerprint);
    assert.equal(changed.current_fingerprint,actual);
    assert.deepEqual(changed.old_source_ids,role.source_ids);
    assert.deepEqual(changed.new_source_ids,section.source_ids);
    assert.notEqual(actual,role.text_source_fingerprint,
      row.owner+" historical screen should not be marked superseded after restoration");
   }else{
    currentlyExact++;
    assert.deepEqual(role.source_ids,section.source_ids,row.owner+" historical source attribution changed");
    assert.equal(role.text_source_fingerprint,actual,
      row.owner+" exact prior screen changed but was not explicitly rescope-labelled");
   }
   matchedSections++;linkedRoles.add(row.owner+"::"+role.role);
  }
 }else assert.equal(row.coverage_interpretation,
  "NO_SCREEN_REFERENCED_BY_THIS_83_OWNER_EXACT_MATCH_SUBSET__CHECK_OTHER_PIPELINES");
}
assert.equal(screenedOwners,83);assert.equal(matchedSections,332);
assert.equal(linkedRoles.size,332);
assert.equal(currentlyExact,310);
assert.equal(currentlySuperseded,22);
assert.equal(supersededRoles.size,currentlySuperseded);
assert.equal(delta.metrics.exact_reviewed_sections_retained,currentlyExact);
assert.equal(delta.metrics.changed_reviewed_sections,currentlySuperseded);
assert.equal(index.metrics.other_owners_not_in_two_specific_screens,58);
assert.equal(index.merged_primary_context_findings.length,primary.findings.length);
for(const reviewed of index.merged_primary_context_findings){
 const original=primary.findings.find(x=>x.id===reviewed.finding_id);
 assert.ok(original);assert.equal(reviewed.owner,original.owner);
 assert.equal(reviewed.role,original.role);
 assert.equal(reviewed.source_id,original.source_id);
 assert.equal(reviewed.status,original.status);
 assert.equal(reviewed.final_approved,false);
 const matched=corpus.get(reviewed.owner).d.sections.find(s=>s.role===reviewed.role);
 // Historical review verdict refers to the earlier source/role snapshot.
 // Separately recognize whether that identical source remains in the
 // latest rewritten role; never move the historical verdict automatically.
 const now=!!matched?.source_ids.includes(reviewed.source_id);
 if(now)linkedPrimary++;
 else assert.ok(delta.historical_bounded_primary_findings_superseded.some(
  x=>x.finding_id===reviewed.finding_id),
  reviewed.finding_id+" source moved without recorded historical disposition");
}
assert.equal(linkedPrimary,15);
assert.equal(delta.metrics.primary_findings_still_source_bound_to_current_role,15);
const superseded=index.merged_primary_context_findings.filter(x=>!x.current_section_source_match);
assert.deepEqual(superseded.map(x=>x.finding_id),["PSV1-016"]);
assert.match(superseded[0].status,/SUPERSEDED/);
assert.deepEqual(delta.historical_bounded_primary_findings_superseded.map(x=>x.finding_id),
 ["PSV1-002","PSV1-016"]);
assert.equal(delta.metrics.primary_findings_historical_or_superseded,2);
assert.equal(index.legacy_research_QA_gate_references.length,123);
assert.equal(index.legacy_research_QA_gate_references.length,history.entries.length);
for(const ref of index.legacy_research_QA_gate_references){
 const actual=history.entries.find(x=>x.id===ref.record);
 assert.ok(actual);assert.equal(ref.owner,actual.canonical_owner);
 assert.equal(ref.prior_original_passage_spot_checks,actual.original_text_spot_checks.length);
 assert.equal(ref.certified,false);
}
const found=tlm.records.flatMap(record=>record.paragraphs.map((p,i)=>({
 record:record.id,index:i,owner:record.canonical_owner,p
})).filter(x=>x.p.citation_review?.status));
assert.equal(found.length,74);
assert.equal(index.legacy_TLM_paragraph_verdicts.length,found.length);
let counts={};
for(const x of index.legacy_TLM_paragraph_verdicts){
 const actual=found.find(y=>y.record===x.record&&y.index===x.paragraph_index);
 assert.ok(actual,"Previous TLM audit verdict disappeared");
 assert.equal(x.owner,actual.owner);
 assert.equal(x.verdict,actual.p.citation_review.status);
 assert.deepEqual(x.source_ids,actual.p.source_ids);
 assert.equal(x.final_approved,false);
 counts[x.verdict]=(counts[x.verdict]||0)+1;
}
assert.deepEqual({...counts,BLOCKED:0},tlm.claim_level_audit.status_counts);
assert.equal(tlm.claim_level_audit.status_counts.BLOCKED,0);
assert.deepEqual(index.metrics.legacy_TLM_status_counts,counts);
assert.equal(index.metrics.legacy_TLM_paragraphs,74);
console.log(JSON.stringify({
 status:"PASS_PRIOR_AUDIT_REUSE",canonicalOwners:141,exactPreviousFourRoleScreens:83,
 historicScreenedSections:332,currentExactScreenedSections:310,supersededScreens:22,boundedPrimaryFindings:17,stillLinkedPrimaryFindings:15,
 supersededPrimaryFinding:"PSV1-016",legacyQARecords:123,
 legacyTLMParagraphs:74,priorAuditCertifiedAsWhole:0,newSourceReview:0},null,2));
