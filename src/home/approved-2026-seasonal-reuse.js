/* Class IV ferias/BVM Saturdays and 34 seasonal Class III ferias: reuse released originals.
 * This is editorial CONTEXT artwork (season / devotional theme), not an
 * illustration of the appointed Gospel and not a new feast-specific approval.
 * Only the exact resolved 1962 principal for an enumerated 2026 date qualifies.
 * Protected dates, Class I-III artwork, and unpublished research cannot enter here.
 */
import {annualHomeArtworkDay2026} from "./annual-home-artwork-2026.js";
import {RELEASED_MODULE_PAINTINGS} from "../art/released-module-paintings.v1.js";

function moduleFor(day){
 if(day.principalId.startsWith("commune:C10"))return "heart-mary";
 const date=day.date;
 if(date<="2026-01-12")return "visit";        // Christmas / Epiphany context
 if(date<="2026-01-31")return "joseph";       // Holy Family context
 if(date<="2026-03-28")return "confession";  // Septuagesima / Lent penitential context
 if(date>="2026-12-01"&&date<="2026-12-15")return "angelus"; // Advent
 if(date>="2026-04-15"&&date<="2026-05-22")return "regina"; // Paschaltide
 if(date>="2026-06-02"&&date<="2026-06-16")return "adoration"; // Eucharistic
 if(date>="2026-11-01"&&date<="2026-11-28")return "souls"; // November souls
 const weekday=new Date(date+"T12:00:00Z").getUTCDay();
 return ({1:"joseph",2:"adoration",3:"angelus",4:"adoration",5:"heart-jesus"}[weekday])??"adoration";
}
export function approved2026SeasonalHomeReuse(date,principalId,properPath){
 const day=annualHomeArtworkDay2026(date,principalId);
 if(!day||!day.contextualReuseEligible||day.selection||!properPath||
    !/^(?:Tempora|Sancti|Commune)\//.test(properPath))return null;
 const moduleId=moduleFor(day);
 const photo=RELEASED_MODULE_PAINTINGS[moduleId];
 if(!photo||!Number.isInteger(photo.releasePr)||!photo.title||!photo.artist||
    !/^assets\/(?:prayer|home)\/.+\.(?:jpg|jpeg|png|webp)$/.test(photo.image??"")||
    !/^https:\/\//.test(photo.source??"")||
    !/public.domain|PD-Art|CC0/i.test(photo.photographRights??""))return null;
 return Object.freeze({
  date,principalId,properPath,artworkId:"released-photo:"+moduleId,
  title:photo.title,artist:photo.artist,source:photo.source,
  image:"/"+photo.image,infoImage:"/"+photo.original,
  rights:photo.photographRights,releasePr:photo.releasePr,
  imageStatus:"PREVIOUSLY_RELEASED_LOCAL_ORIGINAL_AS_CONTEXT",
  selectionKind:"SEASONAL_CONTEXT_NOT_GOSPEL_SCENE",
  liturgicalContext:day.principalId.startsWith("commune:C10")
    ?"MARIAN_SATURDAY":day.rank==="III"
    ?"CLASS_III_LENTEN_OR_ADVENT_FERIA":"FERIAL_SEASON_OR_DEVOTIONAL_CONTEXT",
  explicitGospelSceneMatch:false
 });
}
