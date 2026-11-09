/**
 * Source-first finite Roman 1960 Compline research: January 4–10, 2027.
 * 37 preceding public dates remain unchanged, and this gate has NO
 * authority to approve public dates or text.
 *
 * Dated Office (not Mass-derived): https://icrspfrance.fr/ordo.php?d=2027-01-03
 * FSSPX 5 Jan / 9 Jan First Vespers:
 * https://ordo.fsspx.org/day/2027-01-05?lang=en&mode=liturgical
 * https://ordo.fsspx.org/day/2027-01-09?lang=en&mode=liturgical
 * BR 1960 §§167(b/h),168(d),171(e),188:
 * https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 *
 * 9 Jan Holy Family II-class FIRST Compline is Sunday, not Saturday.
 * 2 Jan Holy Name II-class FIRST Compline was corrected to Sunday in PR2720.
 * Epiphany/Holy Family chant tone and possible hymn-doxology differences
 * remain source-held and must not be invented from a modern calendar.
 */
export const JAN04_10_SOURCE_SCHEMA=
 "ao.office.compline-jan04-10-2027-source-intake.v1";
export const JAN04_10_RESEARCH_STATUS=
 "FINITE_EPIPHANY_2027_DATED_ORDO_RESEARCH_ONLY";
export const JAN04_10_DATES=Object.freeze([
 "2027-01-04","2027-01-05","2027-01-06","2027-01-07",
 "2027-01-08","2027-01-09","2027-01-10"
]);
const EXPECTED=Object.freeze([
 Object.freeze({date:"2027-01-04",weekday:"Feria II",
  principalOffice:"Christmastide Feria, Monday after Holy Name",
  officeClass:"IV_FERIA",officeDate:"2027-01-04",
  psalmDay:"Feria II",rubric:"171(e)",firstVespers:"NONE",
  marianSection:"Nativiti",psalmIds:[6,7],printedPsalmFrames:28,
  commemoration:null}),
 Object.freeze({date:"2027-01-05",weekday:"Feria III",
  principalOffice:"First Compline of Epiphany of Our Lord",
  officeClass:"I_FEAST_FIRST_VESPERS",officeDate:"2027-01-06",
  psalmDay:"Dominica",rubric:"167(b)",
  firstVespers:"EPIPHANY_I_VESPERS",
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30,
  commemoration:"Saint Telesphorus Pope and Martyr (commemorated at Lauds only)"}),
 Object.freeze({date:"2027-01-06",weekday:"Feria IV",
  principalOffice:"Epiphany of Our Lord",
  officeClass:"I_FEAST",officeDate:"2027-01-06",
  psalmDay:"Dominica",rubric:"167(h)",
  firstVespers:"NONE_AFTER_EPIPHANY_II_VESPERS",
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30,
  commemoration:null}),
 Object.freeze({date:"2027-01-07",weekday:"Feria V",
  principalOffice:"Epiphanytide Feria, Thursday",
  officeClass:"IV_FERIA",officeDate:"2027-01-07",
  psalmDay:"Feria V",rubric:"171(e)",firstVespers:"NONE",
  marianSection:"Nativiti",psalmIds:[69,70],printedPsalmFrames:33,
  commemoration:null}),
 Object.freeze({date:"2027-01-08",weekday:"Feria VI",
  principalOffice:"Epiphanytide Feria, Friday",
  officeClass:"IV_FERIA",officeDate:"2027-01-08",
  psalmDay:"Feria VI",rubric:"171(e)",firstVespers:"NONE",
  marianSection:"Nativiti",psalmIds:[76,85],printedPsalmFrames:36,
  commemoration:null}),
 Object.freeze({date:"2027-01-09",weekday:"Sabbato",
  principalOffice:"First Compline of the Holy Family of Jesus Mary and Joseph",
  officeClass:"II_FEAST_FIRST_VESPERS",officeDate:"2027-01-10",
  psalmDay:"Dominica",rubric:"168(d)",
  firstVespers:"HOLY_FAMILY_I_VESPERS",
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30,
  commemoration:null}),
 Object.freeze({date:"2027-01-10",weekday:"Dominica",
  principalOffice:"Holy Family of Jesus Mary and Joseph",
  officeClass:"II_FEAST",officeDate:"2027-01-10",
  psalmDay:"Dominica",rubric:"168(d)",
  firstVespers:"NONE_AFTER_HOLY_FAMILY_II_VESPERS",
  marianSection:"Nativiti",psalmIds:[4,90,133],printedPsalmFrames:30,
  commemoration:null})
]);
const DAYS=["Dominica","Feria II","Feria III","Feria IV",
 "Feria V","Feria VI","Sabbato"];
