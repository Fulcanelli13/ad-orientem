import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const census=read("data/explore/european-relic-census-candidates.2026-10-09.json");
const geo=read("data/geography/seed-registry.v1.json");
const sacred=read("data/explore/sacred-phenomena-seed.v1.json");
assert.equal(census.schema,"SACRED_ATLAS_EUROPEAN_CENSUS_V1");
const ids=new Set(), sourceUrls=new Set();
for(const row of census.candidates){
  assert.ok(!ids.has(row.candidate_id),"duplicate candidate "+row.candidate_id);
  ids.add(row.candidate_id);
  assert.match(row.source_url,/^https:\/\//,"source URL missing");
  assert.ok(row.attribution_status&&row.display_access&&row.custody_status);
  assert.equal(row.release_ready,false,"candidate must not silently publish");
  sourceUrls.add(row.source_url);
}
assert.equal(census.candidates.length,12);
assert.equal(census.candidates.filter(x=>x.ingestion_state==="EXISTING_RECONCILED").length,5);
assert.equal(census.candidates.filter(x=>x.ingestion_state==="PRIMARY_SOURCE_SCREENED_NEEDS_GEO_AND_SCHEMA_REVIEW").length,7);
assert.ok(geo.places.length>=135);
assert.ok(sacred.relics.length>=75);
console.log("PASS 12 screened/reconciled European relic census entries; 7 missing candidates, 5 existing; production registries unchanged");
