#!/usr/bin/env node
// Report progress across subject-first relic research waves. Research-only, no map mutations.
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const wave1=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const wave2=read("data/explore/worldwide-relic-subject-census.wave2.research.v1.json");
const backlog=new Set(wave1.systematic_subject_backlog.map(x=>x.subject_id));
const newCustody=new Set(wave2.custody_claims.map(x=>x.subject_id));
const historical=new Set(wave2.adversarial_historical_reviews.map(x=>x.subject_id));
const categories={
 new_custody_evidence:[...backlog].filter(x=>newCustody.has(x)),
 historical_review_no_new_custody:[...backlog].filter(x=>!newCustody.has(x)&&historical.has(x)),
 pending_wave2:[...backlog].filter(x=>!newCustody.has(x)&&!historical.has(x))
};
const results={
 schema:"SACRED_ATLAS_WORLD_CENSUS_COVERAGE_REPORT_V1",
 research_not_a_complete_worldwide_census:true,
 published_place_impact:0,
 canonical_subjects:wave1.subjects.length,
 preserved_legacy_relics:wave1.legacy_object_crosswalk.length,
 first_wave_claims:wave1.institutional_custody_evidence.length,
 second_wave_claims:wave2.custody_claims.length,
 total_screened_claims:wave1.institutional_custody_evidence.length+wave2.custody_claims.length,
 historical_case_reviews:wave2.adversarial_historical_reviews.length,
 backlog_total:backlog.size,
 backlog_new_custody:categories.new_custody_evidence.length,
 backlog_historical_only:categories.historical_review_no_new_custody.length,
 backlog_no_wave2_research:categories.pending_wave2.length,
 unique_screened_countries:[...new Set([...wave1.institutional_custody_evidence,...wave2.custody_claims].map(x=>x.country_code))].sort()
};
if(results.backlog_total!==results.backlog_new_custody+results.backlog_historical_only+results.backlog_no_wave2_research)throw Error("Census backlog partition failure");
console.log(JSON.stringify(process.argv.includes("--details")?{...results,backlog_subject_ids:categories}:results,null,2));
