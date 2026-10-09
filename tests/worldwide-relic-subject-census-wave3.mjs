import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const wave1=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const wave2=read("data/explore/worldwide-relic-subject-census.wave2.research.v1.json");
const wave3=read("data/explore/worldwide-relic-subject-census.wave3.research.v1.json");
const prod=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(wave3.schema,"SACRED_ATLAS_WORLD_RELIC_SUBJECT_CENSUS_WAVE3_V1");
assert.equal(wave3.kind,"RESEARCH_CENSUS_NOT_PUBLISHED_ATLAS");
assert.equal(wave3.custody_claims.length,26);
assert.equal(wave3.devotional_significance_reviews.length,24);
assert.equal(wave3.historical_adversarial_reviews.length,11);
assert.equal(wave3.coverage.remaining_previous_107,79);
assert.equal(wave3.coverage.newly_covered_prior_pending_subject_ids.length,28);
const subjects=new Set(wave1.subjects.map(x=>x.subject_id)),ids=new Set(),sourceUrls=new Set();
const allIds=new Set([...wave1.institutional_custody_evidence,...wave2.custody_claims].map(x=>x.evidence_id));
for(const x of wave3.custody_claims){
 assert.ok(subjects.has(x.subject_id),"Unregistered saint "+x.subject_id);
 assert.ok(!ids.has(x.evidence_id)&&!allIds.has(x.evidence_id),"Duplicate custody identity "+x.evidence_id);ids.add(x.evidence_id);
 assert.match(x.source_url,/^https:\/\//);
 sourceUrls.add(x.source_url);
 assert.ok(x.reported_custodian&&x.country_code&&x.source_role);
 assert.equal(x.authenticity_status,"NOT_INDEPENDENTLY_CERTIFIED");
 assert.equal(x.mapping_decision,"RESEARCH_ONLY_NO_NEW_PINS");
 assert.equal(x.public_access,"NOT_CHECKED");
 assert.equal(x.source_screening,"ORIGINAL_INSTITUTIONAL_PASSAGE_REVIEWED");
 assert.ok(x.material_classification&&x.custody_status);
 if(x.material_kind==="UNSPECIFIED_RELIC_MATERIAL"||x.material_kind==="REPORTED_RELICS_UNSPECIFIED_MATERIAL")assert.ok(x.material_classification.startsWith("UNDETERMINED"));
 if(x.material_kind==="RELIQUARY_WITH_RELIC_MATERIAL_UNVERIFIED")assert.ok(x.material_classification.startsWith("UNDETERMINED"));
 if(x.material_kind==="UNATTRIBUTED_MIXED_BONES")assert.equal(x.material_classification,"UNDETERMINED_NOT_VALID_FIRST_CLASS_IDENTIFICATION");
 if(x.material_kind==="ASSOCIATED_GARMENT_FRAGMENT")assert.ok(!x.material_classification.startsWith("FIRST_CLASS"));
}
assert.ok(sourceUrls.size>=20,"insufficient independent source pages");
const significance=new Set();
for(const x of wave3.devotional_significance_reviews){
 assert.ok(subjects.has(x.subject_id)&&!significance.has(x.subject_id));
 significance.add(x.subject_id);
 assert.match(x.reach_verified_by,/^https:\/\//);
 assert.equal(x.canonical_rank,"NOT_ASSIGNED");
 assert.equal(x.liturgical_calendar_1962,"NOT_INDEPENDENTLY_CHECKED");
 assert.equal(x.significance_is_not_sanctity,true);
 assert.ok(wave3.custody_claims.some(z=>z.subject_id===x.subject_id));
}
for(const x of wave3.historical_adversarial_reviews){
 assert.ok(subjects.has(x.subject_id));
 assert.match(x.source_url,/^https:\/\//);
 assert.ok(x.publication_guard);
}
assert.ok(wave3.historical_adversarial_reviews.some(x=>x.subject_id==="subject:saint-bridget-of-sweden"&&x.review_status==="SCIENTIFIC_IDENTIFICATION_CONTESTED"));
assert.ok(wave3.historical_adversarial_reviews.some(x=>x.subject_id==="subject:saint-genevieve-of-paris"&&x.publication_guard==="NEVER_CLAIM_COMPLETE_BODY_PRESENT"));
assert.ok(wave3.historical_adversarial_reviews.some(x=>x.subject_id==="subject:saint-bonaventure"&&x.publication_guard==="NO_CURRENT_BODY_PIN"));
assert.ok(wave3.historical_adversarial_reviews.some(x=>x.subject_id==="subject:saint-irenaeus-of-lyons"&&x.publication_guard==="DO_NOT_LABEL_IDENTIFIABLE_FIRST_CLASS_BODY"));
const matthias=wave3.custody_claims.filter(x=>x.subject_id==="subject:saint-matthew-the-apostle");assert.equal(matthias.length,2);
const rubaga=wave3.custody_claims.filter(x=>x.reported_custodian.includes("Rubaga"));assert.equal(rubaga.length,3);
assert.ok(rubaga.every(x=>x.material_classification==="UNDETERMINED_NO_FIRST_CLASS_EVIDENCE"));
assert.equal(prod.relics.length,wave1.legacy_object_crosswalk.length,"production relics must remain intact");
const stats=JSON.parse(execFileSync(process.execPath,["tools/atlas/report-world-relic-census.mjs"],{encoding:"utf8"}));
assert.equal(stats.total_screened_claims,77);
assert.equal(stats.historical_case_reviews,19);
assert.equal(stats.backlog_total,133);
assert.equal(stats.backlog_with_at_least_one_screened_case,62);
assert.equal(stats.backlog_without_any_new_wave_source_case,71);
assert.equal(stats.newly_addressed_in_wave3,28);
assert.equal(stats.backlog_unaddressed_after_wave3,79);
assert.equal(stats.published_place_impact,0);
console.log("PASS wave3: 26 source-screened object/custody assertions, 24 devotional-reach indicators, 11 historical reviews; 62/133 queue subjects have at least one evidence case, 71 remain without new source review; no new pins");
