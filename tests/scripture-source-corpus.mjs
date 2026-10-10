import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {CATHOLIC_BOOK_IDS} from "../src/scripture/canon.js";
import {SCRIPTURE_EDITIONS} from "../src/scripture/catalogue.js";
const ROOT=new URL("../data/scripture/source-transcriptions/",import.meta.url);
const sha256=s=>createHash("sha256").update(s).digest("hex");
const expected={
 "dr-challoner":{verses:35805,blanks:12,source:"3cc9190cb18ef900585b47cb9a00bca8171394b8"},
 "crampon-1923":{verses:35486,blanks:124,source:"d00e7f91c6f20c9e5c6a970deb655bf041dcfdbd"},
 "cpdv-2009":{verses:35812,blanks:5,source:"a78e21ca67eae82a998b9fbf8dee7a29dab40628"}
};
let books=0,chapters=0,verses=0,blanks=0;
for(const [edition,limit] of Object.entries(expected)){
 const base=new URL(edition+"/",ROOT);
 const manifest=JSON.parse(readFileSync(new URL("manifest.json",base),"utf8"));
 assert.equal(manifest.schema,"ao.scripture.source-transcriptions.manifest.v1");
 assert.equal(manifest.editionId,edition);assert.equal(manifest.bookCount,73);
 assert.equal(manifest.status,"SOURCE_TRANSCRIPTION_UNDER_REVIEW");
 assert.equal(manifest.editionCertified,false);assert.equal(manifest.rights,"public-domain");
 assert.equal(manifest.sourceBlob,limit.source);
 assert.equal(manifest.books.length,73);
 assert.deepEqual(manifest.books.map(x=>x.id),CATHOLIC_BOOK_IDS);
 assert.equal(SCRIPTURE_EDITIONS[edition].enabled,false,"Transcription is not an approved edition");
 let c=0,v=0,b=0;
 for(const entry of manifest.books){
  const raw=readFileSync(new URL(entry.file,base),"utf8");
  assert.equal(sha256(raw),entry.sha256,`${edition} ${entry.id} SHA-256`);
  const pack=JSON.parse(raw);
  assert.equal(pack.schema,"ao.scripture.source-transcription.book.v1");
  assert.equal(pack.editionId,edition);assert.equal(pack.book,entry.id);
  assert.equal(pack.status,"SOURCE_TRANSCRIPTION_UNDER_REVIEW");
  assert.equal(pack.editionCertified,false);
  assert.equal(pack.sourceWitness,manifest.sourceWitness);
  assert.ok(pack.sourceUrl.startsWith("https://"));
  assert.equal(pack.chapters.length,entry.chapters);
  let pv=0,pb=0;
  for(let i=0;i<pack.chapters.length;i++){
   const ch=pack.chapters[i];assert.equal(ch.c,i+1);
   const all=[...ch.v.map(x=>x.v),...ch.missing];
   assert.equal(new Set(all).size,all.length,`${edition} ${entry.id} ${ch.c}`);
   assert.ok(ch.v.every(x=>Number.isInteger(x.v)&&typeof x.t==="string"&&x.t.trim()));
   pv+=ch.v.length;pb+=ch.missing.length;
  }
  assert.equal(pv,entry.verses);assert.equal(pb,entry.blankSlots);
  c+=pack.chapters.length;v+=pv;b+=pb;books++;
 }
 assert.equal(c,1334);assert.equal(v,limit.verses);assert.equal(b,limit.blanks);
 assert.equal(manifest.chapterCount,c);assert.equal(manifest.verseCount,v);assert.equal(manifest.blankSlots,b);
 chapters+=c;verses+=v;blanks+=b;
}
assert.equal(books,219);
console.log(`PASS source-identified Scripture corpus: ${books} books across 3 editions, ${chapters} chapters, ${verses} verses, ${blanks} explicit blank transcription slots; none marked certified`);
