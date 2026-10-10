/**
 * Daily sacred-art selection, not a second liturgical calendar.
 * Caller must supply SOURCE-VERIFIED observed celebration, appointed
 * Scripture subjects and the existing buildLiturgicalYear period id.
 * No feast identity is inferred from civil dates, labels, or titles.
 */
const isIsoDate = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const array = v => Array.isArray(v) ? v.filter(s => typeof s === "string" && s.length) : [];
const includesAny = (owned, requested) => array(owned).some(s => array(requested).includes(s));
const validFile = image => image
  && /^assets\/sacred-art\/[a-z0-9/_-]+\.(?:webp|jpe?g|png)$/.test(image.path || "")
  && Number.isInteger(image.width) && Number.isInteger(image.height)
  && Math.max(image.width, image.height) >= 2500
  && /^[a-f0-9]{64}$/.test(image.sha256 || "")
  && image.colour === true && image.museumOriginal === true
  && image.frameFree === true && image.glareFree === true;

export function eligibleSacredArtwork(work) {
  return !!work && work.medium === "painting"
    && work.source?.rights === "CC0"
    && (work.source?.objectUrl?.startsWith("https://www.metmuseum.org/art/collection/search/")\n      || work.source?.objectUrl?.startsWith("https://www.artic.edu/artworks/"))
    && work.review?.source === "OBJECT_PAGE_CHECKED"
    && work.review?.rights === "OBJECT_PAGE_CHECKED"
    && work.review?.artistic === "APPROVED"
    && work.review?.image === "PASS"
    && work.review?.crop === "PASS"
    && work.review?.status === "APPROVED"
    && validFile(work.image);
}
const sortedPool = (artworks, predicate) =>
  (Array.isArray(artworks) ? artworks : []).filter(w => eligibleSacredArtwork(w) && predicate(w))
    .sort((a, b) => a.id.localeCompare(b.id));

function pick(artworks, predicate, date, basis) {
  const pool = sortedPool(artworks, predicate);
  if (!pool.length) return null;
  // Stable date-based variation only among works matching the SAME priority.
  const ordinal = Number(date.replace(/-/g, ""));
  return { artwork: pool[ordinal % pool.length], basis };
}

export function selectDailySacredArt(context, artworks) {
  const {date, observedId, observedSubjectKeys, gospelSubjectKeys,
    epistleSubjectKeys, seasonId, devotionalContextKeys} = context || {};
  if (!isIsoDate(date)) throw new TypeError("Sacred art requires an ISO local calendar date");
  const candidates = [
    ["OBSERVED_ID", a => !!observedId && array(a.association?.observedIds).includes(observedId)],
    ["OBSERVED_MYSTERY", a => includesAny(a.association?.subjectKeys, observedSubjectKeys)],
    ["APPOINTED_GOSPEL", a => includesAny(a.association?.subjectKeys, gospelSubjectKeys)],
    ["APPOINTED_OTHER_SCRIPTURE", a => includesAny(a.association?.subjectKeys, epistleSubjectKeys)],
    ["1962_SEASON", a => !!seasonId && array(a.association?.seasonIds).includes(seasonId)],
    ["DEVOTIONAL_ASSOCIATION", a => includesAny(a.association?.subjectKeys, devotionalContextKeys)],
    ["UNIVERSAL_SACRED_PAINTING", a => array(a.association?.subjectKeys).includes("universal")]
  ];
  for (const [basis, predicate] of candidates) {
    const result = pick(artworks, predicate, date, basis);
    if (result) return result;
  }
  // A neutral existing UI surface is safer than publishing an unreviewed image.
  return null;
}

export const DEFAULT_DEVOTIONAL_ART_TIMES = Object.freeze({
  morning:"06:00", midday:"12:00", evening:"18:00", durationMinutes:20
});
const minuteOf = value => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || "")) return null;
  const [h,m] = value.split(":").map(Number);
  return h * 60 + m;
};
export function selectTimedDevotionalSacredArt(context, artworks, preferences = {}) {
  if (preferences.enabled !== true || !context?.date || !context?.localTime) return null;
  if (!isIsoDate(context.date)) return null;
  const now = minuteOf(context.localTime);
  if (now === null) return null;
  const duration = Number.isInteger(preferences.durationMinutes)
    ? Math.min(30, Math.max(1, preferences.durationMinutes))
    : DEFAULT_DEVOTIONAL_ART_TIMES.durationMinutes;
  const slots = [];
  for (const key of ["morning","midday","evening"]) {
    const start = minuteOf(preferences[key] ?? DEFAULT_DEVOTIONAL_ART_TIMES[key]);
    if (start !== null && now >= start && now < start + duration) slots.push(key);
  }
  if (!slots.length) return null;
  // 1962 liturgical-year period id, not a date-only Easter guess.
  const regina = ["easter","ascension","pentecost"].includes(context.seasonId);
  const devotion = regina ? "regina-caeli" : "angelus";
  const selected = pick(artworks, a => array(a.association?.subjectKeys).includes(devotion), context.date, "TIMED_DEVOTION");
  return selected ? { ...selected, devotion, slot: slots[0] } : null;
}

/**
 * Stable painting variation for recurring Prayer modules. Only an explicitly
 * curated association.prayerKeys entry may enter a pool. Never rotate random
 * saint portraits into liturgical mysteries or change art on every render.
 *
 * For the three daily Angelus/Regina-Caeli slots, the slot offset guarantees
 * distinct paintings when three or more approved works exist in the pool.
 */
export function selectRecurringPrayerSacredArt({date,prayerKey,slot="opening"}={}, artworks) {
  if (!isIsoDate(date)||!/^[a-z0-9.-]+$/.test(prayerKey||"")) return null;
  const eligible = sortedPool(artworks, work =>
    array(work.association?.prayerKeys).includes(prayerKey));
  if (!eligible.length) return null;
  const ordinal = Number(date.replace(/-/g,""));
  const offsets = {morning:0,midday:1,evening:2};
  const salt = Object.hasOwn(offsets,slot) ? offsets[slot] : 0;
  const artwork = eligible[(ordinal+salt)%eligible.length];
  return {artwork,basis:"PRAYER_CURATED_POOL",prayerKey,slot,poolSize:eligible.length};
}
