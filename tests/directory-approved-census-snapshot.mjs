import assert from "node:assert/strict";
import fs from "node:fs";
const census=JSON.parse(fs.readFileSync("data/directory/research/approved-mass-worldwide-candidates-20261009.v1.json","utf8"));
const audit=JSON.parse(fs.readFileSync("data/directory/research/approved-mass-worldwide-crosswalk-20261009.v1.json","utf8"));
assert.equal(census.schema,"AO_APPROVED_MASS_RESEARCH_DISCOVERY_V1");
assert.equal(audit.schema,"AO_APPROVED_MASS_CROSSWALK_V1");
assert.equal(census.summary.requested_countries,65);
assert.equal(census.records.length,1531);
assert.equal(census.summary.unique_discovered,census.records.length);
assert.equal(audit.summary.third_party_source_records,census.records.length);
assert.equal(audit.summary.published,0,"Never count a third-party lead as certified Mass venue");
assert.equal(audit.candidates.length,census.records.length);
assert.equal(audit.summary.matched_name_review+audit.summary.ambiguous_name_review+
  audit.summary.likely_novel_needs_source,census.records.length);
assert.ok(census.country_coverage.every(c=>c.discovered_unique>=0&&(c.listed_total===null||c.discovered_unique<=c.listed_total)),
  "Country rows cannot claim more than the source total");
assert.ok(census.records.every(r=>r.publication_state==="RESEARCH_ONLY"&&r.directory_url.startsWith("https://www.latinmassdir.org/venue/")));
assert.ok(audit.candidates.every(r=>r.publication_state==="RESEARCH_ONLY_NOT_MASS_VENUE"));
const ids=new Set(census.records.map(r=>r.source_id));
assert.equal(ids.size,census.records.length,"Duplicate source IDs across country lists");
assert.ok(census.summary.full_countries>=50);
assert.ok(census.summary.detail_pages_read>=20);
const labels=["NAME_ONLY_CANDIDATE_MATCH","AMBIGUOUS_NAME_MATCH","UNMATCHED_RESEARCH_LEAD"];
assert.ok(audit.candidates.every(r=>labels.includes(r.duplicate_state)));
assert.ok(audit.candidates.every(r=>!r.source_state||["NEEDS_DETAIL_FETCH","NO_MASS_IN_DETAIL","MASS_CLAIM_WITH_ORIGINAL_LINK_TO_CHECK","MASS_CLAIM_NO_ORIGINAL_LINK"].includes(r.source_state)));
console.log("Approved directory census snapshot: PASS — "+census.records.length+" non-published leads, "+
  census.summary.full_countries+"/65 fully covered country lists, "+
  audit.summary.likely_novel_needs_source+" provisional unmatched leads");
