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
import {COMPLINE_CONTEXT,projectComplineRecitation}
 from "./compline-recitation-projection.js";

export const LATIN_COMPLINE_RELEASE_SCHEMA="ao.office.latin-compline-release.v1";
export const LATIN_COMPLINE_RELEASE=Object.freeze({
 date:"2026-11-28",hour:"COMPLINE",calendarScope:"UNIVERSAL",
 sourceRevision:PIN,language:"la",
 ordinary1961SequenceReviewed:true,saturdayAppointmentReviewed:true,
 // Do not change these flags without documentary certification:
 psalter1961VerbatimCollated:false,
 completeHourCollated:false,
 rightsApproved:false,
 publicReleaseApproved:false
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
 if(hour!=="COMPLINE"||date!==LATIN_COMPLINE_RELEASE.date||
    calendarScope!==LATIN_COMPLINE_RELEASE.calendarScope)
  return empty("HOUR_DATE_OR_CALENDAR_OUTSIDE_LATIN_RELEASE");
 if(LATIN_COMPLINE_RELEASE.sourceRevision!==PIN||
    !LATIN_COMPLINE_RELEASE.ordinary1961SequenceReviewed||
    !LATIN_COMPLINE_RELEASE.saturdayAppointmentReviewed||
    !LATIN_COMPLINE_RELEASE.psalter1961VerbatimCollated||
    !LATIN_COMPLINE_RELEASE.completeHourCollated||
    !LATIN_COMPLINE_RELEASE.rightsApproved||
    !LATIN_COMPLINE_RELEASE.publicReleaseApproved)
  return empty("PRINTED_PSALTER_COMPLETENESS_RIGHTS_OR_RELEASE_UNCERTIFIED");
 return Object.freeze({
  schema:LATIN_COMPLINE_RELEASE_SCHEMA,status:"ELIGIBLE",
  date,hour,calendarScope,sourceRevision:PIN,
  language:"la",sourceTextReleased:true,rightsApproved:true,
  publishable:true,published:true
 });
}
/**
 * The runtime path is complete and testable with mocked transport; the
 * fixed, checked-in release gate above is deliberately closed today.
 */
export async function loadPublishedLatinCompline({
 date,hour="COMPLINE",calendarScope="UNIVERSAL",
 context=COMPLINE_CONTEXT.FINAL_PRAYER,fetchSource
}={}){
 const permission=latinComplineReleaseEligibility({date,hour,calendarScope});
 if(permission.status!=="ELIGIBLE")return permission;
 if(!Object.values(COMPLINE_CONTEXT).includes(context))
  return empty("UNAPPROVED_RECITATION_CONTEXT");
 if(typeof fetchSource!=="function")return empty("SOURCE_TRANSPORT_REQUIRED");
 const original=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date,fetchSource,languageMode:"latin"
 });
 if(original.status!=="PRIVATE_SOURCE_TEXT_REVIEW")
  return empty("PINNED_LATIN_SOURCE_UNAVAILABLE");
 const projected=projectComplineRecitation(original,{context});
 if(projected.status!=="PRIVATE_SOURCE_TEXT_REVIEW"||
    projected.readingEventCount!==40||
    projected.sourceEventCount!==42||
    projected.printedPsalmDisplayFrames!==41||
    projected.blessingAmensRestoredFromPinnedSource!==2||
    projected.availableLanguages.length!==1||
    projected.availableLanguages[0]!=="la")
  return empty("COMPLETE_PRINTED_LATIN_READING_UNRESOLVED");
 return Object.freeze({
  ...projected,schema:LATIN_COMPLINE_RELEASE_SCHEMA,reviewOnly:false,
  status:"PUBLIC_LATIN_COMPLINE",published:true,publishable:true,
  readingPublished:true,rightsApproved:true,liturgicallyCertified:true,
  sourceTextReleased:true,releaseDate:LATIN_COMPLINE_RELEASE.date
 });
}