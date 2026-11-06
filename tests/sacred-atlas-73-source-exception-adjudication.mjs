import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const intake = read("data/geography/research/sacred-atlas-169-owner-review-intake-20261106.v1.json");
const audit = read("data/geography/research/sacred-atlas-73-source-exception-adjudication-20261106.v1.json");
const candidates = intake.candidates.filter(x => x.intake_lane !== "PRIORITY_OWNER_EVIDENCE_REVIEW");
const byId = new Map(candidates.map(x => [x.candidate_id, x]));
const rows = audit.records, present = new Set(rows.map(x => x.candidate_id));
assert.equal(audit.status, "RESEARCH_ONLY_NOT_OWNER_APPROVED");
assert.equal(candidates.length, 73);
assert.equal(rows.length, 73);
assert.equal(present.size, 73, "Review must be one-to-one with 73 remaining candidates");
assert.deepEqual([...present].sort(), [...byId.keys()].sort());
const scopeCounts = {}, exceptionCounts = {};
for (const row of rows) {
 const original = byId.get(row.candidate_id);
 assert.equal(row.name, original.site_name);
 assert.equal(row.country_code, original.country_code);
 assert.equal(row.identity_url, original.identity_url);
 assert.equal(row.geography_url, original.geography_url);
 assert.equal(row.intake_lane, original.intake_lane);
 assert.equal(row.publishable, false);
 assert.equal(row.identity_admission_decision, "PENDING_OWNER_AND_FINAL_EDITOR");
 assert.equal(row.coordinate_admission_decision, "PENDING_EVIDENCE_OR_ACCEPTED_ILLUSTRATIVE_PRECISION");
 assert.ok(row.next_action && row.next_action.length > 30);
 if (row.evidence_content_reviewed_now) {
  assert.match(row.verified_source_url, /^https:\/\//);
  assert.ok(row.verified_finding.length > 35);
 } else {
  assert.equal(row.verified_source_url, null);
  assert.equal(row.source_content_verification, "NOT_INDEPENDENTLY_FETCHED_THIS_PASS");
 }
 if (row.intake_lane === "PRIORITY_SOURCE_CLASS_REVIEW") {
  scopeCounts[row.url_scope_review] = (scopeCounts[row.url_scope_review] || 0) + 1;
 } else if (row.intake_lane === "BLOCKED_SPECIFIC_REVIEW") {
  exceptionCounts[row.source_content_verification] = (exceptionCounts[row.source_content_verification] || 0) + 1;
  assert.ok(row.evidence_content_reviewed_now, "All eight exceptions need individual retrieved evidence");
 }
}
const counts = audit.counts;
assert.equal(counts.source_class_review, 65);
assert.equal(counts.specific_holds, 8);
assert.equal(counts.source_urls_structurally_triaged, 73);
assert.equal(counts.web_content_revisited, rows.filter(x => x.evidence_content_reviewed_now).length);
assert.equal(counts.web_content_revisited, 17);
assert.deepEqual(counts.source_review_scopes, scopeCounts);
assert.deepEqual(counts.exception_findings, exceptionCounts);
assert.deepEqual(exceptionCounts, {
 NEW_BUILD_CONSTRUCTION_HOLD:1,
 IDENTITY_FOUND_COORDINATE_UNCORROBORATED:1,
 DISTINCT_FROM_NEAREST_ATTESTED:5,
 BASILICA_IDENTITY_ATTESTED_GEO_HOLD:1
});
assert.equal(counts.owner_approved, 0);
assert.equal(counts.publish_authorized, 0);
assert.equal(intake.candidates.filter(x => x.publication_authorized || x.imported_to_live).length, 0);
console.log("PASS 73 Atlas source and exception triage: 65 scope-classified, eight named-site holds, 17 retrieved-source corroborations, zero approval or import");
