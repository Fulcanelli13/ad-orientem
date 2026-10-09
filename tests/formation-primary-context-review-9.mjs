import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(path,"utf8"));
const root = "data/learn/";
const matrix = read(root+"formation-141-claim-scope-matrix-2026-10-09.v1.json");
const ledger = read(root+"formation-primary-context-review-9-2026-10-09.v1.json");
const earlier = read(root+"formation-primary-context-review-8-2026-10-09.v1.json");
const packs = matrix.source_packs.map(p=>read(p));
const owners = new Map(packs.flatMap(p=>p.dossiers.map(d=>[d.id,{d,reg:new Map(p.source_registry.map(s=>[s.id,s]))}])));
assert.equal(earlier.findings.length,50);
assert.equal(ledger.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS9_20261009_V1");
assert.equal(ledger.scope.prior_findings_retained,285);
assert.equal(ledger.scope.new_findings,60);
assert.equal(ledger.scope.distinct_previous_unreviewed_sections,60);
assert.equal(ledger.scope.bilingual_revisions,16);
assert.equal(ledger.findings.length,60);
assert.equal(ledger.publication_allowed,false);
assert.equal(ledger.independent_theological_canonical_approval,false);
assert.equal(ledger.native_french_copyapproval,false);
assert.equal(new Set(ledger.findings.map(f=>f.id)).size,60);
assert.equal(new Set(ledger.findings.map(f=>f.owner+"|"+f.role)).size,60);
assert.equal(new Set(ledger.findings.map(f=>f.owner)).size,27);
for(const [i,f] of ledger.findings.entries()){
 assert.equal(f.id,"PSV9-"+String(i+1).padStart(3,"0"));
 assert.ok(["BOUNDED_DIRECT_PRIMARY_PARAGRAPH_SCOPE_CHECK","BOUNDED_DIRECT_LEGISLATIVE_TEXT_CHECK"].includes(f.status));
 const d=owners.get(f.owner);assert.ok(d,"unknown dossier "+f.owner);
 const role=d.d.sections.find(s=>s.role===f.role);assert.ok(role?.source_ids.includes(f.source_id),"source not owned by section "+f.id);
 assert.equal(d.reg.get(f.source_id)?.url,f.url,"source href changed "+f.id);
 assert.match(f.url,/^https:\/\/[^\s/]+\/\S+/);
 assert.ok(f.locator.length>=25&&f.document_finding.length>=65&&f.qualification.length>=65,"thin source claim "+f.id);
 assert.equal(role.original_context_approved,false);
 assert.equal(role.french_final_approved,false);
 assert.equal(f.independent_certified,false);
}
const requiredRewrites=[
 ["APOL-012","answer","Divino afflante Spiritu","Divino afflante Spiritu"],
 ["APOL-012","traditional_catholic_argument","Vulgate","Vulgate"],
 ["APOL-044","answer","Nostra aetate","Nostra aetate"],
 ["APOL-044","critical_response","Nostra aetate","Nostra aetate"],
 ["APOL-046","traditional_catholic_argument","Nostra aetate","Nostra aetate"],
 ["CR-LIT-04","traditional_catholic_argument","Sacrosanctum Concilium","Sacrosanctum Concilium"],
 ["CR-LIT-05","critical_response","Sacrosanctum Concilium","Sacrosanctum Concilium"],
 ["APOL-002","answer","Humani generis","Humani generis"],
 ["APOL-002","critical_response","Humani generis","Humani generis"],
 ["APOL-004","critical_response","27 April 2000","27 avril 2000"],
 ["CR-LIT-02","answer","Sacrosanctum Concilium","Sacrosanctum Concilium"],
 ["CR-LIT-09","answer","Sacrosanctum Concilium","Sacrosanctum Concilium"],
 ["CR-LIT-09","traditional_catholic_argument","Sacrosanctum Concilium","Sacrosanctum Concilium"],
 ["CR-LIT-07","answer","Mediator Dei","Mediator Dei"],
 ["CR-DOC-08","answer","Nostra aetate","Nostra aetate"],
 ["CR-DOC-08","traditional_catholic_argument","Nostra aetate","Nostra aetate"]
];
for(const [id,role,en,fr] of requiredRewrites){
 const s=owners.get(id)?.d.sections.find(s=>s.role===role);
 assert.ok(s?.text.en.includes(en),id+"/"+role+" missing new EN doctrinal text");
 assert.ok(s?.text.fr.includes(fr),id+"/"+role+" missing new FR doctrinal text");
 assert.ok(s.text.en.length>=440&&s.text.fr.length>=430,id+"/"+role+" summary too thin");
 assert.ok(Object.keys(s.source_claim_locators||{}).length>0,id+"/"+role+" locators absent");
 for(const src of Object.keys(s.source_claim_locators))assert.ok(s.source_ids.includes(src),id+"/"+role+" uses uncited section locator");
}
const evolutionPack = packs.find(p=>p.dossiers.some(d=>d.id==="APOL-002"));
assert.match(evolutionPack.source_registry.find(s=>s.id==="HG1950").locator,/§37/,"Pius XII polygenism locator missing");
assert.match(owners.get("APOL-002").d.sections.find(s=>s.role==="critical_response").source_claim_locators.HG1950,/§36–37/);
assert.equal(matrix.review_ledgers.length,9);
assert.equal(matrix.metrics.canonical_dossiers,141);
assert.equal(matrix.metrics.substantive_sections,564);
assert.equal(matrix.metrics.bounded_source_review_findings,345);
assert.equal(matrix.metrics.distinct_sections_with_bounded_review,304);
assert.equal(matrix.metrics.distinct_sections_without_bounded_review,260);
assert.equal(matrix.metrics.dossiers_independently_certified,0);
assert.equal(matrix.metrics.dossiers_published,0);
for(const pack of packs)for(const d of pack.dossiers){
  for(const flag of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
    assert.equal(d[flag],false,d.id+" had an unjustified certification/release flag");
}
console.log(JSON.stringify({status:"PASS",sourceFindings:60,distinctSections:60,bilingualRevisions:16,unreviewedRemaining:260,expertApprovals:0,published:0}));
