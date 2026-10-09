#!/usr/bin/env node
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { CATHOLIC_BOOK_IDS } from "../../src/scripture/canon.js";

const sha256=value=>createHash("sha256").update(value).digest("hex");
const SOURCE="https://sacredbible.org/catholic/";
const MIN_VERSES=35000,MIN_CHAPTERS=1300;

/** Strict structural audit of original CPDV author's per-book master, not theological approval. */
export function stageCpdvBook(data){
 if(data?.editionId!=="cpdv-2009" || !CATHOLIC_BOOK_IDS.includes(data.book))
   throw new Error("Not a Catholic CPDV canonical book");
 if(typeof data.sourceUrl!=="string" || !data.sourceUrl.startsWith(SOURCE) ||
    !/^[a-f\d]{64}$/.test(data.sourceSha256||""))
   throw new Error("Author's primary source URL and SHA-256 required");
 if(data.status!=="RESEARCH_ONLY_AWAITING_TEXT_AND_THEOLOGICAL_CERTIFICATION")
   throw new Error("Cannot stage unverified publication status");
 if(!Array.isArray(data.verses)||!data.verses.length)throw new Error("No source verses");
 const chapters=new Map(),unique=new Set(),records=[];
 for(const row of data.verses){
  if(!Number.isSafeInteger(row.chapter)||row.chapter<1||
     !Number.isSafeInteger(row.verse)||row.verse<1||
     typeof row.text!=="string"||!row.text.trim())throw new Error("Invalid author verse");
  const key=row.chapter+":"+row.verse;
  if(unique.has(key))throw new Error("Duplicate author verse "+data.book+" "+key);
  unique.add(key);
  const list=chapters.get(row.chapter)||[];list.push(row.verse);chapters.set(row.chapter,list);
  records.push({
   editionId:"cpdv-2009",book:data.book,chapter:row.chapter,
   verseStart:row.verse,verseEnd:row.verse,text:row.text,
   reviewed:false,sourceUrl:data.sourceUrl,
   sourceEdition:"CPDV original, author-maintained master",
   licenceId:"PUBLIC-DOMAIN-AUTHOR-DEDICATION",
   primaryPageSha256:data.sourceSha256,
   editorialStatus:"PENDING-VERSE-ALIGNMENT-AND-THEOLOGICAL-REVIEW"
  });
 }
 if(Math.max(...chapters.keys())!==chapters.size)throw new Error("Chapter sequence gap in "+data.book);
 for(const [chapter,nums] of chapters){
  if(Math.max(...nums)!==nums.length)throw new Error("Verse sequence gap "+data.book+" "+chapter);
 }
 return Object.freeze({id:data.book,records:Object.freeze(records),
    chapterCount:chapters.size,verseCount:records.length,sourceSha256:data.sourceSha256,
    sourceUrl:data.sourceUrl});
}
export function stagingSummary(books){
 const byId=new Map();
 for(const b of books){
  if(byId.has(b.id))throw new Error("Duplicate book "+b.id);
  byId.set(b.id,b);
 }
 const missing=CATHOLIC_BOOK_IDS.filter(x=>!byId.has(x));
 const chapterCount=books.reduce((n,b)=>n+b.chapterCount,0);
 const verseCount=books.reduce((n,b)=>n+b.verseCount,0);
 if(missing.length||byId.size!==73||chapterCount<MIN_CHAPTERS||verseCount<MIN_VERSES)
  throw new Error("Incomplete original CPDV master "+JSON.stringify({missing,chapterCount,verseCount}));
 return Object.freeze({bookCount:73,chapterCount,verseCount,books:CATHOLIC_BOOK_IDS.map(id=>byId.get(id))});
}
export async function stageCpdvMaster(root,destination){
 const inputs=resolve(root,"cpdv-author-master-books"),out=resolve(destination);
 const files=(await readdir(inputs)).filter(x=>x.endsWith(".json"));
 if(files.length!==73)throw new Error("Exactly 73 author-master book files expected, got "+files.length);
 const staged=await Promise.all(files.map(async file=>stageCpdvBook(JSON.parse(await readFile(join(inputs,file),"utf8")))));
 const summary=stagingSummary(staged);
 await mkdir(out,{recursive:true});
 const manifest={
  schemaVersion:1,editionId:"cpdv-2009",source:"Original CPDV author-maintained pages",
  bookCount:summary.bookCount,chapterCount:summary.chapterCount,verseCount:summary.verseCount,
  provenance:{
   rightsReview:"public-domain-author-declaration",
   editionReview:"PENDING-HUMAN-CERTIFICATION",
   versificationReview:"PENDING-HUMAN-CERTIFICATION",
   doctrinalReview:"PENDING-HUMAN-CERTIFICATION",
   sourceUrl:"https://sacredbible.org/catholic/index.htm",
   sourceEdition:"CPDV author-maintained master"
  },
  status:"STAGED-NOT-PUBLISHABLE",
  books:[]
 };
 for(const id of CATHOLIC_BOOK_IDS){
  const book=summary.books.find(x=>x.id===id),filename=id+".json";
  const bytes=JSON.stringify(book.records)+"\n";
  await writeFile(join(out,filename),bytes);
  manifest.books.push({id,file:filename,sha256:sha256(bytes.trimEnd()),
   authorPageSha256:book.sourceSha256,sourceUrl:book.sourceUrl,
   chapterCount:book.chapterCount,verseCount:book.verseCount,
   editorialStatus:"AWAITING-TEXTUAL-AND-THEOLOGICAL-CERTIFICATION"});
 }
 await writeFile(join(out,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
 return manifest;
}
if(process.argv[2]){
 const destination=process.argv[3]||"artifacts/scripture-staging/cpdv-2009";
 const m=await stageCpdvMaster(process.argv[2],destination);
 console.log("Original CPDV prepared (NOT published): "+m.bookCount+" books / "+
  m.chapterCount+" chapters / "+m.verseCount+" verses, SHA-256 per book.");
}
