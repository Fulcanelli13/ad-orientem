// Research-only: join actual 2026 DayResolver-selected Proper readings to all
// 1,049 pinned, SHA-authenticated 1962 Latin source files. No score publication.
import {source1962ChantOpeningForMatch} from "./reader-proper-gabc-bulk-join.js";

export const SELECTED_2026_FULL_SOURCE_CROSSWALK_SCHEMA=
 "ao-schola-2026-selected-full-1049-source-gabc-review-v1";
const roles=Object.freeze({in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA_TRACT_SEQUENCE",
 tr:"ALLELUIA_TRACT_SEQUENCE",of:"OFFERTORY",co:"COMMUNION"});
const sourcePath=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const sha40=/^[a-f0-9]{40}$/,sha64=/^[a-f0-9]{64}$/;
const fail=code=>{throw Error(code)};
function words(s){
 return String(source1962ChantOpeningForMatch(s??"")).normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae")
  .replace(/œ/gi,"oe").replace(/j/gi,"i")
  .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ")
  .split(" ").filter(Boolean);
}
function openingAgree(a,b){
 const left=words(a),right=words(b),n=Math.min(8,left.length,right.length);
 return n>=4&&left.slice(0,n).every((w,i)=>w===right[i]);
}
function annualDays(){
 return Array.from({length:365},(_,i)=>
  new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));
}
function checkedAudit(audit){
 if(audit?.schema!=="ao-schola-full-pinned-1962-candidate-universe-audit-v1"||
    audit.sourceUniverseCount!==1049||audit.auditedSourceCount!==1049||
    audit.authenticatedSourceCount!==1049||
    !Array.isArray(audit.authenticationFailures)||audit.authenticationFailures.length||
    audit.permissions?.publicNotation!==false||
    audit.permissions?.selected1962MassConfirmed!==false||
    audit.coverage?.schema!=="ao-schola-1962-91-pinned-mass-source-coverage-v1"||
    audit.coverage.pinnedSourceCount!==1049||
    audit.coverage.catalogueSourceCount!==1195||
    audit.coverage.publication?.approvedScores!==0||
    !Array.isArray(audit.coverage.sourceFiles)||
    audit.coverage.sourceFiles.length!==1049)fail("UNTRUSTED_FULL_1049_AUDIT");
 const map=new Map();
 for(const f of audit.coverage.sourceFiles){
  if(!sourcePath.test(f?.sourcePath)||!sha40.test(f?.sourceBlobSha)||
     f.sourceAuthenticated!==true||f.actualSelectedMass1962!==false||
     !Array.isArray(f.tracks)||map.has(f.sourcePath))
    fail("FULL_SOURCE_FILE_IDENTITY_INVALID");
  map.set(f.sourcePath,f);
 }
 return map;
}
function checkedYear(annual){
 if(annual?.schema!=="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1"||
    annual.year!==2026||annual.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
    annual.sourceScoreCorpus!==1195||
    annual.status!=="EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION"||
    annual.counters?.civilDays!==365||!Array.isArray(annual.rows)||
    annual.rows.length!==365||
    annual.rows.some((r,i)=>r?.date!==annualDays()[i]))
    fail("UNTRUSTED_SELECTED_2026_DAY_RESOLVER");
}
const hold=(status,track,extra={})=>({
 status,track:track?.role??null,part:track?.part??null,
 scoreIds:(track?.candidates??[]).map(c=>c.scoreId),...extra
});
const candidateKey=x=>[x.date,x.sourcePath,x.track,x.part,x.scoreId,
 x.scoreGabcSha256].join("|");
