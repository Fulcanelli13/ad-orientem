/**
 * Research-only 1960 Roman Office concurrence evidence gate.
 *
 * General Rubrics 103–105: compare today's II Vespers with tomorrow's
 * eligible I Vespers. Equal classes retain today's II Vespers.
 * General Rubrics 106–114 and Breviary Rubrics 250–259: independently
 * adjudicate commemorations. Breviary Rubrics 173: the Office of the dead
 * has special rubrics; do not apply the ordinary festive model to it.
 *
 * This never selects, publishes, or imports Office text. The Mass Calendar
 * owns observed day facts but does not supply an Office precedence verdict.
 */
import {addDaysIso,buildLiturgicalYear,buildMajorCelebrations,allSoulsObservanceDate} from "../calendar/liturgical-year.js";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

export const OFFICE_VESPERS_CONCURRENCE_VERSION="ao.office.vespers-concurrence.v1";
export const OFFICE_VESPERS_RUBRICS=Object.freeze({
  general:"https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html",
  breviary:"https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien",
  concurrence:"RG_103_105",commemorations:"RG_106_114_BR_250_259",dead:"BR_173"
});
const withhold=(reason,extra={})=>Object.freeze({
  version:OFFICE_VESPERS_CONCURRENCE_VERSION,status:"WITHHELD",reason,
  candidate:null,officeSelectionAuthorized:false,commemorationsApproved:false,
  published:0,...extra
});
const rank=value=>{
  if(Number.isInteger(value)&&value>=1&&value<=4)return value;
  const s=String(value??"").trim().toUpperCase();
  const direct=/^(?:CLASS(?:IS)?\s*)?(I|II|III|IV)(?:\s*\.?\s*CLASS(?:IS)?)?\.?$/u.exec(s);
  const reverse=/^(I|II|III|IV)\.?\s*CLASS(?:IS)?\.?$/u.exec(s);
  const roman=(direct??reverse)?.[1];
  return roman?({I:1,II:2,III:3,IV:4})[roman]:null;
};
const validDate=s=>typeof s==="string"&&/^[12]\d{3}-\d\d-\d\d$/.test(s)&&
  !Number.isNaN(Date.parse(s+"T12:00:00Z"))&&
  new Date(s+"T12:00:00Z").toISOString().slice(0,10)===s;
const calendarOK=(calendar,date,id)=>
  calendar?.status==="ready"&&calendar.date===date&&
  typeof calendar.day?.main?.id==="string"&&calendar.day.main.id===id;

/**
 * Input offices are *candidate IDs and explicitly sourced attributes*.
 * No title, fixed civil-date rule or Mass rank can imply I Vespers exists.
 * A result is rule-supported only, never an authorization to use a text.
 */
