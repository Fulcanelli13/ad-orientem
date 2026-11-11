/** Two already owner-selected Class I paintings with verified physical work identity.
 *
 * This adapter introduces exactly two DATE-LOCKED remote previews, not
 * locally retained source masters, new photo approvals, or a gallery candidate
 * recommendation. The selected artworks were frozen in the 20 October 2026
 * 53-date editorial programme. Museum object pages verify the originals.
 *
 * Commons faithful-photo PD-Art status varies by jurisdiction. These previews
 * do NOT confer local photo-crop, permanent hosting or commercial clearance.
 */
export const CLASS_I_EXACT_SOURCE_PREVIEWS_2026=Object.freeze({
 "2026-03-01":Object.freeze({
  date:"2026-03-01",principalId:"tempora:Quad2-0:1:v",
  properPath:"Tempora/Quad2-0",artworkId:"frozen-date:2026-03-01",
  artist:"Raphael",title:"The Transfiguration",editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
  sourceObject:"https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/la-pinacoteca/sala-viii---secolo-xvi/raffaello-sanzio--trasfigurazione.html",
  collectionIdentity:"Vatican Museums, Pinacoteca Vaticana, MV.40333",
  photoFile:"Raffael-verklärung-christi.jpg",
  photoFilePage:"https://commons.wikimedia.org/wiki/File:Raffael-verkl%C3%A4rung-christi.jpg",
  imageWidth:3737,imageHeight:5691,
  photoRights:"Commons faithful PD-Art reproduction of public-domain painting; jurisdiction may vary",
  sourcePhotoQuality:"COLOUR_REPRODUCTION_FROM_OLDER_ARTBOOK_NOT_MUSEUM_MASTER",
  imagePublicationStatus:"REMOTE_APPROVED_DATE_PREVIEW_NOT_OFFLINE_CERTIFIED"
 }),
 "2026-05-25":Object.freeze({
  date:"2026-05-25",principalId:"tempora:Pasc7-1:1:r",
  properPath:"Tempora/Pasc7-1",artworkId:"frozen-date:2026-05-25",
  artist:"Henry Ossawa Tanner",title:"Nicodemus",editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
  sourceObject:"https://www.pafa.org/museum/collection/item/nicodemus",
  collectionIdentity:"Pennsylvania Academy of the Fine Arts, 1900.1",
  photoFile:"Jesus and Nicodemus, 1899, by Henry Ossawa Tanner.jpg",
  photoFilePage:"https://commons.wikimedia.org/wiki/File:Jesus_and_Nicodemus%2C_1899%2C_by_Henry_Ossawa_Tanner.jpg",
  imageWidth:1170,imageHeight:986,
  photoRights:"PAFA artwork: no known copyright restrictions; Commons faithful public-domain two-dimensional reproduction; jurisdiction may vary",
  sourcePhotoQuality:"COLOUR_PREVIEW_1170_PIXEL_NOT_MUSEUM_MASTER",
  imagePublicationStatus:"REMOTE_APPROVED_DATE_PREVIEW_NOT_OFFLINE_CERTIFIED"
 })
});
export function sourceVerifiedClassI2026Preview(date,principalId,properPath){
 const row=CLASS_I_EXACT_SOURCE_PREVIEWS_2026[date];
 if(!row||row.principalId!==principalId||row.properPath!==properPath)return null;
 const filename=encodeURIComponent(row.photoFile).replaceAll("'","%27");
 const image="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+filename+"?width=960";
 return Object.freeze({
  date,principalId,properPath,artworkId:row.artworkId,title:row.title,artist:row.artist,
  source:row.sourceObject,image,infoImage:image,
  imageSource:row.photoFilePage,collectionIdentity:row.collectionIdentity,
  rights:row.photoRights,imageStatus:row.imagePublicationStatus,
  selectionKind:"OWNER_APPROVED_2026_DATE_VERIFIED_REMOTE_PREVIEW",
  editorialBasis:row.editorialBasis,offlineOriginalCertified:false,
  photoOriginalBytesCommitted:false,photographCropCertified:false,
  ownerArtworkDecisionNewlyCreated:false,sourcePhotoQuality:row.sourcePhotoQuality
 });
}
