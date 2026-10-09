import { scriptureEditionFor, assertScriptureTextReady, scripturePassage } from "./catalogue.js";

const passageKey = p => [p.book, p.chapter, p.verseStart, p.verseEnd].join(":");

/**
 * Source manifest contains approved verse ranges, each with explicit provenance.
 * Example: {editionId, book, chapter, verseStart, verseEnd, text,
 *            sourceUrl, sourceEdition, licenceId, reviewed: true}
 * A loader never silently uses text from a different translation.
 */
export function buildScriptureStore(records) {
  if (!Array.isArray(records)) throw new TypeError("Scripture records must be an array");
  const store = new Map();
  for (const entry of records) {
    if (!entry || typeof entry !== "object") throw new TypeError("Invalid Scripture record");
    const edition = assertScriptureTextReady(entry.editionId);
    const location = scripturePassage(entry);
    if (edition.id !== entry.editionId ||
      !entry.reviewed || typeof entry.text !== "string" || !entry.text.trim() ||
      !entry.sourceUrl || !entry.sourceEdition || !entry.licenceId) {
      throw new Error("Scripture source is not certified");
    }
    const key = entry.editionId + "|" + passageKey(location);
    if (store.has(key)) throw new Error("Duplicate Scripture passage: " + key);
    store.set(key, Object.freeze({ ...location, editionId: edition.id, text: entry.text,
      sourceUrl: entry.sourceUrl, sourceEdition: entry.sourceEdition,
      licenceId: entry.licenceId }));
  }
  return Object.freeze({
    get(passage, editionId) {
      assertScriptureTextReady(editionId);
      const location = scripturePassage(passage);
      const found = store.get(editionId + "|" + passageKey(location));
      if (!found) throw new Error("Verified passage unavailable for selected edition");
      return found;
    },
    has(passage, editionId) {
      try { this.get(passage, editionId); return true; } catch { return false; }
    },
    size: store.size
  });
}

export function resolveScripturePreference(language, editionId) {
  return scriptureEditionFor(language, editionId).id;
}

export function passageReference(passage) {
  const p = scripturePassage(passage);
  return p.book + " " + p.chapter + ":" + p.verseStart +
    (p.verseEnd === p.verseStart ? "" : "–" + p.verseEnd);
}

/**
 * A verse link may point from devotions, Formation or the Missal.
 * It has no side effects on the Mass engine.
 */
export function scriptureLink(passage) {
  return Object.freeze({ kind: "scripture", passage: scripturePassage(passage) });
}
