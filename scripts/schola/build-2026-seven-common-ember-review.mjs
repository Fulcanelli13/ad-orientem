// Review 7 historic Common witnesses against the actual appointed 2026 Latin.
// Does not import obsolete files, resolve a 1962 digital path alias or certify music.
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

export const SCHEMA="ao-schola-2026-seven-commons-and-pentecost-ember-review-v1";
const EVIDENCE_SCHEMA="ao-schola-2026-seven-common-historical-section-evidence-v1";
const OWNER_SCHEMA="ao-schola-2026-pregospel-original-owner-clusters-v1";
const YEAR_SCHEMA="ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1";
const CLOSEOUT_SCHEMA="ao-schola-2026-source-exceptions-closeout-v1";
const INVENTORY_SCHEMA="ao-mass-music-1962-pinned-source-universe-v1";
const PIN="ad8783641455bae38a8eb5782b34241a7b3ff2ef";
const EXPECTED=new Map([["C5",19],["C4",9],["C6a",7],["C2a",6],
 ["C4a",5],["C5b",5],["C7a",5]]);
const HISTORICAL_SHAS=new Map([
 ["C5","47a2c9cc6ab23e645d4978492417329f461d27bf"],
 ["C4","6e1e8e850a71aae0d7311319ad2bb4e9e8cc5339"],
 ["C6a","d015c06171ed64d4132b1debf30356439594c3ec"],
 ["C2a","d846e08381e3df04174ee3e988af4b91be81ed39"],
 ["C4a","f9997e3d330bac317f394b6fcb8b0fb97f606bd3"],
 ["C5b","c7180dcbf0a53f02c1e67f1f484f8ebf92a9dbe3"],
 ["C7a","b9d309afbb26ef824d8a4d135dc047ea7cd47e83"]
]);
const fail=code=>{throw Error("SCHOLA_SEVEN_COMMONS_"+code)};
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const isoDays=()=>Array.from({length:365},(_,i)=>
 new Date(Date.UTC(2026,0,i+1)).toISOString().slice(0,10));

