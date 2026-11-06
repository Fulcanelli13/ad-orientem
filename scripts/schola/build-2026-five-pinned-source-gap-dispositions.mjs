// Exact five-path 2026 Schola disposition from ALREADY GENERATED pinned
// source and selected-day evidence. No source download, aliases or score import.
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

export const SCHOLA_FIVE_PATH_EVIDENCE_SCHEMA=
 "ao-schola-2026-five-path-dated-disposition-v1";
const SOURCE_EVIDENCE_SCHEMA="ao-schola-2026-five-pinned-source-gap-evidence-v1";
const CLOSEOUT_SCHEMA="ao-schola-2026-source-exceptions-closeout-v1";
const INVENTORY_SCHEMA="ao-mass-music-1962-pinned-source-universe-v1";
const SOURCE_REF="ad8783641455bae38a8eb5782b34241a7b3ff2ef";
const SOURCE_REPO="DivinumOfficium/divinum-officium";
const EXPECTED=Object.freeze(new Map([
 ["Commune/C10Pasc",{dates:1,legacySha:"cf8efa4b7cdb8d1b7ba7512d133f066c4d7c04b2",bytes:962}],
 ["Commune/C10b",{dates:2,legacySha:"25a6a7b43c87fb7bb6c46437a10153c33f7f8924",bytes:3199}],
 ["Commune/C10c",{dates:1,legacySha:"02c6058c330b31ab4183e2ef2c7d0067b71f29ae",bytes:1045}],
 ["Commune/C10t",{dates:8,legacySha:"dc7daad4e051c34636070dce89a690f5dddad6ed",bytes:194}],
 ["Tempora/Nat1-1",{dates:3,legacySha:null,bytes:null}]
]));
const fail=reason=>{throw Error("SCHOLA_FIVE_SOURCE_GAP_"+reason)};
const cleanDate=d=>/^2026-\d\d-\d\d$/.test(String(d??""))&&
 !Number.isNaN(Date.parse(d+"T12:00:00Z"));
const pathOk=s=>/^(?:Sancti|Tempora|Commune)\/[A-Za-z0-9_-]+$/.test(String(s??""));

