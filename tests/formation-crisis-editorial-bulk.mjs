import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/learn/";
const audit=read(root+"formation-crisis-editorial-bulk-2026-10-10.v1.json");
const historical=read(root+"formation-141-claim-scope-matrix-2026-10-09.v1.json");
const delta=read("data/reference/formation-current-source-reconciliation.v2.json");
const banks=["formation-crisis-sourcefirst-batch6-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch8-2026-10-09.v1.json"].map(x=>read(root+x));
const cases=new Map([
 ["CR-DOC-03","SSPX2012-FOUR"],["CR-ECC-01","NOWHERETIC"],
 ["CR-ECC-02","NOWHERETIC"],["CR-AUT-05","CURRAN86-ORIGINAL-CR"],
 ["CR-GOV-04","CURRAN1986-GOV"],["CR-GOV-10","FIVECARD-SYN-GOV"]
]);
const changed=new Map(delta.historical_crisis_editorial_amendment_reassignments.map(x=>[x.owner+"::"+x.role,x]));
assert.equal(changed.size,3);
assert.equal(audit.modified_roles.length,12);
assert.equal(audit.stats.length,6);
const seen=new Set(),roles=new Set();
for(const pack of banks){
 const sources=new Map(pack.source_registry.map(x=>[x.id,x]));
 assert.equal(sources.size,pack.metrics.source_registry_entries);
 for(const d of pack.dossiers){
  if(!cases.has(d.id))continue;seen.add(d.id);
  assert.equal(d.sections.length,4);
  assert.deepEqual(d.sections.map(x=>x.role),
    ["answer","documented_position","critical_response","traditional_catholic_argument"]);
  const oldPrimary=cases.get(d.id);
  assert.ok(sources.get(oldPrimary)?.url?.startsWith("https://"),
    d.id+" the prior opposing source has been lost from the registry");
  assert.ok(d.sections[1].attribution?.length>20);
  if(d.id==="CR-AUT-05"){
   const record=changed.get("CR-AUT-05::documented_position");
   assert.ok(record);
   assert.equal(record.original_proponent_successor,"AO26_CRAUT05_DOCUM_1");
   assert.equal(sources.get(record.original_proponent_successor).url,
    sources.get(oldPrimary).url,
    "Previously quoted Curran original article URL must survive, not just a generic CDF reply");
   assert.ok(d.sections[1].source_ids.includes(record.original_proponent_successor));
  }else assert.ok(d.sections[1].source_ids.includes(oldPrimary),
   d.id+" previously supported opposing position displaced without scoped resolution");
  for(const section of d.sections){
   const id=d.id+"::"+section.role;roles.add(id);
   assert.ok(section.text.en.length>170&&section.text.fr.length>170,id+" short text");
   assert.ok(section.source_ids?.length,id+" lacks original-source links");
   for(const ref of section.source_ids)
    assert.ok(sources.get(ref)?.url?.startsWith("https://"),id+" orphan source "+ref);
   for(const ref of Object.keys(section.source_claim_locators||{}))
    assert.ok(section.source_ids.includes(ref),id+" source locator not attached");
   assert.equal(section.original_context_approved,false);
   assert.equal(section.french_final_approved,false);
   const previous=historical.dossiers.find(x=>x.id===d.id).roles.find(x=>x.role===section.role);
   const amendment=audit.modified_roles.find(x=>x.owner===d.id&&x.role===section.role);
   const rescoped=changed.get(id);
   if(rescoped){
    assert.deepEqual(rescoped.current_source_ids,section.source_ids);
    if(amendment)assert.deepEqual(rescoped.historic_source_ids,amendment.current_source_ids);
    else assert.equal(rescoped.historic_source_ids,null);
   }else if(amendment){
    assert.deepEqual(section.source_ids,amendment.current_source_ids);
    assert.equal(amendment.previous_source_count,previous.source_id_count);
   }else assert.equal(section.source_ids.length,previous.source_id_count,
    id+" needs a documented source-role rescope");
  }
  for(const k of ["original_claim_by_claim_source_context_certified",
   "independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])
   assert.equal(d[k],false,d.id+" unapproved research published");
 }
}
assert.deepEqual([...seen].sort(),[...cases.keys()].sort());
assert.equal(roles.size,24);
assert.equal(audit.publication_allowed,false);
assert.equal(delta.metrics.crisis_editorial_role_corrections_requiring_rescope,3);
const reader=readFileSync("src/learn/formation-recovery-review.js","utf8");
const documentary=reader.match(/const documentaryCrisisIds=new Set\(\[([\s\S]*?)\]\);/);
assert.ok(documentary);
const labels=[...documentary[1].matchAll(/"CR-[A-Z]+-\d+"/g)].map(x=>x[0].slice(1,-1));
assert.equal(labels.length,30);
assert.equal(new Set(labels).size,30);
const canonical=new Set(read(root+"church-crisis-canonical.v1.json").dossiers.map(x=>x.id));
for(const id of labels)assert.ok(canonical.has(id));
assert.match(reader,/Historical documents and evidence/);
assert.match(reader,/Documents et témoignages historiques/);
console.log(JSON.stringify({result:"PASS_PRIOR_CRISIS_EDITORIAL_AUDIT_PRESERVATION",
 historicCaseOwners:6,historicalSourceRoleAmendments:12,currentRescopedRoles:3,
 originalCurranPublisherLinkRetained:true,independentCertifications:0},null,2));
