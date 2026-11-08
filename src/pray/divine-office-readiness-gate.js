/**
 * Prayer integration seam for the private 1960 Roman Office pilot.
 *
 * Native Prayer DOES register a navigable status-only Divine Office route.
 * It does not route the unapproved source texts to public reader cards.
 * Independent Office/source/translation/rights review is still necessary.
 */
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../app/source-transport-compat.js";
import {reviewAdventIComplineAppointment}
 from "../office/compline-advent-2026-appointments.js";
import {latinComplineReleaseEligibility} from "../office/latin-compline-public-release.js";

export const DIVINE_OFFICE_PRAYER_BRIDGE_SCHEMA=
 "ao.pray.divine-office-navigable-source-held.v2";
export const DIVINE_OFFICE_PUBLIC_MODULE_ID="pray.divine_office";
export function getDivineOfficePrayerReadiness({date}={}){
 const selection=reviewAdventIComplineAppointment(date);
 const researched=selection.status==="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH";
 const released=latinComplineReleaseEligibility({date,hour:"COMPLINE"}).status==="ELIGIBLE";
 return Object.freeze({
  schema:DIVINE_OFFICE_PRAYER_BRIDGE_SCHEMA,
  moduleId:DIVINE_OFFICE_PUBLIC_MODULE_ID,
  date:typeof date==="string"?date:null,
  sourceRevision:PIN,
  researchCandidate:researched,
  psalterAppointment:researched?selection.appointment.psalmDay:null,
  marianSection:researched?selection.appointment.marianSection:null,
  readerRuntime:released?"NATIVE_LATIN_COMPLINE_READER":"NATIVE_EIGHT_HOUR_NAVIGATION_SOURCE_HELD",
  researchPreviewEligible:researched,
  publiclyNavigable:true,
  registeredAsPrayerModule:true,
  discoverableInPrayer:true,
  featuredOnHome:false,
  externalReaderUrl:null,
  releaseStatus:released?"LATIN_COMPLINE_28_NOV_RELEASED":"NATIVE_NAVIGATION_AVAILABLE_TEXT_UNRELEASED",
  localCalendarApproved:false,
  liturgicallyCertified:released,
  translationApproved:false,
  rightsApproved:released,
  publicRouteEnabled:true,
  sourceTextReleased:released,
  publishable:released,
  published:released
 });
}
