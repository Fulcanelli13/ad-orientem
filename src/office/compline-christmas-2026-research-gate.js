/**
 * 21–27 December 2026: independent Roman 1960 Office source-intake guard.
 *
 * Explicitly NOT the published Office calendar, text source, source licence,
 * or an appointment authorizer. A successful consistency check here is
 * always WITHHELD. Production release has a separate immutable whitelist
 * and must continue to refuse 2026-12-21 onward before any source fetch.
 *
 * Primary dated Office witness: https://breviariumgregorianum.com/ordo-2026.php
 * Rubrics: https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 * Seasonal Marian terminus: https://1962ordo.today/season/
 */
export const CHRISTMAS_COMPLINE_RESEARCH_SCHEMA=
 "ao.office.christmas-21-27-dec-2026-source-intake.v1";
export const CHRISTMAS_COMPLINE_RESEARCH_STATUS=
 "DATED_ORDO_RESEARCH_ONLY_COMPLETE_HOUR_WITHHELD";

const EXPECTED=Object.freeze([
 Object.freeze({date:"2026-12-21",weekday:"Feria II",office:"Saint Thomas Apostle",
  officeClass:"II_FEAST",officeDate:"2026-12-21",psalmDay:"Dominica",
  rule:"168(d)",marianSection:"Advent",marianVerse:"Angelus Domini",
  firstVespers:"NONE",commemoration:"Advent feria"}),
 Object.freeze({date:"2026-12-22",weekday:"Feria III",office:"Tuesday of the Fourth Week of Advent",
  officeClass:"II_FERIA",officeDate:"2026-12-22",psalmDay:"Feria III",
  rule:"171(e)",marianSection:"Advent",marianVerse:"Angelus Domini",
  firstVespers:"NONE",commemoration:null}),
 Object.freeze({date:"2026-12-23",weekday:"Feria IV",office:"Wednesday of the Fourth Week of Advent",
  officeClass:"II_FERIA",officeDate:"2026-12-23",psalmDay:"Feria IV",
  rule:"171(e)",marianSection:"Advent",marianVerse:"Angelus Domini",
  firstVespers:"NONE",commemoration:null}),
 Object.freeze({date:"2026-12-24",weekday:"Feria V",office:"First Compline of the Nativity after First Vespers",
  officeClass:"I_FEAST_FIRST_VESPERS",officeDate:"2026-12-25",psalmDay:"Dominica",
  rule:"167(b); verify 173 exception",marianSection:"Nativiti",
  marianVerse:"Post partum",marianCollect:"Deus qui salutis",
  firstVespers:"NATIVITY_I_VESPERS",commemoration:null}),
 Object.freeze({date:"2026-12-25",weekday:"Feria VI",office:"Nativity of the Lord",
  officeClass:"I_FEAST",officeDate:"2026-12-25",psalmDay:"Dominica",
  rule:"167(h)",marianSection:"Nativiti",marianVerse:"Post partum",
  marianCollect:"Deus qui salutis",
  firstVespers:"NONE_AFTER_II_VESPERS",commemoration:null}),
 Object.freeze({date:"2026-12-26",weekday:"Sabbato",office:"Saint Stephen Protomartyr",
  officeClass:"II_FEAST",officeDate:"2026-12-26",psalmDay:"Dominica",
  rule:"168(d)",marianSection:"Nativiti",marianVerse:"Post partum",
  marianCollect:"Deus qui salutis",
  firstVespers:"NONE_ST_STEPHEN_II_VESPERS_SUNDAY_COMM",
  commemoration:"Sunday within Christmas Octave"}),
 Object.freeze({date:"2026-12-27",weekday:"Dominica",office:"Sunday within Octave of the Nativity",
  officeClass:"CHRISTMAS_OCTAVE_SUNDAY",officeDate:"2026-12-27",
  psalmDay:"Dominica",rule:"175(e); 176",
  marianSection:"Nativiti",marianVerse:"Post partum",
  marianCollect:"Deus qui salutis",
  firstVespers:"NONE_AFTER_II_VESPERS",
  commemoration:"Saint John Apostle and Evangelist"})
]);
export const CHRISTMAS_2026_FINITE_RESEARCH_DATES=Object.freeze(
 EXPECTED.map(x=>x.date)
);
const DAYS=Object.freeze(["Dominica","Feria II","Feria III",
 "Feria IV","Feria V","Feria VI","Sabbato"]);
