/** Good Friday 2026: exact owner-selected San Polo oil painting (XII).
 * This reuses only the photographer's pre-existing one-of-14 licensed
 * San Polo files; the separately optional Stations reader stays unchanged.
 * The narrowly authorized CC BY-SA 4.0 exception does NOT generalize.
 */
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";
const selection=Object.freeze({
 date:"2026-04-03",
 principalId:"tempora:Quad6-5r:1:bv",
 properPath:"Tempora/Quad6-5r",
 artworkId:"ART-iandomenico-iepolo-an-olo-ia-rucis-tation-12-eath-on-the-ross",
 title:"San Polo Via Crucis — Station 12: Death on the Cross",
 titleFr:"Via Crucis de San Polo — Station XII : Mort de Jésus sur la Croix",
 artist:"Giandomenico Tiepolo",
 editorialBasis:"OCT17_PREVIOUSLY_APPROVED_ASSOCIATION_PRIMARY_NOT_EXPLICITLY_RECONFIRMED",
 image:"/assets/stations/san-polo/station-12.webp",
 source:"https://commons.wikimedia.org/wiki/File:Chiesa_di_San_Polo_(Venice)_-_VIA_CRUCIS_XII_-_Jesus_dies_on_the_cross.jpg",
 photoCredit:"Didier Descouens / Archaeodontosaurus",
 photoLicense:"CC BY-SA 4.0",
 photoLicenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",
 attributionFile:"assets/stations/san-polo/LICENSE-ATTRIBUTION.md",
 sha256:"a9c3e1338a52110989339f5af98c0055a6f1ad25c5b4cc61b961461282a65eba",
 dimensions:Object.freeze([1822,2400]),
 rightsScope:"Existing PR #2144 exception only for fourteen Giandomenico Tiepolo San Polo oil photographs; this is Station XII of that same set.",
 imageStatus:"LOCAL_SAN_POLO_XII_CC_BY_SA_4_0_EXACT_SOURCE_DATE_IMAGE",
 selectionKind:"FROZEN_CLASS_I_GOOD_FRIDAY_EXISTING_LICENSED_PHOTO_REUSE",
 previouslyExistingPhotograph:true,
 newlyLicensedPhotograph:false,
 addedPhotoBinary:false,
 ownerArtworkDecisionNewlyCreated:false,
 ownerCalendarCropApprovedByThisReuse:false
});
export const FROZEN_GOOD_FRIDAY_2026_SAN_POLO_XII=selection;
export function releasedGoodFridaySanPoloHomeArtwork2026(date,principalId,properPath){
 const frozen=annualHomeArtworkDay2026(date,principalId),r=selection;
 if(date!==r.date||principalId!==r.principalId||properPath!==r.properPath||
  frozen?.rank!=="I"||
  frozen?.selection?.title!==r.title||
  frozen?.selection?.artist!==r.artist||
  frozen?.selection?.editorialBasis!==r.editorialBasis||
  frozen?.selection?.artworkId!==r.artworkId)return null;
 return Object.freeze({
  date,principalId,properPath,artworkId:r.artworkId,
  title:r.title,titleFr:r.titleFr,artist:r.artist,
  image:r.image,infoImage:r.image,source:r.source,
  rights:"Photograph: "+r.photoCredit+" · CC BY-SA 4.0 ("+r.photoLicenseUrl+
   "); resized and converted from original JPEG to WebP, unchanged painted composition; adapted photo shared under same license. "+r.rightsScope,
  photoCredit:r.photoCredit,licenseUrl:r.photoLicenseUrl,
  attributionFile:r.attributionFile,imageStatus:r.imageStatus,
  selectionKind:r.selectionKind,
  photoOriginalSha256:r.sha256,
  offlineOriginalCertifiedByPriorRelease:true,
  photographCropCertified:false,
  ownerArtworkDecisionNewlyCreated:false
 });
}
