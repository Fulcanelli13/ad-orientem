// Source-level coverage against *uncollated* historical Bible witnesses.
// Passing means verse-slot presence only, not that the transcriptions match
// a printed edition or that the native production Scripture pack is certified.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas,ATLAS_WITNESS_EXCEPTIONS} from "../src/find/bible-atlas.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const atlas=buildBibleAtlas(read("../data/explore/bible-places-compact.v1.json").entries);
assert.equal(atlas.length,151,"the full canonical selected Bible chronology is covered");
const editions=["crampon-1923","dr-challoner"];
const byBook=new Map();
for(const stop of atlas){
 const ref=stop.reference;
 const match=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–—-](\d+))?$/.exec(ref);
 assert.ok(match,"single-chapter bounded original source required: "+ref);
 const [,book,chapter,start,end]=match;
 if(!byBook.has(book))byBook.set(book,[]);
 byBook.get(book).push({reference:ref,chapter:Number(chapter),
  start:Number(start),end:Number(end??start)});
}
assert.equal(byBook.size,28,"all 28 referenced books are covered by both source witnesses");

const missing=[];
for(const [book,refs] of byBook){
 for(const edition of editions){
  const doc=read("../data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(doc.schema,"ao.scripture.source-witness.v1");
  assert.equal(doc.sourceStatus,"UNCOLLATED_SOURCE_WITNESS",
   "source witness may not be silently presented as a collated canonical edition");
  assert.equal(doc.book,book);
  assert.equal(doc.editionId,edition);
  const present=new Map();
  for(const [ch,verse,text] of doc.verses){
   assert.ok(Number.isInteger(ch)&&Number.isInteger(verse));
   if(!present.has(ch))present.set(ch,new Set());
   if(String(text??"").trim())present.get(ch).add(verse);
  }
  for(const ref of refs){
   for(let verse=ref.start;verse<=ref.end;verse++){
    if(!present.get(ref.chapter)?.has(verse))
     missing.push({reference:ref.reference,edition,chapter:ref.chapter,verse});
   }
  }
 }
}
// Match complete per-edition gaps, never ignore unexpected absent verses.
// The Mark 4:41 French transcription gap is NOT an approved change to the
// printed Crampon numbering; the imported witness merged the last verse.
const known=[
 {reference:"Mark 4:35–41",edition:"crampon-1923",chapter:4,verse:41},
 {reference:"Mark 4:35–41",edition:"dr-challoner",chapter:4,verse:41},
 {reference:"Acts 7:54–60",edition:"dr-challoner",chapter:7,verse:60},
 {reference:"Exodus 40:1–38",edition:"dr-challoner",chapter:40,verse:37},
 {reference:"Exodus 40:1–38",edition:"dr-challoner",chapter:40,verse:38}
];
const order=(a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b));
assert.deepEqual(missing.sort(order),known.sort(order),
 "unreviewed or changed gaps in the 151 Atlas passages require edition review");
const refsWithMissing=new Set(missing.map(x=>x.reference));
assert.deepEqual([...refsWithMissing].sort(),Object.keys(ATLAS_WITNESS_EXCEPTIONS).sort(),
 "each unresolved edition discrepancy must appear as a visible qualified note");
for(const note of Object.values(ATLAS_WITNESS_EXCEPTIONS)){
 assert.ok(note.en&&note.fr&&/^https:\/\//.test(note.source));
}
assert.equal(atlas.filter(s=>!refsWithMissing.has(s.reference)).length,148,
 "148 of 151 selected passages have complete imported verse-slot coverage");
console.log("PASS Atlas witness presence: 151 events / 28 books / 2 uncollated editions; 148 full, 3 edition-sensitive, 5 missing verse slots explicitly held");