export function buildSevenCommon2026Review({evidence,owner,annual,closeout,inventory}={}){
 if(evidence?.schema!==EVIDENCE_SCHEMA||
    evidence.immutableSourceCommit!==PIN||
    evidence.sourceBoundary?.includes("NOT in the original pinned 1049")!==true||
    evidence.acceptance?.expectedCommonFamilies!==7||
    evidence.acceptance?.expectedDatedCases!==56||
    evidence.acceptance?.expectedHistoricalIncipitConcordances!==29||
    evidence.acceptance?.expectedLegacyOpeningMismatches!==27||
    evidence.acceptance?.approvedProperScores!==0||
    evidence.acceptance?.sourceAliasesApproved!==0||
    evidence.acceptance?.readerCodeModified!==false||
    !Array.isArray(evidence.witnesses)||evidence.witnesses.length!==7)
  fail("EVIDENCE_INVALID");
 if(owner?.schema!==OWNER_SCHEMA||owner.counts?.datedPreGospelHolds!==128||
    owner.counts?.distinctSelectedSourcePaths!==115||
    owner.counts?.originalOwnerReviewGroups!==52||
    owner.counts?.groupsWithMultipleSelectedPaths!==13||
    owner.counts?.exactFullSelectedLatinReviewClusters!==36||
    owner.publication?.sourceAliasApproved!==false||
    owner.publication?.publicScore!==false||
    !Array.isArray(owner.groups))fail("OWNER_BASELINE_INVALID");
 if(annual?.schema!==YEAR_SCHEMA||annual.year!==2026||
    annual.sourceAuthority!=="AO_RUNTIME_V8.resolver.resolveDay"||
    annual.counters?.civilDays!==365||
    !Array.isArray(annual.rows)||annual.rows.length!==365||
    annual.rows.some((x,i)=>x.date!==isoDays()[i]))
  fail("ANNUAL_SOURCE_CHANGED");
 if(closeout?.schema!==CLOSEOUT_SCHEMA||
    closeout.counts?.selectedProperDays!==365||
    closeout.counts?.preGospelDatedOwnershipHolds!==128||
    closeout.counts?.separateSelectedRoleHolds!==1||
    closeout.counts?.newApprovedScores!==0||
    closeout.publication?.scorePromotionPermitted!==false)
  fail("CLOSEOUT_SOURCE_CHANGED");
 if(inventory?.schema!==INVENTORY_SCHEMA||inventory.sourceRef!==PIN||
    inventory.sourceFiles?.length!==1049)fail("PINNED_SOURCE_TREE_CHANGED");

 const inventoryMap=new Map(inventory.sourceFiles.map(x=>[x.path,x]));
 if(inventoryMap.size!==1049)fail("PINNED_SOURCE_DUPLICATES");
 const annualMap=new Map(annual.rows.map(x=>[x.date,x]));
 if(annualMap.size!==365)fail("ANNUAL_DATES_DUPLICATED");
 const seen=new Set(),seenDates=new Set(),families=[],allCases=[];
 let matchingHistoricalGradualOpenings=0,selectedVariantOpeningDifferences=0;
 for(const witness of evidence.witnesses){
  const path=witness.originalCommonPath;
  const id=path?.split("/")[1],expected=EXPECTED.get(id);
  const g=owner.groups.find(x=>x.groupKey==="RULE_CANDIDATE:"+path);
  if(!expected||seen.has(id)||path!=="Commune/"+id||
     witness.expected2026DatedCases!==expected||!g||
     g.datedHolds!==expected||g.distinctSelectedSourcePaths!==expected||
     g.sourcePaths?.length!==expected||g.dates?.length!==expected||
     witness.originalHistoricalBlobPath!=="obsolete/missa/Latin/"+path+".txt"||
     !/^[a-f0-9]{40}$/.test(witness.originalHistoricalGitBlobSha)||
     witness.originalHistoricalGitBlobSha!==HISTORICAL_SHAS.get(id)||
     typeof witness.historicalGradualOpening!=="string"||
     norm(witness.historicalGradualOpening).split(" ").length<3||
     !witness.historicalSectionsPresent?.includes("Graduale")||
     witness.printed1962RoleAndVariantCertified!==false||
     witness.exactFullLatinAndUnderlayCertified!==false||
     witness.acceptedReaderSourceAlias!==null||
     inventoryMap.has(path))
   fail("HISTORICAL_WITNESS_OR_FAMILY_DRIFT");
  seen.add(id);
  let aligned=0,different=0;
  const cases=[];
  for(const date of g.dates){
   if(seenDates.has(date))fail("CROSS_FAMILY_DATE_DUPLICATE");
   seenDates.add(date);
   const row=annualMap.get(date);
   if(!row||row.sourcePath===path||
      !g.sourcePaths.includes(row.sourcePath)||
      row.status!=="SOURCE_MATCHED_FOR_REVIEW"||
      typeof row.selectedGradualLatin!=="string"||
      norm(row.selectedGradualLatin).length<20)
     fail("SELECTED_DAY_NOT_CORROBORATED");
   const selected=norm(row.selectedGradualLatin);
   const archiveOpening=norm(witness.historicalGradualOpening);
   const position=selected.indexOf(archiveOpening);
   // A line at the start of the selected Gradual is *textual* corroboration only.
   // Later occurrences may be Alleluia/Tract and must NOT count as the Gradual.
   const matches=position>=0&&position<=35;
   if(matches){aligned++;matchingHistoricalGradualOpenings++}
   else {different++;selectedVariantOpeningDifferences++}
   const d={date,selectedSourcePath:row.sourcePath,
    selectedPrincipalId:row.principalId??null,
    selectedLatinOpening:row.selectedGradualLatin.split(/\r?\n/)
      .map(x=>x.trim()).filter(x=>norm(x).split(" ").length>=4)
      .slice(0,2).join(" | ").slice(0,200),
    originalHistoricalCommonPath:path,
    originalHistoricalBlobSha:witness.originalHistoricalGitBlobSha,
    archivalGradualOpening:witness.historicalGradualOpening,
    openingDisposition:matches?
     "HISTORICAL_GRADUAL_OPENING_TEXT_ALIGNS_RESEARCH_ONLY":
     "SELECTED_OPENING_DIFFERS_FROM_HISTORICAL_GRADUAL_MUST_TRACE_1962_VARIANT",
    printed1962SectionCertified:false,
    GregorianMelodyCertified:false,publicScoreApproved:false};
   cases.push(d);allCases.push(d);
  }
  families.push({historicalCommon:path,historicalDescription:witness.historicalDescription,
   historicalBlobSha:witness.originalHistoricalGitBlobSha,
   selectedDates:cases.length,
   incipitAligned:aligned,incipitDifferent:different,
   dateCases:cases,
   action:"REVIEW_PRINTED_1962_APPOINTED_COMMON_VARIANT_AND_COMPLETE_GREGORIAN_ROLE",
   original1962OwnerApproved:false,digitalSourceAliasApproved:false,
   scorePublicationApproved:false});
 }
 if(seen.size!==7||seenDates.size!==56||
    matchingHistoricalGradualOpenings!==29||selectedVariantOpeningDifferences!==27)
  fail("ACTUAL_COMMON_INICIPIT_CENSUS_CHANGED");
 const ember=evidence.independentPentecostEmber;
 const eDay=annualMap.get(ember?.date),eHold=closeout.separateRoleHolds?.[0];
 if(eDay?.date!=="2026-05-27"||
    eDay.sourcePath!=="Tempora/Pasc7-3"||
    ember.selectedSourcePath!==eDay.sourcePath||
    eHold?.date!==eDay.date||eHold.sourcePath!==eDay.sourcePath||
    !Array.isArray(eHold.holds)||
    !eHold.holds.some(x=>x.code==="PASCHAL_VERSE_COUNT_UNVERIFIED")||
    !eHold.holds.some(x=>x.code==="SELECTED_SEQUENCE_OUTSIDE_1195_PROPER_SCORE_CORPUS")||
    ember.productionReaderMutation!==false||ember.certifiedPublicScores!==0||
    norm(eDay.selectedGradualLatin).includes("veni sancte spiritus reple")!==true||
    norm(eDay.selectedSequenceLatin).startsWith("veni sancte spiritus")!==true||
    inventoryMap.get(ember.selectedSourcePath)?.sha!==ember.sourcePinSha||
    inventoryMap.get(ember.sequenceDonorPath)?.sha!==ember.sequenceDonorPinSha)
   fail("PENTECOST_EMBER_SOURCE_OR_SEQUENCE_DRIFT");
 const orders=["LectioL1","GradualeL1","OratioL1","Oratio","Lectio",
               "Graduale","Sequentia","Evangelium"];
 if(!Array.isArray(ember.order)||
    ember.order.map(x=>x.section).join("|")!==orders.join("|")||
    ember.order[1].type!=="FIRST_LESSON_ALLELUIA"||
    ember.order[5].type!=="FINAL_ALLELUIA_WITH_GENUFLECTION"||
    ember.order[6].type!=="PENTECOST_SEQUENCE_INHERITED")
   fail("EMBERTIDE_CUE_ORDER_NOT_PROVEN");

 return {schema:SCHEMA,year:2026,
  authority:{actualDayResolver:"AO_RUNTIME_V8.resolver.resolveDay",
   pinnedLatinSourceCommit:PIN,pinnedSourceFiles:1049,
   historicalWitnessAuthority:"OBSOLETE_GIT_BLOBS_TEXT_ONLY",
   printed1962CommonDecision:"PENDING",
   original1961GabcScoreDecision:"PENDING"},
  counts:{sourceCandidateFamilies:7,datedCases:56,
   historicalGradualTextAlignments:matchingHistoricalGradualOpenings,
   selectedVersusHistoricalOpeningDifferences:selectedVariantOpeningDifferences,
   remaining2026PreGospelHolds:128,
   independentPentecostEmberRoleCases:1,
   sourceAliasesApproved:0,properScoresApproved:0},
  families,allCases,
  pentecostEmber:{date:eDay.date,sourcePath:eDay.sourcePath,
   sourceBlobSha:ember.sourcePinSha,
   sequenceDonorPath:ember.sequenceDonorPath,
   sequenceDonorSha:ember.sequenceDonorPinSha,
   originalSectionOrder:ember.order,
   selectedFinalAlleluiaLatinReadyForResearch:true,
   selectedSequenceLatinReadyForResearch:true,
   previouslyReportedHolds:eHold.holds,
   allMusicNotatedAndCertified:false,publicScore:false,
   explanation:"The after-first-lesson GradualeL1 is not a second verse of final Graduale. Sequence is independently inherited; do not infer source GABC from another track."},
  publication:{noNewPublicScores:true,noRuntimeChanges:true,
   archivalAliasesProhibited:true,full1961NotationCollationStillRequired:true}
 };
}

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const outDir=resolve(root,".tmp/schola-1962-selected-annual");
const load=async p=>JSON.parse(await readFile(resolve(root,p),"utf8"));
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=buildSevenCommon2026Review({
  evidence:await load("data/research/schola-2026-seven-common-historical-section-evidence.v1.json"),
  owner:await load(".tmp/schola-1962-selected-annual/2026-schola-pregospel-original-owner-clusters.json"),
  annual:await load(".tmp/schola-1962-selected-annual/2026-selected-gabc-coverage.json"),
  closeout:await load(".tmp/schola-1962-selected-annual/2026-schola-closeout-source-exceptions.json"),
  inventory:await load("data/research/mass-music-1962-pinned-full-source-universe.v1.json")
 });
 await writeFile(resolve(outDir,"2026-schola-seven-common-and-ember-source-review.json"),
   JSON.stringify(report,null,2)+"\n");
 console.log("SCHOLA_SEVEN_COMMON_AND_EMBER "+JSON.stringify({
  counts:report.counts,commonFamilies:report.families.map(f=>({
   common:f.historicalCommon,dates:f.selectedDates,
   aligned:f.incipitAligned,different:f.incipitDifferent
  })),ember:report.pentecostEmber.date
 }));
}
