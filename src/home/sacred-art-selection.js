/**
 * Sacred Art — production-facing projection of HUMAN approvals.
 * Research authority: draft PR #1231, frozen 2026-10-17 decisions.
 * This is deliberately NOT another artwork catalogue or a rating engine.
 * All images are held until their individual release gates are documented.
 */

export const APPROVED_CLASS_I_2026 = Object.freeze([
  ["2026-01-06","ART-eter-aul-ubens-doration-of-the-agi","GOSPEL_SCENE","Matthew 2:1","sancti:01-06:1:w","Sancti/01-06"],
  ["2026-03-15","ART-iovanni-anfranco-iracle-of-oaves-and-ishes","GOSPEL_SCENE","John 6:1","tempora:Quad4-0:1:pv","Tempora/Quad4-0"],
  ["2026-03-19","ART-hilippe-de-hampaigne-he-ream-of-aint-oseph","GOSPEL_SCENE","Matthew 1:18","sancti:03-19:1:w","Sancti/03-19"],
  ["2026-03-25","ART-hilippe-de-hampaigne-he-nnunciation","GOSPEL_SCENE","Luke 1:26","sancti:03-25:1:w","Sancti/03-25"],
  ["2026-04-02","met-459131","FEAST_EUCHARIST",null,"tempora:Quad6-4r:1:w","Tempora/Quad6-4"],
  ["2026-04-03","ART-iandomenico-iepolo-an-olo-ia-rucis-tation-12-eath-on-the-ross","PASSION_EVENT",null,"tempora:Quad6-5r:1:bv","Tempora/Quad6-5"],
  ["2026-04-12","W07-014","GOSPEL_SCENE","John 20:19","tempora:Pasc1-0:1:w","Tempora/Pasc1-0"],
  ["2026-05-14","met-436835","FEAST_EVENT",null,"tempora:Pasc5-4:1:w","Tempora/Pasc5-4"],
  ["2026-05-24","ART-ean-estout-entecost","FEAST_EVENT",null,"tempora:Pasc7-0:1:r","Tempora/Pasc7-0"],
  ["2026-05-27","ART-hilippe-de-hampaigne-a-etite-ne","FEAST_EUCHARIST",null,"tempora:Pasc7-3:1:r","Tempora/Pasc7-3"],
  ["2026-05-31","cma-136507","FEAST_ICONOGRAPHY",null,"tempora:Pent01-0r:1:w","Tempora/Pent01-0"],
  ["2026-06-04","met-438434","FEAST_EUCHARIST",null,"tempora:Pent01-4:1:w","Tempora/Pent01-4"],
  ["2026-06-12","ART-nthony-van-yck-he-ance-hrust","GOSPEL_SCENE","John 19:31","tempora:Pent02-5:1:w","Tempora/Pent02-5"],
  ["2026-06-29","met-442491","FEAST_PERSONS",null,"sancti:06-29:1:r","Sancti/06-29"],
  ["2026-07-01","ART-nthony-van-yck-he-ance-hrust","GOSPEL_SCENE","John 19:30","sancti:07-01:1:r","Sancti/07-01"],
  ["2026-08-15","ART-eter-aul-ubens-ssumption-of-the-irgin","FEAST_EVENT",null,"sancti:08-15:1:w","Sancti/08-15"],
  ["2026-09-29","ART-uido-eni-rchangel-ichael-efeating-atan","FEAST_ICONOGRAPHY",null,"sancti:09-29:1:w","Sancti/09-29"],
  ["2026-12-08","ART-eter-aul-ubens-mmaculate-onception","FEAST_ICONOGRAPHY",null,"sancti:12-08:1:w","Sancti/12-08"],
  ["2026-12-24","ART-hilippe-de-hampaigne-he-ream-of-aint-oseph","GOSPEL_SCENE","Matthew 1:18","sancti:12-24:1:v","Sancti/12-24"],
  ["2026-12-25","cma-143784","GOSPEL_CONTEXT","Luke 2:1","sancti:12-25m1:1:w","Sancti/12-25m1"]
].map(([date,artworkId,relation,gospelStart,principalId,sourcePath])=>Object.freeze({date,artworkId,relation,gospelStart,principalId,sourcePath})));

/** Release entries must name exact LOCAL masters. No remote thumbnail fallback. */
export const RELEASED_SACRED_ART_MASTERS = Object.freeze({});
// Prado-linked paintings keep their editorial approvals but not permission to
// acquire or publish any Prado-sourced photograph, including via Commons/mirrors.
const pradoHeldApprovedArtworks=new Set([
  "ART-eter-aul-ubens-doration-of-the-agi",
  "ART-eter-aul-ubens-mmaculate-onception"
]);
const pradoSourceText=values=>values.some(v=>typeof v==="string"
  && /(?:museodelprado|(?:^|[^a-z])prado(?:[^a-z]|$))/i.test(v));

