#!/usr/bin/env node
// Last-795 provisional Latin text evidence only. Compare archived GABC
// transcription lyrics with preserved source lines, never release notation.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
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
export const CONTINUATION_SCHEMA="ao-gr1961-last795-incipit-continuation-review-v1";
export function compareLast795Continuations({batches,batchTexts,index,original,evidence}){
 if(index?.schema!=="ao-gregobase-graduale1961-research-index-v1"||
  batches?.length!==4||batchTexts?.length!==4||
  original?.schema!=="ao-gr1961-archive-remaining795-reviewed-v1"||
  evidence?.schema!=="ao-gr1961-archive-remaining795-line-evidence-v1"||
  evidence.researchOnly!==true||original.records?.length!==795)
   throw Error("Frozen last-795 research evidence required");
 const all=[];
 for(let i=0;i<4;i++){
  const b=batches[i],m=index.batches[i+2];
  if(sha(batchTexts[i])!==m.contentSha256||
    Buffer.byteLength(batchTexts[i])!==m.bytes||
    b.status!=="STAGED_UNRELEASED"||b.items.length!==m.count)
   throw Error("GABC batch digest drift");
  all.push(...b.items);
 }
 const items=new Map(all.map(r=>[r.gregobaseId,r])),hits=new Map();
 for(const h of evidence.hits){
  const r=items.get(h.id);
  const words=norm(String(r?.incipit??"").replace(/\([^)]*\)\s*$/,"").replace(/\.{2,}/g," "));
  if(!r||h.officePart!==r.officePart||
    !(" "+norm(h.text)+" ").includes(" "+words+" "))
   throw Error("Unsourced candidate witness "+h.id);
  const a=hits.get(h.id)??[];a.push(h);hits.set(h.id,a);
 }
 const rows=original.records.filter(r=>r.evidenceCount>0);
 if(rows.length!==240||evidence.hits.length!==357)
   throw Error("240 candidates and 357 source hits expected");
 const records=rows.map(r=>{
  const item=items.get(r.gregobaseId);
  if(!item||item.sha256!==r.gabcSha256||sha(item.gabc)!==item.sha256)
   throw Error("Unpinned GABC "+r.id);
  const phrase=norm(r.incipit.replace(/\([^)]*\)\s*$/,"").replace(/\.{2,}/g," ")).split(" "),
   lyric=norm(scoreText(item.gabc)).split(" "),
   offset=lyric.findIndex((_,i)=>phrase.every((w,j)=>lyric[i+j]===w)),
   head=offset<0?[]:lyric.slice(offset,offset+12);
  const sourceRows=(hits.get(r.gregobaseId)??[]).map(h=>{
   const words=norm(h.text).split(" "),
    start=words.findIndex((_,i)=>phrase.every((w,j)=>words[i+j]===w));
   let common=0;
   if(start>=0&&offset>=0){
    const target=words.slice(start,start+12);
    while(common<Math.min(target.length,head.length)&&
      target[common]===head[common])common++;
   }
   return {path:h.path,section:h.section,sourceBlobSha:h.sourceBlobSha,
    sourceLine:h.line,sourceText:h.text,scoreOpening:head.join(" "),
    commonPrefixWords:common,sourcePosition:h.position};
  });
  if(sourceRows.length!==r.evidenceCount)throw Error("Evidence count changed "+r.id);
  const best=Math.max(0,...sourceRows.map(s=>s.commonPrefixWords));
  return {id:r.id,gregobaseId:r.gregobaseId,officePart:r.officePart,
   incipit:r.incipit,archiveBatch:r.archiveBatch,
   sourceOccurrenceCount:sourceRows.length,gabcIncipitFound:offset>=0,
   scoreOpening:head.join(" "),bestCommonInitialWords:best,
   status:offset<0?"GABC_INCIPIT_NOT_LOCATED":
    best<=3?"PRIORITY_EARLY_DIVERGENCE":best<=7?"PARTIAL_PREFIX":"AT_LEAST_EIGHT_WORD_PREFIX",
   selection1962:"NOT_VERIFIED",facsimile:"NOT_VERIFIED",release:"NONE",sources:sourceRows};
 });
 const count=s=>records.filter(r=>r.status===s).length;
 const summary={candidates:records.length,sourceOccurrences:evidence.hits.length,
  AT_LEAST_EIGHT_WORD_PREFIX:count("AT_LEAST_EIGHT_WORD_PREFIX"),
  PRIORITY_EARLY_DIVERGENCE:count("PRIORITY_EARLY_DIVERGENCE"),
  PARTIAL_PREFIX:count("PARTIAL_PREFIX"),
  selectedProperVerified:0,facsimileApproved:0,promotions:0};
 if(summary.AT_LEAST_EIGHT_WORD_PREFIX!==197||
  summary.PARTIAL_PREFIX!==28||summary.PRIORITY_EARLY_DIVERGENCE!==15||
  records.some(r=>r.status==="GABC_INCIPIT_NOT_LOCATED"))
   throw Error("Incomplete continuation reconstruction");
 return {schema:CONTINUATION_SCHEMA,researchOnly:true,
  archiveRefs:[3,4,5,6].map(n=>"data/mass/chant-corpus/gr1961-proper-00"+n+".json"),
  sourceEvidenceFile:"data/mass/chant-corpus/gr1961-remaining795-latin-evidence.v1.json",
  normalization:"Normalize diacritics, Latin ligatures, j/i, cael/coel, and alleluia/alleluja; preserve original source text in witnesses",
  warning:"Word-prefix comparison within one pinned Latin source line, NOT selected 1962 Proper or full musical source identity. A short coincidence does not reject the archived GABC.",
  summary,records};
}
function main(){
 if(process.argv[2]!=="--verify")throw Error("Use --verify");
 const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
 const paths=[3,4,5,6].map(n=>"data/mass/chant-corpus/gr1961-proper-00"+n+".json");
 const out=compareLast795Continuations({
  batches:paths.map(p=>JSON.parse(read(p))),batchTexts:paths.map(read),
  index:JSON.parse(read("data/mass/chant-corpus/gr1961-proper-index.json")),
  original:JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-source-review.v1.json")),
  evidence:JSON.parse(read("data/mass/chant-corpus/gr1961-remaining795-latin-evidence.v1.json")),
 });
 if(JSON.stringify(out,null,2)+"\n"!==read("data/mass/chant-corpus/gr1961-remaining795-text-discrimination.v1.json"))
  throw Error("Cannot reproduce GABC-vs-Latin text discrimination");
 console.log("AO_GR1961_LAST795_TEXT_DISCRIMINATION="+JSON.stringify(out.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
