// Reconcile exactly 27 dated historical Common-opening discrepancies from the
// existing successful 2026 365-day Schola audit. No 1962 alias or GABC approval.
import {createHash} from "node:crypto";
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

export const SCHEMA="ao-schola-2026-27-variant-source-text-review-v1";
const MANIFEST="ao-schola-2026-27-variant-selected-source-disposition-v1";
const PREVIOUS="ao-schola-2026-seven-commons-and-pentecost-ember-review-v1";
const ANNUAL="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1";
const INVENTORY="ao-mass-music-1962-pinned-source-universe-v1";
const PIN="ad8783641455bae38a8eb5782b34241a7b3ff2ef";
const SHAS=new Map([
 ["Commune/C5b","c7180dcbf0a53f02c1e67f1f484f8ebf92a9dbe3"],
 ["Commune/C6b","544159185864819596f85ce9912cb52e0bbf815f"],
 ["Commune/C2","3a7ff57f6c4f1da2fa61aef633cf6c0a3ea93ba9"],
 ["Commune/C4","6e1e8e850a71aae0d7311319ad2bb4e9e8cc5339"],
 ["Commune/C4c","32cbb833756b227293f889a2aa03640159ffdc0a"]
]);
const fail=c=>{throw Error("SCHOLA_27_VARIANTS_"+c)};
const norm=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae")
 .replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const fingerprint=s=>createHash("sha256").update(norm(s)).digest("hex");
const originalGroup=c=>c?.openingDisposition===
 "SELECTED_OPENING_DIFFERS_FROM_HISTORICAL_GRADUAL_MUST_TRACE_1962_VARIANT";

