/**
 * Date-specific Sacred Art decisions made by the curator on 19 October 2026.
 *
 * Holy Thursday was explicitly revised by the user on 26 October 2026:\n * Philippe de Champaigne replaces Ugolino da Siena ONLY for 2 April 2026.\n * All other date selections, including Champaigne on 27 May, remain unchanged.\n * These are EDITORIAL approvals, not source-photograph rights grants. Keep the
 * old Proper-art paintings in their own illustrated-Gospel context: they must
 * not impersonate the curator's later approved Home hero on these ten dates.
 *
 * This module deliberately does not import the divergent research branch or
 * infer observed Masses from feast names. The live 1962 DayResolver principal
 * ID must agree before we even consider a packaged release candidate.
 */
export const APPROVED_FEAST_HERO_VERSION = "oct19-feast-selection-adapter-v2-oct26-holy-thursday-champaigne";

const records = [
  ["2026-03-29","tempora:Quad6-0r:1:rv","Palm Sunday","Anthony van Dyck","The Entry of Christ into Jerusalem",null,"EXACT_PALM_PROCESSION"],
  ["2026-04-02","tempora:Quad6-4r:1:w","Holy Thursday","Philippe de Champaigne","La Petite Cène","ART-hilippe-de-hampaigne-a-etite-ne","EXACT_EUCHARISTIC_INSTITUTION"],
  ["2026-05-23","tempora:Pasc6-6:1:r","Pentecost Vigil","Juan Bautista Maíno","The Pentecost",null,"ANTICIPATORY_PENTECOST_THEME"],
  ["2026-05-24","tempora:Pasc7-0:1:r","Pentecost","Jean Restout","Pentecost","ART-ean-estout-entecost","EXACT_FEAST_SUBJECT"],
  ["2026-05-27","tempora:Pasc7-3:1:r","Pentecost Ember Wednesday","Philippe de Champaigne","La Petite Cène","ART-hilippe-de-hampaigne-a-etite-ne","EUCHARISTIC_THEME_NOT_LITERAL_GOSPEL"],
  ["2026-06-12","tempora:Pent02-5:1:w","Sacred Heart","Juan Patricio Morlete Ruiz","The Heart of Jesus","commons-morlete-sacred-heart-1759","EXACT_FEAST_SUBJECT"],
  ["2026-10-25","sancti:10-DU:1:w","Christ the King","Ambrosius Benson","Salvator Mundi",null,"CHRIST_KINGSHIP_THEME"],
  ["2026-11-01","sancti:11-01:1:w","All Saints","Carlo Saraceni","Paradise",null,"EXACT_FEAST_SUBJECT"],
  ["2026-11-02","sancti:11-02m1:1:b","All Souls","Ludovico Carracci","An Angel Frees the Souls of Purgatory",null,"ALL_SOULS_THEME"],
  ["2026-11-29","tempora:Adv1-0:1:v","Advent I","John Martin","The Great Day of His Wrath",null,"ESCHATOLOGICAL_THEME_NOT_LITERAL_GOSPEL"]
];

/** Frozen editorial identifiers; NEVER mutate to compensate for missing photos. */
export const APPROVED_FEAST_HERO_DATES = Object.freeze(records.map(
  ([date,observedPrincipalId,occasion,artist,title,artworkId,relation]) =>
    Object.freeze({
      key: "AO-HERO-" + date,
      date, observedPrincipalId, occasion, artist, title, artworkId, relation,
      curatorApproved: true,
      photoApprovedForRelease: false
    })
));

const decisionByDate = new Map(APPROVED_FEAST_HERO_DATES.map(record => [record.date,record]));
const isDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * Return the curator's specific choice ONLY for a source-resolved principal.
 * A mere civil-date match cannot replace the appointed 1962 Mass.
 */
export function approvedFeastHeroForResolvedDay(date, observedPrincipalId) {
  if (!isDate(date) || typeof observedPrincipalId !== "string" || !observedPrincipalId) return null;
  const decision = decisionByDate.get(date);
  return decision?.observedPrincipalId === observedPrincipalId ? decision : null;
}

const safe = value => String(value ?? "").replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

