/**
 * Independently releasable native Latin Compline. The UI may call this
 * on the public host, but NO source is fetched before an edition/rights
 * manifest is approved here in shipped source code.
 *
 * Specifically NOT governed by Mass availability, other Office Hours,
 * URL query params, localStorage, or remote research JSON.
 */
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../app/source-transport-compat.js";
import {assemblePrivateOfficeReview,
 assembleChristmas2026PrivateOfficeResearchReview,
 assembleDec28Jan03PrivateOfficeResearchReview,
 assembleJan04_10PrivateOfficeResearchReview}
 from "./private-office-review.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER,projectComplineRecitation}
 from "./compline-recitation-projection.js";
import {reviewAdventIComplineAppointment}
 from "./compline-advent-2026-appointments.js";
import {reviewChristmas2026LatinComplineCertificate,
 CHRISTMAS_2026_RELEASE_PROFILES,
 CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA}
 from "./compline-christmas-2026-release-certificate.js";
import {reviewDec28Jan03LatinComplineCertificate,
 DEC28_JAN03_LATIN_RELEASE_PROFILES}
 from "./compline-dec28-jan03-2027-release-certificate.js";
import {reviewEpiphany2027FiveDayLatinCertificate,
 EPIPHANY_2027_FIVE_DATE_PROFILES}
 from "./compline-epiphany-jan04-08-2027-release-certificate.js";

export const LATIN_COMPLINE_RELEASE_SCHEMA="ao.office.latin-compline-release.v1";
export const LATIN_COMPLINE_RELEASE=Object.freeze({
 date:"2026-11-28",
 // Each date is certified independently; never infer an entire Advent week.
 approvedDates:Object.freeze([
  "2026-11-28","2026-11-29","2026-11-30","2026-12-01",
  "2026-12-02","2026-12-03","2026-12-04","2026-12-05",
  "2026-12-06","2026-12-07","2026-12-08","2026-12-09",
  "2026-12-10","2026-12-11","2026-12-12","2026-12-13",
  "2026-12-14","2026-12-15","2026-12-16","2026-12-17",
  "2026-12-18","2026-12-19","2026-12-20"
 ]),
 hour:"COMPLINE",calendarScope:"UNIVERSAL",
 sourceRevision:PIN,language:"la",
 // Not every 1961 Breviary prints the same Latin Psalter: Mame, Dessain and
 // the Vatican have Vulgate and Pius XII translation variants. The pinned
 // Latin source is the Vulgata text, not the Pius XII Psalter translation.
 sourcePsalterFamily:"VULGATA_BIBLIORUM",
 target1961Edition:"MAME_1961_VULGATA",
 target1961PsalterFamily:"VULGATA_BIBLIORUM",
 // Original 1961 Vulgata Saturday Psalter leaf has not yet been collated:
 exact1961EditionPsalterLeafVerified:false,
 ordinary1961SequenceReviewed:true,saturdayAppointmentReviewed:true,
 sundayAppointmentReviewed:true,
 sundayPrintedVulgate329WordsDualWitnessCollated:true,
 // Independent Clementine Vulgate Project Psalmi 11/12/15/33/60/69/
 // 70/76/85: all 1,536 original Latin words checked independently,
 // with exactly ten explicitly accounted spelling differences.
 weekdayIndependentClementine1536WordsCollated:true,
 weekdayClementineWitnessRevision:"1f7093a14fa61374b0fe85db1965d9bd45dfdae1",
 // Two independently published printed Roman Psalters establish
 // weekday psalm assignments. We do NOT claim dual full-word collation
 // to the modern printings, nor an original Mame 1961 facsimile.
 weekdayPrintedAppointmentsReviewed:true,
 adventIIIndependentOfficeOrdoDatedWitnessReviewed:true,
 adventIILatinPsalterUsesPreviouslyCertifiedNinePlusFourSources:true,
 adventIIIIndependentEmberOrdoDatedWitnessReviewed:true,
 monday337WordsIndependentClementineExact:true,
 mondayIndependentClementineRevision:"1f7093a14fa61374b0fe85db1965d9bd45dfdae1",
 // A verbatim 1961 Mame Saturday Psalter leaf has NOT been obtained.
 // This release is not represented as a reproduction of that edition.
 psalter1961VerbatimCollated:false,
 // Two independent Vulgate-based printed witnesses (2008 Diurnale and
 // 2023 Psalterium) agree on every Latin word of Psalms 87/102 after
 // documented orthographies. The 1961 Mame Ordinary provides the rest.
 printedVulgatePatternDualWitnessCollated:true,
 releaseBasis:"ROMAN_1960_OFFICE_TRADITIONAL_VULGATE_LATIN",
 completeHourCollated:true,
 // Pinned Latin source is licensed under MIT, with attribution shipped.
 // This approval does NOT extend to English/French translations.
 rightsApproved:true,
 publicReleaseApproved:true
});
/**
 * Additive, separately certified December 21–27 subset. The original Advent
 * 23-date approval register remains unchanged for audited regression tests.
 * No general year resolver or translation rights are unlocked.
 */
