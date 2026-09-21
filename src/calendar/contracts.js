// Wave 1 / B004 — pure Calendar + Proper data contracts.
// This module owns no DOM, theme, navigation or source fetching.

export const DAY_STATUS = Object.freeze({
  READY: "READY",
  FAILED: "FAILED",
});

export const PROPER_STATUS = Object.freeze({
  READY: "READY",
  CACHED: "CACHED",
  UNAVAILABLE: "UNAVAILABLE",
  FAILED: "FAILED",
});

function isoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function makeLiturgicalDay(input) {
  if (!input || !isoDate(input.date)) throw new TypeError("LiturgicalDay.date must be YYYY-MM-DD");
  if (![DAY_STATUS.READY, DAY_STATUS.FAILED].includes(input.status)) {
    throw new Error("LiturgicalDay.status must be READY or FAILED");
  }

  return Object.freeze({
    date: input.date,
    status: input.status,
    season: input.season ?? null,
    celebrations: Array.isArray(input.celebrations) ? input.celebrations : [],
    rank: input.rank ?? null,
    colour: input.colour ?? null,
    commemorations: Array.isArray(input.commemorations) ? input.commemorations : [],
    candidateFormularies: Array.isArray(input.candidateFormularies) ? input.candidateFormularies : [],
    selectedFormularyId: input.selectedFormularyId ?? null,
    provenance: input.provenance ?? null,
  });
}

export function makeProper(input) {
  if (!input || !isoDate(input.date)) throw new TypeError("Proper.date must be YYYY-MM-DD");
  if (!Object.values(PROPER_STATUS).includes(input.status)) throw new Error("Unknown Proper.status");

  if ([PROPER_STATUS.READY, PROPER_STATUS.CACHED].includes(input.status)) {
    if (!input.formularyId) throw new Error("Available Proper requires formularyId");
    if (!input.sourceWitness) throw new Error("Available Proper requires sourceWitness");
  }

  return Object.freeze({
    date: input.date,
    formularyId: input.formularyId ?? null,
    sourceWitness: input.sourceWitness ?? null,
    status: input.status,
    orderedSections: Array.isArray(input.orderedSections) ? input.orderedSections : [],
    appointedReadings: Array.isArray(input.appointedReadings) ? input.appointedReadings : [],
    textsByLanguage: input.textsByLanguage ?? {},
    commemorations: Array.isArray(input.commemorations) ? input.commemorations : [],
    provenance: input.provenance ?? null,
    failureReason: input.failureReason ?? null,
  });
}

export function makeUnavailableProper({ date, formularyId = null, reason, provenance = null }) {
  if (!reason) throw new Error("Unavailable Proper requires an explicit reason");
  return makeProper({
    date,
    formularyId,
    status: PROPER_STATUS.UNAVAILABLE,
    sourceWitness: null,
    failureReason: reason,
    provenance,
  });
}

// resolveDay() may succeed while Proper retrieval fails. UI must consume these independently.
export function makeResolvedDayState({ day, proper }) {
  const liturgicalDay = makeLiturgicalDay(day);
  const resolvedProper = proper ? makeProper(proper) : null;
  if (resolvedProper && resolvedProper.date !== liturgicalDay.date) {
    throw new Error("LiturgicalDay and Proper dates must match");
  }
  return Object.freeze({ day: liturgicalDay, proper: resolvedProper });
}

// Missing Proper is not permission to manufacture a Feria or reuse stale text.
export function mayRenderProper(proper) {
  return Boolean(proper && [PROPER_STATUS.READY, PROPER_STATUS.CACHED].includes(proper.status));
}
