/**
 * Research-only Roman 1960 Office occurrence / Vespers-concurrence review.
 *
 * General Rubrics §§ 5, 7, 11-17, 23-37, 91-114.
 * Witness: https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html
 *
 * This is a bounded decision gate over independently supplied Office-calendar
 * candidates, NOT a creator of candidates, not the Mass calendar, and NOT a
 * complete 1960 Office ordo. All answers are explicitly nonpublishable.
 */
export const OFFICE_PRECEDENCE_REVIEW_SCHEMA="ao.office.precedence-review.v1";
export const OFFICE_PRECEDENCE_RULESET="ROMAN_GENERAL_RUBRICS_1960";
export const OFFICE_PRECEDENCE_SOURCE=
 "https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html";
const TYPES=new Set([
  "SUNDAY","FEAST","FERIA","VIGIL","OCTAVE","TRIDUUM",
  "OFFICE_OF_DEAD","SATURDAY_BVM"
]);
const SPECIAL=new Set([
  "OFFICE_OF_DEAD","TRIDUUM"
]);
const exactDay=date=>typeof date==="string"&&/^\d{4}-\d\d-\d\d$/.test(date)&&
 !Number.isNaN(Date.parse(date+"T12:00:00Z"))&&
 new Date(date+"T12:00:00Z").toISOString().slice(0,10)===date;
function nextDay(date){
 const d=new Date(date+"T12:00:00Z");
 d.setUTCDate(d.getUTCDate()+1);
 return d.toISOString().slice(0,10);
}
function classFromPosition(n){
 if(!Number.isInteger(n)||n<1||n>28)return null;
 return n<=13?1:n<=21?2:n<=27?3:4;
}
function candidateValid(c,date){
 if(!c||typeof c.id!=="string"||!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{1,100}$/.test(c.id)||
    c.date!==date||c.ruleset!==OFFICE_PRECEDENCE_RULESET||
    !TYPES.has(c.kind)||classFromPosition(c.tablePosition)!==c.class||
    !["UNIVERSAL","LOCAL"].includes(c.calendarScope)||
    c.witness?.rubricSource!==OFFICE_PRECEDENCE_SOURCE||
    typeof c.witness?.sourceId!=="string"||c.witness.sourceId.length<3||
    c.printedOfficeCertified!==false||
    typeof c.hasFirstVespers!=="boolean"||
    typeof c.hasSecondVespers!=="boolean"||
    c.sourceTextApproved!==false)return false;
 // A witness assertion must not be confused with provenance for real text.
 if(c.kind==="SUNDAY"&&c.class>2)return false;
 if(c.kind==="SATURDAY_BVM"&&c.tablePosition!==27)return false;
 if(c.kind==="FERIA"&&![7,18,22,25,28].includes(c.tablePosition))return false;
 if(c.kind==="SUNDAY"&&![1,6,15].includes(c.tablePosition))return false;
 if(c.kind==="OFFICE_OF_DEAD"&&c.tablePosition!==8)return false;
 return true;
}
function withheld(stage,reason,extra={}){
 return Object.freeze({
  schema:OFFICE_PRECEDENCE_REVIEW_SCHEMA,
  stage,status:"WITHHELD",reason,
  candidate:null,officeSelectionAuthorized:false,
  commemorationsApproved:false,liturgicallyCertified:false,published:0,
  ...extra
 });
}
/**
 * Candidates must come from an independently assembled Office-specific
 * calendar inventory; the Mass calendar can never supply these rank IDs.
 * The smallest numeric RG91 table position has priority. Ties, source
 * ambiguities, transfers, local overlays, and Office of the Dead stay held.
 */
