// CL27 P1: two explicit parish first-party liturgical-book witnesses.
// No unchecked institute default, source-label policy or all-church inference.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49} from "../src/find/preliminary-directory-r49.js";
import {projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {attachPublishedCelebrationEvidence,tlmCelebrationEvidenceCounts,tlmCelebrationEvidenceClass} from "../src/find/tlm-celebration-evidence.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const load=p=>JSON.parse(readFileSync(p,"utf8"));
const claim=load("data/directory/cl27-approved-celebration-evidence-20261102.v1.json");
assert.equal(claim.records.length,2);
assert.ok(claim.records.every(x=>x.subject_scope==="NAMED_CELEBRATION_PATTERN_NOT_WHOLE_VENUE"));
const base=projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json"));
const ex=projectPublishedProvisionalMassSites(base,
 load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const full=projectCL2PhysicalDirectory(ex,
 load("data/directory/generated/cl2-physical-site-index.v1.json"));
assert.equal(full.length,2582);
const released=attachPublishedCelebrationEvidence(full,claim);
assert.equal(released.length,full.length);
assert.equal(tlmCelebrationEvidenceCounts(released).SOURCE_1962,2);
assert.equal(tlmCelebrationEvidenceCounts(released).NOT_ESTABLISHED,2580);
assert.equal(filterPreliminaryR49(released,{celebrationEvidence:"ALL"}).length,2582);
assert.equal(filterPreliminaryR49(released,{celebrationEvidence:"SOURCE_1962"}).length,2);
assert.equal(filterPreliminaryR49(released,{celebrationEvidence:"NOT_ESTABLISHED"}).length,2580);
assert.equal(filterPreliminaryR49(released,{celebrationEvidence:"BAD"}).length,2582);
const two=filterPreliminaryR49(released,{celebrationEvidence:"SOURCE_1962"});
assert.deepEqual(two.map(x=>x.source_id).sort(),["V19:SJC-001","V19:SJC-002"]);
assert.ok(two.every(x=>x.community_id==="CANONS_ST_JOHN_CANTIUS"));
assert.ok(two.every(x=>x.source_ids.length===1));
assert.ok(two.every(x=>x.celebration_evidence.liturgical_use==="ROMAN"));
assert.ok(two.every(x=>x.celebration_evidence.missal_edition==="1962"));
assert.ok(two.every(x=>x.celebration_evidence.source_url.startsWith("https://www.")));
assert.equal(filterPreliminaryR49(released,{
 affiliations:["CANONS_ST_JOHN_CANTIUS"],celebrationEvidence:"SOURCE_1962"
}).length,2);
assert.equal(filterPreliminaryR49(released,{
 affiliations:["SSPX"],celebrationEvidence:"SOURCE_1962"
}).length,0);
assert.equal(filterPreliminaryR49(released,{
 directoryGroup:"ROME",celebrationEvidence:"SOURCE_1962"
}).length,2);
for(const i of two){
 const en=renderTlmChurchProfile(i),fr=renderTlmChurchProfile(i,"fr");
 assert.match(en,/Source-documented 1962 celebrations/);
 assert.match(fr,/Célébrations de 1962 attestées par source/);
 assert.ok(en.includes(i.celebration_evidence.source_url));
 assert.ok(en.includes(i.celebration_evidence.exception_en));
 assert.ok(fr.includes(i.celebration_evidence.exception_fr));
 assert.match(en,/No independently verified ministry-level liturgical classification/);
 assert.match(en,/Una Cum/);
 assert.match(renderDirectoryVenueCard(i),/1962 Missal · specific Masses only/);
 assert.match(renderDirectoryVenueCard(i,"fr"),/Missel de 1962/);
}
const cantius=two.find(x=>x.source_id==="V19:SJC-001");
assert.match(cantius.celebration_evidence.exception_en,/First Sundays use the 2002 Missal/);
const volo=two.find(x=>x.source_id==="V19:SJC-002");
assert.match(volo.celebration_evidence.exception_en,/first-Sunday Latin rows are not asterisked/i);
// Poison: the place name, official page, exact CL2 ID and ministerial scope
// must all match independently; URL/content resemblance never suffices.
for(const mutation of [
 r=>{r.records[0].cl2_anchor="RG-000000000000"},
 r=>{r.records[0].venue_name="Different Chicago parish"},
 r=>{r.records[0].source_url="https://www.cantius.org/other-page"},
 r=>{r.records[0].source_id="V19:SJC-002"},
 r=>{r.records[0].subject_scope="WHOLE_VENUE"},
 r=>{r.records[0].missal_edition="2002"},
 r=>{r.records[0].exception_en=""},
 r=>{r.records[0].review_date="yesterday"},
]){
 const bad=structuredClone(claim);mutation(bad);
 assert.throws(()=>attachPublishedCelebrationEvidence(full,bad));
}
assert.equal(tlmCelebrationEvidenceClass({...cantius,celebration_evidence:null}),"NOT_ESTABLISHED");
assert.equal(tlmCelebrationEvidenceClass({...cantius,community_id:"SSPX"}),"SOURCE_1962",
 "Witness remains tied to source ID, not assumed group properties.");
assert.ok(full.every(i=>!i.celebration_evidence));
// The runtime applies the filters before handing records to the renderer.
// Pass the same two-item filtered result, rather than the whole Directory.
const english=renderExploreToString(buildExploreViewModel({
 items:two,lens:"tlm",view:"list",filters:{directoryGroup:"ALL",celebrationEvidence:"SOURCE_1962",
 siteEvidence:"ALL",affiliations:[]},tlmCelebrationEvidenceCounts:tlmCelebrationEvidenceCounts(released),
 tlmSiteEvidenceCounts:{ALL:2582,REVIEWED_PIN:67,SOURCE_PIN:1847,ADDRESS_ONLY:668}
}));
assert.match(english,/Source identifies 1962 Mass/);
assert.match(english,/No approved edition witness yet/);
assert.match(english,/data-find-filter="celebrationEvidence"/);
assert.match(english,/Source-documented 1962 celebrations|1962 Missal/);
const french=renderExploreToString(buildExploreViewModel({
 items:released,lens:"tlm",view:"list",language:"fr",filters:{directoryGroup:"ALL",
 celebrationEvidence:"ALL",siteEvidence:"ALL",affiliations:[]},
 tlmCelebrationEvidenceCounts:tlmCelebrationEvidenceCounts(released)
}));
assert.match(french,/Source attestant une messe de 1962/);
assert.match(french,/Édition non encore attestée/);
console.log("PASS CL27 1962 owner-witness publication: 2 exact sources, 2580 not established, 0 inferred Una Cum or status");
