import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/explore/";
const reach=read(root+"relic-subject-devotional-reach.review.v1.json");
const selected=read(root+"relic-atlas-site-selection.review.v1.json");
const exceptional=read(root+"relic-exceptional-sacred-objects.review.v1.json");
const w1=read(root+"worldwide-relic-subject-census.research.v1.json");
const waves=[2,3,4,5,6].map(n=>read(root+"worldwide-relic-subject-census.wave"+n+".research.v1.json"));
const published=read(root+"sacred-phenomena-seed.v1.json");
const places=read("data/geography/seed-registry.v1.json");
const placeIds=new Set(places.places.map(x=>x.place_id));
const researchIds=new Set(w1.subjects.map(x=>x.subject_id));
const backlogIds=new Set(w1.systematic_subject_backlog.map(x=>x.subject_id));
const evidenceIds=new Set([
 ...w1.legacy_object_crosswalk.map(x=>x.legacy_relic_id),
 ...w1.institutional_custody_evidence.map(x=>x.evidence_id),
 ...waves[0].custody_claims.map(x=>x.evidence_id),
 ...waves[1].custody_claims.map(x=>x.evidence_id),
 ...waves[2].new_institutional_case_reviews.map(x=>x.evidence_id),
 ...waves[3].new_cases.map(x=>x.case_id),
 ...waves[4].screened_cases.map(x=>x.case_id)
]);
assert.equal(reach.schema,"SACRED_ATLAS_SUBJECT_DEVOTIONAL_REACH_SCREENING_V1");
assert.equal(reach.rows.length,133);
assert.deepEqual(new Set(reach.rows.map(x=>x.subject_id)),backlogIds);
assert.equal(new Set(reach.rows.map(x=>x.subject_id)).size,reach.rows.length);
const allowedReach=new Set(["UNIVERSAL_SPECIAL_MISSION","TRANSNATIONAL_DOCUMENTED","NATIONAL_DOCUMENTED","NATIONAL_AND_REGIONAL_DOCUMENTED","ORDER_OR_CHURCH_WIDE_INDICATION","REGIONAL_OR_LOCAL_DOCUMENTED","HISTORICAL_ROLE_ONLY_NO_REACH_MEASURE","UNASSESSED"]);
let universals=0,assessed=0;
for(const x of reach.rows){
 assert.ok(allowedReach.has(x.assessed_devotional_reach),x.subject_id+" unexpected category");
 assert.equal(x.map_pin_decision,"SEPARATE_SITE_LEVEL_DECISION");
 assert.equal(x.traditional_1962_calendar_status,"NOT_INDEPENDENTLY_COLLATED");
 assert.equal(x.relic_authenticity_not_inferred,true);
 assert.equal(x.personal_holiness_not_ranked,true);
 assert.equal(x.final_fame_rank,"NOT_ISSUED");
 if(x.assessed_devotional_reach!=="UNASSESSED"){
  assessed++;assert.match(x.principal_reach_source_url,/^https:\/\//);
  assert.ok(x.all_traceable_reach_signals.length>=1);
 }
 if(x.assessed_devotional_reach==="UNIVERSAL_SPECIAL_MISSION"){
  universals++;assert.ok(x.all_traceable_reach_signals.some(y=>y.kind==="UNIVERSAL_APOSTOLIC_MISSION_NORM"));
 }
}
assert.ok(universals>=15&&assessed>=75);
assert.equal(selected.schema,"SACRED_ATLAS_RELIC_SITE_SELECTION_REVIEW_V1");
assert.equal(selected.site_decisions.length,71);
assert.equal(selected.summary.recommendations,71);
assert.equal(selected.summary.unique_sites,66);
assert.equal(selected.summary.new_distinct_sites,39);
assert.equal(selected.summary.existing_place_reuse,28);
assert.equal(selected.nonpublication_cases.length,18);
const recommendationIds=new Set(),siteKeys=new Set();
for(const x of selected.site_decisions){
 assert.ok(!recommendationIds.has(x.selection_id),x.selection_id+" duplicate");recommendationIds.add(x.selection_id);
 assert.ok(researchIds.has(x.subject_id),x.subject_id+" not registered");
 assert.equal(x.creates_pin_in_this_pr,false);
 assert.ok(["WORLD_ANCHOR","REGIONAL_ANCHOR","HISTORICAL_ASSOCIATION"].includes(x.visibility_recommendation));
 assert.ok(x.evidence_ids.length>0&&x.evidence_sources.length>0);
 assert.ok(x.evidence_ids.every(id=>evidenceIds.has(id)),x.selection_id+" unsourced evidence ID");
 assert.ok(x.evidence_sources.every(url=>/^https:\/\//.test(url)),x.selection_id+" unsourced URL");
 if(x.existing_place_id){assert.ok(placeIds.has(x.existing_place_id));assert.equal(x.candidate_site_key,x.existing_place_id);}
 else {assert.ok(x.candidate_site_key.startsWith("candidate:relicsite:"));assert.equal(x.publication_state,"NEW_PLACE_REQUIRES_LOCATOR_AND_CUSTODY_VERIFICATION");}
 siteKeys.add(x.candidate_site_key);
 const expected=selected.site_decisions.filter(y=>y.candidate_site_key===x.candidate_site_key&&y.subject_id!==x.subject_id).map(y=>y.subject_id).sort();
 assert.deepEqual([...x.site_shared_with_subjects].sort(),expected,x.selection_id+" shared place mismatch");
}
assert.equal(siteKeys.size,66);
for(const x of selected.nonpublication_cases){assert.equal(x.editorial_status,"NOT_A_NEW_RELIC_PIN");assert.ok(x.exclusion_class&&x.reason);}
assert.ok(selected.nonpublication_cases.some(x=>x.subject_id==="subject:saint-pedro-calungsod"&&x.exclusion_class==="NO_EXTANT_BODY_CUSTODY"));
assert.ok(selected.nonpublication_cases.some(x=>x.subject_id==="subject:saint-thomas-the-apostle"&&x.exclusion_class==="PROFILE_FRAGMENT_ONLY"));
assert.equal(exceptional.schema,"SACRED_ATLAS_EXCEPTIONAL_OBJECTS_MAP_SELECTION_V1");
assert.equal(exceptional.groups.length,15);
assert.equal(exceptional.groups.filter(x=>x.existing_place_id).length,15);
assert.equal(exceptional.groups.filter(x=>x.research_candidate_id).length,7);
for(const s of exceptional.groups){
 assert.equal(s.current_map_change,Boolean(s.research_candidate_id));
 assert.equal(s.objects_are_grouped_under_one_site,true);
 assert.equal(s.historical_attribution,"TRADITIONAL_IDENTITY_NOT_INDEPENDENTLY_AUTHENTICATED");
 assert.equal(s.canonical_relic_class,"EXCEPTIONAL_SACRED_OBJECT_NOT_AUTOMATICALLY_FIRST_SECOND_OR_THIRD");
 assert.ok(s.primary_source_urls.every(u=>/^https:\/\//.test(u)));
 assert.ok(s.primary_source_urls.length>=1);
 if(s.existing_place_id){assert.ok(placeIds.has(s.existing_place_id));if(!s.research_candidate_id)assert.ok(s.legacy_relic_ids.length>0);}
 if(s.research_candidate_id){assert.ok(s.existing_place_id);assert.equal(s.publication_state,"PUBLISHED_PHYSICAL_SITE_TRADITION_UNAUTHENTICATED");}
}
const preview=JSON.parse(execFileSync(process.execPath,["tools/atlas/report-relic-publication-shortlist.mjs"],{encoding:"utf8"}));
assert.equal(preview.priority_subject_count,133);
assert.equal(preview.distinct_saint_relic_sites,66);
assert.equal(preview.saint_relic_site_associations,71);
assert.equal(preview.new_site_candidates,39);
assert.equal(preview.exceptional_sacred_object_groupings,15);
assert.equal(preview.production_pins_created,0);
assert.equal(published.relics.length,122);
assert.equal(places.places.length,182);
console.log("PASS relic selection: 133 subject reach screens, "+assessed+" traceable reach indicators including "+universals+" apostolic roles, 71 associations → 66 sites (39 new candidates), 15 exceptional groups, 18 nonpin decisions; 0 production pins");
