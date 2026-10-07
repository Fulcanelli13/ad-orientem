import fs from "node:fs";
import assert from "node:assert/strict";
import {
  CUSTOMS_ATLAS_SCHEMA,
  auditAttestation,
  auditCustom,
  auditNegativeKnowledge,
  assertCustomsAtlasRegistry,
} from "../src/find/customs-contracts.js";

function readJson(relative) {
  return JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), "utf8"));
}

const contract = readJson("../data/customs/customs-contract.v1.json");
const atlas = readJson("../data/customs/customs-atlas-seed.v1.json");
const sourceRegistry = readJson("../data/customs/source-registry.v1.json");
const negative = readJson("../data/customs/negative-knowledge.v1.json");
const geography = readJson("../data/geography/seed-registry.v1.json");

assert.equal(contract.schema, CUSTOMS_ATLAS_SCHEMA);
assert.equal(contract.version, "1.0.0");
assert.ok(contract.invariants.some(value => /proximity/i.test(value)));
assert.ok(contract.invariants.some(value => /HOLD and REJECT/i.test(value)));
assert.ok(contract.invariants.some(value => /Calendar owns date computation/i.test(value)));

for (const custom of atlas.customs) {
  assert.equal(auditCustom(custom).length, 0, custom.custom_id);
}
for (const attestation of atlas.attestations) {
  assert.equal(auditAttestation(attestation).length, 0, attestation.attestation_id);
}
for (const entry of negative.entries) {
  assert.equal(auditNegativeKnowledge(entry).length, 0, entry.custom_id);
}

assert.equal(atlas.customs.length, 13);
assert.equal(atlas.attestations.length, 15);
assert.equal(negative.entries.length, 7);

const result = assertCustomsAtlasRegistry({
  customs: atlas.customs,
  attestations: atlas.attestations,
  sources: sourceRegistry.sources,
  negativeKnowledge: negative.entries,
  geoAreas: geography.geoAreas,
  places: geography.places,
});
assert.equal(result.pass, true);
assert.deepEqual(result.counts, {
  customs: 13,
  attestations: 15,
  sources: 20,
  negativeKnowledge: 7,
});
assert.deepEqual(
  [...result.mapCandidates].sort(),
  ["att:DEV-009:LAGHET", "att:DEV-010:LOURDES"],
);

const laghet = atlas.attestations.find(item => item.attestation_id === "att:DEV-009:LAGHET");
assert.equal(laghet.map_policy, "PLACE_PENDING");
assert.equal(laghet.place_id, null);
assert.equal(laghet.place_name_hint, "Sanctuaire Notre-Dame de Laghet");

const lourdes = atlas.attestations.find(item => item.attestation_id === "att:DEV-010:LOURDES");
assert.equal(lourdes.map_policy, "PLACE_PENDING");
assert.equal(lourdes.place_id, null);

const universalPilgrimage = atlas.attestations.find(item => item.attestation_id === "att:DEV-006:WORLD");
assert.equal(universalPilgrimage.map_policy, "NOT_MAPPED");

const rejectedId = new Set(negative.entries.map(item => item.custom_id));
for (const custom of atlas.customs) {
  assert.equal(rejectedId.has(custom.custom_id), false, `${custom.custom_id} leaked from negative knowledge`);
}

const activeRejected = structuredClone(atlas.customs[0]);
activeRejected.custom_id = "BAD-REJECT";
activeRejected.decision = "REJECT — test";
assert.ok(auditCustom(activeRejected).some(item => item.code === "NEGATIVE_FINDING_IN_ACTIVE_CUSTOMS"));

const badPending = structuredClone(laghet);
badPending.place_name_hint = null;
assert.ok(auditAttestation(badPending).some(item => item.code === "PLACE_PENDING_REQUIRES_HINT"));

const secondaryOnlyPlace = structuredClone(laghet);
secondaryOnlyPlace.attestation_id = "att:TEST:SECONDARY";
secondaryOnlyPlace.custom_id = "FOOD-001";
secondaryOnlyPlace.source_ids = ["PAIN-BENIT"];
assert.throws(
  () => assertCustomsAtlasRegistry({
    customs: atlas.customs,
    attestations: [...atlas.attestations, secondaryOnlyPlace],
    sources: sourceRegistry.sources,
    negativeKnowledge: negative.entries,
    geoAreas: geography.geoAreas,
    places: geography.places,
  }),
  error => error?.issues?.some(item => item.code === "MAP_CLAIM_LACKS_DIRECT_EVIDENCE"),
);

const negativeNotBlocked = structuredClone(negative.entries[0]);
negativeNotBlocked.map_blocked = false;
assert.ok(auditNegativeKnowledge(negativeNotBlocked).some(item => item.code === "NEGATIVE_NOT_MAP_BLOCKED"));

console.log("customs atlas source-of-truth and attestation registry: PASS");
