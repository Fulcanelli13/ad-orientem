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
  assert.ok(section?.source_ids.includes(f.source_id),f.id+" citation absent in owner role");
  assert.equal(record.sources.get(f.source_id)?.url,f.url,f.id+" link differs from source registry");
  assert.match(f.url,/^https:\/\/[^\s/]+\/\S+/);
  assert.ok(f.locator.length>=25&&f.document_finding.length>=70&&f.qualification.length>=60,f.id+" thin source finding");
  assert.ok(["BOUNDED_DIRECT_TEXT_EDITORIAL_COMPARISON_NO_INDEPENDENT_CERTIFICATION","LIMITED_BIBLIOGRAPHIC_ABSTRACT_ONLY"].includes(f.status));
  assert.equal(f.independent_certified,false);
  assert.equal(section.original_context_approved,false);
  assert.equal(section.french_final_approved,false);
}
assert.deepEqual(seven.findings.filter(f=>f.status==="LIMITED_BIBLIOGRAPHIC_ABSTRACT_ONLY").map(f=>f.owner),["CR-ORG-09"]);
const role=(id,r)=>records.get(id).dossier.sections.find(x=>x.role===r);
assert.match(role("CR-LIT-11","documented_position").text.en,/597.*1,233.*315.*20/);
assert.match(role("CR-LIT-10","documented_position").text.en,/expedit/);
assert.match(role("CR-LIT-07","documented_position").text.en,/25 September 1969/);
assert.match(role("CR-DOC-09","documented_position").text.en,/John Paul II/);
assert.match(role("APOL-002","documented_position").text.en,/§37/);
assert.match(role("APOL-052","documented_position").text.en,/voluntary/);
assert.match(role("APOL-060","documented_position").text.en,/1983/);
assert.match(role("CR-GOV-05","documented_position").text.en,/two-thirds/);
assert.match(role("CR-GOV-10","documented_position").text.en,/Magisterium/);
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
console.log(JSON.stringify({status:"PASS",newFindings:88,newOwnersReviewed:77,bilingualParagraphsRewritten:19,limitedAbstracts:1,approvals:0,published:0}));
