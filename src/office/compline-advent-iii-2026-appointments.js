/**
 * Seven independent Office-ordo-reviewed universal Latin Compline dates.
 * Rank, occurrence, First Vespers and seasonal Marian section are explicit.
 * This register is research only; the release manifest approves separately.
 */
import {ADVENT_III_2026_ORDO_WITNESSES,ADVENT_III_2026_ORDO_SOURCE}
 from "./compline-advent-iii-2026-ordo-witness.js";
export const ADVENT_III_COMPLINE_APPOINTMENTS=Object.freeze([
 Object.freeze({date:"2026-12-14",weekday:"Feria II",psalmDay:"Feria II",
  marianSection:"Advent",label:"Monday Compline · Third Week of Advent",
  officeClass:"FERIA",rank:"III",officeDate:"2026-12-14",
  rubricalReason:"ADVENT_III_MONDAY_FERIA_III_CLASS_BR171_E"}),
 Object.freeze({date:"2026-12-15",weekday:"Feria III",psalmDay:"Feria III",
  marianSection:"Advent",label:"Tuesday Compline · Third Week of Advent",
  officeClass:"FERIA",rank:"III",officeDate:"2026-12-15",
  rubricalReason:"ADVENT_III_TUESDAY_FERIA_III_CLASS_BR171_E"}),
 Object.freeze({date:"2026-12-16",weekday:"Feria IV",psalmDay:"Feria IV",
  marianSection:"Advent",label:"Compline · Advent Ember Wednesday",
  officeClass:"FERIA",rank:"II",officeDate:"2026-12-16",
  commemoration:"St Eusebius, Bishop and Martyr",
  rubricalReason:"ADVENT_EMBER_WEDNESDAY_II_CLASS_FERIA_BR171_E"}),
 Object.freeze({date:"2026-12-17",weekday:"Feria V",psalmDay:"Feria V",
  marianSection:"Advent",label:"Thursday Compline · O Sapientia",
  officeClass:"FERIA",rank:"II",officeDate:"2026-12-17",
  rubricalReason:"ADVENT_DEC17_PRIVILEGED_II_CLASS_FERIA_BR171_E"}),
 Object.freeze({date:"2026-12-18",weekday:"Feria VI",psalmDay:"Feria VI",
  marianSection:"Advent",label:"Compline · Advent Ember Friday",
  officeClass:"FERIA",rank:"II",officeDate:"2026-12-18",
  rubricalReason:"ADVENT_EMBER_FRIDAY_II_CLASS_FERIA_BR171_E"}),
 Object.freeze({date:"2026-12-19",weekday:"Sabbato",psalmDay:"Sabbato",
  marianSection:"Advent",label:"Saturday Compline · Eve of Advent IV",
  officeClass:"SUNDAY_FIRST_VESPERS",rank:"I_SUNDAY_CONCURRENCE",
  officeDate:"2026-12-20",
  rubricalReason:"ADVENT_IV_FIRST_VESPERS_AFTER_EMBER_SATURDAY_BR166_B"}),
 Object.freeze({date:"2026-12-20",weekday:"Dominica",psalmDay:"Dominica",
  marianSection:"Advent",label:"Sunday Compline · Fourth Sunday of Advent",
  officeClass:"I_SUNDAY",rank:"I",officeDate:"2026-12-20",
  rubricalReason:"ADVENT_IV_SUNDAY_SECOND_VESPERS_BR166_H"})
]);
const numbers=Object.freeze({
 "Feria II":28,"Feria III":26,"Feria IV":30,"Feria V":33,
 "Feria VI":36,"Sabbato":41,"Dominica":30
});
export function reviewAdventIII2026OrdoWitness(appointment){
 const source=ADVENT_III_2026_ORDO_WITNESSES.find(w=>w.date===appointment?.date);
 if(!source||source.psalmDay!==appointment.psalmDay||
    source.officeDate!==appointment.officeDate||
    source.stichs!==numbers[appointment.psalmDay]||
    source.class!==(
     appointment.officeClass==="SUNDAY_FIRST_VESPERS"?
      "SUNDAY_FIRST_VESPERS":appointment.officeClass==="I_SUNDAY"?
      "I_SUNDAY":appointment.rank==="II"?"II_FERIA":"III_FERIA"
    )||
    source.rubric!==(
     appointment.officeClass==="SUNDAY_FIRST_VESPERS"?"166(b)":
      appointment.officeClass==="I_SUNDAY"?"166(h)":"171(e)"
    )||
    appointment.marianSection!=="Advent")
  return Object.freeze({status:"WITHHELD",reason:"DATED_OFFICE_ORDO_WITNESS_MISMATCH"});
 return Object.freeze({status:"INDEPENDENT_DATED_ROMAN_1960_ORDO_REVIEW",
  witness:source,source:ADVENT_III_2026_ORDO_SOURCE,
  rightsApproved:false,publishable:false,published:false});
}