export const CHRISTMAS_2026_COMPLINE_RELEASE=Object.freeze({
 approvedDates:Object.freeze(CHRISTMAS_2026_RELEASE_PROFILES.map(x=>x.date)),
 sourceMarianBlobSha:CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA,
 sourcePsalterFamily:"VULGATA_BIBLIORUM",
 language:"la",calendarScope:"UNIVERSAL",hour:"COMPLINE",
 sourceRevision:PIN,rightsApproved:true,publicReleaseApproved:true,
 printed1961MamePsalterFacsimileVerified:false
});
/** Further seven finite universal Latin dates, independent of Advent/Christmas. */
export const DEC28_JAN03_LATIN_COMPLINE_RELEASE=Object.freeze({
 approvedDates:Object.freeze(DEC28_JAN03_LATIN_RELEASE_PROFILES.map(p=>p.date)),
 hour:"COMPLINE",calendarScope:"UNIVERSAL",language:"la",
 sourceRevision:PIN,sourceMarianBlobSha:CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA,
 rightsApproved:true,publicReleaseApproved:true,
 printedMame1961PsalterFacsimileCollated:false
});
/** Five explicit Epiphany-era dates; Holy Family Jan9/10 remain withheld. */
export const EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE=Object.freeze({
 approvedDates:Object.freeze(EPIPHANY_2027_FIVE_DATE_PROFILES.map(x=>x.date)),
 hour:"COMPLINE",calendarScope:"UNIVERSAL",language:"la",
 sourceRevision:PIN,sourceMarianBlobSha:CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA,
 rightsApproved:true,publicReleaseApproved:true,
 holyFamilyJan09_10Released:false,
 printed1961MamePsalterFacsimileVerified:false
});
const empty=(reason)=>Object.freeze({
 schema:LATIN_COMPLINE_RELEASE_SCHEMA,
 status:"WITHHELD",reason,frames:Object.freeze([]),
 availableLanguages:Object.freeze([]),
 sourceTextReleased:false,rightsApproved:false,publishable:false,published:false
});
const APPROVED_DATE_PROFILES=Object.freeze({
 "2026-11-28":Object.freeze({
  psalmDay:"Sabbato",weekday:"Sabbato",officeClass:"SUNDAY_FIRST_VESPERS",
  reason:"FIRST_VESPERS_OF_ADVENT_SUNDAY_COMPLINE_SATURDAY_BR166_B",
  printedPsalmDisplayFrames:41
 }),
 "2026-11-29":Object.freeze({
  psalmDay:"Dominica",weekday:"Dominica",officeClass:"I_SUNDAY",
  reason:"ADVENT_SUNDAY_COMPLINE_SUNDAY_BR166_H",
  printedPsalmDisplayFrames:30
 }),
 "2026-11-30":Object.freeze({
  psalmDay:"Dominica",weekday:"Feria II",officeClass:"II_FEAST",
  reason:"ST_ANDREW_APOSTLE_II_CLASS_SUNDAY_COMPLINE_BR168_D",
  printedPsalmDisplayFrames:30
 }),
 "2026-12-01":Object.freeze({
  psalmDay:"Feria III",weekday:"Feria III",officeClass:"FERIA",
  reason:"ADVENT_FERIA_TUESDAY_CURRENT_WEEKDAY_BR171_E",
  printedPsalmDisplayFrames:26
 }),
 "2026-12-02":Object.freeze({
  psalmDay:"Feria IV",weekday:"Feria IV",officeClass:"III_FEAST",
  reason:"ST_BIBIANA_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  printedPsalmDisplayFrames:30
 }),
 "2026-12-03":Object.freeze({
  psalmDay:"Feria V",weekday:"Feria V",officeClass:"III_FEAST",
  reason:"ST_FRANCIS_XAVIER_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  printedPsalmDisplayFrames:33
 }),
 "2026-12-04":Object.freeze({
  psalmDay:"Feria VI",weekday:"Feria VI",officeClass:"III_FEAST",
  reason:"ST_PETER_CHRYSOLOGUS_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  printedPsalmDisplayFrames:36
 }),
 "2026-12-05":Object.freeze({
  psalmDay:"Sabbato",weekday:"Sabbato",officeClass:"SUNDAY_FIRST_VESPERS",
  reason:"FIRST_VESPERS_OF_ADVENT_SUNDAY_COMPLINE_SATURDAY_BR166_B",
  printedPsalmDisplayFrames:41
 }),
 "2026-12-06":Object.freeze({
  psalmDay:"Dominica",weekday:"Dominica",officeClass:"I_SUNDAY",
  reason:"ADVENT_II_SUNDAY_SECOND_VESPERS_BR166_H",
  printedPsalmDisplayFrames:30,officeDate:"2026-12-06"
 }),
 "2026-12-07":Object.freeze({
  psalmDay:"Dominica",weekday:"Feria II",officeClass:"I_FEAST_FIRST_VESPERS",
  reason:"IMMACULATE_CONCEPTION_I_CLASS_FIRST_VESPERS_BR167_B",
  printedPsalmDisplayFrames:30,officeDate:"2026-12-08"
 }),
 "2026-12-08":Object.freeze({
  psalmDay:"Dominica",weekday:"Feria III",officeClass:"I_FEAST",
  reason:"IMMACULATE_CONCEPTION_I_CLASS_SECOND_VESPERS_BR167_H",
  printedPsalmDisplayFrames:30,officeDate:"2026-12-08"
 }),
 "2026-12-09":Object.freeze({
  psalmDay:"Feria IV",weekday:"Feria IV",officeClass:"FERIA",
  reason:"ADVENT_II_FERIA_IV_CURRENT_WEEKDAY_BR171_E",
  printedPsalmDisplayFrames:30,officeDate:"2026-12-09"
 }),
 "2026-12-10":Object.freeze({
  psalmDay:"Feria V",weekday:"Feria V",officeClass:"FERIA",
  reason:"ADVENT_II_FERIA_V_CURRENT_WEEKDAY_BR171_E",
  printedPsalmDisplayFrames:33,officeDate:"2026-12-10"
 }),
 "2026-12-11":Object.freeze({
  psalmDay:"Feria VI",weekday:"Feria VI",officeClass:"III_FEAST",
  reason:"ST_DAMASUS_III_CLASS_CURRENT_WEEKDAY_BR169_E",
  printedPsalmDisplayFrames:36,officeDate:"2026-12-11"
 }),
 "2026-12-12":Object.freeze({
  psalmDay:"Sabbato",weekday:"Sabbato",officeClass:"SUNDAY_FIRST_VESPERS",
  reason:"ADVENT_III_SUNDAY_FIRST_VESPERS_COMPLINE_SATURDAY_BR166_B",
  printedPsalmDisplayFrames:41,officeDate:"2026-12-13"
 }),
 "2026-12-13":Object.freeze({
  psalmDay:"Dominica",weekday:"Dominica",officeClass:"I_SUNDAY",
  reason:"GAUDETE_SUNDAY_SECOND_VESPERS_BR166_H",
  printedPsalmDisplayFrames:30,officeDate:"2026-12-13"
 }),
 "2026-12-14":Object.freeze({
  psalmDay:"Feria II",weekday:"Feria II",officeClass:"FERIA",
  reason:"ADVENT_III_MONDAY_FERIA_III_CLASS_BR171_E",
  printedPsalmDisplayFrames:28,officeDate:"2026-12-14"
 }),
 "2026-12-15":Object.freeze({
  psalmDay:"Feria III",weekday:"Feria III",officeClass:"FERIA",
  reason:"ADVENT_III_TUESDAY_FERIA_III_CLASS_BR171_E",
  printedPsalmDisplayFrames:26,officeDate:"2026-12-15"
 }),
 "2026-12-16":Object.freeze({
  psalmDay:"Feria IV",weekday:"Feria IV",officeClass:"FERIA",
  reason:"ADVENT_EMBER_WEDNESDAY_II_CLASS_FERIA_BR171_E",
  printedPsalmDisplayFrames:30,officeDate:"2026-12-16"
 }),
 "2026-12-17":Object.freeze({
  psalmDay:"Feria V",weekday:"Feria V",officeClass:"FERIA",
  reason:"ADVENT_DEC17_PRIVILEGED_II_CLASS_FERIA_BR171_E",
  printedPsalmDisplayFrames:33,officeDate:"2026-12-17"
 }),
 "2026-12-18":Object.freeze({
  psalmDay:"Feria VI",weekday:"Feria VI",officeClass:"FERIA",
  reason:"ADVENT_EMBER_FRIDAY_II_CLASS_FERIA_BR171_E",
  printedPsalmDisplayFrames:36,officeDate:"2026-12-18"
 }),
 "2026-12-19":Object.freeze({
  psalmDay:"Sabbato",weekday:"Sabbato",officeClass:"SUNDAY_FIRST_VESPERS",
  reason:"ADVENT_IV_FIRST_VESPERS_AFTER_EMBER_SATURDAY_BR166_B",
  printedPsalmDisplayFrames:41,officeDate:"2026-12-20"
 }),
 "2026-12-20":Object.freeze({
  psalmDay:"Dominica",weekday:"Dominica",officeClass:"I_SUNDAY",
  reason:"ADVENT_IV_SUNDAY_SECOND_VESPERS_BR166_H",
  printedPsalmDisplayFrames:30,officeDate:"2026-12-20"
 })
});
export function latinComplineReleaseEligibility({
 date,hour="COMPLINE",calendarScope="UNIVERSAL"
}={}){
 const christmas=CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates.includes(date);
 const yearBoundary=DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates.includes(date);
 const epiphany=EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.approvedDates.includes(date);
 if(hour!=="COMPLINE"||
    !(LATIN_COMPLINE_RELEASE.approvedDates.includes(date)||christmas||
      yearBoundary||epiphany)||
    calendarScope!==LATIN_COMPLINE_RELEASE.calendarScope)
  return empty("HOUR_DATE_OR_CALENDAR_OUTSIDE_LATIN_RELEASE");
 const christmasCertificate=christmas?
  reviewChristmas2026LatinComplineCertificate(date):null;
 const yearBoundaryCertificate=yearBoundary?
  reviewDec28Jan03LatinComplineCertificate(date):null;
 const epiphanyCertificate=epiphany?
  reviewEpiphany2027FiveDayLatinCertificate(date):null;
 const appointment=christmas||yearBoundary||epiphany?
  null:reviewAdventIComplineAppointment(date);
 // Every dated appointment has its own immutable rubrical certificate.
 // Sunday and St Andrew use Sunday psalms; the two Saturdays still use
 // Saturday psalms. Never equate a Sunday with the previous Saturday.
 const profile=epiphany?epiphanyCertificate?.profile:
  yearBoundary?yearBoundaryCertificate?.profile:
  christmas?christmasCertificate?.profile:APPROVED_DATE_PROFILES[date];
 if(epiphany){
  if(epiphanyCertificate?.status!=="EXPLICIT_EPIPHANY_JAN04_08_LATIN_TEXT_CERTIFIED"||
     !profile||
     EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.sourceRevision!==PIN||
     EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.sourceMarianBlobSha!==
      CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA||
     EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.calendarScope!=="UNIVERSAL"||
     EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.language!=="la"||
     !EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.rightsApproved||
     !EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.publicReleaseApproved||
     EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.holyFamilyJan09_10Released!==false)
   return empty("EPIPHANY_FIVE_DATE_TEXT_OR_RELEASE_CERTIFICATE_UNRESOLVED");
 }else if(yearBoundary){
  if(yearBoundaryCertificate?.status!=="EXPLICIT_FINITE_YEAR_BOUNDARY_LATIN_CERTIFIED"||
     !profile||
     DEC28_JAN03_LATIN_COMPLINE_RELEASE.sourceRevision!==PIN||
     DEC28_JAN03_LATIN_COMPLINE_RELEASE.sourceMarianBlobSha!==
      CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA||
     DEC28_JAN03_LATIN_COMPLINE_RELEASE.calendarScope!=="UNIVERSAL"||
     DEC28_JAN03_LATIN_COMPLINE_RELEASE.language!=="la"||
     !DEC28_JAN03_LATIN_COMPLINE_RELEASE.rightsApproved||
     !DEC28_JAN03_LATIN_COMPLINE_RELEASE.publicReleaseApproved)
   return empty("YEAR_BOUNDARY_DATE_TEXT_OR_RELEASE_CERTIFICATE_UNRESOLVED");
 }else if(christmas){
  if(christmasCertificate?.status!=="EXPLICIT_FINITE_ROMAN_1960_LATIN_TEXT_CERTIFIED"||
     !profile||
     CHRISTMAS_2026_COMPLINE_RELEASE.sourceRevision!==PIN||
     CHRISTMAS_2026_COMPLINE_RELEASE.sourceMarianBlobSha!==
      CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA||
     CHRISTMAS_2026_COMPLINE_RELEASE.calendarScope!=="UNIVERSAL"||
     CHRISTMAS_2026_COMPLINE_RELEASE.language!=="la"||
     !CHRISTMAS_2026_COMPLINE_RELEASE.rightsApproved||
     !CHRISTMAS_2026_COMPLINE_RELEASE.publicReleaseApproved)
   return empty("CHRISTMAS_COMPLINE_DATE_TEXT_OR_RELEASE_CERTIFICATE_UNRESOLVED");
 }else if(!profile||
    appointment.status!=="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH"||
    appointment.appointment?.weekday!==profile.weekday||
    appointment.appointment?.psalmDay!==profile.psalmDay||
    appointment.appointment?.marianSection!=="Advent"||
    appointment.appointment?.officeClass!==profile.officeClass||
    appointment.appointment?.rubricalReason!==profile.reason||
    (profile.officeDate&&appointment.officeOrdoResearch?.officeDate!==profile.officeDate))
  return empty("DATED_ADVENT_COMPLINE_APPOINTMENT_CHANGED");
 if(LATIN_COMPLINE_RELEASE.sourceRevision!==PIN||
    LATIN_COMPLINE_RELEASE.sourcePsalterFamily!=="VULGATA_BIBLIORUM"||
    LATIN_COMPLINE_RELEASE.target1961Edition!=="MAME_1961_VULGATA"||
    LATIN_COMPLINE_RELEASE.target1961PsalterFamily!=="VULGATA_BIBLIORUM"||
    // Exact-1961 typesetting is expressly NOT the approved release basis.
    !LATIN_COMPLINE_RELEASE.ordinary1961SequenceReviewed||
    !LATIN_COMPLINE_RELEASE.saturdayAppointmentReviewed||
    !LATIN_COMPLINE_RELEASE.printedVulgatePatternDualWitnessCollated||
    !LATIN_COMPLINE_RELEASE.sundayAppointmentReviewed||
    !LATIN_COMPLINE_RELEASE.sundayPrintedVulgate329WordsDualWitnessCollated||
    !LATIN_COMPLINE_RELEASE.weekdayIndependentClementine1536WordsCollated||
    LATIN_COMPLINE_RELEASE.weekdayClementineWitnessRevision!==
      "1f7093a14fa61374b0fe85db1965d9bd45dfdae1"||
    !LATIN_COMPLINE_RELEASE.weekdayPrintedAppointmentsReviewed||
    !LATIN_COMPLINE_RELEASE.adventIIIndependentOfficeOrdoDatedWitnessReviewed||
    !LATIN_COMPLINE_RELEASE.adventIILatinPsalterUsesPreviouslyCertifiedNinePlusFourSources||
    !LATIN_COMPLINE_RELEASE.adventIIIIndependentEmberOrdoDatedWitnessReviewed||
    !LATIN_COMPLINE_RELEASE.monday337WordsIndependentClementineExact||
    LATIN_COMPLINE_RELEASE.mondayIndependentClementineRevision!==
      "1f7093a14fa61374b0fe85db1965d9bd45dfdae1"||
    LATIN_COMPLINE_RELEASE.releaseBasis!=="ROMAN_1960_OFFICE_TRADITIONAL_VULGATE_LATIN"||
    !LATIN_COMPLINE_RELEASE.completeHourCollated||
    !LATIN_COMPLINE_RELEASE.rightsApproved||
    !LATIN_COMPLINE_RELEASE.publicReleaseApproved)
  return empty("PRINTED_PSALTER_COMPLETENESS_RIGHTS_OR_RELEASE_UNCERTIFIED");
 return Object.freeze({
  schema:LATIN_COMPLINE_RELEASE_SCHEMA,status:"ELIGIBLE",
  date,hour,calendarScope,sourceRevision:PIN,
  releaseBasis:LATIN_COMPLINE_RELEASE.releaseBasis,
  exact1961PsalterLeafVerified:false,
  psalmDay:profile.psalmDay,printedPsalmDisplayFrames:profile.printedPsalmDisplayFrames,
  officeDate:profile.officeDate??date,
  marianSection:christmas||yearBoundary||epiphany?profile.marianSection:"Advent",
  certificateFamily:epiphany?"EPIPHANY_JAN04_08_FINITE_LATIN":
   yearBoundary?"YEAR_BOUNDARY_2027_FINITE_LATIN":
   christmas?"CHRISTMAS_2026_FINITE_LATIN":"ADVENT_2026_FINITE_LATIN",
  language:"la",sourceTextReleased:true,rightsApproved:true,
  publishable:true,published:true
 });
}
/**
 * Every date has a fixed source-backed appointment and a closed-by-default
 * release gate; the original 1961 Mame Psalter facsimile remains unverified.
 */
