#!/usr/bin/env node
// Research-only: compare actual 1961 archived GABC lyrical words to pinned
// Divinum Officium source-section line openings, no calendar or reader imports.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
export const SCHEMA="ao-gr1961-first400-pre-gospel-text-discrimination-v1";
const sha=s=>createHash("sha256").update(s).digest("hex");
const norm=s=>String(s??"").replace(/[æǽ]/gi,"ae").replace(/œ/gi,"oe")
 .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 .replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const scoreText=gabc=>String(gabc).replace(/<[^>]*>/g,"")
 .replace(/\([^)]*\)/g,"").replace(/\{([^}]*)\}/g,"$1")
 .replace(/[*_~]/g," ").replace(/\s+/g," ").trim();
export function discriminatePinnedPreGospel({index,batches,batchTexts,first,second,latinWitness,evidence}){
 if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
    index.sourceEditionId!==2||batches.length!==2||batchTexts.length!==2||
    batches.some((b,i)=>b?.schema!=="ao-gregobase-graduale1961-research-batch-v1"||
      b.status!=="STAGED_UNRELEASED"||b.sourceEditionId!==2||
      b.items?.length!==200||sha(batchTexts[i])!==index.batches[i].contentSha256)||
    first?.schema!=="ao-gr1961-first200-latin-source-review-v1"||
    second?.schema!=="ao-gr1961-second200-source-review-v1"||
    evidence?.schema!=="ao-gr1961-first400-pre-gospel-source-sections-v1"||
    evidence.researchOnly!==true||
    evidence.latinWitnessCommit!==latinWitness.latinWitnessCommit)
   throw Error("Frozen GR1961 archive/source screening required");
 const pinned=new Map(latinWitness.sourceFiles.map(s=>[s.path.slice(0,-4),s.blobSha]));
 const candidates=[...first.records,...second.records]
   .filter(r=>r.status==="PRE_GOSPEL_SEGMENT_UNRESOLVED");
 const paths=[...new Set(candidates.flatMap(r=>r.evidenceFiles))].sort();
 const sources=evidence.sourceFiles;
 if(candidates.length!==47||paths.length!==49||sources.length!==49)
   throw Error("Unexpected candidate and source totals");
 for(let i=0;i<sources.length;i++){
  const s=sources[i];
  if(s.path!==paths[i]||s.blobSha!==pinned.get(s.path)||
     !Array.isArray(s.sourceSections.Graduale))throw Error("Unpinned source section "+s.path);
  for(const [section,rows] of Object.entries(s.sourceSections)){
   if(!["Graduale","Alleluia","Tractus","GradualeF","Sequentia"].includes(section)||
      !Array.isArray(rows)||
      rows.some((r,j)=>!Number.isInteger(r.line)||r.line<1||
         typeof r.text!=="string"||(j>0&&r.line<=rows[j-1].line)))
     throw Error("Malformed source lines "+s.path+":"+section);
  }
 }
 const byId=new Map(batches.flatMap(b=>b.items).map(item=>[item.gregobaseId,item]));
 const byPath=new Map(sources.map(s=>[s.path,s]));
 const records=[];
 for(const r of candidates){
  const item=byId.get(r.gregobaseId);
  if(!item||item.sha256!==r.gabcSha256||item.officePart!==r.officePart||
     item.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
     sha(item.gabc)!==item.sha256)throw Error("GABC identity changed "+r.id);
  const incipit=norm(r.incipit.replace(/\([^)]*\)\s*$/,"").replace(/\.{2,}/g," "));
  const needle=incipit.split(" "),lyric=norm(scoreText(item.gabc)).split(" ");
  const offset=lyric.findIndex((_,i)=>needle.every((w,k)=>lyric[i+k]===w));
  if(offset<0)throw Error("GABC incipit cannot be located "+r.id);
  const head=lyric.slice(offset,offset+12),matches=[];
  for(const path of r.evidenceFiles){
   const file=byPath.get(path);
   if(!file)throw Error("Missing source "+path);
   for(const section of ["Graduale","Alleluia","Tractus"]){
    const musical=(file.sourceSections[section]??[]).filter(x=>
      String(x.text).trim()&&!/^[!$@&]/.test(String(x.text).trim()));
    for(let i=0;i<musical.length;i++){
     const line=musical[i],tokens=norm(line.text).split(" ");
     for(let j=0;j<tokens.length;j++){
      if(!needle.every((w,k)=>tokens[j+k]===w))continue;
      const other=tokens.slice(j,j+12);let shared=0;
      while(shared<Math.min(head.length,other.length)&&head[shared]===other[shared])shared++;
      const count=Math.min(head.length,other.length);
      matches.push({sourcePath:path,sourceBlobSha:file.blobSha,section,
       lineNumber:line.line,sourceLineIndex:i,sourceText:line.text.trim(),
       sectionFirstText:musical[0]?.text??null,
       gabcInitialPhrase:head.join(" "),sourceInitialPhrase:other.join(" "),
       sharedInitialWords:shared,wordsAvailableForComparison:count,
       textualDisposition:shared>=Math.min(8,count)?"INITIAL_EIGHT_OR_COMPLETE_SHORT_LINE_AGREEMENT":
         shared>=4?"PARTIAL_INITIAL_TEXT_AGREEMENT":"EARLY_CONTINUATION_DIVERGENCE",
       explicitTractusSection:section==="Tractus"});
     }
    }
   }
  }
  if(!matches.length)throw Error("No replayed candidate source line "+r.id);
  const best=Math.max(...matches.map(x=>x.sharedInitialWords)),
    pathsFound=[...new Set(matches.map(x=>x.sourcePath))];
  if(pathsFound.length!==r.evidenceFiles.length||
     r.evidenceFiles.some(p=>!pathsFound.includes(p)))throw Error("Evidence source path drift "+r.id);
  records.push({id:r.id,gregobaseId:r.gregobaseId,officePart:r.officePart,
   incipit:r.incipit,gabcSha256:item.sha256,
   gregoBasePage:item.gradualeRomanum1961Page,
   gabcInitialPhrase:head.join(" "),bestSharedInitialWords:best,
   limitedTextDisposition:best<=3?"PRIORITY_EARLY_TEXT_DIVERGENCE":best<8?
      "PARTIAL_TEXT_COMPARISON":"AT_LEAST_EIGHT_INITIAL_WORDS_AGREE",
   sourceFileCount:pathsFound.length,sourceOccurrences:matches.length,
   explicitTractusTextSeen:matches.some(x=>x.explicitTractusSection),
   candidatesFor1962Selection:"NOT_RESOLVED",trilingualBoundary:"NOT_VERIFIED",
   facsimile:"NOT_REVIEWED",release:"NONE",matches});
 }
 const summary={records:records.length,sourceFiles:sources.length,
  sourceOccurrences:records.reduce((n,r)=>n+r.sourceOccurrences,0),
  atLeastEightWordPrefix:records.filter(r=>r.limitedTextDisposition==="AT_LEAST_EIGHT_INITIAL_WORDS_AGREE").length,
  partialPrefix:records.filter(r=>r.limitedTextDisposition==="PARTIAL_TEXT_COMPARISON").length,
  priorityEarlyDivergence:records.filter(r=>r.limitedTextDisposition==="PRIORITY_EARLY_TEXT_DIVERGENCE").length,
  explicitTractusTextRecords:records.filter(r=>r.explicitTractusTextSeen).length,
  recordsMultipleSources:records.filter(r=>r.sourceFileCount>1).length,
  selected1962ProperVerified:0,facsimileApproved:0,newReaderPromotions:0};
 if(summary.records!==47||summary.sourceFiles!==49||summary.sourceOccurrences!==69||
   summary.atLeastEightWordPrefix!==33||summary.partialPrefix!==7||
   summary.priorityEarlyDivergence!==7||summary.explicitTractusTextRecords!==3||
   summary.recordsMultipleSources!==11)throw Error("Unreconciled pre-Gospel counts");
 return {schema:SCHEMA,researchOnly:true,
  sourceKind:"PINNED_LATIN_PROPER_SECTION_VS_ARCHIVED_1961_GABC_INITIAL_TEXT",
  archiveBatchSha256s:index.batches.slice(0,2).map(x=>x.contentSha256),
  latinWitnessCommit:latinWitness.latinWitnessCommit,
  warning:"Text prefixes are preliminary evidence only. Same incipit may belong to different chants; even long agreement cannot certify selected 1962 Proper, full text, trilingual segmentation, edition facsimile or performance.",
  summary,records};
}
function main(){
 if(process.argv[2]!=="--verify")throw Error("Use --verify");
 const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
 const b1="data/mass/chant-corpus/gr1961-proper-001.json",
 b2="data/mass/chant-corpus/gr1961-proper-002.json";
 const inputs={index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
  batches:[JSON.parse(read(b1)),JSON.parse(read(b2))],batchTexts:[read(b1),read(b2)],
  first:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-source-review.v1.json")),
  second:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-source-review.v1.json")),
  latinWitness:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
  evidence:JSON.parse(read("data/mass/chant-corpus/gr1961-first400-pre-gospel-source-sections.v1.json"))};
 const outcome=discriminatePinnedPreGospel(inputs);
 if(JSON.stringify(outcome,null,2)+"\n"!==read("data/mass/chant-corpus/gr1961-first400-pre-gospel-text-discrimination.v1.json"))
  throw Error("Pre-Gospel research report not byte-identical");
 console.log("AO_GR1961_PRE_GOSPEL_400="+JSON.stringify(outcome.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
