import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const base="data/learn/";
const matrix=read(base+"formation-141-claim-scope-matrix-2026-10-09.v1.json");
const packs=matrix.source_packs.map(read);
const map=new Map(packs.flatMap(pack=>pack.dossiers.map(d=>[d.id,{d,reg:new Map(pack.source_registry.map(s=>[s.id,s]))}])));
const prev=read(base+"formation-primary-context-review-7-2026-10-09.v1.json");
const ledger=read(base+"formation-primary-context-review-8-2026-10-09.v1.json");
assert.equal(prev.findings.length,88);
assert.equal(ledger.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS8_20261009_V1");
assert.equal(ledger.scope.prior_findings_retained,235);
assert.equal(ledger.scope.new_bounded_findings,50);
assert.equal(ledger.scope.new_distinct_sections_with_bounded_review,50);
assert.equal(ledger.scope.bilingual_sections_rewritten_in_wave,12);
assert.equal(ledger.findings.length,50);
assert.equal(ledger.publication_allowed,false);
assert.equal(ledger.independent_theological_canonical_approval,false);
assert.equal(ledger.native_french_copyapproval,false);
const pairSet=new Set();
for(const [i,f] of ledger.findings.entries()){
 assert.equal(f.id,"PSV8-"+String(i+1).padStart(3,"0"));
 assert.equal(f.scope,"BOUNDED_CLAIM_TO_PRIMARY_PASSAGE_CHECK_NOT_FULL_CERTIFICATION");
 assert.equal(f.independent_certified,false);
 const key=f.owner+"|"+f.role;assert.ok(!pairSet.has(key),"Claim observation duplicated: "+key);pairSet.add(key);
 const obj=map.get(f.owner);assert.ok(obj,"Unknown dossier "+f.owner);
 const section=obj.d.sections.find(s=>s.role===f.role);
 assert.ok(section?.source_ids.includes(f.source_id),key+": claimed original not linked in substantive section");
 assert.equal(obj.reg.get(f.source_id)?.url,f.url,"URL differs from canonical original source registry");
 assert.match(f.url,/^https:\/\/[^\s/]+\/\S+/);
 assert.ok(f.locator.length>25&&f.document_finding.length>65&&f.qualification.length>=65,"Thin primary-text review "+f.id);
 assert.equal(section.original_context_approved,false);
 assert.equal(section.french_final_approved,false);
}
const rewritten=[
 ["CR-DOC-05","traditional_catholic_argument","Libertas","Libertas"],
 ["CR-DOC-07","traditional_catholic_argument","Lumen gentium","Lumen gentium"],
 ["CR-AUT-04","critical_response","Doctrinal Commentary","Commentaire doctrinal"],
 ["CR-AUT-05","traditional_catholic_argument","Canon 212","canon 212"],
 ["CR-AUT-10","traditional_catholic_argument","Aquinas","Saint Thomas"],
 ["APOL-039","traditional_catholic_argument","Lumen gentium","Lumen gentium"],
 ["APOL-045","traditional_catholic_argument","Romans 11","Romains 11"],
 ["APOL-048","traditional_catholic_argument","Dominus Iesus","Dominus Iesus"],
 ["APOL-051","traditional_catholic_argument","Veritatis splendor","Veritatis splendor"],
 ["CR-IDM-03","traditional_catholic_argument","Mortalium animos","Mortalium animos"],
 ["CR-IDM-04","traditional_catholic_argument","Lumen gentium","Lumen gentium"],
 ["CR-MOR-03","traditional_catholic_argument","Humanae vitae","Humanae vitae"]
];
for(const [id,role,en,fr] of rewritten){
 const p=map.get(id).d.sections.find(s=>s.role===role);
 assert.ok(p.text.en.includes(en)&&p.text.fr.includes(fr),id+" revised bilingual source text missing");
 assert.ok(p.text.en.length>420&&p.text.fr.length>420,id+" text too thin");
 assert.ok(Object.keys(p.source_claim_locators||{}).length>=1,id+" specific locators missing");
 for(const src of Object.keys(p.source_claim_locators||{}))assert.ok(p.source_ids.includes(src),id+" unsupported source_claim_locator");
}
for(const pack of packs){
 for(const d of pack.dossiers)for(const flag of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
   assert.equal(d[flag],false,d.id+" premature release");
}
console.log(JSON.stringify({status:"PASS",observations:ledger.findings.length,distinctSections:pairSet.size,bilingualRevisions:rewritten.length,published:0,independentApprovals:0}));
