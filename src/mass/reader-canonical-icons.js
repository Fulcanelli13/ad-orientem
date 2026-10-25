// Canonical Mass icon resolver (21 Oct 2026 set).
// One asset per meaning. The priest's POSITION (where he stands, which way he
// faces), ACTION (what his hands, body or the sacred vessels do) and VOICE are
// three independent lanes, each resolved from its own source state at the cue.
// Exact tables only: no keyword or filename inference. A meaning without
// approved art resolves to null and the source text stays visible.
import { CANONICAL_ICON_SET as SET, CANONICAL_ICON_ASSETS } from "./reader-canonical-icon-set.js";
import { GLORIA_CREDO_FAITHFUL_GESTURES } from "./faithful-gesture-cues.js";

export { CANONICAL_ICON_ASSETS };
export const CANONICAL_KEY_PREFIX = "canon:";
const WITH_ART = new Set(SET.meanings.filter(m => m.path).map(m => m.meaningId));
const SUNG_FORMS = new Set(["MISSA_CANTATA_SIMPLE", "MISSA_CANTATA_INCENSE", "SOLEMN"]);
const ULTRA_CHANT = new Set(SET.ultraMasterPriestChantCues);
const SCHOLA_OWNED = new Set(SET.scholaOwnedNotPriestChantCues);
const SOLEMN_MINISTER_READING = new Set(SET.solemnMinisterReadingCues);
const normVoice = v => String(v ?? "").trim().toUpperCase().replace(/_/g, " ").replace(/\s+/g, " ");
const VOICE_CLASS = new Map(Object.entries(SET.voiceMap).flatMap(([cls, list]) => list.map(v => [normVoice(v), cls])));

const token = v => String(v ?? "").trim().toUpperCase().replace(/[ -]+/g, "_");
const faithfulMeaningForType = kind => {
  const type = token(kind);
  // An exceptional sung Incarnatus or exact saved local instruction can
  // legitimately be KNEEL rather than GENUFLECT. The faithful lane has an
  // approved kneeling *posture* asset, not a separate kneel-gesture asset.
  if (type === "KNEEL") return "faithful.posture.kneel";
  return SET.faithfulGestureMap.byType[type] ?? null;
};
const isMeaning = v => typeof v === "string" && /^(priest|minister|faithful|response|schola|bell|marker|rite)\./.test(v);

/** Icon key for a meaning, or null when the meaning has no approved art. */
export function canonicalKey(meaningId) {
  return isMeaning(meaningId) && WITH_ART.has(meaningId) ? CANONICAL_KEY_PREFIX + meaningId : null;
}

function cueOf(obj, state) { return String(obj?.cueId ?? state?.cueId ?? ""); }
function formOf(state) {
  const f = token(state?.form ?? state?.celebrationForm);
  if (f) return f;
  // Missal-mode callers pass bare source objects; the Low engine tags its own.
  for (const o of [state?.priestAction, state?.priestPosition, state?.priestVoice]) if (String(o?.owner ?? "").startsWith("R18_LOW")) return "LOW";
  return "";
}

export function postureMeaning(posture) {
  return SET.postureMap[token(posture?.value ?? posture?.label)] ?? null;
}

// A source cue family, not a clock. This projection applies only to the
// two fixed Ordinary prayer spans; no substring scans or invented cues.
function isGloriaCredoCue(id) {
  const hit = String(id ?? "").match(/^AO\.SM\.C(\d{4})$/);
  if (!hit) return false;
  const n = Number(hit[1]);
  return n >= 53 && n <= 69 || n >= 89 && n <= 105;
}

export function gestureMeaning(gesture, state = {}) {
  if (!gesture) return null;
  const cue = cueOf(gesture, state);
  // The canonical 65-card LIVE reader follows exact Latin phrase IDs.
  // Its older donor/crosswalk repeats Gloria/Credo "instant" bows on
  // neighbouring Schola paragraphs (e.g. C0055, C0057, C0060).
  // Only the independent, profile-aware faithful cue projector owns the
  // standard action; an exact-cue *saved local* choice remains valid.
  // Do not confuse these faithful cues with the priest's private recital.
  if (state.curated65FinalArt === true && isGloriaCredoCue(state.cueId)) {
    const focused = String(state.cueId);
    if (cue !== focused) return null;
    if (gesture.owner === "LOCAL_FAITHFUL_CUSTOM") {
      if (gesture.canonicalCueId !== focused) return null;
      return faithfulMeaningForType(gesture.type ?? gesture.value);
    }
    const spec = GLORIA_CREDO_FAITHFUL_GESTURES[focused];
    if (!spec || !["R17_PROFILE_CUE","R17_RUBRICAL_CUE"].includes(gesture.owner) ||
        gesture.canonicalCueId !== focused) return null;
    const expected = spec.action === "INCARNATUS_RESOLVER"
      ? ["GENUFLECT","KNEEL"] : [spec.action];
    if (!expected.includes(token(gesture.type ?? gesture.value))) return null;
  }
  if (SET.faithfulGestureMap.byCue[cue]) return SET.faithfulGestureMap.byCue[cue];
  if (gesture.owner === "GESTURE_MATRIX_SOT") {
    // A matrix row with no icon key is held back on purpose (local custom varies).
    return gesture.iconKey ? SET.faithfulGestureMap.byMatrixIconKey[gesture.iconKey] ?? null : null;
  }
  return faithfulMeaningForType(gesture.type ?? gesture.value);
}

