import {SCRIPTURE_EDITIONS} from "./catalogue.js";
import {CATHOLIC_BOOK_IDS} from "./canon.js";
const ROOT="/data/scripture/source-transcriptions/";
const STATUS="SOURCE_TRANSCRIPTION_UNDER_REVIEW";
const SCHEMA="ao.scripture.source-transcription.book.v1";
const MANIFEST="ao.scripture.source-transcriptions.manifest.v1";
const CACHE="ao-scripture-transcriptions-v1";
const memory=new Map();
function assertSourceSource(manifest,editionId){
 if(manifest?.schema!==MANIFEST||manifest.editionId!==editionId||
  manifest.bookCount!==73||manifest.status!==STATUS||manifest.editionCertified!==false||
  manifest.rights!=="public-domain"||manifest.books?.length!==73||
  typeof manifest.sourceWitness!=="string"||manifest.sourceWitness.length<20)
  throw Error("Scripture transcription manifest rejected");
 if(!CATHOLIC_BOOK_IDS.every(id=>manifest.books.some(entry=>entry.id===id)))throw Error("Incomplete Catholic source manifest");
}
async function getResource(url,{fetcher,cacheStorage}){
 let response;
 try{response=await fetcher(url,{cache:"force-cache"});}catch{}
 if(response?.ok)return response;
 if(cacheStorage?.open){
  try{const match=await(await cacheStorage.open(CACHE)).match(url);if(match?.ok)return match;}catch{}
 }
 throw Error("Source transcription not yet available");
}
async function digest(raw,cryptoProvider){
 if(!cryptoProvider?.subtle)throw Error("Scripture SHA-256 not available");
 const hash=await cryptoProvider.subtle.digest("SHA-256",new TextEncoder().encode(raw));
 return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,"0")).join("");
}
function validatedText(packet,editionId,book){
 if(packet?.schema!==SCHEMA||packet.editionId!==editionId||packet.book!==book||
    packet.status!==STATUS||packet.editionCertified!==false||
    typeof packet.sourceWitness!=="string"||packet.sourceWitness.length<20||
    typeof packet.sourceUrl!=="string"||!packet.sourceUrl.startsWith("https://")||
    !Array.isArray(packet.chapters)||!packet.chapters.length)throw Error("Invalid Scripture transcription");
 let lastChapter=0,rows=[];
 for(const ch of packet.chapters){
  if(!Number.isSafeInteger(ch.c)||ch.c!==++lastChapter||!Array.isArray(ch.v)||!Array.isArray(ch.missing))
    throw Error("Scripture source chapter sequence mismatch");
  let prev=0;const missing=new Set();
  for(const v of ch.missing){
    if(!Number.isSafeInteger(v)||v<1||missing.has(v))throw Error("Invalid blank verse slot");
    missing.add(v);
  }
  for(const v of ch.v){
   if(!Number.isSafeInteger(v.v)||v.v<=prev||v.v>250||missing.has(v.v)||
     typeof v.t!=="string"||!v.t.trim())throw Error("Invalid source verse");
   prev=v.v;
   rows.push(Object.freeze({editionId,book,chapter:ch.c,verseStart:v.v,verseEnd:v.v,text:v.t,
     sourceUrl:packet.sourceUrl,sourceEdition:packet.sourceWitness,
     sourceStatus:STATUS,reviewed:false}));
  }
 }
 return Object.freeze(rows);
}
/** Reads verified bytes of an explicitly UNREVIEWED source transcription.
 * NEVER changes the approved pack loader or returns reviewed:true records.
 */
export async function loadScriptureSourceBook(editionId,book,{
 fetcher=globalThis.fetch?.bind(globalThis),
 cacheStorage=globalThis.caches,
 cryptoProvider=globalThis.crypto
}={}){
 if(!["dr-challoner","crampon-1923","cpdv-2009"].includes(editionId)||
  SCRIPTURE_EDITIONS[editionId]?.rights!=="cleared"||!CATHOLIC_BOOK_IDS.includes(book))
   throw Error("Unapproved source transcription");
 if(typeof fetcher!=="function")throw Error("Scripture transport unavailable");
 const key=editionId+":"+book;
 if(!memory.has(key)){
  const loading=(async()=>{
    const base=ROOT+editionId+"/";
    const manifestUrl=base+"manifest.json",manifestResponse=await getResource(manifestUrl,{fetcher,cacheStorage});
    const manifestText=await manifestResponse.clone().text(),manifest=JSON.parse(manifestText);
    assertSourceSource(manifest,editionId);
    const item=manifest.books.find(e=>e.id===book);
    if(item?.file!==book+".json"||!/^[0-9a-f]{64}$/.test(item.sha256))throw Error("Invalid source book checksum entry");
    const fileUrl=base+item.file,fileResponse=await getResource(fileUrl,{fetcher,cacheStorage});
    const raw=await fileResponse.clone().text();
    if(await digest(raw,cryptoProvider)!==item.sha256)throw Error("Source transcription SHA-256 mismatch");
    const packet=JSON.parse(raw),records=validatedText(packet,editionId,book);
    const seen=new Set(records.map(r=>r.chapter));
    if(seen.size!==item.chapters||records.length!==item.verses||
       packet.chapters.reduce((n,c)=>n+c.missing.length,0)!==item.blankSlots)
      throw Error("Source transcription census mismatch");
    if(cacheStorage?.open){
     try{
      const cache=await cacheStorage.open(CACHE);
      await cache.put(manifestUrl,new Response(manifestText,{headers:{"Content-Type":"application/json"}}));
      await cache.put(fileUrl,new Response(raw,{headers:{"Content-Type":"application/json"}}));
     }catch{}
    }
    return Object.freeze({records,missingByChapter:Object.freeze(Object.fromEntries(packet.chapters.map(c=>[c.c,c.missing]))),
      status:STATUS,sourceWitness:packet.sourceWitness,sourceUrl:packet.sourceUrl});
  })().catch(error=>{memory.delete(key);throw error;});
  memory.set(key,loading);
 }
 return memory.get(key);
}
