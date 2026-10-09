#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
import {CATHOLIC_BOOK_IDS} from "../../src/scripture/canon.js";
const INDEX="https://sacredbible.org/catholic/index.htm";
const ORIGIN="https://sacredbible.org";
const REQUIRED=new Set(CATHOLIC_BOOK_IDS);
const entities={amp:"&",quot:'"',apos:"'",nbsp:" ",lt:"<",gt:">",ldquo:'"',rdquo:'"',lsquo:"'",rsquo:"'",ndash:"-",mdash:"—",hellip:"…"};
function decodeEntities(s) {
 return s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi,(_,x)=>{
  if(x.startsWith("#")){const v=x[1]?.toLowerCase()==="x"?parseInt(x.slice(2),16):parseInt(x.slice(1),10);return v>0&&v<=0x10ffff?String.fromCodePoint(v):" ";}
  return entities[x.toLowerCase()]??" ";
 });
}
function textOf(html){
 return decodeEntities(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ")
  .replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim());
}
export function bookFromMasterLabel(label) {
 const raw=textOf(label).replace(/\s+/g," ").trim();
 if(raw==="Acts of the Apostles")return "Acts";
 if(raw==="Song of Songs")return "SongOfSongs";
 const candidate=raw.replace(/\s+/g,"");
 return REQUIRED.has(candidate)?candidate:null;
}
export function findMasterBookLinks(indexHtml){
 const found=new Map();
 for(const m of indexHtml.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  const book=bookFromMasterLabel(m[2]);
  if(!book)continue;
  const url=new URL(decodeEntities(m[1]),INDEX);
  if(url.protocol!=="https:" || url.hostname!=="sacredbible.org" ||
     !url.pathname.startsWith("/catholic/") || !/\.html?$/i.test(url.pathname))continue;
  if(found.has(book)&&found.get(book)!==url.href)throw new Error("Master index duplicated "+book);
  found.set(book,url.href);
 }
 return found;
}
export function parseMasterBookVerses(html){
 const cleaned=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ");
 const markers=[...cleaned.matchAll(/\{([0-9]{1,3}):([0-9]{1,3})\}/g)];
 const verses=new Map();
 for(let i=0;i<markers.length;i++){
  const marker=markers[i],next=markers[i+1];
  const key=marker[1]+":"+marker[2];
  // The last verse can be followed by site footer. Remove it conservatively.
  let raw=cleaned.slice(marker.index+marker[0].length,next?.index??cleaned.length);
  if(!next)raw=raw.split(/\*\s*\*\s*\*/)[0];
  const text=textOf(raw)
    .replace(/\s*\[\s*(?:[1-3]\s+)?[A-Za-z][A-Za-z ]*\s+[0-9]+\s*\]/g,"")
    .split(/\bThe Sacred Bible\s*:/)[0]
    .replace(/\s*\*\s*\*\s*\*.*/s,"")
    .trim();
  if(!text)continue;
  if(verses.has(key))throw new Error("Master page duplicate "+key);
  verses.set(key,text);
 }
 return verses;
}
export function comparisonWords(text){
 return String(text).normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
}
function indexCandidate(book){
 const map=new Map();
 for(const chapter of book.chapters){
  for(const verse of chapter.verses){
   const key=chapter.number+":"+verse.number;
   if(map.has(key))throw new Error("Candidate duplicate "+book.id+" "+key);
   map.set(key,verse.text||"");
  }
 }
 return map;
}
async function fetchHtml(url){
 const response=await fetch(url,{signal:AbortSignal.timeout(40000),headers:{"User-Agent":"AdOrientemScriptureCollation/1.0 (source-comparison)"}});
 if(!response.ok)throw new Error(url+" HTTP "+response.status);
 const bytes=Buffer.from(await response.arrayBuffer());
 const type=response.headers.get("content-type")||"";
 const charset=/charset=([^;]+)/i.exec(type)?.[1]?.trim().replace(/['"]/g,"");
 let name=charset&&/^(utf-8|iso-8859-1|windows-1252)$/i.test(charset)?charset:"windows-1252";
 let html=new TextDecoder(name).decode(bytes);
 if(!charset && /<meta[^>]+charset\s*=\s*["']?utf-8/i.test(html.slice(0,1500)))html=new TextDecoder("utf-8").decode(bytes);
 return {html,sha256:createHash("sha256").update(bytes).digest("hex"),bytes:bytes.length};
}
async function compareBook(book,url){
 const page=await fetchHtml(url);
 const master=parseMasterBookVerses(page.html);
 const source=indexCandidate(book);
 const diff=[],missingMaster=[],missingCandidate=[];
 let nonblankSource=0,nonblankMaster=0;
 for(const [key,text] of source){
  if(!text?.trim())continue;
  nonblankSource++;
  const actual=master.get(key);
  if(actual===undefined){missingMaster.push(key);continue;}
  if(comparisonWords(actual)!==comparisonWords(text)){
    diff.push({reference:book.id+" "+key,sourceText:text,authorText:actual});
  }
 }
 for(const [key,text] of master){
  if(text.trim())nonblankMaster++;
  if(!source.has(key)||!source.get(key)?.trim())missingCandidate.push(key);
 }
 return {book:book.id,url,sha256:page.sha256,downloadBytes:page.bytes,
  masterVerses:[...master].map(([key,text])=>({chapter:Number(key.split(":")[0]),verse:Number(key.split(":")[1]),text})),
  candidateNonblank:nonblankSource,masterNonblank:nonblankMaster,
  lexicalMismatchCount:diff.length,notInMasterCount:missingMaster.length,
  missingFromCandidateCount:missingCandidate.length,
  differences:diff,missingMaster,missingCandidate};
}
export async function collateCpdvMaster(data,{maxBooks=73,parallel=5}={}){
 if(data?.editionId!=="cpdv-2009"||!Array.isArray(data.books))throw new Error("CPDV candidate required");
 const index=await fetchHtml(INDEX),links=findMasterBookLinks(index.html);
 const coverage={foundLinks:links.size,missingBooks:CATHOLIC_BOOK_IDS.filter(x=>!links.has(x))};
 const selection=CATHOLIC_BOOK_IDS.slice(0,maxBooks);
 const candidates=new Map(data.books.map(x=>[x.id,x]));
 const results=new Array(selection.length);
 let next=0;
 async function work(){
  while(next<selection.length){
   const i=next++,book=selection[i];
   if(!candidates.has(book)||!links.has(book)){
    results[i]={book,error:"Missing book in input or primary index"};continue;
   }
   try{results[i]=await compareBook(candidates.get(book),links.get(book));}
   catch(error){results[i]={book,url:links.get(book),error:String(error.message||error)};}
  }
 }
 await Promise.all(Array.from({length:Math.min(parallel,selection.length)},work));
 const verified=results.filter(x=>!x.error);
 return {
  schemaVersion:1,source:"CPDV primary text: SacredBible.org original edition",
  primaryIndex:INDEX,primaryIndexSha256:index.sha256,indexCoverage:coverage,
  selectedBooks:selection.length,successfulBooks:verified.length,
  failedBooks:results.filter(x=>x.error).map(({book,error})=>({book,error})),
  candidateVersesCompared:verified.reduce((n,x)=>n+x.candidateNonblank,0),
  masterVersesRead:verified.reduce((n,x)=>n+x.masterNonblank,0),
  lexicalDifferences:verified.reduce((n,x)=>n+x.lexicalMismatchCount,0),
  missingInMaster:verified.reduce((n,x)=>n+x.notInMasterCount,0),
  missingInCandidate:verified.reduce((n,x)=>n+x.missingFromCandidateCount,0),
  books:results,
  sourceAccuracyCertified:false,doctrinallyCertified:false,
  publicationStatus:"CANDIDATE_MASTER_COLLATION_REVIEW_ONLY"
 };
}
if(process.argv[2]){
 const base=resolve(process.argv[2]),limit=Number(process.argv[3]||73);
 const data=JSON.parse(await readFile(join(base,"CPDV-canonical-candidate.json"),"utf8"));
 const report=await collateCpdvMaster(data,{maxBooks:limit});
 const output=join(base,"cpdv-author-master-books");
 await (await import("node:fs/promises")).mkdir(output,{recursive:true});
 for(const book of report.books.filter(x=>!x.error)){
   await writeFile(join(output,book.book+".json"),JSON.stringify({
     schemaVersion:1,editionId:"cpdv-2009",book:book.book,sourceUrl:book.url,
     sourceSha256:book.sha256,edition:"Original CPDV, author-maintained master",
     status:"RESEARCH_ONLY_AWAITING_TEXT_AND_THEOLOGICAL_CERTIFICATION",
     verses:book.masterVerses
   })+"\n");
 }
 const summary={...report,books:report.books.map(({masterVerses,...b})=>b)};
 await writeFile(join(base,"CPDV-73-book-author-master-collation.json"),JSON.stringify(summary,null,2)+"\n");
 console.log(JSON.stringify({books:report.successfulBooks+"/"+report.selectedBooks,
  indexLinks:report.indexCoverage.foundLinks,missingIndex:report.indexCoverage.missingBooks,
  verseComparisons:report.candidateVersesCompared,lexicalDifferences:report.lexicalDifferences,
  missingInCandidate:report.missingInCandidate,missingInMaster:report.missingInMaster,
  failures:report.failedBooks.slice(0,12),certified:false}));
 if(report.successfulBooks<Math.min(limit,70))throw new Error("Insufficient authoritative source coverage");
}
