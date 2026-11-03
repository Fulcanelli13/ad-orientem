// Reuse the existing source-first pre-Gospel parser for all ACTUAL 2026
// selected 1962 Masses. Research only: no reader split, no musical approval.
import {analyzeSelectedPreGospelSource}
 from "./reader-schola-pre-gospel-source-boundary.js";
export const SCHOLA_2026_PREGOSPEL_QUEUE_SCHEMA=
 "ao-schola-2026-pregospel-selected-pinned-latin-editorial-queue-v1";
const validPath=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const sha64=/^[a-f0-9]{64}$/;
function days2026(){
 return Array.from({length:365},(_,i)=>
  new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));
}
function validate({annualReport,archive,fetchSource}){
 if(annualReport?.schema!=="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1"||
    annualReport.year!==2026||annualReport.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
    annualReport.counters?.civilDays!==365||
    annualReport.status!=="EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION"||
    !Array.isArray(annualReport.rows)||annualReport.rows.length!==365||
    annualReport.rows.some((r,i)=>r?.date!==days2026()[i])||
    archive?.count!==1195||typeof fetchSource!=="function")
  throw new Error("PREGOSPEL_SELECTED_2026_SOURCE_INPUT_INVALID");
}
export async function buildSelected2026PreGospelSourceReview({
 annualReport,archive,fetchSource
}={}){
 validate({annualReport,archive,fetchSource});
 const records=[],statuses={},pieceStatuses={},scoreIndex=new Map();
 const bump=(map,key)=>{map[key]=(map[key]??0)+1};
 let readyDays=0,daysWithPieces=0,uniqueCandidateOccurrences=0,
     ambiguousCandidateOccurrences=0,sourceReadFailures=0;
 for(const row of annualReport.rows){
  if(row.status!=="SOURCE_MATCHED_FOR_REVIEW"){
   records.push({date:row.date,status:"CALENDAR_PROPER_HOLD",
    sourcePath:row.sourcePath??null,sourceStatus:row.status,pieces:[],holds:[]});
   bump(statuses,"CALENDAR_PROPER_HOLD");continue;
  }
  readyDays++;
  const selectedLatin=String(row.selectedGradualLatin??"");
  if(!validPath.test(row.sourcePath)||!row.principalId||
    row.resolverStatus!=="ready"||
    !["ready","cached"].includes(String(row.properStatus).toLowerCase()))
   throw new Error("PREGOSPEL_SELECTED_DAY_IDENTITY_INVALID");
  if(!selectedLatin.trim()){
   const status="SELECTED_GRADUAL_SOURCE_UNAVAILABLE";
   records.push({date:row.date,sourcePath:row.sourcePath,status,
    pieces:[],holds:[{code:"FLATTENED_LATIN_SOURCE_MISSING"}]});
   bump(statuses,status);continue;
  }
  const analyzed=await analyzeSelectedPreGospelSource({
   sourcePath:row.sourcePath,selectedLatin,
   selectedSequenceLatin:String(row.selectedSequenceLatin??""),
   fetchSource,archive
  });
  if(analyzed?.approval?.publicScores!==0||
     analyzed?.approval?.readerChanged!==false)
   throw new Error("PREGOSPEL_RESEARCH_PUBLISHING_CONTRADICTION");
  const parts=[];
  for(const p of analyzed.pieces??[]){
   if(!["gr","al","tr"].includes(p.role)||
      !["UNIQUE_SOURCE_TEXT_CANDIDATE","AMBIGUOUS_SOURCE_TEXT_VARIANTS",
        "NO_TEXT_CANDIDATE","INSUFFICIENT_SOURCE_LATIN"].includes(p.status)||
      !Array.isArray(p.candidateScoreIds)||!Array.isArray(p.candidateHashes)||
      p.candidateHashes.length!==p.candidateScoreIds.length)
      throw new Error("PREGOSPEL_UNTRUSTED_RESEARCH_RESULT");
   const record={part:p.role,sourceOwner:p.sourceOwner,
    sourceSection:p.sourceSection,sourceSha:p.sourceSha,
    sourceChain:p.sourceChain,opening:p.opening,
    status:p.status,scoreIds:p.candidateScoreIds,
    scoreGabcSha256:p.candidateHashes,
    publicScore:false,readerParagraphSplitCertified:false};
   for(let i=0;i<record.scoreIds.length;i++){
    const id=record.scoreIds[i],hash=record.scoreGabcSha256[i];
    if(!/^GREGOBASE-\d+$/.test(id)||!sha64.test(hash))
     throw new Error("PREGOSPEL_SCORE_ID_HASH_INVALID");
    const key=id+"|"+hash;
    const previous=scoreIndex.get(key);
    if(previous){
     if(previous.part!==p.role)throw new Error("PREGOSPEL_CROSS_ROLE_SCORE_CONFLICT");
     previous.dates.push(row.date);previous.sourcePaths.add(row.sourcePath);
     previous.sourceOwners.add(p.sourceOwner);
     previous.uniqueTextOccurrences+=p.status==="UNIQUE_SOURCE_TEXT_CANDIDATE"?1:0;
     previous.ambiguousTextOccurrences+=p.status==="AMBIGUOUS_SOURCE_TEXT_VARIANTS"?1:0;
    }else scoreIndex.set(key,{scoreId:id,scoreGabcSha256:hash,part:p.role,
     dates:[row.date],sourcePaths:new Set([row.sourcePath]),
     sourceOwners:new Set([p.sourceOwner]),
     uniqueTextOccurrences:p.status==="UNIQUE_SOURCE_TEXT_CANDIDATE"?1:0,
     ambiguousTextOccurrences:p.status==="AMBIGUOUS_SOURCE_TEXT_VARIANTS"?1:0,
     publicScore:false,editorialApproved:false,printedNeumesVerified:false});
   }
   if(p.status==="UNIQUE_SOURCE_TEXT_CANDIDATE")uniqueCandidateOccurrences++;
   if(p.status==="AMBIGUOUS_SOURCE_TEXT_VARIANTS")ambiguousCandidateOccurrences++;
   bump(pieceStatuses,p.status);
   parts.push(record);
  }
  if(parts.length)daysWithPieces++;
  if((analyzed.holds??[]).some(h=>h.code==="SELECTED_GRADUAL_NOT_ANCHORED_IN_PINNED_SOURCE"||
    h.code==="PINNED_SOURCE_UNAVAILABLE"))sourceReadFailures++;
  records.push({date:row.date,sourcePath:row.sourcePath,
   principalId:row.principalId,status:analyzed.status,
   sourceSelectedLatinOnly:true,
   readerParagraphSplitCertified:false,
   pieces:parts,holds:analyzed.holds??[]});
  bump(statuses,analyzed.status);
 }
 const scoreReviewLeads=[...scoreIndex.values()].map(g=>({
  scoreId:g.scoreId,scoreGabcSha256:g.scoreGabcSha256,
  part:g.part,dates:[...g.dates].sort(),
  occurrences:g.dates.length,
  distinctSourcePaths:[...g.sourcePaths].sort(),
  distinctSourceOwners:[...g.sourceOwners].sort(),
  uniqueTextOccurrences:g.uniqueTextOccurrences,
  ambiguousTextOccurrences:g.ambiguousTextOccurrences,
  review:"FULL_1962_SELECTED_LATIN_PARITY_AND_PRINTED_NEUMES_REQUIRED",
  publicScore:false,editorialApproved:false,printedNeumesVerified:false
 })).sort((a,b)=>b.uniqueTextOccurrences-a.uniqueTextOccurrences||
   b.occurrences-a.occurrences||a.scoreId.localeCompare(b.scoreId));
 return Object.freeze({
  schema:SCHOLA_2026_PREGOSPEL_QUEUE_SCHEMA,
  status:"SELECTED_PINNED_1962_PRE_GOSPEL_RESEARCH_NOT_PUBLICATION",
  provenance:{year:2026,selectedAuthority:"AO_RUNTIME_V8.resolver.resolveDay",
   pinnedLatinSourceOnly:true,sourceFirstPreGospelParserReused:true,
   sourceArchiveScores:1195},
  counters:{daysChecked:365,readyDays,daysWithCandidatePieces:daysWithPieces,
   uniqueTextCandidateOccurrences:uniqueCandidateOccurrences,
   ambiguousCandidateOccurrences,distinctCandidateScoreIds:scoreReviewLeads.length,
   sourceOwnershipHolds:sourceReadFailures,
   dayStatuses:statuses,pieceStatuses,publicScores:0},
  scoreReviewLeads,records,
  publication:{readerPreGospelSourceSeparationChanged:false,
   fullLatinParagraphParityCertified:false,scorePitchAndNeumeParityApproved:false,
   digitalScoresApproved:0,recordingsApproved:0,publicScores:0}
 });
}