const held=(date,reason)=>Object.freeze({
 schema:CHRISTMAS_COMPLINE_RESEARCH_SCHEMA,date,
 status:"WITHHELD",reason,psalmDayResearchOnly:null,
 officeDateResearchOnly:null,calendarSelectionAuthorized:false,
 completeHourCertified:false,sourceTextCertified:false,
 translationApproved:false,publishable:false,published:false
});
/**
 * A separately supplied original Office research record can only be
 * compared with these hand-reviewed, fixed *research* facts. Neither
 * success nor a manipulated source record can authorize publication.
 *
 * All fields that could cause an incorrect psalm or Marian ending are
 * independently matched and tested. This intentionally does not import
 * a Mass-calendar rule or read from network, storage, or page state.
 */
export function reviewChristmas2026ComplineResearch({date,record}={}){
 if(typeof date!=="string")return held(date,"CIVIL_DATE_REQUIRED");
 const expected=EXPECTED.find(x=>x.date===date);
 if(!expected)return held(date,"NOT_IN_FINITE_CHRISTMAS_2026_SOURCE_INTAKE");
 if(!record||typeof record!=="object"||
    record.date!==date||
    record.reviewStage!=="DATED_ORDO_CALENDAR_RESEARCH_ONLY"||
    record.psalterResearchOnly!==true||
    record.textVerified!==false||
    record.publishable!==false||record.published!==false)
  return held(date,"INDEPENDENT_DATE_RESEARCH_RECORD_REQUIRED");
 const weekday=DAYS[new Date(date+"T12:00:00Z").getUTCDay()];
 const values={
  weekday,principalOffice:expected.office,
  class:expected.officeClass,
  officeDateHypothesis:expected.officeDate,
  firstVespersHypothesis:expected.firstVespers,
  psalterHypothesis:expected.psalmDay,
  rubricHypothesis:expected.rule,
  marianSectionHypothesis:expected.marianSection,
  marianVerseHypothesis:expected.marianVerse,
  marianCollectHypothesis:expected.marianCollect,
  commemorationHypothesis:expected.commemoration
 };
 for(const [key,value] of Object.entries(values)){
  if(key==="weekday")continue;
  if((record[key]??null)!==(value??null))
   return held(date,"OFFICE_CHRISTMAS_"+key.toUpperCase()+"_EVIDENCE_MISMATCH");
 }
 if(weekday!==expected.weekday||
    !Array.isArray(record.specialHold)||record.specialHold.length<1||
    record.specialHold.some(x=>typeof x!=="string"||!x))
  return held(date,"OFFICE_CHRISTMAS_WEEKDAY_OR_RELEASE_HOLDS_INVALID");
 // No active authorization, even when all source-intake facts agree.
 return Object.freeze({
  schema:CHRISTMAS_COMPLINE_RESEARCH_SCHEMA,date,
  status:CHRISTMAS_COMPLINE_RESEARCH_STATUS,
  reason:"DATED_RESEARCH_NOT_A_COMPLETE_LATIN_HOUR_CERTIFICATE",
  officeDateResearchOnly:expected.officeDate,
  psalmDayResearchOnly:expected.psalmDay,
  marianSectionResearchOnly:expected.marianSection,
  marianVerseResearchOnly:expected.marianVerse,
  marianCollectResearchOnly:expected.marianCollect??null,
  calendarSelectionAuthorized:false,completeHourCertified:false,
  sourceTextCertified:false,translationApproved:false,
  publishable:false,published:false
 });
}

/**
 * Finite private-source appointment for the seven Christmas research dates.
 * This is deliberately NOT an Office release gate, text certificate or
 * publication whitelist. The first-Vespers and Marian source hypotheses are
 * independently cross-checked against the JSON intake in CI.
 */
export function researchChristmas2026PrivateComplineAppointment(date){
 const w=EXPECTED.find(row=>row.date===date);
 if(!w)return held(date,"CHRISTMAS_PRIVATE_SOURCE_DATE_NOT_IN_LEDGER");
 return Object.freeze({
  schema:CHRISTMAS_COMPLINE_RESEARCH_SCHEMA,
  status:"EXPLICIT_CHRISTMAS_2026_PRIVATE_SOURCE_RESEARCH",
  appointment:Object.freeze({
   date:w.date,weekday:w.weekday,psalmDay:w.psalmDay,
   marianSection:w.marianSection,
   officeClass:w.officeClass,officeDate:w.officeDate,
   label:"Private Latin Compline research · "+w.office,
   rubricalReason:"CHRISTMAS_2026_DATE_SPECIFIC_SOURCE_INTAKE_ONLY"
  }),
  sourceTextCertified:false,calendarSelectionAuthorized:false,
  completeHourCertified:false,rightsApproved:false,
  publishable:false,published:false
 });
}
