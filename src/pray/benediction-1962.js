/** 1961 Graduale Romanum / 1962 use: Panem de caelo at Benediction.
 * The chant book specifies Alleluia during Paschal time and on the feast
 * of Corpus Christi, not unconditionally or for the abolished octave.
 * Projects the existing canonical prayer; does not own it.
 */
import {buildLiturgicalYear,addDaysIso} from "../calendar/liturgical-year.js";

export const BENEDICTION_1962_WITNESS=Object.freeze({
 url:"https://media.musicasacra.com/pdf/ordinarium_Missae1961.pdf",
 rubric:"Extra Tempus Paschale et Festum Corporis Christi, non dicitur Alleluia.",
 version:"Graduale Romanum · Ordinarium Missae (1961) · Ad Processionem Corporis Christi"
});
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
export function benedictionAlleluiaStatus(dateId){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(dateId||"")))
  return Object.freeze({known:false,alleluia:false,reason:"date-unavailable"});
 const d=new Date(dateId+"T12:00:00");
 if(Number.isNaN(d.getTime())||iso(d)!==dateId)
  return Object.freeze({known:false,alleluia:false,reason:"invalid-date"});
 const year=buildLiturgicalYear(dateId);
 const paschal=dateId>=year.easter&&dateId<=addDaysIso(year.pentecost,6);
 const corpus=dateId===addDaysIso(year.pentecost,11);
 return Object.freeze({known:true,alleluia:paschal||corpus,
  reason:paschal?"paschal-time":corpus?"corpus-christi":"outside-specified-time",dateId});
}

export function benedictionVersiclesForDate(prayer,dateId){
 if(!prayer||!["en","fr","la"].every(k=>typeof prayer[k]==="string"))
  throw new TypeError("Canonical Benediction versicle languages are unavailable");
 const context=benedictionAlleluiaStatus(dateId);
 const insert=(value,word)=>{
  if(!context.alleluia)return value;
  let seen=0;
  return value.replace(/^(℣\.?|V\.?|℟\.?|R\.?)([^\n]*)/gm,(line,marker,rest)=>{
   if(seen++>=2)return line;
   return marker+rest.replace(/[.\s]+$/,"")+", "+word+".";
  });
 };
 return Object.freeze({
  id:"benediction_versicles",
  en:insert(prayer.en,"alleluia"),
  fr:insert(prayer.fr,"alléluia"),
  la:insert(prayer.la,"allelúia"),
  context,
  source:BENEDICTION_1962_WITNESS.url
 });
}
