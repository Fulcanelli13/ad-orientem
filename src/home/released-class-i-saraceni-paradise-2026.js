/**
 * 1 November 2026 — All Saints. Exact previously frozen Carlo Saraceni
 * Paradise, Met 1971.93 (Met object 437607), not a new artwork selection.
 * The Met-origin Commons CC0 photograph is retained with unmodified bytes.
 * A full-source image is not an owner-approved alternative crop.
 */
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";
import {approvedClassIHeroForDate} from "../calendar/approved-class-i-heroes-2026.js";

export const SARACENI_PARADISE_2026=Object.freeze({
 date:"2026-11-01",
 principalId:"sancti:11-01:1:w",
 properPath:"Sancti/11-01",
 title:"Paradise",titleFr:"Le Paradis",
 artist:"Carlo Saraceni",
 artworkId:"primary:2026-11-01",
 editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
 image:"/assets/home/class-i-2026/saraceni-paradise-met-1971-93-original.jpg",
 source:"https://commons.wikimedia.org/wiki/File:Paradise_MET_DT1448.jpg",
 collectionIdentity:"Metropolitan Museum of Art, 1971.93",
 museumObject:"https://www.metmuseum.org/art/collection/search/437607",
 sourceOriginalSha1:"93deaea4c939effc7e1668ce52ea7e079c352600",
 sourceOriginalSha256:"0d2f44968a83af250b13382b29585e18fcde78c5b36261e348f3498cefacd40c",
 sourceDimensions:Object.freeze([3273,3695]),
 sourceRights:"The Metropolitan Museum of Art Open Access CC0; exact Met-origin Wikimedia Commons 2D photograph, source file unchanged. Photograph not replaced by a crop.",
 imageStatus:"LOCAL_SARACENI_MET_1971_93_CC0_ORIGINAL_BYTE_VERIFIED"
});

export function releasedSaraceniParadiseClassI2026(date,principalId,properPath){
 const r=SARACENI_PARADISE_2026;
 if(date!==r.date||principalId!==r.principalId||properPath!==r.properPath)return null;
 const frozen=annualHomeArtworkDay2026(date,principalId);
 const approved=approvedClassIHeroForDate(date,principalId);
 if(frozen?.rank!=="I"||frozen.selection?.title!==r.title||
    frozen.selection?.artist!==r.artist||frozen.selection?.artworkId!==r.artworkId||
    frozen.selection?.editorialBasis!==r.editorialBasis||
    approved?.title!==r.title||approved?.artist!==r.artist||
    approved?.artworkId!==r.artworkId||approved?.source!==r.source||
    approved?.imagePublicationStatus!=="REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED"||
    approved?.editorialApproval!=="APPROVED_DATE_SPECIFIC_2026-10-19")return null;
 return Object.freeze({
  date,principalId,properPath,artworkId:r.artworkId,
  title:r.title,titleFr:r.titleFr,artist:r.artist,
  image:r.image,infoImage:r.image,source:r.source,imageSource:r.source,
  museumObject:r.museumObject,collectionIdentity:r.collectionIdentity,
  rights:r.sourceRights,imageStatus:r.imageStatus,
  photoOriginalSha1:r.sourceOriginalSha1,
  photoOriginalSha256:r.sourceOriginalSha256,
  selectionKind:"FROZEN_CLASS_I_SARACENI_MET_CC0_EXACT_LOCAL_SOURCE_PHOTO",
  offlineOriginalCertified:true,offlineImageCertified:true,
  photographCropCertified:false,ownerArtworkDecisionNewlyCreated:false,
  photoSourceIsMetOpenAccess:true
 });
}
