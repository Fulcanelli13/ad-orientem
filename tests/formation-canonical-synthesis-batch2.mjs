import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(path,"utf8"));
const a=load("data/learn/formation-canonical-synthesis-batch2-2026-10-09.v1.json");
const old=load("data/learn/formation-canonical-synthesis-batch1-2026-10-09.v1.json");
const evidence=load("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const ap=load("data/learn/apologetics-canonical.v1.json");
const cr=load("data/learn/church-crisis-canonical.v1.json");
const owners=new Set([...ap.dossiers,...cr.dossiers].map(d=>d.id));
const ids=["APOL-002","APOL-004","APOL-008","APOL-010","APOL-042","APOL-050","APOL-052","APOL-053","APOL-059","APOL-060",
"CR-ORG-09","CR-LIT-02","CR-LIT-03","CR-LIT-06","CR-LIT-07","CR-LIT-08","CR-LIT-09","CR-LIT-10","CR-LIT-11","CR-LIT-12"];
assert.equal(a.version,"FORMATION_CANONICAL_SUBSTANTIVE_SYNTHESIS_20261009_BATCH2_V1");
assert.equal(a.publication_allowed,false);
assert.deepEqual(a.dossiers.map(x=>x.id),ids);
assert.equal(a.dossiers.length,20);
assert.equal(new Set([...old.dossiers,...a.dossiers].map(x=>x.id)).size,30,"duplicated canonical owner across batches");
const sourceMap=new Map(a.source_registry.map(s=>[s.id,s]));
assert.equal(sourceMap.size,a.source_registry.length);
let paragraphs=0,links=0;
for(const [id,s] of sourceMap){
 assert.ok(id);
 assert.match(s.url,/^https:\/\/[^\/ ]+\/\S+/);
 assert.ok(s.locator?.length>5,"unscoped source "+id);
 assert.equal(s.original_context_approved,false);
}
for(const r of a.dossiers){
 assert.ok(owners.has(r.id),r.id+" not an existing canonical dossier");
 assert.equal(r.question_provenance,"CANONICAL_EDITORIAL_TITLE_NOT_LEGACY_VERBATIM");
 assert.ok(r.research_anchor.length>0);
 assert.deepEqual(r.research_anchor,evidence.dossiers.find(x=>x.id===r.id)?.direct_source_bearing_research_ids);
 for(const k of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
   assert.equal(r[k],false,r.id+" accidentally approved");
 assert.equal(r.sections.length,4);
 assert.deepEqual(r.sections.map(x=>x.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
 for(const p of r.sections){
   assert.ok(p.text.en.length>=200,r.id+" superficial English "+p.role);
   assert.ok(p.text.fr.length>=200,r.id+" superficial French "+p.role);
   assert.ok(p.source_ids.length>0,r.id+" unsourced "+p.role);
   for(const x of p.source_ids)assert.ok(sourceMap.has(x),r.id+" missing URL "+x);
   if(p.role==="documented_position")assert.ok(p.attribution?.length>12,r.id+" no identifiable original position");
   assert.equal(p.original_context_approved,false);
   assert.equal(p.french_final_approved,false);
   paragraphs++;links+=p.source_ids.length;
 }
}
assert.equal(paragraphs,80);
assert.equal(a.metrics.canonical_dossiers,20);
assert.equal(a.metrics.english_substantive_paragraphs,80);
assert.equal(a.metrics.french_substantive_paragraphs,80);
assert.equal(a.metrics.source_registry_entries,sourceMap.size);
assert.equal(a.metrics.public_routes_added,0);
assert.equal(a.metrics.independent_approvals,0);
console.log(JSON.stringify({qa:"PASS",canonicalDraftOwners:a.dossiers.length,cumulativeCanonicalDrafts:a.dossiers.length+old.dossiers.length,englishParagraphs:paragraphs,frenchParagraphs:paragraphs,uniqueSourceWorks:sourceMap.size,sourceLinkOccurrences:links,publications:0}));
