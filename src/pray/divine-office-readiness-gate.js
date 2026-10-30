/**
 * Prayer integration seam for the private 1960 Roman Office pilot.
 *
 * This is not an AO_MODULES registration and must never add the Office to
 * internalPrayerView, direct routes, the Prayer card grid or search results.
 * Public text publication requires an independently approved source/rights
 * review, not a boolean flipped on by an ordinary feature flag.
 */
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../app/source-transport-compat.js";
import {reviewAdventIComplineAppointment}
 from "../office/compline-advent-2026-appointments.js";

export const DIVINE_OFFICE_PRAYER_BRIDGE_SCHEMA=
 "ao.pray.divine-office-private-readiness.v1";
export const DIVINE_OFFICE_PUBLIC_MODULE_ID="pray.divine_office";
export function getDivineOfficePrayerReadiness({date}={}){
 const selection=reviewAdventIComplineAppointment(date);
 const researched=selection.status==="EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH";
 return Object.freeze({
  schema:DIVINE_OFFICE_PRAYER_BRIDGE_SCHEMA,
  moduleId:DIVINE_OFFICE_PUBLIC_MODULE_ID,
  date:typeof date==="string"?date:null,
  sourceRevision:PIN,
  researchCandidate:researched,
  psalterAppointment:researched?selection.appointment.psalmDay:null,
  marianSection:researched?selection.appointment.marianSection:null,
  readerRuntime:"SOURCE_FIRST_COMPLINE_INTERNAL_ONLY",
  researchPreviewEligible:researched,
  publiclyNavigable:false,
  registeredAsPrayerModule:false,
  discoverableInPrayer:false,
  featuredOnHome:false,
  externalReaderUrl:null,
  releaseStatus:"INTERNAL_RESEARCH_NOT_PUBLISHED",
  localCalendarApproved:false,
  liturgicallyCertified:false,
  translationApproved:false,
  rightsApproved:false,
  publicRouteEnabled:false,
  publishable:false,
  published:false
 });
}
