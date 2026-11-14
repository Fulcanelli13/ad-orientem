// Divine Office Phase A: shared Calendar facts, NOT a second ordo.
import { buildLiturgicalYear, addDaysIso, dateFromIso, isoDate } from "../calendar/liturgical-year.js";

export const ROMAN_OFFICE_HOURS = Object.freeze([
  "MATINS", "LAUDS", "PRIME", "TERCE", "SEXT", "NONE", "VESPERS", "COMPLINE",
]);
export const ROMAN_OFFICE_EDITION = "ROMAN_1960";

function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    isoDate(dateFromIso(value)) === value;
}

function canonicalCalendarFacts(date, calendarResolution) {
  if (!validDate(date)) throw new Error("OFFICE_DATE_INVALID");
  if (calendarResolution?.date !== date) throw new Error("OFFICE_CALENDAR_DATE_MISMATCH");
  if (String(calendarResolution?.status ?? "").toLowerCase() !== "ready" ||
      !calendarResolution?.day?.main) throw new Error("OFFICE_CALENDAR_NOT_READY");
  const main = calendarResolution.day.main;
  return Object.freeze({
    date,
    principalCelebrationId: main.id ?? null,
    principalTitle: main.title ?? main.name ?? null,
    massCalendarRank: main.rank ?? null,
    // The Mass's principal celebration is context, not an Office precedence verdict.
    officePrecedenceResolved: false,
  });
}

export function makeOfficeSourceRequest({date, hour, calendarResolution} = {}) {
  const normalizedHour = String(hour ?? "").toUpperCase();
  if (!ROMAN_OFFICE_HOURS.includes(normalizedHour)) throw new Error("OFFICE_HOUR_INVALID");
  return Object.freeze({
    schema: "ao.divine-office.source-request.v1",
    edition: ROMAN_OFFICE_EDITION,
    date,
    hour: normalizedHour,
    calendar: canonicalCalendarFacts(date, calendarResolution),
    status: "OFFICE_COMPOSITION_PENDING",
    requiresIndependentOfficeDecision: true,
    // In particular: First/Second Vespers, concurrence and commemorations.
    requestedLanguages: Object.freeze(["la", "en", "fr"]),
  });
}

export function tenebraeDayIndex(date) {
  if (!validDate(date)) throw new Error("OFFICE_DATE_INVALID");
  const easter = buildLiturgicalYear(date).easter;
  for (let i = 0; i < 3; i++) {
    if (date === addDaysIso(easter, -3 + i)) return i;
  }
  throw new Error("OFFICE_NOT_HOLY_WEEK_TENEBRAE_DATE");
}

/**
 * An adapter over the EXISTING source-owned Tenebrae compiler. It does not
 * duplicate Tenebrae text, calculate a general Office, or fetch anything.
 * Actual Office proper precedence on other days still needs an Office engine.
 */
export function adaptExistingTenebraeHour({date, calendarResolution, tenebrae} = {}) {
  const hour = String(tenebrae?.hour ?? "").toUpperCase();
  if (!["MATINS", "LAUDS"].includes(hour)) throw new Error("OFFICE_TENEBRAE_HOUR_UNSUPPORTED");
  const request = makeOfficeSourceRequest({date, hour, calendarResolution});
  if (tenebraeDayIndex(date) !== tenebrae?.dayIndex) throw new Error("OFFICE_TENEBRAE_DAY_MISMATCH");
  if (tenebrae?.schema !== "ao.tenebrae.1960.hour-reader.v1" ||
      tenebrae?.mode !== "RUBRICS_1960_MATINS_LAUDS" ||
      tenebrae?.textsCompleteForSourceDerivedReading !== true ||
      !String(tenebrae?.sourceRevision ?? "").trim()) throw new Error("OFFICE_TENEBRAE_SOURCE_NOT_READY");
  const expectedCount = hour === "MATINS" ? 32 : 10;
  if (!Array.isArray(tenebrae.steps) || tenebrae.steps.length !== expectedCount)
    throw new Error("OFFICE_TENEBRAE_STEPS_INCOMPLETE");
  const ids = new Set();
  const sections = tenebrae.steps.map((step, index) => {
    const id = String(step?.id ?? "").trim();
    const kind = String(step?.kind ?? "").trim();
    if (!id || !kind || ids.has(id)) throw new Error("OFFICE_TENEBRAE_SECTION_INVALID:" + index);
    ids.add(id);
    const text = {};
    for (const locale of ["la", "en", "fr"]) {
      const value = String((locale === "la" ? step?.latin : step?.[locale]) ?? "").trim();
      if (!value || /(^|\n)\s*[$@&]/.test(value)) throw new Error("OFFICE_TENEBRAE_UNRESOLVED_TEXT:" + id + ":" + locale);
      text[locale] = value;
    }
    return Object.freeze({id, kind, text: Object.freeze(text), metadata: step.metadata ?? null});
  });
  return Object.freeze({
    schema: "ao.divine-office.hour.v1",
    date,
    hour,
    edition: ROMAN_OFFICE_EDITION,
    kind: "HOLY_WEEK_TENEBRAE",
    status: "READY",
    calendar: request.calendar,
    sections: Object.freeze(sections),
    provenance: Object.freeze({
      owner: "src/pray/tenebrae-1960.js",
      upstream: "DivinumOfficium/divinum-officium",
      sourceRevision: tenebrae.sourceRevision,
      attribution: tenebrae.attribution ?? null,
      independentlyPrintedEditionCertified: tenebrae.printEditionCriticallyCertified === true,
    }),
  });
}
