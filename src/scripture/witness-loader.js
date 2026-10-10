import {CATHOLIC_BOOK_IDS} from "./canon.js";
const CATALOGUE=Object.freeze({
 "dr-challoner":CATHOLIC_BOOK_IDS,
 "cpdv-2009":CATHOLIC_BOOK_IDS,
 "crampon-1923":CATHOLIC_BOOK_IDS
});
const CACHE="ao-scripture-witness-v1";
export function hasScriptureWitness(editionId,book){return Boolean(CATALOGUE[editionId]?.includes(book));}
export function validateScriptureWitness(data,editionId,book){
 if(!hasScriptureWitness(editionId,book)||!CATHOLIC_BOOK_IDS.includes(book)||
   data?.schema!=="ao.scripture.source-witness.v1"||data.editionId!==editionId||
   data.book!==book||data.sourceStatus!=="UNCOLLATED_SOURCE_WITNESS"||
   typeof data.sourceRepository!=="string"||typeof data.sourcePath!=="string"||
   !Array.isArray(data.verses)||!data.verses.length)throw Error("Invalid historical Scripture source witness");
 // The two expanded traditional witnesses are bound to fixed historical upstreams.
 // CPDV remains separately identified as an uncollated secondary transcription.
 if(editionId==="dr-challoner" && (data.sourceRepository!=="AlvaroBalbin/catena"||
    data.sourceCommit!=="efe1bd084d918a34ca22ffeef2ecf711c593b392"||
    data.sourcePath!=="data/bible/drb/"+book.replace(/([0-9])(?=[A-Z])/g,"$1-").replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()+".jsonl"))
    throw Error("Unpinned Douay witness");
 if(editionId==="crampon-1923" && (data.sourceRepository!=="scrollmapper/bible_databases"||
    data.sourceCommit!=="e1b254cef86d0e65b1a5d1a94b8b112d0f296a2c"||
    data.sourceBlobSha!=="a6c4a997fde1bda4d9025064aaf7c1dfe26f9001"||
    data.sourcePath!=="formats/json/FreCrampon.json"))
    throw Error("Unpinned Crampon witness");
 const ids=new Set();
 for(const row of data.verses){
   if(!Array.isArray(row)||row.length!==3||!Number.isSafeInteger(row[0])||row[0]<1||
      !Number.isSafeInteger(row[1])||row[1]<1||typeof row[2]!=="string"||!row[2].trim())
     throw Error("Invalid witness verse");
   const id=row[0]+":"+row[1];
   if(ids.has(id))throw Error("Duplicate witness verse");ids.add(id);
 }
 return data.verses.map(([chapter,verseStart,text])=>Object.freeze({
  editionId,book,chapter,verseStart,verseEnd:verseStart,text,
  sourceWitness:true,reviewed:false,sourceEdition:editionId,
  licenceId:"UNCOLLATED_CATHOLIC_SOURCE_WITNESS",
  sourceUrl:"https://github.com/"+data.sourceRepository+"/blob/"+(data.sourceCommit||"main")+"/"+data.sourcePath,
  sourceStatus:data.sourceStatus
 }));
}
export async function loadScriptureWitness(editionId,book,{
 fetcher=globalThis.fetch?.bind(globalThis),cacheStorage=globalThis.caches
}={}){
 if(!hasScriptureWitness(editionId,book))return [];
 if(typeof fetcher!=="function")throw Error("No Scripture transport");
 const url="/data/scripture/witness/"+editionId+"/"+book+".json";
 let response;let fromNetwork=false;
 try {response=await fetcher(url,{cache:"force-cache"});fromNetwork=Boolean(response?.ok);}
 catch {}
 if(!response?.ok&&cacheStorage?.open){
   try{response=await (await cacheStorage.open(CACHE)).match(url);}catch{}
 }
 if(!response?.ok)throw Error("Witness chapter source unavailable");
 const raw=await response.clone().json();
 const records=validateScriptureWitness(raw,editionId,book);
 if(fromNetwork&&cacheStorage?.open){
   try{await(await cacheStorage.open(CACHE)).put(url,response);}catch{}
 }
 return records;
}
