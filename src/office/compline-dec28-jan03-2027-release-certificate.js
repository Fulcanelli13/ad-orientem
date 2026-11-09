/**
 * FINITE 7-date Latin Compline source/rubric certificate for the 1960
 * Roman Breviary, 28 December 2026–3 January 2027.
 * Independent ordo: https://breviariumgregorianum.com/ordo-2026.php
 * 1960 BR §§166(b),167(b,h),168(d),175(d,e),179,181:
 * https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 * 2027 Holy Name First Vespers on 2 January:
 * https://ordo.fsspx.org/day/2027-01-02?lang=en
 *
 * Reuses already collated Sunday/Saturday VULGATA source words, the
 * independently reviewed Mame 1961 Ordinary, exact pinned Nativiti Marian
 * Latin, and no new proper prayer words. Source rights: MIT as shipped.
 * Original Mame 1961 Psalter facsimile still unverified; no translation,
 * locality or other Hour inherits this approval.
 */
import {researchDec28Jan03PrivateComplineAppointment}
 from "./compline-dec28-jan03-2027-source-gate.js";
import {CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA}
 from "./compline-christmas-2026-release-certificate.js";

export const DEC28_JAN03_LATIN_CERTIFICATE_SCHEMA=
 "ao.office.dec28-jan03-finite-roman1960-latin-release.v1";