export function crosswalkSelected2026ToFullPinnedSource({
 annualReport,fullSourceAudit,prior91Crosswalk=null
}={}){
 checkedYear(annualReport);
 const sourceMap=checkedAudit(fullSourceAudit);
 if(prior91Crosswalk!=null&&(
   prior91Crosswalk?.schema!=="ao-mass-inline-selected-2026-pinned91-review-crosswalk-v1"||
   prior91Crosswalk?.counters?.calendarDays!==365||
   prior91Crosswalk?.counters?.publishedScores!==0||
   !Array.isArray(prior91Crosswalk?.matchedReviewOccurrences)))
  fail("UNTRUSTED_PRIOR_91_CROSSWALK");
 const days=[],matches=[],missing=new Map(),statusCounts={},trackStatuses={};
 const distinctSources=new Set(),representedSources=new Set(),matchedIds=new Set();
 let readyDays=0,selectedUniqueCandidateOccurrences=0;
 const bump=(map,k)=>{map[k]=(map[k]??0)+1;};
 for(const day of annualReport.rows){
  if(day.status!=="SOURCE_MATCHED_FOR_REVIEW"){
   days.push({date:day.date,status:"CALENDAR_OR_READER_HOLD",
    reason:day.status,sourcePath:day.sourcePath??null,tracks:[]});
   bump(statusCounts,"CALENDAR_OR_READER_HOLD");
   continue;
  }
  if(!sourcePath.test(day.sourcePath)||!day.principalId||
     day.resolverStatus!=="ready"||
     !["ready","cached"].includes(String(day.properStatus).toLowerCase())||
     !Array.isArray(day.tracks))fail("UNTRUSTED_SELECTED_FORMULARY");
  readyDays++;distinctSources.add(day.sourcePath);
  const authenticated=sourceMap.get(day.sourcePath);
  if(day.sourceExistsInPinnedLatinTree!==Boolean(authenticated))
   fail("SELECTED_SOURCE_TREE_MEMBERSHIP_CHANGED");
  if(!authenticated){
   const entry=missing.get(day.sourcePath)??{sourcePath:day.sourcePath,
    dates:[],principalIds:[]};
   entry.dates.push(day.date);entry.principalIds.push(day.principalId);
   missing.set(day.sourcePath,entry);
   days.push({date:day.date,principalId:day.principalId,
    sourcePath:day.sourcePath,status:"OUTSIDE_PINNED_1049_LATIN_TREE",
    tracks:day.tracks.map(t=>hold("PINNED_SOURCE_PATH_UNAVAILABLE",t))});
   bump(statusCounts,"OUTSIDE_PINNED_1049_LATIN_TREE");
   continue;
  }
  representedSources.add(day.sourcePath);
  const selections=[];
  for(const t of day.tracks){
   if(!roles[t.part]||roles[t.part]!==t.role||
      !Array.isArray(t.candidates)){
    selections.push(hold("SOURCE_ROLE_UNRESOLVED",t));bump(trackStatuses,"SOURCE_ROLE_UNRESOLVED");
    continue;
   }
   if(t.status!=="UNIQUE_SOURCE_TEXT_CANDIDATE"||t.candidates.length!==1){
    const status=t.candidates.length>1?"SELECTED_VARIANTS_COMPETE":"SELECTED_TEXT_NOT_UNIQUE";
    selections.push(hold(status,t));bump(trackStatuses,status);continue;
   }
   selectedUniqueCandidateOccurrences++;
   const c=t.candidates[0];
   if(!/^GREGOBASE-\d+$/.test(c.scoreId)||!sha64.test(c.sourceGabcSha256)||
      c.editorApproved!==false||c.publicScore!==false)
    fail("SELECTED_CANDIDATE_PUBLICATION_OR_SOURCE_INVALID");
   if(!t.selectedParagraphId||typeof t.selectedParagraphId!=="string"||
      typeof t.selectedLatin!=="string"||words(t.selectedLatin).length<4){
    selections.push(hold("SELECTED_LATIN_PARAGRAPH_HOLD",t));
    bump(trackStatuses,"SELECTED_LATIN_PARAGRAPH_HOLD");continue;
   }
   const samePart=authenticated.tracks.filter(v=>v.part===t.part);
   const candidateOccurrences=samePart.filter(v=>
     v.status==="UNIQUE_TEXT_CANDIDATE"&&v.candidates?.length===1&&
     v.candidates[0].id===c.scoreId&&
     v.candidates[0].sha256===c.sourceGabcSha256&&
     openingAgree(t.selectedLatin,v.latinIncipit));
   if(candidateOccurrences.length!==1){
    const variants=samePart.filter(v=>v.status==="AMBIGUOUS_TEXT_VARIANTS"&&
      v.candidates?.some(o=>o.id===c.scoreId)&&
      openingAgree(t.selectedLatin,v.latinIncipit));
    const status=variants.length?"PINNED_SCORE_VARIANTS_COMPETE":
     candidateOccurrences.length>1?"MULTIPLE_PINNED_SECTION_MATCHES":
     "PINNED_SCORE_AND_1962_OPENING_NOT_CORROBORATED";
    selections.push(hold(status,t));bump(trackStatuses,status);continue;
   }
   const entry=candidateOccurrences[0],ref=entry.candidates[0];
   const index=authenticated.tracks.indexOf(entry);
   const match={date:day.date,principalId:day.principalId,
    sourcePath:day.sourcePath,pinned1962SourceBlobSha:authenticated.sourceBlobSha,
    sourceOwner:entry.sourceOwner??null,
    sourceOwnerChain:entry.sourceOwnerChain??[],
    sourceSection:entry.section,sourceSectionIndex:index,
    track:t.role,part:t.part,scoreId:c.scoreId,
    scoreGabcSha256:c.sourceGabcSha256,
    original1961Folio:ref.originalFolio,
    sourceUrl:ref.sourceUrl,
    selectedParagraphId:t.selectedParagraphId,
    status:"UNIQUE_1962_SOURCE_AND_SCORE_HASH_REVIEW_ONLY",
    fullLatinTextVerified:false,printedNeumesVerified:false,
    musicalVariantApproved:false,publicScore:false};
   matches.push(match);matchedIds.add(c.scoreId);
   selections.push({status:match.status,track:t.role,part:t.part,
    scoreIds:[c.scoreId],selectedParagraphId:t.selectedParagraphId});
   bump(trackStatuses,match.status);
  }
  const confirmed=selections.filter(x=>
    x.status==="UNIQUE_1962_SOURCE_AND_SCORE_HASH_REVIEW_ONLY").length;
  const status=confirmed===0?"NO_FULL_SOURCE_CORROBORATION":
   confirmed===selections.length&&selections.length?"ALL_TRACKS_SOURCE_CORROBORATED":
   "PARTIAL_FULL_SOURCE_CORROBORATION";
  days.push({date:day.date,principalId:day.principalId,
   sourcePath:day.sourcePath,status,tracks:selections});
  bump(statusCounts,status);
 }
 const grouped=new Map();
 for(const row of matches){
  const key=row.scoreId+"|"+row.scoreGabcSha256;
  if(!grouped.has(key))grouped.set(key,{scoreId:row.scoreId,
   scoreGabcSha256:row.scoreGabcSha256,part:row.part,
   sourceUrl:row.sourceUrl,original1961Folio:row.original1961Folio,
   occurrences:0,sourcePaths:new Set(),dates:[],publicScore:false});
  const g=grouped.get(key);
  if(g.part!==row.part)fail("SOURCE_SCORE_MULTIPLE_ROLES");
  g.occurrences++;g.sourcePaths.add(row.sourcePath);g.dates.push(row.date);
 }
 const reviewLeads=[...grouped.values()].map(x=>({
  ...x,sourcePaths:[...x.sourcePaths].sort(),dates:x.dates.sort(),
  distinctSourceCount:x.sourcePaths.size,
  reviewStatus:"FULL_TEXT_AND_PRINTED_NEUMES_PENDING",
  sourcePathsCount:x.sourcePaths.size,sourcePathsVerified:true,
  sourcePathsSet:null
 })).map(({sourcePathsSet,...rest})=>rest)
  .sort((a,b)=>b.occurrences-a.occurrences||a.scoreId.localeCompare(b.scoreId));
 let overlap=null;
 if(prior91Crosswalk){
  const prior=new Map(prior91Crosswalk.matchedReviewOccurrences.map(
   x=>[candidateKey(x),x]));
  const current=new Set(matches.map(candidateKey));
  const lost=[...prior.values()].filter(x=>!current.has(candidateKey(x)));
  overlap={previous91CorroboratedOccurrences:prior.size,
   retained91CorroboratedOccurrences:prior.size-lost.length,
   previouslyCorroboratedNotReproduced:lost.map(x=>({
    date:x.date,sourcePath:x.sourcePath,part:x.part,scoreId:x.scoreId
   }))};
 }
 return Object.freeze({
  schema:SELECTED_2026_FULL_SOURCE_CROSSWALK_SCHEMA,
  status:"ANNUAL_CALENDAR_SELECTED_1049_SOURCE_REVIEW_ONLY",
  provenance:{calendarResolver:"AO_RUNTIME_V8.resolver.resolveDay",
   year:2026,pinnedLatinSourceRef:fullSourceAudit.sourceRef,
   pinnedLatinSourceFiles:1049,archiveScoreCount:1195,
   calendarSelectedMasses:true,optionalRequiemsAndVotives:false},
  counters:{calendarDays:365,readyDays,
   distinctSelectedSourcePaths:distinctSources.size,
   selectedPathsInFullPinnedTree:representedSources.size,
   selectedUniqueCandidateOccurrences,
   corroboratedScoreOccurrences:matches.length,
   distinctCorroboratedScoreIds:matchedIds.size,
   missingSourcePaths:missing.size,
   dayStatuses:statusCounts,trackStatuses,
   approvedPublicScores:0},
  absentFromPinnedLatinTree:[...missing.values()]
   .sort((a,b)=>a.sourcePath.localeCompare(b.sourcePath)),
  comparisonWithPrior91:overlap,
  deduplicatedScoreReviewLeads:reviewLeads,
  matchedReviewOccurrences:matches,
  days,
  publication:{digitalScoresApproved:0,publicScores:0,
   fullScoreLatinAndNeumesCertified:false,
   chantPerformanceAtLocalParishInferred:false}
 });
}
