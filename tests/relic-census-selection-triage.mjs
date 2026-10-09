import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const report=JSON.parse(execFileSync(process.execPath,["tools/atlas/relic-census-selection-triage.mjs","--json"],{encoding:"utf8",maxBuffer:32*1024*1024}));
const a=read("data/explore/worldwide-relic-subject-census.research.v1.json");
assert.equal(report.schema,"SACRED_ATLAS_RELIC_SUBJECT_COMPARATIVE_TRIAGE_V1");
assert.equal(report.global_exhaustiveness,false);
assert.equal(report.subjects,133);
assert.equal(report.rows.length,133);
assert.equal(report.cases,135);
assert.equal(report.preserved_legacy_relics,75);
assert.equal(report.map_pins_added,0);
assert.ok(report.subjects_with_multiple_reported_sites>=3);
const ids=new Set();
for(const s of report.rows){
 assert.ok(!ids.has(s.subject_id));ids.add(s.subject_id);
 assert.equal(s.relic_authentication,"NOT_CERTIFIED_BY_THIS_CENSUS");
 assert.equal(s.world_map_decision,"REQUIRES_HUMAN_SOURCE_AND_SIGNIFICANCE_GATE");
 assert.equal(s.liturgical_calendar_1962,"NOT_CERTIFIED");
 assert.equal(s.popularity_vs_obscurity,"NOT_SCORED_IN_THIS_CENSUS");
 assert.ok(s.documentary_source_count>=0);
 for(const p of s.sites_for_editorial_comparison){
  assert.equal(p.publication_status,"REVIEW_ONLY_NO_MAP_WRITE");
  assert.ok(p.evidence_ids.length>0);
  assert.ok(p.research_qualifications.length>0);
 }
}
assert.deepEqual(ids,new Set(a.systematic_subject_backlog.map(x=>x.subject_id)));
const find=s=>report.rows.find(x=>x.subject_id==="subject:"+s);
assert.ok(find("saint-thomas-the-apostle").sites_for_editorial_comparison.length>=2);
assert.ok(find("saint-francis-xavier").legacy_object_count>=1);
assert.ok(find("saint-martha-of-bethany").reported_case_count>=2);
assert.equal(find("saint-pedro-calungsod").bodily_custody_candidate_count,0);
assert.equal(find("saint-lorenzo-ruiz").bodily_custody_candidate_count,0);
assert.ok(find("saint-joachim").sites_for_editorial_comparison.every(x=>!x.research_qualifications.includes("BODILY_CUSTODY_CANDIDATE_ATTRIBUTION_UNVERIFIED")));
console.log("PASS 133-subject cross-wave custody grouping, 135 research cases, 75 legacy records, zero automatic authenticated relics / pins / fame scores");
