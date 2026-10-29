import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {reviewAdventSaturdayLatinPsalmSource as review}
 from "../src/office/advent-first-vespers-saturday-psalm-integrity.js";

const manifest=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-saturday-psalm-witness.json",import.meta.url),"utf8"));
const original={};
for(const n of [143,144]){
 original[n]=readFileSync(new URL(
  "../tests/fixtures/office/pinned-latin-psalm"+n+".txt",import.meta.url),"utf8");
}
const reader=(changes=()=>{})=>async(path,lang)=>{
 const n=Number(path.match(/Psalm(\d+)$/u)?.[1]);
 const data={sourceRevision:PIN,sourcePath:path,language:lang,
  sourceBlobSha:manifest.sourceBlobs[path],text:original[n]};
 changes(data,n);
 return data;
};
test("exact two Git psalm blobs expand into five Saturday Vespers segments, 40 source rows",async()=>{
 let reads=0;
 const r=await review({manifest,readLatinPsalmSource:async(...args)=>{
  reads++;return reader()(...args);
 }});
 assert.equal(reads,2);
 assert.equal(r.status,"FIVE_SATURDAY_SOURCE_SEGMENTS_PINNED_SECONDARY_INICIPITS_ONLY");
 assert.equal(r.sourceVerseRowsVerified,40);
 assert.deepEqual(r.receipts.map(x=>x.sourceVerseRows),[9,9,7,6,9]);
 assert.equal(r.receipts[3].sourceId,"Psalterium/Psalmorum/Psalm144#8-13a");
 assert.equal(r.receipts[4].sourceId,"Psalterium/Psalmorum/Psalm144#13b-21");
 assert.equal(r.secondary2009PrintedBoundaryEvidence,true);
 assert.equal(r.printedFullTextCollated,false);
 assert.equal(r.printed1961TypicaCertified,false);
 assert.equal(r.wholeHourLiturgicallyCertified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("any real source mutation breaks cryptographic provenance, even with spoofed metadata",async()=>{
 for(const mutate of [
  data=>{data.text=data.text.replace("Dóminus","Deus")},
  data=>{data.text=data.text.replace("143:2 Protéctor","143:3 Protéctor")},
  data=>{data.text=data.text.replace("144:13b Fidélis","144:13 Fidélis")},
  data=>{data.text=data.text.replace("144:13a Regnum","144:13 Regnum")},
  data=>{data.text=data.text.slice(0,-1)},
  data=>{data.sourceRevision="main"},
  data=>{data.language="fr"}
 ]){
  let mutated=false;
  const r=await review({manifest,readLatinPsalmSource:reader(data=>{
   const before=JSON.stringify(data);mutate(data);
   if(JSON.stringify(data)!==before)mutated=true;
  })});
  assert.equal(mutated,true);
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.published,false);
 }
});
test("printed incipit and day/boundary claims cannot be promoted",async()=>{
 for(const mutate of [
  d=>{d.parts[0].first="Dixit Dominus"},
  d=>{d.parts[4].last="Different last verse"},
  d=>{d.parts[3].range="8-13b"},
  d=>{d.parts[1].count=8},
  d=>{d.printedWitness.kind="AUTHENTICATED_1961_TYPICA"},
  d=>{d.fullPrintedPsalmTextCollated=true},
  d=>{d.wholeHourLiturgicallyCertified=true},
  d=>{d.published=true},
  d=>{d.sourceBlobs["Psalterium/Psalmorum/Psalm143"]="f".repeat(40)}
 ]){
  const d=structuredClone(manifest);mutate(d);
  const r=await review({manifest:d,readLatinPsalmSource:reader()});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.published,false);
 }
});
