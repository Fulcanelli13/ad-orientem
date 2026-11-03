/**
 * Nine discovery door subject/rotation rules from the 30 October workbook.
 * Artwork selection now comes from the corrected 267-slot editorial master,
 * with the 1 November Claude discrepancy decisions and explicit scope holds.
 * This is still NOT a licence to display an unverified photograph.
 */
import {prayerEditorialSlot,PRAYER_ART_EDITORIAL_SLOTS_V1,PRAYER_ART_EDITORIAL_PROVENANCE_V1} from "./editorial-artwork-assignments.v1.js";
import {RELEASED_MODULE_PAINTINGS,releasedModulePhotoMarkup} from "../art/released-module-paintings.v1.js";

/**
 * Single publication-aware adapter for the 267-slot corrected Prayer art master.
 * An approved WORK is not a cleared PHOTOGRAPH; neither a thematic match nor a
 * second use can silently override a final cover, rejection or scope restriction.
 */

const sources = new Map();
for(const [artId,photo] of Object.entries(RELEASED_MODULE_PAINTINGS)){
  if(photo.source && !sources.has(photo.source))sources.set(photo.source,Object.freeze({artId,photo}));
}
// Exactly documented non-URL match: 1962 Holy Eucharist door selection
// uses the Met original ID but its 1 Nov master has no sourcePage.
const PINNED_IDENTITIES=Object.freeze({
  "DOOR-D5":Object.freeze({
    artId:"adoration",artist:"Jean Auguste Dominique Ingres",
    title:"The Virgin Adoring the Host"
  })
});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nonPublishing=(slot,state)=>Object.freeze({slotId:slot?.slot||null,state,editorial:slot||null,artId:null,photo:null});
export {PRAYER_ART_EDITORIAL_PROVENANCE_V1};
export function resolvePrayerEditorialArtwork(slotId){
  const slot=prayerEditorialSlot(slotId);
  if(!slot)return nonPublishing(null,"UNKNOWN_SLOT");
  if(slot.hold)return nonPublishing(slot,slot.explicitScopeHold?"SCOPE_HOLD":"EDITORIAL_HOLD");
  if(slot.protectedCover)return nonPublishing(slot,"PROTECTED_EXISTING_COVER");
  if(!slot.approvedOrInherited || slot.editorialStatus==="PROVISIONAL_NEW_REVIEW_NEEDED")
    return nonPublishing(slot,"PROVISIONAL_NOT_PUBLISHED");
  if(!slot.selected)return nonPublishing(slot,"INHERITED_POOL_NO_FIXED_PAINTING");
  if(!slot.sourceIdentityVerified)return nonPublishing(slot,"SOURCE_IDENTITY_UNVERIFIED");
  let found=slot.selected.sourcePage?sources.get(slot.selected.sourcePage):null;
  if(!found){
    const fixed=PINNED_IDENTITIES[slot.slot];
    const work=slot.selected;
    if(fixed && work.artist===fixed.artist && work.title===fixed.title && RELEASED_MODULE_PAINTINGS[fixed.artId])
      found={artId:fixed.artId,photo:RELEASED_MODULE_PAINTINGS[fixed.artId]};
  }
  if(!found)return nonPublishing(slot,"APPROVED_EXACT_PHOTO_PENDING");
  return Object.freeze({slotId:slot.slot,state:"PUBLISHED_EXACT_PHOTO",
    editorial:slot,artId:found.artId,photo:found.photo});
}
export function prayerEditorialArtworkMarkup(slotId,{className=""}={}){
  const x=resolvePrayerEditorialArtwork(slotId);
  if(!x.photo)return "";
  const cls=String(className).replace(/[^A-Za-z0-9 _-]/g,"");
  return '<div class="aoEditorialArtworkSlot" data-ao-editorial-slot="'+esc(x.slotId)+'" data-ao-editorial-source="released-exact">'+
    releasedModulePhotoMarkup(x.artId,{className:cls})+'</div>';
}
export function prayerEditorialPublicationSummary(){
  const states={};
  for(const slotId of Object.keys(PRAYER_ART_EDITORIAL_SLOTS_V1)){
    const key=resolvePrayerEditorialArtwork(slotId).state;
    states[key]=(states[key]||0)+1;
  }
  return Object.freeze({total:Object.keys(PRAYER_ART_EDITORIAL_SLOTS_V1).length,states:Object.freeze(states)});
}

/** One documented Angelus artwork per prayer hour; a selected 25 March uses its
 * separate approved Annunciation artwork. No general-day replacement is inferred.
 */
export function angelusOpeningArtworkSlot(form,hour=12,dateKey=""){
 if(form==="regina")return "COV-pray.angelus_regina";
 if(/^\\d{4}-03-25$/.test(String(dateKey||"")))return "STG-pray.angelus-04";
 return hour===6?"STG-pray.angelus-01":hour===18?"STG-pray.angelus-03":"STG-pray.angelus-02";
}
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
