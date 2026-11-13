/*
 * Sacred Art adapter for the CANONICAL 1962 Calendar selection.
 * No independent date-to-Gospel resolution, no research data imports,
 * no title matching, no unapproved/remote artwork fallbacks.
 */
import { calendarScriptureContexts } from "./scripture-handoff.js";
import { selectCertifiedSacredArt } from "./sacred-art-release-selector.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const word = s => typeof s === "string" && s.trim() !== "";
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

/**
 * Map an actual resolved Mass Proper to the *release* art selector.
 * A date, feast label, devotional association, or research Gospel claim
 * cannot independently authorize a visible painting.
 *
 * scriptureContexts must come from calendarScriptureContexts(resolution);
 * the optional parameter makes the strict boundary separately testable.
 */
export function selectedCalendarArtProper({selectedDate, resolution, scriptureContexts} = {}) {
  if (!DATE.test(String(selectedDate || "")) || resolution?.date !== selectedDate
      || resolution?.status === "failed"
      || resolution?.proper?.status !== "ready"
      || !resolution?.proper?.data) return null;
  const principal = resolution?.day?.main;
  const principalId = principal?.id ?? principal?.sourceId;
  const sourcePath = resolution?.proper?.sourcePath
    ?? resolution?.proper?.data?.sourcePath
    ?? resolution?.proper?.data?.source?.path;
  if (!word(principalId) || !word(sourcePath)) return null;
  const readings = scriptureContexts === undefined
    ? calendarScriptureContexts(resolution)
    : scriptureContexts;
  if (!Array.isArray(readings)) return null;
  const gospels = readings.filter(r => r?.slot === "GOSPEL"
    && word(r?.reference) && Boolean(r?.provenance)
    && word(r?.sourceReference));
  // Mixed, extra, and unverified Gospel contexts fail closed.
  if (gospels.length !== 1) return null;
  return Object.freeze({
    status:"ready", source:"CANONICAL_1962_PROPER", gospelVerified:true,
    date:selectedDate, principalId, gospelRef:gospels[0].reference
  });
}

/**
 * Only releaseRecords certified by the existing art pipeline may be used.
 * Human 5/5 and Lock approval is necessary but does not release an image.
 */
export function certifiedSacredArtForCalendar({
  selectedDate, resolution, scriptureContexts,
  releaseRecords = [], approved = [], rejected = []
} = {}) {
  const resolvedProper = selectedCalendarArtProper({
    selectedDate, resolution, scriptureContexts
  });
  return resolvedProper
    ? selectCertifiedSacredArt({resolvedProper,releaseRecords,approved,rejected})
    : null;
}

/** Pure, optional Calendar hero markup. null selection yields no layout. */
export function certifiedSacredArtMarkup(selection, {language="en"} = {}) {
  if (!selection?.src || !selection?.imageSha256 || !selection?.artworkId)
    return "";
  const role = selection.isLiteralGospelScene
    ? language==="fr" ? "Scène de l’Évangile" : "Gospel scene"
    : language==="fr" ? "Image de la fête" : "Feast image";
  return `<figure class="aoCalendarCertifiedSacredArt" data-certified-artwork-id="${escapeHtml(selection.artworkId)}" data-image-sha256="${escapeHtml(selection.imageSha256)}">
    <img src="${escapeHtml(selection.src)}" loading="lazy" decoding="async" alt="${escapeHtml(role)}">
    <figcaption><small>${escapeHtml(role)}</small><span>${escapeHtml(selection.attribution)}</span></figcaption>
  </figure>`;
}
