// Research-only intersection of ACTUAL 2026 calendar-selected Masses and
// the previously authenticated 91-source / 342-score review queue.
// A matching source, incipit and hash is NOT approval of a melody, of an
// actual parish programme, or of full neume/syllable parity.
import {source1962ChantOpeningForMatch} from "./reader-proper-gabc-bulk-join.js";

export const SELECTED_2026_INLINE_CROSSWALK_SCHEMA=
 "ao-mass-inline-selected-2026-pinned91-review-crosswalk-v1";
const roleKeys=Object.freeze({
 in:"PROPER_INTROIT",gr:"PROPER_GRADUAL",al:"PROPER_ALLELUIA",
 tr:"PROPER_TRACT",of:"PROPER_OFFERTORY",co:"PROPER_COMMUNION"
});
const roleTracks=Object.freeze({
 in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA_TRACT_SEQUENCE",
 tr:"ALLELUIA_TRACT_SEQUENCE",of:"OFFERTORY",co:"COMMUNION"
});
const sourcePath=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const sha256=/^[a-f0-9]{64}$/;
const normalize=s=>String(source1962ChantOpeningForMatch(s??"")).normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .replace(/j/gi,"i").toLowerCase().replace(/[^a-z]+/g," ")
 .trim().replace(/\s+/g," ");
const tokens=s=>normalize(s).split(" ").filter(Boolean);
const fail=(reason)=>{throw new Error(reason)};
function matchingIncipit(selected,pinned){
 const a=tokens(selected),b=tokens(pinned);
 if(a.length<4||b.length<4)return false;
 const n=Math.min(8,a.length,b.length);
 return a.slice(0,n).every((x,i)=>x===b[i]);
}
function allYearDates(year){
 const out=[];
 for(let t=Date.UTC(year,0,1);t<Date.UTC(year+1,0,1);t+=86400000)
  out.push(new Date(t).toISOString().slice(0,10));
 return out;
}
function indexSourceReviewOccurrences(queue){
 const byScore=new Map();
 for(const lead of queue.scoreReviewLeads){
  if(!/^GREGOBASE-\d+$/.test(lead.scoreId)||
     !sha256.test(lead.originalGabcSha256)||!roleKeys[lead.role]||
     lead.selectionKey!==roleKeys[lead.role]||
     lead.publicScore!==false||lead.publication!=="RESEARCH_ONLY_NOT_APPROVED"||
     !Array.isArray(lead.occurrences))fail("STAGED_SCORE_RECORD_UNTRUSTED");
  if(byScore.has(lead.scoreId))fail("DUPLICATED_SCORE_ID");
  byScore.set(lead.scoreId,lead);
 }
 return byScore;
}
const hold=(reason,track=null)=>({status:reason,track:track?.role??null,
 part:track?.part??null,scoreIds:(track?.candidates??[]).map(x=>x.scoreId)});
