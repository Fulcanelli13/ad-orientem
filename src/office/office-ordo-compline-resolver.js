/**
 * Independent Roman 1960 Office-ordo -> Compline psalter research resolver.
 *
 * This is a SOURCE-INTAKE AND RUBRIC CHECK, never a date generator, never
 * the Mass calendar and never publication approval. A supplied source record
 * can be structurally consistent and still have inaccurate source assertions:
 * original Office-ordo and printed-text collation is a separate review gate.
 *
 * Rubricae Breviarii 1960 §§ 165–176, 180–181:
 * https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien
 * A date and rank alone CANNOT select Compline: the independently adjudicated
 * Office, first-Vespers concurrence, exceptional proper and Marian season
 * must ALL be provided in Office-specific evidence.
 */
import {DIVINUM_OFFICIUM_PIN as PIN} from "../app/source-transport-compat.js";

export const OFFICE_COMPLINE_ORDO_EVIDENCE_SCHEMA=
 "ao.office.independent-1960-compline-ordo-record.v1";
export const OFFICE_COMPLINE_ORDO_RESOLVER_SCHEMA=
 "ao.office.source-first-compline-ordo-resolution.v1";
export const OFFICE_COMPLINE_ORDO_RUBRICS=
 "https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien";
export const OFFICE_COMPLINE_PSALTER_SECTION=
 "Psalterium/Psalmi/Psalmi minor#Completorium";
export const OFFICE_COMPLINE_MARIAN_SECTIONS=Object.freeze([
 "Advent","Nativiti","Quadragesimae","Paschalis","Postpentecost"
]);
const DAYS=Object.freeze([
 "Dominica","Feria II","Feria III","Feria IV","Feria V","Feria VI",
 "Sabbato"
]);
const CLASSES=Object.freeze([
 "SUNDAY","I_FEAST","II_FEAST","III_FEAST",
 "FERIA","VIGIL","CHRISTMAS_OCTAVE","SATURDAY_BVM"
]);
const RUBRIC=Object.freeze({
 "SUNDAY_FIRST_VESPERS":"166(b)",
 "SUNDAY":"166(h)",
 "I_FEAST_FIRST_VESPERS":"167(b)",
 "I_FEAST":"167(h)",
 "II_FEAST":"168(d)",
 "III_FEAST":"169(e)",
 "SATURDAY_BVM":"169(e)",
 "FERIA":"171(e)",
 "VIGIL":"171(e)",
 "CHRISTMAS_OCTAVE":"175(e)"
});
const WEEKDAY_TYPES=new Set(["III_FEAST","FERIA","VIGIL","SATURDAY_BVM"]);
const FIRST_VESPERS=new Set(["SUNDAY_FIRST_VESPERS","I_FEAST_FIRST_VESPERS"]);
const SPECIAL_STATES=new Set([
 "TRIDUUM","OFFICE_OF_DEAD","EASTER_PENTECOST","PROPER_COMPLINE",
 "CHRISTMAS_VIGIL","PRIVILEGED_EXCEPTION","UNKNOWN"
]);
const isoDate=date=>typeof date==="string"&&
 /^\d{4}-\d\d-\d\d$/u.test(date)&&
 !Number.isNaN(Date.parse(date+"T12:00:00Z"))&&
 new Date(date+"T12:00:00Z").toISOString().slice(0,10)===date;
const following=date=>{
 const d=new Date(date+"T12:00:00Z");
 d.setUTCDate(d.getUTCDate()+1);
 return d.toISOString().slice(0,10);
};
const failed=(date,reason,stage="OFFICE_CALENDAR_EVIDENCE")=>
 Object.freeze({
  schema:OFFICE_COMPLINE_ORDO_RESOLVER_SCHEMA,date,
  stage,status:"WITHHELD",reason,appointment:null,
  officeCalendarSourceAccepted:false,occurrenceReviewed:false,
  calendarSelectionAuthorized:false,psalterAppointmentResearchOnly:true,
  completeHourCertified:false,textCollated:false,
  translationApproved:false,rightsApproved:false,
  publishable:false,published:false
 });
/**
 * Finite assertions from a reviewed Office ordo are accepted as RESEARCH
 * records only. Never accept mass-day objects, DOM strings, or remote HTML
 * just because they contain a date or "first class".
 *
 * Date-specific source verification must happen upstream, independently of
 * this pure verifier. No UI, network, localStorage or Mass calendar access.
 */
