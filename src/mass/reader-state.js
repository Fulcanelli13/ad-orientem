// R17 reader convergence contract.
// Pure state resolution only: no DOM, no icon SVG, no canonical Mass mutation.

export const READER_MODES = Object.freeze(["MISSAL", "SIMPLE", "LIVE"]);
export const POSTURE_PROFILES = Object.freeze([
  "FOLLOW_CONGREGATION",
  "MY_LOCAL",
  "OCONNELL_1962_COMMUNITY",
  "TRADITIONAL_WALSH",
]);
export const GESTURE_PROFILES = Object.freeze(["ESSENTIAL", "GUIDED_1962", "TRADITIONAL"]);

export const HARDENED_CROSS_CUES = Object.freeze([
  "AO.SM.C0068","AO.SM.C0104","AO.SM.C0119","AO.SM.C0152","AO.SM.C0164",
  "AO.SM.C0165","AO.SM.C0166","AO.SM.C0171","AO.SM.C0177","AO.SM.C0184",
  "AO.SM.C0185","AO.SM.C0189","AO.SM.C0200","AO.SM.C0202","AO.SM.C0203",
]);

export function resolveReaderPreferences(input = {}) {
  const mode = String(input.mode ?? "LIVE").toUpperCase();
  if (!READER_MODES.includes(mode)) throw new Error("Unknown reader mode: " + mode);

  const postureProfile = String(input.postureProfile ?? "FOLLOW_CONGREGATION").toUpperCase();
  if (!POSTURE_PROFILES.includes(postureProfile)) throw new Error("Unknown posture profile: " + postureProfile);

  const gestureProfile = String(input.gestureProfile ?? "GUIDED_1962").toUpperCase();
  if (!GESTURE_PROFILES.includes(gestureProfile)) throw new Error("Unknown gesture profile: " + gestureProfile);

  return Object.freeze({
    mode,
    postureProfile,
    gestureProfile,
    language: input.language ?? "vernacular",
    localPostures: Object.freeze({ ...(input.localPostures ?? {}) }),
  });
}

export function resolvePosture({ sourcedPosture, localOverride, preferences }) {
  if (!preferences) throw new TypeError("Reader preferences required");

  // Fixed sourced ritual actions/postures outrank local guidance profiles.
  if (sourcedPosture?.fixed === true) return Object.freeze({ ...sourcedPosture, owner: "SOURCED_FIXED" });

  if (preferences.postureProfile === "MY_LOCAL") {
    if (localOverride) return Object.freeze({ value: localOverride, owner: "LOCAL_OVERRIDE" });
    return Object.freeze({ value: null, owner: "LOCAL_FAIL_CLOSED" });
  }

  if (preferences.postureProfile === "FOLLOW_CONGREGATION") {
    return Object.freeze({ value: null, owner: "FOLLOW_CONGREGATION" });
  }

  return Object.freeze({
    value: sourcedPosture?.value ?? null,
    owner: sourcedPosture?.value ? preferences.postureProfile : "PROFILE_FAIL_CLOSED",
  });
}

export function resolveMomentState(moment = {}) {
  const gesture = moment.gesture ?? null;
  const posture = moment.posture ?? null;

  // v1.78 hard guard: Incarnatus is a transient genuflection, not persistent kneeling.
  if (moment.semantic === "INCARNATUS" || moment.id === "INCARNATUS") {
    return Object.freeze({
      posture: posture?.value === "KNEEL" ? null : posture,
      gesture: Object.freeze({ type: "GENUFLECT", transient: true }),
      stateOwner: "INCARNATUS_GENUFLECT",
    });
  }

  return Object.freeze({
    posture,
    gesture: gesture ? Object.freeze({ ...gesture, transient: gesture.transient !== false }) : null,
    stateOwner: "NORMAL",
  });
}

export function makeGuideState({ rubric = null, registryAvailable = false } = {}) {
  if (!registryAvailable && rubric) throw new Error("Guide rubric supplied without verified registry");
  return Object.freeze({
    buttonVisible: true,
    registryRequiredEntries: 32,
    registryAvailable,
    rubric: registryAvailable ? rubric : null,
    failClosed: !registryAvailable,
  });
}

export function dialogueLanguagePolicy(kind) {
  const normalized = String(kind ?? "").toUpperCase();
  if (["VERSICLE", "RESPONSE", "CONGREGATIONAL_DIALOGUE"].includes(normalized)) {
    return Object.freeze({
      primary: "LATIN",
      vernacular: "UNDER_EACH_LINE",
      replaceOnToggle: false,
    });
  }
  return Object.freeze({
    primary: "VERNACULAR",
    latin: "REPLACE_ON_TOGGLE",
    replaceOnToggle: true,
  });
}
