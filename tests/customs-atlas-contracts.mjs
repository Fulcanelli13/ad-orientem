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
assert.equal(atlas.attestations.length, 21);
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
  attestations: 21,
  sources: 25,
  negativeKnowledge: 7,
});
assert.deepEqual(
  [...result.mapCandidates].sort(),
  ["att:DEV-009:LAGHET", "att:DEV-010:LOURDES", "att:DOM-006:PARAY", "att:DOM-007:PARAY", "att:DEV-007:SAINTE-ANNE-D-AURAY", "att:DEV-009:ALTOETTING", "att:DEV-010:MARIAZELL", "att:DEV-007:EINSIEDELN-ENGELWEIHE"].sort(),
);

const laghet = atlas.attestations.find(item => item.attestation_id === "att:DEV-009:LAGHET");
assert.equal(laghet.map_policy, "PLACE");
assert.equal(laghet.place_id, "place:FR:sanctuaire-notre-dame-de-laghet");
assert.equal(laghet.place_name_hint, null);

const lourdes = atlas.attestations.find(item => item.attestation_id === "att:DEV-010:LOURDES");
assert.equal(lourdes.map_policy, "PLACE");
assert.equal(lourdes.place_id, "place:FR:sanctuaire-notre-dame-de-lourdes");

const sainteAnne = atlas.attestations.find(item => item.attestation_id === "att:DEV-007:SAINTE-ANNE-D-AURAY");
assert.equal(sainteAnne.map_policy,"PLACE");
assert.equal(sainteAnne.place_id,"place:FR:sainte-anne-d-auray");

const altoetting=atlas.attestations.find(item=>item.attestation_id==="att:DEV-009:ALTOETTING");
assert.equal(altoetting.place_id,"place:DE:altoetting-gnadenkapelle");
const mariazell=atlas.attestations.find(item=>item.attestation_id==="att:DEV-010:MARIAZELL");
assert.equal(mariazell.place_id,"place:AT:mariazell-basilica");
const einsiedeln=atlas.attestations.find(item=>item.attestation_id==="att:DEV-007:EINSIEDELN-ENGELWEIHE");
assert.equal(einsiedeln.place_id,"place:CH:einsiedeln-monastery");

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
badPending.map_policy = "PLACE_PENDING";
badPending.place_id = null;
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
