// G1 Ordinary parity contracts.
// Typography is evidence, not executable ritual logic. This module compares sourced
// text markers and boundaries; it never creates gesture/posture events.

function arrayOfInts(value, label) {
  if (!Array.isArray(value)) throw new TypeError(label + " must be an array");
  return Object.freeze(value.map((x, i) => {
    if (!Number.isInteger(x) || x < 0) throw new Error(label + "[" + i + "] must be a non-negative integer");
    return x;
  }));
}

function sameArray(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function compareParityEntry(entry) {
  if (!entry || typeof entry !== "object") throw new TypeError("Parity entry required");
  if (!entry.blockId) throw new Error("blockId required");
  if (!entry.cueId) throw new Error("cueId required");

  const canonicalCrossPositions = arrayOfInts(entry.canonicalCrossPositions ?? [], "canonicalCrossPositions");
  const referenceCrossPositions = arrayOfInts(entry.referenceCrossPositions ?? [], "referenceCrossPositions");
  const canonicalBoundaries = Object.freeze([...(entry.canonicalSectionBoundaries ?? [])]);
  const referenceBoundaries = Object.freeze([...(entry.referenceSectionBoundaries ?? [])]);

  const crossCountPass = canonicalCrossPositions.length === referenceCrossPositions.length;
  const crossPositionPass = sameArray(canonicalCrossPositions, referenceCrossPositions);
  const sectionBoundaryPass =
    canonicalBoundaries.length === referenceBoundaries.length &&
    canonicalBoundaries.every((value, index) => value === referenceBoundaries[index]);

  const unexplained = [...(entry.unexplainedDiscrepancies ?? [])];
  const pass = crossCountPass && crossPositionPass && sectionBoundaryPass && unexplained.length === 0;

  return Object.freeze({
    blockId: entry.blockId,
    cueId: entry.cueId,
    pass,
    crossCountPass,
    crossPositionPass,
    sectionBoundaryPass,
    unexplainedDiscrepancies: Object.freeze(unexplained),
  });
}

export function auditOrdinaryParity(entries) {
  if (!Array.isArray(entries)) throw new TypeError("Parity entries array required");
  const results = Object.freeze(entries.map(compareParityEntry));
  const failed = results.filter((x) => !x.pass);
  return Object.freeze({
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    pass: results.length > 0 && failed.length === 0,
    results,
  });
}