const deny=(date,reason)=>Object.freeze({
 schema:JAN04_10_SOURCE_SCHEMA,date,status:"WITHHELD",reason,
 appointment:null,completeHourTextCertified:false,
 chantToneCertified:false,publicReleaseApproved:false,
 published:false,publishable:false
});
export function reviewJan04_10ComplineSource({date,record}={}){
 const expected=EXPECTED.find(x=>x.date===date);
 if(!expected)return deny(date,"DATE_OUTSIDE_EPIPHANY_FINITE_2027_BATCH");
 if(!record||record.date!==date||
    record.sourceStage!=="INDEPENDENT_2027_ORDO_RUBRIC_RESEARCH_ONLY"||
    record.textVerified!==false||record.rightsApproved!==false||
    record.published!==false||record.publishable!==false||
    !Array.isArray(record.specialHolds)||record.specialHolds.length<2)
  return deny(date,"UNREVIEWED_OFFICE_RUBRIC_RECORD");
 if(DAYS[new Date(date+"T12:00:00Z").getUTCDay()]!==expected.weekday)
  return deny(date,"CIVIL_WEEKDAY_INCORRECT");
 for(const k of Object.keys(expected)){
  if(Array.isArray(expected[k])){
   if(JSON.stringify(record[k])!==JSON.stringify(expected[k]))
    return deny(date,"PSALM_SOURCE_FAMILY_INCORRECT");
  }else if((record[k]??null)!==(expected[k]??null))
   return deny(date,"EXPECTED_"+k.toUpperCase()+"_INCORRECT");
 }
 if((date==="2027-01-09"||date==="2027-01-10")&&
    !record.specialHolds.includes("HOLY_FAMILY_DOXOLOGY_SOURCE_CONFLICT_1960_BR_188_VS_ICRSP"))
  return deny(date,"HOLY_FAMILY_DOXOLOGY_UNDER_REVIEW");
 return Object.freeze({
  schema:JAN04_10_SOURCE_SCHEMA,date,status:JAN04_10_RESEARCH_STATUS,
  appointment:Object.freeze({
   date,weekday:expected.weekday,psalmDay:expected.psalmDay,
   officeDate:expected.officeDate,officeClass:expected.officeClass,
   marianSection:expected.marianSection,
   psalmIds:Object.freeze([...expected.psalmIds]),
   printedPsalmFrames:expected.printedPsalmFrames,
   rubricalReason:"EPIPHANY_2027_PRIVATE_DATE_SOURCE_INTAKE",
   label:"Private Latin Compline review — "+expected.principalOffice
  }),
  completeHourTextCertified:false,chantToneCertified:false,
  sourceTextCertified:false,publicReleaseApproved:false,
  published:false,publishable:false
 });
}
export function researchJan04_10PrivateComplineAppointment(date){
 const expected=EXPECTED.find(x=>x.date===date);
 if(!expected)return deny(date,"UNREVIEWED_EPIPHANY_DATE");
 return Object.freeze({
  schema:JAN04_10_SOURCE_SCHEMA,date,
  status:"EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH",
  appointment:Object.freeze({
   date,weekday:expected.weekday,psalmDay:expected.psalmDay,
   officeDate:expected.officeDate,marianSection:expected.marianSection,
   officeClass:expected.officeClass,
   rubricalReason:"EPIPHANY_2027_PRIVATE_SOURCE_ONLY"
  }),
  completeHourTextCertified:false,chantToneCertified:false,
  calendarSelectionAuthorized:false,publicReleaseApproved:false,
  rightsApproved:false,published:false,publishable:false
 });
}
