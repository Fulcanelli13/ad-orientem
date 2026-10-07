export const CUSTOMS_ATLAS_SCHEMA = "CUSTOMS_ATLAS_SOT_V1";

export const CUSTOM_CLASSES = Object.freeze([
  "CURRENT_NORM",
  "1962_DISCIPLINE",
  "TRADITIONAL_ROMAN_PRACTICE",
  "TRADITIONAL_CATHOLIC_PRACTICE",
  "FRENCH_CATHOLIC_CUSTOM",
  "LOCAL_REGIONAL_CUSTOM",
  "DEVOTIONAL_OPTION",
  "HISTORICAL_ONLY",
  "FORMATION",
  "GOVERNANCE",
]);

export const PUBLICATION_STATES = Object.freeze([
  "PUBLISHED",
  "CONTEXT_ONLY",
  "SOURCE_LOCK_REQUIRED",
]);

export const ATTESTATION_STRENGTH = Object.freeze(["STRONG", "MODERATE", "WEAK"]);
export const CONFIDENCE = Object.freeze(["HIGH", "MEDIUM_HIGH", "MEDIUM", "LOW"]);
export const GEOGRAPHIC_PRECISION = Object.freeze([
  "GLOBAL",
  "CULTURAL_SPHERE",
  "COUNTRY",
  "REGION",
  "LOCALITY",
  "PLACE",
  "ROUTE",
  "UNKNOWN",
]);
export const MAP_POLICIES = Object.freeze([
  "NOT_MAPPED",
  "AREA_CONTEXT",
  "PLACE_PENDING",
  "PLACE",
  "ROUTE",
]);
export const SOURCE_DIRECTNESS = Object.freeze([
  "OFFICIAL_CURRENT",
  "PRIMARY_HISTORICAL",
  "DIRECT_INSTITUTIONAL",
  "DIRECT_TRANSCRIPTION",
  "SECONDARY",
  "BIBLIOGRAPHIC_ONLY",
  "PROJECT_EVIDENCE",
]);
export const NEGATIVE_DECISIONS = Object.freeze(["HOLD", "REJECT"]);

const customClassSet = new Set(CUSTOM_CLASSES);
const publicationSet = new Set(PUBLICATION_STATES);
const strengthSet = new Set(ATTESTATION_STRENGTH);
const confidenceSet = new Set(CONFIDENCE);
const precisionSet = new Set(GEOGRAPHIC_PRECISION);
const mapPolicySet = new Set(MAP_POLICIES);
const directnessSet = new Set(SOURCE_DIRECTNESS);
const negativeDecisionSet = new Set(NEGATIVE_DECISIONS);
const directMapEvidence = new Set([
  "OFFICIAL_CURRENT",
  "PRIMARY_HISTORICAL",
  "DIRECT_INSTITUTIONAL",
  "DIRECT_TRANSCRIPTION",
]);

