#!/usr/bin/env node
// First 200 historical GR1961 GABC records: research-only source-witness
// reconciliation, NOT a reader module or an automatic liturgical match.
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";

export const FIRST200_RECONCILIATION_SCHEMA="ao-gr1961-first200-latin-source-review-v1";
const SOURCE_WITNESS_SCHEMA="ao-gr1961-first200-latin-witness-screen-v1";
const hash=s=>createHash("sha256").update(s).digest("hex");
const ROLE=Object.freeze({
  in:["Introitus"],of:["Offertorium"],co:["Communio"],
  gr:["Graduale"],al:["Graduale","Alleluia"],tr:["Graduale","Tractus"],
});
const ALLOWED_PRESENCE=new Set(["Tempora","Sancti"]);
export function reconcileGradualeFirst200({index,batch,batchText,witness}){
 if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
    index?.status!=="RESEARCH_ONLY_NOT_MASS_READER"||
    index?.sourceEditionId!==2)throw Error("Authoritative 1961 source index required");
 const b=index.batches?.[0];
 if(b?.count!==200||hash(batchText)!==b.contentSha256||
    Buffer.byteLength(batchText)!==b.bytes)throw Error("First archival batch digest mismatch");
 if(batch?.schema!=="ao-gregobase-graduale1961-research-batch-v1"||
    batch?.sourceEditionId!==2||batch?.items?.length!==200||
    batch?.status!=="STAGED_UNRELEASED")throw Error("Unapproved original 200-row GR1961 batch required");
 if(witness?.schema!==SOURCE_WITNESS_SCHEMA||witness?.archiveBlobSha==null||
    !/^[0-9a-f]{40}$/.test(witness.archiveBlobSha)||
    witness?.stagedCount!==200||
    witness?.latinWitnessCommit!=="ad8783641455bae38a8eb5782b34241a7b3ff2ef"||
    witness?.researchOnly!==true||witness?.productionApproved!==0)
    throw Error("Pinned Latin source-evidence manifest required");
 const files=new Map();
 for(const src of witness.sourceFiles??[]){
  if(!/^(Tempora|Sancti)\/[A-Za-z0-9_-]+\.txt$/.test(src.path)||
     !ALLOWED_PRESENCE.has(src.path.split("/")[0])||
     !/^[0-9a-f]{40}$/.test(src.blobSha)||src.status!=="READ"||files.has(src.path))
   throw Error("Duplicate/unavailable/unsigned Latin source: "+src.path);
  files.set(src.path,src);
 }
 const archiveMap=new Map();
 for(const item of batch.items){
  if(archiveMap.has(item.gregobaseId))throw Error("Duplicate archived chant ID");
  if(item.id!=="GREGOBASE-"+item.gregobaseId||item.sourceEditionId!==2||
     item.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
     hash(item.gabc)!==item.sha256)throw Error("Unverified historical GABC "+item.id);
  archiveMap.set(item.gregobaseId,item);
 }
 const evidence=new Map();
 for(const hit of witness.candidateOccurrences??[]){
  const entry=archiveMap.get(hit.gregobaseId);
  const file=files.get(hit.properSourcePath+".txt");
  if(!entry||!file||!ROLE[entry.officePart]?.includes(hit.sourceSection)||
     entry.officePart!==hit.officePart||hit.sourceBlobSha!==file.blobSha||
     hit.evidenceLevel!=="LATIN_SECTION_OCCURRENCE_NOT_SELECTED_1962_PROPER"||
     !String(hit.latinExcerpt??"").trim())
   throw Error("Unsupported or source-misaligned Latin hit: "+hit.gregobaseId);
  const group=evidence.get(hit.gregobaseId)??[];
  if(group.some(x=>x.properSourcePath===hit.properSourcePath&&
    x.sourceSection===hit.sourceSection))throw Error("Repeated Latin hit in identical source section");
  group.push(hit);evidence.set(hit.gregobaseId,group);
 }
 const rows=batch.items.map(item=>{
  const group=evidence.get(item.gregobaseId)??[];
  const paths=[...new Set(group.map(x=>x.properSourcePath))];
  const needsSegment=["gr","al","tr"].includes(item.officePart);
  const status=group.length===0?"NO_OCCURRENCE_WITHIN_LIMITED_WITNESS_SET":
    needsSegment?"PRE_GOSPEL_SEGMENT_UNRESOLVED":"LATIN_SOURCE_SECTION_CANDIDATE";
  return Object.freeze({
   id:item.id,gregobaseId:item.gregobaseId,officePart:item.officePart,
   incipit:item.incipit,page:item.gradualeRomanum1961Page,
   gabcSha256:item.sha256,sourceEditionId:2,
   status,evidenceFiles:Object.freeze(paths),
   evidenceCount:group.length,multiplePossibleProperSources:paths.length>1,
   canonicalReaderProperMatch:"NOT_YET_VERIFIED",
   editionFacsimileReview:"NOT_YET_VERIFIED",
   editorialApproval:"NOT_GRANTED",
  });
 });
 const counts=Object.freeze({
  candidateRecords:rows.filter(x=>x.evidenceCount>0).length,
  sourceSectionCandidates:rows.filter(x=>x.status==="LATIN_SOURCE_SECTION_CANDIDATE").length,
  preGospelSegmentUnresolved:rows.filter(x=>x.status==="PRE_GOSPEL_SEGMENT_UNRESOLVED").length,
  repeatedAcrossDifferentProperSources:rows.filter(x=>x.multiplePossibleProperSources).length,
  noOccurrenceWithinLimitedSourceSet:rows.filter(x=>x.evidenceCount===0).length,
  sourceFilesRead:files.size,latinSourceOccurrences:witness.candidateOccurrences.length,
  stagedRecords:rows.length,canonicalRuntimeVerified:0,facsimileApproved:0,readerPromotions:0,
 });
 if(counts.stagedRecords!==counts.candidateRecords+counts.noOccurrenceWithinLimitedSourceSet)
  throw Error("Unreconciled first-200 denominator");
 return Object.freeze({
  schema:FIRST200_RECONCILIATION_SCHEMA,
  scope:"FIRST200_STAGED_GREGORIAN_CHANTS_VS_PINNED_SELECTED_LATIN_WITNESSES",
  sourceSnapshotDate:index.snapshotDate,
  archiveIndexBlobSha:index.sourceFileBlobSha,
  gregobaseBatchSha256:b.contentSha256,
  latinWitnessCommit:witness.latinWitnessCommit,
  status:"RESEARCH_TEXT_OCCURRENCES_ONLY_NOT_1962_RUNTIME_CERTIFIED",
  warning:"Unmatched here means NOT FOUND in these selected witnesses, not absent from the Missal or unsuitable. Matched means Latin section occurrence, not exact canonical reader identity, timing, performance or printed notation.",
  summary:counts,records:Object.freeze(rows),
 });
}
function main(){
 const args=process.argv.slice(2),mode=args[0];
 if(!["--write","--verify"].includes(mode))throw Error("Usage: --write|--verify");
 const path=rel=>fileURLToPath(new URL("../../"+rel,import.meta.url));
 const index=JSON.parse(readFileSync(path("data/mass/chant-corpus/gr1961-proper-index.json"),"utf8"));
 const source=readFileSync(path("data/mass/chant-corpus/gr1961-proper-001.json"),"utf8");
 const witness=JSON.parse(readFileSync(path("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json"),"utf8"));
 const report=reconcileGradualeFirst200({index,batch:JSON.parse(source),batchText:source,witness});
 const payload=JSON.stringify(report,null,2)+"\n";
 const out=path("data/mass/chant-corpus/gr1961-first200-source-review.v1.json");
 if(mode==="--write")writeFileSync(out,payload);
 else if(readFileSync(out,"utf8")!==payload)throw Error("First200 source-screen report changed");
 console.log("AO_GR1961_FIRST200="+JSON.stringify(report.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
