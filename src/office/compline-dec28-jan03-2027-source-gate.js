/**
 * 28 Dec 2026–3 Jan 2027: seven finite universal 1960 Roman Compline
 * RESEARCH appointments. Never a public/production authorization.
 *
 * Dated 1960 Office: https://breviariumgregorianum.com/ordo-2026.php
 *   (2026 Dec 28–31; Jan 2027 cross-checked by dated FSSPX ordo)
 * 1960 Roman Breviary Rubrics §§166(b),167(b,h),168(d),175(d,e):
 * https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 * 2027-01-02 First Vespers of Holy Name:
 * https://ordo.fsspx.org/day/2027-01-02?lang=en
 *
 * 29–30 December: do NOT substitute Tuesday/Wednesday psalms: BR 175(e)
 * explicitly assigns Sunday Compline to days within Christmas octave.
 * 31 December and 2 January have CIVIL / OFFICE year/feast rollovers.
 * Independent ICRSP ordo assigns Sunday Compline to 2 January after
 * I Vespers of Holy Name (II-class semifestive, BR 168(d)), NOT Saturday
 * BR 166(b) ordinary Sunday Office: https://icrspfrance.fr/ordo.php?d=2027-01-03
 */
export const DEC28_JAN03_COMPLINE_SOURCE_SCHEMA=
 "ao.office.compline-2026-12-28-through-2027-01-03-source-intake.v1";
export const DEC28_JAN03_COMPLINE_SOURCE_STATUS=
 "FINITE_OFFICE_ORDO_SOURCE_RESEARCH_ONLY";
