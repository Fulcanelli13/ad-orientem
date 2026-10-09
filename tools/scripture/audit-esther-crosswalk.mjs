#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {estherParallelVerse,estherCrosswalkCoverage} from "../../src/scripture/esther-catholic-crosswalk.js";

function sourceMap(data,id){
 const b=data.books?.find(x=>x.id===id);
 if(!b)throw Error("Missing Douay source "+id);
 return new Map(b.chapters.flatMap(c=>c.verses.map(v=>[c.number+":"+v.number,v.text])));
}
function masterMap(data){
 if(data.editionId!=="cpdv-2009"||data.book!=="Esther")throw Error("Wrong source book");
 return new Map(data.verses.map(v=>[v.chapter+":"+v.verse,v.text]));
}
function tokens(text){
 const stop=new Set(["and","the","for","but","was","who","his","her","all","that","with","when","had","they","are","were","this","him","you","she","from","them"]);
 return new Set(String(text).toLowerCase().match(/[a-z]{2,}/g)?.filter(x=>!stop.has(x))??[]);
}
function overlap(a,b){
 const l=tokens(a),r=tokens(b);
 return l.size+r.size ? 2*[...l].filter(x=>r.has(x)).length/(l.size+r.size):0;
}
export function auditEstherCrosswalk(cpdv,douay){
 const author=masterMap(cpdv),dr=sourceMap(douay,"Esther");
 const usage=new Map(),findings=[];
 for(const [key,text] of author){
  const [chapter,verseStart]=key.split(":").map(Number);
  const mapped=estherParallelVerse({book:"Esther",chapter,verseStart,verseEnd:verseStart},"cpdv-2009","dr-challoner");
  if(!mapped)throw Error("Unmapped CPDV Esther "+key);
  const parts=[];
  for(let v=mapped.verseStart;v<=mapped.verseEnd;v++){
   const target=mapped.chapter+":"+v;
   const candidate=dr.get(target);
   if(!candidate)throw Error("Douay source missing "+target);
   if(usage.has(target))throw Error("Conflicting Douay Esther "+target);
   usage.set(target,key);parts.push(candidate);
  }
  const ratio=overlap(text,parts.join(" "));
  if(ratio<.16 && key!=="14:7")throw Error("Possible invalid Esther alignment "+key+" score="+ratio.toFixed(3));
  const inverse=estherParallelVerse({book:"Esther",chapter:mapped.chapter,verseStart:mapped.verseStart,verseEnd:mapped.verseStart},"dr-challoner","cpdv-2009");
  if(!inverse||inverse.chapter!==chapter||inverse.verseStart!==verseStart)throw Error("Esther crosswalk not bidirectional "+key);
  findings.push({cpdv:key,douay:[mapped.chapter,mapped.verseStart,mapped.verseEnd].join(":"),
   tokenOverlap:Math.round(ratio*1000)/1000,kind:key==="7:14"?"two-douay-verses-in-one-cpdv":key==="14:7"?"proper-name-transliteration":"single-verse"});
 }
 if(findings.length!==274||dr.size!==275||usage.size!==275||estherCrosswalkCoverage().douayRheims!==275)
  throw Error("Uncovered Catholic Esther source verse");
 return {
  status:"CATHOLIC_SOURCE_TEXT_ALIGNED—not-doctrinal-certification",
  cpdvVerses:findings.length,douayVerses:usage.size,
  compressedPairs:findings.filter(x=>x.kind==="two-douay-verses-in-one-cpdv"),
  properNameExceptions:findings.filter(x=>x.kind==="proper-name-transliteration"),
  smallestTokenOverlap:Math.min(...findings.map(x=>x.tokenOverlap)),
  source:"CPDV author-maintained Esther page + pinned Douay–Rheims Challoner Esther text",
  findings
 };
}
if(process.argv[2]){
 const dir=resolve(process.argv[2]);
 const [c,d]=await Promise.all([
  readFile(join(dir,"cpdv-author-master-books/Esther.json"),"utf8").then(JSON.parse),
  readFile(join(dir,"DRC-canonical-candidate.json"),"utf8").then(JSON.parse)
 ]);
 const result=auditEstherCrosswalk(c,d);
 await writeFile(join(dir,"Esther-Catholic-274-to-275-source-crosswalk.json"),JSON.stringify(result,null,2)+"\n");
 console.log("Esther verified against actual sources: "+result.cpdvVerses+" CPDV ↔ "+
  result.douayVerses+" Douay, one merged verse, missing: 0, duplicate: 0.");
}
