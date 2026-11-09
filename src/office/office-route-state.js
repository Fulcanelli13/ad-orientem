/**
 * Native Office route: existence and source research are not publication.
 * The independent Office ordo must certify each date and Hour before an
 * approved text projection can be enabled. Never borrow a Mass calendar.
 */
import {reviewAdventIComplineAppointment} from "./compline-advent-2026-appointments.js";
import {latinComplineReleaseEligibility} from "./latin-compline-public-release.js";
import {reviewChristmas2026LatinComplineCertificate}
 from "./compline-christmas-2026-release-certificate.js";
import {reviewDec28Jan03LatinComplineCertificate}
 from "./compline-dec28-jan03-2027-release-certificate.js";
import {reviewEpiphany2027FiveDayLatinCertificate}
 from "./compline-epiphany-jan04-08-2027-release-certificate.js";

export const ROMAN_OFFICE_HOURS=Object.freeze([
 Object.freeze({id:"MATINS",name:"Matins",latin:"Matutinum"}),
 Object.freeze({id:"LAUDS",name:"Lauds",latin:"Laudes"}),
 Object.freeze({id:"PRIME",name:"Prime",latin:"Prima"}),
 Object.freeze({id:"TERCE",name:"Terce",latin:"Tertia"}),
 Object.freeze({id:"SEXT",name:"Sext",latin:"Sexta"}),
 Object.freeze({id:"NONE",name:"None",latin:"Nona"}),
 Object.freeze({id:"VESPERS",name:"Vespers",latin:"Vesperae"}),
 Object.freeze({id:"COMPLINE",name:"Compline",latin:"Completorium"})
]);
const IDS=new Set(ROMAN_OFFICE_HOURS.map(row=>row.id));
export function officeRouteState({date,hour,calendarScope="UNIVERSAL"}={}){
 const withheld=reason=>Object.freeze({date,hour,status:"WITHHELD",reason,
   officeDate:null,sourceResearch:false,readingEnabled:false,published:false});
 if(typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date)||
    Number.isNaN(Date.parse(date+"T12:00:00Z"))||
    new Date(date+"T12:00:00Z").toISOString().slice(0,10)!==date)
   return withheld("INVALID_DATE");
 if(!IDS.has(hour))return withheld("UNKNOWN_HOUR");
 if(calendarScope!=="UNIVERSAL")return withheld("LOCAL_OFFICE_NOT_RESOLVED");
 if(hour==="COMPLINE"){
   const released=latinComplineReleaseEligibility({date,hour,calendarScope});
   if(released.status==="ELIGIBLE"){
    const christmas=reviewChristmas2026LatinComplineCertificate(date);
    const yearBoundary=reviewDec28Jan03LatinComplineCertificate(date);
    const epiphany=reviewEpiphany2027FiveDayLatinCertificate(date);
    const appointment=epiphany.status==="EXPLICIT_EPIPHANY_JAN04_08_LATIN_TEXT_CERTIFIED"?
      epiphany.profile:
      yearBoundary.status==="EXPLICIT_FINITE_YEAR_BOUNDARY_LATIN_CERTIFIED"?
      yearBoundary.profile:
      christmas.status==="EXPLICIT_FINITE_ROMAN_1960_LATIN_TEXT_CERTIFIED"?
      christmas.profile:reviewAdventIComplineAppointment(date).appointment;
    if(!appointment)return withheld("SOURCE_CERTIFICATE_PROFILE_MISSING");
    return Object.freeze({date,hour,status:"RELEASED",
      reason:"PRINTED_LATIN_COMPLINE_CERTIFIED",
      label:appointment.label,
      officeDate:appointment.officeDate??date,
      sourceRevision:released.sourceRevision,
      sourceResearch:true,readingEnabled:true,published:true});
   }
   const appointment=reviewAdventIComplineAppointment(date);
   if(appointment.status==="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH"){
     return Object.freeze({date,hour,status:"SOURCE_RESEARCH_ONLY",
       reason:"COMPLINE_APPOINTMENT_AND_TRILINGUAL_PARSER_REVIEWED",
       label:appointment.appointment.label,officeDate:date,sourceRevision:appointment.sourceRevision,
       sourceResearch:true,readingEnabled:false,published:false});
   }
 }
 if(hour==="VESPERS"&&date==="2026-11-28"){
   return Object.freeze({date,hour,status:"SOURCE_RESEARCH_ONLY",
     reason:"ADVENT_I_FIRST_VESPERS_PRIVATE_PILOT",
     label:"First Vespers of Advent I (Office date 29 November)",
     officeDate:"2026-11-29",
     sourceResearch:true,readingEnabled:false,published:false});
 }
 return withheld("INDEPENDENT_OFFICE_APPOINTMENT_NOT_CERTIFIED");
}
