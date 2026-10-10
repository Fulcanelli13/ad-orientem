import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const base="data/learn/";
const audit=read(base+"formation-141-preview-acceptance-2026-10-10.v1.json");
const matrix=read(base+"formation-141-claim-scope-matrix-2026-10-09.v1.json");
const canonical=[
 ...read(base+"apologetics-canonical.v1.json").dossiers,
 ...read(base+"church-crisis-canonical.v1.json").dossiers
];
const packs=matrix.source_packs.map(path=>({path,data:read(path)}));
const owners=new Map(),sourceIds=new Map(),urls=new Set();
for(const {path,data} of packs){
 const registry=new Map(data.source_registry.map(s=>[s.id,s]));
 assert.equal(registry.size,data.source_registry.length,path+" ambiguous source IDs");
 assert.equal(data.metrics.source_registry_entries,registry.size);
 for(const source of data.source_registry){
   assert.match(source.url,/^https:\/\/[^\s]+$/);
   urls.add(source.url);
   if(!sourceIds.has(source.id))sourceIds.set(source.id,[]);
   sourceIds.get(source.id).push({path,url:source.url});
 }
 for(const d of data.dossiers){
   assert.ok(!owners.has(d.id),"Duplicate canonical owner "+d.id);
   assert.equal(d.sections.length,4);
   assert.deepEqual(d.sections.map(s=>s.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
   let count=0;
   for(const s of d.sections){
     assert.ok(s.text?.en?.trim()&&s.text?.fr?.trim(),d.id+" missing bilingual paragraph");
     assert.ok(s.source_ids?.length,d.id+" missing citation");
     assert.equal(s.original_context_approved,false);
     assert.equal(s.french_final_approved,false);
     if(s.role==="documented_position")assert.ok(s.attribution?.length>=18,d.id+" source author missing");
     for(const id of s.source_ids)assert.ok(registry.get(id)?.url?.startsWith("https://"),d.id+" source ID crosses pack boundary: "+id);
     for(const id of Object.keys(s.source_claim_locators||{}))
       assert.ok(s.source_ids.includes(id),d.id+" orphan claim locator");
     count+=s.source_ids.length;
   }
   for(const flag of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])
     assert.equal(d[flag],false,d.id+" falsely expert-certified or published");
   owners.set(d.id,{path,source_pack:path,paragraphs:4,bilingual_paragraphs:4,citations:count,
     distinct_source_ids:new Set(d.sections.flatMap(s=>s.source_ids)).size,
     source_ids_resolve_in_own_pack:true,original_context_expert_approved:false,
     theology_expert_approved:false,native_french_expert_approved:false,public_release_allowed:false});
 }
}
assert.deepEqual(audit.owners.map(x=>x.id),canonical.map(x=>x.id));
assert.equal(owners.size,141);
assert.equal(audit.summary.dossiers,141);
assert.equal(audit.summary.bilingual_cited_paragraphs,564);
const total=[...owners.values()].reduce((n,x)=>n+x.citations,0);
assert.equal(audit.summary.source_citations,total);
assert.equal(audit.summary.distinct_urls_registered,urls.size);
const reused=[...sourceIds].filter(([id,x])=>x.length>1);
const conflicts=reused.filter(([id,x])=>new Set(x.map(v=>v.url)).size>1);
assert.equal(audit.summary.reused_source_ids,reused.length);
assert.equal(audit.summary.source_ids_with_multiple_original_urls,conflicts.length);
assert.equal(conflicts.length,1);
assert.equal(conflicts[0][0],"V1");
for(const row of audit.owners){
 const x=owners.get(row.id);
 assert.ok(x,row.id+" disappeared from source first corpus");
 for(const k of ["source_pack","paragraphs","bilingual_paragraphs","citations","distinct_source_ids","source_ids_resolve_in_own_pack","original_context_expert_approved","theology_expert_approved","native_french_expert_approved","public_release_allowed"])
  assert.deepEqual(row[k],x[k],row.id+" acceptance count or flag drift: "+k);
}
for(const k of ["unresolved_citations","untranslated_paragraphs","final_independent_source_approvals","final_theological_approvals","final_french_approvals","publications_authorized"])
 assert.equal(audit.summary[k],0,"Premature release or incorrectly certified Formation");
const reader=readFileSync("src/learn/formation-recovery-review.js","utf8");
assert.match(reader,/synthMap\.set\(d\.id,\{\.\.\.d,sourceRegistry:originalSources\}\)/);
assert.match(reader,/d\.synthesis\.sourceRegistry/);
assert.doesNotMatch(reader,/state\.synthesisSources=new Map\(\)/);
console.log(JSON.stringify({status:"PASS",dossiers:owners.size,bilingualParagraphs:564,
 citations:total,distinctURLs:urls.size,sourceIDCollisions:reused.length,
 editionConflicts:conflicts.length,independentApprovals:0}));
