/**
 * Nine discovery door subject/rotation rules from the 30 October workbook.
 * Artwork selection now comes from the corrected 267-slot editorial master,
 * with the 1 November Claude discrepancy decisions and explicit scope holds.
 * This is still NOT a licence to display an unverified photograph.
 */
import {resolvePrayerEditorialArtwork} from "./editorial-artwork-resolver.v1.js";
export const PRAY_DOOR_ART_SLOT_SCHEMA_V1="AO_PRAY_DOOR_ART_SLOT_MAP_V1";
const entry=(slotId,subjectCodes,rotation)=>{
  const editorial=resolvePrayerEditorialArtwork(slotId);
  return Object.freeze({
    slotId,level:"Door cover",priority:"A",
    subjectCodes:Object.freeze(subjectCodes.split(",")),
    rotation,poolMin:4,poolIdeal:12,
    editorialSource:"CURATORIAL_MASTER_267_PR2144",
    editorialAssigned:editorial.editorial?.approvedOrInherited===true,
    publicationState:editorial.state
  });
};
export const PRAY_DOOR_ART_SLOTS_V1=Object.freeze({
  daily:entry("DOOR-D1","NAT-DAWN,NAT-DUSK,LIFE-PRAYER,LIFE-WORK","R-TIME"),
  library:entry("DOOR-D2","CHR-TEACHING,TRI-TRINITY","R-WEEK"),
  chaplets:entry("DOOR-D3","MAR-ROSARY,MAR-MADONNA,NAT-FLOWERS","R-WEEKDAY"),
  novenas:entry("DOOR-D4","LIFE-PILGRIM,CHR-APPEAR","R-WEEK"),
  eucharistic:entry("DOOR-D5","EUC-SUPPER,EUC-MONSTRANCE,NAT-HARVEST","R-WEEKDAY"),
  ourlord:entry("DOOR-D6","CHR-KING,CHR-SACREDHEART,CHR-CRUCIFIX,CHR-RESURRECT","R-SEASON"),
  marian:entry("DOOR-D7","MAR-MADONNA,MAR-CORONATION,MAR-IMMACULATE","R-MONTH"),
  saints:entry("DOOR-D8","SNT-ALLSAINTS,ANG-GUARDIAN,ANG-MICHAEL,JOS-PORTRAIT","R-WEEKDAY"),
  intentions:entry("DOOR-D9","LIFE-FAMILY,LIFE-SICK,CHR-MIRACLE,END-PURGATORY","R-WEEK"),
});
export function prayerDoorArtSlot(id){
  return Object.hasOwn(PRAY_DOOR_ART_SLOTS_V1,String(id||""))
    ?PRAY_DOOR_ART_SLOTS_V1[id]:null;
}
/** Fail closed: a mapping row alone is never a publishable painting. */
export function hasReleasedDoorPainting(candidate){
  if(!candidate||typeof candidate!=="object")return false;
  // Only this exact trusted registry join may prove already released photos.
  if(candidate.editorialSource==="CURATORIAL_MASTER_267_PR2144"
    &&candidate.publicationState==="PUBLISHED_EXACT_PHOTO"){
    const current=resolvePrayerEditorialArtwork(candidate.slotId);
    return current.state==="PUBLISHED_EXACT_PHOTO"&&!!current.photo;
  }
  // Historical candidate QA contract remains fail-closed.
  const proof=candidate.releaseEvidence;
  return candidate.publicationState==="READY_FOR_PUBLICATION"
    &&candidate.editorialApproved===true
    &&proof?.exactObjectVerified===true
    &&proof?.rightsForActualFileCleared===true
    &&typeof proof?.sourceOriginalSha256==="string"&&/^[a-f0-9]{64}$/i.test(proof.sourceOriginalSha256)
    &&proof?.visualQualityHumanPassed===true
    &&proof?.physicalFrameAbsent===true
    &&proof?.gallerySurroundAbsent===true
    &&proof?.paintingSurfaceComplete===true
    &&proof?.paintingBoundsVerified===true
    &&proof?.noSyntheticFill===true
    &&proof?.responsiveCropApproved===true
    &&proof?.appRenderVerified===true;
}
