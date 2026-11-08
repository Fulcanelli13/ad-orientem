/**
 * Native Office route: existence and source research are not publication.
 * The independent Office ordo must certify each date and Hour before an
 * approved text projection can be enabled. Never borrow a Mass calendar.
 */
import {reviewAdventIComplineAppointment} from "./compline-advent-2026-appointments.js";

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
