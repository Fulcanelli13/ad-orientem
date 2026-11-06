import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const intake = read("data/geography/research/sacred-atlas-169-owner-review-intake-20261106.v1.json");
const priority = read("data/geography/research/sacred-atlas-96-priority-unapproved-preimport-20261106.v1.json");
const b21 = read("data/geography/research/sacred-places-v10-b21-two-marian-site-admissions-20261106.v1.json");
const geography = read("data/geography/seed-registry.v1.json");
const rows = intake.candidates;
const byId = new Map(rows.map(x => [x.candidate_id, x]));
const priorityById = new Map(priority.candidates.map(x => [x.candidate_id, x]));
const b21ById = new Map(b21.published_new.map(x => [x.candidate_id, x]));
const areas = new Set(geography.geoAreas.map(x => x.geo_area_id));

assert.equal(intake.status, "DRAFT_RESEARCH_ONLY_UNAPPROVED");
assert.equal(intake.canonical_draft_place_count, geography.places.length);
assert.equal(geography.places.length, 535);
assert.equal(rows.length, 169);
assert.equal(byId.size, 169, "All research candidate IDs must be unique");
assert.equal(priorityById.size, 96, "Original 96 detailed dossiers remain intact");
assert.deepEqual([
  rows.filter(x => x.intake_lane === "PRIORITY_OWNER_EVIDENCE_REVIEW").length,
  rows.filter(x => x.intake_lane === "PRIORITY_SOURCE_CLASS_REVIEW").length,
  rows.filter(x => x.intake_lane === "BLOCKED_SPECIFIC_REVIEW").length,
], [96, 65, 8], "Preserve intake classifications without automatic promotion");

const missingAreas = [];
const newlyNear = [];
for (const row of rows) {
  assert.match(row.candidate_id, /^SG-INV-\d{4}$/);
  assert.ok(row.site_name && /^[A-Z]{2}$/.test(row.country_code));
  assert.equal(row.owner_decision, "PENDING");
  assert.equal(row.evidence_decision, "PENDING");
  assert.equal(row.publication_authorized, false);
  assert.equal(row.imported_to_live, false);
  assert.equal(row.needs_separate_owner_approval, true);
  assert.equal(row.staged_point.geometry_verified, false);
  assert.equal(row.staged_point.entrance_coordinate_certified, false);
  assert.ok(Number.isFinite(row.staged_point.latitude) && Math.abs(row.staged_point.latitude) <= 90);
  assert.ok(Number.isFinite(row.staged_point.longitude) && Math.abs(row.staged_point.longitude) <= 180);
  assert.ok(["site", "complex_anchor", "locality"].includes(row.staged_point.precision_suggestion));
  assert.match(row.identity_url || "", /^https?:\/\//);
  assert.match(row.geography_url || "", /^https?:\/\//);
  assert.equal(row.country_area_present, areas.has("geo:country:" + row.country_code));
  if (!row.country_area_present) missingAreas.push(row.candidate_id);
  if (row.additional_live_535_review !== "NONE") newlyNear.push(row.candidate_id);
  const old = priorityById.get(row.candidate_id);
  if (old) {
    assert.equal(row.prior_priority_manifest, "sacred-atlas-96-priority-unapproved-preimport-20261106.v1.json");
    assert.equal(row.site_name, old.name);
    assert.equal(row.country_code, old.country_code);
    assert.equal(row.staged_point.latitude, old.location_preview.latitude);
    assert.equal(row.staged_point.longitude, old.location_preview.longitude);
  } else {
    assert.equal(row.prior_priority_manifest, null);
    assert.equal(row.intake_lane !== "PRIORITY_OWNER_EVIDENCE_REVIEW", true);
    assert.equal(row.site_evidence_status, "UNREVIEWED_IN_PRIOR_96_PASS");
  }
  const existingAdmission = b21ById.get(row.candidate_id);
  assert.equal(row.already_in_draft_unapproved, !!existingAdmission);
  assert.equal(row.draft_b21_place_id, existingAdmission?.place_id || null);
  if (existingAdmission) assert.ok(geography.places.some(p => p.place_id === existingAdmission.place_id));
}
assert.deepEqual(missingAreas.sort(), ["SG-INV-0687", "SG-INV-0720", "SG-INV-0731"]);
assert.deepEqual(newlyNear, [], "No additional proximity exception may be silently hidden");
assert.equal(rows.filter(x => x.prior_priority_manifest).length, 96);
assert.equal(rows.filter(x => !x.prior_priority_manifest).length, 73);
assert.equal(rows.filter(x => x.already_in_draft_unapproved).length, 2);
assert.equal(rows.filter(x => x.publication_authorized).length, 0);
assert.equal(rows.filter(x => x.owner_decision === "APPROVED").length, 0);
assert.equal(intake.other_draft_p107.within_169, 0);
for (const id of intake.other_draft_p107.candidate_ids) assert.ok(!byId.has(id));
assert.deepEqual(intake.counts, {
  source_rows:169, unique_candidates:169, priority:96, source_class_review:65,
  specific_holds:8, priority_in_previous_96:96, additional_73_integrated:73,
  b21_unapproved_draft_overlap:2, missing_country_area:3, new_unflagged_sub500m:0,
  owner_approved:0, authorized_for_production:0
});
console.log("PASS 169 Claude owner-review records: 96 priority + 65 source review + 8 holds, 73 newly staged; 2 B21 draft overlaps, 3 country-area holds, zero auto-publication");