function issue(code, path, message) {
  return Object.freeze({ code, path, message });
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonEmptyArray(value) {
  return Array.isArray(value) && value.filter(nonEmpty).length > 0;
}

export function auditCustom(custom, path = "custom") {
  const issues = [];
  if (!custom || typeof custom !== "object") {
    return [issue("CUSTOM_REQUIRED", path, "Custom must be an object.")];
  }

  for (const [field, code] of [
    ["custom_id", "MISSING_CUSTOM_ID"],
    ["family", "MISSING_CUSTOM_FAMILY"],
    ["name", "MISSING_CUSTOM_NAME"],
    ["canonical_statement", "MISSING_CUSTOM_STATEMENT"],
    ["decision", "MISSING_CUSTOM_DECISION"],
  ]) {
    if (!nonEmpty(custom[field])) {
      issues.push(issue(code, `${path}.${field}`, `${field} is required.`));
    }
  }

  if (!customClassSet.has(custom.custom_class)) {
    issues.push(issue("INVALID_CUSTOM_CLASS", `${path}.custom_class`, `Unsupported custom class: ${custom.custom_class}`));
  }
  if (!publicationSet.has(custom.publication_state)) {
    issues.push(issue("INVALID_PUBLICATION_STATE", `${path}.publication_state`, `Unsupported publication state: ${custom.publication_state}`));
  }
  if (!confidenceSet.has(custom.confidence)) {
    issues.push(issue("INVALID_CUSTOM_CONFIDENCE", `${path}.confidence`, `Unsupported confidence: ${custom.confidence}`));
  }
  if (!Array.isArray(custom.owners) || custom.owners.length === 0) {
    issues.push(issue("MISSING_CUSTOM_OWNERS", `${path}.owners`, "At least one presentation owner is required."));
  }

  if (/\bHOLD\b|\bREJECT\b/i.test(custom.decision ?? "")) {
    issues.push(issue(
      "NEGATIVE_FINDING_IN_ACTIVE_CUSTOMS",
      `${path}.decision`,
      "HOLD/REJECT findings belong in negative knowledge, not active customs.",
    ));
  }

  return issues;
}

export function auditSource(source, path = "source") {
  const issues = [];
  if (!source || typeof source !== "object") {
    return [issue("CUSTOM_SOURCE_REQUIRED", path, "Source must be an object.")];
  }
  for (const [field, code] of [
    ["id", "MISSING_SOURCE_ID"],
    ["title", "MISSING_SOURCE_TITLE"],
    ["authority_role", "MISSING_SOURCE_ROLE"],
  ]) {
    if (!nonEmpty(source[field])) {
      issues.push(issue(code, `${path}.${field}`, `${field} is required.`));
    }
  }
  if (!directnessSet.has(source.directness)) {
    issues.push(issue("INVALID_SOURCE_DIRECTNESS", `${path}.directness`, `Unsupported source directness: ${source.directness}`));
  }
  return issues;
}

export function auditAttestation(attestation, path = "attestation") {
  const issues = [];
  if (!attestation || typeof attestation !== "object") {
    return [issue("ATTESTATION_REQUIRED", path, "Attestation must be an object.")];
  }

  for (const [field, code] of [
    ["attestation_id", "MISSING_ATTESTATION_ID"],
    ["custom_id", "MISSING_ATTESTATION_CUSTOM_ID"],
    ["period_label", "MISSING_ATTESTATION_PERIOD"],
  ]) {
    if (!nonEmpty(attestation[field])) {
      issues.push(issue(code, `${path}.${field}`, `${field} is required.`));
    }
  }

  if (!nonEmpty(attestation.geo_area_id) && !nonEmpty(attestation.place_id)) {
    issues.push(issue("MISSING_ATTESTATION_GEOGRAPHY", path, "Attestation requires geo_area_id, place_id, or both."));
  }
  if (!precisionSet.has(attestation.geographic_precision)) {
    issues.push(issue("INVALID_GEOGRAPHIC_PRECISION", `${path}.geographic_precision`, `Unsupported precision: ${attestation.geographic_precision}`));
  }
  if (!strengthSet.has(attestation.strength)) {
    issues.push(issue("INVALID_ATTESTATION_STRENGTH", `${path}.strength`, `Unsupported strength: ${attestation.strength}`));
  }
  if (!confidenceSet.has(attestation.confidence)) {
    issues.push(issue("INVALID_ATTESTATION_CONFIDENCE", `${path}.confidence`, `Unsupported confidence: ${attestation.confidence}`));
  }
  if (!mapPolicySet.has(attestation.map_policy)) {
    issues.push(issue("INVALID_MAP_POLICY", `${path}.map_policy`, `Unsupported map policy: ${attestation.map_policy}`));
  }
  if (!nonEmptyArray(attestation.source_ids)) {
    issues.push(issue("MISSING_ATTESTATION_PROVENANCE", `${path}.source_ids`, "Attestation requires at least one source id."));
  }

  if (attestation.map_policy === "AREA_CONTEXT" && !nonEmpty(attestation.geo_area_id)) {
    issues.push(issue("AREA_CONTEXT_REQUIRES_AREA", path, "AREA_CONTEXT requires geo_area_id."));
  }
  if (attestation.map_policy === "PLACE_PENDING") {
    if (!nonEmpty(attestation.place_name_hint)) {
      issues.push(issue("PLACE_PENDING_REQUIRES_HINT", `${path}.place_name_hint`, "PLACE_PENDING requires place_name_hint."));
    }
    if (nonEmpty(attestation.place_id)) {
      issues.push(issue("PLACE_PENDING_HAS_CANONICAL_PLACE", `${path}.place_id`, "PLACE_PENDING must be promoted to PLACE once place_id exists."));
    }
  }
  if (attestation.map_policy === "PLACE" && !nonEmpty(attestation.place_id)) {
    issues.push(issue("PLACE_POLICY_REQUIRES_PLACE", `${path}.place_id`, "PLACE map policy requires canonical place_id."));
  }
  if (attestation.map_policy === "ROUTE" && !nonEmpty(attestation.place_id)) {
    issues.push(issue("ROUTE_POLICY_REQUIRES_REFERENCE", `${path}.place_id`, "ROUTE map policy requires a canonical route/place reference."));
  }
  if (attestation.geographic_precision === "GLOBAL" && attestation.map_policy !== "NOT_MAPPED") {
    issues.push(issue("GLOBAL_ATTESTATION_MUST_NOT_MAP", path, "Global customary claims are context, not map pins."));
  }

  return issues;
}

export function auditNegativeKnowledge(entry, path = "negative_knowledge") {
  const issues = [];
  if (!entry || typeof entry !== "object") {
    return [issue("NEGATIVE_KNOWLEDGE_REQUIRED", path, "Negative-knowledge entry must be an object.")];
  }
  for (const [field, code] of [
    ["custom_id", "MISSING_NEGATIVE_CUSTOM_ID"],
    ["name", "MISSING_NEGATIVE_NAME"],
    ["reason", "MISSING_NEGATIVE_REASON"],
    ["reopen_condition", "MISSING_REOPEN_CONDITION"],
  ]) {
    if (!nonEmpty(entry[field])) {
      issues.push(issue(code, `${path}.${field}`, `${field} is required.`));
    }
  }
  if (!negativeDecisionSet.has(entry.decision)) {
    issues.push(issue("INVALID_NEGATIVE_DECISION", `${path}.decision`, `Unsupported negative decision: ${entry.decision}`));
  }
  if (!nonEmptyArray(entry.source_ids)) {
    issues.push(issue("MISSING_NEGATIVE_PROVENANCE", `${path}.source_ids`, "Negative knowledge requires source ids."));
  }
  if (entry.map_blocked !== true) {
    issues.push(issue("NEGATIVE_NOT_MAP_BLOCKED", `${path}.map_blocked`, "HOLD/REJECT findings must remain map-blocked."));
  }
  return issues;
}

export function assertCustomsAtlasRegistry({
  customs = [],
  attestations = [],
  sources = [],
  negativeKnowledge = [],
  geoAreas = [],
  places = [],
} = {}) {
  const issues = [];
  const customIds = new Set();
  const sourceIds = new Set();
  const negativeIds = new Set();
  const geoAreaIds = new Set(geoAreas.map(area => area?.geo_area_id).filter(nonEmpty));
  const placeIds = new Set(places.map(place => place?.place_id).filter(nonEmpty));

  sources.forEach((source, index) => {
    issues.push(...auditSource(source, `sources[${index}]`));
    if (nonEmpty(source?.id)) {
      if (sourceIds.has(source.id)) {
        issues.push(issue("DUPLICATE_CUSTOM_SOURCE_ID", `sources[${index}].id`, source.id));
      }
      sourceIds.add(source.id);
    }
  });

  customs.forEach((custom, index) => {
    issues.push(...auditCustom(custom, `customs[${index}]`));
    if (nonEmpty(custom?.custom_id)) {
      if (customIds.has(custom.custom_id)) {
        issues.push(issue("DUPLICATE_CUSTOM_ID", `customs[${index}].custom_id`, custom.custom_id));
      }
      customIds.add(custom.custom_id);
    }
  });

  negativeKnowledge.forEach((entry, index) => {
    issues.push(...auditNegativeKnowledge(entry, `negativeKnowledge[${index}]`));
    if (nonEmpty(entry?.custom_id)) {
      if (negativeIds.has(entry.custom_id)) {
        issues.push(issue("DUPLICATE_NEGATIVE_CUSTOM_ID", `negativeKnowledge[${index}].custom_id`, entry.custom_id));
      }
      negativeIds.add(entry.custom_id);
      if (customIds.has(entry.custom_id)) {
        issues.push(issue("ACTIVE_NEGATIVE_COLLISION", `negativeKnowledge[${index}].custom_id`, entry.custom_id));
      }
    }
    for (const sourceId of entry?.source_ids ?? []) {
      if (nonEmpty(sourceId) && !sourceIds.has(sourceId)) {
        issues.push(issue("UNKNOWN_NEGATIVE_SOURCE", `negativeKnowledge[${index}].source_ids`, sourceId));
      }
    }
  });

  const attestationIds = new Set();
  const attestationCountByCustom = new Map();

  attestations.forEach((attestation, index) => {
    const path = `attestations[${index}]`;
    issues.push(...auditAttestation(attestation, path));

    if (nonEmpty(attestation?.attestation_id)) {
      if (attestationIds.has(attestation.attestation_id)) {
        issues.push(issue("DUPLICATE_ATTESTATION_ID", `${path}.attestation_id`, attestation.attestation_id));
      }
      attestationIds.add(attestation.attestation_id);
    }

    if (nonEmpty(attestation?.custom_id)) {
      if (!customIds.has(attestation.custom_id)) {
        issues.push(issue("UNKNOWN_ATTESTATION_CUSTOM", `${path}.custom_id`, attestation.custom_id));
      }
      attestationCountByCustom.set(attestation.custom_id, (attestationCountByCustom.get(attestation.custom_id) ?? 0) + 1);
    }

    if (nonEmpty(attestation?.geo_area_id) && !geoAreaIds.has(attestation.geo_area_id)) {
      issues.push(issue("UNKNOWN_ATTESTATION_GEO_AREA", `${path}.geo_area_id`, attestation.geo_area_id));
    }
    if (nonEmpty(attestation?.place_id) && !placeIds.has(attestation.place_id)) {
      issues.push(issue("UNKNOWN_ATTESTATION_PLACE", `${path}.place_id`, attestation.place_id));
    }

    const attestationSources = [];
    for (const sourceId of attestation?.source_ids ?? []) {
      if (!nonEmpty(sourceId)) continue;
      if (!sourceIds.has(sourceId)) {
        issues.push(issue("UNKNOWN_ATTESTATION_SOURCE", `${path}.source_ids`, sourceId));
      } else {
        const source = sources.find(item => item.id === sourceId);
        if (source) attestationSources.push(source);
      }
    }

    if (["PLACE", "ROUTE", "PLACE_PENDING"].includes(attestation?.map_policy)) {
      if (!attestationSources.some(source => directMapEvidence.has(source.directness))) {
        issues.push(issue(
          "MAP_CLAIM_LACKS_DIRECT_EVIDENCE",
          path,
          "Place/route map claims require at least one direct or official geographically specific source.",
        ));
      }
    }
  });

  for (const customId of customIds) {
    if ((attestationCountByCustom.get(customId) ?? 0) === 0) {
      issues.push(issue("CUSTOM_WITHOUT_ATTESTATION", "customs", customId));
    }
  }

  if (issues.length) {
    const error = new Error(issues.map(entry => `${entry.code} @ ${entry.path}: ${entry.message}`).join("\n"));
    error.issues = issues;
    throw error;
  }

  return Object.freeze({
    pass: true,
    counts: Object.freeze({
      customs: customs.length,
      attestations: attestations.length,
      sources: sources.length,
      negativeKnowledge: negativeKnowledge.length,
    }),
    mapCandidates: Object.freeze(
      attestations
        .filter(item => ["PLACE", "ROUTE", "PLACE_PENDING"].includes(item.map_policy))
        .map(item => item.attestation_id),
    ),
  });
}