export function reconcile27SelectedVariants({manifest,prior,annual,inventory}={}){
 if(manifest?.schema!==MANIFEST||
    manifest.pinnedUpstream!=="DivinumOfficium/divinum-officium@"+PIN||
    manifest.boundaries?.previousMismatchDates!==27||
    manifest.boundaries?.newHistoricalTextCandidates!==23||
    manifest.boundaries?.unresolvedDateSelectionHolds!==4||
    manifest.boundaries?.dateSpecificExternalSourceConflicts!==2||
    manifest.boundaries?.uniqueCompleteSelectedLatinVariantsExpected!==10||
    manifest.boundaries?.sourceAliasesApproved!==0||
    manifest.boundaries?.properScoresApproved!==0||
    manifest.boundaries?.liveReaderChanges!==false||
    manifest.boundaries?.scoreFilesModified!==false||
    !Array.isArray(manifest.pinnedHistoricalTextCandidates)||
    manifest.pinnedHistoricalTextCandidates.length!==6||
    !Array.isArray(manifest.exactDateExternalDispositionHolds)||
    manifest.exactDateExternalDispositionHolds.length!==4)
   fail("MANIFEST_INVALID");
 if(prior?.schema!==PREVIOUS||prior.counts?.datedCases!==56||
    prior.counts?.selectedVersusHistoricalOpeningDifferences!==27||
    prior.counts?.historicalGradualTextAlignments!==29||
    prior.counts?.remaining2026PreGospelHolds!==128||
    prior.counts?.sourceAliasesApproved!==0||
    prior.counts?.properScoresApproved!==0||
    !Array.isArray(prior.allCases)||prior.allCases.length!==56)
   fail("PRIOR_SOURCE_REVIEW_INVALID");
 if(annual?.schema!==ANNUAL||annual.year!==2026||
    annual.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
    annual.counters?.civilDays!==365||
    !Array.isArray(annual.rows)||annual.rows.length!==365)
   fail("SELECTED_2026_ANNUAL_INVALID");
 if(inventory?.schema!==INVENTORY||inventory.sourceRef!==PIN||
    inventory.sourceFiles?.length!==1049)fail("PINNED_SOURCE_MANIFEST_INVALID");
 const missing=new Map(prior.allCases.filter(originalGroup).map(r=>[r.date,r]));
 if(missing.size!==27)fail("DUPLICATE_PRIOR_MISMATCH_DATE");
 const dates=new Map(annual.rows.map(r=>[r.date,r]));
 if(dates.size!==365)fail("ANNUAL_SELECTED_DATE_DUPLICATED");
 const pinned=new Set(inventory.sourceFiles.map(x=>x.path));
 if(pinned.size!==1049)fail("PINNED_SOURCE_FILE_DUPLICATED");
 const used=new Set(),rows=[],clusters=new Map();
 let proposedTextMatches=0,externalConflicts=0;
 const makeRow=(date,entry,disposition)=>{
  const prev=missing.get(date),r=dates.get(date);
  if(!prev||!r||r.status!=="SOURCE_MATCHED_FOR_REVIEW"||
     prev.selectedSourcePath!==r.sourcePath||
     prev.originalHistoricalCommonPath!==entry.oldRubricCue&&
       prev.originalHistoricalCommonPath!==entry.previousRubricCue||
     !r.selectedGradualLatin||norm(r.selectedGradualLatin).length<30||
     used.has(date))fail("DATED_SELECTED_SOURCE_NOT_IDENTICAL");
  used.add(date);
  const text=norm(r.selectedGradualLatin),sha=fingerprint(r.selectedGradualLatin);
  const c=clusters.get(sha)??{sha256:sha,
   normalizedSelectedTextPreview:text.slice(0,180),dates:[],
   sourcePaths:new Set(),originalRubricCues:new Set()};
  c.dates.push(date);c.sourcePaths.add(r.sourcePath);
  c.originalRubricCues.add(prev.originalHistoricalCommonPath);
  clusters.set(sha,c);
  const row={date,selectedSourcePath:r.sourcePath,
   selectedPrincipalId:r.principalId,previousRubricCue:prev.originalHistoricalCommonPath,
   selectedFullLatinSha256:sha,selectedFirstWords:text.slice(0,125),
   reviewDisposition:disposition,sourceOriginalSectionCandidate:null,
   original1962AppointedSourceCertified:false,
   original1961MelodicSettingCertified:false,publicScoreApproved:false};
  rows.push(row);
  return row;
 };
 for(const entry of manifest.pinnedHistoricalTextCandidates){
  const [path,section]=String(entry.proposedHistoricalSectionPath).split(":");
  if(!SHAS.has(path)||SHAS.get(path)!==entry.sourceGitBlobSha||
     !["Graduale","GradualeP"].includes(section)||
     !/^Commune\/C[0-9A-Za-z]+$/.test(entry.oldRubricCue)||
     !entry.dates?.length||!/^https:\/\//.test(entry.secondaryPrintedTextReference)||
     entry.sourceAuthorityStatus!=="HISTORICAL_SHA_VERIFIED_TEXT_OPENING_CANDIDATE_ONLY"||
     entry.appointed1962SectionCertified!==false||
     entry.original1961MelodyCertified!==false||
     entry.sourceAliasAuthorized!==false||
     pinned.has(path))
   fail("HISTORICAL_SOURCE_PROPOSAL_UNVERIFIED");
  for(const date of entry.dates){
   const r=makeRow(date,entry,"ALTERNATE_OBSOLETE_SECTION_TEXTUAL_MATCH_RESEARCH_ONLY");
   const sourceOpening=norm(entry.sourceOpening);
   if(sourceOpening.split(" ").length<4||
      norm(dates.get(date).selectedGradualLatin).indexOf(sourceOpening)>115||
      !norm(dates.get(date).selectedGradualLatin).includes(sourceOpening))
     fail("PROPOSED_HISTORICAL_OPENING_NOT_IN_SELECTED_2026_LATIN");
   r.sourceOriginalSectionCandidate=path+":"+section;
   r.sourceCandidateGitBlobSha=entry.sourceGitBlobSha;
   r.referenceUrl=entry.secondaryPrintedTextReference;
   r.liturgicalSourceFamily=entry.historicalCommonClassification;
   proposedTextMatches++;
  }
 }
 for(const entry of manifest.exactDateExternalDispositionHolds){
  if(!/^2026-\d\d-\d\d$/.test(entry.date)||
     !/^Commune\/C[0-9A-Za-z]+$/.test(entry.previousRubricCue)||
     !/^https:\/\//.test(entry.supportingReferenceUrl)||
     entry.appointed1962TextCertified!==false||
     entry.original1961ScoreCertified!==false||
     entry.automaticReaderChange!==false||
     !entry.note?.length)
   fail("SPECIAL_DATE_SOURCE_DISPOSITION_INVALID");
  const r=makeRow(entry.date,entry,entry.disposition);
  if(!norm(dates.get(entry.date).selectedGradualLatin).includes(norm(entry.selectedOpening)))
   fail("REVIEW_DATE_OPENING_CHANGED");
  if(entry.disposition==="DATED_1962_SECONDARY_PROPERS_CONFLICT_WITH_SELECTED_LATIN"){
   if(!["2026-04-13","2026-04-29"].includes(entry.date)||
      entry.comparisonExpectedOpening!=="Confitebuntur caeli"||
      entry.proposedSourceSection!=="GradualeP"||
      norm(dates.get(entry.date).selectedGradualLatin).includes(norm(entry.comparisonExpectedOpening)))
    fail("DATED_PASCHAL_SELECTION_CONFLICT_NOT_REAL");
   externalConflicts++;
  }else if(!["SAINT_PROPER_CUSTOM_PRE_GOSPEL_REQUIRES_DIRECT_1962_PRINT",
             "NAMED_1962_SAINT_PROPER_SECONDARY_CORROBORATION_NO_HISTORICAL_BLOB_ALIAS"]
             .includes(entry.disposition))fail("UNRECOGNIZED_SOURCE_DISPOSITION");
  r.secondarySourceComparisonUrl=entry.supportingReferenceUrl;
  r.comparisonExpectedOpening=entry.comparisonExpectedOpening;
  r.comparisonSection=entry.proposedSourceSection;
 }
 if(used.size!==27||proposedTextMatches!==23||externalConflicts!==2)
  fail("EXACT_27_DATED_DISPOSITIONS_CHANGED");
 const textGroups=[...clusters.values()].map(g=>({
  ...g,dates:g.dates.sort(),sourcePaths:[...g.sourcePaths].sort(),
  priorRubricCues:[...g.originalRubricCues].sort(),status:"FULL_SELECTED_LATIN_TEXT_MATCH_ONLY_NO_MELODY_ID"
 })).sort((a,b)=>b.dates.length-a.dates.length||
   a.sha256.localeCompare(b.sha256));
 if(textGroups.length!==10||
    textGroups.reduce((n,g)=>n+g.dates.length,0)!==27)
   fail("COMPLETE_LATIN_VARIANT_GROUPS_CHANGED");
 return {schema:SCHEMA,year:2026,
  authority:{actualSelectedMassAuthority:"AO_RUNTIME_V8.resolver.resolveDay",
   original1962PrintedBookVerification:"PENDING_BY_DATE",
   original1961ScoreVerification:"PENDING_BY_TRACK",
   historicalUpstreamCommit:PIN,
   noObsoleteSourceImported:true},
  counts:{datedHistoricalOpeningDifferences:27,exactSelectedLatinReviewGroups:10,
   alternateHistoricalSectionTextualCandidates:proposedTextMatches,
   remainingDateSpecificSourceHolds:27-proposedTextMatches,
   secondaryDated1962SelectedTextConflicts:externalConflicts,
   scoreApprovals:0,sourceAliasesApproved:0},
  sourceRows:rows.sort((a,b)=>a.date.localeCompare(b.date)),
  completeSelectedLatinGroups:textGroups,
  publication:{publicGregorianScores:0,
   newSourceAliases:0,readerRuntimeMutations:false,
   pitchNeumeAndUnderlayVerified:false}
 };
}

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dir=resolve(root,".tmp/schola-1962-selected-annual");
const load=async s=>JSON.parse(await readFile(resolve(root,s),"utf8"));
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=reconcile27SelectedVariants({
  manifest:await load("data/research/schola-2026-27-selected-variant-owner-candidates.v1.json"),
  prior:await load(".tmp/schola-1962-selected-annual/2026-schola-seven-common-and-ember-source-review.json"),
  annual:await load(".tmp/schola-1962-selected-annual/2026-selected-gabc-coverage.json"),
  inventory:await load("data/research/mass-music-1962-pinned-full-source-universe.v1.json")
 });
 await writeFile(resolve(dir,"2026-schola-27-variant-owner-candidates.json"),
   JSON.stringify(result,null,2)+"\n");
 console.log("SCHOLA_27_SELECTED_SOURCE_ALTERNATES "+JSON.stringify(result.counts));
}
