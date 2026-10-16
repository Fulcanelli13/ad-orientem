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
  if (f.resolverIdentity) {
    assert.match(f.resolverIdentity, /^sancti:\d{2}-\d{2}(?:[a-z]+)?:3:[wr]$/);
    assert.ok(f.evidence?.source && f.evidence?.workflowRun, f.monthDay + " attestation not grounded");
    assert.equal(f.identityMatchStatus, "ATTESTED_IN_ARCHIVED_2024_2027_PRODUCTION_RESOLVER");
    assert.deepEqual(f.evidence.years, [2024, 2027]);
    assert.match(f.resolverIdentity, /:3:[wr]$/);
  } else {
    assert.equal(f.identityMatchStatus, "SOURCE_ID_UNVERIFIED");
    assert.equal(f.candidateResolverStem, "sancti:" + f.monthDay);
  }
}
assert.equal(annex.crosswalk.attestedExact, 70);
assert.equal(annex.crosswalk.unresolved, 0);
assert.equal(annex.feasts.filter(f => f.resolverIdentity).length, 70);
assert.equal(annex.crosswalk.independentlyLiturgicallyCertified, false);
assert.ok(ids.includes("10-03"));
assert.ok(ids.includes("10-15"));
assert.ok(ids.includes("06-30"));
assert.ok(!ids.includes("09-23"), "Ember Wednesday rule is from the resolver, not the 70-feast annex");
console.log("Cum sanctissima 70-feast transcription and documented source-ID matches: PASS (70 source IDs attested in 2024/2027)");