// 20 October 2026: never allow the earlier Home gallery to reintroduce
// displaced artwork on these Class I days while exact approved masters are held.
// Good Friday is Tiepolo San Polo Station XII, not Station VIII or XIII:
// https://chorusvenezia.org/en/visita/via-crucis-jesus-dies-on-the-cross/
// National object ID 0500220372A-12 (metadata CC BY; image rights NOT certified).
// Minardi/Fontana 10 April remains pending canonical art identification.
// Maíno Prado P003018 on 23 May remains the selected editorial painting,
// but its reproduction is source-blocked, including Commons and mirrors.
const dateSpecific2026ReplacementHolds=new Set([
  "2026-01-06", "2026-04-03", "2026-04-10", "2026-05-14",
  "2026-05-23", "2026-05-27", "2026-06-04", "2026-12-08"
]);
const historicProhibitedPaths=new Set([
  "sancti/03-25",
  "tempora/pasc7-0",
  "tempora/pent01-0",
  "tempora/pent01-0r",
  "tempora/pent09-0"
]);
const prohibitedLegacyIds=/\b(?:AO001|AO015|AO105|AO084)\b/i;
const prohibitedArtistNames=/\b(?:fra\s+angelico|el\s+greco|dom[eé]nikos\s+theotok[oó]poulos)\b/i;

export function approvedClassIEntry(date){
  return APPROVED_CLASS_I_2026.find(row=>row.date===date)||null;
}
function resolvedGospelRef(state){
  const raw=String(state?.resolution?.proper?.data?.gospel?.en||"");
  const match=raw.match(/\b(Matthew|Mark|Luke|John)\s+(\d+):(\d+)/i);
  return match?match.slice(1).map((x,i)=>i===0?x.toLowerCase():Number(x)).join(":"):null;
}
function expectedGospelRef(ref){
  const match=String(ref||"").match(/^(Matthew|Mark|Luke|John)\s+(\d+):(\d+)$/i);
  return match?match.slice(1).map((x,i)=>i===0?x.toLowerCase():Number(x)).join(":"):null;
}
/**
 * The 2026 date is a candidate index only. Actual selected Proper is authoritative.
 * Gospel-specific entries must match its appointed English canonical reference.
 * Even feast-iconography entries require a ready Proper and a released local file.
 */
export function releasedClassIArtwork(state,masters=RELEASED_SACRED_ART_MASTERS){
  if(state?.resolving||state?.resolution?.status!=="ready"||
     state?.resolution?.proper?.status!=="ready")return null;
  const entry=approvedClassIEntry(state?.selectedDate);
  if(!entry)return null;
  // W68 principal IDs are witnessed candidates, never replacements for the live resolver.
  // Release only if the live selected day and actual Proper independently agree.
  if(state?.resolution?.day?.main?.id!==entry.principalId)return null;
  if(state?.resolution?.proper?.data?.sourcePath!==entry.sourcePath)return null;
  if(entry.gospelStart&&resolvedGospelRef(state)!==expectedGospelRef(entry.gospelStart))return null;
  const file=masters?.[entry.artworkId];
  if(!file||file.artworkId!==entry.artworkId||file.releaseGate!=="ALL_CHECKS_PASS")return null;
  if(pradoHeldApprovedArtworks.has(entry.artworkId) || file.nonPradoSourceVerified!==true
    || pradoSourceText([file.sourceUrl,file.credit,file.rightsEvidenceUrl,file.sourceInstitution,
      file.originInstitution,file.sourceMuseum,file.physicalArtworkCollection,file.imageOrigin]))return null;
  if(!/^assets\/approved\/sacred-art\/[a-zA-Z0-9_.-]+\.webp$/.test(file.path||""))return null;
  if(!/^[a-f0-9]{64}$/i.test(file.sha256||""))return null;
  if(!/^https:\/\//.test(file.sourceUrl||""))return null;
  if(!file.credit||!["PUBLIC_DOMAIN","CC0","CC_BY","CC_BY_SA"].includes(file.reuse))return null;
  if(!(file.width>=1000&&file.height>=700))return null;
  if(!["exact","feast"].includes(file.placementReviewed))return null;
  if(!file.physicalOriginalVerified||!file.imageBytesVerified||
     !file.legalReuseVerified||!file.cropReviewed||!file.properAndGospelReviewed)return null;
  return Object.freeze({...entry,...file});
}
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,
  c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
export function releasedClassIArtworkMarkup(file){
  if(!file)return "";
  return '<figure class="aoTodayV2ArtOriginal" data-ao-approved-artwork-id="'+
    escapeHtml(file.artworkId)+'"><img src="'+escapeHtml(file.path)+
    '" alt="'+escapeHtml(file.alt||"Sacred artwork")+
    '" loading="eager" decoding="async" referrerpolicy="no-referrer"></figure>';
}

/** The old Home art selector predates the curator's permanent artist exclusions. */
export function safeLegacyHomeArtMarkup(state,legacyMarkup,win=globalThis){
  const markup=String(legacyMarkup||"");
  if(!markup)return "";
  // Date-specific replacements only apply to the 2026 curator decisions,
  // never to the same Proper occurring in another liturgical year.
  if(dateSpecific2026ReplacementHolds.has(state?.selectedDate))return "";
  if(prohibitedLegacyIds.test(markup)||prohibitedArtistNames.test(markup))return "";
  let path=state?.resolution?.proper?.data?.sourcePath||"";
  if(!path){
    try{path=win?.AO_PHASE1_ART?.properPath?.(state)||""}catch{}
  }
  path=String(path).trim().replace(/^\/+|\/+$/g,"").toLowerCase();
  // Fail closed, even where the legacy HTML omits the painting's name or ID.
  if(historicProhibitedPaths.has(path))return "";
  return markup;
}
