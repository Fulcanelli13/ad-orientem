/**
 * Independently sourced finite Roman-1960 Compline appointments for
 * 6–13 December 2026, reviewed against the separate 2026 Office ordo.
 * This file grants no rights or release by itself.
 */
import {ADVENT_II_2026_ORDO_WITNESSES}
 from "./compline-advent-ii-2026-ordo-witness.js";
export const ADVENT_II_COMPLINE_APPOINTMENTS=Object.freeze([
 Object.freeze({date:"2026-12-06",weekday:"Dominica",psalmDay:"Dominica",
  marianSection:"Advent",label:"Sunday Compline · Second Sunday of Advent",
  rubricalReason:"ADVENT_II_SUNDAY_SECOND_VESPERS_BR166_H",
  officeClass:"I_SUNDAY",officeDate:"2026-12-06"}),
 Object.freeze({date:"2026-12-07",weekday:"Feria II",psalmDay:"Dominica",
  marianSection:"Advent",label:"First Compline · Immaculate Conception",
  rubricalReason:"IMMACULATE_CONCEPTION_I_CLASS_FIRST_VESPERS_BR167_B",
  officeClass:"I_FEAST_FIRST_VESPERS",officeDate:"2026-12-08"}),
 Object.freeze({date:"2026-12-08",weekday:"Feria III",psalmDay:"Dominica",
  marianSection:"Advent",label:"Compline · Immaculate Conception",
  rubricalReason:"IMMACULATE_CONCEPTION_I_CLASS_SECOND_VESPERS_BR167_H",
  officeClass:"I_FEAST",officeDate:"2026-12-08"}),
 Object.freeze({date:"2026-12-09",weekday:"Feria IV",psalmDay:"Feria IV",
  marianSection:"Advent",label:"Wednesday Compline · Second Week of Advent",
  rubricalReason:"ADVENT_II_FERIA_IV_CURRENT_WEEKDAY_BR171_E",
  officeClass:"FERIA",officeDate:"2026-12-09"}),
 Object.freeze({date:"2026-12-10",weekday:"Feria V",psalmDay:"Feria V",
  marianSection:"Advent",label:"Thursday Compline · Second Week of Advent",
  rubricalReason:"ADVENT_II_FERIA_V_CURRENT_WEEKDAY_BR171_E",
  officeClass:"FERIA",officeDate:"2026-12-10"}),
 Object.freeze({date:"2026-12-11",weekday:"Feria VI",psalmDay:"Feria VI",
  marianSection:"Advent",label:"Compline · St Damasus I",
  rubricalReason:"ST_DAMASUS_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  officeClass:"III_FEAST",officeDate:"2026-12-11"}),
 Object.freeze({date:"2026-12-12",weekday:"Sabbato",psalmDay:"Sabbato",
  marianSection:"Advent",label:"Saturday Compline · Eve of Gaudete",
  rubricalReason:"ADVENT_III_SUNDAY_FIRST_VESPERS_COMPLINE_SATURDAY_BR166_B",
  officeClass:"SUNDAY_FIRST_VESPERS",officeDate:"2026-12-13"}),
 Object.freeze({date:"2026-12-13",weekday:"Dominica",psalmDay:"Dominica",
  marianSection:"Advent",label:"Sunday Compline · Gaudete Sunday",
  rubricalReason:"GAUDETE_SUNDAY_SECOND_VESPERS_BR166_H",
  officeClass:"I_SUNDAY",officeDate:"2026-12-13"})
]);
const rubricByClass=Object.freeze({
 I_SUNDAY:"166(h)",I_FEAST_FIRST_VESPERS:"167(b)",I_FEAST:"167(h)",
 III_FEAST:"169(e)",FERIA:"171(e)",SUNDAY_FIRST_VESPERS:"166(b)"
});
export function reviewAdventII2026OrdoWitness(appointment){
 const ref=ADVENT_II_2026_ORDO_WITNESSES.find(w=>w.date===appointment?.date);
 if(!ref||ref.psalmDay!==appointment.psalmDay||
   ref.class!==appointment.officeClass||
   ref.officeDate!==appointment.officeDate||
   ref.rubric!==rubricByClass[appointment.officeClass]||
   ref.civilComplineAfter!==(
    appointment.officeDate===appointment.date?"SECOND_VESPERS":"FIRST_VESPERS")||
   ref.stichs!==(
    appointment.psalmDay==="Sabbato"?41:
    appointment.psalmDay==="Feria V"?33:
    appointment.psalmDay==="Feria VI"?36:30))
  return Object.freeze({status:"WITHHELD",reason:"DATED_OFFICE_ORDO_WITNESS_MISMATCH"});
 return Object.freeze({status:"INDEPENDENT_DATED_ROMAN_1960_ORDO_REVIEW",
  witness:ref,source:"https://breviariumgregorianum.com/ordo-2026.php",
  rightsApproved:false,publishable:false,published:false});
}
