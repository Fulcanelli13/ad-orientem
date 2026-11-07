import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const roster = read("data/geography/research/sacred-atlas-243-complement-triage-20261107.v1.json");
const prior = read("data/geography/research/sacred-atlas-169-consolidated-admission-board-20261107.v1.json");
const geography = read("data/geography/seed-registry.v1.json");

assert.equal(roster.schema, "AO_SACRED_ATLAS_243_COMPLEMENT_ROSTER_V1");
assert.equal(roster.status, "RESEARCH_TRIAGE_ONLY_NO_ADMISSION");
assert.equal(roster.provenance.source_rows, 942);
assert.equal(roster.provenance.canonical_baseline, 530);
assert.equal(roster.provenance.claude_provisional_rows, 412);
assert.equal(roster.provenance.first_intake_records, 169);
assert.equal(roster.counts.remaining, 243);
assert.equal(roster.counts.total_missing_coordinates, 40);
assert.equal(roster.counts.source_point_within_100m_of_existing, 2);
assert.equal(roster.counts.source_point_within_500m_of_existing, 10);

const groups = roster.candidate_ids_by_lane;
const required = {
  A_P107_SEPARATE_DRAFT: 6,
  B_LINK_ONLY_REUSE: 2,
  C_IDENTITY_HOLD: 2,
  D_NON_CATHOLIC_HERITAGE: 30,
  E_HISTORIC_CATHOLIC_HERITAGE: 23,
  F_MISSING_COORDINATE: 30,
  G_QUALIFIED_REVIEW: 33,
  H_STANDARD_REVIEW: 117
};
assert.deepEqual(roster.counts.groups, required);
assert.deepEqual(Object.keys(groups), Object.keys(required));
for (const [name, expected] of Object.entries(required)) {
  assert.equal(groups[name].length, expected, name);
}
const ids = Object.values(groups).flat();
assert.equal(ids.length, 243);
assert.equal(new Set(ids).size, 243, "All provisional candidate IDs must be unique");
for (const id of ids) assert.match(id, /^(?:SG-INV-\d{4}|CL-[A-Z]{2}-\d{8}-\d{2})$/);

const intakeIds = new Set(prior.records.map(row => row.candidate_id));
assert.equal(intakeIds.size, 169);
for (const id of ids) assert.ok(!intakeIds.has(id), id + " must not be in the existing 169 intake");
assert.equal(intakeIds.size + ids.length, 412, "Both research cohorts must reconstruct the Stage25 provisional count");
assert.deepEqual([...groups.A_P107_SEPARATE_DRAFT].sort(),
  ["SG-INV-0196", "SG-INV-0380", "SG-INV-0650", "SG-INV-0512", "SG-INV-0216", "SG-INV-0171"].sort());
assert.deepEqual([...groups.B_LINK_ONLY_REUSE].sort(), ["SG-INV-0525", "SG-INV-0451"].sort());
assert.deepEqual([...groups.C_IDENTITY_HOLD].sort(), ["SG-INV-0612", "SG-INV-0654"].sort());

assert.equal(roster.policy.owner_approval_count, 0);
assert.equal(roster.policy.publication_count, 0);
assert.equal(roster.policy.imported_count, 0);
assert.equal(roster.policy.runtime_changes, false);
assert.equal(roster.policy.new_place_ids_reserved, false);
assert.equal(roster.policy.publication_blocked, true);
assert.equal(geography.places.length, 535, "Research roster must not add unapproved canonical Places");

const geoAreas = new Set(geography.geoAreas.map(a => a.geo_area_id));
const missingCodes = roster.counts.missing_country_area_codes;
assert.deepEqual(missingCodes, ["AM", "BF", "CY", "ET", "HT", "TL", "TN", "TR", "XK"]);
for (const cc of missingCodes) assert.ok(!geoAreas.has("geo:country:" + cc), cc + " needs a country-area preflight decision");
assert.equal(missingCodes.length, roster.counts.missing_country_area_definitions);
assert.equal(roster.risks.proximity_is_not_duplicate_proof, true);
assert.equal(roster.risks.staged_coordinates_are_illustrative_not_entrance_navigation, true);
console.log("PASS Sacred Atlas 243 complementary candidates: 412 total provisional accounted for; 9 country-area prerequisites; zero admissions");
