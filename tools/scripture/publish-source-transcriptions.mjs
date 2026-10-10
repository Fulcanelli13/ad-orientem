#!/usr/bin/env node
/* Publish source-identified *transcriptions* for reading, never "reviewed" Scripture.
 * The authoritative approval compiler/loader remain completely separate.
 * All source inputs are fetched and SHA-bound by the existing research pipeline.
 */
import {readFile,readdir,mkdir,writeFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
import {CATHOLIC_BOOK_IDS} from "../../src/scripture/canon.js";
const hash=text=>createHash("sha256").update(text).digest("hex");
const ROOT="data/scripture/source-transcriptions";
const SOURCES=[
 {id:"dr-challoner",input:"DRC-canonical-candidate.json",kind:"scrollmapper",title:"Douay–Rheims (Challoner)",language:"en",
  witness:"Pinned Scrollmapper DRC transcription; historical print collation pending",
  sourceCommit:"e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c",sourceBlob:"3cc9190cb18ef900585b47cb9a00bca8171394b8"},
 {id:"crampon-1923",input:"FreCrampon-canonical-candidate.json",kind:"scrollmapper",title:"Crampon (1923 transcription candidate)",language:"fr",
  witness:"Pinned Scrollmapper FreCrampon transcription; printed Desclée 1923 collation pending",
  sourceCommit:"e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c",sourceBlob:"d00e7f91c6f20c9e5c6a970deb655bf041dcfdbd"},
 {id:"cpdv-2009",kind:"author",title:"Catholic Public Domain Version",language:"en",
  witness:"Author's original published master, sacredbible.org; doctrinal/textual review pending",
  sourceCommit:null,sourceBlob:null}
];
function cleanVerses(rows,book,chapter){
 const seen=new Set(),verses=[],blanks=[];
 for(const item of rows){
  const number=item.number??item.verse,text=item.text;
  if(!Number.isSafeInteger(number)||number<1||number>250||seen.has(number)||typeof text!=="string")
   throw Error("Malformed source verse: "+book+" "+chapter+":"+number);
  seen.add(number);
  if(text.trim())verses.push({v:number,t:text.trim()});else blanks.push(number);
 }
 if(!seen.size)throw Error("Empty source chapter: "+book+" "+chapter);
 verses.sort((a,b)=>a.v-b.v);blanks.sort((a,b)=>a-b);
 return {verses,blanks};
}
async function build(root,output,src){
 const destination=join(output,src.id);await mkdir(destination,{recursive:true});
 let data=null,books;
 if(src.kind==="scrollmapper"){
  data=JSON.parse(await readFile(join(root,src.input),"utf8"));
  if(data.editionId!==src.id||data.books?.length!==73||!data.provenance?.sourceUrl?.includes(src.sourceCommit))
   throw Error("Pinned source candidate mismatch: "+src.id);
  books=new Map(data.books.map(book=>[book.id,book]));
 }else {
  const files=(await readdir(join(root,"cpdv-author-master-books"))).filter(f=>f.endsWith(".json"));
  if(files.length!==73)throw Error("Author master not complete");
  books=new Map();
  for(const file of files){
   const book=JSON.parse(await readFile(join(root,"cpdv-author-master-books",file),"utf8"));
   if(book.editionId!=="cpdv-2009"||!/^https:\/\/sacredbible\.org\/catholic\//.test(book.sourceUrl)||
      !/^[a-f0-9]{64}$/.test(book.sourceSha256)||book.status!=="RESEARCH_ONLY_AWAITING_TEXT_AND_THEOLOGICAL_CERTIFICATION")
    throw Error("Invalid author witness "+file);
   books.set(book.book,book);
  }
 }
 const manifest={schema:"ao.scripture.source-transcriptions.manifest.v1",editionId:src.id,title:src.title,
  language:src.language,bookCount:73,
  status:"SOURCE_TRANSCRIPTION_UNDER_REVIEW",editionCertified:false,
  rights:"public-domain",sourceWitness:src.witness,
  sourceCommit:src.sourceCommit,sourceBlob:src.sourceBlob,books:[]};
 let totalChapters=0,totalVerses=0,totalBlanks=0;
 for(const id of CATHOLIC_BOOK_IDS){
  const book=books.get(id);if(!book)throw Error("Missing Catholic book "+id);
  let inputChapters;
  if(src.kind==="author"){
   const chapters=new Map();
   for(const v of book.verses){
    const group=chapters.get(v.chapter)||[];group.push(v);chapters.set(v.chapter,group);
   }
   inputChapters=[...chapters].sort((a,b)=>a[0]-b[0]).map(([number,verses])=>({number,verses}));
  }else inputChapters=book.chapters;
  if(!inputChapters?.length)throw Error(id+" no source chapters");
  const chapters=[],seen=new Set();
  for(const ch of inputChapters){
   if(!Number.isSafeInteger(ch.number)||seen.has(ch.number))throw Error(id+" repeated chapter");
   seen.add(ch.number);
   const parsed=cleanVerses(ch.verses,id,ch.number);
   chapters.push({c:ch.number,v:parsed.verses,missing:parsed.blanks});
   totalVerses+=parsed.verses.length;totalBlanks+=parsed.blanks.length;
  }
  chapters.sort((a,b)=>a.c-b.c);
  if(chapters.at(-1).c!==chapters.length)throw Error(id+" chapter sequence gap");
  totalChapters+=chapters.length;
  const sourceUrl=src.kind==="author"?book.sourceUrl:data.provenance.sourceUrl;
  const pack={schema:"ao.scripture.source-transcription.book.v1",editionId:src.id,
    book:id,sourceUrl,sourceWitness:src.witness,
    status:"SOURCE_TRANSCRIPTION_UNDER_REVIEW",editionCertified:false,
    primarySourceSha256:src.kind==="author"?book.sourceSha256:null,
    chapters};
  const contents=JSON.stringify(pack)+"\n",file=id+".json";
  await writeFile(join(destination,file),contents);
  manifest.books.push({id,file,sha256:hash(contents),chapters:chapters.length,
    verses:chapters.reduce((n,c)=>n+c.v.length,0),blankSlots:chapters.reduce((n,c)=>n+c.missing.length,0)});
 }
 if(books.size!==73||totalChapters<1300||totalVerses<35000)
  throw Error("Candidate text too incomplete: "+JSON.stringify({books:books.size,totalChapters,totalVerses}));
 manifest.chapterCount=totalChapters;manifest.verseCount=totalVerses;manifest.blankSlots=totalBlanks;
 await writeFile(join(destination,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
 return {editionId:src.id,books:73,chapters:totalChapters,verses:totalVerses,blanks:totalBlanks};
}
export async function publishSourceTranscriptions(root,destination=ROOT){
 const output=resolve(destination);await mkdir(output,{recursive:true});
 const report=[];
 for(const source of SOURCES)report.push(await build(resolve(root),output,source));
 await writeFile(join(output,"source-transcriptions-census.json"),JSON.stringify({
  schema:"ao.scripture.source-transcriptions.census.v1",
  status:"SOURCE_TRANSCRIPTIONS_NOT_EDITION_CERTIFIED",reports:report},null,2)+"\n");
 return report;
}
if(process.argv[2]){
 const r=await publishSourceTranscriptions(process.argv[2],process.argv[3]||ROOT);
 console.log("SOURCE TRANSCRIPTIONS (not reviewed/certified): "+JSON.stringify(r));
}
