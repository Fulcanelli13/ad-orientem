/**
 * Read-only, metadata-only annual Office research sweep.
 *
 * No source downloads, full Office rendering, CGI, XHTML, remote requests,
 * source-text archive or automatic Mass-calendar-to-Office appointment.
 * An empty roster is honestly reported as zero Office-calendar evidence.
 */
import {buildAnnualOfficeReadiness,ANNUAL_OFFICE_HOURS,
 ANNUAL_OFFICE_LANGUAGES} from "./annual-readiness-register.js";
import {reviewOfficeOccurrence,reviewOfficeVespersConcurrence}
 from "./precedence-review.js";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {planUniversalOfficeKeysForYear} from "./universal-source-descriptors.js";
import {planTemporalOfficeYear} from "./temporal-source-leads.js";
import {createOfficePinnedFilenameLookup} from "./pinned-filename-index.js";
export const OFFICE_ANNUAL_SWEEP_SCHEMA="ao.office.annual-selection-sweep.v1";
const iso=d=>d.toISOString().slice(0,10);
const nextDay=day=>{const d=new Date(day+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+1);return iso(d)};
const safeDay=x=>typeof x==="string"&&/^\d{4}-\d\d-\d\d$/.test(x)&&
 !Number.isNaN(Date.parse(x+"T12:00:00Z"))&&
 iso(new Date(x+"T12:00:00Z"))===x;
function daysOf(year){
 const result=[];
 for(let d=new Date(Date.UTC(year,0,1));d.getUTCFullYear()===year;d.setUTCDate(d.getUTCDate()+1))
  result.push(iso(d));
 return result;
}
function rosterIndex(officeDays,year){
 if(!Array.isArray(officeDays)||officeDays.length>367)
  throw Error("OFFICE_SWEEP_ROSTER_INVALID");
 const entries=new Map();
 const finalBoundary=year+1+"-01-01";
 for(const row of officeDays){
  if(!row||!safeDay(row.date)||
     (!row.date.startsWith(year+"-")&&row.date!==finalBoundary)||
     entries.has(row.date)||
     row.officeCalendarEvidence!=="INDEPENDENT_OFFICE_CANDIDATES_RESEARCH"||
     !["UNIVERSAL_ONLY","LOCAL_RESEARCH_RECONCILED"].includes(row.localCalendarStatus)||
     !Array.isArray(row.candidates)||row.candidates.length<1)
   throw Error("OFFICE_SWEEP_ROSTER_ENTRY_INVALID");
  if(row.researchProvenance){
   const ev=row.researchProvenance;
   if(ev.sourceRevision!==DIVINUM_OFFICIUM_PIN||
      ev.pinnedOfficeResearchPR!=="https://github.com/Fulcanelli13/ad-orientem/pull/1860"||
      ev.rubricReference!=="https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html"||
      ev.corroboratingCalendarUrl!=="https://ordo.fsspx.org/day/"+row.date+"?lang=en"||
      !["ALL_HOURS_RESEARCH_ENVELOPE","VESPERS_RESEARCH_ENVELOPE_ONLY",
        "SPECIAL_OFFICE_RESEARCH_ENVELOPE"].includes(ev.observationScope)||
      !Array.isArray(ev.observedHourHeadings)||!ev.observedHourHeadings.length||
      new Set(ev.observedHourHeadings).size!==ev.observedHourHeadings.length||
      !ev.observedHourHeadings.every(hour=>ANNUAL_OFFICE_HOURS.includes(hour))||
      (ev.observationScope==="VESPERS_RESEARCH_ENVELOPE_ONLY"&&
       (ev.observedHourHeadings.length!==1||ev.observedHourHeadings[0]!=="VESPERS"))||
      ev.wholeOfficeVerified!==false||ev.translationVerified!==false||
      ev.sourceRightsApproved!==false||
      !row.candidates.every(candidate=>
        candidate.witness?.sourceId?.startsWith("PR1860:")))
     throw Error("OFFICE_SWEEP_SOURCE_WITNESS_METADATA_INVALID");
  }
  entries.set(row.date,row);
 }
 return entries;
}
const candidateOk=occ=>occ?.status==="RUBRIC_CANDIDATE"&&
 occ?.officeSelectionAuthorized===false&&
 occ?.liturgicallyCertified===false&&occ?.published===0&&
 (occ.outstanding??[]).length===0;
