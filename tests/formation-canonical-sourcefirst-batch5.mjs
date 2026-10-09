import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const d=read("data/learn/formation-canonical-sourcefirst-batch5-2026-10-09.v1.json");
const prev=read("data/learn/formation-canonical-sourcefirst-batch4-2026-10-09.v1.json");
const ev=read("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const a=read("data/learn/apologetics-canonical.v1.json"),c=read("data/learn/church-crisis-canonical.v1.json");
const drafted=[1,2,3].flatMap(i=>read("data/learn/formation-canonical-synthesis-batch"+i+"-2026-10-09.v1.json").dossiers);
const expected=["APOL-027","APOL-028","APOL-029","APOL-030","APOL-031","APOL-032","APOL-033","APOL-034","APOL-035",
"APOL-036","APOL-037","APOL-038","APOL-039","APOL-040","APOL-041","APOL-043","APOL-045",
"APOL-047","APOL-048","APOL-049","APOL-051","APOL-054","APOL-055","APOL-056","APOL-057","APOL-058"];
assert.equal(d.version,"FORMATION_CANONICAL_SOURCE_FIRST_UNLINKED_BATCH5_V1");
assert.equal(d.status,"UNPUBLISHED_ORIGINAL_EDITORIAL_DRAFT_NO_PRIOR_DIRECT_RESEARCH");
assert.equal(d.publication_allowed,false);
assert.deepEqual(d.dossiers.map(x=>x.id),expected);
const owners=[...a.dossiers,...c.dossiers].map(x=>x.id);
assert.equal(owners.length,141);
const all=[...drafted,...prev.dossiers,...d.dossiers];
assert.equal(all.length,99);
assert.equal(new Set(all.map(x=>x.id)).size,99,"duplicate canonical dossier");
assert.equal(a.dossiers.length,60);
assert.deepEqual(all.filter(x=>x.id.startsWith("APOL-")).map(x=>x.id).sort(),a.dossiers.map(x=>x.id).sort(),"not all 60 Apologetics have direct answer drafts");
const sources=new Map(d.source_registry.map(x=>[x.id,x]));
assert.equal(sources.size,d.source_registry.length,"duplicated source IDs");
let paragraphs=0,pointers=0;
for(const s of sources.values()){
 assert.match(s.url,/^https:\/\/[^/\s]+\/\S+/);
 assert.ok(s.locator.length>=6);
 assert.equal(s.original_context_approved,false,"source incorrectly certified");
}
for(const x of d.dossiers){
 const before=ev.dossiers.find(o=>o.id===x.id);
 assert.ok(before && before.direct_source_bearing_research_ids.length===0,x.id+" is not a source-first owner");
 assert.equal(x.canonical_owner,"APOLOGETICS");
 assert.equal(x.question_provenance,"CANONICAL_TITLE_ONLY_LEGACY_ORIGINAL_NOT_RECOVERED");
 assert.deepEqual(x.research_anchor,[]);
 for(const gate of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])assert.equal(x[gate],false,x.id+" falsely approved");
 assert.deepEqual(x.sections.map(x=>x.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
 for(const p of x.sections){
  assert.ok(p.text.en.length>=280,x.id+" shallow English "+p.role);
  assert.ok(p.text.fr.length>=270,x.id+" shallow French "+p.role);
  if(p.role==="documented_position")assert.ok(p.attribution?.length>=18,x.id+" position lacks real historical attribution");
  assert.ok(p.source_ids.length>0,x.id+" unsourced");
  for(const id of p.source_ids)assert.ok(sources.has(id),x.id+" source ID unresolved "+id);
  assert.equal(p.original_context_approved,false);
  assert.equal(p.french_final_approved,false);
  pointers+=p.source_ids.length;paragraphs++;
 }
}
assert.equal(paragraphs,104);
assert.equal(d.metrics.canonical_dossiers,26);
assert.equal(d.metrics.english_substantive_paragraphs,104);
assert.equal(d.metrics.french_substantive_paragraphs,104);
assert.equal(d.metrics.source_registry_entries,sources.size);
assert.equal(d.metrics.public_routes_added,0);
assert.equal(d.metrics.independent_approvals,0);
for(const id of ["APOL-054","APOL-055","APOL-056","APOL-057","APOL-058"]){
 const x=d.dossiers.find(y=>y.id===id);
 assert.ok(x.sections[1].source_ids.some(s=>["URBAN1095","JPINQ2004","GAL1992","VELM2023","VATS2023"].includes(s)),id+" missing primary documentary opposition or correction");
}
console.log(JSON.stringify({qa:"PASS",canonical:141,apologeticsDrafted:60,churchCrisisDrafted:39,totalDrafted:99,remainingChurchCrisis:42,newEnglish:104,newFrench:104,sourceWorks:sources.size,sourcePointers:pointers,independentlyCertified:0,publicRoutes:0}));
