/**
 * The UNIVERSAL calendar only: finite Advent I 2026 First Vespers decision.
 * RG13, RG11(a), RG108-111: a Sunday of Advent (Class I) admits only
 * privileged commemorations. The preceding Saturday's BVM Office (IV)
 * ceases before Sunday I Vespers; St Saturninus (IV) does not qualify.
 *
 * THIS DOES NOT CREATE A GENERAL 1960 OFFICE ORDO OR VALIDATE LOCAL CALENDARS.
 */
export const OFFICE_ADVENT_COMM_REVIEW_SCHEMA="ao.office.advent-i-2026-universal-commemoration-review.v1";
export const OFFICE_ADVENT_COMM_EVIDENCE_SCHEMA="ao.office.advent-i-2026-universal-commemoration-evidence.v1";
const SOURCE="https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html";
const FSSPX="https://ordo.fsspx.org/day/2026-11-28?lang=en";
const LAUDEMUS="https://laudemus.org/?breviary_calendar=roman&breviary_rubrics=1960&date=2026-11-29&office=prima&place_id=4";
const deny=reason=>Object.freeze({
 schema:OFFICE_ADVENT_COMM_REVIEW_SCHEMA,status:"WITHHELD",
 reason,universalCommemorationsAuthorized:false,
 localCalendarReviewed:false,completeHourCertified:false,
 publishable:false,published:false
});
function strictEvidence(m){
 if(m?.schema!==OFFICE_ADVENT_COMM_EVIDENCE_SCHEMA||
 m.ruleset!=="ROMAN_GENERAL_RUBRICS_1960"||
 m.civilDate!=="2026-11-28"||m.officeDate!=="2026-11-29"||
 m.officePart!=="FIRST"||m.calendarScope!=="UNIVERSAL_ONLY"||
 m.localCalendar!=="UNREVIEWED"||
 m.principal?.id!=="advent-i-2026-11-29"||
 m.principal.kind!=="SUNDAY"||m.principal.class!==1||
 m.decision!=="NO_UNIVERSAL_COMMEMORATION_FOR_ADVENT_I_FIRST_VESPERS"||
 m.localExceptionsResolved!==false||m.completeHourCertified!==false||
 m.liturgicalTextPublished!==false||!Array.isArray(m.encountered)||
 m.encountered.length!==2)return false;
 const [sat,saint]=m.encountered;
 if(sat.id!=="bvm-on-saturday-2026-11-28"||
 sat.kind!=="SATURDAY_BVM"||sat.class!==4||
 sat.position!=="PRECEDING_SATURDAY"||
 sat.privileged!==false||sat.commemorationPermitted!==false||
 saint.id!=="st-saturninus-2026-11-29"||
 saint.kind!=="SAINT"||saint.class!==4||
 saint.position!=="OCCURS_ON_SUNDAY"||
 saint.privileged!==false||saint.commemorationPermitted!==false)return false;
 const refs=[
 ["RG13",SOURCE],["RG11a",SOURCE],["RG108-111",SOURCE],
 ["2026-11-28-ordo",FSSPX],["2026-11-29-ordo",LAUDEMUS]
 ];
 return Array.isArray(m.evidence)&&m.evidence.length===refs.length&&
 m.evidence.every((w,i)=>w?.rule===refs[i][0]&&w.url===refs[i][1]);
}
/**
 * The result asserts absence of eligible UNIVERSAL commemorations, not
 * absence of local, proper, titular or patronal obligations. No invented
 * empty prayer text and no latent publication permission.
 */
export function reviewAdventI2026UniversalCommemoration({witness}={}){
 if(!strictEvidence(witness))return deny("ADVENT_I_UNIVERSAL_CALENDAR_EVIDENCE_NOT_ACCEPTED");
 return Object.freeze({
  schema:OFFICE_ADVENT_COMM_REVIEW_SCHEMA,
  status:"UNIVERSAL_NO_COMMEMORATION_RESEARCH_REVIEWED",
  civilDate:"2026-11-28",officeDate:"2026-11-29",officePart:"FIRST",
  principalId:"advent-i-2026-11-29",calendarScope:"UNIVERSAL_ONLY",
  universalCommemorationCount:0,universalCommemorationsAuthorized:true,
  evidenceRefs:Object.freeze(witness.evidence.map(x=>x.rule)),
  localCalendarReviewed:false,localCalendarDecision:"REQUIRES_SEPARATE_AUTHORITY",
  completeHourCertified:false,sourceTextCertified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
