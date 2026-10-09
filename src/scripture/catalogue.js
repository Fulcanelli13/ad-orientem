import { isCatholicBookId } from "./canon.js";
/**
 * Shared Catholic Scripture catalogue.
 * Metadata only: no Bible text may ship until its exact edition and digital rights are verified.
 * The Mass engine owns its liturgical readings independently of this catalogue.
 */
export const SCRIPTURE_EDITIONS = Object.freeze({
  "dr-challoner": Object.freeze({
    id: "dr-challoner", language: "en", title: "Douay–Rheims (Challoner)",
    tradition: "Catholic; Vulgate-derived", role: "default",
    rights: "pending-edition-and-digital-rights-review", enabled: false
  }),
  "cpdv-2009": Object.freeze({
    id: "cpdv-2009", language: "en", title: "Catholic Public Domain Version (2009)",
    tradition: "Catholic; independent contemporary-English translation from Clementine Vulgate",
    role: "readability-candidate", rights: "public-domain-author-declared", enabled: false
  }),
  "crampon-1923": Object.freeze({
    id: "crampon-1923", language: "fr", title: "Bible Crampon (1923 text)",
    tradition: "Catholic", role: "default",
    rights: "pending-edition-and-digital-rights-review", enabled: false
  }),
  "vulgate-clementine": Object.freeze({
    id: "vulgate-clementine", language: "la", title: "Biblia Sacra Vulgata (Clementine)",
    tradition: "Catholic Latin", role: "reference",
    rights: "pending-source-and-digital-rights-review", enabled: false
  })
});

export const DEFAULT_SCRIPTURE_EDITION = Object.freeze({
  en: "dr-challoner", fr: "crampon-1923", la: "vulgate-clementine"
});

/**
 * Identifies a biblical passage independently of an edition or language.
 * Versification aliases (e.g. Vulgate Psalms) must be resolved by a separate,
 * verified mapping table, never silently guessed.
 */
export function scripturePassage({ book, chapter, verseStart, verseEnd = verseStart }) {
  if (!isCatholicBookId(book)) throw new Error("Invalid canonical Catholic book ID");
  if (![chapter, verseStart, verseEnd].every(Number.isSafeInteger)
      || chapter < 1 || verseStart < 1 || verseEnd < verseStart) {
    throw new Error("Invalid passage coordinates");
  }
  return Object.freeze({ book, chapter, verseStart, verseEnd });
}

export function scriptureEditionFor(language, requestedId) {
  const id = requestedId || DEFAULT_SCRIPTURE_EDITION[language];
  const edition = SCRIPTURE_EDITIONS[id];
  if (!edition || edition.language !== language) throw new Error("Unavailable Scripture edition");
  return edition;
}

/** Fail closed: catalogue entries alone do not authorise text distribution. */
export function assertScriptureTextReady(editionId) {
  const edition = SCRIPTURE_EDITIONS[editionId];
  if (!edition || !edition.enabled || edition.rights !== "cleared") {
    throw new Error("Scripture text unavailable until source and reproduction rights are cleared");
  }
  return edition;
}
