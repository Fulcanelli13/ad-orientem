import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => JSON.parse(readFileSync(new URL("../"+p, import.meta.url), "utf8"));
const board = read("data/geography/research/sacred-atlas-150-source-scope-evidence-20261107.v1.json");
const complement = read("data/geography/research/sacred-atlas-243-complement-triage-20261107.v1.json");
const first = read("data/geography/research/sacred-atlas-169-consolidated-admission-board-20261107.v1.json");
const geo = read("data/geography/seed-registry.v1.json");
assert.equal(board.schema, "AO_SACRED_ATLAS_150_SOURCE_SCOPE_SCREEN_V1");
assert.equal(board.status, "RESEARCH_FINAL36_SOURCE_SCREEN_ALL_ROUTED_UNAPPROVED");
assert.equal(board.records.length, 150);
assert.equal(geo.places.length, 535, "No unauthorized Place admission");
const lanes = complement.candidate_ids_by_lane;
const expected = new Set([...lanes.G_QUALIFIED_REVIEW, ...lanes.H_STANDARD_REVIEW]);
const former = new Set(first.records.map(r=>r.candidate_id));
assert.equal(expected.size, 150);
let screened = 0;
for (const row of board.records) {
  assert.ok(expected.has(row.candidate_id), row.candidate_id + " not in 150 cohort");
  assert.ok(!former.has(row.candidate_id), row.candidate_id + " already belongs to 169 cohort");
  assert.equal(row.owner_decision, "PENDING");
  assert.equal(row.physical_site_approved, false);
  assert.equal(row.coordinate_approved, false);
  assert.equal(row.import_ready, false);
  assert.equal(row.publication_authorized, false);
  assert.equal(row.web_evidence_review.point_certified, false);
  if (row.web_evidence_review.page_level_research_performed) {
    screened++;
    assert.match(row.web_evidence_review.evidence_url, /^https?:\/\//);
    assert.notEqual(row.web_evidence_review.outcome, "NOT_YET_INDEPENDENTLY_PAGE_SCREENED");
    assert.ok(row.web_evidence_review.scope_finding.length > 35);
  } else {
    assert.equal(row.web_evidence_review.outcome, "NOT_YET_INDEPENDENTLY_PAGE_SCREENED");
    assert.equal(row.web_evidence_review.evidence_url, null);
  }
  if (row.submitted_point) {
    assert.ok(Number.isFinite(row.submitted_point.lat));
    assert.ok(Number.isFinite(row.submitted_point.lng));
    assert.equal(row.submitted_point.entrance_verified, false);
  }
}
assert.equal(new Set(board.records.map(r=>r.candidate_id)).size, 150);
assert.equal(screened, board.counts.independently_page_screened);
assert.equal(screened, 150);
assert.equal(board.counts.second_pass_source_upgrade, 38);
assert.equal(board.review_batches.initial_page_level, 59);
assert.equal(board.review_batches.second_source_upgrade, 38);
assert.equal(board.review_batches.third_source_upgrade, 17);
assert.equal(board.review_batches.fourth_source_scope, 36);
assert.equal(board.review_batches.remaining_unchecked, 0);
assert.equal(board.review_batches.final36_site_corroborated, 31);
assert.equal(board.review_batches.final36_identity_holds, 5);
assert.equal(board.counts.fourth_pass_source_scope_reviews, 36);
assert.equal(board.counts.final36_identity_holds, 5);
for (const id of ["SG-INV-0397","SG-INV-0399","SG-INV-0598","SG-INV-0297","SG-INV-0630","SG-INV-0652","SG-INV-0670","SG-INV-0536"]) {
  const row = board.records.find(x => x.candidate_id === id);
  assert.ok(row, id);
  assert.equal(row.web_evidence_review.page_level_research_performed, true);
  assert.equal(row.web_evidence_review.independent_source_upgrade, true);
  assert.equal(row.web_evidence_review.point_certified, false);
  assert.ok(["http:", "https:"].includes(new URL(row.web_evidence_review.evidence_url).protocol));
}
assert.equal(150-screened, board.counts.not_yet_page_screened);
assert.equal(board.counts.qualified, 33);
assert.equal(board.counts.standard, 117);
assert.equal(board.counts.approved, 0);
assert.equal(board.counts.published, 0);
const held = [
  "CL-CD-20261105-28", "SG-INV-0023", "SG-INV-0471",
  "SG-INV-0683", "CL-UG-20261105-26"
];
for (const id of held) {
 const item = board.records.find(x=>x.candidate_id===id);
 assert.ok(item, id);
 assert.equal(item.web_evidence_review.review_batch, "ATLAS_FINAL36_SOURCE_SCOPE_20261107");
 assert.equal(item.web_evidence_review.site_identity_corroborated, false);
 assert.equal(item.web_evidence_review.independent_source_upgrade, false);
 assert.equal(item.web_evidence_review.owner_admission_authorized, false);
 assert.equal(item.physical_site_approved, false);
 assert.equal(item.coordinate_approved, false);
 assert.equal(item.publication_authorized, false);
}
const final36 = board.records.filter(x=>x.web_evidence_review.review_batch === "ATLAS_FINAL36_SOURCE_SCOPE_20261107");
assert.equal(final36.length,36);
assert.equal(final36.filter(x=>x.web_evidence_review.site_identity_corroborated).length,31);
assert.equal(final36.filter(x=>!x.web_evidence_review.site_identity_corroborated).length,5);
assert.ok(board.records.every(x=>x.web_evidence_review.page_level_research_performed));
assert.equal(board.records.filter(x=>x.web_evidence_review.outcome==="NOT_YET_INDEPENDENTLY_PAGE_SCREENED").length,0);

assert.equal(board.records.filter(x=>x.source_class_from_url==="THIRD_PARTY_CHURCH_DIRECTORY").length,72);
for (const [id,outcome] of [
  ["SG-INV-0173","WRONG_BUILDING_SOURCE_CORRECTION"],
  ["SG-INV-0741","TEMPORARY_ACCESS_QUALIFICATION"],
  ["SG-INV-0364","TEMPORARY_ACCESS_QUALIFICATION"],
  ["SG-INV-0425","SAME_BUILDING_TITLE_CORRECTION"],
  ["SG-INV-0595","DISTINCT_BUILDING_SCOPE_CORRECTION"],
  ["CL-FR-20261105-23","RITE_SCOPE_CORRECTION"]]){
  assert.equal(board.records.find(x=>x.candidate_id===id)?.web_evidence_review.outcome,outcome,id);
}
console.log("PASS 150 Sacred Atlas candidates: " + screened + " page-level scope checks, " + (150-screened) + " awaiting page checks; 0 approved/imported/published");
