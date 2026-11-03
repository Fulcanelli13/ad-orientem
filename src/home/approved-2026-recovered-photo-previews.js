/**
 * 2026 exact-work recovery: 3 additional exact selected paintings with source
 * metadata and existing 1962 principal/Proper identity, no substitute works.
 *
 * Provenance: data/artwork/2026-prior-date-artwork-evidence.v1.json
 * Photo provenance: linked Commons individual file metadata (2026-11-03).
 * All images are REMOTE PREVIEWS, not approved local masters or approved crops.
 *
 * A 2026-10-21 supplemental Yes/No placement review cannot be interpreted as
 * revoking frozen feast painting selections. Each approved artwork still needs
 * its own source-photo identity, licence and display proof.
 */
const PUBLISHABLE=Object.freeze([
 Object.freeze({
  date:"2026-03-01",principalId:"tempora:Quad2-0:1:v",
  properPath:"Tempora/Quad2-0",
  artworkId:"2026-date-raphael-transfiguration",
  title:"The Transfiguration",artist:"Raphael",
  museumObject:"Vatican Pinacoteca, inv. 4",
  file:"Raphaël, La Transfiguration, 1518–1520, huile sur bois, 405 × 278 cm, Musées du Vatican, Pinacothèque, inv. 4.jpg",
  imageWidth:6349,imageHeight:9381,
  sourcePhotographer:"Matthieu.lett.ube",
  imageLicence:"CC BY 4.0",
  licenceUrl:"https://creativecommons.org/licenses/by/4.0/",
  sourcePhotoType:"INDEPENDENT_PHOTOGRAPHER_FREE_LICENCE",
  editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
  acceptance:"EXPLICIT_2026_10_19_DIRECT_APPROVAL_1_MARCH",
 }),
 Object.freeze({
  date:"2026-04-09",principalId:"tempora:Pasc0-4:1:w",
  properPath:"Tempora/Pasc0-4",
  artworkId:"2026-date-rembrandt-magdalen-tomb",
  title:"Christ and St Mary Magdalen at the Tomb",artist:"Rembrandt",
  museumObject:"Royal Collection, RCIN 404816",
  file:"Rembrandt van Rijn - Christ and St Mary Magdalen at the Tomb - Google Art Project.jpg",
  imageWidth:3560,imageHeight:4291,
  sourcePhotographer:"Google Art Project via Wikimedia Commons",
  imageLicence:"PD-Art reproduction; local jurisdiction may vary",
  licenceUrl:"https://commons.wikimedia.org/wiki/Commons:Reuse_of_PD-Art_photographs",
  sourcePhotoType:"COMMONS_PD_ART_PHOTO_PREVIEW",
  editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
  acceptance:"FROZEN_2026_DATE_WORK_EDITORIAL_SELECTION_NOT_RECONFIRMED_IN_SUPPLEMENTAL_MODULE_REVIEW",
 }),
 Object.freeze({
  date:"2026-05-25",principalId:"tempora:Pasc7-1:1:r",
  properPath:"Tempora/Pasc7-1",
  artworkId:"2026-date-tanner-nicodemus-1899",
  title:"Nicodemus",artist:"Henry Ossawa Tanner",
  museumObject:"Pennsylvania Academy of the Fine Arts, accession 1900.1",
  file:"Nicodemus Visiting Jesus, by Henry Ossawa Tanner.jpg",
  imageWidth:2400,imageHeight:2100,
  sourcePhotographer:"Wikimedia Commons historical reproduction; PAFA photograph source",
  imageLicence:"PD-Art reproduction; local jurisdiction may vary",
  licenceUrl:"https://commons.wikimedia.org/wiki/Commons:Reuse_of_PD-Art_photographs",
  sourcePhotoType:"COMMONS_PD_ART_PHOTO_PREVIEW",
  editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL",
  acceptance:"FROZEN_2026_DATE_WORK_EDITORIAL_SELECTION_NOT_RECONFIRMED_IN_SUPPLEMENTAL_MODULE_REVIEW",
 })
]);
export const SELECTED_2026_RECOVERED_SOURCE_PREVIEWS=Object.freeze(
 Object.fromEntries(PUBLISHABLE.map(x=>[x.date,x]))
);
export function recovered2026SelectedSourcePreview(date,principalId,properPath){
 const x=SELECTED_2026_RECOVERED_SOURCE_PREVIEWS[date];
 if(!x||principalId!==x.principalId||properPath!==x.properPath)return null;
 const file=encodeURIComponent(x.file).replaceAll("'","%27");
 const source="https://commons.wikimedia.org/wiki/File:"+file;
 const url="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+file+"?width=960";
 return Object.freeze({
  date,principalId,properPath,artworkId:x.artworkId,
  title:x.title,artist:x.artist,source,image:url,infoImage:url,
  rights:x.imageLicence+" · photo: "+x.sourcePhotographer+
   " · licence/source: "+x.licenceUrl+
   " · responsive display crop; source original and crop not user-certified",
  credit:x.sourcePhotographer,licenceUrl:x.licenceUrl,
  imageStatus:"REMOTE_FROZEN_EXACT_WORK_SOURCE_PREVIEW_NOT_OFFLINE_CERTIFIED",
  selectionKind:"FROZEN_2026_EXACT_WORK_REMOTE_SOURCE_RECOVERY",
  originalFilePixelWidth:x.imageWidth,originalFilePixelHeight:x.imageHeight,
  museumObject:x.museumObject
 });
}