export function reviewOfficeOccurrence({
 date,candidates,officeCalendarEvidence="UNVERIFIED",
 localCalendarStatus="UNKNOWN"
}={}){
 if(!exactDay(date)||!Array.isArray(candidates)||
    candidates.length<1||candidates.length>20)
  return withheld("OCCURRENCE","DATE_OR_CANDIDATES_INVALID");
 if(officeCalendarEvidence!=="INDEPENDENT_OFFICE_CANDIDATES_RESEARCH"||
    !["UNIVERSAL_ONLY","LOCAL_RESEARCH_RECONCILED"].includes(localCalendarStatus))
  return withheld("OCCURRENCE","INDEPENDENT_OFFICE_CALENDAR_REQUIRED");
 if(candidates.some(c=>!candidateValid(c,date))||
    new Set(candidates.map(c=>c.id)).size!==candidates.length)
  return withheld("OCCURRENCE","OFFICE_SOURCE_CANDIDATE_INVALID");
 if(candidates.some(c=>c.calendarScope==="LOCAL")&&
    localCalendarStatus!=="LOCAL_RESEARCH_RECONCILED")
  return withheld("OCCURRENCE","LOCAL_CALENDAR_UNRESOLVED");
 if(candidates.some(c=>SPECIAL.has(c.kind)))
  return withheld("OCCURRENCE","SPECIAL_OFFICE_REQUIRES_OWN_RUBRICS");
 // RG91 is an ordered table, but where its categories are equal, the
 // secondary movable/fixed, locality and special rules need separate proof.
 const ranked=[...candidates].sort((a,b)=>a.tablePosition-b.tablePosition);
 if(ranked.length>1&&ranked[0].tablePosition===ranked[1].tablePosition)
  return withheld("OCCURRENCE","RG_91_POSITION_TIE_REQUIRES_ORDO");
 const winner=ranked[0],losers=ranked.slice(1);
 if(losers.some(c=>c.class===1))
  return withheld("OCCURRENCE","RG_95_99_FIRST_CLASS_TRANSFER_REVIEW_REQUIRED");
 // RG 92-102: the principal title comparison does NOT determine whether
 // an impeded feast must be omitted, commemorated or reassigned.
 const outstanding=losers.length?["RG_93_102_IMPEDED_OFFICE_DISPOSITION"]:[];
 const selection=Object.freeze({
  date,principalId:winner.id,officeKind:winner.kind,
  class:winner.class,tablePosition:winner.tablePosition,
  hasFirstVespers:winner.hasFirstVespers,
  hasSecondVespers:winner.hasSecondVespers,
  localCalendarStatus,source:winner.witness.sourceId
 });
 return Object.freeze({
  schema:OFFICE_PRECEDENCE_REVIEW_SCHEMA,stage:"OCCURRENCE",
  status:"RUBRIC_CANDIDATE",reason:"RG_91_TABLE_POSITION",
  candidate:selection,competingIds:Object.freeze(losers.map(c=>c.id)),
  outstanding:Object.freeze(outstanding),
  officeCalendarEvidence,source:OFFICE_PRECEDENCE_SOURCE,
  officeSelectionAuthorized:false,commemorationsApproved:false,
  liturgicallyCertified:false,published:0
 });
}
/**
 * RG 103-105 compare II Vespers today to I Vespers tomorrow.
 * No automatic commemorations: RG106-114, BR250-259 and local practice
 * must independently adjudicate their identity, presence and order.
 */
export function reviewOfficeVespersConcurrence({date,today,tomorrow}={}){
 if(!exactDay(date)||today?.schema!==OFFICE_PRECEDENCE_REVIEW_SCHEMA||
    tomorrow?.schema!==OFFICE_PRECEDENCE_REVIEW_SCHEMA||
    today.stage!=="OCCURRENCE"||tomorrow.stage!=="OCCURRENCE"||
    today.status!=="RUBRIC_CANDIDATE"||tomorrow.status!=="RUBRIC_CANDIDATE"||
    today.candidate?.date!==date||
    tomorrow.candidate?.date!==nextDay(date))
  return withheld("VESPERS","ADJACENT_OFFICE_OCCURRENCES_REQUIRED");
 const a=today.candidate,b=tomorrow.candidate;
 if(a.localCalendarStatus!==b.localCalendarStatus)
  return withheld("VESPERS","LOCAL_CALENDAR_SCOPE_CHANGED");
 if(SPECIAL.has(a.officeKind)||SPECIAL.has(b.officeKind)||
    a.officeKind==="TRIDUUM"||b.officeKind==="TRIDUUM")
  return withheld("VESPERS","SPECIAL_OFFICE_CONCURRENCE_REVIEW_REQUIRED");
 // Explicit eligibility is supplied by the Office source inventory; never
 // infer I Vespers from an evening or the Mass's rank.
 if(!a.hasSecondVespers&&!b.hasFirstVespers)
  return withheld("VESPERS","NEITHER_VESPERS_FORM_ESTABLISHED");
 if(!a.hasSecondVespers&&b.hasFirstVespers)
  return withheld("VESPERS","CURRENT_OFFICE_WITHOUT_SECOND_VESPERS_REQUIRES_REVIEW",{
   possibleFollowingFirstVespersId:b.principalId
  });
 const winner=!b.hasFirstVespers?"SECOND":
   (a.class<=b.class?"SECOND":"FIRST");
 const chosen=winner==="SECOND"?a:b;
 const reason=!b.hasFirstVespers?"NO_FOLLOWING_FIRST_VESPERS":
   a.class===b.class?"RG_105_EQUAL_CLASS_CURRENT_SECOND":
   "RG_104_HIGHER_CLASS";
 return Object.freeze({
  schema:OFFICE_PRECEDENCE_REVIEW_SCHEMA,stage:"VESPERS",
  status:"RUBRIC_CANDIDATE",reason,
  candidate:Object.freeze({
   date:chosen.date,principalId:chosen.principalId,
   part:winner,officeKind:chosen.officeKind,
   class:chosen.class
  }),
  concurrence:!!b.hasFirstVespers,source:OFFICE_PRECEDENCE_SOURCE,
  // A probable winner is not a decision about the rival Office's commemoration.
  commemorationReview:"RG_106_114_BR_250_259_REQUIRED",
  officeSelectionAuthorized:false,commemorationsApproved:false,
  liturgicallyCertified:false,published:0
 });
}
