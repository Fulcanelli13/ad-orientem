/**
 * Date-specific 1960 Roman Breviary Compline appointments.
 *
 * The calendar is intentionally an explicit tiny research whitelist.
 * No broad inference from Mass calendars, Sunday-number arithmetic or
 * seasonal strings; feast rank is decisive (1960 BR 166,168,169,171).
 * Local calendars, special Offices and proper exceptions remain withheld.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";
import {resolveSourceFirstComplineOrdo,researchWitnessForReviewedAdventCompline}
 from "./office-ordo-compline-resolver.js";
export const OFFICE_COMPLINE_APPOINTMENTS_SCHEMA="ao.office.2026-advent-i-compline-appointed-week.v1";
export const ADVENT_I_COMPLINE_APPOINTMENTS=Object.freeze([
 Object.freeze({date:"2026-11-28",weekday:"Sabbato",psalmDay:"Sabbato",
  marianSection:"Advent",label:"Saturday Compline · Eve of Advent I",
  rubricalReason:"FIRST_VESPERS_OF_ADVENT_SUNDAY_COMPLINE_SATURDAY_BR166_B",
  officeClass:"SUNDAY_FIRST_VESPERS"}),
 Object.freeze({date:"2026-11-29",weekday:"Dominica",psalmDay:"Dominica",
  marianSection:"Advent",label:"Sunday Compline · First Sunday of Advent",
  rubricalReason:"ADVENT_SUNDAY_COMPLINE_SUNDAY_BR166_H",
  officeClass:"I_SUNDAY"}),
 Object.freeze({date:"2026-11-30",weekday:"Feria II",psalmDay:"Dominica",
  marianSection:"Advent",label:"Compline · St Andrew the Apostle",
  rubricalReason:"ST_ANDREW_APOSTLE_II_CLASS_SUNDAY_COMPLINE_BR168_D",
  officeClass:"II_FEAST"}),
 Object.freeze({date:"2026-12-01",weekday:"Feria III",psalmDay:"Feria III",
  marianSection:"Advent",label:"Tuesday Compline · First Week of Advent",
  rubricalReason:"ADVENT_FERIA_TUESDAY_CURRENT_WEEKDAY_BR171_E",
  officeClass:"FERIA"}),
 Object.freeze({date:"2026-12-02",weekday:"Feria IV",psalmDay:"Feria IV",
  marianSection:"Advent",label:"Compline · St Bibiana",
  rubricalReason:"ST_BIBIANA_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  officeClass:"III_FEAST"}),
 Object.freeze({date:"2026-12-03",weekday:"Feria V",psalmDay:"Feria V",
  marianSection:"Advent",label:"Compline · St Francis Xavier",
  rubricalReason:"ST_FRANCIS_XAVIER_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  officeClass:"III_FEAST"}),
 Object.freeze({date:"2026-12-04",weekday:"Feria VI",psalmDay:"Feria VI",
  marianSection:"Advent",label:"Compline · St Peter Chrysologus",
  rubricalReason:"ST_PETER_CHRYSOLOGUS_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  officeClass:"III_FEAST"}),
 Object.freeze({date:"2026-12-05",weekday:"Sabbato",psalmDay:"Sabbato",
  marianSection:"Advent",label:"Saturday Compline · Eve of Advent II",
  rubricalReason:"FIRST_VESPERS_OF_ADVENT_SUNDAY_COMPLINE_SATURDAY_BR166_B",
  officeClass:"SUNDAY_FIRST_VESPERS"})
]);
const set=new Set(ADVENT_I_COMPLINE_APPOINTMENTS.map(x=>x.date));
if(set.size!==ADVENT_I_COMPLINE_APPOINTMENTS.length)
 throw Error("OFFICE_COMPLINE_DUPLICATE_APPOINTMENT");
export function reviewAdventIComplineAppointment(date){
 const r=ADVENT_I_COMPLINE_APPOINTMENTS.find(x=>x.date===date);
 if(!r)return Object.freeze({
  schema:OFFICE_COMPLINE_APPOINTMENTS_SCHEMA,status:"WITHHELD",
  reason:"DATE_OR_RUBRIC_NOT_REVIEWED",appointment:null,
  publishable:false,published:false
 });
 const dow=new Date(date+"T12:00:00Z").getUTCDay();
 const days=["Dominica","Feria II","Feria III","Feria IV",
  "Feria V","Feria VI","Sabbato"];
 if(days[dow]!==r.weekday)return Object.freeze({
  schema:OFFICE_COMPLINE_APPOINTMENTS_SCHEMA,status:"WITHHELD",
  reason:"CIVIL_DATE_WEEKDAY_MISMATCH",appointment:null,
  publishable:false,published:false
 });
 // The general Office-only resolver is now a second deterministic gate
 // over all eight historically reviewed appointments. It MUST agree with
 // the existing dated certificate before any of these eight dates can
 // reach the separate public Latin approval gate.
 const officeOrdo=resolveSourceFirstComplineOrdo({
  date,record:researchWitnessForReviewedAdventCompline(r)
 });
 if(officeOrdo.status!=="OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY"||
    officeOrdo.appointment?.weekday!==r.weekday||
    officeOrdo.appointment?.psalmDay!==r.psalmDay||
    officeOrdo.appointment?.marianSection!==r.marianSection||
    officeOrdo.appointment?.sourceId!==
     "ao.office.2026-advent-i-dated-review|"+date)
  return Object.freeze({
   schema:OFFICE_COMPLINE_APPOINTMENTS_SCHEMA,status:"WITHHELD",
   reason:"OFFICE_ORDO_RESOLVER_DISAGREES_WITH_DATED_APPOINTMENT",
   appointment:null,publishable:false,published:false
  });
 return Object.freeze({
  schema:OFFICE_COMPLINE_APPOINTMENTS_SCHEMA,
  status:"EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH",
  officeOrdoResearch:officeOrdo,
  appointment:r,sourceRevision:PIN,
  officeCompletenessCertified:false,translationsApproved:false,
  rightsApproved:false,publishable:false,published:false
 });
}
