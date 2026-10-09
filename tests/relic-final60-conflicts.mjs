import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditPlaceGeo,assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const batch=read("data/explore/relic-final60-new-subjects.review.v1.json");
const prior=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const disputes=read("data/explore/relic-bodily-attribution-conflicts.review.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const shrine=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const sacred=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(batch.schema,"SACRED_ATLAS_RELIC_FINAL_SIXTY_CANDIDATE_SCREEN_V1");
assert.equal(batch.publication_status,"RESEARCH_ONLY_NOT_CERTIFIED_NOT_ALL_60_SOURCE_VERIFIED");
assert.equal(batch.total_new_subject_leads,60);
assert.equal(batch.cases.length,60);
assert.equal(batch.source_reviewed_cases,12);
assert.equal(batch.cases_without_source_review,48);
const old=new Set(prior.subjects.map(s=>s.subject_id)),newIds=new Set();
for(const c of batch.cases){
 assert.ok(!old.has(c.subject_id),c.subject_id+" was already researched in earlier inventory");
 assert.ok(!newIds.has(c.subject_id),c.subject_id+" duplicate new subject");newIds.add(c.subject_id);
 assert.equal(c.map_action,"NO_AUTOMATIC_PLACE_OR_PIN");
 assert.equal(c.authentication,"NOT_INDEPENDENTLY_CERTIFIED");
 if(c.source_url){assert.match(c.source_url,/^https:\/\//);assert.notEqual(c.source_grade,"NONE_YET");assert.notEqual(c.screening,"RESEARCH_LEAD_NO_ORIGINAL_CUSTODIAN_EVIDENCE_YET");}
 else {assert.equal(c.screening,"RESEARCH_LEAD_NO_ORIGINAL_CUSTODIAN_EVIDENCE_YET");assert.equal(c.potential_publication,"HOLD_SOURCE_AND_MATERIAL");}
}
assert.equal(new Set(batch.cases.map(c=>c.cohort_family)).size,6);
assert.equal(batch.prior_subjects_deduplicated_against,prior.subjects.length);
assert.equal(disputes.dossiers.length,2);
assert.equal(disputes.schema,"SACRED_ATLAS_CONTESTED_BODILY_ATTRIBUTIONS_REVIEW_V1");
assert.equal(assertExploreGeographyRegistry(geography).pass,true);
assert.equal(assertShrinesPilgrimagesRegistry({shrines:shrine.shrines,pilgrimages:shrine.pilgrimages,routes:shrine.routes,temporalLinks:shrine.temporalLinks,sources:sources.sources,places:geography.places}).pass,true);
assert.deepEqual([geography.places.length,shrine.shrines.length,shrine.pilgrimages.length,sources.sources.length,sacred.relics.length],[182,178,206,261,122]);
const map=new Map(geography.places.map(p=>[p.place_id,p]));
const relics=new Map(sacred.relics.map(r=>[r.id,r]));
for(const d of disputes.dossiers){
 assert.equal(d.claimants.length,2);
 assert.ok(d.finding_en&&d.finding_fr);
 assert.ok(d.claimants.every(x=>/^https:\/\//.test(x.original_custodian_url)));
 assert.ok(d.claimants.every(x=>map.has(x.place_id)));
 assert.match(d.proposed_attribution,/CONTESTED|COMPETING/);
}
const ids=["relic:FR:benedict-fleury","relic:IT:montecassino-abbey","relic:FR:magdalene-head-saint-maximin","relic:FR:basilique-sainte-marie-madeleine-vezelay"];
for(const id of ids){
 const r=relics.get(id);
 assert.ok(r,id+" missing");
 assert.equal(r.authentication,"NOT_INDEPENDENTLY_CERTIFIED_BY_APP");
 assert.ok(r.dispute_id);
 assert.match(r.source_url,/^https:\/\//);
 assert.match(r.summary_en,/Fleury|Montecassino|Saint.Maximin|Vézelay/);
 assert.match(r.summary_fr,/Fleury|Mont-Cassin|Saint.Maximin|Vézelay/);
 assert.ok(disputes.dossiers.some(d=>d.id===r.dispute_id));
}
const mc=map.get("place:IT:montecassino-abbey");
assert.ok(mc);
assert.equal(auditPlaceGeo(mc.geo,{countryCode:"IT"}).length,0);
assert.equal(mc.geo.precision,"complex_anchor");
assert.match(mc.geo.source_url,/beniculturali/);
assert.ok(shrine.shrines.some(x=>x.place_id===mc.place_id));
assert.equal(sacred.relics.filter(x=>x.place_id===mc.place_id).length,1);
assert.equal(relics.get("relic:IT:montecassino-abbey").calendar_semantic_key,null);
const projected=projectExploreDataset({geography,sacredPhenomena:sacred});
const markers=exploreMapFeatures(projected.byLens.relics);
assert.equal(markers.length,new Set(projected.byLens.relics.filter(x=>x.map_publishable).map(x=>x.place_id)).size);
assert.equal(markers.filter(x=>x.properties.item_id==="relics:relic:IT:montecassino-abbey").length,1);
console.log("PASS final relic census: 60 additional deduplicated subject leads (12 cited, 48 explicit holds), 2 competing-custody dossiers, Montecassino published with 1 Place marker, 122 relic records");
