import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash,webcrypto} from "node:crypto";
import {
 CATENA_SOURCE_COMMIT,CATENA_LOCAL_BASE,CATENA_CHUNK_BASE,validateCatenaPack,
 validateCatenaChunkManifest,validateCatenaChapterPack,
 selectCatenaPericopes,loadCatenaForPassage
} from "../src/scripture/catena-inline.js";

const manifest=JSON.parse(readFileSync(new URL("../data/scripture/catena/manifest.v1.json",import.meta.url),"utf8"));
assert.equal(manifest.schema,"ao.catena-aurea.corpus-manifest.v1");
assert.equal(manifest.originCommit,CATENA_SOURCE_COMMIT);
assert.equal(manifest.license,"public-domain");
assert.equal(manifest.books.length,4);
let pericopes=0,fragments=0,keys=0;
const data={};
for(const row of manifest.books){
  const packet=JSON.parse(readFileSync(new URL("../data/scripture/catena/"+row.gospel+".json",import.meta.url),"utf8"));
  assert.equal(validateCatenaPack(packet,row.gospel),true);
  assert.equal(packet.pericopes.length,row.pericopes);
  const count=packet.pericopes.reduce((n,p)=>n+p.segments.length,0);
  const distinct=new Set(packet.pericopes.flatMap(p=>p.verse_keys));
  assert.equal(count,row.fragments);
  assert.equal(distinct.size,row.commentedVerseKeys);
  assert.equal(packet.provenance.originBlobSha,row.originBlobSha);
  assert.equal(packet.provenance.commit,CATENA_SOURCE_COMMIT);
  data[row.gospel]=packet;
  pericopes+=packet.pericopes.length;fragments+=count;keys+=distinct.size;
}
assert.equal(pericopes,814);
assert.equal(fragments,12692);
assert.equal(keys,3766);
assert.equal(pericopes,manifest.totalPericopes);
assert.equal(fragments,manifest.totalFragments);
const citation={book:"Luke",chapter:1,verseStart:28,verseEnd:29};
const matched=selectCatenaPericopes(data.luke.pericopes,citation);
assert.ok(matched.length>0,"Annunciation needs a real source pericope");
assert.ok(matched.some(n=>n.segments.length>1));
assert.ok(matched.every(n=>n.source.url.startsWith("https://www.ecatholic2000.com/")));
assert.equal(selectCatenaPericopes(data.luke.pericopes,{...citation,chapter:24,verseStart:999,verseEnd:999}).length,0);
assert.throws(()=>validateCatenaPack({...data.luke,provenance:{...data.luke.provenance,originBlobSha:"tampered"}},"luke"),/Unverified local Catena/);
assert.throws(()=>validateCatenaPack({...data.luke,pericopes:data.luke.pericopes.slice(1)},"luke"),/Unverified local Catena/);

const chunks=JSON.parse(readFileSync(new URL("../data/scripture/catena/chunks/manifest.v1.json",import.meta.url),"utf8"));
assert.equal(validateCatenaChunkManifest(chunks),true);
assert.equal(chunks.totals.packs,23);
assert.equal(chunks.totals.pericopes,814);
assert.equal(chunks.totals.fragments,12692);
const rawByUrl=new Map();
rawByUrl.set(CATENA_CHUNK_BASE+"manifest.v1.json",JSON.stringify(chunks,null,2)+"\\n");
let packedBytes=0,originalBytes=0;
for(const original of manifest.books) {
 const gospel=original.gospel;
 const current=chunks.chunks.filter(x=>x.gospel===gospel);
 const ids=new Set(),keys=new Set();
 for(const row of current) {
   const file=new URL("../data/scripture/catena/chunks/"+row.file,import.meta.url);
   const raw=readFileSync(file,"utf8"),pack=JSON.parse(raw);
   const bytes=Buffer.byteLength(raw);
   assert.equal(bytes,row.bytes,"Manifest and raw pack bytes must match");
   const actualSha=createHash("sha1").update("blob "+bytes+"\\0").update(raw).digest("hex");
   assert.equal(actualSha,row.blobSha,"Exact Git object integrity must be reproducible");
   assert.equal(validateCatenaChapterPack(pack,gospel,row),true);
   for(const record of pack.pericopes) {
     assert.ok(!ids.has(record.id),"No cross-pack duplicate pericope IDs");
     ids.add(record.id);
     const unchanged=data[gospel].pericopes.find(x=>x.id===record.id);
     assert.deepEqual(record,unchanged,"Every fragment, attribution, verse and URL is byte-semantically preserved");
     for(const k of record.verse_keys)keys.add(k);
   }
   rawByUrl.set(CATENA_CHUNK_BASE+row.file,raw);
   packedBytes+=bytes;
 }
 assert.equal(ids.size,original.pericopes);
 assert.equal(keys.size,original.commentedVerseKeys);
 originalBytes+=readFileSync(new URL("../data/scripture/catena/"+gospel+".json",import.meta.url)).length;
}
let fetches=[];
const fetcher=async url=>{
 fetches.push(url);
 assert.ok(rawByUrl.has(url),"No full-Gospel request is allowed on a fresh reader");
 const raw=rawByUrl.get(url);
 return {ok:true,clone(){return{text:async()=>raw}}};
};
const opened=await loadCatenaForPassage(citation,{cacheStorage:null,fetcher,cryptoProvider:webcrypto});
assert.deepEqual(opened.map(n=>n.id),matched.map(n=>n.id));
assert.equal(fetches.length,2,"One manifest plus one requested chapter-range pack");
assert.ok(fetches[1].endsWith("luke-01-04.json"));
await loadCatenaForPassage({...citation,chapter:3,verseStart:1,verseEnd:2},
 {cacheStorage:null,fetcher:()=>{throw Error("Expected cached same-chunk access")},cryptoProvider:webcrypto});
assert.equal(fetches.length,2);
const later={book:"Luke",chapter:6,verseStart:20,verseEnd:22};
assert.deepEqual((await loadCatenaForPassage(later,{cacheStorage:null,fetcher,cryptoProvider:webcrypto}))
 .map(x=>x.id),selectCatenaPericopes(data.luke.pericopes,later).map(x=>x.id));
assert.equal(fetches.length,3,"A new chapter-range downloads only one new pack");
const first=chunks.chunks.find(x=>x.gospel==="matthew"&&x.firstChapter===1);
assert.throws(()=>validateCatenaChunkManifest({...chunks,totals:{...chunks.totals,fragments:100}}),/CATENA_SOURCE_INTEGRITY_MISMATCH/);
const firstPack=JSON.parse(rawByUrl.get(CATENA_CHUNK_BASE+first.file));
assert.throws(()=>validateCatenaChapterPack({...firstPack,pericopes:firstPack.pericopes.slice(1)},"matthew",first),/CATENA_SOURCE_INTEGRITY_MISMATCH/);
assert.ok(packedBytes<originalBytes*1.02,"Pack metadata overhead must remain small");
console.log("PASS source-identical Catena: 23 lazy 4-chapter packs, 814 pericopes, 12,692 fragments, exact Git hashes, 3,766 verse keys and cached selective loading");
