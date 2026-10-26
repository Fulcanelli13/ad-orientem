#!/usr/bin/env node
// Research-only reconciliation, records 201-400 of the established GR1961 archive.
// Authenticated source lines do NOT represent canonical selected 1962 Proper verification.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
export const SECOND200_SCHEMA="ao-gr1961-second200-source-review-v1";
const hash=x=>createHash("sha256").update(x).digest("hex");
const norm=s=>String(s??"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 .replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const ROLES={in:["Introitus"],of:["Offertorium"],co:["Communio"],
 gr:["Graduale"],al:["Graduale","Alleluia"],tr:["Graduale","Tractus"]};
const incipitFor=x=>norm(String(x).replace(/\([^)]*\)\s*$/,"").replace(/\.{2,}/g," "));
export function reconcileSecond200({index,batch,batchText,witness,previousWitness}){
 const manifest=index?.batches?.[1];
 if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
    index.sourceEditionId!==2||manifest?.count!==200||
    hash(batchText)!==manifest.contentSha256||
    Buffer.byteLength(batchText)!==manifest.bytes||
    batch?.schema!=="ao-gregobase-graduale1961-research-batch-v1"||
    batch?.status!=="STAGED_UNRELEASED"||
    batch?.sourceEditionId!==2||batch.items?.length!==200)
  throw Error("Second archival batch manifest identity failed");
 if(witness?.schema!=="ao-gr1961-second200-latin-witness-screen-v1"||
    witness.researchOnly!==true||witness.productionApproved!==0||
    witness.archivalBatchSha256!==manifest.contentSha256||
    witness.latinWitnessCommit!=="ad8783641455bae38a8eb5782b34241a7b3ff2ef"||
    witness?.sourceFiles?.length!==106||
    previousWitness?.sourceFiles?.length!==106||
    previousWitness.latinWitnessCommit!==witness.latinWitnessCommit)
  throw Error("Second-200 pinned witness identity failed");
 const sourceShas=new Map();
 for(let i=0;i<106;i++){
  const row=witness.sourceFiles[i],prev=previousWitness.sourceFiles[i];
  if(row.path!==prev.path||row.blobSha!==prev.blobSha||row.status!=="READ"||
     !/^(Tempora|Sancti)\/[a-zA-Z0-9_-]+\.txt$/.test(row.path)||
     !/^[0-9a-f]{40}$/.test(row.blobSha)||sourceShas.has(row.path))
   throw Error("Second-200 source file not pinned "+row.path);
  sourceShas.set(row.path,row.blobSha);
 }
 const items=new Map();
 for(const row of batch.items){
  if(row.id!=="GREGOBASE-"+row.gregobaseId||
     row.sourceEditionId!==2||
     row.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
     hash(row.gabc)!==row.sha256||items.has(row.gregobaseId))
   throw Error("Unexpected original GABC identity "+row.id);
  items.set(row.gregobaseId,row);
 }
 const seenLines=new Set(),byId=new Map();
 for(const evidence of witness.candidateOccurrences??[]){
  const item=items.get(evidence.gregobaseId),
   needle=incipitFor(item?.incipit),latin=norm(evidence.sourceText),
   key=[evidence.gregobaseId,evidence.properSourcePath,
        evidence.sourceSection,evidence.sourceLine].join(":");
  const unmarked=norm(String(evidence.sourceText??"").replace(/^[VvRr]\.\s*/,"")),
    starts=unmarked===needle||unmarked.startsWith(needle+" "),
    expectedPosition=starts?(/^[VvRr]\.\s*/.test(evidence.sourceText)?"VERSE_MARKED_OPENING":"LINE_OPENING"):"EMBEDDED";
  if(!item||item.officePart!==evidence.officePart||
    !ROLES[item.officePart]?.includes(evidence.sourceSection)||
    sourceShas.get(evidence.properSourcePath+".txt")!==evidence.sourceBlobSha||
    !Number.isInteger(evidence.sourceLine)||evidence.sourceLine<1||
    needle.split(" ").length<2||
    !(" "+latin+" ").includes(" "+needle+" ")||
    evidence.position!==expectedPosition||
    evidence.roleHint!==(evidence.sourceSection==="Graduale"?"PRE_GOSPEL_COMPOSITE_REVIEW":
      evidence.roleHint==="INTROIT_SECONDARY_OR_REPRISE_REVIEW"?
      "INTROIT_SECONDARY_OR_REPRISE_REVIEW":evidence.sourceSection)||
    evidence.evidenceLevel!=="LATIN_LINE_OCCURRENCE_NOT_SELECTED_1962_PROPER"||
    seenLines.has(key))
   throw Error("Unsupported line/role/incipit "+key);
  seenLines.add(key);
  const a=byId.get(item.gregobaseId)||[];a.push(evidence);byId.set(item.gregobaseId,a);
 }
 const records=batch.items.map(item=>{
  const evidence=byId.get(item.gregobaseId)||[],
   paths=[...new Set(evidence.map(e=>e.properSourcePath))],
   name=incipitFor(item.incipit),searchable=Boolean(ROLES[item.officePart]&&name.split(" ").length>=2);
  const status=!searchable?"INCIPIT_NOT_SEARCHABLE_IN_LIMITED_SCREEN":
    !evidence.length?"NO_OCCURRENCE_WITHIN_LIMITED_WITNESS_SET":
    ["gr","al","tr"].includes(item.officePart)?"PRE_GOSPEL_SEGMENT_UNRESOLVED":"LATIN_SOURCE_SECTION_CANDIDATE";
  return {id:item.id,gregobaseId:item.gregobaseId,officePart:item.officePart,
   incipit:item.incipit,page:item.gradualeRomanum1961Page,gabcSha256:item.sha256,sourceEditionId:item.sourceEditionId,
   status,evidenceCount:evidence.length,evidenceFiles:paths,
   shortIncipit:name.split(" ").length===2,
   hasEmbeddedHit:evidence.some(e=>e.position==="EMBEDDED"),
   hasNonOpeningIntroitHit:evidence.some(e=>e.roleHint==="INTROIT_SECONDARY_OR_REPRISE_REVIEW"),
   canonicalReaderProperMatch:"NOT_YET_VERIFIED",
   editionFacsimileReview:"NOT_YET_VERIFIED",editorialApproval:"NOT_GRANTED"};
 });
 const count=status=>records.filter(x=>x.status===status).length;
 const summary={stagedRecords:200,sourceFilesRead:sourceShas.size,
  sourceLineOccurrences:witness.candidateOccurrences.length,
  candidateRecords:records.filter(x=>x.evidenceCount>0).length,
  sourceSectionCandidates:count("LATIN_SOURCE_SECTION_CANDIDATE"),
  preGospelSegmentUnresolved:count("PRE_GOSPEL_SEGMENT_UNRESOLVED"),
  noOccurrenceWithinLimitedSourceSet:count("NO_OCCURRENCE_WITHIN_LIMITED_WITNESS_SET"),
  incipitNotSearchable:count("INCIPIT_NOT_SEARCHABLE_IN_LIMITED_SCREEN"),
  repeatedAcrossProperSources:records.filter(x=>x.evidenceFiles.length>1).length,
  recordsWithEmbeddedHits:records.filter(x=>x.hasEmbeddedHit).length,
  recordsWithNonOpeningIntroitHits:records.filter(x=>x.hasNonOpeningIntroitHit).length,
  canonicalRuntimeVerified:0,facsimileApproved:0,readerPromotions:0};
 if(summary.candidateRecords+summary.noOccurrenceWithinLimitedSourceSet+summary.incipitNotSearchable!==200)
   throw Error("Nonexclusive disposition categories");
 return {schema:SECOND200_SCHEMA,
  scope:"RECORDS_201_TO_400_OF_1195_STAGED_GABCS_AGAINST_106_LATIN_WITNESSES",researchOnly:true,
  archiveBatchSha256:manifest.contentSha256,sourceEditionId:2,
  latinWitnessCommit:witness.latinWitnessCommit,
  warning:"A named Latin line occurrence is not the currently selected 1962 Proper or the correct musical notation/segment. Absent means not found within these 106 files, never rejection; short incipits remain unsearched; source inheritance and variants remain unresolved.",
  summary,records};
}
function main(){
 if(process.argv[2]!=="--verify")throw Error("Use --verify");
 const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
 const file="data/mass/chant-corpus/gr1961-second200-source-review.v1.json";
 const outcome=reconcileSecond200({
  index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
  batch:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-002.json")),
  batchText:read("data/mass/chant-corpus/gr1961-proper-002.json"),
  witness:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-latin-witness-screen.v1.json")),
  previousWitness:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
 });
 if(JSON.stringify(outcome,null,2)+"\n"!==read(file))throw Error("Source review not deterministic");
 console.log("AO_GR1961_SECOND200="+JSON.stringify(outcome.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
