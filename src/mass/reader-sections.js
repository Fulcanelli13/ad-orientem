export function createReaderSectionResolver(sectionMap) {
  if (!sectionMap || typeof sectionMap !== "object") {
    throw new TypeError("Reader section map object required");
  }
  if (sectionMap.contract !== "AO_MASS_READER_V2_SECTION_MAP") {
    throw new Error("Unexpected reader section map contract");
  }
  if (sectionMap.authority !== "DISPLAY_GROUPING_ONLY") {
    throw new Error("Reader section map must remain DISPLAY_GROUPING_ONLY");
  }
  if (!Array.isArray(sectionMap.ordinarySungSections) || sectionMap.ordinarySungSections.length === 0) {
    throw new Error("Reader section map contains no ordinary sections");
  }

  const sections = [];
  const byId = new Map();
  const byEvent = new Map();
  const sequences = new Set();

  for (const raw of sectionMap.ordinarySungSections) {
    if (!raw || typeof raw !== "object") throw new TypeError("Invalid reader section");
    const sectionId = String(raw.sectionId ?? "");
    const sequence = Number(raw.sequence);
    if (!/^AO\.CARD\.\d{3}$/.test(sectionId)) throw new Error("Invalid reader section id: " + sectionId);
    if (!Number.isInteger(sequence) || sequence < 1) throw new Error(sectionId + ": invalid sequence");
    if (byId.has(sectionId)) throw new Error("Duplicate reader section id: " + sectionId);
    if (sequences.has(sequence)) throw new Error("Duplicate reader section sequence: " + sequence);
    if (raw.canonicalAuthority !== false) {
      throw new Error(sectionId + ": display section may not claim canonical authority");
    }
    if (!Array.isArray(raw.eventIds) || raw.eventIds.length === 0) {
      throw new Error(sectionId + ": eventIds required");
    }

    const eventIds = [];
    for (const value of raw.eventIds) {
      const eventId = String(value);
      if (!/^MC-[A-Z0-9-]+$/.test(eventId)) {
        throw new Error(sectionId + ": invalid canonical event reference " + eventId);
      }
      if (byEvent.has(eventId)) {
        throw new Error("Canonical event is mapped to more than one reader section: " + eventId);
      }
      eventIds.push(eventId);
    }

    const section = Object.freeze({
      sectionId,
      sequence,
      part: raw.part == null ? null : String(raw.part),
      name: String(raw.name ?? sectionId),
      rubricKey: raw.rubricKey == null ? null : String(raw.rubricKey),
      visibility: String(raw.visibility ?? "ANY_ACTIVE_EVENT"),
      entryEventId: String(raw.entryEventId ?? eventIds[0]),
      exitEventId: String(raw.exitEventId ?? eventIds[eventIds.length - 1]),
      eventIds: Object.freeze(eventIds),
      phases: Object.freeze([...(raw.phases ?? [])].map(String)),
      canonicalAuthority: false,
    });

    if (!eventIds.includes(section.entryEventId) || !eventIds.includes(section.exitEventId)) {
      throw new Error(sectionId + ": entry/exit event must belong to the section");
    }

    byId.set(sectionId, section);
    sequences.add(sequence);
    sections.push(section);
    for (const eventId of eventIds) byEvent.set(eventId, section);
  }

  sections.sort((a,b) => a.sequence - b.sequence);
  for (let i=0;i<sections.length;i++) {
    if (sections[i].sequence !== i + 1) {
      throw new Error("Reader section sequence must be contiguous from 1");
    }
  }

  const frozenSections = Object.freeze(sections);

  function sectionForEvent(eventId) {
    const canonicalEventId = String(eventId ?? "");
    const section = byEvent.get(canonicalEventId) ?? null;
    if (!section) return null;
    return Object.freeze({
      canonicalEventId,
      section,
      progress: Object.freeze({
        current: section.sequence,
        total: frozenSections.length,
        label: section.sequence + " / " + frozenSections.length,
      }),
    });
  }

  function sectionById(sectionId) {
    return byId.get(String(sectionId ?? "")) ?? null;
  }

  return Object.freeze({
    contract: sectionMap.contract,
    version: String(sectionMap.version ?? ""),
    authority: sectionMap.authority,
    sections: frozenSections,
    sectionForEvent,
    sectionById,
    total: frozenSections.length,
  });
}
