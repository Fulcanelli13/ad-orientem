export const DIRECTORY_SCHEMA = "DIRECTORY_SOT_V1";

export const COMMUNION_VALUES = Object.freeze([
  "YES",
  "NO",
  "VARIES_BY_CELEBRANT",
  "VARIES_BY_OCCASION",
  "DISPUTED",
  "UNKNOWN",
]);

export const POSITION_FAMILIES = Object.freeze([
  "ROMAN_PONTIFF_RECOGNISED",
  "SEDEVACANTIST",
  "SEDEPRIVATIONIST",
  "OTHER_POSITION",
  "UNKNOWN",
]);

export const VERIFICATION_STATES = Object.freeze([
  "OFFICIAL_LIVE",
  "OFFICIAL_VERIFIED",
  "RECENTLY_VERIFIED",
  "NEEDS_RECHECK",
  "CONFLICT",
  "UNVERIFIED",
  "CLOSED_OR_SUSPENDED",
  "ARCHIVED",
]);

const communionSet = new Set(COMMUNION_VALUES);
const positionSet = new Set(POSITION_FAMILIES);
const verificationSet = new Set(VERIFICATION_STATES);

function issue(code, path, message) {
  return Object.freeze({ code, path, message });
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function evidenceIds(record) {
  const ids = record?.evidence_source_ids ?? record?.evidenceSourceIds ?? [];
  return Array.isArray(ids) ? ids.filter(nonEmpty) : [];
}

export function auditCommunionProfile(profile, path = "communion_profile") {
  const issues = [];
  if (!profile || typeof profile !== "object") {
    return [issue("COMMUNION_PROFILE_REQUIRED", path, "Communion profile must be an object.")];
  }

  for (const field of [
    "recognises_current_pontiff",
    "pope_named_in_canon",
    "ordinary_named_in_canon",
  ]) {
    const value = profile[field] ?? "UNKNOWN";
    if (!communionSet.has(value)) {
      issues.push(issue("INVALID_COMMUNION_VALUE", `${path}.${field}`, `Unsupported value: ${value}`));
    }
  }

  const family = profile.position_family ?? "UNKNOWN";
  if (!positionSet.has(family)) {
    issues.push(issue("INVALID_POSITION_FAMILY", `${path}.position_family`, `Unsupported value: ${family}`));
  }

  const makesContentiousClaim = [
    profile.recognises_current_pontiff,
    profile.pope_named_in_canon,
    profile.ordinary_named_in_canon,
  ].some(value => value && value !== "UNKNOWN") || (family && family !== "UNKNOWN");

  if (makesContentiousClaim && evidenceIds(profile).length === 0) {
    issues.push(issue(
      "MISSING_COMMUNION_EVIDENCE",
      path,
      "Non-UNKNOWN communion or position claims require evidence_source_ids.",
    ));
  }

  return issues;
}

export function auditStatusAssertion(assertion, path = "status_assertion") {
  const issues = [];
  if (!assertion || typeof assertion !== "object") {
    return [issue("STATUS_ASSERTION_REQUIRED", path, "Status assertion must be an object.")];
  }
  for (const field of ["authority", "statusCode", "effectiveDate", "sourceId"]) {
    if (!nonEmpty(assertion[field])) {
      issues.push(issue("MISSING_STATUS_ASSERTION_FIELD", `${path}.${field}`, `${field} is required.`));
    }
  }
  return issues;
}

export function auditVenue(venue, path = "venue") {
  const issues = [];
  if (!venue || typeof venue !== "object") {
    return [issue("VENUE_REQUIRED", path, "Venue must be an object.")];
  }
  if (!nonEmpty(venue.venue_id)) issues.push(issue("MISSING_VENUE_ID", `${path}.venue_id`, "Stable venue_id is required."));
  if (!nonEmpty(venue?.address?.country_code)) {
    issues.push(issue("MISSING_COUNTRY", `${path}.address.country_code`, "Country code is required."));
  }

  const rawLat = venue?.geo?.lat;
  const rawLng = venue?.geo?.lng;
  const lat = rawLat === null || rawLat === undefined || rawLat === "" ? NaN : Number(rawLat);
  const lng = rawLng === null || rawLng === undefined || rawLng === "" ? NaN : Number(rawLng);
  const hasGeo = Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180;
  const hasAddress = [
    venue?.address?.formatted,
    venue?.address?.line1,
    venue?.address?.city,
  ].some(nonEmpty);

  if (!hasGeo && !hasAddress) {
    issues.push(issue("MISSING_LOCATION", path, "Venue requires usable coordinates or a usable address."));
  }
  return issues;
}

export function auditSchedule(schedule, path = "schedule") {
  const issues = [];
  if (!schedule || typeof schedule !== "object") {
    return [issue("SCHEDULE_REQUIRED", path, "Schedule must be an object.")];
  }
  const sourceIds = schedule.source_ids ?? schedule.sourceIds ?? [];
  if (!Array.isArray(sourceIds) || sourceIds.filter(nonEmpty).length === 0) {
    issues.push(issue("MISSING_SCHEDULE_PROVENANCE", path, "Schedule requires at least one source id."));
  }
  return issues;
}

export function auditVerification(record, path = "verification") {
  const issues = [];
  const state = record?.state ?? "UNVERIFIED";
  if (!verificationSet.has(state)) {
    issues.push(issue("INVALID_VERIFICATION_STATE", `${path}.state`, `Unsupported verification state: ${state}`));
  }
  return issues;
}

export function assertDirectoryRecord({
  venue,
  communionProfile = null,
  schedules = [],
  statusAssertions = [],
  verification = null,
} = {}) {
  const issues = [];
  issues.push(...auditVenue(venue));
  if (communionProfile) issues.push(...auditCommunionProfile(communionProfile));
  schedules.forEach((schedule, index) => issues.push(...auditSchedule(schedule, `schedules[${index}]`)));
  statusAssertions.forEach((assertion, index) => issues.push(...auditStatusAssertion(assertion, `statusAssertions[${index}]`)));
  if (verification) issues.push(...auditVerification(verification));
  if (issues.length) {
    const error = new Error(issues.map(entry => `${entry.code} @ ${entry.path}: ${entry.message}`).join("\n"));
    error.issues = issues;
    throw error;
  }
  return Object.freeze({ pass: true, issues: [] });
}
