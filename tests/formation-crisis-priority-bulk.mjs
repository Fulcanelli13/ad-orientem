import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const path="data/learn/";
const audit=read(path+"formation-crisis-priority-bulk-amendment-2026-10-10.v1.json");
const canon=new Map(read(path+"church-crisis-canonical.v1.json").dossiers.map(x=>[x.id,x]));
const matrix=new Map(read(path+"formation-141-claim-scope-matrix-2026-10-09.v1.json").dossiers.map(x=>[x.id,x]));
const banks=[
 "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch6-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch7-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch8-2026-10-09.v1.json"
].map(x=>read(path+x));
const owners=new Map();
for(const bank of banks){
 const refs=new Map(bank.source_registry.map(s=>[s.id,s]));
 assert.equal(bank.metrics.source_registry_entries,refs.size);
 for(const d of bank.dossiers)owners.set(d.id,{d,refs});
}
const expected=new Map([
 ["CR-LIT-05","OTT69-CR"],
 ["CR-LIT-06","OTT69"],
 ["CR-DOC-07","FEENEY-CR"],
 ["CR-DOC-08","MAIMON-CR"],
 ["CR-MOR-06","FUCHS71-FIRSTPERSON-REPRINT"],
 ["CR-IDM-06","FRANCIS-AUD23-CR"],
 ["CR-GOV-08","MURPHY-CR-2009"],
 ["CR-GOV-09","MONEYVAL-CR-2024"]
]);
assert.equal(audit.schema,"formation-crisis-priority-bulk-source-amendment-v1");
assert.equal(audit.modified_roles.length,16);
assert.equal(audit.summary.length,8);
assert.deepEqual(audit.summary.map(x=>x.id),[...expected.keys()]);
for(const [id,original] of expected){
 const item=owners.get(id);assert.ok(item,id+" canonical answer absent");
 const {d,refs}=item;assert.ok(canon.has(id));
 assert.equal(d.sections.length,4);
 assert.deepEqual(d.sections.map(x=>x.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
 const section=d.sections[1];
 assert.ok(section.source_ids.includes(original),id+" no primary contrasting view");
 assert.ok(section.attribution?.length>20,id+" unauthored opposing position");
 const src=refs.get(original);
 assert.ok(src?.url?.startsWith("https://"),id+" no original source link");
 assert.equal(src.original_context_approved,false);
 for(const role of d.sections){
  assert.ok(role.text.en.length>170&&role.text.fr.length>170,id+" inadequate bilingual draft "+role.role);
  assert.ok(role.source_ids?.length,id+" unsourced role "+role.role);
  for(const source of role.source_ids)assert.ok(refs.get(source)?.url?.startsWith("https://"),id+" orphan source "+source);
  for(const source of Object.keys(role.source_claim_locators||{}))assert.ok(role.source_ids.includes(source),id+" claim locator not cited "+source);
  assert.equal(role.original_context_approved,false);
  assert.equal(role.french_final_approved,false);
  if(role.role==="traditional_catholic_argument")assert.doesNotMatch(role.text.en,/this dossier|this module|our app|editorial note/i,id+" meta commentary");
 }
 for(const f of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])
  assert.equal(d[f],false,id+" false independent approval");
 const snapshot=matrix.get(id);
 for(const role of d.sections){
  const old=snapshot.roles.find(q=>q.role===role.role);
  if(old.source_id_count!==role.source_ids.length){
   const amendment=audit.modified_roles.find(x=>x.owner===id&&x.role===role.role);
   assert.ok(amendment,id+" no source count amendment "+role.role);
   assert.equal(amendment.previous_source_count,old.source_id_count);
   assert.equal(amendment.current_source_count,role.source_ids.length);
   assert.deepEqual(amendment.current_source_ids,role.source_ids);
   for(const originalRef of role.source_ids) assert.ok(refs.has(originalRef));
  }
 }
}
for(const x of audit.summary)for(const k of ["original_context_certified","theology_approved","french_approved","public_release"])assert.equal(x[k],false);
assert.equal(audit.publication_allowed,false);
assert.equal(audit.independent_theological_approval,false);
console.log("PASS: eight source-grounded bilingual Church Crisis original-position repairs; 32 sections; 0 final approvals");
