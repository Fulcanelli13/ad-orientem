/**
 * Four exact paintings from the frozen 53-date 2026 owner's selection,
 * matched to pre-existing source-approved works in the 989-group gallery.
 * Commons files are REMOTE PREVIEWS ONLY; these are not locally certified
 * original bytes, approved mobile crops, or blanket photo-rights clearance.
 *
 * DO NOT insert art by title resemblance, saint keyword, or generic Gospel.
 * The source 1962 principal and exact resolved Mass Proper must both match.
 * The legacy source research status MUST NOT be converted into a claim that
 * an individual user's source photograph has passed final QA.
 */
const sourceRows=[
 {
  date:"2026-01-06",principalId:"sancti:01-06:1:w",properPath:"Sancti/01-06",
  artworkId:"ART-eter-aul-ubens-doration-of-the-agi",
  title:"Adoration of the Magi",artist:"Peter Paul Rubens",
  workGroupId:"CANONICAL::ART-eter-aul-ubens-doration-of-the-agi",
  photoSha1:"a4701462dfcc3b8cc9f5f89a1e8e6b17f09544d7",
  file:"La_adoración_de_los_Reyes_Magos_(Rubens,_Prado).jpg",
  rightsTier:"COMMONS_PD_ART",editorialBasis:"OCT17_PREVIOUSLY_APPROVED_ASSOCIATION_PRIMARY_NOT_EXPLICITLY_RECONFIRMED"
 },
 {
  date:"2026-03-15",principalId:"tempora:Quad4-0:1:pv",properPath:"Tempora/Quad4-0",
  artworkId:"ART-iovanni-anfranco-iracle-of-oaves-and-ishes",
  title:"Miracle of Loaves and Fishes",artist:"Giovanni Lanfranco",
  workGroupId:"CANONICAL::ART-iovanni-anfranco-iracle-of-oaves-and-ishes",
  photoSha1:"b8b257f4ed74ff83fc4a577005ffc8c5c65e90ab",
  file:"Giovanni_Lanfranco_-_Miracle_of_the_Bread_and_Fish_-_WGA12454.jpg",
  rightsTier:"COMMONS_PD_ART",editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL"
 },
 {
  date:"2026-07-01",principalId:"sancti:07-01:1:r",properPath:"Sancti/07-01",
  artworkId:"ART-nthony-van-yck-he-ance-hrust",
  title:"The Lance Thrust",artist:"Anthony van Dyck",
  workGroupId:"CANONICAL::ART-nthony-van-yck-he-ance-hrust",
  photoSha1:"2d7bdd1c7dc4583634f1c00dc99d5d38088be3fc",
  file:"Anthony_van_Dyck_-_Christ_on_the_cross_between_the_two_criminals.jpg",
  rightsTier:"COMMONS_CC0_SOURCE",editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL"
 },
 {
  date:"2026-09-29",principalId:"sancti:09-29:1:w",properPath:"Sancti/09-29",
  artworkId:"ART-uido-eni-rchangel-ichael-efeating-atan",
  title:"Saint Michael Defeating Satan",artist:"Guido Reni",
  workGroupId:"CANONICAL::ART-uido-eni-rchangel-ichael-efeating-atan",
  photoSha1:"dfcaee8ee34422c3863332a58154466d9ac7c54a",
  file:"GuidoReni_MichaelDefeatsSatan.jpg",
  rightsTier:"COMMONS_PD_ART",editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL"
 }
];
export const FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS=Object.freeze(Object.fromEntries(
 sourceRows.map(row=>[row.date,Object.freeze(row)])
));
export function frozenSelected2026HomeArtwork(date,principalId,properPath){
 const x=FROZEN_SELECTED_2026_EXACT_WORK_PREVIEWS[date];
 if(!x||x.principalId!==principalId||x.properPath!==properPath)return null;
 const encoded=encodeURIComponent(x.file).replaceAll("'","%27");
 const url="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encoded+"?width=960";
 return Object.freeze({
  date,principalId,properPath,artworkId:x.artworkId,
  title:x.title,artist:x.artist,
  source:"https://commons.wikimedia.org/wiki/File:"+encoded,
  image:url,infoImage:url,
  rights:x.rightsTier==="COMMONS_CC0_SOURCE"
   ?"Commons source photograph CC0; not a locally certified original or approved mobile crop"
   :"Commons PD-Art reproduction; jurisdiction dependent; not a locally certified original or approved mobile crop",
  imageStatus:"REMOTE_FROZEN_SELECTED_EXACT_WORK_PREVIEW_NOT_OFFLINE_CERTIFIED",
  selectionKind:"PREVIOUSLY_SELECTED_2026_FROZEN_EXACT_WORK_PREVIEW",
  artworkSourceWorkGroupId:x.workGroupId,sourcePhotoSha1:x.photoSha1,
  editorialBasis:x.editorialBasis
 });
}
