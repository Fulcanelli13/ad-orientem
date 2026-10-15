// Research-to-presentation bridge for supplementary saints. No Mass/Proper authority.
// The production 1962 resolver remains sole owner of principal day/rank/colour.
export const LIVING_SANCTORAL_VERSION = "ao-living-sanctoral-projection-v1";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isDate = value => DATE.test(String(value || "")) && !Number.isNaN(Date.parse(String(value) + "T12:00:00Z"));
const monthDay = date => String(date).slice(5);
const normalizeResolverId = value => String(value || "").replace(/:[1-4]:[a-z]{1,3}$/i, "");
const samePrincipal = (a, b) => Boolean(a && b && normalizeResolverId(a) === normalizeResolverId(b));
const personLabel = (person, language) => person?.name?.[language === "fr" ? "fr" : "en"] || person?.name?.en || "";

export function saintRecognitionAt(person, date) {
  if (!isDate(date)) throw new TypeError("Expected valid ISO date");
  const r = person?.recognition || {};
  const canonized = r.rank === "SAINT" && (!r.canonizedOn || r.canonizedOn <= date);
  const doctor = canonized && Boolean(r.doctorDeclaredOn && r.doctorDeclaredOn <= date);
  return Object.freeze({
    canonicalPersonId: person?.id ?? null,
    recognizedAsSaint: canonized,
    doctorOfChurch: doctor,
    doctorTitle: doctor ? (r.doctorTitle || "Doctor of the Church") : null,
  });
}

// Only explicit, sourced General-Calendar entries qualify. Optional traditional
// Mass eligibility is NOT calculated or inferred from these records.
export function supplementarySaintsForDate(date, persons, {
  language = "en",
  observedPrincipalId = null,
  includeOlderCalendarAssociations = false,
} = {}) {
  if (!isDate(date)) throw new TypeError("Expected valid ISO date");
  if (!Array.isArray(persons)) throw new TypeError("Expected saints registry array");
  const result = [];
  const seen = new Set();
  for (const person of persons) {
    if (!person?.id || seen.has(person.id)) continue;
    if (person.publicationHold) continue; // Independent identity adjudication required.
    const recognition = saintRecognitionAt(person, date);
    if (!recognition.recognizedAsSaint) continue;
    for (const observance of person.observances || []) {
      if (observance?.monthDay !== monthDay(date)) continue;
      const current = observance.calendar === "CURRENT_ROMAN_GENERAL";
      const older = observance.calendar === "1962_GENERAL" && includeOlderCalendarAssociations;
      if (!current && !older) continue;
      if (!Array.isArray(observance.sourceIds) || !observance.sourceIds.length) continue;
      if (observance.publishedOn && observance.publishedOn > date) continue;
      if (person.calendar1962?.principalId && samePrincipal(person.calendar1962.principalId, observedPrincipalId)) continue;
      result.push(Object.freeze({
        personId: person.id,
        title: personLabel(person, language),
        modernCalendarKind: current ? observance.kind : null,
        sourceIds: Object.freeze([...observance.sourceIds]),
        doctorOfChurch: recognition.doctorOfChurch,
        doctorTitle: recognition.doctorTitle,
        status: "CONTEXTUAL_SAINT_NOT_MASS_SELECTION",
        changesPrincipalDay: false,
        optional1962MassStatus: "NOT_EVALUATED",
      }));
      seen.add(person.id);
      break;
    }
  }
  return Object.freeze(result);
}
