// R13 — role-specific practice projection.
// Practice consumes canonical events and never creates alternate ceremonial identity.

export const PRACTICE_MODES = Object.freeze([
  "LEARN",
  "REHEARSE",
  "CUE_DRILL",
  "LIVE_ASSIST_READ_ONLY",
]);

const ROLE_TOKENS = Object.freeze({
  SERVER: ["SERVER", "SERVERS", "LITURGICAL_RESPONDERS"],
  MC: ["MC", "MASTER_OF_CEREMONIES", "SERVERS"],
  THURIFER: ["THURIFER"],
  ACOLYTE: ["ACOLYTE", "ACOLYTES"],
  TORCHBEARER: ["TORCHBEARER", "TORCHBEARERS"],
  DEACON: ["DEACON"],
  SUBDEACON: ["SUBDEACON"],
  SCHOLA: ["SCHOLA"],
  FAITHFUL: ["FAITHFUL"],
});

function normalizeRole(role) {
  const value = String(role ?? "").toUpperCase();
  if (!ROLE_TOKENS[value]) throw new Error("Unsupported practice role: " + role);
  return value;
}

function normalizeMode(mode) {
  const value = String(mode ?? "LEARN").toUpperCase();
  if (!PRACTICE_MODES.includes(value)) throw new Error("Unsupported practice mode: " + mode);
  return value;
}

function actorMatches(actor, tokens) {
  const value = String(actor ?? "").toUpperCase();
  return tokens.some((token) => value.includes(token));
}

export function projectPractice(events, { role, mode = "LEARN" } = {}) {
  if (!Array.isArray(events)) throw new TypeError("Canonical event array required");
  const normalizedRole = normalizeRole(role);
  const normalizedMode = normalizeMode(mode);
  const tokens = ROLE_TOKENS[normalizedRole];

  const projected = events
    .filter((event) => event && event.id && actorMatches(event.actor, tokens))
    .map((event) => Object.freeze({
      canonicalEventId: event.id,
      order: event.order ?? null,
      phase: event.phase ?? null,
      title: event.title ?? null,
      actor: event.actor,
      position: event.position ?? null,
      voice: event.voice ?? null,
      conditions: Object.freeze([...(event.conditions ?? [])]),
      sourceMomentRefs: Object.freeze([...(event.sourceMomentRefs ?? [])]),
    }));

  return Object.freeze({
    schema: "ao-practice-projection-v1",
    mode: normalizedMode,
    role: normalizedRole,
    readOnly: normalizedMode === "LIVE_ASSIST_READ_ONLY",
    createsCanonicalIdentity: false,
    events: Object.freeze(projected),
  });
}

export function assertPracticeProjection(projection, sourceEvents) {
  if (projection?.createsCanonicalIdentity !== false) throw new Error("Practice may not create canonical identity");
  const sourceIds = new Set((sourceEvents ?? []).map((event) => event.id));
  for (const event of projection?.events ?? []) {
    if (!sourceIds.has(event.canonicalEventId)) {
      throw new Error("Practice projection invented event: " + event.canonicalEventId);
    }
  }
  return true;
}