export const DEC28_JAN03_FINITE_DATES=Object.freeze([
 "2026-12-28","2026-12-29","2026-12-30","2026-12-31",
 "2027-01-01","2027-01-02","2027-01-03"
]);
const EXPECTED=Object.freeze([
 Object.freeze({date:"2026-12-28",weekday:"Feria II",
  principalOffice:"Holy Innocents, Martyrs",officeClass:"II_FEAST",
  officeDate:"2026-12-28",psalmDay:"Dominica",rule:"168(d)",
  firstVespers:"NONE_HOLY_INNOCENTS_II_VESPERS",commemoration:null,
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30}),
 Object.freeze({date:"2026-12-29",weekday:"Feria III",
  principalOffice:"Fifth Day within the Octave of the Nativity",
  officeClass:"II_OCTAVE_DAY",officeDate:"2026-12-29",
  psalmDay:"Dominica",rule:"175(e)",
  firstVespers:"NONE_CHRISTMAS_OCTAVE_VESPERS",
  commemoration:"Saint Thomas Becket, Bishop and Martyr",
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30}),
 Object.freeze({date:"2026-12-30",weekday:"Feria IV",
  principalOffice:"Sixth Day within the Octave of the Nativity",
  officeClass:"II_OCTAVE_DAY",officeDate:"2026-12-30",
  psalmDay:"Dominica",rule:"175(e)",
  firstVespers:"NONE_CHRISTMAS_OCTAVE_VESPERS",commemoration:null,
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30}),
 Object.freeze({date:"2026-12-31",weekday:"Feria V",
  principalOffice:"First Compline of the Circumcision of Our Lord",
  officeClass:"I_FEAST_FIRST_VESPERS",officeDate:"2027-01-01",
  psalmDay:"Dominica",rule:"167(b);175(d)",
  firstVespers:"CIRCUMCISION_I_VESPERS",commemoration:null,
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30}),
 Object.freeze({date:"2027-01-01",weekday:"Feria VI",
  principalOffice:"Circumcision of Our Lord, Octave Day of the Nativity",
  officeClass:"I_FEAST",officeDate:"2027-01-01",psalmDay:"Dominica",
  rule:"167(h)",firstVespers:"NONE_CIRCUMCISION_II_VESPERS",
  commemoration:null,marianSection:"Nativiti",psalmIds:[4,90,133],
  printedPsalmFrames:30}),
 Object.freeze({date:"2027-01-02",weekday:"Sabbato",
  principalOffice:"First Compline of the Most Holy Name of Jesus",
  officeClass:"II_FEAST_FIRST_VESPERS_ON_SUNDAY",
  officeDate:"2027-01-03",psalmDay:"Dominica",rule:"168(d)",
  firstVespers:"HOLY_NAME_I_VESPERS",commemoration:null,
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30}),
 Object.freeze({date:"2027-01-03",weekday:"Dominica",
  principalOffice:"Most Holy Name of Jesus",
  officeClass:"II_FEAST_ON_SUNDAY",officeDate:"2027-01-03",
  psalmDay:"Dominica",rule:"168(d)",
  firstVespers:"NONE_HOLY_NAME_II_VESPERS",commemoration:null,
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30})
]);
const DAYS=Object.freeze([
 "Dominica","Feria II","Feria III","Feria IV","Feria V","Feria VI","Sabbato"
]);
const deny=(date,reason)=>Object.freeze({
 schema:DEC28_JAN03_COMPLINE_SOURCE_SCHEMA,date,
 status:"WITHHELD",reason,appointment:null,sourceTextCertified:false,
 independentFullOfficeCollated:false,calendarSelectionAuthorized:false,
 publishable:false,published:false
});
/** Fail closed even when independently dated research matches the JSON ledger. */
export function reviewDec28Jan03ComplineResearch({date,record}={}){
 const expected=EXPECTED.find(x=>x.date===date);
 if(!expected)return deny(date,"DATE_NOT_IN_2026_27_FINITE_RESEARCH_BATCH");
 if(!record||record.date!==date||
    record.sourceStage!=="DATED_OFFICE_ORDO_AND_RUBRIC_RESEARCH"||
    record.textVerified!==false||
    record.publishable!==false||record.published!==false||
    !Array.isArray(record.specialHolds)||record.specialHolds.length<2)
  return deny(date,"INDEPENDENT_DATED_SOURCE_RECORD_REQUIRED");
 if(DAYS[new Date(date+"T12:00:00Z").getUTCDay()]!==expected.weekday)
  return deny(date,"CIVIL_WEEKDAY_NOT_INDEPENDENTLY_VERIFIED");
 for(const key of Object.keys(expected)){
  if(Array.isArray(expected[key])){
   if(!Array.isArray(record[key])||
      JSON.stringify(record[key])!==JSON.stringify(expected[key]))
    return deny(date,"SOURCE_PSALM_WORD_FAMILY_OR_IDS_CHANGED");
  }else if((record[key]??null)!==(expected[key]??null)){
   return deny(date,"SOURCE_APPOINTMENT_"+key.toUpperCase()+"_MISMATCH");
  }
 }
 return Object.freeze({
  schema:DEC28_JAN03_COMPLINE_SOURCE_SCHEMA,date,
  status:DEC28_JAN03_COMPLINE_SOURCE_STATUS,
  appointment:Object.freeze({
   date,weekday:expected.weekday,officeDate:expected.officeDate,
   officeClass:expected.officeClass,psalmDay:expected.psalmDay,
   marianSection:expected.marianSection,
   rubricalReason:"PRIVATE_2026_27_YEAR_BOUNDARY_SOURCE_RESEARCH",
   psalmIds:Object.freeze([...expected.psalmIds]),
   printedPsalmFrames:expected.printedPsalmFrames,
   label:"PRIVATE LATIN RESEARCH — "+expected.principalOffice
  }),
  sourceTextCertified:false,independentFullOfficeCollated:false,
  calendarSelectionAuthorized:false,translationsApproved:false,
  publishable:false,published:false
 });
}
/** Appointment only for a separately opted-in private parser; never a release. */
export function researchDec28Jan03PrivateComplineAppointment(date){
 const match=EXPECTED.find(r=>r.date===date);
 if(!match)return deny(date,"PRIVATE_DATE_OUTSIDE_YEAR_BOUNDARY_WHITELIST");
 return Object.freeze({
  schema:DEC28_JAN03_COMPLINE_SOURCE_SCHEMA,date,
  status:"EXPLICIT_DEC28_JAN03_PRIVATE_SOURCE_RESEARCH",
  appointment:Object.freeze({
   date,weekday:match.weekday,officeDate:match.officeDate,
   psalmDay:match.psalmDay,marianSection:match.marianSection,
   officeClass:match.officeClass,
   rubricalReason:"PRIVATE_2026_27_YEAR_BOUNDARY_SOURCE_RESEARCH"
  }),
  sourceTextCertified:false,independentFullOfficeCollated:false,
  calendarSelectionAuthorized:false,rightsApproved:false,
  publishable:false,published:false
 });
}
