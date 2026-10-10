import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const from=path=>JSON.parse(readFileSync(path,"utf8"));
const audit=from("data/learn/apologetics-a1-25-source-audit-2026-10-10.v1.json");
const canonical=from("data/learn/apologetics-canonical.v1.json").dossiers.slice(0,25);
const evidence=from("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const files=[
  "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
  "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
  "formation-canonical-synthesis-batch3-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
  "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json"
];
const readings=new Map();
for(const name of files){
 const p="data/learn/"+name,pack=from(p),registry=new Map(pack.source_registry.map(s=>[s.id,s]));
 for(const d of pack.dossiers)readings.set(d.id,{d,p,registry});
}
assert.equal(audit.schema,"apologetics-a1-25-source-audit-v1");
assert.deepEqual(audit.rows.map(x=>x.id),canonical.map(x=>x.id),"canonical original order is immutable");
assert.equal(audit.summary.dossiers,25);
assert.equal(audit.summary.sections,100);
assert.equal(audit.summary.all_bilingual,25);
assert.equal(audit.summary.all_section_cited,25);
assert.equal(audit.summary.all_source_registry_ids_resolved,25);
assert.equal(audit.summary.dossiers_with_prior_indexed_research,6);
assert.equal(audit.summary.approved_for_public_release,0);
assert.equal(audit.summary.fully_independent_source_certified,0);
assert.deepEqual(audit.summary.corrections_in_this_branch,["APOL-003","APOL-004","APOL-010"]);
for(const [i,row] of audit.rows.entries()){
 const c=canonical[i], found=readings.get(row.id),d=found?.d;
 assert.ok(d,"missing canonical reading "+row.id);
 assert.equal(row.title,c.title,"editorial dossier title overwritten");
 assert.equal(row.content_pack,found.p,"ledger points to wrong source bank");
 const original=evidence.dossiers.find(x=>x.id===row.id);
 assert.equal(row.original_research_linked,original?.direct_source_bearing_research_ids.length,"legacy research lost");
 assert.equal(row.legacy_evidence_tier,original?.evidence_tier,"research provenance inflated");
 assert.equal(d.sections.length,4,"not four debate sections: "+row.id);
 assert.equal(row.section_count,d.sections.length);
 assert.deepEqual(d.sections.map(s=>s.role).filter(r=>r==="answer"||r==="critical_response"||r==="traditional_catholic_argument"),
  ["answer","critical_response","traditional_catholic_argument"],"missing argument role: "+row.id);
 assert.ok(d.sections.some(s=>["documented_position","documented_objection"].includes(s.role)),row.id+" has no documented position");
 const unique=new Set();
 for(const section of d.sections){
  assert.ok(section.text?.en?.trim()&&section.text?.fr?.trim(),row.id+" lacks bilingual content");
  assert.ok(section.source_ids?.length,row.id+" contains an unlinked claim section");
  if(section.role==="traditional_catholic_argument"){
   assert.doesNotMatch(section.text.en,/this dossier|this question|our module|this module|in this app/i,
    row.id+" traditional reasoning contains meta editorial text");
  }
  for(const id of section.source_ids){
   unique.add(id);
   const source=found.registry.get(id);
   assert.ok(source&&/^https:\/\//.test(source.url),row.id+": missing source registry entry "+id);
  }
 }
 assert.equal(row.source_registry_distinct_ids,unique.size,"audit source count drift "+row.id);
 assert.deepEqual(row.unresolved_source_ids,[]);
 for(const flag of ["four_sections","roles_complete","bilingual_complete","every_section_source_linked","registry_urls_resolved"])
  assert.equal(row.flags[flag],true,row.id+": wrong flag "+flag);
 for(const flag of ["fully_source_context_certified","theological_approved","french_approved","public_release_allowed"])
  assert.equal(row.flags[flag],false,row.id+": premature editorial certification "+flag);
 assert.equal(d.original_claim_by_claim_source_context_certified,false,row.id+" original-context certification was forged");
 assert.equal(d.independent_theological_canonical_approval,false,row.id+" doctrinal approval was forged");
 assert.equal(d.native_french_copyapproval,false,row.id+" French approval was forged");
 assert.equal(d.publication_allowed,false,row.id+" draft was marked public");
 assert.equal(row.independent_certification,"NOT_COMPLETE");
}
const caseOf=id=>readings.get(id).d;
assert.match(caseOf("APOL-003").sections[1].text.en,/Hume/);
assert.ok(caseOf("APOL-003").sections[1].source_ids.includes("HUME-EVIL-X"));
assert.match(caseOf("APOL-004").sections[1].text.en,/David Hume/);
assert.ok(caseOf("APOL-004").sections.some(s=>s.source_ids.includes("CCC156M")));
assert.ok(caseOf("APOL-004").research_anchor.includes("fatima-third-secret"),
 "recoverable Fatima source research was discarded");
assert.ok(!caseOf("APOL-004").sections[3].text.en.includes("this dossier"),
 "editorial provenance leaked into traditional commentary");
assert.ok(caseOf("APOL-010").sections[0].source_ids.includes("CHAL451"));
assert.match(caseOf("APOL-010").sections[0].text.en,/Chalcedon/);
console.log("PASS: 25/25 A1 bilingual dossiers, 100/100 sourced draft sections, research preserved, 0 publication flags");
