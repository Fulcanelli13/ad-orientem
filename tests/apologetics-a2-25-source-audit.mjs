import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(path,"utf8"));
const audit=load("data/learn/apologetics-a2-25-source-audit-2026-10-10.v1.json");
const amendment=load("data/learn/formation-a2-20261010-source-role-amendment.v1.json");
const canon=load("data/learn/apologetics-canonical.v1.json").dossiers.slice(25,50);
const evidence=load("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const files=[
  "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
  "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
  "formation-canonical-synthesis-batch3-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json"
];
const rows=new Map();
for(const name of files){
 const path="data/learn/"+name,p=load(path),reg=new Map(p.source_registry.map(s=>[s.id,s]));
 for(const d of p.dossiers)rows.set(d.id,{d,reg,path});
}
assert.equal(audit.schema,"apologetics-a2-25-source-audit-v1");
assert.equal(audit.summary.dossiers,25);
assert.equal(audit.summary.bilingual_source_bearing_sections,100);
assert.equal(audit.summary.english_french_four_role_drafts,25);
assert.equal(audit.summary.registry_complete_dossiers,25);
assert.equal(audit.summary.independently_certified,0);
assert.equal(audit.summary.publication_allowed,0);
assert.equal(audit.summary.individual_research_linked,4);
assert.deepEqual(audit.summary.new_substantive_corrections,["APOL-036","APOL-037","APOL-041","APOL-050"]);
assert.deepEqual(audit.rows.map(x=>x.id),canon.map(x=>x.id),"lost canonical A2 question order");
for(const [i,item] of audit.rows.entries()){
 const hit=rows.get(item.id),d=hit?.d,expected=canon[i];
 assert.ok(d,item.id+" lacks source-first draft");
 assert.equal(item.title,expected.title,item.id+" canonical title altered");
 assert.equal(item.family,expected.family,item.id+" category changed");
 assert.equal(item.content_pack,hit.path,item.id+" package location drifted");
 assert.equal(item.section_count,4);
 assert.deepEqual(d.sections.map(x=>x.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
 const e=evidence.dossiers.find(x=>x.id===item.id);
 assert.equal(item.legacy_individually_indexed_research_records,e.direct_source_bearing_research_ids.length,item.id+" legacy research attribution changed");
 let unique=new Set();
 for(const section of d.sections){
   assert.ok(section.text.en?.length>200&&section.text.fr?.length>200,item.id+" missing substantive bilingual text: "+section.role);
   assert.ok(section.source_ids?.length,item.id+" missing paragraph source IDs");
   assert.equal(section.original_context_approved,false,item.id+" section wrongfully approved");
   assert.equal(section.french_final_approved,false,item.id+" French section wrongfully approved");
   for(const s of section.source_ids){
     unique.add(s);
     const source=hit.reg.get(s);
     assert.ok(source && /^https:\/\//.test(source.url),item.id+" unresolved original source: "+s);
     assert.equal(source.original_context_approved,false,item.id+" claimed an original source approved");
   }
   for(const s of Object.keys(section.source_claim_locators||{}))
     assert.ok(section.source_ids.includes(s),item.id+" locator not owned by section");
   if(section.role==="traditional_catholic_argument"){
     assert.doesNotMatch(section.text.en,/this dossier|this question|this module|in the app|editorial text/i,
        item.id+" leaked source-review metadata to faithful commentary");
   }
 }
 assert.equal(unique.size,item.source_registry_unique_ids,item.id+" audit source link count drift");
 assert.deepEqual(item.unresolved_source_ids,[]);
 for(const f of ["four_sections","bilingual","all_sections_source_linked","registry_resolves_all_ids"])
   assert.equal(item.flags[f],true,item.id+" incomplete structural gate "+f);
 for(const f of ["original_passage_certified","independent_theological_approval","native_french_approval","public_release"])
   assert.equal(item.flags[f],false,item.id+" wrongfully certified "+f);
 for(const f of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])
   assert.equal(d[f],false,item.id+" wrongly approved canonical reading "+f);
}
for(const id of ["APOL-036","APOL-037","APOL-041","APOL-050"]){
 const d=rows.get(id).d,p=d.sections.find(x=>x.role==="documented_position");
 assert.ok(p.attribution?.length>20,id+" no identified original opponent");
}
assert.ok(rows.get("APOL-036").d.sections[1].source_ids.includes("WLC109-A2"));
assert.ok(rows.get("APOL-037").d.sections[1].source_ids.includes("CALVIN-RELICS-A2"));
assert.ok(rows.get("APOL-041").d.sections[1].source_ids.includes("ADVENTIST-MILL-A2"));
assert.ok(rows.get("APOL-050").d.sections[1].source_ids.includes("MACKIE-MORAL-A2"));
assert.ok(rows.get("APOL-050").d.sections[1].source_ids.includes("HARMAN-REL-A2"));
assert.match(rows.get("APOL-050").d.sections[1].text.en,/Harman explicitly does not deny/);
const research=rows.get("APOL-050").d.research_anchor;
assert.ok(research.length>0,"linked prior transhumanist research was erased");
assert.equal(amendment.original_findings_superseded.length,1);
assert.equal(amendment.original_findings_superseded[0].finding_id,"PSV7-016");
assert.equal(amendment.independent_certification,false);
assert.equal(amendment.publication_allowed,false);
for(const z of amendment.modified_roles){
 const s=rows.get(z.owner).d.sections.find(q=>q.role===z.role);
 assert.deepEqual(z.current_source_ids,s.source_ids,z.owner+" modified role no longer matches amendment ledger");
}
console.log(JSON.stringify({status:"PASS",dossiers:25,bilingualParagraphs:100,originalSourceIDs:"all resolved",corrections:4,certified:0,published:0}));