export async function loadPublishedLatinCompline({
 date,hour="COMPLINE",calendarScope="UNIVERSAL",
 context=COMPLINE_CONTEXT.FINAL_PRAYER,
 minister=COMPLINE_MINISTER.NON_PRIEST,fetchSource
}={}){
 const permission=latinComplineReleaseEligibility({date,hour,calendarScope});
 if(permission.status!=="ELIGIBLE")return permission;
 if(!Object.values(COMPLINE_CONTEXT).includes(context))
  return empty("UNAPPROVED_RECITATION_CONTEXT");
 if(!Object.values(COMPLINE_MINISTER).includes(minister))
  return empty("UNAPPROVED_PRESIDING_MINISTER");
 if(typeof fetchSource!=="function")return empty("SOURCE_TRANSPORT_REQUIRED");
 const original=permission.certificateFamily==="EPIPHANY_JAN04_08_FINITE_LATIN"?
  await assembleJan04_10PrivateOfficeResearchReview({date,fetchSource}):
  permission.certificateFamily==="YEAR_BOUNDARY_2027_FINITE_LATIN"?
  await assembleDec28Jan03PrivateOfficeResearchReview({date,fetchSource}):
  permission.certificateFamily==="CHRISTMAS_2026_FINITE_LATIN"?
  await assembleChristmas2026PrivateOfficeResearchReview({date,fetchSource}):
  await assemblePrivateOfficeReview({
   hour:"COMPLINE",date,fetchSource,languageMode:"latin"
  });
 if(original.status!=="PRIVATE_SOURCE_TEXT_REVIEW")
  return empty("PINNED_LATIN_SOURCE_UNAVAILABLE");
 const projected=projectComplineRecitation(original,{context,minister});
 if(projected.status!=="PRIVATE_SOURCE_TEXT_REVIEW"||
    projected.readingEventCount!==40||
    projected.sourceEventCount!==42||
    projected.printedPsalmDisplayFrames!==permission.printedPsalmDisplayFrames||
    projected.blessingAmensRestoredFromPinnedSource!==2||
    projected.ministerDialoguesResolved!==2||
    projected.presidingMinister!==minister||
    projected.availableLanguages.length!==1||
    projected.availableLanguages[0]!=="la"||
    projected.officeDate!==permission.officeDate||
    projected.events.filter(f=>f.kind==="MARIAN_ANTIPHON").length!==1||
    projected.events.find(f=>f.kind==="MARIAN_ANTIPHON")?.sourceId!==
      "Psalterium/Mariaant#"+permission.marianSection||
    projected.events.find(f=>f.kind==="MARIAN_COLLECT")?.sourceId!==
      "Psalterium/Mariaant#"+permission.marianSection+":Oratio")
  return empty("COMPLETE_PRINTED_LATIN_READING_UNRESOLVED");
 return Object.freeze({
  ...projected,schema:LATIN_COMPLINE_RELEASE_SCHEMA,reviewOnly:false,
  status:"PUBLIC_LATIN_COMPLINE",published:true,publishable:true,
  readingPublished:true,rightsApproved:true,liturgicallyCertified:true,
  sourceTextReleased:true,releaseDate:date
 });
}