export function resolveSourceFirstComplineOrdo({date,calendarScope="UNIVERSAL",
 record}={}){
 if(!isoDate(date))return failed(date,"CIVIL_DATE_INVALID");
 if(calendarScope!=="UNIVERSAL")
  return failed(date,"LOCAL_OFFICE_OR_APPROVED_COMMUNITY_ORDO_REQUIRED");
 if(record?.schema!==OFFICE_COMPLINE_ORDO_EVIDENCE_SCHEMA||
    record.date!==date||record.calendarScope!=="UNIVERSAL"||
    record.officeOrdoFamily!=="ROMAN_BREVIARY_1960"||
    record.reviewStage!=="DATE_SPECIFIC_OFFICE_RESEARCH_REVIEWED"||
    record.publicReleaseCertified!==false||
    record.sourceTextCertified!==false||
    record.translationCertified!==false)
  return failed(date,"INDEPENDENT_DATED_OFFICE_ORDO_RECORD_REQUIRED");
 const source=record.source;
 if(source?.sourceKind!=="INDEPENDENT_OFFICE_ORDO"||
    source?.rubricUrl!==OFFICE_COMPLINE_ORDO_RUBRICS||
    typeof source?.sourceId!=="string"||
    !/^ao\.office\.[a-zA-Z0-9._:|-]{8,160}$/u.test(source.sourceId)||
    typeof source?.officeOrdoUrl!=="string"||
    !/^https:\/\//u.test(source.officeOrdoUrl)||
    source?.psalterLeaf!==OFFICE_COMPLINE_PSALTER_SECTION||
    source?.psalterRevision!==PIN)
  return failed(date,"OFFICE_SOURCE_PROVENANCE_OR_PIN_REQUIRED");
 if(record.occurrenceDisposition!=="INDEPENDENT_OFFICE_PRECEDENCE_REVIEWED"||
    !["NO_COMPETITION","ADJUDICATED_WITH_COMM_REQUIRED",
      "ADJUDICATED_WITHOUT_COMM"].includes(record.commemorationDisposition))
  return failed(date,"OFFICE_OCCURRENCE_OR_COMMEMORATION_UNRESOLVED");
 const w=new Date(date+"T12:00:00Z").getUTCDay();
 const weekday=DAYS[w];
 if(record.weekday!==weekday||!CLASSES.includes(record.officeKind)||
    !OFFICE_COMPLINE_MARIAN_SECTIONS.includes(record.marianSection)||
    record.marianSource?.section!==record.marianSection||
    record.marianSource?.sourceId!==
      "Psalterium/Mariaant#"+record.marianSection||
    record.marianSource?.reviewedInOfficeOrdo!==true)
  return failed(date,"OFFICE_WEEKDAY_OR_SEASONAL_MARIAN_EVIDENCE_INCOMPLETE");
 // Special orders bypass the ordinary Psalm pattern, even when they have a
 // familiar weekday. Never silently serve them as the ordinary Compline.
 if(SPECIAL_STATES.has(record.exception)||record.exception!=="NONE"||
    record.properCompline!=="NONE")
  return failed(date,"SPECIAL_OFFICE_OR_PROPER_COMPLINE_NEEDS_OWN_CERTIFICATE");
 const first=record.firstVespers;
 if(!first||typeof first!=="object"||
    !["NONE","SUNDAY_FIRST_VESPERS",
      "I_FEAST_FIRST_VESPERS"].includes(first.kind))
  return failed(date,"VESPERS_CONCURRENCE_NOT_RESOLVED");
 let psalmDay,expectedRule,officeDate=date,profile;
 if(first.kind==="SUNDAY_FIRST_VESPERS"){
  if(w!==6||record.officeKind!=="SUNDAY"||
     first.officeDate!==following(date)||
     first.independentConcurrenceReviewed!==true||
     typeof first.sourceId!=="string"||first.sourceId.length<8)
   return failed(date,"FIRST_VESPERS_OF_SUNDAY_NEEDS_INDEPENDENT_PROOF");
  psalmDay="Sabbato";expectedRule=RUBRIC.SUNDAY_FIRST_VESPERS;
  profile="SUNDAY_FIRST_VESPERS";officeDate=first.officeDate;
 }else if(first.kind==="I_FEAST_FIRST_VESPERS"){
  if(record.officeKind!=="I_FEAST"||
     first.officeDate!==following(date)||
     first.independentConcurrenceReviewed!==true||
     typeof first.sourceId!=="string"||first.sourceId.length<8)
   return failed(date,"FIRST_VESPERS_OF_I_CLASS_FEAST_NOT_ADJUDICATED");
  psalmDay="Dominica";expectedRule=RUBRIC.I_FEAST_FIRST_VESPERS;
  profile="I_FEAST_FIRST_VESPERS";officeDate=first.officeDate;
 }else{
  if(first.officeDate!==date||
     first.independentConcurrenceReviewed!==true)
   return failed(date,"NORMAL_HOUR_OFFICE_DATE_NOT_VERIFIED");
  // Ordinary Sundays and I/II-class feasts have Sunday Compline.
  // Christmas octave has Sunday Compline via BR175(e), while the
  // Triduum/Easter/Pentecost/Christmas vigil still need special handling.
  if(record.officeKind==="SUNDAY"){
   if(w!==0)return failed(date,"SUNDAY_OFFICE_ON_NON_SUNDAY");
   psalmDay="Dominica";
  }else if(record.officeKind==="SATURDAY_BVM"){
   if(w!==6)return failed(date,"SATURDAY_BVM_ON_NON_SATURDAY");
   psalmDay=weekday;
  }else psalmDay=WEEKDAY_TYPES.has(record.officeKind)?
   weekday:"Dominica";
  expectedRule=RUBRIC[record.officeKind];
  profile=record.officeKind;
 }
 if(record.rubricSection!==expectedRule)
  return failed(date,"1960_OFFICE_RUBRIC_SECTION_DISAGREEMENT");
 if(record.assertedPsalmDay!==psalmDay||
    !DAYS.includes(psalmDay))
  return failed(date,"DATED_OFFICE_PSALTER_APPOINTMENT_CONFLICT");
 return Object.freeze({
  schema:OFFICE_COMPLINE_ORDO_RESOLVER_SCHEMA,
  status:"OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY",
  reason:"OFFICE_SOURCE_RUBRICALLY_COHERENT_NOT_TEXT_RELEASED",
  stage:"PSALTER_DAY_RESEARCH",date,officeDate,weekday,
  officeKind:record.officeKind,profile,
  appointment:Object.freeze({
   date,officeDate,weekday,officeKind:record.officeKind,
   psalmDay,marianSection:record.marianSection,
   rubricSection:expectedRule,
   sourceId:source.sourceId,sourceUrl:source.officeOrdoUrl,
   psalterSourceRevision:PIN
  }),
  officeCalendarSourceAccepted:true,occurrenceReviewed:true,
  calendarSelectionAuthorized:false,psalterAppointmentResearchOnly:true,
  completeHourCertified:false,textCollated:false,
  translationApproved:false,rightsApproved:false,
  publishable:false,published:false
 });
}

