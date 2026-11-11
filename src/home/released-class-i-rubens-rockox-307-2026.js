/**
 * 7 April 2026 Easter Tuesday: later owner-approved Rubens Rockox Triptych
 * CENTRE PANEL, KMSKA 307 (not whole 307-311 triptych).
 * The Flemish Art Collection specifically labels the exact object image CC0.
 * Commons original is already framed to that one selected centre panel.
 * No app-generated crop, painter substitution or Gospel-verification claim.
 */
import {classIOwnerSupersession2026} from "./class-i-2026-owner-supersessions.js";
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";
export const ROCKOX_KMSKA_307_LOCAL_2026=Object.freeze({
 date:"2026-04-07",
 principalId:"tempora:Pasc0-2:1:w",
 properPath:"Tempora/Pasc0-2",
 artist:"Peter Paul Rubens",
 title:"Christ's First Apparition to the Disciples (Rockox Triptych central panel)",
 titleFr:"Première apparition du Christ aux disciples (panneau central du triptyque Rockox)",
 artworkId:"kmska-307",
 approvalBasis:"LATER_EXPLICIT_OWNER_DATE_APPROVAL_20261026",
 museumObject:"https://vlaamsekunstcollectie.be/en/collection/307",
 source:"https://commons.wikimedia.org/wiki/File:Peter_Paul_Rubens_-_Christ%27s_First_Apparition_to_the_Disciples_(central_panel_of_the_Rockox_Triptych).jpg",
 image:"/assets/home/class-i-2026/rubens-rockox-kmska307-central-panel-original.jpg",
 imageStatus:"LOCAL_KMSKA_307_OWNER_SELECTED_CENTRE_PANEL_INSTITUTIONAL_CC0_SOURCE",
 originalPhotoSha1:"7c8d82150fc8d116c85713dab15c4f8584c83f13",
 originalPhotoSha256:"e054d9373b13b939dc9d27c9c9fb6359e64332b0514872b9ee0f87e72a3a0249",
 collectionIdentity:"Royal Museum of Fine Arts Antwerp, KMSKA inventory 307, central panel only",
 rights:"Exact KMSKA 307 photo captioned CC0 by the Flemish Art Collection; this source is the Commons already-cropped-to-central-panel PDM/PD-Art original. In some jurisdictions 2D reproduction reuse may differ. No further crop or museum TIFF.",
 publicationOriginalAlreadyCentralPanel:true,
 ownerCropDecisionNewlyCreated:false,
 iconographicCaution:"Historically called Incredulity of Thomas; museum study doubts Thomas appears and suggests first appearance to three apostles instead. Do not claim exact Luke 24 verse-level match."
});
export function releasedRockoxKmska307ClassI2026(date,principalId,properPath){
 const r=ROCKOX_KMSKA_307_LOCAL_2026;
 if(date!==r.date||principalId!==r.principalId||properPath!==r.properPath)return null;
 const owner=classIOwnerSupersession2026(date,principalId,properPath);
 const day=annualHomeArtworkDay2026(date,principalId);
 if(!owner||owner.ownerDecisionDate!=="2026-10-26"||
    owner.museumIdentity!=="Royal Museum of Fine Arts Antwerp (KMSKA), centre panel inventory 307, Rockox Triptych"||
    owner.selection.title!==r.title||owner.selection.artist!==r.artist||
    owner.selection.artworkId!==r.artworkId||
    owner.selection.editorialBasis!==r.approvalBasis||
    owner.museumObject!==r.museumObject||
    day?.rank!=="I"||day.selection!==owner.selection)return null;
 return Object.freeze({
  date,principalId,properPath,
  title:r.title,titleFr:r.titleFr,artist:r.artist,artworkId:r.artworkId,
  source:r.source,imageSource:r.source,image:r.image,infoImage:r.image,
  imageStatus:r.imageStatus,rights:r.rights,museumObject:r.museumObject,
  originalPhotoSha1:r.originalPhotoSha1,originalPhotoSha256:r.originalPhotoSha256,
  collectionIdentity:r.collectionIdentity,iconographicCaution:r.iconographicCaution,
  selectionKind:"FROZEN_CLASS_I_LATER_OWNER_RUBENS_KMSKA307_EXACT_LOCAL_CC0_PHOTO",
  ownerArtworkDecisionNewlyCreated:false,ownerCropDecisionNewlyCreated:false,
  originalSourceAlreadyCentrePanel:true,offlineImageCertified:true
 });
}
