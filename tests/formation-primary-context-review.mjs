import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const f=read("data/learn/formation-primary-context-review-2026-10-09.v1.json");
const a=read("data/learn/formation-crisis-sourcefirst-batch6-2026-10-09.v1.json"),b=read("data/learn/formation-crisis-sourcefirst-batch7-2026-10-09.v1.json");
assert.equal(f.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS_20261009_V1");
assert.equal(f.findings.length,17);
assert.equal(new Set(f.findings.map(x=>x.id)).size,17);
assert.equal(f.published,false);
assert.equal(f.any_theological_signoff,false);
assert.equal(f.any_native_french_approval,false);
const dossiers=[...a.dossiers,...b.dossiers], sources=new Map([...a.source_registry,...b.source_registry].map(x=>[x.id,x]));
for(const x of f.findings){
 const owner=dossiers.find(z=>z.id===x.owner);
 assert.ok(owner,x.id+" invalid canonical owner");
 const p=owner.sections.find(z=>z.role===x.role);
 assert.ok(p,x.id+" bad role");
 if(x.status==="SUPERSEDED_BY_FIRSTPERSON_PROPONENT_REVIEW"){
  assert.equal(x.id,"PSV1-016");
  assert.equal(x.superseded_by,"PSV2-002");
  assert.equal(x.current_role,"critical_response");
  assert.ok(owner.sections.find(y=>y.role===x.current_role).source_ids.includes(x.source_id),x.id+" source was lost rather than moved to Catholic reply");
 }else{
  assert.ok(p.source_ids.includes(x.source_id),x.id+" no claim citation");
 }
 const s=sources.get(x.source_id);
 assert.ok(s&&s.url===x.url,x.id+" wrong source URL");
 assert.ok(x.locator.length>15&&x.document_finding.length>40&&x.qualification.length>30);
 assert.equal(x.independent_certified,false);
}
for(const x of dossiers){
 for(const gate of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
 assert.equal(x[gate],false,x.id+" falsely certified");
}
const sec=(id,role)=>dossiers.find(x=>x.id===id).sections.find(x=>x.role===role);
assert.ok(sec("CR-ECC-06","critical_response").source_ids.includes("CIC1353"));
assert.match(sec("CR-ECC-06","critical_response").text.en,/not a general grant/);
assert.match(sec("CR-ECC-07","answer").text.en,/had incurred excommunication/);
assert.match(sec("CR-ECC-07","documented_position").text.en,/1999/);
assert.ok(sec("CR-MOR-04","documented_position").source_ids.includes("CURRAN86-FIRSTPERSON"));
assert.ok(sec("CR-MOR-03","documented_position").source_ids.includes("CURRAN86-FIRSTPERSON"));
assert.match(sec("CR-LIT-01","answer").text.en,/25 March 1956/);
assert.match(sec("CR-DOC-05","documented_position").text.en,/civil religious indifferentism/);
const key=new Set(dossiers.map(x=>x.id));assert.equal(key.size,dossiers.length);
console.log(JSON.stringify({qa:"PASS",boundedPrimaryPassageFindings:f.findings.length,correctedOwners:f.scope.dossiers_with_new_wording.length,reviewPending:f.findings.filter(x=>x.status==="PARTIAL_REQUIRES_ORIGINAL_OPPONENT_OR_ARCHIVE").length,approved:0,published:0}));
