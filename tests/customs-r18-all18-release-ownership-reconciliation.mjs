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
 new_ids_allocated_this_file:0,added_calendar_events:0,added_indulgences:0,
 eleven_action_identity_analyst_reviews:11,final_new_canonical_identity_approvals:0,
 cross_candidate_family_relationships:5
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

const reviewed=records.filter(x=>x.action_identity_review);
assert.equal(reviewed.length,11,"All unresolved noncompanion records need action-level review");
const reviewByKey=new Map(reviewed.map(x=>[x.release_key,x]));
const expectedReviewIds=["03","04","05","07","08","09","13","14","15","16","17"];
assert.deepEqual([...reviewByKey.keys()],expectedReviewIds.map(n=>"CUSTOMS-R18-"+n));
const requiredComparators={
 "03":["BLSS-003"],"04":["BLSS-004"],"05":["ADVT-003"],"07":["EPIP-001"],
 "08":["EPIP-001"],"09":["ADVT-003"],"13":["EAST-001"],"14":["CORP-001"],
 "15":["MARI-001"],"16":["MARI-001"],"17":["DEV-001"]
};
for(const r of reviewed){
 const d=r.action_identity_review;
 assert.equal(r.current_publication_authorized,false);
 assert.equal(r.identity_finalized,false);
 assert.equal(d.final_editorial_identity_approved,false);
 assert.equal(d.final_canonical_id_allocated,false);
 assert.equal(d.approved_as_separate_new_custom,false);
 assert.equal(d.can_merge_with_existing_published_article,false);
 assert.equal(d.same_action_family_is_not_publication_permission,true);
 assert.equal(d.independently_verified_current_annual_programme,false);
 assert.equal(d.no_auto_indulgence_or_rite,true);
 assert.ok(d.analyst_disposition);
 assert.ok(d.core_action_en.length>30 && d.why_not_existing_published_identity_en.length>50);
 assert.ok(d.proposed_action_family && d.regional_subtype_policy);
 assert.ok(d.next_independent_editorial_verification_en.length>25);
 assert.ok(d.primary_institutional_source_url.startsWith("https://"));
 assert.ok(r.source_links.some(x=>x.url===d.primary_institutional_source_url));
 assert.ok(r.unpublished_bilingual_article.title.en && r.unpublished_bilingual_article.title.fr);
 for(const id of d.compare_existing_canonical_ids){
  assert.ok(canonicalIds.has(id),"Cannot compare with invented published ID "+id);
  assert.ok(r.existing_canonical_comparisons.some(c=>c.id===id&&c.is_equivalence_decision===false));
 }
 for(const id of requiredComparators[r.release_key.slice(-2)])
  assert.ok(d.compare_existing_canonical_ids.includes(id),"Missing critical published comparator "+id);
 for(const other of d.cross_candidate_related_not_equivalent){
  assert.notEqual(other,r.release_key);
  const reciprocal=reviewByKey.get(other)?.action_identity_review?.cross_candidate_related_not_equivalent;
  assert.ok(reciprocal?.includes(r.release_key),
    "Cross-candidate family relationship must be reciprocal for "+r.release_key+" ↔ "+other);
 }
}
assert.equal(reviewByKey.get("CUSTOMS-R18-04").action_identity_review.regional_subtype_policy,
 "REGIONAL_EGG_ART_SUBTYPES_UNDER_ONE_CRAFT_IDENTITY");
assert.equal(reviewByKey.get("CUSTOMS-R18-08").action_identity_review.proposed_action_family,
 reviewByKey.get("CUSTOMS-R18-09").action_identity_review.proposed_action_family);
const shrineClaim=reviewByKey.get("CUSTOMS-R18-17").action_identity_review.shrine_indulgence_claim_separate_gate;
assert.equal(shrineClaim.site_reports_papal_privilege_and_plenary_indulgence,true);
assert.equal(shrineClaim.official_primary_grant_text_independently_verified,false);
assert.equal(shrineClaim.grant_conditions_validated_for_traditional_1962_context,false);
assert.equal(shrineClaim.publication_allowed,false);
assert.ok(shrineClaim.primary_shrine_url.startsWith("https://"));
assert.deepEqual(reviewByKey.get("CUSTOMS-R18-17").indulgence_grants,[]);
for(const n of ["03","13","15","16"]){
 const d=reviewByKey.get("CUSTOMS-R18-"+n).action_identity_review;
 assert.equal(d.locality_and_recurrence_gate,"LOCAL_EVENT_VERIFICATION_REQUIRED");
 assert.equal(d.independently_verified_current_annual_programme,false);
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
console.log("PASS Customs R18 identity adjudication: 11 provisional action decisions, 4 local-event holds, no merges or permanent IDs, cross-candidate relationships reciprocal, 6 prior release dossiers and one companion preserved; 35 published unchanged.");
