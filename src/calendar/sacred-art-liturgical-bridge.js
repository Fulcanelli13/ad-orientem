/**
 * Release-gated liturgical artwork bridge.
 * Editorial selection is NOT a release gate. It cannot replace the source
 * 1962 DayResolver or publish a museum research image by itself.
 *
 * The release owner may provide window.AO_SACRED_ART_RELEASE_V1.artworks:
 * existing canonical artwork objects bearing full source/rights/image/crop
 * approval (eligibleSacredArtwork), plus a separate release context flag.
 */
import { eligibleSacredArtwork } from "./sacred-art-selection.js";
import { sacredArt2026Curation } from "./sacred-art-2026-curation.js";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const safe = value => String(value ?? "").replace(/[&<>"']/g,
  c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const sameSource = value => String(value || "").trim().toLowerCase()
  .replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\?.*$/,"").replace(/\/$/,"");
const approvedSource = value => /^https:\/\/(?:www\.metmuseum\.org\/art\/collection\/search\/\d+|www\.nga\.gov\/artworks\/\d+-[a-z0-9-]+|www\.artic\.edu\/artworks\/\d+|clevelandart\.org\/art\/[\d.a-z]+)$/i.test(String(value || ""));
const isDay = date => typeof date === "string" && ISO.test(date)
  && !Number.isNaN(new Date(date + "T12:00:00Z").valueOf())
  && new Date(date + "T12:00:00Z").toISOString().slice(0,10) === date;

function selectedWork(subjectId, works, context, curation) {
  const subject = curation?.selections?.[subjectId];
  if (!subject?.artworkId) return null;
  for (const work of Array.isArray(works) ? works : []) {
    if (!eligibleSacredArtwork(work)) continue;
    // 'Home masterpiece' and 'Calendar' are distinct post-review decisions.
    if (context === "home"
      ? !(work.release?.home === true && work.release?.homepageMasterpiece === true)
      : work.release?.calendar !== true) continue;
    if (!Array.isArray(work.editorial?.subjectIds)
        || !work.editorial.subjectIds.includes(subjectId)) continue;
    // An explicitly identified museum original may not be replaced with
    // another painting merely by copying the selected editorial artwork ID.
    const hasMuseumSource = approvedSource(subject.sourceUrl);
    if (hasMuseumSource && sameSource(work.source?.objectUrl) !== sameSource(subject.sourceUrl))
      continue;
    if (!hasMuseumSource && work.editorial?.selectedArtworkId !== subject.artworkId)
      continue;
    return { artwork: work, subjectId, artworkSelectionId: subject.artworkId,
      artworkTitle: subject.title, artist: subject.artist,
      originalSourceUrl: approvedSource(subject.sourceUrl) ? subject.sourceUrl : null };
  }
  return null;
}

function liveRegistry(works) { return Array.isArray(works) ? works : []; }
function possibleOccasions(date, curation) {
  if (!isDay(date) || date.slice(0,4) !== String(curation?.year)) return [];
  return (curation?.occasions || []).filter(row => row.date === date
    && (row.group === "observedClassI"
      || row.group === "otherHighlights"
      || row.observedRelationship === "OBSERVED_PRINCIPAL"));
}
function clearedOccasion(row, artwork, subjectId, date, currentObservedId) {
  if (row.group === "observedClassI")
    return !!row.principalId && (date !== row.date || row.principalId === currentObservedId);
  // Non-Class-I highlights are *eligible* rather than proved feast slots.
  // A separate dated principal-ID certification, owned by the release, is
  // required; an existing nominal/date title never asserts an observance.
  const certified = artwork?.release?.verifiedOccasions;
  return Array.isArray(certified) && certified.some(entry =>
    entry.date === row.date && entry.subjectId === subjectId
      && typeof entry.observedPrincipalId === "string"
      && !!entry.observedPrincipalId
      && (date !== row.date || entry.observedPrincipalId === currentObservedId));
}

/** Calendar displays a true, exact-day association only when separately cleared. */
export function selectReleasedCalendarArtwork({
  date, observedId, works, curation = sacredArt2026Curation
} = {}) {
  if (!isDay(date) || typeof observedId !== "string" || !observedId) return null;
  for (const row of possibleOccasions(date, curation)) {
    for (const subjectId of row.selectedSubjects || []) {
      const selected = selectedWork(subjectId, liveRegistry(works), "calendar", curation);
      if (selected && clearedOccasion(row, selected.artwork, subjectId, date, observedId))
        return { ...selected, anchorDate: row.date,
        observedPrincipalId: observedId, held: false, relation: "OBSERVED_PRINCIPAL_SUBJECT" };
    }
  }
  return null;
}

/**
 * Home retains a previously released masterpiece until a newly suitable one
 * is cleared. A later nominal saint/feast NEVER forces a change.
 * The current date must still be resolved. Historical Class I anchors are
 * from a source-verified 2026 audit, not inferred from feast-name matching.
 */
export function selectReleasedHomeArtwork({
  date, observedId, works, curation = sacredArt2026Curation
} = {}) {
  if (!isDay(date) || date.slice(0,4) !== String(curation?.year)
      || typeof observedId !== "string" || !observedId) return null;
  const rows = (curation?.occasions || []).filter(row => row.date <= date
    && (row.group === "observedClassI"
      || row.group === "otherHighlights"
      || row.observedRelationship === "OBSERVED_PRINCIPAL"));
  for (const row of rows.reverse()) {
    for (const subjectId of row.selectedSubjects || []) {
      const selected = selectedWork(subjectId, liveRegistry(works), "home", curation);
      if (selected && clearedOccasion(row, selected.artwork, subjectId, date, observedId))
        return { ...selected, anchorDate: row.date,
        observedPrincipalId: row.principalId || (selected.artwork.release?.verifiedOccasions || [])
          .find(x => x.date === row.date && x.subjectId === subjectId)?.observedPrincipalId,
        held: row.date !== date,
        relation: row.date === date ? "OBSERVED_PRINCIPAL_SUBJECT" : "HELD_PREVIOUS_MASTERPIECE" };
    }
  }
  return null;
}

/**
 * Render only locally packaged, fully cleared image paths. Caption names the
 * actual depicted work, NOT the current liturgical principal when held.
 */
export function renderReleasedLiturgicalArtwork(result, { french = false } = {}) {
  if (!result?.artwork || !eligibleSacredArtwork(result.artwork)) return "";
  const work = result.artwork;
  if (typeof result.artworkTitle !== "string" || !result.artworkTitle.trim()
      || typeof result.artist !== "string" || !result.artist.trim()) return "";
  const src = "./" + work.image.path;
  const caption = result.artworkTitle + " — " + result.artist;
  const source = result.originalSourceUrl && approvedSource(result.originalSourceUrl)
    ? ` <a href="${safe(result.originalSourceUrl)}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;text-decoration-color:rgba(220,205,176,.45)">${french?"Source":"Source"}</a>`
    : "";
  return `<figure class="aoLitArtReleased" data-art-selection="${safe(result.artworkSelectionId)}" data-art-subject="${safe(result.subjectId)}" data-art-relation="${safe(result.relation || "")}" style="margin:16px auto 20px;max-width:650px;text-align:center;color:var(--ao-text-secondary,#d1c6b2)">
   <img alt="${safe(caption)}" src="${safe(src)}" decoding="async" loading="lazy" style="display:block;max-height:48vh;width:100%;object-fit:contain;border-radius:3px">
   <figcaption style="padding:9px 8px 2px;font:400 12px/1.55 var(--ao-font-body,Georgia,serif);opacity:.82">${safe(caption)}${source}</figcaption>
  </figure>`;
}
