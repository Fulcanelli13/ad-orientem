import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const path="data/learn/";
const audit=read(path+"formation-crisis-priority-bulk-amendment-2026-10-10.v1.json");
const canon=new Map(read(path+"church-crisis-canonical.v1.json").dossiers.map(x=>[x.id,x]));
const matrix=new Map(read(path+"formation-141-claim-scope-matrix-2026-10-09.v1.json").dossiers.map(x=>[x.id,x]));
const delta=read("data/reference/formation-current-source-reconciliation.v2.json");
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
 ["CR-LIT-05","OTT69-CR"],["CR-LIT-06","OTT69"],
 ["CR-DOC-07","FEENEY-CR"],["CR-DOC-08","MAIMON-CR"],
 ["CR-MOR-06","FUCHS71-FIRSTPERSON-REPRINT"],
 ["CR-IDM-06","FRANCIS-AUD23-CR"],
 ["CR-GOV-08","MURPHY-CR-2009"],
 ["CR-GOV-09","MONEYVAL-CR-2024"]
]);
assert.equal(audit.schema,"formation-crisis-priority-bulk-source-amendment-v1");
assert.equal(audit.modified_roles.length,16);
assert.equal(audit.summary.length,8);
assert.deepEqual(audit.summary.map(x=>x.id),[...expected.keys()]);
const reassign=new Map(delta.historical_crisis_amendment_reassignments.map(x=>[x.owner+"::"+x.role,x]));
assert.equal(reassign.size,6);
let unchangedHistory=0,reassignedHistory=0,firstPersonNotClaimed=0;
for(const [id,original] of expected){
 const item=owners.get(id);assert.ok(item,id+" canonical answer absent");
 const {d,refs}=item;assert.ok(canon.has(id));
 assert.equal(d.sections.length,4);
 assert.deepEqual(d.sections.map(x=>x.role),
  ["answer","documented_position","critical_response","traditional_catholic_argument"]);
 assert.ok(refs.get(original)?.url?.startsWith("https://"),id+" historical first-hand source URL was deleted");
 assert.equal(refs.get(original).original_context_approved,false);
 const position=d.sections[1];
 assert.ok(position.attribution?.length>20,id+" opposing side or magisterial witness unlabelled");
 if(id==="CR-MOR-06"){
  // The revised draft deliberately admits that VS describes a theory,
  // not a first-person Fuchs demonstration. Never count that as verified
  // first-person opposition merely because the older register contained it.
  assert.match(position.text.en,/not a first-person statement by Josef Fuchs/);
  assert.match(position.text.en,/remains unresolved/);
  assert.ok(!position.source_ids.includes(original));
  firstPersonNotClaimed++;
 } else if(!position.source_ids.includes(original)){
  const record=reassign.get(id+"::documented_position");
  assert.ok(record,id+" historic proponent source absent without explicit disposition");
  assert.ok(record.historical_source_ids.includes(original));
  assert.deepEqual(record.current_source_ids,position.source_ids);
  assert.match(record.status,/NEEDS_SCOPED_REVIEW/);
 } else {
  assert.ok(position.source_ids.includes(original),id+" historical original source missing");
 }
 for(const role of d.sections){
  assert.ok(role.text.en.length>170&&role.text.fr.length>170,id+" inadequate bilingual draft "+role.role);
  assert.ok(role.source_ids?.length,id+" unsourced role "+role.role);
  for(const source of role.source_ids)assert.ok(refs.get(source)?.url?.startsWith("https://"),id+" orphan local source "+source);
  for(const source of Object.keys(role.source_claim_locators||{}))assert.ok(role.source_ids.includes(source),id+" source claim locator not linked "+source);
  assert.equal(role.original_context_approved,false);
  assert.equal(role.french_final_approved,false);
  if(role.role==="traditional_catholic_argument")
   assert.doesNotMatch(role.text.en,/this dossier|this module|our app|editorial note/i);
 }
 for(const f of ["original_claim_by_claim_source_context_certified",
  "independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])
  assert.equal(d[f],false,id+" incorrect publication approval");
 const snapshot=matrix.get(id);
 assert.ok(snapshot,id+" missing frozen original review scope");
 for(const role of d.sections){
  const key=id+"::"+role.role;
  const amended=audit.modified_roles.find(x=>x.owner===id&&x.role===role.role);
  const changed=reassign.get(key);
  if(changed){
   reassignedHistory++;
   assert.ok(amended,"Historical amendment not found for "+key);
   assert.deepEqual(changed.historical_source_ids,amended.current_source_ids);
   assert.deepEqual(changed.current_source_ids,role.source_ids);
  }else if(amended){
   unchangedHistory++;
   assert.deepEqual(amended.current_source_ids,role.source_ids);
  }else{
   const old=snapshot.roles.find(x=>x.role===role.role);
   assert.ok(old);
   assert.equal(old.source_id_count,role.source_ids.length,
    key+" changed unexpectedly without historical amendment");
  }
 }
}
assert.equal(unchangedHistory,10);
assert.equal(reassignedHistory,6);
assert.equal(firstPersonNotClaimed,1);
for(const x of audit.summary)for(const k of ["original_context_certified",
 "theology_approved","french_approved","public_release"])assert.equal(x[k],false);
assert.equal(audit.publication_allowed,false);
assert.equal(audit.independent_theological_approval,false);
console.log(JSON.stringify({result:"PASS_CRISES_HISTORIC_AMENDMENT_PRESERVATION",
 historicRoleReviews:16,currentUnchangedRoleSourceLists:10,
 editedRoleSourceListsMarkedForScopedReview:6,
 admittedMissingFirstHandProponent:1,newClaimsIndependentlyCertified:0},null,2));
