/**
 * Universal Roman 1960 Office 11–17 January 2027 source intake only.
 * Research provenance: ICRSP January 2027 dated Office ordo,
 * https://icrspfrance.fr/ordo.php?d=2027-01-03 ;
 * 1960 Variationes §24, Commemoration of Baptism,
 * https://icrspfrance.fr/textes-liturgiques.php?article=a0112_ancien ;
 * Roman Breviary §§166(b/h),168(d),169(e),171(e).
 * https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 *
 * 13 Jan (Baptism) uses Sunday Compline, not Wed (§24 / §168(d)).
 * 16 Jan after First Vespers of II Sunday uses SATURDAY Compline,
 * unlike II-class FEASTS' First Vespers (§166(b)).
 * The official 1961 printed Psalter facsimile and local variants remain
 * unverified. This source gate authorizes ZERO PUBLIC DATES.
 */
export const JAN11_17_SOURCE_SCHEMA=
 "ao.office.compline-jan11-17-2027-source-intake.v1";
export const JAN11_17_RESEARCH_STATUS=
 "FINITE_POST_EPIPHANY_2027_DATED_OFFICE_SOURCE_RESEARCH_ONLY";
export const JAN11_17_CIVIL_DATES=Object.freeze([
 "2027-01-11","2027-01-12","2027-01-13","2027-01-14",
 "2027-01-15","2027-01-16","2027-01-17"
]);
const EXPECTED=Object.freeze([
 {
  "date": "2027-01-11",
  "weekday": "Feria II",
  "principalOffice": "Feria in Epiphanytide, commemorating St Hyginus at Lauds",
  "officeClass": "IV_FERIA",
  "officeDate": "2027-01-11",
  "psalmDay": "Feria II",
  "rubric": "171(e)",
  "firstVespers": "NONE",
  "commemoration": "St Hyginus, Pope and Martyr (Lauds)",
  "psalmIds": [
   6,
   7
  ],
  "printedPsalmFrames": 28,
  "marianSection": "Nativiti"
 },
 {
  "date": "2027-01-12",
  "weekday": "Feria III",
  "principalOffice": "Epiphanytide Feria",
  "officeClass": "IV_FERIA",
  "officeDate": "2027-01-12",
  "psalmDay": "Feria III",
  "rubric": "171(e)",
  "firstVespers": "NONE",
  "commemoration": null,
  "psalmIds": [
   11,
   12,
   15
  ],
  "printedPsalmFrames": 26,
  "marianSection": "Nativiti"
 },
 {
  "date": "2027-01-13",
  "weekday": "Feria IV",
  "principalOffice": "Commemoration of the Baptism of Our Lord",
  "officeClass": "II_FEAST",
  "officeDate": "2027-01-13",
  "psalmDay": "Dominica",
  "rubric": "1960_VARIATIONES_24;168(d)",
  "firstVespers": "NONE_AFTER_BAPTISM_VESPERS",
  "commemoration": null,
  "psalmIds": [
   4,
   90,
   133
  ],
  "printedPsalmFrames": 30,
  "marianSection": "Nativiti"
 },
 {
  "date": "2027-01-14",
  "weekday": "Feria V",
  "principalOffice": "St Hilary of Poitiers, Bishop, Confessor and Doctor",
  "officeClass": "III_FEAST",
  "officeDate": "2027-01-14",
  "psalmDay": "Feria V",
  "rubric": "169(e)",
  "firstVespers": "NONE",
  "commemoration": "St Felix, Priest and Martyr (Lauds)",
  "psalmIds": [
   69,
   70
  ],
  "printedPsalmFrames": 33,
  "marianSection": "Nativiti"
 },
 {
  "date": "2027-01-15",
  "weekday": "Feria VI",
  "principalOffice": "St Paul the First Hermit, Confessor",
  "officeClass": "III_FEAST",
  "officeDate": "2027-01-15",
  "psalmDay": "Feria VI",
  "rubric": "169(e)",
  "firstVespers": "NONE",
  "commemoration": "St Maur, Abbot (Lauds)",
  "psalmIds": [
   76,
   85
  ],
  "printedPsalmFrames": 36,
  "marianSection": "Nativiti"
 },
 {
  "date": "2027-01-16",
  "weekday": "Sabbato",
  "principalOffice": "First Compline of the Second Sunday after Epiphany",
  "officeClass": "II_SUNDAY_FIRST_VESPERS",
  "officeDate": "2027-01-17",
  "psalmDay": "Sabbato",
  "rubric": "166(b)",
  "firstVespers": "SECOND_SUNDAY_AFTER_EPIPHANY_I_VESPERS",
  "commemoration": null,
  "civilOffice": "St Marcellus I, Pope and Martyr (III class) before First Vespers",
  "psalmIds": [
   87,
   102
  ],
  "printedPsalmFrames": 41,
  "marianSection": "Nativiti"
 },
 {
  "date": "2027-01-17",
  "weekday": "Dominica",
  "principalOffice": "Second Sunday after Epiphany",
  "officeClass": "II_SUNDAY",
  "officeDate": "2027-01-17",
  "psalmDay": "Dominica",
  "rubric": "166(h)",
  "firstVespers": "NONE_AFTER_SECOND_SUNDAY_II_VESPERS",
  "commemoration": null,
  "psalmIds": [
   4,
   90,
   133
  ],
  "printedPsalmFrames": 30,
  "marianSection": "Nativiti"
 }
].map(row=>
 Object.freeze({...row,psalmIds:Object.freeze([...row.psalmIds])})));
