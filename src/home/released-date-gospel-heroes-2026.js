/* Reuse one already-released, user-approved Met painting on two exact
 * 2026 Gospel days. No new image acquisition, cropping, or artwork approval.
 * The selected 1962 principal, actual resolved Proper, and Gospel must agree.
 * Never override a previously locked date-specific Class I painting.
 */
import { calendarScriptureContexts } from "../calendar/scripture-handoff.js";
import { approvedClassIHeroForDate } from "../calendar/approved-class-i-heroes-2026.js";
import { RELEASED_MODULE_PAINTINGS } from "../art/released-module-paintings.v1.js";

export const RELEASED_2026_GOSPEL_HERO_DATES=Object.freeze({
  "2026-03-25":Object.freeze({
    principalId:"sancti:03-25:1:w",
    properPath:"Sancti/03-25",
    gospel:"Luke 1:26–38",
    moduleId:"angelus",
    artworkId:"met-438724"
  }),
  "2026-12-16":Object.freeze({
    principalId:"tempora:Adv3-3:2:v",
    properPath:"Tempora/Adv3-3",
    gospel:"Luke 1:26–38",
    moduleId:"angelus",
    artworkId:"met-438724"
  })
});
const eqRef=value=>String(value??"").replace(/\s+/g," ").replaceAll("—","–")
  .replace(/(\d)-(\d)/g,"$1–$2").trim();

export function releasedDateGospelHero2026(state,provider){
 const date=state?.selectedDate,rule=RELEASED_2026_GOSPEL_HERO_DATES[date];
 if(!rule)return null;
 const resolution=state?.resolution;
 if(!resolution||resolution.date!==date||resolution.status==="failed"||
    resolution.day?.main?.id!==rule.principalId)return null;
 if(approvedClassIHeroForDate(date,rule.principalId))return null;
 if(provider?.properPath?.(state)!==rule.properPath)return null;
 const record=resolution.proper;
 if(!["ready","READY"].includes(record?.status)||
    String(record.sourcePath??record.data?.sourcePath??"")!==rule.properPath)return null;
 let gospel;
 try{gospel=calendarScriptureContexts(resolution).find(item=>
   item.slot==="GOSPEL"&&item.provenance&&item.reference);}catch{return null;}
 if(!gospel||eqRef(gospel.reference)!==eqRef(rule.gospel))return null;
 const photo=RELEASED_MODULE_PAINTINGS[rule.moduleId];
 // Only the exact already approved Met master. No new source, crop or artist.
 if(!photo||photo.source!=="https://www.metmuseum.org/art/collection/search/438724"||
    photo.image!=="assets/home/c3-approved-met/angelus-frameless.webp"||
    !photo.photographRights?.includes("CC0"))return null;
 return Object.freeze({
   date,principalId:rule.principalId,properPath:rule.properPath,
   gospelReference:gospel.reference,artworkId:rule.artworkId,
   title:photo.title,artist:photo.artist,
   source:photo.source,image:"/"+photo.image,original:"/"+photo.original,
   photographRights:photo.photographRights,releasePr:photo.releasePr,
   match:"SELECTED_1962_PROPER_AND_VERIFIED_GOSPEL_EXACT",
   sourceReuse:"PREVIOUSLY_RELEASED_MET_PHOTOGRAPH"
 });
}
