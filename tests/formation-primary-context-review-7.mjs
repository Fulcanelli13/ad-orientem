import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => JSON.parse(readFileSync(p, "utf8"));
const root = "data/learn/";
const packs = [
  "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
  "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
  "formation-canonical-synthesis-batch3-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json",
  "formation-crisis-sourcefirst-batch6-2026-10-09.v1.json",
  "formation-crisis-sourcefirst-batch7-2026-10-09.v1.json",
  "formation-crisis-sourcefirst-batch8-2026-10-09.v1.json"
].map(p => read(root+p));
const a1=read("data/learn/formation-a1-20261010-source-role-amendment.v1.json");
const a2=read("data/learn/formation-a2-20261010-source-role-amendment.v1.json");
const priority=read("data/learn/formation-priority-original-opponents-source-amendment-2026-10-10.v1.json");
const a1Changed=new Map(a1.modified_roles.map(x=>[x.owner+"|"+x.role,x]));
const linkRepair=read(root+"formation-vatican-i-original-link-repair-2026-10-10.v1.json");
const linkRepairFindings=new Map(linkRepair.findings.map(z=>[z.finding_id,z]));
const verifyHistoricLink=(finding,liveUrl)=>{
 if(liveUrl===finding.url)return;
 const repaired=linkRepairFindings.get(finding.id);
 assert.ok(repaired,finding.id+" source URL changed without a dated repair ledger");
 assert.equal(repaired.owner,finding.owner);
 assert.equal(repaired.source_id,finding.source_id);
 assert.equal(finding.url,linkRepair.original_url,"historic original link was rewritten");
 assert.equal(liveUrl,linkRepair.corrected_url,"link repair no longer points to verified original");
 assert.equal(repaired.historical_record_not_edited,true);
 assert.equal(repaired.new_claim_certified,false);
};

