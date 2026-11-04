// Reconcile ALREADY GENERATED 2026 Schola source evidence. No source fetch,
// lyric/score edits, musical approval, or application runtime dependencies.
// Distinguish full-Mass reader/oration holds from genuine chant-source holds.
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

export const SCHOLA_2026_CLOSEOUT_SCHEMA="ao-schola-2026-source-exceptions-closeout-v1";
const fail=code=>{throw Error("SCHOLA_CLOSEOUT_"+code)};
const fullYear=Array.from({length:365},(_,i)=>
 new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));
const specialRites=new Map([
 ["2026-04-03","Tempora/Quad6-5r"],
 ["2026-04-04","Tempora/Quad6-6r"]
]);
const exactPath=/^(?:Sancti|Tempora|Commune)\/[A-Za-z0-9_-]+$/;
const uniq=items=>[...new Set(items)];
function validate({annual,full,pre,work,first60}){
 if(annual?.schema!=="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1"||
  annual.year!==2026||annual.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
  annual.counters?.civilDays!==365||!Array.isArray(annual.rows)||
  annual.rows.length!==365||
  full?.schema!=="ao-schola-2026-selected-full-1049-source-gabc-review-v1"||
  full.counters?.calendarDays!==365||full.counters?.approvedPublicScores!==0||
  !Array.isArray(full.absentFromPinnedLatinTree)||
  pre?.schema!=="ao-schola-2026-pregospel-selected-pinned-latin-editorial-queue-v1"||
  pre.counters?.daysChecked!==365||pre.counters?.publicScores!==0||
  !Array.isArray(pre.records)||pre.records.length!==365||
  work?.schema!=="ao-schola-2026-consolidated-musical-verification-v1"||
  work.counters?.newPublicScores!==0||work.publication?.digitalScorePublished!==0||
  first60?.schema!=="ao-1962-gregorian-first60-complete-antiphon-text-audit-v1"||
  first60.counts?.audited!==60||first60.counts?.noteGroupTokenizationHolds!==0||
  first60.counts.fullAntiphonLexicalEqual+first60.counts.literalDifferenceHolds!==60)
  fail("SOURCE_SCHEMA_OR_REVIEW_PUBLICATION_CHANGED");
 for(let i=0;i<365;i++){
  if(annual.rows[i].date!==fullYear[i]||pre.records[i].date!==fullYear[i]||
    full.days?.[i]?.date!==fullYear[i])fail("ANNUAL_DATE_ORDER_CHANGED");
 }
 if(work.counters?.selectedCalendarReadyDays!==full.counters.readyDays||
  work.counters?.blockedReaderDays!==(annual.counters.EN_READER_HOLD??0)||
  work.counters?.unresolvedPreGospelOwnershipDays!==pre.counters.sourceOwnershipHolds||
  work.counters?.sourcePathsOutsidePinnedFullTree!==full.counters.missingSourcePaths)
  fail("WORKLIST_CROSSWALK_COUNTS_DRIFT");
}
export function reconcileSchola2026Completion({annual,full,pre,work,first60}={}){
 validate({annual,full,pre,work,first60});
 const annualByDate=new Map(annual.rows.map(r=>[r.date,r]));
 const reader=annual.rows.filter(r=>r.status==="EN_READER_HOLD").map(r=>{
  if(r.resolverStatus!=="ready"||!["ready","cached"].includes(r.properStatus)||
   !exactPath.test(r.sourcePath))fail("READER_HOLD_WITHOUT_READY_SOURCE");
  const missingEN=uniq(r.englishMissing??[]),missingFR=uniq(r.frenchMissing??[]);
  if(!missingEN.length||missingEN.some(x=>![
   "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL","GOSPEL",
   "OFFERTORY","SECRET_SET","PREFACE","COMMUNION","POSTCOMMUNION_SET"
  ].includes(x)))fail("READER_MISSING_SLOTS_NOT_EXPLICIT");
  const expectedSpecial=specialRites.get(r.date);
  if(expectedSpecial&&expectedSpecial!==r.sourcePath)
   fail("SPECIAL_RITE_SOURCE_IDENTITY_DRIFT");
  const special=Boolean(expectedSpecial);
  if(!special&&missingEN.some(x=>!["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].includes(x)))
   fail("ORDINARY_READER_HOLD_NOT_LIMITED_TO_ORATIONS");
  return {date:r.date,sourcePath:r.sourcePath,principalId:r.principalId,
   classification:special?"SPECIAL_RITE_NOT_ORDINARY_MASS":
    "ORDINARY_MASS_ORATION_READER_PROJECTION_HOLD",
   missingEnglish:missingEN,missingFrench:missingFR,
   originalReaderReasons:{
    en:r.englishMissingEvidence??[],
    fr:r.frenchMissingEvidence??[],
    sourceOrationGroupCounts:r.orationInputGroupCounts??null,
    commemorationDecision:r.commemorationDecision??null
   },
   properSourceReady:true,chantScoresDeclaredMissing:false,
   action:special?"CHECK_NATIVE_SPECIAL_RITE_NOT_ORDINARY_PROPER":
    "INSPECT_EXISTING_COMMEMORATION_ORATION_SOURCE_AND_LANGUAGE_PROJECTION",
   publicScore:false};
 });
 if(reader.length!==(annual.counters.EN_READER_HOLD??0))
  fail("READER_HOLD_CENSUS_DRIFT");
 const missing=full.absentFromPinnedLatinTree.map(r=>{
  if(!exactPath.test(r.sourcePath)||!Array.isArray(r.dates)||!r.dates.length||
   uniq(r.dates).length!==r.dates.length||!Array.isArray(r.principalIds)||
   r.principalIds.length!==r.dates.length)
   fail("PINNED_SOURCE_ABSENCE_INVALID");
  for(let i=0;i<r.dates.length;i++){
   const date=r.dates[i],day=annualByDate.get(date);
   if(day?.status!=="SOURCE_MATCHED_FOR_REVIEW"||
      day.sourcePath!==r.sourcePath||day.principalId!==r.principalIds[i]||
      day.sourceExistsInPinnedLatinTree!==false)
    fail("MISSING_PATH_NOT_REAL_SELECTED_DAY");
  }
  return {sourcePath:r.sourcePath,dates:r.dates,principalIds:r.principalIds,
   dateCount:r.dates.length,
   classification:"SELECTED_PROPER_READY_BUT_PATH_OUTSIDE_PINNED_1049_MASS_TREE",
   nextStep:"CHECK_ORIGINAL_SOURCE_OWNER_AND_DERIVATION; DO_NOT_FORGE_FILE_OR_ALIAS",
   publicScore:false};
 });
 if(missing.length!==full.counters.missingSourcePaths||
  missing.reduce((n,x)=>n+x.dateCount,0)!==
   (full.counters.dayStatuses?.OUTSIDE_PINNED_1049_LATIN_TREE??0))
  fail("PINNED_SOURCE_PATH_COUNTS_DRIFT");
 const ownership=pre.records.filter(r=>r.status==="SOURCE_TEXT_RESEARCH_ONLY");
 const patterns=new Map(),ownerPaths=new Map();
 for(const r of ownership){
  if(!exactPath.test(r.sourcePath)||!Array.isArray(r.holds)||
     r.holds.length!==1||r.holds[0].code!=="SELECTED_GRADUAL_NOT_ANCHORED_IN_PINNED_SOURCE")
   fail("PREGOSPEL_HOLD_UNRECOGNIZED");
  const {primary,paschal}=r.holds[0];
  if(!primary||!paschal)fail("PREGOSPEL_CAUSE_NOT_EXPLICIT");
  const key=primary+"|"+paschal;
  const p=patterns.get(key)??{primary,paschal,dates:[],sourcePaths:[]};
  p.dates.push(r.date);p.sourcePaths.push(r.sourcePath);patterns.set(key,p);
  const owner=ownerPaths.get(r.sourcePath)??{sourcePath:r.sourcePath,dates:[],reasonPairs:[]};
  owner.dates.push(r.date);owner.reasonPairs.push(key);
  ownerPaths.set(r.sourcePath,owner);
 }
 if(ownership.length!==pre.counters.sourceOwnershipHolds)fail("PREGOSPEL_HOLD_CENSUS_DRIFT");
 const sortedOwners=[...ownerPaths.values()].sort((a,b)=>b.dates.length-a.dates.length||
  a.sourcePath.localeCompare(b.sourcePath)).map(x=>({
  sourcePath:x.sourcePath,dates:x.dates,reasonPairs:uniq(x.reasonPairs),
  action:"INSPECT_PINNED_SECTION_AND_1962_COMMON_INHERITANCE; NO_SYNTHETIC_CHANT"}));
 const grouped=[...patterns.values()].sort((a,b)=>b.dates.length-a.dates.length).map(x=>({
  primary:x.primary,paschal:x.paschal,datedHolds:x.dates.length,
  distinctSourcePaths:uniq(x.sourcePaths).length,dates:x.dates,
  classification:x.primary==="SECTION_ABSENT"?"NO_DIRECT_PINNED_GRADUAL_SECTION":
    x.primary==="PINNED_SOURCE_UNAVAILABLE"?"PRIMARY_SOURCE_PATH_UNAVAILABLE":
    "PRIMARY_SECTION_PRESENT_BUT_SELECTED_ROLE_UNRESOLVED",
  action:"GROUP_BY_ORIGINAL_COMMON_OR_SOURCE_OWNER_BEFORE_ANY_MUSIC_REVIEW"}));
 const roleExceptions=pre.records.filter(r=>r.status==="SELECTED_ROLE_UNRESOLVED").map(r=>({
  date:r.date,sourcePath:r.sourcePath,holds:r.holds,
  action:"INSPECT_EXACT_PASCHAL_VERSE_AND_SEQUENCE_OWNERSHIP",
  publicScore:false}));
 const variantIds=uniq((first60.textDifferenceHolds??[]).map(x=>x.scoreId));
 if(variantIds.some(id=>!first60.scoreEvidence?.some(x=>x.scoreId===id&&
     x.fullAntiphonLexicalEquality===false&&x.publicScore===false)))
  fail("FIRST60_VARIANT_EVIDENCE_NOT_UNPUBLISHED");
 if(variantIds.length!==first60.counts.literalDifferenceHolds||
    variantIds.some(x=>!/^GREGOBASE-\d+$/.test(x)))
   fail("FIRST60_VARIANT_LEDGER_CHANGED");
 const result={
  schema:SCHOLA_2026_CLOSEOUT_SCHEMA,
  sourceYear:2026,
  provenance:{
   annualSource:"2026-selected-gabc-coverage.json",
   authenticatedSourceCrosswalk:"2026-selected-full1049-inline-crosswalk.json",
   preGospelSource:"2026-selected-pregospel-source-queue.json",
   musicalWorklist:"2026-score-verification-all-leads.json",
   sourceTextAudit:"2026-first60-complete-antiphon-text-audit.json",
   noNewAcquisition:true,sourceFilesAuthenticated:1049,gabcArchiveScores:1195},
  counts:{
   selectedProperDays:365,readerProjectionHolds:reader.length,
   ordinaryReaderOrationHolds:reader.filter(x=>x.classification.startsWith("ORDINARY")).length,
   exceptionalRiteProjectionHolds:reader.filter(x=>x.classification.startsWith("SPECIAL")).length,
   missingPinnedSourcePaths:missing.length,
   affectedDatesMissingPinnedSource:missing.reduce((n,x)=>n+x.dateCount,0),
   preGospelDatedOwnershipHolds:ownership.length,
   distinctPreGospelSourceOwners:ownerPaths.size,
   preGospelCauseGroups:patterns.size,
   separateSelectedRoleHolds:roleExceptions.length,
   sourceUniqueMusicalCandidates:work.counters.uniqueScoreCandidates,
   sourceScoreOccurrences:work.counters.sourceScoreOccurrences,
   textExactFirst60:first60.counts.fullAntiphonLexicalEqual,
   textVariantsFirst60:variantIds.length,
   newApprovedScores:0},
  ordinaryAndSpecialReaderHolds:reader,
  selectedSourceTreeGaps:missing,
  preGospelCauseGroups:grouped,
  preGospelSourceOwnerQueue:sortedOwners,
  separateRoleHolds:roleExceptions,
  first60TextVariantScoreIds:variantIds,
  note:"Hold counts span different dimensions and must NOT be added into one missing-chant total.",
  publication:{publicScoreChanges:0,unknownSettingInferred:false,
    parserRescrape:false,printedMusicParityInferred:false,
    scorePromotionPermitted:false}
 };
 return result;
}

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dir=resolve(root,".tmp/schola-1962-selected-annual");
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const load=async n=>JSON.parse(await readFile(resolve(dir,n),"utf8"));
 const report=reconcileSchola2026Completion({
  annual:await load("2026-selected-gabc-coverage.json"),
  full:await load("2026-selected-full1049-inline-crosswalk.json"),
  pre:await load("2026-selected-pregospel-source-queue.json"),
  work:await load("2026-score-verification-all-leads.json"),
  first60:await load("2026-first60-complete-antiphon-text-audit.json")
 });
 await writeFile(resolve(dir,"2026-schola-closeout-source-exceptions.json"),
  JSON.stringify(report,null,2)+"\n");
 const lines=[
  "# Schola 2026 · source-exception closeout (research only)",
  "",
  "Generated from the existing authenticated annual pipeline. No acquisition or score approval.",
  "",
  "| Review group | Count |",
  "|---|---:|",
  "| Ordinary oration-reader projection holds | "+report.counts.ordinaryReaderOrationHolds+" |",
  "| Special-rite projections outside the ordinary Mass slot schema | "+report.counts.exceptionalRiteProjectionHolds+" |",
  "| Selected source paths outside the 1,049-file tree | "+report.counts.missingPinnedSourcePaths+" |",
  "| Affected dates for those paths | "+report.counts.affectedDatesMissingPinnedSource+" |",
  "| Dated pre-Gospel ownership holds | "+report.counts.preGospelDatedOwnershipHolds+" |",
  "| Distinct pre-Gospel source paths requiring disposition | "+report.counts.distinctPreGospelSourceOwners+" |",
  "| Cause groups (primary / paschal section status) | "+report.counts.preGospelCauseGroups+" |",
  "| Selected score research candidates | "+report.counts.sourceUniqueMusicalCandidates+" |",
  "| Newly approved Gregorian Proper scores | 0 |",
  "",
  "## Pre-Gospel cause groups",
  ...report.preGospelCauseGroups.map(x=>
   "- "+x.primary+" / "+x.paschal+": "+x.datedHolds+
   " dated holds across "+x.distinctSourcePaths+" source paths"),
  "",
  "## Exact selected-source gaps (do not invent aliases)",
  ...report.selectedSourceTreeGaps.map(x=>
   "- "+x.sourcePath+": "+x.dates.length+" dates ("+x.dates.join(", ")+")"),
  "",
  "## Explicit reader-projection holds",
  ...report.ordinaryAndSpecialReaderHolds.map(x=>"- "+x.date+" "+
   x.sourcePath+" · "+x.classification+" · EN "+x.missingEnglish.join("/")+
   " · FR "+x.missingFrench.join("/")),
  "",
  "This is not a count of broken production Masses or missing GABC transcriptions."
 ];
 await writeFile(resolve(dir,"2026-schola-closeout-source-exceptions.md"),
  lines.join("\n")+"\n");
 console.log("SCHOLA_2026_CLOSEOUT "+JSON.stringify(report.counts));
}
