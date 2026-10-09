import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const one=read("data/learn/formation-primary-context-review-2026-10-09.v1.json");
const two=read("data/learn/formation-primary-context-review-2-2026-10-09.v1.json");
const a=read("data/learn/formation-crisis-sourcefirst-batch6-2026-10-09.v1.json"),b=read("data/learn/formation-crisis-sourcefirst-batch7-2026-10-09.v1.json");
const byId=new Map([...a.dossiers,...b.dossiers].map(x=>[x.id,x]));
const bySource=new Map([...a.source_registry,...b.source_registry].map(x=>[x.id,x]));
assert.equal(one.findings.length,17);assert.equal(two.findings.length,18);
assert.equal(two.version,"FORMATION_PRIMARY_CONTEXT_EDITORIAL_PASS2_20261009_V1");
assert.equal(two.scope.revised_existing_dossiers.length,6);
assert.equal(two.published,false);assert.equal(two.any_theological_signoff,false);assert.equal(two.any_native_french_approval,false);
assert.equal(new Set(two.findings.map(x=>x.id)).size,18);
for(const x of two.findings){
 const owner=byId.get(x.owner);
 assert.ok(owner,x.id+" unknown canonical owner");
 const section=owner.sections.find(y=>y.role===x.role);
 assert.ok(section?.source_ids.includes(x.source_id),x.id+" original citation missing");
 assert.ok(section.text.en.length>=185&&section.text.fr.length>=160,x.id+" bilingual substance missing");
 assert.ok(bySource.get(x.source_id)?.url===x.url,x.id+" source link differs from registry");
 assert.match(x.url,/^https:\/\/[^/\s]+\/\S+/);
 assert.ok(x.locator.length>=45&&x.document_finding.length>40&&x.qualification.length>=40,x.id+" insufficient scoped original evidence");
 assert.equal(x.independent_certified,false);
}
const sec=(id,r)=>byId.get(id).sections.find(x=>x.role===r);
assert.match(sec("CR-ORG-07","answer").text.en,/two-thirds/);
assert.match(sec("CR-ORG-07","answer").text.fr,/deux tiers/);
assert.ok(sec("CR-ORG-07","documented_position").source_ids.includes("RAHNER62-ARCHIVE"));
assert.match(sec("CR-ORG-07","documented_position").text.en,/manuscript itself has not yet been fully compared/);
assert.match(sec("CR-MOR-05","documented_position").text.en,/Josef Fuchs/);
assert.match(sec("CR-MOR-05","documented_position").text.fr,/Josef Fuchs/);
assert.match(sec("CR-MOR-05","critical_response").text.en,/deliberately chosen moral object/);
assert.ok(sec("CR-MOR-05","critical_response").source_ids.includes("GRISEZ85-DIRECT-REPLY"));
assert.equal(bySource.get("FUCHS71-FIRSTPERSON-REPRINT").original_context_approved,false);
assert.equal(bySource.get("RAHNER62-ARCHIVE").original_passage_status,"catalogue_abstract_only_original_manuscript_not_read");
for(const pack of [a,b]){
 assert.equal(pack.source_registry.length,pack.metrics.source_registry_entries);
 for(const d of pack.dossiers){
  assert.equal(d.publication_allowed,false);
  assert.equal(d.original_claim_by_claim_source_context_certified,false);
  assert.equal(d.independent_theological_canonical_approval,false);
  assert.equal(d.native_french_copyapproval,false);
  for(const p of d.sections){assert.equal(p.original_context_approved,false);assert.equal(p.french_final_approved,false);}
 }
}
console.log(JSON.stringify({qa:"PASS",priorFindings:17,newBoundedFindings:two.findings.length,correctedDossiers:6,firstPersonProponentSource:"FUCHS71-FIRSTPERSON-REPRINT",council1962Draft:"FONTIBUS62-PRIMARY-TRANS",cataloguedNotRead:"RAHNER62-ARCHIVE",independentlyApproved:0,published:0}));
