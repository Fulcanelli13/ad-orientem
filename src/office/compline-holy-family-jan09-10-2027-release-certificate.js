/**
 * Finite 1960 Roman Latin Compline approval: 9–10 January 2027 ONLY.
 * Holy Family Sunday (II class); I Vespers Sat 9, II Vespers Sun 10.
 *
 * DECISIVE 1960 RUBRICS (primary):
 * https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 * §168(d): both Compline appointments follow the Sunday Psalter;
 * §186: hymn of Compline ALWAYS from the Compline Ordinary;
 * §187: hymns proper to one Hour cannot transfer to another;
 * §188: a hymn retains the conclusion assigned to it in the Breviary;
 * no substitutions merely because of feast/season.
 *
 * Independent dated Office ordo:
 * https://icrspfrance.fr/ordo.php?d=2027-01-09
 * It prescribes Sunday Compline both days and also says "doxologie
 * Jesu tuis", conflicting with applying §§186/188 to the unchanged
 * Ordinary Te lucis. We preserve that contradictory secondary
 * instruction explicitly for editorial review, not silently invent it.
 *
 * Independent pinned Latin source family (MIT):
 * Divinum Officium revision 126a07f91ede04664108abb6fb20ace3f4de14b9
 * Latin/Psalterium/Special/Minor Special.txt, Git blob
 * 34dc6ce45b64442f36de81cfac6160e733e92316:
 * [Hymnus Completorium] has "Præsta, Pater piíssime", NOT "Jesu tuis".
 * Latin/Tempora/Epi1-0.txt, Git blob
 * df64bda0db4cae456ffe1f7a83f7a02cfefc67b0:
 * [Doxology] is "Jesu, tuis obediens" attached to feast proper
 * hymns, not source [Hymnus Completorium].
 *
 * Exact original 1961 Mame full Psalter facsimile, music tone,
 * translations and 11 Jan onward are NOT certified.
 */
import {researchJan04_10PrivateComplineAppointment}
 from "./compline-epiphany-jan04-10-2027-source-gate.js";
import {CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA}
 from "./compline-christmas-2026-release-certificate.js";
export const HOLY_FAMILY_2027_SOURCE_SCHEMA=
 "ao.office.holy-family-2027-finite-latin-compline-release.v1";
export const HOLY_FAMILY_2027_ORDINARY_HYMN_BLOB_SHA=
 "34dc6ce45b64442f36de81cfac6160e733e92316";
export const HOLY_FAMILY_2027_PROPER_BLOB_SHA=
 "df64bda0db4cae456ffe1f7a83f7a02cfefc67b0";
