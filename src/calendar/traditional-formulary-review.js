// Source-bound traditional Mass and commemoration-orations review.
// No imported modern Ordo and no mutation of R17, Mass Proper, Office, or ICS.
// This module is deliberately advisory until *edition-specific Latin texts*
// have been sourced, collated and approved against Cum sanctissima §§1-8.
export const TRADITIONAL_FORMULARY_REVIEW_VERSION="ao-traditional-formulary-v1";
const CORRECT_ORDER=Object.freeze([
  "PRO_ALIQUIBUS_LOCIS_1962","HOLY_SEE_APPROVED_TRADITIONAL_SUPPLEMENT",
  "COMMON_OF_SAINTS_1962"
]);
const ORATIONS=Object.freeze(["collect","secret","postcommunion"]);
const result=(status,reason,extra={})=>Object.freeze({
  status,reason,requiredOrations:ORATIONS,possibleSourceOrder:CORRECT_ORDER,
  authorizedToChangeMass:false,selectedFormularyId:null,
  modified1962Principal:false,...extra
});
const validDate=id=>typeof id==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(id)&&
  !Number.isNaN(Date.parse(id+"T12:00:00Z"))&&new Date(id+"T12:00:00Z").toISOString().slice(0,10)===id;
const hasExactOrations=source=>ORATIONS.every(key=>
  typeof source?.orations?.[key]?.latin==="string"&&
  source.orations[key].latin.trim().length>0&&
  typeof source.orations[key].reference==="string"&&
  source.orations[key].reference.trim().length>0);
const approvedTraditionalSource=source=>
  CORRECT_ORDER.includes(source?.kind)&&
  source?.edition==="1962"&&
  source?.approvalStatus==="VERIFIED_TRADITIONAL_1962_SOURCE"&&
  source?.approvedSourceUrl?.startsWith("https://")&&
  typeof source?.formularyId==="string"&&source.formularyId.length>2;
