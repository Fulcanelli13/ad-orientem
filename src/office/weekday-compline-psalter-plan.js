/**
 * Source-first Roman 1960 Compline psalter profile, WITHOUT assigning any
 * feast/date or choosing the Marian antiphon from the civil calendar.
 *
 * Each seven-day pattern is an exact appointment from pinned three-language
 * Psalterium/Psalmi/Psalmi minor#Completorium. Any disagreement across languages
 * is withheld. A selected 1960 Office's feria/festive rubric must be reviewed
 * independently (Sunday psalms apply at I/II class feasts).
 *
 * The season-key is an explicit input from an independent Office ordo. This
 * module never infers seasons from the Mass calendar.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";

export const OFFICE_WEEKLY_COMPLINE_PLAN="ao.office.weekday-compline-pinned-psalter.v1";
export const COMPLINE_PSALTER_WEEKDAYS=Object.freeze([
 "Dominica","Feria II","Feria III","Feria IV",
 "Feria V","Feria VI","Sabbato"
]);
export const COMPLINE_MARIAN_SOURCE_SECTIONS=Object.freeze([
 "Advent","Nativiti","Quadragesimae","Paschalis","Postpentecost"
]);
const SPEC=Object.freeze({
 "Dominica":"4,90,133",
 "Feria II":"6,7(2-10),7(11-18)",
 "Feria III":"11,12,15",
 "Feria IV":"33(2-11),33(12-23),60",
 "Feria V":"69,70(1-12),70(13-24)",
 "Feria VI":"76(2-13),76(14-21),85",
 "Sabbato":"87,102(1-12),102(13-22)"
});
function withhold(reason){
 return Object.freeze({
  schema:OFFICE_WEEKLY_COMPLINE_PLAN,status:"WITHHELD",reason,
  segments:Object.freeze([]),sourceRevision:PIN,
  appointmentVerified:false,completeHourCertified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
export function planWeeklyComplinePsalter({
  weekday,marianSection,sourceSections
}={}){
 if(!COMPLINE_PSALTER_WEEKDAYS.includes(weekday))
  return withhold("COMPLINE_FERIA_NOT_APPOINTED");
 if(!COMPLINE_MARIAN_SOURCE_SECTIONS.includes(marianSection))
  return withhold("COMPLINE_MARIAN_SEASON_NOT_APPOINTED");
 if(!sourceSections||!["la","en","fr"].every(l=>
   Array.isArray(sourceSections[l])&&sourceSections[l].length>=14))
  return withhold("COMPLINE_PINNED_WEEKDAY_SOURCE_UNAVAILABLE");
 let antiphons={},sequences={};
 for(const lang of ["la","en","fr"]){
  const rows=sourceSections[lang],i=rows.findIndex(
   line=>line.startsWith(weekday+" = "));
  if(i<0||i+1>=rows.length)return withhold("COMPLINE_FERIA_SOURCE_ROW_MISSING:"+lang);
  const antiphon=rows[i].slice((weekday+" = ").length).trim();
  const psalms=rows[i+1].trim().replace(/\s+/gu,"");
  if(!antiphon||psalms!==SPEC[weekday])
   return withhold("COMPLINE_FERIA_SOURCE_IDENTITY_CHANGED:"+lang);
  if(/[$@&<>]/u.test(antiphon))
   return withhold("COMPLINE_ANTIPHON_SOURCE_DIRECTIVE_UNRESOLVED");
  antiphons[lang]=antiphon;
  sequences[lang]=psalms;
 }
 const segments=SPEC[weekday].split(",").map((part,i)=>{
  const m=/^(\d+)(?:\((\d+)-(\d+)\))?$/u.exec(part);
  if(!m)throw Error("COMPLINE_FERIA_PINNED_PSALM_SPEC_INVALID");
  return Object.freeze({
   index:i,number:Number(m[1]),
   start:m[2]?Number(m[2]):null,end:m[3]?Number(m[3]):null,
   spec:part,
   sourcePath:"Psalterium/Psalmorum/Psalm"+m[1]
  });
 });
 return Object.freeze({
  schema:OFFICE_WEEKLY_COMPLINE_PLAN,
  status:"SOURCE_FIRST_WEEKDAY_PSALTER_APPOINTMENT_RESEARCH_ONLY",
  weekday,marianSection,sourceRevision:PIN,
  sourceId:"Psalterium/Psalmi/Psalmi minor#Completorium",
  antiphons:Object.freeze(antiphons),
  segments:Object.freeze(segments),
  psalmIds:Object.freeze([...new Set(segments.map(x=>x.number))]),
  originalPinnedPsalmSpecification:SPEC[weekday],
  appointmentVerified:false,completeHourCertified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
