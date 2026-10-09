import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const wave1=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const wave2=read("data/explore/worldwide-relic-subject-census.wave2.research.v1.json");
const subjects=new Set(wave1.subjects.map(x=>x.subject_id));
const legacyIds=new Set(wave1.legacy_object_crosswalk.map(x=>x.legacy_relic_id));
const live=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(wave2.schema,"SACRED_ATLAS_WORLD_RELIC_SUBJECT_CENSUS_WAVE2_V1");
assert.equal(wave2.kind,"SUBJECT_FIRST_RESEARCH_SUPPLEMENT_NOT_PUBLISHED_RELICS");
assert.equal(wave2.custody_claims.length,29);
assert.equal(wave2.adversarial_historical_reviews.length,8);
assert.ok(wave2.reviewed_subjects.length>=25);
const seen=new Set(),urls=new Set();
for(const x of wave2.custody_claims){
 assert.ok(subjects.has(x.subject_id),"Unregistered subject: "+x.subject_id);
 assert.ok(!seen.has(x.evidence_id),"Duplicate custody claim "+x.evidence_id);
 seen.add(x.evidence_id);
 assert.ok(/^https:\/\//.test(x.source_url),x.evidence_id+" source missing");
 urls.add(x.source_url);
 assert.ok(x.reported_custodian&&x.country_code&&x.source_role&&x.historical_attribution&&x.custody_status);
 assert.equal(x.authenticity_status,"NOT_INDEPENDENTLY_CERTIFIED");
 assert.equal(x.current_access,"NOT_VERIFIED");
 assert.equal(x.published_new_pin,false);
 assert.equal(x.publication_decision,"RESEARCH_ONLY_NO_NEW_PIN");
 assert.ok(x.supporting_legacy_relic_ids.every(id=>legacyIds.has(id)));
 if(x.material_kind==="COFFIN_CONTACT_OBJECT")assert.equal(x.traditional_class_material_review,"UNCLASSIFIED_COFFIN_CONTACT_OBJECT");
 if(x.material_kind==="BODILY_REMAINS_UNSPECIFIED_PART")assert.equal(x.traditional_class_material_review,"POSSIBLE_FIRST_CLASS_EXTENT_UNRESOLVED");
 if(x.material_kind==="HISTORICAL_TOMB_WITH_REMAINS")assert.equal(x.traditional_class_material_review,"GRAVE_STATUS_NEEDS_BODILY_SCOPE_REVIEW");
}
assert.ok(urls.size>=20,"Insufficient distinct documentary URLs");
for(const x of wave2.adversarial_historical_reviews){
 assert.ok(subjects.has(x.subject_id));
 assert.ok(/^https:\/\//.test(x.source_url));
 assert.ok(x.status&&x.publication_guard);
}
for(const s of wave2.reviewed_subjects){
 assert.ok(subjects.has(s.subject_id));
 assert.equal(s.popularity_evidence_status,"NOT_QUANTIFIED");
 assert.equal(s.liturgical_1962_status,"NOT_SOURCE_CHECKED");
 assert.equal(s.map_decision,"NONE_AUTOMATICALLY_PROMOTED");
 assert.ok(s.research_evidence_urls.length>=1);
}
const thomas=wave2.custody_claims.filter(x=>x.subject_id==="subject:saint-thomas-the-apostle");
assert.equal(thomas.length,2);
assert.equal(new Set(thomas.map(x=>x.country_code)).size,2);
const francis=wave2.custody_claims.find(x=>x.subject_id==="subject:saint-francis-xavier");
assert.ok(francis&&/forearm/i.test(francis.object_label_en));
assert.ok(wave1.legacy_object_crosswalk.some(x=>x.subject_id===francis.subject_id&&x.place_id!=="PLACEHOLDER"));
const serra=wave2.custody_claims.filter(x=>x.subject_id==="subject:saint-junipero-serra");
assert.ok(serra.some(x=>x.material_kind==="COFFIN_CONTACT_OBJECT")&&serra.some(x=>x.material_kind==="HISTORICAL_TOMB_WITH_REMAINS"));
assert.ok(wave2.adversarial_historical_reviews.some(x=>x.subject_id==="subject:saint-thomas-becket"));
assert.equal(live.relics.length,wave1.legacy_object_crosswalk.length,"Research work must preserve current published relics");
const report=JSON.parse(execFileSync(process.execPath,["tools/atlas/report-world-relic-census.mjs"],{encoding:"utf8"}));
assert.equal(report.total_screened_claims,51);
assert.equal(report.backlog_total,133);
assert.equal(report.backlog_new_custody,23);
assert.equal(report.backlog_historical_only,3);
assert.equal(report.backlog_no_wave2_research,107);
assert.equal(report.published_place_impact,0);
console.log("PASS world relic wave2: 29 sourced claims, 8 challenge reviews, 23 queue custody reviews, 3 historical-only reviews, 107 remaining untouched, 0 new pins");