const delta=read("data/reference/formation-current-source-reconciliation.v2.json");
const recorded=delta.historical_pass7_additional_source_dispositions;
assert.equal(recorded.length,15);
const recordedById=new Map(recorded.map(x=>[x.finding_id,x]));
assert.equal(recordedById.size,15);
const a1Superseded=new Map([...a1.original_findings_superseded,...a2.original_findings_superseded,...priority.original_findings_superseded].map(x=>[x.finding_id,x]));
for(const row of recorded){
 assert.ok(!a1Superseded.has(row.finding_id),"Do not manufacture a duplicate verdict for a previously reconciled finding");
 assert.equal(row.independently_certified_current_claim,false);
 assert.equal(row.historic_url.startsWith("https://"),true);
 assert.match(row.disposition,/HISTORICAL_NOT_TRANSFERRED|NOT_A_CURRENT_CLAIM_CERTIFICATION/);
}
const validateReassigned=(f,section,sources)=>{
 const change=a1Superseded.get(f.id);
 const newDisposition=recordedById.get(f.id);
 assert.ok(change||newDisposition,f.id+": original citation removed without an explicit source-review disposition");
 assert.ok(!(change&&newDisposition),f.id+": two competing editorial dispositions");
 const row=change||newDisposition;
 assert.equal(row.owner,f.owner);assert.equal(row.role,f.role);
 assert.equal(change?row.previous_source_id:row.historic_source_id,f.source_id);
 if(newDisposition){
   assert.equal(row.historic_url,f.url);
   assert.deepEqual(row.current_source_ids,section.source_ids);
   const sameCurrentURL=section.source_ids.filter(id=>sources.get(id)?.url===f.url);
   assert.deepEqual(row.matching_original_url_successor_ids,sameCurrentURL);
   assert.equal(row.independently_certified_current_claim,false);
 }else{
   const extra=delta.historical_pass7_preexisting_amendment_extensions.find(x=>x.finding_id===f.id);
   if(extra){
     assert.equal(extra.owner,f.owner);assert.equal(extra.role,f.role);
     assert.equal(extra.historic_source_id,f.source_id);
     assert.deepEqual(extra.prior_amendment_source_ids,row.replacement_source_ids,
       "Previously audited source replacement was changed");
     assert.deepEqual(extra.current_source_ids,section.source_ids);
     assert.deepEqual(section.source_ids.slice(0,row.replacement_source_ids.length),
       row.replacement_source_ids,"Original opponent references must stay first");
     assert.deepEqual(section.source_ids.slice(row.replacement_source_ids.length),
       extra.newly_attached_source_ids,"Only explicitly registered later corrections may extend this role");
     assert.equal(extra.current_claims_independently_certified,false);
     assert.match(extra.disposition,/NOT_EXTENDED_TO_NEW_CLAIMS/);
   } else assert.deepEqual(row.replacement_source_ids,section.source_ids,
     "replacement original-source pointers drifted: "+f.id);
   assert.equal(row.new_citation_claims_independently_certified,false);
 }
 verifyHistoricLink(f,sources.get(f.source_id)?.url);
};
const records = new Map(packs.flatMap(pack => pack.dossiers.map(d => [
  d.id, { dossier:d, sources:new Map(pack.source_registry.map(s=>[s.id,s])) }
])));
const six=read(root+"formation-primary-context-review-6-2026-10-09.v1.json");
const seven=read(root+"formation-primary-context-review-7-2026-10-09.v1.json");
assert.equal(six.findings.length,26);
assert.equal(seven.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS7_20261009_V1");
assert.equal(seven.scope.prior_findings_retained,147);
assert.equal(seven.scope.new_bounded_findings,88);
assert.equal(seven.findings.length,88);
assert.equal(seven.scope.unique_owners_reviewed,77);
assert.equal(seven.scope.section_revisions_in_wave,19);
assert.equal(seven.scope.limited_bibliographical_findings,1);
assert.equal(seven.publication_allowed,false);
assert.equal(seven.independent_theological_canonical_approval,false);
assert.equal(seven.native_french_copyapproval,false);
assert.equal(new Set(seven.findings.map(f=>f.id)).size,88);
for (const [i,f] of seven.findings.entries()){
  assert.equal(f.id,"PSV7-"+String(i+1).padStart(3,"0"));
  const record=records.get(f.owner);
  assert.ok(record,f.id+" no canonical owner");
  const section=record.dossier.sections.find(s=>s.role===f.role);
  assert.ok(section,f.id+" missing owner role");
  if(!section.source_ids.includes(f.source_id))validateReassigned(f,section,record.sources);
  verifyHistoricLink(f,record.sources.get(f.source_id)?.url);
  assert.match(f.url,/^https:\/\/[^\s/]+\/\S+/);
  assert.ok(f.locator.length>=25&&f.document_finding.length>=70&&f.qualification.length>=60,f.id+" thin source finding");
  assert.ok(["BOUNDED_DIRECT_TEXT_EDITORIAL_COMPARISON_NO_INDEPENDENT_CERTIFICATION","LIMITED_BIBLIOGRAPHIC_ABSTRACT_ONLY"].includes(f.status));
  assert.equal(f.independent_certified,false);
  assert.equal(section.original_context_approved,false);
  assert.equal(section.french_final_approved,false);
}
assert.equal(recorded.filter(x=>!seven.findings.some(z=>z.id===x.finding_id)).length,0,"No invented original audit finding");
const activeLinks=seven.findings.filter(z=>{
 const rec=records.get(z.owner);
 return rec.dossier.sections.find(x=>x.role===z.role).source_ids.includes(z.source_id);
});
assert.equal(activeLinks.length,63);
assert.equal(delta.metrics.historical_pass7_total_findings,88);
assert.equal(delta.metrics.historical_pass7_unchanged_source_role_links,63);
assert.equal(delta.metrics.historical_pass7_prior_amendment_supersessions,10);
assert.equal(delta.metrics.historical_pass7_newly_recorded_supersessions,15);
assert.equal(delta.metrics.historical_pass7_existing_amendment_extensions,1);
assert.deepEqual(seven.findings.filter(f=>f.status==="LIMITED_BIBLIOGRAPHIC_ABSTRACT_ONLY").map(f=>f.owner),["CR-ORG-09"]);
const role=(id,r)=>records.get(id).dossier.sections.find(x=>x.role===r);
assert.match(role("CR-LIT-11","documented_position").text.en,/597.*1,233.*315.*20/);
assert.match(role("CR-LIT-10","documented_position").text.en,/expedit/);
assert.match(role("CR-LIT-07","documented_position").text.en,/25 September 1969/);
assert.match(role("CR-DOC-09","documented_position").text.en,/Donum veritatis.*Charles Curran/,
 "Post-correction position must identify actual magisterial text and original theological opponent");
assert.deepEqual(role("CR-DOC-09","documented_position").source_ids,
 ["AO26_CRDOC09_DOCUM_1","AO26_CRDOC09_DOCUM_2"]);
assert.match(role("APOL-002","documented_position").text.en,/David Hume.*Fides et ratio/,
 "Faith/reason question must retain the named Hume objection and its Catholic counterpart");
assert.deepEqual(role("APOL-002","documented_position").source_ids,
 ["AO26_APOL002_DOCUM_1","AO26_APOL002_DOCUM_2"]);
assert.match(role("APOL-052","documented_position").text.en,/John Stuart Mill/);
assert.match(role("APOL-060","documented_position").text.en,/1983/);
assert.match(role("CR-GOV-05","documented_position").text.en,/two-thirds/);
assert.match(role("CR-GOV-10","documented_position").text.en,/dubium dated 10 July 2023/);
assert.match(role("CR-IDM-06","documented_position").text.en,/Ad gentes/);
for(const pack of packs){
 assert.equal(pack.publication_allowed,false);
 assert.equal(pack.metrics?.source_registry_entries,pack.source_registry.length);
 for(const d of pack.dossiers) {
   for(const key of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
     assert.equal(d[key],false,d.id+": illegal approval");
   for(const section of d.sections) {
     assert.ok(section.text.en.length>180&&section.text.fr.length>180);
     for(const source_id of Object.keys(section.source_claim_locators || {}))
       assert.ok(section.source_ids.includes(source_id),d.id+" source locator does not belong to paragraph");
   }
 }
}
console.log(JSON.stringify({status:"PASS",newFindings:88,newOwnersReviewed:77,historicLinksStillActive:63,previouslyRecordedSupersessions:10,newlyRecordedHistoricRescopes:15,bilingualParagraphsRewritten:19,limitedAbstracts:1,approvals:0,published:0}));
