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
import {assemblePrivateOfficeReview}
 from "./private-office-review.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER,projectComplineRecitation}
 from "./compline-recitation-projection.js";
import {reviewAdventIComplineAppointment}
 from "./compline-advent-2026-appointments.js";

export const LATIN_COMPLINE_RELEASE_SCHEMA="ao.office.latin-compline-release.v1";
export const LATIN_COMPLINE_RELEASE=Object.freeze({
 date:"2026-11-28",
 // Each date is certified independently; never infer an entire Advent week.
 approvedDates:Object.freeze(["2026-11-28","2026-12-05"]),
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
const empty=(reason)=>Object.freeze({
 schema:LATIN_COMPLINE_RELEASE_SCHEMA,
 status:"WITHHELD",reason,frames:Object.freeze([]),
 availableLanguages:Object.freeze([]),
 sourceTextReleased:false,rightsApproved:false,publishable:false,published:false
});
export function latinComplineReleaseEligibility({
 date,hour="COMPLINE",calendarScope="UNIVERSAL"
}={}){
 if(hour!=="COMPLINE"||
    !LATIN_COMPLINE_RELEASE.approvedDates.includes(date)||
    calendarScope!==LATIN_COMPLINE_RELEASE.calendarScope)
  return empty("HOUR_DATE_OR_CALENDAR_OUTSIDE_LATIN_RELEASE");
 const appointment=reviewAdventIComplineAppointment(date);
 // Both released dates must be Saturday after Sunday First Vespers,
 // with the identical independently collated Psalm 87/102 and
 // Advent Alma Redemptoris section. No day-of-week inference.
 if(appointment.status!=="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH"||
    appointment.appointment?.weekday!=="Sabbato"||
    appointment.appointment?.psalmDay!=="Sabbato"||
    appointment.appointment?.marianSection!=="Advent"||
    appointment.appointment?.officeClass!=="SUNDAY_FIRST_VESPERS"||
    appointment.appointment?.rubricalReason!==
     "FIRST_VESPERS_OF_ADVENT_SUNDAY_COMPLINE_SATURDAY_BR166_B")
  return empty("SATURDAY_ADVENT_COMPLINE_APPOINTMENT_CHANGED");
 if(LATIN_COMPLINE_RELEASE.sourceRevision!==PIN||
    LATIN_COMPLINE_RELEASE.sourcePsalterFamily!=="VULGATA_BIBLIORUM"||
    LATIN_COMPLINE_RELEASE.target1961Edition!=="MAME_1961_VULGATA"||
    LATIN_COMPLINE_RELEASE.target1961PsalterFamily!=="VULGATA_BIBLIORUM"||
    // Exact-1961 typesetting is expressly NOT the approved release basis.
    !LATIN_COMPLINE_RELEASE.ordinary1961SequenceReviewed||
    !LATIN_COMPLINE_RELEASE.saturdayAppointmentReviewed||
    !LATIN_COMPLINE_RELEASE.printedVulgatePatternDualWitnessCollated||
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
 const original=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date,fetchSource,languageMode:"latin"
 });
 if(original.status!=="PRIVATE_SOURCE_TEXT_REVIEW")
  return empty("PINNED_LATIN_SOURCE_UNAVAILABLE");
 const projected=projectComplineRecitation(original,{context,minister});
 if(projected.status!=="PRIVATE_SOURCE_TEXT_REVIEW"||
    projected.readingEventCount!==40||
    projected.sourceEventCount!==42||
    projected.printedPsalmDisplayFrames!==41||
    projected.blessingAmensRestoredFromPinnedSource!==2||
    projected.ministerDialoguesResolved!==2||
    projected.presidingMinister!==minister||
    projected.availableLanguages.length!==1||
    projected.availableLanguages[0]!=="la")
  return empty("COMPLETE_PRINTED_LATIN_READING_UNRESOLVED");
 return Object.freeze({
  ...projected,schema:LATIN_COMPLINE_RELEASE_SCHEMA,reviewOnly:false,
  status:"PUBLIC_LATIN_COMPLINE",published:true,publishable:true,
  readingPublished:true,rightsApproved:true,liturgicallyCertified:true,
  sourceTextReleased:true,releaseDate:date
 });
}