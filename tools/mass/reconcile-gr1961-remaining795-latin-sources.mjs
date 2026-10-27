#!/usr/bin/env node
// One reproducible, research-only reconciliation of archive records 401-1195.
// NEVER use these positions to choose a 1962 Proper, certify a facsimile,
// publish musical notation, or infer what a local Schola actually sings.
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const sha=s=>createHash("sha256").update(s).digest("hex");
const norm=s=>String(s??"").replace(/[æǽ]/gi,"ae").replace(/œ/gi,"oe")
 .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 .replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const ROLES={in:["Introitus"],of:["Offertorium"],co:["Communio"],gr:["Graduale"],
 al:["Graduale","Alleluia"],tr:["Graduale","Tractus"]};
export function reconcileLast795({index,batches,batchTexts,firstWitness,evidence}){
 if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
  index.status!=="RESEARCH_ONLY_NOT_MASS_READER"||index.sourceEditionId!==2||
  batches?.length!==4||batchTexts?.length!==4)
   throw Error("Four frozen 1961 archive batches required");
 const items=[];
 for(let i=0;i<4;i++){
  const b=batches[i],meta=index.batches[i+2],text=batchTexts[i];
  if(!meta||meta.count!==b.items?.length||meta.count!==(i===3?195:200)||
   sha(text)!==meta.contentSha256||Buffer.byteLength(text)!==meta.bytes||
   b.schema!=="ao-gregobase-graduale1961-research-batch-v1"||
   b.status!=="STAGED_UNRELEASED"||b.sourceEditionId!==2)
    throw Error("Archived batch metadata mismatch #"+(i+3));
  for(const item of b.items){
   if(item.id!=="GREGOBASE-"+item.gregobaseId||
    item.sourceEditionId!==2||
    item.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
    item.sha256!==sha(item.gabc))throw Error("Unapproved GABC "+item.id);
   items.push({...item,archiveBatch:i+3});
  }
 }
 if(items.length!==795||new Set(items.map(x=>x.id)).size!==795)
  throw Error("795 unique GABC identities required");
 if(evidence?.schema!=="ao-gr1961-archive-remaining795-line-evidence-v1"||
  !evidence.researchOnly||evidence.sourceCommit!==firstWitness?.latinWitnessCommit||
  firstWitness.sourceFiles?.length!==106||evidence.sourceFiles?.length!==106)
  throw Error("Frozen first-200 source witness manifest required");
 const files=new Map();
 for(let i=0;i<106;i++){
  const a=evidence.sourceFiles[i],b=firstWitness.sourceFiles[i];
  if(a.path!==b.path||a.blobSha!==b.blobSha||
    !/^[0-9a-f]{40}$/.test(a.blobSha)||
    !/^(Tempora|Sancti)\/[a-zA-Z0-9_-]+\.txt$/.test(a.path)||
    b.status!=="READ"||files.has(a.path))
   throw Error("Source identity drift "+a.path);
  files.set(a.path,a.blobSha);
 }
 const byId=new Map(items.map(item=>[item.gregobaseId,item])),hits=new Map(),seen=new Set();
 for(const x of evidence.hits??[]){
  const item=byId.get(x.id),
   needle=norm(String(item?.incipit??"").replace(/\([^)]*\)\s*$/,"").replace(/\.{2,}/g," ")),
   text=norm(x.text),withoutMarker=norm(String(x.text??"").replace(/^[VvRr]\.\s*/,"")),
   begins=withoutMarker===needle||withoutMarker.startsWith(needle+" "),
   computed=begins?(/^[VvRr]\.\s*/.test(x.text)?"VERSE_MARKED_OPENING":"LINE_OPENING"):"EMBEDDED",
   key=[x.id,x.path,x.section,x.line].join("|");
  if(!item||x.officePart!==item.officePart||x.incipit!==item.incipit||
   !ROLES[item.officePart]?.includes(x.section)||
   files.get(x.path+".txt")!==x.sourceBlobSha||
   !Number.isInteger(x.line)||x.line<1||
   !Number.isInteger(x.sourceLineIndex)||x.sourceLineIndex<0||
   needle.split(" ").length<2||
   !(" "+text+" ").includes(" "+needle+" ")||
   x.position!==computed||seen.has(key))
    throw Error("Unsupported or duplicated Latin witness "+key);
  seen.add(key);
  const arr=hits.get(x.id)??[];arr.push(x);hits.set(x.id,arr);
 }
 const records=items.map((item,i)=>{
  const matches=hits.get(item.gregobaseId)??[],paths=[...new Set(matches.map(m=>m.path))],
    incipit=norm(item.incipit.replace(/\([^)]*\)\s*$/,"").replace(/\.{2,}/g," ")),
    searchable=incipit.split(" ").length>=2&&Boolean(ROLES[item.officePart]);
  const status=!searchable?"INCIPIT_NOT_SEARCHABLE_IN_LIMITED_SCREEN":
   !matches.length?"NO_OCCURRENCE_WITHIN_LIMITED_WITNESS_SET":
   ["al","gr","tr"].includes(item.officePart)?
   "PRE_GOSPEL_SEGMENT_UNRESOLVED":"LATIN_SOURCE_SECTION_CANDIDATE";
  return {id:item.id,gregobaseId:item.gregobaseId,archiveBatch:item.archiveBatch,
   officePart:item.officePart,incipit:item.incipit,gabcSha256:item.sha256,status,
   evidenceCount:matches.length,evidenceFiles:paths,
   hasEmbeddedHit:matches.some(x=>x.position==="EMBEDDED"),needsSourceSelection:true,
   canonicalReaderProperMatch:"NOT_YET_VERIFIED",musicalFacsimile:"NOT_YET_VERIFIED",
   editorialApproval:"NOT_GRANTED"};
 });
 const summaryFor=rs=>({records:rs.length,sourceFilesRead:files.size,
  sourceLineOccurrences:rs.reduce((n,r)=>n+r.evidenceCount,0),
  candidates:rs.filter(r=>r.evidenceCount>0).length,
  preGospel:rs.filter(r=>r.status==="PRE_GOSPEL_SEGMENT_UNRESOLVED").length,
  simpleProper:rs.filter(r=>r.status==="LATIN_SOURCE_SECTION_CANDIDATE").length,
  noHit:rs.filter(r=>r.status==="NO_OCCURRENCE_WITHIN_LIMITED_WITNESS_SET").length,
  unsearchable:rs.filter(r=>r.status==="INCIPIT_NOT_SEARCHABLE_IN_LIMITED_SCREEN").length,
  multiSource:rs.filter(r=>r.evidenceFiles.length>1).length,
  embedded:rs.filter(r=>r.hasEmbeddedHit).length,
  certified1962:0,facsimileReviewed:0,readerPromoted:0});
 const summary=summaryFor(records);
 if(summary.records!==795||summary.sourceLineOccurrences!==(evidence.hits??[]).length||
  summary.candidates+summary.noHit+summary.unsearchable!==795)
  throw Error("Research dispositions fail reconciliation");
 const batchesOut=Array.from({length:4},(_,i)=>({number:i+3,
  ...summaryFor(records.filter(r=>r.archiveBatch===i+3))}));
 return {report:{schema:"ao-gr1961-archive-remaining795-reviewed-v1",
  researchOnly:true,summary,records},summary,batches:batchesOut};
}
function main(){
 if(process.argv[2]!=="--verify")throw Error("Use --verify");
 const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
 const paths=[3,4,5,6].map(i=>"data/mass/chant-corpus/gr1961-proper-00"+i+".json");
 const input={
  index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
  batches:paths.map(p=>JSON.parse(read(p))),batchTexts:paths.map(read),
  firstWitness:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
  evidence:JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-latin-evidence.v1.json")),
 };
 const outcome=reconcileLast795(input);
 const filename="data/mass/chant-corpus/gr1961-remaining795-source-review.v1.json";
 const saved=read(filename);
 if(saved!==JSON.stringify(outcome.report,null,2)+"\n")
  throw Error("Remaining 795 report is not deterministic");
 const summary=JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-summary.v1.json"));
 if(JSON.stringify(summary.summary)!==JSON.stringify(outcome.summary)||
    JSON.stringify(summary.batches)!==JSON.stringify(outcome.batches))
  throw Error("Archived batch totals have drifted");
 console.log("AO_GR1961_LAST795="+JSON.stringify(outcome.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
