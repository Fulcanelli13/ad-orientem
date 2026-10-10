import assert from "node:assert/strict";
import {createHash,webcrypto} from "node:crypto";
import {CATHOLIC_BOOK_IDS} from "../src/scripture/canon.js";
import {SCRIPTURE_EDITIONS} from "../src/scripture/catalogue.js";
import {loadScriptureSourceBook} from "../src/scripture/source-transcription-loader.js";
const STATUS="SOURCE_TRANSCRIPTION_UNDER_REVIEW";
const pack={schema:"ao.scripture.source-transcription.book.v1",editionId:"dr-challoner",book:"Luke",
 sourceUrl:"https://raw.githubusercontent.com/scrollmapper/bible_databases/PIN/sources/en/DRC/DRC.json",
 sourceWitness:"Pinned source transcription awaiting collation with printed edition",
 status:STATUS,editionCertified:false,
 chapters:[{c:1,v:[{v:1,t:"FIXTURE SOURCE TEXT 1"},{v:3,t:"FIXTURE SOURCE TEXT 3"}],missing:[2]}]};
const raw=JSON.stringify(pack)+"\n",hash=createHash("sha256").update(raw).digest("hex");
const manifest={schema:"ao.scripture.source-transcriptions.manifest.v1",editionId:"dr-challoner",
 bookCount:73,status:STATUS,editionCertified:false,rights:"public-domain",
 sourceWitness:pack.sourceWitness,
 books:CATHOLIC_BOOK_IDS.map(id=>({id,file:id+".json",sha256:hash,chapters:1,verses:2,blankSlots:1}))};
let requests=[];
const transport=async url=>{
 requests.push(url);
 if(url.endsWith("/manifest.json"))return new Response(JSON.stringify(manifest));
 if(url.endsWith("/Luke.json"))return new Response(raw);
 return new Response("",{status:404});
};
const result=await loadScriptureSourceBook("dr-challoner","Luke",{
 fetcher:transport,cryptoProvider:webcrypto,cacheStorage:null
});
assert.equal(result.records.length,2);
assert.deepEqual(result.missingByChapter[1],[2]);
assert.ok(result.records.every(r=>r.reviewed===false&&r.sourceStatus===STATUS));
assert.equal(requests.length,2);
assert.ok(requests.every(url=>url.startsWith("/data/scripture/source-transcriptions/dr-challoner/")));
await loadScriptureSourceBook("dr-challoner","Luke",{
 fetcher:()=>{throw Error("Unexpected duplicate request")},cryptoProvider:webcrypto,cacheStorage:null
});
assert.equal(requests.length,2);
await assert.rejects(loadScriptureSourceBook("ncb-2019","Luke",{fetcher:transport}),/Unapproved source/);
await assert.rejects(loadScriptureSourceBook("dr-challoner","GospelOfThomas",{fetcher:transport}),/Unapproved source/);
for(const id of ["dr-challoner","crampon-1923","cpdv-2009"]){
 assert.equal(SCRIPTURE_EDITIONS[id].enabled,false,"A source transcription must not certify a Bible edition");
}
console.log("Source-witnessed in-app Bible read, blank-slot warnings, checksums, cache and certification separation passed");