// A modern proper or a saint's 2026 calendar date never proves traditional
// text source authority. Source-bearing placeholders N. are not arbitrary
// permission to change or compose other prayers.
export function reviewTraditionalMassFormulary({
  date,saintId,eligibility,observed1962Id=null,observed1962DayKind=null,
  candidates=[],displaced1962Orations=null,commemorationLimitReviewed=false
}={}){
  if(!validDate(date)||!saintId?.startsWith?.("saint."))
    return result("INDETERMINATE","DATE_OR_SAINT_ID_REQUIRED");
  if(eligibility?.status==="BLOCKED"||eligibility?.status==="INELIGIBLE")
    return result("BLOCKED","RUBRICAL_DAY_OR_HISTORY_BLOCKER",{
      original1962ObservanceId:observed1962Id,
      eligibilityReason:eligibility.reason||null});
  if(eligibility?.status!=="CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW")
    return result("INDETERMINATE","SOURCE_ATTESTED_OPTIONAL_MASS_ELIGIBILITY_REQUIRED",{
      original1962ObservanceId:observed1962Id});
  // Find only authenticated edition-specific sources, in statutory priority.
  const reviewed=(Array.isArray(candidates)?candidates:[])
    .filter(x=>approvedTraditionalSource(x))
    .sort((a,b)=>CORRECT_ORDER.indexOf(a.kind)-CORRECT_ORDER.indexOf(b.kind));
  if(!reviewed.length)return result("POTENTIALLY_ELIGIBLE_TEXTS_UNRESOLVED",
    "APPROVED_TRADITIONAL_FORMULARY_NOT_VERIFIED",{
      original1962ObservanceId:observed1962Id,
      modernMassProperIsNotTraditionalAuthority:true});
  const first=reviewed[0];
  if(!hasExactOrations(first))
    return result("FORMULARY_INCOMPLETE",
      "TRADITIONAL_COLLECT_SECRET_POSTCOMMUNION_NOT_ALL_SOURCED",{
        original1962ObservanceId:observed1962Id,
        sourceCandidateId:first.formularyId});
  // Cum sanctissima §4 requires the three-orations commemoration when
  // a feast or saint's vigil is omitted. A III/IV feria is different.
  // Never infer a feast solely from the resolver's source ID.
  if(observed1962Id&&!["FEAST","SAINT_VIGIL","FERIA"].includes(observed1962DayKind))
    return result("ORIGINAL_DAY_TYPE_UNVERIFIED",
      "DO_NOT_INFER_DISPLACED_FEAST_FROM_DATE_OR_SOURCE_ID",{
      original1962ObservanceId:observed1962Id,
      sourceCandidateId:first.formularyId});
  if(["FEAST","SAINT_VIGIL"].includes(observed1962DayKind)&&
     !hasExactOrations(displaced1962Orations))
    return result("DISPLACED_1962_ORATIONS_MISSING",
      "OMITTED_TRADITIONAL_FEAST_REQUIRES_FULL_COMMEMORATION_TRIO",{
      original1962ObservanceId:observed1962Id,
      sourceCandidateId:first.formularyId});
  if(!commemorationLimitReviewed)
    return result("MASS_TYPE_REVIEW_REQUIRED","ORDER_AND_COUNT_AND_SUNG_MASS_LIMITS_UNVERIFIED",{
      original1962ObservanceId:observed1962Id,
      sourceCandidateId:first.formularyId});
  return result("REQUIRES_LITURGICAL_AND_CELEBRANT_APPROVAL",
    "SOURCE_COLLATION_COMPLETE_BUT_NOT_AN_ACTUAL_MASS_SELECTION",{
    original1962ObservanceId:observed1962Id,
    sourceCandidateId:first.formularyId,
    displacesHistoricalProper:false
  });
}
// A separate optional commemoration under Cum sanctissima §6 is narrower
// than an optional Mass under §2. Source must name this saint on that DATE
// in the 1962 pro aliquibus locis or an approved traditional Supplement.
// Merely being canonized, or having a modern General Roman Calendar memorial,
// does not permit adding prayers to some other Mass.
export function reviewAdditionalSaintCommemoration({
  date,saintId,dayClass,source=null,prayers=null,
  massType="LOW",existingCommemorations=0
}={}){
  if(!validDate(date)||!saintId?.startsWith?.("saint."))
    return result("INDETERMINATE","DATE_OR_SAINT_ID_REQUIRED");
  const classNumber=({I:1,II:2,III:3,IV:4})[String(dayClass||"").toUpperCase()]||null;
  if(classNumber!==3&&classNumber!==4)
    return result("BLOCKED","OPTIONAL_COMM_REQUIRES_CLASS_III_OR_IV");
  if(massType==="SUNG_NONCONVENTUAL")
    return result("BLOCKED","ORDINARY_ADDITIONAL_COMMEMORATION_NOT_ALLOWED_IN_SUNG_NONCONVENTUAL_MASS");
  if(existingCommemorations>=2)
    return result("BLOCKED","TWO_COMMEMORATIONS_ALREADY_IN_USE");
  if(!approvedTraditionalSource(source) ||
     !["PRO_ALIQUIBUS_LOCIS_1962","HOLY_SEE_APPROVED_TRADITIONAL_SUPPLEMENT"].includes(source.kind) ||
     source.saintId!==saintId||source.monthDay!==date.slice(5))
    return result("BLOCKED","AD_LIBITUM_COMMEMORATION_NOT_ATTESTED_IN_APPROVED_SOURCE_FOR_DAY");
  if(!hasExactOrations(prayers))
    return result("TEXTS_UNVERIFIED","THREE_COMMEMORATIVE_ORATIONS_NOT_SOURCED",{
      sourceCandidateId:source.formularyId});
  return result("REQUIRES_RUBRICAL_AND_CELEBRANT_APPROVAL",
    "ELIGIBLE_SOURCE_EXISTS_BUT_SELECTED_PRAYER_AND_PRECEDENCE_STILL_REQUIRE_REVIEW",{
      sourceCandidateId:source.formularyId
    });
}
// A Doctor proclamation later than the 1962 Missal affects the existing
// saint identity and title; it does not automatically create a new feast.
export function reviewDoctorTitle({canonicalSaintId,traditional1962FeastId,
  doctorDeclaredOn,date}={}){
  if(!canonicalSaintId?.startsWith?.("saint.")||!validDate(date)||
     !validDate(doctorDeclaredOn))
    return result("INDETERMINATE","DOCTOR_IDENTITY_OR_DECLARATION_DATE_UNVERIFIED");
  return result(date<doctorDeclaredOn?"DOCTOR_TITLE_NOT_YET_DECLARED":
    "CANONICAL_IDENTITY_TITLE_ENRICHMENT_ONLY",
    "DOCTOR_TITLE_DOES_NOT_CREATE_SECOND_TRADITIONAL_FEAST_OR_FORMULARY",{
     canonicalSaintId,traditional1962FeastId:traditional1962FeastId||null
    });
}
