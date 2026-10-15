import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const read=x=>JSON.parse(readFileSync(x,"utf8"));
const b3=read("data/learn/formation-canonical-synthesis-batch3-2026-10-09.v1.json");
const review=read("data/learn/formation-primary-context-review-4-2026-10-09.v1.json");
const previous=read("data/learn/formation-primary-context-review-3-2026-10-09.v1.json");
const historicalDelta=read("data/reference/formation-current-source-reconciliation.v2.json");
const corrected=new Map(historicalDelta.historical_pass4_source_dispositions.map(x=>[x.id,x]));
const retained=read("data/learn/formation-retained-evolution-china-case-records-20261014.v1.json");
const owners=new Map(b3.dossiers.map(d=>[d.id,d])),src=new Map(b3.source_registry.map(s=>[s.id,s]));
assert.equal(previous.findings.length,30);assert.equal(review.scope.prior_findings_retained,65);
assert.equal(review.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS4_20261009_V1");
assert.equal(review.findings.length,31);assert.equal(review.scope.additional_findings,31);
assert.equal(review.scope.canonical_existing_owners_revised.length,10);
assert.equal(review.publication_allowed,false);assert.equal(review.independent_theological_canonical_approval,false);assert.equal(review.native_french_copyapproval,false);
assert.equal(new Set(review.findings.map(x=>x.id)).size,31);
let unchangedSourceIDs=0,rescopedHistoricalFindings=0;
for(const f of review.findings){
 const o=owners.get(f.owner);assert.ok(o,f.id+" missing owner");
 const p=o.sections.find(x=>x.role===f.role);assert.ok(p);
 assert.equal(src.get(f.source_id)?.url,f.url,f.id+" historical original source URL changed");
 assert.match(f.url,/^https:\/\/[^/\s]+\/\S+/);
 assert.ok(f.locator.length>=40&&f.document_finding.length>=45&&f.qualification.length>=35,
  f.id+" bounded source evidence was altered");
 assert.equal(f.independent_certified,false);
 assert.ok(p.text.en.length>=195&&p.text.fr.length>=185);
 assert.equal(p.original_context_approved,false);
 assert.equal(p.french_final_approved,false);
 if(p.source_ids.includes(f.source_id)) {
  unchangedSourceIDs++;
  assert.ok(!corrected.has(f.id),f.id+" marked superseded but still retains original source ID");
  continue;
 }
 rescopedHistoricalFindings++;
 const disposition=corrected.get(f.id);
 assert.ok(disposition,f.id+" historical finding changed without bounded disposition");
 assert.equal(disposition.owner,f.owner);
 assert.equal(disposition.role,f.role);
 assert.equal(disposition.old,f.source_id);
 if(disposition.current) {
  const possible=o.sections.flatMap(sec=>sec.source_ids).filter(id=>id===disposition.current);
  assert.equal(possible.length,1,f.id+" successor source missing from current owner");
  assert.equal(src.get(disposition.current)?.url,f.url,f.id+" successor differs from same historical witness URL");
 } else if(f.owner==="CR-GOV-01") {
  const historical=retained.cases.find(c=>c.former_owner==="CR-GOV-01");
  assert.ok(historical,"Historical Vatican–China case removed instead of preserved");
  assert.equal(historical.publication_allowed,false);
  assert.ok(historical.original_draft.length===4);
 } else assert.equal(f.id,"PSV4-031","Only explicitly retired 1945 judicial locator may be absent");
 assert.match(disposition.disposition,/HISTORICAL|RETAINED|NOT_CURRENT|NOT_AUTOTRANSFERRED/);
}
assert.equal(unchangedSourceIDs,24);
assert.equal(rescopedHistoricalFindings,7);
assert.equal(corrected.size,7);
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
assert.match(P("CR-GOV-01","critical_response").text.en,/promulga|legisl|juridical|bishops|authority/i,
 "Revised owner must address its canonical Church governance question, not duplicate the retained China case");
assert.ok(P("CR-GOV-07","documented_position").source_ids.includes("RATZ2004"));
console.log(JSON.stringify({qa:"PASS_PRIOR_PASS4_SOURCE_DISPOSITIONS",historicalFindings:31,stillSameSourceIdentity:24,explicitlyRescoped:7,priorFindings:65,independentApprovals:0,published:0}));
