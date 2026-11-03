/**
 * Single publication-aware adapter for the 267-slot corrected Prayer art master.
 * An approved WORK is not a cleared PHOTOGRAPH; neither a thematic match nor a
 * second use can silently override a final cover, rejection or scope restriction.
 */
import {prayerEditorialSlot,PRAYER_ART_EDITORIAL_SLOTS_V1,PRAYER_ART_EDITORIAL_PROVENANCE_V1} from "./editorial-artwork-assignments.v1.js";
import {RELEASED_MODULE_PAINTINGS,releasedModulePhotoMarkup} from "../art/released-module-paintings.v1.js";

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
