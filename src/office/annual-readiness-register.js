/**
 * Annual Roman 1960 Divine Office readiness inventory.
 *
 * READINESS IS NOT LITURGICAL APPROVAL. Calendar season/major-date data
 * are context only. The Mass Calendar never selects the Roman Office.
 * An XHTML generator envelope is merely RAW_CAPTURED_UNVERIFIED.
 * This code cannot issue CERTIFIED, APPROVED, PUBLISHED or READY.
 */
import {buildLiturgicalYear,buildMajorCelebrations,addDaysIso,
  allSoulsObservanceDate} from "../calendar/liturgical-year.js";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

export const ANNUAL_OFFICE_REGISTER_SCHEMA="ao.office.annual-readiness.v1";
export const ANNUAL_OFFICE_HOURS=Object.freeze([
  "MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"
]);
export const ANNUAL_OFFICE_LANGUAGES=Object.freeze(["la","en","fr"]);
const RAW="RAW_CAPTURED_UNVERIFIED",EMPTY="NOT_GENERATED";
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const ROW_LIMIT=366*ANNUAL_OFFICE_HOURS.length*ANNUAL_OFFICE_LANGUAGES.length;
const isoFromUtc=d=>d.toISOString().slice(0,10);
const dateSequence=year=>{
  const days=[];
  for(let d=new Date(Date.UTC(year,0,1));d.getUTCFullYear()===year;
    d.setUTCDate(d.getUTCDate()+1))days.push(isoFromUtc(d));
  return days;
};
const proofKey=(date,hour,language)=>date+"|"+hour+"|"+language;
function evidenceIndex(year,probeManifests){
  if(!Array.isArray(probeManifests))throw Error("OFFICE_REGISTER_PROBE_MANIFESTS_INVALID");
  const found=new Map(),external=[];
  for(const manifest of probeManifests){
    if(manifest?.schema!=="ao.office.engine-probe-manifest.v1"||
       manifest?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
       manifest.researchOnly!==true||manifest.publicReaderEnabled!==false||
       !Array.isArray(manifest.records)||manifest.counts?.published!==0)
      throw Error("OFFICE_REGISTER_PROBE_UNTRUSTED");
    for(const record of manifest.records){
      if(!DATE_RE.test(record?.date??"")||
         !ANNUAL_OFFICE_HOURS.includes(record.hour)||
         !ANNUAL_OFFICE_LANGUAGES.includes(record.language)||
         record.publishable!==false||record.compositionVerified!==false||
         record.printedBreviaryCertified!==false||
         record.languageCompletenessVerified!==false||
         typeof record.sha256!=="string"||!/^[0-9a-f]{64}$/.test(record.sha256))
        throw Error("OFFICE_REGISTER_EVIDENCE_RECORD_INVALID");
      if(!record.date.startsWith(year+"-")){
        external.push(proofKey(record.date,record.hour,record.language));
        continue;
      }
      const key=proofKey(record.date,record.hour,record.language);
      if(found.has(key))throw Error("OFFICE_REGISTER_DUPLICATE_SOURCE_EVIDENCE:"+key);
      found.set(key,record);
    }
  }
  return {found,external};
}
function exceptionalDates(year){
  const jan=buildLiturgicalYear(year+"-01-01");
  const dec=buildLiturgicalYear(year+"-12-31");
  const major=new Map();
  for(const item of [...buildMajorCelebrations(year+"-01-01"),
    ...buildMajorCelebrations(year+"-12-31")]){
    if(!item.date?.startsWith(year+"-"))continue;
    if(!major.has(item.date))major.set(item.date,[]);
    if(!major.get(item.date).some(x=>x===item.en))major.get(item.date).push(item.en);
  }
  const easter=buildLiturgicalYear(year+"-04-01").easter;
  const holyWeek=new Set([-3,-2,-1].map(n=>addDaysIso(easter,n)));
  return {major,holyWeek,allSouls:allSoulsObservanceDate(year),
    liturgicalYearRefs:[jan.label,dec.label]};
}
/** This produces a finite PRIORITY QUEUE, not a verdict that an Office is wrong. */
function riskFlags({date,hour,language,dayOfWeek,exceptions,year}){
  const risk=[];
  if(hour==="VESPERS"&&dayOfWeek===6)
    risk.push("FIRST_VESPERS_CONCURRENCE_REQUIRES_OFFICE_ORDO");
  if(hour==="VESPERS"&&dayOfWeek===0)
    risk.push("SECOND_VESPERS_COMMEMORATIONS_REQUIRE_OFFICE_ORDO");
  if(hour==="PRIME")risk.push("ANTICIPATED_MARTYROLOGY_TEXT_NOT_YEAR_VERIFIED");
  if(exceptions.major.has(date))
    risk.push("MAJOR_CALENDAR_DATE_OFFICE_PRECEDENCE_NOT_INFERRED");
  if(exceptions.holyWeek.has(date))
    risk.push("HOLY_WEEK_TENEBRAE_OR_SPECIAL_RUBRICS_REQUIRE_INDEPENDENT_CHECK");
  if(date===exceptions.allSouls)
    risk.push("ALL_SOULS_OFFICE_OF_DEAD_SPECIAL_RUBRICS");
  if(year===2026&&date==="2026-11-02"&&hour==="PRIME"&&language==="en")
    risk.push("KNOWN_ALL_SOULS_PRIME_EN_RECIPIENT_SCOPE_MISMATCH");
  if(year===2026&&date==="2026-11-02"&&hour==="PRIME")
    risk.push("KNOWN_2026_11_03_MARTYROLOGY_WITNESS_AND_LUNA_UNVERIFIED");
  if(year===2026&&date==="2026-11-01"&&hour==="VESPERS"&&language==="fr")
    risk.push("KNOWN_PINNED_FR_VESPERS_SUNDAY_COMM_MISSING_CANDIDATE_UNPUBLISHED");
  return risk;
}
export function buildAnnualOfficeReadiness({year=2026,probeManifests=[]}={}){
  if(!Number.isInteger(year)||year<1900||year>2100)
    throw Error("OFFICE_REGISTER_YEAR_INVALID");
  const days=dateSequence(year),ex=exceptionalDates(year);
  const {found,external}=evidenceIndex(year,probeManifests);
  const rows=[],riskQueue=[];
  const byState={[EMPTY]:0,[RAW]:0};
  const byHour=Object.fromEntries(ANNUAL_OFFICE_HOURS.map(h=>[h,{planned:0,rawCaptured:0}]));
  const byLanguage=Object.fromEntries(ANNUAL_OFFICE_LANGUAGES.map(l=>[l,{planned:0,rawCaptured:0}]));
  for(const date of days){
    const weekday=new Date(date+"T12:00:00Z").getUTCDay();
    const season=buildLiturgicalYear(date).currentPeriod.id;
    for(const hour of ANNUAL_OFFICE_HOURS)for(const language of ANNUAL_OFFICE_LANGUAGES){
      const source=found.get(proofKey(date,hour,language));
      const captured=!!source?.envelopePass&&source.status==="CAPTURED_UNVERIFIED";
      const state=captured?RAW:EMPTY;
      const issues=riskFlags({date,hour,language,dayOfWeek:weekday,exceptions:ex,year});
      const row={
        key:proofKey(date,hour,language),date,hour,language,season,
        state,rawCaptureSha256:captured?source.sha256:null,
        calendarMajorDayCandidates:exceptions.major.get(date)??[],
        officePrecedenceVerified:false,structureVerified:false,
        independentPrintedTextVerified:false,translationVerified:false,
        rightsReviewed:false,approved:false,published:false,
        reviewFlags:issues
      };
      if(issues.some(x=>x.startsWith("KNOWN_")))
        riskQueue.push({key:row.key,flags:issues.filter(x=>x.startsWith("KNOWN_")),
          source:"office research PR #1860",status:"BLOCKED_UNREVIEWED"});
      rows.push(row);
      byState[state]++;
      byHour[hour].planned++;byLanguage[language].planned++;
      if(captured){byHour[hour].rawCaptured++;byLanguage[language].rawCaptured++}
    }
  }
  const total=days.length*8*3;
  if(rows.length!==total||total>ROW_LIMIT||byState[EMPTY]+byState[RAW]!==total)
    throw Error("OFFICE_REGISTER_COUNT_INVARIANT");
  const distinctRawDays=new Set(rows.filter(x=>x.state===RAW).map(x=>x.date)).size;
  return {
    schema:ANNUAL_OFFICE_REGISTER_SCHEMA,year,
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    evidenceScope:"GENERATED_XHTML_ENVELOPES_ONLY",
    calendarRole:"SEASON_AND_MAJOR_DAY_CANDIDATES_NOT_OFFICE_ORDO",
    summary:{civilDays:days.length,canonicalHours:8,languages:3,
      planned:total,rawCaptured:byState[RAW],notGenerated:byState[EMPTY],
      datesWithAnyRawEvidence:distinctRawDays,
      structurallyVerified:0,liturgicallyCertified:0,translatedVerified:0,
      rightsApproved:0,approved:0,published:0,
      byHour,byLanguage,knownBlockerRowCount:riskQueue.length,
      externalYearEvidenceExcluded:external.length},
    exceptions:{knownBlockingRows:riskQueue,
      classification:"PRIORITY_REVIEW_ONLY_NO_ASSERTION_OF_ACTUAL_ORDO_CONFLICT",
      sundayVespersNeedsIndependentReview:true,
      sourceProperContentCompared:false,allYearDiscrepanciesActuallyChecked:false},
    release:{approved:false,publicRouteEnabled:false,
      completeCorpusVerified:false,canPublish:false},
    rows
  };
}
