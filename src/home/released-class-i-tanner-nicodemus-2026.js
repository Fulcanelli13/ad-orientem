/** Local exact selected 2026 Pentecost Monday painting — source/photo separate.
 * The 1899 original is PAFA 1900.1. Original photograph on Commons is
 * 2400x2100, unaltered, source SHA1 74da94...; no crop performed.
 * PD-Art is not a blanket statement about every jurisdiction.
 */
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";

export const TANNER_NICODEMUS_2026_LOCAL_ORIGINAL=Object.freeze({
 date:"2026-05-25",principalId:"tempora:Pasc7-1:1:r",properPath:"Tempora/Pasc7-1",
 artworkId:"frozen-date:2026-05-25",
 title:"Nicodemus",titleFr:"Nicodème",artist:"Henry Ossawa Tanner",
 sourceObject:"https://www.pafa.org/museum/collection/item/nicodemus",
 collectionIdentity:"Pennsylvania Academy of the Fine Arts, 1900.1",
 photoFilePage:"https://commons.wikimedia.org/wiki/File:Nicodemus_Visiting_Jesus,_by_Henry_Ossawa_Tanner.jpg",
 image:"/assets/home/class-i-2026/tanner-nicodemus-1899-pafa-1900-1-original.jpg",
 photoOriginalSha1:"74da94d7dd9e6cf3a90c05c9146d88a989bbec3f",
 photoOriginalBytes:5285928,
 photoOriginalDimensions:Object.freeze([2400,2100]),
 photoCredit:"Barbara Katus / Courtesy Pennsylvania Academy of the Fine Arts",
 photoReuseBasis:"PAFA object: no known copyright restrictions; Wikimedia Commons PD-Art/PDM faithful 2D reproduction. Source EXIF names PAFA copyright holder; jurisdictional photography rules can differ.",
 imageStatus:"LOCAL_ORIGINAL_PD_ART_BYTE_VERIFIED_CROP_NOT_OWNER_APPROVED",
 selectionKind:"FROZEN_OWNER_SELECTED_CLASS_I_EXACT_LOCAL_SOURCE_PHOTO",
 editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
 offlineOriginalCertified:true,
 visuallyApprovedForCalendarCrop:false,
 ownerArtworkDecisionNewlyCreated:false
});
export function releasedTannerNicodemusForClassI2026(date,principalId,properPath){
 const r=TANNER_NICODEMUS_2026_LOCAL_ORIGINAL;
 const frozen=annualHomeArtworkDay2026(date,principalId);
 if(date!==r.date||principalId!==r.principalId||properPath!==r.properPath||
   frozen?.rank!=="I"||frozen.selection?.title!==r.title||
   frozen.selection?.artist!==r.artist||
   frozen.selection?.editorialBasis!==r.editorialBasis)return null;
 return Object.freeze({
  date,principalId,properPath,artworkId:r.artworkId,
  title:r.title,titleFr:r.titleFr,artist:r.artist,source:r.sourceObject,
  image:r.image,infoImage:r.image,
  imageSource:r.photoFilePage,collectionIdentity:r.collectionIdentity,
  photoCredit:r.photoCredit,rights:r.photoReuseBasis,
  imageStatus:r.imageStatus,selectionKind:r.selectionKind,
  offlineOriginalCertified:r.offlineOriginalCertified,
  photographCropCertified:r.visuallyApprovedForCalendarCrop,
  photoOriginalSha1:r.photoOriginalSha1,
  ownerArtworkDecisionNewlyCreated:r.ownerArtworkDecisionNewlyCreated
 });
}
