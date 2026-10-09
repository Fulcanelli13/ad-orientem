import { scripturePassage } from "./catalogue.js";
import { CATHOLIC_BOOK_IDS } from "./canon.js";
import { cpdvAuthorBookUrl } from "./cpdv-primary-links.js";
import { ROSARY_MYSTERY_CONTEXT_V1 } from "../pray/rosary-mystery-context.v1.js";

const EN_WITNESS = "https://www.biblegateway.com/passage/?version=DRA&search=";

const FRENCH_WITNESS = "https://fr.wikisource.org/wiki/Bible_Crampon_1923";
const referenceSyntax = /^([1-3]?[A-Za-z][A-Za-z0-9]*)\s+(\d+):(\d+)(?:[-–](\d+))?$/;

/** Parses canonical internal references; does not claim to map Vulgate versification. */
export function parseScriptureReference(reference) {
  if (typeof reference !== "string") throw new TypeError("Scripture reference must be a string");
  const found = reference.trim().match(referenceSyntax);
  if (!found) throw new Error("Unsupported Scripture reference format");
  return scripturePassage({
    book: found[1], chapter: Number(found[2]),
    verseStart: Number(found[3]),
    verseEnd: found[4] ? Number(found[4]) : Number(found[3])
  });
}
export function sourceReadingLink(passage, editionId = "dr-challoner") {
  const p = scripturePassage(passage);
  if (editionId === "cpdv-2009") return cpdvAuthorBookUrl(p.book); // Correct original book; no unverified verse anchor.
  if (editionId !== "dr-challoner") throw new Error("No verified passage URL provider for edition");
  const query = p.book + " " + p.chapter + ":" + p.verseStart +
    (p.verseEnd === p.verseStart ? "" : "-" + p.verseEnd);
  return EN_WITNESS + encodeURIComponent(query);
}
/**
 * Mystery IDs are existing ROSARY ownership IDs. They do not generate or edit
 * Rosary prayers, manuscript Scripture excerpts, or liturgical content.
 */
export const ROSARY_SCRIPTURE_LINKS = Object.freeze(
  Object.fromEntries(Object.entries(ROSARY_MYSTERY_CONTEXT_V1).map(([id,item]) => [
    id, Object.freeze({
      mysteryId: id,
      passage: parseScriptureReference(item.reference),
      relation: item.kind,
      editorialSummary: Object.freeze({ ...item.summary }),
      prayerIntention: Object.freeze({ ...item.intention }),
      frenchSource: FRENCH_WITNESS
    })
  ]))
);
export function scriptureBookCatalogue() { return CATHOLIC_BOOK_IDS.slice(); }
