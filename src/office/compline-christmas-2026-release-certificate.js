/**
 * Finite independently reviewed universal Roman 1960 Latin Compline dates:
 * 21–27 December 2026. This is a source-and-rubrics certificate, NOT a
 * facsimile certificate for original Mame 1961 Psalter leaf, and not a
 * generalized feast/season resolver.
 *
 * Dated ordo: https://breviariumgregorianum.com/ordo-2026.php
 * 1960 BR §§166–173,175–176,186,188,210,241,244,248:
 * https://divinumofficium.hu/www/horas/Help/Rubrics/Breviary%201960.html
 * Marian switch: https://1962ordo.today/season/
 * 26 Dec concurrence:
 * https://ordo.fsspx.org/en/day/2026-12-26?source=monacensis-et-frisingensis
 *
 * The last-prayer Pater/Confiteor and Roman 1961 Ordinary 42->40 source
 * projection are already collated and retained. All 7 psalm groups reuse
 * previously independently compared source-word registers (Sunday 329;
 * Tue/Wed within 1,536 ferial-word certificate). No new Psalm words.
 * The unchanged Marian pinned Latin leaf has exact Git blob SHA
 * bf44a58ba1076b17466b88fa4004c1cab29f96ae (MIT source).
 */
import {researchChristmas2026PrivateComplineAppointment}
 from "./compline-christmas-2026-research-gate.js";

export const CHRISTMAS_2026_COMPLINE_CERTIFICATE_SCHEMA=
 "ao.office.christmas-2026-independent-rubrics-and-pinned-latin.v1";
export const CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA=
 "bf44a58ba1076b17466b88fa4004c1cab29f96ae";
