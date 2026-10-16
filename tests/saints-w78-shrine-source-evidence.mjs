import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {applySaintsReleaseBoundary,SAINTS_CHANNELS} from "../src/find/saints-release-policy.js";
import {projectSaintResearchShrinePlaces,renderSaintResearchShrineSheet} from "../src/find/saints-shrine-map-research.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const evidence=read("data/saints/w78-shrine-person-source-evidence-20261016.v1.json");
const source=read("data/saints/existing-shrine-geography-readiness-20261016.v1.json");
const cross=read("data/saints/cross-module-source-reconciliation-20261015.v1.json");
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
const dataset={
 saintsShrineReadiness:source,saintsW78Evidence:evidence,
 geography:read("data/geography/seed-registry.v1.json"),
 shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json")
};
assert.equal(evidence.schema,"ao.saints.w78-119-shrine-name-owner-source-evidence.v1");
assert.equal(evidence.status,"READ_ONLY_SOURCE_MATCH_NOT_CANONICAL_IDENTITY_ART_OR_MAP_APPROVAL");
assert.equal(evidence.records.length,119);
assert.equal(new Set(evidence.records.map(x=>x.legacy_shrine_person_or_group_name)).size,119);
assert.equal(evidence.summary.previous_exact_one,50);
assert.equal(evidence.summary.previous_exact_collisions,6);
assert.equal(evidence.summary.previous_unmatched,63);
assert.equal(evidence.summary.formerly_unmatched_with_documented_alias_to_existing_key,9);
assert.equal(evidence.summary.formerly_unmatched_with_relic_subject_evidence,45);
assert.equal(evidence.summary.formerly_unmatched_with_sacred_art_subject_evidence,14);
assert.equal(evidence.summary.formerly_unmatched_without_exact_or_documented_alias_key,54);
assert.equal(evidence.summary.distinct_original_physical_site_ids,121);
assert.equal(evidence.summary.original_shrine_association_edges,145);
assert.equal(evidence.summary.source_reconciliation_tiers.TRUNCATED_HISTORICAL_SOURCE_KEY_CHECK,2);
assert.equal(evidence.summary.entity_type_guards.BLESSED_NOT_CANONIZED,3);
assert.equal(evidence.summary.entity_type_guards.GROUP_OR_COMPOUND_NOT_ONE_PERSON,4);
assert.equal(evidence.summary.entity_type_guards.ANGELIC_NOT_HUMAN,1);
const originals=new Map(source.rows.map(x=>[x.legacy_name_literal,x]));
const ownerSources=new Map(cross.rows.map(x=>[x.legacy_name,x]));
const keys=new Set(ledger.records.map(x=>x.source_key));
for(const x of evidence.records){
 const old=originals.get(x.legacy_shrine_person_or_group_name);
 const owner=ownerSources.get(x.legacy_shrine_person_or_group_name);
 assert(old&&owner,"Original source owner record absent");
 assert.equal(x.canonical_person_id_approved,null);
 assert.equal(x.human_person_identity_certified_by_this_pass,false);
 assert.equal(x.authorized_artwork_id,null);
 assert.equal(x.new_geographical_pin_created,false);
 assert.deepEqual(x.exact_existing_source_keys,old.candidate_source_keys);
 assert.deepEqual(x.original_shrine_relationships.map(x=>x.place_id),old.physical_place_associations.map(x=>x.place_id));
 assert(x.unique_cross_source_key_candidates.every(x=>keys.has(x)));
 assert.deepEqual(x.external_owner_evidence.relic_subjects.map(s=>s.subject_id),owner.relic_subjects.map(s=>s.subject_id));
 assert.deepEqual(x.external_owner_evidence.sacred_art_subjects.map(s=>s.subject_id),owner.sacred_art_subjects.map(s=>s.subject_id));
 assert(x.original_shrine_relationships.every(p=>p.source_ids.length&&p.canonical_person_to_place_link_authorized===false));
 assert(x.external_owner_evidence.sacred_art_subjects.every(s=>s.image_release!=="PRODUCTION_APPROVED"));
}
for(const n of ["Saint John the Evangelist","Saint Luke the Evangelist"]){
 assert.equal(evidence.records.find(x=>x.legacy_shrine_person_or_group_name===n).source_reconciliation_tier,"TRUNCATED_HISTORICAL_SOURCE_KEY_CHECK");
}
for(const n of ["Saint Michael the Archangel","Uganda Martyrs","The Three Magi","Saint Siviard; Saint Columba of Sens; Saint Lupus of Sens"]){
 const x=evidence.records.find(r=>r.legacy_shrine_person_or_group_name===n);
 assert(x.person_kind_guard!=="NAMED_PERSON_CANDIDATE_STATUS_UNREVIEWED");
}
const publicData=applySaintsReleaseBoundary(dataset);
assert.equal(publicData.saintsW78Evidence,null);
assert.equal(publicData.saintsShrineReadiness,null);
assert.equal(projectSaintResearchShrinePlaces(publicData).length,0);
const research=applySaintsReleaseBoundary(dataset,SAINTS_CHANNELS.RESEARCH_PREVIEW);
const projected=projectSaintResearchShrinePlaces(research);
assert.equal(projected.length,121);
assert.equal(projected.filter(x=>x.map_publishable).length,119);
assert.equal(projected.reduce((n,x)=>n+x.associated_saint_name_sources.length,0),145);
assert(projected.flatMap(x=>x.associated_saint_name_sources).some(x=>x.external_relic_subject_ids.length));
assert(projected.flatMap(x=>x.associated_saint_name_sources).some(x=>x.recorded_alias_source_keys.length));
assert(projected.every(x=>x.artwork_id===null&&x.saints.length===0));
const withArt=projected.find(x=>x.associated_saint_name_sources.some(n=>n.external_art_research_subject_ids.length));
assert(withArt);
for(const lang of ["en","fr"]){
 const html=renderSaintResearchShrineSheet({language:lang,selected:withArt});
 assert(html.includes("aoSaintSourceEvidenceStatus"));
 assert(html.includes(lang==="fr"?"non approuvés":"Unapproved art research subjects"));
 assert(!html.includes("<img"));
 assert(!html.includes("data-calendar-mass"));
}
console.log("PASS W78 119 name cases, 50 exact, 6 ambiguous, 63 unmatched (9 alias/45 relic), 145 source site associations, zero published identity/pins/art");
