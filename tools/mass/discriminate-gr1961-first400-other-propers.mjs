#!/usr/bin/env node
// Incipit continuation risk classification for the 55 non-pre-Gospel
// preliminary matches among first 400 archival scores. NOT a 1962 Proper gate.
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const sha=s=>createHash("sha256").update(s).digest("hex");
const norm=s=>String(s??"").replace(/[æǽ]/gi,"ae").replace(/œ/gi,"oe")
 .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
 .replace(/coel/g,"cael").replace(/j/g,"i").replace(/alleluia|alleluja/g,"alleluia")
 .replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const scoreText=s=>String(s).replace(/<[^>]*>/g,"")
 .replace(/\([^)]*\)/g,"").replace(/\{([^}]*)\}/g,"$1")
 .replace(/[*_~]/g," ").replace(/\s+/g," ").trim();
export function reviewFirst400OtherProper({batches,index,first,second,witness1,witness2}){
 if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
   first?.schema!=="ao-gr1961-first200-latin-source-review-v1"||
   second?.schema!=="ao-gr1961-second200-source-review-v1"||
   witness1?.schema!=="ao-gr1961-first200-latin-witness-screen-v1"||
   witness2?.schema!=="ao-gr1961-second200-latin-witness-screen-v1"||
   batches?.length!==2)throw Error("Original pinned first-400 inputs required");
 const all=batches.flatMap(b=>b.items),items=new Map(all.map(x=>[x.gregobaseId,x]));
 const firstId=new Set(first.records.map(x=>x.gregobaseId));
 const firstHits=witness1.candidateOccurrences.map(x=>({id:x.gregobaseId,
  path:x.properSourcePath,section:x.sourceSection,line:null,text:x.latinExcerpt}));
 const secondHits=witness2.candidateOccurrences.map(x=>({id:x.gregobaseId,
  path:x.properSourcePath,section:x.sourceSection,line:x.sourceLine,text:x.sourceText}));
 const candidates=[...first.records,...second.records]
  .filter(x=>x.status==="LATIN_SOURCE_SECTION_CANDIDATE");
 if(candidates.length!==55)throw Error("Expected 55 other Proper source candidates");
 const records=candidates.map(row=>{
  const item=items.get(row.gregobaseId);
  if(!item||item.sha256!==row.gabcSha256||sha(item.gabc)!==item.sha256||
     !["in","of","co"].includes(item.officePart))
   throw Error("Untrusted non-pre-Gospel GABC "+row.id);
  const phrase=norm(row.incipit.replace(/\([^)]*\)\s*$/,"").replace(/\.{2,}/g," ")).split(" "),
    lyric=norm(scoreText(item.gabc)).split(" "),
    offset=lyric.findIndex((_,i)=>phrase.every((w,j)=>lyric[i+j]===w)),
    head=offset<0?[]:lyric.slice(offset,offset+12),
    selected=(firstId.has(row.gregobaseId)?firstHits:secondHits)
      .filter(x=>x.id===row.gregobaseId);
  if(selected.length!==row.evidenceCount)
   throw Error("Source evidence count mismatch "+row.id);
  const sources=selected.map(hit=>{
   if(!row.evidenceFiles.includes(hit.path))throw Error("Unexpected source path "+hit.path);
   const src=norm(hit.text).split(" "),
      at=src.findIndex((_,i)=>phrase.every((w,j)=>src[i+j]===w));
   let common=0;
   if(at>=0&&offset>=0){
    const segment=src.slice(at,at+12);
    while(common<Math.min(segment.length,head.length)&&
      segment[common]===head[common])common++;
   }
   return {path:hit.path,section:hit.section,sourceLine:hit.line,
    sourceText:hit.text,commonPrefixWords:common};
  });
  const best=Math.max(0,...sources.map(x=>x.commonPrefixWords));
  return {id:row.id,gregobaseId:row.gregobaseId,officePart:row.officePart,
   incipit:row.incipit,sourceOccurrences:sources.length,gabcIncipitFound:offset>=0,
   scoreOpening:head.join(" "),bestCommonInitialWords:best,
   status:offset<0?"GABC_INCIPIT_NOT_LOCATED":best<=3?
     "PRIORITY_EARLY_DIVERGENCE":best<8?"PARTIAL_PREFIX":"AT_LEAST_EIGHT_WORD_PREFIX",
   selected1962Proper:"NOT_VERIFIED",musicalFacsimile:"NOT_VERIFIED",
   promoted:false,sources};
 });
 const count=s=>records.filter(r=>r.status===s).length;
 const summary={records:records.length,
  totalOccurrences:records.reduce((n,r)=>n+r.sourceOccurrences,0),
  AT_LEAST_EIGHT_WORD_PREFIX:count("AT_LEAST_EIGHT_WORD_PREFIX"),
  PARTIAL_PREFIX:count("PARTIAL_PREFIX"),
  PRIORITY_EARLY_DIVERGENCE:count("PRIORITY_EARLY_DIVERGENCE"),
  canonical1962Verified:0,facsimileReviewed:0,promoted:0};
 if(summary.records!==55||summary.totalOccurrences!==80||
    summary.AT_LEAST_EIGHT_WORD_PREFIX!==45||
    summary.PARTIAL_PREFIX!==4||summary.PRIORITY_EARLY_DIVERGENCE!==6)
   throw Error("First-400 other Proper continuation totals changed");
 return {schema:"ao-gr1961-first400-non-pre-gospel-text-review-v1",researchOnly:true,
  scope:"55_INTROIT_OFFERTORY_COMMUNION_SOURCE_CANDIDATES_AFTER_200_200_SCREEN",
  warning:"First-200 excerpts may be clipped; source line agreement cannot certify canonical 1962 selected Proper, musical facsimile or choir performance.",
  summary,records};
}
function main(){
 if(process.argv[2]!=="--verify")throw Error("Use --verify");
 const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
 const data=reviewFirst400OtherProper({
  batches:[1,2].map(i=>JSON.parse(read("data/mass/chant-corpus/gr1961-proper-00"+i+".json"))),
  index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
  first:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-source-review.v1.json")),
  second:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-source-review.v1.json")),
  witness1:JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
  witness2:JSON.parse(read("data/mass/chant-corpus/gr1961-second200-latin-witness-screen.v1.json")),
 });
 if(JSON.stringify(data,null,2)+"\n"!==read("data/mass/chant-corpus/gr1961-first400-other-proper-text-review.v1.json"))
  throw Error("Other Proper report not byte-reproducible");
 console.log("AO_GR1961_FIRST400_OTHER="+JSON.stringify(data.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
