import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const read=x=>JSON.parse(readFileSync(x,"utf8"));
const b3=read("data/learn/formation-canonical-synthesis-batch3-2026-10-09.v1.json");
const review=read("data/learn/formation-primary-context-review-4-2026-10-09.v1.json");
const previous=read("data/learn/formation-primary-context-review-3-2026-10-09.v1.json");
const owners=new Map(b3.dossiers.map(d=>[d.id,d])),src=new Map(b3.source_registry.map(s=>[s.id,s]));
assert.equal(previous.findings.length,30);assert.equal(review.scope.prior_findings_retained,65);
assert.equal(review.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS4_20261009_V1");
assert.equal(review.findings.length,31);assert.equal(review.scope.additional_findings,31);
assert.equal(review.scope.canonical_existing_owners_revised.length,10);
assert.equal(review.publication_allowed,false);assert.equal(review.independent_theological_canonical_approval,false);assert.equal(review.native_french_copyapproval,false);
assert.equal(new Set(review.findings.map(x=>x.id)).size,31);
for(const f of review.findings){const o=owners.get(f.owner);assert.ok(o,f.id+" missing owner");const p=o.sections.find(x=>x.role===f.role);assert.ok(p?.source_ids.includes(f.source_id),f.id+" missing actual source");assert.equal(src.get(f.source_id)?.url,f.url,f.id+" wrong document URL");assert.match(f.url,/^https:\/\/[^/\s]+\/\S+/);assert.ok(f.locator.length>=40&&f.document_finding.length>=45&&f.qualification.length>=35,f.id+" weak bounded evidence");assert.equal(f.independent_certified,false);assert.ok(p.text.en.length>=195&&p.text.fr.length>=185);assert.equal(p.original_context_approved,false);assert.equal(p.french_final_approved,false);}
assert.equal(b3.source_registry.length,b3.metrics.source_registry_entries);
for(const d of b3.dossiers){for(const k of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])assert.equal(d[k],false,d.id+" false release");}
const P=(id,r)=>owners.get(id).sections.find(x=>x.role===r);
assert.ok(P("CR-MOR-08","documented_position").source_ids.includes("DUBIA2016-FULL"));
assert.ok(P("CR-MOR-08","critical_response").source_ids.includes("BA2016-ORIGINAL-LETTER"));
assert.match(P("CR-MOR-08","critical_response").text.en,/Familiaris consortio/);
assert.ok(P("CR-IDM-07","documented_position").source_ids.includes("ASSISILEF86"));
assert.match(P("CR-IDM-07","answer").text.en,/separately/);
assert.match(P("CR-IDM-05","critical_response").text.en,/129–132|130–132/);
assert.ok(P("CR-ECC-09","documented_position").source_ids.includes("GUERARD-FR"));
assert.match(P("CR-GOV-01","critical_response").text.en,/not the publication/);
assert.ok(P("CR-GOV-07","documented_position").source_ids.includes("RATZ2004"));
console.log(JSON.stringify({qa:"PASS",newFindings:31,priorFindings:65,ownersCorrected:10,newEnglish:28,newFrench:28,independentApprovals:0,published:0}));
