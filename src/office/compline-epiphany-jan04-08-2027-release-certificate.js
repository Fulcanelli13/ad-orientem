/**
 * Finite, separately source-certified Roman 1960 Latin Compline release:
 * 4–8 JANUARY 2027 ONLY. 9–10 January Holy Family remain WITHHELD until
 * independent printed hymn/doxology collation against 1960 BR §188.
 *
 * Dated ICRSP 2027 Office:
 * https://icrspfrance.fr/ordo.php?d=2027-01-03
 * 5 January Epiphany I Vespers:
 * https://ordo.fsspx.org/day/2027-01-05?lang=en&mode=liturgical
 * Roman Breviary §§167(b,h),171(e),186,188,210,241,244,248:
 * https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 * Already verified Latin original source, plain ordinary Compline,
 * MIT pinned Vulgata and exact Nativiti Marian source.
 */
import {researchJan04_10PrivateComplineAppointment}
 from "./compline-epiphany-jan04-10-2027-source-gate.js";
import {CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA}
 from "./compline-christmas-2026-release-certificate.js";

export const EPIPHANY_2027_FIVE_DAY_CERTIFICATE_SCHEMA=
 "ao.office.epiphany-2027-jan04-08-finite-latin-release.v1";
export const EPIPHANY_2027_FIVE_DATE_PROFILES=Object.freeze([
 Object.freeze({date:"2027-01-04",weekday:"Feria II",officeClass:"IV_FERIA",
  officeDate:"2027-01-04",psalmDay:"Feria II",marianSection:"Nativiti",
  printedPsalmDisplayFrames:28,rubric:"171(e)",
  label:"Christmas-season feria · 4 January 2027"}),
 Object.freeze({date:"2027-01-05",weekday:"Feria III",
  officeClass:"I_FEAST_FIRST_VESPERS",officeDate:"2027-01-06",
  psalmDay:"Dominica",marianSection:"Nativiti",
  printedPsalmDisplayFrames:30,rubric:"167(b)",
  label:"First Compline of Epiphany · 5 January 2027"}),
 Object.freeze({date:"2027-01-06",weekday:"Feria IV",
  officeClass:"I_FEAST",officeDate:"2027-01-06",
  psalmDay:"Dominica",marianSection:"Nativiti",
  printedPsalmDisplayFrames:30,rubric:"167(h)",
  label:"Epiphany of Our Lord · 6 January 2027"}),
 Object.freeze({date:"2027-01-07",weekday:"Feria V",
  officeClass:"IV_FERIA",officeDate:"2027-01-07",
  psalmDay:"Feria V",marianSection:"Nativiti",
  printedPsalmDisplayFrames:33,rubric:"171(e)",
  label:"Epiphanytide feria · 7 January 2027"}),
 Object.freeze({date:"2027-01-08",weekday:"Feria VI",
  officeClass:"IV_FERIA",officeDate:"2027-01-08",
  psalmDay:"Feria VI",marianSection:"Nativiti",
  printedPsalmDisplayFrames:36,rubric:"171(e)",
  label:"Epiphanytide feria · 8 January 2027"})
]);
const CERTIFICATE=Object.freeze({
 calendar:"UNIVERSAL_ROMAN_1960",language:"la",
 originalLatinPinned:true,traditionalVulgateOnly:true,
 rightsMITReviewed:true,
 fiveDistinctDatedRomanOrdoAssignmentsVerified:true,
 epiphanyFirstVespersCivilToOfficeDateVerified:true,
 existingSunday329LatinPsalmWordsCollated:true,
 existingMondayAndThursdayFridayLatinPsalmsCollated:true,
 existingMame1961OrdinarySequenceReviewed:true,
 readingEvent42to40ProjectionVerified:true,
 epiphanyToneNotTextClaimed:true,
 unchanged1960Br188HymnDoxology:true,
 exactMarianGitBlob:CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA,
 printedMame1961PsalterLeafFacsimileCertified:false,
 holyFamilyJan09_10Certified:false,
 translationsApproved:false,otherHoursApproved:false,localCalendarsApproved:false
});
const withheld=(date,reason)=>Object.freeze({
 schema:EPIPHANY_2027_FIVE_DAY_CERTIFICATE_SCHEMA,
 status:"WITHHELD",date,reason,profile:null,published:false,
 printedMame1961PsalterLeafFacsimileCertified:false
});
export function reviewEpiphany2027FiveDayLatinCertificate(date,{
 candidate=EPIPHANY_2027_FIVE_DATE_PROFILES.find(x=>x.date===date),
 certificate=CERTIFICATE
}={}){
 const expected=EPIPHANY_2027_FIVE_DATE_PROFILES.find(x=>x.date===date);
 const source=researchJan04_10PrivateComplineAppointment(date);
 if(!expected||!candidate||candidate.date!==date||
    source.status!=="EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH")
  return withheld(date,"EPIPHANY_2027_RELEASE_DATE_OUTSIDE_FIVE_DAY_WHITELIST");
 if(Object.keys(expected).some(key=>candidate[key]!==expected[key])||
    expected.date!==source.appointment.date||
    expected.officeDate!==source.appointment.officeDate||
    expected.officeClass!==source.appointment.officeClass||
    expected.psalmDay!==source.appointment.psalmDay||
    expected.weekday!==source.appointment.weekday||
    expected.marianSection!==source.appointment.marianSection)
  return withheld(date,"EPIPHANY_2027_DATED_OFFICE_PROFILE_DIVERGENCE");
 if(certificate?.calendar!=="UNIVERSAL_ROMAN_1960"||
    certificate?.language!=="la"||
    certificate?.exactMarianGitBlob!==CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA||
    [
     "originalLatinPinned","traditionalVulgateOnly","rightsMITReviewed",
     "fiveDistinctDatedRomanOrdoAssignmentsVerified",
     "epiphanyFirstVespersCivilToOfficeDateVerified",
     "existingSunday329LatinPsalmWordsCollated",
     "existingMondayAndThursdayFridayLatinPsalmsCollated",
     "existingMame1961OrdinarySequenceReviewed",
     "readingEvent42to40ProjectionVerified","epiphanyToneNotTextClaimed",
     "unchanged1960Br188HymnDoxology"
    ].some(key=>certificate[key]!==true)||
    certificate?.printedMame1961PsalterLeafFacsimileCertified!==false||
    certificate?.holyFamilyJan09_10Certified!==false||
    certificate?.translationsApproved!==false||
    certificate?.otherHoursApproved!==false||
    certificate?.localCalendarsApproved!==false)
  return withheld(date,"EPIPHANY_2027_LATIN_TEXT_RIGHTS_OR_SCOPE_CERTIFICATE_CHANGED");
 return Object.freeze({
  schema:EPIPHANY_2027_FIVE_DAY_CERTIFICATE_SCHEMA,
  status:"EXPLICIT_EPIPHANY_JAN04_08_LATIN_TEXT_CERTIFIED",
  date,profile:expected,published:false,
  printedMame1961PsalterLeafFacsimileCertified:false,
  holyFamilyJan09_10Certified:false,
  translationsApproved:false,otherHoursApproved:false,
  localCalendarsApproved:false
 });
}
