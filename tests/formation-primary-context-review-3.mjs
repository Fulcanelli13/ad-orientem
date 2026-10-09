import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const a=read("data/learn/formation-crisis-sourcefirst-batch6-2026-10-09.v1.json"),b=read("data/learn/formation-crisis-sourcefirst-batch7-2026-10-09.v1.json"),ledger=read("data/learn/formation-primary-context-review-3-2026-10-09.v1.json");
const owners=new Map([...a.dossiers,...b.dossiers].map(x=>[x.id,x]));
const sourceById=new Map([...a.source_registry,...b.source_registry].map(x=>[x.id,x]));
assert.equal(ledger.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS3_20261009_V1");
assert.equal(ledger.scope.new_bounded_source_checks,30);
assert.equal(ledger.findings.length,30);
assert.equal(ledger.scope.existing_owner_dossiers_revised,11);
assert.equal(ledger.publication_allowed,false);
assert.equal(ledger.independent_theological_canonical_approval,false);
assert.equal(ledger.native_french_copyapproval,false);
assert.equal(new Set(ledger.findings.map(x=>x.id)).size,30);
let limited=0;
for(const f of ledger.findings){
 const owner=owners.get(f.owner);assert.ok(owner,f.id+" no owner");
 const section=owner.sections.find(x=>x.role===f.role);
 assert.ok(section?.source_ids.includes(f.source_id),f.id+" absent from actual paragraph links");
 assert.ok(section.text.en.length>=165&&section.text.fr.length>=165,f.id+" insufficient bilingual copy");
 assert.ok(f.locator.length>=35&&f.document_finding.length>=50&&f.qualification.length>=40,f.id+" scope or limitations omitted");
 assert.equal(sourceById.get(f.source_id)?.url,f.url,f.id+" missing URL or registry disagreement");
 assert.match(f.url,/^https:\/\/[^/\s]+\/\S+/);
 assert.equal(f.independent_certified,false);
 if(f.status==="PUBLISHED_OPPONENT_ARTICLE_IDENTIFIED_EXCERPTS")limited++;
}
assert.equal(limited,2,"the two CMRI extracts must not be marked full-page verified");
const section=(id,role)=>owners.get(id).sections.find(x=>x.role===role);
assert.ok(section("CR-ECC-10","documented_position").source_ids.includes("CMRI-UNA-PIV"));
assert.ok(section("CR-ECC-10","documented_position").source_ids.includes("CMRI-UNA-STEP"));
assert.match(section("CR-DOC-06","critical_response").text.en,/hierarchy of truths/);
assert.match(section("CR-IDM-04","documented_position").text.en,/SSPX/);
assert.match(section("CR-DOC-08","critical_response").text.en,/racial|collective/);
assert.ok(section("CR-IDM-04","critical_response").source_ids.includes("CDF2007-COMMENT"));
assert.equal(a.source_registry.length,a.metrics.source_registry_entries);
assert.equal(b.source_registry.length,b.metrics.source_registry_entries);
for(const pack of [a,b])for(const d of pack.dossiers){
 for(const key of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])assert.equal(d[key],false,d.id+" mistakenly approved");
 for(const p of d.sections){assert.equal(p.original_context_approved,false);assert.equal(p.french_final_approved,false);assert.ok(p.source_ids.length>0);}
}
console.log(JSON.stringify({qa:"PASS",ownerDossiersReviewed:11,boundedFindings:30,issuerExtractOnly:2,primaryReviewed:28,olderFindingsRetained:35,approved:0,publication:0}));