export function positionMeaning(position) {
  if (!position) return null;
  const station = token(position.station ?? position.value);
  const facing = token(position.facing);
  const map = SET.stationMap;
  if (Object.prototype.hasOwnProperty.call(map, station + "|" + facing)) return map[station + "|" + facing];
  return Object.prototype.hasOwnProperty.call(map, station) ? map[station] : null;
}

/** Action meaning, or a non-icon reason (POSITION_TRANSITION, NO_ACTION_LISTENS, ...). */
export function actionMeaning(action, state = {}) {
  if (!action) return null;
  const cue = cueOf(action, state);
  const label = String(action.label ?? action.action ?? action.value ?? "").trim();
  if (formOf(state) === "LOW" || String(action.owner ?? "").startsWith("R18_LOW")) return SET.lowActionByCue[cue] ?? null;
  if (action.owner !== "R18_SOLEMN_R04_OVERRIDE" && SET.actionCueOverrides[cue]) return SET.actionCueOverrides[cue];
  return SET.actionLabelMap[label] ?? SET.actionLabelMap[label.toUpperCase()] ?? null;
}

const voiceText = v => normVoice(v?.value ?? v?.label ?? v?.voice);

// Sung moments owned by the celebrant that the sparse voice registry omits
// (Ultra Master audit, 21 Oct): Chant even without a voice event at the cue.
function ultraChant(cue, form) {
  return SUNG_FORMS.has(form) && ULTRA_CHANT.has(cue) && !(form === "SOLEMN" && SOLEMN_MINISTER_READING.has(cue));
}

export function voiceMeaning(voice, state = {}) {
  const form = formOf(state);
  if (ultraChant(String(state?.cueId ?? voice?.cueId ?? ""), form)) return "priest.voice.chant";
  if (!voice) return null;
  const cue = cueOf(voice, state);
  const sung = SUNG_FORMS.has(form);
  if (SCHOLA_OWNED.has(cue)) return null;
  if (sung && form === "SOLEMN" && SOLEMN_MINISTER_READING.has(cue) && /SUNG/.test(voiceText(voice))) return null;
  let cls = SET.voiceCueOverrides[cue] ?? VOICE_CLASS.get(voiceText(voice));
  if (cls === "chant" && !sung) cls = "aloud";
  return { chant: "priest.voice.chant", aloud: "priest.voice.aloud", low: "priest.voice.low", silent: "priest.voice.silent" }[cls] ?? null;
}

/** Every lane's meaning for a reader state (null = nothing to show). */
export function canonicalMeaningsForReaderState(state = {}) {
  // Curated LIVE: a priest voice is event-scoped and never carries into a later cue.
  const curatedVoiceScoped = state.curated65FinalArt === true && state.priestVoice && cueOf(state.priestVoice, state) !== String(state.cueId ?? "")
    && !ultraChant(String(state.cueId ?? ""), formOf(state));
  return Object.freeze({
    posture: postureMeaning(state.posture),
    gesture: gestureMeaning(state.gesture, state),
    response: state.response ? SET.otherLanes.response : null,
    priestVoice: curatedVoiceScoped ? null : voiceMeaning(state.priestVoice, state),
    schola: state.schola ? SET.otherLanes.schola : null,
    priestPosition: positionMeaning(state.priestPosition),
    priestAction: actionMeaning(state.priestAction, state),
    bell: state.bell ? SET.otherLanes.bell : null,
  });
}

export function canonicalIconKeysForReaderState(state = {}) {
  const m = canonicalMeaningsForReaderState(state);
  return Object.freeze({
    postureIconKey: canonicalKey(m.posture),
    gestureIconKey: canonicalKey(m.gesture),
    responseIconKey: canonicalKey(m.response),
    priestVoiceIconKey: canonicalKey(m.priestVoice),
    scholaIconKey: canonicalKey(m.schola),
    priestPositionIconKey: canonicalKey(m.priestPosition),
    priestActionIconKey: canonicalKey(m.priestAction),
    bellIconKey: canonicalKey(m.bell),
  });
}
