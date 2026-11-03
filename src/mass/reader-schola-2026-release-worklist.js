// Annual source-evidence -> MUSICAL EDITORIAL packet. No publication.
// Preserve independent 60 Introit/Offertory/Communion dossier in PR #2309;
// the batch selected here is the complementary 24 Gradual/Alleluia scores.
// Reuse 1,195 immutable GABC records, 365 selected Masses, 1,049 pinned Latin
// witnesses and the pre-Gospel original-source review. Never infer a setting.
export const SCHOLA_2026_RELEASE_WORKLIST_SCHEMA=
 "ao-schola-2026-consolidated-musical-verification-v1";
const FAMILY=Object.freeze(["in","gr","al","tr","of","co"]);
const PREGOSPEL_BATCH_FAMILIES=Object.freeze(["gr","al"]);
const SOURCE_PATH=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const HEX64=/^[a-f0-9]{64}$/;
const SCORE_ID=/^GREGOBASE-\d+$/;
const error=(code)=>{throw Error(code)};
const validDate=x=>/^\d{4}-\d\d-\d\d$/.test(x);
const keyOf=(id,sha)=>id+"|"+sha;
function expectedDates(){
 return Array.from({length:365},(_,i)=>
  new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));
}
function verifyLedger(full,pre,annual,archive){
 if(full?.schema!=="ao-schola-2026-selected-full-1049-source-gabc-review-v1"||
    full?.counters?.calendarDays!==365||
    full?.counters?.approvedPublicScores!==0||
    full?.provenance?.pinnedLatinSourceFiles!==1049||
    !Array.isArray(full?.matchedReviewOccurrences)||
    pre?.schema!=="ao-schola-2026-pregospel-selected-pinned-latin-editorial-queue-v1"||
    pre?.counters?.daysChecked!==365||
    pre?.counters?.publicScores!==0||
    !Array.isArray(pre?.records)||
    pre.records.length!==365||
    annual?.schema!=="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1"||
    annual?.year!==2026||
    annual?.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
    annual?.counters?.civilDays!==365||
    !Array.isArray(annual?.rows)||annual.rows.length!==365||
    pre.records.some((row,i)=>row.date!==expectedDates()[i])||
    annual.rows.some((row,i)=>row.date!==expectedDates()[i])||
    archive?.schema!=="ao-mass-1961-full-gabc-source-index-v1"||
    archive?.count!==1195||archive.approvedDigitalScores!==0)
    error("MUSICAL_REVIEW_SOURCE_AUTHORITY_INVALID");
}
function sourceArchive(archive){
 const byScore=new Map();
 for(const [part,records] of Object.entries(archive.byRole??{})){
  if(!FAMILY.includes(part)||!Array.isArray(records))error("GABC_PART_INVALID");
  for(const x of records){
   if(!SCORE_ID.test(x.id)||!HEX64.test(x.sha256)||
      x.officePart!==part||x.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
      typeof x.gabc!=="string"||!x.gabc.includes("(::)")||
      !x.gabc.trim().startsWith("(")||byScore.has(x.id))
    error("GABC_ARCHIVE_ITEM_INVALID");
   byScore.set(x.id,x);
  }
 }
 if(byScore.size!==1195)error("GABC_ARCHIVE_CENSUS_INVALID");
 return byScore;
}
function selectedArchiveCandidate(byScore,{id,hash,part}){
 if(!SCORE_ID.test(id)||!HEX64.test(hash)||!FAMILY.includes(part))
  error("SELECTED_SCORE_FORMAT_INVALID");
 const ref=byScore.get(id);
 if(!ref||ref.sha256!==hash||ref.officePart!==part)
  error("SELECTED_SCORE_ORIGINAL_HASH_ROLE_MISMATCH");
 return ref;
}
const trackOf={in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA_TRACT_SEQUENCE",
 tr:"ALLELUIA_TRACT_SEQUENCE",of:"OFFERTORY",co:"COMMUNION"};
