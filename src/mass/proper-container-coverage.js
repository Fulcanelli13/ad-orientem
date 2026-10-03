// Replacement for legacy QA.016 Proper-completeness coverage.
// Required Proper containers are declared by the resolved fixture/profile.
// The audit never assumes that a fixed Mass response belongs inside a Proper payload.

export const PROPER_CONTAINER_OWNERSHIP = Object.freeze({
  EPISTLE_OR_LESSON: Object.freeze({
    blockId: "AO.SM.B020",
    properCueId: "AO.SM.C0075",
    fixedAfterCues: Object.freeze(["AO.SM.C0076"]),
  }),
  GOSPEL: Object.freeze({
    blockId: "AO.SM.B026",
    properCueId: "AO.SM.C0086",
    fixedAfterCues: Object.freeze(["AO.SM.C0087", "AO.SM.C0088"]),
  }),
});

function nonBlank(value) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every(nonBlank);
  if (typeof value === "object") {
    if (typeof value.payloadRef === "string" && value.payloadRef.trim()) return true;
    if (typeof value.textLat === "string" && value.textLat.trim()) return true;
    if (typeof value.bodyLat === "string" && value.bodyLat.trim()) return true;
    if (typeof value.sourcePath === "string" && value.sourcePath.trim()) return true;
    return Object.values(value).some(nonBlank);
  }
  return false;
}

function resolveContainer(manifest, id) {
  const slots = manifest?.slots ?? {};
  const orations = manifest?.orations ?? {};
  switch (id) {
    case "INTROIT": return slots.introit ?? manifest?.introit;
    case "COLLECT_SET": return orations.collectSet;
    case "EPISTLE_OR_LESSON": return slots.epistleOrLesson ?? manifest?.epistleOrLesson;
    case "PRE_GOSPEL_SEQUENCE":
      return manifest?.preGospelSequence ?? manifest?.interlectionSequence ?? slots.preGospelSequence;
    case "GOSPEL": return slots.gospel ?? manifest?.gospel;
    case "OFFERTORY": return slots.offertory ?? manifest?.offertory;
    case "SECRET_SET": return orations.secretSet;
    case "PREFACE": return slots.preface ?? manifest?.preface;
    case "COMMUNION": return slots.communion ?? manifest?.communion;
    case "POSTCOMMUNION_SET": return orations.postcommunionSet;
    case "PRAYER_OVER_PEOPLE": return orations.prayerOverPeople;
    case "CANON_PACKAGE": return manifest?.canonPackage ?? manifest?.canonProperInserts;
    default: return slots[id] ?? manifest?.containers?.[id];
  }
}

export function auditProperContainerCoverage(manifest, requiredContainers = []) {
  if (!manifest || typeof manifest !== "object") throw new TypeError("Proper manifest object required");
  if (!Array.isArray(requiredContainers)) throw new TypeError("requiredContainers must be an array");

  const seen = new Set();
  const results = requiredContainers.map((raw) => {
    const id = String(raw).toUpperCase();
    if (seen.has(id)) {
      return Object.freeze({ id, pass: false, reason: "DUPLICATE_REQUIREMENT" });
    }
    seen.add(id);
    const value = resolveContainer(manifest, id);
    return Object.freeze({
      id,
      pass: nonBlank(value),
      reason: nonBlank(value) ? null : "MISSING_OR_BLANK",
    });
  });

  const failed = results.filter((x) => !x.pass);
  return Object.freeze({
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    pass: results.length > 0 && failed.length === 0,
    results: Object.freeze(results),
  });
}

export function assertProperContainerCoverage(manifest, requiredContainers = []) {
  const result = auditProperContainerCoverage(manifest, requiredContainers);
  if (!result.pass) {
    throw new Error(
      "Proper container coverage failed: " +
      result.results.filter((x) => !x.pass).map((x) => x.id + ":" + x.reason).join(" | ")
    );
  }
  return result;
}

export function assertProperCueOwnership(containerId, properCueId, fixedCueIds = []) {
  const spec = PROPER_CONTAINER_OWNERSHIP[containerId];
  if (!spec) throw new Error("No pinned ownership contract for " + containerId);
  if (properCueId !== spec.properCueId) throw new Error(containerId + " Proper cue ownership changed");
  const actual = [...fixedCueIds];
  if (actual.length !== spec.fixedAfterCues.length ||
      actual.some((x, i) => x !== spec.fixedAfterCues[i])) {
    throw new Error(containerId + " fixed follow-up cue ownership changed");
  }
  return spec;
}
