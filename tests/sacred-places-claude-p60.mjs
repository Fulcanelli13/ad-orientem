import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (p) => JSON.parse(readFileSync(p, "utf8"));
const lines = (p) => readFileSync(p, "utf8").trimEnd().split(/\r?\n/);
const root = "data/geography/research/claude-p60-20261028/";
const parts = Array.from({ length: 6 }, (_, i) =>
  lines(root + "claude-completed-candidates-shard-" + String(i + 1).padStart(2, "0") + ".jsonl"));
parts.forEach((p) => assert.equal(p.length, 125));
const records = parts.flatMap((p) => p.map(JSON.parse));
const proposed = lines(root + "claude-new-sites.jsonl").map(JSON.parse);
const frozen = load("data/geography/research/claude-handoff-20261028/sacred-places-r70-p56-candidate750-snapshot.v1.json");
const places = load("data/geography/seed-registry.v1.json");
const audit = load(root + "p60-reconciliation-release-gate-audit.v1.json");
const index = frozen.candidate_columns.indexOf("candidate_id");
const linkIndex = frozen.candidate_columns.indexOf("canonical_id_confirmed");
const frozenIds = new Set(frozen.candidates.map((row) => Array.isArray(row) ? row[index] : row.candidate_id));
const frozenLinked = new Set(frozen.candidates.filter((row) =>
  Array.isArray(row) ? Boolean(row[linkIndex]) : Boolean(row.canonical_id_confirmed)
).map((row) => Array.isArray(row) ? row[index] : row.candidate_id));
const liveIds = new Set(places.places.map((p) => p.place_id));
const ids = new Set(records.map((r) => r.candidate_id));
assert.equal(records.length, 750);
assert.equal(ids.size, 750);
assert.deepEqual(ids, frozenIds);
assert.equal(places.places.length, 512);
assert.equal(frozenLinked.size, 322);
assert.equal(records.filter((r) => r.decision === "EXISTING_CANONICAL_REUSE").length, 356);
assert.equal(records.filter((r) => r.decision === "NEW_DISTINCT_PHYSICAL_SITE").length, 302);
assert.equal(records.filter((r) => r.decision === "EXACT_SITE_NEEDS_MORE_GEOMETRY").length, 39);
assert.equal(records.filter((r) => r.latitude != null && r.longitude != null).length, 707);
assert.equal(records.filter((r) => r.latitude == null || r.longitude == null).length, 43);
assert.equal(records.filter((r) => r.catholic_status === "CATHOLIC_IDENTITY_UNCERTAIN").length, 33);
assert.equal(proposed.length, 302);
assert.deepEqual(new Set(proposed.map((r) => r.candidate_id)),
  new Set(records.filter((r) => r.decision === "NEW_DISTINCT_PHYSICAL_SITE").map((r) => r.candidate_id)));
assert.equal(proposed.filter((r) => r.osm_ref).length, 27);
assert.equal(lines(root + "claude-source-evidence.csv").length - 1, 1778);
assert.equal(lines(root + "claude-geography-exceptions.csv").length - 1, 35);
assert.equal(lines(root + "claude-unresolved-exceptions.csv").length - 1, 81);
assert.equal(lines(root + "claude-canonical-reuse-crosswalk.csv").length - 1, 417);
assert.equal(lines(root + "claude-completed-candidates.csv").length - 1, 750);
assert.equal(records.filter((r) => r.decision === "EXISTING_CANONICAL_REUSE" && !frozenLinked.has(r.candidate_id)).length, 34);
assert.ok(records.filter((r) => r.canonical_reuse_id).every((r) => liveIds.has(r.canonical_reuse_id)));
assert.ok(records.every((r) => r.publish_authorized === false));
assert.ok(audit.hazards.some((h) => h.candidate_ids.includes("SG-INV-0049") && h.decision === "REJECT_CLAUDE_CANONICAL_REUSE"));
assert.equal(records.find((r) => r.candidate_id === "SG-INV-0049").canonical_reuse_id, "place:IT:scala-santa-rome");
assert.equal(audit.counts.release_authorized, 0);
console.log("PASS: P60 750 frozen IDs and source evidence validated; zero automatic release.");
