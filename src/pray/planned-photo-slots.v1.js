/**
 * Publication-gated artwork placeholder in an ACTUAL Prayer reader surface.
 *
 * Editorial approval is not photographic clearance. Until the independent
 * released photograph catalogue is updated by an approved release PR, this
 * emits a hidden, accessible-to-tests anchor only. It NEVER offers an
 * alternate preview flag or displays research originals in production.
 */
import {prayerEditorialSlot} from "./editorial-artwork-assignments.v1.js";
import {prayerEditorialArtworkMarkup,resolvePrayerEditorialArtwork} from "./art-slot-map.v1.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,
 c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>String(s??"").replace(/[^a-zA-Z0-9 _-]/g,"");
export function plannedPrayerArtworkSlot(slotId,{className="",owner=""}={}){
 const slot=prayerEditorialSlot(slotId);
 if(!slot || slot.hold || slot.protectedCover || !slot.approvedOrInherited ||
    !slot.sourceIdentityVerified || !slot.selected?.sourcePage)return "";
 // This module is not responsible for the Rosary, seasonal Home heroes, doors
 // or formerly rejected/provisional editorial choices.
 if(!/^(?:COV-|STG-)/.test(slotId)||/rosary-/i.test(slotId))return "";
 const image=prayerEditorialArtworkMarkup(slotId,{className:clean(className)});
 const ownerTag=clean(owner);
 const published=resolvePrayerEditorialArtwork(slotId).state==="PUBLISHED_EXACT_PHOTO";
 // Fail closed on inconsistent source-release state.
 if(published!==Boolean(image))throw new Error("Artwork resolver publication mismatch: "+slotId);
 if(!published)return '<span hidden data-ao-prayer-photo-pending="'+esc(slotId)+
  '" data-ao-prayer-photo-owner="'+esc(ownerTag)+'" data-ao-photo-publication="pending"></span>';
 return '<div data-ao-prayer-photo-slot="'+esc(slotId)+'" data-ao-prayer-photo-owner="'+
  esc(ownerTag)+'" data-ao-photo-publication="released">'+image+'</div>';
}