export const DEC28_JAN03_LATIN_RELEASE_PROFILES=Object.freeze([
 Object.freeze({date:"2026-12-28",weekday:"Feria II",
  officeClass:"II_FEAST",officeDate:"2026-12-28",psalmDay:"Dominica",
  marianSection:"Nativiti",printedPsalmDisplayFrames:30,
  rubric:"168(d)",label:"Holy Innocents · 28 December 2026"}),
 Object.freeze({date:"2026-12-29",weekday:"Feria III",
  officeClass:"II_OCTAVE_DAY",officeDate:"2026-12-29",psalmDay:"Dominica",
  marianSection:"Nativiti",printedPsalmDisplayFrames:30,
  rubric:"175(e)",label:"Fifth day in Christmas Octave · 29 December 2026"}),
 Object.freeze({date:"2026-12-30",weekday:"Feria IV",
  officeClass:"II_OCTAVE_DAY",officeDate:"2026-12-30",psalmDay:"Dominica",
  marianSection:"Nativiti",printedPsalmDisplayFrames:30,
  rubric:"175(e)",label:"Sixth day in Christmas Octave · 30 December 2026"}),
 Object.freeze({date:"2026-12-31",weekday:"Feria V",
  officeClass:"I_FEAST_FIRST_VESPERS",officeDate:"2027-01-01",
  psalmDay:"Dominica",marianSection:"Nativiti",
  printedPsalmDisplayFrames:30,rubric:"167(b);175(d)",
  label:"First Compline of the Circumcision · 31 December 2026"}),
 Object.freeze({date:"2027-01-01",weekday:"Feria VI",
  officeClass:"I_FEAST",officeDate:"2027-01-01",psalmDay:"Dominica",
  marianSection:"Nativiti",printedPsalmDisplayFrames:30,
  rubric:"167(h)",label:"Circumcision of Our Lord · 1 January 2027"}),
 Object.freeze({date:"2027-01-02",weekday:"Sabbato",
  officeClass:"II_FEAST_FIRST_VESPERS_ON_SUNDAY",officeDate:"2027-01-03",
  psalmDay:"Sabbato",marianSection:"Nativiti",
  printedPsalmDisplayFrames:41,rubric:"166(b)",
  label:"First Compline of the Holy Name · 2 January 2027"}),
 Object.freeze({date:"2027-01-03",weekday:"Dominica",
  officeClass:"II_FEAST_ON_SUNDAY",officeDate:"2027-01-03",
  psalmDay:"Dominica",marianSection:"Nativiti",
  printedPsalmDisplayFrames:30,rubric:"168(d)",
  label:"Most Holy Name of Jesus · 3 January 2027"})
]);
const CERTIFICATE=Object.freeze({
 officeBasis:"UNIVERSAL_ROMAN_1960",language:"la",
 latinOriginalPinned:true,marianGitBlob:CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA,
 latinSourceRightsMIT:true,traditionalVulgateOnly:true,
 sundayPsalter329WordsCollated:true,
 saturdayPsalterDualPrintedVulgateWitness:true,
 Mame1961OrdinarySequenceReviewed:true,
 completeHour42To40SourceProjectionVerified:true,
 yearRolloverCircumcisionFirstVespersAdjudicated:true,
 holyNameSaturdayFirstVespersAdjudicated:true,
 christmasOctaveSundayCompline175eVerified:true,
 noUnapprovedProperTextInserted:true,
 printedMame1961PsalterFacsimileCollated:false,
 translationCertified:false,otherHoursCertified:false,localCalendarCertified:false
});
const held=(date,reason)=>Object.freeze({
 schema:DEC28_JAN03_LATIN_CERTIFICATE_SCHEMA,date,status:"WITHHELD",
 reason,profile:null,published:false,
 printedMame1961PsalterFacsimileCollated:false
});
/** Source-certified finite profile is independent of the research JSON. */
export function reviewDec28Jan03LatinComplineCertificate(date,{
 candidate=DEC28_JAN03_LATIN_RELEASE_PROFILES.find(x=>x.date===date),
 certificate=CERTIFICATE
}={}){
 const source=researchDec28Jan03PrivateComplineAppointment(date);
 const expected=DEC28_JAN03_LATIN_RELEASE_PROFILES.find(x=>x.date===date);
 if(source.status!=="EXPLICIT_DEC28_JAN03_PRIVATE_SOURCE_RESEARCH"||
    !expected||!candidate||candidate.date!==date)
  return held(date,"YEAR_BOUNDARY_DATE_UNREVIEWED");
 if(Object.keys(expected).some(k=>candidate[k]!==expected[k])||
    expected.date!==source.appointment.date||
    expected.weekday!==source.appointment.weekday||
    expected.officeDate!==source.appointment.officeDate||
    expected.officeClass!==source.appointment.officeClass||
    expected.psalmDay!==source.appointment.psalmDay||
    expected.marianSection!==source.appointment.marianSection)
  return held(date,"INDEPENDENT_DATED_RUBRIC_OR_PSALM_CERTIFICATE_CHANGED");
 if(certificate?.officeBasis!=="UNIVERSAL_ROMAN_1960"||
    certificate?.language!=="la"||
    certificate?.marianGitBlob!==CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA||
    [
     "latinOriginalPinned","latinSourceRightsMIT","traditionalVulgateOnly",
     "sundayPsalter329WordsCollated","saturdayPsalterDualPrintedVulgateWitness",
     "Mame1961OrdinarySequenceReviewed","completeHour42To40SourceProjectionVerified",
     "yearRolloverCircumcisionFirstVespersAdjudicated",
     "holyNameSaturdayFirstVespersAdjudicated",
     "christmasOctaveSundayCompline175eVerified",
     "noUnapprovedProperTextInserted"
    ].some(k=>certificate[k]!==true)||
    certificate?.printedMame1961PsalterFacsimileCollated!==false||
    certificate?.translationCertified!==false||
    certificate?.otherHoursCertified!==false||
    certificate?.localCalendarCertified!==false)
  return held(date,"YEAR_BOUNDARY_SOURCE_TEXT_RIGHTS_OR_SCOPE_CERTIFICATE_CHANGED");
 return Object.freeze({
  schema:DEC28_JAN03_LATIN_CERTIFICATE_SCHEMA,
  date,status:"EXPLICIT_FINITE_YEAR_BOUNDARY_LATIN_CERTIFIED",
  profile:expected,sourceRevision:"126a07f91ede04664108abb6fb20ace3f4de14b9",
  printedMame1961PsalterFacsimileCollated:false,
  translationCertified:false,otherHoursCertified:false,
  localCalendarCertified:false
 });
}
