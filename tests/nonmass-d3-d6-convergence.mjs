import assert from "node:assert/strict";
import {
  ADORATION_SESSION_KEY,
  CONFESSION_PHASES,
  PRAY_STORAGE_KEY,
  canonicalAppVersion,
  confessionPhaseForStage,
  humanSourceStatus,
  normalizeStoredPrayState,
} from "../src/app/nonmass-convergence.js";

assert.equal(PRAY_STORAGE_KEY, "ao.pray.v435930");
assert.equal(ADORATION_SESSION_KEY, "ao.app.adoration.presence.v1");
assert.deepEqual(CONFESSION_PHASES, [
  "doctrine",
  "prepare",
  "examination",
  "in-confessional",
  "after",
]);

assert.equal(confessionPhaseForStage(0), "doctrine");
assert.equal(confessionPhaseForStage(1), "prepare");
assert.equal(confessionPhaseForStage(2), "examination");
assert.equal(confessionPhaseForStage(3), "in-confessional");
assert.equal(confessionPhaseForStage(4), "in-confessional");
assert.equal(confessionPhaseForStage(5), "in-confessional");
assert.equal(confessionPhaseForStage(6), "in-confessional");
assert.equal(confessionPhaseForStage(7), "after");

const original = {
  adoration: { presence: "exposed", mode: "open" },
  firstFriday: { records: [{ date: "2026-10-02", complete: true }] },
};
const normalized = normalizeStoredPrayState(original);
assert.equal(original.adoration.presence, "exposed", "normalization mutated the source object");
assert.equal("presence" in normalized.adoration, false, "exposition state remained persistent");
assert.equal(normalized.adoration.mode, "open");
assert.deepEqual(normalized.firstFriday, original.firstFriday, "unrelated devotional state changed");

assert.equal(humanSourceStatus("VERIFIED_PRIMARY", "en"), "Verified source");
assert.equal(humanSourceStatus("VERIFIED_SECONDARY", "fr"), "Témoin historique / secondaire");
assert.equal(humanSourceStatus("INTERNAL_ENUM", "en"), "Documented provenance");

assert.equal(
  canonicalAppVersion({ AO_RELEASE_AUTHORITY_V4359: { version: "43.59.30" } }),
  "43.59.30",
  "About must use the canonical app release, not the Settings component version",
);
assert.equal(
  canonicalAppVersion({ document: { documentElement: { dataset: { aoRelease: "43.59.31" } } } }),
  "43.59.31",
);
assert.equal(canonicalAppVersion({}), null);

console.log("PASS D3-D6 non-Mass convergence contract");
