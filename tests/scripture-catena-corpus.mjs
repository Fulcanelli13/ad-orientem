import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 CATENA_SOURCE_COMMIT,CATENA_LOCAL_BASE,validateCatenaPack,
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
let opened=0;
const fetched=await loadCatenaForPassage(citation,{cacheStorage:null,fetcher:async url=>{
 opened++;
 assert.equal(url,CATENA_LOCAL_BASE+"luke.json");
 return {ok:true,clone(){return {json:async()=>data.luke}}};
}});
assert.deepEqual(fetched.map(n=>n.id),matched.map(n=>n.id));
await loadCatenaForPassage(citation,{cacheStorage:null,fetcher:()=>{throw new Error("Unexpected duplicate download")}});
assert.equal(opened,1,"Each Gospel needs only one local load");
console.log("PASS in-app Catena: 814 pericopes, 12,692 original fragments, 3,766 covered verse keys; same-origin, source-gated and cached");