export const CHRISTMAS_2026_RELEASE_PROFILES=Object.freeze([
 Object.freeze({date:"2026-12-21",weekday:"Feria II",psalmDay:"Dominica",
  officeClass:"II_FEAST",officeDate:"2026-12-21",marianSection:"Advent",
  rubric:"168(d)",printedPsalmDisplayFrames:30,
  label:"Saint Thomas Apostle · 21 December 2026"}),
 Object.freeze({date:"2026-12-22",weekday:"Feria III",psalmDay:"Feria III",
  officeClass:"II_FERIA",officeDate:"2026-12-22",marianSection:"Advent",
  rubric:"171(e)",printedPsalmDisplayFrames:26,
  label:"Advent feria · 22 December 2026"}),
 Object.freeze({date:"2026-12-23",weekday:"Feria IV",psalmDay:"Feria IV",
  officeClass:"II_FERIA",officeDate:"2026-12-23",marianSection:"Advent",
  rubric:"171(e)",printedPsalmDisplayFrames:30,
  label:"Advent feria · 23 December 2026"}),
 Object.freeze({date:"2026-12-24",weekday:"Feria V",psalmDay:"Dominica",
  officeClass:"I_FEAST_FIRST_VESPERS",officeDate:"2026-12-25",
  marianSection:"Nativiti",rubric:"167(b)",printedPsalmDisplayFrames:30,
  label:"First Compline of Christmas · 24 December 2026"}),
 Object.freeze({date:"2026-12-25",weekday:"Feria VI",psalmDay:"Dominica",
  officeClass:"I_FEAST",officeDate:"2026-12-25",
  marianSection:"Nativiti",rubric:"167(h)",printedPsalmDisplayFrames:30,
  label:"Nativity of Our Lord · 25 December 2026"}),
 Object.freeze({date:"2026-12-26",weekday:"Sabbato",psalmDay:"Dominica",
  officeClass:"II_FEAST",officeDate:"2026-12-26",
  marianSection:"Nativiti",rubric:"168(d)",printedPsalmDisplayFrames:30,
  label:"Saint Stephen Protomartyr · 26 December 2026"}),
 Object.freeze({date:"2026-12-27",weekday:"Dominica",psalmDay:"Dominica",
  officeClass:"CHRISTMAS_OCTAVE_SUNDAY",officeDate:"2026-12-27",
  marianSection:"Nativiti",rubric:"175(e),176",printedPsalmDisplayFrames:30,
  label:"Sunday within Christmas Octave · 27 December 2026"})
]);
const CERTIFICATE=Object.freeze({
 sourceFamily:"ROMAN_BREVIARY_1960",
 calendarScope:"UNIVERSAL",
 language:"la",
 sourceLatinPinned:true,psalterTextReused:true,
 traditionalVulgatePsalterOnly:true,
 ordinarySequenceAlreadyCollated:true,
 christmasSpecialVigilEndsBeforeFirstVespers:true,
 christmasFirstVespersExplicitlyAdjudicated:true,
 seasonalMarianPostPartumExactPin:true,
 marianBlobSha:CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA,
 sunday329WordsAlreadyCollated:true,
 ferial1536WordsAlreadyCollated:true,
 unchangedChapterTuAutem:true,
 unchangedComplineResponsory:true,
 unchangedComplineCollectVisita:true,
 unchangedHymnOutsideProperRubrics:true,
 printed1961MamePsalterFacsimileVerified:false,
 translationsApproved:false,
 otherHoursApproved:false,
 localCalendarsApproved:false
});
const deny=(date,reason)=>Object.freeze({
 schema:CHRISTMAS_2026_COMPLINE_CERTIFICATE_SCHEMA,date,
 status:"WITHHELD",reason,profile:null,
 printed1961MamePsalterFacsimileVerified:false,
 translationApproved:false
});
export function reviewChristmas2026LatinComplineCertificate(date,{
 candidate=CHRISTMAS_2026_RELEASE_PROFILES.find(p=>p.date===date),
 certificate=CERTIFICATE
}={}){
 const source=researchChristmas2026PrivateComplineAppointment(date);
 if(source.status!=="EXPLICIT_CHRISTMAS_2026_PRIVATE_SOURCE_RESEARCH"||
    !candidate||candidate.date!==date)
  return deny(date,"CHRISTMAS_RELEASE_DATE_NOT_IN_FINITE_DATED_ORDO");
 const src=source.appointment;
 const expected=CHRISTMAS_2026_RELEASE_PROFILES.find(p=>p.date===date);
 if(!expected||Object.keys(expected).some(k=>candidate[k]!==expected[k])||
    src.weekday!==expected.weekday||
    src.psalmDay!==expected.psalmDay||
    src.marianSection!==expected.marianSection||
    src.officeDate!==expected.officeDate||
    src.officeClass!==expected.officeClass)
  return deny(date,"DATED_OFFICE_OR_SEASONAL_PSALTER_CERTIFICATE_CHANGED");
 if(certificate?.sourceFamily!=="ROMAN_BREVIARY_1960"||
    certificate?.calendarScope!=="UNIVERSAL"||
    certificate?.language!=="la"||
    certificate?.marianBlobSha!==CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA||
    [
     "sourceLatinPinned","psalterTextReused",
     "traditionalVulgatePsalterOnly","ordinarySequenceAlreadyCollated",
     "christmasSpecialVigilEndsBeforeFirstVespers",
     "christmasFirstVespersExplicitlyAdjudicated",
     "seasonalMarianPostPartumExactPin",
     "sunday329WordsAlreadyCollated","ferial1536WordsAlreadyCollated",
     "unchangedChapterTuAutem","unchangedComplineResponsory",
     "unchangedComplineCollectVisita","unchangedHymnOutsideProperRubrics"
    ].some(k=>certificate[k]!==true)||
    certificate?.printed1961MamePsalterFacsimileVerified!==false||
    certificate?.translationsApproved!==false||
    certificate?.otherHoursApproved!==false||
    certificate?.localCalendarsApproved!==false)
  return deny(date,"CHRISTMAS_TEXT_RUBRICS_RIGHTS_OR_SCOPE_UNCERTIFIED");
 return Object.freeze({
  schema:CHRISTMAS_2026_COMPLINE_CERTIFICATE_SCHEMA,
  status:"EXPLICIT_FINITE_ROMAN_1960_LATIN_TEXT_CERTIFIED",
  date,profile:expected,sourceFamily:certificate.sourceFamily,
  sourceLatinPinned:true,
  printed1961MamePsalterFacsimileVerified:false,
  translationApproved:false,otherHoursApproved:false,
  localCalendarsApproved:false
 });
}
