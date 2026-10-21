import { CATHOLIC_BOOK_IDS } from './canon.js';
import { scriptureChapterLimit } from './chapter-counts.js';

const BOOKS = new Set(CATHOLIC_BOOK_IDS);
export const THEMATIC_PILOT_CATEGORIES = Object.freeze([
  'great_biblical_narratives',
  'miracles_of_christ',
  'parables_and_teachings'
]);
export const THEMATIC_EDITION_IDS = Object.freeze(['dr-challoner', 'cpdv-2009', 'crampon-1923']);

/**
 * Read only the reference grammar actually supplied for the 19 pilot episodes.
 * The witness, rather than a guessed verse table, owns whole-chapter endings.
 * Never infer cross-edition chapter alignment (especially Esther and Daniel).
 */
export function parseThematicReference(reference) {
  const match = typeof reference === 'string' &&
    reference.trim().match(/^([1-3]?\s*[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:[–-](?:(\d+):)?(\d+))?$/);
  if (!match) throw new Error('Unsupported thematic Scripture reference: ' + reference);
  const book = match[1].replace(/\s+/g, '');
  const firstChapter = Number(match[2]);
  const firstVerse = match[3] == null ? null : Number(match[3]);
  const explicitEndChapter = match[4] == null ? null : Number(match[4]);
  const ending = match[5] == null ? null : Number(match[5]);
  if (!BOOKS.has(book)) throw new Error('Book is outside the Catholic canon: ' + book);
  const lastChapter = firstVerse === null ? (ending ?? firstChapter) :
    (explicitEndChapter ?? firstChapter);
  const lastVerse = firstVerse === null ? null : (ending ?? firstVerse);
  if (firstChapter < 1 || lastChapter < firstChapter ||
    lastChapter > scriptureChapterLimit(book) ||
    (firstVerse !== null && (firstVerse < 1 || lastVerse < 1 ||
      (firstChapter === lastChapter && lastVerse < firstVerse)))) {
    throw new Error('Invalid thematic Scripture coordinates: ' + reference);
  }
  const chapters = [];
  for (let chapter = firstChapter; chapter <= lastChapter; chapter++) {
    chapters.push(Object.freeze({
      book, chapter,
      firstVerse: chapter === firstChapter ? firstVerse : null,
      lastVerse: chapter === lastChapter ? lastVerse : null,
      label: book + ' ' + chapter +
        (firstChapter === lastChapter && firstVerse !== null ?
          ':' + firstVerse + (lastVerse === firstVerse ? '' : '–' + lastVerse) : '')
    }));
  }
  return Object.freeze({
    reference, book, firstChapter, lastChapter, firstVerse, lastVerse,
    chapters: Object.freeze(chapters)
  });
}

/** Single owner for all collection navigation; no Scripture words are stored. */
export function buildThematicPilots(registry) {
  if (registry?.schema !== 'AO_HISTORIA_THEMATIC_EPISODE_RECONCILIATION_V2' ||
    !registry?.pilotCollections || !Array.isArray(registry.entries)) {
    throw new Error('Expected the reconciled Historia episode registry');
  }
  const canonical = new Map(registry.entries.map(entry => [entry.provisional_record_key, entry]));
  const collectionTitles = registry.collectionTitles;
  const keys = new Set();
  const collections = THEMATIC_PILOT_CATEGORIES.map(id => {
    const listed = registry.pilotCollections[id];
    if (!Array.isArray(listed) || !listed.length) throw new Error('Missing pilot collection: ' + id);
    const episodes = listed.map(pilot => {
      const source = canonical.get(pilot.key);
      if (!source || source.primary_collection_key !== id ||
        source.biblical_reference_from_inventory !== pilot.reference ||
        keys.has(pilot.key)) throw new Error('Stale or duplicated pilot episode: ' + pilot.key);
      keys.add(pilot.key);
      const plan = parseThematicReference(pilot.reference);
      return Object.freeze({
        id: source.provisional_record_key,
        title: source.title,
        reference: source.biblical_reference_from_inventory,
        primaryCollectionId: id,
        secondaryCollectionIds: Object.freeze(source.secondary_collection_keys || []),
        covenantalContext: source.covenantal_or_literary_anchor,
        sourceCoverage: source.source_reported_coverage,
        disposition: source.editorial_disposition,
        atlasRefs: Object.freeze((source.reconciliation?.atlasLinks || []).map(link =>
          Object.freeze({placeId: link.placeId, eventId: link.eventId, reference: link.reference}))),
        plan
      });
    });
    return Object.freeze({
      id, title: collectionTitles[id], editorialOrderOnly: true,
      episodes: Object.freeze(episodes)
    });
  });
  if (keys.size !== 19 || collections.map(c => c.episodes.length).join(',') !== '7,6,6') {
    throw new Error('The 19-episode pilot contract has changed');
  }
  return Object.freeze(collections);
}

/** Render only original witness verse rows, never generated connectors. */
export function selectThematicChapterVerses(records, editionId, chapterRange) {
  if (!THEMATIC_EDITION_IDS.includes(editionId) ||
    !Array.isArray(records) || !chapterRange ||
    !BOOKS.has(chapterRange.book)) throw new Error('Invalid witness reading request');
  const all = records.filter(row =>
    row && row.editionId === editionId &&
    row.book === chapterRange.book &&
    row.chapter === chapterRange.chapter);
  if (all.some(row => row.sourceWitness !== true || row.reviewed !== false ||
    row.sourceStatus !== 'UNCOLLATED_SOURCE_WITNESS' || !String(row.text || '').trim())) {
    throw new Error('This research preview accepts only labelled uncollated source witnesses');
  }
  const selected = all.filter(row =>
    (chapterRange.firstVerse == null || row.verseStart >= chapterRange.firstVerse) &&
    (chapterRange.lastVerse == null || row.verseStart <= chapterRange.lastVerse)
  ).sort((a, b) => a.verseStart - b.verseStart);
  if (!selected.length) throw new Error('This witness has no verses at the requested coordinates');
  const seen = new Set(), missing = [];
  let previous = chapterRange.firstVerse == null ? 0 : chapterRange.firstVerse - 1;
  for (const row of selected) {
    if (!Number.isSafeInteger(row.verseStart) || row.verseStart < 1 ||
      seen.has(row.verseStart)) throw new Error('Invalid/duplicate source verse coordinate');
    seen.add(row.verseStart);
    if (row.verseStart > previous + 1) {
      for (let n = previous + 1; n < row.verseStart; n++) missing.push(n);
    }
    previous = row.verseStart;
  }
  if (chapterRange.lastVerse != null && previous < chapterRange.lastVerse) {
    for (let n = previous + 1; n <= chapterRange.lastVerse; n++) missing.push(n);
  }
  return Object.freeze({
    sourceStatus: 'UNCOLLATED_SOURCE_WITNESS',
    chapter: chapterRange.chapter,
    book: chapterRange.book,
    requestedRange: chapterRange,
    verses: Object.freeze(selected.map(row => Object.freeze({
      chapter: row.chapter, verse: row.verseStart, text: row.text,
      sourceEdition: row.sourceEdition, sourceUrl: row.sourceUrl
    }))),
    missingVerseNumbers: Object.freeze(missing)
  });
}
