// Select the first 60 source-backed Proper scores for MUSICAL review, not
// publication: 20 Introits, 20 Offertories, 20 Communions. Every original
// GABC hash, selected 2026 Proper paragraph and pinned source must agree.
// No candidate may be turned into PUBLIC_APPROVED by this module.
import {createHash} from "node:crypto";
import {source1962ChantOpeningForMatch} from "./reader-proper-gabc-bulk-join.js";
export const PROPER_FIRST_60_REVIEW_SCHEMA=
 "ao-mass-1962-first-60-print-score-collation-v1";
const ROLES=Object.freeze({in:"INTROIT",of:"OFFERTORY",co:"COMMUNION"});
const keyFor=Object.freeze({in:"PROPER_INTROIT",of:"PROPER_OFFERTORY",
 co:"PROPER_COMMUNION"});
const targetPerRole=20;
const SHA64=/^[a-f0-9]{64}$/;
const validPath=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const fail=code=>{throw Error(code)};
const norm=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae")
 .replace(/œ/gi,"oe").replace(/j/gi,"i").replace(/\bcoel/g,"cael")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const tok=s=>norm(s).split(" ").filter(Boolean);
function prefix(a,b){
 let k=0;while(k<a.length&&k<b.length&&a[k]===b[k])k++;return k;
}
function selected2026Dates(){
 return Array.from({length:365},(_,i)=>
  new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));
}
export function build2026ProperFirst60ScoreReview({
 annualReport,fullSourceCrosswalk,archive
}={}){
 if(archive?.count!==1195||archive?.approvedDigitalScores!==0||
  annualReport?.schema!=="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1"||
  annualReport.year!==2026||annualReport.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
  annualReport.status!=="EDITORIAL_CANDIDATES_ONLY_NO_DIGITAL_NOTATION_PUBLICATION"||
  annualReport.counters?.civilDays!==365||
  !Array.isArray(annualReport.rows)||annualReport.rows.length!==365||
  annualReport.rows.some((d,i)=>d.date!==selected2026Dates()[i])||
  fullSourceCrosswalk?.schema!=="ao-schola-2026-selected-full-1049-source-gabc-review-v1"||
  fullSourceCrosswalk.status!=="ANNUAL_CALENDAR_SELECTED_1049_SOURCE_REVIEW_ONLY"||
  fullSourceCrosswalk.counters?.calendarDays!==365||
  fullSourceCrosswalk.counters?.approvedPublicScores!==0||
  fullSourceCrosswalk.publication?.publicScores!==0||
  !Array.isArray(fullSourceCrosswalk.matchedReviewOccurrences))
  fail("FIRST_60_REVIEW_SOURCE_SCOPE_INVALID");
 const daily=new Map(annualReport.rows.map(d=>[d.date,d]));
 const sourceScores=new Map();
 for(const [role,rows] of Object.entries(archive.byRole)){
  for(const score of rows){
   if(sourceScores.has(score.id)||score.officePart!==role||
    score.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
    !SHA64.test(score.sha256)||createHash("sha256").update(score.gabc,"utf8")
     .digest("hex")!==score.sha256)
    fail("FIRST_60_ORIGINAL_GABC_HASH_MISMATCH");
   sourceScores.set(score.id,score);
  }
 }
 if(sourceScores.size!==1195)fail("FIRST_60_SOURCE_ARCHIVE_INCOMPLETE");
 const grouped=new Map(),issues=[];
 for(const occurrence of fullSourceCrosswalk.matchedReviewOccurrences){
  if(!Object.hasOwn(ROLES,occurrence.part))continue;
  if(occurrence.status!=="UNIQUE_1962_SOURCE_AND_SCORE_HASH_REVIEW_ONLY"||
    occurrence.publicScore!==false||!validPath.test(occurrence.sourcePath)||
    !validPath.test(occurrence.sourceOwner??"")||
    !SHA64.test(occurrence.scoreGabcSha256))
    fail("FIRST_60_CROSSWALK_OCCURRENCE_NOT_SOURCE_CERTIFIED");
  const source=sourceScores.get(occurrence.scoreId);
  const day=daily.get(occurrence.date);
  if(!source||source.sha256!==occurrence.scoreGabcSha256||
    source.officePart!==occurrence.part||day?.status!=="SOURCE_MATCHED_FOR_REVIEW"||
    day.sourcePath!==occurrence.sourcePath||!day.englishReaderReady||
    !day.frenchReaderReady||!day.sourceExistsInPinnedLatinTree)
    fail("FIRST_60_SELECTED_PROPER_SCORE_IDENTITY_CHANGED");
  const selected=day.tracks?.filter(t=>t.part===occurrence.part&&
    t.role===ROLES[occurrence.part]&&
    t.status==="UNIQUE_SOURCE_TEXT_CANDIDATE"&&
    t.selectedParagraphId===occurrence.selectedParagraphId&&
    t.candidates.length===1&&t.candidates[0].scoreId===source.id&&
    t.candidates[0].sourceGabcSha256===source.sha256);
  if(selected?.length!==1||!selected[0]?.selectedLatin)
    fail("FIRST_60_SOURCE_PARAGRAPH_NOT_UNIQUELY_ANCHORED");
  const selectedLatin=selected[0].selectedLatin;
  const sourceWords=tok(source1962ChantOpeningForMatch(selectedLatin));
  const scoreWords=tok(source.normalizedScoreText);
  const matchedPrefix=prefix(sourceWords,scoreWords);
  if(matchedPrefix<4){
   issues.push({date:day.date,scoreId:source.id,status:"INCIPIT_PREFIX_DRIFT"});
   continue;
  }
  const key=source.id+"|"+source.sha256;
  let entry=grouped.get(key);
  if(!entry){
   entry={scoreId:source.id,part:source.officePart,
    sourceUrl:source.sourceUrl,sourceGabcSha256:source.sha256,
    original1961Page:source.gradualeRomanum1961Page,
    scoreLatinWordCount:scoreWords.length,scoreGabc:source.gabc,
    dates:new Set(),sourcePaths:new Set(),sourceOwners:new Set(),
    examples:[]};
   grouped.set(key,entry);
  }
  entry.dates.add(occurrence.date);
  entry.sourcePaths.add(occurrence.sourcePath);
  entry.sourceOwners.add(occurrence.sourceOwner);
  entry.examples.push({date:occurrence.date,principalId:occurrence.principalId,
   sourcePath:occurrence.sourcePath,sourceOwner:occurrence.sourceOwner,
   pinned1962SourceBlobSha:occurrence.pinned1962SourceBlobSha,
   sourceOwnerChain:occurrence.sourceOwnerChain,
   sourceSection:occurrence.sourceSection,
   sourceParagraphId:occurrence.selectedParagraphId,
   sourceLatin:selectedLatin,sourceOpeningWordCount:sourceWords.length,
   scoreOpeningWordsMatched:matchedPrefix,
   completeGabcLatinIsSelectedSourcePrefix:matchedPrefix===scoreWords.length,
   sourceBookFolio:source.gradualeRomanum1961Page});
 }
 const byPart={in:[],of:[],co:[]};
 for(const entry of grouped.values()){
  const best=entry.examples.sort((a,b)=>
   b.scoreOpeningWordsMatched-a.scoreOpeningWordsMatched||
   a.date.localeCompare(b.date))[0];
  const candidate={schema:"ao-mass-print-1961-review-candidate-v1",
   scoreId:entry.scoreId,part:entry.part,
   selectionKey:keyFor[entry.part],settingId:"GR1961_"+entry.scoreId.replace("GREGOBASE-",""),
   sourceUrl:entry.sourceUrl,scoreGabcSha256:entry.sourceGabcSha256,
   original1961Page:entry.original1961Page,
   scoreLatinWordCount:entry.scoreLatinWordCount,
   occurrences:entry.dates.size,
   dates:[...entry.dates].sort(),
   sourcePaths:[...entry.sourcePaths].sort(),
   sourceOwners:[...entry.sourceOwners].sort(),
   representative:best,
   scoreGabc:entry.scoreGabc,
   screen:{matchedOpeningWords:best.scoreOpeningWordsMatched,
    scoreTextFullyPrefixMatched:best.completeGabcLatinIsSelectedSourcePrefix,
    // Bounded check ONLY: the source may have a separate verse/Gloria
    // that the printed antiphon score does not reproduce.
    result:"SELECTED_1962_SOURCE_OPENING_AGREES_NOT_FULL_SCORE_CERTIFICATE"},
   review:{original1961PrintedFolioLocated:false,
    allNotePitchesVerified:false,
    allNeumeShapesVerified:false,
    fullSyllableUnderlayVerified:false,
    divisionAndRhythmMarksVerified:false,
    1962UsageVariantCertified:false,
    originalPrintStaffSystemCollationComplete:false,
    exactLiveBlockAndCueOwnershipCertified:false,
    finalUserApproval:false},
   publication:"EDITORIAL_HOLD_NOT_PUBLIC",
   approvedForMassReader:false,
   approvedForLocalScholaPerformance:false};
  byPart[entry.part].push(candidate);
 }
 const sorted=list=>list.sort((a,b)=>
  b.occurrences-a.occurrences||
  b.screen.matchedOpeningWords-a.screen.matchedOpeningWords||
  Number(a.scoreId.split("-")[1])-Number(b.scoreId.split("-")[1]));
 const candidates=[];
 for(const role of ["in","of","co"]){
  sorted(byPart[role]);
  if(byPart[role].length<targetPerRole)
   fail("FIRST_60_INSUFFICIENT_SOURCE_CANDIDATES_"+role);
  candidates.push(...byPart[role].slice(0,targetPerRole));
 }
 return Object.freeze({
  schema:PROPER_FIRST_60_REVIEW_SCHEMA,
  status:"FIRST_60_EDITORS_PRINT_REVIEW_NOT_MUSIC_APPROVAL",
  sourceScope:"ACTUAL_2026_SELECTED_MASSES_AND_SHA_AUTHENTICATED_1049_LATIN_SOURCES",
  sourceCorpusScores:1195,
  batch:{candidates:candidates.length,quotaByPart:{in:20,of:20,co:20},
   distinctScoreIds:new Set(candidates.map(x=>x.scoreId)).size,
   selectedOccurrenceCount:candidates.reduce((n,x)=>n+x.occurrences,0),
   sourceReviewPool:{in:byPart.in.length,of:byPart.of.length,
    co:byPart.co.length},unmatchedOpeningExceptions:issues.length},
  candidateSourceOpeningIssues:issues,
  candidates,
  publication:{publicScores:0,autoPromotion:false,
   automaticMusicApproval:false,localScholaSelectionInferred:false,
   needIndependentOriginal1961PrintedNeumeReview:true,
   needExactLiveParagraphAnchorAndSettingSelection:true}
 });
}