export function crosswalkSelected2026MassesToPinnedReview({
 annualReport,reviewQueue
}={}){
 if(annualReport?.schema!=="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1"||
    annualReport?.year!==2026||
    annualReport?.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
    annualReport?.status!=="EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION"||
    reviewQueue?.schema!=="ao-mass-inline-1962-91-archived-score-review-queue-v1"||
    reviewQueue?.status!=="SOURCE_RESEARCH_QUEUE_NOT_PUBLICATION"||
    reviewQueue?.counts?.publishedScores!==0||
    reviewQueue?.counts?.distinctCandidateScoreIds!==342||
    reviewQueue?.provenance?.calendarMassesSelected!==false||
    !Array.isArray(annualReport?.rows)||!Array.isArray(reviewQueue?.scoreReviewLeads)||
    reviewQueue.scoreReviewLeads.length!==342)
    fail("ANNUAL_OR_91_SOURCE_SCOPE_INVALID");
 const expected=allYearDates(2026);
 if(annualReport.rows.length!==expected.length||
    annualReport.counters?.civilDays!==365||
    annualReport.rows.some((row,i)=>row?.date!==expected[i]))
    fail("INCOMPLETE_OR_UNORDERED_2026_CALENDAR");
 const byScore=indexSourceReviewOccurrences(reviewQueue);
 const knownPaths=new Set();
 for(const lead of reviewQueue.scoreReviewLeads)
  for(const occurrence of lead.occurrences){
   if(!sourcePath.test(occurrence.sourcePath))fail("UNTRUSTED_SOURCE_PATH");
   knownPaths.add(occurrence.sourcePath);
  }
 for(const entry of reviewQueue.unresolvedSectionHolds??[]){
  if(!sourcePath.test(entry.sourcePath))fail("UNTRUSTED_UNRESOLVED_SOURCE_PATH");
  knownPaths.add(entry.sourcePath);
 }
 const calendar=[],matches=[],statusCounts={};
 let readySelectedDates=0,sourceTrackCandidates=0,sourceCandidatesMatched=0;
 const matchedIds=new Set(),selectedPaths=new Set(),coveredPaths=new Set();
 const bump=s=>{statusCounts[s]=(statusCounts[s]??0)+1};
 for(const row of annualReport.rows){
  if(row.status!=="SOURCE_MATCHED_FOR_REVIEW"){
   const result={date:row.date,principalId:row.principalId??null,
    sourcePath:row.sourcePath??null,status:"CALENDAR_OR_READER_HOLD",
    reason:row.status,tracks:[]};
   calendar.push(result);bump(result.status);continue;
  }
  if(!sourcePath.test(row.sourcePath)||!row.principalId||
     row.resolverStatus!=="ready"||
     !["ready","cached"].includes(String(row.properStatus).toLowerCase())||
     row.sourceExistsInPinnedLatinTree!==true||
     !Array.isArray(row.tracks))fail("UNTRUSTED_CALENDAR_SELECTED_FORMULARY");
  readySelectedDates++;selectedPaths.add(row.sourcePath);
  const in91=knownPaths.has(row.sourcePath);
  if(in91)coveredPaths.add(row.sourcePath);
  const decisions=[];
  for(const track of row.tracks){
   const key=roleKeys[track.part];
   if(!key||roleTracks[track.part]!==track.role||!Array.isArray(track.candidates))
    {decisions.push(hold("UNRESOLVED_CHANT_ROLE",track));continue}
   if(track.status!=="UNIQUE_SOURCE_TEXT_CANDIDATE"||
      track.candidates.length!==1){
    decisions.push(hold(track.candidates.length>1?
      "SELECTED_SCORE_VARIANTS_AMBIGUOUS":"NO_UNIQUE_SELECTED_SCORE",track));
    continue;
   }
   const candidate=track.candidates[0];sourceTrackCandidates++;
   if(!/^GREGOBASE-\d+$/.test(String(candidate.scoreId))||
      !sha256.test(String(candidate.sourceGabcSha256))||
      candidate.publicScore!==false||candidate.editorApproved!==false)
    fail("CALENDAR_CANDIDATE_HAS_UNTRUSTED_PUBLICATION");
   if(!in91){decisions.push(hold("OUTSIDE_PRIOR_91_SOURCE_REVIEW",track));continue}
   const lead=byScore.get(candidate.scoreId);
   if(!lead||lead.originalGabcSha256!==candidate.sourceGabcSha256||
      lead.selectionKey!==key){
    decisions.push(hold("SOURCE_SCORE_ID_OR_HASH_NOT_CORROBORATED",track));continue;
   }
   if(typeof track.selectedLatin!=="string"||!track.selectedLatin.trim()||
      typeof track.selectedParagraphId!=="string"||!track.selectedParagraphId)
    {decisions.push(hold("SELECTED_PARAGRAPH_SOURCE_TEXT_MISSING",track));continue}
   const occurrences=lead.occurrences.filter(o=>
    o.sourcePath===row.sourcePath&&o.matchStatus==="UNIQUE_TEXT_CANDIDATE"&&
    matchingIncipit(track.selectedLatin,o.latinIncipit));
   if(occurrences.length!==1){
    decisions.push(hold(occurrences.length>1?
      "MULTIPLE_PINNED_SECTION_OCCURRENCES":
      "PINNED_1962_SOURCE_INCIPIT_NOT_CORROBORATED",track));
    continue;
   }
   const source=occurrences[0],record={
    date:row.date,principalId:row.principalId,sourcePath:row.sourcePath,
    track:track.role,part:track.part,selectionKey:key,
    scoreId:lead.scoreId,scoreGabcSha256:lead.originalGabcSha256,
    original1961Folio:lead.original1961Folio,sourceUrl:lead.sourceUrl,
    selectedParagraphId:track.selectedParagraphId,
    pinned1962SourceBlobSha:source.sourceBlobSha,
    pinnedSection:source.section,pinnedSectionIndex:source.sectionIndex,
    sourceOwner:source.sourceOwner,sourceOwnerChain:source.sourceOwnerChain,
    status:"INCIPIT_AND_SCORE_HASH_CORROBORATED_REVIEW_ONLY",
    fullTextVerified:false,printedNeumesVerified:false,
    sourceSelectionApproved:false,publicScore:false};
   matches.push(record);sourceCandidatesMatched++;matchedIds.add(lead.scoreId);
   decisions.push({status:record.status,track:track.role,part:track.part,
    scoreIds:[lead.scoreId],selectedParagraphId:track.selectedParagraphId});
  }
  const all=decisions.length>0&&
   decisions.every(x=>x.status==="INCIPIT_AND_SCORE_HASH_CORROBORATED_REVIEW_ONLY");
  const any=decisions.some(x=>x.status==="INCIPIT_AND_SCORE_HASH_CORROBORATED_REVIEW_ONLY");
  const status=!in91?"CALENDAR_SOURCE_OUTSIDE_91_REVIEW":
   all?"ALL_UNIQUE_TRACKS_CORROBORATED":any?"PARTIAL_SOURCE_CORROBORATION":
   "SOURCE_REVIEW_HOLD";
  calendar.push({date:row.date,principalId:row.principalId,
   sourcePath:row.sourcePath,status,tracks:decisions});
  bump(status);
 }
 return Object.freeze({
  schema:SELECTED_2026_INLINE_CROSSWALK_SCHEMA,
  status:"ACTUAL_SELECTED_CALENDAR_SOURCE_CROSSWALK_NOT_PUBLICATION",
  scope:{year:2026,actualSelectedCalendarDayCount:365,
   includesVotives:false,includesOptionalRequiemMasses:false,
   sourceUniversePrior91Only:true},
  counters:{calendarDays:365,readySelectedDates,
   distinctSelectedProperSourcePaths:selectedPaths.size,
   selectedSourcePathsRepresentedIn91:coveredPaths.size,
   selectedUniqueSourceCandidates:sourceTrackCandidates,
   corroboratedCandidateOccurrences:sourceCandidatesMatched,
   distinctCorroboratedScoreIds:matchedIds.size,
   calendarDayStatuses:statusCounts,publishedScores:0},
  matchedReviewOccurrences:matches,
  calendar,publication:{printedMusicalVerification:false,
   fullSyllableParityVerified:false,localScholaSelectionCertified:false,
   scoresApproved:0,publicScores:0}
 });
}