export function buildFive2026PinnedSourceGapDispositions({evidence,closeout,inventory}={}){
 if(evidence?.schema!==SOURCE_EVIDENCE_SCHEMA||
    evidence.sourceRepository!==SOURCE_REPO||
    evidence.sourceRef!==SOURCE_REF||
    evidence.pinnedTreePrefix!=="web/www/missa/Latin/"||
    evidence.historicalTreePrefix!=="obsolete/missa/Latin/"||
    evidence.authority!=="EXACT_PINNED_GIT_TREE_AND_LEGACY_PATH_PROVENANCE_ONLY"||
    evidence.publication?.approvedSourceAliases!==0||
    evidence.publication?.approvedScores!==0||
    evidence.publication?.approvedRecordings!==0||
    evidence.publication?.productionReaderChanges!==false||
    !Array.isArray(evidence.selectedSourceGaps)||
    evidence.selectedSourceGaps.length!==EXPECTED.size)
   fail("EVIDENCE_NOT_AUTHENTICATED");
 if(inventory?.schema!==INVENTORY_SCHEMA||
    inventory.sourceRepository!==SOURCE_REPO||
    inventory.sourceRef!==SOURCE_REF||
    inventory.sourceFiles?.length!==1049)
   fail("PINNED_1049_INVENTORY_CHANGED");
 if(closeout?.schema!==CLOSEOUT_SCHEMA||
    closeout.sourceYear!==2026||
    closeout.counts?.selectedProperDays!==365||
    closeout.counts?.missingPinnedSourcePaths!==5||
    closeout.counts?.affectedDatesMissingPinnedSource!==15||
    closeout.counts?.newApprovedScores!==0||
    closeout.publication?.scorePromotionPermitted!==false||
    !Array.isArray(closeout.selectedSourceTreeGaps)||
    closeout.selectedSourceTreeGaps.length!==EXPECTED.size)
   fail("SELECTED_2026_CLOSEOUT_CHANGED");

 const pinned=new Set(inventory.sourceFiles.map(r=>r.path));
 if(pinned.size!==1049)fail("DUPLICATE_PINNED_SOURCE_PATHS");
 const selected=new Map(closeout.selectedSourceTreeGaps.map(r=>[r.sourcePath,r]));
 if(selected.size!==5)fail("DUPLICATE_SELECTED_SOURCE_GAPS");
 const seen=new Set(),seenDates=new Set();
 const gaps=[];
 for(const entry of evidence.selectedSourceGaps){
  const path=entry.sourcePath,expected=EXPECTED.get(path),selectedRow=selected.get(path);
  if(!expected||!pathOk(path)||seen.has(path)||pinned.has(path)||!selectedRow)
   fail("SOURCE_PATH_NOT_A_VERIFIED_GAP");
  seen.add(path);
  if(entry.expectedDates!==expected.dates||
     selectedRow.classification!=="SELECTED_PROPER_READY_BUT_PATH_OUTSIDE_PINNED_1049_MASS_TREE"||
     selectedRow.dateCount!==expected.dates||
     selectedRow.dates?.length!==expected.dates||
     selectedRow.principalIds?.length!==expected.dates||
     entry.approvedSourceAlias!=null||entry.aliasOf!=null||
     !/^[A-Z0-9_]+$/.test(entry.nextDecision??"")||
     typeof entry.structure!=="string"||entry.structure.length<40)
    fail("SOURCE_FAMILY_AUTHORITY_OR_OCCURRENCE_DRIFT");
  const isLegacy=expected.legacySha!==null,archive=entry.historicalSource;
  if(isLegacy){
   if(entry.sourceAssessment!=="OBSOLETE_LATIN_MASS_SOURCE_ONLY"||
      archive?.path!=="obsolete/missa/Latin/"+path+".txt"||
      archive?.blobSha!==expected.legacySha||
      archive?.size!==expected.bytes)
     fail("LEGACY_BLOB_IDENTITY_CHANGED");
  }else if(entry.sourceAssessment!==
      "NO_EXACT_SOURCE_PATH_IN_PINNED_OR_OBSOLETE_LATIN_MASS_TREE"||
      archive!==null)fail("FALSE_NATIVITY_LEGACY_SOURCE");
  const dateRows=selectedRow.dates.map((date,i)=>{
   const id=selectedRow.principalIds[i];
   if(!cleanDate(date)||seenDates.has(date)||typeof id!=="string"||
      id.length<4)fail("DATE_OR_SELECTED_PRINCIPAL_ID_INVALID");
   seenDates.add(date);
   return {date,principalId:id,
    selectedSourcePath:path,
    sourceDisposition:isLegacy?"OBSOLETE_WITNESS_ONLY_1962_OWNERSHIP_HELD":
     "NO_EXACT_HISTORICAL_WITNESS_1962_OWNERSHIP_HELD",
    digitalScoreAuthorized:false};
  });
  gaps.push({
   selectedSourcePath:path,
   affectedDates:dateRows.length,
   actual2026Dates:dateRows,
   pinned1049SourceExists:false,
   original1962SectionCertified:false,
   historicalWitness:isLegacy?{...archive,
    provenance:"EXACT_UPSTREAM_GIT_TREE_ONLY_NOT_PINNED_1049"}:null,
   sourceAssessment:entry.sourceAssessment,
   structuralFinding:entry.structure,
   pendingDecision:entry.nextDecision,
   selected1962OwnerCertified:false,
   aliasAuthorized:false,
   digitalScoreAuthorized:false
  });
 }
 if(seenDates.size!==15||seen.size!==5||
    gaps.reduce((n,x)=>n+x.affectedDates,0)!==15)
  fail("FIFTEEN_DATE_CENSUS_CHANGED");
 gaps.sort((a,b)=>a.selectedSourcePath.localeCompare(b.selectedSourcePath));
 return Object.freeze({
  schema:SCHOLA_FIVE_PATH_EVIDENCE_SCHEMA,year:2026,
  status:"ARCHIVAL_SOURCE_PROVENANCE_FOUND_1962_OWNER_UNCERTIFIED",
  authority:{
   selectedDateOwner:"AO_RUNTIME_V8.resolver.resolveDay",
   pinnedInventoryRepo:SOURCE_REPO,
   pinnedInventoryCommit:SOURCE_REF,
   canonicalPinnedTree:"web/www/missa/Latin/",
   legacyOnlyTree:"obsolete/missa/Latin/",
   sourceAccession:"NOT_AUTHORIZED",
   sourceAliases:"NOT_AUTHORIZED"
  },
  counters:{
   selectedSourcePathGaps:5,affectedActualDates:15,
   obsoleteOnlyHistoricalSourcePaths:4,withoutExactHistoricalSourcePath:1,
   selected1962SourceOwnersCertified:0,newPublicScores:0,
   newSourceFilesAdded:0
  },
  gaps,publication:{
   sourceOwnerOrMelodyInferred:false,aliasesApproved:0,
   publicGregorianScores:0,recordingsApproved:0,readerChanges:false
  }
 });
}

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dataDir=resolve(root,".tmp/schola-1962-selected-annual");
const researchPath="data/research/schola-2026-five-pinned-source-gap-evidence.v1.json";
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const load=async path=>JSON.parse(await readFile(resolve(root,path),"utf8"));
 const result=buildFive2026PinnedSourceGapDispositions({
  evidence:await load(researchPath),
  inventory:await load("data/research/mass-music-1962-pinned-full-source-universe.v1.json"),
  closeout:await load(".tmp/schola-1962-selected-annual/2026-schola-closeout-source-exceptions.json")
 });
 await writeFile(resolve(dataDir,"2026-schola-five-pinned-source-gap-dispositions.json"),
  JSON.stringify(result,null,2)+"\n");
 console.log("SCHOLA_FIVE_PINNED_PATHS "+JSON.stringify({
  counters:result.counters,
  exactDates:result.gaps.map(x=>({
    sourcePath:x.selectedSourcePath,
    dates:x.actual2026Dates.map(d=>d.date),
    status:x.sourceAssessment,
    original1962OwnerCertified:x.selected1962OwnerCertified
   }))
 }));
}
