// Build a deduplicated, non-publishing review queue from the already screened
// 91 pinned 1962 Latin source files and all 1,195 archived 1961 GABC scores.
// Run: node scripts/schola/build-91-inline-review-queue.mjs
// This does NOT select calendar Masses, approve music, or import GABC to LIVE.
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const load=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const input="data/research/mass-music-1962-91-source-first-coverage.v1.json";
const output="data/research/mass-music-1962-91-inline-review-queue.v1.json";
const statuses=["UNIQUE_TEXT_CANDIDATE","AMBIGUOUS_TEXT_VARIANTS"];
const roleKey={in:"PROPER_INTROIT",gr:"PROPER_GRADUAL",al:"PROPER_ALLELUIA",
 tr:"PROPER_TRACT",of:"PROPER_OFFERTORY",co:"PROPER_COMMUNION"};
function verified(condition,reason){if(!condition)throw new Error(reason)}
export function build91InlineReviewQueue(coverage,batches){
 verified(coverage?.schema==="ao-schola-1962-91-pinned-mass-source-coverage-v1",
  "1962_91_SOURCE_LEDGER_IDENTITY");
 verified(Array.isArray(coverage.sourceFiles)&&coverage.sourceFiles.length===91,
  "SOURCE_91_ROSTER_INCOMPLETE");
 verified(Array.isArray(batches)&&batches.length===6,"ARCHIVE_SIX_BATCHES_REQUIRED");
 const archive=new Map();
 for(let n=0;n<6;n++){
  const b=batches[n],expected=n===5?195:200;
  verified(b?.schema==="ao-gregobase-graduale1961-research-batch-v1"&&
   b.sourceEditionId===2&&b.batch===n+1&&b.status==="STAGED_UNRELEASED"&&
   b.items?.length===expected,"SOURCE_ARCHIVE_BATCH_INVALID");
  for(const rec of b.items){
   verified(!archive.has(rec.id)&&rec.id==="GREGOBASE-"+rec.gregobaseId&&
    /^[a-f0-9]{64}$/.test(rec.sha256||"")&&
    rec.releaseStatus==="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED",
    "DUPLICATE_OR_UNTRUSTED_SCORE_ID");
   archive.set(rec.id,rec);
  }
 }
 verified(archive.size===1195,"SOURCE_ARCHIVE_NOT_1195");
 const candidateMap=new Map(),variants=[],holds=[],statusesSeen={};
 let sourceEntryCount=0,candidateOccurrences=0;
 for(const file of coverage.sourceFiles){
  verified(/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(file.sourcePath)&&
   /^[a-f0-9]{40}$/.test(file.sourceBlobSha)&&file.sourceAuthenticated===true&&
   file.actualSelectedMass1962===false,"PINNED_SOURCE_IDENTITY_OR_SCOPE_INVALID");
  for(const [index,track] of file.tracks.entries()){
   sourceEntryCount++;
   const status=track.status;
   statusesSeen[status]=(statusesSeen[status]||0)+1;
   const ref={sourcePath:file.sourcePath,sourceBlobSha:file.sourceBlobSha,
    section:track.section,sectionIndex:index,liturgicalKind:track.kind,
    sourceOwner:track.sourceOwner||null,
    sourceOwnerChain:track.sourceOwnerChain||[],
    latinIncipit:track.latinIncipit||null};
   const candidateRows=track.candidates||[];
   if(statuses.includes(status)){
    verified(Array.isArray(candidateRows)&&candidateRows.length>=1&&
      roleKey[track.part],"MATCH_ROLE_OR_CANDIDATES_INVALID");
    if(status==="UNIQUE_TEXT_CANDIDATE")
     verified(candidateRows.length===1,"UNIQUE_SCORE_NOT_UNIQUE");
    if(status==="AMBIGUOUS_TEXT_VARIANTS")
     verified(candidateRows.length>1,"AMBIGUOUS_SCORE_NOT_MULTIPLE");
    candidateOccurrences+=candidateRows.length;
    for(const row of candidateRows){
     const original=archive.get(row.id);
     verified(original&&original.sha256===row.sha256&&
      original.sourceUrl===row.sourceUrl&&original.officePart===track.part&&
      original.gradualeRomanum1961Page===row.originalFolio,
      "ARCHIVED_SCORE_HASH_ROLE_OR_FOLIO_MISMATCH:"+row.id);
     if(!candidateMap.has(row.id))
      candidateMap.set(row.id,{
       scoreId:row.id,role:track.part,selectionKey:roleKey[track.part],
       originalGabcSha256:original.sha256,
       original1961Folio:original.gradualeRomanum1961Page,
       sourceUrl:original.sourceUrl,
       publication:"RESEARCH_ONLY_NOT_APPROVED",
       printedNeumesVerified:false,fullScoreSyllablesVerified:false,
       sourceSelectedForCalendarMass:false,publicScore:false,occurrences:[]});
     const entry=candidateMap.get(row.id);
     verified(entry.role===track.part&&entry.originalGabcSha256===row.sha256,
      "DUPLICATE_SCORE_CROSS_ROLE_CONFLICT");
     entry.occurrences.push({...ref,matchStatus:status,
      matchedOpeningWords:row.matchedOpeningWords});
    }
    if(status==="AMBIGUOUS_TEXT_VARIANTS")
     variants.push({...ref,role:track.part,
      selectionKey:roleKey[track.part],candidateScoreIds:candidateRows.map(x=>x.id),
      status:"COMPETING_SCORE_VARIANTS_HOLD",publicScore:false});
   }else{
    verified(candidateRows.length===0,"UNRESOLVED_SECTION_HAS_CANDIDATES");
    holds.push({...ref,part:track.part||null,
     status,reason:track.reason||null});
   }
  }
 }
 verified(sourceEntryCount===471&&candidateOccurrences===397&&
  candidateMap.size===342&&variants.length===19&&holds.length===97,
  "91_SOURCE_SCREENING_CENSUS_DRIFT");
 verified(Object.entries(coverage.statusCounts).every(([k,n])=>
  statusesSeen[k]===n)&&Object.keys(statusesSeen).length===
  Object.keys(coverage.statusCounts).length,"SOURCE_STATUS_CENSUS_CHANGED");
 const leads=[...candidateMap.values()].map(row=>{
  const unique=row.occurrences.filter(x=>x.matchStatus==="UNIQUE_TEXT_CANDIDATE").length;
  const ambiguous=row.occurrences.length-unique;
  return {...row,uniqueTextOccurrences:unique,ambiguousTextOccurrences:ambiguous,
   priority:ambiguous?"REVIEW_COMPETING_VARIANTS":"REVIEW_PRINT_AND_FULL_TEXT"};
 }).sort((a,b)=>b.uniqueTextOccurrences-a.uniqueTextOccurrences||
  Number(a.scoreId.slice(10))-Number(b.scoreId.slice(10)));
 const distinctUnique=leads.filter(x=>x.uniqueTextOccurrences).length;
 const distinctAmbiguous=leads.filter(x=>x.ambiguousTextOccurrences).length;
 verified(distinctUnique===315&&distinctAmbiguous===30,
  "DISTINCT_SCORE_SCREENING_CENSUS_CHANGED");
 return {
  schema:"ao-mass-inline-1962-91-archived-score-review-queue-v1",
  status:"SOURCE_RESEARCH_QUEUE_NOT_PUBLICATION",
  provenance:{
   sourceLedger:input,
   pinned1962SourceRef:"ad8783641455bae38a8eb5782b34241a7b3ff2ef",
   source1961Archive:"data/mass/chant-corpus/gr1961-proper-001..006.json",
   sourceScoreCount:1195,sourceFileCount:91,
   calendarMassesSelected:false,GregorianNotesApproved:false
  },
  counts:{sourceEntries:sourceEntryCount,sourceCandidateOccurrences:candidateOccurrences,
   distinctCandidateScoreIds:leads.length,uniqueTextOccurrences:355,
   distinctUniqueTextScoreIds:distinctUnique,ambiguousVariantOccurrences:variants.length,
   distinctAmbiguousVariantScoreIds:distinctAmbiguous,otherHolds:holds.length,
   sourceStatusCounts:statusesSeen,publishedScores:0},
  scoreReviewLeads:leads,competingVariantHolds:variants,
  unresolvedSectionHolds:holds
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const coverage=load(input);
 const batches=Array.from({length:6},(_,i)=>load(
  "data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json"));
 const record=build91InlineReviewQueue(coverage,batches);
 writeFileSync(resolve(root,output),JSON.stringify(record,null,2)+"\n");
 console.log("PASS 91 pinned source files, 397 occurrences, 342 distinct score leads, 19 variant holds, 97 unresolved holds; no publication");
}