import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/learn/";
const m=read(root+"formation-141-claim-scope-matrix-2026-10-09.v1.json");
const prior=m.review_ledgers.slice(0,9).flatMap(p=>read(p).findings);
const ten=read(root+"formation-primary-context-review-10-2026-10-09.v1.json");
const eleven=read(root+"formation-primary-context-review-11-2026-10-09.v1.json");
const packs=m.source_packs.map(p=>({path:p,data:read(p)}));
const owners=new Map(packs.flatMap(p=>p.data.dossiers.map(d=>[d.id,{d,reg:new Map(p.data.source_registry.map(s=>[s.id,s]))}])));
assert.equal(m.review_ledgers.length,11);
assert.equal(prior.length,345);
assert.equal(ten.findings.length,188);
assert.equal(eleven.findings.length,72);
assert.equal(m.metrics.canonical_dossiers,141);
assert.equal(m.metrics.substantive_sections,564);
assert.equal(m.metrics.bounded_source_review_findings,605);
assert.equal(m.metrics.distinct_sections_with_bounded_review,564);
assert.equal(m.metrics.distinct_sections_without_bounded_review,0);
assert.equal(m.metrics.dossiers_independently_certified,0);
assert.equal(m.metrics.dossiers_published,0);
assert.equal(m.editorial_review_tiers.pass10_existing_dossier_source_evidence_reused,188);
assert.equal(m.editorial_review_tiers.pass11_new_source_scope_checks,72);
assert.equal(m.editorial_review_tiers.pass11_explicit_high_risk_documentary_holds,5);
assert.match(m.count_semantics,/NOT_FULL_PASSAGE_COLLATION_OR_THEOLOGICAL_APPROVAL/);
const seen=new Set();
function check(f,method){
  assert.ok(!seen.has(f.owner+"|"+f.role),"duplicate newly audited section "+f.id);
  seen.add(f.owner+"|"+f.role);
  const obj=owners.get(f.owner);assert.ok(obj,"unknown owner "+f.owner);
  const section=obj.d.sections.find(s=>s.role===f.role);
  assert.ok(section?.source_ids.includes(f.source_id),"missing citation in substantive section "+f.id);
  const orig=obj.reg.get(f.source_id);assert.ok(orig,"missing canonical registry source "+f.id);
  assert.equal(orig.url,f.url,"citation URL changed "+f.id);
  assert.match(f.url,/^https:\/\/\S+/,"malformed original link "+f.id);
  assert.ok(f.locator.length>=9&&f.document_finding.length>=60&&f.qualification.length>=60,"unsupported short finding "+f.id);
  assert.ok(f.claim_examined.length>=55,"unidentified claim being audited "+f.id);
  assert.equal(f.independent_certified,false,"editorial scope is not independent certification "+f.id);
  assert.equal(section.original_context_approved,false);
  assert.equal(section.french_final_approved,false);
  assert.ok(section.text.en.length>=175 && section.text.fr.length>=175);
  assert.ok(m.dossiers.find(d=>d.id===f.owner).roles.find(s=>s.role===f.role).bounded_findings.includes(f.id),f.id+" missing from metric matrix");
  if(method==="cross") {
    const inherited=prior.find(p=>p.id===f.provenance_finding_id);
    assert.ok(inherited,"inherited review reference missing "+f.id);
    assert.equal(inherited.owner,f.owner);
    assert.equal(inherited.source_id,f.source_id);
    assert.equal(inherited.url,f.url);
    assert.equal(inherited.document_finding,f.document_finding,"original finding was not genuinely carried forward");
    assert.match(f.method,/REUSE_PRIOR_BOUNDED_DOCUMENT_CONTEXT/);
  } else {
    assert.ok(["BOUNDED_PRIMARY_CLAIM_SCOPE_REVIEW_NOT_FULL_ORIGINAL_COLLATION","NEEDS_DISTINCT_DOCUMENT_OR_COMPETENT_INTERPRETATION"].includes(f.status));
  }
}
for(const [i,f] of ten.findings.entries()){assert.equal(f.id,"PSV10-"+String(i+1).padStart(3,"0"));check(f,"cross");}
for(const [i,f] of eleven.findings.entries()){assert.equal(f.id,"PSV11-"+String(i+1).padStart(3,"0"));check(f,"fresh");}
assert.equal(seen.size,260);
const held=eleven.findings.filter(f=>f.status==="NEEDS_DISTINCT_DOCUMENT_OR_COMPETENT_INTERPRETATION");
assert.equal(held.length,5);
assert.deepEqual(new Set(held.map(f=>f.owner)),new Set(["CR-LIT-04","CR-ORG-09","CR-LIT-06","CR-ECC-05","CR-AUT-07"]));
const claim=(id,role)=>owners.get(id).d.sections.find(s=>s.role===role);
for(const [id,role,term] of [
 ["CR-ECC-04","critical_response","Bellarmine"],
 ["CR-ECC-08","traditional_catholic_argument","Pastor aeternus"],
 ["CR-DOC-04","answer","Libertas"],
 ["CR-DOC-09","critical_response","Mater Populi Fidelis"],
 ["APOL-020","answer","Pastor aeternus"],
 ["APOL-021","traditional_catholic_argument","Vincent"],
 ["APOL-022","answer","Apostolicae curae"],
 ["APOL-024","critical_response","Baptist"],
 ["APOL-026","answer","John 20"],
 ["APOL-052","critical_response","Samaritanus bonus"],
 ["APOL-053","critical_response","Catechism"],
 ["APOL-059","traditional_catholic_argument","Rerum novarum"]]){
  const s=claim(id,role);
  assert.ok(s.text.en.includes(term),id+" missing the revised substantive original-text argument");
  assert.ok(s.text.en.length>350&&s.text.fr.length>350,"bilingual revision too thin "+id);
  assert.ok(Object.keys(s.source_claim_locators||{}).length>0,"missing paragraph source locators "+id);
  for(const src of Object.keys(s.source_claim_locators))assert.ok(s.source_ids.includes(src),id+" illegally cited source "+src);
}
for(const pack of packs){assert.equal(pack.data.publication_allowed,false);for(const d of pack.data.dossiers){
  for(const flag of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])assert.equal(d[flag],false,d.id+" illegally approved");
  for(const section of d.sections)for(const src of Object.keys(section.source_claim_locators||{}))assert.ok(section.source_ids.includes(src),d.id+" unsupported source locator");
}}
console.log(JSON.stringify({status:"PASS",dossiers:141,sections:564,priorBounded:345,sourceReuse:188,newSourceChecks:72,documentaryHolds:5,expertApprovals:0,published:0}));
