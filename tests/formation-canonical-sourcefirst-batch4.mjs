import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const doc=read("data/learn/formation-canonical-sourcefirst-batch4-2026-10-09.v1.json");
const e=read("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const ap=read("data/learn/apologetics-canonical.v1.json"),cr=read("data/learn/church-crisis-canonical.v1.json");
const previous=[1,2,3].flatMap(n=>read("data/learn/formation-canonical-synthesis-batch"+n+"-2026-10-09.v1.json").dossiers);
const canonical=new Set([...ap.dossiers,...cr.dossiers].map(x=>x.id));
assert.equal(canonical.size,141);
assert.equal(doc.version,"FORMATION_CANONICAL_SOURCE_FIRST_UNLINKED_BATCH4_V1");
assert.equal(doc.status,"UNPUBLISHED_ORIGINAL_EDITORIAL_DRAFT_NO_PRIOR_DIRECT_RESEARCH");
assert.equal(doc.publication_allowed,false);
const expect=["APOL-001","APOL-003","APOL-005","APOL-006","APOL-007","APOL-009","APOL-011","APOL-014","APOL-015","APOL-016",
"APOL-017","APOL-018","APOL-019","APOL-020","APOL-021","APOL-022","APOL-023","APOL-024","APOL-025","APOL-026"];
assert.deepEqual(doc.dossiers.map(x=>x.id),expect);
assert.equal(new Set([...previous,...doc.dossiers].map(x=>x.id)).size,73,"duplicate existing canonical owner");
const links=new Map(doc.source_registry.map(x=>[x.id,x]));
assert.equal(links.size,doc.source_registry.length);
let paras=0,refs=0;
for(const [id,s] of links){
 assert.match(s.url,/^https:\/\/[^/\s]+\/\S+/);
 assert.ok(s.locator?.length>5,"source lacks original-context locator: "+id);
 assert.equal(s.original_context_approved,false);
}
for(const x of doc.dossiers){
 assert.ok(canonical.has(x.id));
 assert.equal(x.canonical_owner,"APOLOGETICS");
 assert.equal(x.question_provenance,"CANONICAL_TITLE_ONLY_LEGACY_ORIGINAL_NOT_RECOVERED");
 assert.deepEqual(x.research_anchor,[]);
 assert.equal(e.dossiers.find(q=>q.id===x.id).direct_source_bearing_research_ids.length,0);
 for(const k of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])assert.equal(x[k],false);
 assert.deepEqual(x.sections.map(y=>y.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
 for(const p of x.sections){
  assert.ok(p.text.en.length>=210,x.id+" short English "+p.role);
  assert.ok(p.text.fr.length>=210,x.id+" short French "+p.role);
  if(p.role==="documented_position")assert.ok(p.attribution?.length>=18,x.id+" invented or unspecified external speaker");
  assert.ok(p.source_ids.length>0);
  for(const id of p.source_ids)assert.ok(links.has(id),x.id+" orphan source "+id);
  assert.equal(p.original_context_approved,false);
  assert.equal(p.french_final_approved,false);
  paras++;refs+=p.source_ids.length;
 }
}
assert.equal(paras,80);
assert.equal(doc.metrics.canonical_dossiers,20);
assert.equal(doc.metrics.english_substantive_paragraphs,80);
assert.equal(doc.metrics.french_substantive_paragraphs,80);
assert.equal(doc.metrics.source_registry_entries,links.size);
assert.equal(doc.metrics.public_routes_added,0);
assert.equal(doc.metrics.independent_approvals,0);
console.log(JSON.stringify({qa:"PASS",canonicalOwners:141,oldResearchLinkedDraftOwners:53,newOriginalSourceFirstOwners:20,sourceWorks:links.size,newEnglishParagraphs:80,newFrenchParagraphs:80,sourceLinkOccurrences:refs,certified:0,published:0}));