export const HOLY_FAMILY_2027_RELEASE_PROFILES=Object.freeze([
 Object.freeze({date:"2027-01-09",weekday:"Sabbato",
  officeClass:"II_FEAST_FIRST_VESPERS",officeDate:"2027-01-10",
  psalmDay:"Dominica",marianSection:"Nativiti",
  printedPsalmDisplayFrames:30,rubric:"168(d)",
  label:"First Compline of the Holy Family · 9 January 2027"}),
 Object.freeze({date:"2027-01-10",weekday:"Dominica",
  officeClass:"II_FEAST",officeDate:"2027-01-10",
  psalmDay:"Dominica",marianSection:"Nativiti",
  printedPsalmDisplayFrames:30,rubric:"168(d)",
  label:"Holy Family of Jesus, Mary and Joseph · 10 January 2027"})
]);
export const HOLY_FAMILY_2027_TEXT_CERTIFICATE=Object.freeze({
 calendarScope:"UNIVERSAL_ROMAN_1960",language:"la",
 existingVulgateSundayPsalms329WordsVerified:true,
 originalCompline42To40EventsVerified:true,
 independentlyDatedFirstAndSecondVespers:true,
 twoSemifestiveSundayComplineAppointments:true,
 rubric168dVerified:true,
 rubric186ComplineOrdinaryHymnVerified:true,
 rubric187NoTransferringFeastHymnVerified:true,
 rubric188AssignedOrdinaryDoxologyVerified:true,
 ordinaryTeLucisSourceId:"Psalterium/Special/Minor Special#Hymnus Completorium",
 ordinaryTeLucisConclusion:"Præsta, Pater piíssime,",
 originalLatinOrdinaryGitBlob:HOLY_FAMILY_2027_ORDINARY_HYMN_BLOB_SHA,
 holyFamilyProperDoxologyGitBlob:HOLY_FAMILY_2027_PROPER_BLOB_SHA,
 properDoxologyNotReassignedToTeLucis:true,
 conflictingIcrspDoxologyInstructionDisclosed:true,
 marianGitBlob:CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA,
 pinnedLatinRightsMIT:true,
 chantToneOrGregorianNotationCertified:false,
 exactMame1961PsalterFacsimileCertified:false,
 translationsApproved:false,otherHoursApproved:false,localCalendarsApproved:false
});
const held=(date,reason)=>Object.freeze({
 schema:HOLY_FAMILY_2027_SOURCE_SCHEMA,date,status:"WITHHELD",reason,
 profile:null,published:false
});
export function reviewHolyFamily2027LatinComplineCertificate(date,{
 candidate=HOLY_FAMILY_2027_RELEASE_PROFILES.find(p=>p.date===date),
 certificate=HOLY_FAMILY_2027_TEXT_CERTIFICATE
}={}){
 const expected=HOLY_FAMILY_2027_RELEASE_PROFILES.find(p=>p.date===date);
 const research=researchJan04_10PrivateComplineAppointment(date);
 if(!expected||!candidate||candidate.date!==date||
    research.status!=="EXPLICIT_EPIPHANY_2027_PRIVATE_SOURCE_RESEARCH")
  return held(date,"HOLY_FAMILY_DATE_OUTSIDE_EXPLICIT_2027_RELEASE");
 if(Object.keys(expected).some(k=>candidate[k]!==expected[k])||
    expected.officeDate!==research.appointment.officeDate||
    expected.psalmDay!==research.appointment.psalmDay||
    expected.weekday!==research.appointment.weekday||
    expected.officeClass!==research.appointment.officeClass||
    expected.marianSection!==research.appointment.marianSection)
  return held(date,"HOLY_FAMILY_DATE_OFFICE_OR_PSALTER_CHANGED");
 if(certificate?.calendarScope!=="UNIVERSAL_ROMAN_1960"||
    certificate?.language!=="la"||
    certificate?.originalLatinOrdinaryGitBlob!==HOLY_FAMILY_2027_ORDINARY_HYMN_BLOB_SHA||
    certificate?.holyFamilyProperDoxologyGitBlob!==HOLY_FAMILY_2027_PROPER_BLOB_SHA||
    certificate?.marianGitBlob!==CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA||
    certificate?.ordinaryTeLucisSourceId!==
      "Psalterium/Special/Minor Special#Hymnus Completorium"||
    certificate?.ordinaryTeLucisConclusion!=="Præsta, Pater piíssime,"||
    [
      "existingVulgateSundayPsalms329WordsVerified",
      "originalCompline42To40EventsVerified",
      "independentlyDatedFirstAndSecondVespers",
      "twoSemifestiveSundayComplineAppointments",
      "rubric168dVerified","rubric186ComplineOrdinaryHymnVerified",
      "rubric187NoTransferringFeastHymnVerified",
      "rubric188AssignedOrdinaryDoxologyVerified",
      "properDoxologyNotReassignedToTeLucis",
      "conflictingIcrspDoxologyInstructionDisclosed",
      "pinnedLatinRightsMIT"
    ].some(k=>certificate[k]!==true)||
    [
     "chantToneOrGregorianNotationCertified",
     "exactMame1961PsalterFacsimileCertified",
     "translationsApproved","otherHoursApproved","localCalendarsApproved"
    ].some(k=>certificate[k]!==false))
  return held(date,"HOLY_FAMILY_1960_ORDINARY_DOXOLOGY_OR_SOURCE_CERTIFICATE_CHANGED");
 return Object.freeze({
  schema:HOLY_FAMILY_2027_SOURCE_SCHEMA,
  status:"EXPLICIT_HOLY_FAMILY_2027_LATIN_COMPLINE_CERTIFIED",
  profile:expected,sourceOrdinal:"1960_BR_186_188_ORDINARY",
  ordinaryTeLucisGitBlob:HOLY_FAMILY_2027_ORDINARY_HYMN_BLOB_SHA,
  improperVespersDoxologyInsertionForbidden:true,
  conflictingIcrspDoxologyInstructionDisclosed:true,
  chantToneOrGregorianNotationCertified:false,
  exactMame1961PsalterFacsimileCertified:false,
  translationsApproved:false,otherHoursApproved:false,
  localCalendarsApproved:false
 });
}
