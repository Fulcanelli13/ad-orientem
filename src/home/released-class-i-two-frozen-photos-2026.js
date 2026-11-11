/**
 * Exact-source photo releases for two ALREADY selected 2026 Class I paintings.
 * 15 March: Lanfranco, National Gallery of Ireland NGI.72 — existing WGA
 * original 1285x683 pixels, no artificial upscaling or museum-master claim.
 * 1 July: Van Dyck, KMSKA 297, "De lanssteek" — exact Commons CC0
 * original retained in non-public source archive; full-frame mobile WebP.
 * Do not infer approvals for other dates, artworks, photos or compositions.
 */
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";
import {FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS} from "./approved-2026-frozen-selected-previews.js";

export const TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026=Object.freeze({
 "2026-03-15":Object.freeze({
  date:"2026-03-15",principalId:"tempora:Quad4-0:1:pv",properPath:"Tempora/Quad4-0",
  title:"Miracle of Loaves and Fishes",titleFr:"La Multiplication des pains et des poissons",
  artist:"Giovanni Lanfranco",
  artworkId:"ART-iovanni-anfranco-iracle-of-oaves-and-ishes",
  workGroupId:"CANONICAL::ART-iovanni-anfranco-iracle-of-oaves-and-ishes",
  editorialBasis:"OCT17_PREVIOUSLY_APPROVED_ASSOCIATION_PRIMARY_NOT_EXPLICITLY_RECONFIRMED",
  image:"/assets/home/class-i-2026/lanfranco-ngi72-miracle-original.jpg",
  source:"https://commons.wikimedia.org/wiki/File:Giovanni_Lanfranco_-_Miracle_of_the_Bread_and_Fish_-_WGA12454.jpg",
  museumObject:"https://onlinecollection.nationalgallery.ie/objects/10345/the-miracle-of-the-loaves-and-fishes",
  collectionIdentity:"National Gallery of Ireland, NGI.72",
  originalPhotoSHA1:"b8b257f4ed74ff83fc4a577005ffc8c5c65e90ab",
  sourceRights:"Wikimedia Commons PD-Art/Public Domain Mark faithful reproduction of public-domain painting; original file sourced from Web Gallery of Art, not National Gallery of Ireland museum photo; jurisdiction-specific photographic restrictions may apply.",
  imageStatus:"LOCAL_NGI72_LANFRANCO_ORIGINAL_WGA_PD_ART_SOURCE",
  imageDimensions:Object.freeze([1285,683]),
  originalRetainedInPublishedAsset:true,
  isModernMuseumPhotoMaster:false,
  isUpscaled:false
 }),
 "2026-07-01":Object.freeze({
  date:"2026-07-01",principalId:"sancti:07-01:1:r",properPath:"Sancti/07-01",
  title:"The Lance Thrust",titleFr:"Le Coup de lance",
  artist:"Anthony van Dyck",
  artworkId:"ART-nthony-van-yck-he-ance-hrust",
  workGroupId:"CANONICAL::ART-nthony-van-yck-he-ance-hrust",
  editorialBasis:"OCT17_PREVIOUSLY_APPROVED_ASSOCIATION_PRIMARY_NOT_EXPLICITLY_RECONFIRMED",
  image:"/assets/home/class-i-2026/van-dyck-kmska297-lance-thrust-2400.webp",
  source:"https://commons.wikimedia.org/wiki/File:Anthony_van_Dyck_-_Christ_on_the_cross_between_the_two_criminals.jpg",
  museumObject:"https://kmska.be/nl/meesterwerk/christus-aan-het-kruis-de-lanssteek-0",
  collectionIdentity:"Royal Museum of Fine Arts Antwerp (KMSKA), inventory 297",
  originalPhotoSHA1:"2d7bdd1c7dc4583634f1c00dc99d5d38088be3fc",
  sourceRights:"Exact Wikimedia Commons photo dedicated CC0 1.0; painting is public domain. Displayed WebP is full-frame resized and recompressed from the 4498×6095 source, which remains in Ad Orientem source records. KMSKA's separate professional-use enquiry relates to museum-supplied images; no museum TIFF used.",
  imageStatus:"LOCAL_KMSKA297_VAN_DYCK_COMMONS_CC0_FULL_FRAME_WEBP",
  sourceOriginalArchive:"data/artwork/releases/source-masters/van-dyck-kmska297-lance-thrust-original.jpg",
  sourceOriginalDimensions:Object.freeze([4498,6095]),
  displayedMaxEdge:2400,
  originalRetainedInPublishedAsset:false,
  isUpscaled:false
 })
});

export function releasedTwoFrozenClassIHomeArtwork2026(date,principalId,properPath){
 const r=TWO_FROZEN_CLASS_I_PHOTO_RELEASES_2026[date];
 const frozen=annualHomeArtworkDay2026(date,principalId);
 const prior=FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS[date];
 if(!r||!frozen||frozen.rank!=="I"||
    r.date!==date||r.principalId!==principalId||r.properPath!==properPath||
    frozen.selection?.title!==r.title||
    frozen.selection?.artist!==r.artist||
    frozen.selection?.artworkId!==r.artworkId||
    frozen.selection?.editorialBasis!==r.editorialBasis||
    prior?.workGroupId!==r.workGroupId||
    prior?.photoSha1!==r.originalPhotoSHA1||
    prior?.principalId!==r.principalId||
    prior?.properPath!==r.properPath||
    prior?.title!==r.title||
    prior?.artist!==r.artist)return null;
 return Object.freeze({
  date,principalId,properPath,artworkId:r.artworkId,
  title:r.title,titleFr:r.titleFr,artist:r.artist,
  image:r.image,infoImage:r.image,source:r.source,
  imageSource:r.source,museumObject:r.museumObject,
  rights:r.sourceRights,collectionIdentity:r.collectionIdentity,
  photoOriginalSha1:r.originalPhotoSHA1,
  imageStatus:r.imageStatus,
  selectionKind:"FROZEN_CLASS_I_TWO_EXACT_LOCAL_SOURCE_PHOTOS",
  ownerArtworkDecisionNewlyCreated:false,
  photographCropCertified:false,
  offlineOriginalCertified:true,
  isUpscaled:false,
  photoSourceIsMuseumMaster:false
 });
}
