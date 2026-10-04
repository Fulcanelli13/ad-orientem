import {
  dialogueLanguagePolicy,
  makeGuideState,
  resolveMomentState,
  resolvePosture,
} from "./reader-state.js";

function textValue(value) {
  if (value == null) return null;
  return String(value);
}

function normalizeLine(line = {}) {
  const kind = String(line.kind ?? "TEXT").toUpperCase();
  const policy = dialogueLanguagePolicy(kind);
  return Object.freeze({
    id: line.id ?? null,
    kind,
    lat: textValue(line.lat),
    vernacular: textValue(line.vernacular ?? line.en ?? line.fr),
    policy,
    response: line.response === true || kind === "RESPONSE",
  });
}

export function buildReaderFrameModel({
  moment = {},
  preferences,
  localPostureOverride = null,
  guideRegistryAvailable = false,
  guideRubric = null,
} = {}) {
  if (!preferences) throw new TypeError("Reader preferences required");

  const owned = resolveMomentState(moment);
  const posture = resolvePosture({
    sourcedPosture: owned.posture,
    localOverride: localPostureOverride,
    preferences,
  });
  const guide = makeGuideState({
    rubric: guideRubric,
    registryAvailable: guideRegistryAvailable,
  });

  return Object.freeze({
    id: moment.id ?? null,
    section: textValue(moment.section ?? moment.title ?? ""),
    title: textValue(moment.title ?? moment.section ?? ""),
    mode: preferences.mode,
    language: preferences.language,
    lines: Object.freeze((moment.lines ?? []).map(normalizeLine)),
    leftRail: Object.freeze({
      posture,
      gesture: owned.gesture ?? null,
      respond: moment.respond ?? null,
    }),
    rightRail: Object.freeze({
      priestVoice: moment.priestVoice ?? null,
      schola: moment.schola ?? null,
    }),
    topState: Object.freeze({
      priestPosition: moment.priestPosition ?? null,
      currentSection: textValue(moment.section ?? moment.title ?? ""),
      guide,
    }),
    ownership: owned.stateOwner,
    cinematic: moment.cinematic ?? null,
  });
}
