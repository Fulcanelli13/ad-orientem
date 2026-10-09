import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const census=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const published=read("data/explore/sacred-phenomena-seed.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
assert.equal(census.schema,"SACRED_ATLAS_SUBJECT_OBJECT_CUSTODY_CENSUS_V1");
assert.equal(census.status,"RESEARCH_ONLY_NOT_GLOBAL_COMPLETION");
assert.equal(census.legacy_object_crosswalk.length,published.relics.length);
assert.equal(census.institutional_custody_evidence.length,22);
assert.ok(census.systematic_subject_backlog.length>=120);
assert.ok(census.subjects.length>=150);
const subjects=new Map(census.subjects.map(x=>[x.subject_id,x]));
assert.equal(subjects.size,census.subjects.length,"duplicate subject identity");
assert.equal(new Set(census.legacy_object_crosswalk.map(x=>x.legacy_relic_id)).size,published.relics.length);
assert.deepEqual(new Set(census.legacy_object_crosswalk.map(x=>x.legacy_relic_id)),new Set(published.relics.map(x=>x.id)),"legacy objects lost or duplicated");
const claimIds=new Set(),geoIds=new Set(geo.places.map(x=>x.place_id)),originalLinks=new Set();
for(const evidence of census.institutional_custody_evidence){
 assert.ok(subjects.has(evidence.subject_id),evidence.evidence_id+" unknown subject");
 assert.ok(!claimIds.has(evidence.evidence_id),"duplicate evidence ID");
 claimIds.add(evidence.evidence_id);
 assert.match(evidence.source_url,/^https:\/\//);
 assert.ok(evidence.source_role&&evidence.custody_finding&&evidence.authenticity_verdict);
 assert.equal(evidence.authenticity_verdict,"NOT_INDEPENDENTLY_CERTIFIED");
 assert.equal(evidence.permanent_map_pin,"NOT_REQUESTED");
 assert.equal(evidence.custody_review,"ORIGINAL_INSTITUTIONAL_PASSAGE_SCREENED");
 if(evidence.matched_existing_place_id)assert.ok(geoIds.has(evidence.matched_existing_place_id));
 originalLinks.add(evidence.source_url);
}
assert.ok(originalLinks.size>=14,"too few independently sourced source pages");
assert.ok(census.institutional_custody_evidence.some(x=>x.country_code==="UG"));
assert.ok(census.institutional_custody_evidence.some(x=>x.country_code==="SV"));
assert.ok(census.institutional_custody_evidence.some(x=>x.country_code==="IN"));
assert.ok(census.institutional_custody_evidence.some(x=>x.country_code==="DE"));
for(const object of census.legacy_object_crosswalk){
 assert.ok(subjects.has(object.subject_id),"legacy object has no subject");
 assert.equal(object.verification_state,"LEGACY_SOURCE_LINK_NOT_RECHECKED");
 assert.equal(object.map_action,"REUSE_LEGACY_NO_NEW_PIN");
 assert.ok(object.traditional_class_review);
}
for(const entry of census.systematic_subject_backlog){
 assert.ok(subjects.has(entry.subject_id));
 assert.equal(entry.popular_vs_obscure,"UNASSESSED");
 assert.equal(entry.publication_decision,"NONE_PENDING_RESEARCH");
}
assert.ok(subjects.has("subject:blessed-daudi-okello")&&subjects.has("subject:blessed-jildo-irwa"));
assert.ok(!subjects.has("subject:saint-daudi-okello")&&!subjects.has("subject:saint-jildo-irwa"));
assert.ok(census.institutional_custody_evidence.filter(x=>x.provisional_class==="SACRED_OBJECT_SPECIAL").every(x=>!x.provisional_class.includes("FIRST_CLASS")));
assert.ok(census.institutional_custody_evidence.filter(x=>x.object_material_kind==="BODILY_FRAGMENT").every(x=>x.provisional_class.includes("FIRST_CLASS")));
console.log("PASS world relic subject census: "+census.subjects.length+" subjects, "+census.legacy_object_crosswalk.length+" legacy relic links, "+census.institutional_custody_evidence.length+" screened custody claims, "+census.systematic_subject_backlog.length+" systematic targets; zero new production pins");