export function reviewOfficeVespersConcurrence({date,followingDate,
  todayCalendar,followingCalendar,current,following}={}){
  if(!validDate(date)||!validDate(followingDate)||
    addDaysIso(date,1)!==followingDate)
    return withhold("NON_ADJACENT_OR_INVALID_DATES");
  if(!current?.id||!following?.id||
    !calendarOK(todayCalendar,date,current.id)||
    !calendarOK(followingCalendar,followingDate,following.id))
    return withhold("BOTH_CANONICAL_CALENDAR_DAYS_REQUIRED");
  const a=rank(current.class),b=rank(following.class);
  const ca=rank(todayCalendar.day.main.rank),cb=rank(followingCalendar.day.main.rank);
  if(!a||!b||!ca||!cb||ca!==a||cb!==b)
    return withhold("INDEPENDENT_OFFICE_CLASS_AND_CALENDAR_RANK_REQUIRED");
  if(current.officeKind==="OFFICE_OF_DEAD"||
     following.officeKind==="OFFICE_OF_DEAD")
    return withhold("BR_173_SPECIAL_OFFICE_OF_DEAD_REQUIRES_OWN_PROPER");
  // Missing Office classification is not evidence that the ordinary
  // concurrence rubric applies. Do not infer type from Mass rank alone.
  const ordinaryKinds=new Set(["SUNDAY","FESTIVE","SEMIFESTIVE","ORDINARY","FERIAL"]);
  if(!ordinaryKinds.has(current.officeKind)||!ordinaryKinds.has(following.officeKind))
    return withhold("OFFICE_TYPE_NOT_INDEPENDENTLY_CLASSIFIED");
  if(current.hasSecondVespers!==true||
    typeof following.hasFirstVespers!=="boolean")
    return withhold("SECOND_AND_FIRST_VESPERS_ELIGIBILITY_UNPROVEN");
  if(following.hasFirstVespers===false)
    return Object.freeze({...withhold("NO_FOLLOWING_FIRST_VESPERS"),
      candidate:Object.freeze({date,part:"SECOND",principalId:current.id}),
      sourceEligibilityOnly:true});
  const winner=a<=b?current:following;
  const part=a<=b?"SECOND":"FIRST";
  const winningDate=a<=b?date:followingDate;
  return Object.freeze({
    version:OFFICE_VESPERS_CONCURRENCE_VERSION,status:"RUBRIC_CANDIDATE",
    reason:a===b?"RG_105_EQUAL_CLASS_CURRENT_SECOND":"RG_104_HIGHER_CLASS",
    candidate:Object.freeze({date:winningDate,part,principalId:winner.id}),
    comparison:Object.freeze({currentClass:a,followingClass:b,
      tomorrowFirstVespersExplicit:true}),
    // A Mass Calendar commemoration array is NOT Vespers concurrence proof.
    commemorationReview:"RG_106_114_BR_250_259_REQUIRED",
    officeSelectionAuthorized:false,commemorationsApproved:false,
    printedTextVerified:false,localCalendarReconciled:false,published:0
  });
}
const fixed=Object.freeze({
  ALL_SAINTS:Object.freeze({eve:"2026-10-31",day:"2026-11-01",title:/omnium sanctorum/u}),
  ADVENT_I:Object.freeze({eve:"2026-11-28",day:"2026-11-29",title:/dominica i adventus/u}),
});
const fold=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replaceAll("æ","ae");
const checkSource=(document,date)=>{
  if(document?.schema!=="ao.office.source-cells.v1"||document.date!==date||
    document.hour!=="VESPERS"||document.language!=="la"||
    document.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    document.status!=="STRUCTURED_UNVERIFIED"||
    document.publishable!==false||
    !Array.isArray(document.sections)||document.sections.length<1)
    throw Error("OFFICE_VESPERS_WITNESS_INVALID:"+date);
};
/**
 * Checks only the source composer’s explicit 'de sequenti' and feast title
 * on two already generated dates. This is NOT independent printed collation.
 */
export function inspectOfficeVespersPair({id,eve,day}={}){
  const expected=fixed[id];
  if(!expected)throw Error("OFFICE_VESPERS_PILOT_UNRECOGNIZED");
  checkSource(eve,expected.eve);
  checkSource(day,expected.day);
  const eveHeading=fold(eve.headline),dayHeading=fold(day.headline);
  const match=expected.title.test(eveHeading)&&expected.title.test(dayHeading);
  const first=/\bvespera de sequenti\b/u.test(eveHeading);
  const second=!/\bvespera de sequenti\b/u.test(dayHeading);
  // Shared Calendar major-celebration listing is a date witness only,
  // not the Office's independently adjudicated rank or local precedence.
  const sharedCalendarAnchor=id==="ADVENT_I"?
    buildLiturgicalYear(expected.day).start===expected.day:
    buildMajorCelebrations(expected.day).some(c=>
      c.date===expected.day&&c.en==="All Saints");
  return Object.freeze({
    id,firstDate:expected.eve,secondDate:expected.day,
    sourceTitleMatch:match,explicitFirstVespersMarker:first,
    noFollowingMarkerOnSecond:second,sharedCalendarAnchor,
    sourceStructureConsistent:match&&first&&second&&sharedCalendarAnchor,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    localOfficePrecedenceVerified:false,commemorationsVerified:false,
    printedOfficeTextVerified:false,published:0
  });
}
export function inspectAllSaintsToAllSouls({saints,souls}={}){
  checkSource(saints,"2026-11-01");
  checkSource(souls,"2026-11-02");
  const sourceHeadlinesConsistent=/omnium sanctorum/u.test(fold(saints.headline))&&
    /fidelium defunctorum/u.test(fold(souls.headline));
  return Object.freeze({
    id:"ALL_SAINTS_TO_ALL_SOULS",date:"2026-11-01",
    followingDate:"2026-11-02",sourceHeadlinesConsistent,
    calendarAllSoulsDateMatches:allSoulsObservanceDate(2026)==="2026-11-02",
    status:"BR_173_SPECIAL_OFFICE_REVIEW_REQUIRED",
    // Two generated *different days* do not by themselves resolve evening
    // concurrence or any commemoration on November 1.
    vesperalOfficeOnNovember1NotIndependentlyAdjudicated:true,
    commemorationsVerified:false,printedOfficeTextVerified:false,
    officeSelectionAuthorized:false,published:0
  });
}
