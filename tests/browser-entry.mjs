import assert from "node:assert/strict";
import {
  mapLegacyFollowMode,
  mapInsertedRites,
  deriveHostOptions,
} from "../src/mass/browser-entry.js";

assert.equal(mapLegacyFollowMode("missal"), "MISSAL");
assert.equal(mapLegacyFollowMode("read"), "MISSAL");
assert.equal(mapLegacyFollowMode("simple"), "SIMPLE");
assert.equal(mapLegacyFollowMode("vox"), "LIVE");
assert.equal(mapLegacyFollowMode(undefined), "LIVE");

const rites = mapInsertedRites([
  "asperges",
  "corpus procession",
  "requiem absolution",
  "rogation procession",
]);
assert.deepEqual([...rites.precedingRites], ["ASPERGES", "ROGATIONS"]);
assert.deepEqual(
  [...rites.followingActions],
  ["CORPUS_CHRISTI_PROCESSION", "REQUIEM_ABSOLUTION", "GENERIC_PROCESSION"],
);

const options = deriveHostOptions({
  resolvedMass: { insertedRites: ["ash"] },
  assemblyStatus: { ok: true, proper: { id: "P" } },
  arch: { celebrationForm: "low", followMode: "missal" },
  runtimeState: { settings: { localMassProfile: "LOCAL" } },
});
assert.equal(options.proper.id, "P");
assert.equal(options.celebrationForm, "low");
assert.equal(options.presentationMode, "MISSAL");
assert.deepEqual([...options.precedingRites], ["ASH"]);
assert.equal(options.localProfile, "LOCAL");

assert.throws(
  () => deriveHostOptions({
    resolvedMass: {},
    assemblyStatus: { ok: false, reason: "blocked" },
  }),
  /blocked/,
);

console.log("browser-entry contract: PASS");
