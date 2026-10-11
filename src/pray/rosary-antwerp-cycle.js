/**
 * The complete 1617–1620 Antwerp St Paul's Rosary cycle.
 * Historical IDs/artist attributions derive from St Paul's Church's own catalogue.
 * Artwork metadata is NOT a reproduction licence.
 *
 * Never silently substitute an image from a different cycle. Do not expose the
 * Antwerp collection as available until all FIFTEEN source images have licensed,
 * local, verified entries in the deployment's pack registry.
 */
export const ANTWERP_CYCLE_VERSION="rosary-antwerp-1617-catalog-v1";
export const ANTWERP_CYCLE_OFFICIAL_SOURCE=
 "https://www.sintpaulusantwerpen.be/en/art-history/art-collection/15-mysteries/";
export const ANTWERP_EXHIBITION=
 "https://www.hetnoordbrabantsmuseum.nl/en/visit/exhibitions/15-mysteries/";
export const ANTWERP_PRESS_TERMS=
 "https://www.hetnoordbrabantsmuseum.nl/het-museum/pers/15-mysterien/";
export const ANTWERP_IMAGE_STATUS="NOT_LICENSED_NOT_BUNDLED";
const scene=(id,title,artist,shot,focus,description,attributionNote="")=>
 Object.freeze({id,title,artist,shot,
  focus:Object.freeze({x:focus[0],y:focus[1],scale:focus[2]}),
  description,attributionNote,sourceUrl:ANTWERP_CYCLE_OFFICIAL_SOURCE,
  rightsStatus:ANTWERP_IMAGE_STATUS});
export const ANTWERP_FIFTEEN=Object.freeze([
 scene("joy1","The Annunciation","Hendrick van Balen","threshold-light",[49,43,1.12],
  "Reveal the painted heavenly light, settling into Gabriel's address to Mary."),
 scene("joy2","The Visitation","Frans Francken II","meeting",[48,49,1.13],
  "Travel slowly to Mary's and Elizabeth's meeting hands; finish on both women."),
 scene("joy3","The Nativity","Cornelis de Vos","birth-stillness",[52,57,1.13],
  "Let the Child's existing light guide the eye; no animated infant."),
 scene("joy4","The Presentation in the Temple","Cornelis de Vos","temple-light",[51,47,1.12],
  "Move along the temple diagonal from Mary toward Simeon and the Child."),
 scene("joy5","The Finding in the Temple","Matthys Voet","temple-distance",[51,43,1.14],
  "Begin among the doctors, settling on the Child and His parents."),
 scene("sor1","The Agony in Gethsemane","David Teniers the Elder","night-vigil",[50,46,1.09],
  "Reveal the moonlit vigil without manipulating Christ's face."),
 scene("sor2","The Flagellation","Peter Paul Rubens","stripped-light",[49,46,1.09],
  "Restrained still composition; no animated violence, lashes or simulated wounds."),
 scene("sor3","The Crowning with Thorns","Artus de Bruyn","shadow",[53,46,1.12],
  "Settle into the dignity of the suffering Christ; do not amplify brutality."),
 scene("sor4","The Carrying of the Cross","Anthony van Dyck","processional-travel",[52,49,1.12],
  "Slow rightward travel follows Christ meeting His Mother; retain both figures."),
 scene("sor5","The Crucifixion","Jacob Jordaens","absolute-stillness",[50,43,1.05],
  "Observe the painted Calvary in a motionless, sober frame."),
 scene("glo1","The Resurrection","Aernout Vinckenborgh","dawn-reveal",[51,45,1.12],
  "Uncover Christ as the original painting's source of triumph."),
 scene("glo2","The Ascension","Artus Wolffort (attributed)","vertical-ascension",[51,42,1.10],
  "Slow vertical camera travel only; retain Christ and the gathered apostles.",
  "St Paul's Church attributes this painting to Artus Wolffort, formerly Aernout Vinckenborgh."),
 scene("glo3","Pentecost","Matthys Voet","radiance",[50,47,1.12],
  "Follow painted rays from the Holy Ghost to Our Lady and the apostles."),
 scene("glo4","The Assumption","Jan Aertsen","vertical-ascension",[50,43,1.11],
  "Follow Mary's ascent toward the golden heaven, without moving the painted figure."),
 scene("glo5","The Coronation of Our Lady","Aernout Vinckenborgh","radiance",[50,45,1.10],
  "Reveal the Trinity crowning Our Lady, then still the image.")
]);
export const ANTWERP_IDS=Object.freeze(ANTWERP_FIFTEEN.map(x=>x.id));
const safeRelativeWebp=src=>typeof src==="string"
 && /^assets\/pray\/rosary\/antwerp\/[a-z0-9-]+\.webp$/.test(src)
 && !src.includes("..");
const sha256=hash=>typeof hash==="string"&&/^[a-f0-9]{64}$/.test(hash);
const vetted=(entry,id)=>entry?.id===id
 && entry.rightsStatus==="cleared"
 && typeof entry.photographerCredit==="string"
 && entry.photographerCredit.trim().length>0
 && typeof entry.licenceEvidenceUrl==="string"
 && /^https:\/\//.test(entry.licenceEvidenceUrl)
 && safeRelativeWebp(entry.src)&&sha256(entry.sha256)
 && Number.isFinite(entry.width)&&entry.width>=900
 && Number.isFinite(entry.height)&&entry.height>=700
 && !entry.src.startsWith("http");
/**
 * The pack object MUST be compiled only after independently verifying each
 * licensed photograph and its checked-in image bytes. Metadata does not fetch
 * or prove that a local file exists; release/CI must check every SHA-256.
 */
export function antwerpPackReady(pack){
 if(pack?.version!=="antwerp-15-cleared-v1" || !Array.isArray(pack.entries)
    || pack.entries.length!==15)return false;
 const seen=new Set();
 for(const id of ANTWERP_IDS){
  const entry=pack.entries.find(p=>p?.id===id);
  if(!vetted(entry,id)||seen.has(entry.src))return false;
  seen.add(entry.src);
 }
 return true;
}
export function antwerpEntryFor(pack,id){
 if(!antwerpPackReady(pack))return null;
 const item=ANTWERP_FIFTEEN.find(x=>x.id===id);
 const art=pack.entries.find(x=>x.id===id);
 if(!item||!art)return null;
 return Object.freeze({...item,...art});
}
export const ANTWERP_RELEASE_RULES=Object.freeze({
 defaultCollection:"existing",
 completeCycleRequired:15,
 existingArtworkMayNeverBeDeleted:true,
 remoteImagesAtPrayerTime:false,
 reviewerMayEnableOnlyAfterFullPack:true,
 optionalLuminousUsesExisting:true,
 forbiddenPublicityGalleryPhotos:true
});
