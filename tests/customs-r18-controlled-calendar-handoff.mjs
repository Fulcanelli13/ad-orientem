import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=name=>JSON.parse(readFileSync(new URL("../data/customs/master/"+name,import.meta.url),"utf8"));
const handoff=load("customs-r18-controlled-calendar-handoff-20261026.v1.json");
const evidence=load("customs-first18-source-scope-evidence-review-20261026.v1.json");
const profile=load("customs-18-unpublished-bilingual-editorial-review-20261026.v1.json");
const review=load("customs-editorial-thirty-review-units-20261026.v1.json");
const identity=load("customs-thirty-action-identity-reconciliation-20261026.v1.json");
const master=load("working-master.v1.json");

assert.equal(handoff.schema,"AO_CUSTOMS_R18_CONTROLLED_CALENDAR_HANDOFF_20261026_V1");
assert.equal(handoff.records.length,18);
assert.equal(new Set(handoff.records.map(r=>r.review_key)).size,18);
assert.deepEqual(handoff.records.map(r=>r.review_key),evidence.records.map(r=>r.review_key));
assert.equal(handoff.policies.only_publication_surface,"EXISTING_AD_ORIENTEM_1962_CALENDAR");
assert.equal(handoff.policies.no_auto_publish,true);
assert.equal(handoff.policies.never_convert_dated_local_event_to_annual_schedule,true);
assert.equal(handoff.counts.human_approved_calendar_items,0);
assert.equal(handoff.counts.calendar_runtime_changes,0);

const profiles=new Map(profile.profiles.map(p=>["MASTER:"+p.working_master_id,p]));
const units=new Map(review.rows.map(p=>[p.review_key,p]));
const decisions=new Map(identity.records.map(p=>[p.review_key,p]));
const masters=new Map(master.records.map(p=>[p.id,p]));
let joined=0,nonmaster=0,missingDescriptions=0;
for(const [i,r] of handoff.records.entries()){
 const e=evidence.records[i],t=units.get(r.review_key),d=decisions.get(r.review_key),p=profiles.get(r.review_key);
 assert.ok(t&&d,"Exact review and identity decisions required: "+r.review_key);
 assert.equal(r.release_key,"CUSTOMS-R18-"+String(i+1).padStart(2,"0"));
 assert.equal(r.title_en,e.title_en);
 assert.equal(r.source_scope_evidence.verified_claim_url,e.source_support.verified_url);
 assert.equal(r.source_scope_evidence.bounded_claim_type,e.source_support.type);
 assert.equal(r.source_scope_evidence.risk_flag,e.source_specific_risk.flag);
 assert.equal(r.calendar_context_review.hint_en,t.calendar?.hint_en??null);
 assert.equal(r.calendar_context_review.kind,t.calendar?.kind??null);
 assert.deepEqual(r.identity_links.related_not_same_action_ids,d.related_not_same_action_ids);
 assert.equal(r.identity_links.proposed_canonical_id,null);
 assert.equal(r.release_decision,"HUMAN_REVIEW_PENDING");
 assert.equal(r.publication.state,"STAGED_RESEARCH_ONLY");
 assert.equal(r.publication.approved_for_existing_calendar,false);
 assert.equal(r.publication.new_public_article,false);
 assert.equal(r.calendar_context_review.calendar_owns_date,true);
 assert.equal(r.calendar_context_review.ical_or_recurring_parish_event_authorized,false);
 assert.equal(r.calendar_context_review.new_calendar_engine_requested,false);
 assert.equal(r.calendar_context_review.user_location_is_not_inferred,true);
 assert.equal(r.geography_review.needs_human_approval,true);
 assert.equal(r.source_scope_evidence.source_independence_certified,false);
 assert.equal(r.source_scope_evidence.all_article_sources_checked,false);
 assert.ok(r.blockers.includes("RUNTIME_BROWSER_DATE_INTEGRITY_QA"));
 assert.ok(Object.values(r.signoffs).every(v=>v===false),"Any true signature would require explicit approval");
 if(p){
   joined++;
   assert.equal(r.working_master_id,p.working_master_id);
   assert.equal(r.intake_observation_id,null);
   assert.equal(p.publication_state,"NOT_APPROVED");
   assert.equal(masters.get(p.working_master_id)?.publication_state,"NOT_APPROVED");
   assert.equal(r.copy_readiness,"BILINGUAL_DRAFT_NOT_APPROVED");
   assert.ok(t.copy.description.en&&t.copy.description.fr);
   assert.equal(r.calendar_context_review.hint_en,p.calendar.hint_en);
 }else{
   nonmaster++;
   assert.equal(r.review_key,"OBSERVATION:BULK150-018");
   assert.equal(r.working_master_id,null);
   assert.equal(r.intake_observation_id,"BULK150-018");
   assert.equal(t.calendar,null);
   assert.equal(t.copy.description.en,null);
   assert.equal(t.copy.description.fr,null);
   assert.equal(r.copy_readiness,"BILINGUAL_DRAFT_MISSING_DESCRIPTION");
   assert.ok(r.blockers.includes("CALENDAR_CONTEXT_NOT_DEFINED"));
   assert.ok(r.blockers.includes("MISSING_EN_FR_DESCRIPTION_DRAFT"));
   missingDescriptions++;
 }
}
assert.equal(joined,17);
assert.equal(nonmaster,1);
assert.equal(missingDescriptions,1);
assert.deepEqual(handoff.counts.unmatched_other_unpublished_profile_not_in_this_18,["CUST-XMAS-KASHUBIAN-ANIMAL-CARE"]);
assert.ok(!handoff.records.some(r=>r.working_master_id==="CUST-XMAS-KASHUBIAN-ANIMAL-CARE"));
assert.equal(handoff.counts.existing_unapproved_master_profile_matches,17);
assert.equal(handoff.counts.source_observation_not_in_bilingual_profile_snapshot,1);
const patrick=handoff.records.find(r=>r.review_key==="MASTER:CANDIDATE-STPATRICK-RIBBON");
const candle=handoff.records.find(r=>r.review_key==="MASTER:CANDIDATE-IRISH-CHRISTMAS-CANDLE");
const bonfire=handoff.records.find(r=>r.review_key==="MASTER:CANDIDATE-STJOHN-BONFIRE");
assert.ok(patrick.blockers.includes("HISTORICAL_DATE_PRECISION_RECONCILED_NMI_1681_GALWAY_1680S"));
assert.ok(candle.blockers.includes("KILKENNY_SCHOOL_TIPPERARY_INFORMANT_ADDRESS_CONFIRMED_NO_ORIGIN_INFERENCE"));
assert.ok(bonfire.blockers.includes("MASTER_CALENDAR_AUDIT_LOCAL_EVENT_REQUIRED_FALSE_NEEDS_CORRECTION"));
assert.equal(master.records.filter(r=>r.publication_state==="PUBLISHED").length,35);
console.log("PASS Customs R18 controlled handoff: 18 exact-key source routes, 17 full profiles, 1 incomplete observation, conflicting witness/date notes held; no approvals or Calendar publication");