const IS_PATH = /^assets\/sacred-art\/[a-z0-9/_-]+\.(?:webp|png|jpe?g)$/;
const IS_SHA = /^[a-f0-9]{64}$/i;
const IS_HTTPS = /^https:\/\/[a-z0-9.-]+\/[^\s<>"']+$/i;
const approvedLicense = new Set(["CC0","PDM","PD-ART","CC-BY-4.0","CC-BY-SA-4.0"]);

/**
 * The optional AO_APPROVED_FEAST_ART_RELEASE_V1 is a packaged-art ledger,
 * not a list of arbitrarily supplied remote image URLs.
 * In particular: no museum-name allowlist and no print-oriented 2500px rule;
 * no unverified rights, substituted paintings or cropped painting surfaces.
 */
export function resolveApprovedFeastHero(date, observedPrincipalId, releaseRegistry, surface = "home") {
  const decision = approvedFeastHeroForResolvedDay(date, observedPrincipalId);
  if (!decision) return null;
  const works = releaseRegistry?.artworks;
  const work = Array.isArray(works) ? works.find(w => w?.key === decision.key) : null;
  const approvedSurface = surface === "calendar" ? "calendar" : "home";
  if (!work) return Object.freeze({decision,status:"AWAITING_RELEASED_PHOTOGRAPH",artwork:null});
  const photo = work.photo || {};
  const rights = work.rights || {};
  const source = work.source || {};
  const strictIdentity = work.artist === decision.artist && work.title === decision.title
    && (decision.artworkId === null || work.artworkId === decision.artworkId);
  const sourceIdentified = typeof source.objectUrl === "string" && IS_HTTPS.test(source.objectUrl)
    && typeof source.photoUrl === "string" && IS_HTTPS.test(source.photoUrl)
    && source.exactOriginalVerified === true;
  const photoVerified = typeof photo.path === "string" && IS_PATH.test(photo.path)
    && Number.isInteger(photo.width) && photo.width >= 400
    && Number.isInteger(photo.height) && photo.height >= 400
    && typeof photo.sha256 === "string" && IS_SHA.test(photo.sha256)
    && photo.fullPaintedSurface === true && photo.noGlare === true
    // Artist-painted architecture or oval portraits are NOT museum frames.
    // The final bundled photograph must show the whole painting alone.
    && photo.physicalFrameAbsent === true
    && photo.gallerySurroundAbsent === true
    && photo.paintingBoundsVerified === true
    && photo.noSyntheticFill === true
    && photo.phone320Pass === true && photo.phone390Pass === true;
  const rightsVerified = approvedLicense.has(rights.license)
    && rights.exactPhotoRightsVerified === true
    && rights.appDistributionPermitted === true
    && typeof rights.evidenceUrl === "string" && IS_HTTPS.test(rights.evidenceUrl);
  const released = strictIdentity && sourceIdentified && photoVerified && rightsVerified
    && work.release?.status === "APPROVED_FOR_RELEASE"
    && work.release?.[approvedSurface] === true
    && work.release?.humanVisualApproval === true
    && work.release?.observedPrincipalId === decision.observedPrincipalId;
  return Object.freeze({
    decision,
    status: released ? "RELEASED" : "PHOTO_IDENTITY_RIGHTS_OR_MOBILE_HOLD",
    artwork: released ? work : null
  });
}

/** The rendered subject is explicitly captioned: NEVER relabel as Sunday's Gospel. */
export function renderApprovedFeastHero(result, { calendar = false } = {}) {
  if (result?.status !== "RELEASED" || !result.artwork) return "";
  const {decision,artwork} = result;
  const image = artwork.photo;
  const credit = artwork.rights?.attribution || artwork.artist;
  // Image path already constrained to a local, bundled original in the gate.
  const href = safe(artwork.source.objectUrl);
  const src = safe("./" + image.path);
  return '<figure class="aoProperArt aoApprovedFeastHero"' +
    ' data-ao-approved-feast-hero="' + safe(decision.key) + '"' +
    ' data-ao-artwork-relation="' + safe(decision.relation) + '">' +
    '<img src="' + src + '" alt="' + safe(artwork.artist + " — " + artwork.title) + '"' +
    ' width="' + image.width + '" height="' + image.height + '"' +
    ' loading="' + (calendar ? "lazy" : "eager") + '"' +
    ' decoding="async" style="display:block;width:100%;height:auto;max-height:60vh;object-fit:contain;background:#080c12">' +
    '<figcaption><strong>' + safe(artwork.title) + '</strong> — ' + safe(artwork.artist) +
    ' · <a href="' + href + '" target="_blank" rel="noopener noreferrer">Source</a>' +
    (credit === artwork.artist ? "" : ' · ' + safe(credit)) +
    '</figcaption></figure>';
}
