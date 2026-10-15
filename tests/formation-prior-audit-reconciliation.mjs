import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=x=>JSON.parse(readFileSync(x,"utf8"));
const index=read("data/reference/formation-prior-audit-reconciliation.v1.json");
const cross=read("data/reference/formation-canonical-source-crosswalk.v1.json");
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
let matchedSections=0,screenedOwners=0,linkedPrimary=0;
for(const row of index.owners){
 assert.ok(!seen.has(row.owner),"Duplicate canonical owner "+row.owner);seen.add(row.owner);
 const current=corpus.get(row.owner);assert.ok(current,"Invented dossier owner "+row.owner);
 assert.equal(row.scope,current.scope);
 assert.equal(row.canonical_path,current.path);
 assert.equal(row.section_count,current.dos.sections.length);
 assert.equal(row.publication_allowed,false);
 assert.equal(row.whole_dossier_independently_certified,false);
 if(row.prior_draft_screen){
  screenedOwners++;screened.add(row.owner);
  const source=row.prior_draft_screen;
  assert.equal(source.all_source_and_english_role_text_matched,true);
  assert.equal(source.final_certified,false);
  assert.equal(source.audit_commit,"3ebe6a6dc1e1dd0757f0ed80d3eefaf80e6c9f21");
  assert.match(source.review_type,/NOT_CLAIM_CERTIFICATION/);
  assert.equal(source.role_fingerprints.length,current.dos.sections.length);
  for(const role of source.role_fingerprints){
   const section=current.dos.sections.find(s=>s.role===role.role);
   assert.ok(section,row.owner+" historical role missing: "+role.role);
   assert.deepEqual(role.source_ids,section.source_ids,row.owner+" previous citations changed");
   assert.equal(role.text_source_fingerprint,
    hash(norm(section.text.en)+"\n"+section.source_ids.join("|")),
    row.owner+" original audited English text changed; rescope prior assessment instead of inheriting it");
   matchedSections++;linkedRoles.add(row.owner+"::"+role.role);
  }
 }else assert.equal(row.coverage_interpretation,
  "NO_SCREEN_REFERENCED_BY_THIS_83_OWNER_EXACT_MATCH_SUBSET__CHECK_OTHER_PIPELINES");
}
assert.equal(screenedOwners,83);assert.equal(matchedSections,332);
assert.equal(linkedRoles.size,332);
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
 assert.equal(reviewed.current_section_source_match,!!matched?.source_ids.includes(reviewed.source_id));
 if(reviewed.current_section_source_match)linkedPrimary++;
}
assert.equal(linkedPrimary,16);
const superseded=index.merged_primary_context_findings.filter(x=>!x.current_section_source_match);
assert.deepEqual(superseded.map(x=>x.finding_id),["PSV1-016"]);
assert.match(superseded[0].status,/SUPERSEDED/);
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
assert.deepEqual(counts,tlm.claim_level_audit.status_counts);
assert.deepEqual(index.metrics.legacy_TLM_status_counts,counts);
assert.equal(index.metrics.legacy_TLM_paragraphs,74);
console.log(JSON.stringify({
 status:"PASS_PRIOR_AUDIT_REUSE",canonicalOwners:141,exactPreviousFourRoleScreens:83,
 matchedEnglishSourceSections:332,boundedPrimaryFindings:17,stillLinkedPrimaryFindings:16,
 supersededPrimaryFinding:"PSV1-016",legacyQARecords:123,
 legacyTLMParagraphs:74,priorAuditCertifiedAsWhole:0,newSourceReview:0},null,2));