/**
 * Convert ONLY the eight existing reviewed production records into typed
 * Office evidence, to cross-check the new general resolver without widening
 * publication. The manually collated/approved release gate remains separate.
 */
export function researchWitnessForReviewedAdventCompline(appointment){
 const profileByClass=Object.freeze({
  SUNDAY_FIRST_VESPERS:"SUNDAY",
  I_FEAST_FIRST_VESPERS:"I_FEAST",
  I_FEAST:"I_FEAST",
  I_SUNDAY:"SUNDAY",
  II_FEAST:"II_FEAST",
  III_FEAST:"III_FEAST",
  FERIA:"FERIA"
 });
 if(!appointment||typeof appointment.date!=="string"||
    typeof appointment.rubricalReason!=="string"||
    !profileByClass[appointment.officeClass])return null;
 const first=appointment.officeClass==="SUNDAY_FIRST_VESPERS";
 const feastFirst=appointment.officeClass==="I_FEAST_FIRST_VESPERS";
 const officeDate=first||feastFirst?following(appointment.date):appointment.date;
 if(appointment.officeDate&&appointment.officeDate!==officeDate)return null;
 return Object.freeze({
  schema:OFFICE_COMPLINE_ORDO_EVIDENCE_SCHEMA,
  date:appointment.date,weekday:appointment.weekday,
  calendarScope:"UNIVERSAL",officeOrdoFamily:"ROMAN_BREVIARY_1960",
  officeKind:profileByClass[appointment.officeClass],
  reviewStage:"DATE_SPECIFIC_OFFICE_RESEARCH_REVIEWED",
  occurrenceDisposition:"INDEPENDENT_OFFICE_PRECEDENCE_REVIEWED",
  commemorationDisposition:"NO_COMPETITION",
  publicReleaseCertified:false,sourceTextCertified:false,
  translationCertified:false,exception:"NONE",properCompline:"NONE",
  assertedPsalmDay:appointment.psalmDay,
  rubricSection:first?"166(b)":feastFirst?"167(b)":
   appointment.officeClass==="I_FEAST"?"167(h)":
   appointment.officeClass==="I_SUNDAY"?"166(h)":
   appointment.officeClass==="II_FEAST"?"168(d)":
   appointment.officeClass==="III_FEAST"?"169(e)":"171(e)",
  firstVespers:Object.freeze({
   kind:first?"SUNDAY_FIRST_VESPERS":
    feastFirst?"I_FEAST_FIRST_VESPERS":"NONE",officeDate,
   independentConcurrenceReviewed:true,
   sourceId:"ao.office."+
    appointment.rubricalReason.toLowerCase()
  }),
  marianSection:appointment.marianSection,
  marianSource:Object.freeze({
   section:appointment.marianSection,
   sourceId:"Psalterium/Mariaant#"+
    appointment.marianSection,
   reviewedInOfficeOrdo:true
  }),
  source:Object.freeze({
   sourceKind:"INDEPENDENT_OFFICE_ORDO",
   rubricUrl:OFFICE_COMPLINE_ORDO_RUBRICS,
   sourceId:(appointment.date<"2026-12-06"?
    "ao.office.2026-advent-i-dated-review|":
    "ao.office.2026-advent-ii-dated-review|")+appointment.date,
   officeOrdoUrl:appointment.date<"2026-12-06"?
    OFFICE_COMPLINE_ORDO_RUBRICS:
    "https://breviariumgregorianum.com/ordo-2026.php",
   psalterLeaf:OFFICE_COMPLINE_PSALTER_SECTION,
   psalterRevision:PIN
  })
 });
}

