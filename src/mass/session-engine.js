import { validateProperManifestV2 } from "./proper-contracts.js";
import { compilePostcommunionExitDelta, assertPostcommunionExitOwnership } from "./postcommunion-exit.js";

// R17 convergence — session composition above the immutable canonical MC graph.
// This module does not own text, DOM, storage, calendar fetching, or canonical event identity.

export const MASS_FORMS = Object.freeze([
  "LOW",
  "MISSA_CANTATA_SIMPLE",
  "MISSA_CANTATA_INCENSE",
  "SOLEMN",
]);

export const PRESENTATION_MODES = Object.freeze(["MISSAL", "SIMPLE", "LIVE"]);

export const PRECEDING_RITES = Object.freeze([
  "ASPERGES",
  "PALM",
  "ASH",
  "CANDLEMAS",
  "ROGATIONS",
]);

export const FOLLOWING_ACTIONS = Object.freeze([
  "REQUIEM_ABSOLUTION",
  "HOLY_THURSDAY_POST",
  "GENERIC_PROCESSION",
  "CORPUS_CHRISTI_PROCESSION",
]);

export const DISTINCT_RITES = Object.freeze(["GOOD_FRIDAY", "EASTER_VIGIL"]);

const FORM_ALIASES = Object.freeze({
  low: "LOW",
  LOW: "LOW",
  sung: "MISSA_CANTATA_INCENSE",
  missa_cantata: "MISSA_CANTATA_INCENSE",
  "mc-simple": "MISSA_CANTATA_SIMPLE",
  MISSA_CANTATA_SIMPLE: "MISSA_CANTATA_SIMPLE",
  "mc-incense": "MISSA_CANTATA_INCENSE",
  MISSA_CANTATA_INCENSE: "MISSA_CANTATA_INCENSE",
  solemn: "SOLEMN",
  SOLEMN: "SOLEMN",
});

const PROPER_REQUIRED_TYPES = new Set(["VOTIVE", "NUPTIAL", "REQUIEM", "SPECIAL_FORMULARY"]);

export function normalizeMassForm(value) {
  const form = FORM_ALIASES[value] ?? FORM_ALIASES[String(value ?? "").toLowerCase()];
  if (!form || !MASS_FORMS.includes(form)) throw new Error("Unsupported Mass form: " + value);
  return form;
}

export function normalizePresentationMode(value = "LIVE") {
  const mode = String(value).toUpperCase();
  if (!PRESENTATION_MODES.includes(mode)) throw new Error("Unsupported presentation mode: " + value);
  return mode;
}

function isoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeCelebration(value, fallbackType = "CALENDAR") {
  if (!value) return null;
  if (typeof value === "string") return Object.freeze({ id: value, type: fallbackType });
  if (!value.id) throw new Error("Celebration requires id");
  return Object.freeze({
    id: String(value.id),
    type: String(value.type ?? fallbackType).toUpperCase(),
    title: value.title ?? null,
    source: value.source ?? null,
  });
}

// Explicit user/event selection wins over the calendar suggestion for the Mass actually celebrated.
// Calendar remains context and fallback; it is never erased.
export function resolveActualCelebration({ calendarCelebration, requestedCelebration = null }) {
  const calendar = normalizeCelebration(calendarCelebration, "CALENDAR");
  const requested = normalizeCelebration(requestedCelebration, "SPECIAL_FORMULARY");
  if (!calendar && !requested) throw new Error("A calendar or requested celebration is required");
  return Object.freeze({
    calendar,
    actual: requested ?? calendar,
    explicitlySelected: Boolean(requested),
  });
}

function properManifestV2(proper) {
  if (!proper) return null;
  if (proper.schema === "ao-proper-manifest-v2") return proper;
  if (proper.data?.schema === "ao-proper-manifest-v2") return proper.data;
  return null;
}

function properIsReady(proper) {
  if (!proper) return false;

  const manifest = properManifestV2(proper);

  if (manifest && !validateProperManifestV2(manifest).pass) return false;
  if (proper.schema === "ao-proper-manifest-v2") return true;

  return ["READY", "CACHED", "ready", "cached"].includes(proper.status);
}

function requiresProper(actual, overlays) {
  return PROPER_REQUIRED_TYPES.has(actual?.type) ||
    overlays.includes("REQUIEM") ||
    overlays.includes("NUPTIAL") ||
    overlays.includes("VOTIVE_PROPER");
}

function uniqueKnown(values, allowed, label) {
  const result = [];
  for (const raw of values ?? []) {
    const value = String(raw).toUpperCase();
    if (!allowed.includes(value)) throw new Error("Unknown " + label + ": " + raw);
    if (!result.includes(value)) result.push(value);
  }
  return Object.freeze(result);
}

