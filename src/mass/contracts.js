// Wave 1 / B003 — pure Mass runtime contracts.
// No renderer, DOM, storage, calendar or devotional ownership is permitted here.

export const MC_ID = /^MC-[A-Z0-9-]+$/;

export const CERTIFIED_FORMS = Object.freeze(["LOW", "SOLEMN"]);

export const GATED_FORMS = Object.freeze({
  MISSA_CANTATA: "RG-003",
  REQUIEM: "RG-004",
});

export const FORM_SCOPE_STATUS = Object.freeze([
  "CERTIFIED",
  "NOT_APPLICABLE",
  "SUPPRESSED_HISTORICAL",
  "UNAVAILABLE_OVERLAY",
  "UNAVAILABLE_UNCERTIFIED",
  "UNAVAILABLE_RESEARCH_GATED",
  "UNAVAILABLE_UNMAPPED",
]);

export function assertMCEvent(event) {
  if (!event || typeof event !== "object") throw new TypeError("MCEvent must be an object");
  if (!MC_ID.test(event.id || "")) throw new Error("Invalid canonical runtime id: " + event.id);
  if (!Array.isArray(event.sourceMomentRefs) || event.sourceMomentRefs.length === 0) {
    throw new Error(event.id + ": sourceMomentRefs must be non-empty");
  }
  if (event.sourceMomentRefs.some((id) => !/^E(?:0[1-9]|[1-6][0-9]|7[01])$/.test(id))) {
    throw new Error(event.id + ": invalid SOT source moment");
  }
  if (!event.actor || typeof event.actor !== "string") {
    throw new Error(event.id + ": actor scope must be explicit");
  }
  if (!event.forms?.LOW || !event.forms?.SOLEMN) {
    throw new Error(event.id + ": LOW/SOLEMN form scope required");
  }
  if (Object.prototype.hasOwnProperty.call(event, "bell")) {
    throw new Error(event.id + ": bell boolean is prohibited");
  }
  return event;
}

export function isAvailableForForm(event, form) {
  assertMCEvent(event);
  return event.forms?.[form] === "CERTIFIED";
}

export function projectMCEvents(events, projector) {
  if (!Array.isArray(events)) throw new TypeError("Canonical MC event array required");
  if (typeof projector !== "function") throw new TypeError("Projection function required");
  return events.map(assertMCEvent).flatMap((event) => {
    const projected = projector(event);
    if (projected == null) return [];
    return Array.isArray(projected) ? projected : [projected];
  });
}

// Participation is deliberately sparse. A minister action is never copied to the faithful.
export function participationKey(eventId, profileId = "BASE") {
  if (!MC_ID.test(eventId)) throw new Error("Invalid MC event id: " + eventId);
  return eventId + "::" + profileId;
}
