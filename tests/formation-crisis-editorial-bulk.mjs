import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/learn/";
const audit=read(root+"formation-crisis-editorial-bulk-2026-10-10.v1.json");
const old=read(root+"formation-141-claim-scope-matrix-2026-10-09.v1.json");
const banks=["formation-crisis-sourcefirst-batch6-2026-10-09.v1.json","formation-crisis-sourcefirst-batch8-2026-10-09.v1.json"].map(x=>read(root+x));
const cases=new Map([
 ["CR-DOC-03","SSPX2012-FOUR"],
 ["CR-ECC-01","NOWHERETIC"],
 ["CR-ECC-02","NOWHERETIC"],
 ["CR-AUT-05","CURRAN86-ORIGINAL-CR"],
 ["CR-GOV-04","CURRAN1986-GOV"],
 ["CR-GOV-10","FIVECARD-SYN-GOV"]
]);
const seen=new Set();
for(const pack of banks){
 const regs=new Map(pack.source_registry.map(s=>[s.id,s]));
 assert.equal(pack.metrics.source_registry_entries,regs.size);
 for(const d of pack.dossiers){
  if(!cases.has(d.id))continue;
  seen.add(d.id);
  assert.deepEqual(d.sections.map(s=>s.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
  assert.ok(d.sections[1].source_ids.includes(cases.get(d.id)));
  assert.ok(d.sections[1].attribution?.length>20);
  for(const s of d.sections){
   assert.ok(s.text.en.length>170&&s.text.fr.length>170,d.id+" bilingual section too thin "+s.role);
   assert.ok(s.source_ids?.length,d.id+" missing paragraph citations "+s.role);
   for(const id of s.source_ids)assert.ok(regs.get(id)?.url?.startsWith("https://"),d.id+" unresolved source "+id);
   for(const id of Object.keys(s.source_claim_locators||{}))assert.ok(s.source_ids.includes(id),d.id+" source locator orphaned "+id);
   assert.equal(s.original_context_approved,false);
   assert.equal(s.french_final_approved,false);
  }
  for(const k of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])assert.equal(d[k],false,d.id+" false approval");
  const historical=old.dossiers.find(x=>x.id===d.id);
  for(const s of d.sections){
    const n=historical.roles.find(x=>x.role===s.role).source_id_count;
    if(n!==s.source_ids.length){
      const a=audit.modified_roles.find(x=>x.owner===d.id&&x.role===s.role);
      assert.ok(a,d.id+" missing amendment "+s.role);
      assert.equal(a.previous_source_count,n);
      assert.deepEqual(a.current_source_ids,s.source_ids);
    }
  }
 }
}
assert.deepEqual([...seen].sort(),[...cases.keys()].sort());
assert.equal(audit.modified_roles.length,12);
assert.equal(audit.stats.length,6);
assert.equal(audit.publication_allowed,false);
const reader=readFileSync("src/learn/formation-recovery-review.js","utf8");
const documentary=reader.match(/const documentaryCrisisIds=new Set\(\[([\s\S]*?)\]\);/);
assert.ok(documentary,"factual question label registry missing");
const matches=[...documentary[1].matchAll(/"CR-[A-Z]+-\d+"/g)].map(z=>z[0].slice(1,-1));
assert.equal(matches.length,30);
assert.equal(new Set(matches).size,30);
const allowed=new Set(read(root+"church-crisis-canonical.v1.json").dossiers.map(x=>x.id));
for(const id of matches)assert.ok(allowed.has(id),"labelled documentary owner missing "+id);
assert.match(reader,/Historical documents and evidence/);
assert.match(reader,/Documents et témoignages historiques/);
console.log("PASS: 6 bilingual source-attributed Crisis corrections and 30 factual evidence labels; all final approvals remain false");