export function makeResolvedMass(input = {}) {
  if (!isoDate(input.date)) throw new TypeError("ResolvedMass.date must be YYYY-MM-DD");
  const form = normalizeMassForm(input.form);
  const presentationMode = normalizePresentationMode(input.presentationMode ?? "LIVE");
  const celebration = resolveActualCelebration({
    calendarCelebration: input.calendarCelebration,
    requestedCelebration: input.requestedCelebration ?? null,
  });

  const overlays = uniqueKnown(
    input.overlays ?? [],
    ["REQUIEM", "NUPTIAL", "VOTIVE_PROPER", "EMBER_LESSONS"],
    "overlay"
  );
  const precedingRites = uniqueKnown(input.precedingRites ?? [], PRECEDING_RITES, "preceding rite");
  const followingActions = uniqueKnown(input.followingActions ?? [], FOLLOWING_ACTIONS, "following action");
  const distinctRite = input.distinctRite == null ? null : String(input.distinctRite).toUpperCase();
  if (distinctRite && !DISTINCT_RITES.includes(distinctRite)) throw new Error("Unknown distinct rite: " + distinctRite);

  // Optional rites/processions are never inferred from a feast/date alone.
  if (input.calendarImpliesCorpusProcession === true && !followingActions.includes("CORPUS_CHRISTI_PROCESSION")) {
    // Intentionally no mutation: availability is not activation.
  }

  const proper = input.proper ?? null;
  if (requiresProper(celebration.actual, overlays) && !properIsReady(proper)) {
    throw new Error("Resolved Mass requires a source-resolved Proper; fail closed");
  }

  return Object.freeze({
    schema: "ao-resolved-mass-v2",
    date: input.date,
    form,
    presentationMode,
    calendarCelebration: celebration.calendar,
    actualCelebration: celebration.actual,
    explicitlySelectedCelebration: celebration.explicitlySelected,
    proper,
    overlays,
    precedingRites,
    followingActions,
    distinctRite,
    localProfile: input.localProfile ?? null,
    provenance: input.provenance ?? null,
  });
}

export function compileMassPlan(resolvedMass) {
  if (!resolvedMass || resolvedMass.schema !== "ao-resolved-mass-v2") {
    throw new TypeError("compileMassPlan requires ao-resolved-mass-v2");
  }

  if (resolvedMass.distinctRite === "GOOD_FRIDAY") {
    return Object.freeze({
      kind: "DISTINCT_RITE",
      rite: "GOOD_FRIDAY",
      graph: "GF",
      canonicalMassGraphActive: false,
      ordinaryMassAssumptionsAllowed: false,
    });
  }

  if (resolvedMass.distinctRite === "EASTER_VIGIL") {
    return Object.freeze({
      kind: "COMPOSITE_DISTINCT_RITE",
      rite: "EASTER_VIGIL",
      graph: "EV",
      canonicalMassGraphActive: true,
      massEntry: "VIGIL_DEFINED_MASS_ENTRY",
      afterMass: "LAUDS",
      ordinaryOpeningSuppressed: true,
    });
  }

  const state = {
    kind: "MASS",
    form: resolvedMass.form,
    presentationMode: resolvedMass.presentationMode,
    massEntry: "FOOT_CLUSTER",
    dismissal: "ITE_OR_BENEDICAMUS_AS_RESOLVED",
    blessingAllowed: true,
    normalLastGospel: true,
    ordinaryPeacePrayerAllowed: true,
    formalSolemnPaxAllowed: resolvedMass.form === "SOLEMN",
    insertions: [],
    precedingGraphs: [],
    overlayGraphs: [],
    followingGraphs: [],
    objectStates: [],
  };

  for (const rite of resolvedMass.precedingRites) {
    state.precedingGraphs.push(rite);
    if (["PALM", "ASH", "CANDLEMAS", "ROGATIONS"].includes(rite)) state.massEntry = "INTROIT";
    if (rite === "CANDLEMAS") state.objectStates.push("CANDLE_STATE_OVERLAY");
    // ASPERGES specifically hands off to ordinary Mass without suppressing Prayers at the Foot.
  }

  const properManifest = properManifestV2(resolvedMass.proper);
  const prayerOverPeoplePresent = Boolean(properManifest?.orations?.prayerOverPeople);
  const postcommunionExit = assertPostcommunionExitOwnership(
    compilePostcommunionExitDelta({ prayerOverPeoplePresent })
  );
  state.postcommunionExit = postcommunionExit;
  if (prayerOverPeoplePresent) {
    state.insertions.push("PRAYER_OVER_PEOPLE_AFTER_POSTCOMMUNION_BEFORE_FINAL_DOMINUS_VOBISCUM");
  }

  for (const overlay of resolvedMass.overlays) {
    state.overlayGraphs.push(overlay);
    if (overlay === "REQUIEM") {
      state.dismissal = "REQUIESCANT_IN_PACE";
      state.blessingAllowed = false;
      state.ordinaryPeacePrayerAllowed = false;
      state.formalSolemnPaxAllowed = false;
    }
    if (overlay === "NUPTIAL") {
      state.insertions.push(
        "FIRST_NUPTIAL_BLESSING_AFTER_PATER",
        "DEUS_QUI_POTESTATE_NUPTIAL_BLESSING",
        "FINAL_BLESSING_OVER_SPOUSES"
      );
    }
    if (overlay === "EMBER_LESSONS") state.insertions.push("RESOLVED_PREPARATORY_LESSONS");
  }

  for (const action of resolvedMass.followingActions) {
    state.followingGraphs.push(action);
    if (action === "REQUIEM_ABSOLUTION") {
      if (!resolvedMass.overlays.includes("REQUIEM")) {
        throw new Error("Requiem Absolution requires the Requiem overlay");
      }
      state.normalLastGospel = false;
    }
    if (action === "CORPUS_CHRISTI_PROCESSION") {
      state.dismissal = "BENEDICAMUS_DOMINO";
      state.blessingAllowed = false;
      state.normalLastGospel = false;
    }
    if (action === "HOLY_THURSDAY_POST") {
      state.dismissal = "BENEDICAMUS_DOMINO";
      state.blessingAllowed = false;
      state.normalLastGospel = false;
      state.formalSolemnPaxAllowed = false;
    }
  }

  return Object.freeze({
    ...state,
    insertions: Object.freeze(state.insertions),
    precedingGraphs: Object.freeze(state.precedingGraphs),
    overlayGraphs: Object.freeze(state.overlayGraphs),
    followingGraphs: Object.freeze(state.followingGraphs),
    objectStates: Object.freeze(state.objectStates),
  });
}
