/**
 * Class I 2026-04-06, Easter Monday.
 * Frozen selected artist/subject: Caravaggio, The Supper at Emmaus.
 * Candidate physical version: NG172 (National Gallery, London), dated 1601.
 * DO NOT confuse the second 1606 Caravaggio canvas at Milan/Brera 2296.
 * The frozen ledger names artist/subject only: NO separately recorded owner
 * approval of London-vs-Milan physical version is claimed here.
 * Source is a PD-Art faithful reproduction, jurisdiction caveat retained;
 * full-frame uncropped lightweight WEBP with original archived in Git only.
 */
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";
export const CARAVAGGIO_EMMAUS_NG172_2026=Object.freeze({
 date:"2026-04-06",principalId:"tempora:Pasc0-1:1:w",
 properPath:"Tempora/Pasc0-1",
 title:"The Supper at Emmaus",titleFr:"Le Souper à Emmaüs",
 artist:"Caravaggio",
 artworkId:"frozen-date:2026-04-06",
 editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
 museumObject:"https://www.nationalgallery.org.uk/paintings/michelangelo-merisi-da-caravaggio-the-supper-at-emmaus",
 collectionIdentity:"National Gallery, London, NG172 (1601)",
 source:"https://commons.wikimedia.org/wiki/File:Supper_at_Emmaus-Caravaggio_(1601).jpg",
 image:"/assets/home/class-i-2026/caravaggio-emmaus-ng172-1601-fullframe-2400.webp",
 imageStatus:"LOCAL_EMMAUS_1601_NG172_PD_ART_FULLFRAME_BYTE_VERIFIED",
 sourceOriginalSha1:"72adc134bebed87eb8043e29f9844b1490ce0ad7",
 sourceOriginalSha256:"0ad5e515781f1ef52e5d60b43002a98ff0dceaf8707f9c9b8e944d97feea824f",
 displayedWebPSha256:"b6590b5a5167fda18143087cbfbfa5bb4e73e4420cd14ee5f7d3101de0d03513",
 sourceRights:"Commons faithful 2D reproduction under Public Domain Mark / PD-Art; public domain in the US, but photographic rights may vary by jurisdiction. Source: self-scanned historical print, not an institutional museum master. Full-frame uncropped WEBP for mobile.",
 rejectedPhysicalLookalike:"Caravaggio Supper at Emmaus (1606), Pinacoteca di Brera, 2296",
 physicalVersionOwnerApprovalPreviouslyRecorded:false
});
export function releasedCaravaggioEmmausClassI2026(date,principalId,properPath){
 const row=CARAVAGGIO_EMMAUS_NG172_2026;
 if(date!==row.date||principalId!==row.principalId||
    properPath!==row.properPath)return null;
 const day=annualHomeArtworkDay2026(date,principalId);
 const selected=day?.selection;
 if(day?.rank!=="I"||selected?.title!==row.title||
    selected?.artist!==row.artist||
    selected?.artworkId!==null||
    selected?.editorialBasis!==row.editorialBasis)return null;
 return Object.freeze({
  date,principalId,properPath,
  artworkId:row.artworkId,title:row.title,titleFr:row.titleFr,
  artist:row.artist,source:row.source,imageSource:row.source,
  image:row.image,infoImage:row.image,
  collectionIdentity:row.collectionIdentity,museumObject:row.museumObject,
  sourceOriginalSha1:row.sourceOriginalSha1,
  displayedWebPSha256:row.displayedWebPSha256,
  rights:row.sourceRights,imageStatus:row.imageStatus,
  selectionKind:"FROZEN_CLASS_I_CARAVAGGIO_EMMAUS_1601_LONDON_VERIFIED_SOURCE",
  physicalVersionOwnerApprovalPreviouslyRecorded:false,
  ownerArtworkDecisionNewlyCreated:false,photographCropCertified:false,
  offlineImageCertified:true,offlineOriginalCertified:false,
  alternativeCaravaggioWorkExcluded:row.rejectedPhysicalLookalike
 });
}
