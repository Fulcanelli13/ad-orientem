import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=load("data/customs/customs-r18-all18-release-ownership-reconciliation.v1.json");
const six=load("data/customs/customs-r18-six-canonical-release-candidate.v1.json");
const seed=load("data/customs/customs-atlas-seed.v1.json");
const publicationIds=new Set(seed.customs.filter(c=>c.publication_state==="PUBLISHED").map(c=>c.custom_id));
const canonicalIds=new Set(seed.customs.map(c=>c.custom_id));
const sixById=new Map(six.rows.map(r=>[r.working_master_id,r]));
const records=ledger.records;
const byLane=Object.groupBy(records,x=>x.lane);
assert.equal(ledger.schema,"AO_CUSTOMS_R18_ALL18_RELEASE_OWNERSHIP_RECONCILIATION_V1");
assert.equal(seed.customs.length,38);
assert.equal(publicationIds.size,35);
assert.deepEqual(ledger.counts,{
 canonical_existing:38,published_existing:35,context_only_existing:3,
 reviewed_existing_18:18,six_with_existing_release_dossiers:6,
 remaining_seasonal_regional_identity_scope_reviews:7,
 remaining_local_event_reviews:4,companion_not_a_custom:1,
 independent_cohort_two:2,publication_approvals_this_file:0,
 new_ids_allocated_this_file:0,added_calendar_events:0,added_indulgences:0
});
assert.equal(records.length,18);
assert.deepEqual(records.map(r=>r.release_key),Array.from({length:18},(_,i)=>"CUSTOMS-R18-"+String(i+1).padStart(2,"0")));
assert.equal(byLane.SIX_EXISTING_RELEASE_DOSSIERS.length,6);
assert.equal(byLane.SEVEN_IDENTITY_SCOPE_REVIEWS.length,7);
assert.equal(byLane.FOUR_LOCAL_EVENT_REVIEWS.length,4);
assert.equal(byLane.ONE_NONCANONICAL_COMPANION.length,1);
assert.equal(ledger.independent_open_cohort.pr,1642);
assert.deepEqual(ledger.independent_open_cohort.ids,["EPIP-003","CRIB-001"]);
assert.equal(ledger.independent_open_cohort.publication_authorized,false);
for(const value of Object.values(ledger.policy))assert.equal(value,true,"A release safeguard must not be disabled");
for(const [n,o] of Object.entries(ledger.source_pins)){
 assert.ok(/^[a-f0-9]{40}$/.test(o.sha),"Pin original source blob for "+n);
 assert.ok(o.path);
}
const allocated=[],allWorking=new Set(),allSources=0;
for(const r of records){
 assert.equal(allWorking.has(r.release_key),false);
 allWorking.add(r.release_key);
 assert.ok(r.title_en.length>4&&r.title_fr.length>4);
 assert.equal(r.current_publication_authorized,false);
 assert.equal(r.final_editorial_signoff,false);
 assert.equal(r.identity_finalized,false);
 assert.equal(r.full_article_source_certified,false);
 assert.equal(r.independent_sources_certified,false);
 assert.equal(r.current_calendar_event_verified,false);
 assert.equal(r.calendar_event_auto_scheduled,false);
 assert.deepEqual(r.indulgence_grants,[]);
 assert.equal(r.source_claim_rechecked,true);
 assert.ok(r.remaining_gate.length>10);
 assert.equal(r.staged_calendar_anchor?.visibility?.length>0,true);
 assert.ok(r.source_links.length>=1);
 for(const s of r.source_links)assert.ok(s.id&&s.title&&/^https:\/\//.test(s.url));
 for(const x of r.existing_canonical_comparisons){
  assert.ok(canonicalIds.has(x.id),"Comparison target must exist: "+x.id);
  assert.equal(x.is_equivalence_decision,false,"Lexical comparison cannot automatically merge an identity");
 }
 const existing=sixById.get(r.working_master_id);
 if(r.lane==="SIX_EXISTING_RELEASE_DOSSIERS"){
  assert.ok(existing,"Six dossiers require real source owners");
  assert.equal(r.proposed_canonical_id,existing.proposed_id);
  assert.equal(existing.publication_allowed,false);
  assert.ok(Object.values(existing.signoffs).every(v=>v===false));
  assert.ok(!canonicalIds.has(r.proposed_canonical_id));
  allocated.push(r.proposed_canonical_id);
  assert.deepEqual(r.release_dossier_prs,[1736,1759]);
  assert.ok(!r.unpublished_bilingual_article);
 }else{
  assert.equal(r.proposed_canonical_id,null,"Other 12 must not be assigned release IDs");
  assert.ok(!sixById.has(r.working_master_id));
  if(r.lane==="ONE_NONCANONICAL_COMPANION"){
   assert.equal(r.companion_proposed_owner_id,"XMAS-004");
   assert.equal(r.companion_working_owner,"CUST-XMAS-PROVENCAL-PAIN-CALENDAL");
   assert.equal(r.not_a_new_custom,true);
   assert.ok(r.companion_draft);
  }else{
   assert.equal(r.identity_action_scope_unresolved,true);
   assert.equal(r.no_new_canonical_id_reserved,true);
   assert.ok(r.unpublished_bilingual_article);
  }
  const copy=r.companion_draft||r.unpublished_bilingual_article;
  for(const field of ["title","description","history","meaning","practice","caution","occasion","scope"]){
   for(const lang of ["en","fr"])assert.ok(copy[field]?.[lang]?.trim().length>=4,r.release_key+" "+field+" "+lang);
  }
 }
}
assert.deepEqual(allocated,six.rows.map(x=>x.proposed_id));
assert.ok(!allocated.some(x=>ledger.independent_open_cohort.ids.includes(x)));
assert.equal(records.reduce((n,r)=>n+r.source_links.length,0),34);
assert.equal(records.filter(x=>x.unpublished_bilingual_article).length,11);
assert.equal(records.filter(x=>x.companion_draft).length,1);
assert.equal(records.filter(x=>x.proposed_canonical_id).length,6);
// No runtime import; this evidence pack is not a Calendar publication or a scheduled local event.
const runtime=readFileSync(new URL("../src/calendar/customs-read-model.js",import.meta.url),"utf8");
assert.doesNotMatch(runtime,/customs-r18-all18-release-ownership-reconciliation/);
const mainSeed=seed.customs.filter(x=>x.publication_state==="PUBLISHED");
assert.equal(mainSeed.length,35);
console.log("PASS Customs R18 full reconciliation: 18/18 tracked, six owned proposals, 11 complete bilingual unpublished drafts, one companion; 2 independent pending IDs; 35 live unchanged; 34 source links, zero automatic approval.");
