/**
 * Production Home 2026 — source-owned *existing approved* date images.
 *
 * Do not confuse the research corpus's 362 provisional leads with images
 * allowed to render. Only exact canonical 1962 date/principal/Proper
 * witnesses and already recorded editorial artwork approvals may be used.
 */
import {approvedClassIHeroForDate} from "../calendar/approved-class-i-heroes-2026.js";
import {releasedDateGospelHero2026} from "./released-date-gospel-heroes-2026.js";

const CLASS_I_PROPER=Object.freeze({
 "2026-03-29":"Tempora/Quad6-0r",
 "2026-04-02":"Tempora/Quad6-4r",
 "2026-05-23":"Tempora/Pasc6-6",
 "2026-05-24":"Tempora/Pasc7-0",
 "2026-05-27":"Tempora/Pasc7-3",
 "2026-06-12":"Tempora/Pent02-5",
 "2026-11-01":"Sancti/11-01",
 "2026-11-02":"Sancti/11-02m1"
});
/**
 * Ash Wednesday selection is not a new research recommendation:
 * 2026-10-20 original 53-day date-specific painting overlay, preserved in
 * data/artwork/2026-prior-date-artwork-evidence.v1.json.
 *
 * Exactly Met painting #436839, accession 1978.517, not another Magdalen.
 * Photograph: the Met Open Access CC0 Commons archive. This is an
 * uncached REMOTE PREVIEW, not an offline master or approved mobile crop.
 * Publishing the preview does not certify its availability at any later date.
 */
const ASH_WEDNESDAY=Object.freeze({
 date:"2026-02-18",principalId:"tempora:Quadp3-3:1:v",
 properPath:"Tempora/Quadp3-3",artworkId:"met-436839",
 title:"The Penitent Magdalen",artist:"Georges de La Tour",
 source:"https://www.metmuseum.org/art/collection/search/436839",
 image:"https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Penitent_Magdalen_MET_DT7252.jpg?width=960",
 imageSource:"https://commons.wikimedia.org/wiki/File:The_Penitent_Magdalen_MET_DT7252.jpg",
 rights:"The Met Open Access CC0 · remote Commons Met photograph",
 editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL_2026-10-20",
 imageStatus:"REMOTE_CC0_SOURCE_PREVIEW_NOT_OFFLINE_CERTIFIED"
});
export const EXTRA_RELEASED_2026_HOME_DATE_PREVIEWS=Object.freeze({
 "2026-02-18":ASH_WEDNESDAY
});
const iso=/^2026-\d{2}-\d{2}$/;
function exactResolved(state){
 const date=state?.selectedDate,r=state?.resolution;
 if(!iso.test(date??"")||state?.resolving||!r||r.date!==date||
    r.status==="failed"||!r.day?.main?.id)return null;
 const sourcePath=r.proper?.sourcePath??r.proper?.data?.sourcePath??null;
 if(!["ready","READY"].includes(r.proper?.status)||!sourcePath)return null;
 return {date,principalId:r.day.main.id,properPath:sourcePath};
}
function classIPathAccepts(date,expected,actual){
 return actual===expected||(date==="2026-11-02"&&/^Sancti\/11-02m[23]$/.test(actual));
}
export function approved2026HomeArtwork(state,provider=null){
 const observed=exactResolved(state);
 if(!observed)return null;
 const {date,principalId,properPath}=observed;
 const locked=approvedClassIHeroForDate(date,principalId);
 if(locked){
  const expected=CLASS_I_PROPER[date];
  if(!expected||!classIPathAccepts(date,expected,properPath))return null;
  // Source rights holds are protected even when the PAINTING was approved.
  if(locked.imagePublicationStatus!=="REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED"||
     !/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(locked.image??"")||
     !/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(locked.source??""))return null;
  return Object.freeze({
   date,principalId,properPath,artworkId:locked.artworkId,
   title:locked.title,artist:locked.artist,source:locked.source,
   image:locked.image,infoImage:locked.image,
   imageStatus:locked.imagePublicationStatus,
   rights:"Commons public-domain preview · offline image not certified",
   selectionKind:"PREVIOUSLY_APPROVED_CLASS_I_DATE"
  });
 }
 const extra=EXTRA_RELEASED_2026_HOME_DATE_PREVIEWS[date];
 if(extra){
  if(extra.principalId!==principalId||extra.properPath!==properPath)return null;
  return Object.freeze({
   date,principalId,properPath,artworkId:extra.artworkId,
   title:extra.title,artist:extra.artist,source:extra.source,
   image:extra.image,infoImage:extra.image,rights:extra.rights,
   imageStatus:extra.imageStatus,selectionKind:"PREVIOUSLY_APPROVED_ASH_WEDNESDAY_DATE"
  });
 }
 const released=releasedDateGospelHero2026(state,provider??{
  properPath:()=>properPath
 });
 if(!released)return null;
 return Object.freeze({
  date,principalId,properPath,artworkId:released.artworkId,
  title:released.title,artist:released.artist,source:released.source,
  image:released.image,infoImage:released.original,
  rights:released.photographRights,imageStatus:"RELEASED_LOCAL_CC0_MODULE_IMAGE",
  selectionKind:"EXACT_GOSPEL_PREVIOUSLY_RELEASED_MODULE_IMAGE"
 });
}
export function renderApproved2026HomeArtwork(slot,state,win=globalThis){
 if(!slot||!win?.document?.createElement)return null;
 const chosen=approved2026HomeArtwork(state);
 if(!chosen)return null;
 const img=win.document.createElement("img");
 img.className="aoC3DatedImage";
 img.src=chosen.image;img.alt=chosen.title+" — "+chosen.artist;
 img.loading="eager";img.decoding="async";img.referrerPolicy="no-referrer";
 img.dataset.aoHomeAuthoritativeDate=chosen.date;
 img.dataset.aoHomeAuthoritativeArtwork=chosen.artworkId;
 img.dataset.aoHomeImageStatus=chosen.imageStatus;
 if(chosen.selectionKind==="EXACT_GOSPEL_PREVIOUSLY_RELEASED_MODULE_IMAGE"){
  img.dataset.aoReleasedGospelDate=chosen.date;
  img.dataset.aoReleasedGospelArtwork=chosen.artworkId;
 }
 slot.replaceChildren(img);
 const hero=slot.closest?.(".aoTodayV2Frontispiece");
 hero?.classList?.remove("aoTodayV2ArtMissing");
 img.addEventListener("error",()=>{
  // A dead remote URL is never a valid hero. Fail text-only, not a broken image.
  if(!img.isConnected)return;
  slot.replaceChildren();
  hero?.classList?.add("aoTodayV2ArtMissing");
  const info=hero?.querySelector?.('[data-home-c3-info="mass"]');
  if(info){info.hidden=true;info.__c3Artwork=null;}
 },{once:true});
 return chosen;
}
