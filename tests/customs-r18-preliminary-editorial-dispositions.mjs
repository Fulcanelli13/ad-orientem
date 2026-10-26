import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=n=>JSON.parse(readFileSync(new URL("../data/customs/master/"+n,import.meta.url),"utf8"));
const dispositions=load("customs-r18-preliminary-editorial-dispositions-20261026.v1.json");
const handoff=load("customs-r18-controlled-calendar-handoff-20261026.v1.json");
const evidence=load("customs-first18-source-scope-evidence-review-20261026.v1.json");
const profiles=load("customs-18-unpublished-bilingual-editorial-review-20261026.v1.json");
const original=load("working-master.v1.json");
assert.equal(dispositions.schema,"AO_CUSTOMS_R18_PRELIMINARY_EDITORIAL_DISPOSITIONS_20261026_V1");
assert.equal(dispositions.status,"RESEARCH_RECOMMENDATIONS_ONLY_NOT_HUMAN_APPROVAL");
assert.equal(dispositions.records.length,18);
assert.deepEqual(dispositions.records.map(x=>x.review_key),handoff.records.map(x=>x.review_key));
assert.deepEqual(dispositions.records.map(x=>x.review_key),evidence.records.map(x=>x.review_key));
assert.equal(new Set(dispositions.records.map(x=>x.review_key)).size,18);
const lookup=new Map(profiles.profiles.map(x=>[x.working_master_id,x]));
let companion=0,master=0;
for(const [i,r] of dispositions.records.entries()){
 const h=handoff.records[i],e=evidence.records[i];
 assert.equal(r.release_key,h.release_key);
 assert.equal(r.title_en,h.title_en);
 assert.equal(r.source_url,e.source_support.verified_url);
 assert.equal(r.source_review_key,r.review_key);
 assert.ok(r.research_rationale_en.length>45);
 assert.ok(r.calendar_scope_en.length>20);
 assert.ok(r.specific_remaining_gate.length>18);
 assert.ok(r.recommendation.length>8);
 assert.equal(r.decision_recorded_by,"RESEARCH_PROPOSAL_ONLY");
 assert.equal(r.human_editorial_decision,"PENDING");
 for(const field of ["human_claims_approved","human_identity_approved","human_bilingual_approved","human_calendar_approved","app_calendar_publication"])assert.equal(r[field],false);
 assert.equal(r.new_canonical_id,null);
 if(h.working_master_id){
  master++;
  assert.equal(r.existing_master_id,h.working_master_id);
  assert.ok(lookup.has(r.existing_master_id));
  assert.equal(r.proposed_related_owner,null);
  assert.notEqual(r.recommendation,"ATTACH_COMPANION_TO_EXISTING_OWNER");
 } else {
  companion++;
  assert.equal(r.review_key,"OBSERVATION:BULK150-018");
  assert.equal(r.recommendation,"ATTACH_COMPANION_TO_EXISTING_OWNER");
  assert.equal(r.proposed_related_owner,"CUST-XMAS-PROVENCAL-PAIN-CALENDAL");
  assert.equal(r.existing_master_id,null);
 }
}
assert.equal(master,17);
assert.equal(companion,1);
assert.equal(dispositions.summary.provisionally_retained_as_distinct_working_actions,17);
assert.equal(dispositions.summary.companion_action_merge_recommended,1);
assert.equal(dispositions.summary.bilingual_profiles_complete_for_proposals,17);
assert.equal(dispositions.summary.first18_new_human_approvals,0);
assert.equal(dispositions.summary.calendar_runtime_publications,0);
assert.equal(original.records.filter(x=>x.publication_state==="PUBLISHED").length,35);
assert.equal(dispositions.constraints.no_new_calendar,true);
assert.equal(dispositions.constraints.no_rubrical_1962_authority_claims,true);
assert.equal(dispositions.constraints.no_automatic_event_recurrence,true);
assert.equal(dispositions.constraints.no_publication,true);
assert.equal(dispositions.source_resolution.st_patrick.status,"SOURCE_PRECISION_RECONCILED");
assert.ok(dispositions.source_resolution.st_patrick.finding.includes("1681"));
assert.ok(dispositions.source_resolution.st_patrick.finding.includes("1680s"));
assert.equal(dispositions.source_resolution.irish_candle.status,"SCHOOL_COUNTY_GROUNDED_INFORMANT_ORIGIN_HELD");
assert.ok(dispositions.source_resolution.irish_candle.finding.includes("Kilkenny"));
assert.ok(dispositions.source_resolution.irish_candle.finding.includes("informant"));
const oldCandle=load("customs-first18-direct-source-scope-audit-20261026.v1.json").records.find(x=>x.review_key==="MASTER:CANDIDATE-IRISH-CHRISTMAS-CANDLE");
assert.ok(oldCandle.supported_narrow_action_claim_en.includes("Graine school"));
assert.ok(!oldCandle.supported_narrow_action_claim_en.includes("Tipperary informant"));
for(const key of ["MASTER:CANDIDATE-STJOHN-BONFIRE","MASTER:CUST-EASTER-MALTESE-IRXOXT","MASTER:CUST-ASSUMPTION-TIVOLI-INCHINATA","MASTER:CUST-ASSUMPTION-SASSARI-CANDELIERI"]){
 const x=dispositions.records.find(x=>x.review_key===key);
 assert.ok(/LOCAL_DATED/.test(x.recommendation));
 assert.equal(x.app_calendar_publication,false);
}
assert.equal(dispositions.records.filter(x=>x.recommendation==="OPTIONAL_REGIONAL_HOUSEHOLD").length,5);
console.log("PASS R18 research-only adjudications: 17 provisional distinct working actions, one Provencal meal companion, Kilkenny and 1681/1680s precision reconciled, all human approvals and Calendar publications false");