export function buildSelected2026ScoreVerificationWorklist({
 fullSourceCrosswalk,preGospelReview,annualReport,archive,
 perFamily=12
}={}){
 verifyLedger(fullSourceCrosswalk,preGospelReview,annualReport,archive);
 if(!Number.isInteger(perFamily)||perFamily<1||perFamily>50)
  error("INVALID_MUSICAL_BATCH_FAMILY_QUOTA");
 const byScore=sourceArchive(archive),yearByDate=new Map(
  annualReport.rows.map(r=>[r.date,r]));
 const ledger=new Map(),seenOccurrences=new Set();
 function add({scoreId,hash,part,date,sourcePath,sourceOwner,sourceSha,
   sourceSection,selectedParagraphId=null,latinOpening=null,evidenceFamily}){
  const original=selectedArchiveCandidate(byScore,{id:scoreId,hash,part});
  if(!validDate(date)||!yearByDate.has(date)||!SOURCE_PATH.test(sourcePath)||
     !SOURCE_PATH.test(sourceOwner)||!sourceSection||
     !/^[a-f0-9]{40}$/.test(sourceSha))
    error("SELECTED_SOURCE_OCCURRENCE_IDENTITY_INVALID");
  const day=yearByDate.get(date);
  if(day.status!=="SOURCE_MATCHED_FOR_REVIEW"||
     day.sourcePath!==sourcePath)error("MUSICAL_QUEUE_CALENDAR_SOURCE_DRIFT");
  const occurrenceKey=[date,sourcePath,part,scoreId,sourceSection].join("|");
  if(seenOccurrences.has(occurrenceKey))error("DUPLICATE_SCORE_SOURCE_OCCURRENCE");
  seenOccurrences.add(occurrenceKey);
  const scoreKey=keyOf(scoreId,hash),current=ledger.get(scoreKey)??{
   scoreId,scoreGabcSha256:hash,part,
   printed1961Folio:original.gradualeRomanum1961Page??null,
   sourceUrl:original.sourceUrl,
   scoreSourceEdition:original.sourceEditionId,
   scoreGabcArchiveReleaseStatus:original.releaseStatus,
   occurrences:[],sourceOwners:new Set(),selectedSourcePaths:new Set(),
   dates:new Set(),sourceFamilies:new Set()
  };
  current.occurrences.push({
   date,principalId:day.principalId,sourcePath,sourceOwner,
   sourceSha,sourceSection,selectedParagraphId,
   latinOpening:String(latinOpening??"").slice(0,260),evidenceFamily,
   readerBlockCueCertification:false,complete1962LatinScoreParity:false,
   printedMusicalNeumeComparison:false
  });
  current.sourceOwners.add(sourceOwner);
  current.selectedSourcePaths.add(sourcePath);
  current.dates.add(date);current.sourceFamilies.add(evidenceFamily);
  ledger.set(scoreKey,current);
 }
 const full=fullSourceCrosswalk;
 if(full.matchedReviewOccurrences.length!==full.counters.corroboratedScoreOccurrences)
  error("FULL_1049_OCCURRENCE_CENSUS_DRIFT");
 for(const x of full.matchedReviewOccurrences){
  if(x.status!=="UNIQUE_1962_SOURCE_AND_SCORE_HASH_REVIEW_ONLY"||
     x.publicScore!==false||x.fullLatinTextVerified!==false||
     x.printedNeumesVerified!==false||
     !["in","of","co"].includes(x.part)||trackOf[x.part]!==x.track||
     !x.selectedParagraphId)error("FULL_SELECTED_PROPER_NOT_REVIEW_SAFE");
  const year=yearByDate.get(x.date),match=year?.tracks?.filter(t=>
   t.role===x.track&&t.part===x.part&&
   t.selectedParagraphId===x.selectedParagraphId&&
   t.candidates?.some(c=>c.scoreId===x.scoreId&&
     c.sourceGabcSha256===x.scoreGabcSha256))??[];
  if(match.length!==1)error("FULL_SOURCE_TO_DAY_SELECTED_TEXT_NOT_UNIQUE");
  add({scoreId:x.scoreId,hash:x.scoreGabcSha256,part:x.part,date:x.date,
   sourcePath:x.sourcePath,sourceOwner:x.sourceOwner??x.sourcePath,
   sourceSha:x.pinned1962SourceBlobSha,
   sourceSection:x.sourceSection,
   selectedParagraphId:x.selectedParagraphId,latinOpening:match[0].selectedLatin,
   evidenceFamily:"PINNED_1049_SOURCE_AND_SELECTED_PARAGRAPH"});
 }
 const pre=preGospelReview;
 let preSourceCandidateOccurrences=0;
 for(const row of pre.records){
  if(row.status!=="SELECTED_SOURCE_ROLE_CANDIDATES")continue;
  for(const x of row.pieces??[]){
   if(x.status!=="UNIQUE_SOURCE_TEXT_CANDIDATE")continue;
   preSourceCandidateOccurrences++;
   if(x.publicScore!==false||x.readerParagraphSplitCertified!==false||
      !["gr","al","tr"].includes(x.part)||
      x.scoreIds?.length!==1||x.scoreGabcSha256?.length!==1)
    error("PREGOSPEL_UNREVIEWED_MUSIC_MATCH");
   add({scoreId:x.scoreIds[0],hash:x.scoreGabcSha256[0],part:x.part,
    date:row.date,sourcePath:row.sourcePath,sourceOwner:x.sourceOwner,
    sourceSha:x.sourceSha,sourceSection:x.sourceSection,
    latinOpening:x.opening,evidenceFamily:"ORIGINAL_PINNED_PRE_GOSPEL_SECTION"});
  }
 }
 if(preSourceCandidateOccurrences!==pre.counters.uniqueTextCandidateOccurrences)
  error("PREGOSPEL_UNIQUE_SOURCE_CANDIDATE_CENSUS_DRIFT");
 const counters={};
 for(const part of FAMILY)counters[part]={distinctScores:0,sourceOccurrences:0};
 const allLeads=[...ledger.values()].map(x=>{
  counters[x.part].distinctScores++;counters[x.part].sourceOccurrences+=x.occurrences.length;
  const uses=x.occurrences.sort((a,b)=>a.date.localeCompare(b.date)||
   a.sourcePath.localeCompare(b.sourcePath));
  return Object.freeze({
   scoreId:x.scoreId,scoreGabcSha256:x.scoreGabcSha256,part:x.part,
   printed1961Folio:x.printed1961Folio,sourceUrl:x.sourceUrl,
   originalSourceEdition:x.scoreSourceEdition,sourceArchiveStatus:x.scoreGabcArchiveReleaseStatus,
   sourceOccurrenceCount:uses.length,distinctSelectedDays:x.dates.size,
   distinctSelectedSources:x.selectedSourcePaths.size,
   scoreSourceOwners:[...x.sourceOwners].sort(),
   selectedSourcePaths:[...x.selectedSourcePaths].sort(),
   evidenceFamilies:[...x.sourceFamilies].sort(),occurrences:uses,
   status:"ORIGINAL_1962_LATIN_SOURCE_CORROBORATED_MUSIC_REVIEW_REQUIRED",
   publicationBlockers:Object.freeze([
    "FULL_SCORE_LATIN_SYLLABLE_ALIGNMENT_UNVERIFIED",
    "PRINTED_1961_NEUMES_AND_PITCHES_NOT_COMPARED",
    "1962_VARIANT_AND_SOURCE_SEGMENTATION_NOT_APPROVED",
    "EXACT_READER_BLOCK_CUE_AND_MUSIC_SETTING_NOT_CERTIFIED",
    "HUMAN_MUSICAL_EDITORIAL_SIGN_OFF_REQUIRED"
   ]),
   fullScoreLatinSyllableParity:false,printedNeumesAndPitchesVerified:false,
   exactReaderCueBound:false,editorialApproved:false,publicScore:false
  });
 }).sort((a,b)=>b.sourceOccurrenceCount-a.sourceOccurrenceCount||
    b.distinctSelectedSources-a.distinctSelectedSources||
    a.scoreId.localeCompare(b.scoreId));
 const quota={},batch=[];
 for(const part of PREGOSPEL_BATCH_FAMILIES){
  const candidates=allLeads.filter(x=>x.part===part).slice(0,perFamily);
  quota[part]={requested:perFamily,selected:candidates.length,
   candidatesAvailable:counters[part].distinctScores};
  batch.push(...candidates);
 }
 const uniqueScoreCount=Object.values(counters).reduce((n,v)=>n+v.distinctScores,0);
 const totalOccurrences=Object.values(counters).reduce((n,v)=>n+v.sourceOccurrences,0);
 if(uniqueScoreCount!==allLeads.length||
    totalOccurrences!==full.matchedReviewOccurrences.length+
     preSourceCandidateOccurrences)
  error("CONSOLIDATED_MUSICAL_REVIEW_CENSUS_DRIFT");
 const batchLookup=new Set(batch.map(x=>x.scoreId));
 if(batchLookup.size!==batch.length)error("MUSICAL_BATCH_DUPLICATE_SCORE_ID");
 return Object.freeze({
  schema:SCHOLA_2026_RELEASE_WORKLIST_SCHEMA,
  status:"EDITORIAL_SCORE_VERIFICATION_ONLY_NOT_PUBLICATION",
  sourceReportDateYear:2026,
  provenance:{originalGabcCorpusCount:1195,
   pinned1962SourceCount:1049,selectedCalendarDays:365,
   independentReviewKinds:["FULL_PINNED_1049","PRE_GOSPEL_SECTION"],
   noMassSettingInferred:true},
  counters:{uniqueScoreCandidates:uniqueScoreCount,sourceScoreOccurrences:totalOccurrences,
   byFamily:counters,preGospelBatchScoreCount:batch.length,
   preGospelBatchFamilyQuotas:quota,
   unresolvedSelectedTractSourceScores:counters.tr.distinctScores===0,
   selectedCalendarReadyDays:full.counters.readyDays,
   blockedReaderDays:annualReport.counters.EN_READER_HOLD??0,
   unresolvedPreGospelOwnershipDays:pre.counters.sourceOwnershipHolds??0,
   sourcePathsOutsidePinnedFullTree:full.counters.missingSourcePaths,
   newPublicScores:0},
  allReviewLeads:allLeads,
  preGospelBatch:batch.map((lead,index)=>({
    batchNumber:2,queuePosition:index+1,...lead,
    originalGabc:byScore.get(lead.scoreId).gabc,
    originalGabcSha256:lead.scoreGabcSha256,
    verificationDecision:"PENDING"
  })),
  exceptions:{selectedTractsWithoutCorroboratedScore:true,
   missingSelectedSourcePaths:full.absentFromPinnedLatinTree,
   readerDaysRequiringSourceCompletion:annualReport.rows.filter(x=>
      x.status!=="SOURCE_MATCHED_FOR_REVIEW").map(x=>({
      date:x.date,sourcePath:x.sourcePath,status:x.status
   })),
   preGospelDaysRequiringSourceBoundary:pre.records.filter(x=>
      x.status==="SOURCE_TEXT_RESEARCH_ONLY"||
      x.status==="SELECTED_ROLE_UNRESOLVED").map(x=>({
      date:x.date,sourcePath:x.sourcePath,status:x.status
   }))},
  publication:{digitalScorePublished:0,
   visualRenderingClaimed:false,readerCardsModified:false,
   editorialReviewRequired:true}
 });
}
