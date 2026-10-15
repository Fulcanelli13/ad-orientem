import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = JSON.parse(readFileSync(new URL("../data/calendar/doctors-of-church-roster.review.v1.json", import.meta.url), "utf8"));
const pilot = JSON.parse(readFileSync(new URL("../data/calendar/living-sanctoral-pilot.v1.json", import.meta.url), "utf8"));
const ids = new Set(registry.doctors.map(x => x.canonicalPersonId));
assert.equal(registry.totalReported, 38);
assert.equal(registry.doctors.length, 38);
assert.equal(ids.size, 38);
assert.equal(registry.gates.universalRosterNamesEnumerated, true);
assert.equal(registry.gates.runtimeIntegrated, false);
assert.equal(registry.status, "IDENTITY_CENSUS_FOR_REVIEW_NOT_CALENDAR_PUBLICATION");
assert.equal(registry.listWitnesses.length, 2);
const recent = registry.doctors.filter(x => x.recognitionAfter1962);
assert.equal(recent.length, 8);
for (const row of registry.doctors) {
  assert.match(row.canonicalPersonId, /^saint\.[a-z0-9-]+$/);
  assert.ok(row.name);
  assert.equal(row.runtime, "NOT_CONNECTED");
  assert.equal(row.liturgicalDate1962, null, "Do not fabricate 1962 dates");
  if (row.recognitionAfter1962) {
    assert.match(row.declarationDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(row.declarationWitnessUrl?.startsWith("https://"), row.canonicalPersonId);
  }
}
const canonicalPilotIds = new Set(pilot.persons.map(x => x.id));
for (const id of ["saint.john-henry-newman","saint.therese-lisieux","saint.teresa-avila","saint.irenaeus-lyon"]) {
  assert.ok(ids.has(id) && canonicalPilotIds.has(id), id + " must reuse pilot canonical ID");
}
assert.equal(registry.doctors.find(x => x.canonicalPersonId === "saint.john-henry-newman").declarationDate, "2025-11-01");
console.log("38-Doctor roster identity/reuse and post-1962 declarations guard: PASS (38 entries, 8 later Doctors)");