function count(map,key){
 map[key]=(map[key]??0)+1;
}
/**
 * The supplied records must be source-identified Office-calendar *research*
 * candidates, not Mass Calendar data. This method checks their consistency
 * through the independent precedence reviewer. Neither source texts nor
 * language completeness are inspected or implied.
 */
export function sweepAnnualOfficeResearch({year=2026,officeDays=[],filenameIndex=null,expandedTemporal=false}={}){
 if(!Number.isInteger(year)||year<1900||year>2099)
  throw Error("OFFICE_SWEEP_YEAR_INVALID");
 const roster=rosterIndex(officeDays,year),dates=daysOf(year);
 const pathPlan=planUniversalOfficeKeysForYear(year);
 const pinnedLookup=filenameIndex===null?null:createOfficePinnedFilenameLookup(filenameIndex);
 const pinnedIndex=pinnedLookup?.analyzeYear(year)??null;
 const temporalPlan=expandedTemporal===true?planTemporalOfficeYear(year):null;
 if(expandedTemporal!==true&&expandedTemporal!==false)
  throw Error("OFFICE_SWEEP_TEMPORAL_MODE_INVALID");
 let temporalListed=0,temporalNotListed=0;
 const expandedDays=temporalPlan?.dates.map(row=>{
  const leads=row.leads.map(lead=>{
   const observed=pinnedLookup?.lookup(lead.path)??null;
   if(observed){
    if(observed.filenameStatus==="PINNED_LATIN_FILENAME_LISTED")temporalListed++;
    else temporalNotListed++;
   }
   return Object.freeze({...lead,filenameStatus:observed?.filenameStatus??"NOT_CHECKED"});
  });
  return Object.freeze({date:row.date,leads:Object.freeze(leads),
   uncertainties:row.uncertainties});
 })??null;
 // Existing annual risk inventory contributes only advisory flags. It does
 // NOT supply a proper Office day or qualify a research candidate.
 const context=buildAnnualOfficeReadiness({year});
 const known=context.exceptions.knownBlockingRows.map(x=>Object.freeze({
  key:x.key,flags:Object.freeze([...x.flags]),status:"KNOWN_BLOCKER_UNREVIEWED"
 }));
 const reviewed=new Map();
 for(const [date,row] of roster)reviewed.set(date,reviewOfficeOccurrence(row));
 const reasons={},daily=[];
 let candidateHourReviews=0,withheldHourReviews=0,candidateDates=0;
 let sourceWitnessDays=0,sourceHeadingsObserved=0;
 const byHour=Object.fromEntries(ANNUAL_OFFICE_HOURS.map(hour=>[
  hour,{planned:dates.length,researchCandidates:0,withheld:0}
 ]));
 for(const date of dates){
  const occurrence=reviewed.get(date);
  const sourceWitness=roster.get(date)?.researchProvenance??null;
  if(sourceWitness){sourceWitnessDays++;sourceHeadingsObserved+=sourceWitness.observedHourHeadings.length;}
  if(candidateOk(occurrence))candidateDates++;
  const hours=[];
  for(const hour of ANNUAL_OFFICE_HOURS){
   let state="WITHHELD",reason,officeDate=null,officeKey=null,officePart=null;
   if(sourceWitness&&!sourceWitness.observedHourHeadings.includes(hour)){
    reason="PINNED_OFFICE_RESEARCH_HOUR_HEADLINE_NOT_OBSERVED";
   }else if(!occurrence){
    reason="INDEPENDENT_OFFICE_CALENDAR_DAY_NOT_SUPPLIED";
   }else if(!candidateOk(occurrence)){
    reason=occurrence.status==="RUBRIC_CANDIDATE"?
     "OCCURRENCE_IMPEDED_OFFICE_DISPOSITION_UNRESOLVED":
     "OCCURRENCE_"+occurrence.reason;
   }else if(hour==="VESPERS"){
    const following=reviewed.get(nextDay(date));
    if(!following)reason="FOLLOWING_OFFICE_CALENDAR_DAY_NOT_SUPPLIED";
    else if(!candidateOk(following))reason="FOLLOWING_OCCURRENCE_UNRESOLVED";
    else{
     const v=reviewOfficeVespersConcurrence({
      date,today:occurrence,tomorrow:following
     });
     if(v.status!=="RUBRIC_CANDIDATE")
      reason="VESPERS_"+v.reason;
     else{
      state="RESEARCH_PRECEDENCE_CANDIDATE";
      reason="RG_103_105_RESEARCH_ONLY_COMM_UNRESOLVED";
      officeDate=v.candidate.date;
      officeKey=v.candidate.principalId;
      officePart=v.candidate.part;
     }
    }
   }else{
    state="RESEARCH_PRECEDENCE_CANDIDATE";
    reason="OCCURRENCE_RESEARCH_ONLY_SECTIONS_NOT_APPOINTED";
    officeDate=occurrence.candidate.date;
    officeKey=occurrence.candidate.principalId;
   }
   count(reasons,reason);
   if(state==="RESEARCH_PRECEDENCE_CANDIDATE"){
    candidateHourReviews++;byHour[hour].researchCandidates++;
   }else{
    withheldHourReviews++;byHour[hour].withheld++;
   }
   hours.push(Object.freeze({
    hour,state,reason,officeDate,officeKey,officePart,
    requiredLanguages:ANNUAL_OFFICE_LANGUAGES,
    sourceSectionsParsed:0,trilingualTextVerified:false,
    officeCompletenessVerified:false,publishable:false
   }));
  }
  daily.push(Object.freeze({
   date,officeCalendarResearchCandidate:candidateOk(occurrence),
   occurrenceStatus:occurrence?.status??"NOT_SUPPLIED",
   proposedUniversalSourceKeys:pinnedIndex?
    pinnedIndex.dates[daily.length].keys:pathPlan.days[daily.length].keys,
   expandedTemporalLeads:expandedDays?.[daily.length]?.leads??null,
   expandedTemporalUncertainties:expandedDays?.[daily.length]?.uncertainties??null,
   hours:Object.freeze(hours)
  }));
 }
 const plannedHours=dates.length*ANNUAL_OFFICE_HOURS.length;
 const plannedLocaleSlots=plannedHours*ANNUAL_OFFICE_LANGUAGES.length;
 if(daily.length!==dates.length||candidateHourReviews+withheldHourReviews!==plannedHours||
    plannedLocaleSlots!==context.summary.planned)
  throw Error("OFFICE_SWEEP_ANNUAL_COUNT_MISMATCH");
 return Object.freeze({
  schema:OFFICE_ANNUAL_SWEEP_SCHEMA,year,
  scope:"READ_ONLY_PRECEDENCE_RESEARCH_NO_SOURCE_TEXT",
  calendarSource:"EXPLICIT_OFFICE_RESEARCH_ROSTER_ONLY",
  // A synthetic or self-declared witness is not independent text collation.
  researchOnly:true,releaseAuthorized:false,published:0,
  summary:Object.freeze({
   days:dates.length,plannedHours,plannedLocaleSlots,
   proposedFixedSanctoralPaths:pathPlan.fixedSanctoralPathLeads,
   proposedAdventTemporalPaths:pathPlan.adventTemporalPathLeads,
   totalUnverifiedSourcePathLeads:pathPlan.totalProposedSourcePaths,
   sourceFilesVerifiedByThisSweep:0,
   expandedTemporalProposedPaths:temporalPlan?.totalCandidateKeys??0,
   expandedTemporalListedFilenames:temporalListed,
   expandedTemporalNotListedFilenames:temporalNotListed,
   expandedTemporalExceptionalDates:expandedDays?
    expandedDays.filter(row=>row.uncertainties.length>0).length:0,
   expandedTemporalSourceDocumentsRead:0,
   pinnedDirectoryFilenamesIndexed:pinnedIndex?.totalDirectoryFilenames??0,
   proposedPathsWithExactPinnedLatinFilename:pinnedIndex?.exactFilenamesListed??0,
   proposedPathsWithoutExactPinnedLatinFilename:pinnedIndex?.exactFilenamesNotListed??0,
   submittedOfficeResearchDays:roster.size,
   researchCandidateDates:candidateDates,
   sourceWitnessDays,sourceHeadingsObserved,
   researchCandidateHours:candidateHourReviews,
   withheldHours:withheldHourReviews,
   parsedSourceSections:0,completeTrilingualHours:0,
   independentlyCertifiedHours:0,publishedHours:0,
   historicalRawCaptureDoesNotCount:true
  }),
  byHour:Object.freeze(byHour),
  reasons:Object.freeze(reasons),
  knownSourceBlockers:Object.freeze(known),
  // A year-wide date and rule sweep does not mean every liturgical
  // discrepancy has actually been investigated.
  allYearLiturgicalDiscrepanciesActuallyChecked:false,
  dates:Object.freeze(daily)
 });
}
