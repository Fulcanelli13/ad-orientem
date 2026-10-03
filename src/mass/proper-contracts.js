import { assertProperContainerCoverage } from "./proper-container-coverage.js";
import { assertProductionSourceProvenance } from "./source-provenance.js";

// Source-reconciliation contracts for Proper Resolver 2.0.
// These contracts describe completeness and ordering; they do not contain liturgical text.

export const ORATION_CONCLUSION_TYPES = Object.freeze([
  "PER_DOMINUM",
  "PER_EUNDEM_DOMINUM",
  "QUI_TECUM",
  "QUI_VIVIS",
  "PER_CHRISTUM",
  "OTHER_EXPLICIT",
]);

export const INTERLECTION_NODE_TYPES = Object.freeze([
  "ORATION",
  "LESSON",
  "GRADUAL",
  "TRACT",
  "ALLELUIA",
  "SEQUENCE",
  "OTHER_CHANT",
]);

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(label + " is required");
  return value;
}

function freezeArray(value) {
  return Object.freeze([...(value ?? [])]);
}

export function assertResolvedOration(oration, label = "oration") {
  if (!oration || typeof oration !== "object") throw new TypeError(label + " must be an object");
  requiredString(oration.id, label + ".id");
  requiredString(oration.bodyLat, label + ".bodyLat");
  if (!ORATION_CONCLUSION_TYPES.includes(oration.conclusionType)) {
    throw new Error(label + ".conclusionType is unsupported: " + oration.conclusionType);
  }
  requiredString(oration.conclusionLat, label + ".conclusionLat");
  requiredString(oration.sourceRef, label + ".sourceRef");
  if (/\.\.\.|…/.test(oration.conclusionLat)) {
    throw new Error(label + ".conclusionLat must be complete, not abbreviated");
  }
  return Object.freeze({ ...oration });
}

export function assertCanonInsert(insert, label) {
  if (insert == null) return null;
  if (typeof insert !== "object") throw new TypeError(label + " must be an object");
  requiredString(insert.variantId, label + ".variantId");
  requiredString(insert.textLat, label + ".textLat");
  requiredString(insert.sourceRef, label + ".sourceRef");
  return Object.freeze({ ...insert });
}

export function assertInterlectionSequence(sequence, { required = false } = {}) {
  if (sequence == null) {
    if (required) throw new Error("interlectionSequence is required but unresolved");
    return Object.freeze([]);
  }
  if (!Array.isArray(sequence)) throw new TypeError("interlectionSequence must be an array");
  if (required && sequence.length === 0) throw new Error("interlectionSequence is required but empty");

  return Object.freeze(sequence.map((node, index) => {
    if (!node || typeof node !== "object") throw new TypeError("interlectionSequence[" + index + "] must be an object");
    requiredString(node.id, "interlectionSequence[" + index + "].id");
    const type = String(node.type ?? "").toUpperCase();
    if (!INTERLECTION_NODE_TYPES.includes(type)) {
      throw new Error("interlectionSequence[" + index + "].type is unsupported: " + node.type);
    }
    requiredString(node.sourceRef, "interlectionSequence[" + index + "].sourceRef");
    if (node.payloadRef == null && node.textLat == null) {
      throw new Error("interlectionSequence[" + index + "] requires payloadRef or textLat");
    }
    return Object.freeze({ ...node, type });
  }));
}

export function validateProperManifestV2(manifest) {
  const errors = [];
  const checks = [];

  function check(id, fn) {
    try {
      const value = fn();
      checks.push(Object.freeze({ id, pass: true }));
      return value;
    } catch (error) {
      checks.push(Object.freeze({ id, pass: false, error: error.message }));
      errors.push(id + ": " + error.message);
      return null;
    }
  }

  if (!manifest || typeof manifest !== "object") {
    return Object.freeze({ pass: false, checks: Object.freeze([]), errors: Object.freeze(["Proper manifest object required"]) });
  }
  if (manifest.schema !== "ao-proper-manifest-v2") {
    return Object.freeze({ pass: false, checks: Object.freeze([]), errors: Object.freeze(["schema must be ao-proper-manifest-v2"]) });
  }

  const requirements = manifest.requirements ?? {};
  const orations = manifest.orations ?? {};

  check("SOURCE_PROVENANCE", () => assertProductionSourceProvenance(manifest));

  for (const [setName, values] of Object.entries({
    collectSet: orations.collectSet ?? [],
    secretSet: orations.secretSet ?? [],
    postcommunionSet: orations.postcommunionSet ?? [],
    prayerOverPeople: orations.prayerOverPeople ? [orations.prayerOverPeople] : [],
  })) {
    check("ORATIONS_" + setName.toUpperCase(), () => freezeArray(values).map((x, i) => assertResolvedOration(x, setName + "[" + i + "]")));
  }

  const canon = manifest.canonPackage ?? manifest.canonProperInserts ?? {};
  check("CANON_COMMUNICANTES", () => {
    const value = assertCanonInsert(canon.communicantes ?? null, "canonPackage.communicantes");
    if (requirements.communicantes === true && !value) throw new Error("required Communicantes variant is unresolved");
    return value;
  });
  check("CANON_HANC_IGITUR", () => {
    const value = assertCanonInsert(canon.hancIgitur ?? null, "canonPackage.hancIgitur");
    if (requirements.hancIgitur === true && !value) throw new Error("required Hanc igitur variant is unresolved");
    return value;
  });
  check("CANON_QUI_PRIDIE", () => {
    const value = assertCanonInsert(canon.quiPridie ?? null, "canonPackage.quiPridie");
    if (requirements.quiPridie === true && !value) throw new Error("required Qui pridie variant is unresolved");
    return value;
  });

  const preGospelSequence = manifest.preGospelSequence ?? manifest.interlectionSequence;
  const preGospelRequired =
    requirements.preGospelSequence === true || requirements.interlectionSequence === true;
  check("PRE_GOSPEL_SEQUENCE", () =>
    assertInterlectionSequence(preGospelSequence, { required: preGospelRequired })
  );

  check("PROPER_CONTAINER_COVERAGE", () => {
    const requiredContainers = requirements.requiredContainers ?? [];
    if (!Array.isArray(requiredContainers)) throw new TypeError("requirements.requiredContainers must be an array");
    if (requiredContainers.length === 0) return null;
    return assertProperContainerCoverage(manifest, requiredContainers);
  });

  check("CROSS_PARITY", () => {
    const status = String(manifest.crossParityStatus ?? "PENDING").toUpperCase();
    if (!["PASS", "PENDING", "NOT_APPLICABLE"].includes(status)) throw new Error("invalid crossParityStatus");
    if (requirements.crossParity === true && status !== "PASS") throw new Error("cross parity is required but not PASS");
    return status;
  });

  return Object.freeze({
    pass: errors.length === 0,
    checks: Object.freeze(checks),
    errors: Object.freeze(errors),
  });
}

export function assertProperManifestV2(manifest) {
  const result = validateProperManifestV2(manifest);
  if (!result.pass) throw new Error("Proper Resolver 2.0 gate failed: " + result.errors.join(" | "));
  return manifest;
}
