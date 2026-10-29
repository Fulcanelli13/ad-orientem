import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {reviewAdventSaturdayFortyPrintedAnchors as review}
 from "../src/office/advent-first-vespers-40-printed-psalm-anchors.js";
const witness=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-saturday-psalm-40-row-printed-anchors.json",
 import.meta.url),"utf8"));
const baseWitness=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-saturday-psalm-witness.json",
 import.meta.url),"utf8"));
const raw={};
for(const n of [143,144])raw[n]=readFileSync(new URL(
 "../tests/fixtures/office/pinned-latin-psalm"+n+".txt",import.meta.url),"utf8");
const source=(callback=()=>{})=>async(path,lang)=>{
 const n=Number(path.match(/Psalm(\d+)$/u)?.[1]);
 const doc={sourceRevision:PIN,sourcePath:path,language:lang,
  sourceBlobSha:baseWitness.sourceBlobs[path],text:raw[n]};
 callback(doc,n);
 return doc;
};
test("40 printed verse rows, 80 independent incipit/cadence anchors, only two pinned source leaves",async()=>{
 const reads=[];
 const r=await review({witness,baseWitness,
  readLatinPsalmSource:source((doc,n)=>reads.push(n))});
 assert.equal(r.status,"FORTY_ROWS_EIGHTY_SECONDARY_PRINTED_ANCHORS_ONLY",r.reason);
 assert.deepEqual(reads.sort((a,b)=>a-b),[143,144]);
 assert.equal(r.exactPinnedLatinSourceLeaves,2);
 assert.equal(r.printedRowsCorroborated,40);
 assert.equal(r.printedIncipitsCorroborated,40);
 assert.equal(r.printedCadencesCorroborated,40);
 assert.equal(r.psalterTextFamily,"GALLICAN_VULGATE");
 assert.deepEqual(r.fiveSaturdaySegments.map(x=>x.printedLatinIncipitsAndCadencesCompared),
  [9,9,7,6,9]);
 assert.equal(r.originalSourceLinesReordered,false);
 assert.equal(r.fullLatinPrintedTextCollated,false);
 assert.equal(r.full1961TypicalPrintedCollation,false);
 assert.equal(r.1961MameProperAndSaturdayPsalterAccessible,false);
 assert.equal(r.translationsCertified,false);
 assert.equal(r.completeHourCertified,false);
 assert.equal(r.rightsApproved,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("repeated Psalm 143 labels and the two halves of Psalm 144:13 remain separate source rows",()=>{
 assert.deepEqual(witness.rows[143].filter(x=>x.label==="2").map(x=>x.ordinal),
  [2,3]);
 assert.deepEqual(witness.rows[143].filter(x=>x.label==="12").map(x=>x.ordinal),
  [13,14]);
 assert.deepEqual(witness.rows[143].filter(x=>x.label==="13").map(x=>x.ordinal),
  [15,16]);
 assert.equal(witness.rows[144][12].label,"13a");
 assert.equal(witness.rows[144][13].label,"13b");
 assert.deepEqual(witness.rows[143][11].printedPages,[436,437]);
 assert.deepEqual(witness.rows[144][12].printedPages,[437,438]);
});
test("tampered individual printed incipits, endings, row counts or accidental primary-edition claims fail closed",async()=>{
 for(const change of [
  m=>m.rows[143][0].first="Sanctus sanctus sanctus",
  m=>m.rows[143][12].last="non concordat cum libro",
  m=>m.rows[144][12].first="In principio erat verbum",
  m=>m.rows[144][21].last="altissimi laudabimus semper",
  m=>m.rows[143][2].label="3",
  m=>m.rows[144][12].label="13",
  m=>m.rows[143].pop(),
  m=>m.rows[144][0].printedPages=[203],
  m=>m.sourceRevision="main",
  m=>m.psalterTextFamily="PIUS_XII",
  m=>m.printedWitness.editionType="AUTHENTICATED_1961_TYPICA",
  m=>m.fullPrintedPsalmTextCollated=true,
  m=>m.translationsCertified=true,
  m=>m.completeHourCertified=true,
  m=>m.published=true
 ]){
  const m=structuredClone(witness);change(m);
  const r=await review({witness:m,baseWitness,
   readLatinPsalmSource:source()});
  assert.equal(r.status,"WITHHELD",JSON.stringify(change));
  assert.equal(r.printedRowsCorroborated,0);
  assert.equal(r.publishable,false);
 }
});
test("cryptographic pinned-source mismatch prevents corroboration, even if printed incipits look right",async()=>{
 for(const change of [
  doc=>{doc.text=doc.text.replace("Dóminus","Deus")},
  doc=>{doc.sourceRevision="wrong"},
  doc=>{doc.language="fr"},
  doc=>{doc.sourceBlobSha="deadbeef"}
 ]){
  const r=await review({witness,baseWitness,
   readLatinPsalmSource:source(change)});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.printedRowsCorroborated,0);
 }
});
test("the previous five-part source evidence must also pass its original independent gate",async()=>{
 const altered=structuredClone(baseWitness);
 altered.parts[2].first="Exsurge Domine et illumina";
 const r=await review({witness,baseWitness:altered,
  readLatinPsalmSource:source()});
 assert.equal(r.status,"WITHHELD");
 assert.match(r.reason,/BASE_GIT_SOURCE/);
});