const WEEKDAYS=Object.freeze([
 "Dominica","Feria II","Feria III","Feria IV","Feria V",
 "Feria VI","Sabbato"
]);
const withheld=(date,reason)=>Object.freeze({
 schema:JAN11_17_SOURCE_SCHEMA,date,status:"WITHHELD",reason,
 appointment:null,publicReleaseApproved:false,
 sourceTextCertified:false,published:false,publishable:false
});
export function reviewJan11_17OfficeSource({date,record}={}){
 const e=EXPECTED.find(x=>x.date===date);
 if(!e)return withheld(date,"UNLISTED_DATE_AFTER_10_JANUARY");
 if(!record||record.date!==date||
    record.sourceStage!=="DATED_2027_OFFICE_ORDO_RUBRICAL_RESEARCH"||
    record.textVerified!==false||
    record.latinSourceRightsVerified!==false||
    record.liturgicallyCertified!==false||
    record.publishable!==false||record.published!==false||
    !Array.isArray(record.holdReasons)||record.holdReasons.length<3)
  return withheld(date,"INDEPENDENT_SOURCE_RESEARCH_ROW_REQUIRED");
 if(WEEKDAYS[new Date(date+"T12:00:00Z").getUTCDay()]!==e.weekday)
  return withheld(date,"DATED_CIVIL_WEEKDAY_MISMATCH");
 for(const key of Object.keys(e)){
  if(Array.isArray(e[key])){
   if(JSON.stringify(record[key])!==JSON.stringify(e[key]))
    return withheld(date,"SOURCE_PSALM_GROUP_CHANGED");
  }else if((record[key]??null)!==(e[key]??null))
   return withheld(date,"SOURCE_"+key.toUpperCase()+"_MISMATCH");
 }
 return Object.freeze({
  schema:JAN11_17_SOURCE_SCHEMA,date,status:JAN11_17_RESEARCH_STATUS,
  appointment:Object.freeze({
   date,weekday:e.weekday,psalmDay:e.psalmDay,officeDate:e.officeDate,
   officeClass:e.officeClass,marianSection:e.marianSection,
   psalmIds:Object.freeze([...e.psalmIds]),
   printedPsalmFrames:e.printedPsalmFrames,
   label:"PRIVATE LATIN OFFICE SOURCE RESEARCH · "+e.principalOffice,
   rubricalReason:"SOURCE_ONLY_2027_POST_EPIPHANY_ORDO"
  }),
  publicReleaseApproved:false,sourceTextCertified:false,
  published:false,publishable:false
 });
}
export function researchJan11_17PrivateComplineAppointment(date){
 const e=EXPECTED.find(x=>x.date===date);
 if(!e)return withheld(date,"POST_EPIPHANY_PRIVATE_DATE_UNLISTED");
 return Object.freeze({
  schema:JAN11_17_SOURCE_SCHEMA,date,
  status:"EXPLICIT_POST_EPIPHANY_PRIVATE_SOURCE_RESEARCH",
  appointment:Object.freeze({
   date,weekday:e.weekday,officeDate:e.officeDate,
   officeClass:e.officeClass,psalmDay:e.psalmDay,
   marianSection:e.marianSection,
   rubricalReason:"PRIVATE_2027_POST_EPIPHANY_SOURCE_RESEARCH"
  }),
  sourceTextCertified:false,rightsApproved:false,
  calendarSelectionAuthorized:false,publicReleaseApproved:false,
  published:false,publishable:false
 });
}