/**
 * Bounded annual intake is explicitly a coverage ledger, not an automatic
 * Office year! Dates without independent dated evidence remain WITHHELD.
 * A source record never grants public reader eligibility.
 */
export function summarizeSourceFirstComplineCoverage({year,records=[]}={}){
 if(!Number.isInteger(year)||year<1900||year>2100||
    !Array.isArray(records)||records.length>366)
  throw Error("OFFICE_COMPLINE_ANNUAL_INTAKE_INVALID");
 const map=new Map();
 for(const record of records){
  if(!isoDate(record?.date)||!record.date.startsWith(year+"-")||
     map.has(record.date))
   throw Error("OFFICE_COMPLINE_DUPLICATE_OR_OUT_OF_YEAR_SOURCE");
  map.set(record.date,record);
 }
 const rows=[],totals={days:0,sourceReviewed:0,withheld:0,published:0};
 for(let d=new Date(Date.UTC(year,0,1,12));
     d.getUTCFullYear()===year;d.setUTCDate(d.getUTCDate()+1)){
  const date=d.toISOString().slice(0,10);
  const result=resolveSourceFirstComplineOrdo({date,record:map.get(date)});
  rows.push(Object.freeze({
   date,status:result.status,
   reason:result.reason,
   researchPsalmDay:result.appointment?.psalmDay??null,
   researchMarianSection:result.appointment?.marianSection??null,
   publicReleaseApproved:false
  }));
  totals.days++;
  if(result.status==="OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY")
   totals.sourceReviewed++;
  else totals.withheld++;
 }
 return Object.freeze({
  schema:"ao.office.source-first-annual-compline-coverage.v1",
  year,sourceFamily:"INDEPENDENT_ROMAN_BREVIARY_1960_OFFICE",
  releaseStatus:"RESEARCH_ONLY_NOT_PUBLIC_COVERAGE",
  ...totals,rows:Object.freeze(rows)
 });
}
