import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const annex = JSON.parse(readFileSync(new URL("../data/calendar/cum-sanctissima-protected-third-class.review.v1.json", import.meta.url), "utf8"));
assert.equal(annex.protectedCount, 70);
assert.equal(annex.feasts.length, 70);
assert.equal(annex.status, "TRANSCRIBED_ANNEX_NOT_RUNTIME_CONNECTED");
const ids = annex.feasts.map(f => f.monthDay);
assert.equal(new Set(ids).size, 70);
for (const f of annex.feasts) {
  assert.match(f.monthDay, /^\d{2}-\d{2}$/);
  assert.ok(f.titleForReview);
  assert.equal(f.protectedUnder, "CUM_SANCTISSIMA_2020_ANNEX_8");
  assert.equal(f.resolverIdentity, null, "Cannot invent canonical resolver identity");
  assert.equal(f.identityMatchStatus, "PENDING_SOURCE_ID_CROSSWALK");
}
assert.ok(ids.includes("10-03"));
assert.ok(ids.includes("10-15"));
assert.ok(ids.includes("06-30"));
assert.ok(!ids.includes("09-23"), "Ember Wednesday rule is from the resolver, not the 70-feast annex");
console.log("Cum sanctissima 70-feast transcription/collision-source guard: PASS (70 source-review entries)");
