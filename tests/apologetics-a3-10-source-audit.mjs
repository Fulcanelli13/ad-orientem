import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const audit=read("data/learn/apologetics-a3-10-source-audit-2026-10-10.v1.json");
const original=read("data/learn/apologetics-canonical.v1.json").dossiers.slice(50,60);
const evidence=read("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json").dossiers;
const paths=[
  "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json"
];
const src=new Map();
for(const path of paths){
 const p=read("data/learn/"+path),sources=new Map(p.source_registry.map(x=>[x.id,x]));
 for(const d of p.dossiers)src.set(d.id,{d,sources,path:"data/learn/"+path});
}
assert.equal(audit.schema,"apologetics-a3-10-source-audit-v1");
assert.deepEqual(audit.rows.map(x=>x.id),original.map(x=>x.id));
assert.equal(audit.summary.dossiers,10);
assert.equal(audit.summary.complete_bilingual_four_section_drafts,10);
assert.equal(audit.summary.source_linked_sections,40);
assert.equal(audit.summary.source_registry_complete_dossiers,10);
assert.equal(audit.summary.high_priority_unresolved,6);
assert.equal(audit.summary.independently_certified,0);
assert.equal(audit.summary.published,0);
for(const [i,r] of audit.rows.entries()){
 const o=original[i],p=src.get(r.id);
 assert.ok(p,r.id+" has no source-first draft");
 assert.equal(r.title,o.title);
 assert.equal(r.family,o.family);
 assert.equal(r.content_pack,p.path);
 assert.equal(r.sections,4);
 assert.equal(r.bilingual_sections,4);
 assert.equal(r.sections_source_linked,4);
 assert.equal(r.original_question_wording_verbatim_recovered,false);
 assert.equal(r.previous_individually_indexed_research,evidence.find(z=>z.id===r.id).direct_source_bearing_research_ids.length);
 assert.deepEqual(r.roles,["answer","documented_position","critical_response","traditional_catholic_argument"]);
 const refs=new Set();
 for(const s of p.d.sections){
  assert.ok(s.text.en?.length>180&&s.text.fr?.length>180,r.id+" empty EN/FR role");
  assert.ok(s.source_ids?.length);
  for(const id of s.source_ids){
   refs.add(id);assert.ok(/^https:\/\//.test(p.sources.get(id)?.url||""),r.id+": missing original hyperlink "+id);
  }
 }
 assert.equal(r.unique_source_works,refs.size);
 assert.deepEqual(r.unresolved_source_ids,[]);
 for(const key of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])assert.equal(p.d[key],false,r.id+": unjustified certification");
}
console.log("PASS: A3 10/10 four-role bilingual draft dossiers, 40/40 sourced sections, 0 false approvals");
