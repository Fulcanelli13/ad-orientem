import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const R=read("data/explore/research-ownership-gates.review.v1.json");
const S=read("data/customary/catholic-life-salvage.v1.json");
const C=read("data/customs/customs-atlas-seed.v1.json");
const N=read("data/customs/negative-knowledge.v1.json");
const W=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const F=read("data/explore/relic-final60-new-subjects.review.v1.json");
const P=read("data/explore/sacred-phenomena-seed.v1.json");

assert.equal(R.schema,"AO_EXPLORE_RESEARCH_RECONCILIATION_GATE_V1");
assert.equal(R.status,"REVIEW_ONLY_NOT_PUBLISHED");
assert.match(R.purpose,/no inferred map pins/i);
const claims=Object.entries(S.domains).flatMap(([domain,items])=>items.map(c=>({...c,domain})));
const sourceIds=new Set(S.sources.map(x=>x.source_id));
assert.equal(new Set(claims.map(x=>x.claim_id)).size,claims.length,"salvage claims must retain unique IDs");
const missingRefs=claims.flatMap(c=>c.source_ids.filter(id=>!sourceIds.has(id)).map(id=>[c.claim_id,id]));
assert.deepEqual(missingRefs,[],"unresolved salvage source IDs");
assert.equal(R.claim_dispositions.length,claims.length,"claims disappeared from review ledger");
const byId=new Map(R.claim_dispositions.map(c=>[c.claim_id,c]));
assert.equal(byId.size,claims.length,"duplicate salvage claim reviews");
for(const c of claims){
 const row=byId.get(c.claim_id);assert.ok(row,"unaccounted customary claim "+c.claim_id);
 assert.equal(row.original_domain,c.domain);
 assert.equal(row.source_ref_count,c.source_ids.length);
 assert.equal(row.review_status,c.source_ids.length?"OWNER_AND_PUBLICATION_REVIEW":"SOURCE_REFERENCE_REVIEW_REQUIRED");
 assert.equal(row.map_policy,"DO_NOT_CREATE_PIN_FROM_SALVAGE");
}
const expectedDomains=Object.fromEntries(Object.entries(S.domains).map(([k,v])=>[k,{
 claims:v.length,without_source_refs:v.filter(r=>!r.source_ids.length).length
}]));
assert.deepEqual(R.domain_inventory,expectedDomains);
const x=R.summary;
for(const [key,value] of Object.entries({
 customary_salvage_claims:claims.length,
 customary_salvage_linkless_claims:claims.filter(c=>!c.source_ids.length).length,
 customary_registered_sources:S.sources.length,
 published_customs:C.customs.length,
 published_custom_attestations:C.attestations.length,
 custom_hold_reject_records:N.entries.length,
 research_relic_subjects:W.subjects.length,
 research_legacy_relic_object_links:W.legacy_object_crosswalk.length,
 research_institutional_custody_leads:W.institutional_custody_evidence.length,
 defined_screening_queue:W.systematic_subject_backlog.length,
 final60_additional_subject_leads:F.cases.length,
 final60_source_screened:F.source_reviewed_cases,
 final60_lacking_original_custodian_source:F.cases_without_source_review,
 published_relic_site_claims:P.relics.length,
})){
 assert.equal(x[key],value,key+" drifted since review");
}
const knownCustomIds=new Set(C.customs.map(c=>c.custom_id));
assert.equal(knownCustomIds.size,C.customs.length);
assert.deepEqual(R.custom_negative_knowledge,N.entries.map(n=>({
 custom_id:n.custom_id,decision:n.decision,map_blocked:n.map_blocked
})));
for(const n of N.entries){
 assert.equal(n.map_blocked,true,n.custom_id+" negative-knowledge must remain map-blocked");
 assert.equal(knownCustomIds.has(n.custom_id),false,n.custom_id+" was improperly republished");
}
const subjects=new Set(W.subjects.map(s=>s.subject_id));
assert.equal(subjects.size,W.subjects.length);
assert.equal(new Set(W.legacy_object_crosswalk.map(o=>o.object_id)).size,W.legacy_object_crosswalk.length);
for(const obj of W.legacy_object_crosswalk)assert.ok(subjects.has(obj.subject_id),"legacy relic links unknown subject");
for(const ev of W.institutional_custody_evidence)assert.ok(subjects.has(ev.subject_id),"orphan source-screened custody case");
const additional=F.cases.map(c=>c.subject_id);
assert.equal(new Set(additional).size,F.cases.length,"final60 subject duplicate");
assert.ok(additional.every(id=>!subjects.has(id)),"final60 incorrectly described as new subject");
const pending=F.cases.filter(c=>!c.source_url).map(c=>c.subject_id).sort();
assert.deepEqual(R.relic_research.later_pending_subject_ids,pending);
assert.equal(pending.length,F.cases_without_source_review);
assert.equal(R.relic_research.later_source_reviewed,F.source_reviewed_cases);
assert.match(R.relic_research.important_distinction,/not authentication/i);
assert.ok(R.explicit_unresolved_research.some(s=>s.includes("SOT-07")));
console.log("PASS Explore research ownership: "+claims.length+" salvage claims, "+pending.length+
 " final60 source-pending subjects, "+W.subjects.length+" initial relic subjects, no new pins");
